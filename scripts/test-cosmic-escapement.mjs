import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const core=require('../cosmic-escapement-core.js');
const coreSource=fs.readFileSync(new URL('../cosmic-escapement-core.js',import.meta.url),'utf8');
const viewSource=fs.readFileSync(new URL('../cosmic-escapement.js',import.meta.url),'utf8');
const styles=fs.readFileSync(new URL('../cosmic-escapement.css',import.meta.url),'utf8');
const loader=fs.readFileSync(new URL('../cosmic-signal.js',import.meta.url),'utf8');
const worker=fs.readFileSync(new URL('../service-worker.js',import.meta.url),'utf8');
const notes=fs.readFileSync(new URL('../CELESTIAL_ESCAPEMENT.md',import.meta.url),'utf8');

assert.equal(core.SYNODIC_MONTH_DAYS,29.53059);
assert.equal(core.EARTH_YEAR_DAYS,365.25);
assert.equal(core.JUPITER_YEAR_DAYS,4333);
assert.equal(core.J2000_MS,Date.UTC(2000,0,1,12,0,0));
assert.ok(Math.abs(core.meanLongitude(core.J2000_MS,'earth')-core.JPL_MEAN_LONGITUDE.earth.base)<1e-10);
assert.ok(Math.abs(core.meanLongitude(core.J2000_MS,'jupiter')-core.JPL_MEAN_LONGITUDE.jupiter.base)<1e-10);
assert.ok(Math.abs(core.moonPhaseFraction(core.MOON_NEW_EPOCH_MS))<1e-12);
assert.equal(core.moonPhaseName(0),'new Moon');
assert.equal(core.moonPhaseName(0.25),'first quarter');
assert.equal(core.moonPhaseName(0.5),'full Moon');
assert.equal(core.moonPhaseName(0.75),'third quarter');
assert.equal(core.moonIllumination(0),0);
assert.ok(Math.abs(core.moonIllumination(0.5)-100)<1e-10);
assert.equal(core.earthTurnFraction(Date.UTC(2026,7,7,12,0,0)),0.5);
const clocks=core.clocks(Date.UTC(2026,7,7,17,0,0));
assert.deepEqual(clocks.map(x=>x.id),['earth-turn','moon-month','earth-year','jupiter-year']);
for(const clock of clocks){
  assert.ok(clock.phase>=0&&clock.phase<1,`${clock.id} phase should stay within one turn`);
  assert.ok(clock.angle>=0&&clock.angle<360,`${clock.id} angle should stay within one turn`);
}
assert.match(clocks[1].readout,/waning crescent/i);
assert.match(viewSource,/MANY CLOCKS, ONE NOW/);
assert.match(viewSource,/section\.id = 'celestial-escapement'/);
assert.match(viewSource,/MutationObserver/);
assert.match(viewSource,/snapshot-time/);
assert.match(viewSource,/Snapshot received/);
assert.match(viewSource,/Frozen local approximation/i);
assert.match(loader,/cosmic-escapement-core\.js/);
assert.match(loader,/cosmic-escapement\.js/);
for(const asset of ['./cosmic-escapement-core.js','./cosmic-escapement.js','./cosmic-escapement.css','./CELESTIAL_ESCAPEMENT.md']){
  assert.ok(worker.includes(`'${asset}'`),`service worker should cache ${asset}`);
}
assert.match(notes,/The world is doing this without us\./);
assert.match(notes,/ssd\.jpl\.nasa\.gov\/planets\/approx_pos\.html/);
assert.doesNotMatch(coreSource+viewSource,/https?:\/\//i);
assert.doesNotMatch(coreSource+viewSource,/\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource/i);
assert.doesNotMatch(coreSource+viewSource,/setInterval|setTimeout|requestAnimationFrame|localStorage|sessionStorage|indexedDB|document\.cookie|navigator\.geolocation/i);
assert.match(styles,/@media \(max-width: 760px\)/);
assert.match(styles,/@media \(max-width: 380px\)/);
assert.match(styles,/@media \(prefers-reduced-motion: reduce\)/);
assert.match(styles,/@media \(prefers-contrast: more\)/);
assert.match(styles,/@media print/);
assert.doesNotMatch(styles,/@import\s+url|font-face|https?:\/\//i);
console.log('Celestial Escapement frozen multi-clock math, approximation boundaries, local-only runtime, accessibility hooks, and offline shell verified.');
