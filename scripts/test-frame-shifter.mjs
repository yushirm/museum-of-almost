import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const require = createRequire(import.meta.url);

for (const name of ['frame-shifter-core.js', 'frame-shifter.js', 'frame-shifter.css', 'FRAME_SHIFTER.md']) {
  assert.ok(fs.existsSync(path.join(root, name)), `missing ${name}`);
}

const coreSource = read('frame-shifter-core.js');
const viewSource = read('frame-shifter.js');
const css = read('frame-shifter.css');
const html = read('deep-space.html');
const record = read('FRAME_SHIFTER.md');
const runtime = [coreSource, viewSource, css, html].join('\n');
const core = require('../frame-shifter-core.js');

assert.equal(core.FRAMES.length, 5);
assert.equal(core.SCENARIOS.length, 3);
assert.ok(Object.isFrozen(core.FRAMES));
assert.ok(Object.isFrozen(core.SCENARIOS));
assert.equal(core.gamma(0), 1);
assert.ok(Math.abs(core.gamma(0.6) - 1.25) < 1e-12);
assert.equal(core.gamma(1), null);
assert.equal(core.gamma(-1), null);

const rest = core.frameState('distant-flashes', 0);
const right = core.frameState('distant-flashes', 0.6);
const left = core.frameState('distant-flashes', -0.6);
assert.equal(rest.causalClass, 'spacelike');
assert.ok(Math.abs(rest.transformed.deltaT) < 1e-12);
assert.ok(Math.abs(right.transformed.deltaT + 3) < 1e-12, 'right-moving frame should place B 3 s before A');
assert.ok(Math.abs(right.transformed.deltaX - 5) < 1e-12);
assert.ok(Math.abs(left.transformed.deltaT - 3) < 1e-12, 'left-moving frame should place B 3 s after A');
assert.match(right.order, /B occurs before A by 3 seconds/);
assert.match(left.order, /A occurs before B by 3 seconds/);
assert.ok(right.visualOffsetPercent < 0);
assert.ok(left.visualOffsetPercent > 0);
assert.ok(Math.abs(right.invariant - 16) < 1e-12);
assert.ok(Math.abs(right.transformedInvariant - right.invariant) < 1e-9, 'Lorentz transform must preserve the interval');

for (const frame of core.FRAMES) {
  const light = core.frameState('light-pulse', frame.beta);
  assert.equal(light.causalClass, 'lightlike');
  assert.ok(light.transformed.deltaT > 0, `light pulse order should stay causal in ${frame.id}`);
  assert.ok(Math.abs(light.transformedInvariant) < 1e-9);

  const timelike = core.frameState('timelike-exchange', frame.beta);
  assert.equal(timelike.causalClass, 'timelike');
  assert.ok(timelike.transformed.deltaT > 0, `timelike order should not flip in ${frame.id}`);
  assert.ok(timelike.invariant < 0);
  assert.ok(Math.abs(timelike.transformedInvariant - timelike.invariant) < 1e-9);
}

for (const pattern of [
  /INSTRUMENT 06 · NO UNIVERSAL NOW \/ THE FRAME SHIFTER/,
  /id="frame-stage"/,
  /id="frame-delta-time"/,
  /id="frame-delta-space"/,
  /id="frame-invariant"/,
  /id="frame-causal-class"/,
  /id="frame-order"/,
  /data-spacetime-scenario-id="distant-flashes"/,
  /data-frame-beta="0\.6"/,
  /href="frame-shifter\.css"/,
  /src="frame-shifter-core\.js"/,
  /src="frame-shifter\.js"/
]) assert.match(html, pattern);

assert.match(html, /aria-live="polite"/);
assert.match(css, /min-height:\s*44px/);
assert.match(css, /max-width:\s*620px/);
assert.match(css, /prefers-reduced-motion/);
assert.match(css, /prefers-contrast/);
assert.match(css, /@media print/);
assert.match(css, /--event-b-top/);
assert.match(css, /frame-causal-compass/);
assert.match(css, /frame-causal-compass-map/);
assert.match(viewSource, /style\.setProperty\('--event-b-top'/);
assert.match(viewSource, /CAUSAL_STAGE_FIELDS/);
assert.match(viewSource, /function renderCausalField\(kind\)/);
assert.match(viewSource, /stage\.style\.backgroundImage = layers\.join\(', '\)/);
assert.match(viewSource, /stage\.dataset\.causalField = kind/);
assert.match(viewSource, /renderCausalField\(state\.causalClass\)/);
for (const pattern of [
  /radial-gradient\(circle at 25% 50%/,
  /radial-gradient\(circle at 75% 50%/,
  /linear-gradient\(135deg, transparent 46%/,
  /linear-gradient\(90deg, transparent 42%/
]) assert.match(viewSource, pattern, `causal stage field missing ${pattern}`);
assert.match(viewSource, /CAUSAL COMPASS · INVARIANT CLASS/);
assert.match(viewSource, /Changing frame moves the coordinates, not the causal region\./);
assert.match(viewSource, /dataset\.causalRegion === kind/);
assert.match(viewSource, /setAttribute\('aria-current', 'true'\)/);
assert.match(viewSource, /categorical map, not a scaled spacetime diagram/i);
for (const label of ['SPACELIKE', 'LIGHTLIKE', 'TIMELIKE']) assert.match(viewSource, new RegExp(label));

for (const pattern of [
  /function buildOrderTrace\(\)/,
  /function renderOrderTrace\(state\)/,
  /createElementNS\('http:\/\/www\.w3\.org\/2000\/svg', 'svg'\)/,
  /id = 'frame-order-trace'/,
  /COORDINATE ORDER · A ⇄ B/,
  /COORDINATE ORDER · \$\{orderLabel\}/,
  /orderTraceLine\.setAttribute\('y2', String\(eventBY\)\)/,
  /orderTrace\.dataset\.orderState = orderState/,
  /renderOrderTrace\(state\)/,
  /buildOrderTrace\(\);/
]) assert.match(viewSource, pattern, `coordinate-order trace missing ${pattern}`);
assert.match(viewSource, /orderLabel = 'A → B'/);
assert.match(viewSource, /orderLabel = 'B → A'/);
assert.match(record, /Concept A/);
assert.match(record, /Concept B/);
assert.match(record, /Concept C/);
assert.match(record, /Concept B was discarded/);
assert.match(record, /Δt′ = gamma \(Δt - beta Δx\)/);
assert.match(record, /never allow a spacelike order flip to masquerade as causation/i);

assert.doesNotMatch(runtime, /https?:\/\//i, 'Frame Shifter runtime must remain local-only');
assert.doesNotMatch([coreSource, viewSource].join('\n'), /\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource/i);
assert.doesNotMatch([coreSource, viewSource].join('\n'), /localStorage|sessionStorage|indexedDB|document\.cookie|navigator\.geolocation/i);
assert.doesNotMatch([coreSource, viewSource].join('\n'), /setInterval|setTimeout|requestAnimationFrame/i);
assert.doesNotMatch(runtime, /\b(gtag|dataLayer|mixpanel|segment|plausible|amplitude|hotjar)\b|google-analytics|googletagmanager|doubleclick/i);

console.log('Deep Space Frame Shifter relativity, invariant causal field, coordinate-order trace, accessibility, privacy, and no-network contract verified.');