import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const require = createRequire(import.meta.url);

for (const name of [
  'redshift-ruler-core.js',
  'redshift-ruler.js',
  'redshift-ruler.css',
  'REDSHIFT_RULER.md',
  'deep-space.js'
]) assert.ok(fs.existsSync(path.join(root, name)), `missing ${name}`);

const coreSource = read('redshift-ruler-core.js');
const viewSource = read('redshift-ruler.js');
const css = read('redshift-ruler.css');
const doc = read('REDSHIFT_RULER.md');
const bootstrap = read('deep-space.js');
const runtime = [coreSource, viewSource, css].join('\n');
const core = require('../redshift-ruler-core.js');

assert.equal(core.REFERENCE_WAVELENGTH_NM, 500);
assert.equal(core.CASES.length, 3);
assert.equal(new Set(core.CASES.map(({ id }) => id)).size, 3);
assert.deepEqual(core.CASES.map(({ redshift }) => redshift), [0.1, 1, 6]);
assert.equal(core.getCase('missing'), null);
assert.equal(core.snapshot('missing'), null);
assert.equal(core.stretchFactor(-1), null);
assert.equal(core.stretchFactor(Number.NaN), null);
assert.equal(core.observedWavelengthNm(0, 1), null);

const modest = core.snapshot('modest');
assert.equal(modest.observedWavelengthNm, 550);
assert.equal(modest.stretchFactor, 1.1);
assert.ok(Math.abs(modest.emissionScaleFactor - (1 / 1.1)) < 1e-12);

const doubled = core.snapshot('double');
assert.equal(doubled.observedWavelengthNm, 1000);
assert.equal(doubled.stretchFactor, 2);
assert.equal(doubled.emissionScaleFactor, 0.5);

const deep = core.snapshot('deep');
assert.equal(deep.observedWavelengthNm, 3500);
assert.equal(deep.stretchFactor, 7);
assert.ok(Math.abs(deep.emissionScaleFactor - (1 / 7)) < 1e-12);

for (const item of core.CASES) {
  const snap = core.snapshot(item.id);
  assert.equal(snap.observedWavelengthNm / snap.emittedWavelengthNm, snap.stretchFactor);
  assert.ok(Math.abs((1 / snap.emissionScaleFactor) - snap.stretchFactor) < 1e-12);
}

const frozenBefore = JSON.stringify(core.CASES);
core.snapshot('deep');
assert.equal(JSON.stringify(core.CASES), frozenBefore, 'snapshots must not mutate fixed cases');

for (const pattern of [
  /INSTRUMENT 09 · THE REDSHIFT RULER/,
  /The ruler changes after the light leaves\./,
  /Cosmological stretch ledger/,
  /WHAT THIS RULER REFUSES TO INFER/,
  /Doppler and gravitational redshift are different mechanisms/,
  /aria-live/,
  /aria-pressed/,
  /tabIndex = 0/,
  /--redshift-stretch/
]) assert.match(viewSource, pattern);

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

for (const pattern of [
  /function loadRedshiftRuler/,
  /\.\/redshift-ruler\.css/,
  /\.\/redshift-ruler-core\.js/,
  /\.\/redshift-ruler\.js/,
  /function loadGravitationalCopyRoom\(done = loadRedshiftRuler\)/,
  /loadCausalSignalBox\(loadGravitationalCopyRoom\)/
]) assert.match(bootstrap, pattern);

for (const pattern of [
  /Concept A — The Redshift Desk/,
  /Concept B — The Spectral Bellows/,
  /Concept C — The Ruler Refuses to Stay the Same Size/,
  /Concept B was discarded/,
  /Concepts A and C were merged/,
  /lambda_obs = lambda_emit \(1 \+ z\)/,
  /a_emit = 1 \/ \(1 \+ z\)/,
  /NASA Science/,
  /NASA\/IPAC Extragalactic Database/,
  /cosmological redshift only/i,
  /must not be converted here into a special-relativistic recession speed/i,
  /documentation sources only/i
]) assert.match(doc, pattern);

console.log('Redshift Ruler wavelength relation, scale-factor relation, stable scientific boundary, intentional local overflow, accessibility, privacy, progressive mount, and documentation contract verified.');
