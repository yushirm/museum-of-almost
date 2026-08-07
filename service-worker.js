'use strict';

const PREVIOUS_CACHE_NAME = 'museum-of-almost-commons-now-v10-front-page-polish';
const CACHE_NAME = 'museum-of-almost-commons-now-v11-sample-and-hold';
const ACTIVE_CACHE_NAME = 'museum-of-almost-commons-now-v12-thickness-of-now';
const CURRENT_CACHE_NAME = 'museum-of-almost-v15-gallery-foyer';
const APP_SHELL = [
  './',
  './index.html',
  './landing.css',
  './commons-now.html',
  './styles.css',
  './sample-hold.css',
  './sounding-well.css',
  './faultline.css',
  './world-map.css',
  './world-map.svg',
  './difference-engine.css',
  './field-sheet.css',
  './cosmic-signal.css',
  './cosmic-signal-core.js',
  './cosmic-signal-view.js',
  './cosmic-latency-core.js',
  './cosmic-latency.js',
  './cosmic-latency.css',
  './cosmic-escapement-core.js',
  './cosmic-escapement.js',
  './cosmic-escapement.css',
  './planetary-heliodon-core.js',
  './planetary-heliodon.js',
  './planetary-heliodon.css',
  './faultline-core.js',
  './faultline.js',
  './data-core.js',
  './temporal-sounding-core.js',
  './temporal-sounding.js',
  './app.js',
  './cosmic-signal.js',
  './deep-space.html',
  './deep-space.css',
  './deep-space-core.js',
  './deep-space.js',
  './manifest.webmanifest',
  './PRIVACY.md',
  './SOURCES.md',
  './SAMPLE_AND_HOLD.md',
  './SOUNDING_WELL.md',
  './FAULTLINE_CORE.md',
  './COSMIC_RECEIVE_DESK.md',
  './CELESTIAL_ESCAPEMENT.md',
  './PLANETARY_HELIODON.md',
  './DEEP_SPACE.md'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CURRENT_CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    const isUpgrade = keys.some((key) => key.startsWith('museum-of-almost-') && key !== CURRENT_CACHE_NAME);

    await Promise.all(
      keys
        .filter((key) => key.startsWith('museum-of-almost-') && key !== CURRENT_CACHE_NAME)
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

function cacheSuccessfulResponse(request, response) {
  if (!response || response.status !== 200 || response.type === 'opaque') return response;
  const copy = response.clone();
  caches.open(CURRENT_CACHE_NAME).then((cache) => cache.put(request, copy));
  return response;
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;

        const scopePath = new URL(self.registration.scope).pathname;
        if (url.pathname === scopePath) {
          return caches.match('./index.html').then((cached) => {
            if (cached) return cached;
            return fetch(request).then((response) => cacheSuccessfulResponse(request, response));
          });
        }

        return fetch(request).then((response) => cacheSuccessfulResponse(request, response));
      })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => cacheSuccessfulResponse(request, response));
    })
  );
});
