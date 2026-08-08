(function attachUnequalMinuteCore(root, factory) {
  'use strict';

  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.MuseumUnequalMinuteCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function buildUnequalMinuteCore() {
  'use strict';

  const COORDINATE_STEP_SECONDS = 60;

  const STATIONS = Object.freeze([
    Object.freeze({
      id: 'r1-1',
      label: 'BRINK STATION',
      radiusRatio: 1.1,
      radiusText: 'r = 1.1 rₛ',
      exactLapse: '1 / √11',
      exactStep: '60 / √11 s',
      note: 'Closest offered hovering station. It remains outside the horizon; the horizon itself is deliberately excluded.'
    }),
    Object.freeze({
      id: 'r1-5',
      label: 'INNER STATION',
      radiusRatio: 1.5,
      radiusText: 'r = 1.5 rₛ',
      exactLapse: '1 / √3',
      exactStep: '60 / √3 s',
      note: 'A fixed stationary worldline in the idealized Schwarzschild exterior.'
    }),
    Object.freeze({
      id: 'r2',
      label: 'MIDDLE STATION',
      radiusRatio: 2,
      radiusText: 'r = 2 rₛ',
      exactLapse: '1 / √2',
      exactStep: '60 / √2 s',
      note: 'Still outside the horizon, with a larger lapse factor than the inner stations.'
    }),
    Object.freeze({
      id: 'r5',
      label: 'OUTER STATION',
      radiusRatio: 5,
      radiusText: 'r = 5 rₛ',
      exactLapse: '2 / √5',
      exactStep: '120 / √5 s',
      note: 'Farthest offered station. Its clock still accumulates less proper time than the asymptotic coordinate-time reference.'
    })
  ]);

  function getStation(id) {
    return STATIONS.find((station) => station.id === id) || null;
  }

  function validStepCount(stepCount) {
    return Number.isSafeInteger(stepCount) && stepCount >= 0;
  }

  function lapseFactor(id) {
    const station = getStation(id);
    if (!station) return null;
    return Math.sqrt(1 - (1 / station.radiusRatio));
  }

  function properTimeForCoordinateSeconds(id, coordinateSeconds) {
    if (typeof coordinateSeconds !== 'number' || !Number.isFinite(coordinateSeconds) || coordinateSeconds < 0) return null;
    const lapse = lapseFactor(id);
    if (lapse === null) return null;
    return coordinateSeconds * lapse;
  }

  function reading(id, stepCount) {
    const station = getStation(id);
    if (!station || !validStepCount(stepCount)) return null;
    const coordinateElapsedSeconds = stepCount * COORDINATE_STEP_SECONDS;
    const lapse = lapseFactor(id);
    return Object.freeze({
      id: station.id,
      label: station.label,
      radiusRatio: station.radiusRatio,
      radiusText: station.radiusText,
      exactLapse: station.exactLapse,
      exactStep: station.exactStep,
      note: station.note,
      lapseFactor: lapse,
      properStepSeconds: COORDINATE_STEP_SECONDS * lapse,
      coordinateElapsedSeconds,
      properElapsedSeconds: coordinateElapsedSeconds * lapse
    });
  }

  function snapshot(stepCount = 0) {
    if (!validStepCount(stepCount)) return null;
    return Object.freeze({
      stepCount,
      coordinateStepSeconds: COORDINATE_STEP_SECONDS,
      coordinateElapsedSeconds: stepCount * COORDINATE_STEP_SECONDS,
      readings: Object.freeze(STATIONS.map((station) => reading(station.id, stepCount)))
    });
  }

  return Object.freeze({
    COORDINATE_STEP_SECONDS,
    STATIONS,
    getStation,
    validStepCount,
    lapseFactor,
    properTimeForCoordinateSeconds,
    reading,
    snapshot
  });
});
