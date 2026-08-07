(function attachPlanetaryHeliodonCore(root, factory) {
  const commons = typeof module === 'object' && module.exports
    ? require('./data-core.js')
    : root.MuseumCommonsCore;
  const api = factory(commons);
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.MuseumPlanetaryHeliodonCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function buildPlanetaryHeliodonCore(commons) {
  'use strict';

  const WIDTH = 1000;
  const HEIGHT = 500;

  function toRadians(degrees) {
    return Number(degrees) * Math.PI / 180;
  }

  function toDegrees(radians) {
    return Number(radians) * 180 / Math.PI;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, Number(value)));
  }

  function vectorFromLatLon(lat, lon) {
    const phi = toRadians(lat);
    const lambda = toRadians(lon);
    const cosPhi = Math.cos(phi);
    return [cosPhi * Math.cos(lambda), cosPhi * Math.sin(lambda), Math.sin(phi)];
  }

  function cross(a, b) {
    return [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0]
    ];
  }

  function normalizeVector(vector) {
    const length = Math.hypot(...vector);
    if (!Number.isFinite(length) || length === 0) return null;
    return vector.map((value) => value / length);
  }

  function latLonFromVector(vector) {
    const [x, y, z] = vector;
    return {
      lat: toDegrees(Math.asin(clamp(z, -1, 1))),
      lon: toDegrees(Math.atan2(y, x))
    };
  }

  function project(point) {
    const lat = Number(point?.lat);
    const lon = Number(point?.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    return {
      x: ((lon + 180) / 360) * WIDTH,
      y: ((90 - lat) / 180) * HEIGHT
    };
  }

  function terminatorCoordinates(timestamp, samples = 361) {
    const geometry = commons?.solarGeometry?.(timestamp);
    if (!geometry) return [];

    const sun = vectorFromLatLon(geometry.subsolar.lat, geometry.subsolar.lon);
    const reference = Math.abs(sun[2]) < 0.95 ? [0, 0, 1] : [1, 0, 0];
    const first = normalizeVector(cross(sun, reference));
    if (!first) return [];
    const second = normalizeVector(cross(sun, first));
    if (!second) return [];

    const count = Math.max(72, Math.min(1441, Math.round(Number(samples) || 361)));
    const points = [];
    for (let index = 0; index < count; index += 1) {
      const angle = (index / (count - 1)) * Math.PI * 2;
      const vector = first.map((value, axis) => value * Math.cos(angle) + second[axis] * Math.sin(angle));
      points.push(latLonFromVector(vector));
    }
    return points;
  }

  function terminatorParts(timestamp, samples = 361) {
    const coordinates = terminatorCoordinates(timestamp, samples);
    const parts = [];
    let current = [];
    let previous = null;

    for (const coordinate of coordinates) {
      const point = project(coordinate);
      if (!point) continue;
      if (previous && Math.abs(point.x - previous.x) > WIDTH / 2) {
        if (current.length > 1) parts.push(current);
        current = [];
      }
      current.push(point);
      previous = point;
    }
    if (current.length > 1) parts.push(current);
    return parts;
  }

  function pathFromParts(parts) {
    return (Array.isArray(parts) ? parts : [])
      .map((part) => part
        .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
        .join(' '))
      .join(' ');
  }

  function nightGridPath(timestamp, stepDegrees = 10) {
    const geometry = commons?.solarGeometry?.(timestamp);
    if (!geometry) return '';
    const sun = vectorFromLatLon(geometry.subsolar.lat, geometry.subsolar.lon);
    const step = Math.max(2, Math.min(30, Math.round(Number(stepDegrees) || 10)));
    const commands = [];

    for (let south = -90; south < 90; south += step) {
      const north = Math.min(90, south + step);
      for (let west = -180; west < 180; west += step) {
        const east = Math.min(180, west + step);
        const center = vectorFromLatLon((south + north) / 2, (west + east) / 2);
        const daylight = center[0] * sun[0] + center[1] * sun[1] + center[2] * sun[2] > 0;
        if (daylight) continue;

        const topLeft = project({ lat: north, lon: west });
        const bottomRight = project({ lat: south, lon: east });
        if (!topLeft || !bottomRight) continue;
        const width = bottomRight.x - topLeft.x;
        const height = bottomRight.y - topLeft.y;
        commands.push(`M${topLeft.x.toFixed(2)} ${topLeft.y.toFixed(2)}h${width.toFixed(2)}v${height.toFixed(2)}h-${width.toFixed(2)}Z`);
      }
    }
    return commands.join('');
  }

  function plate(timestamp) {
    const geometry = commons?.solarGeometry?.(timestamp);
    if (!geometry) return null;
    const subsolar = project(geometry.subsolar);
    const antisolar = project(geometry.antisolar);
    if (!subsolar || !antisolar) return null;
    return {
      geometry,
      subsolar,
      antisolar,
      terminatorPath: pathFromParts(terminatorParts(timestamp)),
      nightPath: nightGridPath(timestamp)
    };
  }

  return Object.freeze({
    WIDTH,
    HEIGHT,
    project,
    terminatorCoordinates,
    terminatorParts,
    pathFromParts,
    nightGridPath,
    plate
  });
});
