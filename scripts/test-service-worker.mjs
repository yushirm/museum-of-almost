import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../service-worker.js', import.meta.url), 'utf8');

assert.match(source, /const PREVIOUS_CACHE_NAME = 'museum-of-almost-commons-now-v2-difference'/);
assert.match(source, /const CACHE_NAME = 'museum-of-almost-commons-now-v3-coherent-shell'/);
for (const asset of [
  './',
  './index.html',
  './styles.css',
  './difference-engine.css',
  './data-core.js',
  './app.js',
  './manifest.webmanifest',
  './PRIVACY.md',
  './SOURCES.md'
]) {
  assert.ok(source.includes(`'${asset}'`), `service worker should cache ${asset}`);
}

assert.match(source, /url\.origin !== self\.location\.origin/);
assert.match(source, /request\.mode === 'navigate'/);
assert.match(source, /fetch\(request\)[\s\S]+caches\.match\('\.\/index\.html'\)/,
  'navigations should prefer the current network shell and fall back offline');
assert.match(source, /fetch\(request\)[\s\S]+cache\.put\(request, response\.clone\(\)\)[\s\S]+caches\.match\(request\)/,
  'same-origin assets should refresh from the network before falling back to cache');
assert.match(source, /clients\.claim\(\)/);
assert.match(source, /clients\.matchAll\(\{ type: 'window', includeUncontrolled: true \}\)/);
assert.match(source, /client\.navigate\(client\.url\)/,
  'an upgraded worker should reload open pages once so new HTML cannot keep stale scripts');
assert.match(source, /startsWith\('museum-of-almost-'\)/);
assert.match(source, /caches\.delete/);
assert.doesNotMatch(source, /https?:\/\//, 'service worker must not proxy or cache public live-data services');
assert.doesNotMatch(source, /analytics|telemetry|pixel|beacon/i);

console.log('Commons / Now coherent offline shell, upgrade reload, Difference Engine asset, and cross-origin boundary verified.');
