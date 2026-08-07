(function attachFaultlineCore(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.MuseumFaultlineCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function buildFaultlineCore() {
  'use strict';

  const STRATA = Object.freeze([
    Object.freeze({
      id: 'earthquakes',
      source: 'USGS',
      label: 'EARTH',
      timeKind: 'rolling-window',
      timeLabel: 'rolling past-hour catalog',
      spaceKind: 'distributed-global-events',
      spaceLabel: 'distributed global event locations',
      shapeKind: 'event-set',
      shapeLabel: 'event set with derived summary values',
      numericFamily: 'earthquake-catalog',
      unitLabel: 'count · magnitude · depth'
    }),
    Object.freeze({
      id: 'solar',
      source: 'NOAA',
      label: 'FLOW',
      timeKind: 'source-current-state',
      timeLabel: 'source-timestamped current reading',
      spaceKind: 'near-earth-space-weather',
      spaceLabel: 'near-Earth space-weather observation',
      shapeKind: 'single-state',
      shapeLabel: 'latest scalar state',
      numericFamily: 'speed',
      unitLabel: 'km/s'
    }),
    Object.freeze({
      id: 'scales',
      source: 'NOAA',
      label: 'SCALES',
      timeKind: 'source-current-state',
      timeLabel: 'source-timestamped current scale state',
      spaceKind: 'near-earth-space-weather',
      spaceLabel: 'near-Earth / planetary space-weather state',
      shapeKind: 'single-state',
      shapeLabel: 'latest ordinal state',
      numericFamily: 'ordinal-space-weather',
      unitLabel: 'G/S levels 0–5'
    }),
    Object.freeze({
      id: 'weather',
      source: 'OPEN-METEO',
      label: 'WEATHER',
      timeKind: 'current-valid-sample',
      timeLabel: 'current-valid times at fixed points',
      spaceKind: 'fixed-global-points',
      spaceLabel: 'thirteen fixed latitude/longitude points',
      shapeKind: 'multi-point-field',
      shapeLabel: 'thirteen discrete point readings',
      numericFamily: 'weather-mix',
      unitLabel: '°C · km/h · mm'
    }),
    Object.freeze({
      id: 'events',
      source: 'NASA',
      label: 'EVENTS',
      timeKind: 'open-inventory',
      timeLabel: 'currently open inventory',
      spaceKind: 'distributed-global-events',
      spaceLabel: 'distributed global event locations',
      shapeKind: 'event-set',
      shapeLabel: 'open event set with category summary',
      numericFamily: 'event-inventory',
      unitLabel: 'count · categories'
    })
  ]);

  const STRATA_BY_ID = Object.freeze(Object.fromEntries(STRATA.map((stratum) => [stratum.id, stratum])));

  function getStratum(id) {
    return STRATA_BY_ID[id] || null;
  }

  function availabilityFromSnapshot(snapshot) {
    return Object.freeze(Object.fromEntries(
      STRATA.map((stratum) => [stratum.id, Boolean(snapshot?.feeds?.[stratum.id])])
    ));
  }

  function compareStrata(leftId, rightId, availability = {}) {
    const left = getStratum(leftId);
    const right = getStratum(rightId);
    if (!left || !right) return null;

    const sameFeed = left.id === right.id;
    const dimensions = Object.freeze([
      dimension('latch', 'Acquisition latch', true, 'Both channels belong to the same five-feed sample-and-hold cycle.'),
      dimension(
        'time',
        'Temporal support',
        left.timeKind === right.timeKind,
        left.timeKind === right.timeKind
          ? `Both use the ${left.timeLabel} support class; their exact timestamps can still differ.`
          : `${left.timeLabel} ↔ ${right.timeLabel}`
      ),
      dimension(
        'space',
        'Spatial support',
        left.spaceKind === right.spaceKind,
        left.spaceKind === right.spaceKind
          ? `Both use ${left.spaceLabel}.`
          : `${left.spaceLabel} ↔ ${right.spaceLabel}`
      ),
      dimension(
        'shape',
        'Measurement shape',
        left.shapeKind === right.shapeKind,
        left.shapeKind === right.shapeKind
          ? `Both are represented as ${left.shapeLabel}.`
          : `${left.shapeLabel} ↔ ${right.shapeLabel}`
      )
    ]);

    const structuralMatches = dimensions.slice(1).filter((entry) => entry.aligned).length;
    const numericComparable = sameFeed || (
      left.numericFamily === right.numericFamily
      && left.unitLabel === right.unitLabel
    );
    const bothAvailable = Boolean(availability[left.id]) && Boolean(availability[right.id]);

    let verdict;
    if (!bothAvailable) verdict = 'degraded';
    else if (numericComparable) verdict = 'comparable';
    else if (structuralMatches >= 2) verdict = 'shared-structure';
    else if (structuralMatches === 1) verdict = 'partial';
    else verdict = 'fault-line';

    return Object.freeze({
      left,
      right,
      dimensions,
      structuralMatches,
      numericComparable,
      bothAvailable,
      verdict,
      verdictLabel: verdictLabel(verdict),
      sentence: comparisonSentence({ left, right, structuralMatches, numericComparable, bothAvailable, verdict })
    });
  }

  function dimension(id, label, aligned, detail) {
    return Object.freeze({ id, label, aligned: Boolean(aligned), detail });
  }

  function verdictLabel(verdict) {
    if (verdict === 'degraded') return 'DEGRADED CORE';
    if (verdict === 'comparable') return 'LIKE WITH LIKE';
    if (verdict === 'shared-structure') return 'SHARED STRATA';
    if (verdict === 'partial') return 'PARTIAL ALIGNMENT';
    return 'FAULT LINE';
  }

  function comparisonSentence(result) {
    const pair = `${result.left.label} ↔ ${result.right.label}`;
    if (!result.bothAvailable) {
      return `${pair}: one or both channels are unavailable in this latch. Their declared measurement structure can still be inspected, but no missing value is inferred.`;
    }
    if (result.numericComparable) {
      return `${pair}: the selected channels share the same declared numeric family and unit.`;
    }
    if (result.structuralMatches >= 2) {
      return `${pair}: these channels share multiple support classes, but their numbers are not interchangeable. Direct numeric equivalence is refused.`;
    }
    if (result.structuralMatches === 1) {
      return `${pair}: one semantic layer aligns, while the others diverge. The latch makes them simultaneous only in acquisition, not equivalent in meaning.`;
    }
    return `${pair}: the common latch is the only shared frame. Treating these channels as one comparable scale would erase what each measurement actually is.`;
  }

  return Object.freeze({
    STRATA,
    getStratum,
    availabilityFromSnapshot,
    compareStrata
  });
});