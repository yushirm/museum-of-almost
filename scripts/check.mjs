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
const rerolls = read('scripts/entropy-rerolls.json');
const runtime = [index, app, core, styles, worker].join('\n');

assert.doesNotMatch(runtime, /https?:\/\//i, 'runtime must not contact remote origins');
assert.doesNotMatch(runtime, /\b(fetch\s*\(\s*['"]https?:|XMLHttpRequest|sendBeacon|WebSocket|EventSource)\b/i);
assert.doesNotMatch(runtime, /\b(gtag|dataLayer|mixpanel|segment|plausible|amplitude)\b/i);
assert.doesNotMatch(runtime, /google-analytics|googletagmanager|analytics\.js|sendBeacon\s*\(/i);
assert.doesNotMatch(index, /<script[^>]+src=["'](?:https?:)?\/\//i);
assert.doesNotMatch(index, /<link[^>]+href=["'](?:https?:)?\/\//i);
assert.doesNotMatch(index, /<(input|textarea)\b|contenteditable/i);

assert.doesNotMatch(index, /<(img|picture|svg|canvas)\b/i, 'severe constraint: no images');
assert.doesNotMatch(styles, /background-image\s*:|url\(/i, 'severe constraint: no image CSS');
assert.doesNotMatch(app, /Image\s*\(|createElement\(['"]img|drawImage|canvas/i);

assert.match(index, /id="organism-surface"/);
assert.match(index, /role="application"/);
assert.match(index, /tabindex="0"/);
assert.match(index, /id="status"[^>]+aria-live="polite"/);
assert.match(index, /id="sound-button"[^>]+aria-pressed="false"/);
assert.match(index, /id="reset-button"/);
assert.match(app, /addEventListener\('pointerdown'/);
assert.match(app, /addEventListener\('pointerup'/);
assert.match(app, /addEventListener\('keydown'/);
assert.match(app, /core\.separate/);
assert.match(app, /core\.advanceSilence/);
assert.match(app, /window\.setTimeout\(advanceSilence/);
assert.match(app, /event\.clientX/);
assert.match(app, /event\.clientY/);
assert.doesNotMatch(core, /clientX|clientY|pointerStart|pointerPath/i, 'pointer coordinates must never enter durable core state');
assert.match(styles, /min-height:\s*44px/);
assert.match(styles, /touch-action:\s*pan-y/);
assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
assert.match(styles, /@media \(max-width: 520px\)/);
assert.match(styles, /@media \(max-width: 360px\)/);
assert.match(styles, /:focus-visible/);
assert.doesNotMatch(styles, /min-width:\s*[4-9]\d\dpx/);

const facing = index.toLowerCase();
for (const word of [
  'room', 'wing', 'gallery', 'catalogue', 'collection', 'archive', 'inventory', 'unlock',
  'knot', 'tension', 'bind', 'loosen', 'timeline', 'season', 'repair', 'misregistration',
  'coherence', 'weave', 'translation', 'contradiction', 'measure', 'untranslated'
]) {
  assert.equal(new RegExp(`\\b${word}\\b`, 'i').test(facing), false, `exiled vocabulary leaked into index: ${word}`);
}
assert.doesNotMatch(facing, /\b(score|percentage|progress bar|achievement|level)\b/);

assert.match(core, /museum-of-almost:entropy:v4/);
assert.match(core, /geometry/);
assert.match(core, /advanceVisit/);
assert.match(core, /advanceSilence/);
assert.match(core, /meaningsFor/);
assert.match(core, /geometryFor/);
assert.match(core, /function separate/);
for (const removed of [
  'CONTRADICTIONS', 'translationFor', 'waitDuration', 'openDuration', 'ecosystemState',
  'TARGET_ERROR', 'offsets', 'repairIncorrectly', 'idleShift', 'duplicateIndex'
]) {
  assert.equal(core.includes(removed), false, `old state grammar remains in core: ${removed}`);
}
assert.match(app, /localStorage\.setItem\(core\.STATE_KEY, JSON\.stringify\(nextState\)\)/);
assert.match(app, /localStorage\.removeItem\(core\.STATE_KEY\)/);
assert.match(app, /core\.LEGACY_KEYS\.forEach/);
assert.match(app, /serviceWorker\.register\('\.\/service-worker\.js'\)/);

assert.match(privacy, /museum-of-almost:entropy:v4/);
assert.match(privacy, /preserved geometry/i);
assert.match(privacy, /pointer coordinates are not stored/i);
assert.match(privacy, /No action history/i);
assert.match(history, /## Execution 4/);
assert.match(history, /Primary Fixation exiled: Timed contradiction pulse/i);
assert.match(log, /## Execution 4/);
assert.match(log, /Original seed: `800cbe27a5b38bddb19ba0b4eb8a65dea8507e39afeeb06b77aa54043e5424b9`/);
assert.match(log, /Timed contradiction pulse/i);
assert.match(rerolls, /800cbe27a5b38bddb19ba0b4eb8a65dea8507e39afeeb06b77aa54043e5424b9/);
assert.match(rerolls, /"C":\s*\{[\s\S]*?"offset": 1/);
assert.match(rerolls, /"K":\s*\{[\s\S]*?"offset": 1/);

assert.match(worker, /museum-of-almost-entropy-v4/);
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

console.log('Privacy, accessibility, no-image runtime, entropy v4, and anti-convergence contract verified.');
