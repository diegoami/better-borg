/**
 * The uncertainty signal (#27, phase 1): the two places a decision marks
 * itself unsure, and the attack chooser's valuation record that carries the
 * first one.
 *
 * The tie signal is exercised at both ends: the pure window (tieBetween) and
 * the wiring inside borgAttack (the valuation the chooser records for the
 * command it committed). The gap signal reads the Borg's OWN map - a grid it
 * has never observed - against the view's position, so the point names the
 * grid in the world's coordinates.
 */

import { describe, expect, it } from "vitest";
import type { AgentCommand } from "@rpgm-tools/neo-angband-core";
import { BorgWorld } from "./world/model.js";
import { BORG_MARK } from "./world/grid.js";
import { makeScenarioView, makeFakeActions } from "./harness.js";
import { makeBorgRng } from "./rng.js";
import { perceive, makePerceiveMemo } from "./perceive.js";
import { BF } from "./fight/bf.js";
import { borgAttack } from "./fight/attack.js";
import { getDangerGlobals, MONBLOW } from "./danger/index.js";
import { BI } from "./trait/trait-index.js";
import type { MonsterFacts } from "./danger/index.js";
import {
  assessUncertainty,
  aimedAt,
  attackValuationOf,
  methodLabel,
  noteAttackValuation,
  tieBetween,
  type AttackCandidate,
} from "./uncertainty.js";

const candidate = (method: string, score: number): AttackCandidate => ({ method, score });

describe("the tie window", () => {
  it("an exact tie is the purest case: the enum order alone broke it", () => {
    expect(tieBetween(candidate("THRUST", 100), candidate("LAUNCH", 100))).toBe(true);
  });

  it("a runner within the window ties; one outside does not", () => {
    expect(tieBetween(candidate("THRUST", 100), candidate("LAUNCH", 96))).toBe(true);
    expect(tieBetween(candidate("THRUST", 100), candidate("LAUNCH", 93))).toBe(false);
  });

  it("a runner that scored nothing is no runner at all", () => {
    expect(tieBetween(candidate("THRUST", 100), candidate("LAUNCH", 0))).toBe(false);
    expect(tieBetween(candidate("THRUST", 100), null)).toBe(false);
    expect(tieBetween(candidate("THRUST", 0), candidate("LAUNCH", 0))).toBe(false);
  });
});

describe("the method label and the aim", () => {
  it("names a method by the BF enum's own name, unknowns honestly", () => {
    expect(methodLabel(BF.THRUST)).toBe("THRUST");
    expect(methodLabel(BF.LAUNCH)).toBe("LAUNCH");
    expect(methodLabel(9999)).toBe("BF#9999");
  });

  it("names the grid a direction command acts on, and no aim for the rest", () => {
    const at = { x: 20, y: 12 };
    expect(aimedAt({ code: "walk", dir: 6 } as AgentCommand, at)).toEqual({ x: 21, y: 12 });
    expect(aimedAt({ code: "walk", dir: 8 } as AgentCommand, at)).toEqual({ x: 20, y: 11 });
    expect(aimedAt({ code: "walk", dir: 5 } as AgentCommand, at)).toBeNull();
    expect(aimedAt({ code: "rest", args: { count: -2 } } as AgentCommand, at)).toBeNull();
  });
});

describe("assessing one decision", () => {
  /** A view whose player stands at the scenario center, on depth 1, turn 1234. */
  const view = makeScenarioView({ turn: 1234, player: { grid: { x: 20, y: 12 }, depth: 1, hp: 17, maxHp: 40 } });
  const at = { x: 20, y: 12 };

  it("marks the tie: the chooser's own command with the runner inside the window", () => {
    const world = new BorgWorld();
    const command: AgentCommand = { code: "walk", dir: 6 } as AgentCommand;
    noteAttackValuation(world, {
      best: candidate("THRUST", 100),
      runner: candidate("LAUNCH", 96),
      command,
    });
    expect(assessUncertainty(world, view, command)).toEqual({
      kind: "valuation-tie",
      turn: 1234,
      depth: 1,
      at,
      hp: 17,
      chosen: "walk",
      candidates: [candidate("THRUST", 100), candidate("LAUNCH", 96)],
      aim: null,
    });
  });

  it("does not mark a tie for a decision the valuation does not describe", () => {
    /* Identity, not similarity: the recorded valuation is about the attack
     * that was committed; another command - even an equal-looking walk - is
     * another rung's decision. A rest has no aim, so no gap can fire either:
     * only the tie half is under test here. */
    const world = new BorgWorld();
    noteAttackValuation(world, {
      best: candidate("THRUST", 100),
      runner: candidate("LAUNCH", 100),
      command: { code: "walk", dir: 2 } as AgentCommand,
    });
    expect(assessUncertainty(world, view, { code: "rest", args: { count: -2 } } as AgentCommand)).toBeNull();
  });

  it("marks no tie when the chooser had no runner", () => {
    const world = new BorgWorld();
    const command: AgentCommand = { code: "rest", args: { count: -2 } } as AgentCommand;
    noteAttackValuation(world, {
      best: candidate("THRUST", 100),
      runner: null,
      command,
    });
    expect(assessUncertainty(world, view, command)).toBeNull();
  });

  it("marks the gap: a command acting on a grid the Borg's own map never observed", () => {
    const world = new BorgWorld();
    /* A fresh world's map has no marks at all - every grid is unobserved -
     * and the point still stamps position and depth from the VIEW. */
    expect(assessUncertainty(world, view, { code: "walk", dir: 6 } as AgentCommand)).toEqual({
      kind: "known-world-gap",
      turn: 1234,
      depth: 1,
      at,
      hp: 17,
      chosen: "walk",
      candidates: [],
      aim: { x: 21, y: 12 },
    });
  });

  it("marks no gap for a command whose aim the map has observed", () => {
    const world = new BorgWorld();
    world.map.at(21, 12).info |= BORG_MARK;
    expect(assessUncertainty(world, view, { code: "walk", dir: 6 } as AgentCommand)).toBeNull();
  });
});

describe("the chooser's valuation (wired into borgAttack)", () => {
  /** The fight suite's melee scenario: one adjacent monster, warrior traits. */
  function meleeCtx() {
    const world = new BorgWorld();
    const view = makeScenarioView({ monsters: [{ grid: { x: 21, y: 12 } }] });
    perceive(world, view, makePerceiveMemo());
    world.self.trait[BI.WDD] = 2;
    world.self.trait[BI.WDS] = 6;
    world.self.trait[BI.BLOWS] = 1;
    world.self.trait[BI.THN] = 100;
    world.self.trait[BI.CLEVEL] = 10;
    world.self.trait[BI.CDEPTH] = 1;
    world.self.trait[BI.SPEED] = 110;
    world.self.c = { x: 20, y: 12 };
    world.kills.at(1).power = 30;
    world.kills.at(1).awake = true;
    world.map.at(21, 12).info |= 0x08 | 0x20; /* BORG_OKAY | BORG_VIEW */
    const facts: MonsterFacts = {
      rIdx: 1,
      flags: new Set<string>(),
      level: 1,
      sleep: 0,
      spellPower: 0,
      freqInnate: 0,
      freqSpell: 0,
      hasFriends: false,
      blows: [{ dice: 1, sides: 4, effect: MONBLOW.HURT }],
      spells: [],
    };
    getDangerGlobals(world).resolveFacts = () => facts;
    return { world, view, ctx: { world, view, act: makeFakeActions(), rng: makeBorgRng() } };
  }

  it("records the committed command's valuation, keyed by the command itself", () => {
    const { world, view, ctx } = meleeCtx();
    const cmd = borgAttack(ctx);
    expect(cmd).not.toBeNull();
    const valuation = attackValuationOf(world);
    expect(valuation).not.toBeNull();
    expect(valuation!.command).toBe(cmd);
    expect(valuation!.best.method).toBe("THRUST");
    expect(valuation!.best.score).toBeGreaterThan(0);
  });

  it("records nothing for a pass that committed no attack", () => {
    const { world, ctx } = meleeCtx();
    ctx.world.kills.count = 0; /* no monsters: the chooser yields at once */
    expect(borgAttack(ctx)).toBeNull();
    expect(attackValuationOf(world)).toBeNull();
  });

  it("leaves a sure melee decision unmarked", () => {
    /* One attack method available, no runner: the decision is sure, the
     * journal stays quiet - and the map knows the target grid, so no gap. */
    const { world, view, ctx } = meleeCtx();
    const cmd = borgAttack(ctx);
    expect(assessUncertainty(world, view, cmd!)).toBeNull();
  });
});
