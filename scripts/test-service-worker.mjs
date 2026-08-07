import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../service-worker.js', import.meta.url), 'utf8');

assert.match(source, /museum-of-almost-commons-now-v1/);
for (const asset of [
  './',
  './index.html',
  './styles.css',
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
assert.match(source, /caches\.match\('\.\/index\.html'\)/);
assert.match(source, /startsWith\('museum-of-almost-'\)/);
assert.match(source, /caches\.delete/);
assert.doesNotMatch(source, /https?:\/\//, 'service worker must not proxy or cache public live-data services');
assert.doesNotMatch(source, /analytics|telemetry|pixel|beacon/i);

console.log('Commons / Now offline shell and cross-origin boundary verified.');
