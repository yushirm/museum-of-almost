import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const core = require('../gauge-bench-core.js');
const coreSource = fs.readFileSync(new URL('../gauge-bench-core.js', import.meta.url), 'utf8');
const view = fs.readFileSync(new URL('../gauge-bench.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../gauge-bench.css', import.meta.url), 'utf8');
const record = fs.readFileSync(new URL('../GAUGE_BENCH.md', import.meta.url), 'utf8');
const archive = fs.readFileSync(new URL('../SUCCESS_ARCHIVE.md', import.meta.url), 'utf8');
const loader = fs.readFileSync(new URL('../cosmic-signal.js', import.meta.url), 'utf8');
const dataCore = fs.readFileSync(new URL('../data-core.js', import.meta.url), 'utf8');
const worker = fs.readFileSync(new URL('../service-worker.js', import.meta.url), 'utf8');
const runtime = `${coreSource}\n${view}\n${css}`;

assert.equal(core.CLAIMS.length, 9);
assert.deepEqual(core.CLAIMS.map(({ id }) => id), [
  'quake-magnitude',
  'quake-count',
  'solar-speed',
  'min-temp',
  'max-temp',
  'mean-wind',
  'max-wind',
  'precip-count',
  'event-count'
]);
assert.equal(new Set(core.CLAIMS.map(({ id }) => id)).size, 9);
assert.ok(Object.isFrozen(core.CLAIMS));
assert.equal(core.finite(null), null, 'missing must not become numeric zero');
assert.equal(core.finite(0), 0, 'real zero must remain zero');

const snapshot = {
  receivedAt: new Date('2026-08-08T13:00:00.000Z'),
  earthquakes: { available: true, count: 7, strongest: 5.4 },
  solar: { available: true, speed: 480.2 },
  weather: {
    available: true,
    minTemp: -5,
    maxTemp: 18,
    meanWind: 21,
    maxWind: 44,
    raining: 3
  },
  events: { available: true, count: 12, capped: false }
};

for (const claim of core.CLAIMS) {
  assert.notEqual(core.currentValue(snapshot, claim), null, `${claim.id} should read its current normalized field`);
}

const temperature = core.buildPair(snapshot, 'min-temp', 'max-temp');
assert.equal(temperature.contract.outcome, core.OUTCOMES.COMMON);
assert.equal(temperature.contract.label, 'COMMON RULER');
assert.equal(temperature.canDrawRuler, true);
assert.equal(temperature.delta, 23);
assert.equal(core.formatDelta(temperature), '+23.0°C');

const terrestrialWind = core.buildPair(snapshot, 'mean-wind', 'max-wind');
assert.equal(terrestrialWind.contract.outcome, core.OUTCOMES.COMMON);
assert.equal(terrestrialWind.canDrawRuler, true);
assert.equal(terrestrialWind.delta, 23);
assert.equal(core.formatDelta(terrestrialWind), '+23.0 km/h');

const solarVsGround = core.buildPair(snapshot, 'solar-speed', 'mean-wind');
assert.equal(solarVsGround.contract.outcome, core.OUTCOMES.SAME_DIMENSION);
assert.equal(solarVsGround.contract.label, 'SAME DIMENSION, DIFFERENT THING');
assert.equal(solarVsGround.contract.commonDimension, 'speed');
assert.equal(solarVsGround.delta, null);
assert.equal(solarVsGround.canDrawRuler, false);

const quakeVsRainCount = core.buildPair(snapshot, 'quake-count', 'precip-count');
assert.equal(quakeVsRainCount.contract.outcome, core.OUTCOMES.SAME_DIMENSION);
assert.equal(quakeVsRainCount.contract.commonDimension, 'count');
assert.equal(quakeVsRainCount.delta, null);
assert.equal(quakeVsRainCount.canDrawRuler, false);

const quakeVsEventCount = core.buildPair(snapshot, 'quake-count', 'event-count');
assert.equal(quakeVsEventCount.contract.outcome, core.OUTCOMES.SAME_DIMENSION);
assert.equal(quakeVsEventCount.contract.commonDimension, 'count');
assert.equal(quakeVsEventCount.delta, null);
assert.equal(quakeVsEventCount.canDrawRuler, false);

const magnitudeVsTemperature = core.buildPair(snapshot, 'quake-magnitude', 'max-temp');
assert.equal(magnitudeVsTemperature.contract.outcome, core.OUTCOMES.NO_AXIS);
assert.equal(magnitudeVsTemperature.contract.label, 'NO COMMON AXIS');
assert.equal(magnitudeVsTemperature.delta, null);
assert.equal(magnitudeVsTemperature.canDrawRuler, false);

const sameClaim = core.buildPair(snapshot, 'min-temp', 'min-temp');
assert.equal(sameClaim.contract.outcome, core.OUTCOMES.COMMON, 'registry contract remains deterministic even for the same claim');
assert.equal(sameClaim.canDrawRuler, false, 'the numerical ruler must not render for a trivial same-claim pair');

const missingSolarSnapshot = {
  ...snapshot,
  solar: { available: false, speed: null }
};
const missingSolar = core.buildPair(missingSolarSnapshot, 'solar-speed', 'mean-wind');
assert.equal(missingSolar.left.value, null);
assert.equal(missingSolar.left.missing, true);
assert.equal(missingSolar.right.value, 21);
assert.equal(missingSolar.contract.outcome, core.OUTCOMES.SAME_DIMENSION, 'static comparison contract should survive a missing current value');
assert.equal(missingSolar.delta, null);
assert.equal(missingSolar.canDrawRuler, false);
assert.match(core.summarySentence(missingSolar), /current values are missing/i);

const zeroSnapshot = {
  ...snapshot,
  earthquakes: { available: true, count: 0, strongest: null },
  weather: { ...snapshot.weather, raining: 0 },
  events: { available: true, count: 0, capped: false }
};
assert.equal(core.currentValue(zeroSnapshot, 'quake-count'), 0);
assert.equal(core.currentValue(zeroSnapshot, 'precip-count'), 0);
assert.equal(core.currentValue(zeroSnapshot, 'event-count'), 0);
assert.equal(core.currentValue(zeroSnapshot, 'quake-magnitude'), null);

const waiting = core.buildPair({ receivedAt: null }, 'min-temp', 'max-temp');
assert.equal(waiting.waiting, true);
assert.equal(waiting.canDrawRuler, false);
assert.match(core.summarySentence(waiting), /Waiting for the first real Commons latch/i);
assert.match(core.summarySentence(solarVsGround), /refuses a ratio, percent difference, winner, normalized score, or shared ruler/i);

for (const pattern of [
  /count:\s*quakes\.length/,
  /strongest:\s*magnitudes\.length \? round\(Math\.max\(\.\.\.magnitudes\), 1\) : null/,
  /return \{ available: true, speed, state \}/,
  /minTemp:\s*temperatures\.length \? round\(Math\.min\(\.\.\.temperatures\), 1\) : null/,
  /maxTemp:\s*temperatures\.length \? round\(Math\.max\(\.\.\.temperatures\), 1\) : null/,
  /meanWind:\s*winds\.length \? round\(mean\(winds\), 1\) : null/,
  /maxWind:\s*winds\.length \? round\(Math\.max\(\.\.\.winds\), 1\) : null/,
  /const raining = availablePoints\.filter\(\(point\) => Number\.isFinite\(point\.precipitation\) && point\.precipitation > 0\)\.length/,
  /count:\s*events\.length/
]) assert.match(dataCore, pattern, `Gauge Bench registry must stay pinned to canonical reducer declaration ${pattern}`);

for (const pattern of [
  /THE GAUGE BENCH \/ BREAK THE CHART BEFORE IT LIES/,
  /Do these two numbers belong on one ruler\?/,
  /COMPARISON INTERLOCK/,
  /SAME DIMENSION DOES NOT MEAN SAME CLAIM/,
  /THE SHARED CHART STOPS HERE/,
  /NATIVE-UNIT DIFFERENCE · B − A/,
  /field-sheet-gauge-bench/,
  /aria-pressed/,
  /aria-live/,
  /button\.disabled = claimId === opposite/,
  /const SNAPSHOT_EVENT = 'museum:commons-snapshot'/,
  /document\.addEventListener\(SNAPSHOT_EVENT,[\s\S]+leftId = 'min-temp';[\s\S]+rightId = 'max-temp';[\s\S]+render\(\)/
]) assert.match(view, pattern);

assert.match(loader, /load-bearing-sample-core\.js[\s\S]+load-bearing-sample\.js[\s\S]+gauge-bench-core\.js[\s\S]+gauge-bench\.js/,
  'Gauge Bench should extend the progressive Commons chain after Load-Bearing Sample');

assert.doesNotMatch(runtime, /\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource/i);
assert.doesNotMatch(runtime, /setInterval|setTimeout|requestAnimationFrame|localStorage|sessionStorage|indexedDB|document\.cookie|navigator\.geolocation|history\.(?:pushState|replaceState)/i);
assert.doesNotMatch(runtime, /\b(?:gtag|dataLayer|mixpanel|plausible|amplitude|hotjar)\b|google-analytics|googletagmanager|facebook\.com\/tr|doubleclick/i);
assert.doesNotMatch(runtime, /https?:\/\//i);
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
  /\.gauge-bench-section\s*\{[\s\S]*display:\s*none !important/
]) assert.match(css, pattern);
assert.doesNotMatch(css, /@import\s+url|font-face|https?:\/\//i);

for (const pattern of [
  /Concept A — The Dimensional Ledger/,
  /Concept B — The Gauge Bench/,
  /Concept C — Break the Chart Before It Lies/,
  /Concept A was discarded/,
  /Concepts B and C became \*\*The Gauge Bench \/ Break the Chart Before It Lies\*\*/,
  /solar-wind speed ↔ terrestrial wind speed/,
  /earthquake count ↔ precipitation-reporting point count/,
  /A broad dimension match alone is insufficient/,
  /Museum-local rather than a universal scientific ontology/,
  /v33 Page Four Rumor Relay/,
  /v34 Gauge Bench/,
  /Require the feature-complete head to pass `check`[\s\S]+archive-bearing head to pass `check` again before merge/
]) assert.match(record, pattern);

for (const pattern of [
  /## 2026-08-08 — COMMONS \/ NOW — The Gauge Bench/,
  /\*\*The Gauge Bench \/ Break the Chart Before It Lies\*\*/,
  /Concepts B and C were merged/,
  /34db4d9af072231de14ae2ca492b5e481c293b94/,
  /#75 — Add the Gauge Bench/,
  /run: `228`/,
  /required job: `check`/,
  /conclusion: `success`/,
  /v34 Gauge Bench/,
  /v33 Page Four Rumor Relay/,
  /run `226` was rejected as release evidence/,
  /archive-bearing final head must pass the same required `check` job again before merge/
]) assert.match(archive, pattern, `Gauge Bench success archive must retain ${pattern}`);

for (const asset of ['./gauge-bench-core.js', './gauge-bench.js', './gauge-bench.css', './GAUGE_BENCH.md']) {
  assert.ok(worker.includes(`'${asset}'`), `offline shell should cache ${asset}`);
}

console.log('Gauge Bench fixed comparison registry, false-friend refusals, native-unit compatible differences, missing/zero semantics, accessibility, privacy, success-archive evidence, loader, and offline contracts verified.');