/** Mandos168: published Core potion outcomes; controller clock and real heal caller. */
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
import { borgQuaffCrit } from "./item-use.js";
import { borgRecover } from "./recover.js";
import { borgHeal } from "../fight/caution.js";
import { createBorg } from "../controller.js";
import { SVAL } from "./svals.js";
import { BI } from "../trait/trait-index.js";
import type { BorgContext } from "../context.js";
const root=packRoot();if(root===null)throw new Error("CCW controls require installed content");
const pack=loadPack(root),observations:unknown[]=[];
const content={records:async(name:string)=>({ok:true as const,value:JSON.parse(readFileSync(join(root,name+".json"),"utf8")).records})};
afterEach(resetBorgCfg);
afterAll(()=>{const file=process.env["CCW_OUTPUT"];if(file)writeFileSync(file,JSON.stringify(observations,null,2)+"\n");});
async function fixture(){
 const game=Core.startGame(pack,{seed:77,depth:30,raceName:"Human",className:"Warrior"});
 const {state}=game,reg=game.booted.registries,p=state.actor.player;
 for(const mon of [...state.monsters])if(mon)Core.deleteMonster(state,mon.midx);
 Core.playerExpGain(p,Math.ceil(Core.PLAYER_EXP[18]!*p.expFactor/100),game.wizardBundles.expDeps!);p.chp=p.mhp;
 const kind=reg.objects.kinds.find(k=>k.tval===Core.TV.POTION&&k.sval===SVAL.potion.cure_critical)!;
 expect(kind.name).toContain("Cure Critical Wounds");
 const obj=Core.objectPrep(state.rng,reg.objects,reg.constants,kind,60,"maximise");obj.number=8;obj.notice|=Core.OBJ_NOTICE.ASSESSED;
 game.flavor.setAware(kind);Core.playerLearnAllRunes(p,state.runeEnv);
 const gear=state.gear!,handle=Core.gearAdd(gear,obj);gear.pack.push(handle);gear.inven=[...gear.pack];p.upkeep.totalWeight=Core.gearTotalWeight(gear);
 const api={content,view:{world:async()=>({ok:true as const,value:Core.buildKnownWorld(state,{reg:reg.objects})})}} as unknown as ModApi2;
 const statics={constants:await gameConstants(api),floors:await gradeFloors(api),trapKinds:await trapKinds(api),kindCosts:await kindCosts(api)};
 const reads={statics,races:new RaceBook(),activations:new ActivationBook(),loadouts:new LoadoutBook(),truth:null,messages:undefined};
 const world=new BorgWorld(),rng=makeBorgRng(1),memo=makePerceiveMemo();
 async function context(w=world,r=rng){
  const adapted=await readWorld(api,reads);expect(adapted).not.toBeNull();
  const ctx:BorgContext={view:adapted!.view,world:w,act:makeFakeActions(),rng:r};borgNotice(ctx);perceive(w,ctx.view,memo);
  if(obj.number>0)expect(ctx.view.inventory().find(i=>i.handle===handle)).toMatchObject({aware:true,sval:kind.sval,tval:kind.tval,kindKey:`kind:${kind.kidx}`});
  return {...ctx,hostView:adapted!.view};
 }
 function injure(){const target=Math.floor(p.mhp*0.48);if(p.chp>target)Core.takeHit({get chp(){return p.chp},set chp(v){p.chp=v},mhp:p.mhp,lev:p.lev,get isDead(){return state.isDead},set isDead(v){state.isDead=v},timed:p.timed,hitpointWarn:0},p.chp-target,"CCW scenario setup");}
 function frame(){return {hp:p.chp,maxhp:p.mhp,quantity:gear.store.get(handle)?.number??0,confused:p.timed[game.players.timed.findIndex(t=>t.name==="CONFUSED")]??0};}
 function execute(cmd:ReturnType<typeof borgQuaffCrit>){if(!cmd)return 0;expect(cmd).toEqual({code:"quaff",args:{handle}});return game.registry.get("quaff")!(state,cmd);}
 function confuse(){const effect=game.players.timed.find(t=>t.name==="CONFUSED")!;expect(effect).toBeDefined();Core.playerIncTimed(p,effect,10,false,false,false);}
 return {game,world,rng,p,context,injure,confuse,frame,execute,obj,handle};
}
it("investigates ordinary controller clocks and potion decisions without injected timestamps",async()=>{
 const f=await fixture(),borg=createBorg({rngSeed:1});
 for(let step=0;step<6;step++){
  if(step===0||step===4)f.injure();else f.p.chp=f.p.mhp;
  const ctx=await f.context(borg.world,borg.rng),before=f.frame();
  const cmd=borg.controller(ctx.hostView,{...ctx.act,destroy:()=>{throw new Error("Unexpected legacy destroy request");}});
  let energy=0;if(cmd?.code==="quaff")energy=f.execute(cmd);
  expect(borg.world.clock).toBe(1000+step);
  observations.push({case:"controller",step,clock:borg.world.clock,command:cmd,energy,before,after:f.frame(),accw:borg.world.self.trait[BI.ACCW]});
 }
});
it.each([0,1,3,4,5])("recovery with real prior drink at elapsed %i",async elapsed=>{
 const f=await fixture();f.world.clock=1000;f.injure();const initial=await f.context();expect(f.execute(borgQuaffCrit(initial,true))).toBe(100);
 f.world.clock+=elapsed;f.injure();f.confuse();const ctx=await f.context(),before=f.frame(),cmd=borgRecover(ctx,{danger:0,avoidance:120,canRest:false}),energy=f.execute(cmd);
 observations.push({case:"recover-boundary",elapsed,clock:f.world.clock,command:cmd,energy,before,after:f.frame(),rng:f.rng.snapshot()});
 expect(!!cmd).toBe(elapsed===0||elapsed===5);
 expect(f.frame()).toMatchObject(cmd?{hp:180,quantity:6,confused:0}:{hp:120,quantity:7,confused:10});
});

it.each([0,1,3,4,5,1000])("contract: never-drunk helper at supplied clock %i",async clock=>{
 const f=await fixture();f.world.clock=clock;f.injure();f.confuse();
 const ctx=await f.context(),before=f.frame(),cmd=borgQuaffCrit(ctx,false),energy=f.execute(cmd);
 observations.push({case:"never-drunk-contract",clock,command:cmd,energy,before,after:f.frame(),rng:f.rng.snapshot()});
 expect(!!cmd).toBe(true);expect(f.frame()).toMatchObject({hp:180,quantity:7,confused:0});
});
it.each(["bypass","reserve","empty","confusion-fallback","heal-no-danger"] as const)("control: %s",async name=>{
 const f=await fixture();f.world.clock=1000;f.injure();expect(f.execute(borgQuaffCrit(await f.context(),true))).toBe(100);
 f.world.clock=1004;f.injure();
 if(name!=="heal-no-danger")f.confuse();
 if(name==="reserve")f.obj.number=1;if(name==="empty")f.obj.number=0;
 const ctx=await f.context(),before=f.frame();
 const cmd=name==="confusion-fallback"||name==="heal-no-danger"?borgHeal(ctx,0):borgQuaffCrit(ctx,name==="bypass"),energy=f.execute(cmd);
 observations.push({case:name,clock:f.world.clock,command:cmd,energy,before,after:f.frame(),rng:f.rng.snapshot()});
 expect(!!cmd).toBe(name==="bypass"||name==="confusion-fallback");
});
