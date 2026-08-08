(function attachGaugeBenchCore(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.MuseumGaugeBenchCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function buildGaugeBenchCore() {
  'use strict';

  const OUTCOMES = Object.freeze({
    COMMON: 'common-ruler',
    SAME_DIMENSION: 'same-dimension',
    NO_AXIS: 'no-axis'
  });

  const CLAIMS = Object.freeze([
    Object.freeze({
      id: 'quake-magnitude',
      label: 'Strongest earthquake magnitude',
      shortLabel: 'QUAKE MAG',
      source: 'earthquakes',
      key: 'strongest',
      dimension: 'magnitude scale',
      comparisonGroup: 'earthquake magnitude',
      subject: 'strongest normalized earthquake magnitude in the current past-hour set',
      unit: 'M',
      digits: 1,
      unitPosition: 'prefix'
    }),
    Object.freeze({
      id: 'quake-count',
      label: 'Earthquake count',
      shortLabel: 'QUAKE COUNT',
      source: 'earthquakes',
      key: 'count',
      dimension: 'count',
      comparisonGroup: 'past-hour earthquake count',
      subject: 'earthquakes in the current past-hour USGS set',
      unit: ' earthquakes',
      digits: 0
    }),
    Object.freeze({
      id: 'solar-speed',
      label: 'Solar-wind speed',
      shortLabel: 'SOLAR WIND',
      source: 'solar',
      key: 'speed',
      dimension: 'speed',
      comparisonGroup: 'solar-wind speed',
      subject: 'the current normalized solar-wind speed reading',
      unit: ' km/s',
      digits: 1
    }),
    Object.freeze({
      id: 'min-temp',
      label: 'Minimum fixed-point temperature',
      shortLabel: 'MIN TEMP',
      source: 'weather',
      key: 'minTemp',
      dimension: 'temperature',
      comparisonGroup: 'fixed-point air temperature',
      subject: 'temperature across the current thirteen-point weather sample',
      unit: '°C',
      digits: 1
    }),
    Object.freeze({
      id: 'max-temp',
      label: 'Maximum fixed-point temperature',
      shortLabel: 'MAX TEMP',
      source: 'weather',
      key: 'maxTemp',
      dimension: 'temperature',
      comparisonGroup: 'fixed-point air temperature',
      subject: 'temperature across the current thirteen-point weather sample',
      unit: '°C',
      digits: 1
    }),
    Object.freeze({
      id: 'mean-wind',
      label: 'Mean fixed-point terrestrial wind',
      shortLabel: 'MEAN WIND',
      source: 'weather',
      key: 'meanWind',
      dimension: 'speed',
      comparisonGroup: 'fixed-point terrestrial wind speed',
      subject: 'terrestrial wind across the current thirteen-point weather sample',
      unit: ' km/h',
      digits: 1
    }),
    Object.freeze({
      id: 'max-wind',
      label: 'Maximum fixed-point terrestrial wind',
      shortLabel: 'MAX WIND',
      source: 'weather',
      key: 'maxWind',
      dimension: 'speed',
      comparisonGroup: 'fixed-point terrestrial wind speed',
      subject: 'terrestrial wind across the current thirteen-point weather sample',
      unit: ' km/h',
      digits: 1
    }),
    Object.freeze({
      id: 'precip-count',
      label: 'Precipitation-reporting point count',
      shortLabel: 'PRECIP COUNT',
      source: 'weather',
      key: 'raining',
      dimension: 'count',
      comparisonGroup: 'positive-precipitation point count',
      subject: 'fixed weather points with finite current precipitation greater than zero',
      unit: ' points',
      digits: 0
    }),
    Object.freeze({
      id: 'event-count',
      label: 'Open natural-event count',
      shortLabel: 'OPEN EVENTS',
      source: 'events',
      key: 'count',
      dimension: 'count',
      comparisonGroup: 'open EONET event count',
      subject: 'open natural events in the current normalized EONET snapshot',
      unit: ' events',
      digits: 0
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

  function claimById(id) {
    return CLAIMS.find((claim) => claim.id === id) || null;
  }

  function currentValue(snapshot, claimOrId) {
    const claim = typeof claimOrId === 'string' ? claimById(claimOrId) : claimOrId;
    if (!claim) return null;
    const source = snapshot?.[claim.source];
    if (!source || source.available !== true) return null;
    return finite(source[claim.key]);
  }

  function comparisonContract(leftOrId, rightOrId) {
    const left = typeof leftOrId === 'string' ? claimById(leftOrId) : leftOrId;
    const right = typeof rightOrId === 'string' ? claimById(rightOrId) : rightOrId;
    if (!left || !right) return null;

    if (left.comparisonGroup === right.comparisonGroup) {
      return Object.freeze({
        outcome: OUTCOMES.COMMON,
        label: 'COMMON RULER',
        reason: `Both claims belong to the Museum-local “${left.comparisonGroup}” comparison group. A native-unit difference is permitted.`,
        commonDimension: left.dimension
      });
    }

    if (left.dimension === right.dimension) {
      return Object.freeze({
        outcome: OUTCOMES.SAME_DIMENSION,
        label: 'SAME DIMENSION, DIFFERENT THING',
        reason: `Both claims have the “${left.dimension}” dimension, but they describe different semantic subjects. The Museum refuses one shared magnitude axis.`,
        commonDimension: left.dimension
      });
    }

    return Object.freeze({
      outcome: OUTCOMES.NO_AXIS,
      label: 'NO COMMON AXIS',
      reason: `The claims belong to different dimension families: “${left.dimension}” and “${right.dimension}”. No shared magnitude axis is declared here.`,
      commonDimension: null
    });
  }

  function difference(leftValue, rightValue, contract, digits) {
    if (contract?.outcome !== OUTCOMES.COMMON) return null;
    const left = finite(leftValue);
    const right = finite(rightValue);
    if (left === null || right === null) return null;
    const factor = 10 ** digits;
    return Math.round((right - left) * factor) / factor;
  }

  function buildPair(snapshot, leftId = 'min-temp', rightId = 'max-temp') {
    const receivedAt = validDate(snapshot?.receivedAt);
    const left = claimById(leftId);
    const right = claimById(rightId);
    if (!left || !right) return Object.freeze({ waiting: !receivedAt, receivedAt: receivedAt?.toISOString() || null, left: null, right: null, contract: null, delta: null, canDrawRuler: false });

    const contract = comparisonContract(left, right);
    const leftValue = receivedAt ? currentValue(snapshot, left) : null;
    const rightValue = receivedAt ? currentValue(snapshot, right) : null;
    const canDrawRuler = Boolean(
      receivedAt
      && left.id !== right.id
      && contract?.outcome === OUTCOMES.COMMON
      && leftValue !== null
      && rightValue !== null
    );
    const digits = Math.max(left.digits, right.digits);

    return Object.freeze({
      waiting: !receivedAt,
      receivedAt: receivedAt?.toISOString() || null,
      left: Object.freeze({ ...left, value: leftValue, missing: leftValue === null }),
      right: Object.freeze({ ...right, value: rightValue, missing: rightValue === null }),
      contract,
      delta: difference(leftValue, rightValue, contract, digits),
      canDrawRuler
    });
  }

  function formatValue(claim, value) {
    const number = finite(value);
    if (!claim || number === null) return '—';
    const formatted = number.toLocaleString('en-US', {
      minimumFractionDigits: claim.digits,
      maximumFractionDigits: claim.digits,
      useGrouping: false
    });
    return claim.unitPosition === 'prefix' ? `${claim.unit}${formatted}` : `${formatted}${claim.unit}`;
  }

  function formatDelta(pair) {
    if (!pair?.canDrawRuler || pair.delta === null) return '—';
    const digits = Math.max(pair.left.digits, pair.right.digits);
    const absolute = Math.abs(pair.delta).toLocaleString('en-US', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
      useGrouping: false
    });
    const sign = pair.delta > 0 ? '+' : pair.delta < 0 ? '−' : '±';
    const unit = pair.left.unitPosition === 'prefix' ? pair.left.unit : pair.left.unit;
    return pair.left.unitPosition === 'prefix' ? `${sign}${unit}${absolute}` : `${sign}${absolute}${unit}`;
  }

  function summarySentence(pair) {
    if (!pair || pair.waiting) return 'Waiting for the first real Commons latch before testing a comparison contract.';
    if (!pair.left || !pair.right || !pair.contract) return 'Choose two declared Commons claims to inspect their comparison contract.';
    if (pair.left.missing || pair.right.missing) {
      return `${pair.contract.label}. The contract can be stated, but one or both current values are missing, so no numerical comparison is drawn.`;
    }
    if (pair.contract.outcome === OUTCOMES.COMMON) {
      return `${pair.contract.label}. A native-unit difference may be shown because these claims share one declared comparison group.`;
    }
    return `${pair.contract.label}. The page refuses a ratio, percent difference, winner, normalized score, or shared ruler for this pair.`;
  }

  return Object.freeze({
    OUTCOMES,
    CLAIMS,
    finite,
    validDate,
    claimById,
    currentValue,
    comparisonContract,
    difference,
    buildPair,
    formatValue,
    formatDelta,
    summarySentence
  });
});