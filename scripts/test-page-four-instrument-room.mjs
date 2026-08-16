import assert from 'node:assert/strict';
import {
  assertCssContract,
  assertLocalRuntime,
  assertOfflineAssets,
  bundle,
  read,
  requirePatterns
} from './test-support.mjs';

const js = read('page-four-instrument-room.js');
const css = read('page-four-instrument-room.css');
const ledger = read('PAGE_FOUR_HESSDALEN.md');
const loader = read('page-four.js');
const serviceWorker = read('service-worker.js');

requirePatterns(js, [
  /THE INSTRUMENT ROOM/,
  /11 \/ HESSDALEN, 1984 \/ FIELD CROSS-EXAMINATION/,
  /DOCUMENTED FIELD RECORD \/\/ PAGE FOUR HYPOTHESES QUARANTINED/,
  /Coincidence is not identity\./,
  /A null is not nothing\./,
  /A failed instrument is part of provenance\./,
  /Controls may expose a failure mode without explaining this case\./,
  /STRANGE DESERVES INVESTIGATION\. INVESTIGATION DESERVES EVIDENCE\. EVIDENCE DOES NOT OWE US A STRANGE ANSWER\./
], 'Instrument Room');

const channelIds = ['visual', 'radar', 'radio', 'magnetic', 'laser', 'seismic', 'ir-radiation'];
for (const id of channelIds) assert.match(js, new RegExp(`id: '${id}'`), `missing field channel ${id}`);
assert.equal([...js.matchAll(/id: '(visual|radar|radio|magnetic|laser|seismic|ir-radiation)'/g)].length, 7,
  'Instrument Room should expose exactly seven historical field channels');

requirePatterns(js, [
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
], 'historical field record');

const hypothesisCodes = ['H0', 'H1', 'H2', 'H3'];
for (const code of hypothesisCodes) assert.match(js, new RegExp(`code: '${code}'`), `missing hypothesis ${code}`);
assert.equal([...js.matchAll(/code: 'H[0-3]'/g)].length, 4, 'Instrument Room should expose exactly four competing hypotheses');
requirePatterns(js, [
  /HYPOTHESIS CROSS-EXAMINATION/,
  /WHAT WOULD CHANGE OUR MIND\?/,
  /PAGE FOUR HYPOTHESIS: one structured external agent/,
  /status: 'NOT ESTABLISHED'/,
  /WEIGHS FOR/,
  /WEIGHS AGAINST/,
  /INCONCLUSIVE/,
  /NEUTRAL/
], 'Instrument Room hypothesis controls');

const controlCodes = ['CTRL-GF-2015', 'CTRL-PR-2013', 'CTRL-ETNA-2018'];
for (const code of controlCodes) assert.match(js, new RegExp(code), `missing control file ${code}`);
assert.equal([...js.matchAll(/code: 'CTRL-/g)].length, 3, 'Instrument Room should expose exactly three modern control files');
requirePatterns(js, [
  /CONTROLS TEACH FAILURE MODES\. THEY DO NOT RETROACTIVELY EXPLAIN HESSDALEN\./,
  /GOFAST \/ MOTION PARALLAX/,
  /PUERTO RICO \/ LOOK ANGLE/,
  /MT\. ETNA \/ ATMOSPHERE \+ SENSOR/,
  /Control file is methodological, not a Hessdalen explanation\./
], 'Instrument Room control files');

requirePatterns(js, [
  /role', 'group'/,
  /aria-pressed/,
  /role', 'status'/,
  /aria-live', 'polite'/,
  /PAGE_FOUR_HESSDALEN\.md/,
  /instrument-room-link/,
  /href = '#instrument-room'/
], 'Instrument Room accessibility and routing');

assertLocalRuntime(bundle(js, css), 'Instrument Room', {
  domStringInjection: true,
  visitorInput: true
});
assert.doesNotMatch(js, /navigator\.share\b/, 'Instrument Room must not invoke external share targets');

requirePatterns(ledger, [
  /Concept A — Hessdalen Field File/,
  /Concept B — The Sensor Stack/,
  /Concept C — The Observer-Dependent Intruder/,
  /\*\*Discarded:\*\* Concept C/,
  /\*\*Merged:\*\* Concepts A \+ B/,
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
], 'Hessdalen source ledger');

assert.match(ledger, /The report explicitly says nothing unusual was seen on the spectrum analyser at the same time the lights were seen\./,
  'source ledger must preserve the non-coincident radio result');
assert.match(ledger, /coincidence remained possible because many pulsations occurred/,
  'source ledger must preserve the magnetic coincidence caveat');
assert.match(ledger, /only two attempts/,
  'source ledger must preserve the weak infrared coverage');
assert.match(ledger, /No third-party source is loaded|performs no source-page request at visitor runtime/,
  'source ledger must preserve the no-runtime-source boundary');

requirePatterns(loader, [/page-four-instrument-room\.css/, /page-four-instrument-room\.js/], 'Page Four loader');
assertOfflineAssets(serviceWorker, [
  './page-four-instrument-room.css',
  './page-four-instrument-room.js',
  './PAGE_FOUR_HESSDALEN.md'
], 'Instrument Room offline shell');

assertCssContract(css, 'Instrument Room styles', { touchTarget: true, focusVisible: true });

console.log('Page Four Hessdalen seven-channel field record, four-hypothesis cross-examination, modern control files, source boundaries, accessibility, privacy, and offline contracts verified.');
