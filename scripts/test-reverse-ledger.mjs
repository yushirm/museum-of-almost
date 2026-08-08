import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const commons = require('../data-core.js');
const core = require('../reverse-ledger-core.js');
const view = fs.readFileSync(new URL('../reverse-ledger.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../reverse-ledger.css', import.meta.url), 'utf8');
const record = fs.readFileSync(new URL('../REVERSE_LEDGER.md', import.meta.url), 'utf8');
const loader = fs.readFileSync(new URL('../cosmic-signal.js', import.meta.url), 'utf8');
const worker = fs.readFileSync(new URL('../service-worker.js', import.meta.url), 'utf8');

const weatherPoints = commons.STATIONS.map((station, index) => ({
  ...station,
  available: true,
  temperature: index - 4,
  wind: 10 + index,
  precipitation: index === 2 ? 1.2 : 0
}));
const snapshot = {
  receivedAt: new Date('2026-08-08T07:00:00.000Z'),
  feeds: { earthquakes: true, solar: true, scales: true, weather: true, events: true },
  earthquakes: { available: true, count: 4, strongest: 3.1, meanDepth: 12.2, significant: 0 },
  solar: { available: true, speed: 455.5, state: 'steady' },
  scales: { available: true, value: {} },
  weather: {
    available: true,
    points: weatherPoints,
    availableCount: 13,
    minTemp: -4,
    maxTemp: 8,
    meanWind: 16,
    maxWind: 22,
    raining: 1
  },
  events: { available: true, count: 7, capped: false, categories: [] }
};

assert.equal(core.CLAIMS.length, 6);
assert.equal(new Set(core.CLAIMS.map((claim) => claim.id)).size, 6);
assert.equal(core.validDate(null), null, 'missing latch time must not become epoch time');
assert.equal(core.finite(null), null, 'missing numeric values must remain missing');

function verifyTrace(trace) {
  const ids = new Set(trace.nodes.map((entry) => entry.id));
  assert.equal(ids.size, trace.nodes.length, `${trace.id} account ids must be unique`);
  for (const entry of trace.edges) {
    assert.ok(ids.has(entry.from), `${trace.id} edge must start at a real account`);
    assert.ok(ids.has(entry.to), `${trace.id} edge must end at a real account`);
    assert.equal(entry.label, 'OWES TO');
  }
}

for (const claim of core.CLAIMS) verifyTrace(core.traceClaim(snapshot, claim.id));

const quake = core.traceClaim(snapshot, 'earthquake-count');
assert.equal(quake.complete, true);
assert.equal(quake.value, '4 recorded');
assert.ok(quake.nodes.some((entry) => entry.type === 'source' && /USGS/.test(entry.label)));
assert.match(core.traceSentence(quake), /not that the claim is independently verified/i);

const missingQuake = core.traceClaim({
  ...snapshot,
  feeds: { ...snapshot.feeds, earthquakes: false },
  earthquakes: { available: false, count: null }
}, 'earthquake-count');
assert.equal(missingQuake.complete, false);
assert.equal(missingQuake.value, null);
assert.ok(missingQuake.nodes.some((entry) => entry.type === 'source' && entry.state === 'missing'));
assert.match(core.traceSentence(missingQuake), /Trace open/i);

const weather = core.traceClaim(snapshot, 'weather-range');
assert.equal(weather.complete, true);
assert.equal(weather.value, '-4.0°C → 8.0°C');
assert.ok(weather.nodes.some((entry) => entry.type === 'derived' && /min\/max/i.test(entry.label)));
assert.ok(weather.nodes.some((entry) => entry.type === 'fixed'));
assert.ok(weather.nodes.some((entry) => entry.type === 'source' && /Open-Meteo/.test(entry.label)));
assert.ok(weather.edges.some((entry) => entry.from === 'normalized' && entry.to === 'fixed'));

const daylight = core.traceClaim(snapshot, 'daylight-count');
assert.equal(daylight.complete, true);
assert.match(daylight.value, /^\d+\/13 in daylight$/);
assert.ok(daylight.nodes.some((entry) => entry.type === 'local'));
assert.ok(daylight.nodes.some((entry) => entry.type === 'fixed'));
assert.equal(daylight.nodes.some((entry) => entry.type === 'source'), false,
  'local daylight geometry must not invent a public astronomy source');

const noTime = core.traceClaim({ ...snapshot, receivedAt: null }, 'daylight-count');
assert.equal(noTime.complete, false);
assert.equal(noTime.value, null);
assert.ok(noTime.nodes.some((entry) => entry.type === 'local' && entry.state === 'missing'));

const exposure = core.traceClaim(snapshot, 'exposure-farthest');
assert.equal(exposure.complete, true);
assert.match(exposure.value, /^≈ [\d,]+ km → Point \d{2}$/);
assert.ok(exposure.nodes.some((entry) => entry.id === 'search' && entry.type === 'derived'));
assert.ok(exposure.nodes.some((entry) => entry.type === 'normalized'));
assert.ok(exposure.nodes.some((entry) => entry.type === 'fixed'));
assert.ok(exposure.nodes.some((entry) => entry.type === 'source'));
assert.ok(exposure.edges.filter((entry) => entry.from === 'search').length >= 3,
  'Exposure trace should branch to geometry, current evidence, and fixed inputs');

const noWeather = core.traceClaim({
  ...snapshot,
  feeds: { ...snapshot.feeds, weather: false },
  weather: { ...snapshot.weather, available: false, availableCount: 0, minTemp: null, maxTemp: null,
    points: weatherPoints.map((point) => ({ ...point, available: false, temperature: null, wind: null, precipitation: null })) }
}, 'exposure-farthest');
assert.equal(noWeather.complete, false);
assert.equal(noWeather.value, null);
assert.ok(noWeather.nodes.some((entry) => entry.type === 'source' && entry.state === 'missing'));

assert.match(view, /museum:commons-snapshot/);
assert.match(view, /THE REVERSE LEDGER \/ EVERY CLAIM OWES A SOURCE/);
assert.match(view, /TRACE COMPLETE/);
assert.match(view, /TRACE OPEN/);
assert.match(view, /Traceability is not verification, confidence, quality, completeness, or truth/i);
assert.match(view, /data-reverse-ledger-styles/);
assert.match(view, /aria-pressed/);
assert.match(view, /aria-live/);
assert.doesNotMatch(view, /\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource/i);
assert.doesNotMatch(view, /setInterval|setTimeout|requestAnimationFrame|localStorage|sessionStorage|indexedDB|document\.cookie|navigator\.geolocation/i);
assert.doesNotMatch(view, /analytics|telemetry|https?:\/\//i);

for (const pattern of [
  /@media \(max-width: 760px\)/,
  /@media \(max-width: 620px\)/,
  /prefers-reduced-motion/,
  /prefers-contrast/,
  /@media print/,
  /min-height:\s*44px/,
  /:focus-visible/
]) assert.match(css, pattern);
assert.doesNotMatch(css, /@import\s+url|font-face|https?:\/\//i);

for (const pattern of [
  /Concept A/,
  /Concept B/,
  /Concept C/,
  /Concept A was discarded/,
  /The Reverse Ledger \/ Every Claim Owes a Source/,
  /zero runtime requests/i,
  /does not mean the claim is true/i,
  /LOCAL INPUT/,
  /TRACE COMPLETE/,
  /TRACE OPEN/
]) assert.match(record, pattern);

assert.match(loader, /exposure-plate\.js[\s\S]+reverse-ledger-core\.js[\s\S]+reverse-ledger\.js/,
  'Reverse Ledger should extend the current Commons chain after Exposure Plate');
for (const asset of ['./reverse-ledger-core.js', './reverse-ledger.js', './reverse-ledger.css', './REVERSE_LEDGER.md']) {
  assert.ok(worker.includes(`'${asset}'`), `offline shell should cache ${asset}`);
}

console.log('Reverse Ledger claim ancestry, missing-source behavior, local-vs-public inputs, branching dependencies, privacy, accessibility, and offline shell verified.');
