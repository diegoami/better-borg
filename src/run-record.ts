/**
 * The run-record writer: raw facts to runs.json, derived numbers to summary.md.
 *
 * B02 (issue #3) made the play harness a repeatable instrument, and an
 * instrument is only as good as its lab notebook. runs.json is that notebook:
 * one entry per character, the facts of the life as the session loop observed
 * them (see RunReport in play-session.ts), under the schema documented in
 * docs/runs/README.md. Every later claim - a curated README, a fitness column,
 * a regression argument - traces to these entries, which is why they carry no
 * interpretation: the medians and means a comparison needs are computed HERE,
 * by the reader layer (buildSummary), written to a SEPARATE file, and never
 * folded back into the primary record. A derived number inside runs.json would
 * quietly become the number everybody quotes.
 *
 * Append-only: docs/runs/README.md promises a completed session is never
 * edited, so writeSessionRecord refuses a directory that already exists rather
 * than offering to overwrite one. The timestamp is the CALLER's (`recorded` in
 * SessionRecord); the builder is pure, so the same session always serializes
 * to the same bytes and a re-run is diffable.
 */

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { RunReport } from "./play-session.js";
import { reachRate } from "./measure/bakeoff.js";

/** Identifies the runs.json shape; bump when the schema gains a field. */
export const RUNS_SCHEMA_ID = "better-borg/runs@1";
/* ^ Deliberately NOT renamed with the mod (#19): this is a FORMAT identifier
 * committed byte-identically into existing records (rule 7), not branding.
 * New records keep carrying it; a future format change bumps the @n. */

/** Which tool drove the cohort, at what shape. */
export interface SessionRunner {
  /** The runner (tools/sweep.mjs); records itself for the reader's provenance. */
  tool: string;
  /** Decision budget per life. */
  decisions: number;
  /** The seed cohort, in the order the runner played it. */
  seeds: number[];
  /** Lives played per seed. */
  lives: number;
  /**
   * The stage the cohort ground toward (#25) - the reach-rate's rung - or
   * null when the session played none. ADDITIVE: records before B25 carry
   * no `stage` key at all, and a reader treats absence as null.
   */
  stage: { readonly clvl: number; readonly depth: number } | null;
}

/** What was playing: the build a later comparison must be able to name. */
export interface SessionBuild {
  /** This repository's HEAD (and dirty marker), or null outside a checkout. */
  commit: string | null;
  /** The engine the runs booted, version included. */
  engine: string;
  /** The content pack's source, or null when unidentified. */
  content: string | null;
  /**
   * Which Borg played. "stock" today; Phase 2 records the candidate's frozen
   * parameters here, so a fitness column can be attributed without re-running.
   */
  borg: string;
}

/** Everything one recorded session knows about itself. */
export interface SessionRecord {
  /** The session's label (becomes the directory name's suffix). */
  label: string;
  /** What drove the cohort. */
  runner: SessionRunner;
  /** What was playing. */
  build: SessionBuild;
  /** When the session ran (ISO timestamp; supplied by the caller, not the clock here). */
  recorded: string;
  /** The raw per-run facts, one per character, in play order. */
  runs: RunReport[];
}

/** A run as serialized: RunReport with the wall-clock duration as metadata. */
interface RunEntry {
  seed: number;
  life: number;
  race: string;
  class: string;
  baseStats: number[];
  decisions: number;
  turns: number;
  depths: number[];
  maxDepth: number;
  clvl: number;
  gold: number;
  kills: number;
  places: number;
  dead: boolean;
  causeOfDeath: string | null;
  commands: Record<string, number>;
  jitter: number;
  restedBesideMonster: number;
  /** #25, additive: whether this run attained the session's stage (the schema id stays `@1`; records before B25 carry no such key). */
  stageAttained: boolean;
  /** #25, additive: whether the retire flow kept a save of this run (the library). */
  retired: boolean;
  meta: { wallClockMs: number };
}

/** The runs.json document (key order fixed: it is a record, and diffable). */
export interface RunsJsonDocument {
  schema: string;
  recorded: string;
  label: string;
  runner: SessionRunner;
  build: SessionBuild;
  runs: RunEntry[];
}

/** Raw facts only - this function copies, it never computes. */
function runEntry(run: RunReport): RunEntry {
  return {
    seed: run.seed,
    life: run.life,
    race: run.race,
    class: run.class,
    baseStats: [...run.baseStats],
    decisions: run.decisions,
    turns: run.turns,
    depths: [...run.depths],
    maxDepth: run.maxDepth,
    clvl: run.clvl,
    gold: run.gold,
    kills: run.kills,
    places: run.places,
    dead: run.dead,
    causeOfDeath: run.causeOfDeath,
    commands: { ...run.commands },
    jitter: run.jitter,
    restedBesideMonster: run.restedBesideMonster,
    stageAttained: run.stageAttained,
    retired: run.retired,
    meta: { wallClockMs: run.wallClockMs },
  };
}

/** Build the raw record. Pure: same session in, same bytes out. */
export function buildRunsJson(record: SessionRecord): RunsJsonDocument {
  return {
    schema: RUNS_SCHEMA_ID,
    recorded: record.recorded,
    label: record.label,
    runner: { ...record.runner, seeds: [...record.runner.seeds] },
    build: { ...record.build },
    runs: record.runs.map(runEntry),
  };
}

/** The middle of a sorted list, averaging the two middles when even. */
function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.trunc(sorted.length / 2);
  return sorted.length % 2 === 1
    ? sorted[mid]!
    : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

/** The command code this run issued most (a stall shows up as one code dominating). */
function topCommand(run: RunReport): string {
  let best = "-";
  let bestCount = 0;
  for (const [code, count] of Object.entries(run.commands)) {
    if (count > bestCount) {
      best = code;
      bestCount = count;
    }
  }
  return bestCount > 0 ? `${best} x${String(bestCount)}` : "-";
}

/**
 * Build the computed layer: the table a curated README is written from, with
 * the cohort statistics derived from the raw facts. This is the ONLY place
 * those numbers exist - runs.json stays raw. Since #25 the cohort's headline
 * is the REACH-RATE at the session's stage (the fraction of runs that
 * attained), with the depth statistics kept beside it: depth stays the
 * ladder's axis, reach-rate is the number.
 */
export function buildSummary(record: SessionRecord): string {
  const lines: string[] = [];
  const label = record.label;
  lines.push(`# ${label} - computed summary`);
  lines.push("");
  lines.push(
    "Computed from `runs.json` by the runner's reader layer; `runs.json` is the" +
      " raw per-run record and the authority for every number here.",
  );
  lines.push("");
  lines.push("## Runs");
  lines.push("");
  lines.push(
    "| run | race/class | decisions | turns | maxDepth | clvl | kills | gold | places | dead | attained | top command | cause of death |",
  );
  lines.push(
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
  );
  for (const run of record.runs) {
    lines.push(
      `| ${String(run.seed)}.${String(run.life)} | ${run.race} ${run.class} | ` +
        `${String(run.decisions)} | ${String(run.turns)} | ${String(run.maxDepth)} | ` +
        `${String(run.clvl)} | ${String(run.kills)} | ${String(run.gold)} | ` +
        `${String(run.places)} | ${run.dead ? "yes" : "no"} | ${run.stageAttained ? "yes" : "no"} | ${topCommand(run)} | ` +
        `${run.causeOfDeath ?? "-"} |`,
    );
  }
  lines.push("");
  lines.push("## Cohort");
  lines.push("");
  const depths = record.runs.map((r) => r.maxDepth);
  const deaths = record.runs.filter((r) => r.dead).length;
  const meanTurns =
    record.runs.length > 0
      ? record.runs.reduce((a, r) => a + r.turns, 0) / record.runs.length
      : 0;
  const meanDepth =
    depths.length > 0 ? depths.reduce((a, b) => a + b, 0) / depths.length : 0;
  const kills = record.runs.reduce((a, r) => a + r.kills, 0);
  lines.push(`- runs: ${String(record.runs.length)}`);
  lines.push(`- median maxDepth: ${String(median(depths))}`);
  lines.push(`- mean maxDepth: ${meanDepth.toFixed(2)}`);
  lines.push(`- ${String(deaths)} of ${String(record.runs.length)} runs died`);
  lines.push(`- mean turns: ${meanTurns.toFixed(0)}`);
  lines.push(`- kills: ${String(kills)}`);
  if (record.runner.stage !== null) {
    const attained = record.runs.filter((r) => r.stageAttained).length;
    const stage = record.runner.stage;
    lines.push(
      `- reach-rate (stage c${String(stage.clvl)}d${String(stage.depth)}): ` +
        `${String(attained)}/${String(record.runs.length)} runs attained ` +
        `(${(reachRate(record.runs.map((r) => r.stageAttained)) * 100).toFixed(1)}%)`,
    );
    const kept = record.runs.filter((r) => r.retired).length;
    lines.push(`- library: ${String(kept)} kept save${kept === 1 ? "" : "s"}`);
  }
  return `${lines.join("\n")}\n`;
}

/** Where writeSessionRecord put the files. */
export interface SessionRecordPaths {
  runsPath: string;
  summaryPath: string;
}

/**
 * Write a session record: runs.json + summary.md, into a fresh directory.
 * Refuses an existing directory - records are append-only, so overwriting a
 * completed session is never what a caller meant.
 */
export function writeSessionRecord(
  dir: string,
  record: SessionRecord,
): SessionRecordPaths {
  if (existsSync(dir)) {
    throw new Error(
      `refusing to write ${dir}: the directory already exists. Run records are ` +
        `append-only (docs/runs/README.md); choose a new label.`,
    );
  }
  mkdirSync(dir, { recursive: true });
  const runsPath = join(dir, "runs.json");
  const summaryPath = join(dir, "summary.md");
  writeFileSync(runsPath, `${JSON.stringify(buildRunsJson(record), null, 2)}\n`);
  writeFileSync(summaryPath, buildSummary(record));
  return { runsPath, summaryPath };
}
