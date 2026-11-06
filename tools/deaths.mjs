#!/usr/bin/env node
/** Offline death-case intake and attributed analysis. Never boots a game or calls a service. */
import { createHash, randomUUID } from 'node:crypto';
import { linkSync, lstatSync, mkdirSync, readFileSync, readdirSync, renameSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { hostname } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const CORPUS = 'mandos/death-corpus@1';
const CASE = 'mandos/death-case@1';
const INGEST = 'mandos/death-ingest@1';
const ANALYSIS = 'mandos/death-analysis@1';
const HEX = /^[0-9a-f]{64}$/;
const ID = /^case-[0-9a-f]{64}$/;
const MAX_BYTES = 8 * 1024 * 1024;
const dispositions = ['needs-evidence', 'hypothesis', 'confirmed-defect', 'design-proposal', 'ordinary-loss', 'no-bug-found'];
const replayStatuses = ['not-attempted', 'exact', 'diverged', 'missing-input', 'failed'];
const knowledgeDomains = ['character-known', 'terminal-revealed', 'engine-diagnostic', 'unspecified'];
const artifactStatuses = ['present', 'local-only', 'unverified', 'missing', 'not-captured'];
const outcomes = ['death', 'winner', 'stall', 'retired', 'cap-survivor', 'survived-slice', 'crash', 'timeout', 'failure', 'unknown'];
const factKeys = ['seed', 'life', 'race', 'class', 'baseStats', 'birthRngState', 'birthOptions', 'decisions', 'turns', 'depths', 'maxDepth', 'clvl', 'gold', 'kills', 'places', 'dead', 'causeOfDeath', 'commands', 'jitter', 'restedBesideMonster', 'stall', 'stageAttained', 'retired', 'unsure'];

function assert(ok, message) { if (!ok) throw new Error(message); }
function object(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }
function string(value) { return typeof value === 'string' && value.trim().length > 0; }
function pick(value, keys) { return Object.fromEntries(keys.filter(key => value[key] !== undefined).map(key => [key, value[key]])); }
function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (object(value)) return Object.fromEntries(Object.keys(value).sort().filter(key => value[key] !== undefined).map(key => [key, canonical(value[key])]));
  return value;
}
export function json(value) { return JSON.stringify(canonical(value), null, 2) + '\n'; }
export function hash(value) { return createHash('sha256').update(value).digest('hex'); }
function seal(value) { return { ...value, integritySha256: hash(json(value)) }; }
function checked(value) {
  assert(object(value) && HEX.test(value.integritySha256), 'Missing persisted integrity digest');
  const { integritySha256, ...payload } = value;
  assert(hash(json(payload)) === integritySha256, 'Persisted integrity digest mismatch');
  return value;
}
function compare(a, b) { return a < b ? -1 : a > b ? 1 : 0; }
function cell(value) { return String(value ?? 'unknown').replace(/[&<>|`\r\n]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','|':'\\|','`':'\\`','\r':' ','\n':' '})[ch]); }
function existsSync(path) {
  try { lstatSync(path); return true; } catch (error) { if (error.code === 'ENOENT') return false; throw error; }
}
function regular(path) { const s = lstatSync(path); assert(s.isFile() && !s.isSymbolicLink(), `Not a regular file: ${path}`); return s; }
function read(path) { noSymlinks(path); const s = regular(path); assert(s.size <= MAX_BYTES, `Input exceeds ${MAX_BYTES} bytes: ${path}`); return readFileSync(path, 'utf8'); }
function parse(path) { return JSON.parse(read(path)); }
function safeParents(path) {
  const parent = dirname(path);
  if (parent === path) return;
  if (!existsSync(parent)) { safeParents(parent); mkdirSync(parent); }
  const s = lstatSync(parent);
  assert(s.isDirectory() && !s.isSymbolicLink(), `Unsafe output parent: ${parent}`);
}
function noSymlinks(path) {
  let current = resolve(path);
  while (true) {
    if (existsSync(current)) assert(!lstatSync(current).isSymbolicLink(), `Symlink refused: ${current}`);
    const parent = dirname(current); if (parent === current) return; current = parent;
  }
}
function within(parent, child) { const r = relative(parent, child); return r === '' || (!r.startsWith('..' + sep) && r !== '..' && !isAbsolute(r)); }
function managedSize(path, data) { assert(Buffer.byteLength(data, 'utf8') <= MAX_BYTES, `Managed immutable payload exceeds ${MAX_BYTES} bytes: ${path}`); }
function immutable(path, data) {
  managedSize(path, data);
  noSymlinks(path); safeParents(path);
  if (existsSync(path)) { regular(path); assert(readFileSync(path, 'utf8') === data, `Immutable content conflict: ${path}`); return false; }
  const temp = resolve(dirname(path), `.pending-${randomUUID()}`);
  writeFileSync(temp, data, { flag: 'wx' });
  try {
    try { linkSync(temp, path); }
    catch (error) { if (error.code !== 'EEXIST') throw error; regular(path); assert(readFileSync(path, 'utf8') === data, `Immutable content conflict: ${path}`); }
  } finally { unlinkSync(temp); }
  return true;
}
function derived(path, data) {
  noSymlinks(path); safeParents(path); if (existsSync(path)) regular(path);
  const temp = resolve(dirname(path), `.pending-${randomUUID()}`);
  writeFileSync(temp, data, { flag: 'wx' });
  try { renameSync(temp, path); } finally { if (existsSync(temp)) unlinkSync(temp); }
}
function openCorpus(path, create = false) {
  const root = resolve(path); noSymlinks(root);
  assert(dirname(root) !== root, 'Filesystem root cannot be a corpus');
  const marker = resolve(root, 'corpus.json');
  if (!existsSync(root)) { assert(create, 'Corpus does not exist'); safeParents(resolve(root, '.anchor')); }
  assert(lstatSync(root).isDirectory(), 'Corpus must be a directory');
  if (!existsSync(marker)) {
    assert(create && readdirSync(root).length === 0, 'Refusing a nonempty directory without a corpus marker');
    immutable(marker, json({ schema: CORPUS }));
  } else assert(parse(marker).schema === CORPUS, 'Wrong corpus schema');
  return root;
}
function names(path, pattern) {
  if (!existsSync(path)) return [];
  noSymlinks(path); assert(lstatSync(path).isDirectory(), 'Expected corpus directory');
  const entries = readdirSync(path).filter(name => !name.startsWith('.pending-'));
  assert(entries.every(name => pattern.test(name)), `Unexpected corpus entry: ${path}`);
  return entries.sort();
}
const LOCK = '.writer-lock.json';
function withWriter(root, run) {
  const path = resolve(root, LOCK), owner = { schema: 'mandos/death-corpus-lock@1', token: randomUUID(), pid: process.pid, host: hostname() };
  noSymlinks(path);
  const temp = resolve(root, `.pending-lock-${owner.token}`);
  writeFileSync(temp, json(owner), { flag: 'wx', mode: 0o600 });
  try {
    try { linkSync(temp, path); }
    catch (error) { if (error.code !== 'EEXIST') throw error; throw new Error('Corpus writer lock exists; inspect it and recover explicitly only after its writer stopped'); }
  } finally { unlinkSync(temp); }
  try {
    immutable(resolve(root, '.gitignore'), '/.writer-lock.json\n.pending-*\n');
    return run();
  } finally {
    assert(parse(path).token === owner.token, 'Writer lock changed during operation; inspect corpus before continuing');
    unlinkSync(path);
  }
}
export function inspectWriter(corpus) {
  const root = openCorpus(corpus), path = resolve(root, LOCK);
  if (!existsSync(path)) return null;
  const owner = parse(path);
  assert(owner.schema === 'mandos/death-corpus-lock@1' && string(owner.token) && Number.isInteger(owner.pid) && owner.pid > 0 && string(owner.host), 'Malformed writer lock; inspect it manually without starting another writer');
  return owner;
}
export function recoverWriter({ corpus, token, writerStopped }) {
  assert(writerStopped === true, 'Explicit confirmation that the writer stopped is required');
  assert(string(token), 'Expected inspected lock token');
  const root = openCorpus(corpus), claim = resolve(root, `.pending-recovery-${hash(token)}`);
  noSymlinks(claim);
  // Recovery itself has one operator. Re-inspect under this claim so two
  // stale-token recoveries cannot remove a newly acquired writer's lock.
  writeFileSync(claim, token, { flag: 'wx', mode: 0o600 });
  try {
    const owner = inspectWriter(root);
    assert(owner && owner.token === token, 'Lock token changed or no lock exists');
    if (owner.host === hostname()) {
      try { process.kill(owner.pid, 0); throw new Error('Writer PID is still present; automatic lock recovery refused'); }
      catch (error) { if (error.code !== 'ESRCH') throw error; }
    }
    assert(inspectWriter(root).token === token, 'Lock changed during recovery');
    unlinkSync(resolve(root, LOCK));
    return { recovered: true };
  } finally { unlinkSync(claim); }
}
function sourceLocator(path, locator) {
  if (locator !== undefined) { validateLocator(locator); return locator; }
  return within(ROOT, path) ? relative(ROOT, path).split(sep).join('/') : null;
}
function validateLocator(locator) {
  assert(string(locator), 'Artifact/source locator must be a nonempty string');
  if (locator.startsWith('https://')) {
    const url = new URL(locator);
    assert(!url.username && !url.password && !url.search, 'Authenticated or query-string locators are not durable public references');
  } else assert(!/^[a-z][a-z0-9+.-]*:/i.test(locator) && !isAbsolute(locator) && !locator.includes('\\') && !locator.split('/').some(part => part === '..' || part === ''), 'Locator must be HTTPS or a safe relative path');
}
function outcomeOf(run, cap) {
  assert([run.dead === true, run.retired === true, run.stall != null].filter(Boolean).length <= 1, 'Conflicting terminal flags');
  if (run.outcome !== undefined) {
    assert(outcomes.includes(run.outcome), 'Unknown explicit outcome');
    assert((run.dead !== true || run.outcome === 'death') && (run.dead !== false || run.outcome !== 'death') && (run.retired !== true || run.outcome === 'retired') && (run.retired !== false || run.outcome !== 'retired') && (run.stall == null || run.outcome === 'stall'), 'Conflicting outcome flags');
    return run.outcome;
  }
  assert(!(run.dead === true && (run.retired === true || run.stall != null)), 'Conflicting terminal flags');
  if (run.dead === true) return 'death';
  if (run.stall != null) return 'stall';
  if (run.retired === true) return 'retired';
  if (run.dead === false) return Number.isFinite(cap) && run.decisions >= cap ? 'cap-survivor' : 'survived-slice';
  return 'unknown';
}
function contextOf(document) {
  return { label: string(document.label) ? document.label : null, recorded: string(document.recorded) ? document.recorded : null,
    build: object(document.build) ? pick(document.build, ['commit', 'engine', 'content', 'borg']) : {},
    runner: object(document.runner) ? pick(document.runner, ['tool', 'decisions', 'seeds', 'lives', 'stage']) : {} };
}
function factsOf(run) {
  const integer = value => Number.isInteger(value) && value >= 0;
  for (const key of ['seed', 'life', 'decisions', 'turns', 'maxDepth', 'clvl', 'gold', 'kills', 'places', 'jitter', 'restedBesideMonster'])
    if (run[key] !== undefined && run[key] !== null) assert(integer(run[key]) && (key !== 'life' || run[key] > 0), `Invalid run field: ${key}`);
  for (const key of ['race', 'class', 'causeOfDeath']) if (run[key] !== undefined && run[key] !== null) assert(string(run[key]), `Invalid run field: ${key}`);
  for (const key of ['dead', 'retired', 'stageAttained']) if (run[key] !== undefined) assert(typeof run[key] === 'boolean', `Invalid run field: ${key}`);
  for (const key of ['baseStats', 'depths']) if (run[key] !== undefined && run[key] !== null) assert(Array.isArray(run[key]) && run[key].every(integer), `Invalid run field: ${key}`);
  if (run.commands !== undefined && run.commands !== null) assert(object(run.commands) && Object.values(run.commands).every(integer), 'Invalid command census');
  if (run.birthOptions !== undefined && run.birthOptions !== null) assert(object(run.birthOptions) && Object.entries(run.birthOptions).every(([name, value]) => name.startsWith('birth_') && typeof value === 'boolean'), 'Invalid accepted birth options');
  if (run.birthRngState !== undefined && run.birthRngState !== null) {
    const rng = run.birthRngState;
    const uint = value => integer(value) && value <= 0xffffffff;
    assert(object(rng) && typeof rng.quick === 'boolean' && typeof rng.fixed === 'boolean' && uint(rng.value) && uint(rng.stateI) && rng.stateI < 32 && uint(rng.fixval) && Array.isArray(rng.state) && rng.state.length === 32 && rng.state.every(uint), 'Invalid accepted birth RNG');
  }
  if (run.stall != null) assert(object(run.stall) && ['repeat', 'idle'].includes(run.stall.kind) && integer(run.stall.turn) && integer(run.stall.decision), 'Invalid stall facts');
  if (run.unsure !== undefined && run.unsure !== null) assert(object(run.unsure) && integer(run.unsure.total) && Array.isArray(run.unsure.points), 'Invalid uncertainty facts');
  const facts = pick(run, factKeys);
  if (facts.birthRngState) facts.birthRngState = pick(facts.birthRngState, ['quick', 'fixed', 'value', 'stateI', 'fixval', 'state']);
  if (facts.stall) facts.stall = pick(facts.stall, ['kind', 'command', 'decision', 'turn']);
  if (facts.unsure) facts.unsure = { total: facts.unsure.total, points: facts.unsure.points.map(point => {
    assert(object(point), 'Invalid uncertainty point');
    return { ...pick(point, ['kind', 'turn', 'depth', 'hp', 'chosen']),
      ...(object(point.at) ? { at: pick(point.at, ['x', 'y']) } : {}),
      aim: object(point.aim) ? pick(point.aim, ['x', 'y']) : null,
      candidates: Array.isArray(point.candidates) ? point.candidates.map(candidate => pick(candidate, ['method', 'score'])) : [] };
  }) };
  if (object(run.meta) && Number.isFinite(run.meta.wallClockMs)) facts.meta = { wallClockMs: run.meta.wallClockMs };
  return facts;
}
function receipts(root) {
  return names(resolve(root, 'records'), /^[0-9a-f]{64}\.json$/).map(name => {
    const record = checked(parse(resolve(root, 'records', name)));
    assert(record.schema === INGEST && object(record.source) && HEX.test(record.source.sha256) && Array.isArray(record.events), `Invalid ingest receipt: ${name}`);
    assert(name === hash(json({ origin: record.source.origin, source: record.source.sha256 })) + '.json', 'Ingest identity/name mismatch');
    return record;
  });
}
function caseReport(item) {
  const locator = item.source.locator;
  const source = locator?.startsWith('https://') ? new URL(locator).href : locator && item.source.ref ? `https://github.com/${item.source.repository}/blob/${item.source.ref}/${locator.split('/').map(encodeURIComponent).join('/')}` : null;
  return `# Death case ${item.id}\n\nInitial diagnosis: pending. Current attributed revisions are listed in the [corpus index](../../index.md).\n\n` +
    `Source record SHA-256: ${item.source.sha256}${source ? `; [declared immutable record](<${source}>)` : '; no remote locator supplied'}.\n\nRaw cause: ${cell(item.facts.causeOfDeath)}. Seed ${cell(item.facts.seed)}, life ${cell(item.facts.life)}, ${cell(item.facts.race)} ${cell(item.facts.class)}.\n\n` +
    `Replay: ${item.replay.status}. Missing context: ${item.missingContext.map(cell).join(', ') || 'none detected; replay still unverified'}.\n\n` +
    'These are terminal run-summary facts, not a pre-decision snapshot or proof that the Borg knew post-death revealed information. No game, diagnosis or recording was generated by ingestion.\n\n' +
    '## Recorded facts\n\n```json\n' + json(item.facts) + '```\n';
}

/** A receipt is published last; interrupted immutable case writes are safely reusable on retry. */
export function ingestRecord({ record, corpus, repository = 'diegoami/mandos', origin = repository, locator, sourceRef, onCaseWritten = () => {}, artifacts }) {
  const path = resolve(record), output = resolve(corpus);
  noSymlinks(path); noSymlinks(output);
  assert(!within(output, path) && !within(dirname(path), output), 'Corpus and source-record tree must be separate');
  assert(/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository), 'Repository must be owner/name');
  assert(string(origin) && /^[A-Za-z0-9][A-Za-z0-9_./-]{0,159}$/.test(origin), 'Invalid public origin namespace');
  if (sourceRef !== undefined) assert(/^[a-f0-9]{40}$/.test(sourceRef), 'Source ref must be an immutable commit');
  const bytes = read(path), document = JSON.parse(bytes);
  assert(object(document) && document.schema === 'better-borg/runs@1' && Array.isArray(document.runs), 'Expected better-borg/runs@1 with a runs array');
  const suppliedArtifacts = artifacts ?? document.artifacts;
  if (suppliedArtifacts !== undefined) assert(Array.isArray(suppliedArtifacts) && suppliedArtifacts.length <= 16, 'Invalid initial artifacts');
  const initialArtifacts = suppliedArtifacts?.map(artifact);
  const context = contextOf(document), source = { sha256: hash(bytes), repository, origin, locator: sourceLocator(path, locator), ref: sourceRef ?? null };
  const prepared = document.runs.map((run, row) => {
    assert(object(run), `Run row ${row} is not an object`);
    if (run.runKey !== undefined && run.runKey !== null) assert(string(run.runKey), `Run row ${row} has an invalid runKey`);
    const facts = factsOf(run), outcome = outcomeOf(run, context.runner.decisions);
    const identity = run.runKey == null ? { origin, record: source.sha256, row } : { origin, runKey: run.runKey };
    const id = 'case-' + hash(json(identity));
    const fingerprint = hash(json({ build: context.build, outcome, facts }));
    const event = { id, identity, fingerprint, outcome, row, caseId: outcome === 'death' ? id : null };
    if (outcome !== 'death') return { event, item: null };
    const missingContext = ['seed', 'life', 'race', 'class', 'baseStats', 'commands', 'decisions', 'turns', 'clvl', 'maxDepth'].filter(key => facts[key] === undefined || facts[key] === null || (key === 'baseStats' && facts[key].length === 0));
    for (const key of ['commit', 'engine', 'content', 'borg']) if (!string(context.build[key])) missingContext.push('build.' + key);
    const item = seal({ schema: CASE, id, identity, fingerprint, source, context, facts, outcome,
      factsKnowledge: 'terminal-summary', missingContext,
      replay: { status: missingContext.length ? 'missing-input' : 'not-attempted' },
      artifacts: initialArtifacts ?? ['recording', 'decision-trace', 'pre-death-save'].map(kind => ({ kind, availability: 'not-captured', locator: null, knowledge: 'unspecified' })),
      initialAnalysis: 'pending-diagnosis' });
    return { event, item };
  });
  const inBatch = new Map();
  for (const { event } of prepared) {
    const prior = inBatch.get(event.id);
    assert(!prior || prior === event.fingerprint, `Conflicting trusted identity in source: ${event.id}`);
    inBatch.set(event.id, event.fingerprint);
  }
  const root = openCorpus(output, true);
  return withWriter(root, () => {
    const prior = receipts(root);
    const known = new Map(prior.flatMap(receipt => receipt.events.map(event => [event.id, event.fingerprint])));
    for (const { event } of prepared) assert(!known.has(event.id) || known.get(event.id) === event.fingerprint, `Conflicting trusted identity: ${event.id}`);
    const receiptId = hash(json({ origin, source: source.sha256 })), receiptPath = resolve(root, 'records', receiptId + '.json');
    if (existsSync(receiptPath)) { deriveIndex(root); return { receipt: receiptId, alreadyPresent: true, cases: prepared.filter(p => p.event.caseId).map(p => p.event.caseId) }; }
    const receiptData = json(seal({ schema: INGEST, source, context, events: prepared.map(p => p.event) }));
    managedSize(receiptPath, receiptData);
    for (const { event, item } of prepared) if (event.caseId) {
      const file = resolve(root, 'cases', event.id, 'case.json');
      if (existsSync(file)) {
        const existing = checked(parse(file));
        assert(existing.fingerprint === item.fingerprint && json(existing.identity) === json(item.identity), `Existing case conflict: ${event.id}`);
      } else immutable(file, json(item));
      const existing = checked(parse(file));
      immutable(resolve(dirname(file), 'report.md'), caseReport(existing));
      onCaseWritten(event.id);
    }
    immutable(receiptPath, receiptData);
    deriveIndex(root);
    return { receipt: receiptId, alreadyPresent: false, cases: [...new Set(prepared.filter(p => p.event.caseId).map(p => p.event.caseId))] };
  });
}

function artifact(value) {
  assert(object(value) && string(value.kind) && artifactStatuses.includes(value.availability) && knowledgeDomains.includes(value.knowledge), 'Invalid evidence reference/status/knowledge domain');
  if (value.locator !== null) validateLocator(value.locator);
  assert(value.locator !== null || ['missing', 'not-captured'].includes(value.availability), 'Available evidence needs a locator');
  if (value.sha256 !== undefined) assert(HEX.test(value.sha256), 'Evidence hash must be SHA-256');
  return pick(value, ['kind', 'availability', 'knowledge', 'locator', 'sha256', 'note']);
}
function analysisInput(value) {
  assert(object(value) && string(value.author) && string(value.summary), 'Analysis requires attribution and a summary');
  assert(dispositions.includes(value.disposition) && ['unassessed', 'low', 'medium', 'high'].includes(value.confidence), 'Invalid diagnosis disposition/confidence');
  assert(['observed', 'legacy-import'].includes(value.basis), 'Analysis basis must be observed or legacy-import');
  if (value.mechanism !== undefined && value.mechanism !== null) assert(string(value.mechanism), 'Mechanism must be a named hypothesis or null');
  if (value.tool !== undefined) assert(string(value.tool), 'Tool attribution must be a nonempty string');
  assert(Array.isArray(value.observations) && value.observations.every(string) && Array.isArray(value.hypotheses) && value.hypotheses.every(string), 'Separate observation/hypothesis arrays are required');
  assert(Array.isArray(value.evidence) && Array.isArray(value.actions), 'Evidence/action arrays are required');
  assert(object(value.replay) && replayStatuses.includes(value.replay.status), 'Explicit replay status required');
  if (value.replay.status === 'exact') assert(value.evidence.some(ref => string(ref.locator) && HEX.test(ref.sha256) && ['present', 'local-only'].includes(ref.availability)) && string(value.replay.note), 'Exact replay claims need attributed evidence and scope');
  if (value.disposition === 'confirmed-defect') assert(value.observations.length && value.confidence !== 'unassessed' && value.evidence.some(ref => string(ref.locator) && HEX.test(ref.sha256)), 'Confirmed diagnosis requires observations, assessed confidence and hashed evidence');
  const actions = value.actions.map(action => {
    assert(object(action) && string(action.url) && ['proposed', 'confirmed', 'historical-follow-up'].includes(action.relationship), 'Invalid action reference');
    validateLocator(action.url); assert(action.url.startsWith('https://github.com/') && /\/issues\/[1-9][0-9]*$/.test(action.url), 'Actions must reference canonical GitHub issue URLs');
    return { url: action.url, relationship: action.relationship };
  });
  return { ...pick(value, ['author', 'tool', 'summary', 'disposition', 'confidence', 'basis', 'observations', 'hypotheses', 'mechanism']),
    replay: pick(value.replay, ['status', 'note']), evidence: value.evidence.map(artifact), actions };
}
function revisions(root, id) {
  const dir = resolve(root, 'cases', id, 'analysis'); let previous = null;
  return names(dir, /^[0-9]{4}-[0-9a-f]{64}\.json$/).map((name, index) => {
    const bytes = read(resolve(dir, name)), value = JSON.parse(bytes);
    assert(value.schema === ANALYSIS && value.caseId === id && value.revision === index + 1 && value.previousSha256 === previous, `Broken analysis chain: ${id}/${name}`);
    assert(name === `${String(value.revision).padStart(4, '0')}-${hash(json(value.analysis))}.json`, 'Analysis digest/name mismatch');
    analysisInput(value.analysis); previous = hash(bytes);
    return { file: `cases/${id}/analysis/${name}`, sha256: previous, value };
  });
}
export function appendAnalysis({ corpus, caseId, analysis }) {
  assert(ID.test(caseId), 'Invalid case identifier');
  const root = openCorpus(corpus);
  return withWriter(root, () => {
    const item = checked(parse(resolve(root, 'cases', caseId, 'case.json')));
    assert(item.schema === CASE && item.id === caseId, 'Invalid case');
    assert(receipts(root).some(receipt => receipt.events.some(event => event.caseId === caseId)), 'Cannot analyse an uncommitted ingestion');
    const value = analysisInput(typeof analysis === 'string' ? parse(analysis) : analysis), digest = hash(json(value)), history = revisions(root, caseId);
    const duplicate = history.find(entry => hash(json(entry.value.analysis)) === digest);
    if (duplicate) { deriveIndex(root); return { revision: duplicate.value.revision, alreadyPresent: true }; }
    const revision = history.length + 1;
    immutable(resolve(root, 'cases', caseId, 'analysis', `${String(revision).padStart(4, '0')}-${digest}.json`), json({ schema: ANALYSIS, caseId, revision, previousSha256: history.at(-1)?.sha256 ?? null, analysis: value }));
    deriveIndex(root);
    return { revision, alreadyPresent: false };
  });
}

/** The index is derived only from completed receipts; orphan writes never inflate totals. */
function deriveIndex(root) {
  const records = receipts(root), events = new Map(), cohorts = [];
  for (const record of records) {
    const counts = {};
    for (const event of record.events) {
      assert(ID.test(event.id) && HEX.test(event.fingerprint) && outcomes.includes(event.outcome) && event.caseId === (event.outcome === 'death' ? event.id : null), 'Invalid event in receipt');
      assert(!events.has(event.id) || events.get(event.id).fingerprint === event.fingerprint, 'Conflicting committed event');
      events.set(event.id, event); counts[event.outcome] = (counts[event.outcome] ?? 0) + 1;
    }
    cohorts.push({ source: record.source, context: record.context, outcomeOccurrences: counts });
  }
  const counts = Object.fromEntries(outcomes.map(outcome => [outcome, 0])), states = {}, mechanisms = new Map(), actions = new Map();
  const cases = [...events.values()].filter(event => event.caseId).sort((a, b) => compare(a.id, b.id)).map(event => {
    const item = checked(parse(resolve(root, 'cases', event.id, 'case.json')));
    assert(item.schema === CASE && item.id === event.id && item.fingerprint === event.fingerprint && item.id === 'case-' + hash(json(item.identity)) && item.fingerprint === hash(json({ build: item.context.build, outcome: item.outcome, facts: item.facts })), `Case/receipt mismatch: ${event.id}`);
    const history = revisions(root, event.id), latest = history.at(-1), review = latest?.value.analysis;
    const status = review?.disposition ?? 'pending-diagnosis'; states[status] = (states[status] ?? 0) + 1;
    if (string(review?.mechanism)) {
      const key = `${review.disposition}:${review.mechanism}`, group = mechanisms.get(key) ?? { mechanism: review.mechanism, disposition: review.disposition, cases: [] };
      group.cases.push(event.id); mechanisms.set(key, group);
    }
    for (const action of review?.actions ?? []) {
      const entry = actions.get(action.url) ?? { url: action.url, cases: [], relationships: [] };
      entry.cases.push(event.id); entry.relationships.push(action.relationship); actions.set(action.url, entry);
    }
    return { id: item.id, facts: pick(item.facts, ['seed', 'life', 'race', 'class', 'causeOfDeath', 'clvl', 'maxDepth', 'turns']), source: item.source,
      report: `cases/${item.id}/report.md`, diagnosis: status, confidence: review?.confidence ?? 'unassessed', analysisBasis: review?.basis ?? null, analysisAuthor: review?.author ?? null,
      replay: review?.replay ?? item.replay, latestAnalysis: latest?.file ?? null, artifacts: item.artifacts, analysisEvidence: review?.evidence ?? [] };
  });
  for (const event of events.values()) counts[event.outcome]++;
  const reviewCoverage = { pending: cases.filter(item => !item.latestAnalysis).length, legacyImports: cases.filter(item => item.analysisBasis === 'legacy-import').length, observedAnalyses: cases.filter(item => item.analysisBasis === 'observed').length, assessedLatest: cases.filter(item => item.latestAnalysis && item.confidence !== 'unassessed').length };
  const index = { schema: CORPUS, totals: { sourceRecords: records.length, uniqueEvents: events.size, reviewCoverage,
    recordedOutcomeOccurrences: records.reduce((n, record) => n + record.events.length, 0), deaths: cases.length, outcomes: counts, diagnosis: states },
    cohorts, cases, mechanisms: [...mechanisms.values()].sort((a, b) => compare(a.disposition + a.mechanism, b.disposition + b.mechanism)),
    actions: [...actions.values()].sort((a, b) => compare(a.url, b.url)).map(action => ({ ...action, cases: [...new Set(action.cases)].sort(), relationships: [...new Set(action.relationships)].sort() })) };
  const lines = ['# Death report index', '', 'Derived from immutable completed intake receipts and attributed analysis revisions. No gameplay, automatic diagnosis or pooled survival claim.', '',
    `Source records: ${records.length}; distinct intake event identities: ${events.size}; death cases: ${cases.length}; pending diagnoses: ${states['pending-diagnosis'] ?? 0}.`, '',
    '| case | character | raw cause | diagnosis | basis / confidence | replay |', '| --- | --- | --- | --- | --- | --- |'];
  for (const item of cases) lines.push(`| [${cell(item.facts.seed)}/${cell(item.facts.life)}](${item.report}) | ${cell(item.facts.race)} ${cell(item.facts.class)} | ${cell(item.facts.causeOfDeath)} | ${item.latestAnalysis ? `[${cell(item.diagnosis)}](${item.latestAnalysis})` : 'pending-diagnosis'} | ${cell(item.analysisBasis)} / ${cell(item.confidence)} | ${cell(item.replay.status)} |`);
  lines.push('', `Legacy imports: ${reviewCoverage.legacyImports}; attributed observed analyses: ${reviewCoverage.observedAnalyses}; assessed latest analyses: ${reviewCoverage.assessedLatest}. These are declared review states, not automatic causal verification.`, '', '## Linked actions', '', ...index.actions.map(action => `- [${cell(action.url)}](${action.url}) — ${action.cases.length} case(s); ${action.relationships.join(', ')}`), '', 'Unknown, unreviewed and non-death outcomes remain in index.json. Case frequency is not proved bug impact or fix benefit.', '');
  derived(resolve(root, 'index.json'), json(index)); derived(resolve(root, 'index.md'), lines.join('\n'));
  return index;
}

export function buildIndex(corpus) { const root = openCorpus(corpus); return withWriter(root, () => deriveIndex(root)); }

function main(argv) {
  if (argv.length === 1 && argv[0] === '--help') return { usage: 'ingest --record runs.json --corpus dir [--repository owner/repo --origin public-namespace --source-locator relative-or-https --source-ref commit] | analyse --corpus dir --case id --analysis file.json | index --corpus dir | inspect-lock --corpus dir | recover-lock --corpus dir --token value --stopped yes', scope: 'Offline exported-record intake only; no game, network or automatic diagnosis' };
  const command = argv.shift(), options = {};
  while (argv.length) { const flag = argv.shift(); assert(/^--[a-z-]+$/.test(flag) && argv.length && !String(argv[0]).startsWith('--'), 'Expected --option value'); assert(!(flag in options), 'Duplicate option'); options[flag] = argv.shift(); }
  const allowed = command === 'ingest' ? ['--record', '--corpus', '--repository', '--origin', '--source-locator', '--source-ref'] : command === 'analyse' ? ['--corpus', '--case', '--analysis'] : ['index', 'inspect-lock'].includes(command) ? ['--corpus'] : command === 'recover-lock' ? ['--corpus', '--token', '--stopped'] : [];
  assert(allowed.length && Object.keys(options).every(key => allowed.includes(key)), 'Usage: deaths.mjs ingest --record runs.json --corpus dir | analyse --corpus dir --case id --analysis file.json | index --corpus dir');
  assert(options['--corpus'], '--corpus is required');
  if (command === 'ingest') { assert(options['--record'], '--record is required'); return ingestRecord({ record: options['--record'], corpus: options['--corpus'], ...(options['--repository'] ? { repository: options['--repository'] } : {}), ...(options['--origin'] ? { origin: options['--origin'] } : {}), ...(options['--source-locator'] ? { locator: options['--source-locator'] } : {}), ...(options['--source-ref'] ? { sourceRef: options['--source-ref'] } : {}) }); }
  if (command === 'analyse') { assert(options['--case'] && options['--analysis'], '--case and --analysis are required'); return appendAnalysis({ corpus: options['--corpus'], caseId: options['--case'], analysis: options['--analysis'] }); }
  if (command === 'inspect-lock') return inspectWriter(options['--corpus']);
  if (command === 'recover-lock') return recoverWriter({ corpus: options['--corpus'], token: options['--token'], writerStopped: options['--stopped'] === 'yes' });
  return buildIndex(options['--corpus']).totals;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try { console.log(JSON.stringify(main(process.argv.slice(2)), null, 2)); }
  catch (error) { console.error('deaths:', error.message); process.exitCode = 1; }
}
