(function attachReverseLedgerCore(root, factory) {
  const commonsCore = typeof module === 'object' && module.exports
    ? require('./data-core.js')
    : root.MuseumCommonsCore;
  const exposureCore = typeof module === 'object' && module.exports
    ? require('./exposure-plate-core.js')
    : root.MuseumExposurePlateCore;
  const api = factory(commonsCore, exposureCore);
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.MuseumReverseLedgerCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function buildReverseLedgerCore(commonsCore, exposureCore) {
  'use strict';

  const CLAIMS = Object.freeze([
    Object.freeze({ id: 'earthquake-count', label: 'Earthquakes · past hour' }),
    Object.freeze({ id: 'solar-wind', label: 'Solar wind · now' }),
    Object.freeze({ id: 'weather-range', label: '13-point temperature range' }),
    Object.freeze({ id: 'event-count', label: 'Open natural events' }),
    Object.freeze({ id: 'daylight-count', label: 'Fixed points in daylight' }),
    Object.freeze({ id: 'exposure-farthest', label: 'Exposure Plate farthest grid center' })
  ]);

  const NODE_TYPES = Object.freeze({
    displayed: 'DISPLAYED',
    derived: 'DERIVED',
    normalized: 'NORMALIZED',
    source: 'SOURCE',
    fixed: 'FIXED INPUT',
    local: 'LOCAL INPUT'
  });

  function finite(value) {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
  }

  function validDate(value) {
    if (value === null || value === undefined || value === '') return null;
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? date : null;
  }

  function node(id, type, label, detail, state = 'present') {
    return Object.freeze({ id, type, label, detail, state });
  }

  function edge(from, to) {
    return Object.freeze({ from, to, label: 'OWES TO' });
  }

  function finalize(id, label, value, nodes, edges, note) {
    const nodeIds = new Set(nodes.map((entry) => entry.id));
    const validEdges = edges.filter((entry) => nodeIds.has(entry.from) && nodeIds.has(entry.to));
    const missing = nodes.filter((entry) => entry.state === 'missing');
    return Object.freeze({
      id,
      label,
      value,
      complete: value !== null && missing.length === 0,
      missingCount: missing.length,
      nodes: Object.freeze(nodes),
      edges: Object.freeze(validEdges),
      note
    });
  }

  function sourceState(snapshot, feedId) {
    return snapshot?.feeds?.[feedId] === true ? 'present' : 'missing';
  }

  function earthquakeTrace(snapshot) {
    const source = sourceState(snapshot, 'earthquakes');
    const count = source === 'present' && snapshot?.earthquakes?.available === true
      ? finite(snapshot.earthquakes.count)
      : null;
    const value = count === null ? null : `${count} recorded`;
    const normalizedState = count === null ? 'missing' : 'present';
    return finalize('earthquake-count', 'Earthquakes · past hour', value, [
      node('display', 'displayed', 'Headline earthquake count', value || 'Unavailable in this latch.', value ? 'present' : 'missing'),
      node('normalized', 'normalized', 'Museum earthquake summary', count === null
        ? 'No normalized current count is available.'
        : `${count} earthquake features remain after the Museum keeps earthquake records from the current USGS feed.`, normalizedState),
      node('source', 'source', 'USGS earthquake feed', source === 'present'
        ? 'The current all-earthquakes, past-hour public feed answered this latch.'
        : 'The USGS earthquake feed did not answer this latch.', source)
    ], [edge('display', 'normalized'), edge('normalized', 'source')],
    'This trace explains ancestry only. It does not independently verify USGS reporting or the Museum normalization.');
  }

  function solarTrace(snapshot) {
    const source = sourceState(snapshot, 'solar');
    const speed = source === 'present' && snapshot?.solar?.available === true
      ? finite(snapshot.solar.speed)
      : null;
    const value = speed === null ? null : `${speed.toFixed(1)} km/s`;
    const normalizedState = speed === null ? 'missing' : 'present';
    return finalize('solar-wind', 'Solar wind · now', value, [
      node('display', 'displayed', 'Solar-wind headline', value || 'Unavailable in this latch.', value ? 'present' : 'missing'),
      node('normalized', 'normalized', 'Museum solar-wind value', speed === null
        ? 'No normalized current speed is available.'
        : `The current NOAA product is reduced to a finite speed value of ${speed.toFixed(1)} km/s.`, normalizedState),
      node('source', 'source', 'NOAA SWPC solar-wind product', source === 'present'
        ? 'The current public solar-wind-speed product answered this latch.'
        : 'The NOAA solar-wind feed did not answer this latch.', source)
    ], [edge('display', 'normalized'), edge('normalized', 'source')],
    'Trace completeness is not a quality, certainty, or causal claim about the solar wind.');
  }

  function weatherTrace(snapshot) {
    const source = sourceState(snapshot, 'weather');
    const min = source === 'present' ? finite(snapshot?.weather?.minTemp) : null;
    const max = source === 'present' ? finite(snapshot?.weather?.maxTemp) : null;
    const points = Array.isArray(snapshot?.weather?.points) ? snapshot.weather.points : [];
    const temperatures = points.map((point) => finite(point?.temperature)).filter((value) => value !== null);
    const value = min === null || max === null ? null : `${min.toFixed(1)}°C → ${max.toFixed(1)}°C`;
    const normalizedState = temperatures.length ? 'present' : 'missing';
    return finalize('weather-range', '13-point temperature range', value, [
      node('display', 'displayed', '13-point temperature range', value || 'Unavailable in this latch.', value ? 'present' : 'missing'),
      node('aggregate', 'derived', 'Local min/max aggregation', value
        ? `The Museum takes the minimum and maximum across ${temperatures.length} currently available normalized temperatures.`
        : 'A current minimum and maximum cannot be formed.', value ? 'present' : 'missing'),
      node('normalized', 'normalized', 'Current fixed-point temperatures', temperatures.length
        ? `${temperatures.length} of 13 fixed points contain a finite normalized current temperature.`
        : 'No fixed point contains a normalized current temperature.', normalizedState),
      node('fixed', 'fixed', 'Thirteen fixed sampling coordinates', 'The coordinates are baked into the Museum and are unrelated to the visitor.', 'present'),
      node('source', 'source', 'Open-Meteo current weather response', source === 'present'
        ? 'The shared Open-Meteo request for the thirteen fixed coordinates answered this latch.'
        : 'The Open-Meteo weather feed did not answer this latch.', source)
    ], [
      edge('display', 'aggregate'),
      edge('aggregate', 'normalized'),
      edge('normalized', 'source'),
      edge('normalized', 'fixed')
    ], 'The range is a local aggregate of sparse points, not a continuous global temperature surface.');
  }

  function eventTrace(snapshot) {
    const source = sourceState(snapshot, 'events');
    const count = source === 'present' && snapshot?.events?.available === true
      ? finite(snapshot.events.count)
      : null;
    const value = count === null ? null : `${count}${snapshot?.events?.capped ? '+' : ''} open events`;
    const normalizedState = count === null ? 'missing' : 'present';
    return finalize('event-count', 'Open natural events', value, [
      node('display', 'displayed', 'Open natural-event count', value || 'Unavailable in this latch.', value ? 'present' : 'missing'),
      node('normalized', 'normalized', 'Museum EONET summary', count === null
        ? 'No normalized current event count is available.'
        : `${count}${snapshot?.events?.capped ? '+' : ''} currently open records are represented by the normalized summary.`, normalizedState),
      node('source', 'source', 'NASA EONET open-events feed', source === 'present'
        ? 'The current public open-events request answered this latch.'
        : 'The NASA EONET feed did not answer this latch.', source)
    ], [edge('display', 'normalized'), edge('normalized', 'source')],
    'The trace identifies the source path; it does not certify event completeness across the world.');
  }

  function daylightTrace(snapshot) {
    const date = validDate(snapshot?.receivedAt);
    const states = date && commonsCore?.STATIONS && commonsCore?.sunState
      ? commonsCore.STATIONS.map((station) => commonsCore.sunState(date, station.lat, station.lon))
      : [];
    const usable = states.filter((state) => state === 'day' || state === 'twilight' || state === 'night');
    const count = usable.length === commonsCore?.STATIONS?.length
      ? usable.filter((state) => state === 'day').length
      : null;
    const value = count === null ? null : `${count}/13 in daylight`;
    return finalize('daylight-count', 'Fixed points in daylight', value, [
      node('display', 'displayed', 'Map daylight count', value || 'Unavailable until a snapshot instant exists.', value ? 'present' : 'missing'),
      node('derived', 'derived', 'Local solar-elevation classification', value
        ? 'For each fixed coordinate, the Museum derives solar elevation and labels it day, twilight, or night.'
        : 'Solar elevation cannot be classified without a valid latch instant.', value ? 'present' : 'missing'),
      node('local', 'local', 'Snapshot latch instant', date
        ? `The browser device clock captured ${date.toISOString()} when the five-feed acquisition settled.`
        : 'No valid snapshot latch instant exists yet.', date ? 'present' : 'missing'),
      node('fixed', 'fixed', 'Thirteen fixed coordinates', 'The same fixed non-personal coordinates used by the weather sample are used for local solar geometry.', 'present')
    ], [edge('display', 'derived'), edge('derived', 'local'), edge('derived', 'fixed')],
    'This claim has no live astronomy feed. Its upstream inputs are the local latch instant, fixed coordinates, and deterministic geometry.');
  }

  function exposureTrace(snapshot) {
    const field = exposureCore?.distanceField ? exposureCore.distanceField(snapshot) : null;
    const farthest = field?.available ? field.farthest : null;
    const value = farthest
      ? `≈ ${Number(farthest.distanceKm).toLocaleString('en-US')} km → Point ${farthest.nearestId}`
      : null;
    const source = sourceState(snapshot, 'weather');
    const stationState = field?.stationCount > 0 ? 'present' : 'missing';
    return finalize('exposure-farthest', 'Exposure Plate farthest grid center', value, [
      node('display', 'displayed', 'Exposure Plate farthest tested center', value || 'Unavailable in this latch.', value ? 'present' : 'missing'),
      node('search', 'derived', '10° grid search', farthest
        ? 'The Museum compares all 648 fixed grid-cell centers and keeps the largest nearest-sample distance.'
        : 'The grid search cannot resolve a distance field without current weather evidence.', farthest ? 'present' : 'missing'),
      node('geometry', 'derived', 'Great-circle nearest-sample distance', farthest
        ? 'Each tested grid center is compared with currently available weather points using the shared great-circle distance function.'
        : 'No current nearest-sample distances are available.', farthest ? 'present' : 'missing'),
      node('normalized', 'normalized', 'Currently available weather points', field?.stationCount
        ? `${field.stationCount} current fixed weather points participate in this distance field.`
        : 'No current fixed weather point participates in the distance field.', stationState),
      node('fixed', 'fixed', 'Fixed stations + fixed 10° grid', 'The thirteen station coordinates and the coarse 10° × 10° grid are local, fixed inputs.', 'present'),
      node('source', 'source', 'Open-Meteo current weather response', source === 'present'
        ? 'The weather feed answered this latch; only points with current normalized values can participate.'
        : 'The Open-Meteo weather feed did not answer this latch.', source)
    ], [
      edge('display', 'search'),
      edge('search', 'geometry'),
      edge('search', 'normalized'),
      edge('search', 'fixed'),
      edge('normalized', 'source'),
      edge('geometry', 'fixed')
    ], 'The farthest value is distance from current evidence only. It is not uncertainty, accuracy, representativeness, or an exact continuous global maximum.');
  }

  function traceClaim(snapshot, claimId) {
    switch (claimId) {
      case 'solar-wind': return solarTrace(snapshot);
      case 'weather-range': return weatherTrace(snapshot);
      case 'event-count': return eventTrace(snapshot);
      case 'daylight-count': return daylightTrace(snapshot);
      case 'exposure-farthest': return exposureTrace(snapshot);
      case 'earthquake-count':
      default: return earthquakeTrace(snapshot);
    }
  }

  function traceSentence(trace) {
    if (!trace) return 'No claim trace is available.';
    if (trace.complete) {
      return `Trace complete: ${trace.nodes.length} accounts and ${trace.edges.length} explicit dependency entries. Complete means the expected ancestry is visible, not that the claim is independently verified.`;
    }
    const missing = trace.nodes.filter((entry) => entry.state === 'missing').map((entry) => entry.label);
    return `Trace open: ${missing.length} expected ${missing.length === 1 ? 'account is' : 'accounts are'} unavailable — ${missing.join('; ')}.`;
  }

  return Object.freeze({ CLAIMS, NODE_TYPES, finite, validDate, traceClaim, traceSentence });
});
