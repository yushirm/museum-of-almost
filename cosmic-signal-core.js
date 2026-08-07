(function attachCosmicSignalCore(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.MuseumCosmicSignalCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function buildCosmicSignalCore() {
  'use strict';

  const SOURCE = 'https://services.swpc.noaa.gov/products/noaa-scales.json';
  const SCALE_LABELS = Object.freeze(['none', 'minor', 'moderate', 'strong', 'severe', 'extreme']);

  function parseScale(value) {
    const number = Number(value);
    return Number.isInteger(number) && number >= 0 && number <= 5 ? number : null;
  }

  function normalizeText(value, scale) {
    const text = String(value ?? '').trim().toLowerCase();
    return text || (scale === null ? 'unavailable' : SCALE_LABELS[scale]);
  }

  function normalizeScale(record, key) {
    const source = record && typeof record === 'object' ? record[key] : null;
    const scale = parseScale(source?.Scale ?? source?.scale);
    return {
      available: scale !== null,
      scale,
      code: scale === null ? `${key}—` : `${key}${scale}`,
      text: normalizeText(source?.Text ?? source?.text, scale)
    };
  }

  function selectCurrentRecord(payload) {
    if (!payload || typeof payload !== 'object') return null;
    if (Array.isArray(payload)) {
      return payload.find((entry) => entry && typeof entry === 'object' && (entry.G || entry.S || entry.R)) || null;
    }
    if (payload['0'] && typeof payload['0'] === 'object') return payload['0'];
    if (payload.G || payload.S || payload.R) return payload;
    return Object.values(payload).find((entry) => entry && typeof entry === 'object' && (entry.G || entry.S || entry.R)) || null;
  }

  function normalizeNoaaScales(payload) {
    const record = selectCurrentRecord(payload);
    const geomagnetic = normalizeScale(record, 'G');
    const radiation = normalizeScale(record, 'S');
    const radio = normalizeScale(record, 'R');
    const dateStamp = String(record?.DateStamp ?? record?.dateStamp ?? '').trim();
    const timeStamp = String(record?.TimeStamp ?? record?.timeStamp ?? '').trim();
    return {
      available: geomagnetic.available || radiation.available || radio.available,
      geomagnetic,
      radiation,
      radio,
      observedAt: dateStamp && timeStamp ? `${dateStamp} ${timeStamp} UTC` : null
    };
  }

  function cosmicSentence(solarText, scales) {
    const parts = [];
    const solar = String(solarText || '').trim();
    if (solar && solar !== '—') parts.push(`solar wind ${solar}`);
    if (scales?.geomagnetic?.available) parts.push(`geomagnetic ${scales.geomagnetic.code} ${scales.geomagnetic.text}`);
    if (scales?.radiation?.available) parts.push(`solar radiation ${scales.radiation.code} ${scales.radiation.text}`);
    return parts.length ? `${parts.join(' · ')}.` : 'Cosmic measurements are unavailable in this snapshot.';
  }

  return Object.freeze({ SOURCE, SCALE_LABELS, parseScale, normalizeScale, normalizeNoaaScales, cosmicSentence });
});
