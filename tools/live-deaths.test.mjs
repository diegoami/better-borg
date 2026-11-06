import { afterEach, describe, expect, it } from 'vitest';
import { mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync, symlinkSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createLiveRecorder, packetText, ACK_FORMAT, LIVE_PREFIX } from '../src/records/live-deaths.ts';
import { installDeathExport } from '../src/records/death-export.ts';
import { build } from 'esbuild';
import { runInNewContext } from 'node:vm';
import { importLive } from './live-deaths.mjs';
const roots = [];
afterEach(() => { for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true }); });
function fixture() { const root = mkdtempSync(join(tmpdir(), 'mandos-live-import-')); roots.push(root); return { root, input: join(root, 'export.json'), corpus: join(root, 'corpus'), evidence: join(root, 'evidence'), artifactBase: 'artifacts/local-deaths', reviewed: true }; }
async function capture(outcome = 'death') {
  const data = new Map(), store = { keys: async () => ({ ok: true, value: [...data.keys()] }), get: async k => ({ ok: true, value: structuredClone(data.get(k) ?? null) }), set: async (k, v) => { if (v === null) data.delete(k); else data.set(k, structuredClone(v)); return { ok: true, value: null }; } };
  const recorder = createLiveRecorder({ store, source: () => ({ mod: 'mandos', engine: 'beta.2', api: '2.0.0', codeDigest: null, flags: {}, settings: {} }), log: () => {}, sessionId: 'test' });
  await recorder.capture({ outcome, cause: 'public fixture foe', key: 'public-test', race: 'Human', cls: 'Mage', turn: 100, level: 1, maxLevel: 1, depth: 1, maxDepth: 1, gold: 0, endedAt: 0, messages: [], belongings: [], birth: { stats: [10, 10, 10, 10, 10] } });
  return { recorder, data };
}
function writeInput(f, entries) { writeFileSync(f.input, packetText({ schema: 'mandos/live-export@1', entries })); }
describe('explicit live export/import bridge', () => {
  it('browser-target standalone bundle uses no Node imports and reports absent WebCrypto without affecting construction', async () => {
    const built = await build({ entryPoints: ['src/records/live-deaths.ts'], bundle: true, platform: 'browser', format: 'iife', globalName: 'LiveProof', write: false, logLevel: 'silent' });
    const bytes = built.outputFiles[0].text; expect(bytes).not.toContain('node:');
    const context = { TextEncoder, structuredClone, crypto: globalThis.crypto }; runInNewContext(bytes, context);
    expect(await context.LiveProof.packetHash({ value: 'public' })).toBe(await import('../src/records/live-schema.mjs').then(m => m.packetHash({ value: 'public' })));
    const absent = { TextEncoder, structuredClone }; runInNewContext(bytes, absent);
    const messages = [], r = absent.LiveProof.createLiveRecorder({ store: {}, source: () => ({ mod: 'mandos', engine: 'beta.2', api: '2', codeDigest: null, flags: {}, settings: {} }), log: t => messages.push(t) });
    const { recorder } = await capture(); const existing = (await recorder.entries())[0].packet.terminal;
    expect(await r.capture({ ...existing, cls: existing.class, birth: { stats: existing.birthStats }, messages: [], belongings: [] })).toBe(false);
    expect(messages.join()).toContain('NOT durable');
  });
  it('panel download bytes enter the corpus; verified receipt ACK retires only the imported packet', async () => {
    const f = fixture(), { recorder, data } = await capture(); let panel, onAction; const logs = [];
    const mod = { meta: { log: t => logs.push(t) }, ui: { commands: { register: async () => ({ ok: true, value: null }) }, mount: async (p, a) => { panel = p; onAction = a; return { ok: true, value: { panelId: p.id } }; }, unmount: async () => ({ ok: true, value: null }) } };
    const ui = installDeathExport(mod, recorder, async () => {}); await ui.open();
    const download = panel.root.children.find(n => n.type === 'download');
    expect(download.text).toContain('public fixture foe'); expect(data.size).toBe(1);
    writeFileSync(f.input, download.text);
    const ack = await importLive(f); expect(ack.schema).toBe(ACK_FORMAT); expect(ack.entries).toHaveLength(1);
    const index = JSON.parse(readFileSync(join(f.corpus, 'index.json')));
    expect(index.totals.deaths).toBe(1); expect(index.cases[0].diagnosis).toBe('pending-diagnosis');
    expect(index.cases[0].artifacts[0].sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(await importLive(f)).toEqual(ack); expect(data.size).toBe(1);
    expect(await recorder.acknowledge(packetText(ack))).toBe(1); expect(data.size).toBe(0); ui.stop();
  });
  it('capture survives an unavailable optional panel grant', async () => {
    const { recorder, data } = await capture(); const logs = [];
    const mod = { meta: { log: t => logs.push(t) }, ui: { commands: { register: async () => ({ ok: true, value: null }) }, mount: async () => ({ ok: false, message: 'ui:panel.mount refused' }), unmount: async () => ({ ok: true }) } };
    const ui = installDeathExport(mod, recorder, async () => {}); await ui.open(); expect(data.size).toBe(1); expect(recorder.failure).toBeNull(); expect(logs.join()).toContain('remain pending'); ui.stop();
  });
  it.each(['winner', 'retired'])('imports %s as a terminal event, never a death dossier', async outcome => {
    const f = fixture(), { recorder } = await capture(outcome); writeInput(f, await recorder.entries()); await importLive(f);
    const index = JSON.parse(readFileSync(join(f.corpus, 'index.json'))); expect(index.totals.deaths).toBe(0); expect(index.cases).toHaveLength(0); expect(index.totals.outcomes[outcome]).toBe(1);
  });
  it('refuses unreviewed, corrupted and symlinked imports before corpus writes', async () => {
    const f = fixture(), { recorder } = await capture(); writeInput(f, await recorder.entries());
    await expect(importLive({ ...f, reviewed: false })).rejects.toThrow(/Review/); expect(existsSync(f.corpus)).toBe(false);
    const bad = JSON.parse(readFileSync(f.input)); bad.entries[0].packet.terminal.cause = 'tampered'; writeFileSync(f.input, packetText(bad));
    await expect(importLive(f)).rejects.toThrow(/hash/); expect(existsSync(f.corpus)).toBe(false);
    writeInput(f, await recorder.entries()); mkdirSync(join(f.root, 'outside')); symlinkSync(join(f.root, 'outside'), f.evidence);
    await expect(importLive(f)).rejects.toThrow(/Symlink/); expect(existsSync(f.corpus)).toBe(false);
  });
});
