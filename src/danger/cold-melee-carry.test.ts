/** Mandos164: public-engine cold-melee danger/escape proxy, C source26. */
import { afterAll, afterEach, expect, it } from "vitest";
import * as Core from "@rpgm-tools/neo-angband-core";
import type { ModApi2 } from "@rpgm-tools/neo-angband-mod-sdk";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { loadPack, packRoot } from "../play-session.js";
import { readWorld } from "../api2/world.js";
import { gameConstants, gradeFloors, kindCosts, trapKinds } from "../api2/records.js";
import { ActivationBook, LoadoutBook, RaceBook } from "../api2/caches.js";
import { BorgWorld } from "../world/model.js";
import { borgNotice } from "../trait/trait.js";
import { resetBorgCfg } from "../trait/config.js";
import { perceive, makePerceiveMemo } from "../perceive.js";
import { makeFakeActions } from "../harness.js";
import { makeBorgRng } from "../rng.js";
import { makeCoreResolvers } from "../resolvers.js";
import { buildThinkSession, primeSession } from "../think-session.js";
import { borgDanger } from "./danger.js";
import { borgEscape } from "../fight/escape.js";
import { getFightState } from "../fight/state.js";
import { BI } from "../trait/trait-index.js";
import type { BorgContext } from "../context.js";

afterEach(resetBorgCfg);
const observations:Record<string,unknown>[]=[];
afterAll(()=>{const file=process.env["COLD_CARRY_RECORD"];if(file)writeFileSync(file,JSON.stringify(observations,null,2)+"\n");});
const root=packRoot();
if(root===null)throw new Error("The cold carry scenario requires installed content");
const pack=loadPack(root);
const records=(name:string)=>JSON.parse(readFileSync(join(root,name+".json"),"utf8")).records;
const content={records:async(name:string)=>({ok:true as const,value:records(name)})};
const cases=[
 {name:"acid only / cold troll",acid:true,cold:false,race:"snow troll",escape:true},
 {name:"cold only / cold troll",acid:false,cold:true,race:"snow troll",escape:false},
 {name:"neither / cold troll",acid:false,cold:false,race:"snow troll",escape:true},
 {name:"both / cold troll",acid:true,cold:true,race:"snow troll",escape:false},
 {name:"acid only / scorpion",acid:true,cold:false,race:"giant yellow scorpion",escape:false},
 {name:"cold only / scorpion",acid:false,cold:true,race:"giant yellow scorpion",escape:false},
];
async function scene(c:typeof cases[number]){
 const game=Core.startGame(pack,{seed:1000,depth:28,raceName:"Human",className:"Rogue"});
 const {state}=game,p=state.actor.player,reg=game.booted.registries;
 // Explicit disposable setup: native experience/derived stats, full health,
 // lit empty arena and one actual registered adjacent monster.
 const exp=Math.ceil(Core.PLAYER_EXP[18]!*p.expFactor/100);
 Core.playerExpGain(p,exp,game.wizardBundles.expDeps!);
 expect(p.lev).toBe(20);p.chp=p.mhp;
 expect(p.mhp).toBeGreaterThan(70);
 // Injure the disposable character to a fixed ordinary 70HP, holding this
 // intervention identical in every variant. Native takeHit performs the loss.
 Core.takeHit({get chp(){return p.chp;},set chp(v){p.chp=v;},mhp:p.mhp,lev:p.lev,
  get isDead(){return state.isDead;},set isDead(v){state.isDead=v;},timed:p.timed,hitpointWarn:0},p.mhp-70,"scenario setup");
 expect(p.chp).toBe(70);expect(state.isDead).toBe(false);
 for(const mon of [...state.monsters])if(mon)Core.deleteMonster(state,mon.midx);
 const grid={x:Math.floor(state.chunk.width/2),y:Math.floor(state.chunk.height/2)};
 for(let y=grid.y-15;y<=grid.y+15;y++)for(let x=grid.x-15;x<=grid.x+15;x++){
  if(x<=0||y<=0||x>=state.chunk.width-1||y>=state.chunk.height-1)continue;
  state.chunk.setFeat({x,y},Core.FEAT.FLOOR);state.chunk.sqinfoOn({x,y},Core.SQUARE.GLOW);
 }
 Core.placePlayer(state,grid);
 const race=reg.monsters.races.find(r=>r.name===c.race)!;
 expect(race).toBeDefined();
 expect(Core.placeNewMonsterLive(state,{x:grid.x+1,y:grid.y},race,false,false,{index:0,role:0},game.wizardBundles.monPlace!)).toBe(true);
 const gear=state.gear!,kind=reg.objects.kinds.find(k=>k.tval===Core.TV.SCROLL&&k.name.includes("Phase Door"))!;
 expect(kind).toBeDefined();
 const scroll=Core.objectPrep(state.rng,reg.objects,reg.constants,kind,28,"maximise");scroll.number=1;scroll.notice|=Core.OBJ_NOTICE.ASSESSED;
 game.flavor.setAware(kind);Core.playerLearnAllRunes(p,state.runeEnv);
 const handle=Core.gearAdd(gear,scroll);gear.pack.push(handle);gear.inven=[...gear.pack];
 p.upkeep.totalWeight=Core.gearTotalWeight(gear);
 for(const [name,on] of [["OPP_ACID",c.acid],["OPP_COLD",c.cold]] as const){
  const effect=game.players.timed.find(e=>e.name===name)!;expect(effect).toBeDefined();
  if(on)Core.playerIncTimed(p,effect,50,false,false,false);
 }
 state.updateBonuses?.();state.updateFov?.(state);Core.updateMonsters(state,true);
 const known=Core.buildKnownWorld(state,{reg:reg.objects});
 const seen=known.monsters?.find(m=>m.race===c.race);
 expect(seen).toMatchObject({raceIndex:race.ridx,visible:true,grid:{x:grid.x+1,y:grid.y}});
 const api={content,view:{world:async()=>({ok:true as const,value:known})}} as unknown as ModApi2;
 const statics={constants:await gameConstants(api),floors:await gradeFloors(api),trapKinds:await trapKinds(api),kindCosts:await kindCosts(api)};
 const world=await readWorld(api,{statics,races:new RaceBook(),activations:new ActivationBook(),loadouts:new LoadoutBook(),truth:null,messages:undefined});
 expect(world).not.toBeNull();
 const view=world!.view;
 expect(view.inventory().find(i=>i.handle===handle)).toMatchObject({tval:kind.tval,sval:kind.sval,aware:true});
 expect(view.player().status.resAcid>0).toBe(c.acid);expect(view.player().status.resCold>0).toBe(c.cold);
 const ctx:BorgContext={view,world:new BorgWorld(),act:makeFakeActions(),rng:makeBorgRng(1)};
 borgNotice(ctx);perceive(ctx.world,view,makePerceiveMemo());
 const session=buildThinkSession(makeCoreResolvers({races:reg.monsters.races}));primeSession(session,ctx);
 ctx.world.clock=1000;getFightState(ctx.world).tAntisummon=900;
 const danger=borgDanger(ctx,grid.y,grid.x,1,true,false);
 const command=borgEscape(ctx,danger);
 const before={grid:{...state.actor.grid},quantity:gear.store.get(handle)?.number??0,hp:p.chp,sp:p.csp,turn:state.turn};
 let energy=0;
 if(command){expect(command).toEqual({code:"read",args:{handle}});energy=game.registry.get(command.code)!(state,command);}
 const after={grid:{...state.actor.grid},quantity:gear.store.get(handle)?.number??0,hp:p.chp,sp:p.csp,turn:state.turn};
 const moved=before.grid.x!==after.grid.x||before.grid.y!==after.grid.y;
 if(command){expect(energy).toBe(100);expect(before.quantity-after.quantity).toBe(1);expect(moved).toBe(true);}
 else {expect(after).toEqual(before);}
 const record={name:c.name,ridx:race.ridx,level:view.player().level,hp:view.player().hp,maxHp:view.player().maxHp,
  acid:ctx.world.self.temp.resAcid,cold:ctx.world.self.temp.resCold,danger,phase:ctx.world.self.trait[BI.APHASE],command,energy,before,after,moved};
 observations.push(record);
 return {ctx,game,handle,command,danger};
}
it.each(cases)("$name uses the applicable protection for its escape proxy",async c=>{
 const s=await scene(c);
 expect(s.command?.code==="read").toBe(c.escape);
});
