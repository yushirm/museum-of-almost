(function attachIsolationBoardCore(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.MuseumIsolationBoardCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function buildIsolationBoardCore() {
  'use strict';

  const FEEDS = Object.freeze([
    Object.freeze({ id: 'earthquakes', source: 'USGS', label: 'EARTH', detail: 'past-hour earthquake catalog' }),
    Object.freeze({ id: 'solar', source: 'NOAA', label: 'FLOW', detail: 'current solar-wind speed' }),
    Object.freeze({ id: 'scales', source: 'NOAA', label: 'SCALES', detail: 'current G/S space-weather scales' }),
    Object.freeze({ id: 'weather', source: 'OPEN-METEO', label: 'WEATHER', detail: 'thirteen fixed current weather points' }),
    Object.freeze({ id: 'events', source: 'NASA', label: 'EVENTS', detail: 'currently open natural-event inventory' })
  ]);

  const CIRCUITS = Object.freeze([
    Object.freeze({ id: 'earth-motion', label: 'Earth movement', detail: 'Earthquake headline and crust summary', dependencies: Object.freeze(['earthquakes']), mode: 'all' }),
    Object.freeze({ id: 'solar-flow', label: 'Solar flow', detail: 'Near-Earth solar-wind headline', dependencies: Object.freeze(['solar']), mode: 'all' }),
    Object.freeze({ id: 'space-scales', label: 'Space-weather scales', detail: 'Current geomagnetic and radiation scales', dependencies: Object.freeze(['scales']), mode: 'all' }),
    Object.freeze({ id: 'weather-field', label: 'Thirteen weather windows', detail: 'Map readings, Difference Engine, and Planetary Section', dependencies: Object.freeze(['weather']), mode: 'all' }),
    Object.freeze({ id: 'open-events', label: 'Open natural events', detail: 'EONET count and category summary', dependencies: Object.freeze(['events']), mode: 'all' }),
    Object.freeze({ id: 'cosmic-signal', label: 'Cosmic Signal Chain', detail: 'Flow plus current G/S scale detectors', dependencies: Object.freeze(['solar', 'scales']), mode: 'any' }),
    Object.freeze({ id: 'sounding-well', label: 'Sounding Well', detail: 'Comparable source-time sounding; EONET remains intentionally unsounded', dependencies: Object.freeze(['earthquakes', 'solar', 'scales', 'weather']), mode: 'any' }),
    Object.freeze({ id: 'faultline-core', label: 'Faultline Core', detail: 'Five-feed semantic strata and availability', dependencies: Object.freeze(['earthquakes', 'solar', 'scales', 'weather', 'events']), mode: 'any' }),
    Object.freeze({ id: 'celestial-escapement', label: 'Celestial Escapement', detail: 'Frozen local clocks derived from latch time', dependencies: Object.freeze([]), mode: 'local' }),
    Object.freeze({ id: 'planetary-heliodon', label: 'Planetary Heliodon', detail: 'Local day/night geometry derived from latch time', dependencies: Object.freeze([]), mode: 'local' }),
    Object.freeze({ id: 'witness-seal', label: 'Witness Seal', detail: 'Actual latch evidence path; this simulation never recomputes or masks it', dependencies: Object.freeze([]), mode: 'actual' })
  ]);

  const FEED_IDS = Object.freeze(FEEDS.map((feed) => feed.id));
  const VALID_FEEDS = new Set(FEED_IDS);

  function hasLatch(snapshot) {
    if (!snapshot?.receivedAt) return false;
    const date = new Date(snapshot.receivedAt);
    return Number.isFinite(date.getTime());
  }

  function availabilityFromSnapshot(snapshot) {
    const feeds = snapshot?.feeds || {};
    return Object.fromEntries(FEED_IDS.map((id) => [id, feeds[id] === true]));
  }

  function normalizeTripped(input) {
    const values = input instanceof Set ? [...input] : Array.isArray(input) ? input : [];
    return new Set(values.filter((id) => VALID_FEEDS.has(id)));
  }

  function feedState(id, availability, trippedInput) {
    if (!VALID_FEEDS.has(id)) return 'unknown';
    if (availability?.[id] !== true) return 'unavailable';
    return normalizeTripped(trippedInput).has(id) ? 'tripped' : 'live';
  }

  function evaluateCircuit(circuit, snapshot, trippedInput) {
    if (!circuit) return null;
    if (!hasLatch(snapshot)) {
      return { ...circuit, state: 'waiting', active: 0, total: circuit.dependencies.length, live: [], tripped: [], unavailable: [] };
    }

    if (circuit.mode === 'local') {
      return { ...circuit, state: 'local', active: 0, total: 0, live: [], tripped: [], unavailable: [] };
    }
    if (circuit.mode === 'actual') {
      return { ...circuit, state: 'actual', active: 0, total: 0, live: [], tripped: [], unavailable: [] };
    }

    const availability = availabilityFromSnapshot(snapshot);
    const tripped = normalizeTripped(trippedInput);
    const live = [];
    const isolated = [];
    const unavailable = [];

    for (const id of circuit.dependencies) {
      const state = feedState(id, availability, tripped);
      if (state === 'live') live.push(id);
      else if (state === 'tripped') isolated.push(id);
      else unavailable.push(id);
    }

    let state = 'dark';
    if (circuit.mode === 'all') state = live.length === circuit.dependencies.length ? 'powered' : 'dark';
    else if (live.length === circuit.dependencies.length) state = 'powered';
    else if (live.length > 0) state = 'degraded';

    return { ...circuit, state, active: live.length, total: circuit.dependencies.length, live, tripped: isolated, unavailable };
  }

  function evaluateBoard(snapshot, trippedInput) {
    const tripped = normalizeTripped(trippedInput);
    const availability = availabilityFromSnapshot(snapshot);
    const latch = hasLatch(snapshot);
    const feeds = FEEDS.map((feed) => ({ ...feed, state: latch ? feedState(feed.id, availability, tripped) : 'waiting' }));
    const circuits = CIRCUITS.map((circuit) => evaluateCircuit(circuit, snapshot, tripped));
    const counts = Object.fromEntries(['powered', 'degraded', 'dark', 'local', 'actual', 'waiting'].map((state) => [state, circuits.filter((circuit) => circuit.state === state).length]));

    return {
      hasLatch: latch,
      feeds,
      circuits,
      counts,
      trippedCount: feeds.filter((feed) => feed.state === 'tripped').length,
      unavailableCount: feeds.filter((feed) => feed.state === 'unavailable').length,
      liveCount: feeds.filter((feed) => feed.state === 'live').length
    };
  }

  function stateSentence(result) {
    if (!result?.hasLatch) return 'Waiting for a real latched snapshot before a failure simulation can begin.';
    const outage = result.unavailableCount === 1 ? '1 feed is actually unavailable' : `${result.unavailableCount} feeds are actually unavailable`;
    const tripped = result.trippedCount === 1 ? '1 live feed is deliberately isolated' : `${result.trippedCount} live feeds are deliberately isolated`;
    return `${result.liveCount} feeds remain on the simulated bus; ${tripped}; ${outage}. ${result.counts.powered} circuits retain all declared feed dependencies, ${result.counts.degraded} are partial, and ${result.counts.dark} are dark.`;
  }

  return Object.freeze({ FEEDS, CIRCUITS, FEED_IDS, hasLatch, availabilityFromSnapshot, normalizeTripped, feedState, evaluateCircuit, evaluateBoard, stateSentence });
});
