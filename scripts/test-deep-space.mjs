import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const require = createRequire(import.meta.url);

for (const name of ['deep-space.html', 'deep-space.css', 'deep-space-core.js', 'deep-space.js', 'DEEP_SPACE.md']) {
  assert.ok(fs.existsSync(path.join(root, name)), `missing ${name}`);
}

const html = read('deep-space.html');
const css = read('deep-space.css');
const coreSource = read('deep-space-core.js');
const viewSource = read('deep-space.js');
const runtime = [html, css, coreSource, viewSource].join('\n');
const core = require('../deep-space-core.js');

for (const pattern of [
  /DEEP SPACE \/ ALMOST/,
  /Nothing here is close\./,
  /LIGHT AS A CLOCK/,
  /GRAVITY AS GEOMETRY/,
  /COSMIC INVENTORY/,
  /THE UNSOLVED ROOM/,
  /href="\.\/"/,
  /src="deep-space-core\.js"/,
  /src="deep-space\.js"/
]) assert.match(html, pattern);

for (const pattern of [
  /\.inventory-grid::before/,
  /var\(--cyan\) 0 4\.9%/,
  /var\(--nebula\) 4\.9% 31\.7%/,
  /var\(--magenta\) 31\.7% 100%/,
  /grid-template-columns:\s*minmax\(6\.4rem, 0\.18fr\) minmax\(9rem, 0\.24fr\) minmax\(0, 1fr\)/,
  /\.inventory-card:last-child \{ border-bottom: 0; \}/
]) assert.match(css, pattern, `Cosmic Inventory proportional field missing ${pattern}`);
assert.doesNotMatch(css, /\.inventory-grid\s*\{[^}]*grid-template-columns:\s*repeat\(3,/s, 'retired three-card Cosmic Inventory grid returned');
assert.doesNotMatch(css, /\.inventory-card\s*\{[^}]*min-height:\s*330px/s, 'retired tall Cosmic Inventory cards returned');

for (const pattern of [
  /addPageFourSignalAnomaly/,
  /page-four-signal-link/,
  /\? Page Four \/ unfiled/,
  /SIGNAL ANOMALY:/,
  /Investigate Page Four →/
]) assert.doesNotMatch(viewSource, pattern, `retired fictional Deep Space anomaly returned: ${pattern}`);

for (const pattern of [
  /function addCosmicStrata\(\)/,
  /id = 'cosmic-strata'/,
  /INSTRUMENT 14 · COSMIC STRATIGRAPHY/,
  /Scroll downward\. The universe gets younger\./,
  /Geologists read time through depth\./,
  /THE SURFACE · NOW/,
  /SOLAR STRATUM/,
  /STARBIRTH MAXIMUM/,
  /REIONIZATION STRATUM/,
  /FIRST-LIGHT WINDOW/,
  /RECOMBINATION · 380,000 YEARS/,
  /Vertical spacing is editorial, not proportional to elapsed time\./,
  /fixed Light Clock selection are the only interactions\./,
  /addCosmicStrata\(\);/
]) assert.match(viewSource, pattern, `Deep Space cosmic stratigraphy missing ${pattern}`);

for (const pattern of [
  /function renderLookbackHandoff\(item\)/,
  /renderLookbackHandoff\(item\);/,
  /Light-clock handoff · magnified surface/,
  /last 3 million years/,
  /not every reference stop is a source distance or emission epoch/,
  /One-way light-time interval/,
  /Share of 13\.8-billion-year reference age/,
  /MAGNIFICATION BOUNDARY/,
  /compares elapsed-time scale, not historical dating/
]) assert.match(viewSource, pattern, `Deep Space light-time handoff missing ${pattern}`);

const strataLayerCount = (viewSource.match(/label: '(?:THE SURFACE · NOW|SOLAR STRATUM|STARBIRTH MAXIMUM|REIONIZATION STRATUM|FIRST-LIGHT WINDOW|RECOMBINATION · 380,000 YEARS)'/g) || []).length;
assert.equal(strataLayerCount, 6, 'cosmic stratigraphy should retain exactly six rounded reference layers');
assert.doesNotMatch(viewSource, /IntersectionObserver|scrollY|scrollTop|wheel|touchmove/, 'cosmic stratigraphy must use native document flow rather than scroll surveillance');
assert.doesNotMatch(viewSource, /addEventListener\(['"](?:scroll|wheel|touchmove)/, 'light-time handoff must reuse fixed Light Clock controls rather than add scroll or gesture surveillance');

for (const id of [
  'scale-name', 'scale-distance', 'scale-light-time', 'scale-note', 'scale-beam',
  'black-hole-name', 'black-hole-mass', 'black-hole-radius', 'black-hole-diameter', 'black-hole-note', 'gravity-well',
  'mystery-title', 'mystery-known', 'mystery-unknown'
]) assert.match(html, new RegExp(`id=["']${id}["']`), `missing deep-space interface id ${id}`);

assert.doesNotMatch(html, /<script[^>]+src=["'](?:https?:)?\/\//i);
assert.doesNotMatch(html, /<link[^>]+href=["'](?:https?:)?\/\//i);
assert.doesNotMatch(html, /<img[^>]+src=["'](?:https?:)?\/\//i);
assert.doesNotMatch(html, /<(input|textarea|select)\b|contenteditable|<iframe\b/i);
assert.match(css, /min-height:\s*44px/);
assert.match(css, /:focus-visible/);
assert.match(css, /prefers-reduced-motion/);
assert.match(css, /prefers-contrast/);
assert.match(css, /max-width:\s*620px/);
assert.doesNotMatch(css, /@import\s+url|font-face|https?:\/\//i);

assert.doesNotMatch(runtime, /https?:\/\//i, 'Deep Space runtime must not contain third-party or remote URLs');
assert.doesNotMatch([coreSource, viewSource].join('\n'), /\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource/i);
assert.doesNotMatch([coreSource, viewSource].join('\n'), /localStorage|sessionStorage|indexedDB|document\.cookie|navigator\.geolocation/i);
assert.doesNotMatch([coreSource, viewSource].join('\n'), /setInterval|setTimeout|requestAnimationFrame/i);
assert.doesNotMatch(runtime, /\b(gtag|dataLayer|mixpanel|segment|plausible|amplitude|hotjar)\b|google-analytics|googletagmanager|facebook\.com\/tr|doubleclick/i);
assert.match(viewSource, /navigator\.serviceWorker\.register\('\.\/service-worker\.js'\)/);

assert.equal(core.C_KM_S, 299792.458);
assert.equal(core.AU_KM, 149597870.7);
assert.equal(core.SCALE_STOPS.length, 5);
assert.equal(core.BLACK_HOLES.length, 3);
assert.equal(core.MYSTERIES.length, 5);
assert.ok(Math.abs(core.lightTimeSeconds(core.AU_KM) - 499.0047838) < 0.001, '1 AU light time should be about 499.005 seconds');
assert.ok(Math.abs(core.schwarzschildRadiusKm(1) - 2.9533) < 0.01, 'one solar mass Schwarzschild radius should be about 2.95 km');
assert.ok(Math.abs(core.inventoryTotal() - 100) < 1e-9, 'rounded cosmic inventory should total 100%');

console.log('Deep Space / Almost local science, proportional Cosmic Inventory, anomaly conservation prune, cosmic stratigraphy, light-time handoff, accessibility, privacy, calculations, and no-network contract verified.');