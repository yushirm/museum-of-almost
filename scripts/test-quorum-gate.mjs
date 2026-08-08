import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const core = require('../quorum-gate-core.js');
const coreSource = fs.readFileSync(new URL('../quorum-gate-core.js', import.meta.url), 'utf8');
const view = fs.readFileSync(new URL('../quorum-gate.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../quorum-gate.css', import.meta.url), 'utf8');
const record = fs.readFileSync(new URL('../QUORUM_GATE.md', import.meta.url), 'utf8');
const loader = fs.readFileSync(new URL('../cosmic-signal.js', import.meta.url), 'utf8');
const dataCore = fs.readFileSync(new URL('../data-core.js', import.meta.url), 'utf8');
const app = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const worker = fs.readFileSync(new URL('../service-worker.js', import.meta.url), 'utf8');
const runtime = `${coreSource}\n${view}\n${css}`;

assert.deepEqual(core.CASES.map(({ id }) => id), ['precipitation', 'feeds', 'earthquakes', 'events']);
assert.equal(core.finite(null), null, 'missing must not become zero');
assert.equal(core.finite(0), 0, 'real zero must remain finite');
assert.equal(core.sharePercent(0, 5), 0, 'zero numerator with a positive denominator is a real zero percent');
assert.equal(core.sharePercent(1, 0), null, 'zero denominator must refuse a percentage');
assert.equal(core.sharePercent(6, 5), null, 'numerator larger than denominator must refuse subset percentage');

const weatherPoints = Array.from({ length: 13 }, (_, index) => ({
  id: String(index + 1).padStart(2, '0'),
  temperature: index + 1,
  wind: 10 + index,
  precipitation: index < 8 ? ([0.2, 0, 1.5, null, 0, 2.2, 0, 0.4][index]) : null,
  available: true
}));

const snapshot = {
  receivedAt: new Date('2026-08-08T16:00:00.000Z'),
  earthquakes: { available: true, count: 9, strongest: 5.1, meanDepth: 22.4, significant: 2 },
  solar: { available: true, speed: 420, state: 'steady' },
  scales: { available: true, value: {} },
  weather: {
    available: true,
    points: weatherPoints,
    availableCount: 13,
    minTemp: 1,
    maxTemp: 13,
    meanWind: 16,
    maxWind: 22,
    raining: 4
  },
  events: {
    available: true,
    count: 100,
    capped: false,
    categories: [
      { title: 'Wildfires', count: 25 },
      { title: 'Severe Storms', count: 18 }
    ]
  },
  feeds: { earthquakes: true, solar: true, scales: false, weather: true, events: true }
};

const precipitation = core.buildCase(snapshot, 'precipitation');
assert.equal(precipitation.waiting, false);
assert.equal(precipitation.numerator, 4);
assert.equal(precipitation.denominator, 7, 'only finite precipitation values belong in the denominator');
assert.equal(precipitation.percent, 57.1);
assert.equal(precipitation.canPercent, true);
assert.equal(precipitation.verdict, 'QUORUM VERIFIED');
assert.equal(precipitation.partition, 'allowed');
assert.match(precipitation.scope, /not geographic rainfall coverage/i);
assert.match(precipitation.pieReason, /not expanded into a complete dry-weather claim/i);

const precipDrift = core.buildCase({
  ...snapshot,
  weather: { ...snapshot.weather, raining: 3 }
}, 'precipitation');
assert.equal(precipDrift.canPercent, false);
assert.equal(precipDrift.verdict, 'CONTRACT DRIFT');
assert.equal(precipDrift.partition, 'refused');

const noPrecip = core.buildCase({
  ...snapshot,
  weather: {
    ...snapshot.weather,
    points: weatherPoints.map((point) => ({ ...point, precipitation: null })),
    raining: 0
  }
}, 'precipitation');
assert.equal(noPrecip.denominator, 0);
assert.equal(noPrecip.canPercent, false);
assert.equal(noPrecip.verdict, 'NO EVALUABLE POPULATION');

const feeds = core.buildCase(snapshot, 'feeds');
assert.equal(feeds.numerator, 4);
assert.equal(feeds.denominator, 5);
assert.equal(feeds.percent, 80);
assert.equal(feeds.canPercent, true);
assert.equal(feeds.partition, 'allowed');
assert.match(feeds.scope, /five fixed channels/i);
assert.match(feeds.scope, /not world completeness or source quality/i);

const zeroFeeds = core.buildCase({ ...snapshot, feeds: { earthquakes: false, solar: false, scales: false, weather: false, events: false } }, 'feeds');
assert.equal(zeroFeeds.percent, 0);
assert.equal(zeroFeeds.verdict, 'QUORUM VERIFIED');

const earthquakes = core.buildCase(snapshot, 'earthquakes');
assert.equal(earthquakes.numerator, 2);
assert.equal(earthquakes.denominator, null);
assert.equal(earthquakes.canPercent, false);
assert.equal(earthquakes.verdict, 'DENOMINATOR LOST');
assert.equal(earthquakes.partition, 'refused');
assert.equal(earthquakes.detail.totalEarthquakeFeatures, 9);
assert.match(core.summarySentence(earthquakes, true), /NO DENOMINATOR\. NO PERCENT\./i);

const events = core.buildCase(snapshot, 'events');
assert.equal(events.numerator, 25);
assert.equal(events.denominator, 100);
assert.equal(events.percent, 25);
assert.equal(events.canPercent, true);
assert.equal(events.partition, 'refused', 'individual membership share must not authorize a pie partition');
assert.equal(events.verdict, 'QUORUM VERIFIED · MEMBERSHIP ONLY');
assert.match(events.pieReason, /MEMBERSHIP SHARE ALLOWED\. PIE CHART REFUSED\./);
assert.equal(events.detail.categoryTitle, 'Wildfires');

const cappedEvents = core.buildCase({
  ...snapshot,
  events: { ...snapshot.events, count: 500, capped: true, categories: [{ title: 'Wildfires', count: 125 }] }
}, 'events');
assert.equal(cappedEvents.percent, 25);
assert.equal(cappedEvents.verdict, 'WINDOWED QUORUM');
assert.match(cappedEvents.scope, /capped at 500 events/i);
assert.match(cappedEvents.scope, /not all open events/i);

const badEvents = core.buildCase({
  ...snapshot,
  events: { ...snapshot.events, count: 10, categories: [{ title: 'Wildfires', count: 11 }] }
}, 'events');
assert.equal(badEvents.canPercent, false);
assert.equal(badEvents.verdict, 'CONTRACT DRIFT');

const zeroEvents = core.buildCase({
  ...snapshot,
  events: { ...snapshot.events, count: 0, categories: [] }
}, 'events');
assert.equal(zeroEvents.canPercent, false);
assert.equal(zeroEvents.verdict, 'NO EVALUABLE POPULATION');

const waiting = core.buildCase({ ...snapshot, receivedAt: null }, 'precipitation');
assert.equal(waiting.waiting, true);
assert.equal(waiting.canAsk, false);
assert.match(core.summarySentence(waiting, false), /Waiting for the first real Commons latch/i);

for (const pattern of [
  /const quakes = features\.filter\(\(feature\) => feature\?\.properties\?\.type === 'earthquake'\)/,
  /const magnitudes = quakes[\s\S]+\.filter\(Number\.isFinite\)[\s\S]+\.map\(\(value\) => clamp\(value, -2, 10\)\)/,
  /count: quakes\.length/,
  /significant: magnitudes\.filter\(\(value\) => value >= 4\.5\)\.length/,
  /const raining = availablePoints\.filter\(\(point\) => Number\.isFinite\(point\.precipitation\) && point\.precipitation > 0\)\.length/,
  /categoryCounts\.set\(title, \(categoryCounts\.get\(title\) \|\| 0\) \+ 1\)/,
  /\.slice\(0, 5\)/,
  /capped: events\.length >= 500/
]) assert.match(dataCore, pattern, `Quorum Gate must stay pinned to canonical reducer declaration ${pattern}`);

assert.match(app, /events: 'https:\/\/eonet\.gsfc\.nasa\.gov\/api\/v3\/events\?status=open&limit=500'/,
  'EONET returned-window scope must stay pinned to the fixed 500-event request limit');
assert.match(app, /feeds:\s*\{\s*earthquakes:[\s\S]+solar:[\s\S]+scales:[\s\S]+weather:[\s\S]+events:/,
  'feed-return denominator must remain the fixed five requested channels');

for (const pattern of [
  /THE QUORUM GATE \/ THE PIE REFUSES TO CLOSE/,
  /A count is not yet a percentage\./,
  /MAKE IT A PERCENT/,
  /RESTORE COUNTS/,
  /NO DENOMINATOR\. NO PERCENT\./,
  /PIE CHART REFUSED/,
  /field-sheet-quorum-gate/,
  /aria-pressed/,
  /aria-live/,
  /const SNAPSHOT_EVENT = 'museum:commons-snapshot'/,
  /document\.addEventListener\(SNAPSHOT_EVENT,[\s\S]+activeCase = 'precipitation';[\s\S]+asked = false;[\s\S]+render\(\)/
]) assert.match(view, pattern);

assert.match(loader, /shuffle-table-core\.js[\s\S]+shuffle-table\.js[\s\S]+quorum-gate-core\.js[\s\S]+quorum-gate\.js/,
  'Quorum Gate should extend the progressive Commons chain after Shuffle Table');

assert.doesNotMatch(runtime, /\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource/i);
assert.doesNotMatch(runtime, /setInterval|setTimeout|requestAnimationFrame|localStorage|sessionStorage|indexedDB|document\.cookie|navigator\.geolocation|history\.(?:pushState|replaceState)/i);
assert.doesNotMatch(runtime, /\b(?:gtag|dataLayer|mixpanel|amplitude|hotjar)\b|plausible\.io|window\.plausible|google-analytics|googletagmanager|facebook\.com\/tr|doubleclick/i);
assert.doesNotMatch(runtime, /https?:\/\//i);
assert.doesNotMatch(runtime, /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i);
assert.doesNotMatch(runtime, /\bAKIA[0-9A-Z]{16}\b|\bsk-(?:proj-)?[A-Za-z0-9_-]{16,}\b|BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY/i);
assert.doesNotMatch(runtime, /\/Users\/|\/home\/[A-Za-z0-9._-]+|C:\\Users\\/i);

for (const pattern of [
  /min-height:\s*44px/,
  /:focus-visible/,
  /@media \(max-width: 760px\)/,
  /@media \(max-width: 620px\)/,
  /prefers-reduced-motion/,
  /prefers-contrast/,
  /@media print/,
  /\.quorum-gate-section\s*\{\s*display:\s*none !important/
]) assert.match(css, pattern);
assert.doesNotMatch(css, /@import\s+url|font-face|https?:\/\//i);

for (const pattern of [
  /Concept A — The Ratio Ledger/,
  /Concept B — The Quorum Gate/,
  /Concept C — The Pie Refuses to Close/,
  /Concept A was discarded/,
  /Concepts B and C became \*\*The Quorum Gate \/ The Pie Refuses to Close\*\*/,
  /NO DENOMINATOR\. NO PERCENT\./,
  /AN ALLOWED INDIVIDUAL SHARE DOES NOT AUTOMATICALLY AUTHORIZE A PIE PARTITION/,
  /This denominator is intentionally \*\*not\*\* `weather\.availableCount`/,
  /DENOMINATOR LOST/,
  /WINDOWED QUORUM/,
  /MEMBERSHIP SHARE ALLOWED\. PIE CHART REFUSED\./,
  /Require the feature-complete head to pass the required `check`[\s\S]+archive-bearing head to pass `check` again before merge/
]) assert.match(record, pattern);

for (const asset of ['./quorum-gate-core.js', './quorum-gate.js', './quorum-gate.css', './QUORUM_GATE.md']) {
  assert.ok(worker.includes(`'${asset}'`), `offline shell should cache ${asset}`);
}
assert.match(worker, /const SHUFFLE_TABLE_CACHE_NAME = 'museum-of-almost-v37-shuffle-table'/);
assert.match(worker, /const CURRENT_CACHE_NAME = 'museum-of-almost-v38-quorum-gate'/);

console.log('Quorum Gate denominator retention, subset membership, returned-window scope, partition refusal, accessibility, privacy, loader, and offline contracts verified.');
