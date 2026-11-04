/**
 * TESTS FOR THE PACK REGISTRY (#15, #16, #17): the dedicated packs, and the
 * generic fallback for every class without one.
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { PACKS, packForClass } from "./registry.js";
import { warriorPack } from "./warrior/index.js";
import { CLASS_ROSTER } from "../birth/pools.js";

describe("the class registry", () => {
  it("ships the warrior as the one dedicated pack", () => {
    expect(PACKS).toEqual([warriorPack]);
    expect(warriorPack.className).toBe("Warrior");
  });

  it("births every other class through the generic pack, by name", () => {
    expect(packForClass("Warrior")).toBe(warriorPack);
    for (const name of CLASS_ROSTER.filter((c) => c !== "Warrior")) {
      const pack = packForClass(name);
      expect(pack.className).toBe(name);
      expect(pack.id).toBe(`generic-${name.toLowerCase()}`);
    }
  });

  it("no longer declares a class index: the class is the pools' toggles", () => {
    const raw = JSON.parse(readFileSync(new URL("../../manifest.json", import.meta.url), "utf8")) as {
      data: { settings?: Array<{ id: string }> };
    };
    expect(raw.data.settings?.map((s) => s.id) ?? []).not.toContain("borg.class");
    const wired = readFileSync(new URL("../../plugin.ts", import.meta.url), "utf8");
    expect(wired).toMatch(/return plannedBirth\(mod, core\);/u);
    expect(wired).toMatch(/label: TITLE_ROW_LABEL,/u);
  });
});
