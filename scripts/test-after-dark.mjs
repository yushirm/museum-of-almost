import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../after-dark-core.js', import.meta.url), 'utf8');
const sandbox = { globalThis: null, Date };
sandbox.globalThis = sandbox;
vm.runInNewContext(source, sandbox, { filename: 'after-dark-core.js' });

const core = sandbox.MuseumAfterDarkCore;
assert.ok(core, 'the After Dark core is exposed');

const state = {
  seed: 918273645,
  cycle: 2,
  completedCollections: 1,
  fragments: [
    { text: 'a door remembering the sea', source: 'The Gallery of Borrowed Weather' },
    { text: 'three minutes returned unopened', source: 'The Library of Missing Hours' },
    { text: 'a map folded around one quiet maybe', source: 'The Cartographer’s Apology' }
  ]
};
const history = Array.from({ length: 12 }, (_, index) => ({
  title: `The Test Room ${index + 1}`,
  room: `ROOM ${String(index + 1).padStart(3, '0')}`
}));
const day = new Date(2026, 7, 6, 12, 0, 0);

const first = core.buildExpansion(day, state, history);
const repeat = core.buildExpansion(day, state, history);
assert.deepEqual(JSON.parse(JSON.stringify(first)), JSON.parse(JSON.stringify(repeat)), 'the daily expansion is deterministic');

assert.equal(first.names.names.length, 9, 'the Cabinet contains nine names');
assert.equal(new Set(first.names.names.map((entry) => entry.title)).size, 9, 'all Cabinet names are unique');
assert.ok(first.names.names.every((entry) => entry.echo.includes('“')), 'names echo a fictional catalogue fragment');

assert.equal(first.weather.conditions.length, 4, 'Interior Weather contains four dayparts');
assert.deepEqual(
  Array.from(first.weather.conditions, (condition) => condition.time),
  ['MORNING', 'AFTERNOON', 'EVENING', 'BETWEEN HOURS'],
  'Interior Weather preserves the four intended dayparts'
);
assert.ok(first.weather.conditions.every((condition) => condition.chance >= 23 && condition.chance <= 89), 'weather chances remain bounded');

assert.equal(first.permissions.permissions.length, 7, 'the permission Cabinet contains seven permissions');
assert.ok(first.permissions.featuredIndex >= 0 && first.permissions.featuredIndex <= 6, 'the featured permission index is bounded');
assert.equal(new Set(first.permissions.permissions.map((entry) => entry.text)).size, 7, 'daily permissions are distinct');

assert.equal(first.postcards.postcards.length, 6, 'the postcard archive contains six cards');
assert.ok(first.postcards.postcards.every((card) => card.photo.startsWith('assets/dreaming-wing/')), 'postcards use local Museum photographs');
assert.deepEqual(
  Array.from(new Set(first.postcards.postcards.map((card) => card.photo))).sort(),
  [
    'assets/dreaming-wing/atrium.webp',
    'assets/dreaming-wing/clouds.webp',
    'assets/dreaming-wing/moon.webp'
  ],
  'all three local photographs appear in the archive'
);

assert.equal(first.corridor.length, 8, 'the remembered corridor is capped at eight rooms');
assert.equal(first.corridor[0].title, 'The Test Room 5', 'the corridor retains the most recent rooms');
assert.equal(first.corridor.at(-1).title, 'The Test Room 12', 'the newest room remains last');

const nextDay = core.buildExpansion(new Date(2026, 7, 7, 12, 0, 0), state, history);
assert.notEqual(first.dateKey, nextDay.dateKey, 'the expansion follows the local calendar date');
assert.notDeepEqual(
  JSON.parse(JSON.stringify(first.permissions)),
  JSON.parse(JSON.stringify(nextDay.permissions)),
  'the daily permission set changes with the date'
);

const emptyState = core.buildExpansion(day, {}, []);
assert.notDeepEqual(
  JSON.parse(JSON.stringify(first.names)),
  JSON.parse(JSON.stringify(emptyState.names)),
  'catalogue state influences generated names'
);
assert.ok(emptyState.weather.echo.includes('unoccupied shelf'), 'empty catalogues receive a fictional fallback');
assert.equal(emptyState.corridor.length, 0, 'an empty history produces an empty corridor');

const normalizedHistory = core.normalizeHistory([
  null,
  { title: '', room: 'ROOM 000' },
  { title: '  A Room  ', room: '  ROOM 001  ' },
  { title: 'x'.repeat(200), room: 'y'.repeat(200) },
  { title: '<img src=x onerror=alert(1)>The Room & Door', room: '<ROOM 009>' }
]);
assert.equal(normalizedHistory.length, 3, 'invalid history entries are removed');
assert.equal(normalizedHistory[0].title, 'A Room', 'history text is trimmed');
assert.equal(normalizedHistory[1].title.length, 120, 'history titles are length-bounded');
assert.equal(normalizedHistory[1].room.length, 80, 'history labels are length-bounded');
assert.doesNotMatch(normalizedHistory[2].title, /[&<>]/, 'history markup characters are removed');
assert.doesNotMatch(normalizedHistory[2].room, /[&<>]/, 'room label markup characters are removed');

const sanitizedState = core.normalizeState({
  fragments: [{ text: '<script>alert(1)</script>& maybe', source: '<gallery>' }]
});
assert.equal(sanitizedState.fragments.length, 1, 'sanitisation preserves a bounded fictional fragment');
assert.doesNotMatch(sanitizedState.fragments[0].text, /[&<>]/, 'fragment markup characters are removed');
assert.doesNotMatch(sanitizedState.fragments[0].source, /[&<>]/, 'fragment source markup characters are removed');

console.log('Museum After Dark deterministic generation, daily rollover, local-photo use, bounded memory and local-state sanitisation tests passed.');
