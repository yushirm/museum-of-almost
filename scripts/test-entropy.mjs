import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { selectEntropy, rerollRecord, selectIndex } from './entropy-select.mjs';
import dimensions from './entropy-dimensions.json' with { type: 'json' };

const require = createRequire(import.meta.url);
const core = require('../entropy-core.js');

const execution1Seed = '3a69eb87180cbca48d2919a9d7e4722d0c54aaaac9e62855a03554f8c389c627';
assert.deepEqual(selectEntropy(execution1Seed), {
  A: 'an organism made from unfinished ideas',
  B: 'custodian of an unstable rule',
  C: 'contradict',
  D: 'one continuous surface',
  E: 'every action creates a delayed consequence',
  F: 'retain one accidental event selected by the seed',
  G: 'contrast between stillness and interruption',
  I: 'repetition produces difference',
  J: 'a pattern that appears to anticipate the visitor',
  K: 'no icons',
  H: ['wax seals', 'woven fibres'],
  preservationBudget: 'Two'
});
assert.deepEqual(rerollRecord(execution1Seed), {});

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

const execution5Seed = '679e472a1e31e8c20074426565d9ed6ccc2f5115266f731bc3acd03470b35c02';
assert.deepEqual(selectEntropy(execution5Seed), {
  A: 'an agreement between impossible forces',
  B: 'counterweight',
  C: 'suspend',
  D: 'a timeline that can be touched',
  E: 'one small event occurs only once per browser installation',
  F: 'preserve only what the visitor attempted to erase',
  G: 'scale',
  I: 'order can be created only by introducing one deliberate error',
  J: 'a measurement with no known unit',
  K: 'every state change must affect at least two visible elements',
  H: ['temporary construction markings', 'magnetic fields'],
  preservationBudget: 'One'
});
assert.deepEqual(rerollRecord(execution5Seed), {});

assert.equal(core.EXECUTION_SEED, execution5Seed);
assert.equal(core.STATE_KEY, 'museum-of-almost:entropy:v5');
assert.equal(core.RESONANCES.length, 4);

const seed = 123456;
const empty = core.createState(seed);
assert.deepEqual(empty, { version: 5, installSeed: seed, ghost: null });

const session0 = core.createSession(empty);
assert.ok(session0.cursor >= 0 && session0.cursor <= 1000);
assert.deepEqual(session0.suspensions, []);
assert.equal(session0.inversion, false);
assert.equal(core.treatyState(empty, session0), 'too-exact');
assert.match(core.statusText(empty, session0), /too perfectly/i);

const movedLeft = core.moveCursor(empty, session0, -5000);
const movedRight = core.moveCursor(empty, session0, 5000);
assert.equal(movedLeft.cursor, 0);
assert.equal(movedRight.cursor, 1000);

assert.equal(core.weightForDuration(0), 1);
assert.equal(core.weightForDuration(1250), 3);
assert.equal(core.weightForDuration(99999), 5);

const suspended1 = core.suspend(empty, session0, 700, 1250);
assert.equal(suspended1.suspensions.length, 1);
assert.deepEqual(suspended1.suspensions[0], { id: 1, position: 700, weight: 3 });
assert.equal(core.treatyState(empty, suspended1), 'holding');
assert.match(core.statusText(empty, suspended1), /One deliberate error/i);

const force1 = core.forceState(empty, suspended1);
assert.notEqual(force1.scaleA, force1.scaleB);
assert.ok(force1.fieldScale > 1);

const measure1 = core.measurementFor(empty, suspended1);
const measure1Again = core.measurementFor(empty, suspended1);
assert.deepEqual(measure1, measure1Again);
assert.ok(measure1.value >= 11 && measure1.value <= 97);
assert.ok(core.UNKNOWN_UNITS.includes(measure1.unit));

const echoed = core.echoLatest(empty, suspended1);
assert.deepEqual(echoed.echoed, { id: 2, position: 300, weight: 3 });
assert.equal(echoed.session.suspensions.length, 2);
assert.equal(core.treatyState(empty, echoed.session), 'overwritten');
const echoedSpans = core.spanState(empty, echoed.session);
assert.deepEqual(echoedSpans, [{
  from: 300,
  to: 700,
  distance: 400,
  weightDelta: 0,
  resonance: 'balanced interval'
}]);
assert.deepEqual(core.ledgerFor(empty, echoed.session), {
  count: 2,
  totalWeight: 6,
  averagePosition: 500,
  spread: 400,
  resonance: 'balanced interval'
});

const intensified = core.adjustLatestWeight(empty, echoed.session, 1);
assert.equal(intensified.changed.weight, 4);
assert.equal(intensified.session.suspensions.at(-1).weight, 4);
const softened = core.adjustLatestWeight(empty, intensified.session, -10);
assert.equal(softened.changed.weight, 1, 'weight editing must stay bounded');

const undone = core.undoLatest(empty, echoed.session);
assert.deepEqual(undone.removed, echoed.echoed);
assert.deepEqual(undone.session.suspensions, suspended1.suspensions);
assert.equal(undone.session.sequence, echoed.session.sequence, 'undo must not reuse sequence ids');
assert.equal(core.undoLatest(empty, session0).removed, null);
assert.equal(core.echoLatest(empty, session0).echoed, null);

assert.equal(core.resonanceForDistance(30), 'near lock');
assert.equal(core.resonanceForDistance(200), 'close drift');
assert.equal(core.resonanceForDistance(450), 'balanced interval');
assert.equal(core.resonanceForDistance(800), 'wide accord');

const postcard = core.postcardData(empty, echoed.session);
assert.equal(postcard.count, 2);
assert.equal(postcard.totalWeight, 6);
assert.equal(postcard.resonance, 'balanced interval');
assert.equal(postcard.order, 'overwritten');
assert.equal(postcard.ghost, false);
assert.match(postcard.code, /^[0-9A-Z]{7}$/);
assert.equal(
  core.sessionCodeFor(empty, echoed.session),
  core.sessionCodeFor(core.createState(987654), echoed.session),
  'shareable postcard code must not encode the installation seed'
);

const suspended2 = core.suspend(empty, suspended1, 260, 300);
assert.equal(suspended2.suspensions.length, 2);
assert.equal(core.treatyState(empty, suspended2), 'overwritten');
assert.match(core.statusText(empty, suspended2), /Too many errors/i);
assert.notDeepEqual(core.measurementFor(empty, suspended2), measure1);

const erasedFirst = core.attemptErase(empty, suspended2);
assert.equal(erasedFirst.firstEvent, true);
assert.deepEqual(erasedFirst.erased, { id: 2, position: 260, weight: 1 });
assert.deepEqual(erasedFirst.state, {
  version: 5,
  installSeed: seed,
  ghost: { position: 260, weight: 1 }
});
assert.equal(erasedFirst.session.suspensions.length, 1);
assert.equal(erasedFirst.session.inversion, true);
assert.equal(core.treatyState(erasedFirst.state, erasedFirst.session), 'holding');
assert.match(core.memoryText(erasedFirst.state), /last attempted erasure/i);

const beforeInversion = core.timelinePositions(empty, suspended2, 0.2);
const afterInversion = core.timelinePositions(erasedFirst.state, erasedFirst.session, 0.2);
assert.equal(beforeInversion.a, afterInversion.b);
assert.equal(beforeInversion.b, afterInversion.a);

const erasedAgain = core.attemptErase(erasedFirst.state, erasedFirst.session);
assert.equal(erasedAgain.firstEvent, false, 'one-time event must not repeat after a ghost exists');
assert.deepEqual(erasedAgain.state.ghost, { position: 700, weight: 3 });
assert.equal(erasedAgain.session.suspensions.length, 0);
assert.equal(erasedAgain.session.inversion, true);

let capped = core.createSession(empty);
for (let index = 0; index < 10; index += 1) {
  capped = core.suspend(empty, capped, index * 100, 200 + index * 100);
}
assert.equal(capped.suspensions.length, core.MAX_SUSPENSIONS);
assert.equal(capped.sequence, 10);
assert.ok(core.spanState(empty, capped).length <= core.MAX_SUSPENSIONS - 1);

const sanitizedSession = core.sanitizeSession({
  cursor: 9999,
  suspensions: [{ id: 0, position: -5, weight: 99, note: 'discard me' }],
  inversion: 'yes',
  sequence: 99999,
  journal: ['discard me'],
  postcard: 'discard me'
}, empty);
assert.equal(sanitizedSession.cursor, 1000);
assert.deepEqual(sanitizedSession.suspensions, [{ id: 1, position: 0, weight: 5 }]);
assert.equal(sanitizedSession.inversion, true);
assert.equal(sanitizedSession.sequence, 9999);
assert.equal('journal' in sanitizedSession, false);
assert.equal('postcard' in sanitizedSession, false);

const sanitized = core.sanitizeState({
  version: 999,
  installSeed: seed,
  ghost: { position: 9000, weight: 99, label: 'must disappear' },
  visit: 88,
  geometry: { spread: 4 },
  actionHistory: ['must disappear'],
  pointerPath: [[1, 2]],
  duration: 9000,
  timestamp: 123,
  ledger: { count: 9 },
  journal: ['must disappear']
});
assert.deepEqual(sanitized, {
  version: 5,
  installSeed: seed,
  ghost: { position: 1000, weight: 5 }
});

const migrated = core.migrateLegacy(
  JSON.stringify({ installSeed: 7654321, geometry: { spread: 4 }, visit: 9 }),
  JSON.stringify({ contradiction: { left: 'held' } }),
  JSON.stringify({ offsets: [0.2], season: 3 })
);
assert.equal(migrated.migrated, true);
assert.equal(migrated.installSeed, 7654321);
assert.doesNotMatch(JSON.stringify(migrated), /geometry|visit|contradiction|held|offset|season/i);

const damagedLegacy = core.migrateLegacy('{broken', null, null);
assert.equal(damagedLegacy.migrated, true);
assert.equal(damagedLegacy.installSeed, null);

const noLegacy = core.migrateLegacy(null, null, null, null);
assert.deepEqual(noLegacy, { migrated: false, installSeed: null });

const persisted = JSON.stringify(erasedFirst.state);
assert.doesNotMatch(persisted, /timestamp|email|name|location|pointer|client[xy]|duration|history|visit|geometry|ledger|journal|postcard/i);
assert.match(core.memoryText(empty), /Nothing attempted to erase/i);

console.log('Entropy replay plus constructive treaty spans, ledger, echo, undo, postcard data, and erasure-only memory verified.');
