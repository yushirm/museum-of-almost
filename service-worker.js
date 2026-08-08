'use strict';

const PREVIOUS_CACHE_NAME = 'museum-of-almost-commons-now-v10-front-page-polish';
const CACHE_NAME = 'museum-of-almost-commons-now-v11-sample-and-hold';
const ACTIVE_CACHE_NAME = 'museum-of-almost-commons-now-v12-thickness-of-now';
const PREVIOUS_CURRENT_CACHE_NAME = 'museum-of-almost-v16-fresh-online';
const CURRENT_CACHE_NAME = 'museum-of-almost-v17-shared-guestbook-ui';
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
  './almost-online.html',
  './web1.css',
  './guestbook.css',
  './web1.js',
  './assets/web1/stars.gif',
  './assets/web1/comet.gif',
  './assets/web1/construction.gif',
  './assets/web1/hand-coded.gif',
  './assets/web1/alien.gif',
  './manifest.webmanifest',
  './PRIVACY.md',
  './SOURCES.md',
  './SAMPLE_AND_HOLD.md',
  './SOUNDING_WELL.md',
  './FAULTLINE_CORE.md',
  './COSMIC_RECEIVE_DESK.md',
  './CELESTIAL_ESCAPEMENT.md',
  './PLANETARY_HELIODON.md',
  './DEEP_SPACE.md',
  './WEB1_HOME.md',
  './GUESTBOOK_SECURITY.md'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CURRENT_CACHE_NAME)
      .then((cache) => cache.addAll(
        APP_SHELL.map((asset) => new Request(asset, { cache: 'reload' }))
      ))
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

async function cacheSuccessfulResponse(request, response) {
  if (!response || response.status !== 200 || response.type === 'opaque') return response;
  const cache = await caches.open(CURRENT_CACHE_NAME);
  await cache.put(request, response.clone());
  return response;
}

async function networkFirst(request, fallbackToIndex = false) {
  try {
    const response = await fetch(request, { cache: 'no-cache' });
    return cacheSuccessfulResponse(request, response);
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;

    if (fallbackToIndex) {
      const fallback = await caches.match('./index.html');
      if (fallback) return fallback;
    }

    throw error;
  }
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    const scopePath = new URL(self.registration.scope).pathname;
    const fallbackToIndex = url.pathname === scopePath;
    event.respondWith(networkFirst(request, fallbackToIndex));
    return;
  }

  event.respondWith(networkFirst(request));
});
