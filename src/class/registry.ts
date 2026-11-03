/**
 * THE PACK REGISTRY: which class packs exist, and the one setting that picks
 * one (M2 unification, #15).
 *
 * "A new class starts as a pack plus a setting, never a fork" (docs/
 * process.md section 2) - this module is the setting's half. `borg.class` is
 * a numeric manifest setting whose value indexes PACKS, exactly the way the
 * warrior pack's `borg.raceChoice` indexes its race shortlist: the ORDER is
 * pinned everywhere it is named (the manifest, docs/README.md, this array),
 * because the setting's saved VALUE is an index into it. A rotation here
 * would silently re-map every stored choice.
 *
 * The DEFAULT is pack 0, the warrior - the doctrine's own words: better-borg
 * becomes the warrior lineage's successor the moment the unification merges,
 * because the archived neowarrior-borg fork's unattended line continues
 * here unchanged (same plan, same draw, same records schema from B02 on).
 *
 * With one pack the setting's range is 0-0: a row that cannot be moved yet
 * but already exists, so pack #2 lands as a range extension plus a pack
 * module, not as a settings redesign. A stored value outside the range
 * clamps (packForClassValue) by the DECLARED min/max, the same arithmetic
 * the warrior pack's settings.ts clamps borg.raceChoice by.
 */

import type { PackSetting } from "@rpgm-tools/neo-angband-mod-sdk";
import type { StrategyPack } from "./pack.js";
import { warriorPack } from "./warrior/index.js";

/** The packs, in `borg.class` order. Pack 0 is the default. */
export const PACKS: readonly StrategyPack[] = [warriorPack];

/**
 * The `borg.class` declaration, mirrored: a PERSISTED numeric parameter in
 * the established settings shape (the `borg.raceChoice` convention - a value
 * indexing a pinned, ordered list of the installed packs), read by the
 * plugin's wiring at each page so a change applies to the NEXT rebirth. The
 * MANIFEST ROW arrives together with the second pack: the host's setting
 * schema requires `min < max` strictly, so a warrior-only 0-0 row is not a
 * manifest the SDK validates - with one pack there is no second value to
 * offer, and a dead option would be exactly the anti-inert toggle this repo
 * refuses to ship. `max` is computed from PACKS, so adding a pack widens the
 * range, the row lands, and the order stays pinned the way the warrior
 * pack's race shortlist is.
 */
export const CLASS_SETTING: PackSetting = {
  id: "borg.class",
  title: "Borg class",
  description:
    "Which class pack the Borg plays when it births its own character: 0 Warrior - the default, and the only pack so far; the archived neowarrior-borg fork's lineage, continued here. Read at each page, so a change applies to the next birth.",
  min: 0,
  max: Math.max(PACKS.length - 1, 1),
  step: 1,
  default: 0,
};

/**
 * The pack a stored `borg.class` value selects, clamped into the declared
 * range and snapped to the step (an integer here) - resolveWarriorRace's own
 * clamp arithmetic, over packs. An unknown index (a value from a future
 * manifest read by an older mod) falls back to the default pack rather than
 * throwing at a birth.
 */
export function packForClassValue(stored: unknown): StrategyPack {
  const raw = typeof stored === "number" && Number.isFinite(stored) ? stored : CLASS_SETTING.default;
  const clamped = Math.min(CLASS_SETTING.max, Math.max(CLASS_SETTING.min, raw));
  const snapped = CLASS_SETTING.min + Math.round((clamped - CLASS_SETTING.min) / CLASS_SETTING.step) * CLASS_SETTING.step;
  return PACKS[snapped] ?? PACKS[CLASS_SETTING.default]!;
}
