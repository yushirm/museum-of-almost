import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const require = createRequire(import.meta.url);

for (const name of [
  'same-answer-core.js',
  'same-answer-machine.js',
  'same-answer-machine.css',
  'SAME_ANSWER_MACHINE.md',
  'deep-space.js'
]) assert.ok(fs.existsSync(path.join(root, name)), `missing ${name}`);

const coreSource = read('same-answer-core.js');
const viewSource = read('same-answer-machine.js');
const css = read('same-answer-machine.css');
const doc = read('SAME_ANSWER_MACHINE.md');
const bootstrap = read('deep-space.js');
const runtime = [coreSource, viewSource, css].join('\n');
const runtimeWithoutSvgNamespace = runtime.replaceAll('http://www.w3.org/2000/svg', '');
const core = require('../same-answer-core.js');

assert.equal(core.A_EMIT, 0.5);
assert.equal(core.A_OBS, 1);
assert.equal(core.REDSHIFT, 1);
assert.deepEqual(core.SAMPLE_U, [0, 0.25, 0.5, 0.75, 1]);
assert.deepEqual(core.HISTORIES.map(({ id }) => id), ['linear', 'early', 'late']);
assert.equal(new Set(core.HISTORIES.map(({ id }) => id)).size, 3);
assert.equal(core.getHistory('missing'), null);
assert.equal(core.scaleFactor('linear', -0.01), null);
assert.equal(core.scaleFactor('linear', 1.01), null);
assert.equal(core.scaleFactor('missing', 0.5), null);
assert.equal(core.pathIntegral('missing'), null);
assert.equal(core.sampleHistory('missing'), null);
assert.equal(core.snapshot('missing'), null);

for (const history of core.HISTORIES) {
  assert.equal(core.scaleFactor(history.id, 0), 0.5);
  assert.equal(core.scaleFactor(history.id, 1), 1);
  const snap = core.snapshot(history.id);
  assert.ok(Object.isFrozen(snap));
  assert.ok(Object.isFrozen(snap.samples));
  assert.equal(snap.emittedScaleFactor, 0.5);
  assert.equal(snap.observedScaleFactor, 1);
  assert.equal(snap.redshift, 1, 'every history must preserve the same endpoint redshift');
  assert.equal(snap.stretchFactor, 2);
  assert.equal(snap.samples[0].a, 0.5);
  assert.equal(snap.samples.at(-1).a, 1);
}

assert.ok(Math.abs(core.pathIntegral('linear') - 2 * Math.log(2)) < 1e-15);
assert.ok(Math.abs(core.pathIntegral('early') - 4 * (1 - Math.log(2))) < 1e-15);
assert.ok(Math.abs(core.pathIntegral('late') - Math.PI / 2) < 1e-15);
assert.ok(core.pathIntegral('early') < core.pathIntegral('linear'));
assert.ok(core.pathIntegral('linear') < core.pathIntegral('late'));

function midpointIntegral(id, divisions = 100000) {
  let total = 0;
  for (let index = 0; index < divisions; index += 1) {
    const u = (index + 0.5) / divisions;
    total += 1 / core.scaleFactor(id, u);
  }
  return total / divisions;
}
for (const history of core.HISTORIES) {
  assert.ok(
    Math.abs(midpointIntegral(history.id) - core.pathIntegral(history.id)) < 1e-7,
    `${history.id} analytic path integral should agree with independent numerical integration`
  );
}

const declarationsBefore = JSON.stringify(core.HISTORIES);
for (const history of core.HISTORIES) core.snapshot(history.id);
assert.equal(JSON.stringify(core.HISTORIES), declarationsBefore, 'snapshots must not mutate fixed history declarations');

for (const pattern of [
  /INSTRUMENT 11 · THE SAME ANSWER MACHINE/,
  /Change the history\. The biggest answer refuses to move\./,
  /z = 1/,
  /UNCHANGED BY HISTORY SELECTION/,
  /History-dependent path ledger/,
  /WHAT THIS INTEGRAL REFUSES TO BECOME/,
  /dimensionless path integral/,
  /aria-live/,
  /aria-pressed/,
  /replaceChildren/,
  /createElementNS/
]) assert.match(viewSource, pattern);

assert.match(viewSource, /document\.createElement/);
assert.match(viewSource, /textContent/);
assert.match(viewSource, /http:\/\/www\.w3\.org\/2000\/svg/, 'standard SVG namespace identifier should be explicit');
assert.doesNotMatch(viewSource, /innerHTML|insertAdjacentHTML|outerHTML|document\.write/);
assert.doesNotMatch([coreSource, viewSource].join('\n'), /\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource/i);
assert.doesNotMatch([coreSource, viewSource].join('\n'), /localStorage|sessionStorage|indexedDB|document\.cookie|navigator\.geolocation|history\.(?:pushState|replaceState)/i);
assert.doesNotMatch([coreSource, viewSource].join('\n'), /setInterval|setTimeout|requestAnimationFrame/i);
assert.doesNotMatch(runtimeWithoutSvgNamespace, /https?:\/\//i, 'feature runtime must contain no remote URL beyond the non-network SVG namespace identifier');
assert.doesNotMatch(runtime, /\b(?:gtag|dataLayer|mixpanel|plausible|amplitude|hotjar)\b|google-analytics|googletagmanager|facebook\.com\/tr|doubleclick/i);

for (const pattern of [
  /min-height:\s*44px/,
  /:focus-visible/,
  /overflow-x:\s*auto/,
  /stroke-dasharray/,
  /prefers-reduced-motion/,
  /prefers-contrast/,
  /max-width:\s*620px/,
  /@media print/
]) assert.match(css, pattern);
assert.doesNotMatch(css, /@import\s+url|font-face|https?:\/\//i);

for (const pattern of [
  /function loadSameAnswerMachine/,
  /\.\/same-answer-machine\.css/,
  /\.\/same-answer-core\.js/,
  /\.\/same-answer-machine\.js/,
  /function loadOriginMachine\(done = loadSameAnswerMachine\)/,
  /function loadRedshiftRuler\(done = loadOriginMachine\)/,
  /function loadGravitationalCopyRoom\(done = loadRedshiftRuler\)/,
  /loadCausalSignalBox\(loadGravitationalCopyRoom\)/
]) assert.match(bootstrap, pattern);

for (const pattern of [
  /Concept A — The Expansion-History Comparator/,
  /Concept B — The Route Planner/,
  /Concept C — Three Buttons That Give the Same Answer/,
  /Concept B was discarded/,
  /Concepts A and C were merged/,
  /1 \+ z = a_obs \/ a_emit = 2/,
  /J = integral_0\^1 du \/ a\(u\)/,
  /2 ln 2/,
  /4\(1 - ln 2\)/,
  /pi \/ 2/,
  /dimensionless normalized toy time/i,
  /does not by itself specify a history-dependent path integral/i,
  /NASA Science/,
  /NASA\/IPAC Extragalactic Database/,
  /documentation sources only/i
]) assert.match(doc, pattern);

console.log('Same Answer Machine invariant redshift, analytic toy histories, independent path-integral checks, semantic sameness, accessibility, privacy, progressive mount, and documentation boundary verified.');
