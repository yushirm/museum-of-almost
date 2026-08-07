import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../conservation-core.js', import.meta.url), 'utf8');
const sandbox = { globalThis: null, Date, Map, Math };
sandbox.globalThis = sandbox;
vm.runInNewContext(source, sandbox, { filename: 'conservation-core.js' });

const core = sandbox.MuseumConservationCore;
assert.ok(core, 'conservation core is exported');

const date = new Date(2026, 7, 6, 15, 30, 0);
const state = {
  seed: 123456,
  cycle: 2,
  completedCollections: 1,
  fragments: [
    { text: 'a window that kept the weather', source: 'Room 001' },
    { text: 'the hinge between two maybes', source: 'Room 002' }
  ]
};

const first = core.buildCase(date, state, 0);
const repeated = core.buildCase(date, state, 0);
const varied = core.buildCase(date, state, 1);

assert.deepEqual(first, repeated, 'the same date, state and variation produce the same case');
assert.equal(first.variation, 0, 'the first case records its bounded variation');
assert.equal(varied.variation, 1, 'another case records the next bounded variation');
assert.notEqual(first.seed, varied.seed, 'another case variation changes the deterministic seed');
assert.notDeepEqual(first.startPieces, varied.startPieces, 'another case variation changes the workbench arrangement');
assert.equal(first.startPieces.length, 3, 'a case begins with three fragments');
assert.equal(first.targetPieces.length, 3, 'a case has three target outlines');
assert.equal(new Set(first.startPieces.map((piece) => piece.id)).size, 3, 'fragment identifiers are unique');
assert.match(first.caseId, /^CASE 20260806-01$/, 'the case identifier uses only the local date and bounded variation');
assert.match(first.fragmentEcho, /window|hinge/, 'the case may echo a fictional catalogue fragment');

const initialAssessment = core.evaluateAssembly(first.startPieces, first.targetPieces);
assert.equal(initialAssessment.total, 3, 'the assembly evaluates three targets');
assert.equal(initialAssessment.complete, false, 'the scattered starting case is not complete');

let working = first.startPieces.map((piece) => core.copyPiece(piece));
working = working.map((piece, index) => core.snapPiece(piece, first.targetPieces[index]));
const completeAssessment = core.evaluateAssembly(working, first.targetPieces);
assert.equal(completeAssessment.aligned, 3, 'snapping aligns all three fragments');
assert.equal(completeAssessment.progress, 1, 'completed assembly reports full progress');
assert.equal(completeAssessment.complete, true, 'completed assembly is recognised');

const moved = core.movePiece(first.startPieces[0], 99, -99);
assert.equal(moved.x, 0.9, 'horizontal movement is clamped to the workbench');
assert.equal(moved.y, 0.14, 'vertical movement is clamped to the workbench');
assert.notEqual(moved, first.startPieces[0], 'movement returns a new piece object');

const rotated = core.rotatePiece({ ...first.startPieces[0], rotation: 350 }, 30);
assert.equal(rotated.rotation, 20, 'rotation wraps into a bounded angle');
assert.equal(core.angleDistance(355, 5), 10, 'angle distance crosses zero correctly');
assert.equal(core.isPieceAligned(working[0], first.targetPieces[0]), true, 'a snapped fragment is aligned');
assert.equal(core.isPieceAligned(working[0], first.targetPieces[1]), false, 'fragment identifiers prevent false alignment');

const normalized = core.normalizeState({
  seed: -1,
  cycle: -8,
  completedCollections: -3,
  fragments: Array.from({ length: 9 }, (_, index) => ({ text: ` fragment ${index} `.repeat(30), source: 'x'.repeat(180) }))
});
assert.equal(normalized.fragments.length, 6, 'catalogue input is bounded to six fictional fragments');
assert.equal(normalized.fragments[0].text.length, 180, 'fragment text is length-bounded');
assert.equal(normalized.fragments[0].source.length, 100, 'fragment source is length-bounded');
assert.equal(normalized.cycle, 0, 'negative cycle values are clamped');
assert.equal(normalized.completedCollections, 0, 'negative completed collection values are clamped');

console.log('Conservation Lab deterministic cases, movement bounds, alignment and completion tests passed.');
