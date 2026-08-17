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
assert.match(viewSource, /function renderArchive\(/);
assert.match(viewSource, /archiveHeading\.hidden = !complete/);
assert.match(viewSource, /archiveGrid\.hidden = !complete/);
assert.match(viewSource, /snapshot\.archive\.hinge/);
assert.match(viewSource, /snapshot\.archive\.result/);
assert.match(viewSource, /snapshot\.archive\.source/);
assert.match(viewSource, /Evidence run complete/i);
assert.match(viewSource, /Pattern and material state are categorical chamber states/);
assert.match(viewSource, /Track length does not rank possibilities/);
assert.match(viewSource, /possibilityMapNote\.style\.display = 'block'/, 'enhancement should reveal the corrected categorical note');

assert.match(css, /min-height:\s*44px/);
assert.match(css, /max-width:\s*620px/);
assert.match(css, /success-archive-heading\[hidden\]/);
assert.match(css, /\.possibility-map-note \{ display: none;/, 'no-JavaScript fallback must not expose the retired bar-width explanation');
assert.match(css, /success-archive-grid\[data-earned-archive="true"\]/);
assert.match(css, /prefers-reduced-motion/);
assert.match(css, /prefers-contrast/);
assert.match(css, /forced-colors: active/);
assert.match(css, /@media print/);
assert.doesNotMatch(css, /@import\s+url|font-face|https?:\/\//i);

assert.match(css, /\.possibility-card\[data-status="pressured"\][\s\S]*?border-style:\s*dashed/, 'pressured possibilities should use a categorical dashed state rather than reduced length');
assert.match(css, /\.possibility-card\[data-status="pressured"\] \.possibility-gauge-fill[\s\S]*?repeating-linear-gradient/, 'pressured possibilities should retain full-length hatched material state');
assert.match(css, /\.possibility-card\[data-status="retired"\][\s\S]*?opacity:\s*1[\s\S]*?transform:\s*none[\s\S]*?border-style:\s*dashed/, 'retired possibilities should remain legible as full-size fossil traces');
assert.match(css, /\.possibility-card\[data-status="retired"\]::after/, 'retired possibilities should retain a bounded hollow trace');
assert.match(css, /@media \(forced-colors: active\)[\s\S]*?data-status="retired"/, 'categorical fossil state should remain explicit in forced colors');
assert.doesNotMatch(css, /width:\s*(?:62|18)%/, 'categorical statuses must not masquerade as quantitative bar lengths');

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
assert.equal(solar.archive.hinge, 'DEFICIT → TRANSFORMATION');
assert.match(solar.archive.result, /neutrinos can change flavour/);
assert.match(solar.archive.source, /Physics 2015/);

const expansion = core.possibilitySnapshot('accelerating-universe', 2);
assert.equal(expansion.possibilities.find(({ id }) => id === 'slowing').status, 'retired');
assert.equal(expansion.possibilities.find(({ id }) => id === 'accelerating').status, 'survived');
assert.equal(expansion.archive.hinge, 'EXPECTED SLOWING → ACCELERATION');

const waves = core.possibilitySnapshot('gravitational-waves', 2);
assert.equal(waves.possibilities.find(({ id }) => id === 'noise').status, 'retired');
assert.equal(waves.possibilities.find(({ id }) => id === 'wave').status, 'survived');
assert.equal(waves.possibilities.find(({ id }) => id === 'binary-black-hole').status, 'survived');
assert.equal(waves.archive.hinge, 'PREDICTION → DETECTION');
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
  /constant length/,
  /Track length does not rank possibilities/,
  /No new runtime request or remote asset/
]) assert.match(record, pattern);

console.log('Deep Space Possibility Engine, categorical material-state evidence map, earned Success Archive consequence, scientific-state semantics, accessibility, privacy, and local-only contract verified.');
