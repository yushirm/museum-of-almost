import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { selectEntropy, rerollRecord, selectIndex } from './entropy-select.mjs';
import dimensions from './entropy-dimensions.json' with { type: 'json' };

const require = createRequire(import.meta.url);
const core = require('../entropy-core.js');

const executionSeed = '18fe665945016bff2168f9c3ad6110e5c684dc9e8ef0983d9a300a8ac848782c';
const selected = selectEntropy(executionSeed);

assert.deepEqual(selected, {
  A: 'a law of nature that exists only in the browser',
  B: 'obstacle',
  C: 'repair incorrectly',
  D: 'a timeline that can be touched',
  E: 'the interface develops seasons',
  F: 'remember exactly one visitor action',
  G: 'changing density',
  H: ['misregistered print', 'botanical diagrams'],
  I: 'the system is more coherent when partially broken',
  J: 'a duplicate state with one unexplained difference',
  K: 'no images',
  preservationBudget: 'Three'
});

const reroll = rerollRecord(executionSeed);
assert.equal(reroll.B.offset, 2);
assert.equal(
  dimensions.B[selectIndex(executionSeed, 'B', dimensions.B.length, 0)],
  'custodian of an unstable rule'
);
assert.equal(
  dimensions.B[selectIndex(executionSeed, 'B', dimensions.B.length, 2)],
  'obstacle'
);

assert.equal(core.EXECUTION_SEED, executionSeed);
assert.equal(core.STATE_KEY, 'museum-of-almost:entropy:v2');
assert.equal(core.TERM_COUNT, 8);

const first = core.createState(12345, 0.06);
const second = core.createState(12345, 0.06);
assert.deepEqual(first, second);
assert.equal(first.offsets.length, 8);

const exact = core.sanitizeState({ ...first, offsets: Array(8).fill(0) }, 12345);
const partial = core.sanitizeState({ ...first, offsets: Array(8).fill(core.TARGET_ERROR) }, 12345);
assert.ok(core.coherence(partial) > core.coherence(exact));
assert.ok(core.density(partial) < core.density(exact));

const repaired = core.repairIncorrectly(first, 2);
assert.equal(repaired.state.actionCount, 1);
assert.equal(repaired.state.rememberedAction.slot, 2);
assert.equal(repaired.state.pending.length, 1);
assert.notEqual(repaired.state.offsets[2], first.offsets[2]);
assert.notEqual(repaired.state.offsets[3], first.offsets[3]);
assert.notEqual(repaired.state.offsets[2], 0);

let repeated = repaired.state;
repeated = core.repairIncorrectly(repeated, 5).state;
assert.equal(repeated.rememberedAction.slot, 5);
assert.equal(Object.hasOwn(repeated, 'actionHistory'), false);
assert.equal(Object.hasOwn(repeated, 'pointerPath'), false);

let four = core.createState(77, 0);
const startingSeason = four.season;
for (let index = 0; index < 4; index += 1) {
  four = core.repairIncorrectly(four, index).state;
}
assert.equal(four.season, (startingSeason + 1) % 4);

let idle = core.sanitizeState({ ...first, offsets: Array(8).fill(0.5) }, 12345);
const idleSeason = idle.season;
const beforeIdleMagnitude = idle.offsets.reduce((sum, value) => sum + Math.abs(value), 0);
idle = core.idleShift(idle).state;
idle = core.idleShift(idle).state;
idle = core.idleShift(idle).state;
const afterIdleMagnitude = idle.offsets.reduce((sum, value) => sum + Math.abs(value), 0);
assert.ok(afterIdleMagnitude < beforeIdleMagnitude);
assert.equal(idle.season, (idleSeason + 1) % 4);

let duplicateState = core.createState(9001, 0);
duplicateState = core.repairIncorrectly(duplicateState, 0).state;
duplicateState = core.repairIncorrectly(duplicateState, 1).state;
assert.equal(core.duplicateActive(duplicateState), true);
const difference = core.duplicateIndex(duplicateState);
const beforeDifference = [...duplicateState.offsets];
const duplicateRepair = core.repairIncorrectly(duplicateState, difference);
assert.equal(duplicateRepair.duplicate, true);
assert.notEqual(
  duplicateRepair.state.offsets[(difference + 2) % core.TERM_COUNT],
  beforeDifference[(difference + 2) % core.TERM_COUNT]
);

let consequenceState = core.createState(222, 0);
const produced = core.repairIncorrectly(consequenceState, 3);
const applied = core.applyConsequence(produced.state, produced.consequence);
assert.equal(applied.state.pending.length, 0);
assert.notEqual(
  applied.state.offsets[produced.consequence.target],
  produced.state.offsets[produced.consequence.target]
);

let fifth = core.createState(555, 0);
let fifthResult;
for (let index = 0; index < 5; index += 1) {
  fifthResult = core.repairIncorrectly(fifth, index % core.TERM_COUNT);
  fifth = fifthResult.state;
}
assert.equal(fifthResult.consequence.longDelay, true);

let seventh = core.createState(777, 0);
let seventhResult;
for (let index = 0; index < 7; index += 1) {
  seventhResult = core.repairIncorrectly(seventh, index % core.TERM_COUNT);
  seventh = seventhResult.state;
}
assert.equal(seventhResult.refuseImmediate, true);

const remembered = core.sanitizeState({
  ...core.createState(333, 0),
  offsets: Array(8).fill(0),
  rememberedAction: { slot: 2, delta: 0.2 },
  pending: []
}, 333);
const revisited = core.advanceVisit(remembered);
assert.ok(revisited.state.offsets[3] > 0);
assert.equal(revisited.state.rememberedAction.slot, 2);

const migrated = core.migrateLegacy(
  JSON.stringify({ tensions: [0.5, -0.2, 0.1, 0.3, -0.1, 0.2], memory: { kind: 2 } }),
  JSON.stringify({ fragments: ['fictional one', 'fictional two'] }),
  JSON.stringify({ selectedIndex: 4 })
);
assert.equal(migrated.migrated, true);
assert.ok(migrated.legacyBias >= -0.2 && migrated.legacyBias <= 0.2);

const memoryText = core.memoryText(repaired.state);
assert.match(memoryText, /remembers only the last repair/i);
assert.doesNotMatch(JSON.stringify(repaired.state), /timestamp|email|name|location|pointer/i);

console.log('Entropy execution 2 behavior verified.');
