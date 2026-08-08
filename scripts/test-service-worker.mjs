import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../service-worker.js', import.meta.url), 'utf8');

assert.match(source, /const PREVIOUS_CACHE_NAME = 'museum-of-almost-commons-now-v10-front-page-polish'/);
assert.match(source, /const CACHE_NAME = 'museum-of-almost-commons-now-v11-sample-and-hold'/);
assert.match(source, /const ACTIVE_CACHE_NAME = 'museum-of-almost-commons-now-v12-thickness-of-now'/);
assert.match(source, /const CURRENT_CACHE_NAME = 'museum-of-almost-v16-fresh-online'/);
for (const asset of [
  './',
  './index.html',
  './landing.css',
  './commons-now.html',
  './styles.css',
  './sample-hold.css',
  './sounding-well.css',
  './faultline.css',
  './world-map.css',
  './world-map.svg',
  './difference-engine.css',
  './field-sheet.css',
  './cosmic-signal.css',
  './cosmic-signal-core.js',
  './cosmic-signal-view.js',
  './cosmic-latency-core.js',
  './cosmic-latency.js',
  './cosmic-latency.css',
  './cosmic-escapement-core.js',
  './cosmic-escapement.js',
  './cosmic-escapement.css',
  './planetary-heliodon-core.js',
  './planetary-heliodon.js',
  './planetary-heliodon.css',
  './faultline-core.js',
  './faultline.js',
  './data-core.js',
  './temporal-sounding-core.js',
  './temporal-sounding.js',
  './app.js',
  './cosmic-signal.js',
  './deep-space.html',
  './deep-space.css',
  './deep-space-core.js',
  './deep-space.js',
  './almost-online.html',
  './web1.css',
  './web1.js',
  './assets/web1/stars.gif',
  './assets/web1/comet.gif',
  './assets/web1/construction.gif',
  './assets/web1/hand-coded.gif',
  './assets/web1/alien.gif',
  './manifest.webmanifest',
  './PRIVACY.md',
  './SOURCES.md',
  './SAMPLE_AND_HOLD.md',
  './SOUNDING_WELL.md',
  './FAULTLINE_CORE.md',
  './COSMIC_RECEIVE_DESK.md',
  './CELESTIAL_ESCAPEMENT.md',
  './PLANETARY_HELIODON.md',
  './DEEP_SPACE.md',
  './WEB1_HOME.md'
]) {
  assert.ok(source.includes(`'${asset}'`), `service worker should cache ${asset}`);
}

assert.match(source, /APP_SHELL\.map\(\(asset\) => new Request\(asset, \{ cache: 'reload' \}\)\)/,
  'install should refill the offline shell from the deployed files instead of a stale browser HTTP cache');
assert.match(source, /caches\.open\(CURRENT_CACHE_NAME\)/);
assert.match(source, /key !== CURRENT_CACHE_NAME/);
assert.match(source, /url\.origin !== self\.location\.origin/);
assert.match(source, /request\.mode === 'navigate'/);
assert.match(source, /async function networkFirst[\s\S]+fetch\(request, \{ cache: 'no-cache' \}\)[\s\S]+caches\.match\(request\)/,
  'same-origin requests should revalidate online before falling back to the offline cache');
assert.match(source, /const fallbackToIndex = url\.pathname === scopePath/,
  'only root-scope navigation should use the museum entrance as its offline index fallback');
assert.match(source, /caches\.match\('\.\/index\.html'\)/,
  'root-scope navigation should retain the museum entrance as its offline index fallback');
assert.match(source, /event\.respondWith\(networkFirst\(request, fallbackToIndex\)\)/,
  'navigations should prefer the deployed document and use the requested cached document only offline');
assert.match(source, /event\.respondWith\(networkFirst\(request\)\)/,
  'same-origin assets should prefer the deployed file while preserving offline fallback');
assert.match(source, /clients\.claim\(\)/);
assert.match(source, /clients\.matchAll\(\{ type: 'window', includeUncontrolled: true \}\)/);
assert.match(source, /client\.navigate\(client\.url\)/,
  'a worker architecture upgrade should still reload open pages once so the new cache policy takes control');
assert.match(source, /startsWith\('museum-of-almost-'\)/);
assert.match(source, /caches\.delete/);
assert.doesNotMatch(source, /https?:\/\//, 'service worker must not proxy or cache public live-data services');
assert.doesNotMatch(source, /analytics|telemetry|pixel|beacon/i);

console.log('Fresh-online, cached-offline service worker behavior and cross-origin boundary verified.');
