import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const core = require('../shutter-cabinet-core.js');
const coreSource = fs.readFileSync(new URL('../shutter-cabinet-core.js', import.meta.url), 'utf8');
const view = fs.readFileSync(new URL('../shutter-cabinet.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../shutter-cabinet.css', import.meta.url), 'utf8');
const record = fs.readFileSync(new URL('../SHUTTER_CABINET.md', import.meta.url), 'utf8');
const loader = fs.readFileSync(new URL('../cosmic-signal.js', import.meta.url), 'utf8');
const app = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const signalCore = fs.readFileSync(new URL('../cosmic-signal-core.js', import.meta.url), 'utf8');
const soundingRecord = fs.readFileSync(new URL('../SOUNDING_WELL.md', import.meta.url), 'utf8');
const worker = fs.readFileSync(new URL('../service-worker.js', import.meta.url), 'utf8');
const runtime = `${coreSource}\n${view}\n${css}`;

assert.deepEqual(core.CLAIMS.map(({ id }) => id), ['earthquakes', 'solar', 'scales', 'weather', 'events']);
assert.deepEqual(Object.values(core.FORMS), ['TRAILING WINDOW', 'CURRENT READING', 'STATUS-DEFINED SET']);
assert.equal(core.claimById('earthquakes').form, core.FORMS.TRAILING_WINDOW);
assert.equal(core.claimById('solar').form, core.FORMS.CURRENT_READING);
assert.equal(core.claimById('scales').form, core.FORMS.CURRENT_READING);
assert.equal(core.claimById('weather').form, core.FORMS.CURRENT_READING);
assert.equal(core.claimById('events').form, core.FORMS.STATUS_SET);
assert.equal(core.finite(null), null, 'missing must not become zero');
assert.equal(core.finite(0), 0, 'numeric zero must remain finite');

const snapshot = {
  receivedAt: new Date('2026-08-08T17:00:00.000Z'),
  earthquakes: { available: true, count: 7, strongest: 4.8, meanDepth: 18.2, significant: 1 },
  solar: { available: true, speed: 0, state: 'quiet' },
  scales: { available: true, value: { 0: { G: { Scale: 0 }, S: { Scale: 0 }, R: { Scale: 0 } } } },
  weather: { available: true, availableCount: 13, points: [] },
  events: { available: true, count: 21, capped: false, categories: [] },
  feeds: { earthquakes: true, solar: true, scales: true, weather: true, events: true }
};

const initial = core.buildPair(snapshot);
assert.equal(initial.left.id, 'earthquakes');
assert.equal(initial.right.id, 'weather');
assert.equal(initial.contract.outcome, core.OUTCOMES.DIFFERENT);
assert.equal(initial.contract.commonForm, false);
assert.match(core.summarySentence(initial, true), /SAME LATCH\. DIFFERENT TEMPORAL SUPPORT\./);
assert.match(core.summarySentence(initial, true), /shared timeline is refused/i);

const solarWeather = core.buildPair(snapshot, 'solar', 'weather');
assert.equal(solarWeather.contract.outcome, core.OUTCOMES.COMMON);
assert.equal(solarWeather.contract.commonForm, true);
assert.match(core.summarySentence(solarWeather, true), /COMMON TEMPORAL FORM/);
assert.match(core.summarySentence(solarWeather, true), /not the same instant, timestamp age, duration, synchronization, or measurement process/i);

const scalesWeather = core.buildPair(snapshot, 'scales', 'weather');
assert.equal(scalesWeather.contract.outcome, core.OUTCOMES.COMMON);

const earthquakeEvents = core.buildPair(snapshot, 'earthquakes', 'events');
assert.equal(earthquakeEvents.contract.outcome, core.OUTCOMES.DIFFERENT);
assert.equal(earthquakeEvents.left.form, 'TRAILING WINDOW');
assert.equal(earthquakeEvents.right.form, 'STATUS-DEFINED SET');

const solarEvents = core.buildPair(snapshot, 'solar', 'events');
assert.equal(solarEvents.contract.outcome, core.OUTCOMES.DIFFERENT);
assert.match(solarEvents.right.scope, /does not turn that status membership into a trailing duration/i);

const sameClaim = core.comparisonContract('weather', 'weather');
assert.equal(sameClaim.outcome, core.OUTCOMES.SAME_CLAIM);
assert.equal(sameClaim.commonForm, false);

const unavailableSolar = core.buildPair({
  ...snapshot,
  solar: { available: false, speed: null, state: 'unavailable' }
}, 'solar', 'weather');
assert.equal(unavailableSolar.left.available, false);
assert.equal(unavailableSolar.left.form, core.FORMS.CURRENT_READING, 'current unavailability must not erase static temporal form');
assert.equal(unavailableSolar.contract.outcome, core.OUTCOMES.COMMON, 'comparison legality must remain static metadata');
assert.equal(unavailableSolar.left.readout, 'UNAVAILABLE IN THIS LATCH');

assert.match(core.currentReadout(snapshot, 'solar'), /^0\.0 km\/s/, 'real solar zero should remain a real readout');
assert.match(core.currentReadout(snapshot, 'earthquakes'), /^7 earthquake features in returned past-hour feed$/);
assert.match(core.currentReadout(snapshot, 'weather'), /^13\/13 fixed points/);
assert.match(core.currentReadout(snapshot, 'events'), /^21 returned open events$/);

const cappedEvents = core.buildPair({
  ...snapshot,
  events: { ...snapshot.events, count: 500, capped: true }
}, 'events', 'weather');
assert.match(cappedEvents.left.readout, /RETURNED WINDOW CAPPED AT 500/);
assert.match(cappedEvents.left.scope, /does not turn that status membership into a trailing duration/i);

const waiting = core.buildPair({ ...snapshot, receivedAt: null }, 'earthquakes', 'weather');
assert.equal(waiting.waiting, true);
assert.equal(waiting.contract.outcome, core.OUTCOMES.WAITING);
assert.match(core.summarySentence(waiting, true), /Waiting for the first real Commons latch/i);

for (const pattern of [
  /earthquakes: 'https:\/\/earthquake\.usgs\.gov\/earthquakes\/feed\/v1\.0\/summary\/all_hour\.geojson'/,
  /solar: 'https:\/\/services\.swpc\.noaa\.gov\/products\/summary\/solar-wind-speed\.json'/,
  /scales: 'https:\/\/services\.swpc\.noaa\.gov\/products\/noaa-scales\.json'/,
  /events: 'https:\/\/eonet\.gsfc\.nasa\.gov\/api\/v3\/events\?status=open&limit=500'/,
  /url\.searchParams\.set\('current', 'temperature_2m,wind_speed_10m,precipitation'\)/,
  /url\.searchParams\.set\('timezone', 'UTC'\)/
]) assert.match(app, pattern, `Shutter Cabinet must stay pinned to request contract ${pattern}`);

assert.match(signalCore, /function selectCurrentRecord\(payload\)/);
assert.match(signalCore, /if \(payload\['0'\] && typeof payload\['0'\] === 'object'\) return payload\['0'\]/,
  'NOAA scales temporal form must remain pinned to the established current-record selector');
assert.match(signalCore, /const record = selectCurrentRecord\(payload\)/);

for (const pattern of [
  /Sounding Well\*\* asks: how far is a trustworthy source timestamp from the Museum latch/,
  /Shutter Cabinet\*\* asks: what kind of temporal population or validity form does this claim family describe/,
  /The Shutter Cabinet does not parse provider timestamps, compute age, rank freshness, or derive source-time thickness/
]) assert.match(record, pattern);
assert.match(soundingRecord, /known source-time thickness/);
assert.match(soundingRecord, /Depth is not a quality score, confidence score, uncertainty estimate, or ranking of providers/);

for (const pattern of [
  /THE SHUTTER CABINET \/ SAME LATCH, DIFFERENT TEMPORAL SUPPORT/,
  /One snapshot does not imply one exposure\./,
  /FORCE ONE NOW/,
  /RELEASE THE AXIS/,
  /TEMPORAL INTERLOCK/,
  /SAME LATCH, DIFFERENT TEMPORAL SUPPORT/,
  /THE LATCH IS A COMMIT BOUNDARY, NOT A UNIVERSAL MEASUREMENT WINDOW\./,
  /field-sheet-shutter-cabinet/,
  /aria-pressed/,
  /aria-live/,
  /const SNAPSHOT_EVENT = 'museum:commons-snapshot'/,
  /document\.addEventListener\(SNAPSHOT_EVENT,[\s\S]+leftId = 'earthquakes';[\s\S]+rightId = 'weather';[\s\S]+forced = false;[\s\S]+render\(\)/
]) assert.match(view, pattern);

assert.match(loader, /quorum-gate-core\.js[\s\S]+quorum-gate\.js[\s\S]+shutter-cabinet-core\.js[\s\S]+shutter-cabinet\.js/,
  'Shutter Cabinet should extend the progressive Commons chain after Quorum Gate');

assert.doesNotMatch(runtime, /\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource/i);
assert.doesNotMatch(runtime, /setInterval|setTimeout|requestAnimationFrame|localStorage|sessionStorage|indexedDB|document\.cookie|navigator\.geolocation|history\.(?:pushState|replaceState)/i);
assert.doesNotMatch(runtime, /\b(?:gtag|dataLayer|mixpanel|amplitude|hotjar)\b|plausible\.io|window\.plausible|google-analytics|googletagmanager|facebook\.com\/tr|doubleclick/i);
assert.doesNotMatch(runtime, /https?:\/\//i, 'feature runtime must not contain remote URLs');
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
  /\.shutter-cabinet-section\s*\{\s*display:\s*none !important/
]) assert.match(css, pattern);
assert.doesNotMatch(css, /@import\s+url|font-face|https?:\/\//i);

for (const pattern of [
  /Concept A — The Temporal Support Ledger/,
  /Concept B — The Shutter Cabinet/,
  /Concept C — One Timestamp Is Not One Time Axis/,
  /Concept A was discarded\. Concepts B and C were merged/,
  /SAME LATCH\. DIFFERENT TEMPORAL SUPPORT\./,
  /TRAILING WINDOW/,
  /CURRENT READING/,
  /STATUS-DEFINED SET/,
  /Never use receipt time as a claim window/,
  /Never use source timestamp age as a validity duration/,
  /Never turn `status=open` into a trailing interval/,
  /Require the feature-complete head to pass required GitHub Actions job exactly `check`[\s\S]+archive-bearing head to pass `check` again/
]) assert.match(record, pattern);

for (const asset of ['./shutter-cabinet-core.js', './shutter-cabinet.js', './shutter-cabinet.css', './SHUTTER_CABINET.md']) {
  assert.ok(worker.includes(`'${asset}'`), `offline shell should cache ${asset}`);
}
assert.match(worker, /const PAGE_FOUR_INSTRUMENT_ROOM_CACHE_NAME = 'museum-of-almost-v40-page-four-instrument-room'/);
assert.match(worker, /const SHUTTER_CABINET_CACHE_NAME = 'museum-of-almost-v41-shutter-cabinet'/);
assert.match(worker, /const CURRENT_CACHE_NAME = 'museum-of-almost-v42-unequal-minute'/);

console.log('Shutter Cabinet temporal-form registry, refusal interlock, Sounding Well boundary, accessibility, privacy, loader, preserved v41 shell marker, and v42 successor contract verified.');