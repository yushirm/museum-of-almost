import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const commons = require('../data-core.js');
const core = require('../load-bearing-sample-core.js');
const coreSource = fs.readFileSync(new URL('../load-bearing-sample-core.js', import.meta.url), 'utf8');
const view = fs.readFileSync(new URL('../load-bearing-sample.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../load-bearing-sample.css', import.meta.url), 'utf8');
const record = fs.readFileSync(new URL('../LOAD_BEARING_SAMPLE.md', import.meta.url), 'utf8');
const archive = fs.readFileSync(new URL('../SUCCESS_ARCHIVE.md', import.meta.url), 'utf8');
const loader = fs.readFileSync(new URL('../cosmic-signal.js', import.meta.url), 'utf8');
const dataCore = fs.readFileSync(new URL('../data-core.js', import.meta.url), 'utf8');
const worker = fs.readFileSync(new URL('../service-worker.js', import.meta.url), 'utf8');
const runtime = `${coreSource}\n${view}`;

assert.deepEqual(core.CLAIM_IDS, ['min-temp', 'max-temp', 'mean-wind', 'max-wind', 'precip-count']);
assert.equal(core.finite(null), null, 'missing must never coerce to zero');
assert.equal(core.finite(0), 0, 'real zero must remain numeric zero');

const stations = commons.STATIONS;
assert.equal(stations.length, 13);
const points = stations.map((station, index) => ({
  ...station,
  available: true,
  temperature: index,
  wind: 10 + index,
  precipitation: index < 3 ? 0.1 + index / 10 : 0
}));
const snapshot = {
  receivedAt: new Date('2026-08-08T10:00:00.000Z'),
  weather: {
    available: true,
    points,
    availableCount: 13,
    minTemp: 0,
    maxTemp: 12,
    meanWind: 16,
    maxWind: 22,
    raining: 3
  }
};

const rig = core.buildRig(snapshot, stations);
assert.equal(rig.waiting, false);
assert.equal(rig.claims.length, 5);

const minTemp = core.claimById(rig, 'min-temp');
assert.equal(minTemp.current, snapshot.weather.minTemp, 'real normalized snapshot headline must remain authoritative');
assert.equal(minTemp.evaluableCount, 13);
assert.equal(minTemp.loadBearingCount, 1);
assert.equal(core.entryById(minTemp, '01').state, 'bearing');
assert.equal(core.entryById(minTemp, '01').hypothetical, 1);
assert.equal(core.entryById(minTemp, '01').delta, 1);
assert.equal(core.entryById(minTemp, '02').state, 'unchanged');
assert.equal(core.entryById(minTemp, '02').hypothetical, 0);

const maxTemp = core.claimById(rig, 'max-temp');
assert.equal(maxTemp.loadBearingCount, 1);
assert.equal(core.entryById(maxTemp, '13').state, 'bearing');
assert.equal(core.entryById(maxTemp, '13').hypothetical, 11);
assert.equal(core.entryById(maxTemp, '12').state, 'unchanged');

const meanWind = core.claimById(rig, 'mean-wind');
assert.equal(meanWind.current, 16);
assert.equal(meanWind.loadBearingCount, 12,
  'every finite wind except the point equal to the current mean should move this one-decimal mean in the fixture');
assert.equal(core.entryById(meanWind, '07').value, 16);
assert.equal(core.entryById(meanWind, '07').state, 'unchanged');
assert.equal(core.entryById(meanWind, '07').hypothetical, 16);
assert.equal(core.entryById(meanWind, '01').hypothetical, 16.5);

const maxWind = core.claimById(rig, 'max-wind');
assert.equal(maxWind.loadBearingCount, 1);
assert.equal(core.entryById(maxWind, '13').hypothetical, 21);

const precip = core.claimById(rig, 'precip-count');
assert.equal(precip.current, 3);
assert.equal(precip.loadBearingCount, 3);
assert.equal(core.entryById(precip, '01').state, 'bearing');
assert.equal(core.entryById(precip, '01').hypothetical, 2);
assert.equal(core.entryById(precip, '01').delta, -1);
assert.equal(core.entryById(precip, '04').value, 0);
assert.equal(core.entryById(precip, '04').state, 'unchanged');
assert.equal(core.entryById(precip, '04').hypothetical, 3);

const missingSnapshot = {
  ...snapshot,
  weather: {
    ...snapshot.weather,
    points: snapshot.weather.points.map((point, index) => index === 12
      ? { ...point, precipitation: null }
      : point)
  }
};
const missingPrecip = core.claimById(core.buildRig(missingSnapshot, stations), 'precip-count');
assert.equal(core.entryById(missingPrecip, '13').state, 'missing');
assert.equal(core.entryById(missingPrecip, '13').canPull, false);

const soleSnapshot = {
  ...snapshot,
  weather: {
    ...snapshot.weather,
    minTemp: 5,
    maxTemp: 5,
    points: snapshot.weather.points.map((point, index) => ({
      ...point,
      temperature: index === 0 ? 5 : null
    }))
  }
};
const soleMin = core.claimById(core.buildRig(soleSnapshot, stations), 'min-temp');
assert.equal(soleMin.evaluableCount, 1);
assert.equal(soleMin.loadBearingCount, 1);
assert.equal(core.entryById(soleMin, '01').state, 'sole');
assert.equal(core.entryById(soleMin, '01').hypothetical, null);

const waiting = core.buildRig({ receivedAt: null }, stations);
assert.equal(waiting.waiting, true);
assert.match(core.summarySentence(waiting, 'min-temp'), /Waiting for the first real Commons latch/i);
assert.match(core.summarySentence(rig, 'mean-wind'), /claim sensitivity only/i);
assert.match(core.summarySentence(rig, 'mean-wind'), /not importance, quality, representativeness, or uncertainty/i);

assert.match(dataCore, /minTemp:\s*temperatures\.length \? round\(Math\.min\(\.\.\.temperatures\), 1\) : null/,
  'minimum-temperature omission semantics must remain pinned to the canonical reducer');
assert.match(dataCore, /maxTemp:\s*temperatures\.length \? round\(Math\.max\(\.\.\.temperatures\), 1\) : null/,
  'maximum-temperature omission semantics must remain pinned to the canonical reducer');
assert.match(dataCore, /meanWind:\s*winds\.length \? round\(mean\(winds\), 1\) : null/,
  'mean-wind omission semantics must remain pinned to the canonical reducer');
assert.match(dataCore, /maxWind:\s*winds\.length \? round\(Math\.max\(\.\.\.winds\), 1\) : null/,
  'maximum-wind omission semantics must remain pinned to the canonical reducer');
assert.match(dataCore, /const raining = availablePoints\.filter\(\(point\) => Number\.isFinite\(point\.precipitation\) && point\.precipitation > 0\)\.length/,
  'precipitation-count omission semantics must remain pinned to the canonical reducer');

assert.match(loader, /border-office\.js[\s\S]+load-bearing-sample-core\.js[\s\S]+load-bearing-sample\.js/,
  'Load-Bearing Sample should extend the progressive Commons chain after the Border Office');

for (const pattern of [
  /THE LOAD-BEARING SAMPLE \/ PULL ONE PIN/,
  /Which observation is holding this headline up\?/,
  /REAL LATCH/,
  /HYPOTHETICAL/,
  /UNCHANGED DOES NOT MEAN UNIMPORTANT/,
  /field-sheet-load-bearing-sample/,
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
  /\.load-bearing-sample-section\s*\{[\s\S]*display:\s*none !important/
]) assert.match(css, pattern);
assert.doesNotMatch(css, /@import\s+url|font-face|https?:\/\//i);

for (const pattern of [
  /Concept A — The Contribution Matrix/,
  /Concept B — The Load-Bearing Sample/,
  /Concept C — Pull One Pin/,
  /Concept A was discarded/,
  /Concepts B and C became \*\*The Load-Bearing Sample \/ Pull One Pin\*\*/,
  /one selected claim, every fixed station is evaluated independently/i,
  /UNCHANGED DOES NOT MEAN UNIMPORTANT/i,
  /does \*\*not\*\* translate `0 mm` into a complete `dry` weather claim/,
  /adds no data acquisition/i,
  /Require the feature-complete head to pass `check`[\s\S]+archive-bearing head to pass `check` again before merge/
]) assert.match(record, pattern);

for (const pattern of [
  /## 2026-08-08 — COMMONS \/ NOW — The Load-Bearing Sample/,
  /\*\*The Load-Bearing Sample \/ Pull One Pin\*\*/,
  /Concepts B and C were merged/,
  /06da32042db0b1aa45a74df2a4914f65939041be/,
  /#72 — Add the Load-Bearing Sample/,
  /required job: `check`/,
  /run: `216`/,
  /conclusion: `success`/,
  /archive-bearing final head must pass the same required `check` job again before merge/
]) assert.match(archive, pattern);

for (const asset of ['./load-bearing-sample-core.js', './load-bearing-sample.js', './load-bearing-sample.css', './LOAD_BEARING_SAMPLE.md']) {
  assert.ok(worker.includes(`'${asset}'`), `offline shell should cache ${asset}`);
}

console.log('Load-Bearing Sample one-point aggregate sensitivity, authoritative latch, missing/zero handling, accessibility, privacy, repository Success Archive evidence, loader, and offline contracts verified.');
