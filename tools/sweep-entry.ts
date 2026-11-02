/**
 * The bake-off runner's entry point: what tools/sweep.mjs bundles and runs.
 *
 * WHY THIS FILE EXISTS. The session machinery lives in src/play-session.ts so
 * the vitest suite and the runner share ONE copy (the whole point of B02,
 * issue #3), but node cannot load the mod's TypeScript directly - its modules
 * address each other with `.js` specifiers the way tsc wants, and node's
 * type-stripping does not rewrite them. tools/sweep.mjs therefore bundles
 * THIS file with esbuild (an existing devDependency; the plugin builder uses
 * it the same way) into a self-contained ESM file and imports that. The
 * bundle pins the PUBLISHED engine from node_modules, which is the only one a
 * measurement is allowed to run on: no engine patching, no local-core alias -
 * patched-engine confirmation sweeps are a separate, labelled thing
 * (docs/runs/2026-11-02-door-close is the precedent).
 *
 * This entry is the runner's half of the two-caller contract: it binds the
 * engine the way the host does (bindCore, exactly what src/test-bind-core.ts
 * does for the suite), plays each seed's session through the shared module,
 * and hands the raw facts to the run-record writer. It adds no randomness and
 * reads no wall clock except the metadata the writer marks as such.
 */

import * as Core from "@rpgm-tools/neo-angband-core";
import { bindCore } from "../src/core-api.js";
import { loadPack, playSession } from "../src/play-session.js";
import {
  buildSummary,
  writeSessionRecord,
  type SessionBuild,
} from "../src/run-record.js";
import type { RunReport } from "../src/play-session.js";

/** Everything the shim collected on the way in. */
export interface SweepArgs {
  label: string;
  seeds: number[];
  lives: number;
  decisions: number;
  /** Absolute directory for this session's record (the shim checked it is fresh). */
  dir: string;
  /**
   * The content pack directory. The shim resolves it because this file runs
   * bundled: import.meta.url inside the bundle points at a temporary file, so
   * play-session.ts's own sibling-checkout lookup would miss. The suite's
   * lookup still works where it is; this is the runner's equivalent.
   */
  packDir: string;
  /** Build provenance the shim gathered (engine, commit, content). */
  build: SessionBuild;
  /** When the session ran (ISO timestamp; the record's metadata). */
  recorded: string;
}

/** What the runner did, for the shim to report. */
export interface SweepResult {
  dir: string;
  runsPath: string;
  summaryPath: string;
  /** The computed summary (also written to summary.md) for stdout. */
  summary: string;
  runs: RunReport[];
}

/**
 * Drive the cohort and write the session record. One pack load, one session
 * per seed, `lives` characters per session. Returns what the shim needs to
 * print; everything durable is already on disk under `args.dir`.
 */
export function runSweep(args: SweepArgs): SweepResult {
  /* The engine must be bound before the first Borg decision, exactly as the
   * plugin binds ctx.core and the vitest setup file binds for the suite. */
  bindCore(Core);

  const pack = loadPack(args.packDir);

  const runs: RunReport[] = [];
  for (const seed of args.seeds) {
    const session = playSession(Core, pack, {
      seed,
      decisions: args.decisions,
      lives: args.lives,
    });
    for (const run of session.runs) {
      /* Progress, one line per life: the cohort is minutes of compute, and a
       * number appearing per seed is how a wedged run gets noticed early. */
      const top = Object.entries(run.commands).sort((a, b) => b[1] - a[1])[0];
      console.log(
        `[sweep] seed ${String(seed)} life ${String(run.life)}: ` +
          `${String(run.decisions)} decisions, turns ${String(run.turns)}, ` +
          `maxDepth ${String(run.maxDepth)}, clvl ${String(run.clvl)}, ` +
          `kills ${String(run.kills)}, ${run.dead ? `died (${run.causeOfDeath ?? "?"})` : "alive"}, ` +
          `top command ${top ? `${top[0]} x${String(top[1])}` : "-"}`,
      );
      runs.push(run);
    }
  }

  const record = {
    label: args.label,
    runner: {
      tool: "tools/sweep.mjs",
      decisions: args.decisions,
      seeds: args.seeds,
      lives: args.lives,
    },
    build: args.build,
    recorded: args.recorded,
    runs,
  };
  const paths = writeSessionRecord(args.dir, record);
  return {
    dir: args.dir,
    runsPath: paths.runsPath,
    summaryPath: paths.summaryPath,
    summary: buildSummary(record),
    runs,
  };
}
