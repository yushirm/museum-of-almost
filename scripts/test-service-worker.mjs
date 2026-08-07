import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../service-worker.js', import.meta.url), 'utf8');

assert.match(source, /museum-of-almost-entropy-v5-dashboard1/);
for (const asset of [
  './',
  './index.html',
  './styles.css',
  './live-entropy.css',
  './dashboard.css',
  './entropy-core.js',
  './app.js',
  './live-entropy-core.js',
  './live-entropy.js',
  './dashboard.js',
  './manifest.webmanifest',
  './PRIVACY.md'
]) {
  assert.ok(source.includes(`'${asset}'`), `service worker should cache ${asset}`);
}

assert.match(source, /url\.origin !== self\.location\.origin/);
assert.match(source, /request\.mode === 'navigate'/);
assert.match(source, /caches\.match\('\.\/index\.html'\)/);
assert.match(source, /startsWith\('museum-of-almost-'\)/);
assert.match(source, /caches\.delete/);
assert.doesNotMatch(source, /https?:\/\//, 'service worker must not proxy or cache cross-origin live data');
assert.doesNotMatch(source, /analytics|telemetry|pixel|beacon/i);

console.log('Service worker lifecycle, dashboard shell assets, and same-origin fallback verified.');
