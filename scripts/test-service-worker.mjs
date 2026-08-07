import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../service-worker.js', import.meta.url), 'utf8');

assert.match(source, /const PREVIOUS_CACHE_NAME = 'museum-of-almost-commons-now-v4-world-map'/);
assert.match(source, /const CACHE_NAME = 'museum-of-almost-commons-now-v5-field-sheet'/);
for (const asset of [
  './',
  './index.html',
  './styles.css',
  './world-map.css',
  './world-map.svg',
  './difference-engine.css',
  './field-sheet.css',
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
assert.match(source, /caches\.match\('\.\/index\.html'\)[\s\S]+if \(cached\) return cached;[\s\S]+fetch\(request\)/,
  'navigations should keep HTML and scripts on the same cached shell until an upgrade is ready');
assert.match(source, /caches\.match\(request\)[\s\S]+if \(cached\) return cached;[\s\S]+fetch\(request\)/,
  'same-origin assets should remain cache-first for offline-first behavior');
assert.match(source, /clients\.claim\(\)/);
assert.match(source, /clients\.matchAll\(\{ type: 'window', includeUncontrolled: true \}\)/);
assert.match(source, /client\.navigate\(client\.url\)/,
  'an upgraded worker should reload open pages once so the new shell becomes active atomically');
assert.match(source, /startsWith\('museum-of-almost-'\)/);
assert.match(source, /caches\.delete/);
assert.doesNotMatch(source, /https?:\/\//, 'service worker must not proxy or cache public live-data services');
assert.doesNotMatch(source, /analytics|telemetry|pixel|beacon/i);

console.log('Commons / Now coherent offline shell, local world map, Difference Engine, printable field sheet, and cross-origin boundary verified.');
