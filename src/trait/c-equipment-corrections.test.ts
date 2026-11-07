/** FORK Mandos185/186: registered public-item proxies for C239/238. */
import { beforeAll, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import * as Core from "@rpgm-tools/neo-angband-core";
import type { KnownItem } from "@rpgm-tools/neo-angband-mod-sdk";
import { itemAnalyzer, type ItemAnalyzer } from "../api2/records.js";
import { itemView } from "../api2/world.js";
import { makeScenarioView, makeFakeActions } from "../harness.js";
import { BorgWorld } from "../world/model.js";
import { makeBorgRng } from "../rng.js";
import { borgNotice } from "./trait.js";
import { BI } from "./trait-index.js";
import { borgPower } from "./power.js";
import { borgThrustDamageOne } from "../fight/attack.js";
import { makeCoreResolvers } from "../resolvers.js";
import { getDangerGlobals } from "../danger/state.js";
import { perceive, makePerceiveMemo } from "../perceive.js";
import { raceRecord } from "../core-api.js";
import type { BorgContext } from "../context.js";
const root = dirname(createRequire(import.meta.url).resolve("@rpgm-tools/neo-angband-content/pack/constants.json"));
const json = (name: string) => JSON.parse(readFileSync(join(root, name + ".json"), "utf8"));
const rec = (name: string) => json(name).records;
let analyze: ItemAnalyzer;
beforeAll(async () => { analyze = await itemAnalyzer({ content: { records: async (name: string) => ({ ok: true, value: rec(name) }) } } as never); });
function loadPack(): Core.GamePack {
  return {
    constants: json("constants"), terrain: rec("terrain"), roomTemplates: rec("room_template"), vaults: rec("vault"),
    dungeonProfiles: rec("dungeon_profile"), projection: rec("projection"), trap: rec("trap"), names: rec("names"), quest: rec("quest"), store: rec("store"),
    obj: Object.fromEntries(Object.entries({ objectBase: "object_base", object: "object", egoItem: "ego_item", artifact: "artifact", curse: "curse", brand: "brand", slay: "slay", activation: "activation", objectProperty: "object_property", flavor: "flavor" }).map(([key, file]) => [key, json(file)])),
    mon: Object.fromEntries(Object.entries({ pain: "pain", blowMethods: "blow_methods", blowEffects: "blow_effects", monsterSpells: "monster_spell", monsterBases: "monster_base", monsters: "monster", summons: "summon", pits: "pit" }).map(([key, file]) => [key, rec(file)])),
    player: Object.fromEntries(Object.entries({ races: "p_race", classes: "class", properties: "player_property", timed: "player_timed", shapes: "shape", bodies: "body", history: "history", realms: "realm" }).map(([key, file]) => [key, rec(file)])),
  } as Core.GamePack;
}
type Setup = { ego?: string; known?: boolean; light?: "phial" | "torch" | "none"; cls?: "Warrior" | "Necromancer"; monster?: string };
function scene(options: Setup = {}) {
  const game = Core.startGame(loadPack(), { seed: 1000, depth: 0, raceName: "Human", className: options.cls ?? "Warrior" });
  const { state } = game, reg = game.booted.registries.objects, z = game.booted.registries.constants;
  const gear = state.gear!, player = state.actor.player;
  gear.store.clear(); gear.pack.length = 0; player.equipment.fill(0);
  function equip(kindName: string, egoName?: string, artifactName?: string) {
    const art = artifactName ? reg.artifacts.find(a => a?.name === artifactName) : undefined;
    const kind = art ? reg.lookupKind(art.tval, art.sval) : reg.kinds.find(k => k.name.replace(/^& /, "").replace(/~/g, "") === kindName);
    expect(kind).toBeDefined();
    const obj = Core.objectPrep(state.rng, reg, z, kind!, 50, "maximise");
    if (egoName) {
      const ego = reg.egos.find(e => e?.name === egoName && e.possItems.has(kind!.kidx));
      expect(ego).toBeDefined(); obj.ego = ego!; Core.egoApplyMagic(state.rng, reg, obj, 50); Core.egoApplyMinima(obj);
    }
    if (art) { obj.artifact = art; Core.copyArtifactData(state.rng, reg, obj, art); }
    obj.number = 1; obj.notice |= Core.OBJ_NOTICE.ASSESSED;
    const handle = Core.gearAdd(gear, obj); gear.pack.push(handle);
    const slot = Core.wieldObject(gear, player, handle, state.runeEnv);
    expect(slot).toBeGreaterThanOrEqual(0);
    return { obj, kind: kind!, slot, handle: player.equipment[slot]! };
  }
  const sword = equip("Broad Sword", options.ego);
  const light = (options.light ?? "torch") === "phial" ? equip("Phial", undefined, "of Galadriel")
    : (options.light ?? "torch") === "torch" ? equip("Wooden Torch") : undefined;
  if (options.known !== false) Core.playerLearnAllRunes(player, state.runeEnv);
  player.upkeep.totalWeight = Core.gearTotalWeight(gear);
  const known = Core.buildKnownWorld(state, { reg });
  const equipment = known.equipment!.map(i => i ? itemView(i as KnownItem, analyze) : null);
  const weapon = equipment[sword.slot]!;
  expect(weapon.kindKey).toBe(`kind:${sword.kind.kidx}`); expect(weapon.sval).toBe(sword.kind.sval);
  expect(weapon.dd).toBe(sword.obj.dd); expect(weapon.ds).toBe(sword.obj.ds);
  const race = game.booted.registries.monsters.races.find(r => r.name.toLowerCase() === (options.monster ?? "cave bear").toLowerCase())!;
  expect(race).toBeDefined();
  const base = makeScenarioView({ player: { cls: options.cls ?? "Warrior", race: "Human", level: 40, maxLevel: 40, depth: 30, maxDepth: 30,
    hp: 400, maxHp: 400, sp: 0, maxSp: 0, stats: [118, 118, 118, 118, 118], blows: 400, grid: { x: 20, y: 12 } },
    monsters: [{ id: 9, race: race.name, raceIndex: race.ridx, grid: { x: 21, y: 12 }, visible: true, hp: race.avgHp, maxHp: race.avgHp,
      speed: race.speed, level: race.level, raceFlags: [...raceRecord(race).flags] }] });
  const view = { ...base, equipment: () => equipment };
  const ctx: BorgContext = { view, world: new BorgWorld(), act: makeFakeActions(), rng: makeBorgRng(1000) };
  borgNotice(ctx); perceive(ctx.world, view, makePerceiveMemo());
  const resolvers = makeCoreResolvers({ races: game.booted.registries.monsters.races, blowMethods: [...game.booted.registries.monsters.blowMethods.values()] });
  getDangerGlobals(ctx.world).resolveFacts = resolvers.resolveMonsterFacts!;
  const kill = [...ctx.world.kills.entries()].find(([, k]) => k.rIdx === race.ridx)![0];
  return { ctx, weapon, light: light ? equipment[light.slot]! : undefined, rating: () => borgThrustDamageOne(ctx, kill), power: () => borgPower(ctx) };
}
describe("C239 publicly known equipment slays", () => {
  it("keeps the weapon's known slay after a later ordinary torch", () => {
    const s = scene({ ego: "of Slay Animal" });
    expect(s.weapon.slays).toContain("ANIMAL_2"); expect(s.light!.slays).toEqual([]);
    expect(s.ctx.world.self.trait[BI.WS_ANIMAL]).toBe(2);
  });
  it("raises the animal melee estimate from the registered known slay", () => {
    const known = scene({ ego: "of Slay Animal" }), unknown = scene({ ego: "of Slay Animal", known: false });
    expect(unknown.weapon.slays).toEqual([]);
    expect(known.rating()).toBeGreaterThan(unknown.rating());
  });
  it.each([["Undead", BI.WS_UNDEAD, BI.WK_UNDEAD], ["Demon", BI.WS_DEMON, BI.WK_DEMON], ["Dragon", BI.WS_DRAGON, BI.WK_DRAGON]] as const)(
    "retains the known greater %s slay and its kill classification", (name, slay, kill) => {
      const s = scene({ ego: `of *Slay ${name}*` });
      expect(s.weapon.slays).toContain(`${name.toUpperCase()}_5`);
      expect(s.ctx.world.self.trait[slay]).toBe(5); expect(s.ctx.world.self.trait[kill]).toBe(1);
    });
  it("distinguishes a registered greater dragon slay from the ordinary slay in melee", () => {
    const greater = scene({ ego: "of *Slay Dragon*", monster: "baby green dragon" });
    const ordinary = scene({ ego: "of Slay Dragon", monster: "baby green dragon" });
    expect(greater.weapon.slays).toContain("DRAGON_5"); expect(ordinary.weapon.slays).toContain("DRAGON_3");
    expect(greater.rating()).toBeGreaterThan(ordinary.rating());
  });
  it("keeps an undiscovered wielded slay concealed", () => {
    const s = scene({ ego: "of Slay Animal", known: false });
    expect(s.weapon.slays).toEqual([]); expect(s.ctx.world.self.trait[BI.WS_ANIMAL]).toBe(0);
  });
  it("does not add an animal slay against the registered non-animal kobold", () => {
    const known = scene({ ego: "of Slay Animal", monster: "Kobold" }), unknown = scene({ ego: "of Slay Animal", known: false, monster: "Kobold" });
    expect(known.rating()).toBe(unknown.rating());
  });
  it("preserves a known slay without any later occupied equipment slot", () => {
    const s = scene({ ego: "of Slay Animal", light: "none" });
    expect(s.ctx.world.self.trait[BI.WS_ANIMAL]).toBe(2);
  });
  it("does not invent a slay or kill for an ordinary sword and torch", () => {
    const s = scene();
    expect(s.weapon.slays).toEqual([]); expect(s.ctx.world.self.trait[BI.WS_ANIMAL]).toBe(0); expect(s.ctx.world.self.trait[BI.WK_DRAGON]).toBe(0);
  });
});
describe("C238 known equipment light modifiers", () => {
  it("counts the registered Phial's LIGHT[4] once", () => {
    const s = scene({ light: "phial" });
    expect(s.light!.artifact).toBe(true); expect(s.light!.artifactName).toContain("Galadriel");
    expect(s.light!.modifiers).toContainEqual({ code: "LIGHT", value: 4 });
    expect(s.ctx.world.self.trait[BI.LIGHT]).toBe(4);
  });
  it("preserves a fuelled ordinary torch's flag-based radius", () => {
    const s = scene({ light: "torch" });
    expect(s.light!.flags).toContain("LIGHT_2"); expect(s.light!.timeout).toBeGreaterThan(0);
    expect(s.ctx.world.self.trait[BI.LIGHT]).toBe(2);
  });
  it("keeps the Necromancer unlight adjustment after the single modifier add", () => {
    const s = scene({ cls: "Necromancer", light: "phial" });
    expect(s.light!.modifiers).toContainEqual({ code: "LIGHT", value: 4 });
    expect(s.ctx.world.self.trait[BI.LIGHT]).toBe(3);
  });
});
