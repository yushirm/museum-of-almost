import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const core = require('../isolation-board-core.js');
const view = fs.readFileSync(new URL('../isolation-board.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../isolation-board.css', import.meta.url), 'utf8');
const record = fs.readFileSync(new URL('../ISOLATION_BOARD.md', import.meta.url), 'utf8');
const loader = fs.readFileSync(new URL('../cosmic-signal.js', import.meta.url), 'utf8');
const worker = fs.readFileSync(new URL('../service-worker.js', import.meta.url), 'utf8');

const snapshot = {
  receivedAt: new Date('2026-08-08T06:40:00.000Z'),
  feeds: { earthquakes: true, solar: true, scales: true, weather: true, events: true }
};

assert.equal(core.FEEDS.length, 5, 'board must mirror the five-feed latch exactly');
assert.deepEqual(core.FEED_IDS, ['earthquakes', 'solar', 'scales', 'weather', 'events']);
assert.equal(core.CIRCUITS.length, 11);
assert.equal(core.hasLatch({ receivedAt: null }), false);
assert.equal(core.hasLatch(snapshot), true);
assert.deepEqual([...core.normalizeTripped(['solar', 'bogus', 'solar'])], ['solar']);

const normal = core.evaluateBoard(snapshot, new Set());
assert.equal(normal.liveCount, 5);
assert.equal(normal.trippedCount, 0);
assert.equal(normal.unavailableCount, 0);
assert.equal(normal.circuits.find((circuit) => circuit.id === 'cosmic-signal').state, 'powered');
assert.equal(normal.circuits.find((circuit) => circuit.id === 'celestial-escapement').state, 'local');
assert.equal(normal.circuits.find((circuit) => circuit.id === 'planetary-heliodon').state, 'local');
assert.equal(normal.circuits.find((circuit) => circuit.id === 'witness-seal').state, 'sealed');

const oneTrip = core.evaluateBoard(snapshot, new Set(['scales']));
assert.equal(oneTrip.trippedCount, 1);
assert.equal(oneTrip.circuits.find((circuit) => circuit.id === 'space-scales').state, 'dark');
assert.equal(oneTrip.circuits.find((circuit) => circuit.id === 'cosmic-signal').state, 'degraded');
assert.equal(oneTrip.circuits.find((circuit) => circuit.id === 'faultline-core').state, 'degraded');
assert.equal(oneTrip.circuits.find((circuit) => circuit.id === 'witness-seal').state, 'sealed', 'simulation must never alter actual latch evidence');

const cosmicDark = core.evaluateBoard(snapshot, new Set(['solar', 'scales']));
assert.equal(cosmicDark.circuits.find((circuit) => circuit.id === 'cosmic-signal').state, 'dark');
assert.equal(cosmicDark.circuits.find((circuit) => circuit.id === 'sounding-well').state, 'degraded');

const allTripped = core.evaluateBoard(snapshot, new Set(core.FEED_IDS));
assert.equal(allTripped.liveCount, 0);
assert.equal(allTripped.circuits.find((circuit) => circuit.id === 'sounding-well').state, 'dark');
assert.equal(allTripped.circuits.find((circuit) => circuit.id === 'faultline-core').state, 'dark');
assert.equal(allTripped.circuits.find((circuit) => circuit.id === 'celestial-escapement').state, 'local');
assert.equal(allTripped.circuits.find((circuit) => circuit.id === 'witness-seal').state, 'sealed');

const actualFailure = core.evaluateBoard({
  ...snapshot,
  feeds: { ...snapshot.feeds, events: false }
}, new Set(['events']));
assert.equal(actualFailure.unavailableCount, 1);
assert.equal(actualFailure.trippedCount, 0, 'a real outage must take precedence over a hypothetical trip');
assert.equal(actualFailure.feeds.find((feed) => feed.id === 'events').state, 'unavailable');
assert.equal(actualFailure.circuits.find((circuit) => circuit.id === 'open-events').state, 'dark');
assert.match(core.stateSentence(actualFailure), /actually unavailable/);

const waiting = core.evaluateBoard({ receivedAt: null, feeds: snapshot.feeds }, new Set(['solar']));
assert.equal(waiting.hasLatch, false);
assert.ok(waiting.circuits.every((circuit) => circuit.state === 'waiting'));

assert.match(view, /museum:commons-snapshot/);
assert.match(view, /tripped = new Set\(\);[\s\S]+render\(\);/, 'a real snapshot must clear hypothetical trips');
assert.match(view, /SIMULATED ISOLATION ONLY/);
assert.match(view, /ACTUALLY UNAVAILABLE/);
assert.match(view, /real latched snapshot remains untouched/i);
assert.match(view, /Witness Seal continues to identify the actual normalized latch/i);
assert.match(view, /aria-pressed/);
assert.match(view, /aria-live/);
assert.doesNotMatch(view, /\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource/i);
assert.doesNotMatch(view, /setInterval|setTimeout|requestAnimationFrame|localStorage|sessionStorage|indexedDB|document\.cookie|navigator\.geolocation/i);
assert.doesNotMatch(view, /analytics|telemetry|https?:\/\//i);

for (const pattern of [/@media \(max-width: 760px\)/, /@media \(max-width: 620px\)/, /prefers-reduced-motion/, /prefers-contrast/, /@media print/, /display: none !important/]) {
  assert.match(css, pattern);
}
assert.match(css, /min-height: 44px/);
assert.doesNotMatch(css, /@import\s+url|font-face|https?:\/\//i);

for (const pattern of [/Concept A/, /Concept B/, /Concept C/, /Concept A was discarded/, /The Isolation Board \/ What Survives a Lost Feed/, /adds no network request/i, /never alter the Witness Seal/i, /clear every hypothetical trip/i]) {
  assert.match(record, pattern);
}

assert.match(loader, /isolation-board-core\.js/);
assert.match(loader, /isolation-board\.js/);
for (const asset of ['./isolation-board-core.js', './isolation-board.js', './isolation-board.css', './ISOLATION_BOARD.md']) {
  assert.ok(worker.includes(`'${asset}'`), `offline shell should cache ${asset}`);
}

console.log('Isolation Board failure simulation, actual-vs-hypothetical state, privacy, accessibility, and offline contracts verified.');
