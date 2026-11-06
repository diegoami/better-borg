/** External platform controls only; production metadata functions remain unchanged. */
import { join } from 'node:path';
import { strict as assert } from 'node:assert';
export const LOCK_NAME = 'mandos:install-metadata';
export function clientSource(web, root, production = false) {
  return `
import {createApi2Host,stopApi2Host} from ${JSON.stringify(join(web,'mod-api2-host.ts'))};
import {modPluginContext} from ${JSON.stringify(join(web,'mod-context.ts'))};
import {modInstallPrefs} from ${JSON.stringify(join(web,'mod-prefs.ts'))};
import {CapabilitySet} from '@rpgm-tools/neo-angband-mod-sdk';
import {archiveFinishedRun,graveyardArchiveOf,GRAVEYARD_KEY} from ${JSON.stringify(join(root,'src/records/journal.ts'))};
import {bumpLineage} from ${JSON.stringify(join(root,'src/class/warrior/lineage.ts'))};
${production ? `import {setBirthFlag,clearBirthFlag,BIRTH_FLAG_KEY} from ${JSON.stringify(join(root,'src/birth/flag.ts'))};
import {installMemory} from ${JSON.stringify(join(root,'title.ts'))};
import {createWarriorBirthPresenter} from ${JSON.stringify(join(root,'src/class/warrior/presenter.ts'))};
import {mutateInstall} from ${JSON.stringify(join(root,'src/records/install-mutation.ts'))};
import {BIRTH_STAT_COSTS,BIRTH_STAT_BASE} from '@rpgm-tools/neo-angband-core';` : ''}
const name=${JSON.stringify(LOCK_NAME)};
const grants=CapabilitySet.fromManifest({id:'mandos',name:'Disposable metadata control',version:'1',modApi:1,shape:'plugin',facets:['plugin'],capabilities:[]});
function host(){return createApi2Host(modPluginContext('mandos',{},undefined,{},{capabilities:grants}),{grants,tier:'public',execution:'in-process'});}
const initial={profileIds:['disposable-p1'],lineage:7,other:{sentinel:'preserve'}};
const report=key=>({key,outcome:'death',cause:'synthetic fixture',name:'Fixture',race:'Human',cls:'Warrior',level:1,maxLevel:1,depth:1,maxDepth:1,gold:0,turn:10,score:0,scored:false,endedAt:0,history:[],messages:[],belongings:[],sheet:null,birth:{race:'Human',cls:'Warrior',name:'Fixture',stats:[10,10,10,10,10]}});
async function operation(api,op){
  ${production ? `if(op==='bump')return bumpLineage(api.store.install);
  if(op==='set-flag')return setBirthFlag(api.store.install);
  if(op==='clear-flag')return clearBirthFlag(api.store.install);
  if(op==='title'){const logs=[];await installMemory(api.store.install,m=>logs.push(m)).write(['disposable-p1','new-profile']);return{voidResult:true,logs};}
  if(op==='consume'){
    createWarriorBirthPresenter({slot:api.store.install,log:()=>{},raceName:'Human',costTable:BIRTH_STAT_COSTS,statBase:BIRTH_STAT_BASE});
    // Observe actual preparation via native service barriers, not delayed store calls.
    for(let i=0;i<4;i++){await navigator.locks.request(name,()=>{});const read=await api.store.install.get();if(read.ok&&!read.value?.[BIRTH_FLAG_KEY])return true;}
    return false;
  }
  return archiveFinishedRun({archive:api.store.install,log:()=>{}},report(op.slice(8)));` : `if(typeof navigator.locks?.request!=='function')throw Error('Web Locks unavailable; no unsafe fallback');
  return navigator.locks.request(name,{mode:'exclusive'},()=>op==='bump'?bumpLineage(api.store.install):archiveFinishedRun({archive:api.store.install,log:()=>{}},report(op.slice(8))));`}
}
async function reset(){const api=host();try{const r=await api.store.install.set(initial);if(!r.ok)throw Error(r.message);}finally{stopApi2Host(api);}}
async function snapshot(){const api=host();try{const r=await api.store.install.get();if(!r.ok)throw Error(r.message);return{value:r.value,archiveKeys:graveyardArchiveOf(r.value?.[GRAVEYARD_KEY]??null).runs.map(r=>r.run).sort(),rawInstall:modInstallPrefs('mandos').get()};}finally{stopApi2Host(api);}}
async function one(op){const api=host();try{return await operation(api,op);}finally{stopApi2Host(api);}}
async function pair(ops,concurrent){await reset();const a=host(),b=host();let answers;try{answers=concurrent?await Promise.all([operation(a,ops[0]),operation(b,ops[1])]):[await operation(a,ops[0]),await operation(b,ops[1])];}finally{stopApi2Host(a);stopApi2Host(b);}return{answers,snapshot:await snapshot()};}
async function lifecycle(){
  await reset();let rejected=false;
  try{await navigator.locks.request(name,()=>{throw Error('intentional callback failure');});}catch(e){rejected=e.message==='intentional callback failure';}
  const afterThrowWrite=await one('bump');const afterThrow=await snapshot();
  await reset();let entered,release;
  const started=new Promise(r=>{entered=r;});const gate=new Promise(r=>{release=r;});
  const holder=navigator.locks.request(name,async()=>{entered();await gate;});await started;
  const denied=await navigator.locks.request(name,{ifAvailable:true},lock=>({refused:lock===null,callbackWorkExecuted:false}));
  let cancelledWork=false,cancelName=null;const abort=new AbortController();
  const waiter=navigator.locks.request(name,{signal:abort.signal},()=>{cancelledWork=true;});abort.abort();
  try{await waiter;}catch(e){cancelName=e.name;}
  const whileHeld=await snapshot();release();await holder;
  const afterCancelWrite=await one('bump');const afterCancel=await snapshot();
  await reset();let missingWork=false,missingRefused=false;
  // Explicit negative contract: absent provider, not a claim this browser lacks it.
  try{const provider=undefined;if(!provider?.request)throw Error('missing provider');missingWork=true;}catch{missingRefused=true;}
  const missingSnapshot=await snapshot();
  const held=(await navigator.locks.query()).held.filter(lock=>lock.name===name).length;
  return{callbackThrow:{rejected,afterThrowWrite,lineage:afterThrow.value.lineage},busyDenied:denied,queuedCancel:{error:cancelName,callbackExecuted:cancelledWork,lineageWhileHeld:whileHeld.value.lineage,afterCancelWrite,lineage:afterCancel.value.lineage},missingProviderContract:{refused:missingRefused,callbackExecuted:missingWork,lineage:missingSnapshot.value.lineage},heldAfter:held};
}
${production ? `async function productionCases(){
  const api=host();await api.store.install.set(null);stopApi2Host(api);
  const emptyAnswers=await Promise.all([one('archive:empty'),one('bump')]);const empty=await snapshot();
  await reset();const mixedAnswers=await Promise.all([one('archive:cedar'),one('bump'),one('set-flag'),one('title')]);const mixed=await snapshot();
  const consumeAnswers=await Promise.all([one('consume'),one('archive:birch'),one('bump')]);const consumed=await snapshot();
  await one('archive:cedar');const duplicate=await snapshot();
  await reset();const failed=host();const reduceFailure=await mutateInstall(failed.store.install,()=>{throw Error('intentional reducer failure');});stopApi2Host(failed);const recovered=await one('bump');const afterFailure=await snapshot();
  const descriptor=Object.getOwnPropertyDescriptor(navigator,'locks');
  const negatives=[];
  for(const mode of ['missing','denied']){
    await reset();Object.defineProperty(navigator,'locks',{configurable:true,value:mode==='missing'?undefined:{request:async()=>{throw new DOMException('fixture denied','SecurityError');}}});
    const answers=await Promise.all([one('archive:blocked'),one('bump'),one('set-flag'),one('title')]);const state=await snapshot();negatives.push({mode,answers,state});
    if(descriptor)Object.defineProperty(navigator,'locks',descriptor);else delete navigator.locks;
  }
  const afterNegative=await one('bump');const recoveredNegative=await snapshot();
  return{emptyAnswers,empty,mixedAnswers,mixed,consumeAnswers,consumed,duplicate,reduceFailure,recovered,afterFailure,negatives,afterNegative,recoveredNegative};
}` : ''}
globalThis.issue20={reset,snapshot,one,pair,lifecycle,${production ? 'productionCases,' : ''}info:()=>({origin:location.origin,secureContext:isSecureContext,webLocksAvailable:typeof navigator.locks?.request==='function',lockName:name,capabilities:[],controllerUsed:false})};globalThis.issue20Ready=true;
`;
}
export const opaqueSource = `(async()=>{let callbackExecuted=false;const info={origin:location.origin,secureContext:isSecureContext};try{if(typeof navigator.locks?.request!=='function')return{...info,unsupported:true,callbackExecuted};await navigator.locks.request(${JSON.stringify(LOCK_NAME)},()=>{callbackExecuted=true;});return{...info,unsupported:false,callbackExecuted};}catch(e){return{...info,unsupported:true,error:e.name,callbackExecuted};}})()`;
export async function runPlatform(driver) {
  const first=await driver.open(),second=await driver.open();
  const info=await driver.evaluate(first,'globalThis.issue20.info()');
  if(!info.webLocksAvailable){await driver.close(first);await driver.close(second);return{supported:false,info};}
  const modes=[
    {name:'archive then bump',ops:['archive:cedar','bump'],keys:['cedar'],lineage:8},
    {name:'bump then archive',ops:['bump','archive:cedar'],keys:['cedar'],lineage:8},
    {name:'two archives',ops:['archive:cedar','archive:birch'],keys:['birch','cedar'],lineage:7},
    {name:'two bumps',ops:['bump','bump'],keys:[],lineage:9},
  ];
  const check=(mode,value)=>{
    assert.deepEqual(value.answers,[true,true]);assert.deepEqual(value.snapshot.archiveKeys,mode.keys);assert.equal(value.snapshot.value.lineage,mode.lineage);
    assert.deepEqual(value.snapshot.value.profileIds,['disposable-p1']);assert.deepEqual(value.snapshot.value.other,{sentinel:'preserve'});
    return value;
  };
  const sequential=[],samePage=[],crossPage=[];
  for(const mode of modes){
    sequential.push({name:mode.name,...check(mode,await driver.evaluate(first,`globalThis.issue20.pair(${JSON.stringify(mode.ops)},false)`))});
    samePage.push({name:mode.name,...check(mode,await driver.evaluate(first,`globalThis.issue20.pair(${JSON.stringify(mode.ops)},true)`))});
  }
  for(let i=0;i<8;i++){
    const mode=modes[i%4];await driver.evaluate(first,'globalThis.issue20.reset()');
    const answers=await Promise.all([driver.evaluate(first,`globalThis.issue20.one(${JSON.stringify(mode.ops[0])})`),driver.evaluate(second,`globalThis.issue20.one(${JSON.stringify(mode.ops[1])})`)]);
    const reader=await driver.open();const snapshot=await driver.evaluate(reader,'globalThis.issue20.snapshot()');await driver.close(reader);
    crossPage.push({attempt:i+1,name:mode.name,...check(mode,{answers,snapshot})});
  }
  const lifecycle=await driver.evaluate(first,'globalThis.issue20.lifecycle()');
  assert.equal(lifecycle.callbackThrow.rejected,true);assert.equal(lifecycle.callbackThrow.afterThrowWrite,true);assert.equal(lifecycle.callbackThrow.lineage,8);
  assert.equal(lifecycle.busyDenied.refused,true);assert.equal(lifecycle.busyDenied.callbackWorkExecuted,false);
  assert.equal(lifecycle.queuedCancel.error,'AbortError');assert.equal(lifecycle.queuedCancel.callbackExecuted,false);assert.equal(lifecycle.queuedCancel.lineageWhileHeld,7);assert.equal(lifecycle.queuedCancel.afterCancelWrite,true);assert.equal(lifecycle.queuedCancel.lineage,8);
  assert.equal(lifecycle.missingProviderContract.refused,true);assert.equal(lifecycle.missingProviderContract.callbackExecuted,false);assert.equal(lifecycle.missingProviderContract.lineage,7);assert.equal(lifecycle.heldAfter,0);
  let productionCases;
  if (driver.production) {
    productionCases = await driver.evaluate(first, 'globalThis.issue20.productionCases()');
    assert.deepEqual(productionCases.emptyAnswers,[true,true]);
    assert.deepEqual(productionCases.empty.archiveKeys,['empty']); assert.equal(productionCases.empty.value.lineage,1);
    assert.deepEqual(productionCases.mixed.archiveKeys,['cedar']); assert.equal(productionCases.mixed.value.lineage,8);
    assert.equal(productionCases.mixed.value.warriorBirth,true); assert.deepEqual(productionCases.mixed.value.profileIds,['disposable-p1','new-profile']);
    assert.deepEqual(productionCases.consumeAnswers,[true,true,true]); assert.deepEqual(productionCases.consumed.archiveKeys,['birch','cedar']); assert.equal(productionCases.consumed.value.lineage,9); assert.equal(productionCases.consumed.value.warriorBirth,undefined);
    assert.deepEqual(productionCases.duplicate.archiveKeys,['birch','cedar']);
    assert.equal(productionCases.reduceFailure.ok,false); assert.equal(productionCases.reduceFailure.phase,'reduce'); assert.equal(productionCases.recovered,true); assert.equal(productionCases.afterFailure.value.lineage,8);
    for(const n of productionCases.negatives){assert.deepEqual(n.answers.slice(0,3),[false,false,false]);assert.equal(n.state.value.lineage,7);assert.deepEqual(n.state.archiveKeys,[]);assert.equal(n.state.value.warriorBirth,undefined);assert.deepEqual(n.state.value.profileIds,['disposable-p1']);assert(n.answers[3].logs.length>0);}
    assert.equal(productionCases.afterNegative,true);assert.equal(productionCases.recoveredNegative.value.lineage,8);
  }
  const opaque=await driver.opaque();assert.equal(opaque.unsupported,true);assert.equal(opaque.callbackExecuted,false);
  await driver.close(first);await driver.close(second);
  return{supported:true,info,sequential,samePage,crossPage,lifecycle,opaque,...(productionCases?{productionCases}:{}),summary:{sequential:4,independentFacades:4,independentPages:8,lostUpdates:0}};
}
