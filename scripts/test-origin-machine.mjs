import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const require = createRequire(import.meta.url);

for (const name of [
  'origin-machine-core.js',
  'origin-machine.js',
  'origin-machine.css',
  'ORIGIN_MACHINE.md',
  'deep-space.js'
]) assert.ok(fs.existsSync(path.join(root, name)), `missing ${name}`);

const coreSource = read('origin-machine-core.js');
const viewSource = read('origin-machine.js');
const css = read('origin-machine.css');
const doc = read('ORIGIN_MACHINE.md');
const bootstrap = read('deep-space.js');
const runtime = [coreSource, viewSource, css].join('\n');
const core = require('../origin-machine-core.js');

assert.equal(core.MARKERS.length, 5);
assert.deepEqual(core.MARKERS.map(({ chi }) => chi), [-4, -2, 0, 3, 5]);
assert.deepEqual(core.SCALE_FACTORS, [0.5, 1, 2]);
assert.equal(new Set(core.MARKERS.map(({ id }) => id)).size, 5);
assert.equal(core.MAX_RELATIVE_MAGNITUDE, 18);
assert.equal(core.getMarker('missing'), null);
assert.equal(core.snapshot('missing', 1), null);
assert.equal(core.snapshot('c', 3), null);
assert.equal(core.relativeCoordinate(0, 0, 3), null);
assert.equal(core.visualPercent(19), null);

const center = core.snapshot('c', 1);
assert.deepEqual(center.markers.map(({ relative }) => relative), [-4, -2, 0, 3, 5]);
assert.deepEqual(center.markers.map(({ separation }) => separation), [4, 2, 0, 3, 5]);
assert.equal(center.markers.find(({ id }) => id === 'c').visualPercent, 50);

const leftExpanded = core.snapshot('a', 2);
assert.deepEqual(leftExpanded.markers.map(({ relative }) => relative), [0, 4, 8, 14, 18]);
assert.equal(leftExpanded.markers[4].visualPercent, 88);

const rightContracted = core.snapshot('e', 0.5);
assert.deepEqual(rightContracted.markers.map(({ relative }) => relative), [-4.5, -3.5, -2.5, -1, 0]);
assert.deepEqual(rightContracted.markers.map(({ separation }) => separation), [4.5, 3.5, 2.5, 1, 0]);

for (const observer of core.MARKERS) {
  for (const scaleFactor of core.SCALE_FACTORS) {
    const snap = core.snapshot(observer.id, scaleFactor);
    assert.ok(Object.isFrozen(snap));
    assert.ok(Object.isFrozen(snap.markers));
    assert.deepEqual(snap.markers.map(({ id }) => id), core.MARKERS.map(({ id }) => id), 'recentring must not reorder fixed marker identity');
    const origin = snap.markers.find(({ isOrigin }) => isOrigin);
    assert.equal(origin.id, observer.id);
    assert.equal(origin.relative, 0);
    assert.equal(origin.separation, 0);
    assert.equal(origin.visualPercent, 50);

    for (const marker of snap.markers) {
      assert.equal(marker.relative, scaleFactor * (marker.chi - observer.chi));
      assert.equal(marker.separation, scaleFactor * Math.abs(marker.chi - observer.chi));
      assert.ok(marker.visualPercent >= 12 && marker.visualPercent <= 88, 'visual mapping should reserve safe side margins');
    }

    for (const left of snap.markers) {
      for (const right of snap.markers) {
        assert.equal(left.relative - right.relative, scaleFactor * (left.chi - right.chi), 'changing origin must not change pairwise geometry');
      }
    }
  }
}

const frozenBefore = JSON.stringify(core.MARKERS);
core.snapshot('a', 2);
assert.equal(JSON.stringify(core.MARKERS), frozenBefore, 'snapshots must not mutate fixed marker declarations');

for (const pattern of [
  /INSTRUMENT 10 · THE ORIGIN MACHINE/,
  /The page refuses to keep one permanent center\./,
  /Relative-coordinate ledger/,
  /WHAT THIS ORIGIN REFUSES TO CLAIM/,
  /flat one-dimensional homogeneous expansion toy/,
  /Vertical staggering is only label clearance/,
  /aria-live/,
  /aria-pressed/,
  /tabIndex = 0/,
  /--origin-position/,
  /replaceChildren/
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
  /data-marker-id="a"/,
  /data-marker-id="e"/,
  /data-origin="true"/,
  /prefers-reduced-motion/,
  /prefers-contrast/,
  /max-width:\s*620px/,
  /@media print/
]) assert.match(css, pattern);
assert.doesNotMatch(css, /@import\s+url|font-face|https?:\/\//i);

for (const pattern of [
  /function loadOriginMachine/,
  /\.\/origin-machine\.css/,
  /\.\/origin-machine-core\.js/,
  /\.\/origin-machine\.js/,
  /function loadRedshiftRuler\(done = loadOriginMachine\)/,
  /function loadGravitationalCopyRoom\(done = loadRedshiftRuler\)/,
  /loadCausalSignalBox\(loadGravitationalCopyRoom\)/
]) assert.match(bootstrap, pattern);

for (const pattern of [
  /Concept A — The Expansion Bench/,
  /Concept B — The Darkroom Enlarger/,
  /Concept C — The Page Has No Permanent Center/,
  /Concept B was discarded/,
  /Concepts A and C were merged/,
  /x_relative = a \(χ - χ_observer\)/,
  /D = a \|χ - χ_observer\|/,
  /NASA Science/,
  /NASA\/IPAC Extragalactic Database/,
  /finite five-marker window is not an edge/i,
  /Vertical staggering is only label clearance/,
  /no `H0`/,
  /documentation sources only/i
]) assert.match(doc, pattern);

console.log('Origin Machine fixed comoving geometry, scale-factor separation, recenter invariance, constant marker identity, label clearance, scientific boundary, accessibility, privacy, and progressive mount contract verified.');
