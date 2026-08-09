import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const cosmic = require('../cosmic-signal-core.js');
const coreSource = fs.readFileSync(new URL('../cosmic-signal-core.js', import.meta.url), 'utf8');
const viewSource = fs.readFileSync(new URL('../cosmic-signal-view.js', import.meta.url), 'utf8');
const loaderSource = fs.readFileSync(new URL('../cosmic-signal.js', import.meta.url), 'utf8');
const appSource = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const source = [coreSource, viewSource, loaderSource].join('\n');
const styles = fs.readFileSync(new URL('../cosmic-signal.css', import.meta.url), 'utf8');

assert.equal(cosmic.SOURCE, 'https://services.swpc.noaa.gov/products/noaa-scales.json');
assert.ok(appSource.includes(cosmic.SOURCE), 'the shared snapshot acquisition must own the approved NOAA Scales request');
assert.match(appSource, /Promise\.allSettled\([\s\S]*SOURCES\.earthquakes[\s\S]*SOURCES\.solar[\s\S]*SOURCES\.scales[\s\S]*weatherUrl[\s\S]*SOURCES\.events/,
  'all five current feeds must cross the same acquisition barrier');
assert.match(appSource, /if \(requestController !== activeController\) return;/,
  'an aborted older acquisition must never overwrite a newer latch');
assert.match(appSource, /snapshot\.feeds\.solar \|\| snapshot\.feeds\.scales/,
  'NOAA must count as an answered public service when either of its two feeds answers');
assert.match(appSource, /MuseumCommonsSnapshot/);
assert.match(appSource, /museum:commons-snapshot/);
assert.match(viewSource, /museum:commons-snapshot/);
assert.match(viewSource, /MuseumCommonsSnapshot/);
assert.doesNotMatch(viewSource, /\bfetch\s*\(/,
  'the Cosmic Signal Chain must consume the shared latch rather than create an independent refresh cycle');

const sample = {
  '-1': {
    DateStamp: '2026-08-06',
    TimeStamp: '12:00:00',
    G: { Scale: '3', Text: 'strong' },
    S: { Scale: '1', Text: 'minor' },
    R: { Scale: '2', Text: 'moderate' }
  },
  '0': {
    DateStamp: '2026-08-07',
    TimeStamp: '15:20:00',
    G: { Scale: '1', Text: 'minor' },
    S: { Scale: '0', Text: 'none' },
    R: { Scale: '0', Text: 'none' }
  },
  '1': {
    DateStamp: '2026-08-08',
    TimeStamp: '00:00:00',
    G: { Scale: '4', Text: 'severe' },
    S: { Scale: null, Text: null },
    R: { Scale: null, Text: null }
  }
};

const normalized = cosmic.normalizeNoaaScales(sample);
assert.equal(normalized.available, true);
assert.equal(normalized.geomagnetic.code, 'G1');
assert.equal(normalized.geomagnetic.text, 'minor');
assert.equal(normalized.radiation.code, 'S0');
assert.equal(normalized.radiation.text, 'none');
assert.equal(normalized.radio.code, 'R0');
assert.equal(normalized.observedAt, '2026-08-07 15:20:00 UTC');

assert.deepEqual(cosmic.normalizeNoaaScales({
  G: { Scale: 5, Text: '' },
  S: { Scale: 2, Text: 'moderate' },
  R: { Scale: 1, Text: 'minor' }
}).geomagnetic, {
  available: true,
  scale: 5,
  code: 'G5',
  text: 'extreme'
});

const invalid = cosmic.normalizeNoaaScales({
  G: { Scale: 7, Text: 'impossible' },
  S: { Scale: -1, Text: 'impossible' },
  R: { Scale: 'not-a-number', Text: 'impossible' }
});
assert.equal(invalid.available, false, 'out-of-range scientific values must become unavailable, never clamped');
assert.equal(invalid.geomagnetic.code, 'G—');
assert.equal(invalid.radiation.code, 'S—');

const arrayPayload = cosmic.normalizeNoaaScales([
  { other: true },
  { G: { Scale: '2', Text: 'moderate' }, S: { Scale: '1', Text: 'minor' } }
]);
assert.equal(arrayPayload.geomagnetic.code, 'G2');
assert.equal(arrayPayload.radiation.code, 'S1');

assert.equal(
  cosmic.cosmicSentence('438 km/s', normalized),
  'solar wind 438 km/s · geomagnetic G1 minor · solar radiation S0 none.'
);
assert.equal(
  cosmic.cosmicSentence('—', cosmic.normalizeNoaaScales(null)),
  'Cosmic measurements are unavailable in this snapshot.'
);

assert.match(appSource, /credentials:\s*'omit'/);
assert.match(appSource, /referrerPolicy:\s*'no-referrer'/);
assert.match(appSource, /cache:\s*'no-store'/);
assert.match(appSource, /mode:\s*'cors'/);
assert.match(appSource, /AbortController/);
assert.match(source, /MutationObserver/);
assert.match(source, /reading order is not a causal timeline/i);
assert.match(source, /No automatic polling/i);
assert.match(loaderSource, /THE SAMPLING FLOOR · WHAT CAN FALL BETWEEN SAMPLES\?/i);
assert.match(loaderSource, /13 POINTS ARE NOT A PLANETARY FIELD/i);
assert.match(loaderSource, /ONE LATCH IS NOT A TREND/i);
assert.match(loaderSource, /No anti-aliasing claim/i);
assert.match(loaderSource, /The instrument shows what its samples support and leaves the unsampled world unsaid/i);
assert.doesNotMatch(source, /setInterval|requestAnimationFrame|localStorage|sessionStorage|indexedDB|document\.cookie|navigator\.geolocation/i);
assert.doesNotMatch(source, /analytics|telemetry|sendBeacon|XMLHttpRequest|WebSocket|EventSource/i);
assert.doesNotMatch(source, /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i);
assert.doesNotMatch(source, /\bAKIA[0-9A-Z]{16}\b|\bsk-(?:proj-)?[A-Za-z0-9_-]{16,}\b|BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY/i);
assert.doesNotMatch(source, /\/Users\/|\/home\/[A-Za-z0-9._-]+|C:\\Users\\/i);

assert.match(styles, /content:\s*"·"/);
assert.doesNotMatch(styles, /content:\s*["'][→↓]["']/,
  'cosmic detector separators must stay visually non-causal');
assert.match(styles, /@media \(max-width: 760px\)/);
assert.match(styles, /@media \(max-width: 380px\)/);
assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
assert.match(styles, /@media \(prefers-contrast: more\)/);
assert.match(styles, /@media print/);
assert.doesNotMatch(styles, /@import\s+url|font-face|https?:\/\//i);
assert.doesNotMatch(styles, /min-width:\s*[4-9]\d\dpx/);

console.log('Cosmic Signal Chain normalization, shared five-feed latch ordering, sampling-floor boundaries, privacy boundary, accessibility hooks, and missing-value integrity verified.');