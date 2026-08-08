(function attachCausalSignalCore(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.MuseumCausalSignalCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function buildCausalSignalCore() {
  'use strict';

  const EPSILON = 1e-9;

  const STATIONS = Object.freeze([
    Object.freeze({ id: 'origin', label: 'ORIGIN', x: 0, t: 0, note: 'The dispatch event. Every route begins here.' }),
    Object.freeze({ id: 'edge', label: 'EDGE', x: 2, t: 2, note: 'Exactly on the future light-cone boundary.' }),
    Object.freeze({ id: 'relay', label: 'RELAY', x: -1, t: 2, note: 'Inside the future light cone.' }),
    Object.freeze({ id: 'deep', label: 'DEEP', x: 2, t: 6, note: 'A later event reachable through the relay chain.' }),
    Object.freeze({ id: 'far', label: 'FAR', x: 4, t: 4, note: 'Directly lightlike from ORIGIN, but spacelike from RELAY.' }),
    Object.freeze({ id: 'before', label: 'BEFORE', x: -2, t: -1, note: 'Earlier than the dispatch event.' })
  ]);

  const ROUTES = Object.freeze([
    Object.freeze({
      id: 'light-edge',
      label: 'Light edge',
      summary: 'ORIGIN → EDGE. The signal reaches the boundary only at light speed.',
      stationIds: Object.freeze(['origin', 'edge'])
    }),
    Object.freeze({
      id: 'relay-chain',
      label: 'Relay chain',
      summary: 'ORIGIN → RELAY → DEEP. Every segment lies inside the future light cone.',
      stationIds: Object.freeze(['origin', 'relay', 'deep'])
    }),
    Object.freeze({
      id: 'impossible-shortcut',
      label: 'Impossible shortcut',
      summary: 'ORIGIN → RELAY clears, but RELAY → FAR would require faster-than-light propagation.',
      stationIds: Object.freeze(['origin', 'relay', 'far'])
    }),
    Object.freeze({
      id: 'past-call',
      label: 'Past call',
      summary: 'ORIGIN → BEFORE points toward an earlier event and cannot carry a future-directed signal.',
      stationIds: Object.freeze(['origin', 'before'])
    })
  ]);

  const STATUS_LABELS = Object.freeze({
    timelike: 'CLEAR',
    lightlike: 'LIGHT-SPEED EDGE',
    spacelike: 'LOCKED OUTSIDE CONE',
    past: 'LOCKED IN THE PAST'
  });

  function getStation(id) {
    return STATIONS.find((station) => station.id === id) || null;
  }

  function getRoute(id) {
    return ROUTES.find((route) => route.id === id) || null;
  }

  function classifyCoordinates(from, to) {
    if (!from || !to) return null;
    const deltaT = to.t - from.t;
    const deltaX = to.x - from.x;
    const distance = Math.abs(deltaX);

    let causalClass;
    if (deltaT < -EPSILON) causalClass = 'past';
    else if (Math.abs(deltaT - distance) <= EPSILON) causalClass = 'lightlike';
    else if (deltaT > distance) causalClass = 'timelike';
    else causalClass = 'spacelike';

    return Object.freeze({
      fromId: from.id,
      toId: to.id,
      deltaT,
      deltaX,
      distance,
      causalClass,
      reachable: causalClass === 'timelike' || causalClass === 'lightlike',
      label: STATUS_LABELS[causalClass]
    });
  }

  function classifySegment(fromId, toId) {
    return classifyCoordinates(getStation(fromId), getStation(toId));
  }

  function evaluateRoute(routeId) {
    const route = getRoute(routeId);
    if (!route) return null;

    const segments = [];
    const reachedStationIds = [];
    let firstLocked = null;

    for (let index = 0; index < route.stationIds.length - 1; index += 1) {
      const segment = classifySegment(route.stationIds[index], route.stationIds[index + 1]);
      segments.push(segment);

      if (!firstLocked && segment && segment.reachable) {
        reachedStationIds.push(segment.toId);
      } else if (!firstLocked) {
        firstLocked = segment;
      }
    }

    const outcome = firstLocked
      ? (reachedStationIds.length ? 'partial' : 'refused')
      : 'delivered';

    return Object.freeze({
      routeId: route.id,
      label: route.label,
      summary: route.summary,
      stationIds: Object.freeze([...route.stationIds]),
      segments: Object.freeze(segments),
      reachedStationIds: Object.freeze(reachedStationIds),
      firstLocked,
      outcome
    });
  }

  function statusLabel(causalClass) {
    return STATUS_LABELS[causalClass] || 'UNKNOWN';
  }

  return Object.freeze({
    EPSILON,
    STATIONS,
    ROUTES,
    STATUS_LABELS,
    getStation,
    getRoute,
    classifyCoordinates,
    classifySegment,
    evaluateRoute,
    statusLabel
  });
});
