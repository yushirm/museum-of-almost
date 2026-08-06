'use strict';

const CACHE_NAME = 'museum-of-almost-v2';
const APP_SHELL = './index.html';
const STATIC_FILES = [
  './',
  APP_SHELL,
  './styles.css',
  './app.js',
  './manifest.webmanifest',
  './icon.svg',
  './PRIVACY.md'
];

function isCacheable(response) {
  return response && response.status === 200 && response.type === 'basic';
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (isCacheable(response)) {
      try {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, response.clone());
      } catch {
        // A cache write failure must not hide a valid network response.
      }
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;

    if (request.mode === 'navigate') {
      const shell = await caches.match(APP_SHELL);
      if (shell) return shell;
    }

    return Response.error();
  }
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
  event.respondWith(networkFirst(event.request));
});
