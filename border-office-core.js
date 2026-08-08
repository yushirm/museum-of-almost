(function attachBorderOfficeCore(root, factory) {
  const commons = typeof module === 'object' && module.exports
    ? require('./data-core.js')
    : root.MuseumCommonsCore;
  const api = factory(commons);
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.MuseumBorderOfficeCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function buildBorderOfficeCore(commons) {
  'use strict';

  const FAMILY_IDS = Object.freeze(['solar', 'light', 'precipitation']);
  const SOLAR_BORDERS = Object.freeze([350, 500, 700]);
  const LIGHT_BORDERS = Object.freeze([-6, 0]);
  const PRECIPITATION_BORDERS = Object.freeze([0]);

  const FAMILIES = Object.freeze([
    Object.freeze({
      id: 'solar',
      label: 'Solar wind',
      shortLabel: 'SOLAR WIND',
      rule: 'Museum label: QUIET below 350 · STEADY from 350 to below 500 · FAST from 500 to below 700 · VERY FAST at 700 km/s and above.',
      borderText: '350 · 500 · 700 km/s',
      unit: ' km/s'
    }),
    Object.freeze({
      id: 'light',
      label: 'Light state',
      shortLabel: 'LIGHT STATE',
      rule: 'Museum geometry label: NIGHT at or below −6° solar elevation · TWILIGHT above −6° through 0° · DAY above 0°.',
      borderText: '−6° · 0° solar elevation',
      unit: '°'
    }),
    Object.freeze({
      id: 'precipitation',
      label: 'Precipitation count',
      shortLabel: 'PRECIPITATION COUNT',
      rule: 'A fixed weather point is counted as reporting precipitation only when its current normalized precipitation value is greater than 0 mm.',
      borderText: '0 mm',
      unit: ' mm'
    })
  ]);

  function finite(value) {
    if (value === null || value === undefined || value === '') return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function validDate(value) {
    if (value === null || value === undefined || value === '') return null;
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? date : null;
  }

  function round(value, digits = 2) {
    const number = finite(value);
    if (number === null) return null;
    const factor = 10 ** digits;
    return Math.round(number * factor) / factor;
  }

  function classifySolar(speed) {
    const value = finite(speed);
    if (value === null) return 'missing';
    return value < 350 ? 'quiet' : value < 500 ? 'steady' : value < 700 ? 'fast' : 'very-fast';
  }

  function classifyLightElevation(elevation) {
    const value = finite(elevation);
    if (value === null) return 'missing';
    if (value > 0) return 'day';
    if (value > -6) return 'twilight';
    return 'night';
  }

  function classifyPrecipitation(value) {
    const number = finite(value);
    if (number === null) return 'missing';
    return number > 0 ? 'reporting' : 'not-reporting';
  }

  function nearestBorder(value, borders) {
    const number = finite(value);
    const candidates = Array.isArray(borders) ? borders.filter((entry) => finite(entry) !== null).map(Number) : [];
    if (number === null || !candidates.length) return Object.freeze({ border: null, distance: null });
    let border = candidates[0];
    let distance = Math.abs(number - border);
    for (const candidate of candidates.slice(1)) {
      const candidateDistance = Math.abs(number - candidate);
      if (candidateDistance < distance || (candidateDistance === distance && candidate < border)) {
        border = candidate;
        distance = candidateDistance;
      }
    }
    return Object.freeze({ border, distance: round(distance, 4) });
  }

  function labelFor(state) {
    return ({
      quiet: 'QUIET',
      steady: 'STEADY',
      fast: 'FAST',
      'very-fast': 'VERY FAST',
      day: 'DAY',
      twilight: 'TWILIGHT',
      night: 'NIGHT',
      reporting: 'COUNTED AS REPORTING',
      'not-reporting': 'NOT COUNTED AS REPORTING',
      missing: 'MISSING'
    })[state] || 'MISSING';
  }

  function exitCondition(familyId, state) {
    if (state === 'missing') return 'No current numeric value reached this local border rule.';
    if (familyId === 'solar') {
      if (state === 'quiet') return 'QUIET expires at 350 km/s.';
      if (state === 'steady') return 'STEADY expires below 350 or at 500 km/s.';
      if (state === 'fast') return 'FAST expires below 500 or at 700 km/s.';
      return 'VERY FAST expires below 700 km/s.';
    }
    if (familyId === 'light') {
      if (state === 'night') return 'NIGHT expires above −6° solar elevation.';
      if (state === 'twilight') return 'TWILIGHT expires at or below −6°, or above 0° solar elevation.';
      return 'DAY expires at or below 0° solar elevation.';
    }
    if (familyId === 'precipitation') {
      return state === 'reporting'
        ? 'COUNTED AS REPORTING expires at 0 mm in the normalized Commons field.'
        : 'COUNTED AS REPORTING begins only above 0 mm in the normalized Commons field.';
    }
    return 'No exit condition declared.';
  }

  function entry(config) {
    const value = finite(config.value);
    const nearest = nearestBorder(value, config.borders);
    return Object.freeze({
      id: config.id,
      familyId: config.familyId,
      label: config.label,
      state: config.state,
      stateLabel: labelFor(config.state),
      value,
      valueDigits: config.valueDigits,
      unit: config.unit,
      nearestBorder: nearest.border,
      margin: nearest.distance,
      borderDigits: config.borderDigits ?? config.valueDigits,
      exit: exitCondition(config.familyId, config.state)
    });
  }

  function solarFamily(snapshot) {
    const family = FAMILIES[0];
    const speed = snapshot?.solar?.available ? finite(snapshot.solar.speed) : null;
    const computed = classifySolar(speed);
    const snapshotState = String(snapshot?.solar?.state || '').replace(/\s+/g, '-');
    const state = speed === null ? 'missing' : (snapshotState && snapshotState !== 'unavailable' ? snapshotState : computed);
    return familyResult(family, [entry({
      id: 'solar-wind',
      familyId: family.id,
      label: 'Current solar-wind speed',
      state,
      value: speed,
      valueDigits: 1,
      unit: family.unit,
      borders: SOLAR_BORDERS
    })]);
  }

  function lightFamily(snapshot) {
    const family = FAMILIES[1];
    const latch = validDate(snapshot?.receivedAt);
    const stations = Array.isArray(commons?.STATIONS) ? commons.STATIONS : [];
    const entries = stations.map((station) => {
      const elevation = latch && typeof commons?.solarElevation === 'function'
        ? finite(commons.solarElevation(latch, station.lat, station.lon))
        : null;
      const state = elevation === null
        ? 'missing'
        : (typeof commons?.sunState === 'function' ? commons.sunState(latch, station.lat, station.lon) : classifyLightElevation(elevation));
      return entry({
        id: `light-${station.id}`,
        familyId: family.id,
        label: `Point ${station.id} solar elevation`,
        state,
        value: elevation,
        valueDigits: 2,
        borderDigits: 0,
        unit: family.unit,
        borders: LIGHT_BORDERS
      });
    });
    return familyResult(family, entries);
  }

  function precipitationFamily(snapshot) {
    const family = FAMILIES[2];
    const stations = Array.isArray(commons?.STATIONS) ? commons.STATIONS : [];
    const points = Array.isArray(snapshot?.weather?.points) ? snapshot.weather.points : [];
    const byId = new Map(points.map((point) => [point?.id, point]));
    const entries = stations.map((station) => {
      const point = byId.get(station.id);
      const value = point?.available ? finite(point.precipitation) : null;
      const state = classifyPrecipitation(value);
      return entry({
        id: `precipitation-${station.id}`,
        familyId: family.id,
        label: `Point ${station.id} current precipitation`,
        state,
        value,
        valueDigits: 1,
        borderDigits: 0,
        unit: family.unit,
        borders: PRECIPITATION_BORDERS
      });
    });
    return familyResult(family, entries);
  }

  function familyResult(family, entries) {
    const counts = {};
    for (const current of entries) counts[current.state] = (counts[current.state] || 0) + 1;
    return Object.freeze({
      ...family,
      total: entries.length,
      availableCount: entries.filter((current) => current.state !== 'missing').length,
      counts: Object.freeze(counts),
      entries: Object.freeze(entries)
    });
  }

  function buildOffice(snapshot) {
    const receivedAt = validDate(snapshot?.receivedAt);
    if (!receivedAt) {
      return Object.freeze({
        waiting: true,
        receivedAt: null,
        totalLabels: 0,
        families: Object.freeze([])
      });
    }
    const families = Object.freeze([
      solarFamily(snapshot),
      lightFamily(snapshot),
      precipitationFamily(snapshot)
    ]);
    return Object.freeze({
      waiting: false,
      receivedAt: receivedAt.toISOString(),
      totalLabels: families.reduce((sum, family) => sum + family.total, 0),
      families
    });
  }

  function familyById(office, familyId) {
    const families = Array.isArray(office?.families) ? office.families : [];
    return families.find((family) => family.id === familyId) || families[0] || null;
  }

  function summarySentence(office, familyId) {
    if (!office || office.waiting) return 'Waiting for the first real Commons latch before applying local classification borders.';
    const family = familyById(office, familyId);
    if (!family) return 'No local border family is available.';
    return `${family.availableCount} of ${family.total} ${family.label.toLowerCase()} labels can be evaluated in this latch. Border distance is arithmetic in the native unit only, not uncertainty or quality.`;
  }

  return Object.freeze({
    FAMILY_IDS,
    FAMILIES,
    SOLAR_BORDERS,
    LIGHT_BORDERS,
    PRECIPITATION_BORDERS,
    finite,
    validDate,
    round,
    classifySolar,
    classifyLightElevation,
    classifyPrecipitation,
    nearestBorder,
    labelFor,
    exitCondition,
    buildOffice,
    familyById,
    summarySentence
  });
});
