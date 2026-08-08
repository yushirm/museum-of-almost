import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../page-four.html', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../page-four.css', import.meta.url), 'utf8');
const teaser = fs.readFileSync(new URL('../page-four-teaser.css', import.meta.url), 'utf8');
const js = fs.readFileSync(new URL('../page-four.js', import.meta.url), 'utf8');
const researchJs = fs.readFileSync(new URL('../page-four-research.js', import.meta.url), 'utf8');
const researchCss = fs.readFileSync(new URL('../page-four-research.css', import.meta.url), 'utf8');
const instrumentJs = fs.readFileSync(new URL('../page-four-instrument-room.js', import.meta.url), 'utf8');
const instrumentCss = fs.readFileSync(new URL('../page-four-instrument-room.css', import.meta.url), 'utf8');
const researchLedger = fs.readFileSync(new URL('../PAGE_FOUR_RESEARCH.md', import.meta.url), 'utf8');
const entrance = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');

for (const pattern of [
  /PAGE FOUR/,
  /THE UNFILED \/ THE UNSEEN \/ THE UNVERIFIED/,
  /CRYPTID SIGHTINGS/,
  /IMPOSSIBLE MAPS/,
  /CELESTIAL THEORIES/,
  /MISSING BROADCASTS/,
  /SUSPICIOUS DIAGRAMS/,
  /FIELD NOTES/,
  /WITNESS ACCOUNTS/,
  /REDACTED ARCHIVE FRAGMENTS/,
  /EVIDENCE BOARD/,
  /FICTIONAL ARCHIVE/,
  /NO CLAIM OF FACT/,
  /PAGE FOUR IS FICTION/
]) assert.match(html, pattern, `Page Four missing ${pattern}`);

const ids = [...html.matchAll(/data-case="([^"]+)"/g)].map((match) => match[1]);
assert.equal(ids.length, 9, 'Page Four should expose exactly nine fictional case sections');
assert.equal(new Set(ids).size, ids.length, 'Page Four case identifiers must be unique');

for (const target of [...html.matchAll(/data-target="([^"]+)"/g)].map((match) => match[1])) {
  assert.ok(ids.includes(target), `evidence-board target ${target} should resolve to a fictional case`);
}

assert.match(entrance, /href="page-four\.html"/);
assert.match(entrance, /href="page-four-teaser\.css"/);
assert.match(entrance, /GALLERY 04 · UNFILED \/ UNVERIFIED/);
assert.match(entrance, /The fourth was not on the floor plan\./);

for (const source of [html, css, teaser, js, researchJs, researchCss, instrumentJs, instrumentCss]) {
  assert.doesNotMatch(source, /https?:\/\//i, 'Page Four runtime must remain local-only');
}
assert.doesNotMatch(html, /<(input|textarea|select)\b|contenteditable/i, 'Page Four must not collect visitor free text');
assert.doesNotMatch(html, /<iframe\b/i, 'Page Four must not embed third-party documents');
const runtimeJs = [js, researchJs, instrumentJs].join('\n');
assert.doesNotMatch(runtimeJs, /\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource/i, 'Page Four must not add runtime network requests');
assert.doesNotMatch(runtimeJs, /localStorage|sessionStorage|indexedDB|document\.cookie|navigator\.geolocation/i, 'Page Four must not persist or personalize visitor data');
assert.doesNotMatch(runtimeJs, /analytics|telemetry|tracking|gtag|dataLayer|mixpanel|segment|plausible|amplitude|hotjar/i, 'Page Four must remain tracking-free');
assert.doesNotMatch(runtimeJs, /navigator\.share\b/, 'Page Four must not hand data to external share targets automatically');
assert.doesNotMatch([researchJs, instrumentJs].join('\n'), /innerHTML|insertAdjacentHTML|document\.write/i, 'research evidence must mount through DOM nodes rather than HTML-string injection');
assert.match(js, /navigator\.serviceWorker\.register\('\.\/service-worker\.js'\)/, 'Page Four should participate in the local offline shell');
assert.match(js, /getRandomValues/, 'random-file access should be local and non-identifying');
assert.match(js, /aria-pressed/, 'reclassification control should expose state accessibly');
assert.match(js, /matchMedia\('\(prefers-reduced-motion: reduce\)'\)/, 'scripted archive jumps should honor reduced-motion preference');
assert.match(js, /reducedMotion\?\.matches \? 'auto' : 'smooth'/, 'reduced motion should disable smooth scrolling');
assert.match(js, /COPY PAGE FOUR LINK/, 'Page Four should expose a local copy-link leak desk');
assert.match(js, /COPY ACTIVE FILE LINK/, 'Page Four should allow copying the selected fictional case permalink');
assert.match(js, /navigator\.clipboard/, 'leak desk should use the user-controlled local clipboard');
assert.match(js, /clipboard\.writeText\(leakText\(target\)\)/, 'case leaks should copy explicit fictional context with the permalink');
assert.match(js, /Fictional, unverified archive material; no claim of fact\./, 'copied case text must preserve the fiction boundary');
assert.match(js, /id = 'public-leak-channel'/, 'Page Four should expose the in-Museum rumor channel');
assert.match(js, /href = 'almost-online\.html'/, 'the public leak channel should stay same-origin and local');
assert.match(js, /id = 'signal-echo-channel'/, 'Page Four should expose the Deep Space signal echo');
assert.match(js, /href = 'deep-space\.html'/, 'the signal echo should stay same-origin and local');
for (const pattern of [
  /KNOWN LEAK POINTS:/,
  /MUSEUM ENTRANCE \/ PUBLIC LISTING/,
  /ALMOST ONLINE! \/ UNLISTED BULLETIN/,
  /DEEP SPACE \/ SIGNAL ANOMALY/,
  /STATIC ROUTES\. NO VISITOR STATE OR COUNTING\./
]) assert.match(js, pattern, `Page Four static sighting log missing ${pattern}`);
assert.match(js, /page-four-research\.css/, 'Page Four should mount the local research styles');
assert.match(js, /page-four-research\.js/, 'Page Four should mount the local research logic');
assert.match(js, /page-four-instrument-room\.css/, 'Page Four should mount the local Instrument Room styles');
assert.match(js, /page-four-instrument-room\.js/, 'Page Four should mount the local Instrument Room logic');
assert.match(js, /loadResearchWing\(\)/, 'Page Four should progressively mount the research and investigation wings');
assert.match(js, /addEventListener\('hashchange'/, 'shared case permalinks should keep active-file state synchronized');
assert.match(js, /Shared case permalink opened:/, 'direct case permalinks should visibly activate and announce the selected file');

const evidenceCodes = ['PB-701', 'BF-1977', 'RV-XCI/LIII', 'NOAA-1997', '1I/2017 U1', 'UAP-IST-2023'];
for (const code of evidenceCodes) assert.ok(researchJs.includes(code), `research wing should include evidence file ${code}`);
assert.equal([...researchJs.matchAll(/code: '[^']+'/g)].length, 6, 'research wing should expose exactly six sourced evidence dossiers');
for (const pattern of [
  /THE LATTICE/,
  /Six real records\. Zero permission to confuse a documented anomaly with the theory wrapped around it\./,
  /A record existing is evidence that a record exists\./,
  /“Unidentified” describes a gap, not a cause\./,
  /GOVERNMENT ATTENTION IS NOT GOVERNMENT VALIDATION\./,
  /A NEGATIVE SAMPLE IS STILL EVIDENCE\./,
  /THE MOST IMPORTANT MISSING EVIDENCE MAY BE METADATA\./,
  /EDITORIAL CONNECTIONS ONLY \/\/ NOT NEW EVIDENCE/,
  /THE RECURRING PHENOMENON IS UNCERTAINTY/,
  /PAGE_FOUR_RESEARCH\.md/
]) assert.match(researchJs, pattern, `research wing missing ${pattern}`);
assert.match(researchJs, /role', 'status'/, 'correlation desk should expose live textual feedback');
assert.match(researchJs, /aria-live', 'polite'/, 'correlation desk live feedback should be polite');
assert.match(researchJs, /TRACE NEXT CONNECTION/, 'correlation desk should be visitor-triggered rather than automatic');
assert.doesNotMatch(researchJs, /setInterval|setTimeout|requestAnimationFrame/i, 'research wing should not add timers or animation loops');

for (const pattern of [
  /https:\/\/www\.archives\.gov\/research\/military\/air-force\/ufos/,
  /https:\/\/vault\.fbi\.gov\/bigfoot/,
  /CIA-RDP96-00788R000900970001-7/,
  /CIA-RDP96-00788R000900390001-1/,
  /https:\/\/www\.pmel\.noaa\.gov\/acoustics\/sounds\/bloop\.html/,
  /https:\/\/www\.nasa\.gov\/news-release\/our-solar-systems-first-known-interstellar-object-gets-unexpected-speed-boost\//,
  /https:\/\/science\.nasa\.gov\/uap\//,
  /12,618 sightings/,
  /701 remained categorized as “Unidentified\.”/,
  /deer-family origin/,
  /Source review date: 2026-08-08/
]) assert.match(researchLedger, pattern, `source ledger missing ${pattern}`);
assert.match(researchLedger, /No third-party source is loaded at runtime\./, 'source ledger should preserve the runtime boundary');
assert.match(researchLedger, /PAGE FOUR NOTE.*editorial interpretation or fictional connective tissue/s, 'source ledger should distinguish sourced fact from Page Four synthesis');

for (const styles of [css, teaser, researchCss, instrumentCss]) {
  assert.match(styles, /@media/, 'Page Four styles need responsive/environment handling');
  assert.match(styles, /prefers-reduced-motion/, 'Page Four styles need reduced-motion handling');
  assert.match(styles, /prefers-contrast/, 'Page Four styles need high-contrast handling');
  assert.match(styles, /@media print/, 'Page Four styles need a printable fallback');
  assert.doesNotMatch(styles, /@import\s+url|font-face|https?:\/\//i, 'Page Four styles must use local/system resources only');
}
assert.match(css, /min-height:\s*44px/, 'interactive controls should preserve a 44px target size');
assert.match(css, /:focus-visible/, 'Page Four should expose visible keyboard focus');
assert.match(researchCss, /min-height:\s*44px/, 'research interactions should preserve a 44px target size');
assert.match(researchCss, /:focus-visible/, 'research interactions should expose visible keyboard focus');
assert.match(instrumentCss, /min-height:\s*44px/, 'Instrument Room interactions should preserve a 44px target size');
assert.match(instrumentCss, /:focus-visible/, 'Instrument Room interactions should expose visible keyboard focus');

console.log('Page Four fictional archive, sourced evidence lattice, Hessdalen Instrument Room loader boundaries, local leak desk, shared permalinks, accessibility, no-network contract, and entrance reveal verified.');
