/** Mandos175/176: real published Necromancer spells and public target observations. */
import {afterAll,afterEach,expect,it} from "vitest";
import * as Core from "@rpgm-tools/neo-angband-core";
import type {ModApi2} from "@rpgm-tools/neo-angband-mod-sdk";
import {readFileSync,writeFileSync} from "node:fs";
import {join} from "node:path";
import {packRoot,loadPack} from "../play-session.js";
import {readWorld} from "../api2/world.js";
import {gameConstants,gradeFloors,trapKinds,kindCosts} from "../api2/records.js";
import {RaceBook,ActivationBook,LoadoutBook} from "../api2/caches.js";
import {BorgWorld} from "../world/model.js";
import {borgNotice} from "../trait/trait.js";
import {resetBorgCfg} from "../trait/config.js";
import {perceive,makePerceiveMemo} from "../perceive.js";
import {makeFakeActions} from "../harness.js";
import {makeBorgRng} from "../rng.js";
import {makeCoreResolvers} from "../resolvers.js";
import {buildThinkSession,primeSession} from "../think-session.js";
import {getFightState} from "./state.js";
import {borgCalculateAttackEffectiveness,borgAttack,borgLaunchDamageOne} from "./attack.js";
import {BA,BF} from "./bf.js";
import {Spell,borgSpellOkayFail,borgSpellFailRate,borgSpellLegal} from "../item/magic.js";
import {BI} from "../trait/trait-index.js";
import type {BorgContext} from "../context.js";
const root=packRoot();if(root===null)throw new Error("Spell correction controls require content");
const pack=loadPack(root),records:unknown[]=[];
const content={records:async(name:string)=>({ok:true as const,value:JSON.parse(readFileSync(join(root,name+".json"),"utf8")).records})};
afterEach(resetBorgCfg);afterAll(()=>{const file=process.env["C_SPELL_OUTPUT"];if(file)writeFileSync(file,JSON.stringify(records,null,2)+"\n");});
const cases=[
 {name:"dispel-living",spell:"Dispel Life",monsters:[{name:"Hill giant",distance:5}]},
 {name:"dispel-nonliving",spell:"Dispel Life",monsters:[{name:"Clay golem",distance:5}]},
 {name:"dispel-blocked",spell:"Dispel Life",monsters:[{name:"Hill giant",distance:5}]},
 {name:"dispel-no-mana",spell:"Dispel Life",monsters:[{name:"Hill giant",distance:5}]},
 {name:"vampire-blocked",spell:"Vampire Strike",monsters:[{name:"Kobold",distance:5}]},
 {name:"vampire-no-mana",spell:"Vampire Strike",monsters:[{name:"Kobold",distance:5}]},
 {name:"dispel-undead",spell:"Dispel Life",monsters:[{name:"Vampire bat",distance:5}]},
 {name:"nether-control",spell:"Nether Bolt",monsters:[{name:"Hill giant",distance:5}]},
 {name:"vampire-near-far",spell:"Vampire Strike",monsters:[{name:"Kobold",distance:5},{name:"Hill giant",distance:20}]},
 {name:"vampire-far-near",spell:"Vampire Strike",monsters:[{name:"Hill giant",distance:20},{name:"Kobold",distance:5}]},
 {name:"vampire-near-near",spell:"Vampire Strike",monsters:[{name:"Kobold",distance:5},{name:"Hill giant",distance:8}]},
 {name:"vampire-far",spell:"Vampire Strike",monsters:[{name:"Hill giant",distance:20}]},
 {name:"vampire-undead",spell:"Vampire Strike",monsters:[{name:"Vampire bat",distance:5}]},
];
it.each(cases)("$name published spell probe",async c=>{
 const game=Core.startGame(pack,{seed:1000,depth:30,raceName:"Human",className:"Necromancer",rolledStats:[18,18,18,18,18,18]});
 const {state}=game,p=state.actor.player,reg=game.booted.registries;
 for(const mon of [...state.monsters])if(mon)Core.deleteMonster(state,mon.midx);
 Core.playerExpGain(p,Math.ceil(Core.PLAYER_EXP[33]!*p.expFactor/100),game.wizardBundles.expDeps!);state.updateBonuses?.();Core.calcSpells(p,state.playerState!.statInd);p.csp=p.msp;p.chp=p.mhp;
 const nativeSpell=p.cls.magic.books.flatMap(b=>b.spells).find(s=>s.name===c.spell)!;expect(nativeSpell).toBeDefined();expect(p.lev).toBeGreaterThanOrEqual(nativeSpell.level);
 const book=p.cls.magic.books[nativeSpell.bidx]!,kind=reg.objects.lookupKind(book.tvalIdx,book.sval)!;expect(kind).toBeDefined();
 const obj=Core.objectPrep(state.rng,reg.objects,reg.constants,kind,p.lev,"average");obj.notice|=Core.OBJ_NOTICE.ASSESSED;game.flavor.setAware(kind);Core.playerLearnAllRunes(p,state.runeEnv);Core.invenCarry(state.gear!,p,obj,reg.constants);Core.calcInventory(state.gear!,reg.constants);
 expect(Core.spellOkayToStudy(p,nativeSpell.sidx)).toBe(true);Core.spellLearn(p,nativeSpell.sidx);expect(Core.spellOkayToCast(p,nativeSpell.sidx)).toBe(true);
 const here={x:Math.floor(state.chunk.width/2),y:Math.floor(state.chunk.height/2)};
 for(let y=here.y-12;y<=here.y+12;y++)for(let x=here.x-22;x<=here.x+22;x++){
  if(x<=0||y<=0||x>=state.chunk.width-1||y>=state.chunk.height-1)continue;state.chunk.setFeat({x,y},Core.FEAT.FLOOR);state.chunk.sqinfoOn({x,y},Core.SQUARE.GLOW);
 }
 Core.placePlayer(state,here);
 const nativeMonsters=[];
 for(const [i,m]of c.monsters.entries()){
  const race=reg.monsters.races.find(r=>r.name.toLowerCase()===m.name.toLowerCase())!;expect(race).toBeDefined();const grid={x:here.x+m.distance,y:here.y};
  expect(Core.placeNewMonsterLive(state,grid,race,false,false,{index:0,role:0},game.wizardBundles.monPlace!)).toBe(true);
  nativeMonsters.push(state.monsters.find(mon=>mon?.race.ridx===race.ridx)!);
 }
 if(c.name.endsWith("blocked"))for(let y=here.y-12;y<=here.y+12;y++)state.chunk.setFeat({x:here.x+2,y},Core.FEAT.GRANITE);
 if(c.name.endsWith("no-mana"))p.csp=0;
 state.updateFov?.(state);Core.updateMonsters(state,true);
 const api={content,view:{world:async()=>({ok:true as const,value:Core.buildKnownWorld(state,{reg:reg.objects})})}} as unknown as ModApi2;
 const statics={constants:await gameConstants(api),floors:await gradeFloors(api),trapKinds:await trapKinds(api),kindCosts:await kindCosts(api)};
 const adapted=await readWorld(api,{statics,races:new RaceBook(),activations:new ActivationBook(),loadouts:new LoadoutBook(),truth:null,messages:undefined});expect(adapted).not.toBeNull();
 const bookKind=(tval:number,name:string)=>{const b=p.cls.magic.books.find(b=>b.tvalIdx===tval&&b.name===name);return b?{tval,sval:b.sval}:null;};
 const resolvers=makeCoreResolvers({races:reg.monsters.races,bookKind});
 const act=makeFakeActions(),ctx:BorgContext={view:adapted!.view,world:new BorgWorld(),act,rng:makeBorgRng(1),bookKind};ctx.world.clock=1000;
 borgNotice(ctx);perceive(ctx.world,ctx.view,makePerceiveMemo());const session=buildThinkSession(resolvers);primeSession(session,ctx);
 const fs=getFightState(ctx.world),which=c.spell==="Dispel Life"?Spell.DISPEL_LIFE:c.spell==="Vampire Strike"?Spell.VAMPIRE_STRIKE:Spell.NETHER_BOLT;
 const exposed=ctx.view.spellbooks().flatMap(b=>b.spells).find(s=>s.sidx===nativeSpell.sidx);expect(exposed).toMatchObject({learned:true});
 const visible=ctx.view.monsters().map(m=>({name:m.race,visible:m.visible,grid:m.grid}));
 if(!c.name.endsWith("blocked"))for(const m of nativeMonsters)expect(ctx.view.monsters().find(v=>v.raceIndex===m.race.ridx)?.visible).toBe(true);
 for(const [,k]of ctx.world.kills.entries()){fs.tempX[fs.tempN]=k.pos.x;fs.tempY[fs.tempN++]=k.pos.y;}
 const effect=c.spell==="Dispel Life"?BF.PRAYER_DISPEL_LIFE:c.spell==="Vampire Strike"?BF.SPELL_VAMPIRE_STRIKE:BF.SPELL_NETHER_BOLT;
 const legal=borgSpellLegal(ctx,which),okay=borgSpellOkayFail(ctx,which,25),fail=borgSpellFailRate(ctx,which);
 const rating=borgCalculateAttackEffectiveness(ctx,fs,effect);const command=borgAttack(ctx);
 const actualTemp=Array.from({length:fs.tempN},(_,i)=>({x:fs.tempX[i],y:fs.tempY[i]}));
 const before=nativeMonsters.map(m=>({midx:m.midx,hp:m.hp,grid:{...m.grid}})),manaBefore=p.csp;
 let energy=0;const nativeCommand=command?.code==="cast"?command:c.spell==="Dispel Life"&&!c.name.endsWith("no-mana")?{code:"cast",args:{spell:nativeSpell.sidx}}:null;
 if(nativeCommand){
  for(const target of act.targets){if("midx"in target)Core.targetSetMonster(state,state.monsters[target.midx]!);else Core.targetSetLocation(state,{x:target.x!,y:target.y!});}
  energy=game.registry.get("cast")!(state,nativeCommand);
 }
 records.push({actualTemp,nativeCommand,nativeCastWasSelected:command?.code==="cast",name:c.name,level:p.lev,spell:nativeSpell,publicSpell:exposed,legal,okay,fail,visible,light:ctx.world.self.trait[BI.LIGHT],rating,command,targets:act.targets,energy,manaBefore,manaAfter:p.csp,before,after:nativeMonsters.map(m=>({midx:m.midx,hp:m.hp,grid:{...m.grid}})),workedAfter:!!(p.spellFlags[nativeSpell.sidx]!&Core.PY_SPELL.WORKED),nonlivingPopulation:reg.monsters.races.filter(r=>r.flags.has(Core.MON_RACE_FLAG_ENTRIES.findIndex(entry=>entry.name==="NONLIVING"))).length});
 const expected=["dispel-living","nether-control","vampire-near-far","vampire-far-near","vampire-near-near"].includes(c.name);
 expect(rating>0).toBe(expected);expect(command?.code==="cast").toBe(expected);
});
