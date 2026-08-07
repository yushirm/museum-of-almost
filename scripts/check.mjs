import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

for (const file of [
  'index.html', 'styles.css', 'live-entropy.css', 'dashboard.css', 'entropy-core.js', 'app.js',
  'live-entropy-core.js', 'live-entropy.js', 'dashboard.js', 'manifest.webmanifest', 'service-worker.js',
  'README.md', 'PRIVACY.md', 'ENTROPY_LOG.md', 'ENTROPY_HISTORY.md', 'CONSTRUCTION_LOG.md',
  'RIGHTS.md', 'CONTRIBUTING.md', 'scripts/entropy-select.mjs', 'scripts/entropy-dimensions.json',
  'scripts/entropy-rerolls.json', 'scripts/test-entropy.mjs', 'scripts/test-live-entropy.mjs',
  'scripts/test-service-worker.mjs', '.github/workflows/check.yml'
]) {
  assert.ok(fs.existsSync(path.join(root, file)), `missing ${file}`);
}

const index = read('index.html');
const app = read('app.js');
const core = read('entropy-core.js');
const styles = read('styles.css');
const liveStyles = read('live-entropy.css');
const dashboardStyles = read('dashboard.css');
const liveCore = read('live-entropy-core.js');
const liveApp = read('live-entropy.js');
const dashboardApp = read('dashboard.js');
const worker = read('service-worker.js');
const privacy = read('PRIVACY.md');
const history = read('ENTROPY_HISTORY.md');
const log = read('ENTROPY_LOG.md');
const construction = read('CONSTRUCTION_LOG.md');
const readme = read('README.md');
const workflow = read('.github/workflows/check.yml');
const runtime = [
  index, app, core, styles, liveStyles, dashboardStyles, liveCore, liveApp, dashboardApp, worker
].join('\n');

const allowedLiveUrls = [
  'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson',
  'https://services.swpc.noaa.gov/products/summary/solar-wind-speed.json'
].sort();
const runtimeUrls = [...new Set(runtime.match(/https:\/\/[^\s"'`<>]+/g) || [])].sort();
assert.deepEqual(runtimeUrls, allowedLiveUrls, 'runtime remote origins must stay limited to the approved live entropy feeds');
assert.doesNotMatch(runtime, /\b(XMLHttpRequest|sendBeacon|WebSocket|EventSource)\b/i);
assert.doesNotMatch(runtime, /\b(gtag|dataLayer|mixpanel|segment|plausible|amplitude)\b/i);
assert.doesNotMatch(runtime, /google-analytics|googletagmanager|analytics\.js|sendBeacon\s*\(/i);
assert.doesNotMatch(index, /<script[^>]+src=["'](?:https?:)?\/\//i);
assert.doesNotMatch(index, /<link[^>]+href=["'](?:https?:)?\/\//i);
assert.doesNotMatch(index, /<(input|textarea)\b|contenteditable/i, 'visitor free text is prohibited');

for (const id of [
  'treaty-surface', 'status', 'sound-button', 'erase-button', 'reset-button', 'once-event',
  'ghost-mark', 'suspension-spans', 'echo-button', 'undo-button', 'soften-button',
  'intensify-button', 'postcard-button', 'print-button', 'ledger-summary', 'ledger-count',
  'ledger-weight', 'ledger-center', 'ledger-spread', 'resonance-summary', 'session-journal',
  'live-entropy', 'live-entropy-marker', 'live-invite-button', 'live-release-button',
  'live-entropy-status', 'live-quake-status', 'live-solar-status', 'live-vector-status',
  'live-correspondence-status', 'dashboard-agreement', 'dashboard-pressure',
  'dashboard-session-load', 'dashboard-memory', 'dashboard-quakes', 'dashboard-magnitude',
  'dashboard-solar', 'dashboard-correspondence', 'dashboard-network', 'dashboard-storage',
  'dashboard-worker', 'dashboard-live'
]) {
  assert.match(index, new RegExp(`id=["']${id}["']`), `missing dashboard interface id: ${id}`);
}
assert.match(index, /class="treaty dashboard"/);
assert.match(index, /Live operations dashboard/i);
assert.match(index, /Treaty dashboard summary/i);
assert.match(index, /Current live source metrics/i);
assert.match(index, /Local operating state/i);
assert.match(index, /id="treaty-surface"[\s\S]*?role="application"/);
assert.match(index, /id="treaty-surface"[\s\S]*?tabindex="0"/);
assert.match(index, /id="status"[^>]+aria-live="polite"/);
assert.match(index, /id="sound-button"[^>]+aria-pressed="false"/);
assert.match(index, /unit unresolved/i);
assert.match(index, /<details class="shortcut-help">/);
assert.match(index, /<kbd>/);
assert.match(index, /Make local postcard/i);
assert.match(index, /Print treaty/i);
assert.match(index, /Invite live entropy/i);
assert.match(index, /Nothing will be requested until invited/i);
assert.match(index, /credentials and referrer are omitted/i);
assert.match(index, /never polled automatically/i);
assert.match(index, /src="live-entropy-core\.js"/);
assert.match(index, /src="live-entropy\.js"/);
assert.match(index, /src="dashboard\.js"/);
assert.match(index, /href="live-entropy\.css"/);
assert.match(index, /href="dashboard\.css"/);

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

for (const functionName of [
  'normalizeEarthquakes', 'normalizeSolarWind', 'composeLiveEntropy', 'correspondenceFor'
]) {
  assert.match(liveCore, new RegExp(`function ${functionName}\\b`), `missing live entropy function: ${functionName}`);
}
assert.match(liveCore, /all_hour\.geojson/);
assert.match(liveCore, /solar-wind-speed\.json/);
assert.match(liveApp, /live-invite-button/);
assert.match(liveApp, /addEventListener\('click', inviteLiveEntropy\)/);
assert.match(liveApp, /Promise\.allSettled/);
assert.match(liveApp, /fetch\(url/);
assert.match(liveApp, /credentials:\s*'omit'/);
assert.match(liveApp, /referrerPolicy:\s*'no-referrer'/);
assert.match(liveApp, /cache:\s*'no-store'/);
assert.match(liveApp, /mode:\s*'cors'/);
assert.match(liveApp, /AbortController/);
assert.match(liveApp, /MutationObserver/);
assert.match(liveApp, /dataset\.worldPressure/);
assert.match(liveApp, /dataset\.quakeCount/);
assert.match(liveApp, /dataset\.quakeStrongest/);
assert.match(liveApp, /dataset\.solarSpeed/);
assert.doesNotMatch(liveApp, /setInterval|geolocation|navigator\.geolocation|document\.cookie/i);
assert.doesNotMatch(liveApp, /localStorage|sessionStorage|indexedDB/i, 'live entropy must remain memory-only');
const liveSetup = liveApp.slice(0, liveApp.indexOf('async function inviteLiveEntropy'));
assert.doesNotMatch(liveSetup, /fetch\(/, 'live data must not be fetched before explicit invitation');

assert.match(dashboardApp, /MutationObserver/);
assert.match(dashboardApp, /addEventListener\('online'/);
assert.match(dashboardApp, /addEventListener\('offline'/);
assert.match(dashboardApp, /serviceWorker/);
assert.match(dashboardApp, /dataset\.worldPressure/);
assert.match(dashboardApp, /dataset\.quakeCount/);
assert.match(dashboardApp, /dataset\.solarSpeed/);
assert.doesNotMatch(dashboardApp, /\bfetch\s*\(/, 'dashboard view must not make its own network requests');
assert.doesNotMatch(dashboardApp, /setInterval|geolocation|navigator\.geolocation|document\.cookie/i);
assert.doesNotMatch(dashboardApp, /localStorage|sessionStorage|indexedDB/i, 'dashboard view must not create storage');

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
assert.match(liveStyles, /\.live-entropy-marker/);
assert.match(liveStyles, /data-live-entropy/);
assert.match(liveStyles, /data-correspondence/);
assert.match(liveStyles, /min-height:\s*44px/);
assert.match(liveStyles, /@media \(prefers-reduced-motion: reduce\)/);
assert.match(liveStyles, /@media \(prefers-contrast: more\)/);
assert.match(liveStyles, /@media print/);
assert.doesNotMatch(liveStyles, /min-width:\s*[4-9]\d\dpx/);
assert.match(dashboardStyles, /\.dashboard-summary/);
assert.match(dashboardStyles, /grid-template-columns:\s*repeat\(12/);
assert.match(dashboardStyles, /\.dashboard-live-metrics/);
assert.match(dashboardStyles, /\.dashboard-system/);
assert.match(dashboardStyles, /@media \(max-width: 820px\)/);
assert.match(dashboardStyles, /@media \(max-width: 560px\)/);
assert.match(dashboardStyles, /@media \(prefers-reduced-motion: reduce\)/);
assert.match(dashboardStyles, /@media \(prefers-contrast: more\)/);
assert.match(dashboardStyles, /@media print/);
assert.doesNotMatch(dashboardStyles, /min-width:\s*[4-9]\d\dpx/);

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
assert.match(privacy, /Live entropy is off by default/i);
assert.match(privacy, /USGS/i);
assert.match(privacy, /NOAA/i);
assert.match(privacy, /credentials.*omitted/i);
assert.match(privacy, /referrer.*omitted/i);
assert.match(privacy, /IP address/i);
assert.match(privacy, /not stored/i);
assert.match(privacy, /does not poll/i);
assert.match(history, /## Execution 5/);
assert.match(history, /Primary Fixation exiled: Parallel membrane field/i);
assert.match(log, /## Execution 5/);
assert.match(log, /Original seed: `679e472a1e31e8c20074426565d9ed6ccc2f5115266f731bc3acd03470b35c02`/);
assert.match(log, /Parallel membrane field/i);
assert.match(log, /Rerolls: None/i);
assert.match(construction, /## Build 1 — Treaty expansion/);
assert.match(construction, /## Build 2 — Live entropy/);
assert.match(construction, /## Build 3 — Operations dashboard/);
assert.match(construction, /Constructive work extends the current experience instead of replacing/i);
assert.match(construction, /durable v5 schema is unchanged/i);
assert.match(construction, /USGS/i);
assert.match(construction, /NOAA/i);
assert.match(readme, /constructive building mode/i);
assert.match(readme, /live entropy/i);
assert.match(readme, /explicit opt-in/i);
assert.match(readme, /operations dashboard/i);

assert.match(worker, /museum-of-almost-entropy-v5-dashboard1/);
assert.match(worker, /dashboard\.css/);
assert.match(worker, /dashboard\.js/);
assert.match(worker, /url\.origin !== self\.location\.origin/);
assert.doesNotMatch(worker, /https?:\/\//, 'service worker must not proxy live entropy');
assert.match(workflow, /jobs:\s*\n\s*check:/);
assert.match(workflow, /permissions:\s*\n\s*contents: read/);
assert.match(workflow, /persist-credentials: false/);
assert.match(workflow, /timeout-minutes: 5/);
assert.match(workflow, /actions\/checkout@[0-9a-f]{40}/);
assert.match(workflow, /actions\/setup-node@[0-9a-f]{40}/);
assert.match(workflow, /node scripts\/test-live-entropy\.mjs/);
assert.match(workflow, /node --check dashboard\.js/);

const publicText = [
  index, app, core, liveCore, liveApp, dashboardApp, privacy, history, log, construction, readme,
  read('RIGHTS.md'), read('CONTRIBUTING.md')
].join('\n');
assert.doesNotMatch(publicText, /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i);
assert.doesNotMatch(publicText, /\bAKIA[0-9A-Z]{16}\b/);
assert.doesNotMatch(publicText, /\bsk-(?:proj-)?[A-Za-z0-9_-]{16,}\b/);
assert.doesNotMatch(publicText, /BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY/);
assert.doesNotMatch(publicText, /password\s*[:=]\s*["'][^"']+["']/i);
assert.doesNotMatch(publicText, /\/Users\/|\/home\/[A-Za-z0-9._-]+|C:\\Users\\/i);

console.log('Dashboard layout, privacy, accessibility, opt-in live entropy, erasure-only persistence, and offline contract verified.');
