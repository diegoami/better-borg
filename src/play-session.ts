/**
 * THE SESSION: boot a real game, hand it to the stock Borg, drive the loop.
 *
 * This module is the measurement instrument's one copy of the play harness.
 * It was extracted from src/play.test.ts (B02, issue #3) because a session
 * loop that exists twice exists one-and-a-half times: the suite and the
 * bake-off runner (tools/sweep.mjs) must drive the SAME loop or the numbers a
 * run record quotes stop being the numbers the suite asserts on. Two callers,
 * one module - the test keeps its assertions, the runner gets the census.
 *
 * THE ENGINE ARRIVES AS A PARAMETER, the way ctx.core arrives in the plugin.
 * A harness file under src/ may not value-import the engine
 * (core-import-census.test.ts), so the callers - the vitest suite and the
 * runner's bundled entry - each import it themselves and hand it over. That
 * also pins the instance question the census exists for: there is exactly one
 * engine module in any process that runs this, and this file holds no second
 * one.
 *
 * BEHAVIOUR IS THE CONTRACT. Every line of the loop below is the one the
 * suite ran before the extraction, in the same order, asking the same things
 * of the same objects; the additions B02 made are observation only (reads of
 * live player fields, a kill counter wrapped around the engine's own
 * onPlayerKill hook, a wall-clock stamp). None of them draws RNG, so a
 * session on a given engine build is bit-for-bit what it always was - the
 * seed-1 door-close census (771 closes, docs/runs/2026-11-02-door-close) is
 * the regression proof, and the runner reproduces it on the published pin.
 *
 * Determinism (rule 5): the seed fixes the game, the seed fixes the Borg's
 * private stream, and this module adds no randomness of its own. Wall-clock
 * durations are recorded as metadata and never influence a result.
 */

import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import type * as Core from "@rpgm-tools/neo-angband-core";
import type { GamePack, GameState } from "@rpgm-tools/neo-angband-core";
import { createBorg } from "./controller.js";
import { makeCoreResolvers } from "./resolvers.js";

/** The game's checkout, holding the content pack a real boot needs. */
export function packRoot(): string | null {
  const roots = [
    process.env["NEO_ANGBAND_REPO"],
    fileURLToPath(new URL("../../neo-angband/", import.meta.url)),
  ].filter((r): r is string => typeof r === "string" && r.length > 0);
  for (const root of roots) {
    const dir = join(root, "packages", "content", "pack");
    if (existsSync(join(dir, "constants.json"))) return dir;
  }
  return null;
}

export function loadPack(dir: string): GamePack {
  const json = <T,>(name: string): T =>
    JSON.parse(readFileSync(join(dir, `${name}.json`), "utf8")) as T;
  const records = <T,>(name: string): T[] => json<{ records: T[] }>(name).records;
  return {
    constants: json("constants"),
    terrain: records("terrain"),
    roomTemplates: records("room_template"),
    vaults: records("vault"),
    dungeonProfiles: records("dungeon_profile"),
    projection: records("projection"),
    trap: records("trap"),
    names: records("names"),
    quest: records("quest"),
    obj: {
      objectBase: json("object_base"),
      object: json("object"),
      egoItem: json("ego_item"),
      artifact: json("artifact"),
      curse: json("curse"),
      brand: json("brand"),
      slay: json("slay"),
      activation: json("activation"),
      objectProperty: json("object_property"),
      flavor: json("flavor"),
    } as GamePack["obj"],
    mon: {
      pain: records("pain"),
      blowMethods: records("blow_methods"),
      blowEffects: records("blow_effects"),
      monsterSpells: records("monster_spell"),
      monsterBases: records("monster_base"),
      monsters: records("monster"),
      summons: records("summon"),
      pits: records("pit"),
    },
    mon2: undefined,
    player: {
      races: records("p_race"),
      classes: records("class"),
      properties: records("player_property"),
      timed: records("player_timed"),
      shapes: records("shape"),
      bodies: records("body"),
      history: records("history"),
      realms: records("realm"),
    },
  } as unknown as GamePack;
}

/** What a run did, in the terms a stall shows up in. */
export interface RunReport {
  /** The game seed this character was born under. */
  seed: number;
  /** 1-based life number within the seed's session (one character per life). */
  life: number;
  /** The character's race, as the pack named it. */
  race: string;
  /** The character's class, as the pack named it. */
  class: string;
  /** stat_birth at birth, in the pack's stat order (str int wis dex con here). */
  baseStats: number[];
  /** Decisions taken before the run ended. */
  decisions: number;
  /** Game turns elapsed this life. A stall that costs no energy leaves this flat. */
  turns: number;
  /** Every depth the character stood on. */
  depths: number[];
  /** max(depths): the run record's headline number (docs/runs/README.md). */
  maxDepth: number;
  /** Character level at end of run. */
  clvl: number;
  /** Gold carried at end of run. */
  gold: number;
  /** Monsters this character killed (counted at the engine's onPlayerKill). */
  kills: number;
  /** How many times each command code was issued. */
  commands: Record<string, number>;
  /** Distinct depth+grid the character occupied. A loop leaves this tiny. */
  places: number;
  /** Whether the character died (an ending, not a failure). */
  dead: boolean;
  /** player->died_from when dead, else null: the killer as the game named it. */
  causeOfDeath: string | null;
  /**
   * The fewest distinct squares any 60-decision stretch covered while NOTHING
   * was visible and the Borg was not resting. This is "sitting there or moving
   * frantically back and forth across three cells" written as a number: a Borg
   * with no monster in sight has nothing to hold it in place, so a low value is a
   * decision loop and not caution. 999 when no such stretch occurred.
   */
  jitter: number;
  /** Decisions on which the Borg chose to sit still with a monster adjacent. */
  restedBesideMonster: number;
  /**
   * Wall-clock time the life took. METADATA, never a fact: it varies with the
   * machine and never influences a number above (rule 5).
   */
  wallClockMs: number;
}

/** One seed's session: the lives the runner asked for, in order. */
export interface SessionReport {
  seed: number;
  runs: RunReport[];
}

export interface PlaySessionOptions {
  /** The game seed: it fixes the dungeon AND the Borg's private stream. */
  seed: number;
  /** Characters to play in this session (default 1). See playSession. */
  lives?: number;
  /** Decision budget per life. */
  decisions: number;
}

/**
 * Play one seed's session: one game boot, then one character per life.
 *
 * A LIFE is one character. It ends at death (the ending the harness counts) or
 * when its decision budget runs out, whichever comes first; the next life, if
 * any, is the engine's own `reincarnate` - the borg's respawn
 * (borg-reincarnate.c), wiping the player in place and rolling a new one in
 * the SAME session, with the turn counter and the RNG stream carried forward.
 * That is the only honest way a deterministic engine can offer "N lives per
 * seed": a second fresh boot of the same seed would replay the first life
 * bit-for-bit, while a reincarnation is a genuinely new draw that is still a
 * pure function of the seed. Race and class are ROLLED, upstream's default
 * (BORG_RESPAWN_RACE/CLASS are -1 unless configured); each life's entry
 * records what it rolled.
 *
 * The turn tail is the host's job in the real shell (main.ts); here it is the
 * three lines inside the loop, which is all a level change needs when nothing
 * has to be drawn.
 */
export function playSession(
  core: typeof Core,
  pack: GamePack,
  opts: PlaySessionOptions,
): SessionReport {
  const lives = opts.lives ?? 1;
  const game = core.startGame(pack, { seed: opts.seed, depth: 0 });
  const state: GameState = game.state;

  /* B02's one observational wrap: count kills at the engine's own
   * player_kill_monster seam, then hand the kill to the handler the session
   * installed. The wrap draws no RNG and reorders nothing, so play is
   * untouched - without it the run record has no kills column and the census
   * has to be inferred. */
  const tally = { kills: 0 };
  const engineOnPlayerKill = state.onPlayerKill;
  state.onPlayerKill = (mon) => {
    tally.kills += 1;
    engineOnPlayerKill?.(mon);
  };

  const runs: RunReport[] = [];
  for (let life = 1; life <= lives; life++) {
    /* The Borg starts each life as it started the first: same private-stream
     * derivation from the seed, fresh world model (the previous character's
     * map is not this character's knowledge), fresh resolvers. */
    const resolver = new core.ContentIdResolver({
      objects: game.booted.registries.objects,
      playerRaces: game.players.races,
      playerClasses: game.players.classes,
    });
    const borg = createBorg({
      /* Vary the Borg's private stream with the game seed. Every run used to
       * share one starting seed, so all four "different" runs drove an identical
       * draw sequence and the suite was structurally blind to anything that
       * depends on the Borg's own rolls: tie-breaks, retry counters, the twitchy
       * fallback. A regression there would have shown up on no seed at all. */
      rngSeed: (opts.seed * 2654435761) >>> 0 || 1,
      resolvers: makeCoreResolvers({
        races: game.booted.registries.monsters.races,
        objects: game.booted.registries.objects,
        state: state as never,
        /* The attack-message table, on the same terms plugin.ts wires it. Without
         * it the Borg does not recognise being hit by something it cannot see, so
         * a run measured without it is a run measured on a different Borg. */
        blowMethods: game.booted.registries.monsters.blowMethods.values(),
      }),
    });

    /* The latch the host installs for the same reason (main.ts): runGameLoop asks
     * nextCommand for as long as the player has energy, so a controller that
     * always answers never lets the loop return. */
    let armed = false;
    const commands: Record<string, number> = {};
    /* One entry per decision: where the character stood, and whether anything was
     * in sight. Both questions are asked of the LIVE game rather than of the Borg,
     * so a Borg that has mislaid a monster cannot talk its way out of them. */
    const trail: Array<{ at: string; alone: boolean; cmd: string }> = [];
    let restedBesideMonster = 0;
    const session = core.installController(
      state,
      (view, act) => {
        if (!armed) return null;
        armed = false;
        const cmd = borg.controller(view, act);
        if (cmd) commands[cmd.code] = (commands[cmd.code] ?? 0) + 1;

        let alone = true;
        let adjacent = false;
        const me = state.actor.grid;
        for (const m of view.monsters()) {
          if (!m.visible) continue;
          alone = false;
          if (Math.max(Math.abs(m.grid.x - me.x), Math.abs(m.grid.y - me.y)) <= 1) {
            adjacent = true;
          }
        }
        if (adjacent && cmd?.code === "rest") restedBesideMonster += 1;
        trail.push({
          at: `${String(state.chunk.depth)}:${String(me.x)},${String(me.y)}`,
          alone,
          cmd: cmd?.code ?? "none",
        });
        return cmd;
      },
      { viewDeps: { resolver, reg: game.booted.registries.objects } },
    );

    const places = new Set<string>();
    const depths = new Set<number>([state.chunk.depth]);
    let dead = false;
    let taken = 0;
    const turnStart = state.turn;
    const startedAt = Date.now();

    for (; taken < opts.decisions; taken++) {
      armed = true;
      const status = core.runGameLoop(state, game.registry);
      places.add(
        `${String(state.chunk.depth)}:${String(state.actor.grid.x)},${String(state.actor.grid.y)}`,
      );
      depths.add(state.chunk.depth);
      if (status === core.LOOP_STATUS.DEAD) {
        dead = true;
        break;
      }
      if (status === core.LOOP_STATUS.DEATH_CONFIRM) {
        state.pendingDeath?.resolve(true);
        continue;
      }
      if (status === core.LOOP_STATUS.LEVEL_CHANGE) {
        game.changeLevel(state.targetDepth ?? state.chunk.depth + 1);
        state.generateLevel = false;
        depths.add(state.chunk.depth);
      }
    }

    /* Resting and dropping are EXCLUDED, and the exclusions are the whole reason
     * this number means anything. Both keep a character on one square while
     * making real progress, so counting them turns patience into a false alarm.
     *
     * `rest` maps to a single-turn hold in this engine, so a character healing up
     * spends sixty decisions standing still - upstream's `R&` rendered one
     * decision at a time, not a loop. `drop` discards one item from a stack per
     * command in the C too (borg-junk.c:472-475), so emptying a stack of forty
     * arrows is forty decisions on one grid, and that is upstream's own pace.
     *
     * What is left is the Borg deciding, over and over, to go somewhere it has
     * just been with nothing in sight to hold it there. A genuine runaway drop is
     * still caught, by the single-command cap above. */
    const moving = trail.filter((t) => t.cmd !== "rest" && t.cmd !== "drop");
    const WINDOW = 60;
    let jitter = 999;
    for (let i = 0; i + WINDOW <= moving.length; i++) {
      const win = moving.slice(i, i + WINDOW);
      if (win.some((t) => !t.alone)) continue;
      const cells = new Set(win.map((t) => t.at)).size;
      if (cells < jitter) jitter = cells;
    }

    const player = state.actor.player;
    const depthsSorted = [...depths].sort((a, b) => a - b);
    runs.push({
      seed: opts.seed,
      life,
      race: player.race.name,
      class: player.cls.name,
      baseStats: [...player.statBirth],
      decisions: taken,
      turns: state.turn - turnStart,
      depths: depthsSorted,
      maxDepth: depthsSorted[depthsSorted.length - 1] ?? 0,
      clvl: player.lev,
      gold: player.au,
      kills: tally.kills,
      commands,
      places: places.size,
      dead,
      causeOfDeath: dead ? player.diedFrom : null,
      jitter,
      restedBesideMonster,
      wallClockMs: Date.now() - startedAt,
    });
    tally.kills = 0;

    /* The next life rolls a fresh character in this same session. uninstall
     * first so the controller seam is clean (the engine restores the previous
     * provider; installing over an install would chain two borgs). */
    session.uninstall();
    if (life < lives) game.reincarnate();
  }

  return { seed: opts.seed, runs };
}

/**
 * One life of one seed - the shape the suite's per-seed tests want. Exactly
 * playSession with lives 1, returning the single run.
 */
export function playRun(
  core: typeof Core,
  pack: GamePack,
  seed: number,
  decisions: number,
): RunReport {
  return playSession(core, pack, { seed, decisions, lives: 1 }).runs[0]!;
}
