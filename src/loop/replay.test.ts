/**
 * The replay mode's settings and banner (#29).
 *
 * The stage settings' own tests (src/loop/stage.test.ts) are the pattern:
 * the mirror must agree with the SDK's resolver, the manifest rows must
 * match the declarations field for field, and the banner - the one text the
 * host shows FOR the mod (controller.release's reason is displayed in place
 * of the usual line) - is pinned so it cannot drift into something that no
 * longer says what is happening.
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolveSettingValue, validateManifest, type PackSetting } from "@rpgm-tools/neo-angband-mod-sdk";
import {
  REPLAY_DEATH_SETTING,
  REPLAY_RELEASE_SETTING,
  replayBanner,
  replayModeOf,
} from "./replay.js";

describe("the replay settings' resolution", () => {
  it("keeps the mode OFF until a release turn is set", () => {
    /* The defaults are the guard: both 0 means the ordinary grind runs
     * untouched, and nothing arms a replay an owner did not deliberately
     * set from a dossier's rung line. */
    expect(replayModeOf({})).toEqual({ release: 0, death: 0 });
    expect(replayModeOf({ release: "5049", death: [] })).toEqual({ release: 0, death: 0 });
  });

  it("resolves through the declared ranges exactly as the SDK would", () => {
    for (const setting of [REPLAY_RELEASE_SETTING, REPLAY_DEATH_SETTING]) {
      for (const stored of [-7, 0, 1, 999, 1000000, 1000001, 2.4, Number.NaN, "x", null]) {
        const resolved = setting === REPLAY_RELEASE_SETTING
          ? replayModeOf({ release: stored }).release
          : replayModeOf({ death: stored }).death;
        expect(resolved, `${setting.id} of ${String(stored)}`).toBe(resolveSettingValue(setting as PackSetting, stored));
      }
    }
    expect(replayModeOf({ release: 5029, death: 5049 })).toEqual({ release: 5029, death: 5049 });
  });

  it("declares both rows in the manifest, field for field", () => {
    /* The manifest is what the host reads; a row that drifts from the
     * declaration it clamps by is a setting the screen cannot reach. */
    const manifest = validateManifest(
      JSON.parse(readFileSync(new URL("../../manifest.json", import.meta.url), "utf8")),
    ) as unknown as { settings?: PackSetting[] };
    expect(manifest.settings?.find((row) => row.id === REPLAY_RELEASE_SETTING.id)).toEqual(REPLAY_RELEASE_SETTING);
    expect(manifest.settings?.find((row) => row.id === REPLAY_DEATH_SETTING.id)).toEqual(REPLAY_DEATH_SETTING);
  });
});

describe("the death banner", () => {
  it("counts down from the recorded death when both settings are set", () => {
    expect(replayBanner({ release: 5029, death: 5049 })).toBe(
      "Death replay: the recorded character died at turn 5049 - the keyboard is yours for the last 20 turns.",
    );
  });

  it("shows the banner without a countdown when the death turn is unnamed", () => {
    expect(replayBanner({ release: 5029, death: 0 })).toBe(
      "Death replay: the release turn 5029 is reached - the keyboard is yours.",
    );
  });

  it("names a death turn that is not after the release instead of counting a negative gap", () => {
    /* A backwards pair is an owner's slip; the banner says so rather than
     * inventing "-N turns". */
    expect(replayBanner({ release: 5049, death: 5049 })).toContain("check borg.replayReleaseTurn");
  });
});
