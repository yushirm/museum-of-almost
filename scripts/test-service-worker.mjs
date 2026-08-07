import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../service-worker.js', import.meta.url), 'utf8');
const listeners = new Map();
const deleted = [];
const added = [];
const put = [];
let fetchMode = 'success';

const cache = {
  addAll: async (assets) => { added.push(...assets); },
  put: async (request, response) => { put.push([request, response]); }
};

const caches = {
  open: async () => cache,
  keys: async () => ['museum-of-almost-v7', 'museum-of-almost-entropy-v1', 'unrelated-cache'],
  delete: async (key) => { deleted.push(key); return true; },
  match: async (request) => ({ cached: String(request) })
};

const self = {
  location: { origin: 'https://example.invalid' },
  clients: { claim: async () => undefined },
  skipWaiting: async () => undefined,
  addEventListener(type, listener) { listeners.set(type, listener); }
};

const context = vm.createContext({
  self,
  caches,
  URL,
  Promise,
  fetch: async () => {
    if (fetchMode === 'failure') throw new Error('offline');
    return {
      status: 200,
      type: 'basic',
      clone() { return this; }
    };
  }
});
vm.runInContext(source, context, { filename: 'service-worker.js' });

async function dispatch(type, event) {
  let pending;
  listeners.get(type)({
    ...event,
    waitUntil(promise) { pending = promise; },
    respondWith(promise) { pending = promise; }
  });
  return pending ? pending : undefined;
}

await dispatch('install', {});
assert.deepEqual(added, [
  './', './index.html', './styles.css', './entropy-core.js', './app.js', './manifest.webmanifest', './PRIVACY.md'
]);

await dispatch('activate', {});
assert.deepEqual(deleted, ['museum-of-almost-v7'], 'activation must remove only obsolete Museum caches');

let responded = false;
listeners.get('fetch')({
  request: { method: 'GET', url: 'https://remote.invalid/file.js', mode: 'cors' },
  respondWith() { responded = true; }
});
assert.equal(responded, false, 'cross-origin requests must be ignored');

listeners.get('fetch')({
  request: { method: 'POST', url: 'https://example.invalid/data', mode: 'same-origin' },
  respondWith() { responded = true; }
});
assert.equal(responded, false, 'non-GET requests must be ignored');

fetchMode = 'failure';
const fallback = await dispatch('fetch', {
  request: { method: 'GET', url: 'https://example.invalid/museum-of-almost/', mode: 'navigate' }
});
assert.deepEqual(fallback, { cached: './index.html' }, 'offline navigation must return the cached application shell');

process.stdout.write('Service worker checks passed.\n');
