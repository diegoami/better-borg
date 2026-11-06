#!/usr/bin/env node
/** Explicit reviewed transport import. No game, profile, model, network or GitHub call. */
import { lstatSync, mkdirSync, readFileSync, writeFileSync, linkSync, unlinkSync } from 'node:fs';
import { dirname, resolve, relative, isAbsolute, sep } from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { ingestRecord, buildIndex, hash, json } from './deaths.mjs';
import { ACK_FORMAT, LIVE_EXPORT_LIMIT, packetHash, packetShape, packetText } from '../src/records/live-schema.mjs';
const ROOT = fileURLToPath(new URL('../', import.meta.url));
function assert(ok, message) { if (!ok) throw new Error(message); }
function noLinks(path) {
  for (let p = resolve(path); ; p = dirname(p)) {
    try { assert(!lstatSync(p).isSymbolicLink(), 'Symlink refused: ' + p); } catch (e) { if (e.code !== 'ENOENT') throw e; }
    if (dirname(p) === p) return;
  }
}
function read(path, max = 1024 * 1024) { noLinks(path); const s = lstatSync(path); assert(s.isFile() && s.size <= max, 'Expected bounded regular input'); return readFileSync(path, 'utf8'); }
function inside(parent, child) { const r = relative(parent, child); return r === '' || (!isAbsolute(r) && r !== '..' && !r.startsWith('..' + sep)); }
export function writeImmutableObservation(path, bytes) {
  assert(typeof bytes === 'string' && Buffer.byteLength(bytes, 'utf8') <= 1024 * 1024, 'Immutable observation exceeds 1MiB');
  noLinks(path); mkdirSync(dirname(path), { recursive: true }); noLinks(path);
  try { assert(read(path) === bytes, 'Immutable export conflict: ' + path); return; } catch (e) { if (e.code !== 'ENOENT') throw e; }
  const tmp = path + '.pending-' + randomUUID();
  writeFileSync(tmp, bytes, { flag: 'wx', mode: 0o600 });
  try { linkSync(tmp, path); assert(read(path) === bytes, "Immutable observation did not verify on read-back"); } catch (e) { if (e.code !== 'EEXIST' || read(path) !== bytes) throw e; } finally { unlinkSync(tmp); }
}
function portable(base) { assert(typeof base === 'string' && base.length && !isAbsolute(base) && !base.includes('\\') && !base.split('/').some(v => !v || v === '..') && !/^[a-z][a-z0-9+.-]*:/i.test(base), 'Artifact base must be a portable relative locator'); return base.replace(/\/$/, ''); }
/** ACK is returned only after each receipt and the whole derived corpus verify. */
export async function importLive({ input, corpus, evidence, artifactBase, reviewed = false, origin = 'diegoami/mandos/live' }) {
  assert(reviewed === true, 'Review/scrub the export before importing; explicit --reviewed yes is required');
  const source = resolve(input), root = resolve(corpus), artifacts = resolve(evidence);
  noLinks(source); noLinks(root); noLinks(artifacts);
  assert(!inside(root, artifacts) && !inside(artifacts, root) && !inside(artifacts, source) && !inside(root, source), 'Input, external evidence and corpus must be separate');
  const rel = relative(ROOT, artifacts).split(sep).join('/');
  const base = portable(artifactBase ?? (inside(ROOT, artifacts) ? rel : null));
  const document = JSON.parse(read(source));
  assert(document.schema === 'mandos/live-export@1' && Array.isArray(document.entries) && document.entries.length > 0 && document.entries.length <= LIVE_EXPORT_LIMIT, 'Expected a bounded Mandos live export');
  const seen = new Set();
  // Validate the complete transport before writing any new file.
  for (const entry of document.entries) {
    assert(packetShape(entry) && await packetHash(entry.packet) === entry.sha256 && await packetHash(entry.packet.terminal) === entry.packet.terminalHash, 'Invalid live packet shape/content/terminal hash');
    assert(!seen.has(entry.id), 'Duplicate packet in transport'); seen.add(entry.id);
  }
  const acknowledgements = [];
  for (const entry of document.entries) {
    const p = entry.packet, t = p.terminal, sub = resolve(artifacts, entry.sha256);
    const packetFile = resolve(sub, 'packet.json'), recordFile = resolve(sub, 'runs.json');
    const record = { schema: 'better-borg/runs@1', label: 'Reviewed live terminal export',
      build: { commit: null, engine: p.source.engine, content: null, borg: null }, runner: { tool: 'tools/live-deaths.mjs', lives: 1 },
      runs: [{ runKey: p.id, outcome: t.outcome, seed: t.seed ?? null, life: p.source.life ?? null, race: t.race, class: t.class, baseStats: t.birthStats,
        ...(t.birthRngState ? { birthRngState: t.birthRngState } : {}), ...(t.birthOptions ? { birthOptions: t.birthOptions } : {}),
        decisions: null, turns: t.turn, maxDepth: t.maxDepth, clvl: t.level, gold: t.gold,
        dead: t.outcome === 'death', retired: t.outcome === 'retired', causeOfDeath: t.cause }] };
    writeImmutableObservation(packetFile, packetText(entry)); writeImmutableObservation(recordFile, json(record));
    const locator = `${base}/${entry.sha256}`;
    const result = ingestRecord({ record: recordFile, corpus: root, origin, locator: locator + '/runs.json', artifacts: [
      { kind: 'terminal-and-pre-decision-packet', availability: 'local-only', locator: locator + '/packet.json', sha256: hash(read(packetFile)), knowledge: 'terminal-revealed', note: 'Includes separately labelled pre-decision knowledge/truth precision; bounded tail, not a full recording or fatal save.' },
      { kind: 'recording', availability: 'not-captured', locator: null, knowledge: 'unspecified' },
      { kind: 'pre-death-save', availability: 'not-captured', locator: null, knowledge: 'unspecified' },
    ] });
    buildIndex(root);
    const receipt = read(resolve(root, 'records', result.receipt + '.json'), 8 * 1024 * 1024);
    acknowledgements.push({ id: entry.id, packetSha256: entry.sha256, corpusReceiptSha256: hash(receipt), ...(result.cases[0] ? { caseId: result.cases[0] } : {}) });
  }
  return { schema: ACK_FORMAT, entries: acknowledgements };
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const args = process.argv.slice(2), options = {};
    assert(args.shift() === 'import', 'Usage: node tools/live-deaths.mjs import --input export.json --corpus DIR --evidence DIR --artifact-base PATH --reviewed yes --ack ACK.json');
    while (args.length) { const key = args.shift(); assert(key.startsWith('--') && args.length, 'Expected --option value'); options[key.slice(2)] = args.shift(); }
    assert(options.input && options.corpus && options.evidence && options.ack, 'Input, corpus, evidence and ACK paths required');
    const ack = await importLive({ ...options, artifactBase: options['artifact-base'], reviewed: options.reviewed === 'yes' });
    writeImmutableObservation(resolve(options.ack), json(ack));
    process.stdout.write(`Imported ${ack.entries.length} terminal reports; acknowledgement written. Analysis remains pending.\n`);
  } catch (e) { process.stderr.write(e.message + '\n'); process.exitCode = 1; }
}
