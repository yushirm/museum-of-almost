(function attachCommonsCore(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.MuseumCommonsCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function buildCommonsCore() {
  'use strict';

  const BUILD_SEED = '6bc76dc33337414e7c9f9ccbd7539976d98ac371444860c605fb88003174ded2';

  const STATIONS = Object.freeze([
    { id: '01', lat: -35.67, lon: 74.26 },
    { id: '02', lat: -55.60, lon: -21.23 },
    { id: '03', lat: 4.96, lon: -175.28 },
    { id: '04', lat: -4.21, lon: 12.83 },
    { id: '05', lat: 10.86, lon: 6.39 },
    { id: '06', lat: -8.01, lon: -74.80 },
    { id: '07', lat: 50.02, lon: -114.10 },
    { id: '08', lat: -27.32, lon: 5.28 },
    { id: '09', lat: 42.08, lon: 175.71 },
    { id: '10', lat: 59.08, lon: -132.10 },
    { id: '11', lat: 2.03, lon: -156.58 },
    { id: '12', lat: -13.78, lon: 8.04 },
    { id: '13', lat: 27.22, lon: 103.15 }
  ]);

  function clamp(value, min, max) {
    const number = Number(value);
    if (!Number.isFinite(number)) return min;
    return Math.max(min, Math.min(max, number));
  }

  function round(value, digits = 0) {
    const factor = 10 ** digits;
    return Math.round(Number(value) * factor) / factor;
  }

  function mean(values) {
    const numbers = values.filter(Number.isFinite);
    if (!numbers.length) return null;
    return numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
  }

  function normalizeEarthquakes(payload) {
    const features = Array.isArray(payload?.features) ? payload.features : [];
    const quakes = features.filter((feature) => feature?.properties?.type === 'earthquake');
    const magnitudes = quakes
      .map((feature) => Number(feature?.properties?.mag))
      .filter(Number.isFinite)
      .map((value) => clamp(value, -2, 10));
    const depths = quakes
      .map((feature) => Number(feature?.geometry?.coordinates?.[2]))
      .filter(Number.isFinite)
      .map((value) => clamp(value, -10, 800));

    return {
      available: true,
      count: quakes.length,
      strongest: magnitudes.length ? round(Math.max(...magnitudes), 1) : null,
      meanDepth: depths.length ? round(mean(depths), 1) : null,
      significant: magnitudes.filter((value) => value >= 4.5).length
    };
  }

  function findPreferredNumber(value, preferredKeys) {
    if (Array.isArray(value)) {
      for (let index = value.length - 1; index >= 0; index -= 1) {
        const found = findPreferredNumber(value[index], preferredKeys);
        if (found !== null) return found;
      }
      return null;
    }
    if (!value || typeof value !== 'object') return null;

    for (const [key, candidate] of Object.entries(value)) {
      const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!preferredKeys.some((preferred) => normalized.includes(preferred))) continue;
      const number = Number(candidate);
      if (Number.isFinite(number)) return number;
    }

    for (const candidate of Object.values(value)) {
      const found = findPreferredNumber(candidate, preferredKeys);
      if (found !== null) return found;
    }
    return null;
  }

  function findLastNumeric(value) {
    if (Array.isArray(value)) {
      for (let index = value.length - 1; index >= 0; index -= 1) {
        const found = findLastNumeric(value[index]);
        if (found !== null) return found;
      }
      return null;
    }
    if (value && typeof value === 'object') {
      const entries = Object.entries(value).filter(([key]) => !/time|date|epoch|stamp/i.test(key));
      for (let index = entries.length - 1; index >= 0; index -= 1) {
        const found = findLastNumeric(entries[index][1]);
        if (found !== null) return found;
      }
      return null;
    }
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function normalizeSolarWind(payload) {
    const preferred = findPreferredNumber(payload, ['speed', 'windspeed']);
    const fallback = preferred === null ? findLastNumeric(payload) : preferred;
    if (!Number.isFinite(fallback)) {
      return { available: false, speed: null, state: 'unavailable' };
    }

    const speed = round(clamp(fallback, 0, 2000), 1);
    const state = speed < 350 ? 'quiet' : speed < 500 ? 'steady' : speed < 700 ? 'fast' : 'very fast';
    return { available: true, speed, state };
  }

  function normalizeWeather(payload) {
    const responses = Array.isArray(payload) ? payload : payload ? [payload] : [];
    const points = STATIONS.map((station, index) => {
      const current = responses[index]?.current || {};
      const temperature = Number(current.temperature_2m);
      const wind = Number(current.wind_speed_10m);
      const precipitation = Number(current.precipitation);
      const available = [temperature, wind, precipitation].some(Number.isFinite);
      return {
        ...station,
        available,
        temperature: Number.isFinite(temperature) ? round(clamp(temperature, -100, 70), 1) : null,
        wind: Number.isFinite(wind) ? round(clamp(wind, 0, 400), 1) : null,
        precipitation: Number.isFinite(precipitation) ? round(clamp(precipitation, 0, 500), 1) : null
      };
    });

    const availablePoints = points.filter((point) => point.available);
    const temperatures = availablePoints.map((point) => point.temperature).filter(Number.isFinite);
    const winds = availablePoints.map((point) => point.wind).filter(Number.isFinite);
    const raining = availablePoints.filter((point) => Number.isFinite(point.precipitation) && point.precipitation > 0).length;

    return {
      available: availablePoints.length > 0,
      points,
      availableCount: availablePoints.length,
      minTemp: temperatures.length ? round(Math.min(...temperatures), 1) : null,
      maxTemp: temperatures.length ? round(Math.max(...temperatures), 1) : null,
      meanWind: winds.length ? round(mean(winds), 1) : null,
      maxWind: winds.length ? round(Math.max(...winds), 1) : null,
      raining
    };
  }

  function normalizeEvents(payload) {
    const events = Array.isArray(payload?.events) ? payload.events : [];
    const categoryCounts = new Map();

    for (const event of events) {
      const categories = Array.isArray(event?.categories) ? event.categories : [];
      for (const category of categories) {
        const title = String(category?.title || category?.id || 'Other').trim();
        if (!title) continue;
        categoryCounts.set(title, (categoryCounts.get(title) || 0) + 1);
      }
    }

    const topCategories = [...categoryCounts.entries()]
      .map(([title, count]) => ({ title, count }))
      .sort((a, b) => b.count - a.count || a.title.localeCompare(b.title))
      .slice(0, 5);

    return {
      available: true,
      count: events.length,
      capped: events.length >= 500,
      categories: topCategories
    };
  }

  function dayOfYear(date) {
    const start = Date.UTC(date.getUTCFullYear(), 0, 0);
    return Math.floor((date.getTime() - start) / 86400000);
  }

  function sunState(timestamp, lat, lon) {
    const date = new Date(timestamp);
    if (!Number.isFinite(date.getTime())) return 'unknown';

    const day = dayOfYear(date);
    const declination = 23.44 * Math.sin(((360 / 365) * (284 + day) * Math.PI) / 180);
    const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
    const solarHours = ((utcHours + Number(lon) / 15) % 24 + 24) % 24;
    const hourAngle = 15 * (solarHours - 12);
    const latRad = Number(lat) * Math.PI / 180;
    const decRad = declination * Math.PI / 180;
    const hourRad = hourAngle * Math.PI / 180;
    const sinElevation = Math.sin(latRad) * Math.sin(decRad)
      + Math.cos(latRad) * Math.cos(decRad) * Math.cos(hourRad);
    const elevation = Math.asin(clamp(sinElevation, -1, 1)) * 180 / Math.PI;

    if (elevation > 0) return 'day';
    if (elevation > -6) return 'twilight';
    return 'night';
  }

  function stationPosition(station) {
    return {
      x: round(clamp((Number(station.lon) + 180) / 360, 0, 1) * 100, 3),
      y: round(clamp((90 - Number(station.lat)) / 180, 0, 1) * 100, 3)
    };
  }

  function formatCoordinate(value, positive, negative) {
    const number = Number(value);
    if (!Number.isFinite(number)) return '—';
    const direction = number >= 0 ? positive : negative;
    return `${Math.abs(number).toFixed(2)}° ${direction}`;
  }

  function greatCircleDistanceKm(pointA, pointB) {
    const latA = Number(pointA?.lat);
    const lonA = Number(pointA?.lon);
    const latB = Number(pointB?.lat);
    const lonB = Number(pointB?.lon);
    if (![latA, lonA, latB, lonB].every(Number.isFinite)) return null;

    const toRadians = (degrees) => degrees * Math.PI / 180;
    const phiA = toRadians(latA);
    const phiB = toRadians(latB);
    const deltaPhi = toRadians(latB - latA);
    const deltaLambda = toRadians(lonB - lonA);
    const a = Math.sin(deltaPhi / 2) ** 2
      + Math.cos(phiA) * Math.cos(phiB) * Math.sin(deltaLambda / 2) ** 2;
    const centralAngle = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)));
    return round(6371.0088 * centralAngle, 0);
  }

  function observedRange(points, key) {
    const values = (Array.isArray(points) ? points : [])
      .map((point) => point?.[key])
      .filter((value) => typeof value === 'number' && Number.isFinite(value));
    if (!values.length) return { available: false, min: null, max: null };
    return {
      available: true,
      min: round(Math.min(...values), 1),
      max: round(Math.max(...values), 1)
    };
  }

  function metricPosition(value, min, max) {
    const number = typeof value === 'number' ? value : Number.NaN;
    const low = typeof min === 'number' ? min : Number.NaN;
    const high = typeof max === 'number' ? max : Number.NaN;
    if (![number, low, high].every(Number.isFinite)) return 50;
    if (high === low) return 50;
    return round(clamp((number - low) / (high - low), 0, 1) * 100, 2);
  }

  function planetarySection(weather, timestamp) {
    const weatherPoints = Array.isArray(weather?.points) ? weather.points : [];
    const pointsById = new Map(weatherPoints.map((point) => [point?.id, point]));
    const temperatureRange = observedRange(weatherPoints, 'temperature');
    const windRange = observedRange(weatherPoints, 'wind');
    const precipitationRange = observedRange(weatherPoints, 'precipitation');

    const points = STATIONS
      .slice()
      .sort((a, b) => a.lon - b.lon || a.id.localeCompare(b.id))
      .map((station) => {
        const weatherPoint = pointsById.get(station.id) || {};
        const temperature = typeof weatherPoint.temperature === 'number' && Number.isFinite(weatherPoint.temperature)
          ? weatherPoint.temperature
          : null;
        const wind = typeof weatherPoint.wind === 'number' && Number.isFinite(weatherPoint.wind)
          ? weatherPoint.wind
          : null;
        const precipitation = typeof weatherPoint.precipitation === 'number' && Number.isFinite(weatherPoint.precipitation)
          ? weatherPoint.precipitation
          : null;

        return {
          ...station,
          longitudePosition: stationPosition(station).x,
          temperature,
          wind,
          precipitation,
          temperaturePosition: temperature !== null && temperatureRange.available
            ? metricPosition(temperature, temperatureRange.min, temperatureRange.max)
            : null,
          windPosition: wind !== null && windRange.available
            ? metricPosition(wind, windRange.min, windRange.max)
            : null,
          precipitationPosition: precipitation !== null && precipitationRange.available
            ? metricPosition(precipitation, precipitationRange.min, precipitationRange.max)
            : null,
          light: sunState(timestamp, station.lat, station.lon)
        };
      });

    return {
      available: points.some((point) => point.temperature !== null || point.wind !== null || point.precipitation !== null),
      points,
      ranges: {
        temperature: temperatureRange,
        wind: windRange,
        precipitation: precipitationRange
      }
    };
  }

  function compareStationPair(pointA, pointB, lightA = 'unknown', lightB = 'unknown') {
    const temperatureA = typeof pointA?.temperature === 'number' ? pointA.temperature : Number.NaN;
    const temperatureB = typeof pointB?.temperature === 'number' ? pointB.temperature : Number.NaN;
    const windA = typeof pointA?.wind === 'number' ? pointA.wind : Number.NaN;
    const windB = typeof pointB?.wind === 'number' ? pointB.wind : Number.NaN;
    const precipitationA = typeof pointA?.precipitation === 'number' ? pointA.precipitation : Number.NaN;
    const precipitationB = typeof pointB?.precipitation === 'number' ? pointB.precipitation : Number.NaN;

    return {
      idA: pointA?.id || 'A',
      idB: pointB?.id || 'B',
      distanceKm: greatCircleDistanceKm(pointA, pointB),
      temperatureDelta: Number.isFinite(temperatureA) && Number.isFinite(temperatureB)
        ? round(temperatureA - temperatureB, 1)
        : null,
      windDelta: Number.isFinite(windA) && Number.isFinite(windB)
        ? round(windA - windB, 1)
        : null,
      precipitationDelta: Number.isFinite(precipitationA) && Number.isFinite(precipitationB)
        ? round(precipitationA - precipitationB, 1)
        : null,
      temperatureA: Number.isFinite(temperatureA) ? temperatureA : null,
      temperatureB: Number.isFinite(temperatureB) ? temperatureB : null,
      windA: Number.isFinite(windA) ? windA : null,
      windB: Number.isFinite(windB) ? windB : null,
      precipitationA: Number.isFinite(precipitationA) ? precipitationA : null,
      precipitationB: Number.isFinite(precipitationB) ? precipitationB : null,
      lightA,
      lightB,
      sameLight: lightA === lightB && lightA !== 'unknown'
    };
  }

  function signedDifferenceSentence(idA, idB, delta, unit, positiveWord, negativeWord, equalText) {
    if (!Number.isFinite(delta)) return `Live data is unavailable for one or both patched points.`;
    if (delta === 0) return `Points ${idA} and ${idB} ${equalText}.`;
    const amount = Math.abs(delta).toFixed(1);
    const direction = delta > 0 ? positiveWord : negativeWord;
    return `Point ${idA} is ${amount}${unit} ${direction} than point ${idB}.`;
  }

  function differenceSentence(comparison, lens) {
    if (!comparison) return 'Patch two points to compare the same moment in two places.';
    switch (lens) {
      case 'wind':
        return signedDifferenceSentence(
          comparison.idA,
          comparison.idB,
          comparison.windDelta,
          ' km/h',
          'windier',
          'less windy',
          'have the same current wind speed'
        );
      case 'precipitation':
        return signedDifferenceSentence(
          comparison.idA,
          comparison.idB,
          comparison.precipitationDelta,
          ' mm',
          'wetter right now',
          'drier right now',
          'report the same current precipitation'
        );
      case 'light':
        if (comparison.lightA === 'unknown' || comparison.lightB === 'unknown') {
          return 'Current light state is unavailable for one or both patched points.';
        }
        if (comparison.sameLight) {
          return `Points ${comparison.idA} and ${comparison.idB} are both in ${comparison.lightA}.`;
        }
        return `Point ${comparison.idA} is in ${comparison.lightA}; point ${comparison.idB} is in ${comparison.lightB}.`;
      case 'distance':
        return Number.isFinite(comparison.distanceKm)
          ? `Points ${comparison.idA} and ${comparison.idB} are ${comparison.distanceKm.toLocaleString('en')} km apart along Earth’s surface.`
          : 'Distance is unavailable for the patched points.';
      case 'temperature':
      default:
        return signedDifferenceSentence(
          comparison.idA,
          comparison.idB,
          comparison.temperatureDelta,
          '°C',
          'warmer',
          'cooler',
          'have the same current temperature'
        );
    }
  }

  function snapshotSentence(snapshot) {
    const parts = [];
    if (snapshot?.earthquakes?.available) {
      const strongest = Number.isFinite(snapshot.earthquakes.strongest)
        ? `, strongest M${snapshot.earthquakes.strongest.toFixed(1)}`
        : '';
      parts.push(`${snapshot.earthquakes.count} earthquakes were recorded in the past hour${strongest}`);
    }
    if (snapshot?.solar?.available) {
      parts.push(`solar wind is arriving at ${Math.round(snapshot.solar.speed)} km/s`);
    }
    if (snapshot?.weather?.available) {
      parts.push(`${snapshot.weather.availableCount} fixed world points range from ${snapshot.weather.minTemp.toFixed(1)}°C to ${snapshot.weather.maxTemp.toFixed(1)}°C`);
    }
    if (snapshot?.events?.available) {
      const count = snapshot.events.capped ? `${snapshot.events.count}+` : String(snapshot.events.count);
      parts.push(`NASA EONET lists ${count} open natural events in this snapshot`);
    }
    if (!parts.length) return 'The live services did not answer. The page still shows the fixed world sample and can be refreshed.';
    return `${parts.join('. ')}.`;
  }

  return Object.freeze({
    BUILD_SEED,
    STATIONS,
    normalizeEarthquakes,
    normalizeSolarWind,
    normalizeWeather,
    normalizeEvents,
    sunState,
    stationPosition,
    formatCoordinate,
    greatCircleDistanceKm,
    observedRange,
    metricPosition,
    planetarySection,
    compareStationPair,
    differenceSentence,
    snapshotSentence
  });
});
