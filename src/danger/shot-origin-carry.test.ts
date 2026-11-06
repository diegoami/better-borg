/** Mandos172: actual public caster path plus explicit helper-boundary controls. */
import { afterAll, afterEach, expect, it } from "vitest";
import * as Core from "@rpgm-tools/neo-angband-core";
import type { ModApi2 } from "@rpgm-tools/neo-angband-mod-sdk";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { packRoot, loadPack } from "../play-session.js";
import { readWorld } from "../api2/world.js";
import { gameConstants, gradeFloors, trapKinds, kindCosts } from "../api2/records.js";
import { RaceBook, ActivationBook, LoadoutBook } from "../api2/caches.js";
import { BorgWorld } from "../world/model.js";
import { borgNotice } from "../trait/trait.js";
import { resetBorgCfg } from "../trait/config.js";
import { perceive, makePerceiveMemo } from "../perceive.js";
import { makeFakeActions } from "../harness.js";
import { makeBorgRng } from "../rng.js";
import { makeCoreResolvers } from "../resolvers.js";
import { buildThinkSession, primeSession } from "../think-session.js";
import { borgDanger, borgDangerSpell } from "./danger.js";
import { borgProjectablePure } from "./geometry.js";
import { getDangerGlobals } from "./state.js";
import { borgEscape } from "../fight/escape.js";
import { getFightState } from "../fight/state.js";
import type { BorgContext } from "../context.js";
const root=packRoot();if(root===null)throw new Error("Shot-origin controls require content");
const pack=loadPack(root),outcomes:unknown[]=[];
const content={records:async(name:string)=>({ok:true as const,value:JSON.parse(readFileSync(join(root,name+".json"),"utf8")).records})};
afterEach(resetBorgCfg);
afterAll(()=>{const file=process.env["SHOT_ORIGIN_OUTPUT"];if(file)writeFileSync(file,JSON.stringify(outcomes,null,2)+"\n");});
const cases=[
 {name:"clear caster-origin hill giant",kind:"clear",expected:true},
 {name:"real intervening yellow mold",kind:"mold",expected:false},
 {name:"new wall and remembered caster",kind:"wall",expected:false},
 {name:"unknown remembered cell contract",kind:"unknown",expected:false},
 {name:"player origin with monster endpoint",kind:"player",expected:true},
 {name:"range shorter than target distance",kind:"range",expected:false},
 {name:"empty origin with player endpoint",kind:"empty",expected:true},
 {name:"mixed storm spells behind real mold",kind:"mixed",expected:false},
];
async function scene(c:typeof cases[number]){
 const game=Core.startGame(pack,{seed:1000,depth:38,raceName:"Human",className:"Rogue"});
 const {state}=game,p=state.actor.player,reg=game.booted.registries;
 Core.playerExpGain(p,Math.ceil(Core.PLAYER_EXP[18]!*p.expFactor/100),game.wizardBundles.expDeps!);expect(p.lev).toBe(20);p.chp=p.mhp;
 Core.takeHit({get chp(){return p.chp;},set chp(v){p.chp=v;},mhp:p.mhp,lev:p.lev,get isDead(){return state.isDead;},set isDead(v){state.isDead=v;},timed:p.timed,hitpointWarn:0},p.mhp-70,"scenario setup");
 expect(p.chp).toBe(70);expect(state.isDead).toBe(false);
 for(const mon of [...state.monsters])if(mon)Core.deleteMonster(state,mon.midx);
 const here={x:Math.floor(state.chunk.width/2),y:Math.floor(state.chunk.height/2)},there={x:here.x+6,y:here.y},mid={x:here.x+3,y:here.y};
 for(let y=here.y-15;y<=here.y+15;y++)for(let x=here.x-15;x<=here.x+15;x++){
  if(x<=0||y<=0||x>=state.chunk.width-1||y>=state.chunk.height-1)continue;
  state.chunk.setFeat({x,y},x===mid.x&&y!==here.y?Core.FEAT.GRANITE:Core.FEAT.FLOOR);state.chunk.sqinfoOn({x,y},Core.SQUARE.GLOW);
 }
 Core.placePlayer(state,here);
 const race=reg.monsters.races.find(r=>r.name===(c.kind==="mixed"?"storm giant":"hill giant"))!;expect(race).toBeDefined();
 expect(Core.placeNewMonsterLive(state,there,race,false,false,{index:0,role:0},game.wizardBundles.monPlace!)).toBe(true);
 if(c.kind==="mold"||c.kind==="mixed"){
  const mold=reg.monsters.races.find(r=>r.name==="yellow mold")!;expect(mold).toBeDefined();
  expect(Core.placeNewMonsterLive(state,mid,mold,false,false,{index:0,role:0},game.wizardBundles.monPlace!)).toBe(true);
 }
 const gear=state.gear!,kind=reg.objects.kinds.find(k=>k.tval===Core.TV.SCROLL&&k.name.includes("Phase Door"))!;expect(kind).toBeDefined();
 const scroll=Core.objectPrep(state.rng,reg.objects,reg.constants,kind,38,"maximise");scroll.number=1;scroll.notice|=Core.OBJ_NOTICE.ASSESSED;
 game.flavor.setAware(kind);Core.playerLearnAllRunes(p,state.runeEnv);const handle=Core.gearAdd(gear,scroll);gear.pack.push(handle);gear.inven=[...gear.pack];p.upkeep.totalWeight=Core.gearTotalWeight(gear);
 state.updateBonuses?.();state.updateFov?.(state);Core.updateMonsters(state,true);
 const api={content,view:{world:async()=>({ok:true as const,value:Core.buildKnownWorld(state,{reg:reg.objects})})}} as unknown as ModApi2;
 const statics={constants:await gameConstants(api),floors:await gradeFloors(api),trapKinds:await trapKinds(api),kindCosts:await kindCosts(api)};
 const reads={statics,races:new RaceBook(),activations:new ActivationBook(),loadouts:new LoadoutBook(),truth:null,messages:undefined};
 let adapted=await readWorld(api,reads);expect(adapted).not.toBeNull();expect(adapted!.view.monsters().find(m=>m.raceIndex===race.ridx)).toMatchObject({visible:true,grid:there});
 const ctx:BorgContext={view:adapted!.view,world:new BorgWorld(),act:makeFakeActions(),rng:makeBorgRng(1)},memo=makePerceiveMemo();
 borgNotice(ctx);perceive(ctx.world,ctx.view,memo);
 if(c.kind==="wall"){
  state.chunk.setFeat(mid,Core.FEAT.GRANITE);state.updateFov?.(state);Core.updateMonsters(state,true);
  adapted=await readWorld(api,reads);ctx.view=adapted!.view;perceive(ctx.world,ctx.view,memo);
 }
 const killIndex=[...ctx.world.kills.entries()].find(([,k])=>k.rIdx===race.ridx)![0];expect(killIndex).toBeGreaterThan(0);
 const session=buildThinkSession(makeCoreResolvers({races:reg.monsters.races}));primeSession(session,ctx);ctx.world.clock=1000;getFightState(ctx.world).tAntisummon=900;
 // Explicit conservative-memory contract control, not a fabricated positive
 // engine observation: forgetting one remembered cell must still block a ray.
 if(c.kind==="unknown")ctx.world.map.at(mid.x,mid.y).feat=Core.FEAT.NONE;
 const from=c.kind==="player"?here:c.kind==="empty"?{x:here.x-1,y:here.y}:there,to=c.kind==="player"?there:here,range=c.kind==="range"?5:20;
 const native=Core.projectable(state.chunk,from,to,Core.PROJECT.STOP,range),pure=borgProjectablePure(ctx.world,range,from.y,from.x,to.y,to.x);
 const measure=["clear","mold","wall","mixed"].includes(c.kind);
 let danger:number|null=null,spell:number|null=null,command:Core.AgentCommand|null=null,energy=0;
 if(measure){
  const g=getDangerGlobals(ctx.world),facts=g.resolveFacts(ctx,killIndex),kill=ctx.world.kills.at(killIndex);
  if(c.kind==="mixed"){expect(facts.spells).toContain(Core.RSF.BOULDER);expect(facts.spells).toContain(Core.RSF.BA_ELEC);}
  spell=borgDangerSpell(ctx.world,g,facts,kill,here.y,here.x,6,true);
  danger=borgDanger(ctx,here.y,here.x,1,true,false);command=borgEscape(ctx,danger);
 }
 const before={grid:{...state.actor.grid},quantity:gear.store.get(handle)?.number??0,hp:p.chp,turn:state.turn};
 if(command){expect(command).toEqual({code:"read",args:{handle}});energy=game.registry.get("read")!(state,command);expect(energy).toBe(100);}
 const after={grid:{...state.actor.grid},quantity:gear.store.get(handle)?.number??0,hp:p.chp,turn:state.turn};
 const nativeAfter=Core.projectable(state.chunk,there,state.actor.grid,Core.PROJECT.STOP,20);
 const terrainAfter=Core.projectable(state.chunk,there,state.actor.grid,Core.PROJECT.NONE,20);
 // One scheduled real Boulder executor, not monster AI frequency/selection.
 // Both source versions get the same untouched native RNG stream here.
 let attack:{processed:boolean;beforeHp:number;afterHp:number}|null=null;
 if(c.kind==="clear"||c.kind==="mold"){
  const facts=getDangerGlobals(ctx.world).resolveFacts(ctx,killIndex);expect(facts.spells).toContain(Core.RSF.BOULDER);
  const caster=state.monsters.find(m=>m?.race.ridx===race.ridx)!,effect=game.wizardBundles.effect!;
  const beforeHp=p.chp;
  const processed=Core.doMonSpell(state,caster.midx,Core.RSF.BOULDER,true,{...effect,
   spells:reg.monsters.spells,saveSkill:state.playerState?.skills[Core.SKILL.SAVE]??0,hooks:Core.buildMonSpellHooks(state)});
  expect(processed).toBe(true);attack={processed,beforeHp,afterHp:p.chp};
  if(c.kind==="clear")expect(p.chp).toBeLessThan(beforeHp);
  else expect(p.chp).toBe(beforeHp);
 }
 const result={name:c.name,kind:c.kind,ridx:race.ridx,from,to,range,native,pure,originKill:ctx.world.map.at(from.x,from.y).kill,spell,danger,command,energy,before,after,nativeAfter,terrainAfter,fleeing:ctx.world.self.goal.fleeing,leaving:ctx.world.self.goal.leaving,attack};outcomes.push(result);
 expect(pure).toBe(c.expected);if(c.kind!=="unknown")expect(pure).toBe(native);
 if(c.kind==="mixed"){expect(spell).toBeGreaterThan(0);}
 return result;
}
it.each(cases)("$name retains geometry scope",async c=>{await scene(c);});
