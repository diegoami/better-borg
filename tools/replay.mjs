#!/usr/bin/env node
/**
 * Replay a record's dead runs and write their post-mortem dossier ladders
 * (#29, the death-replay trainer's automated half).
 *
 * A dead harness run is replayable by construction: the record carries the
 * seed, the planned birth and the whole command census, the engine is
 * deterministic, and the Borg is (rule 5) - so this tool reboots each dead
 * run exactly as the session booted it, drives it to the death AGAIN, and
 * freezes a dossier at every rung of the ladder (5/10/15/20 turns before
 * the death by default; --offsets widens the set, the owner's "extensible
 * by setting" - a numeric manifest row cannot carry a set). The replay's
 * death line is VERIFIED against the record (cause, turn, decisions,
 * census) and the verdict lands in every dossier and the ladder README -
 * a diverged replay still writes its dossiers, but it says so at the top,
 * because a dossier that quietly pretended to be the recorded run would be
 * the worst kind of wrong evidence.
 *
 * Rule 7: run records are byte-immutable and append-only, and the dossier
 * ladder is a NEW artifact directory under the record's own - the existing
 * files are never touched, and an existing postmortem directory is refused,
 * not merged into. Bulky by-products never happen here: a dossier is text,
 * a few KB per rung, committed (docs/runs/README.md documents the shape).
 *
 * Usage:
 *
 *   node tools/replay.mjs --record docs/runs/2026-11-03-stage-baseline-c2d1
 *       [--seeds 20,34] [--offsets 5,10,15,20] [--pack warrior]
 *
 * Writes <record>/postmortem/README.md and <record>/postmortem/seed-<n>/
 * offset-<k>.md per rung. The AI post-mortem workflow (docs/postmortem.md)
 * consumes them; a diagnosis artifact lands beside them (seed-<n>/
 * diagnosis.md), written by the session that read the dossier.
 */

import { build } from "esbuild";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import * as Core from "@rpgm-tools/neo-angband-core";

const HERE = fileURLToPath(new URL("./", import.meta.url));
const REPO_ROOT = resolve(HERE, "..");

function arg(name, fallback) {
  const at = process.argv.indexOf(`--${name}`);
  if (at === -1) return fallback;
  const value = process.argv[at + 1];
  if (value === undefined || value.startsWith("--")) throw new Error(`--${name} needs a value`);
  return value;
}

function fail(message) {
  console.error(`replay: ${message}`);
  process.exit(1);
}

const recordArg = arg("record", null);
if (recordArg === null) fail(`--record is required: the run-record directory holding runs.json, e.g. --record docs/runs/2026-11-03-stage-baseline-c2d1`);
const recordDir = resolve(recordArg);
const runsPath = join(recordDir, "runs.json");
if (!existsSync(runsPath)) fail(`${runsPath} does not exist: --record must name a run-record directory`);
const packId = arg("pack", "warrior");

const seedsFilter = arg("seeds", null) === null
  ? null
  : arg("seeds", null)
      .split(",")
      .map((text) => Number(text.trim()))
      .filter((n) => Number.isInteger(n) && n > 0);
const offsets = arg("offsets", "5,10,15,20")
  .split(",")
  .map((text) => Number(text.trim()))
  .filter((n) => Number.isInteger(n) && n > 0);
if (offsets.length === 0) fail(`--offsets must be a comma-separated list of positive integers`);

/* The bundle: one file in git-ignored artifacts/, engine and SDK external so
 * the published copies in node_modules are the ones that run (the same
 * discipline tools/runs.mjs keeps). */
const bundle = join(REPO_ROOT, "artifacts", ".replay-session.mjs");
await build({
  stdin: {
    contents:
      'export * from "./src/play-session.js";\n' +
      'export * from "./src/postmortem/replay.js";\n' +
      'export { POSTMORTEM_SCHEMA_ID } from "./src/postmortem/dossier.js";\n' +
      'export { PACKS } from "./src/class/registry.js";\n',
    resolveDir: REPO_ROOT,
    loader: "js",
  },
  outfile: bundle,
  bundle: true,
  format: "esm",
  platform: "node",
  external: ["@rpgm-tools/*"],
  logLevel: "silent",
});

const { loadPack, packRoot, replayDeadRun, DEFAULT_OFFSETS, PACKS } = await import(pathToFileURL(bundle).href);

const strategy = PACKS.find((p) => p.id === packId);
if (strategy === undefined) fail(`unknown pack "${packId}" (known: ${PACKS.map((p) => p.id).join(", ")})`);
const packDir = packRoot();
if (packDir === null) {
  fail("no content pack: set NEO_ANGBAND_REPO or check out neo-angband as a sibling (docs/process.md section 1)");
}

const document = JSON.parse(readFileSync(runsPath, "utf8"));
const deadRuns = document.runs.filter((run) => run.dead === true && (seedsFilter === null || seedsFilter.includes(run.seed)));
if (deadRuns.length === 0) fail(`no dead runs to replay in ${runsPath}${seedsFilter === null ? "" : ` matching seeds ${seedsFilter.join(",")}`}`);

/* The dossier's provenance block cites the record's own build: the replay is
 * only exact against the engine/content the record names, so the dossier
 * says what the record said, plus this checkout's engine pin. */
function enginePin() {
  try {
    const pkg = JSON.parse(readFileSync(join(REPO_ROOT, "package.json"), "utf8"));
    const pinned = pkg.devDependencies?.["@rpgm-tools/neo-angband-core"];
    return typeof pinned === "string" ? `@rpgm-tools/neo-angband-core ${pinned}` : "@rpgm-tools/neo-angband-core (unpinned)";
  } catch {
    return "@rpgm-tools/neo-angband-core (unpinned)";
  }
}

function contentId() {
  try {
    const short = execFileSync("git", ["rev-parse", "--short", "HEAD"], { cwd: resolve(packDir, "..", "..", ".."), encoding: "utf8" }).trim();
    return `neo-angband@${short}`;
  } catch {
    return "neo-angband (not a git checkout)";
  }
}

const outRoot = join(recordDir, "postmortem");
if (existsSync(outRoot)) {
  fail(`${outRoot} already exists. The dossier ladder is committed evidence (rule 8: append-only); delete nothing - write to a fresh record or move the directory aside by hand if you know why.`);
}

const recordLabel = typeof document.label === "string" ? document.label : basename(recordDir);
const recordRecorded = typeof document.recorded === "string" ? document.recorded : "(unknown)";
const recordDirName = relative(REPO_ROOT, recordDir).split("\\").join("/");
const buildBlock = {
  engine: `${enginePin()} (the record's engine: ${String(document.build?.engine ?? "?")})`,
  content: document.build?.content ?? contentId(),
  borg: typeof document.build?.borg === "string" ? document.build.borg : `${strategy.id} pack`,
  cap: document.runner?.decisions ?? 0,
};

const ladder = offsets.length > 0 ? offsets : [...DEFAULT_OFFSETS];
const lines = [];
const log = (message) => lines.push(`[borg] ${message}`);

const outcomes = [];
for (const run of deadRuns) {
  const stage = document.runner?.stage ?? null;
  const replay = await replayDeadRun(
    Core,
    loadPack(packDir),
    strategy,
    {
      seed: run.seed,
      life: run.life,
      race: run.race,
      baseStats: run.baseStats,
      deathTurn: run.turns,
      cause: run.causeOfDeath ?? "(unnamed)",
      decisions: run.decisions,
      commands: run.commands,
      clvl: run.clvl,
      maxDepth: run.maxDepth,
      stage: stage === null ? null : { clvl: stage.clvl, depth: stage.depth },
      cap: document.runner?.decisions ?? run.decisions,
    },
    { label: recordLabel, directory: recordDirName, recorded: recordRecorded },
    buildBlock,
    { offsets: ladder, log },
  );
  outcomes.push({ run, replay });
}

/* The ladder README: the computed layer over the dossiers, deterministic
 * (every number comes from the record or the replay, none from a clock). */
mkdirSync(outRoot, { recursive: true });
{
  const readme = [];
  readme.push(`# Post-mortem dossier ladder - ${recordLabel}`);
  readme.push("");
  readme.push(
    `The death-replay trainer's export for every dead run in \`${recordDirName}\` ` +
      `(recorded ${recordRecorded}): one deterministic dossier per dead run x ladder rung, ` +
      `written by \`tools/replay.mjs\` replaying the recorded seed with the same planned birth. ` +
      `The AI post-mortem workflow is docs/postmortem.md; a diagnosis artifact lands beside ` +
      `the dossiers it was written from (seed-<n>/diagnosis.md).`,
  );
  readme.push("");
  readme.push("| seed | died to | turn | ladder rungs | replay |");
  readme.push("| --- | --- | --- | --- | --- |");
  for (const { run, replay } of outcomes) {
    const rungs = ladder
      .map((offset) => {
        const rung = replay.rungs.find((r) => r.offset === offset);
        return rung === undefined ? `-${String(offset)}t:none` : `-${String(offset)}t:${String(rung.boundaryTurn)}`;
      })
      .join(", ");
    readme.push(
      `| ${String(run.seed)} | ${run.causeOfDeath ?? "?"} | ${String(run.turns)} | ${rungs} | ${replay.verification.exact ? "exact" : `DIVERGED: ${replay.verification.differences.join("; ")}`} |`,
    );
  }
  readme.push("");
  readme.push(
    "The rung column names each offset's release boundary turn (`-<offset>t:<turn>`; `none` marks a rung whose boundary never came - the death crossed it in one decision). Each dossier's rung section carries the two settings that arm the human replay path (`borg.replayReleaseTurn`, `borg.replayDeathTurn`).",
  );
  readme.push("");
  writeFileSync(join(outRoot, "README.md"), `${readme.join("\n")}\n`);
}

for (const { run, replay } of outcomes) {
  const seedDir = join(outRoot, `seed-${String(run.seed)}`);
  mkdirSync(seedDir, { recursive: true });
  for (const rung of replay.rungs) {
    writeFileSync(join(seedDir, `offset-${String(rung.offset)}.md`), rung.dossier);
  }
}

for (const line of lines) console.error(line);
for (const { run, replay } of outcomes) {
  console.log(
    `seed ${String(run.seed)}: ${replay.verification.exact ? "reproduced the recorded death exactly" : `DIVERGED (${replay.verification.differences.join("; ")})`}`,
  );
  for (const rung of replay.rungs) {
    console.log(`  offset ${String(rung.offset).padStart(2)}  release boundary turn ${String(rung.boundaryTurn)}  dossier ${join(recordDirName, "postmortem", `seed-${String(run.seed)}`, `offset-${String(rung.offset)}.md`)}`);
  }
  for (const miss of replay.missed) {
    console.log(`  offset ${String(miss.offset).padStart(2)}  missed: ${miss.why}`);
  }
}
console.log(`wrote ${join(recordDirName, "postmortem")}`);
