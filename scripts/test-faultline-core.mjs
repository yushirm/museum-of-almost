import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const core = require('../faultline-core.js');
const view = fs.readFileSync(new URL('../faultline.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../faultline.css', import.meta.url), 'utf8');
const record = fs.readFileSync(new URL('../FAULTLINE_CORE.md', import.meta.url), 'utf8');

assert.equal(core.STRATA.length, 5);
assert.equal(new Set(core.STRATA.map((item) => item.id)).size, 5);

const allAvailable = Object.fromEntries(core.STRATA.map((item) => [item.id, true]));
const solarScales = core.compareStrata('solar', 'scales', allAvailable);
assert.equal(solarScales.verdict, 'shared-structure');
assert.equal(solarScales.structuralMatches, 3);
assert.equal(solarScales.numericComparable, false);
assert.equal(solarScales.dimensions.find((item) => item.id === 'time').aligned, true);
assert.equal(solarScales.dimensions.find((item) => item.id === 'space').aligned, true);
assert.equal(solarScales.dimensions.find((item) => item.id === 'shape').aligned, true);
assert.match(solarScales.sentence, /Direct numeric equivalence is refused/i);

const earthEvents = core.compareStrata('earthquakes', 'events', allAvailable);
assert.equal(earthEvents.verdict, 'shared-structure');
assert.equal(earthEvents.structuralMatches, 2);
assert.equal(earthEvents.dimensions.find((item) => item.id === 'time').aligned, false);
assert.equal(earthEvents.dimensions.find((item) => item.id === 'space').aligned, true);
assert.equal(earthEvents.dimensions.find((item) => item.id === 'shape').aligned, true);

const earthWeather = core.compareStrata('earthquakes', 'weather', allAvailable);
assert.equal(earthWeather.verdict, 'fault-line');
assert.equal(earthWeather.structuralMatches, 0);
assert.match(earthWeather.sentence, /common latch is the only shared frame/i);

const degraded = core.compareStrata('solar', 'weather', { solar: true, weather: false });
assert.equal(degraded.verdict, 'degraded');
assert.equal(degraded.bothAvailable, false);
assert.match(degraded.sentence, /no missing value is inferred/i);

const availability = core.availabilityFromSnapshot({ feeds: { earthquakes: true, solar: false, scales: true, weather: true, events: false } });
assert.deepEqual(availability, { earthquakes: true, solar: false, scales: true, weather: true, events: false });
assert.equal(core.compareStrata('missing', 'solar', allAvailable), null);

assert.match(view, /museum:commons-snapshot/);
assert.match(view, /MuseumCommonsSnapshot/);
assert.match(view, /THE FAULTLINE CORE \/ SEMANTIC STRATIGRAPHY/);
assert.match(view, /DIRECT NUMERIC EQUIVALENCE/);
assert.match(view, /insertAdjacentElement\('afterend'/);
assert.doesNotMatch(view, /\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource|navigator\.geolocation|localStorage|sessionStorage|indexedDB|document\.cookie/i);
assert.doesNotMatch(view, /setInterval|setTimeout|requestAnimationFrame/i);
assert.doesNotMatch(view, /https?:\/\//i);

assert.match(css, /max-width:\s*620px/);
assert.match(css, /prefers-reduced-motion/);
assert.match(css, /prefers-contrast/);
assert.match(css, /@media print/);
assert.doesNotMatch(css, /@import\s+url|font-face|https?:\/\//i);

assert.match(record, /Concept A/);
assert.match(record, /Concept B/);
assert.match(record, /Concept C/);
assert.match(record, /Concept A was discarded/);
assert.match(record, /adds no network request/i);
assert.match(record, /shared five-feed latch/i);
assert.match(record, /numeric equivalence/i);

console.log('Faultline Core semantic strata, refusal rules, local-only boundary, responsive styles, and design record verified.');