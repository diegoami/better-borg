#!/usr/bin/env node
/** Fresh browser/Electron platform control, never a production fix or Neo app launch. */
import {build} from 'esbuild';
import {createRequire} from 'node:module';
import {execFileSync,spawn} from 'node:child_process';
import {createServer} from 'node:http';
import {mkdtempSync,mkdirSync,existsSync,readFileSync,writeFileSync,rmSync,symlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {resolve,join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {strict as assert} from 'node:assert';
import {clientSource,runPlatform,opaqueSource} from './issue20-platform-client.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const at=process.argv.indexOf('--frontend-repository');assert(at>0,'--frontend-repository required');
const frontend=resolve(process.argv[at+1]),outAt=process.argv.indexOf('--out');
const out=resolve(outAt>0?process.argv[outAt+1]:join(root,'artifacts/issue20-platform'));assert(!existsSync(out),'Preserve earlier attempts; output exists');mkdirSync(out,{recursive:true});
const production=process.argv.includes('--production');
if(!production&&existsSync(join(root,'src/records/install-mutation.ts')))throw Error('Use --production for the actual helper; external-lock control must use frozen cc9379a to avoid nested locks');
const scratch=mkdtempSync(join(tmpdir(),'mandos20-platform-')),ref='97ceec2925e6715ba725624a61866ab93a196a12';
const req=createRequire(join(frontend,'package.json'));const{chromium}=req('playwright');
let browser,server;
try{
 const archive=execFileSync('git',['-C',frontend,'archive',ref,'packages/web/src','packages/desktop/src/app-origin.ts','packages/desktop/src/routes.ts'],{maxBuffer:64*1024*1024});execFileSync('tar',['-x','-C',scratch],{input:archive});
 symlinkSync(join(root,'node_modules'),join(scratch,'node_modules'));const web=join(scratch,'packages/web/src'),bundle=join(scratch,'client.js');
 await build({stdin:{contents:clientSource(web,root,production),resolveDir:root,loader:'ts'},bundle:true,platform:'browser',format:'iife',outfile:bundle,alias:{fflate:join(frontend,'packages/web/node_modules/fflate/esm/browser.js')},define:{'import.meta.glob':'__probeUnusedDiscovery','import.meta.env.DEV':'false','import.meta.env.PROD':'true'},banner:{js:'const __probeUnusedDiscovery=()=>({});'},loader:{'.css':'empty'},logLevel:'warning'});
 const bytes=readFileSync(bundle),html='<!doctype html><title>Disposable native metadata lock control</title><script src="/client.js"></script>';
 server=createServer((r,s)=>{s.writeHead(200,{'content-type':r.url==='/client.js'?'text/javascript':'text/html'});s.end(r.url==='/client.js'?bytes:html);});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const origin=`http://127.0.0.1:${server.address().port}`;browser=await chromium.launch({headless:true});const context=await browser.newContext();const errors=[];
 const driver={production,open:async()=>{const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(origin);await p.waitForFunction(()=>globalThis.issue20Ready===true);return p;},evaluate:(p,js)=>p.evaluate(js),close:p=>p.close(),opaque:async()=>{const p=await context.newPage();await p.goto('data:text/html,<title>Opaque qualification</title>');const r=await p.evaluate(opaqueSource);await p.close();return r;}};
 const chrome=await runPlatform(driver);assert.deepEqual(errors,[]);writeFileSync(join(out,'chromium.json'),JSON.stringify({version:browser.version(),...chrome,browserErrors:errors},null,2)+'\n');await context.close();await browser.close();browser=null;
 // Resolve package metadata/path without requiring electron/index.js (which auto-installs).
 const desktopReq=createRequire(join(frontend,'packages/desktop/package.json'));
 let electron={supported:false,reason:'installed runtime unavailable'};
 try{
  const pkg=desktopReq.resolve('electron/package.json'),dir=dirname(pkg),pathFile=join(dir,'path.txt');
  assert(existsSync(pathFile),'No installed runtime path; installer must not run');
  const binary=join(dir,'dist',readFileSync(pathFile,'utf8').trim());assert(existsSync(binary),'No installed runtime binary; no download attempted');
  const appOrigin=join(scratch,'app-origin.cjs'),common=join(scratch,'platform-control.cjs');
  await build({entryPoints:[join(scratch,'packages/desktop/src/app-origin.ts')],bundle:true,platform:'node',format:'cjs',outfile:appOrigin,logLevel:'silent'});
  await build({entryPoints:[join(root,'tools/proofs/issue20-platform-client.mjs')],bundle:true,platform:'node',format:'cjs',outfile:common,logLevel:'silent'});
  const resultFile=join(out,'electron.json'),main=join(scratch,'electron-main.cjs');
  const code=`const{app,BrowserWindow,session,protocol}=require('electron');const fs=require('node:fs');const path=require('node:path');
const base=${JSON.stringify(scratch)};for(const n of ['user-data','session-data','cache','crashes','logs'])fs.mkdirSync(path.join(base,n),{recursive:true});
app.setName('Mandos20DisposableFixture');app.setPath('userData',path.join(base,'user-data'));app.setPath('sessionData',path.join(base,'session-data'));app.setPath('crashDumps',path.join(base,'crashes'));app.setAppLogsPath(path.join(base,'logs'));app.commandLine.appendSwitch('disk-cache-dir',path.join(base,'cache'));
const{APP_SCHEME,APP_ORIGIN,APP_SCHEME_PRIVILEGES}=require(${JSON.stringify(appOrigin)});protocol.registerSchemesAsPrivileged([{scheme:APP_SCHEME,privileges:APP_SCHEME_PRIVILEGES}]);
const{runPlatform,opaqueSource}=require(${JSON.stringify(common)});const windows=[];let errors=[];
(async()=>{await app.whenReady();const own=session.fromPartition('persist:mandos20-disposable');own.protocol.handle(APP_SCHEME,request=>new Response(new URL(request.url).pathname==='/client.js'?fs.readFileSync(${JSON.stringify(bundle)}):${JSON.stringify(html)},{headers:{'content-type':new URL(request.url).pathname==='/client.js'?'text/javascript':'text/html','Cross-Origin-Opener-Policy':'same-origin','Cross-Origin-Embedder-Policy':'require-corp'}}));
async function open(url=APP_ORIGIN){const win=new BrowserWindow({show:false,webPreferences:{session:own,nodeIntegration:false,contextIsolation:true,sandbox:true}});windows.push(win);win.webContents.on('console-message',(_e,...args)=>{});await win.loadURL(url);if(url===APP_ORIGIN){const ready=await win.webContents.executeJavaScript('globalThis.issue20Ready===true');if(!ready)throw Error('Fixture not ready');}return win;}
const result=await runPlatform({production:${JSON.stringify(production)},open:()=>open(),evaluate:(w,js)=>w.webContents.executeJavaScript(js),close:async w=>w.destroy(),opaque:async()=>{const w=await open('data:text/html,<title>Opaque qualification</title>');const r=await w.webContents.executeJavaScript(opaqueSource);w.destroy();return r;}});
fs.writeFileSync(${JSON.stringify(resultFile)},JSON.stringify({versions:process.versions,schemePrivileges:APP_SCHEME_PRIVILEGES,...result,scope:'Fresh disposable fixture only; no Neo app/profile loaded; explicit no-sandbox test launch.'},null,2)+'\\n');for(const w of windows)if(!w.isDestroyed())w.destroy();app.quit();})().catch(e=>{fs.writeFileSync(${JSON.stringify(resultFile)},JSON.stringify({supported:false,error:String(e.stack??e)},null,2)+'\\n');for(const w of windows)if(!w.isDestroyed())w.destroy();app.exit(1);});`;
  writeFileSync(main,code);
  const child=spawn('xvfb-run',['-a',binary,'--no-sandbox',`--user-data-dir=${join(scratch,'user-data')}`,main],{env:process.env,stdio:['ignore','pipe','pipe']});
  let log='';child.stdout.on('data',x=>log+=x);child.stderr.on('data',x=>log+=x);const status=await new Promise((res,rej)=>{child.on('error',rej);child.on('exit',res);});writeFileSync(join(out,'electron-run.log'),log);
  electron=JSON.parse(readFileSync(resultFile,'utf8'));electron.launchExit=status;electron.packageVersion=JSON.parse(readFileSync(pkg,'utf8')).version;electron.binarySha256=createHash('sha256').update(readFileSync(binary)).digest('hex');writeFileSync(resultFile,JSON.stringify(electron,null,2)+'\n');
 }catch(e){electron={supported:false,reason:String(e.message)};writeFileSync(join(out,'electron-blocker.json'),JSON.stringify(electron,null,2)+'\n');}
 const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
 const receipt={schema:'mandos/issue20-platform-control@1',sourceMode:production?'actual-production-helper-under-test':'external-platform-control',baseline:production?'05ea56fce0001e95f23bbfeddeeafc2da4d6acf0':'03fcb3fc1109b64d090f2f618fe487fb823fb365',frontendRef:ref,node:process.version,node22:'not run: no local Node22 binary; final hosted qualification still required',chromium:chrome.summary??chrome,electron:electron.summary??electron,
  scope:production?'Actual production coordinator/callers, no outer lock wrapper; same current-version cooperating writers only. No cached birth-draw uniqueness guarantee.':'External native Web Locks around unchanged production functions; same current-version cooperating writers only.',
  adapters:'Unused Vite discovery/production constants only; no get/set shim, Core patch, controller, new grant or owner data.',
  toolingIncident:'Initial package lookup required electron/index.js and triggered its ignored dependency installer/path metadata. No tracked engine/lock or owner profile changed. This probe subsequently resolves a checked binary path without running that installer; no shared dependency cleanup.',
  inputs:Object.fromEntries(['tools/proofs/issue20-platform.mjs','tools/proofs/issue20-platform-client.mjs','src/records/journal.ts','src/class/warrior/lineage.ts',...(production?['src/records/install-mutation.ts','src/birth/flag.ts','src/class/warrior/presenter.ts','title.ts']:[])].map(p=>[p,hash(join(root,p))]))};
 writeFileSync(join(out,'receipt.json'),JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify({chromium:chrome.summary??chrome,electron:electron.summary??electron},null,2));
 if(!electron.supported)process.exitCode=1;
}catch(e){writeFileSync(join(out,'attempt-error.txt'),String(e.stack??e)+'\n');throw e;}
finally{await browser?.close();if(server)await new Promise(r=>server.close(r));rmSync(scratch,{recursive:true,force:true});}
