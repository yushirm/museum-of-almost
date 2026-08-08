(function attachQuorumGateCore(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.MuseumQuorumGateCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function buildQuorumGateCore() {
  'use strict';

  const CASES = Object.freeze([
    Object.freeze({ id: 'precipitation', shortLabel: 'PRECIPITATION', label: 'Precipitation membership' }),
    Object.freeze({ id: 'feeds', shortLabel: 'FEED RETURN', label: 'Feed return' }),
    Object.freeze({ id: 'earthquakes', shortLabel: 'EARTHQUAKES', label: 'Significant earthquakes' }),
    Object.freeze({ id: 'events', shortLabel: 'EONET CATEGORY', label: 'Top EONET category membership' })
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

  function caseById(id) {
    return CASES.find((entry) => entry.id === id) || null;
  }

  function round(value, digits = 1) {
    const number = finite(value);
    if (number === null) return null;
    const factor = 10 ** digits;
    return Math.round(number * factor) / factor;
  }

  function sharePercent(numerator, denominator) {
    const top = finite(numerator);
    const bottom = finite(denominator);
    if (top === null || bottom === null || bottom <= 0 || top < 0 || top > bottom) return null;
    return round((top / bottom) * 100, 1);
  }

  function finitePrecipitationValues(snapshot) {
    const points = Array.isArray(snapshot?.weather?.points) ? snapshot.weather.points : [];
    return points
      .map((point) => finite(point?.precipitation))
      .filter((value) => value !== null);
  }

  function returnedFeedCount(snapshot) {
    const feeds = snapshot?.feeds;
    if (!feeds || typeof feeds !== 'object') return null;
    const keys = ['earthquakes', 'solar', 'scales', 'weather', 'events'];
    return keys.filter((key) => feeds[key] === true).length;
  }

  function topEventCategory(snapshot) {
    const categories = Array.isArray(snapshot?.events?.categories) ? snapshot.events.categories : [];
    if (!categories.length) return null;
    const first = categories[0];
    const count = finite(first?.count);
    if (count === null) return null;
    const title = String(first?.title || 'Other').trim() || 'Other';
    return Object.freeze({ title, count });
  }

  function baseResult(snapshot, id) {
    const definition = caseById(id) || CASES[0];
    const receivedAt = validDate(snapshot?.receivedAt);
    return {
      waiting: !receivedAt,
      receivedAt: receivedAt?.toISOString() || null,
      definition,
      id: definition.id,
      numerator: null,
      denominator: null,
      numeratorLabel: 'NUMERATOR',
      denominatorLabel: 'DENOMINATOR',
      percent: null,
      canAsk: Boolean(receivedAt),
      canPercent: false,
      verdict: receivedAt ? 'UNAVAILABLE' : 'WAITING FOR LATCH',
      partition: 'unavailable',
      scope: 'No current denominator contract available.',
      reason: receivedAt ? 'The current normalized latch does not expose this case.' : 'A real Commons latch is required before a fraction can be inspected.',
      pieReason: 'No partition is available.',
      detail: null
    };
  }

  function buildPrecipitation(snapshot) {
    const result = baseResult(snapshot, 'precipitation');
    if (result.waiting) return Object.freeze(result);
    if (snapshot?.weather?.available !== true) {
      result.canAsk = false;
      result.verdict = 'UNAVAILABLE';
      result.reason = 'The weather feed is unavailable in the current latch.';
      return Object.freeze(result);
    }

    const values = finitePrecipitationValues(snapshot);
    const numerator = finite(snapshot.weather.raining);
    const denominator = values.length;
    const recomputed = values.filter((value) => value > 0).length;

    result.numerator = numerator;
    result.denominator = denominator;
    result.numeratorLabel = 'FINITE VALUES > 0 MM';
    result.denominatorLabel = 'FINITE PRECIPITATION VALUES';
    result.scope = 'Only current fixed points with a finite normalized precipitation value. This is not geographic rainfall coverage.';
    result.partition = 'allowed';
    result.pieReason = 'Within the finite precipitation-value set, > 0 mm and not > 0 mm are mutually exclusive membership states. “Not > 0 mm” is not expanded into a complete dry-weather claim.';

    if (numerator === null || numerator !== recomputed) {
      result.verdict = 'CONTRACT DRIFT';
      result.reason = 'The retained precipitation count no longer matches the finite current point values, so the percentage is withheld.';
      result.partition = 'refused';
      result.pieReason = 'Partition withheld until the normalized headline contract is reconciled.';
      return Object.freeze(result);
    }

    if (denominator <= 0) {
      result.verdict = 'NO EVALUABLE POPULATION';
      result.reason = 'No current point has a finite precipitation value, so zero is not a valid denominator.';
      result.partition = 'refused';
      result.pieReason = 'A zero denominator cannot form a percentage or a pie.';
      return Object.freeze(result);
    }

    result.percent = sharePercent(numerator, denominator);
    result.canPercent = result.percent !== null;
    result.verdict = result.canPercent ? 'QUORUM VERIFIED' : 'CONTRACT DRIFT';
    result.reason = result.canPercent
      ? 'The numerator is an exact subset of the current finite precipitation-value population.'
      : 'The numerator cannot be represented as a valid subset of the retained denominator.';
    return Object.freeze(result);
  }

  function buildFeeds(snapshot) {
    const result = baseResult(snapshot, 'feeds');
    if (result.waiting) return Object.freeze(result);
    const numerator = returnedFeedCount(snapshot);
    if (numerator === null) {
      result.canAsk = false;
      result.verdict = 'UNAVAILABLE';
      result.reason = 'The current latch does not expose its five feed return states.';
      return Object.freeze(result);
    }

    result.numerator = numerator;
    result.denominator = 5;
    result.numeratorLabel = 'FEEDS THAT RETURNED';
    result.denominatorLabel = 'FIXED REQUESTED FEEDS';
    result.percent = sharePercent(numerator, 5);
    result.canPercent = result.percent !== null;
    result.verdict = result.canPercent ? 'QUORUM VERIFIED' : 'CONTRACT DRIFT';
    result.partition = result.canPercent ? 'allowed' : 'refused';
    result.scope = 'Exactly the five fixed channels requested by this Commons latch. It is an operational return fraction, not world completeness or source quality.';
    result.reason = result.canPercent
      ? 'Returned and unavailable are exhaustive states for the fixed five requested feed channels after the latch settles.'
      : 'The retained feed state falls outside the fixed five-channel contract.';
    result.pieReason = result.canPercent
      ? 'Returned versus unavailable partitions the five requested channels for this latch only.'
      : 'Partition withheld because the feed-count contract drifted.';
    return Object.freeze(result);
  }

  function buildEarthquakes(snapshot) {
    const result = baseResult(snapshot, 'earthquakes');
    if (result.waiting) return Object.freeze(result);
    if (snapshot?.earthquakes?.available !== true) {
      result.canAsk = false;
      result.verdict = 'UNAVAILABLE';
      result.reason = 'The earthquake feed is unavailable in the current latch.';
      return Object.freeze(result);
    }

    result.numerator = finite(snapshot.earthquakes.significant);
    result.denominator = null;
    result.numeratorLabel = 'FINITE MAGNITUDES ≥ 4.5';
    result.denominatorLabel = 'CLASSIFIABLE FINITE MAGNITUDES — NOT RETAINED';
    result.verdict = 'DENOMINATOR LOST';
    result.partition = 'refused';
    result.scope = 'The normalized latch retains total earthquake features and the significant count, but not the count of earthquake features with a finite magnitude.';
    result.reason = 'Total earthquake features are not a safe substitute for the missing finite-magnitude classification population.';
    result.pieReason = 'NO DENOMINATOR. NO PERCENT. The page will not silently divide by a nearby-looking count.';
    result.detail = Object.freeze({ totalEarthquakeFeatures: finite(snapshot.earthquakes.count) });
    return Object.freeze(result);
  }

  function buildEvents(snapshot) {
    const result = baseResult(snapshot, 'events');
    if (result.waiting) return Object.freeze(result);
    if (snapshot?.events?.available !== true) {
      result.canAsk = false;
      result.verdict = 'UNAVAILABLE';
      result.reason = 'The EONET feed is unavailable in the current latch.';
      return Object.freeze(result);
    }

    const denominator = finite(snapshot.events.count);
    const category = topEventCategory(snapshot);
    result.denominator = denominator;
    result.denominatorLabel = 'RETURNED OPEN EVENTS';
    result.partition = 'refused';
    result.scope = snapshot.events.capped === true
      ? 'The returned EONET window is capped at 500 events. Any share is scoped to that returned window, not all open events.'
      : 'The denominator is the current returned open-event response, not an eternal or global prevalence population.';
    result.pieReason = 'MEMBERSHIP SHARE ALLOWED. PIE CHART REFUSED. Events may carry multiple categories and only the top five category counts are retained, so the visible categories are not an exclusive exhaustive partition.';

    if (denominator === null || denominator <= 0 || !category) {
      result.canAsk = false;
      result.verdict = denominator === 0 ? 'NO EVALUABLE POPULATION' : 'UNAVAILABLE';
      result.reason = denominator === 0
        ? 'The returned event population is zero, so there is no top-category share to calculate.'
        : 'The current normalized event latch does not retain both a returned-event count and a top category count.';
      return Object.freeze(result);
    }

    result.numerator = category.count;
    result.numeratorLabel = `EVENTS TAGGED ${category.title.toUpperCase()}`;
    result.percent = sharePercent(category.count, denominator);
    if (result.percent === null) {
      result.verdict = 'CONTRACT DRIFT';
      result.reason = 'The retained top-category membership count cannot be represented as a subset of the returned-event window.';
      return Object.freeze(result);
    }

    result.canPercent = true;
    result.verdict = snapshot.events.capped === true ? 'WINDOWED QUORUM' : 'QUORUM VERIFIED · MEMBERSHIP ONLY';
    result.reason = snapshot.events.capped === true
      ? `The individual ${category.title} membership share is exact inside the capped returned window, but that window is not all open events.`
      : `The individual ${category.title} membership share is exact inside the returned event response, but the categories still do not form one pie.`;
    result.detail = Object.freeze({ categoryTitle: category.title, capped: snapshot.events.capped === true });
    return Object.freeze(result);
  }

  function buildCase(snapshot, id = 'precipitation') {
    const selected = caseById(id) || CASES[0];
    if (selected.id === 'precipitation') return buildPrecipitation(snapshot);
    if (selected.id === 'feeds') return buildFeeds(snapshot);
    if (selected.id === 'earthquakes') return buildEarthquakes(snapshot);
    if (selected.id === 'events') return buildEvents(snapshot);
    return Object.freeze(baseResult(snapshot, selected.id));
  }

  function formatPercent(value) {
    const number = finite(value);
    return number === null ? '—' : `${number.toFixed(1)}%`;
  }

  function formatFraction(result) {
    if (!result) return '—';
    const numerator = finite(result.numerator);
    const denominator = finite(result.denominator);
    if (numerator === null && denominator === null) return '— / DENOMINATOR NOT RETAINED';
    if (denominator === null) return `${numerator === null ? '—' : numerator} / DENOMINATOR NOT RETAINED`;
    return `${numerator === null ? '—' : numerator} / ${denominator}`;
  }

  function summarySentence(result, asked = false) {
    if (!result || result.waiting) return 'Waiting for the first real Commons latch before a denominator can be inspected.';
    if (!asked) return `${result.definition.label}: ${formatFraction(result)}. Ask for a percentage to make the denominator contract answer first.`;
    if (!result.canPercent) return `${result.verdict}: ${result.reason} ${result.pieReason}`;
    return `${result.verdict}: ${formatPercent(result.percent)} within the stated population. ${result.reason} ${result.pieReason}`;
  }

  return Object.freeze({
    CASES,
    finite,
    validDate,
    caseById,
    round,
    sharePercent,
    finitePrecipitationValues,
    returnedFeedCount,
    topEventCategory,
    buildCase,
    formatPercent,
    formatFraction,
    summarySentence
  });
});