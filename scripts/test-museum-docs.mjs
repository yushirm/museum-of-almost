import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (name) => fs.readFileSync(new URL(`../${name}`, import.meta.url), 'utf8');
const index = read('index.html');
const readme = read('README.md');
const privacy = read('PRIVACY.md');

const expectedGalleries = [
  ['commons-now.html', 'COMMONS / NOW'],
  ['deep-space.html', 'DEEP SPACE / ALMOST'],
  ['almost-online.html', 'ALMOST ONLINE!'],
  ['page-four.html', 'PAGE FOUR']
];

const galleryHrefs = [...index.matchAll(/<a class="gallery-card[^"]*" href="([^"]+)"/g)].map((match) => match[1]);
assert.deepEqual(galleryHrefs, expectedGalleries.map(([href]) => href), 'README contract assumes exactly the four public gallery cards shown by the entrance');

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

assert.match(readme, /five current requests across four public scientific services/i);
assert.match(privacy, /Only \*\*COMMONS \/ NOW\*\* makes live public-data requests/i);
assert.match(privacy, /five direct HTTP requests across four public services/i);
assert.match(privacy, /The entrance and the four non-COMMONS destinations use same-origin static assets and local browser computation only/i);

for (const phrase of [
  'dependency-free',
  'GitHub Pages',
  'no analytics',
  'no visitor accounts',
  'same-origin service worker',
  'cross-origin COMMONS scientific responses are excluded from service-worker caching'
]) assert.match(readme, new RegExp(phrase, 'i'), `README missing durable product boundary: ${phrase}`);

for (const phrase of [
  'does not create visitor accounts, profiles, histories, scores, identifiers, or personalized views',
  'does not ask for a visitor name, email address, account, location, story, upload, comment, or free-text input',
  'PAGE FOUR',
  'CATALOGUE 0',
  'explicitly fictional'
]) assert.match(`${readme}\n${privacy}`, new RegExp(phrase, 'i'), `durable docs missing privacy/fiction boundary: ${phrase}`);

console.log('Museum durable docs match the live entrance hierarchy, active routes, privacy boundary, and COMMONS-only live-data contract.');
