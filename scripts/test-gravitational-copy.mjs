import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const require = createRequire(import.meta.url);

for (const name of [
  'gravitational-copy-core.js',
  'gravitational-copy.js',
  'gravitational-copy.css',
  'GRAVITATIONAL_COPY_ROOM.md',
  'deep-space.js'
]) assert.ok(fs.existsSync(path.join(root, name)), `missing ${name}`);

const coreSource = read('gravitational-copy-core.js');
const viewSource = read('gravitational-copy.js');
const css = read('gravitational-copy.css');
const doc = read('GRAVITATIONAL_COPY_ROOM.md');
const bootstrap = read('deep-space.js');
const runtime = [coreSource, viewSource, css].join('\n');
const core = require('../gravitational-copy-core.js');

assert.equal(core.SOURCE_ID, 'SRC-01');
assert.equal(core.CASES.length, 3);
assert.equal(new Set(core.CASES.map(({ id }) => id)).size, 3);
assert.deepEqual(core.CASES.map(({ sourceOffset }) => sourceOffset), [0, 0.5, 1.5]);
assert.equal(core.getCase('missing'), null);
assert.equal(core.snapshot('missing'), null);

const aligned = core.snapshot('aligned');
assert.equal(aligned.aligned, true);
assert.equal(aligned.ringRadius, 1);
assert.equal(aligned.images.length, 0);
assert.equal(aligned.sourceId, core.SOURCE_ID);
assert.ok(Math.abs(aligned.rootProduct + 1) < 1e-12, 'aligned one-dimensional roots should retain the -1 product before circular symmetry is rendered as a ring');

for (const id of ['near-axis', 'off-axis']) {
  const snap = core.snapshot(id);
  assert.equal(snap.aligned, false);
  assert.equal(snap.images.length, 2);
  assert.equal(snap.images[0].sourceId, core.SOURCE_ID);
  assert.equal(snap.images[1].sourceId, core.SOURCE_ID);
  assert.equal(snap.images[0].parity, 'positive');
  assert.equal(snap.images[1].parity, 'negative');
  assert.ok(Math.abs(snap.images[0].residual) < 1e-12, `${id} positive root should satisfy lens equation`);
  assert.ok(Math.abs(snap.images[1].residual) < 1e-12, `${id} negative root should satisfy lens equation`);
  assert.ok(Math.abs(snap.rootProduct + 1) < 1e-12, `${id} roots should keep the normalized reciprocal product x+ × x− = -1`);
  assert.ok(snap.images[0].position > 1, `${id} positive image should lie outside Einstein radius`);
  assert.ok(snap.images[1].position < 0 && Math.abs(snap.images[1].position) < 1, `${id} negative image should lie inside Einstein radius on opposite side`);
}

const near = core.snapshot('near-axis');
assert.ok(Math.abs(near.images[0].position - 1.2807764064) < 1e-10);
assert.ok(Math.abs(near.images[1].position + 0.7807764064) < 1e-10);
assert.ok(Math.abs(near.separation - Math.sqrt(4.25)) < 1e-12);

const off = core.snapshot('off-axis');
assert.equal(off.images[0].position, 2);
assert.equal(off.images[1].position, -0.5);
assert.equal(off.separation, 2.5);
assert.equal(off.rootProduct, -1);

const frozenBefore = JSON.stringify(core.CASES);
core.snapshot('near-axis');
assert.equal(JSON.stringify(core.CASES), frozenBefore, 'snapshots must not mutate fixed cases');

for (const pattern of [
  /INSTRUMENT 08 · THE GRAVITATIONAL COPY ROOM/,
  /Two cards can be one thing\./,
  /ONE SOURCE/,
  /APPARENT IMAGE/,
  /SOURCE IDENTITY/,
  /EINSTEIN RING/,
  /RECIPROCAL LOCK · x\+ × x− = −1/,
  /1D root product x\+ × x−/,
  /Normalized point-lens equation/,
  /aria-live/,
  /aria-pressed/
]) assert.match(viewSource, pattern);

assert.match(viewSource, /document\.createElement/);
assert.match(viewSource, /textContent/);
assert.match(viewSource, /replaceChildren/);
assert.match(viewSource, /snap\.rootProduct\.toFixed\(3\)/);
assert.doesNotMatch(viewSource, /innerHTML|insertAdjacentHTML|outerHTML/);
assert.doesNotMatch([coreSource, viewSource].join('\n'), /\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource/i);
assert.doesNotMatch([coreSource, viewSource].join('\n'), /localStorage|sessionStorage|indexedDB|document\.cookie|navigator\.geolocation|history\.(?:pushState|replaceState)/i);
assert.doesNotMatch([coreSource, viewSource].join('\n'), /setInterval|setTimeout|requestAnimationFrame/i);
assert.doesNotMatch(runtime, /https?:\/\//i, 'feature runtime must contain no remote URL');
assert.doesNotMatch(runtime, /\b(?:gtag|dataLayer|mixpanel|plausible|amplitude|hotjar)\b|google-analytics|googletagmanager|facebook\.com\/tr|doubleclick/i);

assert.match(css, /min-height:\s*44px/);
assert.match(css, /:focus-visible/);
assert.match(css, /\.copy-invariant-badge/);
assert.match(css, /prefers-reduced-motion/);
assert.match(css, /prefers-contrast/);
assert.match(css, /forced-colors/);
assert.match(css, /max-width:\s*620px/);
assert.match(css, /@media print/);
assert.doesNotMatch(css, /@import\s+url|font-face|https?:\/\//i);

assert.match(bootstrap, /function loadGravitationalCopyRoom/);
assert.match(bootstrap, /\.\/gravitational-copy\.css/);
assert.match(bootstrap, /\.\/gravitational-copy-core\.js/);
assert.match(bootstrap, /\.\/gravitational-copy\.js/);
assert.match(bootstrap, /loadCausalSignalBox\(loadGravitationalCopyRoom\)/,
  'Instrument 08 should load only after Instrument 07 has executed so dynamic order remains deterministic');

for (const pattern of [
  /Concept A — The Einstein Lens Bench/,
  /Concept B — The Printmaker's Ghost Plate/,
  /Concept C — Duplicate Cards Are Not Duplicate Things/,
  /Concept B was discarded/,
  /Concepts A and C were merged/,
  /y = x - 1\/x/,
  /x\+ × x− = -1/,
  /reciprocal lock/,
  /NASA Science/,
  /NASA\/IPAC Extragalactic Database/,
  /documentation references only/
]) assert.match(doc, pattern);

console.log('Gravitational Copy Room lens equation, reciprocal root invariant, shared-source identity, accessibility, privacy, progressive mount, and documentation contract verified.');
