import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const require = createRequire(import.meta.url);

for (const name of [
  'deep-space.html', 'deep-space.js', 'causal-signal.css', 'causal-signal-core.js', 'causal-signal.js',
  'CAUSAL_SIGNAL_BOX.md', 'service-worker.js'
]) assert.ok(fs.existsSync(path.join(root, name)), `missing ${name}`);

const html = read('deep-space.html');
const bootstrap = read('deep-space.js');
const css = read('causal-signal.css');
const coreSource = read('causal-signal-core.js');
const viewSource = read('causal-signal.js');
const doc = read('CAUSAL_SIGNAL_BOX.md');
const worker = read('service-worker.js');
const runtime = [html, bootstrap, css, coreSource, viewSource].join('\n');
const core = require('../causal-signal-core.js');

for (const pattern of [
  /INSTRUMENT 07 · THE CAUSAL SIGNAL BOX \/ THE BUTTON CANNOT REACH EVERYTHING/,
  /The page stops pretending a click has infinite reach\./,
  /data-causal-route-id/,
  /causal-dispatch/,
  /causal-reset/,
  /causal-outcome/,
  /aria-live/,
  /LIGHT-SPEED EDGE/,
  /LOCKED OUTSIDE CONE/,
  /LOCKED IN THE PAST/
]) assert.match(viewSource + '\n' + coreSource, pattern);

for (const pattern of [
  /\.\/causal-signal\.css/,
  /\.\/causal-signal-core\.js/,
  /\.\/causal-signal\.js/,
  /dataDeepSpaceModule|deepSpaceModule/,
  /loadCausalSignalBox\(\)/
]) assert.match(bootstrap, pattern, `Deep Space bootstrap missing ${pattern}`);

for (const id of ['origin', 'edge', 'relay', 'deep', 'far', 'before']) {
  assert.match(coreSource, new RegExp(`id: '${id}'`), `missing station ${id}`);
}

assert.doesNotMatch(html, /<(input|textarea|select)\b|contenteditable|<iframe\b/i);
assert.doesNotMatch(runtime, /https?:\/\//i, 'causal signal runtime must remain local-only');
assert.doesNotMatch([coreSource, viewSource].join('\n'), /\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource/i);
assert.doesNotMatch([coreSource, viewSource].join('\n'), /localStorage|sessionStorage|indexedDB|document\.cookie|history\.(?:pushState|replaceState)|navigator\.geolocation/i);
assert.doesNotMatch([coreSource, viewSource].join('\n'), /setInterval|setTimeout|requestAnimationFrame/i);
assert.doesNotMatch(runtime, /\b(gtag|dataLayer|mixpanel|plausible|amplitude|hotjar)\b|segment\.com|analytics\.segment|google-analytics|googletagmanager|facebook\.com\/tr|doubleclick/i);
assert.match(viewSource, /\.textContent\s*=/);
assert.match(viewSource, /replaceChildren\(\)/);
assert.doesNotMatch(viewSource, /innerHTML|insertAdjacentHTML|document\.write/i, 'view should build fixed markup without HTML-string injection');

for (const pattern of [
  /min-height:\s*44px/,
  /:focus-visible/,
  /max-width:\s*620px/,
  /prefers-reduced-motion/,
  /prefers-contrast/,
  /@media print/
]) assert.match(css, pattern);
assert.doesNotMatch(css, /@import\s+url|font-face|https?:\/\//i);

assert.equal(core.STATIONS.length, 6);
assert.equal(core.ROUTES.length, 4);
assert.equal(new Set(core.STATIONS.map(({ id }) => id)).size, 6);
assert.equal(new Set(core.ROUTES.map(({ id }) => id)).size, 4);
assert.equal(core.getRoute('missing'), null);
assert.equal(core.classifySegment('origin', 'edge').causalClass, 'lightlike');
assert.equal(core.classifySegment('origin', 'relay').causalClass, 'timelike');
assert.equal(core.classifySegment('relay', 'deep').causalClass, 'timelike');
assert.equal(core.classifySegment('relay', 'far').causalClass, 'spacelike');
assert.equal(core.classifySegment('origin', 'before').causalClass, 'past');
assert.equal(core.classifySegment('origin', 'far').causalClass, 'lightlike', 'FAR is directly on ORIGIN light cone even though the relay shortcut is impossible');

const edge = core.evaluateRoute('light-edge');
assert.equal(edge.outcome, 'delivered');
assert.deepEqual(edge.reachedStationIds, ['edge']);
assert.equal(edge.firstLocked, null);

const chain = core.evaluateRoute('relay-chain');
assert.equal(chain.outcome, 'delivered');
assert.deepEqual(chain.reachedStationIds, ['relay', 'deep']);

const shortcut = core.evaluateRoute('impossible-shortcut');
assert.equal(shortcut.outcome, 'partial');
assert.deepEqual(shortcut.reachedStationIds, ['relay']);
assert.equal(shortcut.firstLocked.toId, 'far');
assert.equal(shortcut.firstLocked.causalClass, 'spacelike');
assert.equal(shortcut.firstLocked.deltaT, 2);
assert.equal(shortcut.firstLocked.distance, 5);

const past = core.evaluateRoute('past-call');
assert.equal(past.outcome, 'refused');
assert.deepEqual(past.reachedStationIds, []);
assert.equal(past.firstLocked.toId, 'before');
assert.equal(past.firstLocked.causalClass, 'past');

const frozenRoute = core.getRoute('relay-chain');
const beforeIds = [...frozenRoute.stationIds];
core.evaluateRoute('relay-chain');
assert.deepEqual(frozenRoute.stationIds, beforeIds, 'evaluation must not mutate fixed route declarations');

for (const [status, label] of Object.entries(core.STATUS_LABELS)) {
  assert.equal(core.statusLabel(status), label);
}

for (const pattern of [
  /Concept A — The Light-Cone Atlas/,
  /Concept B — The Causal Signal Box/,
  /Concept C — The Button Cannot Reach Everything/,
  /Concept A was discarded/,
  /Concepts B and C were merged/,
  /Δt > \|Δx\|/,
  /no data-service or external runtime request/i,
  /screen update happens immediately/i,
  /schematic/i
]) assert.match(doc, pattern);

for (const asset of [
  './causal-signal.css', './causal-signal-core.js', './causal-signal.js', './CAUSAL_SIGNAL_BOX.md'
]) assert.ok(worker.includes(`'${asset}'`), `service worker should cache ${asset}`);
assert.match(worker, /const REVERSE_LEDGER_CACHE_NAME = 'museum-of-almost-v22-reverse-ledger'/);
assert.match(worker, /const CAUSAL_SIGNAL_BOX_CACHE_NAME = 'museum-of-almost-v23-causal-signal-box'/,
  'later releases may advance CURRENT_CACHE_NAME, but the Causal Signal Box v23 release marker must remain preserved');

console.log('Causal Signal Box reachability, partial dispatch, progressive mount, privacy, accessibility, documentation, and offline contract verified.');
