import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const require = createRequire(import.meta.url);

for (const file of [
  'index.html',
  'styles.css',
  'world-map.css',
  'world-map.svg',
  'difference-engine.css',
  'data-core.js',
  'app.js',
  'manifest.webmanifest',
  'service-worker.js',
  'README.md',
  'PRIVACY.md',
  'SOURCES.md',
  'REBUILD_LOG.md',
  'RIGHTS.md',
  'CONTRIBUTING.md',
  'scripts/test-data-core.mjs',
  'scripts/test-service-worker.mjs',
  'scripts/check.mjs',
  '.github/workflows/check.yml'
]) {
  assert.ok(fs.existsSync(path.join(root, file)), `missing ${file}`);
}

const index = read('index.html');
const styles = read('styles.css');
const mapStyles = read('world-map.css');
const worldMap = read('world-map.svg');
const differenceStyles = read('difference-engine.css');
const coreSource = read('data-core.js');
const app = read('app.js');
const worker = read('service-worker.js');
const readme = read('README.md');
const privacy = read('PRIVACY.md');
const sources = read('SOURCES.md');
const rebuild = read('REBUILD_LOG.md');
const rights = read('RIGHTS.md');
const manifest = read('manifest.webmanifest');
const workflow = read('.github/workflows/check.yml');
const runtime = [index, styles, mapStyles, differenceStyles, coreSource, app, worker].join('\n');
const publicCurrent = [index, coreSource, app, readme, privacy, sources, rebuild, rights].join('\n');
const core = require('../data-core.js');

const allowedRuntimeUrls = [
  'https://api.open-meteo.com/v1/forecast',
  'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson',
  'https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=500',
  'https://services.swpc.noaa.gov/products/summary/solar-wind-speed.json'
].sort();
const runtimeUrls = [...new Set(runtime.match(/https:\/\/[^\s"'`<>]+/g) || [])].sort();
assert.deepEqual(runtimeUrls, allowedRuntimeUrls, 'runtime network origins must stay limited to the four approved public data endpoints');

assert.doesNotMatch(runtime, /\b(XMLHttpRequest|sendBeacon|WebSocket|EventSource)\b/i);
assert.doesNotMatch(runtime, /\b(gtag|dataLayer|mixpanel|segment|plausible|amplitude|hotjar)\b/i);
assert.doesNotMatch(runtime, /google-analytics|googletagmanager|analytics\.js|facebook\.com\/tr|doubleclick/i);
assert.doesNotMatch(index, /<script[^>]+src=["'](?:https?:)?\/\//i);
assert.doesNotMatch(index, /<link[^>]+href=["'](?:https?:)?\/\//i);
assert.doesNotMatch(index, /<img[^>]+src=["'](?:https?:)?\/\//i);
assert.doesNotMatch(index, /<(input|textarea|select)\b|contenteditable/i, 'visitor free text and form collection are prohibited');
assert.doesNotMatch(index, /<iframe\b/i);

assert.equal(core.BUILD_SEED, '6bc76dc33337414e7c9f9ccbd7539976d98ac371444860c605fb88003174ded2');
assert.equal(core.STATIONS.length, 13, 'the opaque transmission must resolve to exactly thirteen fixed world points');
assert.equal(new Set(core.STATIONS.map((station) => station.id)).size, 13, 'station identifiers must be unique');
for (const station of core.STATIONS) {
  assert.ok(station.lat >= -90 && station.lat <= 90, `invalid latitude for station ${station.id}`);
  assert.ok(station.lon >= -180 && station.lon <= 180, `invalid longitude for station ${station.id}`);
}

for (const id of [
  'refresh-button', 'connection-state', 'live-status', 'snapshot-time', 'source-count',
  'quake-count', 'quake-strongest', 'solar-wind', 'event-count', 'weather-range',
  'world-sentence', 'station-points', 'station-list', 'station-name', 'station-temperature',
  'station-wind', 'station-rain', 'station-light', 'event-categories', 'daylight-count',
  'patch-a', 'patch-b', 'difference-points', 'patch-help', 'difference-readout',
  'difference-scale', 'difference-scale-label', 'difference-marker-a', 'difference-marker-b',
  'difference-distance', 'difference-temperature', 'difference-wind', 'difference-rain', 'difference-light'
]) {
  assert.match(index, new RegExp(`id=["']${id}["']`), `missing Commons / Now interface id: ${id}`);
}
assert.match(index, /COMMONS \/ NOW/);
assert.match(index, /The world is doing this without us\./);
assert.match(index, /Equirectangular world map with thirteen fixed global weather points/);
assert.match(index, /src="world-map\.svg"/);
assert.match(index, /href="world-map\.css"/);
assert.match(index, /Natural Earth 110m land, public domain/i);
assert.match(index, /No map or tile service is contacted/i);
assert.match(index, /THE DIFFERENCE ENGINE/);
assert.match(index, /How different can the same planet be at the same moment\?/);
assert.match(index, /makes no additional network request/i);
assert.match(index, /WHAT THIS ACTUALLY DOES/);
assert.match(index, /No account\. No location\. No visitor data\./i);
assert.match(index, /Weather data: Open-Meteo/i);
assert.match(index, /role="status"[^>]+aria-live="polite"/);
assert.match(index, /role="group"[^>]+aria-label="Thirteen fixed global weather points"/);
assert.match(index, /role="group"[^>]+aria-label="Choose a comparison lens"/);
assert.match(index, /aria-live="polite"/);
assert.match(index, /href="SOURCES\.md"/);
assert.match(index, /href="PRIVACY\.md"/);
assert.match(index, /href="difference-engine\.css"/);
assert.match(index, /src="data-core\.js"/);
assert.match(index, /src="app\.js"/);

assert.match(worldMap, /viewBox="0 0 360 180"/);
assert.match(worldMap, /Natural Earth 110m land geometry, public domain/i);
assert.match(worldMap, /x = longitude \+ 180; y = 90 - latitude/);
assert.match(worldMap, /<path\b/);
assert.doesNotMatch(worldMap, /<script\b|<foreignObject\b|\bhref=|https?:\/\//i, 'local map asset must be inert and self-contained');

assert.match(mapStyles, /\.world-map-image/);
assert.match(mapStyles, /aspect-ratio:\s*2\s*\/\s*1/);
assert.match(mapStyles, /object-fit:\s*fill/);
assert.match(mapStyles, /@media \(max-width: 620px\)/);
assert.match(mapStyles, /@media print/);
assert.doesNotMatch(mapStyles, /@import\s+url|font-face|https?:\/\//i);

assert.match(app, /Promise\.allSettled/);
assert.match(app, /fetch\(url/);
assert.match(app, /credentials:\s*'omit'/);
assert.match(app, /referrerPolicy:\s*'no-referrer'/);
assert.match(app, /cache:\s*'no-store'/);
assert.match(app, /mode:\s*'cors'/);
assert.match(app, /AbortController/);
assert.match(app, /renderSnapshot\(\);\s*refreshSnapshot\(\);/);
assert.match(app, /addEventListener\('click', refreshSnapshot\)/);
assert.match(app, /navigator\.serviceWorker\.register\('\.\/service-worker\.js'\)/);
assert.match(app, /comparisonAId = '01'/);
assert.match(app, /comparisonBId = '09'/);
assert.match(app, /function patchComparisonPoint\b/);
assert.match(app, /function renderDifferenceEngine\b/);
assert.match(app, /function renderDifferenceScale\b/);
assert.doesNotMatch(app, /setInterval|requestAnimationFrame/i, 'live public data must not poll or run a data animation loop');
assert.doesNotMatch(app, /navigator\.geolocation|\bgeolocation\b/i);
assert.doesNotMatch(app, /localStorage|sessionStorage|indexedDB|document\.cookie/i, 'visitor state must not be persisted');

for (const functionName of [
  'normalizeEarthquakes', 'normalizeSolarWind', 'normalizeWeather', 'normalizeEvents',
  'sunState', 'stationPosition', 'greatCircleDistanceKm', 'observedRange', 'metricPosition',
  'compareStationPair', 'differenceSentence', 'snapshotSentence'
]) {
  assert.match(coreSource, new RegExp(`function ${functionName}\\b`), `missing data-core function: ${functionName}`);
}
assert.doesNotMatch(coreSource, /localStorage|sessionStorage|indexedDB|document\.cookie|navigator\.geolocation/i);
assert.match(coreSource, /typeof pointA\?\.temperature === 'number'/, 'missing weather values must not coerce to numeric zero');

assert.match(styles, /min-height:\s*44px/);
assert.match(styles, /:focus-visible/);
assert.match(styles, /@media \(max-width: 620px\)/);
assert.match(styles, /@media \(max-width: 380px\)/);
assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
assert.match(styles, /@media \(prefers-contrast: more\)/);
assert.match(styles, /@media print/);
assert.doesNotMatch(styles, /@import\s+url|font-face/i);
assert.doesNotMatch(styles, /min-width:\s*[4-9]\d\dpx/);

assert.match(differenceStyles, /\.difference-section/);
assert.match(differenceStyles, /\.patch-point/);
assert.match(differenceStyles, /\.lens-button/);
assert.match(differenceStyles, /\.difference-marker/);
assert.match(differenceStyles, /@media \(max-width: 620px\)/);
assert.match(differenceStyles, /@media \(max-width: 380px\)/);
assert.match(differenceStyles, /@media \(prefers-reduced-motion: reduce\)/);
assert.match(differenceStyles, /@media \(prefers-contrast: more\)/);
assert.match(differenceStyles, /@media print/);
assert.doesNotMatch(differenceStyles, /@import\s+url|font-face|https?:\/\//i);
assert.doesNotMatch(differenceStyles, /min-width:\s*[4-9]\d\dpx/);

assert.match(worker, /const PREVIOUS_CACHE_NAME = 'museum-of-almost-commons-now-v3-coherent-shell'/);
assert.match(worker, /const CACHE_NAME = 'museum-of-almost-commons-now-v4-world-map'/);
assert.match(worker, /url\.origin !== self\.location\.origin/);
assert.match(worker, /caches\.match\('\.\/index\.html'\)[\s\S]+if \(cached\) return cached;[\s\S]+fetch\(request\)/,
  'navigation cache must remain coherent across releases');
assert.match(worker, /clients\.matchAll\(\{ type: 'window', includeUncontrolled: true \}\)/);
assert.match(worker, /client\.navigate\(client\.url\)/);
assert.doesNotMatch(worker, /https?:\/\//, 'service worker must never proxy public live-data sources');
for (const asset of ['./index.html', './styles.css', './world-map.css', './world-map.svg', './difference-engine.css', './data-core.js', './app.js', './SOURCES.md', './PRIVACY.md']) {
  assert.ok(worker.includes(`'${asset}'`), `offline shell missing ${asset}`);
}

assert.match(readme, /COMMONS \/ NOW/);
assert.match(readme, /https:\/\/yushirm\.github\.io\/museum-of-almost\//);
assert.match(readme, /one current snapshot/i);
assert.match(readme, /thirteen fixed coordinates/i);
assert.match(readme, /Natural Earth 110m public-domain land geometry/i);
assert.match(readme, /No map API, tile server, remote image, or runtime mapping library is contacted/i);
assert.match(readme, /Difference Engine/i);
assert.match(readme, /adds no data source and makes no extra network request/i);
assert.match(readme, /no visitor persistence/i);
assert.match(readme, /6bc76dc33337414e7c9f9ccbd7539976d98ac371444860c605fb88003174ded2/);
assert.match(readme, /original opaque seed inputs are deliberately not stored/i);

assert.match(privacy, /does not create visitor accounts, profiles, histories, scores, identifiers/i);
assert.match(privacy, /does not.*request browser geolocation/is);
assert.match(privacy, /localStorage/);
assert.match(privacy, /one direct request to each of four public services/i);
assert.match(privacy, /credentials: omit/);
assert.match(privacy, /referrerPolicy: no-referrer/);
assert.match(privacy, /IP address/i);
assert.match(privacy, /thirteen fixed latitude\/longitude pairs/i);
assert.match(privacy, /original opaque values are not stored or published/i);
assert.match(privacy, /does not contact a map API, tile provider, geocoder/i);
assert.match(privacy, /does not cache, proxy, or persist USGS, NOAA, Open-Meteo, or NASA responses/i);

for (const sourceName of ['USGS', 'NOAA', 'Open-Meteo', 'NASA']) {
  assert.match(sources, new RegExp(sourceName, 'i'), `missing source documentation for ${sourceName}`);
}
for (const url of allowedRuntimeUrls) {
  assert.ok(sources.includes(url), `SOURCES.md missing runtime endpoint ${url}`);
}
assert.match(sources, /CC BY 4\.0/i);
assert.match(sources, /Local world basemap/);
assert.match(sources, /Natural Earth 110m land geometry/i);
assert.match(sources, /public domain/i);
assert.match(sources, /x = longitude \+ 180/);
assert.match(sources, /y = 90 - latitude/);
assert.match(sources, /does not poll automatically/i);

assert.match(rebuild, /Reset 1 — COMMONS \/ NOW/);
assert.match(rebuild, /Extension 1 — The Difference Engine/);
assert.match(rebuild, /Concept C was discarded/i);
assert.match(rebuild, /no additional network request/i);
assert.match(rebuild, /missing source values remain unavailable and must never coerce to numeric zero/i);
assert.match(rebuild, /Extension 2 — Thirteen Windows Get a World/);
assert.match(rebuild, /Natural Earth 110m public-domain land geometry/i);
assert.match(rebuild, /Never hand-adjust a point/i);
assert.match(rebuild, /6bc76dc33337414e7c9f9ccbd7539976d98ac371444860c605fb88003174ded2/);
assert.match(rebuild, /original opaque values are intentionally absent/i);
assert.match(rebuild, /Treaty 05 ontology and interaction surface/);
assert.match(rebuild, /current application stores no visitor state at all/i);

assert.match(rights, /world-map\.svg/);
assert.match(rights, /Natural Earth 110m geographic data/i);
assert.match(rights, /public domain/i);

const parsedManifest = JSON.parse(manifest);
assert.equal(parsedManifest.start_url, './');
assert.equal(parsedManifest.scope, './');
assert.equal(parsedManifest.display, 'standalone');
assert.match(parsedManifest.name, /Commons \/ Now/i);

assert.match(workflow, /jobs:\s*\n\s*check:/);
assert.match(workflow, /permissions:\s*\n\s*contents: read/);
assert.match(workflow, /persist-credentials: false/);
assert.match(workflow, /timeout-minutes: 5/);
assert.match(workflow, /actions\/checkout@[0-9a-f]{40}/);
assert.match(workflow, /actions\/setup-node@[0-9a-f]{40}/);
assert.match(workflow, /node scripts\/test-data-core\.mjs/);
assert.match(workflow, /node scripts\/test-service-worker\.mjs/);
assert.match(workflow, /node scripts\/check\.mjs/);

assert.doesNotMatch(publicCurrent, /\b[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i,
  'raw UUID-style seed material must not be published');
assert.doesNotMatch(publicCurrent, /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i);
assert.doesNotMatch(publicCurrent, /\bAKIA[0-9A-Z]{16}\b/);
assert.doesNotMatch(publicCurrent, /\bsk-(?:proj-)?[A-Za-z0-9_-]{16,}\b/);
assert.doesNotMatch(publicCurrent, /BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY/);
assert.doesNotMatch(publicCurrent, /password\s*[:=]\s*["'][^"']+["']/i);
assert.doesNotMatch(publicCurrent, /\/Users\/|\/home\/[A-Za-z0-9._-]+|C:\\Users\\/i);

console.log('Commons / Now local-map, coherent-shell, public-data, Difference Engine, privacy, accessibility, seed, and offline contract verified.');
