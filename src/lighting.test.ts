import { describe, expect, it } from "vitest";
import { FEAT, type ItemView } from "@rpgm-tools/neo-angband-core";
import { BorgWorld } from "./world/model.js";
import { BORG_LIGHT } from "./world/grid.js";
import { BI } from "./trait/index.js";
import { perceive, makePerceiveMemo } from "./perceive.js";
import { makeScenarioView } from "./harness.js";

const lamp: ItemView = {
  handle: 1, kindKey: "", aware: true, nameColor: "", label: "lantern",
  tval: 0, sval: 0, pval: 0, number: 1, weight: 0, ac: 0, toA: 0,
  toH: 0, toD: 0, dd: 0, ds: 0, ego: false, artifact: false,
  flags: [], modifiers: [], brands: [], slays: [], resists: [], curses: [],
  egoName: null, artifactName: null, activation: false, timeout: 5000,
  inscription: null,
};

function scenario(radius: number, westWall = false) {
  const world = new BorgWorld();
  world.self.trait[BI.LIGHT] = radius;
  const base = makeScenarioView({
    player: { grid: { x: 10, y: 10 }, depth: 1 },
    ...(westWall ? { cells: { "8,10": { feat: FEAT.GRANITE } } } : {}),
  });
  const view = { ...base, equipment: () => [null, null, null, null, null, lamp] };
  perceive(world, view, makePerceiveMemo());
  return { world, view };
}

describe("west-side light coverage (#87, borg-rs C bug 4)", () => {
  it.each([2, 3, 5])("mirrors east/west coverage in an open room at radius %i", (radius) => {
    const { world } = scenario(radius);
    // The two west shoulders are within the lantern's reach, just like east.
    expect(world.map.at(8, 9).info & BORG_LIGHT).not.toBe(0);
    expect(world.map.at(8, 11).info & BORG_LIGHT).not.toBe(0);
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = 0; dx <= radius; dx++) {
        expect(world.map.at(10 - dx, 10 + dy).info & BORG_LIGHT,
          `east/west reflection at offset ${dx},${dy}`).toBe(
          world.map.at(10 + dx, 10 + dy).info & BORG_LIGHT,
        );
      }
    }
  });

  it("still blocks the west arm when the grid two west is a wall", () => {
    const { world } = scenario(2, true);
    expect(world.map.at(8, 9).info & BORG_LIGHT).toBe(0);
    expect(world.map.at(8, 11).info & BORG_LIGHT).toBe(0);
    expect(world.map.at(12, 9).info & BORG_LIGHT).not.toBe(0);
    expect(world.map.at(12, 11).info & BORG_LIGHT).not.toBe(0);
  });
});
