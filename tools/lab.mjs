#!/usr/bin/env node
/**
 * The desktop lab (process.md section 8), made impossible to start stale.
 *
 *   node tools/lab.mjs status    what the lab would run, and what is stale
 *   node tools/lab.mjs start     bring both halves current, then launch
 *   node tools/lab.mjs check     read the newest lab log: births, deaths,
 *                                retirements, and every missing consent
 *
 * The lab has two halves that drift on their own: the mod clone in
 * <data>/mods/mandos (a git clone of this repository), and the desktop
 * build of the engine's lab branch. Nothing about a merge updates either,
 * so a lab check could watch an old mod on an old engine (found 2026-11-04:
 * the clone three merges behind main, the build missing the lab branch's
 * input-flush commit). `start` fast-forwards the clone to origin/main,
 * rebuilds the engine when the lab branch head differs from the commit the
 * last build recorded (artifacts/lab-build.json), launches, and prints the
 * mod and engine commits the session is running.
 *
 * Paths: MANDOS_LAB_DATA (default ../mandos-lab-data) and NEO_ANGBAND_REPO
 * (default ../neo-angband, on the neowarrior-lab branch).
 */

import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdirSync, openSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("./", import.meta.url)), "..");
const DATA = resolve(process.env["MANDOS_LAB_DATA"] ?? join(ROOT, "..", "mandos-lab-data"));
const ENGINE = resolve(process.env["NEO_ANGBAND_REPO"] ?? join(ROOT, "..", "neo-angband"));
const MOD = join(DATA, "mods", "mandos");
const STAMP = join(ROOT, "artifacts", "lab-build.json");
const LAB_BRANCH = "neowarrior-lab";

function fail(message) {
  console.error(`lab: ${message}`);
  process.exit(1);
}

function git(cwd, args) {
  return execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
}

function run(cwd, cmd, args, env = {}) {
  console.log(`lab: (${cwd}) ${cmd} ${args.join(" ")}`);
  execFileSync(cmd, args, { cwd, stdio: "inherit", env: { ...process.env, ...env } });
}

function readStamp() {
  try {
    return JSON.parse(readFileSync(STAMP, "utf8"));
  } catch {
    return null;
  }
}

/** The facts `status` prints and `start` acts on. */
function inspect() {
  if (!existsSync(join(MOD, ".git"))) fail(`no mod clone at ${MOD} (process.md section 8: git clone into <data>/mods/mandos)`);
  if (!existsSync(join(ENGINE, ".git"))) fail(`no engine checkout at ${ENGINE}`);
  git(MOD, ["fetch", "-q", "origin", "main"]);
  const mod = git(MOD, ["rev-parse", "--short", "HEAD"]);
  const main = git(MOD, ["rev-parse", "--short", "origin/main"]);
  const modDirty = git(MOD, ["status", "--porcelain"]) !== "";
  const branch = git(ENGINE, ["rev-parse", "--abbrev-ref", "HEAD"]);
  const engine = git(ENGINE, ["rev-parse", "--short", "HEAD"]);
  const engineDirty = git(ENGINE, ["status", "--porcelain", "--untracked-files=no"]) !== "";
  const stamp = readStamp();
  return { mod, main, modDirty, branch, engine, engineDirty, built: stamp?.engine ?? null, builtAt: stamp?.at ?? null };
}

function report(s) {
  console.log(`mod clone   ${MOD}`);
  console.log(`  at ${s.mod}, origin/main ${s.main}${s.mod === s.main ? " - current" : " - BEHIND"}${s.modDirty ? " (dirty)" : ""}`);
  console.log(`engine      ${ENGINE} (${s.branch})`);
  console.log(`  head ${s.engine}, last lab build ${s.built ?? "unknown (never built by this tool)"}${s.builtAt ? ` at ${s.builtAt}` : ""}${s.built === s.engine ? " - current" : " - STALE"}${s.engineDirty ? " (dirty)" : ""}`);
  console.log(`data        ${DATA}`);
}

/**
 * The newest lab log, read for what a lab check must see (found 2026-11-04:
 * the 0.1.0 lab check was accepted while the borg ran without the truth
 * domain and without session:control, so no attained character was ever
 * kept). Exit 1 when the mod ran without a consent it needs.
 */
function check() {
  const dir = join(DATA, "logs");
  if (!existsSync(dir)) fail(`no lab logs at ${dir}`);
  const logs = readdirSync(dir).filter((f) => f.endsWith(".log")).map((f) => join(dir, f));
  if (logs.length === 0) fail(`no lab logs at ${dir}`);
  const newest = logs.sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)[0];
  const lines = readFileSync(newest, "utf8").split("\n").filter((l) => l.includes("[mod:mandos]"));
  const said = (re) => lines.filter((l) => re.test(l)).map((l) => l.replace(/^.*\[mod:mandos\] /u, ""));
  const births = said(/the Borg birthed its /u);
  const deaths = said(/the Borg's character died /u);
  const kept = said(/the Borg kept a save of the character that attained/u);
  const unkept = said(/could not keep a save of the character that attained/u);
  const noTruth = said(/gave it no truth domain/u);
  const archived = said(/the Borg archived the ended run: /u).map((l) => l.replace(/^the Borg archived the ended run: /u, ""));
  const consents = [...new Set(lines.flatMap((l) => [...l.matchAll(/needs the "([^"]+)" permission, which the player has not granted/gu)].map((m) => m[1])))];
  console.log(`lab log    ${newest}`);
  console.log(`births     ${births.length}${births.length ? ": " + births.map((b) => b.replace(/^the Borg birthed its /u, "").replace(/ \(.*$/u, "")).join(", ") : ""}`);
  console.log(`deaths     ${deaths.length}${deaths.length ? ": " + deaths.map((d) => (/\(([^)]+)\)/u.exec(d)?.[1] ?? "?")).join(", ") : ""}`);
  console.log(`retired    ${kept.length} kept${unkept.length ? `, ${unkept.length} attained but NOT kept` : ""}`);
  for (const a of archived) console.log(`archived   ${a}`);
  const problems = [];
  if (noTruth.length > 0) problems.push(`no truth domain on ${noTruth.length} start(s): grant the real-monsters permission (Mods -> Mandos -> Change permissions), #53`);
  for (const c of consents) problems.push(`the player has not granted "${c}" (Mods -> Mandos -> Change permissions)`);
  for (const p of problems) console.log(`PROBLEM    ${p}`);
  if (problems.length > 0) process.exit(1);
  console.log("ok         every consent the mod needs was held");
}

const command = process.argv[2];

if (command === "check") {
  check();
} else if (command === "status") {
  report(inspect());
} else if (command === "start") {
  const s = inspect();
  report(s);
  if (s.branch !== LAB_BRANCH) fail(`the engine checkout is on ${s.branch}, not ${LAB_BRANCH}`);
  if (s.engineDirty) fail("the engine checkout has uncommitted changes - a lab build must be a commit");
  if (s.modDirty) fail("the mod clone has local changes - it must be a plain clone of main");
  if (s.mod !== s.main) run(MOD, "git", ["merge", "--ff-only", "-q", "origin/main"]);
  if (s.built !== s.engine) {
    const env = { NEO_ANGBAND_LAB_BUILD: "1" };
    /* The web bundle imports the engine packages from their built dist/,
     * so they must be rebuilt first. Found 2026-11-04: core's dist was a
     * day old, so the lab ran without the input-flush fix and reported the
     * stock version. */
    for (const pkg of ["core", "mod-sdk", "content"]) run(ENGINE, "pnpm", ["--filter", `@rpgm-tools/neo-angband-${pkg}`, "build"], env);
    run(ENGINE, "pnpm", ["--filter", "@rpgm-tools/neo-angband-web", "bundle"], env);
    run(join(ENGINE, "packages", "desktop"), "pnpm", ["build"], env);
    mkdirSync(join(ROOT, "artifacts"), { recursive: true });
    writeFileSync(STAMP, JSON.stringify({ engine: s.engine, at: new Date().toISOString() }, null, 2) + "\n");
  }
  const mod = git(MOD, ["rev-parse", "--short", "HEAD"]);
  const log = join(ROOT, "artifacts", "lab.log");
  const out = openSync(log, "a");
  const child = spawn("pnpm", ["exec", "electron", ".", "--lab-trust=mandos"], {
    cwd: join(ENGINE, "packages", "desktop"),
    env: { ...process.env, NEO_ANGBAND_DATA: DATA },
    detached: true,
    stdio: ["ignore", out, out],
  });
  child.unref();
  console.log(`lab: launched (pid ${child.pid}) - mod ${mod}, engine ${s.engine} (${LAB_BRANCH}); log ${log}`);
} else {
  console.log("usage: node tools/lab.mjs status | start | check");
  process.exit(command === undefined ? 0 : 1);
}
