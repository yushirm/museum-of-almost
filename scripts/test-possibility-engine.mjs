import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const require = createRequire(import.meta.url);

for (const name of [
  'deep-space.html', 'possibility-engine.css', 'possibility-engine-core.js', 'possibility-engine.js',
  'DEEP_SPACE.md', 'POSSIBILITY_ENGINE.md'
]) assert.ok(fs.existsSync(path.join(root, name)), `missing ${name}`);

const html = read('deep-space.html');
const css = read('possibility-engine.css');
const coreSource = read('possibility-engine-core.js');
const viewSource = read('possibility-engine.js');
const record = read('POSSIBILITY_ENGINE.md');
const runtime = [html, css, coreSource, viewSource].join('\n');
const core = require('../possibility-engine-core.js');

for (const pattern of [
  /THE POSSIBILITY ENGINE \/ SUCCESS ARCHIVES/,
  /SUCCESS ARCHIVES · FILED BY WHAT CHANGED/,
  /Wrong turns worth keeping\./,
  /DEFICIT → TRANSFORMATION/,
  /EXPECTED SLOWING → ACCELERATION/,
  /PREDICTION → DETECTION/,
  /href="possibility-engine\.css"/,
  /src="possibility-engine-core\.js"/,
  /src="possibility-engine\.js"/
]) assert.match(html, pattern);

for (const id of [
  'possibility-section-title', 'success-progress', 'success-case-title', 'success-case-question', 'success-case-map',
  'success-evidence-title', 'success-evidence-body', 'success-possibilities', 'success-apply', 'success-reset'
]) assert.match(html, new RegExp(`id=["']${id}["']`), `missing possibility interface id ${id}`);

assert.match(html, /Bar width is a categorical chamber state, not a probability, confidence score/);
assert.doesNotMatch(runtime, /<script[^>]+src=["'](?:https?:)?\/\//i);
assert.doesNotMatch(runtime, /<link[^>]+href=["'](?:https?:)?\/\//i);
assert.doesNotMatch([coreSource, viewSource].join('\n'), /\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource/i);
assert.doesNotMatch([coreSource, viewSource].join('\n'), /localStorage|sessionStorage|indexedDB|document\.cookie|navigator\.geolocation/i);
assert.doesNotMatch([coreSource, viewSource].join('\n'), /setInterval|setTimeout|requestAnimationFrame/i);
assert.doesNotMatch(runtime, /\b(gtag|dataLayer|mixpanel|segment|plausible|amplitude|hotjar)\b|google-analytics|googletagmanager|facebook\.com\/tr|doubleclick/i);
assert.match(viewSource, /replaceChildren/);
assert.match(viewSource, /textContent/);

assert.match(css, /min-height:\s*44px/);
assert.match(css, /max-width:\s*620px/);
assert.match(css, /prefers-reduced-motion/);
assert.match(css, /prefers-contrast/);
assert.match(css, /@media print/);
assert.doesNotMatch(css, /@import\s+url|font-face|https?:\/\//i);

assert.equal(core.SUCCESS_CASES.length, 3);
assert.equal(new Set(core.SUCCESS_CASES.map(({ id }) => id)).size, 3);
assert.equal(core.possibilitySnapshot('missing-case', 1), null);
assert.equal(core.possibilitySnapshot('solar-neutrinos', -50).evidenceCount, 0);
assert.equal(core.possibilitySnapshot('solar-neutrinos', 50).evidenceCount, 2);

const before = JSON.stringify(core.SUCCESS_CASES);
const solar = core.possibilitySnapshot('solar-neutrinos', 2);
assert.equal(solar.possibilities.find(({ id }) => id === 'solar-model').status, 'retired');
assert.equal(solar.possibilities.find(({ id }) => id === 'fixed-identity').status, 'retired');
assert.equal(solar.possibilities.find(({ id }) => id === 'oscillation').status, 'survived');

const expansion = core.possibilitySnapshot('accelerating-universe', 2);
assert.equal(expansion.possibilities.find(({ id }) => id === 'slowing').status, 'retired');
assert.equal(expansion.possibilities.find(({ id }) => id === 'accelerating').status, 'survived');

const waves = core.possibilitySnapshot('gravitational-waves', 2);
assert.equal(waves.possibilities.find(({ id }) => id === 'noise').status, 'retired');
assert.equal(waves.possibilities.find(({ id }) => id === 'wave').status, 'survived');
assert.equal(waves.possibilities.find(({ id }) => id === 'binary-black-hole').status, 'survived');
assert.equal(JSON.stringify(core.SUCCESS_CASES), before, 'render snapshots must not mutate fixed archive cases');

for (const status of ['open', 'pressured', 'retired', 'survived']) assert.ok(core.statusLabel(status));

for (const pattern of [
  /Concept A — The Evidence Ladder/,
  /Concept B — The Falsification Chamber/,
  /Concept C — The Museum Keeps Only Successful Failures/,
  /Concept A was discarded/,
  /https:\/\/www\.nobelprize\.org\/prizes\/physics\/2015\/press-release\//,
  /https:\/\/www\.nobelprize\.org\/prizes\/physics\/2011\/press-release\//,
  /https:\/\/www\.nobelprize\.org\/prizes\/physics\/2017\/press-release\//,
  /No new runtime request or remote asset/
]) assert.match(record, pattern);

console.log('Deep Space Possibility Engine, Success Archives, scientific-state semantics, accessibility, privacy, and local-only contract verified.');
