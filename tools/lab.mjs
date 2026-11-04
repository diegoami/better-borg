#!/usr/bin/env node
/**
 * The desktop lab (process.md section 8), made impossible to start stale.
 *
 *   node tools/lab.mjs status    what the lab would run, and what is stale
 *   node tools/lab.mjs start     bring both halves current, then launch
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
import { existsSync, mkdirSync, openSync, readFileSync, writeFileSync } from "node:fs";
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

const command = process.argv[2];

if (command === "status") {
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
  console.log("usage: node tools/lab.mjs status | start");
  process.exit(command === undefined ? 0 : 1);
}
