import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');

const required = [
  'almost-online.html',
  'web1.css',
  'web1.js',
  'WEB1_HOME.md',
  'assets/web1/stars.gif',
  'assets/web1/comet.gif',
  'assets/web1/construction.gif',
  'assets/web1/hand-coded.gif',
  'assets/web1/alien.gif'
];
for (const name of required) assert.ok(fs.existsSync(path.join(root, name)), `missing ${name}`);

const html = read('almost-online.html');
const css = read('web1.css');
const js = read('web1.js');
const notes = read('WEB1_HOME.md');
const runtimeText = [html, css, js].join('\n');

for (const pattern of [
  /ALMOST ONLINE!/,
  /WELCOME TO MY HOMEPAGE!!!/,
  /THE ALMOST WEBLOG/,
  /HELLO FROM THE BACK OF THE INTERNET/,
  /WHY THE OLD WEB STILL FEELS ALIVE/,
  /GIF OF THE WEEK: COMET!!!/,
  /DECORATIVE VISITOR COUNTER/,
  /THIS DOES NOT COUNT YOU/,
  /GUESTBOOK/,
  /The Museum does not collect visitor free-text/,
  /THE ALMOST WEB RING/,
  /UNDER CONSTRUCTION FOREVER/,
  /href="\.\/"/,
  /href="commons-now\.html"/,
  /href="deep-space\.html"/,
  /src="web1\.js"/
]) assert.match(html, pattern);

for (const asset of [
  'assets/web1/stars.gif',
  'assets/web1/comet.gif',
  'assets/web1/construction.gif',
  'assets/web1/hand-coded.gif',
  'assets/web1/alien.gif'
]) assert.ok(runtimeText.includes(asset), `runtime should reference ${asset}`);

assert.doesNotMatch(runtimeText, /https?:\/\//i, 'Almost Online runtime must contain no remote URL');
assert.doesNotMatch(html, /<script[^>]+src=["'](?:https?:)?\/\//i);
assert.doesNotMatch(html, /<link[^>]+href=["'](?:https?:)?\/\//i);
assert.doesNotMatch(html, /<img[^>]+src=["'](?:https?:)?\/\//i);
assert.doesNotMatch(html, /<(input|textarea|select|form)\b|contenteditable|<iframe\b/i,
  'personal homepage must not collect visitor text or embed third parties');

assert.match(css, /url\("assets\/web1\/stars\.gif"\)/);
assert.match(css, /min-height:\s*44px/);
assert.match(css, /:focus-visible/);
assert.match(css, /@media \(max-width: 620px\)/);
assert.match(css, /prefers-reduced-motion/);
assert.match(css, /prefers-contrast/);
assert.match(css, /@media print/);
assert.doesNotMatch(css, /@import\s+url|font-face|https?:\/\//i);

assert.match(js, /navigator\.serviceWorker\.register\('\.\/service-worker\.js'\)/);
assert.doesNotMatch(js, /\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource/i);
assert.doesNotMatch(js, /localStorage|sessionStorage|indexedDB|document\.cookie|navigator\.geolocation/i);
assert.doesNotMatch(js, /setInterval|setTimeout|requestAnimationFrame/i);

for (const asset of required.filter((name) => name.endsWith('.gif'))) {
  const bytes = fs.readFileSync(path.join(root, asset));
  const signature = bytes.subarray(0, 6).toString('ascii');
  assert.ok(signature === 'GIF89a' || signature === 'GIF87a', `${asset} should be a real GIF`);
  const controlBlocks = bytes.toString('latin1').split('\x21\xF9\x04').length - 1;
  assert.ok(controlBlocks >= 2, `${asset} should contain multiple animation frames`);
}

assert.match(notes, /personal homepage and weblog/i);
assert.match(notes, /No third-party runtime scripts, fonts, images, embeds, APIs, hotlinks, trackers, analytics, ads, or telemetry/i);
assert.match(notes, /Do not publish personal information about real people/i);
assert.match(notes, /Future posts should be added directly to the HTML in reverse chronological order/i);

console.log('Almost Online! Web 1.0 gallery, local GIFs, privacy, accessibility, no-network boundary, and future-post contract verified.');
