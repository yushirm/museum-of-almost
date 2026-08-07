import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

for (const file of [
  'index.html', 'styles.css', 'entropy-core.js', 'app.js', 'manifest.webmanifest',
  'service-worker.js', 'README.md', 'PRIVACY.md', 'ENTROPY_LOG.md', 'ENTROPY_HISTORY.md',
  'RIGHTS.md', 'CONTRIBUTING.md', 'scripts/entropy-select.mjs', 'scripts/entropy-dimensions.json',
  'scripts/entropy-rerolls.json', 'scripts/test-entropy.mjs', 'scripts/test-service-worker.mjs',
  '.github/workflows/check.yml'
]) {
  assert.ok(fs.existsSync(path.join(root, file)), `missing ${file}`);
}

const index = read('index.html');
const app = read('app.js');
const core = read('entropy-core.js');
const styles = read('styles.css');
const worker = read('service-worker.js');
const privacy = read('PRIVACY.md');
const history = read('ENTROPY_HISTORY.md');
const log = read('ENTROPY_LOG.md');
const workflow = read('.github/workflows/check.yml');
const runtime = [index, app, core, styles, worker].join('\n');

assert.doesNotMatch(runtime, /https?:\/\//i, 'runtime must not contact remote origins');
assert.doesNotMatch(runtime, /\b(fetch\s*\(\s*['"]https?:|XMLHttpRequest|sendBeacon|WebSocket|EventSource)\b/i);
assert.doesNotMatch(runtime, /\b(gtag|dataLayer|mixpanel|segment|plausible|amplitude)\b/i);
assert.doesNotMatch(runtime, /google-analytics|googletagmanager|analytics\.js|sendBeacon\s*\(/i);
assert.doesNotMatch(index, /<script[^>]+src=["'](?:https?:)?\/\//i);
assert.doesNotMatch(index, /<link[^>]+href=["'](?:https?:)?\/\//i);
assert.doesNotMatch(index, /<(input|textarea)\b|contenteditable/i);

assert.match(index, /id="weave-surface"/);
assert.match(index, /aria-disabled="false"/);
assert.match(index, /id="status"[^>]+aria-live="polite"/);
assert.match(index, /id="sound-button"[^>]+aria-pressed="false"/);
assert.match(index, /id="reset-button"/);
assert.match(app, /surface\.addEventListener\('click'/);
assert.doesNotMatch(app, /client[XY]|offset[XY]|page[XY]|screen[XY]/i, 'core interaction must ignore pointer coordinates');
assert.match(app, /phase === 'open'/);
assert.match(app, /revealEffect/);
assert.match(app, /settleCandidate\(false\)/);
assert.match(styles, /min-height:\s*44px/);
assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
assert.match(styles, /@media \(max-width: 520px\)/);
assert.match(styles, /@media \(max-width: 360px\)/);
assert.match(styles, /:focus-visible/);
assert.doesNotMatch(styles, /min-width:\s*[4-9]\d\dpx/);

const facing = index.toLowerCase();
for (const word of [
  'room', 'wing', 'gallery', 'catalogue', 'collection', 'archive', 'inventory', 'unlock',
  'knot', 'tension', 'bind', 'loosen', 'timeline', 'season', 'repair', 'misregistration', 'coherence'
]) {
  assert.equal(new RegExp(`\\b${word}\\b`, 'i').test(facing), false, `exiled vocabulary leaked into index: ${word}`);
}
assert.doesNotMatch(facing, /\b(score|percentage|progress bar|achievement|level)\b/);

assert.match(core, /museum-of-almost:entropy:v3/);
assert.match(core, /contradiction/);
assert.match(core, /translationFor/);
assert.match(core, /ecosystemState/);
assert.match(core, /waitDuration/);
for (const removed of ['TARGET_ERROR', 'offsets', 'repairIncorrectly', 'idleShift', 'duplicateIndex']) {
  assert.equal(core.includes(removed), false, `old state grammar remains in core: ${removed}`);
}
assert.match(app, /localStorage\.removeItem\(core\.STATE_KEY\)/);
assert.match(app, /core\.LEGACY_KEYS\.forEach/);
assert.match(app, /serviceWorker\.register\('\.\/service-worker\.js'\)/);

assert.match(privacy, /museum-of-almost:entropy:v3/);
assert.match(privacy, /exactly one fictional contradiction/i);
assert.match(privacy, /No action history/i);
assert.match(history, /## Execution 3/);
assert.match(history, /Primary Fixation exiled: Ordered correction timeline/i);
assert.match(log, /## Execution 3/);
assert.match(log, /Original seed: `eb11a896ddf843d260cb13fac4261168f632a18964cd96724f9650e4cd4cacf8`/);
assert.match(log, /Rerolls: None/);
assert.match(log, /Primary Fixation\n\n\*\*Ordered correction timeline/);

assert.match(worker, /museum-of-almost-entropy-v3/);
assert.match(worker, /url\.origin !== self\.location\.origin/);
assert.match(workflow, /jobs:\s*\n\s*check:/);
assert.match(workflow, /permissions:\s*\n\s*contents: read/);
assert.match(workflow, /persist-credentials: false/);
assert.match(workflow, /timeout-minutes: 5/);
assert.match(workflow, /actions\/checkout@[0-9a-f]{40}/);
assert.match(workflow, /actions\/setup-node@[0-9a-f]{40}/);

const publicText = [
  index, app, core, privacy, history, log, read('README.md'), read('RIGHTS.md'), read('CONTRIBUTING.md')
].join('\n');
assert.doesNotMatch(publicText, /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i);
assert.doesNotMatch(publicText, /\bAKIA[0-9A-Z]{16}\b/);
assert.doesNotMatch(publicText, /\bsk-(?:proj-)?[A-Za-z0-9_-]{16,}\b/);
assert.doesNotMatch(publicText, /BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY/);
assert.doesNotMatch(publicText, /password\s*[:=]\s*["'][^"']+["']/i);
assert.doesNotMatch(publicText, /\/Users\/|\/home\/[A-Za-z0-9._-]+|C:\\Users\\/i);

console.log('Privacy, accessibility, local-only runtime, entropy v3, and anti-convergence contract verified.');
