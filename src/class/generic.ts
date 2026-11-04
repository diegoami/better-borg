/**
 * THE GENERIC PACK: any class, born with the game's own suggested stats
 * (#17).
 *
 * FORK (Mandos #17), a CHOICE with no C counterpart: upstream's borg never
 * plans a birth. A class without a dedicated pack is born exactly as the
 * game's birth screen first offers it - the engine's generateStats, the C's
 * generate_stats (player-birth.c:816-973), the per-class point-buy spread
 * the screen starts from (spell stat for casters, the blows breakpoint for
 * fighters). No class knowledge is invented here; a dedicated pack replaces
 * this for its class once one is measured (the warrior's is).
 *
 * The in-mod birth takes that spread straight from the birth session
 * (src/class/warrior/presenter.ts, `suggested`); this module is the same
 * answer for the headless harness, which boots startGame({ roller: "point",
 * birthStats }) and must birth what the mod would.
 *
 * GAME-FREE: the engine arrives as the `core` parameter.
 */

import type * as Core from "@rpgm-tools/neo-angband-core";
import type { GamePack } from "@rpgm-tools/neo-angband-core";
import type { PackBuildPlan, StrategyPack } from "./pack.js";
import { plannedBirth, TITLE_ROW_LABEL } from "./birth.js";

/** The race a headless session boots when the caller names none. */
const DEFAULT_RACE = "Human";

/** The game's suggested birth for one race and class. */
export function planSuggested(core: typeof Core, pack: GamePack, className: string, raceName: string = DEFAULT_RACE): PackBuildPlan {
  const players = core.bindPlayer(pack.player);
  const race = players.races.find((r) => r.name === raceName);
  const cls = players.classes.find((c) => c.name === className);
  if (race === undefined) throw new Error(`the game has no race "${raceName}"`);
  if (cls === undefined) throw new Error(`the game has no class "${className}"`);
  return { raceName, className, baseStats: [...core.generateStats(race, cls).stats] };
}

/** The generic pack for one class. */
export function genericPackFor(className: string): StrategyPack {
  return {
    id: `generic-${className.toLowerCase()}`,
    className,
    titleRowLabel: TITLE_ROW_LABEL,
    defaultRaceName: DEFAULT_RACE,
    raceCandidates: [],
    planFor: (core, pack, raceName) => planSuggested(core, pack, className, raceName),
    createPresenter: plannedBirth,
  };
}
