import assert from 'node:assert/strict';
import fs from 'node:fs';

const js = fs.readFileSync(new URL('../page-four-dead-drop.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../page-four-dead-drop.css', import.meta.url), 'utf8');
const doc = fs.readFileSync(new URL('../PAGE_FOUR_DEAD_DROP.md', import.meta.url), 'utf8');
const loader = fs.readFileSync(new URL('../page-four.js', import.meta.url), 'utf8');
const serviceWorker = fs.readFileSync(new URL('../service-worker.js', import.meta.url), 'utf8');

for (const pattern of [
  /FOUR LOCKS, ONE ROUTE/,
  /12 \/ DEAD DROP \/ RECRUITMENT FILE/,
  /PUZZLE FICTION \/\/ REAL-EVIDENCE QUESTIONS KEEP THEIR ORIGINAL LIMITS/,
  /Hints are evidence, not failure\./i,
  /A PUZZLE MAY HIDE AN ANSWER\. EVIDENCE MAY NOT\./,
  /05 \/\/ LEVEL −1 \/\/ FREIGHT LIFT/,
  /MUSEUM FICTION\. SAME-ORIGIN ROUTE\. NO CLAIM ABOUT THE WORLD OUTSIDE\./
]) assert.match(js, pattern, `Dead Drop missing ${pattern}`);

const puzzleIds = ['signal', 'cipher', 'logic', 'evidence'];
for (const id of puzzleIds) assert.match(js, new RegExp(`id: '${id}'`), `Dead Drop missing puzzle ${id}`);
assert.equal([...js.matchAll(/id: '(signal|cipher|logic|evidence)'/g)].length, 4,
  'Dead Drop should expose exactly four puzzle locks');
assert.equal([...js.matchAll(/correct: true/g)].length, 4,
  'Dead Drop should expose exactly one correct answer per lock');

for (const pattern of [
  /○ ○ ●  ○ ○ ●  ○ ○ \?/,
  /WKH ILOH LV QRW KHUH/,
  /Exactly one statement is true\. Which drawer holds the envelope\?/,
  /RADAR — three probable visual\/radar coincidences were recorded, with important limits\./,
  /RADIO — repeating spectrum spikes were recorded at the same time as the lights\./,
  /SEISMIC — no local seismic activity proves the lights were non-physical\./
]) assert.match(js, pattern, `Dead Drop puzzle content missing ${pattern}`);

for (const fragment of ['05', 'LEVEL −1', 'FREIGHT', 'LIFT']) {
  assert.ok(js.includes(`fragment: '${fragment}'`), `Dead Drop missing route fragment ${fragment}`);
}

assert.match(js, /href = 'elsewhere\.html'/, 'Dead Drop final route must stay same-origin');
assert.match(js, /solved\.size === puzzles\.length/, 'final route should require all four locks');
assert.match(js, /new Set\(\)/, 'solved puzzle state should be memory-only');
assert.match(js, /new Map\(puzzles\.map/, 'hint state should be memory-only');
assert.match(js, /RESEAL ALL FOUR LOCKS/, 'Dead Drop should expose an explicit reset');
assert.match(js, /Nothing was stored\./, 'reset feedback should state the memory-only boundary');
assert.match(js, /NO MATCH\. Nothing is locked out\./, 'wrong answers must not lock the visitor out');
assert.match(js, /Hints do not reduce progress\./, 'hint feedback should explicitly preserve progress');
assert.equal([...js.matchAll(/hints: \[/g)].length, 4, 'each puzzle should have a progressive hint file');

assert.match(js, /role', 'group'/, 'answer choices should expose grouped button semantics');
assert.match(js, /aria-pressed/, 'answer choices should expose selected state');
assert.match(js, /role', 'status'/, 'dynamic puzzle feedback should use status semantics');
assert.match(js, /aria-live', 'polite'/, 'dynamic puzzle feedback should be polite');
assert.match(js, /progress\.setAttribute\('aria-label'/, 'progress should expose a textual lock count');
assert.doesNotMatch(js, /createElement\(['"](?:input|textarea|select)['"]\)|contenteditable/i,
  'Dead Drop must not collect visitor free text or numeric input');

for (const source of [js, css]) {
  assert.doesNotMatch(source, /https?:\/\//i, 'Dead Drop visitor runtime must remain local-only');
}
assert.doesNotMatch(js, /\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource/i,
  'Dead Drop must not add runtime network requests');
assert.doesNotMatch(js, /localStorage|sessionStorage|indexedDB|document\.cookie|navigator\.geolocation/i,
  'Dead Drop must not persist or personalize visitor data');
assert.doesNotMatch(js, /analytics|telemetry|tracking|gtag|dataLayer|mixpanel|segment|plausible|amplitude|hotjar/i,
  'Dead Drop must remain tracking-free');
assert.doesNotMatch(js, /navigator\.share\b/, 'Dead Drop must not invoke external share targets');
assert.doesNotMatch(js, /innerHTML|insertAdjacentHTML|document\.write/i,
  'Dead Drop must mount through DOM nodes rather than HTML-string injection');
assert.doesNotMatch(js, /setInterval|setTimeout|requestAnimationFrame/i,
  'Dead Drop must not add polling, timers, or animation loops');

for (const pattern of [
  /Puzzle solutions/,
  /The client necessarily contains its own answers/,
  /View-source readers are allowed to inspect the mechanism/,
  /Caesar shift of `−3`/,
  /Drawer A/,
  /radio spectrum spikes were \*\*not\*\* recorded simultaneously/,
  /seismic null does \*\*not\*\* prove/,
  /Hints are evidence, not failure/,
  /Exactly four locks/,
  /Reload forgets progress/,
  /final route remains same-origin/,
  /v42 — The Unequal Minute/,
  /v43 — Page Four Dead Drop/
]) assert.match(doc, pattern, `Dead Drop recovery document missing ${pattern}`);

assert.match(loader, /page-four-dead-drop\.css/, 'Page Four loader should mount Dead Drop styles');
assert.match(loader, /page-four-dead-drop\.js/, 'Page Four loader should mount Dead Drop logic');
assert.match(loader, /loadDeadDrop\(\)/, 'Page Four should progressively mount the Dead Drop');
assert.match(loader, /script\.addEventListener\('load', loadDeadDrop, \{ once: true \}\)/,
  'Dead Drop should load only after the Instrument Room script completes');
assert.match(serviceWorker, /const SHUTTER_CABINET_CACHE_NAME = 'museum-of-almost-v41-shutter-cabinet'/,
  'Dead Drop release must preserve Shutter Cabinet as v41 lineage');
assert.match(serviceWorker, /const UNEQUAL_MINUTE_CACHE_NAME = 'museum-of-almost-v42-unequal-minute'/,
  'Dead Drop release must preserve Unequal Minute as the v42 predecessor');
assert.match(serviceWorker, /const PAGE_FOUR_DEAD_DROP_CACHE_NAME = 'museum-of-almost-v43-page-four-dead-drop'/,
  'Dead Drop must remain named as the v43 predecessor after later shell releases');
assert.match(serviceWorker, /const CURRENT_CACHE_NAME = 'museum-of-almost-v44-unbuilt-room'/,
  'the Unbuilt Room should own the v44 coherent offline shell');
assert.match(serviceWorker, /page-four-dead-drop\.css/, 'Dead Drop styles should be in the offline shell');
assert.match(serviceWorker, /page-four-dead-drop\.js/, 'Dead Drop logic should be in the offline shell');
assert.match(serviceWorker, /PAGE_FOUR_DEAD_DROP\.md/, 'Dead Drop recovery record should be in the offline shell');

for (const pattern of [/@media/, /prefers-reduced-motion/, /prefers-contrast/, /@media print/, /min-height:\s*44px/, /:focus-visible/]) {
  assert.match(css, pattern, `Dead Drop styles missing ${pattern}`);
}
assert.doesNotMatch(css, /@import\s+url|font-face|https?:\/\//i, 'Dead Drop styles must use local/system resources only');

console.log('Page Four Dead Drop four-lock puzzle chain, deterministic post-Instrument loading, progressive no-penalty hints, same-origin final route, evidence limits, accessibility, privacy, and v43 cache-lineage contracts verified.');