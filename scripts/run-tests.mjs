import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptsDir, '..');
const args = process.argv.slice(2);
const matchArg = args.find((arg) => arg.startsWith('--match='));
const concurrencyArg = args.find((arg) => arg.startsWith('--concurrency='));
const listOnly = args.includes('--list');
const serial = args.includes('--serial');
const match = matchArg ? matchArg.slice('--match='.length).trim() : '';
const supportFiles = new Set(['test-support.mjs']);

function positiveInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const available = typeof os.availableParallelism === 'function' ? os.availableParallelism() : (os.cpus()?.length || 2);
const defaultConcurrency = Math.max(1, Math.min(4, available));
const concurrency = serial ? 1 : positiveInteger(concurrencyArg?.slice('--concurrency='.length), defaultConcurrency);

let tests = fs.readdirSync(scriptsDir)
  .filter((name) => /^test-[a-z0-9-]+\.mjs$/.test(name) && !supportFiles.has(name))
  .sort();

if (match) {
  const fragments = match.split(',').map((part) => part.trim()).filter(Boolean);
  tests = tests.filter((name) => fragments.some((fragment) => name.includes(fragment)));
}

if (listOnly) {
  for (const test of tests) console.log(test);
  if (!match) console.log('check.mjs');
  process.exit(0);
}

if (tests.length === 0) {
  console.error(`No tests matched${match ? ` --match=${match}` : ''}.`);
  process.exit(2);
}

function runFile(file) {
  const started = process.hrtime.bigint();
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [path.join(scriptsDir, file)], {
      cwd: root,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    let stdout = '';
    let stderr = '';
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('error', (error) => {
      const durationMs = Number(process.hrtime.bigint() - started) / 1e6;
      resolve({ file, code: 1, stdout, stderr: `${stderr}${error.stack || error.message}\n`, durationMs });
    });
    child.on('close', (code) => {
      const durationMs = Number(process.hrtime.bigint() - started) / 1e6;
      resolve({ file, code: code ?? 1, stdout, stderr, durationMs });
    });
  });
}

async function runPool(files, limit) {
  const results = new Array(files.length);
  let cursor = 0;
  async function worker() {
    while (true) {
      const index = cursor++;
      if (index >= files.length) return;
      results[index] = await runFile(files[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, files.length) }, () => worker()));
  return results;
}

function printResult(result) {
  const duration = `${Math.round(result.durationMs)}ms`;
  if (result.code === 0) {
    const summary = result.stdout.trim().split(/\r?\n/).filter(Boolean).at(-1);
    console.log(`✓ ${result.file} (${duration})${summary ? ` — ${summary}` : ''}`);
    return;
  }
  console.error(`✗ ${result.file} (${duration})`);
  if (result.stdout.trim()) console.error(result.stdout.trimEnd());
  if (result.stderr.trim()) console.error(result.stderr.trimEnd());
}

const started = process.hrtime.bigint();
console.log(`Running ${tests.length} test files with concurrency ${concurrency}${match ? ` (match: ${match})` : ''}.`);
const results = await runPool(tests, concurrency);
for (const result of results) printResult(result);

let contractResult = null;
if (!match) {
  contractResult = await runFile('check.mjs');
  printResult(contractResult);
}

const failures = results.filter((result) => result.code !== 0);
if (contractResult && contractResult.code !== 0) failures.push(contractResult);
const elapsedMs = Number(process.hrtime.bigint() - started) / 1e6;
const slowest = [...results, ...(contractResult ? [contractResult] : [])]
  .sort((a, b) => b.durationMs - a.durationMs)
  .slice(0, 5)
  .map((result) => `${result.file} ${Math.round(result.durationMs)}ms`)
  .join(', ');

console.log(`Suite wall time: ${(elapsedMs / 1000).toFixed(2)}s. Slowest: ${slowest}.`);
if (failures.length > 0) {
  console.error(`${failures.length} test target${failures.length === 1 ? '' : 's'} failed.`);
  process.exit(1);
}
console.log(`All ${tests.length} feature/integration tests plus the Museum contract passed.`);
