(function attachRestScoreCore(root, factory) {
  const dependency = typeof module === 'object' && module.exports
    ? require('./cosmic-signal-core.js')
    : root.MuseumCosmicSignalCore;
  const api = factory(dependency);
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.MuseumRestScoreCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function buildRestScoreCore(cosmicCore) {
  'use strict';

  const STATES = Object.freeze({
    SOUNDED: 'sounded',
    REST: 'rest',
    MISSING: 'missing',
    NOT_APPLICABLE: 'not-applicable'
  });

  const STATE_LABELS = Object.freeze({
    [STATES.SOUNDED]: 'SOUNDED VALUE',
    [STATES.REST]: 'WRITTEN ZERO',
    [STATES.MISSING]: 'MISSING MEASURE',
    [STATES.NOT_APPLICABLE]: 'NOT APPLICABLE'
  });

  function finite(value) {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
  }

  function validDate(value) {
    if (value === null || value === undefined || value === '') return null;
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? date : null;
  }

  function measure({ id, group, label, source, state, display, note }) {
    return Object.freeze({
      id,
      group,
      label,
      source,
      state,
      stateLabel: STATE_LABELS[state],
      display,
      note
    });
  }

  function missingMeasure(id, group, label, source, note = 'The current latch does not contain this reading.') {
    return measure({
      id,
      group,
      label,
      source,
      state: STATES.MISSING,
      display: '—',
      note
    });
  }

  function zeroAwareMeasure({ id, group, label, source, available, value, displayValue, zeroNote, valueNote }) {
    const number = finite(value);
    if (!available || number === null) return missingMeasure(id, group, label, source);
    if (number === 0) {
      return measure({
        id,
        group,
        label,
        source,
        state: STATES.REST,
        display: displayValue(number),
        note: zeroNote
      });
    }
    return measure({
      id,
      group,
      label,
      source,
      state: STATES.SOUNDED,
      display: displayValue(number),
      note: valueNote
    });
  }

  function valueMeasure({ id, group, label, source, available, value, displayValue, note }) {
    const number = finite(value);
    if (!available || number === null) return missingMeasure(id, group, label, source);
    return measure({
      id,
      group,
      label,
      source,
      state: STATES.SOUNDED,
      display: displayValue(number),
      note
    });
  }

  function buildScore(snapshot) {
    const latchedAt = validDate(snapshot?.receivedAt);
    if (!latchedAt) {
      return Object.freeze({
        waiting: true,
        receivedAt: null,
        measures: Object.freeze([]),
        counts: Object.freeze({ sounded: 0, rest: 0, missing: 0, 'not-applicable': 0 }),
        total: 0
      });
    }

    const measures = [];
    const quakeFeed = snapshot?.feeds?.earthquakes === true && snapshot?.earthquakes?.available === true;
    const quakeCount = finite(snapshot?.earthquakes?.count);

    measures.push(zeroAwareMeasure({
      id: 'earthquake-count',
      group: 'USGS',
      label: 'Earthquakes recorded in the past hour',
      source: 'USGS earthquake feed',
      available: quakeFeed,
      value: quakeCount,
      displayValue: (value) => `${Math.trunc(value)} recorded`,
      zeroNote: 'Zero recorded events is an explicit current count, not a failed feed.',
      valueNote: 'A nonzero count is a current reported value.'
    }));

    if (!quakeFeed || quakeCount === null) {
      measures.push(missingMeasure(
        'earthquake-strongest',
        'USGS',
        'Strongest earthquake magnitude',
        'USGS earthquake feed',
        'Without the current earthquake feed, the strongest-event field is unknown rather than not applicable.'
      ));
    } else if (quakeCount === 0) {
      measures.push(measure({
        id: 'earthquake-strongest',
        group: 'USGS',
        label: 'Strongest earthquake magnitude',
        source: 'USGS earthquake feed',
        state: STATES.NOT_APPLICABLE,
        display: 'NO EVENT',
        note: 'With zero recorded events, no strongest event exists to report.'
      }));
    } else {
      measures.push(valueMeasure({
        id: 'earthquake-strongest',
        group: 'USGS',
        label: 'Strongest earthquake magnitude',
        source: 'USGS earthquake feed',
        available: true,
        value: snapshot?.earthquakes?.strongest,
        displayValue: (value) => `M${value.toFixed(1)}`,
        note: 'Magnitude zero, if reported, would still be a sounded value here; numeric zero does not automatically mean silence.'
      }));
    }

    const solarFeed = snapshot?.feeds?.solar === true && snapshot?.solar?.available === true;
    measures.push(valueMeasure({
      id: 'solar-wind-speed',
      group: 'NOAA FLOW',
      label: 'Solar-wind speed',
      source: 'NOAA SWPC solar-wind summary',
      available: solarFeed,
      value: snapshot?.solar?.speed,
      displayValue: (value) => `${Math.round(value)} km/s`,
      note: 'This field is a speed reading. Numeric zero would remain a value, not a written rest.'
    }));

    const scalesFeed = snapshot?.feeds?.scales === true && snapshot?.scales?.available === true;
    const scales = cosmicCore?.normalizeNoaaScales
      ? cosmicCore.normalizeNoaaScales(snapshot?.scales?.value)
      : null;

    for (const [id, label, scale] of [
      ['geomagnetic-scale', 'Geomagnetic storm scale', scales?.geomagnetic],
      ['radiation-scale', 'Solar radiation storm scale', scales?.radiation]
    ]) {
      measures.push(zeroAwareMeasure({
        id,
        group: 'NOAA SCALES',
        label,
        source: 'NOAA SWPC current scales',
        available: scalesFeed && scale?.available === true,
        value: scale?.scale,
        displayValue: (value) => `${id === 'geomagnetic-scale' ? 'G' : 'S'}${Math.trunc(value)}`,
        zeroNote: 'Scale zero explicitly means none at this current scale reading.',
        valueNote: 'A nonzero scale is a current reported storm category.'
      }));
    }

    const weatherFeed = snapshot?.feeds?.weather === true && snapshot?.weather?.available === true;
    const points = Array.isArray(snapshot?.weather?.points) ? snapshot.weather.points : [];
    for (let index = 0; index < 13; index += 1) {
      const point = points[index];
      const id = String(point?.id ?? index + 1).padStart(2, '0');
      measures.push(zeroAwareMeasure({
        id: `precipitation-${id}`,
        group: 'OPEN-METEO',
        label: `Point ${id} precipitation`,
        source: 'Open-Meteo current weather',
        available: weatherFeed && point?.available === true,
        value: point?.precipitation,
        displayValue: (value) => `${value.toFixed(1)} mm`,
        zeroNote: '0.0 mm is an explicit current precipitation value at this fixed point.',
        valueNote: 'A nonzero current precipitation value is reported at this fixed point.'
      }));
    }

    const eventsFeed = snapshot?.feeds?.events === true && snapshot?.events?.available === true;
    measures.push(zeroAwareMeasure({
      id: 'open-events',
      group: 'NASA EONET',
      label: 'Open natural events in this snapshot',
      source: 'NASA EONET open-events response',
      available: eventsFeed,
      value: snapshot?.events?.count,
      displayValue: (value) => snapshot?.events?.capped ? `${Math.trunc(value)}+ open` : `${Math.trunc(value)} open`,
      zeroNote: 'Zero open events is an explicit current response count, not an unavailable service.',
      valueNote: 'A nonzero open-event count is present in the current response.'
    }));

    const counts = {
      sounded: 0,
      rest: 0,
      missing: 0,
      'not-applicable': 0
    };
    for (const entry of measures) counts[entry.state] += 1;

    return Object.freeze({
      waiting: false,
      receivedAt: latchedAt.toISOString(),
      measures: Object.freeze(measures),
      counts: Object.freeze(counts),
      total: measures.length
    });
  }

  function filterMeasures(score, filter = 'all') {
    if (!score || !Array.isArray(score.measures)) return [];
    if (filter === 'all') return score.measures.slice();
    if (!Object.values(STATES).includes(filter)) return score.measures.slice();
    return score.measures.filter((entry) => entry.state === filter);
  }

  function scoreSentence(score) {
    if (!score || score.waiting) return 'Waiting for the first real Commons snapshot before writing the score.';
    return `${score.total} fixed semantic measures: ${score.counts.sounded} sounded values, ${score.counts.rest} written zeros, ${score.counts.missing} missing measures, and ${score.counts['not-applicable']} not applicable. These counts are categories, not a completeness score.`;
  }

  return Object.freeze({ STATES, STATE_LABELS, finite, validDate, buildScore, filterMeasures, scoreSentence });
});
