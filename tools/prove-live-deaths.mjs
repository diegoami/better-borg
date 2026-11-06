#!/usr/bin/env node
/** Manual integration proof using immutable PUBLIC frontend objects; never starts a lab. */
import { build } from 'esbuild';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, symlinkSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { strict as assert } from 'node:assert';
import * as Core from '@rpgm-tools/neo-angband-core';
import { CapabilitySet } from '@rpgm-tools/neo-angband-mod-sdk';
import { importLive } from './live-deaths.mjs';
import { hash } from './deaths.mjs';
const ROOT = fileURLToPath(new URL('../', import.meta.url));
const REF = '9d6ae21ec5f733134f8411414359bae3019c7c2d';
const at = process.argv.indexOf('--frontend-repository');
assert(at > 0 && process.argv[at + 1], 'Pass --frontend-repository pointing to our engine tracker git objects');
const repository = resolve(process.argv[at + 1]);
const scratch = mkdtempSync(join(tmpdir(), 'mandos-live-host-proof-'));
const out = join(ROOT, 'artifacts', 'live-death-host-proof'); mkdirSync(out, { recursive: true });
try {
  // Copy immutable committed source only, never any lab files/dirty frontend checkout.
  const archive = execFileSync('git', ['-C', repository, 'archive', REF, 'packages/web/src'], { maxBuffer: 64 * 1024 * 1024 });
  execFileSync('tar', ['-x', '-C', scratch], { input: archive });
  symlinkSync(join(ROOT, 'node_modules'), join(scratch, 'node_modules'));
  const frontendFile = join(out, 'frontend.mjs'), driverFile = join(out, 'driver.mjs');
  await build({ stdin: { contents: 'export {createApi2Host,stopApi2Host} from "./mod-api2-host.ts"; export {modPluginContext,setModRunReports} from "./mod-context.ts"; export {buildRunReport,createRunReports} from "./run-report.ts";', resolveDir: join(scratch, 'packages/web/src'), loader: 'ts' }, bundle: true, platform: 'node', format: 'esm', define: { 'import.meta.glob': '__proofNoBundledModDiscovery', 'import.meta.env.DEV': 'false', 'import.meta.env.PROD': 'true' }, banner: { js: 'const __proofNoBundledModDiscovery = () => ({});' }, packages: 'external', alias: { fflate: join(repository, 'packages/web/node_modules/fflate/esm/index.mjs') }, outfile: frontendFile, loader: { '.css': 'empty' }, logLevel: 'warning' });
  await build({ stdin: { contents: 'export {bindCore} from "./src/core-api.ts"; export * from "./src/play-session.ts"; export {packForClass} from "./src/class/registry.ts"; export * from "./src/records/live-deaths.ts"; export * from "./src/records/death-export.ts";', resolveDir: ROOT, loader: 'ts' }, bundle: true, platform: 'node', format: 'esm', packages: 'external', outfile: driverFile, logLevel: 'warning' });
  const frontend = await import(pathToFileURL(frontendFile).href), driver = await import(pathToFileURL(driverFile).href);
  driver.bindCore(Core);
  const pack = driver.loadPack(driver.packRoot()), strategy = driver.packForClass('Mage'), plan = strategy.planFor(Core, pack);
  const game = Core.startGame(pack, { seed: 3, depth: 0, raceName: plan.raceName, className: strategy.className, roller: 'point', birthStats: [...plan.baseStats] });
  const broker = frontend.createRunReports(); frontend.setModRunReports(broker);
  const storageFile = join(scratch, 'persistent-kv.json');
  const storage = { getItem: key => { try { return JSON.parse(readFileSync(storageFile, 'utf8'))[key] ?? null; } catch (e) { if (e.code === 'ENOENT') return null; throw e; } }, setItem: (key, value) => { let data = {}; try { data = JSON.parse(readFileSync(storageFile, 'utf8')); } catch (e) { if (e.code !== 'ENOENT') throw e; } data[key] = value; writeFileSync(storageFile, JSON.stringify(data)); }, removeItem: key => { const data = JSON.parse(readFileSync(storageFile, 'utf8')); delete data[key]; writeFileSync(storageFile, JSON.stringify(data)); } };
  const grants = ['store:kv','state:player.read','event:run-end','ui:panel.mount','command:add'];
  const caps = CapabilitySet.fromManifest({ id: 'mandos', name: 'Mandos proof', version: '1', modApi: 1, shape: 'plugin', facets: ['plugin'], capabilities: grants });
  let drawn, mounted = false;
  const panels = { apply(_id, op, payload) { if (op === 'mount') { assert.equal(mounted, false); mounted = true; drawn = payload; } if (op === 'patch') { assert.equal(mounted, true); drawn = { ...drawn, ...payload }; } if (op === 'unmount') mounted = false; return null; }, teardown() { mounted = false; }, unmount() { mounted = false; } };
  const makeHost = () => frontend.createApi2Host(frontend.modPluginContext('mandos', {}, game.state, {}, { capabilities: caps, registries: game.booted.registries, snapshotSource: { characterKey: () => 'public-proof-seed3' } }), { grants: caps, tier: "first-party", execution: "in-process", kvStorage: storage, panels });
  const source = () => ({ mod: 'mandos', engine: String(Core.VERSION_STRING ?? 'published beta.2'), api: '2.0.0', codeDigest: null, flags: {}, settings: {} });
  let host = makeHost(), recorder = driver.createLiveRecorder({ store: host.store.kv, source, log() {} });
  assert.equal((await host.store.kv.set("legacy-control", { untouched: true })).ok, true);
  const observation = driver.observingLife(Core, game, pack, frame => recorder.observe(frame));
  const ended = driver.driveLife(Core, game, 600, observation, 3); observation.uninstall(); assert.equal(ended.dead, true);
  let delivered;
  const subscribed = await host.events.on('run-end', event => { delivered = recorder.capture(event.report); }); assert.equal(subscribed.ok, true);
  // Real report builder/broker after an actual Core death. Driver publishes: this is not an Electron-deployment claim.
  const view = Core.createAgentView(game.state);
  const report = frontend.buildRunReport({ state: game.state, view, messages: [], key: 'public-proof-seed3', sheet: null, scored: false, endedAt: 0 });
  broker.publish(report); assert.equal(await delivered, true); assert.equal((await recorder.entries()).length, 1);
  frontend.stopApi2Host(host);
  // Fresh host and recorder use persisted backing, not the previous recorder's memory.
  host = makeHost(); recorder = driver.createLiveRecorder({ store: host.store.kv, source, log() {} });
  const entries = await recorder.entries(); assert.equal(entries.length, 1); assert.equal(entries[0].packet.terminal.outcome, 'death');
  const ui = driver.installDeathExport(host, recorder, async () => {}); await ui.open();
  const download = drawn.root.children.find(n => n.type === 'download'); assert(download);
  const input = join(scratch, 'download.json'); writeFileSync(input, download.text);
  const corpus = join(scratch, 'corpus'), evidence = join(scratch, 'external-evidence');
  const ack = await importLive({ input, corpus, evidence, artifactBase: 'local-proof-evidence', reviewed: true });
  assert.equal(ack.entries.length, 1); assert.equal(await recorder.acknowledge(driver.packetText(ack)), 1); assert.equal((await recorder.entries()).length, 0); assert.deepEqual((await host.store.kv.keys()).value, ['legacy-control']); assert.deepEqual((await host.store.kv.get('legacy-control')).value, { untouched: true });
  await ui.open(); ui.stop(); frontend.stopApi2Host(host); frontend.setModRunReports(undefined);
  const receipt = { schema: 'mandos/live-host-proof@1', frontendRef: REF, publishedEngine: '1.23.0-beta.2 with Mandos carried patch set', seed: 3,
    actualCoreDeath: { turn: game.state.turn, decisions: ended.taken, cause: report.cause }, deliveredByRealBroker: true, freshHostPersistentKV: true,
    actualApi2PanelDownloadImported: true, verifiedImportAcknowledged: true, removedOnlyNewOutboxPacket: true,
    packetId: entries[0].id, packetSha256: entries[0].sha256, downloadSha256: hash(download.text),
    buildAdapter: 'Vite import.meta.glob build-time mod/content discovery returns no bundled UI mods; not exercised by this report/KV/broker/panel contract proof. Frontend fflate dependency resolved from tracker install.',
    scope: 'Published Core death plus pinned real frontend report builder/broker/API2 KV/panel contract, explicit driver publication. No full Electron deployment, owner profile, fatal save or exact replay.' };
  writeFileSync(join(out, 'receipt.json'), JSON.stringify(receipt, null, 2) + '\n'); console.log(JSON.stringify(receipt, null, 2));
} finally { rmSync(scratch, { recursive: true, force: true }); }
