/**
 * THE REPLAY-EXACTNESS TEST (#29, rule 5's teeth): a committed record's
 * dead run, replayed, must reproduce the recorded death line EXACTLY.
 *
 * The determinism contract is only a contract if something fails when it
 * breaks. This test replays the CURRENT baseline's dead run (see RECORD_DIR
 * below; the lifecycle paragraph says how it moves) from the record's own
 * facts: same seed, same planned birth, the same observing
 * controller, the same drive. It asserts:
 *
 *   - the replayed death line equals the record's: cause, turn, decisions,
 *     and the WHOLE command census (the census/turn stamps match the record);
 *   - every rung of the ladder captured a dossier at a boundary at or after
 *     its target turn and before the death;
 *   - the dossier text carries the rung's facts and names the human-path
 *     settings.
 *
 * A change to the decision code, the engine pin, or the content pack that
 * moves ANY recorded decision lands here as a red exactness - which is the
 * point: the record, the replay and the dossier ladder stay one story.
 * That is also this test's lifecycle: the record it points at is the
 * CURRENT baseline, and a deliberate behaviour change retires the previous
 * one (byte-immutable, rule 8) and re-points these constants - B32 did
 * exactly that (the caution/attack fix moved seed 34 from a grey-mold
 * death to a stage retirement and seed 20 to a later, different death, so
 * the exactness rider moved from 2026-11-03-stage-baseline-c2d1's seed 34
 * to that record's seed 20). B40 did it again: carrying our engine fixes
 * (#429 noteSpot) saved seed 20, and the c2d1 cohort has no death left, so
 * the rider moved to 2026-11-03-b40-long-seed34 (seed 34, no stage, the
 * life #35 could not record, dying to a crow). B69 restores the attack
 * scan and moves the rider to the class-grid Mage seed-3 death; the
 * previous 60000-cap replay no longer completes promptly (120s deadline).
 * Seed 73, used by the chain tests, dies across all default rung targets
 * in one decision, so it cannot prove that live dossier boundaries exist.
 *
 * Skips out loud without the game's checkout (the content pack is the
 * game's), exactly as the play suite does. Each driving test carries the
 * play suite's explicit timeout (120s, play.test.ts's discipline): a whole
 * life replays in seconds but not in vitest's 5s default, and the exactness
 * assertion is only worth anything if the replay is actually waited for.
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import * as Core from "@rpgm-tools/neo-angband-core";
import { loadPack, packRoot } from "../play-session.js";
import { packForClass } from "../class/registry.js";
import { DEFAULT_OFFSETS, replayDeadRun, type DeadRunFacts } from "./replay.js";
import type { DossierHeader } from "./dossier.js";
import type { BirthReplayData } from "../records/birth-replay.js";

const PACK_DIR = packRoot();
const suite = PACK_DIR ? describe : describe.skip;

/** B99's upgraded desktop death fixture; B54 remains byte-immutable for its code. */
const RECORD_DIR = "docs/runs/2026-11-05-b99-desktop-death-replay";
const SEED = 99110530;
const REPLAY_PACK = packForClass("Mage");

interface RecordedRun extends BirthReplayData {
  readonly seed: number;
  readonly life: number;
  readonly race: string;
  readonly baseStats: number[];
  readonly decisions: number;
  readonly turns: number;
  readonly maxDepth: number;
  readonly clvl: number;
  readonly dead: boolean;
  readonly causeOfDeath: string | null;
  readonly commands: Record<string, number>;
}

function recordedRun(): { run: RecordedRun; header: { label: string; recorded: string; stage: { clvl: number; depth: number } | null; cap: number; build: DossierHeader["build"] } } {
  const file = new URL(`../../${RECORD_DIR}/runs.json`, import.meta.url);
  const document = JSON.parse(readFileSync(file, "utf8")) as {
    label: string;
    recorded: string;
    runner: { decisions: number; stage: { clvl: number; depth: number } | null };
    build: { engine: string; content: string | null; borg: string };
    runs: RecordedRun[];
  };
  const run = document.runs.find((r) => r.seed === SEED && r.dead);
  if (run === undefined) throw new Error(`${RECORD_DIR}/runs.json carries no dead run for seed ${String(SEED)}`);
  return {
    run,
    header: {
      label: document.label,
      recorded: document.recorded,
      stage: document.runner.stage,
      cap: document.runner.decisions,
      build: { engine: document.build.engine, content: document.build.content, borg: document.build.borg, cap: document.runner.decisions },
    },
  };
}

function factsOf(run: RecordedRun, cap: number, stage: { clvl: number; depth: number } | null): DeadRunFacts {
  return {
    seed: run.seed,
    ...(run.birthRngState === undefined ? {} : { birthRngState: run.birthRngState }),
    ...(run.birthOptions === undefined ? {} : { birthOptions: run.birthOptions }),
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
    cap,
  };
}

suite("the death replay (#29)", () => {
  const pack = PACK_DIR ? loadPack(PACK_DIR) : null;

  it(`reproduces the desktop's recorded death line exactly (seed ${String(SEED)}, the yellow mold)`, async () => {
    const { run, header } = recordedRun();
    const replay = await replayDeadRun(
      Core,
      pack!,
      REPLAY_PACK,
      factsOf(run, header.cap, header.stage),
      { label: header.label, directory: RECORD_DIR, recorded: header.recorded },
      header.build,
    );

    /* THE EXACTNESS: the replayed death is the recorded death - cause,
     * turn, decision count, the whole census. Any of these moving is a
     * determinism break or a changed decision, and this is where it goes
     * red rather than into a quietly wrong dossier. */
    expect(replay.verification.exact, replay.verification.differences.join("; ")).toBe(true);
    expect(replay.verification.replayed.cause).toBe(run.causeOfDeath);
    expect(replay.verification.replayed.turn).toBe(run.turns);
    expect(replay.verification.replayed.decisions).toBe(run.decisions);
    expect(replay.verification.replayed.commands).toEqual(run.commands);
    /* Every rung is accounted for: captured or MISSED. A rung is missed
     * when a single decision crosses the rung's target whole - there was
     * never a live moment at T-N to capture, and a post-mortem snapshot is
     * not a release point. That is the honest set semantics, and the ladder
     * README names it (`none`). NON-VACUITY: the widest rung must capture
     * on this record (its target sits 20 turns before a death whose
     * decisions spend a handful of turns each, so a live boundary exists at
     * it) - an empty rungs list here would mean the visit hook never
     * fired. */
    expect(replay.rungs.length + replay.missed.length).toBe([...DEFAULT_OFFSETS].length);
    expect(replay.rungs.length).toBeGreaterThan(0);
    expect(replay.rungs.map((r) => r.offset)).toContain(20);
  }, 300_000);

  it("captures the ladder's rungs at boundaries after their targets and before the death", async () => {
    const { run, header } = recordedRun();
    const replay = await replayDeadRun(
      Core,
      pack!,
      REPLAY_PACK,
      factsOf(run, header.cap, header.stage),
      { label: header.label, directory: RECORD_DIR, recorded: header.recorded },
      header.build,
    );

    /* Non-vacuous: the captured rungs ARE the default ladder minus the
     * missed (as a SET - rungs arrive in target-turn order, the ladder is
     * sorted by offset), every captured boundary sits in [target, death),
     * and every miss names why. */
    const captured = [...DEFAULT_OFFSETS].filter((offset) => !replay.missed.some((m) => m.offset === offset));
    expect([...replay.rungs.map((r) => r.offset)].sort((a, b) => a - b)).toEqual([...captured].sort((a, b) => a - b));
    expect(replay.rungs.length).toBeGreaterThan(0);
    for (const rung of replay.rungs) {
      expect(rung.targetTurn).toBe(run.turns - rung.offset);
      expect(rung.boundaryTurn).toBeGreaterThanOrEqual(rung.targetTurn);
      expect(rung.boundaryTurn).toBeLessThan(run.turns);
    }
    for (const miss of replay.missed) {
      expect(miss.targetTurn).toBe(run.turns - miss.offset);
      expect(miss.why).toContain("before turn");
    }
  }, 300_000);

  it("renders each dossier with the rung's facts and the human-path settings", async () => {
    const { run, header } = recordedRun();
    const replay = await replayDeadRun(
      Core,
      pack!,
      REPLAY_PACK,
      factsOf(run, header.cap, header.stage),
      { label: header.label, directory: RECORD_DIR, recorded: header.recorded },
      header.build,
    );

    /* Non-vacuous: at least the widest rung's dossier exists on this
     * record (asserted in the exactness case), so this loop always runs. */
    expect(replay.rungs.length).toBeGreaterThan(0);
    for (const rung of replay.rungs) {
      const text = rung.dossier;
      expect(text).toContain(`# Death dossier - seed ${String(SEED)}, ${String(rung.offset)} turns before the death`);
      expect(text).toContain(`recorded death: turn ${String(run.turns)}, to "${run.causeOfDeath}"`);
      expect(text).toContain(`release boundary: turn ${String(rung.boundaryTurn)}`);
      expect(text).toContain("replay verification: EXACT");
      expect(text).toContain(`borg.replayReleaseTurn = ${String(rung.boundaryTurn)}`);
      expect(text).toContain(`borg.replayDeathTurn = ${String(run.turns)}`);
      /* Every section the issue's spec names is present, empty or not:
       * screen, messages, pack, equipment, HOME, decisions, census. */
      expect(text).toContain("## The screen");
      expect(text).toContain("## Message log");
      expect(text).toContain("## The pack");
      expect(text).toContain("## Worn equipment");
      expect(text).toContain("## The home");
      expect(text).toContain("## Recent decisions");
      expect(text).toContain("## Command census");
      expect(text).toContain("## Provenance");
    }
  }, 300_000);

  it("refuses a record whose planned birth it cannot reproduce (the plan check)", async () => {
    const { run, header } = recordedRun();
    const wrong = { ...factsOf(run, header.cap, header.stage), baseStats: [17, 10, 10, 10, 17] };
    await expect(
      replayDeadRun(
        Core,
        pack!,
        REPLAY_PACK,
        wrong,
        { label: header.label, directory: RECORD_DIR, recorded: header.recorded },
        header.build,
      ),
    ).rejects.toThrow(/the replay would not be of the recorded character/u);
  });

  it("reports a divergence honestly instead of dressing it as exact", async () => {
    /* A death-turn lie in the record facts: the replay still runs, still
     * dies the same real death, and the verification must NAME the
     * differences rather than paper over them - a dossier that quietly
     * pretended to be the recorded run would be the worst kind of
     * evidence. */
    const { run, header } = recordedRun();
    const wrongTurn = { ...factsOf(run, header.cap, header.stage), deathTurn: run.turns + 3, cause: "something else" };
    const replay = await replayDeadRun(
      Core,
      pack!,
      REPLAY_PACK,
      wrongTurn,
      { label: header.label, directory: RECORD_DIR, recorded: header.recorded },
      header.build,
    );
    expect(replay.verification.exact).toBe(false);
    expect(replay.verification.differences.join("; ")).toContain("cause:");
    expect(replay.verification.differences.join("; ")).toContain("turn:");
    /* Every dossier the shifted facts still produced says DIVERGED at the
     * top of its rung section (a rung the death crossed whole is `missed`,
     * and that is honest too). */
    for (const rung of replay.rungs) {
      expect(rung.dossier).toContain("replay verification: DIVERGED");
    }
    expect(replay.rungs.length + replay.missed.length).toBe([...DEFAULT_OFFSETS].length);
  }, 300_000);
});
