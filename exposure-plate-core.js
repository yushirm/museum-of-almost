(function attachExposurePlateCore(root, factory) {
  const commonsCore = typeof module === 'object' && module.exports
    ? require('./data-core.js')
    : root.MuseumCommonsCore;
  const api = factory(commonsCore);
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.MuseumExposurePlateCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function buildExposurePlateCore(commonsCore) {
  'use strict';

  const GRID_STEP_DEGREES = 10;
  const DISTANCE_BANDS = Object.freeze([
    Object.freeze({ id: 'near', minKm: 0, maxKm: 1500, label: '0–1,500 km' }),
    Object.freeze({ id: 'middle', minKm: 1500, maxKm: 3000, label: '1,500–3,000 km' }),
    Object.freeze({ id: 'far', minKm: 3000, maxKm: 5000, label: '3,000–5,000 km' }),
    Object.freeze({ id: 'remote', minKm: 5000, maxKm: Infinity, label: 'more than 5,000 km' })
  ]);

  function finiteCoordinate(value) {
    if (value === null || value === undefined || value === '') return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function normalizeStep(value) {
    const step = finiteCoordinate(value);
    if (!step || step <= 0 || step > 30) return GRID_STEP_DEGREES;
    if (360 % step !== 0 || 180 % step !== 0) return GRID_STEP_DEGREES;
    return step;
  }

  function currentStations(snapshot) {
    if (snapshot?.feeds?.weather !== true) return [];
    const points = Array.isArray(snapshot?.weather?.points) ? snapshot.weather.points : [];
    return points
      .map((point) => ({
        id: String(point?.id || '').trim(),
        lat: finiteCoordinate(point?.lat),
        lon: finiteCoordinate(point?.lon),
        available: point?.available === true
      }))
      .filter((point) => point.id && point.available && point.lat !== null && point.lon !== null)
      .filter((point) => point.lat >= -90 && point.lat <= 90 && point.lon >= -180 && point.lon <= 180)
      .sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  }

  function nearestSample(target, stationsInput) {
    const lat = finiteCoordinate(target?.lat);
    const lon = finiteCoordinate(target?.lon);
    const stations = Array.isArray(stationsInput) ? stationsInput : [];
    if (lat === null || lon === null || !stations.length || !commonsCore?.greatCircleDistanceKm) return null;

    let nearest = null;
    for (const station of stations) {
      const distanceKm = commonsCore.greatCircleDistanceKm({ lat, lon }, station);
      if (!Number.isFinite(distanceKm)) continue;
      if (!nearest
        || distanceKm < nearest.distanceKm
        || (distanceKm === nearest.distanceKm && String(station.id) < nearest.id)) {
        nearest = { id: String(station.id), distanceKm };
      }
    }
    return nearest;
  }

  function bandForDistance(distanceKm) {
    if (typeof distanceKm !== 'number' || !Number.isFinite(distanceKm) || distanceKm < 0) return null;
    if (distanceKm <= 1500) return 'near';
    if (distanceKm <= 3000) return 'middle';
    if (distanceKm <= 5000) return 'far';
    return 'remote';
  }

  function gridCenters(stepInput = GRID_STEP_DEGREES) {
    const step = normalizeStep(stepInput);
    const half = step / 2;
    const centers = [];
    for (let lat = -90 + half; lat < 90; lat += step) {
      for (let lon = -180 + half; lon < 180; lon += step) {
        centers.push({ lat, lon });
      }
    }
    return centers;
  }

  function distanceField(snapshot, stepInput = GRID_STEP_DEGREES) {
    const step = normalizeStep(stepInput);
    const stations = currentStations(snapshot);
    if (!stations.length) {
      return {
        available: false,
        step,
        stationCount: 0,
        stations: [],
        cells: [],
        farthest: null,
        counts: { near: 0, middle: 0, far: 0, remote: 0 }
      };
    }

    const counts = { near: 0, middle: 0, far: 0, remote: 0 };
    const cells = [];
    let farthest = null;

    for (const center of gridCenters(step)) {
      const nearest = nearestSample(center, stations);
      if (!nearest) continue;
      const band = bandForDistance(nearest.distanceKm);
      if (!band) continue;
      counts[band] += 1;

      const cell = {
        lat: center.lat,
        lon: center.lon,
        x: center.lon - step / 2 + 180,
        y: 90 - (center.lat + step / 2),
        width: step,
        height: step,
        nearestId: nearest.id,
        distanceKm: nearest.distanceKm,
        band
      };
      cells.push(cell);

      if (!farthest
        || cell.distanceKm > farthest.distanceKm
        || (cell.distanceKm === farthest.distanceKm && cell.lat < farthest.lat)
        || (cell.distanceKm === farthest.distanceKm && cell.lat === farthest.lat && cell.lon < farthest.lon)) {
        farthest = { ...cell };
      }
    }

    return {
      available: cells.length > 0,
      step,
      stationCount: stations.length,
      stations,
      cells,
      farthest,
      counts
    };
  }

  function fieldSentence(field) {
    if (!field?.available) return 'No currently available weather point can expose the distance plate.';
    const grammar = field.stationCount === 1 ? 'point is' : 'points are';
    const farthest = field.farthest;
    if (!farthest) return `${field.stationCount} weather ${grammar} available; no distance grid could be resolved.`;
    return `${field.stationCount} weather ${grammar} currently available. The farthest ${field.step}° grid-cell center is about ${farthest.distanceKm.toLocaleString('en-US')} km from its nearest sample, Point ${farthest.nearestId}.`;
  }

  return Object.freeze({
    GRID_STEP_DEGREES,
    DISTANCE_BANDS,
    finiteCoordinate,
    normalizeStep,
    currentStations,
    nearestSample,
    bandForDistance,
    gridCenters,
    distanceField,
    fieldSentence
  });
});
