/**
 * TESTS FOR THE PACK REGISTRY: the setting that selects a pack, and the
 * order it indexes (#15).
 *
 * The same discipline the warrior pack's own settings.test.ts keeps over
 * borg.raceChoice: the DECLARED min/max/default are what the resolver clamps
 * and defaults by, and the manifest's `settings` array is what the host
 * renders - a drift between them puts a menu that offers one thing in front
 * of a wiring that enforces another. The order of PACKS is pinned to the
 * declared range because a stored choice is an INDEX: a reordered array
 * would silently re-map every save.
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { validateManifest, type PackSetting } from "@rpgm-tools/neo-angband-mod-sdk";
import { CLASS_SETTING, PACKS, packForClassValue } from "./registry.js";
import { warriorPack } from "./warrior/index.js";

const manifest = (): { settings?: readonly PackSetting[] } =>
  validateManifest(JSON.parse(readFileSync(new URL("../../manifest.json", import.meta.url), "utf8"))) as {
    settings?: readonly PackSetting[];
  };

describe("the class registry", () => {
  it("declares borg.class only when a second pack exists - the host forbids a one-value setting", () => {
    /* The SDK's manifest validator requires a numeric setting's min to be
     * STRICTLY below its max, so a 0-0 warrior-only row is not a manifest it
     * validates. While PACKS holds one pack the manifest declares no
     * borg.class (asserted over the raw JSON, which validateManifest would
     * reject); the row and CLASS_SETTING land together with pack #2. */
    const raw = JSON.parse(readFileSync(new URL("../../manifest.json", import.meta.url), "utf8")) as {
      data: { settings?: Array<{ id: string }> };
    };
    if (PACKS.length < 2) {
      expect(raw.data.settings?.map((s) => s.id) ?? []).not.toContain("borg.class");
    } else {
      expect(manifest().settings?.[0]).toEqual(CLASS_SETTING);
    }
    /* The declared-range contract holds either way: the range covers exactly
     * the packs, no index the menu can pick that the array does not name. */
    expect(CLASS_SETTING.max).toBe(Math.max(PACKS.length - 1, 1));
    expect(CLASS_SETTING.step).toBe(1);
    expect(CLASS_SETTING.default).toBe(0);
  });

  it("ships the warrior as pack 0 - the default and, for now, the only pack", () => {
    expect(PACKS[0]).toBe(warriorPack);
    expect(PACKS).toHaveLength(1);
    expect(warriorPack.className).toBe("Warrior");
    /* The presentation bits the pack owns move with it: the title row's
     * label is the warrior's, carried from the archived fork unchanged. */
    expect(warriorPack.titleRowLabel).toBe("New Warrior Borg character");
  });

  it("selects the pack a stored value names, clamping and defaulting by the declaration", () => {
    expect(packForClassValue(0)).toBe(warriorPack);
    /* A missing or non-numeric store resolves to the default: warrior. */
    expect(packForClassValue(undefined)).toBe(warriorPack);
    expect(packForClassValue("mage")).toBe(warriorPack);
    /* Out-of-range values clamp into the declared range - the same mercy
     * resolveWarriorRace shows a moved raceChoice. */
    expect(packForClassValue(7)).toBe(warriorPack);
    expect(packForClassValue(-1)).toBe(warriorPack);
    expect(packForClassValue(2.7)).toBe(warriorPack);
  });

  it("wires the persisted parameter into the plugin, read at each page", () => {
    /* The same pin the warrior pack's own settings.test.ts keeps over its
     * wiring: plugin.ts's only export is the plugin object, so the class
     * resolution is pinned from source. What this asserts is that the stored
     * borg.class value is actually READ (a persisted parameter, not an
     * internal default) and resolved through the declared range, so a change
     * applies to the next rebirth. */
    const wired = readFileSync(new URL("../../plugin.ts", import.meta.url), "utf8");
    expect(wired).toMatch(/mod\.meta\.settings\(\)/u);
    expect(wired).toMatch(/packForClassValue\(read\.value\[CLASS_SETTING\.id\]\)/u);
    expect(wired).toMatch(/activePack\.createPresenter/u);
    expect(wired).toMatch(/label: activePack\.titleRowLabel/u);
  });
});
