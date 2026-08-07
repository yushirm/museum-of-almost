import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const index = read('index.html');
const app = read('app.js');
const core = read('entropy-core.js');
const styles = read('styles.css');
const worker = read('service-worker.js');
const privacy = read('PRIVACY.md');
const history = read('ENTROPY_HISTORY.md');
const log = read('ENTROPY_LOG.md');
const workflow = read('.github/workflows/check.yml');
const selector = read('scripts/entropy-select.mjs');
const rerolls = read('scripts/entropy-rerolls.json');

for (const file of [
  'index.html',
  'styles.css',
  'entropy-core.js',
  'app.js',
  'manifest.webmanifest',
  'service-worker.js',
  'README.md',
  'PRIVACY.md',
  'ENTROPY_LOG.md',
  'ENTROPY_HISTORY.md',
  'scripts/entropy-select.mjs',
  'scripts/entropy-rerolls.json',
  'scripts/test-entropy.mjs',
  'scripts/test-service-worker.mjs',
  '.github/workflows/check.yml'
]) {
  assert.ok(fs.existsSync(path.join(root, file)), `missing ${file}`);
}

const runtime = [index, app, core, styles, worker].join('\n');
assert.doesNotMatch(runtime, /https?:\/\//i, 'runtime must not contact remote origins');
assert.doesNotMatch(runtime, /\b(fetch\s*\(\s*['"]https?:|XMLHttpRequest|sendBeacon|WebSocket|EventSource)\b/i);
assert.doesNotMatch(runtime, /\b(gtag|dataLayer|mixpanel|segment|plausible|amplitude)\b/i);
assert.doesNotMatch(runtime, /google-analytics|googletagmanager|analytics\.js|sendBeacon\s*\(/i);
assert.doesNotMatch(index, /<script[^>]+src=["'](?:https?:)?\/\//i);
assert.doesNotMatch(index, /<link[^>]+href=["'](?:https?:)?\/\//i);

assert.doesNotMatch(index, /<(img|picture|svg|canvas)\b/i, 'severe constraint: no images');
assert.doesNotMatch(styles, /background-image\s*:|url\(/i, 'severe constraint: no image CSS');
assert.doesNotMatch(app, /Image\s*\(|createElement\(['"]img|drawImage|canvas/i);

assert.match(index, /id="timeline-surface"/);
assert.match(index, /tabindex="0"/);
assert.match(index, /aria-activedescendant="term-1"/);
assert.match(index, /aria-live="polite"/);
assert.match(index, /id="sound-button"[^>]+aria-pressed="false"/);
assert.match(index, /id="reset-button"/);
assert.doesNotMatch(index, /<(input|textarea)\b|contenteditable/i);
assert.match(app, /addEventListener\('pointerdown'/);
assert.match(app, /addEventListener\('keydown'/);
assert.match(app, /event\.key === 'Enter' \|\| event\.key === ' '/);
assert.match(styles, /:focus-visible/);
assert.match(styles, /min-height:\s*44px/);
assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
assert.match(styles, /@media \(max-width: 600px\)/);
assert.match(styles, /@media \(max-width: 360px\)/);
assert.match(styles, /\.duplicate-track\[hidden\]/);
assert.doesNotMatch(styles, /min-width:\s*[4-9]\d\dpx/);

const currentFacing = index.toLowerCase();
for (const word of [
  'room', 'wing', 'gallery', 'catalogue', 'collection', 'archive', 'inventory',
  'unlock', 'knot', 'weave', 'tension', 'contradict', 'bind', 'loosen'
]) {
  const pattern = new RegExp(`\\b${word}\\b`, 'i');
  assert.equal(pattern.test(currentFacing), false, `old fixation vocabulary leaked into index: ${word}`);
}
assert.doesNotMatch(currentFacing, /\b(score|percentage|progress bar|achievement|level)\b/);

assert.match(core, /museum-of-almost:entropy:v2/);
assert.match(core, /rememberedAction/);
assert.match(core, /pending/);
assert.match(core, /idleShift/);
assert.match(core, /repairIncorrectly/);
assert.match(core, /duplicateIndex/);
assert.match(core, /TARGET_ERROR/);
assert.match(app, /localStorage\.removeItem\(core\.STATE_KEY\)/);
assert.match(app, /core\.LEGACY_KEYS\.forEach/);
assert.match(app, /serviceWorker\.register\('\.\/service-worker\.js'\)/);

assert.match(privacy, /museum-of-almost:entropy:v2/);
assert.match(privacy, /exactly one visitor action/i);
assert.match(privacy, /timestamps[^\n]*(?:not stored|are stored|personal content)|store[^\n]*timestamps/i);
assert.match(history, /## Execution 2/);
assert.match(log, /## Execution 2/);
assert.match(log, /Equivalent-node tension system/i);
assert.match(log, /Reroll/i);
assert.match(selector, /entropy-rerolls\.json/);
assert.match(rerolls, /"offset": 2/);

assert.match(workflow, /jobs:\s*\n\s*check:/);
assert.match(workflow, /permissions:\s*\n\s*contents: read/);
assert.match(workflow, /persist-credentials: false/);
assert.match(workflow, /timeout-minutes: 5/);
assert.match(workflow, /actions\/checkout@[0-9a-f]{40}/);
assert.match(workflow, /actions\/setup-node@[0-9a-f]{40}/);

const publicText = [
  index,
  app,
  core,
  privacy,
  history,
  log,
  read('README.md'),
  read('RIGHTS.md'),
  read('CONTRIBUTING.md')
].join('\n');

assert.doesNotMatch(publicText, /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i);
assert.doesNotMatch(publicText, /\bAKIA[0-9A-Z]{16}\b/);
assert.doesNotMatch(publicText, /\bsk-(?:proj-)?[A-Za-z0-9_-]{16,}\b/);
assert.doesNotMatch(publicText, /BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY/);
assert.doesNotMatch(publicText, /password\s*[:=]\s*["'][^"']+["']/i);
assert.doesNotMatch(publicText, /\/Users\/|\/home\/[A-Za-z0-9._-]+|C:\\Users\\/i);

console.log('Privacy, accessibility, local-only runtime, entropy records, and anti-convergence contract verified.');
