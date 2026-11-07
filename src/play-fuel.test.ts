/** Mandos198: declared public lamp fuel must survive the headless adapter. */
import { afterAll, afterEach, expect, it, vi } from "vitest";
import { writeFileSync } from "node:fs";
import * as Core from "@rpgm-tools/neo-angband-core";
import type { KnownItem } from "@rpgm-tools/neo-angband-mod-sdk";
import * as Think from "./think.js";
import { loadPack, packRoot, playPackSession } from "./play-session.js";
import { packForClass } from "./class/registry.js";
import { BI } from "./trait/trait-index.js";
import { itemView } from "./api2/world.js";
const root = packRoot();
if (!root) throw Error("The public lamp regression requires installed content");
const pack = loadPack(root);
const records: unknown[] = [];
afterEach(() => vi.restoreAllMocks());
afterAll(() => { const target = process.env["MANDOS_FUEL_PROOF_OUTPUT"]; if (target) writeFileSync(target, JSON.stringify(records, null, 2) + "\n"); });
it("keeps the actual born Mage's publicly described lamp fuel through playView", async () => {
  let known: ReturnType<typeof Core.buildKnownWorld> | undefined;
  const observedCore: typeof Core = { ...Core, buildKnownWorld(state, deps) {
    const result = Core.buildKnownWorld(state, deps);
    known ??= result;
    return result; // Observation only: no input, result, state or RNG mutation.
  } };
  let first: unknown;
  const original = Think.think;
  vi.spyOn(Think, "think").mockImplementation(ctx => {
    const shadow = first === undefined ? ctx.view.simulateLoadout?.({}) : undefined;
    first ??= { sameLampTimeout: shadow?.after.equipment.find(i => i?.flags.includes("LIGHT_2"))?.timeout,
      shadowPlayerLight: shadow?.after.player.light, playerLight: ctx.view.player().light, borgLight: ctx.world.self.trait[BI.LIGHT],
      equipment: ctx.view.equipment().map(i => i && ({ label: i.label, timeout: i.timeout, flags: i.flags, modifiers: i.modifiers })) };
    return original(ctx);
  });
  const cap = Number(process.env["MANDOS_FUEL_DIAGNOSTIC_CAP"] ?? "1");
  const result = await playPackSession(observedCore, pack, packForClass("Mage"), { seeds: [3], capFor: () => cap });
  const lamp = known!.equipment!.find(i => i?.flags.includes("LIGHT_2"))!;
  const converted = itemView(lamp as KnownItem);
  records.push({ name: "actual-public-fuel", seed: 3, cap, knownPlayerLight: known!.player!.light,
    knownLamp: lamp, converted: { label: converted.label, timeout: converted.timeout }, first,
    life: result.lives[0] });
  expect(lamp).toBeDefined();
  expect(lamp.fuel).toBeGreaterThan(0);
  expect(converted.timeout).toBeGreaterThan(0);
  expect(first).toMatchObject({ playerLight: 2, borgLight: 2, shadowPlayerLight: 2, sameLampTimeout: converted.timeout });
}, 300000);
it("does not invent fuel for an actually exhausted registered birth torch", () => {
  const game = Core.startGame(pack, { seed: 3, depth: 0, raceName: "Human", className: "Mage" });
  const { state } = game;
  const lamp = state.gear!.store.get(state.actor.player.equipment[5]!)!;
  expect(lamp.kind.name).toBe("& Wooden Torch~");
  lamp.timeout = 0; // Prepared legal object state; no natural burn-down claim.
  const publicWorld = Core.buildKnownWorld(state, { reg: game.booted.registries.objects,
    describe: obj => Core.describeObject(state, obj, Core.ODESC.PREFIX | Core.ODESC.FULL) });
  const known = publicWorld.equipment![5]!;
  const converted = itemView(known as KnownItem);
  expect(known.fuel).toBe(0); expect(converted.timeout).toBe(0);
  records.push({ name: "prepared-spent-control", knownLamp: known, timeout: converted.timeout });
});
