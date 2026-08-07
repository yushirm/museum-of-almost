import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const live = require('../live-entropy-core.js');

assert.equal(
  live.USGS_URL,
  'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson'
);
assert.equal(
  live.NOAA_URL,
  'https://services.swpc.noaa.gov/products/summary/solar-wind-speed.json'
);

const earthquakes = live.normalizeEarthquakes({
  features: [
    { properties: { type: 'earthquake', mag: 1.2 }, geometry: { coordinates: [0, 0, 5] } },
    { properties: { type: 'earthquake', mag: 4.7 }, geometry: { coordinates: [0, 0, 18] } },
    { properties: { type: 'quarry blast', mag: 8.8 }, geometry: { coordinates: [0, 0, 2] } }
  ]
});
assert.equal(earthquakes.available, true);
assert.equal(earthquakes.count, 2);
assert.equal(earthquakes.strongest, 4.7);
assert.equal(earthquakes.meanDepth, 11.5);
assert.ok(earthquakes.pressure > 0 && earthquakes.pressure <= 1);
assert.deepEqual(Object.keys(earthquakes).sort(), ['available', 'count', 'meanDepth', 'pressure', 'strongest'].sort());

const solarObject = live.normalizeSolarWind([{ time_tag: 'fictional-time', speed: 612.4 }]);
assert.equal(solarObject.available, true);
assert.equal(solarObject.speed, 612.4);
assert.ok(solarObject.pressure > 0 && solarObject.pressure < 1);

const solarLegacy = live.normalizeSolarWind([
  ['Time Tag', 'Speed'],
  ['fictional-time', '487.2']
]);
assert.equal(solarLegacy.available, true);
assert.equal(solarLegacy.speed, 487.2);
assert.equal(live.normalizeSolarWind({ time_tag: 'none' }).available, false);

const composed = live.composeLiveEntropy(earthquakes, solarObject);
assert.equal(composed.available, true);
assert.equal(composed.sourceCount, 2);
assert.ok(composed.pressure >= 0 && composed.pressure <= 1);
assert.ok(composed.bias >= -1 && composed.bias <= 1);
assert.ok(composed.position >= 150 && composed.position <= 850);
assert.ok(composed.scaleA >= 0.91 && composed.scaleA <= 1.09);
assert.ok(composed.scaleB >= 0.91 && composed.scaleB <= 1.09);
assert.ok(composed.fieldScale >= 1 && composed.fieldScale <= 1.18);
assert.ok(['quiet', 'stirring', 'charged', 'insistent'].includes(composed.label));

const quakeOnly = live.composeLiveEntropy(earthquakes, { available: false });
assert.equal(quakeOnly.sourceCount, 1);
assert.ok(quakeOnly.position <= 500, 'terrestrial-only pressure should lean toward returning');
const solarOnly = live.composeLiveEntropy({ available: false }, solarObject);
assert.equal(solarOnly.sourceCount, 1);
assert.ok(solarOnly.position >= 500, 'solar-only pressure should lean toward outward');
const unavailable = live.composeLiveEntropy({ available: false }, { available: false });
assert.deepEqual(unavailable, {
  available: false,
  sourceCount: 0,
  pressure: 0,
  bias: 0,
  position: 500,
  scaleA: 1,
  scaleB: 1,
  fieldScale: 1,
  label: 'unavailable'
});

assert.equal(live.correspondenceFor(500, NaN, 0).key, 'unanswered');
assert.equal(live.correspondenceFor(500, 560, 1).key, 'accord');
assert.equal(live.correspondenceFor(500, 680, 1).key, 'near');
assert.equal(live.correspondenceFor(500, 820, 1).key, 'counterpoint');
assert.equal(live.correspondenceFor(150, 850, 1).key, 'resistance');

console.log('Live entropy source reduction, bounded pressure mapping, and treaty correspondence verified.');
