'use strict';

const PREVIOUS_CACHE_NAME = 'museum-of-almost-commons-now-v5-field-sheet';
const CACHE_NAME = 'museum-of-almost-commons-now-v6-cosmic-signal';
const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './world-map.css',
  './world-map.svg',
  './difference-engine.css',
  './field-sheet.css',
  './cosmic-signal.css',
  './data-core.js',
  './app.js',
  './cosmic-signal.js',
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
      caches.match('./index.html').then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (!response || response.status !== 200 || response.type === 'opaque') return response;
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('./index.html', copy));
          return response;
        });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type === 'opaque') return response;
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      });
    })
  );
});
