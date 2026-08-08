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
const entrance = read('index.html');
const runtimeText = [html, css, js].join('\n');
const publicText = [html, css, js, notes].join('\n');

for (const pattern of [
  /ALMOST ONLINE!/,
  /WELCOME TO MY HOMEPAGE!!!/,
  /THE ALMOST WEBLOG/,
  /MY VISITOR COUNTER HAS NEVER MET A VISITOR/,
  /FREE HIT COUNTER FAQ!!!/,
  /IT MEANS I THOUGHT THREE LOOKED GOOD IN A LITTLE BOX\./,
  /I do not need to know you were here for this to have happened\./,
  /AUDIENCE IS NOT A DATABASE\./,
  /COUNTER STILL KNOWS NOTHING\. EXCELLENT\./,
  /I FOUND A SECOND HOMEPAGE INSIDE THE FIRST ONE/,
  /the visible page can compress a shape that the source still remembers\./,
  /YOU FOUND THE SECOND HOMEPAGE\. IT IS QUIETER HERE\./,
  /Same file\. Different weather\./,
  /NOTHING IS ALSO PART OF THE FILE\./,
  /FOUND THE QUIET HOMEPAGE UNDER THE LOUD ONE\./,
  /HOW TO CARE FOR A BROKEN IMAGE/,
  /EMERGENCY BROKEN-IMAGE FIELD MANUAL v0\.1/,
  /every image is one 404 away from becoming literature\./,
  /ALT TEXT IS NOT A SECRET MESSAGE\. IT IS PART OF THE PAGE\./,
  /DISCOVERED THAT IMAGES HAVE EMERGENCY SENTENCES\./,
  /<pre aria-label="ASCII diagram of a missing image leaving a textual description behind">/,
  /THE BACK BUTTON IS A TINY TIME MACHINE/,
  /08 AUG 2026/,
  /history is not a feed\. It is a little stack of doors behind you\./,
  /A homepage is not a place\. It is a set of instructions for making the same place again\./,
  /NOTE TO SELF: DO NOT BECOME NORMAL\./,
  /DISCOVERED BACK BUTTON\. CONCERNING\./,
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

assert.match(
  html,
  /<strong class="counter" aria-label="decorative number 000003">000003<\/strong>/,
  'the visitor counter should remain explicitly decorative and fixed'
);
assert.match(
  html,
  /<!-- YOU FOUND THE SECOND HOMEPAGE\. IT IS QUIETER HERE\. -->/,
  'the source-only note should remain a real HTML comment rather than visible page copy'
);
assert.ok(
  html.indexOf('MY VISITOR COUNTER HAS NEVER MET A VISITOR') < html.indexOf('I FOUND A SECOND HOMEPAGE INSIDE THE FIRST ONE'),
  'new weblog entries should remain reverse chronological within the same date'
);
assert.ok(
  html.indexOf('I FOUND A SECOND HOMEPAGE INSIDE THE FIRST ONE') < html.indexOf('HOW TO CARE FOR A BROKEN IMAGE'),
  'second-homepage entry should remain ahead of the earlier broken-image entry'
);
assert.ok(
  html.indexOf('HOW TO CARE FOR A BROKEN IMAGE') < html.indexOf('THE BACK BUTTON IS A TINY TIME MACHINE'),
  'broken-image entry should remain ahead of the earlier back-button entry'
);
assert.ok(
  html.indexOf('THE BACK BUTTON IS A TINY TIME MACHINE') < html.indexOf('HELLO FROM THE BACK OF THE INTERNET'),
  'new weblog entries should remain reverse chronological'
);

for (const pattern of [
  /GALLERY 03 · PERSONAL HOMEPAGE/,
  /ALMOST ONLINE!/,
  /href="almost-online\.html"/,
  /Welcome to my homepage!!!/
]) assert.match(entrance, pattern, `museum entrance should expose Gallery 03: ${pattern}`);

for (const asset of [
  'assets/web1/stars.gif',
  'assets/web1/comet.gif',
  'assets/web1/construction.gif',
  'assets/web1/hand-coded.gif',
  'assets/web1/alien.gif'
]) assert.ok(runtimeText.includes(asset), `runtime should reference ${asset}`);

for (const match of html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g)) {
  const src = match[1];
  assert.ok(fs.existsSync(path.join(root, src)), `homepage image should exist locally: ${src}`);
}

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

for (const pattern of [
  /\b[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i,
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  /\bAKIA[0-9A-Z]{16}\b/,
  /\bsk-(?:proj-)?[A-Za-z0-9_-]{16,}\b/i,
  /BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY/,
  /password\s*[:=]\s*["'][^"']+["']/i,
  /\/Users\/|\/home\/[A-Za-z0-9._-]+|C:\\Users\\/i
]) assert.doesNotMatch(publicText, pattern, `Almost Online public privacy scan: forbidden ${pattern}`);

assert.match(notes, /personal homepage and weblog/i);
assert.match(notes, /No third-party runtime scripts, fonts, images, embeds, APIs, hotlinks, trackers, analytics, ads, or telemetry/i);
assert.match(notes, /Do not publish personal information about real people/i);
assert.match(notes, /Future posts should be added directly to the HTML in reverse chronological order/i);

console.log('Almost Online! Web 1.0 gallery, local GIFs, privacy, accessibility, no-network boundary, and future-post contract verified.');
