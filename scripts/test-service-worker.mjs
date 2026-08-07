import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../service-worker.js', import.meta.url), 'utf8');

assert.match(source, /museum-of-almost-entropy-v4/);
for (const asset of [
  './',
  './index.html',
  './styles.css',
  './entropy-core.js',
  './app.js',
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
assert.doesNotMatch(source, /https?:\/\//);
assert.doesNotMatch(source, /analytics|telemetry|pixel|beacon/i);

console.log('Service worker lifecycle and offline fallback verified for entropy v4.');
