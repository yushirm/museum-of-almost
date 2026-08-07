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
const reroll = rerollRecord(execution2Seed);
assert.equal(reroll.B.offset, 2);
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
assert.equal(core.EXECUTION_SEED, execution3Seed);
assert.equal(core.STATE_KEY, 'museum-of-almost:entropy:v3');

const seed = 123456;
const empty = core.createState(seed);
assert.equal(empty.version, 3);
assert.equal(empty.installSeed, seed);
assert.equal(empty.contradiction, null);

const a = core.translationFor(empty, 0, false);
const b = core.translationFor(empty, 0, false);
assert.deepEqual(a, b, 'translation must be deterministic for identical state and cycle');
assert.ok(core.SOURCES.includes(a.source));
assert.ok(core.ECOSYSTEMS.includes(a.ecosystem));
assert.notEqual(a.left, a.right);

const bent = core.translationFor(empty, 0, true);
assert.ok(core.SOURCES.includes(bent.source));
assert.notDeepEqual(bent, a, 'interference must materially affect the translation');

const settled = core.settle(empty, a);
assert.deepEqual(settled.contradiction, { source: a.source, left: a.left, right: a.right });
assert.match(core.memoryText(settled), /One contradiction remains:/);

const sanitized = core.sanitizeState({
  version: 999,
  installSeed: seed,
  contradiction: { source: '<pressure>', left: 'HELD!!', right: 'NOT HELD??' },
  actionHistory: ['must disappear'],
  pointerPath: [1, 2],
  count: 999
});
assert.equal(sanitized.version, 3);
assert.equal('actionHistory' in sanitized, false);
assert.equal('pointerPath' in sanitized, false);
assert.equal('count' in sanitized, false);
assert.deepEqual(sanitized.contradiction, { source: 'pressure', left: 'held', right: 'not held' });

const migrated = core.migrateLegacy(
  JSON.stringify({ offsets: [0.2], season: 3, actionCount: 9 }),
  JSON.stringify({ tensions: [0.5] }),
  JSON.stringify({ fragments: ['fictional'] }),
  JSON.stringify({ selectedIndex: 4 })
);
assert.equal(migrated.migrated, true);
assert.deepEqual(migrated.contradiction, { source: 'alignment', left: 'settled', right: 'not settled' });
assert.doesNotMatch(JSON.stringify(migrated), /offset|season|actionCount|tension|fragment|selectedIndex/i);

const noLegacy = core.migrateLegacy(null, null, null, null);
assert.equal(noLegacy.migrated, false);
assert.equal(noLegacy.contradiction, null);

for (let cycle = 0; cycle < 20; cycle += 1) {
  assert.ok(core.waitDuration(empty, cycle) >= 1050);
  assert.ok(core.openDuration(empty, cycle) >= 1150);
  const micro = core.ecosystemState(empty, cycle);
  assert.ok(core.ECOSYSTEMS.includes(micro.name));
  assert.ok(micro.pressure >= 3 && micro.pressure <= 7);
}

assert.doesNotMatch(JSON.stringify(settled), /timestamp|email|name|location|pointer/i);
console.log('Entropy history replay, v3 translation, contradiction memory, and deterministic ecosystem verified.');
