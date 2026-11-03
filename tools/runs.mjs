#!/usr/bin/env node
/**
 * Write a PACK session's run record by PLAYING it (ported from
 * neowarrior-borg's tools/runs.mjs, T06 #9, for the M2 unification #15).
 *
 * Rule 1: a change without a record is an unmeasured change, and rule 8 says
 * the record is committed. This tool is how the raw half of a pack-session
 * record gets onto disk: it plays a headless session of the active strategy
 * pack's planned characters through the ONE session module (src/
 * play-session.ts - the journal installed per character, the engine's own
 * arrival events, chained on deaths the way the restart loop chains them)
 * and writes runs.json + summary.md through the ONE record writer
 * (src/run-record.ts, schema better-borg/runs@1) - the same writer
 * tools/sweep.mjs writes the stock sessions with, so a pack record and a
 * stock record are the same shape and diff by their numbers alone.
 *
 * THE BUNDLE STEP is because the driver is TypeScript and a tool is not a
 * test: vitest transforms, plain node does not. esbuild (already a
 * devDependency of the plugin build) bundles the driver and the writer into
 * git-ignored artifacts/ with the engine left external - node_modules
 * resolves it from inside the repository, exactly as the play tests resolve
 * it. The engine arrives at the bundle as a parameter, the same discipline
 * src/play-session.ts keeps for the suite (core-import-census).
 *
 * Usage:
 *
 *   node tools/runs.mjs --label <name> [--seeds 20,23,34,49] [--cap 600]
 *       [--race Half-Troll] [--pack warrior] [--stage 2,1] [--out docs/runs]
 *
 * The record lands in <out>/<date>-<label>/ (a fresh directory; records are
 * append-only). Prints the numbers the README's table wants; the table
 * itself is curated by hand. `--stage clvl,depth` (#25) plays the
 * stage-grind: an attained life is retired into the library (a kept,
 * renamed roster slot) and the next seed boots; the record carries
 * per-run attainment and the reach-rate - the project's number.
 */

import { build } from "esbuild";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
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
  console.error(`runs: ${message}`);
  process.exit(1);
}

const label = arg("label", null);
if (label === null || !/^[a-z0-9][a-z0-9-]*$/.test(label)) {
  fail(`--label is required (lowercase letters, digits, dashes), e.g. --label b15-verify`);
}
const seeds = arg("seeds", "20,23,34,49")
  .split(",")
  .map((text) => Number(text.trim()))
  .filter((n) => Number.isInteger(n) && n > 0);
if (seeds.length === 0) fail(`--seeds must be a comma-separated list of positive integers`);
const cap = Number(arg("cap", "600"));
if (!Number.isInteger(cap) || cap < 1) fail(`--cap must be a positive integer`);
/* --stage clvl,depth (#25): the reach-rate's rung. */
let stage = null;
{
  const text = arg("stage", null);
  if (text !== null) {
    const parts = text.split(",").map((piece) => Number(piece.trim()));
    if (parts.length !== 2 || parts.some((n) => !Number.isInteger(n) || n < 0)) {
      fail(`--stage must be clvl,depth (two non-negative integers), got ${JSON.stringify(text)}`);
    }
    stage = { clvl: parts[0], depth: parts[1] };
  }
}
const raceName = arg("race", undefined);
const packId = arg("pack", "warrior");
const outRoot = resolve(arg("out", join(REPO_ROOT, "docs", "runs")));

/* The bundle: one file in git-ignored artifacts/, engine and SDK external so
 * the published copies in node_modules are the ones that run. The little
 * stdin entry re-exports the driver, the writer and the packs so one import
 * serves the tool. */
const bundle = join(REPO_ROOT, "artifacts", ".runs-session.mjs");
await build({
  stdin: {
    contents:
      'export * from "./src/play-session.js";\n' +
      'export * from "./src/run-record.js";\n' +
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

const { loadPack, packRoot, playPackSession, writeSessionRecord, buildSummary, buildRunsJson, PACKS } = await import(
  pathToFileURL(bundle).href
);

/* The pack: the registry selects it by id, the same way the borg.class
 * setting selects it in the mod. */
const strategy = PACKS.find((p) => p.id === packId);
if (strategy === undefined) fail(`unknown pack "${packId}" (known: ${PACKS.map((p) => p.id).join(", ")})`);

/* The pack: same resolution the play tests use (NEO_ANGBAND_REPO, then the
 * sibling checkout); without it there is nothing to play. */
const packDir = packRoot();
if (packDir === null) {
  fail("no content pack: set NEO_ANGBAND_REPO or check out neo-angband as a sibling (docs/process.md section 1)");
}

/* --- provenance, the writer's build block -------------------------------- */

function git(lines, cwd = REPO_ROOT) {
  try {
    return execFileSync("git", lines, { cwd, encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

const head = git(["rev-parse", "HEAD"]);
const branch = git(["rev-parse", "--abbrev-ref", "HEAD"]);
const dirty = git(["status", "--porcelain"]);
const commit = head !== null ? `${branch ?? "?"}@${head.slice(0, 8)}${dirty ? " (dirty)" : ""}` : null;

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
  /* packDir is <checkout>/packages/content/pack; the checkout root is three levels up. */
  const short = git(["rev-parse", "--short", "HEAD"], resolve(packDir, "..", "..", ".."));
  return short !== null ? `neo-angband@${short}` : "neo-angband (not a git checkout)";
}

/* --- the session, the record --------------------------------------------- */

const lines = [];
const session = await playPackSession(Core, loadPack(packDir), strategy, {
  seeds,
  capFor: () => cap,
  ...(raceName === undefined ? {} : { raceName }),
  ...(stage === null ? {} : { stage }),
  log: (message) => lines.push(`[borg] ${message}`),
});

const now = new Date();
const date = `${String(now.getFullYear())}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
const dir = join(outRoot, `${date}-${label}`);
if (existsSync(dir)) {
  fail(`${dir} already exists. Run records are append-only (docs/runs/README.md); pick a new label.`);
}

/* The pack session's lives carry every field the ONE writer's per-run shape
 * names (the shared observation made that possible); the mapping below is
 * field-for-field, adding nothing. */
const record = {
  label,
  runner: {
    tool: "tools/runs.mjs",
    decisions: cap,
    seeds,
    lives: session.lives.length,
    stage,
  },
  build: {
    commit,
    engine: enginePin(),
    content: contentId(),
    borg: `${strategy.id} pack (stock parameters)`,
  },
  recorded: now.toISOString(),
  runs: session.lives.map((life) => ({
    seed: life.seed,
    life: life.life,
    race: life.race,
    class: life.className,
    baseStats: [...life.baseStats],
    decisions: life.decisions,
    turns: life.turns,
    depths: [...life.depthsVisited],
    maxDepth: life.maxDepth,
    clvl: life.clvl,
    gold: life.gold,
    kills: life.kills,
    commands: { ...life.commands },
    places: life.places,
    dead: life.dead,
    causeOfDeath: life.causeOfDeath,
    jitter: life.jitter,
    restedBesideMonster: life.restedBesideMonster,
    stageAttained: life.stageAttained,
    retired: life.retired,
    unsure: { total: life.unsure.total, points: [...life.unsure.points] },
    wallClockMs: life.wallClockMs,
  })),
};

const paths = writeSessionRecord(dir, record);

/* The numbers the README's table wants, on stdout; the log lines are the
 * mod's own view of the session and go to stderr so a redirected stdout
 * stays a table. Since #25 the first line is the REACH-RATE - the project's
 * number - with the library beside it (the kept saves the ladder, #26,
 * resumes from). */
for (const line of lines) console.error(line);
const deepest = Math.max(...session.lives.map((life) => life.maxDepth));
const deaths = session.lives.filter((life) => life.dead).length;
console.log(`wrote ${paths.runsPath}`);
if (stage !== null) {
  const attained = session.lives.filter((life) => life.stageAttained).length;
  console.log(
    `reach-rate (stage c${String(stage.clvl)}d${String(stage.depth)}): ` +
      `${String(attained)}/${String(session.lives.length)} runs attained ` +
      `(${((attained / session.lives.length) * 100).toFixed(1)}%)  library: ${String(session.library.length)} kept`,
  );
}
console.log(`lives: ${session.lives.length}  deaths: ${deaths}  deepest: ${deepest}`);
for (const life of session.lives) {
  console.log(
    `  seed ${String(life.seed).padStart(3)}  depth ${String(life.maxDepth).padStart(2)}  clvl ${String(life.clvl).padStart(2)}  ` +
      `decisions ${String(life.decisions).padStart(4)}  turns ${String(life.turns).padStart(6)}  kills ${String(life.kills).padStart(3)}  ` +
      `gold ${String(life.gold).padStart(5)}  ` +
      `${life.retired ? "retired into the library" : life.stageAttained ? "attained (keep refused)" : life.dead ? `died to ${life.causeOfDeath ?? "?"}` : "survived its slice"}`,
  );
}
