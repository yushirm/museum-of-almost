import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (name) => fs.readFileSync(new URL(`../${name}`, import.meta.url), 'utf8');
const index = read('index.html');
const foyerTeaser = read('elsewhere-teaser.css');
const readme = read('README.md');
const privacy = read('PRIVACY.md');
const notFound = read('404.html');

const expectedGalleries = [
  ['commons-now.html', 'COMMONS / NOW'],
  ['deep-space.html', 'DEEP SPACE / ALMOST'],
  ['almost-online.html', 'ALMOST ONLINE!'],
  ['page-four.html', 'PAGE FOUR']
];

const galleryHrefs = [...index.matchAll(/<a class="gallery-card[^"]*" href="([^"]+)"/g)].map((match) => match[1]);
assert.deepEqual(galleryHrefs, expectedGalleries.map(([href]) => href), 'durable docs assume exactly the four public gallery cards shown by the entrance');

const recentRoomSignal = index.match(/<body data-recent-room="([^"]+)">/);
assert.ok(recentRoomSignal, 'entrance must retain one public recent-room signal');
assert.ok(
  ['commons', 'deep-space', 'almost-online', 'page-four', 'elsewhere', 'museum'].includes(recentRoomSignal[1]),
  'recent-room signal must stay within the six canonical public values'
);
assert.match(index, /AFTER-HOURS LIGHT/, 'foyer should expose the current after-hours condition to assistive technology');
assert.doesNotMatch(index, /REGISTRATION DRIFT/, 'retired registration-drift wording must not survive the after-hours-light epoch');
assert.doesNotMatch(index, /inset-block-start:\s*-4px|inset-inline-start:\s*4px/, 'retired floor-plan displacement must not survive the after-hours-light epoch');
for (const [key, card] of [
  ['commons', 'gallery-commons'],
  ['deep-space', 'gallery-space'],
  ['almost-online', 'gallery-web'],
  ['page-four', 'gallery-four']
]) {
  assert.ok(index.includes(`body[data-recent-room="${key}"] .${card} .gallery-visual`), `${key} recent-room signal should light its existing entrance preview`);
  assert.ok(index.includes(`body[data-recent-room="museum"] .${card} .gallery-visual`), `museum epoch should light the existing ${key} entrance preview`);
  assert.ok(
    foyerTeaser.includes(`body[data-recent-room="${key}"] .gallery-card:not(.${card}) .gallery-visual`),
    `${key} after-hours state should quiet the other existing preview windows`
  );
}
assert.ok(index.includes('body[data-recent-room="elsewhere"] .maintenance-seam'), 'ELSEWHERE recent-room signal should light the existing service seam');
assert.ok(index.includes('body[data-recent-room="museum"] .maintenance-seam'), 'museum epoch should include the existing service seam in the after-hours condition');
assert.ok(foyerTeaser.includes('body[data-recent-room="elsewhere"] .gallery-card .gallery-visual'), 'ELSEWHERE after-hours state should quiet all four public gallery previews while the service seam stays awake');
assert.match(foyerTeaser, /filter:\s*brightness\(0\.72\)\s+saturate\(0\.78\)/, 'house-light quiet should use one bounded visual treatment');
assert.doesNotMatch(foyerTeaser, /body\[data-recent-room="museum"\][\s\S]{0,120}brightness\(0\.72\)/, 'Museum-wide epoch state should not falsely single out a quiet gallery');
assert.match(foyerTeaser, /prefers-contrast:\s*more[\s\S]*forced-colors:\s*active[\s\S]*filter:\s*none/, 'house-light quiet should yield to contrast modes');
assert.match(foyerTeaser, /@media print[\s\S]*body\[data-recent-room\] \.gallery-card \.gallery-visual[\s\S]*filter:\s*none !important/, 'printed entrance must not carry the house-light quiet treatment');
assert.match(index, /@media \(forced-colors: active\)[\s\S]*outline:\s*2px solid Highlight/, 'after-hours condition needs a forced-colors fallback');
assert.match(index, /@media print[\s\S]*body\[data-recent-room\] \.gallery-visual[\s\S]*filter:\s*none !important/, 'printed entrance must not carry the after-hours glow');

for (const [href, name] of expectedGalleries) {
  assert.ok(readme.includes(`\`${href}\``), `README missing active route ${href}`);
  assert.ok(readme.includes(`**${name}**`), `README missing active space ${name}`);
  assert.ok(privacy.includes(`**${name}**`), `PRIVACY missing active space ${name}`);
}

const serviceDoor = index.match(/<aside class="maintenance-seam"[\s\S]*?<a href="([^"]+)"/);
assert.ok(serviceDoor, 'entrance must expose the facilities seam');
assert.equal(serviceDoor[1], 'elsewhere.html');
assert.ok(readme.includes('`elsewhere.html`'), 'README missing Catalogue 0 route');
assert.ok(readme.includes('**ELSEWHERE / CATALOGUE 0**'), 'README missing fifth-space identity');
assert.ok(privacy.includes('**ELSEWHERE / CATALOGUE 0**'), 'PRIVACY missing fifth-space boundary');

assert.match(readme, /four public galleries/i);
assert.match(readme, /FACILITIES NOTICE 05 \/ FLOOR PLAN DISAGREEMENT/);
assert.match(readme, /outside the four-card gallery grid/i);
assert.doesNotMatch(readme, /^# The Museum of Almost — COMMONS \/ NOW/m, 'README must describe the Museum, not one gallery as the whole product');
assert.doesNotMatch(readme, /Historical design records remain in the repository as history only/, 'active multi-space runtime must not be mislabeled as historical residue');

assert.match(readme, /`404\.html` is \*\*THE UNBUILT ROOM\*\*/);
assert.match(readme, /missing-route recovery surface rather than another gallery, puzzle route, or accession/i);
assert.match(readme, /does not display or persist the requested path/i);
assert.match(readme, /unknown same-origin navigation falls back to the cached Unbuilt Room/i);
assert.match(notFound, /ERROR 404 · ACCESSION NOT FOUND/);
assert.doesNotMatch(index, /href="404\.html"/, 'the Unbuilt Room must not become an entrance destination');

assert.match(readme, /five current requests across four public scientific services/i);
assert.match(privacy, /Only \*\*COMMONS \/ NOW\*\* makes live public-data requests/i);
assert.match(privacy, /five direct HTTP requests across four public services/i);
assert.match(privacy, /The entrance and the four non-COMMONS destinations use same-origin static assets and local browser computation only/i);

assert.match(readme, /PAGE FOUR[\s\S]*fictional[\s\S]*Dead Drop[\s\S]*Evidence Lattice[\s\S]*Hessdalen Instrument Room/i);
assert.match(readme, /real-source material/i);
assert.match(privacy, /PAGE FOUR[\s\S]*fictional archive[\s\S]*real-source research and instrument layers/i);
assert.match(privacy, /External source URLs live in repository documentation, not visitor runtime code/i);
assert.match(readme, /ELSEWHERE \/ CATALOGUE 0[\s\S]*explicitly fictional/i);

for (const phrase of [
  'dependency-free',
  'GitHub Pages',
  'no visitor accounts',
  'no analytics',
  'same-origin service worker',
  'cross-origin COMMONS scientific responses are excluded from service-worker caching',
  'PAGE_FOUR_INSTRUMENT_ROOM.md',
  'PAGE_FOUR_HESSDALEN.md',
  'PAGE_FOUR_DEAD_DROP.md',
  'UNBUILT_ROOM.md'
]) assert.match(readme, new RegExp(phrase, 'i'), `README missing durable product boundary or record: ${phrase}`);

for (const phrase of [
  'does not create visitor accounts, profiles, histories, scores, identifiers, or personalized views',
  'does not ask for a visitor name, email address, account, location, story, upload, comment, or free-text input',
  'CATALOGUE 0',
  'explicitly fictional'
]) assert.match(`${readme}\n${privacy}`, new RegExp(phrase, 'i'), `durable docs missing privacy/fiction boundary: ${phrase}`);

console.log('Museum durable docs match the live entrance hierarchy, relational after-hours house-light condition, Unbuilt Room recovery boundary, active routes, layered Page Four evidence model, privacy boundary, and COMMONS-only live-data contract.');
