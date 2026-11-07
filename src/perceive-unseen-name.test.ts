/** CBUG-0086: public attack-message perception followed by actual defense. */
import { afterAll, beforeAll, expect, it } from "vitest";
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import * as Core from "@rpgm-tools/neo-angband-core";
import type { KnownItem } from "@rpgm-tools/neo-angband-mod-sdk";
import { itemAnalyzer, type ItemAnalyzer } from "./api2/records.js";
import { itemView } from "./api2/world.js";
import { makeScenarioView, makeFakeActions } from "./harness.js";
import { raceRecord } from "./core-api.js";
import { BorgWorld } from "./world/model.js";
import { borgNotice } from "./trait/trait.js";
import { BI } from "./trait/trait-index.js";
import { buildHitByTable } from "./perceive-messages.js";
import { perceive, makePerceiveMemo } from "./perceive.js";
import { getDangerGlobals, getFearCaches, borgDanger } from "./danger/index.js";
import { makeCoreResolvers } from "./resolvers.js";
import { buildThinkSession, installThinkSession } from "./think-session.js";
import { borgDefend } from "./fight/defend.js";
import { makeBorgRng } from "./rng.js";
import type { BorgContext } from "./context.js";

const root = dirname(createRequire(import.meta.url).resolve("@rpgm-tools/neo-angband-content/pack/constants.json"));
const json = (name: string) => JSON.parse(readFileSync(join(root, `${name}.json`), "utf8"));
const records = (name: string) => json(name).records;
const outcomes: unknown[] = [];
afterAll(() => {
  const target = process.env["CBUG0086_OUTPUT"];
  if (target) writeFileSync(target, JSON.stringify(outcomes, null, 2) + "\n");
});
let analyze: ItemAnalyzer;
beforeAll(async () => {
  analyze = await itemAnalyzer({ content: { records: async (name: string) => ({ ok: true, value: records(name) }) } } as never);
});
function pack(): Core.GamePack {
  return {
    constants: json("constants"), terrain: records("terrain"), roomTemplates: records("room_template"),
    vaults: records("vault"), dungeonProfiles: records("dungeon_profile"), projection: records("projection"),
    trap: records("trap"), names: records("names"), quest: records("quest"), store: records("store"),
    obj: Object.fromEntries(Object.entries({ objectBase: "object_base", object: "object", egoItem: "ego_item", artifact: "artifact", curse: "curse", brand: "brand", slay: "slay", activation: "activation", objectProperty: "object_property", flavor: "flavor" }).map(([key, file]) => [key, json(file)])),
    mon: Object.fromEntries(Object.entries({ pain: "pain", blowMethods: "blow_methods", blowEffects: "blow_effects", monsterSpells: "monster_spell", monsterBases: "monster_base", monsters: "monster", summons: "summon", pits: "pit" }).map(([key, file]) => [key, records(file)])),
    player: Object.fromEntries(Object.entries({ races: "p_race", classes: "class", properties: "player_property", timed: "player_timed", shapes: "shape", bodies: "body", history: "history", realms: "realm" }).map(([key, file]) => [key, records(file)])),
  } as Core.GamePack;
}
function scenario(who: string, visible = true, messageKind: "miss" | "hit" = "miss") {
  // Only the fixture prepares live objects. Decision code receives public views.
  const game = Core.startGame(pack(), { seed: 1000, depth: 0, raceName: "Human", className: "Warrior" });
  const { state } = game, reg = game.booted.registries.objects, z = game.booted.registries.constants;
  const potionKind = reg.kinds.find(kind => kind.name === "True Seeing")!;
  const ringKind = reg.kinds.find(kind => kind.name === "Flames")!;
  expect(potionKind).toBeDefined(); expect(ringKind).toBeDefined();
  const potion = Core.objectPrep(state.rng, reg, z, potionKind, 52, "maximise"); potion.number = 2;
  const ring = Core.objectPrep(state.rng, reg, z, ringKind, 52, "maximise"); ring.number = 1;
  state.flavorKnown!.setAware(potionKind); state.flavorKnown!.setAware(ringKind);
  potion.notice |= Core.OBJ_NOTICE.ASSESSED; ring.notice |= Core.OBJ_NOTICE.ASSESSED;
  const gear = state.gear!, potionHandle = Core.gearAdd(gear, potion), ringHandle = Core.gearAdd(gear, ring);
  gear.pack.push(potionHandle, ringHandle);
  state.actor.player.upkeep.totalWeight = Core.gearTotalWeight(gear);
  Core.playerLearnAllRunes(state.actor.player, state.runeEnv);
  // Port41's zero base needs the actual lamp behind this fixture's light2.
  // Reuse the same game's real birth torch; do not inject a positive trait.
  const publicWorld = Core.buildKnownWorld(state, { reg,
    describe: obj => Core.describeObject(state, obj, Core.ODESC.PREFIX | Core.ODESC.FULL) });
  const known = publicWorld.inventory!;
  const birthTorch = publicWorld.equipment![5]!;
  expect(birthTorch).toBeDefined();
  expect(reg.lookupKind(birthTorch.tval, birthTorch.sval)?.name).toBe("& Wooden Torch~");
  const torch = itemView(birthTorch as KnownItem, analyze);
  expect(torch.flags).toContain("LIGHT_2"); expect(torch.timeout).toBeGreaterThan(0);
  const knownPotion = known.find(item => item.handle === potionHandle)!;
  const knownRing = known.find(item => item.handle === ringHandle)!;
  expect(knownPotion.kindKey).toBe(`kind:${potionKind.kidx}`);
  expect(knownPotion.sval).toBe(potionKind.sval); expect(knownPotion.unknownRunes).toBe(false);
  const inv = [itemView(knownPotion as KnownItem, analyze)];
  const equipment = new Array<Core.ItemView | null>(12).fill(null);
  equipment[2] = itemView(knownRing as KnownItem, analyze);
  equipment[5] = torch;
  const raceName = who.toLowerCase().startsWith("it") && who.length > 2 ? "Itangast the Fire Drake" : "Ogre";
  const race = game.booted.registries.monsters.races.find(r => r.name.toLowerCase() === raceName.toLowerCase())!;
  expect(race).toBeDefined();
  const base = makeScenarioView({ width: 80, player: {
    cls: "Warrior", race: "Human", grid: { x: 20, y: 12 }, depth: 52, maxDepth: 52,
    level: 40, maxLevel: 40, hp: 421, maxHp: 421, sp: 0, maxSp: 0, light: 2,
    stats: [118, 118, 118, 118, 118], status: { resFire: 50 },
  }, monsters: visible ? [{ id: 9, raceIndex: race.ridx, race: race.name,
    grid: { x: 21, y: 12 }, hp: race.avgHp, maxHp: race.avgHp, speed: race.speed,
    level: race.level, raceFlags: [...raceRecord(race).flags], visible: true }] : [],
    messages: ["You feel resistant to fire!"],
  });
  const view = { ...base, inventory: () => inv, equipment: () => equipment };
  const world = new BorgWorld(); world.clock = 100;
  const ctx: BorgContext = { world, view, act: makeFakeActions(), rng: makeBorgRng(1000) };
  const resolvers = makeCoreResolvers({ races: game.booted.registries.monsters.races, blowMethods: [...game.booted.registries.monsters.blowMethods.values()] });
  installThinkSession(world, buildThinkSession(resolvers));
  borgNotice(ctx);
  expect(world.self.trait[BI.LIGHT]).toBe(2);
  const memo = makePerceiveMemo(); perceive(world, view, memo);
  const g = getDangerGlobals(world); g.resolveFacts = resolvers.resolveMonsterFacts!; g.avoidance = world.self.trait[BI.CURHP] ?? 0;
  const beforeDanger = borgDanger(ctx, 12, 20, 1, false, false);
  const text = messageKind === "miss" ? `${who} misses you.` : `${who} claws you.`;
  const attackView = { ...view, messages: () => [text] };
  // Same public perception entry point as the controller, with a real template.
  const tables = buildHitByTable(resolvers.blowActions!);
  perceive(world, attackView, memo, tables);
  const danger = borgDanger(ctx, 12, 20, 1, false, false);
  const fear = getFearCaches(world).region(12, 20);
  const stamp = world.self.temp.needSeeInvis;
  const command = borgDefend({ ...ctx, view: attackView }, danger);
  const before = gear.store.get(potionHandle)?.number ?? 0;
  const transactionHpBefore = state.actor.player.chp;
  let energy = 0;
  if (command) {
    expect(command).toEqual({ code: "quaff", args: { handle: potionHandle } });
    energy = game.registry.get("quaff")!(state, command);
  }
  const after = gear.store.get(potionHandle)?.number ?? 0;
  const outcome = { who, messageKind, stamp, fear, beforeDanger, danger, command, energy, spent: before - after, decisionHp: world.self.trait[BI.CURHP], transactionHpBefore, transactionHpAfter: state.actor.player.chp };
  outcomes.push(outcome);
  console.log("CBUG0086", JSON.stringify(outcome));
  return outcome;
}

it.each(["miss", "hit"] as const)("keeps visible Itangast out of unseen detection on a %s message", kind => {
  const result = scenario("Itangast the Fire Drake", true, kind);
  expect(result.stamp).toBe(0);
  expect(result.fear).toBe(0);
  expect(result.command).toBeNull();
  expect(result.spent).toBe(0);
});
it("keeps an ordinary visible named monster recognised", () => {
  const result = scenario("The Ogre");
  expect(result.stamp).toBe(0); expect(result.fear).toBe(0); expect(result.spent).toBe(0);
});
it.each(["It", "it", "Something"])("still requests detection for the unseen descriptor %s", who => {
  const result = scenario(who, false);
  expect(result.stamp).toBe(100); expect(result.fear).toBeGreaterThan(0);
  expect(result.command?.code).toBe("quaff"); expect(result.spent).toBe(1);
});
