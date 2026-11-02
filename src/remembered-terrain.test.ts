/**
 * #415 site pins: every call site upstream named in "the Borg reads live
 * terrain where it should read the remembered map" must follow the
 * REMEMBERED terrain at our pin (mod commit cfd89df, in import 1fa2f8d).
 *
 * The seam is one accessor: borgView().cell (core-api.ts:440) wraps each host
 * cell in rememberedCell (core-api.ts:393), and every BorgContext is built
 * from that wrapped view inside hostController (controller.ts:124). The flow
 * sites read world.map, which ingestMap (perceive.ts:161) writes from the same
 * wrapped accessor; the light sites read ctx.view.cell directly.
 *
 * Each test builds the production chain (host view -> borgView -> perceive ->
 * ctx) with cells whose live terrain differs from what the player remembers,
 * then asserts the site's DECISION follows the remembered value. Remove the
 * rememberedCell wrapper, feed perceive a raw view, or point a site at the
 * host's live cell and the affected tests fail.
 */

import { describe, expect, it } from "vitest";
import type { AgentView, CellView, ItemView, SpellView } from "@rpgm-tools/neo-angband-core";
import { FEAT } from "@rpgm-tools/neo-angband-core";
import { BorgWorld } from "./world/model.js";
import { perceive, makePerceiveMemo } from "./perceive.js";
import { makeScenarioView, makeFakeActions, type Scenario, type ScenarioCell } from "./harness.js";
import { makeBorgRng } from "./rng.js";
import { borgView } from "./core-api.js";
import type { BorgContext } from "./context.js";
import { BI, CLASS_NECROMANCER } from "./trait/trait-index.js";
import { createFlowState } from "./flow/flow.js";
import { borgFlowDarkInteresting } from "./flow/flow-dark.js";
import { borgFlowRecover, borgFlowSpastic } from "./flow/flow-misc.js";
import { borgCheckLightOnly } from "./item/light.js";
import { SVAL, TV } from "./item/index.js";

type Traits = Partial<Record<keyof typeof BI, number>>;

/** A cell spec: the terrain the player remembers vs the live terrain. */
function divergent(
  remembered: { feat: number; passable: boolean },
  live: { feat: number; passable?: boolean; glow?: boolean; inView?: boolean },
): ScenarioCell {
  return {
    feat: live.feat,
    passable: live.passable ?? false,
    glow: live.glow ?? false,
    known: true,
    inView: live.inView ?? false,
    knownFeat: remembered.feat,
    knownPassable: remembered.passable,
  };
}

/** Live == remembered granite: a wall on both readings. */
const granite: ScenarioCell = {
  feat: FEAT.GRANITE,
  passable: false,
  known: true,
  inView: false,
  knownFeat: FEAT.GRANITE,
  knownPassable: false,
};

/** Live == remembered floor, seen, with optional glow. */
const seenFloor = (glow = false): ScenarioCell => ({
  feat: FEAT.FLOOR,
  passable: true,
  glow,
  known: true,
  inView: true,
  knownFeat: FEAT.FLOOR,
  knownPassable: true,
});

/** A complete ItemView from a partial (same defaults as item.test.ts). */
function makeItem(p: Partial<ItemView>): ItemView {
  return {
    handle: 1,
    kindKey: "",
    aware: true,
    nameColor: "",
    label: "item",
    tval: 0,
    sval: 0,
    pval: 0,
    number: 1,
    weight: 0,
    ac: 0,
    toA: 0,
    toH: 0,
    toD: 0,
    dd: 0,
    ds: 0,
    ego: false,
    artifact: false,
    flags: [],
    modifiers: [],
    brands: [],
    slays: [],
    resists: [],
    curses: [],
    egoName: null,
    artifactName: null,
    activation: false,
    timeout: 0,
    inscription: null,
    ...p,
  } as ItemView;
}

/**
 * Build the context the controller builds (controller.ts:124-125): the host
 * view passes through borgView before any Borg code sees it, and perceive
 * ingests the map from that wrapped view. Optional gear lands on the HOST
 * view, before the wrapper, exactly as the engine would deliver it.
 */
function makeRememberingCtx(
  scenario: Scenario,
  traits: Traits = {},
  gear: { inventory?: ItemView[]; spellbooks?: Array<{ tval: number; name: string; realm: string; spells: SpellView[] }> } = {},
): BorgContext {
  const world = new BorgWorld();
  let host: AgentView = makeScenarioView(scenario);
  if (gear.inventory || gear.spellbooks) {
    host = {
      ...host,
      inventory: () => (gear.inventory ?? []).map((i) => ({ ...i })),
      spellbooks: () =>
        (gear.spellbooks ?? []).map((b) => ({ ...b, spells: b.spells.map((s) => ({ ...s })) })),
    };
  }
  const view = borgView(host);
  perceive(world, view, makePerceiveMemo());
  for (const [k, v] of Object.entries(traits)) {
    world.self.trait[BI[k as keyof typeof BI]] = v;
  }
  return { world, view, act: makeFakeActions(), rng: makeBorgRng() };
}

describe("flow-dark.ts:59 - the explore scan reads the remembered map (#415)", () => {
  it("treats a door the player watched close as boring (remembered OPEN, live CLOSED)", () => {
    // The B01 shape: the engine's live terrain says CLOSED, the player's
    // memory still says OPEN. The explore scan must answer from memory.
    const ctx = makeRememberingCtx({
      player: { grid: { x: 20, y: 12 }, depth: 5 },
      cells: { "20,5": divergent({ feat: FEAT.OPEN, passable: true }, { feat: FEAT.CLOSED }) },
    });
    expect(ctx.world.map.at(20, 5).feat).toBe(FEAT.OPEN);
    expect(borgFlowDarkInteresting(ctx, createFlowState(), 5, 20)).toBe(false);
  });

  it("keeps exploring remembered rubble whose live grid is floor", () => {
    // A grid the player remembers as rubble is interesting even when the
    // live terrain is plain floor; a live read would call it boring.
    const ctx = makeRememberingCtx({
      player: { grid: { x: 20, y: 12 }, depth: 5 },
      cells: { "20,5": divergent({ feat: FEAT.RUBBLE, passable: false }, { feat: FEAT.FLOOR, passable: true }) },
    });
    expect(ctx.world.map.at(20, 5).feat).toBe(FEAT.RUBBLE);
    expect(borgFlowDarkInteresting(ctx, createFlowState(), 5, 20)).toBe(true);
  });
});

describe("flow-misc.ts:366 - borgFlowRecover accepts remembered floor only (#415)", () => {
  /** Granite level with one carved corridor; (20,5) is the only happy grid at
   * distance >= 7, and it is a live secret door the player remembers as floor. */
  function corridorCtx(cells: Record<string, ScenarioCell>): BorgContext {
    const carved: Record<string, ScenarioCell> = {
      "20,12": seenFloor(),
      "20,11": seenFloor(),
      "20,10": seenFloor(),
      "20,9": seenFloor(),
      "20,8": seenFloor(),
      "20,7": seenFloor(),
      "20,6": seenFloor(),
      "20,4": seenFloor(),
      ...cells,
    };
    const ctx = makeRememberingCtx(
      { floorFeat: FEAT.GRANITE, player: { grid: { x: 20, y: 12 }, depth: 5 }, cells: carved },
      { CLEVEL: 10, CURHP: 10, MAXHP: 30, LIGHT: 1, FOOD: 10 },
    );
    ctx.world.clock = 10; // past the whenLastKillMult sentinel window
    return ctx;
  }

  it("recovers toward a grid the player remembers as floor under a live secret door", () => {
    const ctx = corridorCtx({
      "20,5": divergent({ feat: FEAT.FLOOR, passable: true }, { feat: FEAT.SECRET }),
    });
    expect(ctx.world.map.at(20, 5).feat).toBe(FEAT.FLOOR);
    const cmd = borgFlowRecover(ctx, createFlowState(), 250);
    expect(cmd).not.toBeNull();
  });

  it("will not recover onto a grid the player remembers as a wall", () => {
    // The cheat direction: live floor under remembered granite. The skip at
    // flow-misc.ts:366 must fire on the remembered feat.
    const ctx = corridorCtx({
      "20,5": divergent({ feat: FEAT.GRANITE, passable: false }, { feat: FEAT.FLOOR, passable: true }),
    });
    expect(ctx.world.map.at(20, 5).feat).toBe(FEAT.GRANITE);
    expect(borgFlowRecover(ctx, createFlowState(), 250)).toBeNull();
  });
});

describe("flow-misc.ts:627,637 - the anti-summon corner scan counts remembered walls (#415)", () => {
  /**
   * The scan can only ever pick the player's own grid: borg_flow_spastic's
   * reverse flow spreads with optimize=true, which stops at the player's own
   * cost-0 origin (borg-flow.c:307), so every other grid reads cost 255 and
   * hits the `cost >= 250` skip. Faithful to the C, and enough for the site:
   * the player's grid qualifies only when (20,11) counts as its wall - wall
   * >= 1 among the S/N/E/W cardinals (:620) and diag >= 2 among the
   * SE/SW/NE/NW diagonals (:637), supplied by the plain granite at (21,13)
   * and (21,11).
   */
  function spasticCtx(north: ScenarioCell): BorgContext {
    return makeRememberingCtx(
      {
        player: { grid: { x: 20, y: 12 }, depth: 10 },
        cells: { "20,11": north, "21,11": granite, "21,13": granite },
      },
      { CDEPTH: 10, CLEVEL: 10 },
    );
  }

  it("picks the search corner using a wall the player remembers (live: dug out)", () => {
    const ctx = spasticCtx(divergent({ feat: FEAT.GRANITE, passable: false }, { feat: FEAT.FLOOR, passable: true }));
    expect(ctx.world.map.at(20, 11).feat).toBe(FEAT.GRANITE);
    const flow = createFlowState();
    borgFlowSpastic(ctx, flow, true);
    expect(flow.spasticX).toBe(20);
    expect(flow.spasticY).toBe(12);
  });

  it("does not build a search corner from a hidden wall the player cannot see", () => {
    // A live secret door under remembered floor must not count as the wall.
    const ctx = spasticCtx(divergent({ feat: FEAT.FLOOR, passable: true }, { feat: FEAT.SECRET }));
    expect(ctx.world.map.at(20, 11).feat).toBe(FEAT.FLOOR);
    const flow = createFlowState();
    expect(borgFlowSpastic(ctx, flow, true)).toBeNull();
    expect(flow.spasticX).toBe(0);
  });
});

describe("light.ts:254 - borgCheckDarkOnly counts remembered glow and passability (#415)", () => {
  /** A necromancer who can cast Create Darkness (sidx 2 in the class ratings). */
  function necromancerCtx(cells: Record<string, ScenarioCell>): BorgContext {
    const darkness: SpellView = {
      name: "Create Darkness",
      sidx: 2,
      bidx: 0,
      level: 1,
      mana: 1,
      fail: 0,
      learned: true,
      worked: true,
      forgotten: false,
      studyEligible: false,
      infoLine: "",
    };
    return makeRememberingCtx(
      { player: { grid: { x: 20, y: 12 }, depth: 5, cls: "Necromancer" }, cells },
      { CLASS: CLASS_NECROMANCER, CDEPTH: 5, CLEVEL: 10, CURSP: 50, MAXSP: 50, LIGHT: 1 },
      {
        inventory: [makeItem({ handle: 9, tval: TV.MAGIC_BOOK, sval: 1 })],
        spellbooks: [{ tval: TV.MAGIC_BOOK, name: "Book of Death", realm: "death", spells: [darkness] }],
      },
    );
  }

  it("casts darkness over eleven glowing floors it can see", () => {
    const cells: Record<string, ScenarioCell> = {};
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) cells[`${20 + dx},${12 + dy}`] = seenFloor(true);
    }
    const cmd = borgCheckLightOnly(necromancerCtx(cells));
    expect(cmd?.code).toBe("cast");
  });

  it("holds darkness when the glowing floors are only seen in memory (out of view)", () => {
    // Upstream's complaint: the 5x5 scan had no known/in-view check. The
    // wrapper supplies it - glow counts only while the square is in view, so
    // out-of-view glow the player merely remembers must not add up to 11.
    const cells: Record<string, ScenarioCell> = {};
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const x = 20 + dx;
        const y = 12 + dy;
        cells[`${x},${y}`] =
          Math.abs(dx) + Math.abs(dy) >= 2
            ? divergent({ feat: FEAT.FLOOR, passable: true }, { feat: FEAT.FLOOR, passable: true, glow: true, inView: false })
            : seenFloor();
      }
    }
    expect(borgCheckLightOnly(necromancerCtx(cells))).toBeNull();
  });

  it("holds darkness when the glowing grids are remembered as walls", () => {
    // In-view glowing grids whose remembered terrain is impassable: the
    // passable the site reads comes from the remembered terrain.
    const cells: Record<string, ScenarioCell> = {};
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const x = 20 + dx;
        const y = 12 + dy;
        cells[`${x},${y}`] =
          Math.abs(dx) + Math.abs(dy) >= 2
            ? divergent({ feat: FEAT.GRANITE, passable: false }, { feat: FEAT.FLOOR, passable: true, glow: true, inView: true })
            : seenFloor();
      }
    }
    expect(borgCheckLightOnly(necromancerCtx(cells))).toBeNull();
  });
});

describe("light.ts:168-169 - cornerScan counts corners by remembered passability (#415)", () => {
  /**
   * Four remembered-open doors the live terrain shows as closed (the B01
   * shape). By memory none is a corner, so the bother-lighting gate passes
   * and the Borg lights the room from its scroll; a live read would count 4
   * corners, refuse, and never reach the scroll.
   */
  function cornersCtx(diagonals: Record<string, ScenarioCell>): BorgContext {
    const scroll = makeItem({ handle: 7, label: "Scroll of Light", tval: TV.SCROLL, sval: SVAL.scroll.light! });
    return makeRememberingCtx(
      { player: { grid: { x: 20, y: 12 }, depth: 5 }, cells: diagonals },
      { CDEPTH: 5, LIGHT: 1 },
      { inventory: [scroll] },
    );
  }

  it("lights the room when the corners are doors remembered as open", () => {
    const ctx = cornersCtx({
      "19,11": divergent({ feat: FEAT.OPEN, passable: true }, { feat: FEAT.CLOSED, inView: true }),
      "21,11": divergent({ feat: FEAT.OPEN, passable: true }, { feat: FEAT.CLOSED, inView: true }),
      "19,13": divergent({ feat: FEAT.OPEN, passable: true }, { feat: FEAT.CLOSED, inView: true }),
      "21,13": divergent({ feat: FEAT.OPEN, passable: true }, { feat: FEAT.CLOSED, inView: true }),
    });
    const cmd = borgCheckLightOnly(ctx);
    expect(cmd?.code).toBe("read");
  });
});
