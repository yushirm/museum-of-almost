import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../service-worker.js', import.meta.url), 'utf8');

assert.match(source, /const PARALLAX_SURVEY_CACHE_NAME = 'museum-of-almost-v45-parallax-survey'/);
assert.match(source, /const SOLAR_BOUNDARY_CACHE_NAME = 'museum-of-almost-v46-solar-boundary-atlas'/);
assert.match(source, /const SYNOPTIC_ALPHABET_CACHE_NAME = 'museum-of-almost-v47-synoptic-alphabet'/);
assert.match(source, /const CURRENT_CACHE_NAME = SYNOPTIC_ALPHABET_CACHE_NAME/,
  'the dedicated service-worker contract should identify the latest named generation');

for (const asset of [
  './',
  './index.html',
  './404.html',
  './commons-now.html',
  './styles.css',
  './world-map.svg',
  './cosmic-signal.js',
  './data-core.js',
  './weather-score-core.js',
  './weather-score.js',
  './weather-score.css',
  './solar-boundary-core.js',
  './solar-boundary.js',
  './solar-boundary.css',
  './synoptic-alphabet-core.js',
  './synoptic-alphabet.js',
  './synoptic-alphabet.css',
  './deep-space.html',
  './almost-online.html',
  './page-four.html',
  './elsewhere.html',
  './manifest.webmanifest',
  './PRIVACY.md',
  './SOURCES.md'
]) {
  assert.ok(source.includes(`'${asset}'`), `service worker should cache ${asset}`);
}

assert.match(source, /APP_SHELL\.map\(\(asset\) => new Request\(asset, \{ cache: 'reload' \}\)\)/,
  'install should refill the offline shell from deployed files rather than stale browser HTTP cache');
assert.match(source, /caches\.open\(CURRENT_CACHE_NAME\)/);
assert.match(source, /key !== CURRENT_CACHE_NAME/);
assert.match(source, /url\.origin !== self\.location\.origin/);
assert.match(source, /request\.mode === 'navigate'/);
assert.match(source, /async function networkFirst\(request, fallbackDocument = null\)[\s\S]+fetch\(request, \{ cache: 'no-cache' \}\)[\s\S]+caches\.match\(request\)/,
  'same-origin requests should revalidate online before falling back to the offline cache');
assert.match(source, /if \(fallbackDocument\)[\s\S]+caches\.match\(fallbackDocument\)/,
  'navigation recovery should be selected only after the requested cached document is unavailable');
assert.match(source, /const fallbackDocument = url\.pathname === scopePath \? '\.\/index\.html' : '\.\/404\.html'/,
  'root-scope navigation should recover to the entrance while other unknown offline navigations recover to the Unbuilt Room');
assert.match(source, /event\.respondWith\(networkFirst\(request, fallbackDocument\)\)/);
assert.match(source, /event\.respondWith\(networkFirst\(request\)\)/);
assert.match(source, /clients\.claim\(\)/);
assert.match(source, /clients\.matchAll\(\{ type: 'window', includeUncontrolled: true \}\)/);
assert.match(source, /client\.navigate\(client\.url\)/);
assert.match(source, /startsWith\('museum-of-almost-'\)/);
assert.match(source, /caches\.delete/);
assert.doesNotMatch(source, /https?:\/\//, 'service worker must not proxy or cache public live-data services');
assert.doesNotMatch(source, /analytics|telemetry|pixel|beacon/i);

console.log('Synoptic Alphabet v47 is current; Solar Boundary v46 and the existing Museum galleries remain in the fresh-online cached-offline shell.');