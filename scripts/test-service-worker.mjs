import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../service-worker.js', import.meta.url), 'utf8');
const listeners = new Map();
const stores = new Map();
let fetchImplementation = async () => {
  throw new Error('fetch implementation not configured');
};
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

const installEvent = createExtendableEvent();
await dispatch('install', installEvent);
assert.equal(skipWaitingCalls, 1, 'installation activates the new worker promptly');
assert.ok(await caches.match('./index.html'), 'installation precaches the app shell');

stores.set('museum-of-almost-v1', new Map([['old', createResponse('old')]]));
const activateEvent = createExtendableEvent();
await dispatch('activate', activateEvent);
assert.equal(stores.has('museum-of-almost-v1'), false, 'activation removes obsolete caches');
assert.equal(claimCalls, 1, 'activation claims open clients');

const assetRequest = {
  url: 'https://example.test/museum/app.js',
  method: 'GET',
  mode: 'same-origin'
};
await cacheFor('museum-of-almost-v2').put(assetRequest, createResponse('stale'));
fetchImplementation = async () => createResponse('fresh');
const onlineEvent = createExtendableEvent({
  request: assetRequest,
  respondWith(promise) {
    this.responsePromise = Promise.resolve(promise);
  }
});
listeners.get('fetch')(onlineEvent);
const onlineResponse = await onlineEvent.responsePromise;
await onlineEvent.settled();
assert.equal(onlineResponse.body, 'fresh', 'online requests prefer the current network response');
assert.equal((await caches.match(assetRequest)).body, 'fresh', 'successful responses refresh the offline cache');

fetchImplementation = async () => {
  throw new Error('offline');
};
const offlineEvent = createExtendableEvent({
  request: assetRequest,
  respondWith(promise) {
    this.responsePromise = Promise.resolve(promise);
  }
});
listeners.get('fetch')(offlineEvent);
assert.equal((await offlineEvent.responsePromise).body, 'fresh', 'offline requests fall back to the cached asset');

const navigationRequest = {
  url: 'https://example.test/museum/missing-route',
  method: 'GET',
  mode: 'navigate'
};
const navigationEvent = createExtendableEvent({
  request: navigationRequest,
  respondWith(promise) {
    this.responsePromise = Promise.resolve(promise);
  }
});
listeners.get('fetch')(navigationEvent);
assert.equal((await navigationEvent.responsePromise).body, 'precache:./index.html', 'offline navigation falls back to the app shell');

const crossOriginEvent = createExtendableEvent({
  request: { url: 'https://outside.test/file.js', method: 'GET', mode: 'cors' },
  respondWith() {
    this.responded = true;
  }
});
listeners.get('fetch')(crossOriginEvent);
assert.equal(crossOriginEvent.responded, undefined, 'cross-origin requests are not intercepted');

const missingAssetEvent = createExtendableEvent({
  request: { url: 'https://example.test/museum/not-cached.js', method: 'GET', mode: 'same-origin' },
  respondWith(promise) {
    this.responsePromise = Promise.resolve(promise);
  }
});
listeners.get('fetch')(missingAssetEvent);
assert.equal((await missingAssetEvent.responsePromise).type, 'error', 'an uncached offline asset fails without inventing content');

const postEvent = createExtendableEvent({
  request: { url: 'https://example.test/museum/action', method: 'POST', mode: 'same-origin' },
  respondWith() {
    this.responded = true;
  }
});
listeners.get('fetch')(postEvent);
assert.equal(postEvent.responded, undefined, 'non-GET requests are not intercepted');

console.log('Service worker update and offline fallback tests passed.');
