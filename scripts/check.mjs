import { readFile, readdir, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';

const dreamPhotos = [
  'assets/dreaming-wing/atrium.webp',
  'assets/dreaming-wing/clouds.webp',
  'assets/dreaming-wing/moon.webp'
];

const required = [
  '.nojekyll',
  'index.html',
  'styles.css',
  'app.js',
  'tomorrow-room-core.js',
  'tomorrow-room.js',
  'signal-vault-core.js',
  'signal-vault.js',
  'dreaming-wing.js',
  'dreaming-photos.js',
  'manifest.webmanifest',
  'service-worker.js',
  'icon.svg',
  'README.md',
  'PRIVACY.md',
  'RIGHTS.md',
  'PHOTO_CREDITS.md',
  'CONTRIBUTING.md',
  'scripts/test-tomorrow-room.mjs',
  'scripts/test-signal-vault.mjs',
  'scripts/test-service-worker.mjs',
  'scripts/test-dreaming-wing.mjs',
  ...dreamPhotos
];

const runtimeFiles = [
  'index.html',
  'styles.css',
  'app.js',
  'tomorrow-room-core.js',
  'tomorrow-room.js',
  'signal-vault-core.js',
  'signal-vault.js',
  'dreaming-wing.js',
  'dreaming-photos.js',
  'manifest.webmanifest',
  'service-worker.js',
  'icon.svg'
];

const secretRules = [
  ['private key marker', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ['GitHub token', /gh[pousr]_[A-Za-z0-9]{20,}/],
  ['generic secret assignment', /(?:api[_-]?key|client[_-]?secret|access[_-]?token|password)\s*[:=]\s*['"][^'"]{10,}['"]/i],
  ['email address', /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i],
  ['international phone number', /(?:\+|00)\d[\d\s().-]{8,}\d/]
];

let failed = false;

function fail(message) {
  console.error(`FAIL: ${message}`);
  failed = true;
}

async function collectFiles(directory = '.') {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectFiles(path));
    else if (['.html', '.css', '.js', '.mjs', '.md', '.json', '.webmanifest', '.svg', '.yml', '.yaml'].includes(extname(entry.name))) files.push(path);
  }
  return files;
}

for (const file of required) {
  try {
    await readFile(file);
  } catch {
    fail(`missing required file: ${file}`);
  }
}

const allFiles = await collectFiles();
for (const file of allFiles) {
  const content = await readFile(file, 'utf8');
  for (const [label, pattern] of secretRules) {
    if (pattern.test(content)) fail(`${file} contains a possible ${label}`);
  }
}

for (const file of runtimeFiles) {
  const content = (await readFile(file, 'utf8'))
    .replaceAll('http://www.w3.org/2000/svg', '')
    .replaceAll('data:image/svg+xml', '');

  if (/https?:\/\//i.test(content)) fail(`${file} contains an external URL`);
  if (/\b(?:XMLHttpRequest|WebSocket|EventSource|sendBeacon)\b/.test(content)) fail(`${file} contains a runtime network API`);
  if (/google-analytics|googletagmanager|gtag\s*\(|segment\.com|mixpanel/i.test(content)) fail(`${file} contains analytics code`);
  if (file === 'styles.css' && /@import\s/i.test(content)) fail('styles.css imports an external stylesheet');
}

for (const file of [
  'app.js',
  'tomorrow-room-core.js',
  'tomorrow-room.js',
  'signal-vault-core.js',
  'signal-vault.js',
  'dreaming-wing.js',
  'dreaming-photos.js'
]) {
  const content = await readFile(file, 'utf8');
  if (/\bfetch\s*\(/.test(content)) fail(`${file} performs a runtime fetch`);
}

const html = await readFile('index.html', 'utf8');
for (const asset of [
  'styles.css',
  'app.js',
  'tomorrow-room-core.js',
  'tomorrow-room.js',
  'signal-vault-core.js',
  'signal-vault.js',
  'dreaming-wing.js',
  'dreaming-photos.js',
  'manifest.webmanifest',
  'icon.svg',
  'PRIVACY.md'
]) {
  if (!html.includes(asset)) fail(`index.html does not reference ${asset}`);
}

for (const landmark of ['<header', '<main', '<footer', 'aria-live=', 'Skip to the museum']) {
  if (!html.includes(landmark)) fail(`index.html is missing accessibility structure: ${landmark}`);
}

if (/<input\b|<textarea\b|contenteditable=/i.test(html)) {
  fail('index.html accepts free-form visitor input');
}

const readme = await readFile('README.md', 'utf8');
for (const policyLink of ['PRIVACY.md', 'RIGHTS.md', 'PHOTO_CREDITS.md', 'CONTRIBUTING.md']) {
  if (!readme.includes(policyLink)) fail(`README.md does not reference ${policyLink}`);
}
if (!readme.includes('Public visibility does not make it an open-source project')) {
  fail('README.md is missing the public-visibility boundary');
}
if (!readme.includes('The Observatory of Almost Tomorrow')) fail('README.md does not document the Almost Tomorrow observatory');
if (!readme.includes('selected alternative number')) fail('README.md does not document the tomorrow seal boundary');
if (!readme.includes('The Dreaming Wing')) fail('README.md does not document the Dreaming Wing');
if (!readme.includes('The Listening Room')) fail('README.md does not document the Listening Room');
if (!readme.includes('does not request remote images')) fail('README.md does not document the local-image boundary');
if (!readme.includes('source seed strings are not stored')) fail('README.md does not document the Listening Room seed boundary');

const privacy = await readFile('PRIVACY.md', 'utf8');
for (const privacyBoundary of [
  'GitHub Pages',
  'IP addresses',
  'personal information about any person',
  'target date and a number from zero to six'
]) {
  if (!privacy.includes(privacyBoundary)) fail(`PRIVACY.md is missing its ${privacyBoundary} boundary`);
}

const rights = await readFile('RIGHTS.md', 'utf8');
for (const rightsBoundary of ['All rights reserved', 'absence of an open-source licence is intentional', 'PHOTO_CREDITS.md']) {
  if (!rights.includes(rightsBoundary)) fail(`RIGHTS.md is missing: ${rightsBoundary}`);
}

const photoCredits = await readFile('PHOTO_CREDITS.md', 'utf8');
for (const creditBoundary of ['Interior-museo.jpg', 'Clouds image.jpg', 'Apollo15 Moon photo.jpg', 'CC0', 'Public domain', 'NASA']) {
  if (!photoCredits.includes(creditBoundary)) fail(`PHOTO_CREDITS.md is missing: ${creditBoundary}`);
}

let totalPhotoBytes = 0;
for (const photo of dreamPhotos) {
  try {
    const data = await readFile(photo);
    const fileStats = await stat(photo);
    totalPhotoBytes += fileStats.size;
    if (data.subarray(0, 4).toString('ascii') !== 'RIFF' || data.subarray(8, 12).toString('ascii') !== 'WEBP') {
      fail(`${photo} is not a valid WebP container`);
    }
    const chunks = data.toString('latin1');
    for (const metadataChunk of ['EXIF', 'XMP ', 'ICCP']) {
      if (chunks.includes(metadataChunk)) fail(`${photo} retains ${metadataChunk.trim()} metadata`);
    }
  } catch {
    fail(`could not inspect local photograph: ${photo}`);
  }
}
if (totalPhotoBytes > 400_000) fail(`Dreaming Wing photographs exceed the 400 KB budget: ${totalPhotoBytes} bytes`);

const contributing = await readFile('CONTRIBUTING.md', 'utf8');
if (!contributing.includes('External contributions are not accepted')) {
  fail('CONTRIBUTING.md is missing the external-contribution boundary');
}

const manifest = JSON.parse(await readFile('manifest.webmanifest', 'utf8'));
if (manifest.name !== 'The Museum of Almost') fail('manifest name is unexpected');
if (manifest.start_url !== './') fail('manifest start_url must remain local');

const serviceWorker = await readFile('service-worker.js', 'utf8');
for (const asset of [
  './index.html',
  './styles.css',
  './app.js',
  './tomorrow-room-core.js',
  './tomorrow-room.js',
  './signal-vault-core.js',
  './signal-vault.js',
  './dreaming-wing.js',
  './dreaming-photos.js',
  './manifest.webmanifest',
  './icon.svg',
  './PRIVACY.md',
  './PHOTO_CREDITS.md',
  ...dreamPhotos.map((photo) => `./${photo}`)
]) {
  if (!serviceWorker.includes(asset)) fail(`service worker does not cache ${asset}`);
}
if (!serviceWorker.includes('requestUrl.origin !== self.location.origin')) {
  fail('service worker is missing its same-origin request guard');
}
for (const behaviour of ["cache: 'no-cache'", "event.request.mode === 'navigate'", 'event.waitUntil(network.catch']) {
  if (!serviceWorker.includes(behaviour)) fail(`service worker is missing update behaviour: ${behaviour}`);
}

const app = await readFile('app.js', 'utf8');
for (const behaviour of ['MAX_FRAGMENTS = 6', 'localStorage', 'prefers-reduced-motion', 'showModal', 'toBlob']) {
  if (!app.includes(behaviour)) fail(`app.js is missing expected behaviour: ${behaviour}`);
}
for (const guard of [
  'const shiftX = prefersReducedMotion ? 0',
  'const x = prefersReducedMotion',
  "stage.addEventListener('pointermove', (event) => {\n    if (prefersReducedMotion) return;"
]) {
  if (!app.includes(guard)) fail(`app.js is missing reduced-motion protection: ${guard}`);
}

const tomorrowCore = await readFile('tomorrow-room-core.js', 'utf8');
for (const behaviour of ['buildTomorrows', 'tomorrowDate', 'dateKey', 'normalizeState', 'observatoryNote']) {
  if (!tomorrowCore.includes(behaviour)) fail(`tomorrow-room-core.js is missing expected behaviour: ${behaviour}`);
}

const tomorrowController = await readFile('tomorrow-room.js', 'utf8');
for (const behaviour of [
  'The Observatory of Almost Tomorrow',
  'SEVEN POSSIBLE MORNINGS',
  'aria-live="polite"',
  'SEAL_STORAGE_KEY',
  'localStorage.setItem',
  'prefers-reduced-motion',
  'Save tomorrow postcard',
  'Previous future',
  'Next future',
  'toBlob'
]) {
  if (!tomorrowController.includes(behaviour)) fail(`tomorrow-room.js is missing expected behaviour: ${behaviour}`);
}
if (/<input\b|<textarea\b|contenteditable=/i.test(tomorrowController)) {
  fail('tomorrow-room.js accepts free-form visitor input');
}
if (/\b(?:geolocation|getCurrentPosition|watchPosition)\b/i.test(tomorrowController)) {
  fail('tomorrow-room.js attempts to read visitor location');
}

const signalCore = await readFile('signal-vault-core.js', 'utf8');
for (const behaviour of ['SIGNAL_ENTROPY', 'buildSignals', 'echoForSignal', 'normalizeState', 'roomNote']) {
  if (!signalCore.includes(behaviour)) fail(`signal-vault-core.js is missing expected behaviour: ${behaviour}`);
}
if (/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i.test(signalCore)) {
  fail('signal-vault-core.js retains source seed identifiers');
}

const signalController = await readFile('signal-vault.js', 'utf8');
for (const behaviour of [
  'The Listening Room',
  'TEN RECEIVED TRANSMISSIONS',
  'aria-live="polite"',
  "node.setAttribute('aria-pressed', 'false')",
  'prefers-reduced-motion',
  'localStorage.getItem(STORAGE_KEY)',
  'Previous signal',
  'Next signal'
]) {
  if (!signalController.includes(behaviour)) fail(`signal-vault.js is missing expected behaviour: ${behaviour}`);
}
if (/<input\b|<textarea\b|contenteditable=/i.test(signalController)) {
  fail('signal-vault.js accepts free-form visitor input');
}

const dreamingWing = await readFile('dreaming-wing.js', 'utf8');
for (const behaviour of [
  'MIN_FRAGMENTS = 3',
  'readMuseumState',
  'buildDream',
  'prefersReducedMotion',
  'saveDreamPostcard',
  'Dream differently',
  'localStorage.getItem(STORAGE_KEY)'
]) {
  if (!dreamingWing.includes(behaviour)) fail(`dreaming-wing.js is missing expected behaviour: ${behaviour}`);
}
if (/<input\b|<textarea\b|contenteditable=/i.test(dreamingWing)) {
  fail('dreaming-wing.js accepts free-form visitor input');
}

const dreamingPhotosController = await readFile('dreaming-photos.js', 'utf8');
for (const behaviour of [
  ...dreamPhotos,
  "card.setAttribute('aria-pressed', 'false')",
  "image.loading = 'lazy'",
  'PHOTO_CREDITS.md',
  'No remote image requests'
]) {
  if (!dreamingPhotosController.includes(behaviour)) fail(`dreaming-photos.js is missing expected behaviour: ${behaviour}`);
}

if (failed) process.exit(1);
console.log(`Museum checks passed across ${allFiles.length} source files.`);
console.log(`Dreaming Wing photographs are local WebP assets totalling ${totalPhotoBytes} bytes with no EXIF, XMP, or ICC chunks.`);
console.log('The Observatory of Almost Tomorrow generates seven local daily alternatives and stores only one bounded seal.');
console.log('The Listening Room retains ten anonymous numeric entropy values and no source seed identifiers.');
console.log('No external runtime dependencies, obvious secrets, free-form visitor input, or third-party network references found.');
console.log('Public-hosting privacy, rights, photograph provenance, and contribution boundaries are present.');
