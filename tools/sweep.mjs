#!/usr/bin/env node
/**
 * The bake-off runner: turn the play harness into a repeatable instrument.
 *
 *   node tools/sweep.mjs --label b02-verify --seeds 1,7,42 --lives 1
 *
 * Boots the published engine headless, drives the stock Borg over a fixed
 * seed cohort, and writes a complete session record under docs/runs/:
 * runs.json (the raw per-run facts, schema in docs/runs/README.md) plus
 * summary.md (the computed table a curated README is written from). This is
 * B02's instrument (issue #3) and Phase 2's fitness evaluator: the per-run
 * output is complete enough that a fitness column can be computed without
 * re-running.
 *
 * THE LOOP IS NOT HERE. The session machinery is src/play-session.ts, shared
 * with src/play.test.ts - one module, two callers, so the numbers a run
 * record quotes are the numbers the suite asserts on. This file only gathers
 * arguments and provenance, bundles the entry (see tools/sweep-entry.ts for
 * why bundling), runs it, and reports.
 *
 * Determinism (rule 5): seeds are named on the command line, the runner adds
 * no randomness of its own, and wall-clock durations are recorded as metadata
 * only. The engine measured is the published pin plus the fixes this repo
 * carries as a pnpm patch (#40, process.md section 6) - exactly what `pnpm
 * install` gives every machine, and the record names both. No config files,
 * no environment-dependent behaviour beyond where the content pack is found.
 */

import { build } from "esbuild";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { enginePin } from "./engine-pin.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, "..");

const USAGE = `usage: node tools/sweep.mjs --label <name> --seeds 1,7,42 [--lives 1]
                [--decisions 1500] [--stage 20,8] [--out docs/runs]

  --label       session label; the record lands in <out>/<date>-<label>/
  --seeds       comma-separated game seeds (the fixed cohort)
  --lives       characters per seed (default 1; see src/play-session.ts)
  --decisions   decision budget per life (default 1500)
  --stage       clvl,depth - the stage a life must attain (#25); an attained
                life ends there and the record carries the reach-rate
  --out         records root (default <repo>/docs/runs)

The runner plays the stock Borg on the published engine pin, writes
runs.json (raw facts) and summary.md (computed) into a fresh directory, and
refuses to touch one that already exists: run records are append-only.`;

function fail(message) {
  console.error(`sweep: ${message}`);
  process.exit(1);
}

/* --- arguments ----------------------------------------------------------- */

const args = { lives: 1, decisions: 1500 };
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  const flag = argv[i];
  const value = argv[i + 1];
  if (flag === "--help" || flag === "-h") {
    console.log(USAGE);
    process.exit(0);
  } else if (flag === "--label") args.label = value;
  else if (flag === "--seeds") args.seeds = value;
  else if (flag === "--lives") args.lives = Number(value);
  else if (flag === "--decisions") args.decisions = Number(value);
  else if (flag === "--stage") args.stage = value;
  else if (flag === "--out") args.out = value;
  else fail(`unknown argument ${String(flag)}\n\n${USAGE}`);
  i++;
}

if (args.label === undefined || !/^[a-z0-9][a-z0-9-]*$/.test(args.label)) {
  fail(`--label is required (lowercase letters, digits, dashes), e.g. --label b02-verify`);
}
if (args.seeds === undefined) {
  fail(`--seeds is required, e.g. --seeds 1,7,42`);
}
const seeds = args.seeds
  .split(",")
  .map((s) => Number(s.trim()));
if (seeds.length === 0 || seeds.some((s) => !Number.isInteger(s) || s <= 0)) {
  fail(`--seeds must be a comma-separated list of positive integers, got ${JSON.stringify(args.seeds)}`);
}
if (!Number.isInteger(args.lives) || args.lives < 1) {
  fail(`--lives must be a positive integer, got ${String(args.lives)}`);
}
if (!Number.isInteger(args.decisions) || args.decisions < 1) {
  fail(`--decisions must be a positive integer, got ${String(args.decisions)}`);
}
/* --stage clvl,depth (#25): the reach-rate's rung. Parsed here so a bad
 * value fails before any compute is spent. */
let stage = null;
if (args.stage !== undefined) {
  const parts = args.stage.split(",").map((text) => Number(text.trim()));
  if (parts.length !== 2 || parts.some((n) => !Number.isInteger(n) || n < 0)) {
    fail(`--stage must be clvl,depth (two non-negative integers), got ${JSON.stringify(args.stage)}`);
  }
  stage = { clvl: parts[0], depth: parts[1] };
}

/* The default records root is anchored at the repository, so running the tool
 * from elsewhere still writes where the records live; an explicit --out is
 * honoured as given (relative to the current directory). */
const outRoot = args.out !== undefined ? resolve(args.out) : join(REPO_ROOT, "docs", "runs");
const now = new Date();
const date = `${String(now.getFullYear())}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
  now.getDate(),
).padStart(2, "0")}`;
const dir = join(outRoot, `${date}-${args.label}`);
if (existsSync(dir)) {
  fail(
    `${dir} already exists. Run records are append-only (docs/runs/README.md); ` +
      `pick a new label.`,
  );
}

/* --- provenance (metadata the record names, never a number it computes) -- */

function git(lines, cwd) {
  try {
    return execFileSync("git", lines, { cwd, encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

const head = git(["rev-parse", "HEAD"], REPO_ROOT);
const branch = git(["rev-parse", "--abbrev-ref", "HEAD"], REPO_ROOT);
const dirty = git(["status", "--porcelain"], REPO_ROOT);
const commit =
  head !== null ? `${branch ?? "?"}@${head.slice(0, 8)}${dirty ? " (dirty)" : ""}` : null;


/* The content pack's directory: the sibling checkout or NEO_ANGBAND_REPO,
 * resolved HERE because the bundled entry's import.meta.url points at a
 * temporary file and cannot find a sibling on its own. This mirrors
 * packRoot() in src/play-session.ts. */
function contentRoot() {
  const roots = [process.env["NEO_ANGBAND_REPO"], join(REPO_ROOT, "..", "neo-angband")].filter(
    (r) => typeof r === "string" && r.length > 0,
  );
  for (const root of roots) {
    if (existsSync(join(root, "packages", "content", "pack", "constants.json"))) return root;
  }
  return null;
}

const content = contentRoot();
if (content === null) {
  fail(
    "no content pack found. The play harness needs the game's checkout: a " +
      "sibling neo-angband directory or NEO_ANGBAND_REPO (see src/play.test.ts).",
  );
}
const packDir = join(content, "packages", "content", "pack");

/* The content pack's own checkout id, if it is a git work tree. */
function contentId() {
  const short = git(["rev-parse", "--short", "HEAD"], content);
  return short !== null ? `neo-angband@${short}` : "neo-angband (not a git checkout)";
}

const buildInfo = {
  commit,
  engine: enginePin(REPO_ROOT),
  content: contentId(),
  borg: "stock",
};

/* --- bundle the entry, run the cohort ------------------------------------ */

const tmp = mkdtempSync(join(tmpdir(), "b02-sweep-"));
/* process.exit skips finally, so failures are recorded here and acted on
 * after the cleanup has run - a leaked bundle in /tmp is small, but it is
 * still a file nobody asked for. */
let failure = null;
try {
  const outfile = join(tmp, "sweep-bundle.mjs");
  await build({
    absWorkingDir: REPO_ROOT,
    entryPoints: [join(HERE, "sweep-entry.ts")],
    outfile,
    bundle: true,
    format: "esm",
    platform: "node",
    target: "node22",
    logLevel: "silent",
  });

  const entry = await import(pathToFileURL(outfile).href);
  const result = entry.runSweep({
    label: args.label,
    seeds,
    lives: args.lives,
    decisions: args.decisions,
    stage,
    dir,
    packDir,
    build: buildInfo,
    recorded: now.toISOString(),
  });

  console.log("");
  console.log(result.summary);
  console.log(`record: ${String(result.runsPath)}`);
  console.log(`summary: ${String(result.summaryPath)}`);
} catch (e) {
  failure = e instanceof Error ? e.message : String(e);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
if (failure !== null) fail(failure);
