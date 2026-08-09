(function exposeSynopticAlphabetCore(root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.MuseumSynopticAlphabetCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function buildSynopticAlphabetCore() {
  'use strict';

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function finiteOrNull(value) {
    if (value === null || value === undefined || value === '') return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function scale(value, min, max) {
    const number = finiteOrNull(value);
    if (number === null) return null;
    return clamp((number - min) / (max - min), 0, 1);
  }

  function buildGlyph(point) {
    const temperature = finiteOrNull(point?.temperature);
    const wind = finiteOrNull(point?.wind);
    const precipitation = finiteOrNull(point?.precipitation);
    return {
      id: String(point?.id || '—'),
      temperature,
      wind,
      precipitation,
      temperaturePosition: temperature === null ? null : scale(temperature, -100, 70),
      windExtent: wind === null ? null : scale(wind, 0, 400),
      precipitationState: precipitation === null ? 'missing' : precipitation > 0 ? 'present' : 'zero',
      measuredFields: [temperature, wind, precipitation].filter(Number.isFinite).length
    };
  }

  function buildAlphabet(snapshot) {
    const points = Array.isArray(snapshot?.weather?.points) ? snapshot.weather.points : [];
    return points.map(buildGlyph);
  }

  function summarize(glyphs) {
    const list = Array.isArray(glyphs) ? glyphs : [];
    return {
      points: list.length,
      complete: list.filter((glyph) => glyph.measuredFields === 3).length,
      partial: list.filter((glyph) => glyph.measuredFields > 0 && glyph.measuredFields < 3).length,
      empty: list.filter((glyph) => glyph.measuredFields === 0).length
    };
  }

  return { buildGlyph, buildAlphabet, summarize, scale };
});