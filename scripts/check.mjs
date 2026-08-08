import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const require = createRequire(import.meta.url);

const requiredFiles = [
  'index.html', 'landing.css', 'commons-now.html', 'styles.css', 'sample-hold.css', 'sounding-well.css', 'world-map.css', 'world-map.svg', 'difference-engine.css', 'field-sheet.css',
  'cosmic-signal.js', 'cosmic-signal-core.js', 'cosmic-signal-view.js', 'cosmic-signal.css',
  'cosmic-latency-core.js', 'cosmic-latency.js', 'cosmic-latency.css',
  'cosmic-escapement-core.js', 'cosmic-escapement.js', 'cosmic-escapement.css',
  'planetary-heliodon-core.js', 'planetary-heliodon.js', 'planetary-heliodon.css',
  'COSMIC_RECEIVE_DESK.md', 'CELESTIAL_ESCAPEMENT.md', 'PLANETARY_HELIODON.md', 'SAMPLE_AND_HOLD.md', 'SOUNDING_WELL.md',
  'data-core.js', 'temporal-sounding-core.js', 'temporal-sounding.js', 'app.js', 'manifest.webmanifest', 'service-worker.js',
  'almost-online.html', 'web1.css', 'guestbook.css', 'web1.js', 'WEB1_HOME.md', 'GUESTBOOK_SECURITY.md',
  'guestbook-api/policy.mjs', 'guestbook-api/worker.mjs', 'guestbook-api/schema.sql', 'guestbook-api/migrations/0001_guestbook.sql', 'guestbook-api/wrangler.example.jsonc',
  'README.md', 'PRIVACY.md', 'SOURCES.md', 'REBUILD_LOG.md', 'RIGHTS.md', 'CONTRIBUTING.md',
  'scripts/test-data-core.mjs', 'scripts/test-temporal-sounding.mjs', 'scripts/test-cosmic-signal.mjs', 'scripts/test-cosmic-latency.mjs',
  'scripts/test-cosmic-escapement.mjs', 'scripts/test-planetary-heliodon.mjs', 'scripts/test-web1.mjs', 'scripts/test-guestbook-api.mjs', 'scripts/test-service-worker.mjs',
  'scripts/check.mjs', '.github/workflows/check.yml'
];
for (const file of requiredFiles) assert.ok(fs.existsSync(path.join(root, file)), `missing ${file}`);

const file = Object.fromEntries(requiredFiles.map((name) => [name, read(name)]));
const core = require('../data-core.js');
const runtimeFiles = [
  'index.html', 'landing.css', 'commons-now.html', 'styles.css', 'sample-hold.css', 'sounding-well.css', 'world-map.css', 'difference-engine.css', 'field-sheet.css',
  'cosmic-signal.js', 'cosmic-signal-core.js', 'cosmic-signal-view.js', 'cosmic-signal.css',
  'cosmic-latency-core.js', 'cosmic-latency.js', 'cosmic-latency.css',
  'cosmic-escapement-core.js', 'cosmic-escapement.js', 'cosmic-escapement.css',
  'planetary-heliodon-core.js', 'planetary-heliodon.js', 'planetary-heliodon.css',
  'data-core.js', 'temporal-sounding-core.js', 'temporal-sounding.js', 'app.js', 'service-worker.js'
];
const runtime = runtimeFiles.map((name) => file[name]).join('\n');
const publicCurrent = [
  'index.html', 'commons-now.html', 'data-core.js', 'temporal-sounding-core.js', 'temporal-sounding.js', 'app.js',
  'almost-online.html', 'web1.js', 'WEB1_HOME.md', 'GUESTBOOK_SECURITY.md', 'guestbook-api/policy.mjs', 'guestbook-api/worker.mjs',
  'README.md', 'PRIVACY.md', 'SOURCES.md', 'SAMPLE_AND_HOLD.md', 'SOUNDING_WELL.md', 'REBUILD_LOG.md', 'RIGHTS.md'
].map((name) => file[name]).join('\n');

function requirePatterns(source, patterns, label) {
  for (const pattern of patterns) assert.match(source, pattern, `${label}: missing ${pattern}`);
}
function forbidPatterns(source, patterns, label) {
  for (const pattern of patterns) assert.doesNotMatch(source, pattern, `${label}: forbidden ${pattern}`);
}

const allowedRuntimeUrls = [
  'https://api.open-meteo.com/v1/forecast',
  'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson',
  'https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=500',
  'https://services.swpc.noaa.gov/products/noaa-scales.json',
  'https://services.swpc.noaa.gov/products/summary/solar-wind-speed.json'
].sort();
const runtimeUrls = [...new Set(runtime.match(/https:\/\/[^\s"'`<>]+/g) || [])].sort();
assert.deepEqual(runtimeUrls, allowedRuntimeUrls, 'Commons runtime URLs must remain exactly the five approved requests across four services');
forbidPatterns(runtime, [
  /\b(XMLHttpRequest|sendBeacon|WebSocket|EventSource)\b/i,
  /\b(gtag|dataLayer|mixpanel|segment|plausible|amplitude|hotjar)\b/i,
  /google-analytics|googletagmanager|analytics\.js|facebook\.com\/tr|doubleclick/i
], 'runtime privacy boundary');
for (const documentSource of [file['index.html'], file['commons-now.html']]) {
  forbidPatterns(documentSource, [
    /<script[^>]+src=["'](?:https?:)?\/\//i,
    /<link[^>]+href=["'](?:https?:)?\/\//i,
    /<img[^>]+src=["'](?:https?:)?\/\//i,
    /<(input|textarea|select)\b|contenteditable/i,
    /<iframe\b/i
  ], 'static/Commons document boundary');
}

const landing = file['index.html'];
requirePatterns(landing, [
  /THE MUSEUM OF ALMOST/, /MUSEUM ENTRANCE/, /Choose what to stand beside\./,
  /COMMONS \/ NOW/, /DEEP SPACE \/ ALMOST/, /ALMOST ONLINE!/,
  /href="commons-now\.html"/, /href="deep-space\.html"/, /href="almost-online\.html"/, /href="landing\.css"/,
  /The world is doing this without us\./, /Nothing here is close\./, /Welcome to my homepage!!!/,
  /NO ACCOUNT · NO ANALYTICS · NO TRACKING/
], 'museum entrance');
forbidPatterns(landing, [/<script\b/i, /https?:\/\//i], 'museum entrance local-only boundary');

assert.equal(core.BUILD_SEED, '6bc76dc33337414e7c9f9ccbd7539976d98ac371444860c605fb88003174ded2');
assert.equal(core.STATIONS.length, 13);
assert.equal(new Set(core.STATIONS.map(({ id }) => id)).size, 13);
for (const station of core.STATIONS) {
  assert.ok(station.lat >= -90 && station.lat <= 90, `invalid latitude ${station.id}`);
  assert.ok(station.lon >= -180 && station.lon <= 180, `invalid longitude ${station.id}`);
}
for (const name of [
  'normalizeEarthquakes', 'normalizeSolarWind', 'normalizeWeather', 'normalizeEvents',
  'normalizeLongitude', 'solarGeometry', 'solarElevation', 'sunState', 'stationPosition',
  'greatCircleDistanceKm', 'observedRange', 'metricPosition', 'planetarySection',
  'compareStationPair', 'differenceSentence', 'snapshotSentence'
]) assert.equal(typeof core[name], 'function', `missing core export ${name}`);
assert.equal(core.solarGeometry(null), null, 'missing snapshot time must fail closed');
assert.equal(core.sunState(null, 0, 0), 'unknown', 'missing snapshot must never become a fabricated daylight state');

const index = file['commons-now.html'];
for (const id of [
  'refresh-button', 'connection-state', 'live-status', 'snapshot-time', 'source-count',
  'sample-hold-panel', 'sample-phase', 'sample-cycle', 'sample-status',
  'quake-count', 'quake-strongest', 'solar-wind', 'event-count', 'weather-range', 'world-sentence',
  'station-points', 'station-list', 'station-name', 'station-temperature', 'station-wind', 'station-rain', 'station-light',
  'patch-a', 'patch-b', 'difference-points', 'difference-readout', 'difference-scale',
  'planetary-section-plot', 'section-table-body', 'field-sheet-time', 'field-sheet-button'
]) assert.match(index, new RegExp(`id=["']${id}["']`), `missing interface id ${id}`);
requirePatterns(index, [
  /COMMONS \/ NOW/, /The world is doing this without us\./, /src="world-map\.svg"/,
  /Natural Earth 110m land, public domain/i, /THE SAMPLE-AND-HOLD BUS/, /One now, latched\./,
  /THE DIFFERENCE ENGINE/, /PLANETARY SECTION \/ FIELD SHEET/,
  /No connecting line\./, /native print dialog/i, /No account\. No location\. No visitor data\./i,
  /Four public services\. Five current feeds\./, /A fixed sample across the planet\./,
  /href="sample-hold\.css"/, /href="cosmic-signal\.css" data-cosmic-styles/, /href="cosmic-latency\.css" data-cosmic-latency-styles/,
  /href="cosmic-escapement\.css" data-celestial-escapement-styles/, /href="planetary-heliodon\.css" data-planetary-heliodon-styles/,
  /src="temporal-sounding-core\.js"[\s\S]+src="temporal-sounding\.js"[\s\S]+src="app\.js"/,
  /role="status"[^>]+aria-live="polite"/, /src="data-core\.js"/, /src="app\.js"/,
  /href="\.\/">Museum entrance<\/a>/, /href="deep-space\.html">Deep Space \/ Almost<\/a>/, /href="almost-online\.html">Almost Online!<\/a>/
], 'current document');

const map = file['world-map.svg'];
requirePatterns(map, [/viewBox="0 0 360 180"/, /Natural Earth 110m land geometry, public domain/i, /x = longitude \+ 180; y = 90 - latitude/, /<path\b/], 'map');
forbidPatterns(map, [/<script\b|SECB1