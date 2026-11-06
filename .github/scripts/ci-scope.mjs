#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const prose = new Set(['README.md', 'AGENTS.md', 'CLAUDE.md', 'RULES.md', 'PLAN.md', 'PLANNED.md', 'SETTINGS.md']);
export function safeProse(path) {
  // Audit Markdown has a generated-output checker; CHANGELOG is release input.
  // Every JSON/log/fixture and unknown extension remains a full-gate input.
  return !path.split('/').some(part => part === '..' || part === '' || part === '.')
    && (prose.has(path) || /^docs\/(?!audit\/).+\.md$/.test(path));
}
export function parseChanges(output) {
  const tokens = output.split('\0');
  if (tokens.pop() !== '') throw new Error('Unterminated Git change list');
  const changes = [];
  while (tokens.length) {
    const status = tokens.shift();
    if (!/^(?:[AMDTUXB]|[RC]\d+)$/.test(status)) throw new Error('Unknown Git change status');
    const count = /^[RC]/.test(status) ? 2 : 1;
    const paths = tokens.splice(0, count);
    if (paths.length !== count || paths.some(path => !path)) throw new Error('Missing Git path');
    changes.push({ status, paths });
  }
  return changes;
}
export function classify(changes) {
  // Deletions/renames/type changes are conservative: incoming links or fixture
  // identity may change even if the destination looks like plain prose.
  return changes.length > 0 && changes.every(({ status, paths }) =>
    ['A', 'M'].includes(status) && paths.every(safeProse)) ? 'docs' : 'full';
}
export function eventRange(name, event) {
  const sha = value => typeof value === 'string' && /^[a-f0-9]{40}$/.test(value) && !/^0+$/.test(value);
  if (name === 'pull_request' && sha(event.pull_request?.base?.sha) && sha(event.pull_request?.head?.sha)) {
    return `${event.pull_request.base.sha}...${event.pull_request.head.sha}`;
  }
  if (name === 'push' && event.ref === 'refs/heads/main' && sha(event.before) && sha(event.after)) {
    return `${event.before}..${event.after}`;
  }
  return null;
}
export function inspect(name, event, cwd = process.cwd()) {
  const range = eventRange(name, event);
  if (range === null) return { mode: 'full', reason: 'manual, unsupported event, or unavailable base', range, changes: [] };
  try {
    const changes = parseChanges(execFileSync('git', ['diff', '--name-status', '-z', '--find-renames', range, '--'], { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }));
    return { mode: classify(changes), reason: 'all changed paths reviewed', range, changes };
  } catch {
    // Missing/shallow/disconnected history must never turn into a docs-only pass.
    return { mode: 'full', reason: 'diff unavailable or unrecognized', range: null, changes: [] };
  }
}
function main() {
  let result;
  try { result = inspect(process.env.GITHUB_EVENT_NAME, JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'))); }
  catch { result = { mode: 'full', reason: 'event unavailable', range: null, changes: [] }; }
  writeFileSync(process.env.CI_SCOPE_FILE, JSON.stringify(result));
  appendFileSync(process.env.GITHUB_OUTPUT, `full=${result.mode === 'full'}\n`);
  console.log(`CI scope: ${result.mode} (${result.reason})`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
