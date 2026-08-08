(function attachWitnessSealCore(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.MuseumWitnessSealCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function buildWitnessSealCore() {
  'use strict';

  const SCHEMA = 'commons-witness-v1';

  function finiteOrNull(value) {
    if (value === null || value === undefined || value === '') return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function boolean(value) {
    return value === true;
  }

  function isoOrNull(value) {
    if (value === null || value === undefined || value === '') return null;
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? date.toISOString() : null;
  }

  function normalizeCategories(categories) {
    if (!Array.isArray(categories)) return [];
    return categories
      .map((entry) => ({
        title: String(entry?.title || '').trim(),
        count: finiteOrNull(entry?.count)
      }))
      .filter((entry) => entry.title && entry.count !== null)
      .sort((a, b) => a.title < b.title ? -1 : a.title > b.title ? 1 : a.count - b.count);
  }

  function normalizeWeatherPoints(points) {
    if (!Array.isArray(points)) return [];
    return points
      .map((point) => ({
        id: String(point?.id || '').trim(),
        available: boolean(point?.available),
        temperature: finiteOrNull(point?.temperature),
        wind: finiteOrNull(point?.wind),
        precipitation: finiteOrNull(point?.precipitation)
      }))
      .filter((point) => point.id)
      .sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  }

  function canonicalSnapshot(snapshot, scales) {
    const receivedAt = isoOrNull(snapshot?.receivedAt);
    if (!receivedAt) return null;

    return {
      schema: SCHEMA,
      receivedAt,
      feeds: {
        earthquakes: boolean(snapshot?.feeds?.earthquakes),
        solar: boolean(snapshot?.feeds?.solar),
        scales: boolean(snapshot?.feeds?.scales),
        weather: boolean(snapshot?.feeds?.weather),
        events: boolean(snapshot?.feeds?.events)
      },
      earthquakes: {
        available: boolean(snapshot?.earthquakes?.available),
        count: finiteOrNull(snapshot?.earthquakes?.count),
        strongest: finiteOrNull(snapshot?.earthquakes?.strongest),
        meanDepth: finiteOrNull(snapshot?.earthquakes?.meanDepth),
        significant: finiteOrNull(snapshot?.earthquakes?.significant)
      },
      solar: {
        available: boolean(snapshot?.solar?.available),
        speed: finiteOrNull(snapshot?.solar?.speed),
        state: String(snapshot?.solar?.state || 'unavailable')
      },
      scales: {
        geomagnetic: finiteOrNull(scales?.geomagnetic?.scale),
        radiation: finiteOrNull(scales?.radiation?.scale)
      },
      weather: {
        available: boolean(snapshot?.weather?.available),
        availableCount: finiteOrNull(snapshot?.weather?.availableCount),
        minTemp: finiteOrNull(snapshot?.weather?.minTemp),
        maxTemp: finiteOrNull(snapshot?.weather?.maxTemp),
        meanWind: finiteOrNull(snapshot?.weather?.meanWind),
        maxWind: finiteOrNull(snapshot?.weather?.maxWind),
        raining: finiteOrNull(snapshot?.weather?.raining),
        points: normalizeWeatherPoints(snapshot?.weather?.points)
      },
      events: {
        available: boolean(snapshot?.events?.available),
        count: finiteOrNull(snapshot?.events?.count),
        capped: boolean(snapshot?.events?.capped),
        categories: normalizeCategories(snapshot?.events?.categories)
      }
    };
  }

  function stableStringify(value) {
    if (value === null || typeof value !== 'object') return JSON.stringify(value);
    if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
    const keys = Object.keys(value).sort();
    return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
  }

  async function sha256Hex(text, cryptoApi = globalThis.crypto) {
    if (!cryptoApi?.subtle?.digest || typeof TextEncoder === 'undefined') return null;
    const encoded = new TextEncoder().encode(String(text));
    const digest = await cryptoApi.subtle.digest('SHA-256', encoded);
    return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  function sealCode(hex) {
    const normalized = String(hex || '').toUpperCase().replace(/[^0-9A-F]/g, '');
    if (normalized.length < 16) return null;
    return `NOW-${normalized.slice(0, 4)}-${normalized.slice(4, 8)}-${normalized.slice(8, 12)}-${normalized.slice(12, 16)}`;
  }

  function availableFeedCount(snapshot) {
    const feeds = snapshot?.feeds || {};
    return ['earthquakes', 'solar', 'scales', 'weather', 'events']
      .filter((id) => feeds[id] === true).length;
  }

  return Object.freeze({
    SCHEMA,
    finiteOrNull,
    isoOrNull,
    canonicalSnapshot,
    stableStringify,
    sha256Hex,
    sealCode,
    availableFeedCount
  });
});
