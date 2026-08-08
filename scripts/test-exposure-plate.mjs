import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const commons = require('../data-core.js');
const core = require('../exposure-plate-core.js');
const view = fs.readFileSync(new URL('../exposure-plate.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../exposure-plate.css', import.meta.url), 'utf8');
const record = fs.readFileSync(new URL('../EXPOSURE_PLATE.md', import.meta.url), 'utf8');
const loader = fs.readFileSync(new URL('../cosmic-signal.js', import.meta.url), 'utf8');
const worker = fs.readFileSync(new URL('../service-worker.js', import.meta.url), 'utf8');

const weatherPoints = commons.STATIONS.map((station) => ({ ...station, available: true, temperature: 10, wind: 5, precipitation: 0 }));
const snapshot = {
  receivedAt: new Date('2026-08-08T07:00:00.000Z'),
  feeds: { earthquakes: true, solar: true, scales: true, weather: true, events: true },
  weather: { available: true, availableCount: 13, points: weatherPoints }
};

assert.equal(core.GRID_STEP_DEGREES, 10);
assert.equal(core.DISTANCE_BANDS.length, 4);
assert.equal(core.finiteCoordinate(null), null, 'missing coordinates must not coerce to zero');
assert.equal(core.normalizeStep(7), 10, 'non-dividing grid steps must fall back to the documented grid');
assert.equal(core.gridCenters(10).length, 648, '10-degree grid should have 18 × 36 cell centers');
assert.equal(core.currentStations(snapshot).length, 13);
assert.equal(core.currentStations({ ...snapshot, feeds: { ...snapshot.feeds, weather: false } }).length, 0,
  'known coordinates must not masquerade as current evidence when the weather feed failed');

const exact = core.nearestSample(commons.STATIONS[0], core.currentStations(snapshot));
assert.equal(exact.id, commons.STATIONS[0].id);
assert.equal(exact.distanceKm, 0);
assert.equal(core.bandForDistance(0), 'near');
assert.equal(core.bandForDistance(1500), 'near');
assert.equal(core.bandForDistance(1501), 'middle');
assert.equal(core.bandForDistance(3001), 'far');
assert.equal(core.bandForDistance(5001), 'remote');
assert.equal(core.bandForDistance(null), null);

const full = core.distanceField(snapshot);
assert.equal(full.available, true);
assert.equal(full.stationCount, 13);
assert.equal(full.cells.length, 648);
assert.equal(Object.values(full.counts).reduce((sum, value) => sum + value, 0), 648);
assert.ok(full.farthest);
assert.ok(full.farthest.distanceKm > 0);
assert.ok(commons.STATIONS.some((station) => station.id === full.farthest.nearestId));
assert.match(core.fieldSentence(full), /farthest 10° grid-cell center/i);
assert.match(core.fieldSentence(full), /nearest sample/i);

const onePoint = core.distanceField({
  ...snapshot,
  weather: { ...snapshot.weather, points: weatherPoints.map((point, index) => ({ ...point, available: index === 0 })) }
});
assert.equal(onePoint.stationCount, 1);
assert.ok(onePoint.farthest.distanceKm >= full.farthest.distanceKm,
  'removing current evidence must not shrink the farthest nearest-sample distance');

const none = core.distanceField({
  ...snapshot,
  weather: { ...snapshot.weather, points: weatherPoints.map((point) => ({ ...point, available: false })) }
});
assert.equal(none.available, false);
assert.equal(none.cells.length, 0);
assert.equal(none.farthest, null);
assert.match(core.fieldSentence(none), /No currently available weather point/);

assert.match(view, /museum:commons-snapshot/);
assert.match(view, /activeBand = 'all';[\s\S]+render\(\);/, 'every real latch must reset the highlight');
assert.match(view, /THE EXPOSURE PLATE \/ THE WORLD WE DID NOT MEASURE/);
assert.match(view, /Distance is not uncertainty/i);
assert.match(view, /not promised to represent/i);
assert.match(view, /10° × 10°/);
assert.match(view, /field-sheet-exposure/);
assert.match(view, /data-exposure-plate-styles/);
assert.match(view, /aria-pressed/);
assert.match(view, /aria-live/);
assert.match(view, /http:\/\/www\.w3\.org\/2000\/svg/, 'SVG DOM creation must use the standard namespace identifier');
assert.doesNotMatch(view, /\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource/i);
assert.doesNotMatch(view, /setInterval|setTimeout|requestAnimationFrame|localStorage|sessionStorage|indexedDB|document\.cookie|navigator\.geolocation/i);
const viewWithoutSvgNamespace = view.replaceAll('http://www.w3.org/2000/svg', '');
assert.doesNotMatch(viewWithoutSvgNamespace, /analytics|telemetry|https?:\/\//i,
  'view must not contain a runtime remote URL beyond the inert SVG namespace identifier');

for (const pattern of [/@media \(max-width: 760px\)/, /@media \(max-width: 620px\)/, /prefers-reduced-motion/, /prefers-contrast/, /@media print/, /min-height:\s*44px/, /:focus-visible/]) assert.match(css, pattern);
assert.doesNotMatch(css, /@import\s+url|font-face|https?:\/\//i);

for (const pattern of [/Concept A/, /Concept B/, /Concept C/, /Concept A was discarded/, /The Exposure Plate \/ The World We Did Not Measure/, /zero runtime requests/i, /not uncertainty/i, /does not convert cell counts into a percentage of Earth’s surface/i, /greatCircleDistanceKm/, /10° × 10°/]) assert.match(record, pattern);

assert.match(loader, /isolation-board\.js[\s\S]+exposure-plate-core\.js[\s\S]+exposure-plate\.js/,
  'Exposure Plate should extend the current Commons module chain without dropping the Isolation Board');
for (const asset of ['./exposure-plate-core.js', './exposure-plate.js', './exposure-plate.css', './EXPOSURE_PLATE.md']) {
  assert.ok(worker.includes(`'${asset}'`), `offline shell should cache ${asset}`);
}

console.log('Exposure Plate distance-only geometry, no-interpolation contract, current-evidence semantics, accessibility, privacy, and offline shell verified.');
