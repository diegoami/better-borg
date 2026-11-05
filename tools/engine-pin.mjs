/**
 * The engine a measurement ran on, as a run record names it (#40): the
 * published package version plus the engine fixes this repository carries
 * as a pnpm patch (patches/README.md and docs/process.md adoption steps). One helper, both runners (tools/runs.mjs, tools/sweep.mjs), so a
 * record can never name the bare published pin while playing a patched one.
 *
 * The patch list is read from the patch file itself: every hunk carries a
 * "Mandos carries neostryder/neo-angband PR #<n> (fixes #<m>; ...)" comment,
 * so the string cannot drift from what pnpm actually applied.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const CORE = "@rpgm-tools/neo-angband-core";

export function enginePin(repoRoot) {
  let version = "(version unknown)";
  try {
    const pkg = JSON.parse(readFileSync(join(repoRoot, "node_modules", CORE, "package.json"), "utf8"));
    version = String(pkg.version);
  } catch {
    /* not installed: the record says so */
  }
  const base = `${CORE} ${version}`;
  const workspace = join(repoRoot, "pnpm-workspace.yaml");
  if (!existsSync(workspace)) return base;
  /* patchedDependencies: '<name>@<version>': <patch path> */
  const entry = readFileSync(workspace, "utf8")
    .split("\n")
    .map((line) => /^\s*'?(@rpgm-tools\/neo-angband-core@[^':]+)'?\s*:\s*(\S+)\s*$/.exec(line))
    .find((m) => m !== null);
  if (entry === undefined) return base;
  const patchPath = join(repoRoot, entry[2]);
  if (!existsSync(patchPath)) return `${base} + patch ${entry[2]} (MISSING)`;
  const prs = [...readFileSync(patchPath, "utf8").matchAll(/Mandos carries neostryder\/neo-angband PR #(\d+) \(fixes #(\d+)/g)]
    .map((m) => `PR #${m[1]} (fixes #${m[2]})`);
  const commits = [...readFileSync(patchPath, "utf8").matchAll(/Mandos carries neostryder\/neo-angband commit ([a-f0-9]+) \(([^;)]*)/g)]
    .map((m) => "commit " + m[1] + " (" + m[2] + ")");
  const carried = [...prs, ...commits];
  return base + " + carried patches: " + (carried.length > 0 ? carried.join(", ") : entry[2]);
}
