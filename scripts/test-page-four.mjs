import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../page-four.html', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../page-four.css', import.meta.url), 'utf8');
const teaser = fs.readFileSync(new URL('../page-four-teaser.css', import.meta.url), 'utf8');
const js = fs.readFileSync(new URL('../page-four.js', import.meta.url), 'utf8');
const entrance = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');

for (const pattern of [
  /PAGE FOUR/,
  /THE UNFILED \/ THE UNSEEN \/ THE UNVERIFIED/,
  /CRYPTID SIGHTINGS/,
  /IMPOSSIBLE MAPS/,
  /CELESTIAL THEORIES/,
  /MISSING BROADCASTS/,
  /SUSPICIOUS DIAGRAMS/,
  /FIELD NOTES/,
  /WITNESS ACCOUNTS/,
  /REDACTED ARCHIVE FRAGMENTS/,
  /EVIDENCE BOARD/,
  /FICTIONAL ARCHIVE/,
  /NO CLAIM OF FACT/,
  /PAGE FOUR IS FICTION/
]) assert.match(html, pattern, `Page Four missing ${pattern}`);

const ids = [...html.matchAll(/data-case="([^"]+)"/g)].map((match) => match[1]);
assert.equal(ids.length, 9, 'Page Four should expose exactly nine case sections');
assert.equal(new Set(ids).size, ids.length, 'Page Four case identifiers must be unique');

for (const target of [...html.matchAll(/data-target="([^"]+)"/g)].map((match) => match[1])) {
  assert.ok(ids.includes(target), `evidence-board target ${target} should resolve to a case`);
}

assert.match(entrance, /href="page-four\.html"/);
assert.match(entrance, /href="page-four-teaser\.css"/);
assert.match(entrance, /GALLERY 04 · UNFILED \/ UNVERIFIED/);
assert.match(entrance, /The fourth was not on the floor plan\./);

for (const source of [html, css, teaser, js]) {
  assert.doesNotMatch(source, /https?:\/\//i, 'Page Four runtime must remain local-only');
}
assert.doesNotMatch(html, /<(input|textarea|select)\b|contenteditable/i, 'Page Four must not collect visitor free text');
assert.doesNotMatch(html, /<iframe\b/i, 'Page Four must not embed third-party documents');
assert.doesNotMatch(js, /\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource/i, 'Page Four must not add runtime network requests');
assert.doesNotMatch(js, /localStorage|sessionStorage|indexedDB|document\.cookie|navigator\.geolocation/i, 'Page Four must not persist or personalize visitor data');
assert.doesNotMatch(js, /analytics|telemetry|tracking|gtag|dataLayer|mixpanel|segment|plausible|amplitude|hotjar/i, 'Page Four must remain tracking-free');
assert.match(js, /navigator\.serviceWorker\.register\('\.\/service-worker\.js'\)/, 'Page Four should participate in the local offline shell');
assert.match(js, /getRandomValues/, 'random-file access should be local and non-identifying');
assert.match(js, /aria-pressed/, 'reclassification control should expose state accessibly');
assert.match(js, /matchMedia\('\(prefers-reduced-motion: reduce\)'\)/, 'scripted archive jumps should honor reduced-motion preference');
assert.match(js, /reducedMotion\?\.matches \? 'auto' : 'smooth'/, 'reduced motion should disable smooth scrolling');

for (const styles of [css, teaser]) {
  assert.match(styles, /@media/, 'Page Four styles need responsive/environment handling');
  assert.match(styles, /prefers-reduced-motion/, 'Page Four styles need reduced-motion handling');
  assert.match(styles, /prefers-contrast/, 'Page Four styles need high-contrast handling');
  assert.match(styles, /@media print/, 'Page Four styles need a printable fallback');
  assert.doesNotMatch(styles, /@import\s+url|font-face|https?:\/\//i, 'Page Four styles must use local/system resources only');
}
assert.match(css, /min-height:\s*44px/, 'interactive controls should preserve a 44px target size');
assert.match(css, /:focus-visible/, 'Page Four should expose visible keyboard focus');

console.log('Page Four fictional archive, accessibility, local-only runtime, evidence links, and entrance reveal verified.');
