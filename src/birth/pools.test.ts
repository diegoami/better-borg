/**
 * TESTS FOR THE BIRTH POOLS (#16, #17): one toggle per class and per race,
 * each birth drawn from the ones switched on, deterministically.
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { validateManifest, type PackRule, type PackSetting } from "@rpgm-tools/neo-angband-mod-sdk";
import {
  CLASS_ROSTER,
  CLASS_RULES,
  RACE_ROSTER,
  RACE_RULES,
  classFlag,
  drawIndex,
  raceFlag,
  resolveBirthPair,
  type BirthPoolInput,
} from "./pools.js";
import { REPLAY_DEATH_SETTING, REPLAY_RELEASE_SETTING } from "../loop/replay.js";
import { STAGE_CLVL_SETTING, STAGE_DEPTH_SETTING } from "../loop/stage.js";

const quiet = (): void => {};

const input = (over: Partial<BirthPoolInput> = {}): BirthPoolInput => ({
  flags: {},
  lineage: 0,
  gameClasses: null,
  gameRaces: null,
  ...over,
});

/** Every toggle of one roster off except the named ones. */
function only(roster: readonly string[], flagOf: (name: string) => string, keep: readonly string[]): Record<string, boolean> {
  return Object.fromEntries(roster.map((name) => [flagOf(name), keep.includes(name)]));
}

const manifest = (): { rules?: readonly PackRule[]; settings?: readonly PackSetting[] } =>
  validateManifest(JSON.parse(readFileSync(new URL("../../manifest.json", import.meta.url), "utf8"))) as {
    rules?: readonly PackRule[];
    settings?: readonly PackSetting[];
  };

describe("the rosters", () => {
  it("are the game's own classes and races, in its record order", () => {
    /* The content package the harness plays (#46): a game that adds or
     * reorders a class shows up here, not as a silently missing toggle. */
    const require = createRequire(import.meta.url);
    const names = (table: string): string[] =>
      (require(`@rpgm-tools/neo-angband-content/pack/${table}.json`) as { records: { name: string }[] }).records.map((r) => r.name);
    expect([...CLASS_ROSTER]).toEqual(names("class"));
    expect([...RACE_ROSTER]).toEqual(names("p_race"));
  });
});

describe("the manifest declarations", () => {
  it("declares one toggle per class and per race, all on, exactly as the pools read them", () => {
    const rules = manifest().rules ?? [];
    for (const rule of [...CLASS_RULES, ...RACE_RULES]) {
      expect(rules.find((r) => r.flag === rule.flag)).toEqual(rule);
      expect(rule.default).toBe(true);
    }
    expect(CLASS_RULES.map((r) => r.title)).toEqual(CLASS_ROSTER.map((n) => `Class: ${n}`));
    expect(RACE_RULES.map((r) => r.title)).toEqual(RACE_ROSTER.map((n) => `Race: ${n}`));
    expect(raceFlag("Half-Elf")).toBe("borg.raceHalfElf");
    expect(classFlag("Blackguard")).toBe("borg.classBlackguard");
  });

  it("no longer declares the warrior race settings", () => {
    const rules = manifest().rules ?? [];
    expect(rules.map((r) => r.flag)).not.toContain("borg.raceRandom");
    /* The numeric table is exactly the stage and replay rows now (pinned
     * the same way in src/loop/stage.test.ts and src/loop/replay.test.ts). */
    expect(manifest().settings).toEqual([STAGE_CLVL_SETTING, STAGE_DEPTH_SETTING, REPLAY_RELEASE_SETTING, REPLAY_DEATH_SETTING]);
  });
});

describe("the draw", () => {
  it("is a pure function of the lineage counter", () => {
    for (let lineage = 0; lineage < 50; lineage++) {
      expect(resolveBirthPair(input({ lineage }), quiet)).toEqual(resolveBirthPair(input({ lineage }), quiet));
    }
  });

  it("reaches every class and every race with all toggles on", () => {
    const pairs = Array.from({ length: 400 }, (_v, lineage) => resolveBirthPair(input({ lineage }), quiet));
    expect(new Set(pairs.map((p) => p.className))).toEqual(new Set(CLASS_ROSTER));
    expect(new Set(pairs.map((p) => p.raceName))).toEqual(new Set(RACE_ROSTER));
  });

  it("draws the class and the race independently from one counter", () => {
    /* Not the same index walk for both: over a run of counters the pairs
     * are not a fixed class-to-race mapping. */
    const pairs = Array.from({ length: 200 }, (_v, lineage) => resolveBirthPair(input({ lineage }), quiet));
    const racesOfWarrior = new Set(pairs.filter((p) => p.className === "Warrior").map((p) => p.raceName));
    expect(racesOfWarrior.size).toBeGreaterThan(3);
  });

  it("draws only from the toggles switched on", () => {
    const flags = {
      ...only(CLASS_ROSTER, classFlag, ["Mage", "Priest"]),
      ...only(RACE_ROSTER, raceFlag, ["Dwarf", "Gnome", "Kobold"]),
    };
    for (let lineage = 0; lineage < 100; lineage++) {
      const pair = resolveBirthPair(input({ flags, lineage }), quiet);
      expect(["Mage", "Priest"]).toContain(pair.className);
      expect(["Dwarf", "Gnome", "Kobold"]).toContain(pair.raceName);
    }
  });

  it("pins a class or race when exactly one is on", () => {
    const flags = { ...only(CLASS_ROSTER, classFlag, ["Ranger"]), ...only(RACE_ROSTER, raceFlag, ["High-Elf"]) };
    for (let lineage = 0; lineage < 20; lineage++) {
      expect(resolveBirthPair(input({ flags, lineage }), quiet)).toMatchObject({ className: "Ranger", raceName: "High-Elf" });
    }
  });

  it("treats an empty pool as the whole roster, and says so", () => {
    const logs: string[] = [];
    const pair = resolveBirthPair(input({ flags: only(CLASS_ROSTER, classFlag, []) }), (m) => logs.push(m));
    expect(pair.classPool).toEqual([...CLASS_ROSTER]);
    expect(logs.some((m) => m.includes("every class toggle is off"))).toBe(true);
  });

  it("leaves out a name the live game does not define", () => {
    const logs: string[] = [];
    const pair = resolveBirthPair(input({ gameRaces: RACE_ROSTER.filter((r) => r !== "Kobold") }), (m) => logs.push(m));
    expect(pair.racePool).not.toContain("Kobold");
    expect(logs.some((m) => m.includes("does not define the race Kobold"))).toBe(true);
  });

  it("logs one decision line naming the pair and the counter", () => {
    const logs: string[] = [];
    const pair = resolveBirthPair(input({ lineage: 5 }), (m) => logs.push(m));
    expect(logs).toEqual([
      `the Borg's next character will be a ${pair.raceName} ${pair.className} (class drawn from 9 classes, race drawn from 11 races, lineage 5)`,
    ]);
  });

  it("keeps the T09 hash: the finalizer's walk is unchanged", () => {
    /* The same values the warrior race draw pinned over its four-race list. */
    expect(Array.from({ length: 8 }, (_v, i) => drawIndex(i, 4))).toEqual([0, 1, 0, 2, 0, 3, 1, 0]);
  });
});

describe("the wiring", () => {
  const wired = (): string => readFileSync(new URL("../class/birth.ts", import.meta.url), "utf8");

  it("resolves the pair at show, from the flags, the counter and the game's names", () => {
    expect(wired()).toMatch(/resolveBirthPair\(\s*\{ flags: mod\.meta\.flags, lineage, gameClasses, gameRaces \}/u);
  });

  it("reads the counter once per page and bumps it after each drawn birth", () => {
    expect(wired()).toMatch(/readLineage\(mod\.store\.install\)/u);
    expect(wired()).toMatch(/bumpLineage\(mod\.store\.install\)/u);
  });
});
