/**
 * TESTS FOR THE STAGE: the predicate, the settings, and the library name
 * (#25 - the purpose redirect's first rail).
 *
 * The stage is the rung a lineage grinds toward: "character level at least C
 * AND a first arrival at depth at least D". Three things here are pinned
 * against the declarations rather than against copies, because each is
 * load-bearing somewhere else:
 *
 * - THE PREDICATE reads only STICKY facts (level, maxDepth - the deepest
 *   first arrival, the same fact the journal's milestones record), so
 *   attainment never un-happens and the same check answers the same at any
 *   later decision. Boundary equality is attainment ("at least").
 * - THE SETTINGS resolve like every numeric setting this mod declares: clamp
 *   by the DECLARED min/max, snap to the step, default when unusable - the
 *   SDK's resolveSettingValue mirrored (the bundle cannot import it at
 *   runtime), pinned here against the real function over a sweep, the same
 *   way warrior/settings.test.ts pins the race pin.
 * - THE LIBRARY NAME fits the host's rename seam: 1 to 15 characters
 *   (neo-angband's acceptedCharacterName, charsheet.ts:250 - a longer name
 *   is REFUSED, and a refused rename must never be the thing that ends a
 *   run). The seed segment is the ladder's per-seed key (#26), so it wins
 *   the space; the mod, which cannot know the game seed, names by the
 *   lineage counter instead.
 *
 * GAME-FREE like the loop: no engine, no clock, no RNG (rule 5).
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolveSettingValue, validateManifest, type PackSetting } from "@rpgm-tools/neo-angband-mod-sdk";
import {
  STAGE_CLVL_SETTING,
  STAGE_DEPTH_SETTING,
  STAGE_NAME_LIMIT,
  librarySlotName,
  stageAttained,
  stageLabel,
  stageOf,
} from "./stage.js";

describe("the stage predicate", () => {
  const stage = { clvl: 20, depth: 8 };

  it("attains exactly at the boundaries, on sticky facts", () => {
    /* "At least" is the whole shape: equal counts. The facts are the STICKY
     * ones - level (never decreases) and maxDepth (the deepest first
     * arrival, never decreases) - so a run that once attained still attains
     * at any later decision, whatever depth it stands on now. */
    expect(stageAttained(stage, { clvl: 20, maxDepth: 8 })).toBe(true);
    expect(stageAttained(stage, { clvl: 25, maxDepth: 30 })).toBe(true);
    expect(stageAttained(stage, { clvl: 20, maxDepth: 7 })).toBe(false);
    expect(stageAttained(stage, { clvl: 19, maxDepth: 8 })).toBe(false);
    expect(stageAttained(stage, { clvl: 1, maxDepth: 0 })).toBe(false);
  });

  it("stays attained after the character leaves the depth (the facts are maxima)", () => {
    /* The character stood on depth 8 (maxDepth 8) and is back in town at
     * clvl 21: attained - "first-arrival depth" is a record of arrival, not
     * a statement about where anyone stands now. */
    expect(stageAttained(stage, { clvl: 21, maxDepth: 8 })).toBe(true);
  });

  it("treats a depth-0 stage as birth-trivial, and never attains on depth alone", () => {
    /* A rung may sit in town (depth 0): it is attained at birth once the
     * level leg clears, because maxDepth >= 0 always holds. The level leg
     * alone never attains a depth-1 rung, however deep the level. */
    expect(stageAttained({ clvl: 1, depth: 0 }, { clvl: 1, maxDepth: 0 })).toBe(true);
    expect(stageAttained({ clvl: 2, depth: 1 }, { clvl: 20, maxDepth: 0 })).toBe(false);
  });
});

describe("the stage settings (next-birth semantics)", () => {
  it("resolve by the declared ranges, snapping and defaulting like the host does", () => {
    /* The declared setting is the clamp's authority, so whatever a front end
     * hands over - beyond the range, fractional, not a number at all - lands
     * on a stage the range names. The DEFAULTS are the stage baseline's
     * calibration (2026-11-03): clvl 2 at depth 1, the strongest rung inside
     * today's measured frontier on the standard seed grid. */
    expect(STAGE_CLVL_SETTING.default).toBe(2);
    expect(STAGE_DEPTH_SETTING.default).toBe(1);
    expect(stageOf({ clvl: undefined, depth: undefined })).toEqual({ clvl: 2, depth: 1 });
    expect(stageOf({ clvl: 101, depth: 101 })).toEqual({ clvl: STAGE_CLVL_SETTING.max, depth: STAGE_DEPTH_SETTING.max });
    expect(stageOf({ clvl: -5, depth: -5 })).toEqual({ clvl: STAGE_CLVL_SETTING.min, depth: STAGE_DEPTH_SETTING.min });
    expect(stageOf({ clvl: 2.6, depth: 1.4 })).toEqual({ clvl: 3, depth: 1 });
    expect(stageOf({ clvl: "20", depth: null })).toEqual({ clvl: 2, depth: 1 });
  });

  it("is the SDK's own resolution, pinned over a sweep", () => {
    /* The mirror must stay a line-for-line equivalent of
     * resolveSettingValue, or a stage would silently differ from what the
     * host's own Mods screen resolved. */
    for (const setting of [STAGE_CLVL_SETTING, STAGE_DEPTH_SETTING] as const) {
      for (const stored of [
        ...Array.from({ length: 61 }, (_v, i) => i - 5),
        1.4, 1.5, 2.4, 2.5, 2.6, -0.5, 1e9, Number.NaN, Number.POSITIVE_INFINITY,
        undefined, null, "2", true, {},
      ]) {
        const resolved = stageOf({ clvl: stored, depth: stored });
        const key = setting === STAGE_CLVL_SETTING ? resolved.clvl : resolved.depth;
        expect(key, `${setting.id} of ${String(stored)}`).toBe(resolveSettingValue(setting as PackSetting, stored));
      }
    }
  });

  it("declares both rows in the manifest, field for field", () => {
    /* The manifest is what the host reads; a row that drifts from the
     * declaration it clamps by is a setting the screen cannot reach. */
    const manifest = validateManifest(
      JSON.parse(readFileSync(new URL("../../manifest.json", import.meta.url), "utf8")),
    ) as unknown as { settings?: PackSetting[] };
    expect(manifest.settings?.find((row) => row.id === STAGE_CLVL_SETTING.id)).toEqual(STAGE_CLVL_SETTING);
    expect(manifest.settings?.find((row) => row.id === STAGE_DEPTH_SETTING.id)).toEqual(STAGE_DEPTH_SETTING);
  });
});

describe("the library slot name", () => {
  it("carries the seed, the stage, and the marker, inside the host's 15 characters", () => {
    /* The ladder (#26) maps its per-seed cohorts by the seed segment, so the
     * seed wins the name's space; the stage tells rungs apart; the leading M
     * marks the library in the picker (graveyard for failures, library for
     * successes). Every shape fits 15 - the host refuses longer names
     * outright, and a rename refusal must never be what ends a run. */
    expect(STAGE_NAME_LIMIT).toBe(15);
    expect(librarySlotName({ clvl: 2, depth: 1 }, { seed: 20 })).toBe("M s20 c2d1");
    expect(librarySlotName({ clvl: 20, depth: 8 }, { seed: 123456 })).toBe("M s123456 c20d8");
    expect(librarySlotName({ clvl: 2, depth: 1 }, { seed: 20, lineage: 7 })).toBe("M s20 c2d1");
    for (const identity of [{ seed: 20 }, { seed: 123456 }, { lineage: 0 }, { lineage: 4096 }, {}]) {
      expect(
        librarySlotName({ clvl: 25, depth: 100 }, identity).length,
        `name for ${JSON.stringify(identity)}`,
      ).toBeLessThanOrEqual(STAGE_NAME_LIMIT);
    }
  });

  it("names by the lineage counter when the seed is unknown, and by the stage alone when neither is", () => {
    /* A mod cannot know the game seed - no host seam carries it - so the
     * mod-side name carries the install slot's lineage counter instead (the
     * knowable per-character identity) and the record documents the split. */
    expect(librarySlotName({ clvl: 2, depth: 1 }, { lineage: 5 })).toBe("M n5 c2d1");
    expect(librarySlotName({ clvl: 2, depth: 1 }, { seed: null, lineage: 5 })).toBe("M n5 c2d1");
    expect(librarySlotName({ clvl: 2, depth: 1 }, {})).toBe("M c2d1");
    expect(librarySlotName({ clvl: 2, depth: 1 }, { seed: null, lineage: null })).toBe("M c2d1");
  });

  it("degrades deterministically when the full shape cannot fit", () => {
    /* The identity outranks the stage (the ladder can re-derive a stage from
     * a save; it cannot re-derive a seed), and a pathological identity that
     * still cannot fit is truncated at the limit rather than refused. */
    expect(librarySlotName({ clvl: 50, depth: 100 }, { seed: 1234567 })).toBe("M s1234567");
    expect(librarySlotName({ clvl: 50, depth: 100 }, {})).toBe("M c50d100");
    expect(librarySlotName({ clvl: 2, depth: 1 }, { seed: 999999999999 })).toHaveLength(STAGE_NAME_LIMIT);
  });

  it("labels the stage compactly, thresholds intact", () => {
    expect(stageLabel({ clvl: 2, depth: 1 })).toBe("c2d1");
    expect(stageLabel({ clvl: 20, depth: 8 })).toBe("c20d8");
    expect(stageLabel({ clvl: 0, depth: 0 })).toBe("c0d0");
  });
});
