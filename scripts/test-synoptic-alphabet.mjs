import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const core = require('../synoptic-alphabet-core.js');

assert.equal(core.scale(-100, -100, 70), 0);
assert.equal(core.scale(70, -100, 70), 1);
assert.equal(core.scale(400, 0, 400), 1);
assert.equal(core.scale(null, 0, 1), null);

const snapshot = {
  weather: {
    points: [
      { id: '01', temperature: 20, wind: 40, precipitation: 0 },
      { id: '02', temperature: -5, wind: 12.5, precipitation: 0.3 },
      { id: '03', temperature: null, wind: null, precipitation: null }
    ]
  }
};

const glyphs = core.buildAlphabet(snapshot);
assert.equal(glyphs.length, 3);
assert.equal(glyphs[0].precipitationState, 'zero');
assert.equal(glyphs[1].precipitationState, 'present');
assert.equal(glyphs[2].precipitationState, 'missing');
assert.equal(glyphs[0].measuredFields, 3);
assert.equal(glyphs[2].measuredFields, 0);
assert.ok(glyphs[0].temperaturePosition > 0 && glyphs[0].temperaturePosition < 1);
assert.ok(glyphs[0].windExtent > 0 && glyphs[0].windExtent < 1);

assert.deepEqual(core.summarize(glyphs), { points: 3, complete: 2, partial: 0, empty: 1 });
assert.deepEqual(core.summarize(core.buildAlphabet(null)), { points: 0, complete: 0, partial: 0, empty: 0 });

console.log('Synoptic Alphabet preserves missingness, fixed acquisition scales, and discrete station semantics.');