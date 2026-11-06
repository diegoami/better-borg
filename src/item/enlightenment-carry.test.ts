/** Mandos171: actual published-engine potion/known-map utility proxy. */
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
import { borgUseThings } from "./item-use.js";
import { SVAL } from "./svals.js";
import type { BorgContext } from "../context.js";
const root=packRoot();if(root===null)throw new Error("Enlightenment controls require installed content");
const pack=loadPack(root),observations:unknown[]=[];
const content={records:async(name:string)=>({ok:true as const,value:JSON.parse(readFileSync(join(root,name+".json"),"utf8")).records})};
afterEach(resetBorgCfg);
afterAll(()=>{const file=process.env["ENLIGHTENMENT_OUTPUT"];if(file)writeFileSync(file,JSON.stringify(observations,null,2)+"\n");});
const cases=[
 {name:"recognized Enlightenment in dungeon",potion:"Enlightenment",depth:28,aware:true,drink:true,reveal:true},
 {name:"recognized Enlightenment in town",potion:"Enlightenment",depth:0,aware:true,drink:false,reveal:false},
 {name:"unrecognized Enlightenment",potion:"Enlightenment",depth:28,aware:false,drink:false,reveal:false},
 {name:"unrelated True Seeing",potion:"True Seeing",depth:28,aware:true,drink:false,reveal:false},
 {name:"Augmentation in dungeon",potion:"Augmentation",depth:28,aware:true,drink:true,reveal:false},
 {name:"Augmentation in town",potion:"Augmentation",depth:0,aware:true,drink:true,reveal:false},
];
async function run(c:typeof cases[number]){
 const game=Core.startGame(pack,{seed:275,depth:c.depth,raceName:"Human",className:"Warrior"});
 const {state}=game,reg=game.booted.registries,p=state.actor.player;
 for(const mon of [...state.monsters])if(mon)Core.deleteMonster(state,mon.midx);
 const here={x:Math.floor(state.chunk.width/2),y:Math.floor(state.chunk.height/2)},target={x:here.x+4,y:here.y};
 for(let y=here.y-8;y<=here.y+8;y++)for(let x=here.x-8;x<=here.x+8;x++){
  if(x<=0||y<=0||x>=state.chunk.width-1||y>=state.chunk.height-1)continue;
  state.chunk.setFeat({x,y},x===here.x+2?Core.FEAT.GRANITE:Core.FEAT.FLOOR);
  state.chunk.sqinfoOn({x,y},Core.SQUARE.GLOW);
 }
 state.chunk.setFeat(target,Core.FEAT.MORE);Core.placePlayer(state,here);state.updateFov?.(state);Core.squareForget(state,target);
 const kind=reg.objects.kinds.find(k=>k.tval===Core.TV.POTION&&k.name.includes(c.potion))!;
 expect(kind).toBeDefined();if(c.potion==="Enlightenment")expect(kind.sval).toBe(SVAL.potion.enlightenment);
 const obj=Core.objectPrep(state.rng,reg.objects,reg.constants,kind,60,"maximise");obj.number=2;obj.notice|=Core.OBJ_NOTICE.ASSESSED;
 if(c.aware)game.flavor.setAware(kind);Core.playerLearnAllRunes(p,state.runeEnv);
 const gear=state.gear!,handle=Core.gearAdd(gear,obj);gear.pack.push(handle);gear.inven=[...gear.pack];p.upkeep.totalWeight=Core.gearTotalWeight(gear);
 const known=()=>Core.buildKnownWorld(state,{reg:reg.objects});
 const beforeKnown=known(),raw=beforeKnown.inventory?.find(i=>i.handle===handle)!;
 expect(raw).toMatchObject({tval:kind.tval,aware:c.aware,number:2});
 if(c.aware)expect(raw).toMatchObject({kindKey:`kind:${kind.kidx}`,sval:kind.sval});
 else {expect(raw.kindKey.startsWith("flavor:")).toBe(true);expect(raw.sval).toBeLessThan(0);}
 const revealed=()=>known().level?.cells.find(cell=>cell.x===target.x&&cell.y===target.y)?.remembered.feat===Core.FEAT.MORE;
 expect(!!revealed()).toBe(false);expect(Core.squareIsSeen(state.chunk,target)).toBe(false);
 const api={content,view:{world:async()=>({ok:true as const,value:beforeKnown})}} as unknown as ModApi2;
 const statics={constants:await gameConstants(api),floors:await gradeFloors(api),trapKinds:await trapKinds(api),kindCosts:await kindCosts(api)};
 const adapted=await readWorld(api,{statics,races:new RaceBook(),activations:new ActivationBook(),loadouts:new LoadoutBook(),truth:null,messages:undefined});expect(adapted).not.toBeNull();
 const ctx:BorgContext={view:adapted!.view,world:new BorgWorld(),act:makeFakeActions(),rng:makeBorgRng(1)};
 borgNotice(ctx);perceive(ctx.world,ctx.view,makePerceiveMemo());
 const command=borgUseThings(ctx),before={quantity:obj.number,stairsKnown:!!revealed(),turn:state.turn};
 let energy=0;if(command){expect(command).toEqual({code:"quaff",args:{handle}});energy=game.registry.get("quaff")!(state,command);}
 const after={quantity:gear.store.get(handle)?.number??0,stairsKnown:!!revealed(),turn:state.turn};
 if(command){expect(energy).toBe(100);expect(before.quantity-after.quantity).toBe(1);}else expect(after.quantity).toBe(before.quantity);
 const outcome={name:c.name,kind:kind.kidx,tval:kind.tval,sval:kind.sval,aware:raw.aware,publicKind:raw.kindKey,publicSval:raw.sval,depth:c.depth,command,energy,before,after};observations.push(outcome);
 expect(!!command).toBe(c.drink);expect(after.stairsKnown).toBe(c.reveal);
}
it.each(cases)("$name preserves utility scope",run);
