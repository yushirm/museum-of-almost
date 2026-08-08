(function attachOriginMachineCore(root, factory) {
  'use strict';

  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.MuseumOriginMachineCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function buildOriginMachineCore() {
  'use strict';

  const MARKERS = Object.freeze([
    Object.freeze({ id: 'a', label: 'MARKER A', chi: -4 }),
    Object.freeze({ id: 'b', label: 'MARKER B', chi: -2 }),
    Object.freeze({ id: 'c', label: 'MARKER C', chi: 0 }),
    Object.freeze({ id: 'd', label: 'MARKER D', chi: 3 }),
    Object.freeze({ id: 'e', label: 'MARKER E', chi: 5 })
  ]);

  const SCALE_FACTORS = Object.freeze([0.5, 1, 2]);
  const MAX_RELATIVE_MAGNITUDE = 18;

  function isFiniteNumber(value) {
    return typeof value === 'number' && Number.isFinite(value);
  }

  function validScaleFactor(value) {
    return isFiniteNumber(value) && SCALE_FACTORS.includes(value);
  }

  function getMarker(id) {
    return MARKERS.find((marker) => marker.id === id) || null;
  }

  function relativeCoordinate(markerChi, observerChi, scaleFactor) {
    if (![markerChi, observerChi].every(isFiniteNumber) || !validScaleFactor(scaleFactor)) return null;
    return scaleFactor * (markerChi - observerChi);
  }

  function separation(markerChi, observerChi, scaleFactor) {
    const relative = relativeCoordinate(markerChi, observerChi, scaleFactor);
    return relative === null ? null : Math.abs(relative);
  }

  function visualPercent(relative) {
    if (!isFiniteNumber(relative) || Math.abs(relative) > MAX_RELATIVE_MAGNITUDE) return null;
    return 50 + (relative / MAX_RELATIVE_MAGNITUDE) * 38;
  }

  function snapshot(observerId, scaleFactor) {
    const observer = getMarker(observerId);
    if (!observer || !validScaleFactor(scaleFactor)) return null;

    const markers = MARKERS.map((marker) => {
      const relative = relativeCoordinate(marker.chi, observer.chi, scaleFactor);
      return Object.freeze({
        id: marker.id,
        label: marker.label,
        chi: marker.chi,
        isOrigin: marker.id === observer.id,
        relative,
        separation: Math.abs(relative),
        visualPercent: visualPercent(relative)
      });
    });

    return Object.freeze({
      observerId: observer.id,
      observerLabel: observer.label,
      observerChi: observer.chi,
      scaleFactor,
      markers: Object.freeze(markers)
    });
  }

  return Object.freeze({
    MARKERS,
    SCALE_FACTORS,
    MAX_RELATIVE_MAGNITUDE,
    getMarker,
    relativeCoordinate,
    separation,
    visualPercent,
    snapshot
  });
});
