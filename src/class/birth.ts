/**
 * THE PLANNED BIRTH'S WIRING: the presenter under `ui:birth.replace`, with
 * its class and race drawn from the birth pools at each birth (#16, #17).
 *
 * FORK (Mandos #16), a CHOICE with no C counterpart (src/birth/pools.ts says
 * why). This replaces the warrior pack's race-only wiring (the archived T05
 * and T09: `borg.raceRandom` and `borg.raceChoice`). The pair is resolved
 * ONCE PER BIRTH, AT SHOW, never cached at mod start (the T05 hazard: a
 * cached choice would silently ignore a toggle the player moved). The
 * toggles, the lineage counter and the game's own class and race names are
 * read once per page, here, because those calls are async while show() is
 * pinned synchronous; every armed birth follows the page reload its writer
 * issues, so this page's reads are the then-current ones.
 *
 * A Warrior is born through the warrior pack's measured plan (its point-buy
 * walk). Every other class is the generic pack's: the game's own suggested
 * spread for that race and class (presenter.ts, `suggested`). A dedicated
 * pack for another class later takes its class the same way the warrior's
 * does.
 *
 * After a drawn birth the lineage counter is bumped (fire-and-forget, as
 * before: a swallowed bump only repeats a pair, deterministically).
 */

import type { Api2BirthPresenter, ModApi2 } from "@rpgm-tools/neo-angband-mod-sdk";
import type * as Core from "@rpgm-tools/neo-angband-core";
import { resolveBirthPair } from "../birth/pools.js";
import { bumpLineage, readLineage } from "./warrior/lineage.js";
import { createWarriorBirthPresenter } from "./warrior/presenter.js";

/** The title-screen row that starts a planned character. It names no class: the class is drawn at the birth. */
export const TITLE_ROW_LABEL = "New Mandos character";

/** The names a content table's records carry, or null when unreadable. */
async function recordNames(mod: ModApi2, table: string): Promise<readonly string[] | null> {
  if (typeof mod.content?.records !== "function") return null;
  const read = await mod.content.records(table);
  if (!read.ok) return null;
  const names = read.value
    .map((record) => (record as { readonly name?: unknown }).name)
    .filter((name): name is string => typeof name === "string");
  return names.length > 0 ? names : null;
}

/** The presenter that births the Borg's planned character, or undefined with no engine. */
export function plannedBirth(mod: ModApi2, core: typeof Core): Api2BirthPresenter | undefined {
  if (core === undefined) {
    mod.meta.log("the Borg has no engine here, so the game shows its own character creation");
    return undefined;
  }
  let lineage = 0;
  let gameClasses: readonly string[] | null = null;
  let gameRaces: readonly string[] | null = null;
  void readLineage(mod.store.install).then((read) => {
    lineage = read;
  });
  void recordNames(mod, "class").then(
    (names) => {
      gameClasses = names;
    },
    () => {
      /* Unknown: the roster stands; the session's own refusal is the backstop. */
    },
  );
  void recordNames(mod, "p_race").then(
    (names) => {
      gameRaces = names;
    },
    () => {
      /* Unknown: the roster stands. */
    },
  );
  return createWarriorBirthPresenter({
    slot: mod.store.install,
    log: (message) => mod.meta.log(message),
    choose: () => {
      const pair = resolveBirthPair(
        { flags: mod.meta.flags, lineage, gameClasses, gameRaces },
        (message) => mod.meta.log(message),
      );
      void bumpLineage(mod.store.install).then((landed) => {
        if (!landed) {
          mod.meta.log("the Borg could not persist its birth counter, so the next character may repeat this one's class and race");
        }
      });
      return pair;
    },
    costTable: core.BIRTH_STAT_COSTS,
    statBase: core.BIRTH_STAT_BASE,
  });
}
