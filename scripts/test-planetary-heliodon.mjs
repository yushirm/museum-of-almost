import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const core = require('../planetary-heliodon-core.js');
const commons = require('../data-core.js');
const view = fs.readFileSync(new URL('../planetary-heliodon.js', import.meta.url), 'utf8');
const styles = fs.readFileSync(new URL('../planetary-heliodon.css', import.meta.url), 'utf8');
const loader = fs.readFileSync(new URL('../cosmic-signal.js', import.meta.url), 'utf8');
const notes = fs.readFileSync(new URL('../PLANETARY_HELIODON.md', import.meta.url), 'utf8');

const timestamp = Date.parse('2026-06-21T12:00:00Z');
const plate = core.plate(timestamp);
assert.ok(plate);
assert.ok(Math.abs(plate.geometry.subsolar.lat - 23.44) < 0.2);
assert.ok(Math.abs(plate.geometry.subsolar.lon) < 0.01);
assert.ok(Math.abs(plate.subsolar.x - 500) < 0.1);
assert.ok(plate.subsolar.y < 250);
assert.ok(plate.antisolar.y > 250);
assert.ok(plate.terminatorPath.startsWith('M'));
assert.ok(plate.terminatorPath.includes('L'));
assert.ok(plate.nightPath.includes('Z'));

const terminator = core.terminatorCoordinates(timestamp, 361);
assert.equal(terminator.length, 361);
for (const point of terminator.filter((_, index) => index % 30 === 0)) {
  const elevation = commons.solarElevation(timestamp, point.lat, point.lon);
  assert.ok(Math.abs(elevation) < 1e-8, `terminator point should have zero solar elevation, got ${elevation}`);
}

const parts = core.terminatorParts(timestamp, 361);
assert.ok(parts.length >= 1 && parts.length <= 3);
assert.ok(parts.every((part) => part.length > 1));
for (const part of parts) {
  for (let index = 1; index < part.length; index += 1) {
    assert.ok(Math.abs(part[index].x - part[index - 1].x) <= core.WIDTH / 2,
      'map seam must split the terminator instead of drawing a false cross-map chord');
  }
}
assert.ok(parts.flat().every((point) => point.x >= 0 && point.x <= core.WIDTH && point.y >= 0 && point.y <= core.HEIGHT));

assert.match(loader, /planetary-heliodon-core\.js/);
assert.match(loader, /planetary-heliodon\.js/);
assert.match(view, /THE PLANETARY HELIODON \/ EARTH CASTS THE NIGHT/);
assert.match(view, /MutationObserver/);
assert.match(view, /if \(!match\) return null/);
assert.match(view, /Waiting for a captured Museum snapshot/);
assert.match(view, /Snapshot received \(\\d\{2\}\):\(\\d\{2\}\):\(\\d\{2\}\) UTC/);
assert.match(view, /heliodon-field-strip/);
assert.doesNotMatch(view, /\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource/i);
assert.doesNotMatch(view, /setInterval|setTimeout|requestAnimationFrame|localStorage|sessionStorage|indexedDB|document\.cookie|navigator\.geolocation/i);
assert.match(styles, /\.planetary-heliodon-overlay/);
assert.match(styles, /@media \(max-width: 620px\)/);
assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
assert.match(styles, /@media \(prefers-contrast: more\)/);
assert.match(styles, /@media print/);
assert.doesNotMatch(styles, /@import\s+url|font-face|https?:\/\//i);
assert.match(notes, /The world is doing this without us\./);
assert.match(notes, /Concept C was discarded/);
assert.match(notes, /no new runtime request/i);

console.log('Planetary Heliodon solar geometry, terminator, local-only boundary, accessibility hooks, and snapshot alignment verified.');
