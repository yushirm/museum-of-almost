import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const require = createRequire(import.meta.url);

for (const name of [
  'unequal-minute-core.js',
  'unequal-minute.js',
  'unequal-minute.css',
  'UNEQUAL_MINUTE.md',
  'deep-space.js',
  'service-worker.js'
]) assert.ok(fs.existsSync(path.join(root, name)), `missing ${name}`);

const coreSource = read('unequal-minute-core.js');
const viewSource = read('unequal-minute.js');
const css = read('unequal-minute.css');
const doc = read('UNEQUAL_MINUTE.md');
const bootstrap = read('deep-space.js');
const serviceWorker = read('service-worker.js');
const runtime = [coreSource, viewSource, css].join('\n');
const core = require('../unequal-minute-core.js');

assert.equal(core.COORDINATE_STEP_SECONDS, 60);
assert.deepEqual(core.STATIONS.map(({ radiusRatio }) => radiusRatio), [1.1, 1.5, 2, 5]);
assert.deepEqual(core.STATIONS.map(({ id }) => id), ['r1-1', 'r1-5', 'r2', 'r5']);
assert.equal(new Set(core.STATIONS.map(({ id }) => id)).size, 4);
assert.ok(core.STATIONS.every(({ radiusRatio }) => radiusRatio > 1), 'no hovering station may be placed at or inside the horizon');
assert.ok(Object.isFrozen(core.STATIONS));
assert.ok(core.STATIONS.every(Object.isFrozen));
assert.equal(core.getStation('missing'), null);
assert.equal(core.lapseFactor('missing'), null);
assert.equal(core.properTimeForCoordinateSeconds('missing', 60), null);
assert.equal(core.properTimeForCoordinateSeconds('r2', -1), null);
assert.equal(core.properTimeForCoordinateSeconds('r2', Number.NaN), null);
assert.equal(core.reading('missing', 1), null);
assert.equal(core.reading('r2', -1), null);
assert.equal(core.reading('r2', 1.5), null);
assert.equal(core.snapshot(-1), null);
assert.equal(core.snapshot(1.5), null);

const expected = new Map([
  ['r1-1', { lapse: 1 / Math.sqrt(11), step: 60 / Math.sqrt(11) }],
  ['r1-5', { lapse: 1 / Math.sqrt(3), step: 60 / Math.sqrt(3) }],
  ['r2', { lapse: 1 / Math.sqrt(2), step: 60 / Math.sqrt(2) }],
  ['r5', { lapse: 2 / Math.sqrt(5), step: 120 / Math.sqrt(5) }]
]);

let previousStep = 0;
for (const station of core.STATIONS) {
  const direct = Math.sqrt(1 - 1 / station.radiusRatio);
  const one = core.reading(station.id, 1);
  const three = core.reading(station.id, 3);
  const target = expected.get(station.id);
  assert.ok(Math.abs(core.lapseFactor(station.id) - direct) < 1e-15);
  assert.ok(Math.abs(one.lapseFactor - target.lapse) < 1e-15);
  assert.ok(Math.abs(one.properStepSeconds - target.step) < 1e-12);
  assert.ok(one.properStepSeconds > previousStep, 'proper-time step should increase across the fixed offered radii');
  assert.ok(one.properStepSeconds < 60, 'every finite hovering station should accumulate less than the asymptotic coordinate-time step');
  assert.ok(Math.abs(three.properElapsedSeconds - 3 * target.step) < 1e-12);
  assert.equal(three.coordinateElapsedSeconds, 180);
  assert.ok(Object.isFrozen(one));
  previousStep = one.properStepSeconds;
}

const snap = core.snapshot(4);
assert.ok(Object.isFrozen(snap));
assert.ok(Object.isFrozen(snap.readings));
assert.equal(snap.stepCount, 4);
assert.equal(snap.coordinateElapsedSeconds, 240);
assert.equal(snap.readings.length, 4);

const declarationsBefore = JSON.stringify(core.STATIONS);
for (const station of core.STATIONS) core.reading(station.id, 7);
assert.equal(JSON.stringify(core.STATIONS), declarationsBefore, 'readings must not mutate fixed station declarations');

for (const pattern of [
  /INSTRUMENT 12 · THE UNEQUAL MINUTE/,
  /Press once\. Four clocks disagree about how much time passed\./,
  /ADVANCE 60 s AT INFINITY/,
  /SAME COMMAND ≠ SAME PROPER TIME/,
  /Δτ = Δt √\(1 − rₛ\/r\)/,
  /WHAT THIS CLOCK ROOM REFUSES TO SAY/,
  /aria-live/,
  /aria-atomic/,
  /aria-describedby/,
  /textContent/
]) assert.match(viewSource, pattern);

assert.equal((viewSource.match(/make\('button'/g) || []).length, 1, 'feature should expose one primary command button');
assert.doesNotMatch(viewSource, /RESET CLOCKS|data-unequal-minute-reset/i);
assert.match(viewSource, /document\.createElement/);
assert.match(viewSource, /textContent/);
assert.doesNotMatch(viewSource, /innerHTML|insertAdjacentHTML|outerHTML|document\.write/);
assert.doesNotMatch([coreSource, viewSource].join('\n'), /\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource/i);
assert.doesNotMatch([coreSource, viewSource].join('\n'), /localStorage|sessionStorage|indexedDB|document\.cookie|navigator\.geolocation|history\.(?:pushState|replaceState)/i);
assert.doesNotMatch([coreSource, viewSource].join('\n'), /setInterval|setTimeout|requestAnimationFrame/i);
assert.doesNotMatch(runtime, /https?:\/\//i, 'feature runtime must contain no remote URL');
assert.doesNotMatch(runtime, /\b(?:gtag|dataLayer|mixpanel|plausible|amplitude|hotjar)\b|google-analytics|googletagmanager|facebook\.com\/tr|doubleclick/i);

for (const pattern of [
  /min-height:\s*44px/,
  /:focus-visible/,
  /overflow-x:\s*auto/,
  /prefers-reduced-motion/,
  /prefers-contrast/,
  /max-width:\s*620px/,
  /@media print/
]) assert.match(css, pattern);
assert.doesNotMatch(css, /@import\s+url|font-face|https?:\/\//i);
assert.match(viewSource, /initial\.lapseFactor \* 100/,
  'view should convert the dimensionless lapse factor into an explicit percentage before handing it to CSS');
assert.match(css, /width:\s*var\(--unequal-minute-lapse\)/,
  'track width should consume the explicit percentage directly');
assert.doesNotMatch(css, /calc\(var\(--unequal-minute-lapse\)\s*\*\s*100%\)/,
  'track width must not depend on typed CSS number-by-percentage multiplication');

for (const pattern of [
  /function addPageFourSignalAnomaly/,
  /addPageFourSignalAnomaly\(\)/,
  /function loadUnequalMinute/,
  /\.\/unequal-minute\.css/,
  /\.\/unequal-minute-core\.js/,
  /\.\/unequal-minute\.js/,
  /function loadSameAnswerMachine\(done = loadUnequalMinute\)/,
  /function loadOriginMachine\(done = loadSameAnswerMachine\)/,
  /function loadRedshiftRuler\(done = loadOriginMachine\)/,
  /function loadGravitationalCopyRoom\(done = loadRedshiftRuler\)/,
  /loadCausalSignalBox\(loadGravitationalCopyRoom\)/
]) assert.match(bootstrap, pattern);

for (const pattern of [
  /Concept A — The Schwarzschild Clock Bench/,
  /Concept B — The Clockmaker's Escapement Rack/,
  /Concept C — One Button Is Not One Amount/,
  /Concept B was discarded/,
  /Concepts A and C were merged/,
  /dτ = dt sqrt\(1 - r_s \/ r\)/,
  /stationary\/hovering/i,
  /freely falling/i,
  /time stops at the horizon/i,
  /No station is placed at or inside/,
  /NASA APOD/,
  /Einstein Online/,
  /NASA Technical Reports Server/,
  /Documentation sources only/i
]) assert.match(doc, pattern);

assert.match(serviceWorker, /const PAGE_FOUR_INSTRUMENT_ROOM_CACHE_NAME = 'museum-of-almost-v40-page-four-instrument-room'/);
assert.match(serviceWorker, /const SHUTTER_CABINET_CACHE_NAME = 'museum-of-almost-v41-shutter-cabinet'/);
assert.match(serviceWorker, /const UNEQUAL_MINUTE_CACHE_NAME = 'museum-of-almost-v42-unequal-minute'/,
  'Unequal Minute v42 must remain named in cache lineage after later releases');
for (const asset of [
  './unequal-minute.css',
  './unequal-minute-core.js',
  './unequal-minute.js',
  './UNEQUAL_MINUTE.md',
  './shutter-cabinet-core.js',
  './shutter-cabinet.js',
  './shutter-cabinet.css',
  './SHUTTER_CABINET.md',
  './page-four-instrument-room.js',
  './PAGE_FOUR_HESSDALEN.md'
]) assert.ok(serviceWorker.includes(`'${asset}'`), `offline shell should include ${asset}`);

console.log('Unequal Minute Schwarzschild lapse math, fixed hovering stations, portable lapse tracks, one-command unequal increments, horizon/free-fall boundary, v41 Shutter Cabinet preservation, v42 cache-lineage preservation, accessibility, privacy, and progressive mount verified.');
