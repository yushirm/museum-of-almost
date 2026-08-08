import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const commons = require('../data-core.js');
const core = require('../border-office-core.js');
const coreSource = fs.readFileSync(new URL('../border-office-core.js', import.meta.url), 'utf8');
const view = fs.readFileSync(new URL('../border-office.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../border-office.css', import.meta.url), 'utf8');
const record = fs.readFileSync(new URL('../BORDER_OFFICE.md', import.meta.url), 'utf8');
const loader = fs.readFileSync(new URL('../cosmic-signal.js', import.meta.url), 'utf8');
const dataCore = fs.readFileSync(new URL('../data-core.js', import.meta.url), 'utf8');
const worker = fs.readFileSync(new URL('../service-worker.js', import.meta.url), 'utf8');
const runtime = [coreSource, view].join('\n');

assert.deepEqual(core.FAMILY_IDS, ['solar', 'light', 'precipitation']);
assert.deepEqual(core.SOLAR_BORDERS, [350, 500, 700]);
assert.deepEqual(core.LIGHT_BORDERS, [-6, 0]);
assert.deepEqual(core.PRECIPITATION_BORDERS, [0]);
assert.equal(core.finite(null), null, 'missing values must never coerce to zero');

assert.equal(core.classifySolar(349.9), 'quiet');
assert.equal(core.classifySolar(350), 'steady');
assert.equal(core.classifySolar(499.9), 'steady');
assert.equal(core.classifySolar(500), 'fast');
assert.equal(core.classifySolar(699.9), 'fast');
assert.equal(core.classifySolar(700), 'very-fast');
assert.equal(core.classifySolar(null), 'missing');

assert.equal(core.classifyLightElevation(-6), 'night');
assert.equal(core.classifyLightElevation(-5.999), 'twilight');
assert.equal(core.classifyLightElevation(0), 'twilight');
assert.equal(core.classifyLightElevation(0.001), 'day');
assert.equal(core.classifyLightElevation(null), 'missing');

assert.equal(core.classifyPrecipitation(0), 'not-reporting');
assert.equal(core.classifyPrecipitation(0.1), 'reporting');
assert.equal(core.classifyPrecipitation(null), 'missing');

assert.deepEqual(core.nearestBorder(425, [350, 500, 700]), { border: 350, distance: 75 },
  'equal-distance ties should resolve deterministically to the lower border');
assert.deepEqual(core.nearestBorder(500, [350, 500, 700]), { border: 500, distance: 0 });
assert.match(core.exitCondition('solar', 'steady'), /below 350 or at 500 km\/s/);
assert.match(core.exitCondition('light', 'twilight'), /at or below −6°.*above 0°/);
assert.match(core.exitCondition('precipitation', 'not-reporting'), /only above 0 mm/);

const receivedAt = new Date('2026-08-08T10:00:00.000Z');
const weatherPoints = commons.STATIONS.map((station, index) => ({
  ...station,
  available: true,
  temperature: 10 + index,
  wind: 5 + index,
  precipitation: index < 3 ? 0.2 + index / 10 : 0
}));
const snapshot = {
  receivedAt,
  solar: { available: true, speed: 500, state: 'fast' },
  weather: {
    available: true,
    points: weatherPoints,
    availableCount: 13,
    raining: 3
  },
  feeds: { solar: true, weather: true }
};

const office = core.buildOffice(snapshot);
assert.equal(office.waiting, false);
assert.equal(office.totalLabels, 27, 'scope should remain one solar label plus thirteen light and thirteen precipitation labels');

const solar = core.familyById(office, 'solar');
assert.equal(solar.total, 1);
assert.equal(solar.entries[0].state, snapshot.solar.state, 'current normalized snapshot must remain authoritative for its solar label');
assert.equal(solar.entries[0].value, 500);
assert.equal(solar.entries[0].nearestBorder, 500);
assert.equal(solar.entries[0].margin, 0);
assert.match(solar.entries[0].exit, /FAST expires below 500 or at 700 km\/s/);

const light = core.familyById(office, 'light');
assert.equal(light.total, 13);
assert.equal(light.availableCount, 13);
for (const current of light.entries) {
  const station = commons.STATIONS.find((candidate) => `light-${candidate.id}` === current.id);
  assert.ok(station, `light entry ${current.id} should map to one fixed station`);
  assert.equal(current.state, commons.sunState(receivedAt, station.lat, station.lon),
    'Border Office light label must reuse the established Commons sun-state model');
  assert.ok([-6, 0].includes(current.nearestBorder));
  assert.ok(Number.isFinite(current.margin));
}

const precipitation = core.familyById(office, 'precipitation');
assert.equal(precipitation.total, 13);
assert.equal(precipitation.counts.reporting, snapshot.weather.raining,
  'per-point border membership must sum to the established weather.raining count');
assert.equal(precipitation.counts['not-reporting'], 10);
assert.equal(precipitation.entries[0].state, 'reporting');
assert.equal(precipitation.entries[3].state, 'not-reporting');
assert.match(precipitation.entries[3].exit, /begins only above 0 mm/);
assert.doesNotMatch(precipitation.entries[3].exit, /dry/i, 'zero precipitation must not be expanded into a dry-weather claim');

const missing = core.buildOffice({
  ...snapshot,
  solar: { available: false, speed: null, state: 'unavailable' },
  weather: {
    ...snapshot.weather,
    points: snapshot.weather.points.map((point, index) => index === 0 ? { ...point, precipitation: null } : point)
  }
});
assert.equal(core.familyById(missing, 'solar').entries[0].state, 'missing');
assert.equal(core.familyById(missing, 'precipitation').entries[0].state, 'missing');
assert.match(core.summarySentence(missing, 'solar'), /0 of 1 solar wind labels can be evaluated/i);

const waiting = core.buildOffice({ receivedAt: null });
assert.equal(waiting.waiting, true);
assert.match(core.summarySentence(waiting, 'solar'), /Waiting for the first real Commons latch/i);

assert.ok(dataCore.includes("const state = speed < 350 ? 'quiet' : speed < 500 ? 'steady' : speed < 700 ? 'fast' : 'very fast';"),
  'Border Office solar borders must remain pinned to the canonical normalizer');
assert.ok(dataCore.includes("if (elevation > 0) return 'day';"));
assert.ok(dataCore.includes("if (elevation > -6) return 'twilight';"));
assert.ok(dataCore.includes("const raining = availablePoints.filter((point) => Number.isFinite(point.precipitation) && point.precipitation > 0).length;"),
  'Border Office precipitation membership must remain pinned to the canonical weather reducer');

assert.match(loader, /offcut-drawer\.js[\s\S]+border-office-core\.js[\s\S]+border-office\.js/,
  'Border Office should extend the progressive Commons chain after the Offcut Drawer');

for (const pattern of [
  /THE BORDER OFFICE \/ THE WORLD DOES NOT KNOW OUR LABELS/,
  /NO LABEL WITHOUT ITS EXIT CONDITION/,
  /Near a border is not uncertain\./,
  /field-sheet-border-office/,
  /aria-pressed/,
  /aria-live/
]) assert.match(view, pattern);
assert.doesNotMatch(runtime, /\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource/i);
assert.doesNotMatch(runtime, /setInterval|setTimeout|requestAnimationFrame|localStorage|sessionStorage|indexedDB|document\.cookie|navigator\.geolocation|history\.(?:pushState|replaceState)/i);
assert.doesNotMatch(runtime, /analytics|telemetry|https?:\/\//i);
assert.doesNotMatch(runtime, /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i);
assert.doesNotMatch(runtime, /\bAKIA[0-9A-Z]{16}\b|\bsk-(?:proj-)?[A-Za-z0-9_-]{16,}\b|BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY/i);
assert.doesNotMatch(runtime, /\/Users\/|\/home\/[A-Za-z0-9._-]+|C:\\Users\\/i);

for (const pattern of [
  /min-height:\s*44px/,
  /:focus-visible/,
  /@media \(max-width: 760px\)/,
  /@media \(max-width: 620px\)/,
  /prefers-reduced-motion/,
  /prefers-contrast/,
  /@media print/,
  /\.border-office-section\s*\{[\s\S]*display:\s*none !important/
]) assert.match(css, pattern);
assert.doesNotMatch(css, /@import\s+url|font-face|https?:\/\//i);

for (const pattern of [
  /Concept A — The Threshold Registry/,
  /Concept B — The Border Office/,
  /Concept C — No Label Without Its Exit Condition/,
  /Concept A was discarded/,
  /The world provides values\. The Museum draws some of the lines/,
  /Margin to nearest border/,
  /not.*uncertainty/i,
  /does \*\*not\*\* translate `0 mm` into “dry/,
  /adds no response observation, provider payload retention, fetch, or alternate acquisition path/i,
  /Require the feature-complete head to pass `check`[\s\S]*repository Success Archive[\s\S]*archive-bearing head to pass `check` again/
]) assert.match(record, pattern);

for (const asset of ['./border-office-core.js', './border-office.js', './border-office.css', './BORDER_OFFICE.md']) {
  assert.ok(worker.includes(`'${asset}'`), `offline shell should cache ${asset}`);
}

console.log('Border Office local solar, light, and precipitation boundaries; exit conditions; native-unit margins; missing-value behavior; accessibility; privacy; loader; and offline contracts verified.');
