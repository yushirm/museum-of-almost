import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../service-worker.js', import.meta.url), 'utf8');

assert.match(source, /const PREVIOUS_CACHE_NAME = 'museum-of-almost-commons-now-v10-front-page-polish'/);
assert.match(source, /const CACHE_NAME = 'museum-of-almost-commons-now-v11-sample-and-hold'/);
assert.match(source, /const ACTIVE_CACHE_NAME = 'museum-of-almost-commons-now-v12-thickness-of-now'/);
assert.match(source, /const PREVIOUS_PREVIOUS_CURRENT_CACHE_NAME = 'museum-of-almost-v15-gallery-foyer'/);
assert.match(source, /const PREVIOUS_CURRENT_CACHE_NAME = 'museum-of-almost-v16-fresh-online'/);
assert.match(source, /const WITNESS_SEAL_CACHE_NAME = 'museum-of-almost-v17-witness-seal'/);
assert.match(source, /const POSSIBILITY_ENGINE_CACHE_NAME = 'museum-of-almost-v18-possibility-engine'/);
assert.match(source, /const ISOLATION_BOARD_CACHE_NAME = 'museum-of-almost-v19-isolation-board'/);
assert.match(source, /const FRAME_SHIFTER_CACHE_NAME = 'museum-of-almost-v20-frame-shifter'/);
assert.match(source, /const EXPOSURE_PLATE_CACHE_NAME = 'museum-of-almost-v21-exposure-plate'/);
assert.match(source, /const REVERSE_LEDGER_CACHE_NAME = 'museum-of-almost-v22-reverse-ledger'/);
assert.match(source, /const CAUSAL_SIGNAL_BOX_CACHE_NAME = 'museum-of-almost-v23-causal-signal-box'/);
assert.match(source, /const REST_SCORE_CACHE_NAME = 'museum-of-almost-v24-rest-score'/);
assert.match(source, /const GRAVITATIONAL_COPY_ROOM_CACHE_NAME = 'museum-of-almost-v25-gravitational-copy-room'/);
assert.match(source, /const REDSHIFT_RULER_CACHE_NAME = 'museum-of-almost-v26-redshift-ruler'/);
assert.match(source, /const OFFCUT_DRAWER_CACHE_NAME = 'museum-of-almost-v27-offcut-drawer'/);
assert.match(source, /const CURRENT_CACHE_NAME = 'museum-of-almost-v28-origin-machine'/);
for (const asset of [
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
  './WEB1_HOME.md'
]) {
  assert.ok(source.includes(`'${asset}'`), `service worker should cache ${asset}`);
}

assert.match(source, /APP_SHELL\.map\(\(asset\) => new Request\(asset, \{ cache: 'reload' \}\)\)/,
  'install should refill the offline shell from the deployed files instead of a stale browser HTTP cache');
assert.match(source, /caches\.open\(CURRENT_CACHE_NAME\)/);
assert.match(source, /key !== CURRENT_CACHE_NAME/);
assert.match(source, /url\.origin !== self\.location\.origin/);
assert.match(source, /request\.mode === 'navigate'/);
assert.match(source, /async function networkFirst[\s\S]+fetch\(request, \{ cache: 'no-cache' \}\)[\s\S]+caches\.match\(request\)/,
  'same-origin requests should revalidate online before falling back to the offline cache');
assert.match(source, /const fallbackToIndex = url\.pathname === scopePath/,
  'only root-scope navigation should use the museum entrance as its offline index fallback');
assert.match(source, /caches\.match\('\.\/index\.html'\)/,
  'root-scope navigation should retain the museum entrance as its offline index fallback');
assert.match(source, /event\.respondWith\(networkFirst\(request, fallbackToIndex\)\)/,
  'navigations should prefer the deployed document and use the requested cached document only offline');
assert.match(source, /event\.respondWith\(networkFirst\(request\)\)/,
  'same-origin assets should prefer the deployed file while preserving offline fallback');
assert.match(source, /clients\.claim\(\)/);
assert.match(source, /clients\.matchAll\(\{ type: 'window', includeUncontrolled: true \}\)/);
assert.match(source, /client\.navigate\(client\.url\)/,
  'a worker architecture upgrade should still reload open pages once so the new cache policy takes control');
assert.match(source, /startsWith\('museum-of-almost-'\)/);
assert.match(source, /caches\.delete/);
assert.doesNotMatch(source, /https?:\/\//, 'service worker must not proxy or cache public live-data services');
assert.doesNotMatch(source, /analytics|telemetry|pixel|beacon/i);

console.log('Witness Seal, Possibility Engine, Isolation Board, Frame Shifter, Exposure Plate, Reverse Ledger, Causal Signal Box, Rest Score, Gravitational Copy Room, Redshift Ruler, Offcut Drawer, and Origin Machine offline shell plus fresh-online cached-offline behavior verified.');
