import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../tomorrow-room-core.js', import.meta.url), 'utf8');
const sandbox = { globalThis: null };
sandbox.globalThis = sandbox;
vm.runInNewContext(source, sandbox, { filename: 'tomorrow-room-core.js' });

const core = sandbox.MuseumTomorrowCore;
assert.ok(core, 'the Almost Tomorrow core is exported');

const state = {
  seed: 184201,
  cycle: 2,
  completedCollections: 1,
  fragments: [
    { text: 'a hinge that remembers rain', source: 'The Borrowed Door' },
    { text: 'three minutes of indoor weather', source: 'The Clock Orchard' },
    { text: 'a map of the room after it leaves', source: 'The Patient Gallery' }
  ]
};
const originalState = JSON.stringify(state);

const observedAt = '2026-08-06T12:00:00';
const first = core.buildTomorrows(observedAt, state);
const repeated = core.buildTomorrows(observedAt, state);

assert.equal(first.targetKey, '2026-08-07', 'the observatory focuses on the next local date');
assert.equal(first.tomorrows.length, 7, 'the observatory offers exactly seven possible tomorrows');
assert.equal(
  JSON.stringify(first),
  JSON.stringify(repeated),
  'the same date and local museum state produce the same futures'
);
assert.equal(JSON.stringify(state), originalState, 'observing tomorrow does not mutate the stored museum state');
assert.ok(Object.isFrozen(first), 'the observatory result is immutable');
assert.ok(Object.isFrozen(first.tomorrows), 'the future collection is immutable');
assert.ok(first.tomorrows.every((tomorrow) => Object.isFrozen(tomorrow)), 'each future is immutable');
assert.equal(new Set(first.tomorrows.map((tomorrow) => tomorrow.designation)).size, 7, 'future designations are unique');
assert.equal(new Set(first.tomorrows.map((tomorrow) => tomorrow.title)).size, 7, 'future titles are unique');

for (const [index, tomorrow] of first.tomorrows.entries()) {
  assert.equal(tomorrow.index, index, 'future indices remain stable');
  assert.match(tomorrow.designation, /^TOMORROW 0[1-7]$/, 'future designations stay bounded');
  assert.equal(tomorrow.targetKey, first.targetKey, 'all alternatives describe the same tomorrow');
  assert.ok(tomorrow.title.startsWith('The '), 'each future has a Museum title');
  assert.ok(tomorrow.forecast.length > 20, 'each future has a forecast');
  assert.ok(tomorrow.fragmentEcho.includes('already waiting there'), 'each future includes a local catalogue echo');
  assert.ok(tomorrow.angle >= -100 && tomorrow.angle <= 280, 'orrery angles remain usable');
  assert.ok(tomorrow.radius >= 31 && tomorrow.radius <= 39, 'orrery radii remain bounded');
  assert.equal(tomorrow.palette.length, 3, 'each future has a three-colour postcard palette');
}

const nextDay = core.buildTomorrows('2026-08-07T12:00:00', state);
assert.equal(nextDay.targetKey, '2026-08-08', 'the observatory advances after the local date changes');
assert.notEqual(JSON.stringify(nextDay.tomorrows), JSON.stringify(first.tomorrows), 'a new date produces a new sky');

const yearBoundary = core.buildTomorrows('2026-12-31T23:59:59', state);
assert.equal(yearBoundary.targetKey, '2027-01-01', 'the local calendar rolls into a new year correctly');

const changedState = core.buildTomorrows(observedAt, {
  ...state,
  fragments: [...state.fragments, { text: 'a window facing the unfinished side', source: 'The Quiet Annex' }]
});
assert.notEqual(
  JSON.stringify(changedState.tomorrows),
  JSON.stringify(first.tomorrows),
  'local catalogue changes refocus the possible tomorrows'
);

const normalized = core.normalizeState({
  seed: -1,
  cycle: 1.9,
  completedCollections: 2.7,
  fragments: Array.from({ length: 9 }, (_, index) => ({ text: ` fragment ${index} ` }))
});
assert.equal(normalized.seed, 0xffffffff, 'the local seed is normalized to an unsigned integer');
assert.equal(normalized.cycle, 1, 'the collection cycle is normalized to an integer');
assert.equal(normalized.completedCollections, 2, 'completed collections are normalized to an integer');
assert.equal(normalized.fragments.length, 6, 'catalogue influence remains bounded to six fragments');
assert.equal(normalized.fragments[0].text, 'fragment 0', 'fragment labels are trimmed');

const malformed = core.normalizeState({
  fragments: [
    null,
    {},
    { text: '' },
    { text: '   ' },
    { text: 42 },
    { text: ' a valid fragment ', source: 17 }
  ]
});
assert.equal(malformed.fragments.length, 1, 'malformed local catalogue entries are ignored');
assert.equal(malformed.fragments[0].text, 'a valid fragment', 'valid recovered fragment text is trimmed');
assert.equal(malformed.fragments[0].source, '', 'non-text fragment sources are discarded');

const empty = core.buildTomorrows(observedAt, {});
assert.equal(empty.tomorrows.length, 7, 'an empty catalogue can still observe tomorrow');
assert.ok(
  empty.tomorrows.every((tomorrow) => tomorrow.fragmentEcho.includes('empty pocket')),
  'empty-catalogue futures remain fictional and local'
);
assert.match(core.observatoryNote(state), /finished collection/, 'completed collections affect the room note');
assert.match(core.observatoryNote({}), /empty catalogue/, 'empty state has an explicit local-only note');

console.log('Almost Tomorrow deterministic generation, calendar rollover, immutability and catalogue-boundary tests passed.');
