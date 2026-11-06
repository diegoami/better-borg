/** Mandos180: remaining package backports, exercised through declared Core APIs. */
import { afterAll, expect, it } from "vitest";
import type * as CoreApi from "@rpgm-tools/neo-angband-core";
import { writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { loadPack, packRoot } from "./play-session.js";

// Comparison-only explicit published-tarball target. Normal verification uses
// the installed published package plus exactly the workspace's named patches.
const proofEntry = process.env["MANDOS_PACKAGE_PROOF_ENTRY"];
const Core: typeof CoreApi = proofEntry
  ? await import(pathToFileURL(proofEntry).href)
  : await import("@rpgm-tools/neo-angband-core");
const root = packRoot();
if (root === null) throw new Error("Engine backport verification requires installed content");
const pack = loadPack(root);
const observations: unknown[] = [];
afterAll(() => {
  const file = process.env["MANDOS_PACKAGE_PROOF_OUTPUT"];
  if (file) writeFileSync(file, JSON.stringify(observations, null, 2) + "\n");
});

it("disturb clears actual run/rest/command continuations and signals the host reset", () => {
  const { state } = Core.startGame(pack, { seed: 432, depth: 1 });
  // Headless sessions gain a host event bus when a frontend subscribes.
  state.events = new Core.GameEvents();
  state.run = { curDir: 6, oldDir: 6, openArea: true, breakRight: false,
    breakLeft: false, running: 9, firstStep: false, stepCount: 2 };
  state.resting = { count: 20, turnsRested: 3 };
  state.cmdQueue = [{ code: "walk", dir: 6 }];
  let flushes = 0;
  // The subscriber is a host reset observer, not a replacement disturb/queue.
  state.events!.on("input-flush", () => { flushes++; });
  Core.disturb(state);
  const result = { flushes, running: state.run.running, stepCount: state.run.stepCount,
    resting: state.resting ?? null, queue: state.cmdQueue };
  observations.push({ name: "input-flush", ...result });
  expect(result).toEqual({ flushes: 1, running: 0, stepCount: 0, resting: null, queue: [] });
});

it("disturb reports a failing input-flush subscriber without undoing queue cancellation", () => {
  const { state } = Core.startGame(pack, { seed: 432, depth: 1 });
  // Headless sessions gain a host event bus when a frontend subscribes.
  state.events = new Core.GameEvents();
  state.cmdQueue = [{ code: "walk", dir: 6 }];
  const fault = new Error("intentional host reset observer failure");
  const reported: string[] = [];
  state.events!.on("input-flush", () => { throw fault; });
  state.onEventFault = (event, error) => { expect(error).toBe(fault); reported.push(event); };
  expect(() => Core.disturb(state)).not.toThrow();
  observations.push({ name: "input-flush-fault", reported, queue: state.cmdQueue });
  expect(reported).toEqual(["input-flush"]);
  expect(state.cmdQueue).toEqual([]);
});

it("fresh births retain the real master seed and pre-generation accepted RNG input", () => {
  const seed = 433;
  const accepted = new Core.Rng(seed).getState();
  const game = Core.startGame(pack, { seed, raceName: "Human", className: "Warrior" });
  const saved = Core.saveGame(game);
  observations.push({ name: "fresh-birth", masterSeed: game.state.masterSeed ?? null,
    acceptedInput: game.state.birthRngState ?? null, savedSeed: saved.masterSeed ?? null });
  expect(game.state.masterSeed).toBe(seed);
  expect(game.state.birthRngState).toEqual(accepted);
  expect(saved.masterSeed).toBe(seed);
  expect(saved.birthRngState).toEqual(accepted);
});

it("accepted host RNG input survives save/load without inventing an unknown master seed", () => {
  const rng = new Core.Rng(433);
  // Legal host name/history draws before birth, separate from game generation.
  for (let draw = 0; draw < 7; draw++) rng.randint0(1000);
  const accepted = rng.getState();
  const game = Core.startGame(pack, { rng, raceName: "Human", className: "Warrior" });
  const saved = Core.saveGame(game);
  const loaded = Core.loadGame(pack, saved);
  observations.push({ name: "accepted-host-input", originalSeed: game.state.masterSeed ?? null,
    savedSeed: saved.masterSeed ?? null, loadedSeed: loaded.state.masterSeed ?? null,
    acceptedInput: game.state.birthRngState ?? null, loadedInput: loaded.state.birthRngState ?? null });
  expect(game.state.masterSeed).toBeUndefined();
  expect(saved.masterSeed).toBeUndefined();
  expect(loaded.state.masterSeed).toBeUndefined();
  expect(game.state.birthRngState).toEqual(accepted);
  expect(loaded.state.birthRngState).toEqual(accepted);
  expect(loaded.state.birthRngState).not.toBe(saved.birthRngState);
  expect(loaded.state.birthRngState!.state).not.toBe(saved.birthRngState!.state);
});

it("legacy and malformed birth provenance remain absent rather than fabricated", () => {
  const game = Core.startGame(pack, { seed: 433 });
  const legacy = Core.saveGame(game);
  delete legacy.masterSeed;
  delete legacy.birthRngState;
  const old = Core.loadGame(pack, legacy);
  const malformed = Core.saveGame(game);
  malformed.birthRngState = { ...new Core.Rng(433).getState(), stateI: 32 };
  const invalid = Core.loadGame(pack, malformed);
  observations.push({ name: "legacy-invalid", legacySeed: old.state.masterSeed ?? null,
    legacyInput: old.state.birthRngState ?? null, invalidInput: invalid.state.birthRngState ?? null });
  expect(old.state.masterSeed).toBeUndefined();
  expect(old.state.birthRngState).toBeUndefined();
  expect(invalid.state.birthRngState).toBeUndefined();
});

it("reincarnation does not mislabel the old character's accepted input as a fresh birth", () => {
  const game = Core.startGame(pack, { seed: 433, raceName: "Human", className: "Warrior" });
  expect(game.state.birthRngState).toBeDefined();
  game.reincarnate();
  observations.push({ name: "reincarnation", birthInput: game.state.birthRngState ?? null });
  expect(game.state.birthRngState).toBeUndefined();
  expect(Core.saveGame(game).birthRngState).toBeUndefined();
});
