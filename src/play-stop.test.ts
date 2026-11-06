/** Mandos47: actual Core/Borg boundary, not a natural long-life seed claim. */
import { afterAll, afterEach, expect, it, vi } from "vitest";
import * as Core from "@rpgm-tools/neo-angband-core";
import { writeFileSync } from "node:fs";
import * as Think from "./think.js";
import { loadPack, packRoot, observingLife, driveLife } from "./play-session.js";
import type { BorgContext } from "./context.js";
const root = packRoot();
if (root === null) throw new Error("Stopped-life controls require installed content");
const pack = loadPack(root);
const records: unknown[] = [];
afterAll(() => { const path = process.env["MANDOS_STOP_PROOF_OUTPUT"]; if (path) writeFileSync(path, JSON.stringify(records, null, 2) + "\n"); });
afterEach(() => vi.restoreAllMocks());

function fixture(mode: "clock" | "wrap" | "idle" | "transient" | "normal") {
  const game = Core.startGame(pack, { seed: 47, depth: 1, raceName: "Human", className: "Warrior" });
  for (const monster of [...game.state.monsters]) if (monster) Core.deleteMonster(game.state, monster.midx);
  const original = Think.think;
  const calls: Array<{ enteredClock: number; preparedClock: number; afterClock: number; reset: boolean; command: string | null }> = [];
  let requests = 0;
  vi.spyOn(Think, "think").mockImplementation((ctx: BorgContext) => {
    const enteredClock = ctx.world.clock;
    requests++;
    // Test-only agent-model boundary preparation AFTER the real controller's
    // level initialization. The actual Think implementation/guard still runs.
    if (mode === "clock" && requests === 1) ctx.world.clock = 30000;
    if (mode === "wrap" && requests === 1) ctx.world.clock = 12000;
    const preparedClock = ctx.world.clock;
    // Separate synthetic controller CONTRACT controls; these are not claimed
    // as natural default gameplay or the actual clock-stop reproduction.
    const command = mode === "idle" || (mode === "transient" && requests === 1) ? null : original(ctx);
    calls.push({ enteredClock, preparedClock, afterClock: ctx.world.clock, reset: ctx.world.resetLevel, command: command?.code ?? null });
    return command;
  });
  const life = observingLife(Core, game, pack);
  function measure(cap: number) {
    const before = { turn: game.state.turn, hp: game.state.actor.player.chp };
    let result: ReturnType<typeof driveLife> | undefined, error: string | null = null;
    try { result = driveLife(Core, game, cap, life, 47); }
    catch (e) { error = e instanceof Error ? e.message : String(e); }
    const outcome = { mode, cap, before, after: { turn: game.state.turn, hp: game.state.actor.player.chp },
      calls, commands: { ...life.commands }, trailLength: life.trail.length, stall: life.stall, result, error };
    records.push(outcome);
    return outcome;
  }
  return { game, life, calls, measure };
}

it("retains an actual clock-stop reply rather than throwing away the life", () => {
  const f = fixture("clock");
  try {
    const result = f.measure(1);
    expect(result.calls).toHaveLength(1);
    expect(result.calls[0]).toMatchObject({ enteredClock: 1000, preparedClock: 30000, command: null });
    expect(result.commands).toEqual({});
    expect(result.error).toBeNull();
  } finally { f.life.uninstall(); }
});

it("the current 12000 reset window prevents the old unbounded-clock story", () => {
  const f = fixture("wrap");
  try {
    const result = f.measure(2);
    expect(result.error).toBeNull();
    expect(result.calls[0]).toMatchObject({ preparedClock: 12000, reset: true, command: "hold" });
    expect(result.calls[1]!.enteredClock).toBe(1000);
    expect(Object.values(result.commands).reduce((a,b) => a+b,0)).toBe(2);
  } finally { f.life.uninstall(); }
});

it("a temporary no-command reply does not terminate at its first null", () => {
  const f = fixture("transient");
  try {
    const result = f.measure(2);
    expect(result.calls).toHaveLength(2);
    expect(result.calls[0]!.command).toBeNull();
    expect(result.calls[1]!.command).not.toBeNull();
    expect(result.error).toBeNull();
  } finally { f.life.uninstall(); }
});

it("retains the existing 25-idle stop contract without losing its record", () => {
  const f = fixture("idle");
  try {
    const result = f.measure(30);
    expect(result.calls).toHaveLength(25);
    expect(result.stall).toMatchObject({ kind: "idle", decision: 25 });
    expect(result.error).toBeNull();
  } finally { f.life.uninstall(); }
});

it("unarmed input waits are not counted as Borg requests", () => {
  const f = fixture("normal");
  try {
    Core.runGameLoop(f.game.state, f.game.registry);
    expect(f.calls).toEqual([]);
    expect(f.life.commands).toEqual({});
    const result = f.measure(1);
    expect(result.error).toBeNull();
    expect(result.calls).toHaveLength(1);
    expect(Object.values(result.commands).reduce((a,b) => a+b,0)).toBe(1);
  } finally { f.life.uninstall(); }
});

it("still rejects an independently corrupted command census", () => {
  const f = fixture("normal");
  try {
    f.life.commands["__intentional_test_corruption__"] = 1;
    const result = f.measure(1);
    expect(result.error).toMatch(/the census counts 2 commands over 1 decisions/u);
  } finally { f.life.uninstall(); }
});
