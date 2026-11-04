#!/usr/bin/env node
/**
 * Bring the pristine upstream checkouts current, and say which of our PR
 * branches are cut from a stale base (process.md section 6). Run it before
 * citing upstream code in an issue and before cutting or pushing a PR
 * branch.
 *
 *   node tools/upstream-sync.mjs
 *
 * Two pristine checkouts, never worked in:
 *   ../neo-angband-mod-borg    the borg port, on neostryder's master
 *   ../neo-angband-upstream    the engine, a worktree of ../neo-angband
 *                              detached at neostryder's master (the main
 *                              ../neo-angband checkout is our lab branch)
 * In both, the remote `origin` is neostryder. In the engine checkout,
 * `upstream` is angband/angband, the C game, not neostryder.
 *
 * Fetches go over HTTPS with gh's credential, since the SSH key may be
 * refused (2026-11-04). Exit 1 when a pristine checkout has local changes
 * or sits off upstream's head after the sync.
 */

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("./", import.meta.url)), "..");
const SIBLINGS = resolve(ROOT, "..");
const CRED = ["-c", "credential.helper=", "-c", "credential.helper=!gh auth git-credential"];

function git(cwd, args) {
  return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

const problems = [];

/** One pristine checkout: fetch neostryder's master, fast-forward, report our PR branches. */
function sync({ label, dir, url, prRepo }) {
  if (!existsSync(join(dir, ".git"))) {
    problems.push(`${label}: no checkout at ${dir} (process.md section 1)`);
    return;
  }
  git(dir, [...CRED, "fetch", "-q", url, "+master:refs/remotes/origin/master"]);
  const head = git(dir, ["rev-parse", "--short", "origin/master"]);
  if (git(dir, ["status", "--porcelain", "--untracked-files=no"]) !== "") {
    problems.push(`${label}: ${dir} has local changes - a pristine checkout is never worked in`);
  } else {
    const branch = git(dir, ["rev-parse", "--abbrev-ref", "HEAD"]);
    if (branch === "HEAD") git(dir, ["checkout", "-q", "--detach", "origin/master"]);
    else if (branch === "master") git(dir, ["merge", "-q", "--ff-only", "origin/master"]);
  }
  const at = git(dir, ["rev-parse", "--short", "HEAD"]);
  console.log(`${label.padEnd(9)} ${dir}  at ${at}, neostryder master ${head}${at === head ? "" : "  <- NOT AT HEAD"}`);
  if (at !== head && !problems.some((p) => p.startsWith(label))) {
    problems.push(`${label}: ${dir} is on ${at}, not upstream's ${head} (switch it back to master)`);
  }
  /* Our PR branches in this repository: cut from an older master? */
  const branches = git(dir, ["for-each-ref", "--format=%(refname:short)", "refs/heads/pr/"]).split("\n").filter(Boolean);
  for (const pr of branches) {
    const base = git(dir, ["merge-base", pr, "origin/master"]);
    const behind = git(dir, ["rev-list", "--count", `${base}..origin/master`]);
    console.log(`  ${pr.padEnd(32)} base ${base.slice(0, 7)}${behind === "0" ? " (current)" : `, ${behind} commit(s) behind - rebase before pushing to ${prRepo}`}`);
  }
}

sync({
  label: "borg",
  dir: join(SIBLINGS, "neo-angband-mod-borg"),
  url: "https://github.com/neostryder/neo-angband-mod-borg.git",
  prRepo: "neostryder/neo-angband-mod-borg",
});
sync({
  label: "engine",
  dir: join(SIBLINGS, "neo-angband-upstream"),
  url: "https://github.com/neostryder/neo-angband.git",
  prRepo: "neostryder/neo-angband",
});
/* The engine's PR branches live in the main engine checkout (they share the worktree's repository). */

for (const p of problems) console.log(`PROBLEM   ${p}`);
process.exit(problems.length > 0 ? 1 : 0);
