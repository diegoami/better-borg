/**
 * STRATEGY PACK #1: THE WARRIOR. Everything class-specific about the Borg's
 * planned warrior, ported from neowarrior-borg at its v0.1.0 tag (e1ec1b7)
 * for the M2 unification (#15) - the fork is archived, and this pack is the
 * continuation of its lineage: the same birth plan, the same race shortlist
 * and T09 draw, the same presenter protocol, now selected by the `borg.class`
 * setting as pack 0 (the default) instead of living in a repository of its
 * own.
 *
 * What moved here from the archived fork's plugin.ts: the birth wiring
 * (warriorBirth below) - the race settings resolution (draw or pin, at show,
 * never cached), the lineage counter read and bump, and the presenter
 * construction. plugin.ts remains class-agnostic: it resolves the setting to
 * a pack (src/class/registry.ts) and hands the mod over; it never learns a
 * race name.
 *
 * The plan both callers share (planWarriorFor) is the same one-plan contract
 * the archived fork kept: the presenter replays it, the headless session
 * driver boots it, and a disagreement between them is a bug in one of them.
 */

import type { Api2BirthPresenter, ModApi2 } from "@rpgm-tools/neo-angband-mod-sdk";
import type * as Core from "@rpgm-tools/neo-angband-core";
import type { GamePack } from "@rpgm-tools/neo-angband-core";
import type { StrategyPack } from "../pack.js";
import { ladderFromCostTable, planWarriorBirth, WARRIOR_CLASS_NAME, type WarriorBuildPlan } from "./plan.js";
import { RACE_CHOICE_SETTING, RACE_RANDOM_RULE, WARRIOR_RACE_CANDIDATES, resolveWarriorRace } from "./settings.js";
import { bumpLineage, readLineage } from "./lineage.js";
import { createWarriorBirthPresenter } from "./presenter.js";

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

/**
 * The birth wiring, ported verbatim in shape from the archived fork's
 * plugin.ts: the presenter under `ui:birth.replace` that births the planned
 * warrior when the mod's one-shot install-slot flag is set (by the restart
 * loop and the title row), and declines otherwise so the game shows its own
 * screens - a human creating a character is never hijacked. The engine's
 * birth cost table is read here the same way the bridge reads the engine
 * (mod.engine.core, cast as in src/api2/host.ts - a bundled engine copy is
 * forbidden), because the presenter itself stays game-free. Without the
 * engine there is no presenter; like the bridge's "no engine" start failure,
 * that birth falls to the game.
 *
 * THE RACE comes from the pack's two race settings (manifest.json's `rules`
 * and `settings` keys; the candidates, the draw and the resolver live in
 * ./settings.ts). It is RESOLVED ONCE PER BIRTH, AT SHOW: the presenter reads
 * `deps.raceName` inside show(), and the property wired below is a getter
 * over the resolver, so the decision - draw or pin, clamp, pack-unknown
 * fallback, log - runs at the birth itself, never cached at mod start (the
 * archived T05 hazard: a cached race would silently ignore a setting the
 * player moved). The setting VALUES and the pack's race names are fetched
 * once per page, here at registration, because the settings and content
 * calls are async while show() is pinned synchronous; every armed birth
 * follows the page reload its writer issues, so this page's fetch is always
 * the then-current one for the birth that reads it. A host with no settings
 * seam, a failed fetch, or a pack whose records cannot be read leaves the
 * declared defaults and no pack check - the resolver says which candidate
 * that is in the log, and the presenter's own unknown-race decline is the
 * backstop.
 *
 * THE DRAW (the archived T09): `borg.raceRandom` (a rule, default ON) gates a
 * uniform draw from the full shortlist, seeded by the install slot's
 * `lineage` counter (./lineage.ts): read here once per page (a fresh install
 * reads 0, so its first draw is reproducible), consumed by the getter at show
 * through the one-draw hash, and bumped after each draw - same persisted
 * counter, same race; every reload that drew varies the next one. Rule 5
 * held: no clock, no game RNG, and the decision RNG untouched. The toggle
 * itself comes from the resolved rule flags, which the host fixes when the
 * mod starts - the same per-page lifetime the settings fetch has, for the
 * same reason. With the toggle OFF the draw is skipped entirely and
 * `borg.raceChoice` pins the race (its default High-Elf, the bake-off's
 * recommendation). The bump is fire-and-forget from the synchronous getter
 * and never verifies: a swallowed bump is benign and deterministic (the next
 * draw re-seeds from what is still stored, repeating a race at worst),
 * unlike the birth flag, where a swallowed write strands a birth.
 */
export function warriorBirth(mod: ModApi2, core: typeof Core): Api2BirthPresenter | undefined {
  if (core === undefined) {
    mod.meta.log("the Borg has no engine here, so the game shows its own character creation");
    return undefined;
  }
  /* The transport for the per-birth resolution above: the setting's current
   * value and the pack's race names, each read as late as the async API
   * allows and held for the getter to resolve from at show. Both are guarded
   * the same way a missing seam is: a host whose call throws or refuses
   * changes nothing here, and the birth still runs on the declared default. */
  let raceChoice: unknown = RACE_CHOICE_SETTING.default;
  let packRaces: readonly string[] | null = null;
  /* The draw's toggle and seed, same per-page lifetime. The counter read is
   * a read; the one write (the bump) happens only after a draw, at show. */
  const raceRandom = mod.meta.flags[RACE_RANDOM_RULE.flag] ?? RACE_RANDOM_RULE.default;
  let lineage = 0;
  void readLineage(mod.store.install).then((read) => {
    lineage = read;
  });
  try {
    if (typeof mod.meta.settings === "function") {
      void mod.meta.settings().then(
        (read) => {
          if (read.ok) raceChoice = read.value[RACE_CHOICE_SETTING.id] ?? RACE_CHOICE_SETTING.default;
        },
        () => {
          /* Kept at the declared default; the resolver logs the birth's race. */
        },
      );
    }
    if (typeof mod.content?.records === "function") {
      void mod.content.records("p_race").then(
        (read) => {
          if (!read.ok) return;
          const names = read.value
            .map((record) => (record as { readonly name?: unknown }).name)
            .filter((name): name is string => typeof name === "string");
          packRaces = names.length > 0 ? names : null;
        },
        () => {
          /* No pack knowledge; the chosen candidate stands. */
        },
      );
    }
  } catch {
    /* Held at the defaults; the resolver says which candidate that is. */
  }
  return createWarriorBirthPresenter({
    slot: mod.store.install,
    log: (message) => mod.meta.log(message),
    get raceName(): string {
      const resolved = resolveWarriorRace(
        { random: raceRandom, choice: raceChoice, lineage, packRaces },
        (message) => mod.meta.log(message),
      );
      /* The draw's one write: bump the counter AFTER the draw seeded from
       * it, so the next birth draws the next race. A failed bump only logs -
       * see the comment above for why it is not verified like the flag. */
      if (resolved.drawn) {
        void bumpLineage(mod.store.install).then((landed) => {
          if (!landed) {
            mod.meta.log("the Borg could not persist its birth counter, so the next warrior may draw this one's race again");
          }
        });
      }
      return resolved.raceName;
    },
    costTable: core.BIRTH_STAT_COSTS,
    statBase: core.BIRTH_STAT_BASE,
  });
}

/** Strategy pack #1: the warrior, and the default. */
export const warriorPack: StrategyPack = {
  id: "warrior",
  className: WARRIOR_CLASS_NAME,
  titleRowLabel: "New Warrior Borg character",
  defaultRaceName: WARRIOR_RACE_CANDIDATES[0],
  raceCandidates: WARRIOR_RACE_CANDIDATES,
  planFor: planWarriorFor,
  createPresenter: warriorBirth,
};
