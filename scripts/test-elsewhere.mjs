import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (name) => fs.readFileSync(new URL(`../${name}`, import.meta.url), 'utf8');
const html = read('elsewhere.html');
const css = read('elsewhere.css');
const js = read('elsewhere.js');
const teaser = read('elsewhere-teaser.css');
const index = read('index.html');
const worker = read('service-worker.js');

for (const phrase of [
  'ELSEWHERE /',
  'CATALOGUE 0',
  'SERVICE ACCESS / FIFTH SPACE',
  'Four public doors. One freight lift.',
  'Objects with provenance problems.',
  'LOST & FOUND / ELSEWHERE',
  'Nothing here is evidence.',
  'FICTIONAL COLLECTION · NO ACCOUNT · NO ANALYTICS · NO TRACKING'
]) assert.match(html, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `missing ${phrase}`);

for (const href of ['index.html', 'commons-now.html', 'deep-space.html', 'almost-online.html', 'page-four.html']) {
  assert.ok(html.includes(`href="${href}"`), `missing return route ${href}`);
}

const artifactIds = [...html.matchAll(/id="artifact-c0-(\d{3})"/g)].map((match) => match[1]);
assert.deepEqual(artifactIds, ['001','002','003','004','005','006','007','008','009','010','011','012']);
assert.equal((html.match(/data-artifact/g) || []).length, 12, 'Catalogue 0 should expose exactly twelve fixed fictional records');
assert.equal((html.match(/<details class="artifact"/g) || []).length, 12, 'records should use native progressive disclosure');

assert.match(html, /All Catalogue 0 artifacts|Catalogue 0 is a fictional museum department/i);
assert.match(html, /does not accept visitor submissions, names, stories, uploads or free text/i);
assert.doesNotMatch(html, /<iframe\b|<input\b|<textarea\b|contenteditable/i);
assert.doesNotMatch(html, /(?:src|href)="https?:\/\//i, 'fifth space must use only same-origin runtime assets');

for (const forbidden of [
  /\bfetch\s*\(/,
  /XMLHttpRequest|sendBeacon|WebSocket|EventSource/i,
  /localStorage|sessionStorage|indexedDB|document\.cookie/i,
  /navigator\.geolocation|\bgeolocation\b/i,
  /setInterval|requestAnimationFrame/i,
  /analytics|telemetry|googletag|gtag|mixpanel|segment|hotjar/i
]) assert.doesNotMatch(js, forbidden, `elsewhere.js violates local-only boundary: ${forbidden}`);

assert.match(js, /document\.querySelectorAll\('\[data-artifact\]'\)/);
assert.match(js, /button\.addEventListener\('click'/);
assert.match(js, /record\.open = true/);
assert.match(js, /navigator\.serviceWorker\.register\('\.\/service-worker\.js'\)/);
assert.match(js, /prefers-reduced-motion: reduce/);

for (const pattern of [
  /min-height:\s*44px/,
  /:focus-visible/,
  /@media \(max-width: 700px\)/,
  /@media \(prefers-reduced-motion: reduce\)/,
  /@media \(prefers-contrast: more\)/,
  /@media print/
]) assert.match(css, pattern, `elsewhere.css missing accessibility/responsive pattern ${pattern}`);
assert.doesNotMatch(css, /@import|@font-face|https?:\/\//i);
assert.match(teaser, /min-height:\s*44px/);
assert.match(teaser, /prefers-reduced-motion/);
assert.match(teaser, /prefers-contrast/);

assert.match(index, /href="elsewhere-teaser\.css"/);
assert.match(index, /FACILITIES NOTICE 05 \/ FLOOR PLAN DISAGREEMENT/);
assert.match(index, /href="elsewhere\.html"/);
assert.match(index, /OPEN SERVICE DOOR/);
assert.doesNotMatch(index, /gallery-card[^>]+href="elsewhere\.html"/i, 'fifth space should not become an ordinary gallery card');

for (const asset of ['./elsewhere.html', './elsewhere.css', './elsewhere.js', './elsewhere-teaser.css', './ELSEWHERE_CATALOGUE_ZERO.md']) {
  assert.ok(worker.includes(`'${asset}'`), `offline shell missing ${asset}`);
}
assert.match(worker, /museum-of-almost-v39-catalogue-zero/);
assert.doesNotMatch(worker, /https?:\/\//);

console.log('ELSEWHERE / CATALOGUE 0 is present as a fictional, local-only fifth space with twelve fixed records, accessible routes, and offline shell coverage.');
