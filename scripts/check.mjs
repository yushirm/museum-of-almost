import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const require = createRequire(import.meta.url);

const requiredFiles = [
  'index.html', 'styles.css', 'sample-hold.css', 'sounding-well.css', 'world-map.css', 'world-map.svg', 'difference-engine.css', 'field-sheet.css',
  'cosmic-signal.js', 'cosmic-signal-core.js', 'cosmic-signal-view.js', 'cosmic-signal.css',
  'cosmic-latency-core.js', 'cosmic-latency.js', 'cosmic-latency.css',
  'cosmic-escapement-core.js', 'cosmic-escapement.js', 'cosmic-escapement.css',
  'planetary-heliodon-core.js', 'planetary-heliodon.js', 'planetary-heliodon.css',
  'COSMIC_RECEIVE_DESK.md', 'CELESTIAL_ESCAPEMENT.md', 'PLANETARY_HELIODON.md', 'SAMPLE_AND_HOLD.md', 'SOUNDING_WELL.md',
  'data-core.js', 'temporal-sounding-core.js', 'temporal-sounding.js', 'app.js', 'manifest.webmanifest', 'service-worker.js',
  'README.md', 'PRIVACY.md', 'SOURCES.md', 'REBUILD_LOG.md', 'RIGHTS.md', 'CONTRIBUTING.md',
  'scripts/test-data-core.mjs', 'scripts/test-temporal-sounding.mjs', 'scripts/test-cosmic-signal.mjs', 'scripts/test-cosmic-latency.mjs',
  'scripts/test-cosmic-escapement.mjs', 'scripts/test-planetary-heliodon.mjs', 'scripts/test-service-worker.mjs',
  'scripts/check.mjs', '.github/workflows/check.yml'
];
for (const file of requiredFiles) assert.ok(fs.existsSync(path.join(root, file)), `missing ${file}`);

const file = Object.fromEntries(requiredFiles.map((name) => [name, read(name)]));
const core = require('../data-core.js');
const runtimeFiles = [
  'index.html', 'styles.css', 'sample-hold.css', 'sounding-well.css', 'world-map.css', 'difference-engine.css', 'field-sheet.css',
  'cosmic-signal.js', 'cosmic-signal-core.js', 'cosmic-signal-view.js', 'cosmic-signal.css',
  'cosmic-latency-core.js', 'cosmic-latency.js', 'cosmic-latency.css',
  'cosmic-escapement-core.js', 'cosmic-escapement.js', 'cosmic-escapement.css',
  'planetary-heliodon-core.js', 'planetary-heliodon.js', 'planetary-heliodon.css',
  'data-core.js', 'temporal-sounding-core.js', 'temporal-sounding.js', 'app.js', 'service-worker.js'
];
const runtime = runtimeFiles.map((name) => file[name]).join('\n');
const publicCurrent = [
  'index.html', 'data-core.js', 'temporal-sounding-core.js', 'temporal-sounding.js', 'app.js',
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
assert.deepEqual(runtimeUrls, allowedRuntimeUrls, 'runtime URLs must remain exactly the five approved requests across four services');
forbidPatterns(runtime, [
  /\b(XMLHttpRequest|sendBeacon|WebSocket|EventSource)\b/i,
  /\b(gtag|dataLayer|mixpanel|segment|plausible|amplitude|hotjar)\b/i,
  /google-analytics|googletagmanager|analytics\.js|facebook\.com\/tr|doubleclick/i
], 'runtime privacy boundary');
forbidPatterns(file['index.html'], [
  /<script[^>]+src=["'](?:https?:)?\/\//i,
  /<link[^>]+href=["'](?:https?:)?\/\//i,
  /<img[^>]+src=["'](?:https?:)?\/\//i,
  /<(input|textarea|select)\b|contenteditable/i,
  /<iframe\b/i
], 'document boundary');

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

const index = file['index.html'];
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
  /role="status"[^>]+aria-live="polite"/, /src="data-core\.js"/, /src="app\.js"/
], 'current document');

const map = file['world-map.svg'];
requirePatterns(map, [/viewBox="0 0 360 180"/, /Natural Earth 110m land geometry, public domain/i, /x = longitude \+ 180; y = 90 - latitude/, /<path\b/], 'map');
forbidPatterns(map, [/<script\b|<foreignObject\b|\b(?:href|xlink:href)=["'](?:https?:)?\/\/|url\(\s*["']?https?:\/\//i], 'map');

const app = file['app.js'];
requirePatterns(app, [
  /Promise\.allSettled/, /SOURCES\.scales/, /museum:commons-snapshot/, /MuseumCommonsSnapshot/,
  /fetch\(url/, /credentials:\s*'omit'/, /referrerPolicy:\s*'no-referrer'/,
  /cache:\s*'no-store'/, /mode:\s*'cors'/, /AbortController/, /addEventListener\('click', refreshSnapshot\)/,
  /navigator\.serviceWorker\.register\('\.\/service-worker\.js'\)/, /function renderSampleAcquire\b/, /function renderSampleHold\b/,
  /function renderDifferenceEngine\b/, /function renderPlanetarySection\b/, /window\.print\(\)/
], 'application');
forbidPatterns(app, [/setInterval|requestAnimationFrame/i, /navigator\.geolocation|\bgeolocation\b/i, /localStorage|sessionStorage|indexedDB|document\.cookie/i], 'application');
requirePatterns(file['cosmic-signal-view.js'], [/museum:commons-snapshot/, /MuseumCommonsSnapshot/, /Latched with the shared snapshot/], 'Cosmic Signal shared latch');
forbidPatterns(file['cosmic-signal-view.js'], [/\bfetch\s*\(/], 'Cosmic Signal shared latch');

const sounding = [file['temporal-sounding-core.js'], file['temporal-sounding.js']].join('\n');
requirePatterns(sounding, [
  /museum:commons-snapshot/, /response\.clone\(\)\.json\(\)/, /channel !== 'events'/,
  /nativeFetch\(input, init\)/, /KNOWN SOURCE-TIME THICKNESS/, /feed-wide observation instant/i,
  /url\.protocol !== 'https:'/,
  /earthquake\.usgs\.gov/, /services\.swpc\.noaa\.gov/, /api\.open-meteo\.com/, /eonet\.gsfc\.nasa\.gov/
], 'Sounding Well passive observer');
forbidPatterns(sounding, [
  /\bfetch\s*\(/, /setInterval|requestAnimationFrame|localStorage|sessionStorage|indexedDB|document\.cookie|navigator\.geolocation/i,
  /sendBeacon|XMLHttpRequest|WebSocket|EventSource|analytics|telemetry/i,
  /https?:\/\//
], 'Sounding Well passive observer');

for (const styleName of ['styles.css', 'sample-hold.css', 'sounding-well.css', 'world-map.css', 'difference-engine.css', 'field-sheet.css', 'cosmic-signal.css', 'cosmic-latency.css', 'cosmic-escapement.css', 'planetary-heliodon.css']) {
  const css = file[styleName];
  assert.match(css, /@media/, `${styleName} must include responsive or environment handling`);
  forbidPatterns(css, [/@import\s+url|font-face|https?:\/\//i], styleName);
}
requirePatterns(file['styles.css'], [/min-height:\s*44px/, /:focus-visible/, /prefers-reduced-motion/, /prefers-contrast/], 'base accessibility');
requirePatterns(file['sample-hold.css'], [/max-width: 620px/, /prefers-reduced-motion/, /prefers-contrast/, /@media print/], 'sample-and-hold styles');
requirePatterns(file['sounding-well.css'], [/max-width: 620px/, /prefers-reduced-motion/, /prefers-contrast/, /@media print/], 'Sounding Well styles');
requirePatterns(file['field-sheet.css'], [/@media print/, /@page\s*\{\s*size:\s*landscape/], 'field sheet');
requirePatterns(file['planetary-heliodon.css'], [/max-width: 620px/, /prefers-reduced-motion/, /prefers-contrast/, /@media print/, /pointer-events:\s*none/], 'heliodon styles');

const localOnly = [
  ['cosmic-latency-core.js', 'cosmic-latency.js'],
  ['cosmic-escapement-core.js', 'cosmic-escapement.js'],
  ['planetary-heliodon-core.js', 'planetary-heliodon.js']
];
for (const pair of localOnly) {
  const source = pair.map((name) => file[name]).join('\n');
  forbidPatterns(source, [/\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource/i, /setInterval|setTimeout|requestAnimationFrame|localStorage|sessionStorage|indexedDB|document\.cookie|navigator\.geolocation/i], pair.join(' + '));
}
requirePatterns(file['cosmic-signal.js'], [/cosmic-latency-core\.js/, /cosmic-escapement-core\.js/, /planetary-heliodon-core\.js/, /planetary-heliodon\.js/], 'local module loader');
requirePatterns(file['cosmic-escapement.js'], [/MANY CLOCKS, ONE NOW/, /MutationObserver/], 'Celestial Escapement');
requirePatterns(file['planetary-heliodon.js'], [/THE PLANETARY HELIODON \/ EARTH CASTS THE NIGHT/, /MutationObserver/, /if \(!match\) return null/, /heliodon-field-strip/], 'Planetary Heliodon');
requirePatterns(file['planetary-heliodon-core.js'], [/terminatorCoordinates/, /terminatorParts/, /nightGridPath/, /solarGeometry/], 'Planetary Heliodon core');
requirePatterns(file['PLANETARY_HELIODON.md'], [/The world is doing this without us\./, /Concept C was discarded/, /no new runtime request/i, /solareqns\.PDF/], 'Planetary Heliodon record');
requirePatterns(file['SAMPLE_AND_HOLD.md'], [/Concept C was discarded/, /Promise\.allSettled/, /reject obsolete acquisition cycles/i], 'Sample-and-Hold record');
requirePatterns(file['SOUNDING_WELL.md'], [
  /Concept A/, /Concept B/, /Concept C/, /Concept A was discarded/, /The Sounding Well \/ The Thickness of Now/,
  /adds no request/i, /feed-wide observation timestamp/i, /response metadata/i,
  /https:\/\/open-meteo\.com\/en\/docs/, /https:\/\/eonet\.gsfc\.nasa\.gov\/docs\/v3/
], 'Sounding Well record');

const worker = file['service-worker.js'];
requirePatterns(worker, [
  /PREVIOUS_CACHE_NAME = 'museum-of-almost-commons-now-v10-front-page-polish'/,
  /CACHE_NAME = 'museum-of-almost-commons-now-v11-sample-and-hold'/,
  /ACTIVE_CACHE_NAME = 'museum-of-almost-commons-now-v12-thickness-of-now'/,
  /url\.origin !== self\.location\.origin/, /caches\.match\('\.\/index\.html'\)/,
  /clients\.matchAll\(\{ type: 'window', includeUncontrolled: true \}\)/, /client\.navigate\(client\.url\)/
], 'service worker');
forbidPatterns(worker, [/https?:\/\//], 'service worker cross-origin boundary');
for (const asset of [
  './index.html', './styles.css', './sample-hold.css', './sounding-well.css', './world-map.svg',
  './temporal-sounding-core.js', './temporal-sounding.js', './SOUNDING_WELL.md', './SAMPLE_AND_HOLD.md',
  './cosmic-signal.js', './cosmic-signal-core.js', './cosmic-latency-core.js', './cosmic-escapement-core.js',
  './planetary-heliodon-core.js', './planetary-heliodon.js', './planetary-heliodon.css', './PLANETARY_HELIODON.md',
  './data-core.js', './app.js', './SOURCES.md', './PRIVACY.md'
]) assert.ok(worker.includes(`'${asset}'`), `offline shell missing ${asset}`);

const readme = file['README.md'];
requirePatterns(readme, [
  /COMMONS \/ NOW/, /https:\/\/yushirm\.github\.io\/museum-of-almost\//, /one current snapshot/i,
  /Sounding Well/i, /source-time thickness/i, /EONET is deliberately left unsounded/i,
  /thirteen fixed coordinates/i, /Natural Earth 110m public-domain land geometry/i, /Difference Engine/i,
  /Planetary Section/i, /Planetary Heliodon/i, /subsolar point/i, /does not interpolate/i,
  /Make field sheet/i, /no visitor persistence/i, /original opaque seed inputs are deliberately not stored/i
], 'README');
const privacy = file['PRIVACY.md'];
requirePatterns(privacy, [
  /does not create visitor accounts, profiles, histories, scores, identifiers/i, /does not.*request browser geolocation/is,
  /localStorage/, /five direct HTTP requests across four public services/i, /credentials: omit/, /referrerPolicy: no-referrer/,
  /IP address/i, /Sounding Well/, /adds no network request/i, /does not store sounding history/i,
  /thirteen fixed latitude\/longitude pairs/i, /native browser print/i, /Planetary Heliodon/
], 'privacy record');
const sources = file['SOURCES.md'];
for (const url of allowedRuntimeUrls) assert.ok(sources.includes(url), `SOURCES.md missing ${url}`);
requirePatterns(sources, [
  /USGS/i, /NOAA/i, /Open-Meteo/i, /NASA/i, /Sounding Well/i, /metadata\.generated/,
  /event geometry/i, /source-time/i, /Natural Earth 110m land geometry/i, /public domain/i,
  /Planetary Heliodon local solar geometry/i, /solareqns\.PDF/
], 'sources');
const rebuild = file['REBUILD_LOG.md'];
requirePatterns(rebuild, [
  /Reset 1 — COMMONS \/ NOW/, /Extension 1 — The Difference Engine/, /Extension 2 — Thirteen Windows Get a World/,
  /Extension 3 — The Planetary Section \/ Field Sheet/, /Extension 6 — The Planetary Heliodon \/ Earth Casts the Night/,
  /Half of it is always turning into night\./, /missing source values remain unavailable and must never coerce to numeric zero/i,
  /current application stores no visitor state at all/i
], 'rebuild record');
requirePatterns(file['RIGHTS.md'], [/world-map\.svg/, /Natural Earth 110m geographic data/i, /public domain/i], 'rights');

const manifest = JSON.parse(file['manifest.webmanifest']);
assert.equal(manifest.start_url, './');
assert.equal(manifest.scope, './');
assert.equal(manifest.display, 'standalone');
assert.match(manifest.name, /Commons \/ Now/i);
const workflow = file['.github/workflows/check.yml'];
requirePatterns(workflow, [
  /jobs:\s*\n\s*check:/, /permissions:\s*\n\s*contents: read/, /persist-credentials: false/, /timeout-minutes: 5/,
  /actions\/checkout@[0-9a-f]{40}/, /actions\/setup-node@[0-9a-f]{40}/,
  /node scripts\/test-data-core\.mjs/, /node scripts\/test-temporal-sounding\.mjs/,
  /node scripts\/test-planetary-heliodon\.mjs/, /node scripts\/test-service-worker\.mjs/, /node scripts\/check\.mjs/
], 'workflow');

forbidPatterns(publicCurrent, [
  /\b[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i,
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  /\bAKIA[0-9A-Z]{16}\b/, /\bsk-(?:proj-)?[A-Za-z0-9_-]{16,}\b/i,
  /BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY/, /password\s*[:=]\s*["'][^"']+["']/i,
  /\/Users\/|\/home\/[A-Za-z0-9._-]+|C:\\Users\\/i
], 'public secret/privacy scan');

console.log('Commons / Now full application, shared five-feed latch, passive source-time Sounding Well, privacy, exact-network, local-map, cosmic instruments, Planetary Heliodon, coherent-shell, accessibility, source, seed, and offline contract verified.');
