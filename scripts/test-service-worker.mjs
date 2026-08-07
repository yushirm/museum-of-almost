import assert from 'node:assert/strict';
import fs from 'node:fs';

const worker = fs.readFileSync(new URL('../service-worker.js', import.meta.url), 'utf8');
assert.match(worker, /museum-of-almost-entropy-v3/);
assert.match(worker, /url\.origin !== self\.location\.origin/);
assert.match(worker, /request\.mode === 'navigate'/);
assert.match(worker, /cache\.addAll\(APP_SHELL\)/);
assert.match(worker, /key\.startsWith\('museum-of-almost-'\)/);
assert.doesNotMatch(worker, /https?:\/\//i);
console.log('Service worker remains same-origin, offline-first, and cache-versioned.');
