import { readFile } from 'node:fs/promises';

const required = [
  'conservation-core.js',
  'conservation-lab.js',
  'scripts/test-conservation.mjs',
  'scripts/check-conservation.mjs'
];

let failed = false;
function fail(message) {
  console.error(`FAIL: ${message}`);
  failed = true;
}

for (const file of required) {
  try {
    await readFile(file);
  } catch {
    fail(`missing Conservation Lab file: ${file}`);
  }
}

const core = await readFile('conservation-core.js', 'utf8');
for (const marker of [
  'buildCase',
  'evaluateAssembly',
  'isPieceAligned',
  'movePiece',
  'rotatePiece',
  'snapPiece',
  'targetPieces',
  'startPieces',
  'Math.min(98'
]) {
  if (!core.includes(marker)) fail(`conservation-core.js is missing expected behavior: ${marker}`);
}

const controller = await readFile('conservation-lab.js', 'utf8');
for (const marker of [
  'The Conservation Lab for Impossible Objects',
  'VISIBLE SEAMS',
  'aria-live="polite"',
  'prefers-reduced-motion',
  'pointerdown',
  'handleCanvasKeydown',
  'Let the lab guide this fragment',
  'Preserve workbench postcard',
  'localStorage.getItem(MUSEUM_STORAGE_KEY)',
  'variation = (variation + 1) % 99',
  'toBlob'
]) {
  if (!controller.includes(marker)) fail(`conservation-lab.js is missing expected behavior: ${marker}`);
}

if (/localStorage\.setItem|localStorage\.removeItem/.test(controller)) {
  fail('Conservation Lab writes visitor state');
}
if (/\bfetch\s*\(|\b(?:XMLHttpRequest|WebSocket|EventSource|sendBeacon)\b/.test(controller)) {
  fail('Conservation Lab performs a runtime network request');
}
if (/<input\b|<textarea\b|contenteditable=/i.test(controller)) {
  fail('Conservation Lab accepts free-form visitor input');
}
if (/https?:\/\//i.test(controller.replaceAll('http://www.w3.org/2000/svg', ''))) {
  fail('Conservation Lab contains an external runtime URL');
}

const html = await readFile('index.html', 'utf8');
for (const script of ['conservation-core.js', 'conservation-lab.js']) {
  if (!html.includes(script)) fail(`index.html does not load ${script}`);
}

const serviceWorker = await readFile('service-worker.js', 'utf8');
for (const asset of ['./conservation-core.js', './conservation-lab.js']) {
  if (!serviceWorker.includes(asset)) fail(`service worker does not cache ${asset}`);
}

const readme = await readFile('README.md', 'utf8');
for (const boundary of [
  'The Conservation Lab for Impossible Objects',
  'stores no restoration state',
  'pointer and keyboard'
]) {
  if (!readme.includes(boundary)) fail(`README.md is missing Conservation Lab boundary: ${boundary}`);
}

const privacy = await readFile('PRIVACY.md', 'utf8');
for (const boundary of [
  'Conservation Lab',
  'stores no restoration state',
  'reads only the existing fictional catalogue'
]) {
  if (!privacy.includes(boundary)) fail(`PRIVACY.md is missing Conservation Lab boundary: ${boundary}`);
}

if (failed) process.exit(1);
console.log('Conservation Lab accessibility, bounded-cases, no-storage, local-only, documentation and offline boundaries passed.');
