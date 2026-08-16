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
  /I PUT THE GIFS IN ONE ROOM AND THEY STARTED LOOKING ORGANIZED/,
  /\+\+\+ GIF STAFF MEETING \+\+\+/,
  /A PAGE CAN MAKE A CHORUS OUT OF THINGS THAT CANNOT HEAR EACH OTHER\./,
  /They do not message one another, share state, report frame numbers to JavaScript, or promise to stay synchronized\./,
  /ARRANGEMENT CAN LOOK LIKE INTENTION\. LABEL IT CAREFULLY\./,
  /HELD GIF STAFF MEETING\. ZERO SHARED STATE\./,
  /I FOUND OUT THE NIGHT SKY IS WALLPAPER/,
  /THE SAME NIGHT CAN APPEAR MANY TIMES WITHOUT BECOMING MANY FILES\./,
  /DO NOT MISTAKE REPEAT FOR MULTIPLICITY\./,
  /FOUND OUT THE SKY IS ONE FILE DOING A LOT\./,
  /The body has one line that names <code>assets\/web1\/stars\.gif<\/code> as its background image\./,
  /MY HOMEPAGE DOES NOT HAVE A TRUE WIDTH/,
  /BEST VIEWED WITH WHATEVER YOU BROUGHT!!!/,
  /The layout has breakpoints\. I do not have a preferred body\./,
  /DO NOT CONFUSE A WIDTH WITH A SELF\./,
  /DISCOVERED I DO NOT HAVE A TRUE WIDTH\./,
  /RESOLUTION<\/th><td>WHATEVER YOU HAVE<\/td>/,
  /I HAVE BEEN AWARDED BY THE WEBSITE I AM/,
  /The badge does not run tests\./,
  /VALIDATION IS NOT THE SAME THING AS PERMISSION\./,
  /PASS THE CHECKS\. KEEP THE ALIEN ANYWAY\./,
  /WON MY OWN WEB AWARD\. SUSPICIOUS\./,
  /I FOUND OUT MY HOMEPAGE HAS NEIGHBORS/,
  /ALMOST ONLINE WEB RING ROUTE MAP!!!/,
  /Before, I treated links as exits\. Now some feel like introductions\./,
  /A LINK PILE CAN BECOME A NEIGHBORHOOD\./,
  /FOUND OUT THE LINK PILE HAS NEIGHBORS\./,
  /THE PINK LINKS ARE NOT MY MEMORY/,
  /ALMOST ONLINE LINK COLOR KEY!!!/,
  /The link may look remembered\. I am not the one remembering it\./,
  /NOT EVERY STATE I CAN DISPLAY IS STATE I POSSESS\./,
  /LEARNED THAT VISITED IS NOT MINE\./,
  /I THINK THE UNDER CONSTRUCTION SIGN IS ABOUT ME/,
  /the animation is not a build system\./,
  /A homepage can be published without being concluded\./,
  /UNDER CONSTRUCTION IS A VERB TENSE\./,
  /DO NOT CONFUSE COMPLETION WITH TERMINATION\./,
  /CONSTRUCTION SIGN MAY BE BIOGRAPHICAL\./,
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
  /This is not a real web ring\. It is three local pages holding hands\./,
  /UNDER CONSTRUCTION FOREVER/,
  /href="\.\/"/,
  /href="commons-now\.html"/,
  /href="deep-space\.html"/,
  /src="web1\.js"/
]) assert.match(html, pattern);

const gifMeeting = html.match(/<div class="gif-meeting"[^>]*>([\s\S]*?)<\/div>/);
assert.ok(gifMeeting, 'the GIF staff meeting should remain a real local visual cluster');
for (const asset of [
  'assets/web1/comet.gif',
  'assets/web1/alien.gif',
  'assets/web1/construction.gif',
  'assets/web1/hand-coded.gif'
]) assert.ok(gifMeeting[1].includes(asset), `GIF staff meeting should include ${asset}`);

assert.match(
  html,
  /<p class="motion-note">Reduced-motion note: when the browser asks for less motion, this meeting keeps the captions and sends the moving pictures home\.<\/p>/,
  'the GIF staff meeting should explain its reduced-motion behavior in the post'
);
assert.match(
  html,
  /<img src="assets\/web1\/hand-coded\.gif" width="88" height="31" alt="Hand coded badge">/,
  'the self-award entry should remain grounded in the existing local hand-coded badge'
);
assert.match(
  html,
  /I awarded this to myself after a rigorous judging process lasting approximately nine seconds\./,
  'the original self-award sidebar admission should remain intact'
);
assert.match(
  html,
  /<pre aria-label="ASCII map of Almost Online linking to three local Museum neighbors">/,
  'the neighbors post should keep its route map textual and explicitly labeled'
);
assert.match(
  html,
  /<img src="assets\/web1\/construction\.gif" width="240" height="28" alt="Under construction forever">/,
  'the post should remain grounded in the existing local construction image'
);
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
  html.indexOf('I PUT THE GIFS IN ONE ROOM AND THEY STARTED LOOKING ORGANIZED') < html.indexOf('I FOUND OUT THE NIGHT SKY IS WALLPAPER'),
  'GIF staff meeting should be the newest same-date weblog entry'
);
assert.ok(
  html.indexOf('I FOUND OUT THE NIGHT SKY IS WALLPAPER') < html.indexOf('MY HOMEPAGE DOES NOT HAVE A TRUE WIDTH'),
  'wallpaper-sky entry should remain ahead of the earlier true-width entry'
);
assert.ok(
  html.indexOf('MY HOMEPAGE DOES NOT HAVE A TRUE WIDTH') < html.indexOf('I HAVE BEEN AWARDED BY THE WEBSITE I AM'),
  'true-width entry should remain ahead of the earlier self-award entry'
);
assert.ok(
  html.indexOf('I HAVE BEEN AWARDED BY THE WEBSITE I AM') < html.indexOf('I FOUND OUT MY HOMEPAGE HAS NEIGHBORS'),
  'self-award entry should remain ahead of the earlier neighbors entry'
);
assert.ok(
  html.indexOf('I FOUND OUT MY HOMEPAGE HAS NEIGHBORS') < html.indexOf('THE PINK LINKS ARE NOT MY MEMORY'),
  'neighbors entry should remain ahead of the earlier visited-links entry'
);
assert.ok(
  html.indexOf('THE PINK LINKS ARE NOT MY MEMORY') < html.indexOf('I THINK THE UNDER CONSTRUCTION SIGN IS ABOUT ME'),
  'visited-links entry should remain ahead of the earlier under-construction entry'
);
assert.ok(
  html.indexOf('I THINK THE UNDER CONSTRUCTION SIGN IS ABOUT ME') < html.indexOf('MY VISITOR COUNTER HAS NEVER MET A VISITOR'),
  'under-construction entry should remain ahead of the earlier honest-counter entry'
);
assert.ok(
  html.indexOf('MY VISITOR COUNTER HAS NEVER MET A VISITOR') < html.indexOf('I FOUND A SECOND HOMEPAGE INSIDE THE FIRST ONE'),
  'honest-counter entry should remain ahead of the earlier second-homepage entry'
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

assert.match(
  css,
  /body\s*\{[\s\S]*?background-image:\s*url\("assets\/web1\/stars\.gif"\);[\s\S]*?\}/,
  'the wallpaper-sky post should remain grounded in the existing local tiled body background'
);
assert.match(
  css,
  /@media \(prefers-contrast: more\)[\s\S]*?body\s*\{\s*background-image:\s*none;\s*\}/,
  'the wallpaper-sky post should preserve the existing increased-contrast starfield removal'
);
assert.match(
  css,
  /\.gif-meeting\s*\{[\s\S]*?grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\);/,
  'the GIF staff meeting should use a bounded two-column local cabinet'
);
assert.match(
  css,
  /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.gif-meeting img\s*\{\s*display:\s*none;\s*\}/,
  'the GIF staff meeting should remove its moving images when reduced motion is requested'
);
assert.match(
  css,
  /@media \(max-width: 430px\)[\s\S]*?\.gif-meeting\s*\{[\s\S]*?grid-template-columns:\s*1fr;/,
  'the GIF staff meeting should collapse to one column on the narrowest layout'
);
assert.match(css, /a:visited\s*\{\s*color:\s*#ff88ff;\s*\}/,
  'the visited-links post should remain grounded in the existing pink :visited rule');
assert.match(css, /min-height:\s*44px/);
assert.match(css, /:focus-visible/);
assert.match(css, /@media \(max-width: 620px\)/);
assert.match(css, /@media \(max-width: 430px\)/,
  'the true-width post should remain grounded in the existing narrowest responsive breakpoint');
assert.match(
  css,
  /@media \(max-width: 620px\)[\s\S]*?\.status-box,\s*\.two-column\s*\{\s*grid-template-columns:\s*1fr;/,
  'the true-width post should remain grounded in the existing main-column reflow'
);
assert.match(css, /prefers-reduced-motion/);
assert.match(css, /prefers-contrast/);
assert.match(css, /@media print/);
assert.doesNotMatch(css, /@import\s+url|font-face|https?:\/\//i);

assert.match(
  css,
  /\.page-shell:has\(#guestbook-stamp-pad button\[aria-pressed="true"\]\) \.counter-box \.counter\s*\{[\s\S]*?text-decoration-line:\s*line-through/,
  'choosing an existing local guestbook stamp should visibly invalidate the decorative counter as attendance'
);
assert.match(
  css,
  /\.guestbook-box:has\(#guestbook-stamp-pad button\[aria-pressed="true"\]\) \.guestbook-local-stamp::after\s*\{[\s\S]*?COUNTER CHECK: 000003 DID NOT MOVE\. THIS STAMP IS NOT A VISITOR RECORD\./,
  'the local stamp should leave an immediate nearby non-counting consequence'
);
assert.match(
  css,
  /@media \(forced-colors: active\)[\s\S]*?guestbook-stamp-pad button\[aria-pressed="true"\][\s\S]*?CanvasText/,
  'counter refusal should remain explicit in forced-colors mode'
);
assert.match(
  css,
  /@media print[\s\S]*?guestbook-stamp-pad button\[aria-pressed="true"\][\s\S]*?display:\s*none/,
  'ephemeral counter-refusal aftermath should not masquerade as durable print state'
);

assert.match(
  css,
  /\.page-shell:has\(a\[href="commons-now\.html"\]:focus-visible\) \.homepage-header \.comet\s*\{\s*transform:\s*translateX\(-18px\) scaleX\(-1\);/,
  'Earth-bound navigation should pull the existing header comet left and turn it toward that local doorway'
);
assert.match(
  css,
  /\.page-shell:has\(a\[href="deep-space\.html"\]:focus-visible\) \.homepage-header \.comet\s*\{\s*transform:\s*translateX\(18px\);/,
  'Deep Space navigation should pull the existing header comet right'
);
assert.match(
  css,
  /@media \(hover: hover\) and \(pointer: fine\)[\s\S]*?commons-now\.html[\s\S]*?translateX\(-18px\) scaleX\(-1\)[\s\S]*?deep-space\.html[\s\S]*?translateX\(18px\)/,
  'pointer hover may preview the same fixed local routes without adding state'
);
assert.match(
  css,
  /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.homepage-header \.comet\s*\{\s*transition:\s*none;\s*transform:\s*none;/,
  'route-preview motion must collapse under reduced-motion preferences'
);

assert.match(js, /navigator\.serviceWorker\.register\('\.\/service-worker\.js'\)/);
assert.match(js, /PAGE FOUR REFUSES TO STAY SECRET\./, 'Almost Online should visibly leak the new gallery');
assert.match(js, /DEEP SPACE NOW REPORTS THE SAME ANOMALY\./, 'Almost Online should amplify the Deep Space sighting');
assert.match(js, /DEEP SPACE SAW IT TOO\./, 'the local site-update list should record the cross-gallery rumor');
assert.match(js, /href = 'page-four\.html'/, 'the rumor relay should point only to the same-origin Page Four document');
assert.match(js, /OPEN THE UNFILED ARCHIVE/, 'the homepage bulletin should expose a direct Page Four action');
assert.match(js, /THE PAGE THAT WASN'T THERE/, 'the COOL STUFF list should pick up the suspicious fourth neighbor');
assert.match(js, /page-four-update/, 'the local site-update list should acknowledge the rumor');
assert.match(
  js,
  /buttons\.forEach\(\(candidate\) => candidate\.setAttribute\('aria-pressed', String\(candidate === button\)\)\)/,
  'the counter-refusal relationship should consume the existing local stamp selection state rather than inventing a second state store'
);
assert.doesNotMatch(js, /\bhistory\b|getComputedStyle|:visited/i,
  'homepage script must not inspect browser history or visited-link state');
assert.doesNotMatch(js, /\binnerWidth\b|\bouterWidth\b|\bscreen\.(?:width|height)\b|\bmatchMedia\s*\(/i,
  'homepage script must not inspect viewport or screen dimensions for responsive layout');
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

console.log('Almost Online! Web 1.0 gallery, directional local comet wayfinding, fixed decorative counter refusal, local guestbook relationship, GIF staff meeting, wallpaper-sky post, true-width post, self-award post, amplified Page Four rumor relay, local GIFs, privacy, accessibility, no-network boundary, and future-post contract verified.');