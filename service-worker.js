'use strict';

const PREVIOUS_CACHE_NAME = 'museum-of-almost-commons-now-v10-front-page-polish';
const CACHE_NAME = 'museum-of-almost-commons-now-v11-sample-and-hold';
const ACTIVE_CACHE_NAME = 'museum-of-almost-commons-now-v12-thickness-of-now';
const PREVIOUS_PREVIOUS_CURRENT_CACHE_NAME = 'museum-of-almost-v15-gallery-foyer';
const PREVIOUS_CURRENT_CACHE_NAME = 'museum-of-almost-v16-fresh-online';
const WITNESS_SEAL_CACHE_NAME = 'museum-of-almost-v17-witness-seal';
const POSSIBILITY_ENGINE_CACHE_NAME = 'museum-of-almost-v18-possibility-engine';
const ISOLATION_BOARD_CACHE_NAME = 'museum-of-almost-v19-isolation-board';
const FRAME_SHIFTER_CACHE_NAME = 'museum-of-almost-v20-frame-shifter';
const EXPOSURE_PLATE_CACHE_NAME = 'museum-of-almost-v21-exposure-plate';
const REVERSE_LEDGER_CACHE_NAME = 'museum-of-almost-v22-reverse-ledger';
const CAUSAL_SIGNAL_BOX_CACHE_NAME = 'museum-of-almost-v23-causal-signal-box';
const REST_SCORE_CACHE_NAME = 'museum-of-almost-v24-rest-score';
const GRAVITATIONAL_COPY_ROOM_CACHE_NAME = 'museum-of-almost-v25-gravitational-copy-room';
const REDSHIFT_RULER_CACHE_NAME = 'museum-of-almost-v26-redshift-ruler';
const OFFCUT_DRAWER_CACHE_NAME = 'museum-of-almost-v27-offcut-drawer';
const ORIGIN_MACHINE_CACHE_NAME = 'museum-of-almost-v28-origin-machine';
const BORDER_OFFICE_CACHE_NAME = 'museum-of-almost-v29-border-office';
const PAGE_FOUR_CACHE_NAME = 'museum-of-almost-v30-page-four';
const SAME_ANSWER_MACHINE_CACHE_NAME = 'museum-of-almost-v31-same-answer-machine';
const LOAD_BEARING_SAMPLE_CACHE_NAME = 'museum-of-almost-v32-load-bearing-sample';
const PAGE_FOUR_RUMOR_RELAY_CACHE_NAME = 'museum-of-almost-v33-page-four-rumor-relay';
const CURRENT_CACHE_NAME = 'museum-of-almost-v34-gauge-bench';
const APP_SHELL = [
  './',
  './index.html',
  './landing.css',
  './page-four-teaser.css',
  './page-four.html',
  './page-four.css',
  './page-four.js',
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
  './witness-seal-core.js',
  './witness-seal.js',
  './witness-seal.css',
  './isolation-board-core.js',
  './isolation-board.js',
  './isolation-board.css',
  './exposure-plate-core.js',
  './exposure-plate.js',
  './exposure-plate.css',
  './reverse-ledger-core.js',
  './reverse-ledger.js',
  './reverse-ledger.css',
  './rest-score-core.js',
  './rest-score.js',
  './rest-score.css',
  './offcut-drawer-core.js',
  './offcut-drawer.js',
  './offcut-drawer.css',
  './border-office-core.js',
  './border-office.js',
  './border-office.css',
  './load-bearing-sample-core.js',
  './load-bearing-sample.js',
  './load-bearing-sample.css',
  './gauge-bench-core.js',
  './gauge-bench.js',
  './gauge-bench.css',
  './data-core.js',
  './temporal-sounding-core.js',
  './temporal-sounding.js',
  './app.js',
  './cosmic-signal.js',
  './deep-space.html',
  './deep-space.css',
  './deep-space-core.js',
  './deep-space.js',
  './possibility-engine.css',
  './possibility-engine-core.js',
  './possibility-engine.js',
  './frame-shifter.css',
  './frame-shifter-core.js',
  './frame-shifter.js',
  './causal-signal.css',
  './causal-signal-core.js',
  './causal-signal.js',
  './gravitational-copy.css',
  './gravitational-copy-core.js',
  './gravitational-copy.js',
  './redshift-ruler.css',
  './redshift-ruler-core.js',
  './redshift-ruler.js',
  './origin-machine.css',
  './origin-machine-core.js',
  './origin-machine.js',
  './same-answer-machine.css',
  './same-answer-core.js',
  './same-answer-machine.js',
  './almost-online.html',
  './web1.css',
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
  './WITNESS_SEAL.md',
  './ISOLATION_BOARD.md',
  './EXPOSURE_PLATE.md',
  './REVERSE_LEDGER.md',
  './REST_SCORE.md',
  './OFFCUT_DRAWER.md',
  './BORDER_OFFICE.md',
  './LOAD_BEARING_SAMPLE.md',
  './GAUGE_BENCH.md',
  './COSMIC_RECEIVE_DESK.md',
  './CELESTIAL_ESCAPEMENT.md',
  './PLANETARY_HELIODON.md',
  './DEEP_SPACE.md',
  './POSSIBILITY_ENGINE.md',
  './FRAME_SHIFTER.md',
  './CAUSAL_SIGNAL_BOX.md',
  './GRAVITATIONAL_COPY_ROOM.md',
  './REDSHIFT_RULER.md',
  './ORIGIN_MACHINE.md',
  './SAME_ANSWER_MACHINE.md',
  './WEB1_HOME.md'
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