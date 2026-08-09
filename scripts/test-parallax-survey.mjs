import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const require = createRequire(import.meta.url);

for (const name of [
  'parallax-survey-core.js',
  'parallax-survey.js',
  'parallax-survey.css',
  'PARALLAX_SURVEY.md',
  'deep-space.js',
  'service-worker.js'
]) assert.ok(fs.existsSync(path.join(root, name)), `missing ${name}`);

const coreSource = read('parallax-survey-core.js');
const viewSource = read('parallax-survey.js');
const css = read('parallax-survey.css');
const doc = read('PARALLAX_SURVEY.md');
const bootstrap = read('deep-space.js');
const serviceWorker = read('service-worker.js');
const runtime = [coreSource, viewSource, css].join('\n');
const core = require('../parallax-survey-core.js');

assert.equal(core.PARSEC_TO_LIGHT_YEARS, 3.26156);
assert.deepEqual(core.CASES.map(({ parallaxArcseconds }) => parallaxArcseconds), [1, 0.1, 0.01]);
assert.equal(new Set(core.CASES.map(({ id }) => id)).size, 3);
assert.ok(Object.isFrozen(core.CASES));
assert.ok(core.CASES.every(Object.isFrozen));
assert.equal(core.getCase('missing'), null);
assert.equal(core.distanceParsecs(0), null);
assert.equal(core.distanceParsecs(-1), null);
assert.equal(core.distanceParsecs(Number.NaN), null);
assert.equal(core.fullSeasonalShiftArcseconds(0), null);
assert.equal(core.snapshot('missing'), null);

const expected = [
  { id: 'one-arcsecond', p: 1, full: 2, pc: 1 },
  { id: 'one-tenth-arcsecond', p: 0.1, full: 0.2, pc: 10 },
  { id: 'one-hundredth-arcsecond', p: 0.01, full: 0.02, pc: 100 }
];

for (const item of expected) {
  const snap = core.snapshot(item.id);
  assert.equal(snap.parallaxArcseconds, item.p);
  assert.ok(Math.abs(snap.fullSeasonalShiftArcseconds - item.full) < 1e-12);
  assert.ok(Math.abs(snap.distanceParsecs - item.pc) < 1e-12);
  assert.ok(Math.abs(snap.distanceLightYears - item.pc * 3.26156) < 1e-12);
  assert.ok(Object.isFrozen(snap));
}

assert.equal(core.distanceParsecs(0.1) / core.distanceParsecs(1), 10,
  'a tenfold smaller parallax should yield a tenfold larger distance in the stated small-angle model');
assert.equal(core.distanceParsecs(0.01) / core.distanceParsecs(0.1), 10);

for (const pattern of [
  /INSTRUMENT 13 · THE PARALLAX SURVEY/,
  /The farther star barely moves\./,
  /THE BASELINE IS THE INSTRUMENT/,
  /d\(pc\) ≈ 1 \/ p\(arcsec\)/,
  /READ THE SHRINKING ANGLE, NOT THE DRAWING/,
  /Survey ledger/,
  /textContent/,
  /aria-hidden/
]) assert.match(viewSource, pattern);

for (const requiredText of [
  'function mountConcordance()',
  'function makeRouteLink(targetId, label)',
  'cosmic-concordance',
  'COSMIC CONCORDANCE · OPEN THE GALLERY’S EVIDENCE GRAMMAR',
  "label: 'EXACT RELATIONS'",
  "label: 'IDEALIZED MODELS'",
  "label: 'OBSERVATIONAL INFERENCE'",
  "label: 'OPEN / REVISION'",
  '01 + 13 · LIGHT-TIME ↔ PARALLAX',
  '02 + 12 · HORIZON SCALE ↔ UNEQUAL CLOCKS',
  '03 + 08 · COSMIC INVENTORY ↔ GRAVITATIONAL LENSING',
  '06 + 07 · FRAME ORDER ↔ CAUSAL REACH',
  '09 + 14 · REDSHIFT ↔ COSMIC STRATA',
  "['light-title', 'GO TO 01 · LIGHT-TIME']",
  "['parallax-survey-title', 'GO TO 13 · PARALLAX']",
  "['gravity-title', 'GO TO 02 · HORIZON SCALE']",
  "['unequal-minute-title', 'GO TO 12 · UNEQUAL CLOCKS']",
  "['inventory-title', 'GO TO 03 · INVENTORY']",
  "['gravitational-copy-title', 'GO TO 08 · LENSING']",
  "['frame-shifter-title', 'GO TO 06 · FRAME ORDER']",
  "['causal-signal-title', 'GO TO 07 · CAUSAL REACH']",
  "['redshift-ruler-title', 'GO TO 09 · REDSHIFT']",
  "['cosmic-strata-title', 'GO TO 14 · STRATA']",
  'READING ROUTES · These are ordinary in-page links',
  'not a confidence score, hierarchy of truth, probability scale',
  'mountConcordance();'
]) assert.ok(viewSource.includes(requiredText), `Deep Space concordance missing: ${requiredText}`);

const concordanceRoutePairCount = (viewSource.match(/targets: \[\[/g) || []).length;
assert.equal(concordanceRoutePairCount, 5, 'each of the five concordance crosscuts should expose one native two-stop reading route');
assert.match(viewSource, /link\.href = `#\$\{targetId\}`/,
  'reading routes should use local fragment links rather than scripted navigation');
assert.match(viewSource, /link\.style\.minHeight = '44px'/,
  'reading-route links should preserve a touch-sized minimum target');

assert.doesNotMatch(viewSource, /make\('button'|createElement\(['"]button|<button/i,
  'this generation intentionally exposes no new custom visitor control');
assert.doesNotMatch(viewSource, /addEventListener\s*\(/,
  'the static survey and native concordance should require no runtime interaction state');
assert.doesNotMatch(viewSource, /innerHTML|insertAdjacentHTML|outerHTML|document\.write/);
assert.doesNotMatch([coreSource, viewSource].join('\n'), /\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource/i);
assert.doesNotMatch([coreSource, viewSource].join('\n'), /localStorage|sessionStorage|indexedDB|document\.cookie|navigator\.geolocation|history\.(?:pushState|replaceState)/i);
assert.doesNotMatch([coreSource, viewSource].join('\n'), /setInterval|setTimeout|requestAnimationFrame/i);
assert.doesNotMatch(runtime, /https?:\/\//i, 'feature runtime must contain no remote URL');
assert.doesNotMatch(runtime, /\b(?:gtag|dataLayer|mixpanel|plausible|amplitude|hotjar)\b|google-analytics|googletagmanager|facebook\.com\/tr|doubleclick/i);
assert.doesNotMatch(css, /animation\s*:|transition\s*:/i,
  'the static survey should not need motion to convey its scientific meaning');

for (const pattern of [
  /grid-template-columns:\s*repeat\(3/,
  /overflow-x:\s*auto/,
  /min-width:\s*620px/,
  /prefers-reduced-motion/,
  /prefers-contrast/,
  /@media print/
]) assert.match(css, pattern);
assert.doesNotMatch(css, /@import\s+url|font-face|https?:\/\//i);

for (const pattern of [
  /function loadParallaxSurvey/,
  /\.\/parallax-survey\.css/,
  /\.\/parallax-survey-core\.js/,
  /\.\/parallax-survey\.js/,
  /function loadUnequalMinute\(done = loadParallaxSurvey\)/,
  /loadLocalScript\('\.\/unequal-minute\.js', 'unequal-minute-view', done\)/,
  /function loadSameAnswerMachine\(done = loadUnequalMinute\)/
]) assert.match(bootstrap, pattern);

for (const pattern of [
  /static survey plate/i,
  /land surveying/i,
  /control-free and state-free/i,
  /standard small-angle stellar-parallax relation/i,
  /synthetic cases/i,
  /schematic/i,
  /NASA Science/,
  /Documentation sources only/i
]) assert.match(doc, pattern);

assert.match(serviceWorker, /const PAGE_FOUR_DEAD_DROP_CACHE_NAME = 'museum-of-almost-v43-page-four-dead-drop'/,
  'Page Four v43 must remain named in cache lineage');
assert.match(serviceWorker, /const UNBUILT_ROOM_CACHE_NAME = 'museum-of-almost-v44-unbuilt-room'/,
  'Unbuilt Room v44 must remain named in cache lineage');
assert.match(serviceWorker, /const PARALLAX_SURVEY_CACHE_NAME = 'museum-of-almost-v45-parallax-survey'/,
  'Parallax Survey v45 must remain named in cache lineage even after later generations become current');
for (const asset of [
  './parallax-survey.css',
  './parallax-survey-core.js',
  './parallax-survey.js',
  './PARALLAX_SURVEY.md',
  './unequal-minute.css',
  './unequal-minute-core.js',
  './unequal-minute.js',
  './UNEQUAL_MINUTE.md',
  './404.html',
  './UNBUILT_ROOM.md'
]) assert.ok(serviceWorker.includes(`'${asset}'`), `offline shell should include ${asset}`);

console.log('Parallax Survey geometry plus Deep Space cosmic concordance, native cross-instrument reading routes, accessibility, privacy, no-network contract, lineage preservation, and progressive mount verified.');
