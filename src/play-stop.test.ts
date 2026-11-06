/** Mandos47: actual Core/Borg boundary, not a natural long-life seed claim. */
import { afterAll, afterEach, expect, it, vi } from "vitest";
import * as Core from "@rpgm-tools/neo-angband-core";
import { writeFileSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import * as Think from "./think.js";
import * as Controller from "./controller.js";
import { packForClass } from "./class/registry.js";
import { writeSessionRecord, runOutcome, type SessionRecord } from "./run-record.js";
import { loadPack, packRoot, observingLife, driveLife, playSession, playPackSession } from "./play-session.js";
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
    expect(result.result).toMatchObject({ taken: 0, attempts: 1, noCommandReplies: 1, stopped: "clock overflow (Borg clock 30000)" });
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
    expect(result.result).toMatchObject({ taken: 1, attempts: 2, noCommandReplies: 1, stopped: null });
  } finally { f.life.uninstall(); }
});

it("retains the existing 25-idle stop contract without losing its record", () => {
  const f = fixture("idle");
  try {
    const result = f.measure(30);
    expect(result.calls).toHaveLength(25);
    expect(result.stall).toMatchObject({ kind: "idle", decision: 25 });
    expect(result.error).toBeNull();
    expect(result.result).toMatchObject({ taken: 0, attempts: 25, noCommandReplies: 25, stopped: null });
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

it("a one-call budget cannot grow into extra idle retries", () => {
  const f = fixture("idle");
  try {
    const result = f.measure(1);
    expect(result.error).toBeNull();
    expect(result.calls).toHaveLength(1);
    expect(result.stall).toBeNull();
    expect(result.result).toMatchObject({ taken: 0, attempts: 1, noCommandReplies: 1, stopped: null });
  } finally { f.life.uninstall(); }
});

it("a later real decision clears an old diagnostic instead of falsely stopping", () => {
  const factory = vi.spyOn(Controller, "createBorg");
  const f = fixture("normal");
  try {
    const borg = factory.mock.results[0]!.value as Controller.Borg;
    borg.world.stopReason = "stale diagnostic from an earlier decision";
    const result = f.measure(1);
    expect(result.error).toBeNull();
    expect(result.result).toMatchObject({ taken: 1, attempts: 1, noCommandReplies: 0, stopped: null });
  } finally { f.life.uninstall(); }
});

it("writes the stopped live character honestly and does not reincarnate it", () => {
  const original = Think.think;
  vi.spyOn(Think, "think").mockImplementation(ctx => { ctx.world.clock = 30000; return original(ctx); });
  const session = playSession(Core, pack, { seed: 47, decisions: 4, lives: 2 });
  expect(session.runs).toHaveLength(1);
  const run = session.runs[0]!;
  expect(run).toMatchObject({ seed: 47, dead: false, causeOfDeath: null, decisions: 0,
    commands: {}, attempts: 1, noCommandReplies: 1, stopped: "clock overflow (Borg clock 30000)" });
  const record: SessionRecord = {
    label: "stopped-life-contract", recorded: "2026-11-06T00:00:00.000Z",
    runner: { tool: "tools/runs.mjs", decisions: 4, seeds: [47], lives: 1, stage: null },
    build: { commit: null, engine: "published beta.3", content: "published beta.3", borg: "actual Borg clock boundary" },
    runs: session.runs,
  };
  const directory = mkdtempSync(join(tmpdir(), "mandos-stop-record-"));
  try {
    const paths = writeSessionRecord(join(directory, "record"), record);
    const stored = JSON.parse(readFileSync(paths.runsPath, "utf8")).runs[0];
    expect(stored).toMatchObject({ seed: 47, decisions: 0, commands: {}, attempts: 1,
      noCommandReplies: 1, stopped: run.stopped, dead: false, causeOfDeath: null, turns: run.turns });
    expect(runOutcome(run)).toBe("STOPPED: clock overflow (Borg clock 30000) (0 commands / 1 armed attempts)");
    expect(readFileSync(paths.summaryPath, "utf8")).toContain("47.1: clock overflow");
    records.push({ name: "actual-driver-record", run, stored, text: runOutcome(run) });
  } finally { rmSync(directory, { recursive: true, force: true }); }
});

it("preserves a real default death and its command-only record shape", async () => {
  const outcome = await playPackSession(Core, pack, packForClass("Mage"), { seeds: [3], capFor: () => 600 });
  const life = outcome.lives[0]!;
  expect(life.dead).toBe(true);
  expect(life.causeOfDeath).toBe("a kobold shaman");
  expect(life.decisions).toBe(116);
  expect(Object.values(life.commands).reduce((a,b) => a+b,0)).toBe(life.decisions);
  for (const key of ["attempts", "noCommandReplies", "stopped"]) expect(life).not.toHaveProperty(key);
  records.push({ name: "real-death-control", seed: life.seed, decisions: life.decisions, turns: life.turns,
    dead: life.dead, cause: life.causeOfDeath, commands: life.commands, outcome: runOutcome(life) });
}, 300000);

it("optional caller reports with unknown attempts do not invent a count", () => {
  expect(runOutcome({ dead: false, causeOfDeath: null, stopped: "caller-supplied stop",
    retired: false, stageAttained: false, decisions: 2 })).toContain("? armed attempts");
});

it("a stalled pack chain names its idle reason instead of claiming cap survival", async () => {
  vi.spyOn(Think, "think").mockReturnValue(null);
  const messages: string[] = [];
  const session = await playPackSession(Core, pack, packForClass("Warrior"), {
    seeds: [47, 48], capFor: () => 30, log: message => messages.push(message),
  });
  expect(session.lives).toHaveLength(1);
  expect(session.lives[0]).toMatchObject({ dead: false, decisions: 0, attempts: 25,
    noCommandReplies: 25, stall: { kind: "idle", decision: 25 } });
  expect(session.lives[0]).not.toHaveProperty("stopped");
  expect(messages.join("\n")).toContain("stalled (idle)");
  expect(messages.join("\n")).not.toContain("survived its slice");
});
