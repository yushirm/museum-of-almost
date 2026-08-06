import { readFile, readdir } from 'node:fs/promises';
import { extname, join } from 'node:path';

const required = [
  '.nojekyll',
  'index.html',
  'styles.css',
  'app.js',
  'manifest.webmanifest',
  'service-worker.js',
  'icon.svg',
  'README.md',
  'PRIVACY.md',
  'RIGHTS.md',
  'CONTRIBUTING.md',
  'scripts/test-service-worker.mjs'
];

const runtimeFiles = [
  'index.html',
  'styles.css',
  'app.js',
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

const html = await readFile('index.html', 'utf8');
for (const asset of ['styles.css', 'app.js', 'manifest.webmanifest', 'icon.svg', 'PRIVACY.md']) {
  if (!html.includes(asset)) fail(`index.html does not reference ${asset}`);
}

for (const landmark of ['<header', '<main', '<footer', 'aria-live=', 'Skip to the museum']) {
  if (!html.includes(landmark)) fail(`index.html is missing accessibility structure: ${landmark}`);
}

if (/<input\b|<textarea\b|contenteditable=/i.test(html)) {
  fail('index.html accepts free-form visitor input');
}

const readme = await readFile('README.md', 'utf8');
for (const policyLink of ['PRIVACY.md', 'RIGHTS.md', 'CONTRIBUTING.md']) {
  if (!readme.includes(policyLink)) fail(`README.md does not reference ${policyLink}`);
}
if (!readme.includes('Public visibility does not make it an open-source project')) {
  fail('README.md is missing the public-visibility boundary');
}

const privacy = await readFile('PRIVACY.md', 'utf8');
for (const privacyBoundary of ['GitHub Pages', 'IP addresses', 'personal information about any person']) {
  if (!privacy.includes(privacyBoundary)) fail(`PRIVACY.md is missing its ${privacyBoundary} boundary`);
}

const rights = await readFile('RIGHTS.md', 'utf8');
for (const rightsBoundary of ['All rights reserved', 'absence of an open-source licence is intentional']) {
  if (!rights.includes(rightsBoundary)) fail(`RIGHTS.md is missing: ${rightsBoundary}`);
}

const contributing = await readFile('CONTRIBUTING.md', 'utf8');
if (!contributing.includes('External contributions are not accepted')) {
  fail('CONTRIBUTING.md is missing the external-contribution boundary');
}

const manifest = JSON.parse(await readFile('manifest.webmanifest', 'utf8'));
if (manifest.name !== 'The Museum of Almost') fail('manifest name is unexpected');
if (manifest.start_url !== './') fail('manifest start_url must remain local');

const serviceWorker = await readFile('service-worker.js', 'utf8');
for (const asset of ['./index.html', './styles.css', './app.js', './manifest.webmanifest', './icon.svg', './PRIVACY.md']) {
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

if (failed) process.exit(1);
console.log(`Museum checks passed across ${allFiles.length} source files.`);
console.log('No external runtime dependencies, obvious secrets, free-form visitor input, or third-party network references found.');
console.log('Public-hosting privacy, rights, and contribution boundaries are present.');
