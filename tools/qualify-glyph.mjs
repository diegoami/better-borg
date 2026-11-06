#!/usr/bin/env node
/** Offline public fixture qualification, not a gameplay fix or automatic test gate. */
import { build } from 'esbuild';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { enginePin } from './engine-pin.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const out = resolve(process.argv[2] ?? join(root, 'artifacts/glyph-qualification'));
if (existsSync(out)) throw new Error('Output already exists; preserve earlier attempts and choose a fresh directory');
mkdirSync(out, { recursive: true });
const bundle = join(root, 'artifacts/.glyph-qualification.mjs');
await build({ entryPoints: [join(root, 'tools/qualification/glyph-outcome.ts')], bundle: true, platform: 'node', format: 'esm', packages: 'external', outfile: bundle, logLevel: 'silent' });
const run = spawnSync(process.execPath, [bundle], { cwd: root, env: { ...process.env, GLYPH_OUTPUT: join(out, 'result.json') }, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
writeFileSync(join(out, 'run.log'), (run.stdout ?? '') + (run.stderr ?? ''));
const sha = path => createHash('sha256').update(readFileSync(join(root, path))).digest('hex');
writeFileSync(join(out, 'receipt.json'), JSON.stringify({ schema: 'mandos/glyph-qualification-receipt@1', exit: run.status, engine: enginePin(root),
  api2: '2.0.0 (installed SDK; fixture uses public world/content facade)', content: JSON.parse(readFileSync(join(root, 'node_modules/@rpgm-tools/neo-angband-content/package.json'))).version,
  inputs: Object.fromEntries(['tools/qualification/glyph-outcome.ts', 'tools/qualify-glyph.mjs', 'src/flow/flow-glyph.ts', 'src/perceive.ts', 'src/api2/world.ts', 'pnpm-lock.yaml'].map(path => [path, sha(path)])),
  scope: 'Actual registered read handler and Core known-world data through port adapter/perception. Prepared flow arrival, not full autonomous play, world timing or combat.',
  expectedCurrentExit: '1 when the observed accepted glyph is lost by the adapter/perception contract; setup/control errors also remain visible in run.log.',
}, null, 2) + '\n');
process.stdout.write(`Qualification retained in ${out}; exit ${run.status}\n`);
process.exitCode = run.status ?? 1;
