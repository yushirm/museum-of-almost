import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const commons = require('../data-core.js');
const core = require('../offcut-drawer-core.js');
const view = fs.readFileSync(new URL('../offcut-drawer.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../offcut-drawer.css', import.meta.url), 'utf8');
const record = fs.readFileSync(new URL('../OFFCUT_DRAWER.md', import.meta.url), 'utf8');
const archive = fs.readFileSync(new URL('../SUCCESS_ARCHIVE.md', import.meta.url), 'utf8');
const html = fs.readFileSync(new URL('../commons-now.html', import.meta.url), 'utf8');
const observer = fs.readFileSync(new URL('../temporal-sounding.js', import.meta.url), 'utf8');
const loader = fs.readFileSync(new URL('../cosmic-signal.js', import.meta.url), 'utf8');
const app = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const dataCore = fs.readFileSync(new URL('../data-core.js', import.meta.url), 'utf8');
const worker = fs.readFileSync(new URL('../service-worker.js', import.meta.url), 'utf8');

const quakePayload = {
  features: [
    { properties: { type: 'earthquake', mag: 5.14 }, geometry: { coordinates: [0, 0, 10] } },
    { properties: { type: 'earthquake', mag: 2.82 }, geometry: { coordinates: [0, 0, 20] } }
  ]
};
const solarPayload = { TimeStamp: '2026-08-08T09:00:00Z', SolarWindSpeed: '487.46' };
const temperatures = [12.34, 12.36, 12.3, 71.2, -101.2, 0.04, -0.04, 1.25, 1.24, 5, 5.01, 5.09, null];
const weatherPayload = commons.STATIONS.map((station, index) => ({
  latitude: station.lat,
  longitude: station.lon,
  current: {
    ...(temperatures[index] === null ? {} : { temperature_2m: temperatures[index] }),
    wind_speed_10m: 5 + index,
    precipitation: 0
  }
}));

const snapshot = {
  receivedAt: new Date('2026-08-08T09:10:00.000Z'),
  earthquakes: commons.normalizeEarthquakes(quakePayload),
  solar: commons.normalizeSolarWind(solarPayload),
  weather: commons.normalizeWeather(weatherPayload),
  scales: { available: false, value: null },
  events: { available: true, count: 0, capped: false, categories: [] },
  feeds: { earthquakes: true, solar: true, scales: false, weather: true, events: true }
};

assert.equal(core.finite(null), null, 'missing values must never coerce to zero');
assert.equal(core.clamp(null, 0, 1), null, 'missing values must stay missing through a range guard');
assert.equal(core.classify(1.04, 1), core.STATES.DOWN);
assert.equal(core.classify(1.04, 1.1), core.STATES.UP);
assert.equal(core.classify(1, 1), core.STATES.EXACT);
assert.equal(core.classify(null, 1), core.STATES.MISSING);
assert.equal(core.residue(487.46, 488), -0.54);

const waiting = core.buildTrace(null, { receivedAt: null }, commons.STATIONS);
assert.equal(waiting.waiting, true);
assert.equal(waiting.total, 0);
assert.match(core.summarySentence(waiting), /Waiting for the first real Commons latch/i);

const trace = core.buildTrace({
  earthquakes: quakePayload,
  solar: solarPayload,
  weather: weatherPayload
}, snapshot, commons.STATIONS);

assert.equal(trace.waiting, false);
assert.equal(trace.total, 15, 'Offcut Drawer scope must stay fixed at 15 selected numeric paths');
assert.deepEqual(trace.counts, { exact: 4, up: 5, down: 5, missing: 1 });
assert.match(core.summarySentence(trace), /formatting residues, not uncertainty or accuracy/i);

const byId = new Map(trace.measures.map((entry) => [entry.id, entry]));
const quake = byId.get('earthquake-strongest');
assert.equal(quake.source, 5.14);
assert.equal(quake.bounded, 5.14);
assert.equal(quake.normalized, 5.1, 'trace must use the actual normalized snapshot value');
assert.equal(quake.displayed, 5.1);
assert.equal(quake.state, core.STATES.DOWN);
assert.equal(quake.offcut, 0.04);
assert.equal(quake.normalizationResidue, 0.04);
assert.equal(quake.displayResidue, 0);

const solar = byId.get('solar-wind-speed');
assert.equal(solar.source, 487.46);
assert.equal(solar.bounded, 487.46);
assert.equal(solar.normalized, 487.5);
assert.equal(solar.displayed, 488, 'solar display must mirror the Commons whole-km/s Math.round rule');
assert.equal(solar.state, core.STATES.UP);
assert.equal(solar.offcut, -0.54);
assert.equal(solar.normalizationResidue, -0.04);
assert.equal(solar.displayResidue, -0.5);

assert.equal(byId.get('temperature-01').state, core.STATES.DOWN);
assert.equal(byId.get('temperature-02').state, core.STATES.UP);
assert.equal(byId.get('temperature-03').state, core.STATES.EXACT);
assert.equal(byId.get('temperature-04').boundingApplied, true);
assert.equal(byId.get('temperature-04').source, 71.2);
assert.equal(byId.get('temperature-04').bounded, 70);
assert.equal(byId.get('temperature-04').offcut, 0, 'range bounding must stay separate from the rounding offcut');
assert.equal(byId.get('temperature-05').boundingApplied, true);
assert.equal(byId.get('temperature-05').bounded, -100);
assert.equal(byId.get('temperature-13').state, core.STATES.MISSING);

const missingSolar = core.buildTrace({
  earthquakes: quakePayload,
  solar: null,
  weather: weatherPayload
}, {
  ...snapshot,
  solar: { available: false, speed: null, state: 'unavailable' },
  feeds: { ...snapshot.feeds, solar: false }
}, commons.STATIONS);
assert.equal(new Map(missingSolar.measures.map((entry) => [entry.id, entry])).get('solar-wind-speed').state, core.STATES.MISSING,
  'failed current source must not reuse an earlier numeric path');

assert.equal(core.filterMeasures(trace, 'exact').length, 4);
assert.equal(core.filterMeasures(trace, 'up').length, 5);
assert.equal(core.filterMeasures(trace, 'down').length, 5);
assert.equal(core.filterMeasures(trace, 'missing').length, 1);
assert.equal(core.filterMeasures(trace, 'nonsense').length, 15, 'unknown filter should fail open to the whole fixed trace');

for (const pattern of [
  /\.map\(\(value\) => clamp\(value, -2, 10\)\)/,
  /round\(Math\.max\(\.\.\.magnitudes\), 1\)/,
  /round\(clamp\(fallback, 0, 2000\), 1\)/,
  /round\(clamp\(temperature, -100, 70\), 1\)/
]) assert.match(dataCore, pattern, `Offcut mirror depends on established normalization rule ${pattern}`);

assert.match(app, /snapshot\.earthquakes\.strongest\.toFixed\(1\)/,
  'magnitude display should still print one decimal');
assert.match(app, /Math\.round\(snapshot\.solar\.speed\)/,
  'solar display should still round normalized speed to a whole number');
assert.match(app, /weather\.temperature\.toFixed\(1\)|weather\.temperature\.toFixed\(1\)/,
  'selected-station temperature should still print one decimal');

const coreScript = html.indexOf('<script src="offcut-drawer-core.js" defer></script>');
const observerScript = html.indexOf('<script src="temporal-sounding.js" defer></script>');
const appScript = html.indexOf('<script src="app.js" defer></script>');
assert.ok(coreScript >= 0 && coreScript < observerScript && observerScript < appScript,
  'precision core must exist before the passive observer and first Commons acquisition');

assert.match(observer, /response\.clone\(\)\.json\(\)/,
  'Offcut Drawer must reuse the already-existing passive response clone');
assert.match(observer, /publishPrecisionTrace\(cycle\.records, snapshot\)/);
assert.match(observer, /earthquakes: records\?\.earthquakes\?\.payload/);
assert.match(observer, /solar: records\?\.solar\?\.payload/);
assert.match(observer, /weather: records\?\.weather\?\.payload/);
assert.match(observer, /MuseumCommonsPrecisionTrace = trace/);
assert.match(observer, /museum:commons-precision-trace/);
assert.ok(observer.indexOf('publishPrecisionTrace(cycle.records, snapshot)') < observer.indexOf('cycle.records = {}'),
  'trace must be selected before the existing short-lived observer records are cleared');
assert.doesNotMatch(observer, /localStorage|sessionStorage|indexedDB|document\.cookie|navigator\.geolocation/i);

assert.match(loader, /rest-score\.js[\s\S]+offcut-drawer\.js/,
  'interactive Offcut view should extend the progressive Commons chain after Rest Score');
assert.doesNotMatch(loader, /offcut-drawer-core\.js/,
  'static precision core should not be requested a second time by the progressive loader');

assert.match(view, /museum:commons-snapshot/);
assert.match(view, /museum:commons-precision-trace/);
assert.match(view, /activeFilter = 'all'/);
assert.match(view, /OFFCUT = BOUNDED − DISPLAYED/);
assert.match(view, /Offcut is not error\./);
assert.match(view, /Positive means the display rounded down; negative means it rounded up\./);
assert.match(view, /RANGE GUARD APPLIED/);
assert.match(view, /field-sheet-offcut/);
assert.match(view, /aria-pressed/);
assert.match(view, /aria-live/);
assert.doesNotMatch(view, /\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource/i);
assert.doesNotMatch(view, /setInterval|setTimeout|requestAnimationFrame|localStorage|sessionStorage|indexedDB|document\.cookie|navigator\.geolocation/i);
assert.doesNotMatch(view, /analytics|telemetry|https?:\/\//i);

for (const pattern of [
  /@media \(max-width: 760px\)/,
  /@media \(max-width: 620px\)/,
  /prefers-reduced-motion/,
  /prefers-contrast/,
  /@media print/,
  /\.offcut-drawer-section\s*\{[\s\S]*display:\s*none !important/,
  /min-height:\s*44px/,
  /:focus-visible/
]) assert.match(css, pattern);
assert.doesNotMatch(css, /@import\s+url|font-face|https?:\/\//i);

for (const pattern of [
  /Concept A — Display Precision Audit/,
  /Concept B — The Offcut Drawer/,
  /Concept C — Put the Discarded Digits in the Biggest Type/,
  /Concept A was discarded/,
  /15 numeric paths/,
  /bounded numeric - displayed numeric/,
  /Bounding is not rounding/,
  /No uncertainty claim/,
  /adds zero data-service requests/i,
  /static deferred script placed before `temporal-sounding\.js` and `app\.js`/,
  /never whole raw payloads/i
]) assert.match(record, pattern);

for (const pattern of [
  /## 2026-08-08 — COMMONS \/ NOW — The Offcut Drawer/,
  /\*\*The Offcut Drawer \/ The Page Shaves Its Numbers\*\*/,
  /Feature-complete evidence head:[\s\S]*`1ee4f08cc66a3fc9c9f3dde15c2b02a6f6e02a7d`/,
  /#64 — Add the Offcut Drawer/,
  /run: `178`/[,
  /conclusion: `success`/
]) assert.match(archive, pattern, `Success Archive should retain Offcut Drawer evidence ${pattern}`);

for (const asset of ['./offcut-drawer-core.js', './offcut-drawer.js', './offcut-drawer.css', './OFFCUT_DRAWER.md']) {
  assert.ok(worker.includes(`'${asset}'`), `offline shell should cache ${asset}`);
}

console.log('Offcut Drawer source-to-display trace, rounding direction, range-guard separation, passive acquisition reuse, accessibility, privacy, success-archive evidence, and offline contracts verified.');