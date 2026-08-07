'use strict';

const CACHE_NAME = 'museum-of-almost-v7';
const STATIC_FILES = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './tomorrow-room-core.js',
  './tomorrow-room.js',
  './signal-vault-core.js',
  './signal-vault.js',
  './dreaming-wing.js',
  './dreaming-photos.js',
  './after-dark-core.js',
  './after-dark.js',
  './conservation-core.js',
  './conservation-lab.js',
  './manifest.webmanifest',
  './icon.svg',
  './PRIVACY.md',
  './PHOTO_CREDITS.md',
  './assets/dreaming-wing/atrium.webp',
  './assets/dreaming-wing/clouds.webp',
  './assets/dreaming-wing/moon.webp'
];

async function fetchFresh(request) {
  const response = await fetch(request, { cache: 'no-cache' });
  if (!response || response.status !== 200 || response.type !== 'basic') return response;

  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
  } catch {
    // Cache storage is best-effort. A valid network response must still be returned.
  }

  return response;
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);
  if (event.request.method !== 'GET' || requestUrl.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetchFresh(event.request).catch(async () => (
        await caches.match(event.request)
        || await caches.match('./index.html')
        || await caches.match('./')
        || Response.error()
      ))
    );
    return;
  }

  const network = fetchFresh(event.request);
  event.waitUntil(network.catch(() => undefined));
  event.respondWith(caches.match(event.request).then((cached) => cached || network));
});
