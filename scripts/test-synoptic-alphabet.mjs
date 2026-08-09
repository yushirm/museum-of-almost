import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const core = require('../synoptic-alphabet-core.js');
const view = fs.readFileSync(new URL('../synoptic-alphabet.js', import.meta.url), 'utf8');
const styles = fs.readFileSync(new URL('../synoptic-alphabet.css', import.meta.url), 'utf8');
const app = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');

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

assert.match(view, /document\.querySelector\('\.windows-section'\)/, 'notation should live inside the existing Thirteen Windows journey');
assert.match(view, /document\.querySelector\('#station-list'\)/, 'notation should mount beside the existing fixed station list');
assert.match(view, /Same stations\. Another grammar\./, 'linked notation should explicitly present itself as another reading of the same stations');
assert.match(view, /aria-pressed/, 'glyph controls must expose synchronized selection state');
assert.match(view, /\.station-dot\[data-station=/, 'glyph selection should reuse the authoritative map station control rather than duplicate station state');
assert.match(view, /CARRY THIS WINDOW FORWARD/, 'selected station should gain an explicit bridge into comparison');
assert.match(view, /data-synoptic-patch="a"/, 'station relay should offer comparison end A');
assert.match(view, /data-synoptic-patch="b"/, 'station relay should offer comparison end B');
assert.match(view, /document\.querySelectorAll\('\.patch-point'\)/, 'station relay should reuse the existing Difference Engine patchbay controls');
assert.match(view, /Patch point \$\{selectedId\} to end \$\{targetLabel\}/, 'relay should target the existing accessible patch labels rather than duplicate comparison state');
assert.ok(app.includes("button.setAttribute('aria-label', `Patch point ${station.id} to end ${comparisonTarget.toUpperCase()}`);"),
  'Difference Engine must retain the accessible patch contract used by the station relay');
assert.match(view, /Difference Engine below remains the authoritative comparison surface/i, 'relay must not present itself as a second comparison engine');
assert.match(view, /numeric text remains authoritative/i, 'visual compression must not outrank the numeric readings');
assert.doesNotMatch(view, /fetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|geolocation|analytics|telemetry/i,
  'linked notation must not introduce acquisition, persistence, location, or tracking');
assert.match(styles, /min-height:92px/, 'glyph controls should remain comfortably tappable');
assert.match(styles, /synoptic-relay-controls button\{min-height:44px/, 'relay controls should meet the established touch target floor');
assert.match(styles, /prefers-reduced-motion:reduce/, 'linked notation must retain reduced-motion handling');
assert.match(styles, /prefers-contrast:more/, 'selected state and relay controls need a stronger high-contrast treatment');

console.log('Synoptic Alphabet preserves missingness and fixed acquisition scales while carrying one selected station into the authoritative Difference Engine patchbay.');
