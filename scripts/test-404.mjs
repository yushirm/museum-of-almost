import assert from 'node:assert/strict';
import fs from 'node:fs';

const page = fs.readFileSync(new URL('../404.html', import.meta.url), 'utf8');
const record = fs.readFileSync(new URL('../UNBUILT_ROOM.md', import.meta.url), 'utf8');
const worker = fs.readFileSync(new URL('../service-worker.js', import.meta.url), 'utf8');

for (const pattern of [
  /<meta name="robots" content="noindex">/,
  /FACILITIES \/ UNBUILT ROOM/,
  /ERROR 404 · ACCESSION NOT FOUND/,
  /This room almost existed\./,
  /RETURN TO MUSEUM ENTRANCE/,
  /GO BACK ONE DOOR/,
  /REGISTRAR'S SLIP · 404/,
  /Accession refused\./,
  /No Museum history is created from this miss\./,
  /The Museum application does not log, display, or persist the missing path/,
  /Ordinary hosting and network request logs remain outside the Museum application/,
  /class="skip-link" href="#recovery"/,
  /id="entrance-link"/,
  /id="back-button"/,
  /<noscript>/
]) assert.match(page, pattern);

for (const pattern of [
  /min-height:\s*46px/,
  /:focus-visible/,
  /@media \(max-width: 760px\)/,
  /@media \(max-width: 440px\)/,
  /prefers-contrast/,
  /@media print/
]) assert.match(page, pattern);

assert.match(page, /window\.location\.pathname\.split\('\/'\)\.filter\(Boolean\)/,
  'project-root recovery may inspect the local pathname only to derive the GitHub Pages project root');
assert.match(page, /window\.location\.hostname\.endsWith\('\.github\.io'\)/);
assert.match(page, /return `\/\$\{pathParts\[0\]\}\/`/);
assert.match(page, /window\.history\.back\(\)/);
assert.match(page, /window\.location\.assign\(museumRoot\)/);
assert.match(page, /entranceLink\.href = museumRoot/);

assert.doesNotMatch(page, /<script[^>]+src=/i, '404 must not depend on a script path that can break on a nested missing URL');
assert.doesNotMatch(page, /<link[^>]+stylesheet/i, '404 must not depend on a stylesheet path that can break on a nested missing URL');
assert.doesNotMatch(page, /<img\b|<video\b|<audio\b|<iframe\b/i);
assert.doesNotMatch(page, /https?:\/\//i, '404 runtime must not contain a remote URL');
assert.doesNotMatch(page, /\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource/i);
assert.doesNotMatch(page, /localStorage|sessionStorage|indexedDB|document\.cookie|navigator\.geolocation/i);
assert.doesNotMatch(page, /location\.(?:search|hash)/, '404 must not inspect query text or fragments');
assert.doesNotMatch(page, /(?:textContent|innerText|innerHTML)\s*=\s*[^;]*(?:pathname|location)/,
  '404 must never render the requested path into the page');
assert.doesNotMatch(page, /\b(?:gtag|dataLayer|mixpanel|plausible|amplitude|hotjar)\b|google-analytics|googletagmanager|facebook\.com\/tr|doubleclick/i);
assert.doesNotMatch(page, /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i);
assert.doesNotMatch(page, /\bAKIA[0-9A-Z]{16}\b|\bsk-(?:proj-)?[A-Za-z0-9_-]{16,}\b|BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY/i);

for (const pattern of [
  /Concept A — Museum 404/,
  /Concept B — Registrar's Rejection Slip/,
  /Concept C — The 404 Maze/,
  /Discarded:\*\* C/,
  /Merged:\*\* A \+ B/,
  /failure surface, not Gallery 05/,
  /does not echo the missing URL, query string, hash, or path into the DOM/,
  /v44 Unbuilt Room/,
  /v43 Dead Drop/,
  /uncached or unknown same-origin navigation falls back to cached `404\.html`/,
  /offline fallback response comes from the cached 404 document and therefore cannot reproduce the network's HTTP 404 status code/
]) assert.match(record, pattern);

assert.match(worker, /const UNEQUAL_MINUTE_CACHE_NAME = 'museum-of-almost-v42-unequal-minute'/);
assert.match(worker, /const PAGE_FOUR_DEAD_DROP_CACHE_NAME = 'museum-of-almost-v43-page-four-dead-drop'/);
assert.match(worker, /const CURRENT_CACHE_NAME = 'museum-of-almost-v44-unbuilt-room'/);
assert.ok(worker.includes("'./404.html'"), 'offline shell should cache the Unbuilt Room');
assert.ok(worker.includes("'./page-four-dead-drop.js'"), 'offline shell should preserve the v43 Dead Drop runtime');
assert.ok(worker.includes("'./PAGE_FOUR_DEAD_DROP.md'"), 'offline shell should preserve the v43 Dead Drop record');
assert.match(worker, /const fallbackDocument = url\.pathname === scopePath \? '\.\/index\.html' : '\.\/404\.html'/,
  'navigation fallback should preserve root entrance recovery and use Unbuilt Room elsewhere');
assert.match(worker, /networkFirst\(request, fallbackDocument\)/);

console.log('Unbuilt Room 404 recovery, v43 Dead Drop preservation, path non-disclosure, self-contained rendering, accessibility, privacy, and offline fallback contract verified.');
