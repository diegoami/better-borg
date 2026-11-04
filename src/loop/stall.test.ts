/**
 * TESTS FOR THE STALL WATCH (#56): one copy for the mod's tick and the
 * headless harness. The tick's own behaviour is pinned in
 * src/api2/controller.test.ts; these pin the watch itself.
 */

import { describe, expect, it } from "vitest";
import type { AgentCommand } from "@rpgm-tools/neo-angband-core";
import { BorgWorld } from "../world/model.js";
import { BORG_MARK } from "../world/grid.js";
import {
  IDLE_BEFORE_RELEASE,
  STALLS_BEFORE_FORGET,
  STALLS_BEFORE_RELEASE,
  aimedGrid,
  createStallWatch,
  forgetGrid,
  sceneKey,
} from "./stall.js";

const rest = { code: "rest" } as unknown as AgentCommand;
const walkEast = { code: "walk", dir: 6 } as unknown as AgentCommand;

describe("the stall watch", () => {
  it("stalls on the same command against the same scene, at exactly the release count", () => {
    const watch = createStallWatch();
    const steps = Array.from({ length: STALLS_BEFORE_RELEASE + 1 }, () => watch.observe("S", rest));
    expect(steps.slice(0, -1).every((step) => step.stalled === null)).toBe(true);
    expect(steps[STALLS_BEFORE_RELEASE]?.stalled).toEqual({ kind: "repeat", command: "rest" });
  });

  it("asks to forget every STALLS_BEFORE_FORGET repeats, and not before", () => {
    const watch = createStallWatch();
    const forgets = Array.from({ length: 20 }, () => watch.observe("S", walkEast)).map((step, i) => (step.forget ? i : -1)).filter((i) => i >= 0);
    expect(forgets).toEqual([STALLS_BEFORE_FORGET, STALLS_BEFORE_FORGET * 2, STALLS_BEFORE_FORGET * 3]);
  });

  it("never stalls while the scene changes", () => {
    const watch = createStallWatch();
    for (let i = 0; i < STALLS_BEFORE_RELEASE * 3; i++) expect(watch.observe(`S${String(i)}`, rest).stalled).toBeNull();
  });

  it("stalls on no command at the idle count, and a command resets it", () => {
    const watch = createStallWatch();
    for (let i = 0; i < IDLE_BEFORE_RELEASE - 1; i++) expect(watch.observe("", null).stalled).toBeNull();
    watch.observe("S", rest);
    for (let i = 0; i < IDLE_BEFORE_RELEASE - 1; i++) expect(watch.observe("", null).stalled).toBeNull();
    expect(watch.observe("", null).stalled).toEqual({ kind: "idle", command: null });
  });
});

describe("the scene key", () => {
  const view = (turnish: number, hp = 10) => ({
    player: () => ({ grid: { x: 3, y: 4 }, depth: 1, hp, sp: 0, exp: 0, gold: 5, turn: turnish }),
    monsters: () => [{ grid: { x: 5, y: 5 }, hp: 3 }],
  });

  it("ignores the game turn, so a rest that changes nothing else is the same scene", () => {
    expect(sceneKey(view(100))).toBe(sceneKey(view(200)));
  });

  it("changes with hit points", () => {
    expect(sceneKey(view(100, 10))).not.toBe(sceneKey(view(100, 9)));
  });

  it("changes as an affliction wears off, but not with food (#65)", () => {
    const withStatus = (status: Record<string, number>) => ({
      player: () => ({ grid: { x: 3, y: 4 }, depth: 1, hp: 10, sp: 0, exp: 0, gold: 5, status }),
      monsters: () => [],
    });
    expect(sceneKey(withStatus({ confused: 30, food: 5000 }))).not.toBe(sceneKey(withStatus({ confused: 29, food: 5000 })));
    expect(sceneKey(withStatus({ confused: 0, food: 5000 }))).toBe(sceneKey(withStatus({ confused: 0, food: 4999 })));
  });
});

describe("aim and forget", () => {
  it("aims a directional command at its grid, and nothing else", () => {
    expect(aimedGrid(walkEast, { x: 3, y: 4 })).toEqual({ x: 4, y: 4 });
    expect(aimedGrid(rest, { x: 3, y: 4 })).toBeNull();
  });

  it("forgets the grid's terrain and marks", () => {
    const world = new BorgWorld();
    const grid = world.map.at(4, 4);
    grid.feat = 7;
    grid.info |= BORG_MARK;
    forgetGrid(world, 4, 4);
    expect(grid.feat).toBe(0);
    expect(grid.info & BORG_MARK).toBe(0);
  });
});
