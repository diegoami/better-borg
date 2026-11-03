#!/usr/bin/env node
/**
 * Where work stands, as a snapshot to stop and resume from (process.md
 * section 3; the shape is goal2's tools/checkpoint.py, the owner's design).
 *
 *   node tools/checkpoint.mjs
 *   node tools/checkpoint.mjs --post "<next action>" [--notes FILE]
 *
 * The snapshot: this checkout's branch, head and how many files are changed
 * or untracked; every local task branch with its ahead/behind against origin
 * (a branch ahead of origin is work only this machine holds); the stash
 * count; the engine fingerprint (trap.js md5, the start/end check); the open
 * pull requests; and the queue - open issues labelled status:ready, then the
 * rest of priority:high. A GitHub call that fails is reported as failed,
 * never left out.
 *
 * `--post` adds the next action (and the notes file) and posts the whole as
 * a comment on the ONE open issue labelled `checkpoint`; it refuses when
 * there is not exactly one. It also refuses a body that names a user's home
 * directory: the comment is public (the privacy scan's rule, applied before
 * the bytes leave). A checkpoint records state, not decisions.
 */

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("./", import.meta.url)), "..");
const REPO = "diegoami/mandos";
const LABEL = "checkpoint";
/** trap.js md5: the published 1.23.0-beta.1 + our carried patch (#40). */
const FINGERPRINT = "34c27241f96aceff581bcb186a9d898f";
const TRAP = "node_modules/@rpgm-tools/neo-angband-core/dist/game/trap.js";
/** The privacy scan's user-home-path rule, close enough to refuse on. */
const HOME_PATH = /(?:\/home\/|\/Users\/|[A-Za-z]:\\Users\\)[A-Za-z0-9._-]+/;

function fail(message) {
  console.error(`checkpoint: ${message}`);
  process.exit(1);
}

function run(cmd, args) {
  try {
    return { ok: true, out: execFileSync(cmd, args, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim() };
  } catch (error) {
    const err = String(error.stderr ?? error.message).trim().split("\n")[0];
    return { ok: false, out: err };
  }
}

function gh(args) {
  const r = run("gh", [...args, "--repo", REPO]);
  if (!r.ok) return { ok: false, out: r.out };
  try {
    return { ok: true, value: JSON.parse(r.out) };
  } catch {
    return { ok: false, out: "unparseable gh output" };
  }
}

const argv = process.argv.slice(2);
let next = null;
let notes = null;
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === "--post") next = argv[++i] ?? fail("--post needs the next action");
  else if (argv[i] === "--notes") notes = argv[++i] ?? fail("--notes needs a file");
  else fail(`unexpected argument ${argv[i]}`);
}

/* --- the snapshot -------------------------------------------------------- */

const lines = [];
const today = new Date().toISOString().slice(0, 16).replace("T", " ");
lines.push(`## Checkpoint (${today} UTC)`, "");

const branch = run("git", ["rev-parse", "--abbrev-ref", "HEAD"]).out;
const head = run("git", ["rev-parse", "--short", "HEAD"]).out;
const dirty = run("git", ["status", "--porcelain"]).out.split("\n").filter(Boolean).length;
lines.push(`**Checkout**: \`${branch}\` at \`${head}\`, ${dirty === 0 ? "clean" : `${String(dirty)} changed/untracked`}.`);

const branches = run("git", ["for-each-ref", "--format=%(refname:short) %(upstream:short) %(upstream:track)", "refs/heads/"]);
const local = branches.ok ? branches.out.split("\n").filter(Boolean) : [];
const notable = [];
for (const row of local) {
  const [name, upstream, ...rest] = row.split(" ");
  /* for-each-ref emits every separator, so an in-sync row ends in "". */
  const track = rest.filter(Boolean).join(" ");
  if (name === "main" && upstream !== "" && track === "") continue;
  const where = upstream === undefined || upstream === "" ? "no upstream (local only)" : `${upstream} ${track || "[in sync]"}`;
  notable.push(`- \`${name}\`: ${where}`);
}
if (notable.length > 0) lines.push("", "**Local branches**:", ...notable);

const stashes = run("git", ["stash", "list"]).out.split("\n").filter(Boolean).length;
if (stashes > 0) lines.push("", `**Stashes**: ${String(stashes)}.`);

const trapPath = join(ROOT, TRAP);
const md5 = existsSync(trapPath) ? createHash("md5").update(readFileSync(trapPath)).digest("hex") : null;
lines.push("", `**Engine fingerprint**: ${md5 === null ? "trap.js missing (run pnpm install)" : md5 === FINGERPRINT ? `\`${md5}\` (published + carried patch)` : `\`${md5}\` - CHANGED from \`${FINGERPRINT}\``}.`);

const prs = gh(["pr", "list", "--state", "open", "--json", "number,title,headRefName,isDraft,labels"]);
lines.push("", "**Open PRs**:");
if (!prs.ok) lines.push(`- (gh failed: ${prs.out})`);
else if (prs.value.length === 0) lines.push("- none");
else for (const pr of prs.value) lines.push(`- #${String(pr.number)} ${pr.isDraft ? "(draft) " : ""}${pr.title} [\`${pr.headRefName}\`]`);

const issues = gh(["issue", "list", "--state", "open", "--limit", "100", "--json", "number,title,labels"]);
lines.push("", "**Queue** (status:ready first, then the rest of priority:high):");
if (!issues.ok) lines.push(`- (gh failed: ${issues.out})`);
else {
  const names = (issue) => issue.labels.map((l) => l.name);
  const tag = (issue) => names(issue).filter((n) => n.startsWith("priority:") || n.startsWith("status:") || n === "bug").join(", ");
  const ready = issues.value.filter((i) => names(i).includes("status:ready"));
  const high = issues.value.filter((i) => !names(i).includes("status:ready") && names(i).includes("priority:high") && !names(i).includes(LABEL));
  for (const i of [...ready, ...high]) lines.push(`- #${String(i.number)} ${i.title} (${tag(i)})`);
  if (ready.length + high.length === 0) lines.push("- nothing ready or high");
}

if (next !== null) lines.push("", `**Next action**: ${next}`);
if (notes !== null) {
  if (!existsSync(notes)) fail(`no notes file ${notes}`);
  lines.push("", readFileSync(notes, "utf8").trim());
}

const body = `${lines.join("\n")}\n`;
console.log(body);

/* --- the post ------------------------------------------------------------ */

if (next !== null) {
  if (HOME_PATH.test(body)) fail("the body names a user's home directory - the comment is public; use a repo-relative path");
  const found = gh(["issue", "list", "--state", "open", "--label", LABEL, "--json", "number"]);
  if (!found.ok) fail(`could not find the checkpoint issue: ${found.out}`);
  if (found.value.length !== 1) fail(`expected exactly one open issue labelled ${LABEL}, found ${String(found.value.length)}`);
  const dir = mkdtempSync(join(tmpdir(), "checkpoint-"));
  const file = join(dir, "body.md");
  writeFileSync(file, body);
  const posted = run("gh", ["issue", "comment", String(found.value[0].number), "--repo", REPO, "--body-file", file]);
  rmSync(dir, { recursive: true, force: true });
  if (!posted.ok) fail(`posting failed: ${posted.out}`);
  console.log(posted.out);
}
