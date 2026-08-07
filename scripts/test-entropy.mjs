import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { selectEntropy } from './entropy-select.mjs';

const require = createRequire(import.meta.url);
const core = require('../entropy-core.js');

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
  count: 999
});
assert.equal(sanitized.version, 3);
assert.equal('actionHistory' in sanitized, false);
assert.equal('count' in sanitized, false);
assert.deepEqual(sanitized.contradiction, { source: 'pressure', left: 'held', right: 'not held' });

const migrated = core.migrateLegacy('{"fictional":true}', null, null, null);
assert.equal(migrated.migrated, true);
assert.deepEqual(migrated.contradiction, { source: 'alignment', left: 'settled', right: 'not settled' });

for (let cycle = 0; cycle < 20; cycle += 1) {
  assert.ok(core.waitDuration(empty, cycle) >= 1050);
  assert.ok(core.openDuration(empty, cycle) >= 1150);
  const micro = core.ecosystemState(empty, cycle);
  assert.ok(core.ECOSYSTEMS.includes(micro.name));
  assert.ok(micro.pressure >= 3 && micro.pressure <= 7);
}

const execution3 = selectEntropy('eb11a896ddf843d260cb13fac4261168f632a18964cd96724f9650e4cd4cacf8');
assert.deepEqual(execution3, {
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

console.log('Entropy v3 translation, contradiction memory, deterministic ecosystem, and seed replay verified.');
