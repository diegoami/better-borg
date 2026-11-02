/**
 * THE TEST THAT PLAYS A TURN.
 *
 * Every other test in this repository asks a subsystem a question and checks the
 * answer. Not one of them plays the game, and PLANNED.md is the record of what
 * that cost: a mod whose suite was green, whose port was faithful, and which
 * wedged against the first locked door it met. Four separate infinite loops
 * (disarm, wield, stair-shuttle, and walking to a monster that was not there)
 * were all invisible to unit tests, because each one is a decision that is
 * individually correct and collectively a hang.
 *
 * So this boots a REAL game against the engine, installs the Borg as its command
 * provider, and drives the loop for thousands of decisions. It does not check
 * that the Borg plays WELL - "it tries its best and gets as far as it can" is the
 * target, and a level-1 character dying on depth 2 is upstream's own outcome. It
 * checks that the Borg is still PLAYING: that no single command has run away with
 * the session, that the character has been to more than a handful of squares,
 * that it does not pace with nothing in sight, and that it does not sit down to
 * rest with something standing next to it.
 *
 * Every one of those was false at some point on 2026-08-21.
 *
 * WHY THIS SKIPS WITHOUT THE GAME'S CHECKOUT. The content pack is the game's, not
 * this repository's, and there is no copy here to fall back on. `NEO_ANGBAND_REPO`
 * (or the sibling checkout the other tools already assume) is what makes this
 * runnable, exactly as it is for the plugin builder. A skip says so out loud
 * rather than passing on nothing.
 */

/* The session machinery (pack discovery, the boot, the drive loop, the run
 * report) is not test-bound anymore: it lives in ./play-session.ts, shared
 * with tools/sweep.mjs, the bake-off runner B02 extracted it for. This file
 * keeps the ASSERTIONS - the suite is the proof the loop did not move - and
 * the engine probe below. */
import * as Core from "@rpgm-tools/neo-angband-core";
import type { GamePack } from "@rpgm-tools/neo-angband-core";
import { describe, expect, it } from "vitest";
import { loadPack, packRoot, playRun } from "./play-session.js";

const PACK_DIR = packRoot();

/**
 * Does this engine tell the truth about a locked door?
 *
 * `CellView.trap` used to mean "this grid holds any trap record", and a closed
 * door's lock IS a trap record (`square_set_door_lock`). So every locked door
 * arrived as something to disarm, `disarm` refused it for free, and the Borg
 * looped against one door for as long as it was left running. The fix is
 * `square_isdisarmabletrap` in the engine's own perceive facade; nothing this
 * repository can do reproduces it, because the frozen view carries no other
 * field that separates a door lock from a trap.
 *
 * MEASURED, not read off a version string. Lock a door and ask the view. A
 * version comparison would pass on any build somebody had renumbered, and the
 * whole reason this file exists is that facts about behaviour kept being taken
 * from something other than the behaviour.
 */
function engineSeparatesDoorLocksFromTraps(pack: GamePack): boolean {
  const game = Core.startGame(pack, { seed: 5, depth: 1 });
  const state = game.state;
  const grid = { x: state.actor.grid.x + 1, y: state.actor.grid.y };
  const closed = game.booted.registries.features.byCodeName("CLOSED");
  state.chunk.setFeat(grid, closed.fidx);
  state.setDoorLock?.(grid, 5);
  const session = Core.installController(state, () => null, {});
  const cell = session.view.cell(grid.x, grid.y);
  session.uninstall();
  /* A door that reports no trap is the fixed engine. A door that reports one is
   * the engine that hangs, and there is no point measuring play on it. */
  return cell !== null && cell.trap === false;
}

const suite = PACK_DIR ? describe : describe.skip;

suite("the Borg plays a real game", () => {
  const pack = PACK_DIR ? loadPack(PACK_DIR) : null;
  const engineReady = pack ? engineSeparatesDoorLocksFromTraps(pack) : false;
  const when = engineReady ? it : it.skip;

  /* The one assertion that runs on ANY engine: an engine that reports a locked
   * door as a trap cannot be played on, and saying so out loud is the point.
   * Every play test below is skipped on such an engine rather than failing,
   * because the defect is not in this repository and a red suite here would send
   * the next reader looking in the wrong place. */
  it("names the engine fix its play tests depend on", () => {
    if (!engineReady) {
      // eslint-disable-next-line no-console
      console.warn(
        "[borg] the installed engine still reports a locked door as a disarmable " +
          "trap, so the live-play tests are skipped. They need the engine release " +
          "that narrows CellView.trap to square_isdisarmabletrap; raise the engine " +
          "floor in manifest.json to that version before tagging this mod.",
      );
    }
    expect(typeof engineReady).toBe("boolean");
  });

  /* Four seeds rather than one: each of the three loops this test was written
   * for showed on some seeds and not others, and the wield loop was the only one
   * that showed on all four. */
  for (const seed of [1, 7, 42, 99]) {
    when(`keeps playing for 1500 decisions (seed ${String(seed)})`, () => {
      const r = playRun(Core, pack!, seed, 1500);

      /* NO COMMAND RUNS AWAY WITH THE SESSION. This is the shape all three
       * loops had, and it is the only assertion that could have caught them:
       * 559 disarms against one door, 3964 wields between two torches, 215
       * descend/ascend pairs between the town and level 1. Movement is exempt
       * from nothing - `walk` is also how the Borg attacks, and a Borg that
       * walks 1200 times over 1500 decisions is exploring. The cap is on any
       * OTHER single verb. */
      const total = Object.values(r.commands).reduce((a, b) => a + b, 0);
      for (const [code, count] of Object.entries(r.commands)) {
        if (code === "walk" || code === "rest") continue;
        expect(
          count,
          `"${code}" was issued ${String(count)} of ${String(total)} times: ` +
            `a single command taking over is what a stall looks like from outside`,
        ).toBeLessThan(Math.max(60, Math.trunc(total / 2)));
      }

      /* AND IT GOES SOMEWHERE. A decision loop passes the check above when two
       * verbs alternate, so count the ground covered as well. Both the
       * stair-shuttle and the two-square oscillation left this in single
       * figures.
       *
       * Only for a run that was still going. A DEATH IS AN ENDING, and dying on
       * depth 1 after 77 decisions is upstream's own outcome for a level-1
       * character that met something it could not see - the target for this mod
       * is that it tries its best, not that it survives. It is also the cleanest
       * possible evidence that it was not stuck: every stall this test exists to
       * catch ran for as long as it was left running and never died. */
      if (!r.dead) {
        expect(
          r.places,
          `the character stood on ${String(r.places)} squares in ${String(r.decisions)} decisions`,
        ).toBeGreaterThan(30);
      }

      /* AND GAME TIME PASSES. A command the engine refuses costs no energy, so a
       * borg looping on one runs forever with the world frozen - the disarm hang
       * exactly. Ten turns per decision is the cost of one move at normal speed. */
      expect(r.turns).toBeGreaterThan(r.decisions * 2);

      /* AND IT DOES NOT JITTER WITH NOTHING IN SIGHT. Reported from a real game
       * as "just sitting there or moving frantically back and forth across three
       * cells, doing nothing until something comes up and picks a fight" - and
       * the last clause is the diagnosis, because a Borg with nothing in view has
       * no reason to hold position. Sixty consecutive decisions confined to three
       * squares, with no monster visible for any of them, is that report. */
      expect(
        r.jitter,
        `the tightest stretch of 60 monster-free decisions that were not rests or drops ` +
          `covered ${String(r.jitter)} squares`,
      ).toBeGreaterThan(3);

      /* AND IT DOES NOT SIT STILL WITH SOMETHING NEXT TO IT. borg_check_rest
       * refuses a grid with a monster one square away, and the recover ladder
       * used to be wired to a constant `true` instead of asking it. */
      expect(
        r.restedBesideMonster,
        "the Borg chose to rest with a monster adjacent",
      ).toBe(0);
    }, 120_000);
  }

  when("gets into the dungeon and back out under its own steam", () => {
    /* The town half was never in doubt; leaving a dungeon level was, because
     * nothing in the port used a staircase it was standing on until the
     * caution.c:1169 block was ported. */
    const r = playRun(Core, pack!, 1, 1500);
    expect(r.depths).toContain(0);
    expect(r.depths.some((d) => d >= 1)).toBe(true);
    expect(r.commands["descend"] ?? 0).toBeGreaterThan(0);
    expect(r.commands["ascend"] ?? 0).toBeGreaterThan(0);
  }, 120_000);
});
