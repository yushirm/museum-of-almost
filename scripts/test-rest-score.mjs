import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const commons = require('../data-core.js');
const core = require('../rest-score-core.js');
const view = fs.readFileSync(new URL('../rest-score.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../rest-score.css', import.meta.url), 'utf8');
const record = fs.readFileSync(new URL('../REST_SCORE.md', import.meta.url), 'utf8');
const loader = fs.readFileSync(new URL('../cosmic-signal.js', import.meta.url), 'utf8');
const worker = fs.readFileSync(new URL('../service-worker.js', import.meta.url), 'utf8');
const archive = fs.readFileSync(new URL('../SUCCESS_ARCHIVE.md', import.meta.url), 'utf8');

const weatherPoints = commons.STATIONS.map((station, index) => ({
  ...station,
  available: true,
  temperature: 12 + index,
  wind: 5 + index,
  precipitation: index === 1 ? 0.4 : index === 2 ? null : 0
}));

const snapshot = {
  receivedAt: new Date('2026-08-08T08:45:00.000Z'),
  feeds: { earthquakes: true, solar: true, scales: true, weather: true, events: true },
  earthquakes: { available: true, count: 0, strongest: null, meanDepth: null, significant: 0 },
  solar: { available: true, speed: 0, state: 'steady' },
  scales: {
    available: true,
    value: {
      0: {
        G: { Scale: '0', Text: 'none' },
        S: { Scale: '2', Text: 'moderate' },
        R: { Scale: '0', Text: 'none' },
        DateStamp: '2026-08-08',
        TimeStamp: '08:45:00'
      }
    }
  },
  weather: {
    available: true,
    availableCount: 13,
    points: weatherPoints
  },
  events: { available: true, count: 0, capped: false, categories: [] }
};

assert.equal(core.finite(null), null, 'missing numerics must never coerce to zero');
assert.equal(core.validDate(null), null, 'missing latch time must never become epoch time');
assert.equal(core.STATE_LABELS[core.STATES.REST], 'WRITTEN ZERO');

const waiting = core.buildScore({ receivedAt: null });
assert.equal(waiting.waiting, true);
assert.equal(waiting.total, 0);
assert.match(core.scoreSentence(waiting), /Waiting for the first real Commons snapshot/i);

const score = core.buildScore(snapshot);
assert.equal(score.waiting, false);
assert.equal(score.total, 19, 'score contract should stay fixed at 19 semantic measures');
assert.deepEqual(score.counts, {
  sounded: 3,
  rest: 14,
  missing: 1,
  'not-applicable': 1
});
assert.match(core.scoreSentence(score), /not a completeness score/i);

const byId = new Map(score.measures.map((entry) => [entry.id, entry]));
assert.equal(byId.get('earthquake-count').state, core.STATES.REST);
assert.equal(byId.get('earthquake-count').display, '0 recorded');
assert.equal(byId.get('earthquake-strongest').state, core.STATES.NOT_APPLICABLE,
  'strongest magnitude is not applicable only after a successful zero-event count');
assert.equal(byId.get('solar-wind-speed').state, core.STATES.SOUNDED,
  'numeric zero in a speed field must not become musical silence by accident');
assert.equal(byId.get('geomagnetic-scale').state, core.STATES.REST);
assert.equal(byId.get('radiation-scale').state, core.STATES.SOUNDED);
assert.equal(byId.get('precipitation-01').state, core.STATES.REST);
assert.equal(byId.get('precipitation-02').state, core.STATES.SOUNDED);
assert.equal(byId.get('precipitation-03').state, core.STATES.MISSING);
assert.equal(byId.get('open-events').state, core.STATES.REST);

const quakeMagnitudeZero = core.buildScore({
  ...snapshot,
  earthquakes: { ...snapshot.earthquakes, count: 1, strongest: 0 }
});
const quakeMagnitudeZeroById = new Map(quakeMagnitudeZero.measures.map((entry) => [entry.id, entry]));
assert.equal(quakeMagnitudeZeroById.get('earthquake-count').state, core.STATES.SOUNDED);
assert.equal(quakeMagnitudeZeroById.get('earthquake-strongest').state, core.STATES.SOUNDED,
  'magnitude zero is still a magnitude reading, not a rest');
assert.equal(quakeMagnitudeZeroById.get('earthquake-strongest').display, 'M0.0');

const missingQuakes = core.buildScore({
  ...snapshot,
  feeds: { ...snapshot.feeds, earthquakes: false },
  earthquakes: { available: false, count: null, strongest: null }
});
const missingQuakesById = new Map(missingQuakes.measures.map((entry) => [entry.id, entry]));
assert.equal(missingQuakesById.get('earthquake-count').state, core.STATES.MISSING);
assert.equal(missingQuakesById.get('earthquake-strongest').state, core.STATES.MISSING,
  'failed earthquake feed must never masquerade as a not-applicable strongest event');

const missingScales = core.buildScore({
  ...snapshot,
  feeds: { ...snapshot.feeds, scales: false },
  scales: { available: false, value: null }
});
const missingScalesById = new Map(missingScales.measures.map((entry) => [entry.id, entry]));
assert.equal(missingScalesById.get('geomagnetic-scale').state, core.STATES.MISSING);
assert.equal(missingScalesById.get('radiation-scale').state, core.STATES.MISSING);

assert.equal(core.filterMeasures(score, 'rest').length, 14);
assert.equal(core.filterMeasures(score, 'missing').length, 1);
assert.equal(core.filterMeasures(score, 'not-applicable').length, 1);
assert.equal(core.filterMeasures(score, 'sounded').length, 3);
assert.equal(core.filterMeasures(score, 'nonsense').length, 19, 'unknown filter must fail open to the full score');

assert.match(view, /museum:commons-snapshot/);
assert.match(view, /activeFilter = 'all';[\s\S]+render\(\);/, 'every real latch should clear the solo filter');
assert.match(view, /THE REST SCORE \/ NOTHING IS NOT MISSING/);
assert.match(view, /Zero is data\. Missing is ignorance\./);
assert.match(view, /numeric zero does not automatically mean silence/i);
assert.match(view, /data-rest-score-styles/);
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
  /min-height:\s*44px/,
  /:focus-visible/
]) assert.match(css, pattern);
assert.match(css, /data-state="rest"/);
assert.match(css, /data-state="missing"/);
assert.match(css, /data-state="not-applicable"/);
assert.doesNotMatch(css, /@import\s+url|font-face|https?:\/\//i);

for (const pattern of [
  /Concept A/,
  /Concept B/,
  /Concept C/,
  /Concept A was discarded/,
  /The Rest Score \/ Nothing Is Not Missing/,
  /19 semantic measures/,
  /numeric zero does not automatically mean/i,
  /NOT APPLICABLE/,
  /zero runtime data-service requests/i,
  /not a completeness percentage/i,
  /cosmic-signal-core\.js/
]) assert.match(record, pattern);

assert.match(loader, /reverse-ledger\.js[\s\S]+rest-score-core\.js[\s\S]+rest-score\.js/,
  'Rest Score should extend the current Commons module chain after Reverse Ledger');
for (const asset of ['./rest-score-core.js', './rest-score.js', './rest-score.css', './REST_SCORE.md']) {
  assert.ok(worker.includes(`'${asset}'`), `offline shell should cache ${asset}`);
}

for (const pattern of [
  /COMMONS \/ NOW — The Rest Score/,
  /The Rest Score \/ Nothing Is Not Missing/,
  /d61d3602c0e1c5a8945ce7087d9bc05d5a4c7c9b/,
  /#60 — Add the Rest Score/,
  /run: `160`/,
  /conclusion: `success`/
]) assert.match(archive, pattern, `Success Archive should preserve Rest Score evidence: ${pattern}`);

console.log('Rest Score field-specific zero semantics, missing-vs-not-applicable behavior, five-feed coverage, filtering, privacy, accessibility, success archive evidence, and offline shell verified.');
