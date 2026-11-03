#!/usr/bin/env node
/**
 * The inventory-decision exporter (#28): a run record's discard moments as
 * one self-contained decisions.json for the reviewer.
 *
 *   node tools/inventory-export.mjs docs/runs/<session> [--out <file>]
 *
 * The reviewer (tools/inventory-review/, a static page) never reads the
 * repository's internals: it loads THIS file. The export is a projection of
 * the record's own committed facts (runs.json, schema better-borg/runs@1) -
 * every discard moment verbatim, the run's identifying facts beside it, the
 * record's provenance cited, and the discard-moment DEFINITION itself (the
 * pack size and the pressure threshold) carried so the page can explain
 * what it is showing without hardcoding it.
 *
 * Deterministic by construction (rule 5's spirit over a derived artifact):
 * no timestamps of its own - the record's `recorded` is the date - so the
 * same runs.json always exports to the same bytes and a re-export diffs
 * clean. Default output: <record-dir>/decisions.json.
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";

const USAGE = `usage: node tools/inventory-export.mjs <record-dir> [--out <file>]

  <record-dir>   a session directory under docs/runs/ (the one holding runs.json)
  --out          where the export lands (default <record-dir>/decisions.json)`;

function fail(message) {
  console.error(`inventory-export: ${message}`);
  process.exit(1);
}

const argv = process.argv.slice(2);
let dir = null;
let out = null;
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === "--out") {
    out = argv[i + 1];
    i++;
  } else if (dir === null) {
    dir = argv[i];
  } else {
    fail(`unexpected argument ${String(argv[i])}\n\n${USAGE}`);
  }
}
if (dir === null) fail(`a record directory is required\n\n${USAGE}`);
dir = resolve(dir);
const runsPath = join(dir, "runs.json");
if (!existsSync(runsPath)) fail(`no runs.json in ${dir} - is that a session directory?`);

/** The record's own raw facts, read once. */
const record = JSON.parse(readFileSync(runsPath, "utf8"));

/* --- the projection ------------------------------------------------------ */

/** One run's reviewer facts: identity, outcome, and the ledger verbatim. */
function exportRun(run) {
  return {
    seed: run.seed,
    life: run.life,
    race: run.race,
    class: run.class,
    clvl: run.clvl,
    gold: run.gold,
    turns: run.turns,
    maxDepth: run.maxDepth,
    decisions: run.decisions,
    dead: run.dead,
    causeOfDeath: run.causeOfDeath,
    /* The additive-reader rule (docs/runs/README.md): a record before B28
     * carries no inventory key and reads as an empty ledger. */
    total: run.inventory?.total ?? 0,
    moments: run.inventory?.moments ?? [],
  };
}

const doc = {
  schema: "mandos/inventory-decisions@1",
  record: {
    label: record.label,
    directory: basename(dir),
    recorded: record.recorded,
    build: record.build,
    runner: record.runner,
  },
  /* The discard-moment definition as implemented (src/inventory.ts): the
   * page shows the threshold beside every moment, from here - never its
   * own copy, which would drift. */
  definition: {
    packSize: 23,
    pressureFreeSlots: 2,
    ways: ["drop", "sell", "stash"],
    said: "the message lines the game printed while the discard command ran, oldest first",
  },
  runs: record.runs.map(exportRun),
};

const outPath = out !== null ? resolve(out) : join(dir, "decisions.json");
writeFileSync(outPath, `${JSON.stringify(doc, null, 2)}\n`);

const moments = doc.runs.reduce((sum, run) => sum + run.moments.length, 0);
const withMoments = doc.runs.filter((run) => run.moments.length > 0).length;
console.log(`exported ${String(moments)} discard moment${moments === 1 ? "" : "s"} from ${String(withMoments)} of ${String(doc.runs.length)} runs`);
console.log(outPath);
