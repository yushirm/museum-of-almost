(function attachLiveEntropyCore(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.MuseumLiveEntropyCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function buildLiveEntropyCore() {
  'use strict';

  const USGS_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson';
  const NOAA_URL = 'https://services.swpc.noaa.gov/products/summary/solar-wind-speed.json';

  function clamp(value, min, max) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return min;
    return Math.max(min, Math.min(max, numeric));
  }

  function round(value, digits = 0) {
    const factor = 10 ** digits;
    return Math.round(Number(value) * factor) / factor;
  }

  function normalizeEarthquakes(payload) {
    const features = Array.isArray(payload?.features) ? payload.features : [];
    const magnitudes = [];
    const depths = [];

    for (const feature of features.slice(0, 500)) {
      if (feature?.properties?.type && feature.properties.type !== 'earthquake') continue;
      const magnitude = Number(feature?.properties?.mag);
      const depth = Number(feature?.geometry?.coordinates?.[2]);
      if (Number.isFinite(magnitude)) magnitudes.push(clamp(magnitude, 0, 10));
      if (Number.isFinite(depth)) depths.push(clamp(depth, 0, 700));
    }

    const count = magnitudes.length;
    const strongest = count ? Math.max(...magnitudes) : 0;
    const meanDepth = depths.length
      ? depths.reduce((sum, depth) => sum + depth, 0) / depths.length
      : 0;
    const countPressure = clamp(count / 30, 0, 1);
    const magnitudePressure = clamp(strongest / 7.5, 0, 1);
    const pressure = clamp(countPressure * 0.58 + magnitudePressure * 0.42, 0, 1);

    return {
      available: true,
      count,
      strongest: round(strongest, 1),
      meanDepth: round(meanDepth, 1),
      pressure: round(pressure, 4)
    };
  }

  function findPreferredNumber(value, preferredKeys) {
    if (Array.isArray(value)) {
      for (let index = value.length - 1; index >= 0; index -= 1) {
        const found = findPreferredNumber(value[index], preferredKeys);
        if (found !== null) return found;
      }
      return null;
    }

    if (!value || typeof value !== 'object') return null;

    for (const [key, candidate] of Object.entries(value)) {
      const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!preferredKeys.some((preferred) => normalized.includes(preferred))) continue;
      const numeric = Number(candidate);
      if (Number.isFinite(numeric)) return numeric;
    }

    for (const candidate of Object.values(value)) {
      const found = findPreferredNumber(candidate, preferredKeys);
      if (found !== null) return found;
    }
    return null;
  }

  function findLastNumeric(value) {
    if (Array.isArray(value)) {
      for (let index = value.length - 1; index >= 0; index -= 1) {
        const found = findLastNumeric(value[index]);
        if (found !== null) return found;
      }
      return null;
    }
    if (value && typeof value === 'object') {
      const entries = Object.entries(value).filter(([key]) => !/time|date|epoch|stamp/i.test(key));
      for (let index = entries.length - 1; index >= 0; index -= 1) {
        const found = findLastNumeric(entries[index][1]);
        if (found !== null) return found;
      }
      return null;
    }
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  }

  function normalizeSolarWind(payload) {
    const preferred = findPreferredNumber(payload, ['speed', 'windspeed']);
    const fallback = preferred === null ? findLastNumeric(payload) : preferred;
    if (!Number.isFinite(fallback)) return { available: false, speed: 0, pressure: 0 };

    const speed = clamp(fallback, 0, 2000);
    const pressure = clamp((speed - 250) / 650, 0, 1);
    return {
      available: true,
      speed: round(speed, 1),
      pressure: round(pressure, 4)
    };
  }

  function pressureLabel(pressure) {
    if (pressure < 0.18) return 'quiet';
    if (pressure < 0.42) return 'stirring';
    if (pressure < 0.7) return 'charged';
    return 'insistent';
  }

  function composeLiveEntropy(earthquakes, solarWind) {
    const quake = earthquakes?.available ? earthquakes : null;
    const solar = solarWind?.available ? solarWind : null;
    const sources = [quake, solar].filter(Boolean);
    if (sources.length === 0) {
      return {
        available: false,
        sourceCount: 0,
        pressure: 0,
        bias: 0,
        position: 500,
        scaleA: 1,
        scaleB: 1,
        fieldScale: 1,
        label: 'unavailable'
      };
    }

    const quakePressure = quake?.pressure || 0;
    const solarPressure = solar?.pressure || 0;
    const pressure = sources.length === 2
      ? quakePressure * 0.52 + solarPressure * 0.48
      : sources[0].pressure;
    const bias = sources.length === 2
      ? clamp(solarPressure - quakePressure, -1, 1)
      : quake
        ? -quakePressure * 0.6
        : solarPressure * 0.6;
    const position = Math.round(clamp(500 + bias * 350, 150, 850));

    return {
      available: true,
      sourceCount: sources.length,
      pressure: round(pressure, 4),
      bias: round(bias, 4),
      position,
      scaleA: round(1 + bias * 0.09, 4),
      scaleB: round(1 - bias * 0.09, 4),
      fieldScale: round(1 + pressure * 0.18, 4),
      label: pressureLabel(pressure)
    };
  }

  function correspondenceFor(livePosition, treatyCenter, activeCount) {
    const count = Math.max(0, Math.round(Number(activeCount) || 0));
    if (count === 0 || !Number.isFinite(Number(treatyCenter))) {
      return {
        key: 'unanswered',
        distance: null,
        text: 'The outside world is pressing, but this treaty has not answered yet.'
      };
    }

    const distance = Math.abs(clamp(livePosition, 0, 1000) - clamp(treatyCenter, 0, 1000));
    if (distance <= 90) {
      return { key: 'accord', distance, text: 'The current counterweight is answering the outside pressure closely.' };
    }
    if (distance <= 220) {
      return { key: 'near', distance, text: 'The treaty and the outside pressure are in near correspondence.' };
    }
    if (distance <= 400) {
      return { key: 'counterpoint', distance, text: 'The treaty is holding a deliberate counterpoint to the outside pressure.' };
    }
    return { key: 'resistance', distance, text: 'The treaty is resisting the outside pressure from the opposite side.' };
  }

  return Object.freeze({
    USGS_URL,
    NOAA_URL,
    normalizeEarthquakes,
    normalizeSolarWind,
    composeLiveEntropy,
    correspondenceFor,
    pressureLabel
  });
});
