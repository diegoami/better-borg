#!/usr/bin/env node
/**
 * The upstream watch (process.md §7): one command, the state of every thread
 * we hold upstream - our PRs, our proposals, the seams we depend on - and
 * what moved since the last look. The list is read from our `upstream`
 * tracking issues, never kept here.
 *
 * THE ROUTINE (owner directive 2026-11-03): run this before any upstream work
 * and at every sync pass. Movement on OUR threads = the maintainer is
 * processing us - engage (address feedback in the same pass) and keep
 * contributing upstream beside the fork; silence = carry in the fork per the
 * doctrine. The cache (.upstream-watch.json, git-ignored) is what turns
 * "state" into "moved since last time"; delete it to reset the baseline.
 *
 * Usage: node tools/upstream-watch.mjs [--reset]
 * Needs `gh` with read access to diegoami/mandos (the tracking issues) and
 * the upstream repositories.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

/** Our tracker, where every upstream thread has its tracking issue. */
const TRACKER = "diegoami/mandos";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const cachePath = join(root, ".upstream-watch.json");

function ghJson(args) {
  return JSON.parse(execFileSync("gh", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }));
}

if (process.argv.includes("--reset")) {
  try { unlinkSync(cachePath); } catch { /* nothing to reset */ }
}

let previous = {};
try { previous = JSON.parse(readFileSync(cachePath, "utf8")); } catch { /* first run */ }

/* The threads come from the tracking issues (docs/UPSTREAM.md, process.md
 * §6): every OPEN issue labelled `upstream` names its upstream refs on a
 * "**Threads**:" line. Filing the tracking issue IS adding the thread here;
 * closing it (once a release carried the fix) drops it. */
const THREADS = [];
let tracking;
try {
  tracking = ghJson(["issue", "list", "--repo", TRACKER, "--label", "upstream", "--state", "open", "--limit", "100", "--json", "number,title,body"]);
} catch {
  console.error("upstream-watch: could not list the tracking issues (gh with read access to diegoami/mandos is required)");
  process.exit(1);
}
const untracked = [];
for (const issue of tracking) {
  const line = issue.body.split("\n").find((l) => l.startsWith("**Threads**:"));
  if (line === undefined) {
    untracked.push(issue.number);
    continue;
  }
  for (const m of line.matchAll(/([\w.-]+\/[\w.-]+)#(\d+)/g)) {
    THREADS.push({ repo: m[1], num: Number(m[2]), what: `our #${String(issue.number)}: ${issue.title.replace(/^Upstream:\s*/, "").slice(0, 60)}` });
  }
}

const rows = [];
for (const t of THREADS) {
  /* The issues endpoint answers for an issue and a PR alike; a PR carries a
   * pull_request key, and a merged PR reads closed - merged_at says which. */
  let data;
  try {
    data = ghJson(["api", `repos/${t.repo}/issues/${String(t.num)}`]);
  } catch {
    rows.push({ ...t, kind: "?", state: "?", comments: -1, updatedAt: "?", moved: false, error: true });
    continue;
  }
  const kind = data.pull_request ? "pr" : "issue";
  const state = data.pull_request?.merged_at ? "MERGED" : String(data.state).toUpperCase();
  const key = `${t.repo}#${t.num}`;
  const before = previous[key];
  const moved = before !== undefined && (before.state !== state || before.comments !== data.comments);
  rows.push({ ...t, kind, state, comments: data.comments, updatedAt: data.updated_at, moved });
}

const cache = {};
for (const r of rows) if (!r.error) cache[`${r.repo}#${r.num}`] = { state: r.state, comments: r.comments };
writeFileSync(cachePath, JSON.stringify(cache, null, 2) + "\n");

const pad = (s, n) => String(s).padEnd(n);
console.log(pad("thread", 34) + pad("state", 10) + pad("cmnts", 6) + pad("moved", 7) + "what");
for (const r of rows) {
  console.log(pad(`${r.repo.split("/")[1]}#${r.num} ${r.kind}`, 34) + pad(r.state, 10) + pad(r.error ? "-" : String(r.comments), 6) + pad(r.moved ? "YES" : "", 7) + r.what);
}
if (untracked.length > 0) console.log(`\nNo **Threads**: line in tracking issue(s) ${untracked.map((n) => `#${String(n)}`).join(", ")} - fix the body so the watch can see them.`);
const movedRows = rows.filter((r) => r.moved);
console.log("");
if (movedRows.length === 0) {
  console.log("No movement since the last watch. We keep working on the carried fixes (process §6); nothing waits on upstream.");
} else {
  console.log(`MOVED: ${movedRows.map((r) => `${r.repo.split("/")[1]}#${r.num}`).join(", ")} - the maintainer is processing us: engage this pass (owner directive 2026-11-03).`);
}
