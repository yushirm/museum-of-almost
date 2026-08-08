import assert from 'node:assert/strict';
import fs from 'node:fs';

const js = fs.readFileSync(new URL('../page-four-instrument-room.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../page-four-instrument-room.css', import.meta.url), 'utf8');
const ledger = fs.readFileSync(new URL('../PAGE_FOUR_HESSDALEN.md', import.meta.url), 'utf8');
const loader = fs.readFileSync(new URL('../page-four.js', import.meta.url), 'utf8');
const serviceWorker = fs.readFileSync(new URL('../service-worker.js', import.meta.url), 'utf8');

for (const pattern of [
  /THE INSTRUMENT ROOM/,
  /11 \/ HESSDALEN, 1984 \/ FIELD CROSS-EXAMINATION/,
  /DOCUMENTED FIELD RECORD \/\/ PAGE FOUR HYPOTHESES QUARANTINED/,
  /Coincidence is not identity\./,
  /A null is not nothing\./,
  /A failed instrument is part of provenance\./,
  /Controls may expose a failure mode without explaining this case\./,
  /STRANGE DESERVES INVESTIGATION\. INVESTIGATION DESERVES EVIDENCE\. EVIDENCE DOES NOT OWE US A STRANGE ANSWER\./
]) assert.match(js, pattern, `Instrument Room missing ${pattern}`);

const channelIds = ['visual', 'radar', 'radio', 'magnetic', 'laser', 'seismic', 'ir-radiation'];
for (const id of channelIds) assert.match(js, new RegExp(`id: '${id}'`), `missing field channel ${id}`);
assert.equal([...js.matchAll(/id: '(visual|radar|radio|magnetic|laser|seismic|ir-radiation)'/g)].length, 7,
  'Instrument Room should expose exactly seven historical field channels');

for (const pattern of [
  /188 light reports/,
  /53 at F5 or higher/,
  /subjective judgment/,
  /36 radar recordings/,
  /Three were probably also seen as lights/,
  /about ±3 seconds/,
  /not seen at the same time as the lights/,
  /4 of 10 F5-or-higher/,
  /8 of 9 attempts/,
  /no local seismic activity/,
  /two uses of the infrared viewers showed no strong infrared signal/
]) assert.match(js, pattern, `historical field record missing ${pattern}`);

const hypothesisCodes = ['H0', 'H1', 'H2', 'H3'];
for (const code of hypothesisCodes) assert.match(js, new RegExp(`code: '${code}'`), `missing hypothesis ${code}`);
assert.equal([...js.matchAll(/code: 'H[0-3]'/g)].length, 4, 'Instrument Room should expose exactly four competing hypotheses');
assert.match(js, /HYPOTHESIS CROSS-EXAMINATION/);
assert.match(js, /WHAT WOULD CHANGE OUR MIND\?/);
assert.match(js, /PAGE FOUR HYPOTHESIS: one structured external agent/);
assert.match(js, /status: 'NOT ESTABLISHED'/);
assert.match(js, /WEIGHS FOR/);
assert.match(js, /WEIGHS AGAINST/);
assert.match(js, /INCONCLUSIVE/);
assert.match(js, /NEUTRAL/);

const controlCodes = ['CTRL-GF-2015', 'CTRL-PR-2013', 'CTRL-ETNA-2018'];
for (const code of controlCodes) assert.match(js, new RegExp(code), `missing control file ${code}`);
assert.equal([...js.matchAll(/code: 'CTRL-/g)].length, 3, 'Instrument Room should expose exactly three modern control files');
assert.match(js, /CONTROLS TEACH FAILURE MODES\. THEY DO NOT RETROACTIVELY EXPLAIN HESSDALEN\./);
assert.match(js, /GOFAST \/ MOTION PARALLAX/);
assert.match(js, /PUERTO RICO \/ LOOK ANGLE/);
assert.match(js, /MT\. ETNA \/ ATMOSPHERE \+ SENSOR/);
assert.match(js, /Control file is methodological, not a Hessdalen explanation\./);

assert.match(js, /role', 'group'/, 'hypothesis and control selectors should expose grouped controls');
assert.match(js, /aria-pressed/, 'selectors should expose selected state');
assert.match(js, /role', 'status'/, 'dynamic analysis should expose status semantics');
assert.match(js, /aria-live', 'polite'/, 'dynamic analysis feedback should be polite');
assert.match(js, /PAGE_FOUR_HESSDALEN\.md/, 'Instrument Room should link to its local source ledger');
assert.match(js, /instrument-room-link/);
assert.match(js, /href = '#instrument-room'/);

for (const source of [js, css]) {
  assert.doesNotMatch(source, /https?:\/\//i, 'Instrument Room visitor runtime must remain local-only');
}
assert.doesNotMatch(js, /\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource/i,
  'Instrument Room must not add runtime network requests');
assert.doesNotMatch(js, /localStorage|sessionStorage|indexedDB|document\.cookie|navigator\.geolocation/i,
  'Instrument Room must not persist or personalize visitor data');
assert.doesNotMatch(js, /analytics|telemetry|tracking|gtag|dataLayer|mixpanel|segment|plausible|amplitude|hotjar/i,
  'Instrument Room must remain tracking-free');
assert.doesNotMatch(js, /navigator\.share\b/, 'Instrument Room must not invoke external share targets');
assert.doesNotMatch(js, /innerHTML|insertAdjacentHTML|document\.write/i,
  'Instrument Room must mount through DOM nodes rather than HTML-string injection');
assert.doesNotMatch(js, /setInterval|setTimeout|requestAnimationFrame/i,
  'Instrument Room must not add polling, timers, or animation loops');
assert.doesNotMatch(js, /createElement\(['"](?:input|textarea|select)['"]\)|contenteditable/i,
  'Instrument Room must not collect visitor free text or numeric input');

for (const pattern of [
  /Concept A — Hessdalen Field File/,
  /Concept B — The Sensor Stack/,
  /Concept C — The Observer-Dependent Intruder/,
  /Discarded:\*\* Concept C/,
  /Merged:\*\* Concepts A \+ B/,
  /https:\/\/old\.hessdalen\.org\/reports\/hpreport84\.shtml/,
  /https:\/\/www\.hessdalen\.org\/papers/,
  /10\.1016\/j\.actaastro\.2010\.01\.019/,
  /https:\/\/science\.nasa\.gov\/uap\//,
  /AARO_GoFast_Case_Resolution_Card_Methodology_Final\.pdf/,
  /AARO_Puerto_Rico_UAP_Case_Resolution\.pdf/,
  /Mt-Etna-Object\.pdf/,
  /The existing 1984 record does not establish H3\./,
  /A modern control case can demonstrate a failure mode\. It does \*\*not\*\* retroactively explain Hessdalen\./,
  /Source review date: 2026-08-08\./
]) assert.match(ledger, pattern, `Hessdalen source ledger missing ${pattern}`);

assert.match(ledger, /The report explicitly says nothing unusual was seen on the spectrum analyser at the same time the lights were seen\./,
  'source ledger must preserve the non-coincident radio result');
assert.match(ledger, /coincidence remained possible because many pulsations occurred/,
  'source ledger must preserve the magnetic coincidence caveat');
assert.match(ledger, /only two attempts/,
  'source ledger must preserve the weak infrared coverage');
assert.match(ledger, /No third-party source is loaded|performs no source-page request at visitor runtime/,
  'source ledger must preserve the no-runtime-source boundary');

assert.match(loader, /page-four-instrument-room\.css/, 'Page Four loader should mount Instrument Room styles');
assert.match(loader, /page-four-instrument-room\.js/, 'Page Four loader should mount Instrument Room logic');
assert.match(serviceWorker, /page-four-instrument-room\.css/, 'Instrument Room styles should be in the offline shell');
assert.match(serviceWorker, /page-four-instrument-room\.js/, 'Instrument Room logic should be in the offline shell');
assert.match(serviceWorker, /PAGE_FOUR_HESSDALEN\.md/, 'Instrument Room source ledger should be in the offline shell');

for (const pattern of [/@media/, /prefers-reduced-motion/, /prefers-contrast/, /@media print/, /min-height:\s*44px/, /:focus-visible/]) {
  assert.match(css, pattern, `Instrument Room styles missing ${pattern}`);
}
assert.doesNotMatch(css, /@import\s+url|font-face|https?:\/\//i, 'Instrument Room styles must use local/system resources only');

console.log('Page Four Hessdalen seven-channel field record, four-hypothesis cross-examination, modern control files, source boundaries, accessibility, privacy, and offline contracts verified.');