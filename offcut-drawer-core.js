(function attachOffcutDrawerCore(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.MuseumOffcutDrawerCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function buildOffcutDrawerCore() {
  'use strict';

  const STATES = Object.freeze({
    EXACT: 'exact',
    UP: 'up',
    DOWN: 'down',
    MISSING: 'missing'
  });

  const STATE_LABELS = Object.freeze({
    exact: 'EXACT',
    up: 'ROUNDED UP',
    down: 'ROUNDED DOWN',
    missing: 'MISSING'
  });

  const EPSILON = 1e-9;

  function finite(value) {
    if (value === null || value === undefined || value === '') return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function clamp(value, min, max) {
    const number = finite(value);
    if (number === null) return null;
    return Math.max(min, Math.min(max, number));
  }

  function round(value, digits = 0) {
    const number = finite(value);
    if (number === null) return null;
    const factor = 10 ** digits;
    return Math.round(number * factor) / factor;
  }

  function nearlyEqual(a, b) {
    return finite(a) !== null && finite(b) !== null && Math.abs(Number(a) - Number(b)) <= EPSILON;
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
      const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!preferredKeys.some((preferred) => normalizedKey.includes(preferred))) continue;
      const number = finite(candidate);
      if (number !== null) return number;
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
    return finite(value);
  }

  function classify(bounded, displayed) {
    if (finite(bounded) === null || finite(displayed) === null) return STATES.MISSING;
    if (nearlyEqual(bounded, displayed)) return STATES.EXACT;
    return displayed > bounded ? STATES.UP : STATES.DOWN;
  }

  function residue(from, to) {
    if (finite(from) === null || finite(to) === null) return null;
    return round(Number(from) - Number(to), 6);
  }

  function measure(config) {
    const source = finite(config.source);
    const bounded = finite(config.bounded);
    const normalized = finite(config.normalized);
    const displayed = finite(config.displayed);
    const state = classify(bounded, displayed);
    return Object.freeze({
      id: config.id,
      group: config.group,
      label: config.label,
      unit: config.unit,
      source,
      bounded,
      normalized,
      displayed,
      normalizationQuantum: config.normalizationQuantum,
      displayQuantum: config.displayQuantum,
      boundingApplied: source !== null && bounded !== null && !nearlyEqual(source, bounded),
      normalizationResidue: residue(bounded, normalized),
      displayResidue: residue(normalized, displayed),
      offcut: residue(bounded, displayed),
      state,
      stateLabel: STATE_LABELS[state]
    });
  }

  function earthquakeStrongestSource(payload) {
    const features = Array.isArray(payload?.features) ? payload.features : [];
    const magnitudes = features
      .filter((feature) => feature?.properties?.type === 'earthquake')
      .map((feature) => finite(feature?.properties?.mag))
      .filter((value) => value !== null);
    return magnitudes.length ? Math.max(...magnitudes) : null;
  }

  function solarSource(payload) {
    const preferred = findPreferredNumber(payload, ['speed', 'windspeed']);
    return preferred === null ? findLastNumeric(payload) : preferred;
  }

  function weatherResponses(payload) {
    return Array.isArray(payload) ? payload : payload ? [payload] : [];
  }

  function buildTrace(payloads, snapshot, stations) {
    const receivedAt = validDate(snapshot?.receivedAt);
    if (!receivedAt) {
      return Object.freeze({
        waiting: true,
        receivedAt: null,
        total: 0,
        counts: Object.freeze({ exact: 0, up: 0, down: 0, missing: 0 }),
        measures: Object.freeze([])
      });
    }

    const measures = [];
    const quakeSource = earthquakeStrongestSource(payloads?.earthquakes);
    const quakeBounded = clamp(quakeSource, -2, 10);
    const quakeNormalized = snapshot?.earthquakes?.available ? finite(snapshot.earthquakes.strongest) : null;
    measures.push(measure({
      id: 'earthquake-strongest',
      group: 'USGS',
      label: 'Strongest earthquake magnitude',
      unit: 'M',
      source: quakeSource,
      bounded: quakeBounded,
      normalized: quakeNormalized,
      displayed: quakeNormalized,
      normalizationQuantum: 0.1,
      displayQuantum: 0.1
    }));

    const solarSelected = solarSource(payloads?.solar);
    const solarBounded = clamp(solarSelected, 0, 2000);
    const solarNormalized = snapshot?.solar?.available ? finite(snapshot.solar.speed) : null;
    measures.push(measure({
      id: 'solar-wind-speed',
      group: 'NOAA FLOW',
      label: 'Solar-wind speed',
      unit: ' km/s',
      source: solarSelected,
      bounded: solarBounded,
      normalized: solarNormalized,
      displayed: solarNormalized === null ? null : Math.round(solarNormalized),
      normalizationQuantum: 0.1,
      displayQuantum: 1
    }));

    const fixedStations = Array.isArray(stations) ? stations : [];
    const responses = weatherResponses(payloads?.weather);
    const normalizedPoints = Array.isArray(snapshot?.weather?.points) ? snapshot.weather.points : [];
    const normalizedById = new Map(normalizedPoints.map((point) => [point.id, point]));

    fixedStations.forEach((station, index) => {
      const source = finite(responses[index]?.current?.temperature_2m);
      const bounded = clamp(source, -100, 70);
      const point = normalizedById.get(station.id);
      const normalized = point?.available ? finite(point.temperature) : null;
      measures.push(measure({
        id: `temperature-${station.id}`,
        group: 'OPEN-METEO',
        label: `Point ${station.id} temperature`,
        unit: '°C',
        source,
        bounded,
        normalized,
        displayed: normalized,
        normalizationQuantum: 0.1,
        displayQuantum: 0.1
      }));
    });

    const counts = { exact: 0, up: 0, down: 0, missing: 0 };
    for (const entry of measures) counts[entry.state] += 1;

    return Object.freeze({
      waiting: false,
      receivedAt: receivedAt.toISOString(),
      total: measures.length,
      counts: Object.freeze(counts),
      measures: Object.freeze(measures)
    });
  }

  function filterMeasures(trace, state) {
    const measures = Array.isArray(trace?.measures) ? trace.measures : [];
    if (!Object.values(STATES).includes(state)) return measures;
    return measures.filter((entry) => entry.state === state);
  }

  function summarySentence(trace) {
    if (!trace || trace.waiting) return 'Waiting for the first real Commons latch and its precision trace.';
    const { exact = 0, up = 0, down = 0, missing = 0 } = trace.counts || {};
    return `${trace.total} fixed numeric traces: ${exact} exact, ${up} rounded up, ${down} rounded down, ${missing} missing. These are formatting residues, not uncertainty or accuracy.`;
  }

  function validDate(value) {
    if (value === null || value === undefined || value === '') return null;
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? date : null;
  }

  return Object.freeze({
    STATES,
    STATE_LABELS,
    finite,
    clamp,
    round,
    classify,
    residue,
    buildTrace,
    filterMeasures,
    summarySentence
  });
});