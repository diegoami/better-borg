/** Published-Core neutrality and per-life durability ordering; no existing profile. */
import { describe, expect, it } from "vitest";
import * as Core from "@rpgm-tools/neo-angband-core";
import { packForClass } from "../class/registry.js";
import { driveLife, loadPack, observingLife, packRoot, playPackSession } from "../play-session.js";
import { packetText, type DecisionFrame } from "./live-deaths.js";
const pack = loadPack(packRoot()!);
const strategy = packForClass("Mage");
describe("live reporting observation", () => {
  it("leaves all commands, pre-states, terminal facts and both RNG streams identical", () => {
    const run = (record: boolean) => {
      const commands: unknown[] = [], prestates: unknown[] = [], tail: DecisionFrame[] = [];
      const core: typeof Core = { ...Core, installController: ((state, controller, options) => Core.installController(state, (view, act) => {
        const cmd = controller(view, act); commands.push(structuredClone(cmd)); return cmd;
      }, options)) as typeof Core.installController };
      const plan = strategy.planFor(Core, pack);
      const game = Core.startGame(pack, { seed: 3, depth: 0, raceName: plan.raceName, className: strategy.className, roller: "point", birthStats: [...plan.baseStats] });
      const observed = observingLife(core, game, pack, record ? frame => tail.push(frame) : undefined);
      const end = driveLife(core, game, 600, observed, 3, undefined, () => prestates.push({ turn: game.state.turn, hp: game.state.actor.player.chp, sp: game.state.actor.player.csp, grid: { ...game.state.actor.grid } }));
      observed.uninstall();
      return { facts: { commands, prestates, end, turn: game.state.turn, hp: game.state.actor.player.chp, cause: game.state.actor.player.diedFrom, engineRng: game.state.rng.getState(), borgRng: observed.borgRng() }, tail };
    };
    const off = run(false), on = run(true);
    expect(on.facts.end.dead).toBe(true); expect(on.tail.length).toBeGreaterThan(0); expect(packetText(on.facts)).toBe(packetText(off.facts));
    expect(on.tail.at(-1)!.command).toHaveProperty("submission", "not-yet-submitted");
  }, 30000);
  it("awaits each ended-life callback before another boot and preserves the earlier receipt when later export fails", async () => {
    const ended: { life: number; dead: boolean; frames: number }[] = [];
    await expect(playPackSession(Core, pack, strategy, { seeds: [3, 7, 34], capFor: () => 600, captureDecisionTail: true,
      onLifeEnd: async life => { ended.push({ life: life.life, dead: life.dead, frames: life.decisionTail!.length }); if (life.life === 2) throw new Error("synthetic terminal export refusal"); },
    })).rejects.toThrow("synthetic terminal export refusal");
    expect(ended.map(x => x.life)).toEqual([1, 2]); expect(ended[0]!.dead).toBe(true); expect(ended.every(x => x.frames > 0 && x.frames <= 12)).toBe(true);
  }, 30000);
});
