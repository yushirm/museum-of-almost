'use strict';

const PREVIOUS_CACHE_NAME = 'museum-of-almost-commons-now-v2-difference';
const CACHE_NAME = 'museum-of-almost-commons-now-v3-coherent-shell';
const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './difference-engine.css',
  './data-core.js',
  './app.js',
  './manifest.webmanifest',
  './PRIVACY.md',
  './SOURCES.md'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    const isUpgrade = keys.some((key) => key.startsWith('museum-of-almost-') && key !== CACHE_NAME);

    await Promise.all(
      keys
        .filter((key) => key.startsWith('museum-of-almost-') && key !== CACHE_NAME)
        .map((key) => caches.delete(key))
    );
    await self.clients.claim();

    if (!isUpgrade) return;
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    await Promise.all(windows.map((client) => {
      if (typeof client.navigate !== 'function') return null;
      return client.navigate(client.url).catch(() => null);
    }));
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(async (response) => {
          if (response && response.status === 200 && response.type !== 'opaque') {
            const cache = await caches.open(CACHE_NAME);
            await cache.put('./index.html', response.clone());
          }
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then(async (response) => {
        if (response && response.status === 200 && response.type !== 'opaque') {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, response.clone());
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
