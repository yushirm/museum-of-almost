(function attachWeatherScoreCore(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.MuseumWeatherScoreCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function buildWeatherScoreCore() {
  'use strict';

  const MIN_TEMP_C = -100;
  const MAX_TEMP_C = 70;
  const MIN_FREQUENCY_HZ = 140;
  const MAX_FREQUENCY_HZ = 700;
  const POINT_DURATION_MS = 190;

  function clamp(value, min, max) {
    const number = Number(value);
    if (!Number.isFinite(number)) return min;
    return Math.max(min, Math.min(max, number));
  }

  function temperatureToFrequency(temperature) {
    const value = Number(temperature);
    if (!Number.isFinite(value)) return null;
    const bounded = clamp(value, MIN_TEMP_C, MAX_TEMP_C);
    const position = (bounded - MIN_TEMP_C) / (MAX_TEMP_C - MIN_TEMP_C);
    return Math.round((MIN_FREQUENCY_HZ + position * (MAX_FREQUENCY_HZ - MIN_FREQUENCY_HZ)) * 10) / 10;
  }

  function buildScore(snapshot) {
    const points = Array.isArray(snapshot?.weather?.points) ? snapshot.weather.points : [];
    return points.map((point, index) => {
      const temperature = Number(point?.temperature);
      const hasTemperature = Number.isFinite(temperature);
      return {
        id: String(point?.id || String(index + 1).padStart(2, '0')),
        temperature: hasTemperature ? temperature : null,
        frequency: hasTemperature ? temperatureToFrequency(temperature) : null,
        rest: !hasTemperature
      };
    });
  }

  function summarize(score) {
    const entries = Array.isArray(score) ? score : [];
    const measured = entries.filter((entry) => Number.isFinite(entry?.temperature));
    const temperatures = measured.map((entry) => entry.temperature);
    return {
      total: entries.length,
      measured: measured.length,
      rests: entries.length - measured.length,
      minTemperature: temperatures.length ? Math.min(...temperatures) : null,
      maxTemperature: temperatures.length ? Math.max(...temperatures) : null
    };
  }

  return Object.freeze({
    MIN_TEMP_C,
    MAX_TEMP_C,
    MIN_FREQUENCY_HZ,
    MAX_FREQUENCY_HZ,
    POINT_DURATION_MS,
    temperatureToFrequency,
    buildScore,
    summarize
  });
});
