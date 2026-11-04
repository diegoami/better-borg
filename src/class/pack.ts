/**
 * THE STRATEGY PACK INTERFACE: what a class pack is, to the two callers that
 * consume it (M2 unification, #15 - the no-N-forks doctrine's execution; see
 * docs/process.md section 2).
 *
 * A pack owns everything class-specific about a planned birth: the class it
 * pins, the race shortlist and their draw, the point-buy plan, the presenter
 * that replays it under `ui:birth.replace`, and the title-screen row label
 * that starts one of its characters. The CORE owns everything around it: the
 * restart loop that sequences births (src/loop/restart.ts), the journal and
 * graveyard that record them (src/records/journal.ts), the session driver
 * that measures them headless (src/play-session.ts), and the birth flag the
 * writers and the presenter share (src/birth/flag.ts). A new class starts as
 * a pack plus a setting, never a fork.
 *
 * The interface is deliberately SMALL and structural: the plan's full shape
 * (steps, points spent, effective stats) is the pack's own business, and the
 * core's callers assert only the three fields every consumer reads - the
 * race, the class, and the base stats the engine was told to buy. The
 * presenter factory takes the whole ModApi2 because the pack's settings and
 * pack-content reads are its own; the core does not know they exist.
 *
 * GAME-FREE: this module imports types only. The engine reaches a pack's
 * plan as the `core` parameter (the host hands the plugin the live engine;
 * the headless driver hands the published one), so a pack never value-imports
 * it (core-import-census.test.ts holds that line for everything in the
 * plugin graph).
 */

import type * as Core from "@rpgm-tools/neo-angband-core";
import type { GamePack } from "@rpgm-tools/neo-angband-core";
import type { Api2BirthPresenter, ModApi2 } from "@rpgm-tools/neo-angband-mod-sdk";

/**
 * The plan's shape as the core's callers see it: the fields the session
 * driver boots (`startGame({ roller: "point", birthStats })`) and the boot
 * assert pins against the live player. The pack's own plan type carries more
 * (the buy steps, the points books); this is the window into it.
 */
export interface PackBuildPlan {
  /** The catalogue name of the race to birth. */
  readonly raceName: string;
  /** The catalogue name of the class this pack pins. */
  readonly className: string;
  /** BASE-stat targets in the engine's STAT order, the array birthStats takes. */
  readonly baseStats: readonly number[];
}

/** One class pack. See the module header for the division of labour. */
export interface StrategyPack {
  /** The pack's id, for logs and the settings text that names it. */
  readonly id: string;
  /** The class every plan from this pack pins, as the catalogue names it. */
  readonly className: string;
  /** The title-screen row's label this pack owns (TITLE_LABEL's per-pack value). */
  readonly titleRowLabel: string;
  /** The race a headless session boots when the caller names none. */
  readonly defaultRaceName: string;
  /**
   * The races this pack was measured on (the warrior's T07 bake-off
   * shortlist; empty for the generic pack). Measurement data only: since #16
   * the player-facing race choice is the birth pools' toggles over the whole
   * roster (src/birth/pools.ts), the same rows for every pack.
   */
  readonly raceCandidates: readonly string[];
  /**
   * The ONE plan every caller shares: the presenter replays it through the
   * session's own buy() calls, and the headless driver boots it through
   * startGame. A disagreement between the two is a bug in one of them, which
   * is why both go through here rather than each keeping an arithmetic copy.
   * The engine arrives as `core` exactly the way the host hands the plugin
   * one (mod.engine.core) - the pack never value-imports it.
   */
  planFor(core: typeof Core, pack: GamePack, raceName?: string): PackBuildPlan;
  /**
   * The presenter under `ui:birth.replace` that births this pack's planned
   * character when the one-shot birth flag stands, and declines otherwise so
   * a human's birth stays theirs. The engine arrives as `core` exactly the
   * way the host hands the plugin one (mod.engine.core, extracted by the
   * entry, which is the one file allowed to name the engine namespace) - the
   * pack stays game-free. Undefined when this host gives the mod no engine
   * (the caller logs and the game's own screens run).
   */
  createPresenter(mod: ModApi2, core: typeof Core): Api2BirthPresenter | undefined;
}
