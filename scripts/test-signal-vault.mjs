import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../signal-vault-core.js', import.meta.url), 'utf8');
assert.doesNotMatch(
  source,
  /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i,
  'source seed identifiers are not retained'
);

const sandbox = { globalThis: null };
sandbox.globalThis = sandbox;
vm.runInNewContext(source, sandbox, { filename: 'signal-vault-core.js' });

const core = sandbox.MuseumSignalVaultCore;
assert.ok(core, 'the signal core is exposed to the local controller');
assert.equal(core.SIGNAL_ENTROPY.length, 10, 'exactly ten anonymous entropy values shape the room');
assert.ok(core.SIGNAL_ENTROPY.every(Number.isInteger), 'only numeric entropy is retained');

const first = core.buildSignals();
const repeated = core.buildSignals();
assert.equal(first.length, 10, 'the Listening Room contains ten signals');
assert.deepEqual(first, repeated, 'signal generation is deterministic');
assert.equal(new Set(first.map((signal) => signal.designation)).size, 10, 'signal designations are unique');

for (const signal of first) {
  assert.ok(signal.x >= 0 && signal.x <= 100, `${signal.designation} stays inside the map horizontally`);
  assert.ok(signal.y >= 0 && signal.y <= 100, `${signal.designation} stays inside the map vertically`);
  assert.match(signal.distance, /^\d+\.\d almost-light-years$/, 'distance remains fictional and formatted');
  for (const field of ['title', 'origin', 'transmission', 'interpretation', 'tone']) {
    assert.equal(typeof signal[field], 'string', `${signal.designation} has a ${field}`);
    assert.ok(signal[field].length > 8, `${signal.designation} has meaningful ${field} copy`);
  }
}

const emptyState = JSON.parse(JSON.stringify(core.normalizeState(null)));
assert.deepEqual(
  emptyState,
  { seed: 0, cycle: 0, completedCollections: 0, fragments: [] },
  'invalid storage resolves to a safe empty museum state'
);

const localState = {
  seed: 424242,
  cycle: 2,
  completedCollections: 1,
  fragments: [
    { text: 'a patient spark', source: 'The Lantern' },
    { text: 'the hinge of an invisible door', source: 'The Key' },
    { text: 'weather from an indoor sky', source: 'The Umbrella' }
  ]
};
const normalized = core.normalizeState(localState);
const echo = core.echoForSignal(first[0], normalized);
assert.ok(
  normalized.fragments.some((fragment) => echo.includes(fragment.text)),
  'a received signal can echo one of the visitor’s local fictional fragments'
);
assert.equal(
  core.echoForSignal(first[0], normalized),
  echo,
  'the same signal and local state produce the same echo'
);
assert.notEqual(
  core.echoForSignal(first[0], { ...localState, cycle: 3 }),
  echo,
  'a new collection cycle can retune the local echo'
);
assert.match(core.roomNote(normalized), /1 completed collection/, 'completed collections affect the receiver note');
assert.match(core.roomNote({ fragments: localState.fragments }), /3 kept fragments/, 'kept fragments affect the receiver note');
assert.match(core.roomNote({}), /empty catalogue/, 'an empty state remains welcoming');

console.log('Listening Room entropy privacy, deterministic generation, bounds and local-fragment echo tests passed.');
