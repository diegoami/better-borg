/** Evidence-only qualification. No policy change; Core truth never feeds the Borg view. */
import * as Core from "@rpgm-tools/neo-angband-core";
import { MOD_API2_VERSION } from "@rpgm-tools/neo-angband-mod-sdk";
import type { ModApi2 } from "@rpgm-tools/neo-angband-mod-sdk";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { strict as assert } from "node:assert";
import { bindCore } from "../../src/core-api.js";
import { packRoot, loadPack } from "../../src/play-session.js";
import { readWorld } from "../../src/api2/world.js";
import { gameConstants, gradeFloors, trapKinds, kindCosts } from "../../src/api2/records.js";
import { RaceBook, ActivationBook, LoadoutBook } from "../../src/api2/caches.js";
import { BorgWorld } from "../../src/world/model.js";
import { borgNotice } from "../../src/trait/trait.js";
import { perceive, makePerceiveMemo } from "../../src/perceive.js";
import { makeFakeActions } from "../../src/harness.js";
import { makeBorgRng } from "../../src/rng.js";
import { buildThinkSession, primeSession } from "../../src/think-session.js";
import { borgFlowGlyph } from "../../src/flow/flow-glyph.js";
import type { BorgContext } from "../../src/context.js";

bindCore(Core);
const root = packRoot();
assert(root, "published content required");
const pack = loadPack(root);
const rows: unknown[] = [];
let primaryFailures = 0;
const cases = [
  { name: "Rune on ordinary floor", feat: Core.FEAT.FLOOR, rune: true },
  { name: "Rune on open doorway", feat: Core.FEAT.OPEN, rune: true },
  { name: "Rune on broken doorway", feat: Core.FEAT.BROKEN, rune: true },
  { name: "Unrelated Light scroll on floor", feat: Core.FEAT.FLOOR, rune: false },
];
for (const c of cases) {
  const game = Core.startGame(pack, { seed: 118, depth: 40, raceName: "Human", className: "Warrior" });
  const { state } = game, reg = game.booted.registries;
  for (const mon of [...state.monsters]) if (mon) Core.deleteMonster(state, mon.midx);
  const here = { x: 100, y: 30 };
  for (let y = here.y - 5; y <= here.y + 5; y++) for (let x = here.x - 5; x <= here.x + 5; x++) {
    state.chunk.setFeat({ x, y }, Core.FEAT.FLOOR);
    state.chunk.sqinfoOn({ x, y }, Core.SQUARE.GLOW);
  }
  state.chunk.setFeat(here, c.feat);
  Core.placePlayer(state, here); state.updateFov?.(state);
  const kind = reg.objects.kinds.find(k => k.tval === Core.TV.SCROLL && (c.rune ? k.sval === 33 : k.name === "Light"));
  assert(kind, "real scroll kind missing");
  const obj = Core.objectPrep(state.rng, reg.objects, reg.constants, kind, 60, "maximise");
  obj.number = 12; obj.notice |= Core.OBJ_NOTICE.ASSESSED;
  game.flavor.setAware(kind); Core.playerLearnAllRunes(state.actor.player, state.runeEnv);
  const gear = state.gear!, handle = Core.gearAdd(gear, obj);
  gear.pack.push(handle); gear.inven = [...gear.pack];
  state.actor.player.upkeep.totalWeight = Core.gearTotalWeight(gear);
  const messages: string[] = [];
  let messageCursor = 0;
  state.msg = text => { messages.push(text); };
  const content = { records: async (name: string) => ({ ok: true as const, value: JSON.parse(readFileSync(join(root, name + ".json"), "utf8")).records }) };
  const api = { content, view: { world: async () => ({ ok: true as const, value: Core.buildKnownWorld(state, { reg: reg.objects }) }) } } as unknown as ModApi2;
  const statics = { constants: await gameConstants(api), floors: await gradeFloors(api), trapKinds: await trapKinds(api), kindCosts: await kindCosts(api) };
  const reads = { statics, races: new RaceBook(), activations: new ActivationBook(), loadouts: new LoadoutBook(), truth: null, messages: undefined };
  const world = new BorgWorld(), memo = makePerceiveMemo(), session = buildThinkSession();
  const ctx: BorgContext = { view: (await readWorld(api, reads))!.view, world, act: makeFakeActions(), rng: makeBorgRng(1) };
  const refresh = async () => {
    const adapted = await readWorld(api, reads); assert(adapted);
    ctx.view = { ...adapted.view, messages: () => { const batch = messages.slice(messageCursor); messageCursor = messages.length; return batch; } };
    borgNotice(ctx); perceive(world, ctx.view, memo); primeSession(session, ctx);
  };
  await refresh();
  const flow = session.flow.state;
  // Prepared arrival contract only: not evidence autonomous flow selects a doorway.
  flow.glyphX = here.x; flow.glyphY = here.y;
  const command = borgFlowGlyph(ctx, flow);
  const before = { warded: Core.squareIsWarded(state, here), track: flow.glyph.num, glyph: world.map.at(here.x, here.y).glyph, quantity: obj.number };
  assert.equal(before.warded, false);
  if (c.rune) assert.deepEqual(command, { code: "read", args: { handle } });
  else assert.equal(command, null);
  const requested = command ?? { code: "read" as const, args: { handle } };
  const energy = game.registry.get("read")!(state, requested);
  const emitted = [...messages];
  await refresh();
  const known = Core.buildKnownWorld(state, { reg: reg.objects });
  const remembered = known.level?.cells.find(cell => cell.x === here.x && cell.y === here.y)?.remembered;
  const publicTrap = remembered?.traps ?? [];
  const after = { warded: Core.squareIsWarded(state, here), track: flow.glyph.num, glyph: world.map.at(here.x, here.y).glyph, quantity: gear.store.get(handle)?.number ?? 0 };
  assert.equal(energy, 100, "actual registered read energy");
  assert.equal(after.warded, c.rune && c.feat === Core.FEAT.FLOOR);
  if (c.rune && c.feat === Core.FEAT.FLOOR) {
    assert(publicTrap.some(trap => trap.name === "glyph of warding"), "accepted glyph must be in public memory");
    assert.equal(after.quantity, 11);
    if (!after.glyph) primaryFailures++;
  } else if (c.rune) {
    assert(emitted.includes("There is no clear floor on which to cast the spell."));
    assert.equal(after.quantity, 12); // Actual Neo refusal does not consume this recognized scroll.
    assert.equal(publicTrap.length, 0);
  } else {
    assert.equal(after.quantity, 11); assert.equal(after.glyph, false); assert.equal(after.track, 0);
  }
  const nextCommand = borgFlowGlyph(ctx, flow);
  const publicResult = { terrain: remembered?.feat, traps: publicTrap };
  rows.push({ name: c.name, setup: "prepared real-flow arrival, not autonomous doorway reachability", command, requested, energy, before, messages: emitted,
    publicKnownWorld: publicResult, after, subsequentFlow: { command: nextCommand, target: { x: flow.glyphX, y: flow.glyphY }, track: flow.glyph.num },
    observations: { acceptedRuneObservedAsGlyph: !c.rune || !after.warded || after.glyph,
      preparedRefusalLeavesNoOptimisticEntry: !c.rune || after.warded || after.track === 0 } });
}
const output = process.env["GLYPH_OUTPUT"];
assert(output, "GLYPH_OUTPUT path required");
writeFileSync(output, JSON.stringify({ schema: "mandos/glyph-outcome-qualification@1", mandosBase: "d36c867f795ce5ff41b608229f3735d6b8aaf963", modApiVersion: MOD_API2_VERSION, primaryKnowledgeLossContracts: primaryFailures, refusedFlowReachability: "contract-level only; not established for ordinary autonomous play", profile: "published beta.2 with existing carried patches; direct registered command handler; no world-time/combat claim", rows }, null, 2) + "\n");
console.log(JSON.stringify(rows, null, 2));

process.exitCode = primaryFailures > 0 ? 1 : 0;
