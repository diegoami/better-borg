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
 * that the Borg plays WELL - "it tries its best and gets as far as it can" is
 * the target, and a level-1 character dying on depth 2 is upstream's own outcome. It
 * checks that the Borg is still PLAYING: that no single command has run away with
 * the session, that the character has been to more than a handful of squares,
 * that it does not pace with nothing in sight, and that it does not sit down to
 * rest with something standing next to it.
 *
 * Every one of those was false at some point on 2026-08-21.
 *
 * WHERE THE CONTENT PACK COMES FROM (#46). The pack is the game's, not this
 * repository's: packRoot() takes `NEO_ANGBAND_REPO`, then the published
 * @rpgm-tools/neo-angband-content devDependency, then a sibling checkout.
 * Without any of them the suite skips and says so out loud locally; in CI the
 * package is always installed, so there a missing pack fails instead.
 *
 * The session machinery (pack discovery, the boot, the drive loop, the run
 * report) is not test-bound anymore: it lives in ./play-session.ts, shared
 * with tools/sweep.mjs and tools/runs.mjs - ONE session module, TWO drivers.
 * This file keeps the ASSERTIONS - the suite is the proof the loop did not
 * move - and the engine probe below.
 *
 * The second half (ported from neowarrior-borg's own play.test.ts at v0.1.0
 * e1ec1b7, its T04/T06 suites) drives the PACK side of the same module: the
 * restart chain's BUILD assertion (every boot is the active pack's plan, read
 * from the live player), and the recorded session (journal milestones,
 * graveyard archive, and the ONE record writer's runs.json over the pack
 * session's lives).
 */

import { describe, expect, it } from "vitest";
import * as Core from "@rpgm-tools/neo-angband-core";
import { ContentIdResolver, LOOP_STATUS, installController, runGameLoop, startGame } from "@rpgm-tools/neo-angband-core";
import type { GamePack, GameState, StartedGame } from "@rpgm-tools/neo-angband-core";
import { createBorg } from "./controller.js";
import { makeCoreResolvers } from "./resolvers.js";
import { loadPack, packRoot, playRun, playPackSession } from "./play-session.js";
import { RUNS_SCHEMA_ID, buildRunsJson, type SessionRecord } from "./run-record.js";
import { WARRIOR_CLASS_NAME, type WarriorBuildPlan } from "./class/warrior/plan.js";
import { planWarriorFor, warriorPack } from "./class/warrior/index.js";
import { WARRIOR_RACE_CANDIDATES } from "./class/warrior/settings.js";
import { packForClass } from "./class/registry.js";
import { CLASS_ROSTER } from "./birth/pools.js";

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

/* #46: CI ran green for weeks with this whole suite skipped. The pack is a
 * devDependency now, so in CI a missing one is a broken install - fail. */
it.runIf(process.env["CI"])("finds the content pack in CI", () => {
  expect(PACK_DIR).not.toBeNull();
});

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
    /* #46: in CI the pinned engine is the one we play; a skip there is a red. */
    if (process.env["CI"]) expect(engineReady).toBe(true);
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

      /* AND THE COUNT AGREES WITH THE CENSUS. The unified session's one
       * counting rule (#36, adopted at the unification): every issued command
       * is a completed decision, death's killing decision included. The driver
       * enforces the equality and throws; this is the outside check over what
       * it reported - B02's committed record predates the rule and its one
       * dying run is short by one, which is why the rule is asserted here. */
      const issued = Object.values(r.commands).reduce((a, b) => a + b, 0);
      expect(issued, `seed ${String(seed)}: census vs decisions`).toBe(r.decisions);
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

/* ==================================================================
 * THE PACK RESTART CHAIN, HEADLESS (ported from neowarrior-borg's T04
 * suite; the build assert is the per-pack one)
 * ==================================================================
 *
 * The mod's loop runs through host seams this harness does not have - no web
 * shell, no page to reload, no roster - so the loop is APPROXIMATED the way
 * the archived fork's T04 task specified: when a character dies, the next one
 * is booted by the same plan (the pack's planFor) the presenter replays, with
 * startGame({ roller: "point", birthStats }) standing in for
 * saves.create({ resumeAutoplayer: true }) + the presenter + the reload.
 * What that keeps faithful is the part the task cares about: the BUILD is
 * the presenter's build (one plan module, both callers), and every assertion
 * about it is made against the LIVE player the engine just birthed, never
 * against our own bookkeeping.
 *
 * WHY statBirth IS THE PINNED FIELD. generatePlayer threads the point-buy
 * through reset_stats + buy_stat and stores the result as the natural stats
 * BEFORE race and class adjustments are folded in (packages/core/src/player/
 * birth.ts: statMax = statCur = statBirth = the buy), which is exactly the
 * plan's baseStats semantics. statBirth is that array FROZEN AT BIRTH: play
 * moves statCur (drains, restoration) and statMax (gain potions, drains),
 * but nothing in play rewrites statBirth, so a level-5 warrior who found
 * three gain-strength potions still shows the allocation it was born with.
 * Asserting it at the first moment after startGame - before a single
 * decision - pins the birth itself rather than anything a level-up could
 * confound; asserting it after a whole life would still be true, which is
 * the point of choosing it.
 */
suite("the pack restart chain, headless", () => {
  const pack = PACK_DIR ? loadPack(PACK_DIR) : null;
  const engineReady = pack ? engineSeparatesDoorLocksFromTraps(pack) : false;
  const when = engineReady ? it : it.skip;

  /**
   * The harness's own EXPLICIT race. It never goes through the race
   * settings (src/class/warrior/settings.ts): the harness hands startGame the
   * plan directly, so it names its race here - candidate 0 of the same
   * shortlist the settings index (Half-Troll, the import baseline's race,
   * kept for comparability with the committed run records). The default draw
   * is not involved: the harness measures explicit races, the mod's births
   * draw.
   */
  const WARRIOR_RACE = WARRIOR_RACE_CANDIDATES[0];

  /**
   * The plan the presenter replays, computed exactly as the pack wires it:
   * the same module (planWarriorFor is the pack's planFor), the published
   * engine's own cost table and point budget, this explicit race. This is
   * the ONE plan every caller shares; a disagreement between the harness's
   * warrior and the presenter's is a bug in one of them, not a choice each
   * makes.
   */
  function warriorBuildPlan(): WarriorBuildPlan {
    return planWarriorFor(Core, pack!, WARRIOR_RACE);
  }

  /** What one character's life shows, in the terms the loop cares about. */
  interface PackLife {
    readonly seed: number;
    /** Whether the character died (the event that boots the next one). */
    readonly dead: boolean;
    readonly decisions: number;
    readonly turns: number;
    /** The deepest dungeon level the LIVE player says it reached. */
    readonly deepest: number;
    /** The cause of death, as the player's own died_from carries it. */
    readonly cause: string | null;
  }

  /**
   * Boot one planned warrior and assert its build FROM THE LIVE PLAYER, at
   * the first moment the player exists - before a single decision, so no
   * level-up or drain can confound the check. This is the whole "the loop
   * rebirths the SAME character" claim - the per-pack birth assert: if the
   * engine birthed anything else, these three expectations fail on that
   * character, not on an aggregate.
   */
  function bootPlannedWarrior(seed: number, plan: WarriorBuildPlan): StartedGame {
    const game = startGame(pack!, {
      seed,
      depth: 0,
      raceName: plan.raceName,
      className: WARRIOR_CLASS_NAME,
      roller: "point",
      birthStats: [...plan.baseStats],
    });
    const born = game.state.actor.player;
    expect(born.race.name, `warrior on seed ${String(seed)} was born the wrong race`).toBe(plan.raceName);
    expect(born.cls.name, `warrior on seed ${String(seed)} was born the wrong class`).toBe(WARRIOR_CLASS_NAME);
    expect(
      [...born.statBirth],
      `warrior on seed ${String(seed)} was born with stats it was not planned with`,
    ).toEqual([...plan.baseStats]);
    return game;
  }

  /** One warrior: boot (asserted), play to its death or the decision cap. */
  function playWarriorLife(seed: number, plan: WarriorBuildPlan, decisions: number): PackLife {
    const game = bootPlannedWarrior(seed, plan);
    const state: GameState = game.state;
    const resolver = new ContentIdResolver({
      objects: game.booted.registries.objects,
      playerRaces: game.players.races,
      playerClasses: game.players.classes,
    });
    const borg = createBorg({
      /* The Borg's private stream, varied with the game seed exactly as
       * playRun varies it: the chain of warriors must not share one draw
       * sequence either. */
      rngSeed: (seed * 2654435761) >>> 0 || 1,
      resolvers: makeCoreResolvers({
        races: game.booted.registries.monsters.races,
        objects: game.booted.registries.objects,
        state: state as never,
        blowMethods: game.booted.registries.monsters.blowMethods.values(),
      }),
    });

    /* The latch, as in playRun: runGameLoop asks nextCommand for as long as
     * the player has energy, so a controller that always answers never lets
     * the loop return. */
    let armed = false;
    installController(
      state,
      (view, act) => {
        if (!armed) return null;
        armed = false;
        return borg.controller(view, act);
      },
      { viewDeps: { resolver, reg: game.booted.registries.objects } },
    );

    let dead = false;
    let taken = 0;
    for (; taken < decisions; ) {
      armed = true;
      const status = runGameLoop(state, game.registry);
      taken += 1;
      if (status === LOOP_STATUS.DEAD) {
        dead = true;
        break;
      }
      if (status === LOOP_STATUS.DEATH_CONFIRM) {
        state.pendingDeath?.resolve(true);
        continue;
      }
      if (status === LOOP_STATUS.LEVEL_CHANGE) {
        game.changeLevel(state.targetDepth ?? state.chunk.depth + 1);
        state.generateLevel = false;
      }
    }

    return {
      seed,
      dead,
      decisions: taken,
      turns: state.turn,
      deepest: state.actor.player.maxDepth,
      cause: dead ? state.actor.player.diedFrom : null,
    };
  }

  /**
   * Run the loop's chain over `seeds`, the way the loop itself sequences:
   * the next character boots ONLY behind an explicit assertion that its
   * predecessor DIED (the archived #31 - three deaths anywhere among four
   * lives do not prove a chain; an interior survivor splits it into two
   * shorter chains, and the real loop, which sequences on LOOP_STATUS.DEAD,
   * would simply never have booted the next one). Every boot asserts the
   * planned build from the live player inside bootPlannedWarrior.
   */
  function chainPlannedWarriors(plan: WarriorBuildPlan, seeds: readonly number[], capFor: (seed: number) => number): PackLife[] {
    const lives: PackLife[] = [];
    for (const seed of seeds) {
      const previous = lives[lives.length - 1];
      if (previous !== undefined) {
        expect(
          previous.dead,
          `warrior on seed ${String(previous.seed)} was still alive after its session slice, ` +
            `so the restart loop would never have booted seed ${String(seed)}`,
        ).toBe(true);
      }
      lives.push(playWarriorLife(seed, plan, capFor(seed)));
    }
    return lives;
  }

  when("boots the next warrior behind a death and stops behind a survivor (the loop's chain rule)", async () => {
    const plan = warriorBuildPlan();
    /* The plan is what the pack's walk makes of the stock table: STR 18, CON
     * 17, the rest at base, no points left - asserted here rather than
     * assumed, because the session's meaning depends on it. */
    expect(plan.raceName).toBe(WARRIOR_RACE);
    expect(plan.baseStats).toEqual([18, 10, 10, 10, 17]);
    expect(plan.pointsLeft).toBe(0);

    /* The shared session driver must boot after a death and stop after a
     * survivor. B69's working attack scan saves the former death seed 14.
     * tools/runs.mjs at cap 600 found seed 73 dies to grey mold at decision
     * 420, while seed 1 survives: docs/runs/2026-11-04-b69-chain-cap600/.
     * The unused successors prove that survival stops the chain. */
    const session = await playPackSession(Core, pack!, warriorPack, {
      seeds: [73, 1, 34, 49],
      capFor: () => 600,
    });
    expect(session.lives).toHaveLength(2);
    expect(session.lives[0]!.seed).toBe(73);
    expect(session.lives[0]!.dead, "seed 73's death is what booted seed 1").toBe(true);
    expect(session.lives[1]!.seed).toBe(1);
    expect(session.lives[1]!.dead, "seed 1 survived its slice, so no third boot").toBe(false);
    /* The census the harness counted balances the decisions on every life,
     * ended or not (#36's rule). */
    for (const life of session.lives) {
      const issued = Object.values(life.commands).reduce((a, b) => a + b, 0);
      expect(issued, `seed ${String(life.seed)}: census vs decisions`).toBe(life.decisions);
    }
  }, 300_000);

  when("refuses to boot the next warrior behind one that survived its slice", () => {
    /* The archived #31's guard, proven on the reviewer's probe shape: a
     * middle life capped to a single decision survives, the chain's death
     * gate must refuse to boot its successor, and the session must fail
     * rather than count the other lives' deaths into a chain that was
     * broken. Seed 73 plays its full short life before seed 1
     * survives, so the survivor really is interior (B69 cap-600 record). */
    const plan = warriorBuildPlan();
    expect(() => chainPlannedWarriors(plan, [73, 1, 34], (seed) => (seed === 1 ? 1 : 600))).toThrow(
      /seed 1 was still alive after its session slice/u,
    );
  }, 300_000);

  when("births the planned warrior on every seed it is asked to", () => {
    /* The chain above pins four seeds; this sweeps a wider set cheaply
     * (boot-and-assert only, no play), so a pack or engine change that
     * quietly broke the birth - a renamed race, a moved table - fails on
     * many seeds at once instead of on whichever four the session uses. */
    const plan = warriorBuildPlan();
    for (const seed of [1, 7, 13, 42, 77, 99]) {
      bootPlannedWarrior(seed, plan);
    }
  }, 60_000);

  /* ------------------------------------------------------------------
   * The recorded session (the archived T06): journal depths, the
   * graveyard, and the ONE record writer's runs.json
   * ------------------------------------------------------------------ */
  when("records its session: journal depths, the graveyard, and the writer's runs.json", async () => {
    /* THE SESSION, through the same driver (src/play-session.ts's pack half)
     * whose output gets committed to docs/runs/ by tools/runs.mjs: the mod's
     * own journal installed per character, fed by the engine's real
     * `dungeonlevel` arrivals, its graveyard entry awaited before the next
     * character boots - the loop's journal-before-create ordering - and the
     * ONE record writer turning the lives into the runs.json schema
     * (better-borg/runs@1). B69 saves the former opening death seed 14.
     * The cap-600 record pins seed 73's death and seed 1's surviving slice,
     * so this session exercises both an archive and a rebirth. */
    const seeds = [73, 1, 34];
    const session = await playPackSession(Core, pack!, warriorPack, { seeds, capFor: () => 600 });

    /* AT LEAST ONE DEATH AND ONE REBIRTH, which is this test's requirement
     * (the chain test above pins death followed by survival on these
     * seeds): the first character died, and its death is what booted the
     * second one - the driver boots only behind a death, so a second life
     * IS the rebirth. A character that survives its slice ends the session,
     * and its life still gets every record assertion below. */
    expect(session.lives.length).toBeGreaterThanOrEqual(2);
    expect(session.lives[0]!.dead, "the session's first character had to die for the next one to boot").toBe(true);
    expect(session.lives.filter((life) => life.dead).length).toBeGreaterThanOrEqual(1);

    for (const life of session.lives) {
      const journal = life.journal;
      expect(journal, `seed ${String(life.seed)} left no journal in its character's save`).not.toBeNull();

      /* THE DEPTHS ACTUALLY VISITED, read from the live game (the harness
       * observed state.chunk.depth after every decision), not from the
       * journal's own claims: the sets match, and no depth is doubled - the
       * load re-fires the driver delivered for every visited depth happened
       * BEFORE this read, so a dedup failure would show as a length gap. */
      const depths = journal!.milestones.map((m) => m.depth);
      expect(new Set(depths), `seed ${String(life.seed)}: journal depths vs the game's`).toEqual(new Set(life.depthsVisited));
      expect(depths, `seed ${String(life.seed)}: a depth was recorded twice`).toHaveLength(new Set(depths).size);
      /* The game's own deepest record agrees with both views of the run. */
      expect(life.maxDepth).toBe(Math.max(...life.depthsVisited));

      /* The stamps are the live game at the arrival, captured by the
       * harness's own listener - the (level, turn) the character had when
       * it arrived, not when anyone got around to asking. */
      for (const milestone of journal!.milestones) {
        expect({ level: milestone.level, turn: milestone.turn }).toEqual(life.arrivalStamps.get(milestone.depth));
      }

      /* THE GRAVEYARD (the archived #34): one archived entry per DEAD
       * character, read from the INSTALL archive the driver's journal
       * writes into - the storage that survives the character - never from
       * the character's own bag, which the host deletes at the death. A
       * survivor archives no entry: no run ended. */
      if (life.dead) {
        expect(life.graveyard).toHaveLength(1);
        expect(life.graveyard[0]).toMatchObject({
          outcome: "death",
          cause: life.causeOfDeath,
          name: expect.any(String),
          race: life.race,
          class: life.className,
          baseStats: [...life.baseStats],
          maxDepth: life.maxDepth,
          level: life.clvl,
          gold: life.gold,
          turn: life.turns,
          score: expect.any(Number),
        });
      } else {
        expect(life.graveyard).toEqual([]);
      }

      /* THE CENSUS AGAINST THE COUNT, asserted independently of the
       * driver's own enforcement: the harness counts commands as the
       * controller issues them, and the killing decision is a decision like
       * any other - sum(commands) === decisions on every recorded run,
       * death or survival. */
      const issued = Object.values(life.commands).reduce((a, b) => a + b, 0);
      expect(issued, `seed ${String(life.seed)}: census vs decisions`).toBe(life.decisions);
    }

    /* The archived #34's REQUIRED READ, after every character's bag is
     * gone: the session-wide install archive still retrieves EVERY ended
     * run - each life's character slot was discarded when the next
     * character booted, which is the harness's stand-in for the host
     * deleting the dead character's save. */
    const ended = session.lives.filter((life) => life.dead);
    expect(ended.length).toBeGreaterThanOrEqual(1);
    expect(session.graveyard).toHaveLength(ended.length);
    for (const life of ended) {
      const match = session.graveyard.find((entry) => entry.outcome === "death" && entry.cause === life.causeOfDeath && entry.turn === life.turns);
      expect(match, `the ended run of seed ${String(life.seed)} is no longer retrievable from install storage`).toBeDefined();
    }

    /* THE ONE WRITER's runs.json, FIELD BY FIELD against the lives (each of
     * which was read from the live game above) - never a snapshot of the
     * writer's own output. This is the same mapping tools/runs.mjs makes. */
    const record: SessionRecord = {
      label: "t06-port-verify",
      runner: { tool: "tools/runs.mjs", decisions: 600, seeds, lives: session.lives.length, stage: null },
      build: {
        commit: null,
        engine: "@rpgm-tools/neo-angband-core 1.23.0-beta.1",
        content: PACK_DIR!,
        borg: "warrior pack (stock parameters)",
      },
      recorded: "2026-11-03T00:00:00.000Z",
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
    const document = buildRunsJson(record);
    expect(document.schema).toBe(RUNS_SCHEMA_ID);
    expect(document.runner.seeds).toEqual(seeds);
    expect(document.build.borg).toContain("warrior pack");
    for (const [index, life] of session.lives.entries()) {
      const entry = document.runs[index]!;
      expect(entry, `runs.json entry for seed ${String(life.seed)}`).toMatchObject({
        seed: life.seed,
        race: life.race,
        class: life.className,
        baseStats: [...life.baseStats],
        decisions: life.decisions,
        turns: life.turns,
        maxDepth: life.maxDepth,
        clvl: life.clvl,
        gold: life.gold,
        kills: life.kills,
        dead: life.dead,
        causeOfDeath: life.causeOfDeath,
        commands: life.commands,
        /* #27: the uncertainty journal the observing controller collected
         * flows into the record beside the census, totals agreeing. */
        unsure: { total: life.unsure.total, points: [...life.unsure.points] },
      });
      /* Kills come from the game's own lore counters (per-race pkills,
       * summed - the number the character dump prints): a count, never a
       * guess, and never negative. */
      expect(Number.isInteger(life.kills)).toBe(true);
      expect(life.kills).toBeGreaterThanOrEqual(0);
    }
    /* The census the harness counted and the census the writer wrote are
     * the same table: every issued command code appears, with its count. */
    const census = session.lives.map((life) => Object.values(life.commands).reduce((a, b) => a + b, 0));
    expect(census.every((count) => count > 0)).toBe(true);
  }, 300_000);

  /* ------------------------------------------------------------------
   * #25 - the stage-grind: attainment ends a life into the LIBRARY,
   * and the #36 counting rule holds on a retiring run
   * ------------------------------------------------------------------ */

  when("retires a life that attains its stage into the library, and boots the next seed behind it", async () => {
    /* THE RAIL'S SESSION SHAPE: the stage is the calibrated default's
     * bracket rung (character level 1, first arrival at depth 1) - a rung
     * every one of the pinned seeds reaches on its way down, so each life
     * attains DURING play and stops there: kept (a library slot named with
     * the seed), not dead, well under the cap, and the session chains to
     * the next seed behind the retirement exactly as it chains behind a
     * death. */
    const seeds = [20, 23];
    const session = await playPackSession(Core, pack!, warriorPack, {
      seeds,
      capFor: () => 600,
      stage: { clvl: 1, depth: 1 },
    });

    expect(session.lives).toHaveLength(2);
    for (const life of session.lives) {
      expect(life.stageAttained, `seed ${String(life.seed)} attained the stage`).toBe(true);
      expect(life.retired, `seed ${String(life.seed)} was retired into the library`).toBe(true);
      expect(life.dead).toBe(false); /* a retirement is not a death */
      expect(life.causeOfDeath).toBeNull();
      expect(life.decisions, `seed ${String(life.seed)} stopped at attainment`).toBeLessThan(600);
      /* THE #36 RULE ON A RETIRING RUN: attainment is observed after the
       * decision completes (exactly as death is), so the census the
       * controller issued balances the decisions the driver counted. */
      const issued = Object.values(life.commands).reduce((a, b) => a + b, 0);
      expect(issued, `seed ${String(life.seed)}: census vs decisions on a retiring run`).toBe(life.decisions);
    }

    /* THE LIBRARY: one kept slot per retired run, named with the seed -
     * the name the ladder (#26) maps its per-seed cohorts by. */
    expect(session.library).toEqual([
      { name: "M s20 c1d1", seed: 20 },
      { name: "M s23 c1d1", seed: 23 },
    ]);
  }, 300_000);

  when("plays a stage it cannot attain exactly as it played without one", async () => {
    /* The unattained stage is observationally neutral - proven here as the
     * DIRECT byte-compare the name always claimed. REBASED AT B32: this
     * test once pinned seed 34's grey-mold death (45 decisions, the T06
     * record's numbers) as its neutrality evidence; the caution/attack fix
     * removed that death (seed 34 now survives its slice - the unit case of
     * docs/runs/2026-11-03-b32-stage-c2d1/), so the proof is now the two
     * runs themselves: the same seed, once with no stage and once with a
     * stage it cannot attain, must produce the SAME life - decisions,
     * turns, the whole census, the same end - and the staged run records
     * attainment false with no library entry. A stage that never fires
     * cannot quietly change the play it never touched. */
    const plain = await playPackSession(Core, pack!, warriorPack, {
      seeds: [34],
      capFor: () => 600,
    });
    const staged = await playPackSession(Core, pack!, warriorPack, {
      seeds: [34],
      capFor: () => 600,
      stage: { clvl: 50, depth: 100 },
    });
    expect(plain.lives).toHaveLength(1);
    expect(staged.lives).toHaveLength(1);
    const a = plain.lives[0]!;
    const b = staged.lives[0]!;
    expect(b.decisions, "the unattained stage changed the decision count").toBe(a.decisions);
    expect(b.turns, "the unattained stage changed the turns").toBe(a.turns);
    expect(b.commands, "the unattained stage changed the census").toEqual(a.commands);
    expect(b.dead).toBe(a.dead);
    expect(b.causeOfDeath).toBe(a.causeOfDeath);
    expect(b.stageAttained).toBe(false);
    expect(b.retired).toBe(false);
    expect(staged.library).toEqual([]);
    const issued = Object.values(b.commands).reduce((x, y) => x + y, 0);
    expect(issued).toBe(b.decisions);
  }, 300_000);

  when("records stock attainment without keeping saves (the sweep's stage)", () => {
    /* The STOCK driver measures the stage - the reach-rate's y/n - but
     * keeps no library: that flow belongs to the pack driver and the mod.
     * Seed 20 attains c1d1 on its way down and the run STOPS there, under
     * the 1500-decision budget a stage-less run would have spent dying. */
    const run = playRun(Core, pack!, 20, 1500, { clvl: 1, depth: 1 });
    expect(run.stageAttained).toBe(true);
    expect(run.retired).toBe(false); /* measurement only: no kept save */
    expect(run.dead).toBe(false);
    expect(run.decisions).toBeLessThan(1500);
    const issued = Object.values(run.commands).reduce((a, b) => a + b, 0);
    expect(issued).toBe(run.decisions);
  }, 300_000);

  /* FORK (Mandos #16, #17): every class the game defines can be born and
   * played. The generic pack births a class with no dedicated pack on the
   * game's suggested stats; the live player must be exactly that pair and
   * that spread, and the census must hold for a short slice. */
  when("births and plays every class the game defines", async () => {
    for (const name of CLASS_ROSTER) {
      const strategy = packForClass(name);
      const raceName = name === "Warrior" ? WARRIOR_RACE_CANDIDATES[0] : "Dwarf";
      const plan = strategy.planFor(Core, pack!, raceName);
      const session = await playPackSession(Core, pack!, strategy, { seeds: [1], capFor: () => 120, raceName });
      const life = session.lives[0]!;
      expect(life.className, `${name}: the live player's class`).toBe(name);
      expect(life.race, `${name}: the live player's race`).toBe(raceName);
      expect(life.baseStats, `${name}: the planned base stats`).toEqual([...plan.baseStats]);
      expect(life.decisions).toBeGreaterThan(0);
      const issued = Object.values(life.commands).reduce((a, b) => a + b, 0);
      expect(issued, `${name}: one command per decision`).toBe(life.decisions);
    }
  }, 300_000);
});
