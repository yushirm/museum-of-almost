import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

for (const file of [
  'index.html', 'styles.css', 'entropy-core.js', 'app.js', 'manifest.webmanifest',
  'service-worker.js', 'README.md', 'PRIVACY.md', 'ENTROPY_LOG.md', 'ENTROPY_HISTORY.md',
  'CONSTRUCTION_LOG.md', 'RIGHTS.md', 'CONTRIBUTING.md', 'scripts/entropy-select.mjs',
  'scripts/entropy-dimensions.json', 'scripts/entropy-rerolls.json', 'scripts/test-entropy.mjs',
  'scripts/test-service-worker.mjs', '.github/workflows/check.yml'
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
const construction = read('CONSTRUCTION_LOG.md');
const workflow = read('.github/workflows/check.yml');
const runtime = [index, app, core, styles, worker].join('\n');

assert.doesNotMatch(runtime, /https?:\/\//i, 'runtime must not contact remote origins');
assert.doesNotMatch(runtime, /\b(fetch\s*\(\s*['"]https?:|XMLHttpRequest|sendBeacon|WebSocket|EventSource)\b/i);
assert.doesNotMatch(runtime, /\b(gtag|dataLayer|mixpanel|segment|plausible|amplitude)\b/i);
assert.doesNotMatch(runtime, /google-analytics|googletagmanager|analytics\.js|sendBeacon\s*\(/i);
assert.doesNotMatch(index, /<script[^>]+src=["'](?:https?:)?\/\//i);
assert.doesNotMatch(index, /<link[^>]+href=["'](?:https?:)?\/\//i);
assert.doesNotMatch(index, /<(input|textarea)\b|contenteditable/i, 'visitor free text is prohibited');

for (const id of [
  'treaty-surface', 'status', 'sound-button', 'erase-button', 'reset-button', 'once-event',
  'ghost-mark', 'suspension-spans', 'echo-button', 'undo-button', 'soften-button',
  'intensify-button', 'postcard-button', 'print-button', 'ledger-summary', 'ledger-count',
  'ledger-weight', 'ledger-center', 'ledger-spread', 'resonance-summary', 'session-journal'
]) {
  assert.match(index, new RegExp(`id=["']${id}["']`), `missing constructive interface id: ${id}`);
}
assert.match(index, /id="treaty-surface"[\s\S]*?role="application"/);
assert.match(index, /id="treaty-surface"[\s\S]*?tabindex="0"/);
assert.match(index, /id="status"[^>]+aria-live="polite"/);
assert.match(index, /id="sound-button"[^>]+aria-pressed="false"/);
assert.match(index, /unit unresolved/i);
assert.match(index, /<details class="shortcut-help">/);
assert.match(index, /<kbd>/);
assert.match(index, /Make local postcard/i);
assert.match(index, /Print treaty/i);

assert.match(app, /addEventListener\('pointerdown'/);
assert.match(app, /addEventListener\('pointermove'/);
assert.match(app, /addEventListener\('pointerup'/);
assert.match(app, /addEventListener\('keydown'/);
assert.match(app, /addEventListener\('keyup'/);
assert.match(app, /core\.suspend/);
assert.match(app, /core\.attemptErase/);
assert.match(app, /core\.moveCursor/);
assert.match(app, /core\.echoLatest/);
assert.match(app, /core\.undoLatest/);
assert.match(app, /core\.adjustLatestWeight/);
assert.match(app, /core\.spanState/);
assert.match(app, /core\.ledgerFor/);
assert.match(app, /core\.postcardData/);
assert.match(app, /requestAnimationFrame/);
assert.match(app, /event\.clientX/);
assert.match(app, /performance\.now\(\)/);
assert.match(app, /new Blob\(/);
assert.match(app, /URL\.createObjectURL/);
assert.match(app, /URL\.revokeObjectURL/);
assert.match(app, /link\.download = 'museum-of-almost-treaty\.svg'/);
assert.match(app, /window\.print\(\)/);
assert.match(app, /Shift/i);
assert.doesNotMatch(
  core,
  /\bclient[XY]\b|\bpointerStart\b|\bpointerPath\b|\bperformance\.now\b|\bDate\.|\btimestamp\b/i,
  'transient gesture data and clocks must never enter durable core state'
);

assert.match(styles, /min-height:\s*44px/);
assert.match(styles, /touch-action:\s*pan-y/);
assert.match(styles, /\.suspension-span/);
assert.match(styles, /\.field-ledger/);
assert.match(styles, /\.session-journal/);
assert.match(styles, /\.shortcut-help/);
assert.match(styles, /@media print/);
assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
assert.match(styles, /@media \(prefers-contrast: more\)/);
assert.match(styles, /@media \(max-width: 520px\)/);
assert.match(styles, /@media \(max-width: 360px\)/);
assert.match(styles, /:focus-visible/);
assert.doesNotMatch(styles, /min-width:\s*[4-9]\d\dpx/);

const facing = index.toLowerCase();
for (const word of [
  'room', 'wing', 'gallery', 'catalogue', 'collection', 'archive', 'inventory', 'unlock',
  'knot', 'tension', 'bind', 'loosen', 'season', 'repair', 'misregistration', 'coherence',
  'membrane', 'organism', 'reality', 'separate', 'translation', 'contradiction', 'untranslated'
]) {
  assert.equal(new RegExp(`\\b${word}\\b`, 'i').test(facing), false, `exiled vocabulary leaked into index: ${word}`);
}
assert.doesNotMatch(facing, /\b(score|percentage|progress bar|achievement|level|leaderboard)\b/);
assert.doesNotMatch(index, /href=["'][^"']*(?:#.*room|gallery|archive|collection)/i);

assert.match(core, /museum-of-almost:entropy:v5/);
for (const functionName of [
  'suspend', 'attemptErase', 'echoLatest', 'undoLatest', 'adjustLatestWeight', 'treatyState',
  'forceState', 'measurementFor', 'resonanceForDistance', 'spanState', 'ledgerFor',
  'sessionCodeFor', 'postcardData', 'timelinePositions'
]) {
  assert.match(core, new RegExp(`function ${functionName}\\b`), `missing core function: ${functionName}`);
}
assert.match(core, /UNKNOWN_UNITS/);
assert.match(core, /RESONANCES/);
assert.match(core, /ghost/);
for (const removed of [
  'meaningsFor', 'advanceSilence', 'geometryFor', 'function separate', 'CONTRADICTIONS',
  'translationFor', 'waitDuration', 'openDuration', 'ecosystemState', 'TARGET_ERROR',
  'offsets', 'repairIncorrectly', 'idleShift', 'duplicateIndex'
]) {
  assert.equal(core.includes(removed), false, `old state grammar remains in core: ${removed}`);
}

assert.match(app, /localStorage\.setItem\(core\.STATE_KEY, JSON\.stringify\(nextState\)\)/);
assert.match(app, /localStorage\.removeItem\(core\.STATE_KEY\)/);
assert.match(app, /core\.LEGACY_KEYS\.forEach/);
assert.match(app, /serviceWorker\.register\('\.\/service-worker\.js'\)/);
assert.doesNotMatch(app, /localStorage\.setItem\([^,]+,\s*JSON\.stringify\(session\)/,
  'session suspensions must not be persisted');
assert.doesNotMatch(app, /localStorage\.setItem\([^,]+,\s*JSON\.stringify\(journalEntries\)/,
  'session journal must not be persisted');
assert.doesNotMatch(app, /localStorage\.setItem\([^,]+,\s*JSON\.stringify\([^)]*(ledger|postcard)/i,
  'constructive derived state must not be persisted');

const renderSection = app.slice(app.indexOf('function render(message)'), app.indexOf('function renderCursor()'));
for (const effect of [
  'force-a-scale', 'force-b-scale', 'field-scale', 'renderCursor()', 'renderSpans()',
  'renderSuspensions()', 'renderGhost()', 'renderLedger()', 'renderJournal()',
  'treatyState.textContent', 'measurement.textContent', 'memoryNote.textContent'
]) {
  assert.ok(renderSection.includes(effect), `render must update visible treaty state: ${effect}`);
}

assert.match(privacy, /museum-of-almost:entropy:v5/);
assert.match(privacy, /last fictional suspension the visitor attempted to erase/i);
assert.match(privacy, /constructive field ledger/i);
assert.match(privacy, /session-only/i);
assert.match(privacy, /installation-neutral code/i);
assert.match(privacy, /generated file is not uploaded or transmitted/i);
assert.match(history, /## Execution 5/);
assert.match(history, /Primary Fixation exiled: Parallel membrane field/i);
assert.match(log, /## Execution 5/);
assert.match(log, /Original seed: `679e472a1e31e8c20074426565d9ed6ccc2f5115266f731bc3acd03470b35c02`/);
assert.match(log, /Parallel membrane field/i);
assert.match(log, /Rerolls: None/i);
assert.match(construction, /## Build 1 — Treaty expansion/);
assert.match(construction, /Constructive work extends the current experience instead of replacing/i);
assert.match(construction, /durable v5 schema is unchanged/i);
assert.match(read('README.md'), /constructive building mode/i);

assert.match(worker, /museum-of-almost-entropy-v5/);
assert.match(worker, /url\.origin !== self\.location\.origin/);
assert.match(workflow, /jobs:\s*\n\s*check:/);
assert.match(workflow, /permissions:\s*\n\s*contents: read/);
assert.match(workflow, /persist-credentials: false/);
assert.match(workflow, /timeout-minutes: 5/);
assert.match(workflow, /actions\/checkout@[0-9a-f]{40}/);
assert.match(workflow, /actions\/setup-node@[0-9a-f]{40}/);

const publicText = [
  index, app, core, privacy, history, log, construction, read('README.md'), read('RIGHTS.md'), read('CONTRIBUTING.md')
].join('\n');
assert.doesNotMatch(publicText, /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i);
assert.doesNotMatch(publicText, /\bAKIA[0-9A-Z]{16}\b/);
assert.doesNotMatch(publicText, /\bsk-(?:proj-)?[A-Za-z0-9_-]{16,}\b/);
assert.doesNotMatch(publicText, /BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY/);
assert.doesNotMatch(publicText, /password\s*[:=]\s*["'][^"']+["']/i);
assert.doesNotMatch(publicText, /\/Users\/|\/home\/[A-Za-z0-9._-]+|C:\\Users\\/i);

console.log('Privacy, accessibility, constructive treaty additions, erasure-only persistence, and offline contract verified.');
