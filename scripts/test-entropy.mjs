import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { selectEntropy } from './entropy-select.mjs';

const require = createRequire(import.meta.url);
const core = require('../entropy-core.js');
const seed = core.EXECUTION_SEED;

const expected = {
  A: 'an organism made from unfinished ideas',
  B: 'custodian of an unstable rule',
  C: 'contradict',
  D: 'one continuous surface',
  E: 'every action creates a delayed consequence',
  F: 'retain one accidental event selected by the seed',
  G: 'contrast between stillness and interruption',
  H: ['wax seals', 'woven fibres'],
  I: 'repetition produces difference',
  J: 'a pattern that appears to anticipate the visitor',
  K: 'no icons',
  preservationBudget: 'Two'
};

assert.deepEqual(selectEntropy(seed), expected, 'the recorded seed must replay the recorded selections');
assert.deepEqual(selectEntropy(seed), selectEntropy(seed), 'selection replay must be stable');

const knotsA = core.buildKnots(123456789, [0, 1, 0, 2, 0, 0]);
const knotsB = core.buildKnots(123456789, [0, 1, 0, 2, 0, 0]);
assert.deepEqual(knotsA, knotsB, 'procedural knots must replay from the same local seed');
assert.equal(new Set(knotsA.map((knot) => knot.basePhrase)).size, core.KNOT_COUNT, 'knot phrases must be unique');

let state = core.createState(123456789, 0.5);
assert.equal(state.tensions.length, core.KNOT_COUNT);
assert.equal(state.pendingReturn.length, 0);
assert.equal(state.legacyPressure, 0.5);

const beforeFirst = state.tensions[0];
const first = core.contradict(state, 0);
state = first.state;
const firstDelta = state.tensions[0] - beforeFirst;
assert.equal(state.pendingReturn.length, 1, 'every action must create a delayed consequence');
assert.notEqual(firstDelta, 0, 'a contradiction must alter the selected knot');
assert.notEqual(state.tensions[1], core.createState(123456789, 0.5).tensions[1], 'a contradiction must affect a related knot');

const beforeSecond = state.tensions[0];
const second = core.contradict(state, 0);
const secondDelta = second.state.tensions[0] - beforeSecond;
assert.notEqual(Math.sign(firstDelta), Math.sign(secondDelta), 'repetition must produce a different direction of pressure');
state = second.state;

const targetBefore = state.tensions[second.consequence.target];
const applied = core.applyConsequence(state, second.consequence);
assert.notEqual(applied.state.tensions[second.consequence.target], targetBefore, 'delayed consequence must alter its target');
assert.equal(applied.state.pendingReturn.some((item) => item.id === second.consequence.id), false, 'applied consequences must be removed');

let returnState = core.createState(55, 0);
returnState = core.contradict(returnState, 2).state;
const pendingBeforeVisit = returnState.pendingReturn.length;
const returned = core.advanceVisit(returnState);
assert.equal(returned.returnedConsequences, pendingBeforeVisit, 'return visits must apply pending consequences');
assert.equal(returned.state.pendingReturn.length, 0, 'return visit must consume applied consequences');
assert.equal(returned.state.visits, 1);

let memoryState = core.createState(987654321, 0);
for (let index = 0; index < 12 && !memoryState.memory; index += 1) {
  memoryState = core.contradict(memoryState, index % core.KNOT_COUNT).state;
}
assert.ok(memoryState.memory, 'the seeded accidental event must eventually occur');
assert.equal(memoryState.memory.kind, core.accidentalKind(), 'the retained accident type must be selected by the execution seed');
assert.match(core.memoryText(memoryState), /^The organism retains /);

const idleBefore = memoryState.tensions.slice();
const idle = core.idleShift(memoryState);
assert.equal(idle.state.idleCycles, memoryState.idleCycles + 1);
assert.notDeepEqual(idle.state.tensions, idleBefore, 'inactivity must change the system');

const migration = core.migrateLegacy(
  JSON.stringify({ fragments: ['fictional one', 'fictional two'], completedCollections: 3, roomIndex: 8 }),
  JSON.stringify({ sealedIndex: 2 })
);
assert.equal(migration.migrated, true);
assert.ok(migration.legacyPressure > 0 && migration.legacyPressure <= 1);

const sanitized = core.sanitizeState({
  installSeed: 7,
  tensions: [99, -99],
  pendingReturn: Array.from({ length: 10 }, (_, index) => ({ id: String(index), target: index, delta: 99 }))
});
assert.equal(sanitized.tensions.length, core.KNOT_COUNT);
assert.ok(sanitized.tensions.every((value) => value >= -1 && value <= 1));
assert.equal(sanitized.pendingReturn.length, core.MAX_PENDING);

process.stdout.write('Entropy behavior checks passed.\n');
