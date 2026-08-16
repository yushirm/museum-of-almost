import assert from 'node:assert/strict';
import {
  assertCssContract,
  assertLocalRuntime,
  assertOfflineAssets,
  bundle,
  read,
  requireCjs,
  requirePatterns
} from './test-support.mjs';

const core = requireCjs('cosmic-escapement-core.js');
const coreSource = read('cosmic-escapement-core.js');
const viewSource = read('cosmic-escapement.js');
const styles = read('cosmic-escapement.css');
const loader = read('cosmic-signal.js');
const worker = read('service-worker.js');
const notes = read('CELESTIAL_ESCAPEMENT.md');

assert.equal(core.SYNODIC_MONTH_DAYS, 29.53059);
assert.equal(core.EARTH_YEAR_DAYS, 365.25);
assert.equal(core.JUPITER_YEAR_DAYS, 4333);
assert.equal(core.J2000_MS, Date.UTC(2000, 0, 1, 12, 0, 0));
assert.ok(Math.abs(core.meanLongitude(core.J2000_MS, 'earth') - core.JPL_MEAN_LONGITUDE.earth.base) < 1e-10);
assert.ok(Math.abs(core.meanLongitude(core.J2000_MS, 'jupiter') - core.JPL_MEAN_LONGITUDE.jupiter.base) < 1e-10);
assert.ok(Math.abs(core.moonPhaseFraction(core.MOON_NEW_EPOCH_MS)) < 1e-12);
assert.equal(core.moonPhaseName(0), 'new Moon');
assert.equal(core.moonPhaseName(0.25), 'first quarter');
assert.equal(core.moonPhaseName(0.5), 'full Moon');
assert.equal(core.moonPhaseName(0.75), 'third quarter');
assert.equal(core.moonIllumination(0), 0);
assert.ok(Math.abs(core.moonIllumination(0.5) - 100) < 1e-10);
assert.equal(core.earthTurnFraction(Date.UTC(2026, 7, 7, 12, 0, 0)), 0.5);
const clocks = core.clocks(Date.UTC(2026, 7, 7, 17, 0, 0));
assert.deepEqual(clocks.map((clock) => clock.id), ['earth-turn', 'moon-month', 'earth-year', 'jupiter-year']);
for (const clock of clocks) {
  assert.ok(clock.phase >= 0 && clock.phase < 1, `${clock.id} phase should stay within one turn`);
  assert.ok(clock.angle >= 0 && clock.angle < 360, `${clock.id} angle should stay within one turn`);
}
assert.match(clocks[1].readout, /waning crescent/i);
requirePatterns(viewSource, [
  /MANY CLOCKS, ONE NOW/,
  /section\.id = 'celestial-escapement'/,
  /MutationObserver/,
  /snapshot-time/,
  /Snapshot received/,
  /Frozen local approximation/i
], 'Celestial Escapement view');
requirePatterns(loader, [/cosmic-escapement-core\.js/, /cosmic-escapement\.js/], 'Commons progressive loader');
assertOfflineAssets(worker, [
  './cosmic-escapement-core.js',
  './cosmic-escapement.js',
  './cosmic-escapement.css',
  './CELESTIAL_ESCAPEMENT.md'
], 'Celestial Escapement offline shell');
assert.match(notes, /The world is doing this without us\./);
assert.match(notes, /ssd\.jpl\.nasa\.gov\/planets\/approx_pos\.html/);
assertLocalRuntime(bundle(coreSource, viewSource), 'Celestial Escapement');
assertCssContract(styles, 'Celestial Escapement styles');
requirePatterns(styles, [/@media \(max-width: 760px\)/, /@media \(max-width: 380px\)/], 'Celestial Escapement responsive styles');
console.log('Celestial Escapement frozen multi-clock math, approximation boundaries, local-only runtime, accessibility hooks, and offline shell verified.');
