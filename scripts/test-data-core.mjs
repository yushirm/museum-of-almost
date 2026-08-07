import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const core = require('../data-core.js');

assert.equal(core.BUILD_SEED, '6bc76dc33337414e7c9f9ccbd7539976d98ac371444860c605fb88003174ded2');
assert.equal(core.STATIONS.length, 13);
assert.deepEqual(core.STATIONS[0], { id: '01', lat: -35.67, lon: 74.26 });
assert.deepEqual(core.STATIONS[12], { id: '13', lat: 27.22, lon: 103.15 });
assert.equal(new Set(core.STATIONS.map((station) => station.id)).size, 13);

const earthquakes = core.normalizeEarthquakes({
  features: [
    { properties: { type: 'earthquake', mag: 1.2 }, geometry: { coordinates: [1, 2, 10] } },
    { properties: { type: 'earthquake', mag: 5.1 }, geometry: { coordinates: [1, 2, 30] } },
    { properties: { type: 'quarry blast', mag: 2.2 }, geometry: { coordinates: [1, 2, 5] } }
  ]
});
assert.deepEqual(earthquakes, {
  available: true,
  count: 2,
  strongest: 5.1,
  meanDepth: 20,
  significant: 1
});

assert.deepEqual(
  core.normalizeSolarWind({ TimeStamp: '2026-08-07T00:00:00Z', SolarWindSpeed: '487.4' }),
  { available: true, speed: 487.4, state: 'steady' }
);
assert.deepEqual(
  core.normalizeSolarWind([['time_tag', 'speed'], ['2026-08-07 00:00:00', '721']]),
  { available: true, speed: 721, state: 'very fast' }
);
assert.equal(core.normalizeSolarWind({ nope: 'x' }).available, false);

const weatherPayload = core.STATIONS.map((station, index) => ({
  latitude: station.lat,
  longitude: station.lon,
  current: {
    temperature_2m: -6 + index * 3,
    wind_speed_10m: 5 + index,
    precipitation: index % 4 === 0 ? 1.2 : 0
  }
}));
const weather = core.normalizeWeather(weatherPayload);
assert.equal(weather.available, true);
assert.equal(weather.availableCount, 13);
assert.equal(weather.minTemp, -6);
assert.equal(weather.maxTemp, 30);
assert.equal(weather.raining, 4);
assert.equal(weather.points[5].id, '06');
assert.equal(weather.points[5].temperature, 9);

const events = core.normalizeEvents({
  events: [
    { categories: [{ id: 'wildfires', title: 'Wildfires' }] },
    { categories: [{ id: 'wildfires', title: 'Wildfires' }, { id: 'severeStorms', title: 'Severe Storms' }] },
    { categories: [{ id: 'volcanoes', title: 'Volcanoes' }] }
  ]
});
assert.equal(events.count, 3);
assert.deepEqual(events.categories[0], { title: 'Wildfires', count: 2 });
assert.equal(events.capped, false);

assert.equal(core.sunState('2026-03-20T12:00:00Z', 0, 0), 'day');
assert.equal(core.sunState('2026-03-20T00:00:00Z', 0, 0), 'night');
assert.equal(core.sunState('invalid', 0, 0), 'unknown');

assert.deepEqual(core.stationPosition({ lat: 0, lon: 0 }), { x: 50, y: 50 });
assert.deepEqual(core.stationPosition({ lat: 90, lon: -180 }), { x: 0, y: 0 });
assert.equal(core.formatCoordinate(-35.67, 'N', 'S'), '35.67° S');
assert.equal(core.formatCoordinate(74.26, 'E', 'W'), '74.26° E');

assert.equal(core.greatCircleDistanceKm({ lat: 0, lon: 0 }, { lat: 0, lon: 0 }), 0);
assert.ok(Math.abs(core.greatCircleDistanceKm({ lat: 0, lon: 0 }, { lat: 0, lon: 90 }) - 10008) <= 1);
assert.deepEqual(core.observedRange(weather.points, 'temperature'), { available: true, min: -6, max: 30 });
assert.equal(core.metricPosition(-6, -6, 30), 0);
assert.equal(core.metricPosition(30, -6, 30), 100);
assert.equal(core.metricPosition(12, -6, 30), 50);
assert.equal(core.metricPosition(5, 5, 5), 50);
assert.equal(core.metricPosition(null, 0, 10), 50);
assert.deepEqual(core.observedRange([{ temperature: null }, { temperature: 4 }], 'temperature'), { available: true, min: 4, max: 4 });

const section = core.planetarySection(weather, '2026-03-20T12:00:00Z');
assert.equal(section.available, true);
assert.equal(section.points.length, 13);
assert.deepEqual(
  section.points.map((point) => point.id),
  ['03', '11', '10', '07', '06', '02', '08', '05', '12', '04', '01', '13', '09']
);
assert.deepEqual(section.ranges.temperature, { available: true, min: -6, max: 30 });
assert.deepEqual(section.ranges.wind, { available: true, min: 5, max: 17 });
assert.equal(section.points[0].lon, -175.28);
assert.equal(section.points.at(-1).lon, 175.71);
assert.ok(section.points.every((point, index, points) => index === 0 || point.longitudePosition >= points[index - 1].longitudePosition));
assert.equal(section.points.find((point) => point.id === '01').temperaturePosition, 0);
assert.equal(section.points.find((point) => point.id === '13').temperaturePosition, 100);

const missingSectionWeather = {
  points: weather.points.map((point) => point.id === '03'
    ? { ...point, temperature: null, wind: null, precipitation: null, available: false }
    : point)
};
const missingSection = core.planetarySection(missingSectionWeather, '2026-03-20T12:00:00Z');
const missingPost = missingSection.points.find((point) => point.id === '03');
assert.equal(missingPost.temperature, null);
assert.equal(missingPost.wind, null);
assert.equal(missingPost.precipitation, null);
assert.equal(missingPost.temperaturePosition, null);
assert.equal(missingPost.windPosition, null);
assert.equal(missingPost.precipitationPosition, null);

const unavailableComparison = core.compareStationPair(
  { id: 'A', lat: 0, lon: 0, temperature: null, wind: null, precipitation: null },
  { id: 'B', lat: 0, lon: 10, temperature: 5, wind: 7, precipitation: 0 },
  'day',
  'night'
);
assert.equal(unavailableComparison.temperatureDelta, null);
assert.match(core.differenceSentence(unavailableComparison, 'temperature'), /unavailable/);

const comparison = core.compareStationPair(weather.points[0], weather.points[7], 'night', 'day');
assert.equal(comparison.idA, '01');
assert.equal(comparison.idB, '08');
assert.equal(comparison.temperatureDelta, -21);
assert.equal(comparison.windDelta, -7);
assert.equal(comparison.precipitationDelta, 1.2);
assert.equal(comparison.sameLight, false);
assert.ok(comparison.distanceKm > 0);
assert.match(core.differenceSentence(comparison, 'temperature'), /Point 01 is 21\.0°C cooler than point 08/);
assert.match(core.differenceSentence(comparison, 'wind'), /less windy/);
assert.match(core.differenceSentence(comparison, 'precipitation'), /wetter right now/);
assert.match(core.differenceSentence(comparison, 'light'), /Point 01 is in night; point 08 is in day/);
assert.match(core.differenceSentence(comparison, 'distance'), /km apart along Earth’s surface/);

const sentence = core.snapshotSentence({
  earthquakes,
  solar: { available: true, speed: 487.4 },
  weather,
  events
});
assert.match(sentence, /2 earthquakes/);
assert.match(sentence, /487 km\/s/);
assert.match(sentence, /13 fixed world points/);
assert.match(sentence, /NASA EONET lists 3 open natural events/);

console.log('Commons / Now data reduction, fixed sample, daylight geometry, Difference Engine, and Planetary Section verified.');

const noonSolstice = core.solarGeometry('2026-06-21T12:00:00Z');
assert.ok(noonSolstice);
assert.ok(Math.abs(noonSolstice.subsolar.lat - 23.44) < 0.2);
assert.ok(Math.abs(noonSolstice.subsolar.lon) < 0.01);
assert.ok(Math.abs(noonSolstice.antisolar.lat + noonSolstice.subsolar.lat) < 1e-9);
assert.ok(Math.abs(Math.abs(noonSolstice.antisolar.lon) - 180) < 0.01);
assert.ok(core.solarElevation('2026-06-21T12:00:00Z', noonSolstice.subsolar.lat, noonSolstice.subsolar.lon) > 89.9);
assert.ok(core.solarElevation('2026-06-21T12:00:00Z', noonSolstice.antisolar.lat, noonSolstice.antisolar.lon) < -89.9);
assert.equal(core.normalizeLongitude(190), -170);
assert.equal(core.normalizeLongitude(-190), 170);
assert.equal(core.solarGeometry('invalid'), null);

assert.equal(core.solarGeometry(null), null);
assert.equal(core.sunState(null, 0, 0), 'unknown');
