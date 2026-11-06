#!/usr/bin/env node
/** Disposable real-browser evidence only. No runtime correction or engine patch. */
import { build } from 'esbuild';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdtempSync, mkdirSync, existsSync, readFileSync, writeFileSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { strict as assert } from 'node:assert';
const root = fileURLToPath(new URL('../../', import.meta.url));
const at = process.argv.indexOf('--frontend-repository');
assert(at > 0 && process.argv[at + 1], 'Pass --frontend-repository pointing to existing public engine tracker objects/tooling');
const frontend = resolve(process.argv[at + 1]);
const outputAt = process.argv.indexOf('--out');
const out = resolve(outputAt > 0 ? process.argv[outputAt + 1] : join(root, 'artifacts/issue20-browser-before'));
assert(!existsSync(out), 'Preserve prior attempts: output directory already exists');
mkdirSync(out, { recursive: true });
const ref = '97ceec2925e6715ba725624a61866ab93a196a12';
const scratch = mkdtempSync(join(tmpdir(), 'mandos20-browser-'));
const sha = data => createHash('sha256').update(data).digest('hex');
const require = createRequire(join(frontend, 'package.json'));
const { chromium } = require('playwright');
let browser, server;
try {
  const archive = execFileSync('git', ['-C', frontend, 'archive', ref, 'packages/web/src'], { maxBuffer: 64 * 1024 * 1024 });
  execFileSync('tar', ['-x', '-C', scratch], { input: archive });
  symlinkSync(join(root, 'node_modules'), join(scratch, 'node_modules'));
  const web = join(scratch, 'packages/web/src');
  const entry = `
import { createApi2Host, stopApi2Host } from ${JSON.stringify(join(web, 'mod-api2-host.ts'))};
import { modPluginContext } from ${JSON.stringify(join(web, 'mod-context.ts'))};
import { modInstallPrefs } from ${JSON.stringify(join(web, 'mod-prefs.ts'))};
import { CapabilitySet } from '@rpgm-tools/neo-angband-mod-sdk';
import { archiveFinishedRun, graveyardArchiveOf, GRAVEYARD_KEY } from ${JSON.stringify(join(root, 'src/records/journal.ts'))};
import { bumpLineage } from ${JSON.stringify(join(root, 'src/class/warrior/lineage.ts'))};
const grants = CapabilitySet.fromManifest({id:'mandos',name:'Disposable store probe',version:'1',modApi:1,shape:'plugin',facets:['plugin'],capabilities:[]});
function host() {
  // Actual default install backing: no fake storage or replacement get/set.
  const ctx = modPluginContext('mandos', {}, undefined, {}, {capabilities:grants});
  return createApi2Host(ctx, {grants, tier:'public', execution:'in-process'});
}
const initial = {profileIds:['disposable-p1'],lineage:7,other:{sentinel:'preserve'}};
const report = key => ({key,outcome:'death',cause:'synthetic public fixture',name:'Fixture',race:'Human',cls:'Warrior',level:1,maxLevel:1,depth:1,maxDepth:1,gold:0,turn:10,score:0,scored:false,endedAt:0,history:[],messages:[],belongings:[],sheet:null,birth:{race:'Human',cls:'Warrior',name:'Fixture',stats:[10,10,10,10,10]}});
async function operation(api, op) {
  return op==='bump' ? bumpLineage(api.store.install) : archiveFinishedRun({archive:api.store.install,log:()=>{}},report(op.slice(8)));
}
async function snapshot() {
  const reader=host();
  try { const read=await reader.store.install.get(); if(!read.ok)throw Error(read.message);
    return {value:read.value,archiveKeys:graveyardArchiveOf(read.value?.[GRAVEYARD_KEY]??null).runs.map(r=>r.run).sort(),rawInstall:modInstallPrefs('mandos').get()};
  } finally { stopApi2Host(reader); }
}
async function reset() {const api=host();try{const r=await api.store.install.set(initial);if(!r.ok)throw Error(r.message);}finally{stopApi2Host(api);}}
async function one(op) {const api=host();try{return await operation(api,op);}finally{stopApi2Host(api);}}
async function pair(ops, concurrent) {
  await reset(); const a=host(),b=host();let answers;
  try {answers=concurrent?await Promise.all([operation(a,ops[0]),operation(b,ops[1])]):[await operation(a,ops[0]),await operation(b,ops[1])];}
  finally {stopApi2Host(a);stopApi2Host(b);}
  return {answers,snapshot:await snapshot()};
}
globalThis.issue20={reset,one,pair,snapshot,info:()=>({origin:location.origin,secureContext:isSecureContext,webLocksAvailable:typeof navigator.locks?.request==='function',installStorageKey:'neo:modPrefs:install:mandos',controllerUsed:false,capabilities:[]})};
globalThis.issue20Ready=true;
`;
  const bundle = join(scratch, 'client.js');
  await build({ stdin: { contents: entry, resolveDir: root, loader: 'ts' }, bundle: true, platform: 'browser', format: 'iife', outfile: bundle,
    alias: { fflate: join(frontend, 'packages/web/node_modules/fflate/esm/browser.js') },
    define: { 'import.meta.glob':'__probeUnusedDiscovery', 'import.meta.env.DEV':'false', 'import.meta.env.PROD':'true' },
    banner: { js:'const __probeUnusedDiscovery=()=>({});' }, loader:{'.css':'empty'}, logLevel:'warning' });
  const bytes = readFileSync(bundle);
  server = createServer((req,res) => {
    if(req.url==='/client.js'){res.writeHead(200,{'content-type':'text/javascript'});res.end(bytes);return;}
    if(req.url==='/'){res.writeHead(200,{'content-type':'text/html'});res.end('<!doctype html><title>Disposable storage proof</title><script src="/client.js"></script>');return;}
    res.writeHead(404);res.end();
  });
  await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({ headless:true });
  // New ephemeral context; no persistent userDataDir or owner storage.
  const context=await browser.newContext();
  const errors=[];
  const newPage=async()=>{const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(origin);await page.waitForFunction(()=>globalThis.issue20Ready===true);return page;};
  const page1=await newPage(),page2=await newPage();
  const info=await page1.evaluate(()=>globalThis.issue20.info());
  const modes=[
    {name:'archive then bump',ops:['archive:cedar','bump'],expectedKeys:['cedar'],expectedLineage:8},
    {name:'bump then archive',ops:['bump','archive:cedar'],expectedKeys:['cedar'],expectedLineage:8},
    {name:'two distinct archives',ops:['archive:cedar','archive:birch'],expectedKeys:['birch','cedar'],expectedLineage:7},
    {name:'two lineage bumps',ops:['bump','bump'],expectedKeys:[],expectedLineage:9},
  ];
  function assess(mode,result){return {...result,lostArchive:mode.expectedKeys.some(k=>!result.snapshot.archiveKeys.includes(k)),lostCounterIncrement:result.snapshot.value.lineage<mode.expectedLineage,siblingsPreserved:JSON.stringify(result.snapshot.value.profileIds)==='["disposable-p1"]'&&result.snapshot.value.other.sentinel==='preserve'};}
  const controls=[],samePage=[],crossPage=[];
  for(const mode of modes){
    const sequential=assess(mode,await page1.evaluate(async ops=>globalThis.issue20.pair(ops,false),mode.ops));
    assert.deepEqual(sequential.answers,[true,true]);assert.equal(sequential.lostArchive,false);assert.equal(sequential.lostCounterIncrement,false);assert.equal(sequential.siblingsPreserved,true);
    controls.push({name:mode.name,...sequential});
    samePage.push({name:mode.name,...assess(mode,await page1.evaluate(async ops=>globalThis.issue20.pair(ops,true),mode.ops))});
  }
  for(let attempt=0;attempt<8;attempt++){
    const mode=modes[attempt%modes.length];await page1.evaluate(()=>globalThis.issue20.reset());
    const answers=await Promise.all([page1.evaluate(op=>globalThis.issue20.one(op),mode.ops[0]),page2.evaluate(op=>globalThis.issue20.one(op),mode.ops[1])]);
    const reader=await newPage();const snapshot=await reader.evaluate(()=>globalThis.issue20.snapshot());await reader.close();
    crossPage.push({attempt:attempt+1,name:mode.name,...assess(mode,{answers,snapshot})});
  }
  assert.deepEqual(errors,[],'real browser page errors');
  const counts = rows => ({cases:rows.length,lostArchive:rows.filter(r=>r.lostArchive).length,lostCounterIncrement:rows.filter(r=>r.lostCounterIncrement).length});
  const inputs = Object.fromEntries(['src/records/journal.ts','src/class/warrior/lineage.ts','src/birth/flag.ts','title.ts','pnpm-lock.yaml','tools/proofs/issue20-browser.mjs'].map(p=>[p,sha(readFileSync(join(root,p)))]));
  const source = Object.fromEntries(['mod-api2-host.ts','mod-prefs.ts','main.ts'].map(p=>[p,sha(readFileSync(join(web,p)))]));
  const result={schema:'mandos/issue20-browser-proof@1',baseline:'03fcb3fc1109b64d090f2f618fe487fb823fb365',frontendRef:ref,node:process.version,chromium:browser.version(),info,
    fixtureRole:'synthetic public run reports; actual production archive/lineage functions, actual official API2 host/default modInstallPrefs/native localStorage; no controller/gameplay',
    adapters:'Only unused Vite module/content discovery and production DEV/PROD build constants; no get/set delay, replacement, CAS, locking or transaction shim.',
    desktopCoverage:'Desktop source uses standard+secure neo-angband://game. This run uses the shown Chromium loopback origin; actual Electron custom-scheme behavior is not executed.',
    inputHashes:inputs,frontendHashes:source,controls,samePage,crossPage,summary:{sequential:counts(controls),independentFacades:counts(samePage),independentSameOriginPages:counts(crossPage)},browserErrors:errors};
  writeFileSync(join(out,'result.json'),JSON.stringify(result,null,2)+'\n');
  writeFileSync(join(out,'summary.json'),JSON.stringify({info,summary:result.summary,browserErrors:errors},null,2)+'\n');
  console.log(JSON.stringify({info,summary:result.summary,browserErrors:errors},null,2));
  const reproduced=[...samePage,...crossPage].some(r=>r.lostArchive||r.lostCounterIncrement);
  writeFileSync(join(out,'exit.txt'),(reproduced?'1':'0')+'\n');
  process.exitCode=reproduced?1:0;
  await context.close();
} catch(error){writeFileSync(join(out,'attempt-error.txt'),String(error.stack??error)+'\n');throw error;}
finally {await browser?.close();if(server)await new Promise(resolve=>server.close(resolve));rmSync(scratch,{recursive:true,force:true});}
