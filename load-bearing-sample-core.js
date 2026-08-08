(function attachLoadBearingSampleCore(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.MuseumLoadBearingSampleCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function buildLoadBearingSampleCore() {
  'use strict';

  const CLAIM_IDS = Object.freeze(['min-temp', 'max-temp', 'mean-wind', 'max-wind', 'precip-count']);
  const CLAIMS = Object.freeze([
    Object.freeze({ id: 'min-temp', label: 'Minimum temperature', shortLabel: 'MIN TEMP', key: 'temperature', aggregate: 'min', unit: '°C', digits: 1 }),
    Object.freeze({ id: 'max-temp', label: 'Maximum temperature', shortLabel: 'MAX TEMP', key: 'temperature', aggregate: 'max', unit: '°C', digits: 1 }),
    Object.freeze({ id: 'mean-wind', label: 'Mean wind', shortLabel: 'MEAN WIND', key: 'wind', aggregate: 'mean', unit: ' km/h', digits: 1 }),
    Object.freeze({ id: 'max-wind', label: 'Maximum wind', shortLabel: 'MAX WIND', key: 'wind', aggregate: 'max', unit: ' km/h', digits: 1 }),
    Object.freeze({ id: 'precip-count', label: 'Precipitation count', shortLabel: 'PRECIP COUNT', key: 'precipitation', aggregate: 'positive-count', unit: '', digits: 0 })
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

  function round(value, digits = 1) {
    const number = finite(value);
    if (number === null) return null;
    const factor = 10 ** digits;
    return Math.round(number * factor) / factor;
  }

  function pointAvailable(point) {
    if (!point || typeof point !== 'object') return false;
    if (point.available === true) return true;
    return ['temperature', 'wind', 'precipitation'].some((key) => finite(point[key]) !== null);
  }

  function aggregateValue(points, claim) {
    const available = (Array.isArray(points) ? points : []).filter(pointAvailable);
    if (!available.length) return null;

    if (claim.aggregate === 'positive-count') {
      return available.filter((point) => {
        const value = finite(point[claim.key]);
        return value !== null && value > 0;
      }).length;
    }

    const values = available.map((point) => finite(point[claim.key])).filter((value) => value !== null);
    if (!values.length) return null;
    if (claim.aggregate === 'min') return round(Math.min(...values), claim.digits);
    if (claim.aggregate === 'max') return round(Math.max(...values), claim.digits);
    if (claim.aggregate === 'mean') {
      return round(values.reduce((sum, value) => sum + value, 0) / values.length, claim.digits);
    }
    return null;
  }

  function authoritativeValue(snapshot, claim) {
    const weather = snapshot?.weather;
    if (!weather?.available) return null;
    if (claim.id === 'min-temp') return finite(weather.minTemp);
    if (claim.id === 'max-temp') return finite(weather.maxTemp);
    if (claim.id === 'mean-wind') return finite(weather.meanWind);
    if (claim.id === 'max-wind') return finite(weather.maxWind);
    if (claim.id === 'precip-count') return finite(weather.raining);
    return null;
  }

  function sameHeadline(left, right) {
    if (left === null || right === null) return left === right;
    return Number(left) === Number(right);
  }

  function stateLabel(state) {
    return ({
      bearing: 'LOAD-BEARING FOR THIS HEADLINE',
      unchanged: 'HEADLINE UNCHANGED',
      sole: 'SOLE SUPPORT FOR THIS HEADLINE',
      missing: 'MISSING FOR THIS CLAIM'
    })[state] || 'MISSING FOR THIS CLAIM';
  }

  function difference(current, hypothetical, claim) {
    if (current === null || hypothetical === null) return null;
    return round(hypothetical - current, claim.digits);
  }

  function analyzePoint(snapshot, claim, station) {
    const points = Array.isArray(snapshot?.weather?.points) ? snapshot.weather.points : [];
    const point = points.find((candidate) => String(candidate?.id) === String(station.id)) || null;
    const value = point && pointAvailable(point) ? finite(point[claim.key]) : null;
    const current = authoritativeValue(snapshot, claim);

    if (value === null) {
      return Object.freeze({
        id: String(station.id),
        label: `Point ${station.id}`,
        claimId: claim.id,
        state: 'missing',
        stateLabel: stateLabel('missing'),
        value: null,
        current,
        hypothetical: null,
        delta: null,
        canPull: false
      });
    }

    const remaining = points.filter((candidate) => String(candidate?.id) !== String(station.id));
    const hypothetical = aggregateValue(remaining, claim);
    const state = hypothetical === null
      ? 'sole'
      : sameHeadline(current, hypothetical) ? 'unchanged' : 'bearing';

    return Object.freeze({
      id: String(station.id),
      label: `Point ${station.id}`,
      claimId: claim.id,
      state,
      stateLabel: stateLabel(state),
      value,
      current,
      hypothetical,
      delta: difference(current, hypothetical, claim),
      canPull: true
    });
  }

  function buildClaim(snapshot, claim, stations) {
    const entries = stations.map((station) => analyzePoint(snapshot, claim, station));
    const evaluable = entries.filter((entry) => entry.canPull);
    const loadBearing = evaluable.filter((entry) => entry.state === 'bearing' || entry.state === 'sole');
    return Object.freeze({
      ...claim,
      current: authoritativeValue(snapshot, claim),
      total: entries.length,
      evaluableCount: evaluable.length,
      loadBearingCount: loadBearing.length,
      unchangedCount: evaluable.filter((entry) => entry.state === 'unchanged').length,
      soleCount: evaluable.filter((entry) => entry.state === 'sole').length,
      missingCount: entries.filter((entry) => entry.state === 'missing').length,
      entries: Object.freeze(entries)
    });
  }

  function buildRig(snapshot, stations) {
    const receivedAt = validDate(snapshot?.receivedAt);
    const fixedStations = Array.isArray(stations) ? stations : [];
    if (!receivedAt) {
      return Object.freeze({ waiting: true, receivedAt: null, claims: Object.freeze([]) });
    }

    const claims = CLAIMS.map((claim) => buildClaim(snapshot, claim, fixedStations));
    return Object.freeze({
      waiting: false,
      receivedAt: receivedAt.toISOString(),
      claims: Object.freeze(claims)
    });
  }

  function claimById(rig, claimId) {
    const claims = Array.isArray(rig?.claims) ? rig.claims : [];
    return claims.find((claim) => claim.id === claimId) || claims[0] || null;
  }

  function entryById(claim, stationId) {
    const entries = Array.isArray(claim?.entries) ? claim.entries : [];
    return entries.find((entry) => String(entry.id) === String(stationId)) || null;
  }

  function summarySentence(rig, claimId) {
    if (!rig || rig.waiting) return 'Waiting for the first real Commons latch before testing one-point omissions.';
    const claim = claimById(rig, claimId);
    if (!claim) return 'No weather aggregate is available for this load test.';
    if (claim.current === null) return `${claim.label} is unavailable in this latch. No hypothetical omission is substituted for missing current evidence.`;
    return `${claim.loadBearingCount} of ${claim.evaluableCount} evaluable current points change or remove the ${claim.label.toLowerCase()} headline when omitted one at a time. This is claim sensitivity only, not importance, quality, representativeness, or uncertainty.`;
  }

  return Object.freeze({
    CLAIM_IDS,
    CLAIMS,
    finite,
    validDate,
    round,
    pointAvailable,
    aggregateValue,
    authoritativeValue,
    sameHeadline,
    stateLabel,
    difference,
    analyzePoint,
    buildClaim,
    buildRig,
    claimById,
    entryById,
    summarySentence
  });
});
