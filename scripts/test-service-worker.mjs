import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../service-worker.js', import.meta.url), 'utf8');
const listeners = new Map();
const stores = new Map();
const fetchCalls = [];
let fetchImplementation = async () => {
  throw new Error('fetch implementation not configured');
};
let skipWaitingCalls = 0;
let claimCalls = 0;
let cachePutFailure = false;

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
      if (cachePutFailure) throw new Error('cache unavailable');
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
  fetch: (request, options) => {
    fetchCalls.push({ request, options });
    return fetchImplementation(request, options);
  },
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
    skipWaiting() {
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

const installEvent = createExtendableEvent();
await dispatch('install', installEvent);
assert.equal(skipWaitingCalls, 1, 'installation activates the new worker promptly');
assert.ok(await caches.match('./index.html'), 'installation precaches the app shell');
assert.ok(await caches.match('./conservation-core.js'), 'installation precaches the Conservation Lab core');
assert.ok(await caches.match('./conservation-lab.js'), 'installation precaches the Conservation Lab controller');
assert.ok(await caches.match('./tomorrow-room-core.js'), 'installation precaches the Almost Tomorrow core');
assert.ok(await caches.match('./tomorrow-room.js'), 'installation precaches the Almost Tomorrow controller');
assert.ok(await caches.match('./signal-vault-core.js'), 'installation precaches the Listening Room signal core');
assert.ok(await caches.match('./signal-vault.js'), 'installation precaches the Listening Room controller');
assert.ok(await caches.match('./dreaming-wing.js'), 'installation precaches the Dreaming Wing');
assert.ok(await caches.match('./dreaming-photos.js'), 'installation precaches the photographic evidence controller');
assert.ok(await caches.match('./after-dark-core.js'), 'installation precaches the Museum After Dark core');
assert.ok(await caches.match('./after-dark.js'), 'installation precaches the Museum After Dark controller');
assert.ok(await caches.match('./assets/dreaming-wing/atrium.webp'), 'installation precaches the atrium photograph');
assert.ok(await caches.match('./assets/dreaming-wing/clouds.webp'), 'installation precaches the cloud photograph');
assert.ok(await caches.match('./assets/dreaming-wing/moon.webp'), 'installation precaches the lunar photograph');

stores.set('museum-of-almost-v6', new Map([['old', createResponse('old')]]));
const activateEvent = createExtendableEvent();
await dispatch('activate', activateEvent);
assert.equal(stores.has('museum-of-almost-v6'), false, 'activation removes obsolete caches');
assert.equal(claimCalls, 1, 'activation claims open clients');

const assetRequest = {
  url: 'https://example.test/museum/app.js',
  method: 'GET',
  mode: 'same-origin'
};
await cacheFor('museum-of-almost-v7').put(assetRequest, createResponse('stale'));
fetchImplementation = async () => createResponse('fresh');
const revalidationEvent = createFetchEvent(assetRequest);
listeners.get('fetch')(revalidationEvent);
assert.equal((await revalidationEvent.responsePromise).body, 'stale', 'cached assets remain immediately available');
await revalidationEvent.settled();
assert.equal((await caches.match(assetRequest)).body, 'fresh', 'background revalidation refreshes the cached asset');
assert.equal(fetchCalls.at(-1).options.cache, 'no-cache', 'revalidation bypasses the browser HTTP cache');

const uncachedRequest = {
  url: 'https://example.test/museum/styles.css',
  method: 'GET',
  mode: 'same-origin'
};
fetchImplementation = async () => createResponse('network asset');
const uncachedEvent = createFetchEvent(uncachedRequest);
listeners.get('fetch')(uncachedEvent);
assert.equal((await uncachedEvent.responsePromise).body, 'network asset', 'uncached assets use the network response');
await uncachedEvent.settled();
assert.equal((await caches.match(uncachedRequest)).body, 'network asset', 'uncached assets are stored for offline use');

const navigationRequest = {
  url: 'https://example.test/museum/',
  method: 'GET',
  mode: 'navigate'
};
fetchImplementation = async () => createResponse('current page');
const navigationEvent = createFetchEvent(navigationRequest);
listeners.get('fetch')(navigationEvent);
assert.equal((await navigationEvent.responsePromise).body, 'current page', 'online navigation prefers the current page');
assert.equal((await caches.match(navigationRequest)).body, 'current page', 'successful navigation refreshes its cached response');

cachePutFailure = true;
fetchImplementation = async () => createResponse('current page without cache');
const cacheFailureNavigation = createFetchEvent({
  url: 'https://example.test/museum/cache-unavailable',
  method: 'GET',
  mode: 'navigate'
});
listeners.get('fetch')(cacheFailureNavigation);
assert.equal(
  (await cacheFailureNavigation.responsePromise).body,
  'current page without cache',
  'a cache write failure does not hide a valid online navigation response'
);
cachePutFailure = false;

fetchImplementation = async () => {
  throw new Error('offline');
};
const offlineNavigation = createFetchEvent({
  url: 'https://example.test/museum/missing-route',
  method: 'GET',
  mode: 'navigate'
});
listeners.get('fetch')(offlineNavigation);
assert.equal((await offlineNavigation.responsePromise).body, 'precache:./index.html', 'offline navigation falls back to the app shell');

const offlineAsset = createFetchEvent(assetRequest);
listeners.get('fetch')(offlineAsset);
assert.equal((await offlineAsset.responsePromise).body, 'fresh', 'offline assets use the latest cached response');
await offlineAsset.settled();

const missingAsset = createFetchEvent({
  url: 'https://example.test/museum/not-cached.js',
  method: 'GET',
  mode: 'same-origin'
});
listeners.get('fetch')(missingAsset);
await assert.rejects(missingAsset.responsePromise, /offline/, 'uncached offline assets fail rather than inventing content');
await missingAsset.settled();

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

console.log('Service worker cache revalidation, Conservation Lab, Almost Tomorrow, Museum After Dark, Listening Room and offline fallback tests passed.');
