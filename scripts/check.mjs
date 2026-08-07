import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const required = [
  'index.html', 'styles.css', 'entropy-core.js', 'app.js', 'service-worker.js',
  'manifest.webmanifest', 'README.md', 'PRIVACY.md', 'RIGHTS.md', 'CONTRIBUTING.md',
  'ENTROPY_LOG.md', 'ENTROPY_HISTORY.md', '.github/workflows/check.yml',
  'scripts/entropy-dimensions.json', 'scripts/entropy-select.mjs',
  'scripts/test-entropy.mjs', 'scripts/test-service-worker.mjs', 'scripts/check.mjs'
];
for (const file of required) assert.ok(fs.existsSync(path.join(root, file)), `missing required file: ${file}`);

const removed = [
  'tomorrow-room-core.js', 'tomorrow-room.js', 'signal-vault-core.js', 'signal-vault.js',
  'dreaming-wing.js', 'dreaming-photos.js', 'conservation-core.js', 'conservation-lab.js',
  'PHOTO_CREDITS.md', 'icon.svg', 'assets/dreaming-wing/atrium.webp',
  'assets/dreaming-wing/clouds.webp', 'assets/dreaming-wing/moon.webp',
  'scripts/check-conservation.mjs', 'scripts/test-conservation.mjs',
  'scripts/test-tomorrow-room.mjs', 'scripts/test-signal-vault.mjs', 'scripts/test-dreaming-wing.mjs'
];
for (const file of removed) assert.equal(fs.existsSync(path.join(root, file)), false, `obsolete file remains: ${file}`);

const html = read('index.html');
const css = read('styles.css');
const app = read('app.js');
const core = read('entropy-core.js');
const worker = read('service-worker.js');
const manifest = read('manifest.webmanifest');
const log = read('ENTROPY_LOG.md');
const history = read('ENTROPY_HISTORY.md');

assert.match(html, /<main id="organism"/);
assert.match(html, /<h1 id="organism-title">/);
assert.match(html, /aria-live="polite"/);
assert.match(html, /class="skip-link"/);
assert.match(html, /id="sound-button"[^>]*aria-pressed="false"/);
assert.match(html, /id="reset-button"/);
assert.doesNotMatch(html, /<dialog\b|<nav\b|<img\b|<svg\b|rel="icon"/i);
assert.doesNotMatch(manifest, /"icons"/);

const exiledUiTerms = /\b(room|wing|gallery|hall|chamber|archive|catalogue|collection|exhibit|unlock|portal|station|quest|inventory|dashboard)\b/i;
assert.doesNotMatch(html, exiledUiTerms, 'user-facing markup must not restore exiled destination vocabulary');
assert.doesNotMatch(app, /showModal|createDialog|catalogue|nextRoom|openObservatory|openLab/i);

assert.match(css, /button:focus-visible/);
assert.match(css, /min-height:\s*44px/);
assert.match(css, /prefers-reduced-motion:\s*reduce/);
assert.match(css, /@media \(max-width: 360px\)/);
assert.match(css, /@media \(orientation: landscape\)/);
assert.match(css, /@media \(forced-colors: active\)/);

assert.match(app, /setTimeout\([^)]*applyIdleShift|setTimeout\(applyIdleShift/);
assert.match(app, /scheduleConsequence/);
assert.match(app, /pendingReturn/);
assert.match(app, /serviceWorker\.register\('\.\/service-worker\.js'\)/);
assert.doesNotMatch(app, /fetch\(|XMLHttpRequest|WebSocket|sendBeacon|geolocation|mediaDevices|getUserMedia/i);
assert.doesNotMatch(core, /Date\.|new Date|performance\.|navigator\./);
assert.match(core, /museum-of-almost:entropy:v1/);
assert.match(core, /museum-of-almost:v1/);
assert.match(app, /localStorage\.removeItem/);

for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  const reference = match[1];
  assert.ok(!/^(?:https?:)?\/\//i.test(reference), `remote runtime reference found: ${reference}`);
}
assert.doesNotMatch(css, /url\(\s*['"]?(?:https?:)?\/\//i);

assert.match(worker, /url\.origin !== self\.location\.origin/);
assert.match(worker, /key\.startsWith\(CACHE_PREFIX\) && key !== CACHE_NAME/);
for (const asset of ['./', './index.html', './styles.css', './entropy-core.js', './app.js', './manifest.webmanifest', './PRIVACY.md']) {
  assert.ok(worker.includes(`'${asset}'`), `service worker is missing ${asset}`);
}

assert.match(log, /Primary Fixation/);
assert.match(log, /Mutation thesis/);
assert.match(log, /Original seed: `3a69eb87180cbca48d2919a9d7e4722d0c54aaaac9e62855a03554f8c389c627`/);
assert.match(history, /Execution 1/);
assert.match(history, /Preservation budget: Two/);
assert.equal((history.match(/## Execution/g) || []).length, 1);

const filesToScan = required.filter((file) => !file.endsWith('.json') && file !== 'scripts/check.mjs');
const joined = filesToScan.map((file) => read(file)).join('\n');
const forbiddenIdentity = /\byushirm\b|112488070|users\.noreply\.github\.com/i;
assert.doesNotMatch(joined, forbiddenIdentity, 'personal or repository identity data must not be published');
const commonSecrets = [
  /AKIA[0-9A-Z]{16}/,
  /gh[pousr]_[A-Za-z0-9]{30,}/,
  /sk-(?:proj-)?[A-Za-z0-9_-]{20,}/,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/
];
for (const pattern of commonSecrets) assert.doesNotMatch(joined, pattern, `secret-like value found: ${pattern}`);

assert.doesNotMatch(joined, /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i, 'email address found');

const thesisMatch = log.match(/## Mutation thesis\n\n([\s\S]*?)\n\n## Implementation outcome/);
assert.ok(thesisMatch, 'mutation thesis is missing');
const thesisWords = thesisMatch[1].trim().split(/\s+/).length;
assert.ok(thesisWords <= 180, `mutation thesis exceeds 180 words: ${thesisWords}`);
assert.match(thesisMatch[1], /Why does this require the website itself to change\?/);

process.stdout.write('Application contract checks passed.\n');
