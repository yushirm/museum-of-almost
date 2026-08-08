import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const core = require('../shuffle-table-core.js');
const coreSource = fs.readFileSync(new URL('../shuffle-table-core.js', import.meta.url), 'utf8');
const view = fs.readFileSync(new URL('../shuffle-table.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../shuffle-table.css', import.meta.url), 'utf8');
const record = fs.readFileSync(new URL('../SHUFFLE_TABLE.md', import.meta.url), 'utf8');
const archive = fs.readFileSync(new URL('../SUCCESS_ARCHIVE.md', import.meta.url), 'utf8');
const loader = fs.readFileSync(new URL('../cosmic-signal.js', import.meta.url), 'utf8');
const dataCore = fs.readFileSync(new URL('../data-core.js', import.meta.url), 'utf8');
const worker = fs.readFileSync(new URL('../service-worker.js', import.meta.url), 'utf8');
const runtime = `${coreSource}\n${view}\n${css}`;

assert.deepEqual(core.LENSES.map(({ id }) => id), ['temperature', 'wind', 'precipitation']);
assert.equal(core.finite(null), null, 'missing must not become zero');
assert.equal(core.finite(0), 0, 'real zero must stay finite');

const points = Array.from({ length: 13 }, (_, index) => {
  const n = index + 1;
  return {
    id: String(n).padStart(2, '0'),
    temperature: n,
    wind: n * 10,
    precipitation: n % 3 === 0 ? 0 : n / 10
  };
});

const snapshot = {
  receivedAt: new Date('2026-08-08T14:00:00.000Z'),
  weather: {
    available: true,
    points,
    availableCount: 13,
    minTemp: 1,
    maxTemp: 13,
    meanWind: 70,
    maxWind: 130,
    raining: 9
  }
};

function finiteMultiset(entries, key) {
  return entries
    .map((entry) => entry[key])
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b);
}

const temp = core.buildTable(snapshot, 'temperature');
assert.equal(temp.waiting, false);
assert.equal(temp.canPermute, true);
assert.equal(temp.actualMatchesCanonical, true);
assert.equal(temp.hypotheticalMatchesCanonical, true);
assert.equal(temp.sameHeadline, true);
assert.equal(temp.finiteCount, 13);
assert.equal(temp.missingCount, 0);
assert.equal(temp.movedAssignments, 13);
assert.deepEqual(finiteMultiset(temp.entries, 'actualValue'), finiteMultiset(temp.entries, 'hypotheticalValue'));
assert.deepEqual(temp.actualComputed, { minTemp: 1, maxTemp: 13 });
assert.deepEqual(temp.hypotheticalComputed, { minTemp: 1, maxTemp: 13 });
assert.equal(temp.entries[0].donorId, '02');
assert.equal(temp.entries[12].donorId, '01');
assert.equal(temp.entries[0].hypotheticalValue, 2);
assert.equal(temp.entries[12].hypotheticalValue, 1);

const wind = core.buildTable(snapshot, 'wind');
assert.equal(wind.canPermute, true);
assert.equal(wind.sameHeadline, true);
assert.deepEqual(finiteMultiset(wind.entries, 'actualValue'), finiteMultiset(wind.entries, 'hypotheticalValue'));
assert.deepEqual(wind.actualComputed, { meanWind: 70, maxWind: 130 });
assert.deepEqual(wind.hypotheticalComputed, { meanWind: 70, maxWind: 130 });

const precipitation = core.buildTable(snapshot, 'precipitation');
assert.equal(precipitation.canPermute, true);
assert.equal(precipitation.sameHeadline, true);
assert.deepEqual(finiteMultiset(precipitation.entries, 'actualValue'), finiteMultiset(precipitation.entries, 'hypotheticalValue'));
assert.deepEqual(precipitation.actualComputed, { raining: 9 });
assert.deepEqual(precipitation.hypotheticalComputed, { raining: 9 });
assert.ok(precipitation.entries.some((entry) => entry.actualValue === 0), 'real zero should remain inside the finite deck');

const missingSnapshot = {
  ...snapshot,
  weather: {
    ...snapshot.weather,
    points: snapshot.weather.points.map((point) => point.id === '05' ? { ...point, temperature: null } : point),
    minTemp: 1,
    maxTemp: 13
  }
};
const missing = core.buildTable(missingSnapshot, 'temperature');
const missingPoint = missing.entries.find((entry) => entry.id === '05');
assert.equal(missingPoint.missing, true);
assert.equal(missingPoint.actualValue, null);
assert.equal(missingPoint.hypotheticalValue, null);
assert.equal(missingPoint.donorId, null);
assert.equal(missing.finiteCount, 12);
assert.equal(missing.missingCount, 1);
assert.equal(missing.canPermute, true);
assert.equal(missing.sameHeadline, true);
assert.deepEqual(finiteMultiset(missing.entries, 'actualValue'), finiteMultiset(missing.entries, 'hypotheticalValue'));

const equalEntries = [
  { id: '01', value: 5 },
  { id: '02', value: 5 },
  { id: '03', value: 9 }
];
const equalRotation = core.rotateFiniteAssignments(equalEntries);
assert.equal(equalRotation[0].assignmentMoved, true);
assert.equal(equalRotation[0].valueChanged, false, 'assignment can move even when the numeric display stays equal');
assert.equal(equalRotation[1].assignmentMoved, true);
assert.equal(equalRotation[1].valueChanged, true);

const oneFinite = {
  receivedAt: snapshot.receivedAt,
  weather: {
    available: true,
    points: points.map((point, index) => ({ ...point, temperature: index === 0 ? 4 : null })),
    minTemp: 4,
    maxTemp: 4,
    meanWind: 70,
    maxWind: 130,
    raining: 9
  }
};
const insufficient = core.buildTable(oneFinite, 'temperature');
assert.equal(insufficient.finiteCount, 1);
assert.equal(insufficient.canPermute, false);
assert.match(core.summarySentence(insufficient), /fewer than two finite temperature values/i);

const drifted = {
  ...snapshot,
  weather: { ...snapshot.weather, minTemp: -99 }
};
const drift = core.buildTable(drifted, 'temperature');
assert.equal(drift.actualMatchesCanonical, false);
assert.equal(drift.canPermute, false);
assert.match(core.summarySentence(drift), /no longer reproduce the authoritative temperature range headline/i);

const waiting = core.buildTable({ receivedAt: null, weather: snapshot.weather }, 'temperature');
assert.equal(waiting.waiting, true);
assert.equal(waiting.canPermute, false);
assert.match(core.summarySentence(waiting), /Waiting for the first real Commons latch/i);

for (const pattern of [
  /minTemp:\s*temperatures\.length \? round\(Math\.min\(\.\.\.temperatures\), 1\) : null/,
  /maxTemp:\s*temperatures\.length \? round\(Math\.max\(\.\.\.temperatures\), 1\) : null/,
  /meanWind:\s*winds\.length \? round\(mean\(winds\), 1\) : null/,
  /maxWind:\s*winds\.length \? round\(Math\.max\(\.\.\.winds\), 1\) : null/,
  /const raining = availablePoints\.filter\(\(point\) => Number\.isFinite\(point\.precipitation\) && point\.precipitation > 0\)\.length/
]) assert.match(dataCore, pattern, `Shuffle Table must stay pinned to canonical reducer declaration ${pattern}`);

for (const pattern of [
  /THE SHUFFLE TABLE \/ THE HEADLINE DOES NOT KNOW WHERE THE VALUES LIVED/,
  /Cut the deck\. Keep the headline\./,
  /CUT THE DECK/,
  /RESTORE ACTUAL DEAL/,
  /SAME HEADLINE\. DIFFERENT ASSIGNMENT\./,
  /THIS IS NOT AN ALTERNATE WEATHER REPORT\./,
  /HYPOTHETICAL PERMUTATION/,
  /field-sheet-shuffle-table/,
  /aria-pressed/,
  /aria-live/,
  /const SNAPSHOT_EVENT = 'museum:commons-snapshot'/,
  /document\.addEventListener\(SNAPSHOT_EVENT,[\s\S]+activeLens = 'temperature';[\s\S]+shuffled = false;[\s\S]+render\(\)/
]) assert.match(view, pattern);

assert.match(loader, /gauge-bench-core\.js[\s\S]+gauge-bench\.js[\s\S]+shuffle-table-core\.js[\s\S]+shuffle-table\.js/,
  'Shuffle Table should extend the progressive Commons chain after Gauge Bench');

assert.doesNotMatch(runtime, /\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource/i);
assert.doesNotMatch(runtime, /setInterval|setTimeout|requestAnimationFrame|localStorage|sessionStorage|indexedDB|document\.cookie|navigator\.geolocation|history\.(?:pushState|replaceState)/i);
assert.doesNotMatch(runtime, /Math\.random\s*\(/, 'Shuffle Table must use a deterministic permutation, not random shuffling');
assert.doesNotMatch(runtime, /\b(?:gtag|dataLayer|mixpanel|amplitude|hotjar)\b|plausible\.io|window\.plausible|google-analytics|googletagmanager|facebook\.com\/tr|doubleclick/i);
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
  /\.shuffle-table-section\s*\{[\s\S]*display:\s*none !important/
]) assert.match(css, pattern);
assert.doesNotMatch(css, /@import\s+url|font-face|https?:\/\//i);

for (const pattern of [
  /Concept A — The Aggregation Audit/,
  /Concept B — The Shuffle Table/,
  /Concept C — The Headline Refuses to Update/,
  /Concept A was discarded/,
  /Concepts B and C became \*\*The Shuffle Table \/ The Headline Does Not Know Where the Values Lived\*\*/,
  /deterministic one-seat rotation/,
  /Missing values are never dealt into another point/,
  /Real numeric zero remains an ordinary finite numeric value/,
  /alternate weather/,
  /Require the feature-complete head to pass `check`[\s\S]+archive-bearing head to pass `check` again before merge/
]) assert.match(record, pattern);

for (const pattern of [
  /## 2026-08-08 — COMMONS \/ NOW — The Shuffle Table/,
  /\*\*The Shuffle Table \/ The Headline Does Not Know Where the Values Lived\*\*/,
  /Concept A, \*\*The Aggregation Audit\*\*, was discarded/,
  /Concepts B and C were merged/,
  /`fed711fd3bb2a3191834b02d59c79c8f987ec4ab`/,
  /`#80 — Add the Shuffle Table`/,
  /run: `255`;/,
  /conclusion: `success`\./,
  /run `246` was rejected[\s\S]+Plausible Analytics/,
  /green run `253` was rejected as release evidence/,
  /v37 Shuffle Table[\s\S]+v36 Page Four Evidence Lattice/,
  /archive-bearing final head must pass the same required `check` job again before merge/
]) assert.match(archive, pattern);

for (const asset of ['./shuffle-table-core.js', './shuffle-table.js', './shuffle-table.css', './SHUFFLE_TABLE.md']) {
  assert.ok(worker.includes(`'${asset}'`), `offline shell should cache ${asset}`);
}

console.log('Shuffle Table deterministic permutation, aggregate invariance, missing/zero semantics, accessibility, privacy, archive evidence, loader, and offline contracts verified.');