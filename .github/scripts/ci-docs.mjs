#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, lstatSync, readFileSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { classify } from './ci-scope.mjs';

export function checkDocs(scope, root = process.cwd()) {
  if (scope.mode !== 'docs' || classify(scope.changes) !== 'docs') throw new Error('Documentation check requires a reviewed prose-only diff');
  const problems = [];
  for (const { paths } of scope.changes) for (const path of paths) {
    const file = resolve(root, path);
    if (!lstatSync(file).isFile() || lstatSync(file).isSymbolicLink()) throw new Error('Documentation must be a regular file: ' + path);
    const text = readFileSync(file, 'utf8').replace(/^```[^\n]*\n[\s\S]*?^```\s*$/gm, '');
    // Check inline links and reference definitions; external URLs/anchors do not
    // cause network requests. Markdown anchors themselves are not validated.
    const links = [...text.matchAll(/!?\[[^\]\n]*\]\((<[^>\n]+>|[^\s)]+)(?:\s+[^)]*)?\)/g)].map(match => match[1]);
    links.push(...[...text.matchAll(/^\s*\[[^\]\n]+\]:\s*(<[^>\n]+>|\S+)/gm)].map(match => match[1]));
    for (let target of links) {
      target = target.replace(/^<|>$/g, '');
      if (/^(?:[a-z][a-z0-9+.-]*:|#|\/\/)/i.test(target)) continue;
      try { target = decodeURIComponent(target.split(/[?#]/, 1)[0]); } catch { problems.push(`${path}: malformed link`); continue; }
      if (!target) continue;
      const destination = resolve(target.startsWith('/') ? root : dirname(file), target.replace(/^\//, ''));
      const rel = relative(root, destination);
      if (rel.startsWith('..') || isAbsolute(rel) || !existsSync(destination)) problems.push(`${path}: missing or outside-repository link ${target}`);
    }
  }
  if (problems.length) throw new Error(problems.join('\n'));
  if (scope.range) execFileSync('git', ['diff', '--check', scope.range, '--'], { cwd: root, stdio: 'inherit' });
  return scope.changes.length;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(`Documentation checks: ${checkDocs(JSON.parse(readFileSync(process.env.CI_SCOPE_FILE, 'utf8')))} changed prose files`);
}
