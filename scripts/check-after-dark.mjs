import { readFile } from 'node:fs/promises';

const required = [
  'after-dark-core.js',
  'after-dark.js',
  'scripts/test-after-dark.mjs',
  'scripts/check-after-dark.mjs'
];

let failed = false;
function fail(message) {
  console.error(`FAIL: ${message}`);
  failed = true;
}

for (const file of required) {
  try {
    await readFile(file);
  } catch {
    fail(`missing Museum After Dark file: ${file}`);
  }
}

const core = await readFile('after-dark-core.js', 'utf8');
const controller = await readFile('after-dark.js', 'utf8');
const html = await readFile('index.html', 'utf8');
const serviceWorker = await readFile('service-worker.js', 'utf8');
const readme = await readFile('README.md', 'utf8');
const privacy = await readFile('PRIVACY.md', 'utf8');

for (const file of ['after-dark-core.js', 'after-dark.js']) {
  const content = file === 'after-dark-core.js' ? core : controller;
  if (/https?:\/\//i.test(content)) fail(`${file} contains an external URL`);
  if (/\b(?:fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon)\s*\(/.test(content)) {
    fail(`${file} contains a runtime network API`);
  }
  if (/\b(?:geolocation|getCurrentPosition|watchPosition)\b/i.test(content)) {
    fail(`${file} attempts to read visitor location`);
  }
  if (/<input\b|<textarea\b|contenteditable=/i.test(content)) {
    fail(`${file} accepts free-form visitor input`);
  }
}

for (const behaviour of [
  'buildExpansion',
  'buildNames',
  'buildWeather',
  'buildPermissions',
  'buildPostcards',
  'buildCorridor',
  'normalizeHistory',
  'slice(-8)',
  "replace(/[&<>]/g, '')"
]) {
  if (!core.includes(behaviour)) fail(`after-dark-core.js is missing expected behaviour: ${behaviour}`);
}

for (const room of [
  'The Unfinished Map',
  'The Cabinet of Almost Names',
  'The Bureau of Interior Weather',
  'The Archive of Unsent Postcards',
  'The Corridor That Remembers',
  'The Cabinet of Small Permissions',
  'The Night Watch'
]) {
  if (!controller.includes(room)) fail(`after-dark.js is missing room: ${room}`);
}

for (const boundary of [
  "HISTORY_STORAGE_KEY = 'museum-of-almost:corridor:v1'",
  "NAME_STORAGE_KEY = 'museum-of-almost:almost-name:v1'",
  "NIGHT_STORAGE_KEY = 'museum-of-almost:night-watch:v1'",
  'stored.index < 0 || stored.index > 8',
  'aria-selected',
  'aria-pressed',
  'prefers-reduced-motion',
  'loading="lazy"',
  'toBlob',
  'image.decode()',
  'localStorage.setItem',
  'localStorage.removeItem'
]) {
  if (!controller.includes(boundary)) fail(`after-dark.js is missing boundary: ${boundary}`);
}

for (const photo of [
  'assets/dreaming-wing/atrium.webp',
  'assets/dreaming-wing/clouds.webp',
  'assets/dreaming-wing/moon.webp'
]) {
  if (!core.includes(photo)) fail(`after-dark-core.js does not use local photograph: ${photo}`);
}

for (const asset of ['after-dark-core.js', 'after-dark.js']) {
  if (!html.includes(`<script src="${asset}" defer></script>`)) fail(`index.html does not load ${asset}`);
  if (!serviceWorker.includes(`'./${asset}'`)) fail(`service worker does not cache ${asset}`);
}
if (!serviceWorker.includes("CACHE_NAME = 'museum-of-almost-v6'")) {
  fail('service worker cache version was not advanced for Museum After Dark');
}

for (const phrase of [
  'The Unfinished Map',
  'Cabinet of Almost Names',
  'Bureau of Interior Weather',
  'Archive of Unsent Postcards',
  'Corridor That Remembers',
  'Cabinet of Small Permissions',
  'Night Watch'
]) {
  if (!readme.includes(phrase)) fail(`README.md does not document: ${phrase}`);
}

for (const boundary of [
  'last eight fictional gallery titles',
  'target date and an index from zero to eight',
  'single boolean Night Watch preference',
  'does not infer the visitor’s mood'
]) {
  if (!privacy.includes(boundary)) fail(`PRIVACY.md is missing After Dark boundary: ${boundary}`);
}

if (failed) process.exit(1);
console.log('Museum After Dark contract passed: seven local features, bounded and sanitised storage, local photographs, accessibility markers and offline coverage are present.');
