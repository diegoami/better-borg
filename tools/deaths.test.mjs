import { afterEach, describe, expect, it } from 'vitest';
import { execFileSync, spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { once } from 'node:events';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { appendAnalysis, buildIndex, hash, ingestRecord, inspectWriter, json, recoverWriter } from './deaths.mjs';

const temporary = [];
afterEach(() => { for (const root of temporary.splice(0)) rmSync(root, { recursive: true, force: true }); });
function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'mandos-death-corpus-test-')); temporary.push(root);
  mkdirSync(join(root, 'input'));
  return { root, record: join(root, 'input', 'runs.json'), corpus: join(root, 'corpus') };
}
function dead(extra = {}) { return { seed: 7, life: 1, race: 'Human', class: 'Mage', baseStats: [10, 10, 10, 10, 10], decisions: 3, turns: 50, maxDepth: 1, clvl: 1, dead: true, retired: false, causeOfDeath: 'test foe', commands: { walk: 3 }, ...extra }; }
function document(runs, extra = {}) { return { schema: 'better-borg/runs@1', label: 'fixture', recorded: '2026-11-06T00:00:00Z', build: { commit: 'a'.repeat(40), engine: 'fixture-core', content: 'fixture-content', borg: 'fixture' }, runner: { decisions: 10, seeds: [7], lives: runs.length, stage: null }, runs, ...extra }; }
function put(f, value) { writeFileSync(f.record, json(value)); return f; }
function ingest(f, extra = {}) { return ingestRecord({ record: f.record, corpus: f.corpus, ...extra }); }
function readIndex(f) { return JSON.parse(readFileSync(join(f.corpus, 'index.json'), 'utf8')); }
function allFiles(root, prefix = '') {
  if (!existsSync(root)) return {};
  return Object.fromEntries(readdirSync(root, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? Object.entries(allFiles(join(root, entry.name), prefix + entry.name + '/')) : [[prefix + entry.name, readFileSync(join(root, entry.name), 'utf8')]]));
}
function analysis(extra = {}) { return { author: 'synthetic test analyst', tool: 'unit control', basis: 'observed', summary: 'A test observation, not a real diagnosis', disposition: 'hypothesis', confidence: 'low', observations: ['Recorded test choice'], hypotheses: ['Needs an independent experiment'], mechanism: 'test-only', replay: { status: 'not-attempted' }, evidence: [{ kind: 'messages', locator: null, availability: 'not-captured', knowledge: 'character-known' }], actions: [{ url: 'https://github.com/example/test/issues/1', relationship: 'proposed' }], ...extra }; }

describe('offline death corpus', () => {
  it('separates repeated seeds across lives, classes and source records without rewriting input', () => {
    const f = put(fixture(), document([dead(), dead({ life: 2 }), dead({ class: 'Rogue' })]));
    const source = readFileSync(f.record);
    const result = ingest(f); expect(new Set(result.cases).size).toBe(3);
    expect(readFileSync(f.record)).toEqual(source);
    writeFileSync(f.record, json(document([dead()], { label: 'another run' })));
    ingest(f); expect(readIndex(f).totals.deaths).toBe(4);
  });
  it('is byte-idempotent on duplicate imports and repeated derived-index generation', () => {
    const f = put(fixture(), document([dead()])); ingest(f);
    const before = allFiles(f.corpus);
    expect(ingest(f).alreadyPresent).toBe(true); buildIndex(f.corpus);
    expect(allFiles(f.corpus)).toEqual(before);
  });
  it('deduplicates an explicitly namespaced trusted key while exposing source occurrences', () => {
    const f = put(fixture(), document([dead({ runKey: 'public-event-1' })]));
    ingest(f, { origin: 'test/desktop-a' });
    writeFileSync(f.record, json(document([dead({ runKey: 'public-event-1' })], { label: 'export copy' })));
    ingest(f, { origin: 'test/desktop-a' });
    expect(readIndex(f).totals).toMatchObject({ deaths: 1, uniqueEvents: 1, sourceRecords: 2, recordedOutcomeOccurrences: 2 });
    ingest(f, { origin: 'test/desktop-b' }); expect(readIndex(f).totals.deaths).toBe(2);
  });
  it('refuses conflicting trusted-key facts before publishing any new receipt or case', () => {
    const f = put(fixture(), document([dead({ runKey: 'event' })])); ingest(f);
    const before = allFiles(f.corpus);
    put(f, document([dead({ runKey: 'new-event' }), dead({ runKey: 'event', causeOfDeath: 'changed foe' })]));
    expect(() => ingest(f)).toThrow(/Conflicting trusted identity/);
    expect(allFiles(f.corpus)).toEqual(before);
  });
  it('preserves all non-death outcomes and unknowns in coverage denominators', () => {
    const runs = [dead(), dead({ life: 2, dead: false, retired: true }), dead({ life: 3, dead: false, decisions: 10 }), dead({ life: 4, dead: false }), dead({ life: 5, dead: false, stall: { kind: 'idle', command: null, decision: 3, turn: 50 } }), ...['crash', 'timeout', 'failure', 'unknown'].map((outcome, n) => dead({ life: 6 + n, dead: false, outcome }))];
    const f = put(fixture(), document(runs)); ingest(f);
    expect(readIndex(f).totals).toMatchObject({ uniqueEvents: 9, deaths: 1, outcomes: { death: 1, stall: 1, retired: 1, 'cap-survivor': 1, 'survived-slice': 1, crash: 1, timeout: 1, failure: 1, unknown: 1 } });
  });
  it('keeps missing legacy context and uncaptured artifacts honest', () => {
    const f = put(fixture(), { schema: 'better-borg/runs@1', runs: [{ dead: true, causeOfDeath: 'unknown context' }] }); ingest(f);
    const item = readIndex(f).cases[0];
    expect(item.replay.status).toBe('missing-input'); expect(item.diagnosis).toBe('pending-diagnosis');
    expect(item.artifacts.every(ref => ref.availability === 'not-captured')).toBe(true);
  });
  it('rejects malformed/conflicting rows before creating output', () => {
    for (const bad of [{ schema: 'wrong', runs: [] }, document([null]), document([dead({ seed: 'bad' })]), document([dead({ retired: true })]), document([dead({ birthOptions: { credential: 'not a birth option' } })])]) {
      const f = put(fixture(), bad);
      expect(() => ingest(f)).toThrow(); expect(existsSync(f.corpus)).toBe(false);
    }
  });
  it('refuses source overlap, unrelated nonempty outputs and symlink traversal', () => {
    const f = put(fixture(), document([dead()]));
    expect(() => ingest(f, { corpus: join(f.root, 'input', 'nested') })).toThrow(/separate/);
    mkdirSync(f.corpus); writeFileSync(join(f.corpus, 'owner.txt'), 'preserve');
    expect(() => ingest(f)).toThrow(/nonempty/); expect(readFileSync(join(f.corpus, 'owner.txt'), 'utf8')).toBe('preserve');
    const g = put(fixture(), document([dead()])); symlinkSync(join(g.root, 'absent'), g.corpus);
    expect(() => ingest(g)).toThrow(/Symlink/); expect(existsSync(join(g.root, 'absent'))).toBe(false);
  });
  it('recovers an interrupted ingest without counting orphan cases as completed deaths', () => {
    const f = put(fixture(), document([dead(), dead({ life: 2 })]));
    expect(() => ingest(f, { onCaseWritten: () => { throw new Error('simulated interruption'); } })).toThrow(/interruption/);
    expect(buildIndex(f.corpus).totals.deaths).toBe(0);
    ingest(f); expect(readIndex(f).totals.deaths).toBe(2);
  });
  it('detects immutable case corruption rather than overwriting it on retry', () => {
    const f = put(fixture(), document([dead()])), id = ingest(f).cases[0];
    const path = join(f.corpus, 'cases', id, 'case.json'), value = JSON.parse(readFileSync(path, 'utf8'));
    value.facts.causeOfDeath = 'tampered'; writeFileSync(path, json(value));
    expect(() => ingest(f)).toThrow(/mismatch/); expect(JSON.parse(readFileSync(path)).facts.causeOfDeath).toBe('tampered');
  });
  it('appends attributed analysis revisions idempotently and separates knowledge domains', () => {
    const f = put(fixture(), document([dead()])), caseId = ingest(f).cases[0];
    const first = analysis({ evidence: [{ kind: 'terminal sheet', availability: 'unverified', locator: 'https://example.test/public/record.json', knowledge: 'terminal-revealed' }] });
    expect(appendAnalysis({ corpus: f.corpus, caseId, analysis: first })).toEqual({ revision: 1, alreadyPresent: false });
    expect(appendAnalysis({ corpus: f.corpus, caseId, analysis: first })).toEqual({ revision: 1, alreadyPresent: true });
    expect(readIndex(f).cases[0].artifacts.every(ref => ref.availability === 'not-captured')).toBe(true);
    expect(readIndex(f).cases[0].analysisEvidence[0].knowledge).toBe('terminal-revealed');
    appendAnalysis({ corpus: f.corpus, caseId, analysis: analysis({ disposition: 'no-bug-found', mechanism: null }) });
    const index = readIndex(f); expect(index.cases[0].diagnosis).toBe('no-bug-found');
    const history = readdirSync(join(f.corpus, 'cases', caseId, 'analysis')); expect(history).toHaveLength(2);
    expect(JSON.parse(readFileSync(join(f.corpus, 'cases', caseId, 'analysis', history[0]))).analysis.evidence[0].knowledge).toBe('terminal-revealed');
  });
  it('keeps pending, hypothesis and confirmed mechanism groups distinct and deduplicates actions', () => {
    const f = put(fixture(), document([dead(), dead({ life: 2 }), dead({ life: 3 })])), ids = ingest(f).cases;
    appendAnalysis({ corpus: f.corpus, caseId: ids[0], analysis: analysis() });
    appendAnalysis({ corpus: f.corpus, caseId: ids[1], analysis: analysis({ disposition: 'confirmed-defect', confidence: 'high', evidence: [{ kind: 'synthetic test control', availability: 'unverified', locator: 'https://example.test/control', sha256: hash('synthetic control only'), knowledge: 'engine-diagnostic' }] }) });
    const index = readIndex(f);
    expect(index.totals.diagnosis).toEqual({ 'pending-diagnosis': 1, hypothesis: 1, 'confirmed-defect': 1 });
    expect(index.mechanisms.map(group => group.disposition)).toEqual(['confirmed-defect', 'hypothesis']);
    expect(index.actions).toHaveLength(1); expect(index.actions[0].cases).toHaveLength(2);
  });
  it('rejects unsafe artifact references and unattributed or unsupported analysis claims', () => {
    const f = put(fixture(), document([dead()])), caseId = ingest(f).cases[0];
    for (const locator of ['/private/profile', '../outside', 'https://example.test/file?download=1', 'file:///tmp/profile', 'file:relative', 'data:ignored']) {
      expect(() => appendAnalysis({ corpus: f.corpus, caseId, analysis: analysis({ evidence: [{ kind: 'test', availability: 'unverified', knowledge: 'unspecified', locator }] }) })).toThrow();
    }
    expect(() => appendAnalysis({ corpus: f.corpus, caseId, analysis: analysis({ author: '' }) })).toThrow();
    expect(() => appendAnalysis({ corpus: f.corpus, caseId, analysis: analysis({ disposition: 'confirmed-defect', observations: [], evidence: [] }) })).toThrow();
    expect(() => appendAnalysis({ corpus: f.corpus, caseId, analysis: analysis({ replay: { status: 'exact' }, evidence: [] }) })).toThrow();
  });
  it('detects a corrupted analysis chain and refuses derived-index symlinks', () => {
    const f = put(fixture(), document([dead()])), caseId = ingest(f).cases[0];
    appendAnalysis({ corpus: f.corpus, caseId, analysis: analysis() });
    const dir = join(f.corpus, 'cases', caseId, 'analysis'), file = join(dir, readdirSync(dir)[0]);
    const value = JSON.parse(readFileSync(file)); value.previousSha256 = '0'.repeat(64); writeFileSync(file, json(value));
    expect(() => buildIndex(f.corpus)).toThrow(/chain/);
    const g = put(fixture(), document([dead()])); ingest(g); rmSync(join(g.corpus, 'index.md'));
    symlinkSync(join(g.root, 'absent'), join(g.corpus, 'index.md'));
    expect(() => buildIndex(g.corpus)).toThrow(/Symlink refused/); expect(existsSync(join(g.root, 'absent'))).toBe(false);
  });
  it('rejects receipt corruption and unrecognised persisted analysis names', () => {
    const f = put(fixture(), document([dead()])); ingest(f);
    const dir = join(f.corpus, 'records'), path = join(dir, readdirSync(dir)[0]);
    const value = JSON.parse(readFileSync(path)); value.context.label = 'edited'; writeFileSync(path, json(value));
    expect(() => buildIndex(f.corpus)).toThrow(/integrity/);
    const g = put(fixture(), document([dead()])), caseId = ingest(g).cases[0];
    mkdirSync(join(g.corpus, 'cases', caseId, 'analysis'));
    writeFileSync(join(g.corpus, 'cases', caseId, 'analysis', 'misnamed.json'), '{}');
    expect(() => buildIndex(g.corpus)).toThrow(/Unexpected corpus entry/);
  });
  it('does not infer nullable legacy identity and does not copy arbitrary metadata', () => {
    const f = put(fixture(), document([dead({ race: null, class: null, meta: { wallClockMs: 4, unrelated: 'not copied' }, extra: 'not copied' })]));
    const caseId = ingest(f).cases[0], item = JSON.parse(readFileSync(join(f.corpus, 'cases', caseId, 'case.json')));
    expect(item.missingContext).toEqual(['race', 'class']);
    expect(item.facts.extra).toBeUndefined(); expect(item.facts.meta).toEqual({ wallClockMs: 4 });
  });
  it('reconstructs the committed public worked corpus without replaying a game or changing sources', () => {
    const f = fixture(), repo = fileURLToPath(new URL('../', import.meta.url));
    for (const record of ['docs/runs/2026-11-03-stage-baseline-c2d1/runs.json', 'docs/runs/2026-11-05-b99-desktop-death-replay/runs.json']) {
      ingestRecord({ record: join(repo, record), corpus: f.corpus, sourceRef: '2690ae09c4166332fa9f5ff8f032e0fb52327bcc' });
    }
    const index = readIndex(f), caseId = index.cases.find(item => item.facts.seed === 34).id;
    appendAnalysis({ corpus: f.corpus, caseId, analysis: join(repo, 'docs/deaths/example-analysis-input.json') });
    const b99 = readIndex(f).cases.find(item => item.facts.seed === 99110530).id;
    appendAnalysis({ corpus: f.corpus, caseId: b99, analysis: join(repo, 'docs/deaths/b99-assessment-input.json') });
    expect(readIndex(f).totals).toMatchObject({ sourceRecords: 2, uniqueEvents: 5, deaths: 3, outcomes: { retired: 2 }, reviewCoverage: { pending: 1, legacyImports: 1, observedAnalyses: 1, assessedLatest: 1 } });
    expect(allFiles(f.corpus)).toEqual(allFiles(join(repo, 'docs/deaths/example')));
  });
  it('keeps nullable legacy context unknown and rejects contradictory explicit outcomes', () => {
    const f = put(fixture(), document([dead({ seed: null, runKey: null, baseStats: null, commands: null })]));
    const caseId = ingest(f).cases[0], item = JSON.parse(readFileSync(join(f.corpus, 'cases', caseId, 'case.json')));
    expect(item.missingContext).toEqual(['seed', 'baseStats', 'commands']);
    expect(item.replay.status).toBe('missing-input');
    for (const run of [dead({ outcome: 'death', dead: false }), dead({ outcome: 'retired' }), dead({ outcome: 'death', retired: true }), dead({ dead: false, retired: true, stall: { kind: 'idle', decision: 3, turn: 50 } })]) {
      const g = put(fixture(), document([run])); expect(() => ingest(g)).toThrow(/Conflicting/);
    }
  });
  it('reads every supported committed public run document without guessing older formats', () => {
    const f = fixture(), repo = fileURLToPath(new URL('../', import.meta.url));
    const paths = execFileSync('git', ['ls-files', 'docs/runs'], { cwd: repo, encoding: 'utf8' }).trim().split('\n').filter(path => path.endsWith('/runs.json'));
    const supported = new Map();
    for (const path of paths) {
      const bytes = readFileSync(join(repo, path)), value = JSON.parse(bytes);
      if (value.schema === 'better-borg/runs@1') supported.set(hash(bytes), { path, value });
    }
    for (const { path } of supported.values()) ingestRecord({ record: join(repo, path), corpus: f.corpus });
    expect(readIndex(f).totals.sourceRecords).toBe(supported.size);
    expect(readIndex(f).totals.deaths).toBe([...supported.values()].reduce((total, record) => total + record.value.runs.filter(run => run.dead === true).length, 0));
  });
  it('refuses an ancestor symlink even when the external case directory already exists', () => {
    const f = put(fixture(), document([])); ingest(f);
    put(f, document([dead()]));
    const id = 'case-' + hash(json({ origin: 'diegoami/mandos', record: hash(readFileSync(f.record)), row: 0 }));
    const outside = join(f.root, 'outside'); mkdirSync(join(outside, id), { recursive: true });
    symlinkSync(outside, join(f.corpus, 'cases'), 'dir');
    expect(() => ingest(f)).toThrow(/Symlink refused/);
    expect(readdirSync(join(outside, id))).toEqual([]);
  });
  it('exact replay needs usable hashed evidence and a scope note, not an empty reference', () => {
    const f = put(fixture(), document([dead()])), caseId = ingest(f).cases[0];
    const exact = analysis({ replay: { status: 'exact', note: 'Synthetic structural control only' } });
    expect(() => appendAnalysis({ corpus: f.corpus, caseId, analysis: exact })).toThrow(/Exact replay/);
    exact.evidence = [{ kind: 'test trajectory', availability: 'present', locator: 'https://example.test/test-trajectory', sha256: hash('synthetic trajectory'), knowledge: 'character-known' }];
    expect(appendAnalysis({ corpus: f.corpus, caseId, analysis: exact }).revision).toBe(1);
  });
  it('serializes actual competing processes so analysis and index cannot poison a live ingest', async () => {
    const f = put(fixture(), document([dead()])), caseId = ingest(f).cases[0];
    const tool = fileURLToPath(new URL('./deaths.mjs', import.meta.url));
    const module = pathToFileURL(tool).href;
    const analysisPath = join(f.root, 'analysis.json'); writeFileSync(analysisPath, json(analysis()));
    put(f, document([dead({ life: 2 })], { label: 'competing ingest' }));
    const code = `import {ingestRecord} from ${JSON.stringify(module)}; ingestRecord({record:${JSON.stringify(f.record)},corpus:${JSON.stringify(f.corpus)},onCaseWritten:()=>{console.log('LOCKED');Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,1800);}});`;
    const child = spawn(process.execPath, ['--input-type=module', '-e', code], { stdio: ['ignore', 'pipe', 'pipe'], env: { PATH: process.env.PATH ?? '' } });
    const finished = once(child, 'exit');
    try {
      const result = await Promise.race([once(child.stdout, 'data').then(([data]) => data.toString()), finished.then(() => { throw new Error('writer exited before contention control'); })]);
      expect(result).toContain('LOCKED');
      const rival = spawnSync(process.execPath, [tool, 'analyse', '--corpus', f.corpus, '--case', caseId, '--analysis', analysisPath], { encoding: 'utf8', env: { PATH: process.env.PATH ?? '' } });
      expect(rival.status).toBe(1); expect(rival.stderr).toMatch(/writer lock/);
      expect(() => buildIndex(f.corpus)).toThrow(/writer lock/);
      expect(() => recoverWriter({ corpus: f.corpus, token: inspectWriter(f.corpus).token, writerStopped: true })).toThrow(/PID is still present/);
      expect((await finished)[0]).toBe(0);
    } finally { if (child.exitCode === null && child.signalCode === null) { child.kill('SIGKILL'); await finished; } }
    appendAnalysis({ corpus: f.corpus, caseId, analysis: analysis() });
    expect(readIndex(f).totals.deaths).toBe(2);
    expect(readIndex(f).cases.find(item => item.id === caseId).latestAnalysis).toMatch(/0001-/);
  }, 10000);
  it('requires explicit token-matched stopped-writer recovery after an actual process crash', () => {
    const f = put(fixture(), document([dead()])), tool = pathToFileURL(fileURLToPath(new URL('./deaths.mjs', import.meta.url))).href;
    const code = `import {ingestRecord} from ${JSON.stringify(tool)}; ingestRecord({record:${JSON.stringify(f.record)},corpus:${JSON.stringify(f.corpus)},onCaseWritten:()=>process.kill(process.pid,'SIGKILL')});`;
    const child = spawnSync(process.execPath, ['--input-type=module', '-e', code], { encoding: 'utf8', env: { PATH: process.env.PATH ?? '' } });
    expect(child.signal).toBe('SIGKILL');
    const lock = inspectWriter(f.corpus); expect(lock).not.toBeNull();
    expect(() => ingest(f)).toThrow(/writer lock/);
    expect(() => recoverWriter({ corpus: f.corpus, token: 'wrong', writerStopped: true })).toThrow(/token/);
    expect(() => recoverWriter({ corpus: f.corpus, token: lock.token, writerStopped: false })).toThrow(/confirmation/);
    expect(recoverWriter({ corpus: f.corpus, token: lock.token, writerStopped: true })).toEqual({ recovered: true });
    expect(buildIndex(f.corpus).totals.deaths).toBe(0);
    ingest(f); expect(buildIndex(f.corpus).totals.deaths).toBe(1);
  });
  it('rejects expanded UTF-8 receipts before publication and leaves a usable corpus', () => {
    const f = fixture();
    // Source is below 8 MiB. Its long Unicode label plus per-row identity/hash
    // bookkeeping expands the managed receipt beyond 8 MiB (despite fewer JS characters).
    const value = document([dead(), ...Array.from({ length: 12000 }, () => ({ dead: false }))], { label: '🪄'.repeat(1000000) });
    writeFileSync(f.record, JSON.stringify(value));
    expect(readFileSync(f.record).length).toBeLessThan(8 * 1024 * 1024);
    let caseWrites = 0;
    expect(() => ingest(f, { onCaseWritten: () => { caseWrites++; } })).toThrow(/Managed immutable payload exceeds/);
    expect(caseWrites).toBe(0); expect(existsSync(join(f.corpus, 'cases'))).toBe(false);
    expect(buildIndex(f.corpus).totals.sourceRecords).toBe(0);
    put(f, document([dead()])); ingest(f);
    expect(readIndex(f).totals.deaths).toBe(1);
  });
  it('the real CLI reports errors nonzero and ingests existing files without a game process', () => {
    const f = put(fixture(), document([dead()])), tool = fileURLToPath(new URL('./deaths.mjs', import.meta.url));
    const env = { PATH: process.env.PATH ?? '', ...(process.env.SystemRoot ? { SystemRoot: process.env.SystemRoot } : {}) };
    const bad = spawnSync(process.execPath, [tool, 'ingest', '--record', f.record, '--corpus', dirname(f.record)], { encoding: 'utf8', env });
    expect(bad.status).toBe(1); expect(bad.stderr).toMatch(/separate/);
    execFileSync(process.execPath, [tool, 'ingest', '--record', f.record, '--corpus', f.corpus], { encoding: 'utf8', env });
    expect(readIndex(f).totals.deaths).toBe(1);
  });
});
