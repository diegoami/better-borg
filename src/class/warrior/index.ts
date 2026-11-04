/**
 * STRATEGY PACK #1: THE WARRIOR. Everything class-specific about the Borg's
 * planned warrior, ported from neowarrior-borg at its v0.1.0 tag (e1ec1b7)
 * for the M2 unification (#15) - the fork is archived, and this pack is the
 * continuation of its lineage: the same birth plan, the same race shortlist
 * and T09 draw, the same presenter protocol, now selected by the `borg.class`
 * setting as pack 0 (the default) instead of living in a repository of its
 * own.
 *
 * The birth wiring that moved here from the archived fork's plugin.ts (the
 * race settings, the lineage counter, the presenter construction) moved on
 * again at #16: the class and race are now drawn from the birth pools
 * (src/birth/pools.ts) by the shared wiring in src/class/birth.ts, which
 * births a Warrior through this pack's plan.
 *
 * The plan both callers share (planWarriorFor) is the same one-plan contract
 * the archived fork kept: the presenter replays it, the headless session
 * driver boots it, and a disagreement between them is a bug in one of them.
 */

import type * as Core from "@rpgm-tools/neo-angband-core";
import type { GamePack } from "@rpgm-tools/neo-angband-core";
import type { StrategyPack } from "../pack.js";
import { ladderFromCostTable, planWarriorBirth, WARRIOR_CLASS_NAME, type WarriorBuildPlan } from "./plan.js";
import { WARRIOR_RACE_CANDIDATES } from "./settings.js";
import { plannedBirth, TITLE_ROW_LABEL } from "../birth.js";

/**
 * The ONE plan every caller shares, computed exactly as the archived fork's
 * session driver computed it: the engine's own cost table and point budget
 * (handed in as `core`, never imported - the pack stays game-free), this
 * explicit race. The default race is candidate 0 of the shortlist - the
 * harness's own explicit race, kept for comparability with the committed run
 * records; the mod's births draw or pin through the settings instead.
 */
export function planWarriorFor(core: typeof Core, pack: GamePack, raceName: string = WARRIOR_RACE_CANDIDATES[0]): WarriorBuildPlan {
  const players = core.bindPlayer(pack.player);
  return planWarriorBirth({
    catalogue: {
      races: players.races.map((race) => ({ name: race.name, statAdj: race.statAdj })),
      classes: players.classes.map((cls) => ({ name: cls.name, statAdj: cls.statAdj })),
      stats: ["STR", "INT", "WIS", "DEX", "CON"],
      pointBudget: core.MAX_BIRTH_POINTS,
    },
    raceName,
    costs: ladderFromCostTable(core.BIRTH_STAT_COSTS, core.BIRTH_STAT_BASE),
  });
}

/** Strategy pack #1: the warrior, the one dedicated pack so far. */
export const warriorPack: StrategyPack = {
  id: "warrior",
  className: WARRIOR_CLASS_NAME,
  titleRowLabel: TITLE_ROW_LABEL,
  defaultRaceName: WARRIOR_RACE_CANDIDATES[0],
  raceCandidates: WARRIOR_RACE_CANDIDATES,
  planFor: planWarriorFor,
  /* The planned birth is shared since #16: it draws the class and race
   * and births a Warrior through planWarriorBirth (presenter.ts). */
  createPresenter: plannedBirth,
};
