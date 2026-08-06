import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../service-worker.js', import.meta.url), 'utf8');
const listeners = new Map();
const stores = new Map();
let fetchImplementation = async () => {
  throw new Error('fetch implementation not configured');
};
let failCacheWrites = false;
let skipWaitingCalls = 0;
let claimCalls = 0;

function keyFor(request) {
  return typeof request === 'string' ? request : request.url;
}

function createResponse(body, { status = 200, type = 'basic' } = {}) {
  return {
    body,
    status,
    type,
    clone() {
      return createResponse(body, { status, type });
    }
  };
}

function cacheFor(name) {
  if (!stores.has(name)) stores.set(name, new Map());
  const entries = stores.get(name);
  return {
    async addAll(paths) {
      for (const path of paths) entries.set(path, createResponse(`precache:${path}`));
    },
    async put(request, response) {
      if (failCacheWrites) throw new Error('cache storage unavailable');
      entries.set(keyFor(request), response);
    }
  };
}

const caches = {
  async open(name) {
    return cacheFor(name);
  },
  async keys() {
    return [...stores.keys()];
  },
  async delete(name) {
    return stores.delete(name);
  },
  async match(request) {
    const key = keyFor(request);
    for (const entries of stores.values()) {
      if (entries.has(key)) return entries.get(key);
    }
    return undefined;
  }
};

const sandbox = {
  URL,
  Promise,
  Response: { error: () => createResponse('', { status: 0, type: 'error' }) },
  caches,
  fetch: (...args) => fetchImplementation(...args),
  self: {
    location: { origin: 'https://example.test' },
    clients: {
      async claim() {
        claimCalls += 1;
      }
    },
    addEventListener(type, listener) {
      listeners.set(type, listener);
    },
    async skipWaiting() {
      skipWaitingCalls += 1;
    }
  }
};

vm.runInNewContext(source, sandbox, { filename: 'service-worker.js' });

function createExtendableEvent(extra = {}) {
  const lifetime = [];
  return {
    ...extra,
    waitUntil(promise) {
      lifetime.push(Promise.resolve(promise));
    },
    async settled() {
      await Promise.all(lifetime);
    }
  };
}

async function dispatch(type, event) {
  const listener = listeners.get(type);
  assert.ok(listener, `${type} listener is registered`);
  listener(event);
  await event.settled();
}

function createFetchEvent(request) {
  return createExtendableEvent({
    request,
    respondWith(promise) {
      this.responsePromise = Promise.resolve(promise);
    }
  });
}

await dispatch('install', createExtendableEvent());
assert.equal(skipWaitingCalls, 1, 'installation activates the new worker promptly');
assert.ok(await caches.match('./index.html'), 'installation precaches the app shell');

stores.set('museum-of-almost-v1', new Map([['old', createResponse('old')]]));
await dispatch('activate', createExtendableEvent());
assert.equal(stores.has('museum-of-almost-v1'), false, 'activation removes obsolete caches');
assert.equal(claimCalls, 1, 'activation claims open clients');

const assetRequest = {
  url: 'https://example.test/museum/app.js',
  method: 'GET',
  mode: 'same-origin'
};
await cacheFor('museum-of-almost-v2').put(assetRequest, createResponse('stale'));
fetchImplementation = async () => createResponse('fresh');
const cachedAssetEvent = createFetchEvent(assetRequest);
listeners.get('fetch')(cachedAssetEvent);
assert.equal((await cachedAssetEvent.responsePromise).body, 'stale', 'cached assets remain immediately available');
await cachedAssetEvent.settled();
assert.equal((await caches.match(assetRequest)).body, 'fresh', 'background revalidation refreshes cached assets');

const uncachedRequest = {
  url: 'https://example.test/museum/new.js',
  method: 'GET',
  mode: 'same-origin'
};
fetchImplementation = async () => createResponse('network-only');
const uncachedEvent = createFetchEvent(uncachedRequest);
listeners.get('fetch')(uncachedEvent);
assert.equal((await uncachedEvent.responsePromise).body, 'network-only', 'uncached assets use the network');
await uncachedEvent.settled();
assert.equal((await caches.match(uncachedRequest)).body, 'network-only', 'uncached assets are stored for offline use');

failCacheWrites = true;
const noStorageRequest = {
  url: 'https://example.test/museum/no-storage.js',
  method: 'GET',
  mode: 'same-origin'
};
fetchImplementation = async () => createResponse('still-usable');
const noStorageEvent = createFetchEvent(noStorageRequest);
listeners.get('fetch')(noStorageEvent);
assert.equal((await noStorageEvent.responsePromise).body, 'still-usable', 'cache write failures do not discard valid network responses');
await noStorageEvent.settled();
failCacheWrites = false;

fetchImplementation = async () => {
  throw new Error('offline');
};
const offlineAssetEvent = createFetchEvent(assetRequest);
listeners.get('fetch')(offlineAssetEvent);
assert.equal((await offlineAssetEvent.responsePromise).body, 'fresh', 'offline assets fall back to the current cache');
await offlineAssetEvent.settled();

const navigationRequest = {
  url: 'https://example.test/museum/missing-route',
  method: 'GET',
  mode: 'navigate'
};
const navigationEvent = createFetchEvent(navigationRequest);
listeners.get('fetch')(navigationEvent);
assert.equal((await navigationEvent.responsePromise).body, 'precache:./index.html', 'offline navigation falls back to the app shell');

const crossOriginEvent = createFetchEvent({
  url: 'https://outside.test/file.js',
  method: 'GET',
  mode: 'cors'
});
listeners.get('fetch')(crossOriginEvent);
assert.equal(crossOriginEvent.responsePromise, undefined, 'cross-origin requests are not intercepted');

const postEvent = createFetchEvent({
  url: 'https://example.test/museum/action',
  method: 'POST',
  mode: 'same-origin'
});
listeners.get('fetch')(postEvent);
assert.equal(postEvent.responsePromise, undefined, 'non-GET requests are not intercepted');

console.log('Service worker lifecycle, refresh, and offline fallback tests passed.');
