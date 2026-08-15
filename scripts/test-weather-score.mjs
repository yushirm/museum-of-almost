import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const scoreCore = require('../weather-score-core.js');

assert.equal(scoreCore.temperatureToFrequency(-100), 140);
assert.equal(scoreCore.temperatureToFrequency(70), 700);
assert.equal(scoreCore.temperatureToFrequency(-200), 140);
assert.equal(scoreCore.temperatureToFrequency(200), 700);
assert.equal(scoreCore.temperatureToFrequency(null), null);

const snapshot = {
  weather: {
    points: [
      { id: '01', temperature: -10 },
      { id: '02', temperature: null },
      { id: '03', temperature: 20.5 }
    ]
  }
};

const score = scoreCore.buildScore(snapshot);
assert.equal(score.length, 3);
assert.deepEqual(score.map((entry) => entry.id), ['01', '02', '03']);
assert.equal(score[0].rest, false);
assert.equal(score[1].rest, true);
assert.equal(score[1].frequency, null);
assert.equal(score[2].temperature, 20.5);
assert.ok(score[2].frequency > score[0].frequency);

assert.deepEqual(scoreCore.summarize(score), {
  total: 3,
  measured: 2,
  rests: 1,
  minTemperature: -10,
  maxTemperature: 20.5
});

const viewSource = await fs.readFile(new URL('../weather-score.js', import.meta.url), 'utf8');
assert.match(viewSource, /AudioContext/);
assert.match(viewSource, /Listen to this weave/);
assert.match(viewSource, /Earth is not singing/);
assert.match(viewSource, /missing temperature is a silent rest|missing temperatures remain silent rests/i);
assert.match(viewSource, /\.weather-loom-section/);
assert.match(viewSource, /data-sounding/);
assert.doesNotMatch(viewSource, /weather-score-section/);
assert.doesNotMatch(viewSource, /weather-score-list/);
assert.doesNotMatch(viewSource, /fetch\s*\(/);
assert.doesNotMatch(viewSource, /localStorage|sessionStorage|indexedDB|geolocation/i);

const styleSource = await fs.readFile(new URL('../weather-score.css', import.meta.url), 'utf8');
assert.match(styleSource, /weather-score-loom/);
assert.match(styleSource, /weather-loom-thread\[data-sounding="true"\]/);
assert.doesNotMatch(styleSource, /weather-score-section/);

const loaderSource = await fs.readFile(new URL('../cosmic-signal.js', import.meta.url), 'utf8');
assert.match(loaderSource, /weather-score-core\.js/);
assert.match(loaderSource, /weather-score\.js/);

console.log('Weather Score integration tests passed.');