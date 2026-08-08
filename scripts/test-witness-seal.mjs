import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const core = require('../witness-seal-core.js');
const view = fs.readFileSync(new URL('../witness-seal.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../witness-seal.css', import.meta.url), 'utf8');
const record = fs.readFileSync(new URL('../WITNESS_SEAL.md', import.meta.url), 'utf8');
const loader = fs.readFileSync(new URL('../cosmic-signal.js', import.meta.url), 'utf8');
const worker = fs.readFileSync(new URL('../service-worker.js', import.meta.url), 'utf8');

const snapshot = {
  receivedAt: new Date('2026-08-08T06:30:00.000Z'),
  feeds: { earthquakes: true, solar: true, scales: true, weather: true, events: false },
  earthquakes: { available: true, count: 12, strongest: 4.6, meanDepth: 18.2, significant: 1 },
  solar: { available: true, speed: 421.4, state: 'steady' },
  weather: {
    available: true,
    availableCount: 2,
    minTemp: -3.2,
    maxTemp: 24.8,
    meanWind: 17.5,
    maxWind: 23.4,
    raining: 1,
    points: [
      { id: '02', available: true, temperature: -3.2, wind: 11.6, precipitation: 0 },
      { id: '01', available: true, temperature: 24.8, wind: 23.4, precipitation: 1.2 }
    ]
  },
  events: { available: false, count: null, capped: false, categories: [] }
};
const scales = {
  geomagnetic: { scale: 1 },
  radiation: { scale: 0 }
};

assert.equal(core.SCHEMA, 'commons-witness-v1');
assert.equal(core.availableFeedCount(snapshot), 4);
assert.equal(core.canonicalSnapshot({ receivedAt: null }, scales), null, 'missing latch time must fail closed');

const canonical = core.canonicalSnapshot(snapshot, scales);
assert.equal(canonical.receivedAt, '2026-08-08T06:30:00.000Z');
assert.deepEqual(canonical.weather.points.map((point) => point.id), ['01', '02']);
assert.equal(canonical.events.count, null, 'missing values must remain null');
assert.equal(canonical.scales.radiation, 0, 'scale zero must remain a real value');

const sameMeaningDifferentOrder = {
  events: canonical.events,
  weather: canonical.weather,
  solar: canonical.solar,
  earthquakes: canonical.earthquakes,
  scales: canonical.scales,
  feeds: canonical.feeds,
  receivedAt: canonical.receivedAt,
  schema: canonical.schema
};
assert.equal(core.stableStringify(canonical), core.stableStringify(sameMeaningDifferentOrder), 'object insertion order must not alter the receipt');

const payload = core.stableStringify(canonical);
const digest = await core.sha256Hex(payload);
const expected = crypto.createHash('sha256').update(payload).digest('hex');
assert.equal(digest, expected, 'browser-compatible SHA-256 must match Node SHA-256');
assert.match(core.sealCode(digest), /^NOW-[0-9A-F]{4}(?:-[0-9A-F]{4}){3}$/);
assert.equal(core.sealCode('abc'), null, 'short or malformed digests must fail closed');

assert.match(view, /museum:commons-snapshot/);
assert.match(view, /MuseumCommonsSnapshot/);
assert.match(view, /crypto\.subtle|sha256Hex/);
assert.match(view, /#field-sheet \.field-sheet-meta/);
assert.match(view, /identity check, not a truth score/i);
assert.match(view, /version !== renderVersion/, 'obsolete async hash results must be rejected');
assert.doesNotMatch(view, /\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource/i);
assert.doesNotMatch(view, /setInterval|setTimeout|requestAnimationFrame|localStorage|sessionStorage|indexedDB|document\.cookie|navigator\.geolocation/i);
assert.doesNotMatch(view, /analytics|telemetry|https?:\/\//i);

for (const pattern of [/@media \(max-width: 760px\)/, /@media \(max-width: 620px\)/, /prefers-reduced-motion/, /prefers-contrast/, /@media print/, /field-sheet-witness-seal/]) {
  assert.match(css, pattern);
}
assert.doesNotMatch(css, /@import\s+url|font-face|https?:\/\//i);

for (const pattern of [/Concept A/, /Concept B/, /Concept C/, /Concept C was discarded/, /SHA-256/, /adds no network request/i, /never persist/i]) {
  assert.match(record, pattern);
}

assert.match(loader, /witness-seal-core\.js/);
assert.match(loader, /witness-seal\.js/);
for (const asset of ['./witness-seal-core.js', './witness-seal.js', './witness-seal.css', './WITNESS_SEAL.md']) {
  assert.ok(worker.includes(`'${asset}'`), `offline shell should cache ${asset}`);
}

console.log('Witness Seal canonicalization, hashing, privacy, stale-result rejection, accessibility, field-sheet, and offline contracts verified.');
