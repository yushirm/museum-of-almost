import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (name) => fs.readFileSync(new URL(`../${name}`, import.meta.url), 'utf8');
const html = read('elsewhere.html');
const css = read('elsewhere.css');
const js = read('elsewhere.js');
const teaser = read('elsewhere-teaser.css');
const index = read('index.html');
const worker = read('service-worker.js');

for (const phrase of [
  'ELSEWHERE /',
  'CATALOGUE 0',
  'SERVICE ACCESS / FIFTH SPACE',
  'Four public doors. One freight lift.',
  'Objects with provenance problems.',
  'LOST & FOUND / ELSEWHERE',
  'Nothing here is evidence.',
  'FICTIONAL COLLECTION · NO ACCOUNT · NO ANALYTICS · NO TRACKING'
]) assert.match(html, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `missing ${phrase}`);

for (const href of ['index.html', 'commons-now.html', 'deep-space.html', 'almost-online.html', 'page-four.html']) {
  assert.ok(html.includes(`href="${href}"`), `missing return route ${href}`);
}

assert.match(html, /class="freight-lift" href="#catalogue"/, 'the corridor must retain Button 0 as the direct descent to Catalogue 0');
assert.doesNotMatch(html, /<section class="lift"|id="lift-title"|DESCEND TO CATALOGUE 0/, 'Elsewhere should not restore the duplicate standalone freight-lift scene');
assert.doesNotMatch(css, /\.lift-cage|\.lift-copy|\.lift-plate|\.primary-action/, 'retired lift-scene styling should not remain as dead CSS');

const artifactIds = [...html.matchAll(/id="artifact-c0-(\d{3})"/g)].map((match) => match[1]);
assert.deepEqual(artifactIds, ['001','002','003','004','005','006','007','008','009','010','011','012']);
assert.equal((html.match(/data-artifact/g) || []).length, 12, 'Catalogue 0 should expose exactly twelve fixed fictional records');
assert.equal((html.match(/<details class="artifact"/g) || []).length, 12, 'records should use native progressive disclosure');

assert.match(html, /All Catalogue 0 artifacts|Catalogue 0 is a fictional museum department/i);
assert.match(html, /does not accept visitor submissions, names, stories, uploads or free text/i);
assert.doesNotMatch(html, /<iframe\b|<input\b|<textarea\b|contenteditable/i);
assert.doesNotMatch(html, /(?:src|href)="https?:\/\//i, 'fifth space must use only same-origin runtime assets');

for (const forbidden of [
  /\bfetch\s*\(/,
  /XMLHttpRequest|sendBeacon|WebSocket|EventSource/i,
  /localStorage|sessionStorage|indexedDB|document\.cookie/i,
  /navigator\.geolocation|\bgeolocation\b/i,
  /setInterval|requestAnimationFrame/i,
  /analytics|telemetry|googletag|gtag|mixpanel|segment|hotjar/i
]) assert.doesNotMatch(js, forbidden, `elsewhere.js violates local-only boundary: ${forbidden}`);

assert.match(js, /document\.querySelectorAll\('\[data-artifact\]'\)/);
assert.doesNotMatch(js, /querySelector\('#misfile-button'\)|openRecord\(|closeAll\(|let cursor\s*=/, 'retired misfile cycler should not remain in enhanced runtime');
assert.match(js, /controls\.replaceChildren\(\)/, 'catalogue control slot should be replaced in place rather than gaining another permanent surface');
assert.match(js, /RETURN CART · EMPTY/, 'enhanced catalogue should begin with an empty return cart');
assert.match(js, /RETURN CART · AWAITING RESHELF/, 'a previously handled accession should receive a visible return-cart state');
assert.match(js, /returnCartRecord\s*=\s*currentRecord/, 'opening another accession should move the previous accession onto the single-slot cart');
assert.match(js, /returnCartRecord\.removeAttribute\('data-return-cart'\)/, 'the cart marker must migrate rather than accumulate across records');
assert.match(js, /returnCartRecord\.setAttribute\('data-return-cart', 'true'\)/, 'return cart consequence should be attached to an existing accession record');
assert.match(js, /let reshelvedRecord = null/, 'return-cart lifecycle should track exactly one latest reshelved accession in memory');
assert.match(js, /RESHELVED · RETURN COMPLETE/, 'a displaced cart occupant should leave visible reshelving aftermath');
assert.match(js, /markReshelved\(returnCartRecord\)/, 'displacing the cart should close the handling loop by reshelving its occupant');
assert.match(js, /if \(!openedFromCart\) markReshelved\(returnCartRecord\)/, 'opening the cart occupant directly must not falsely count as reshelving it');
assert.match(js, /reshelvedRecord\.removeAttribute\('data-reshelved'\)/, 'reshelving aftermath must migrate rather than accumulate into visit history');
assert.match(js, /record === reshelvedRecord/, 'handling a reshelved accession again should clear its completed-return mark');
assert.match(js, /returned to shelf; \$\{cartCode\} now waits/, 'return-cart status should narrate the completed reshelving handoff without a ledger');
assert.match(js, /record\.addEventListener\('toggle'/, 'native accession disclosure should drive handling consequence');
assert.match(js, /navigator\.serviceWorker\.register\('\.\/service-worker\.js'\)/);
assert.match(js, /prefers-reduced-motion: reduce/);
assert.match(js, /behavior: reducedMotion \? 'auto' : 'smooth'/, 'programmatic lift-state scrolling must respect reduced motion');

assert.match(js, /body:has\(\.freight-lift\.is-out-of-service\)\{--chalk:#f4e2b4;--muted:#c8ba8d;--line:rgba\(229,168,38,\.38\);background:/, 'lift outage should shift the whole service level into an emergency-light palette');
assert.match(js, /body:has\(\.freight-lift\.is-out-of-service\) \.corridor-plan\{box-shadow:inset 0 0 90px rgba\(229,168,38,\.12\)\}/, 'lift outage should visibly pool emergency light in the existing corridor plan');
assert.match(js, /@media\(prefers-contrast:more\)[\s\S]*?body:has\(\.freight-lift\.is-out-of-service\)\{--chalk:#fff;--muted:#fff;--line:currentColor;background:#000\}/, 'emergency-light atmosphere must remain legible in increased contrast');
assert.match(js, /@media\(forced-colors:active\)\{body:has\(\.freight-lift\.is-out-of-service\)\{forced-color-adjust:auto;background:Canvas;color:CanvasText\}\}/, 'emergency-light atmosphere must defer to forced colors');
assert.match(js, /@media print\{body:has\(\.freight-lift\.is-out-of-service\)\{--chalk:#000;--muted:#000;--line:#000;background:#fff;color:#000\}/, 'ephemeral emergency-light atmosphere must not masquerade as printed building state');

assert.match(js, /installAcclimationMaterialResponse/, 'acclimatization bay should deepen its existing fixed states instead of adding another control surface');
assert.match(js, /data-state="cold-dry"[\s\S]*FROSTED OUTER SHELL/, 'cold/dry arrival should visibly frost the authored outer shell');
assert.match(js, /data-state="warm-humid"[\s\S]*CONDENSATION ON OUTER SHELL/, 'warm/humid arrival should visibly condense on the authored outer shell');
assert.match(js, /data-state="matched"[\s\S]*OUTER SHELL CLEAR/, 'near-matched arrival should visibly settle the authored outer shell');
assert.match(js, /data-elsewhere-acclimation-material/, 'acclimatization material response should install exactly once');
assert.match(js, /forced-colors:active/, 'supplemental crate material cues must remain bounded in forced-colors mode');
assert.match(js, /@media\(prefers-reduced-motion:reduce\)\{\.acclimation-stage \.acclimation-shell\{transition:none\}\}/, 'crate material transition must be removed for reduced motion');
assert.match(js, /@media print\{\.acclimation-stage \.acclimation-shell/, 'crate material response must print as static content');

assert.match(js, /COLLECTIONS TRANSFER \/ HANDLING DESK/);
assert.match(js, /Every object gets a route\. No route resolves the object\./);
assert.match(js, /MOVEMENT COPY · LOCAL ONLY/);
assert.match(js, /Contradiction hold/);
assert.match(js, /updateTransferDesk\(record\)/, 'direct accession handling should update the transfer docket');
const handlingIds = [...js.matchAll(/'artifact-c0-(\d{3})': \{/g)].map((match) => match[1]);
assert.deepEqual(handlingIds, artifactIds, 'every fixed accession should have exactly one handling route');
assert.equal((js.match(/'artifact-c0-\d{3}': \{ zone: 'ZONE A · PAPER \/ FILM'/g) || []).length, 6);
assert.equal((js.match(/'artifact-c0-\d{3}': \{ zone: 'ZONE B · BUILDING FABRIC'/g) || []).length, 3);
assert.equal((js.match(/'artifact-c0-\d{3}': \{ zone: 'ZONE C · OPTICAL \/ UNASSIGNED'/g) || []).length, 3);
assert.match(js, /C0\.002 ticket · C0\.003 map · C0\.004 warranty · C0\.005 film · C0\.007 queue ticket · C0\.011 manual\./, 'Zone A board should account for all six paper/film routes');
assert.match(js, /C0\.008 object label · C0\.009 postcard · C0\.010 boxed shadow\./, 'Zone C board should use the same route order as the transfer desk');
assert.match(js, /catalogueRule\.after\(desk\)/, 'transfer desk should deepen the existing catalogue rather than create another top-level section');

for (const zone of ['A', 'B', 'C']) {
  assert.match(js, new RegExp(`data-storage-zone=\\"${zone}\\"`), `environment board should expose Zone ${zone} as a route destination`);
}
assert.match(js, /markActiveRoute\(route, code\)/, 'transfer updates should mark the matching conservation zone');
assert.match(js, /zone\.classList\.toggle\('is-active-route', active\)/, 'only the selected storage zone should receive the active movement state');
assert.match(js, /CATALOGUE 0 → ZONE \$\{route\.zoneId\} → CONTRADICTION HOLD/, 'the handling desk should expose a compact route trace');
assert.match(js, /href="#environment-board"/, 'the movement docket should route visitors to the existing environment board');
assert.match(js, /Trace \$\{code\} storage route to Zone \$\{route\.zoneId\}/, 'route trace should keep an accession-specific accessible name');
assert.match(js, /min-height:44px/, 'route trace must provide a touch-sized target');
assert.match(js, /\.transfer-trace:hover,\.transfer-trace:focus-visible/, 'route trace needs visible keyboard focus treatment');

for (const retired of [
  /COLLECTIONS RECONCILIATION \/ CYCLE COUNT/,
  /cycleCountSteps/,
  /data-cycle-next/,
  /cycleButton/,
  /EMERGENCY SALVAGE \/ FIRST RESPONSE CARD/,
  /BUILDING SERVICES \/ DEPENDENCY MAP/
]) assert.doesNotMatch(js, retired, `retired hidden operations appendix should not remain: ${retired}`);

for (const pattern of [
  /min-height:\s*44px/,
  /:focus-visible/,
  /@media \(max-width: 700px\)/,
  /@media \(prefers-reduced-motion: reduce\)/,
  /@media \(prefers-contrast: more\)/,
  /@media print/
]) assert.match(css, pattern, `elsewhere.css missing accessibility/responsive pattern ${pattern}`);
assert.doesNotMatch(css, /@import|@font-face|https?:\/\//i);
assert.match(teaser, /min-height:\s*44px/);
assert.match(teaser, /prefers-reduced-motion/);
assert.match(teaser, /prefers-contrast/);
assert.match(css, /\.service-header a \{[\s\S]*?min-height:\s*44px/, 'header return link needs an explicit touch target');
assert.match(css, /@media \(max-width: 700px\)[\s\S]*?\.access-copy h1 \{[^}]*font-size:/, 'mobile heading must be explicitly constrained');

assert.match(index, /href="elsewhere-teaser\.css"/);
assert.match(index, /FACILITIES NOTICE 05 \/ FLOOR PLAN DISAGREEMENT/);
assert.match(index, /href="elsewhere\.html"/);
assert.match(index, /OPEN SERVICE DOOR/);
assert.match(index, /<body data-recent-room="(?:commons|deep-space|almost-online|page-four|elsewhere|museum)">/, 'foyer condition should use one canonical public recent-room key');
assert.doesNotMatch(index, /gallery-card[^>]+href="elsewhere\.html"/i, 'fifth space should not become an ordinary gallery card');

for (const asset of ['./elsewhere.html', './elsewhere.css', './elsewhere.js', './elsewhere-teaser.css', './ELSEWHERE_CATALOGUE_ZERO.md']) {
  assert.ok(worker.includes(`'${asset}'`) || worker.includes(`"${asset}"`), `offline shell missing ${asset}`);
}
assert.match(worker, /museum-of-almost-v39-catalogue-zero/);
assert.doesNotMatch(worker, /https?:\/\//);

console.log('ELSEWHERE / CATALOGUE 0 is present as a fictional, local-only fifth space with twelve fixed records, a single-slot return cart, bounded reshelving aftermath, accession-linked handling, freight-lift emergency-light atmosphere, responsive acclimatization material cues, storage-route tracing, accessible routes, and offline shell coverage.');