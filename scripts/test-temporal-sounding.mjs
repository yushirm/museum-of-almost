import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const core = require('../temporal-sounding-core.js');
const coreSource = fs.readFileSync(new URL('../temporal-sounding-core.js', import.meta.url), 'utf8');
const viewSource = fs.readFileSync(new URL('../temporal-sounding.js', import.meta.url), 'utf8');
const styleSource = fs.readFileSync(new URL('../sounding-well.css', import.meta.url), 'utf8');
const indexSource = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const source = [coreSource, viewSource].join('\n');

assert.equal(core.parseUtcTimestamp('2026-08-07 19:00:00'), Date.parse('2026-08-07T19:00:00Z'));
assert.equal(core.parseUtcTimestamp('2026-08-07T19:00:00Z'), Date.parse('2026-08-07T19:00:00Z'));
assert.equal(core.parseUtcTimestamp(1786129200000), 1786129200000);
assert.equal(core.parseUtcTimestamp(null), null);

assert.equal(
  core.solarWindTimestamp({ TimeStamp: '2026-08-07T18:59:30Z', SolarWindSpeed: '490' }),
  Date.parse('2026-08-07T18:59:30Z')
);
assert.equal(
  core.solarWindTimestamp([['time_tag', 'speed'], ['2026-08-07 18:58:00', '480'], ['2026-08-07 18:59:00', '490']]),
  Date.parse('2026-08-07T18:59:00Z')
);
assert.equal(
  core.scalesTimestamp({ '0': { DateStamp: '2026-08-07', TimeStamp: '18:57:00', G: { Scale: '1' } } }),
  Date.parse('2026-08-07T18:57:00Z')
);

const latch = '2026-08-07T19:00:00Z';
const sounding = core.deriveSounding({
  earthquakes: { answered: true, payload: { metadata: { generated: Date.parse('2026-08-07T18:59:40Z') } } },
  solar: { answered: true, payload: { TimeStamp: '2026-08-07T18:59:30Z', SolarWindSpeed: '490' } },
  scales: { answered: true, payload: { '0': { DateStamp: '2026-08-07', TimeStamp: '18:57:00' } } },
  weather: {
    answered: true,
    payload: [
      { current: { time: '2026-08-07T18:45', temperature_2m: 10 } },
      { current: { time: '2026-08-07T18:45', temperature_2m: 12 } }
    ]
  },
  events: { answered: true, payload: null }
}, latch);

assert.equal(sounding.available, true);
assert.equal(sounding.comparableCount, 4);
assert.equal(sounding.thicknessMs, 15 * 60 * 1000);
assert.equal(sounding.readings.find((reading) => reading.id === 'earthquakes').ageMs, 20 * 1000);
assert.equal(sounding.readings.find((reading) => reading.id === 'solar').ageMs, 30 * 1000);
assert.equal(sounding.readings.find((reading) => reading.id === 'scales').ageMs, 3 * 60 * 1000);
assert.equal(sounding.readings.find((reading) => reading.id === 'weather').sampleCount, 2);
assert.equal(sounding.readings.find((reading) => reading.id === 'events').state, 'incomparable');
assert.match(sounding.readings.find((reading) => reading.id === 'events').semantic, /not a feed-wide observation time/i);

const missing = core.deriveSounding({
  earthquakes: { answered: false, payload: null },
  solar: { answered: true, payload: { SolarWindSpeed: 450 } },
  scales: { answered: false, payload: null },
  weather: { answered: true, payload: [{ current: { temperature_2m: 5 } }] },
  events: { answered: false, payload: null }
}, latch);
assert.equal(missing.available, false);
assert.equal(missing.readings.find((reading) => reading.id === 'solar').state, 'timestamp-unavailable');
assert.equal(missing.readings.find((reading) => reading.id === 'events').state, 'unavailable');

const ahead = core.deriveSounding({
  earthquakes: { answered: true, payload: { metadata: { generated: Date.parse('2026-08-07T19:00:10Z') } } }
}, latch);
assert.equal(ahead.readings[0].state, 'ahead');
assert.equal(ahead.readings[0].ageMs, -10 * 1000);
assert.equal(ahead.thicknessMs, 0);
assert.equal(core.formatDuration(-10 * 1000), '10 seconds ahead of latch');
assert.equal(core.formatDuration(65 * 1000), '1m 5s');

const noLatch = core.deriveSounding({
  earthquakes: { answered: true, payload: { metadata: { generated: Date.parse('2026-08-07T18:59:40Z') } } }
}, null);
assert.equal(noLatch.available, false);
assert.equal(noLatch.readings[0].ageMs, null);

assert.match(indexSource, /src="temporal-sounding-core\.js"[\s\S]+src="temporal-sounding\.js"[\s\S]+src="app\.js"/,
  'observer must load before app.js so it sees the existing acquisition without issuing its own request');
assert.match(viewSource, /museum:commons-snapshot/);
assert.match(viewSource, /response\.clone\(\)\.json\(\)/);
assert.match(viewSource, /channel !== 'events'/);
assert.match(viewSource, /nativeFetch\(input, init\)/);
assert.doesNotMatch(viewSource, /\bfetch\s*\(/, 'observer must not initiate an additional fetch call');
assert.match(viewSource, /feed-wide observation instant/i);
assert.match(viewSource, /KNOWN SOURCE-TIME THICKNESS/);
assert.match(viewSource, /url\.protocol !== 'https:'/);
for (const hostname of [
  'earthquake.usgs.gov',
  'services.swpc.noaa.gov',
  'api.open-meteo.com',
  'eonet.gsfc.nasa.gov'
]) assert.ok(viewSource.includes(`'${hostname}'`), `observer should recognize ${hostname}`);
for (const path of [
  '/earthquakes/feed/v1.0/summary/all_hour.geojson',
  '/products/summary/solar-wind-speed.json',
  '/products/noaa-scales.json',
  '/v1/forecast',
  '/api/v3/events'
]) assert.ok(viewSource.includes(`'${path}'`), `observer should recognize ${path}`);
assert.doesNotMatch(source, /https?:\/\//, 'observer should recognize existing hosts without introducing additional runtime URL literals');
assert.doesNotMatch(source, /setInterval|requestAnimationFrame|localStorage|sessionStorage|indexedDB|document\.cookie|navigator\.geolocation/i);
assert.doesNotMatch(source, /sendBeacon|XMLHttpRequest|WebSocket|EventSource|analytics|telemetry|dataLayer|gtag/i);
assert.doesNotMatch(source, /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i);
assert.doesNotMatch(source, /\bAKIA[0-9A-Z]{16}\b|\bsk-(?:proj-)?[A-Za-z0-9_-]{16,}\b|BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY/i);
assert.doesNotMatch(source, /\/Users\/|\/home\/[A-Za-z0-9._-]+|C:\\Users\\/i);

assert.match(styleSource, /@media \(max-width: 620px\)/);
assert.match(styleSource, /@media \(prefers-reduced-motion: reduce\)/);
assert.match(styleSource, /@media \(prefers-contrast: more\)/);
assert.match(styleSource, /@media print/);
assert.doesNotMatch(styleSource, /@import\s+url|font-face|https?:\/\//i);

console.log('Temporal timestamp parsing, known source-time thickness, incomparable EONET handling, passive fetch observation, exact hostname/path boundary, load order, privacy, and accessibility verified.');
