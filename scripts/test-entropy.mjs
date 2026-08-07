import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { selectEntropy, rerollRecord, selectIndex } from './entropy-select.mjs';
import dimensions from './entropy-dimensions.json' with { type: 'json' };

const require = createRequire(import.meta.url);
const core = require('../entropy-core.js');

const execution2Seed = '18fe665945016bff2168f9c3ad6110e5c684dc9e8ef0983d9a300a8ac848782c';
assert.deepEqual(selectEntropy(execution2Seed), {
  A: 'a law of nature that exists only in the browser',
  B: 'obstacle',
  C: 'repair incorrectly',
  D: 'a timeline that can be touched',
  E: 'the interface develops seasons',
  F: 'remember exactly one visitor action',
  G: 'changing density',
  I: 'the system is more coherent when partially broken',
  J: 'a duplicate state with one unexplained difference',
  K: 'no images',
  H: ['misregistered print', 'botanical diagrams'],
  preservationBudget: 'Three'
});
const reroll2 = rerollRecord(execution2Seed);
assert.equal(reroll2.B.offset, 2);
assert.equal(dimensions.B[selectIndex(execution2Seed, 'B', dimensions.B.length, 0)], 'custodian of an unstable rule');
assert.equal(dimensions.B[selectIndex(execution2Seed, 'B', dimensions.B.length, 2)], 'obstacle');

const execution3Seed = 'eb11a896ddf843d260cb13fac4261168f632a18964cd96724f9650e4cd4cacf8';
assert.deepEqual(selectEntropy(execution3Seed), {
  A: 'a translation system for things that do not have language',
  B: 'accomplice',
  C: 'wait',
  D: 'one repeated structure whose meaning changes each time',
  E: 'actions become available only after their effects are visible',
  F: 'retain one contradiction between visits',
  G: 'rhythm',
  I: 'every successful action creates a new uncertainty',
  J: 'a tiny ecosystem unaware of the larger interface',
  K: 'the core interaction must work without precise pointing',
  H: ['woven fibres', 'temporary construction markings'],
  preservationBudget: 'Inversion'
});
assert.deepEqual(rerollRecord(execution3Seed), {});

const execution4Seed = '800cbe27a5b38bddb19ba0b4eb8a65dea8507e39afeeb06b77aa54043e5424b9';
assert.deepEqual(selectEntropy(execution4Seed), {
  A: 'an organism made from unfinished ideas',
  B: 'visitor mistaken by the system for something else',
  C: 'separate',
  D: 'several simultaneous realities sharing one interface',
  E: 'time advances only when the visitor does nothing',
  F: 'preserve state while changing its meaning',
  G: 'geometric transformation',
  I: 'silence creates more information than activity',
  J: 'a warning issued too late',
  K: 'no images',
  H: ['woven maps', 'translucent membranes'],
  preservationBudget: 'Three'
});
const reroll4 = rerollRecord(execution4Seed);
assert.equal(reroll4.C.offset, 1);
assert.equal(reroll4.K.offset, 1);
assert.equal(dimensions.C[selectIndex(execution4Seed, 'C', dimensions.C.length, 0)], 'wait');
assert.equal(dimensions.C[selectIndex(execution4Seed, 'C', dimensions.C.length, 1)], 'separate');
assert.equal(
  dimensions.K[selectIndex(execution4Seed, 'K', dimensions.K.length, 0)],
  'the core interaction must work without precise pointing'
);
assert.equal(dimensions.K[selectIndex(execution4Seed, 'K', dimensions.K.length, 1)], 'no images');

assert.equal(core.EXECUTION_SEED, execution4Seed);
assert.equal(core.STATE_KEY, 'museum-of-almost:entropy:v4');

const seed = 123456;
const empty = core.createState(seed);
assert.equal(empty.version, 4);
assert.equal(empty.installSeed, seed);
assert.equal(empty.visit, 0);
assert.deepEqual(empty.geometry, { spread: 0, axis: 0, fold: 0, generation: 0 });

const carried = core.createState(seed, { spread: 2, axis: 1, fold: 2, generation: 3 });
const beforeVisitMeanings = core.meaningsFor(carried);
const visited = core.advanceVisit(carried);
assert.deepEqual(visited.geometry, carried.geometry, 'visit must preserve geometry');
assert.equal(visited.visit, 1);
assert.notDeepEqual(core.meaningsFor(visited), beforeVisitMeanings, 'a preserved geometry must change meaning between visits');

const separated = core.separate(visited, 'south');
assert.equal(separated.geometry.generation, visited.geometry.generation, 'visitor activity must not advance time');
assert.equal(separated.geometry.axis, 2);
assert.equal(separated.geometry.spread, 3);
assert.deepEqual(core.meaningsFor(separated), core.meaningsFor(visited), 'separation alone must not reinterpret the realities');

let saturated = core.createState(seed, { spread: 4, axis: 0, fold: 0, generation: 2 });
saturated = core.separate(saturated, 'east');
assert.equal(saturated.geometry.spread, 4);
assert.notEqual(saturated.geometry.fold, 0, 'repeated separation at maximum spread must still change geometry');

const silent = core.advanceSilence(separated);
assert.equal(silent.state.geometry.generation, separated.geometry.generation + 1);
assert.equal(silent.state.geometry.spread, separated.geometry.spread - 1);
assert.notDeepEqual(core.meaningsFor(silent.state), core.meaningsFor(separated), 'silence must create new semantic information');
assert.match(silent.warning, /^Late warning:/);
assert.ok(silent.warningIndex >= 0 && silent.warningIndex < 3);

const geometry = core.geometryFor(silent.state);
assert.equal(geometry.length, 3);
assert.deepEqual([...geometry.map((item) => item.z)].sort(), [1, 2, 3]);
assert.ok(geometry.some((item) => item.x !== 0 || item.y !== 0));

const earlyNotes = core.notesFor(empty).filter((item) => item.visible).length;
const laterNotes = core.notesFor(core.createState(seed, { generation: 6 })).filter((item) => item.visible).length;
assert.ok(laterNotes > earlyNotes, 'silence-driven generations must reveal more information');

const sanitized = core.sanitizeState({
  version: 999,
  installSeed: seed,
  visit: 999999,
  geometry: { spread: 99, axis: -4, fold: 7, generation: 99999 },
  actionHistory: ['must disappear'],
  pointerPath: [[1, 2]],
  meaning: 'must not persist'
});
assert.equal(sanitized.version, 4);
assert.equal(sanitized.visit, 9999);
assert.deepEqual(sanitized.geometry, { spread: 4, axis: 0, fold: 2, generation: 999 });
assert.equal('actionHistory' in sanitized, false);
assert.equal('pointerPath' in sanitized, false);
assert.equal('meaning' in sanitized, false);

const migrated = core.migrateLegacy(
  JSON.stringify({ contradiction: { source: 'pressure', left: 'held', right: 'not held' } }),
  JSON.stringify({ offsets: [0.2], season: 3 }),
  JSON.stringify({ tensions: [0.5] }),
  JSON.stringify({ fragments: ['fictional'] }),
  JSON.stringify({ selectedIndex: 4 })
);
assert.equal(migrated.migrated, true);
assert.deepEqual(migrated.geometry, { spread: 1, axis: 0, fold: 0, generation: 0 });
assert.doesNotMatch(JSON.stringify(migrated), /contradiction|pressure|held|offset|season|tension|fragment|selectedIndex/i);

const noLegacy = core.migrateLegacy(null, null, null, null, null);
assert.equal(noLegacy.migrated, false);
assert.equal(noLegacy.geometry, null);

assert.match(core.memoryText(visited), /geometry is preserved/i);
assert.match(core.summaryText(visited), /Three realities currently read as/);
assert.doesNotMatch(JSON.stringify(silent.state), /timestamp|email|name|location|pointer|client[xy]/i);

console.log('Entropy history replay, v4 membrane geometry, silence-only time, and mutable meaning verified.');
