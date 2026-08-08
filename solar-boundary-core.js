(function exposeSolarBoundaryCore(root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.MuseumSolarBoundaryCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function buildSolarBoundaryCore() {
  'use strict';

  const RAD = Math.PI / 180;
  const DEG = 180 / Math.PI;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function normalizeLongitude(value) {
    return ((value + 540) % 360) - 180;
  }

  function dayOfYear(date) {
    const yearStart = Date.UTC(date.getUTCFullYear(), 0, 0);
    return Math.floor((Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - yearStart) / 86400000);
  }

  function solarTerms(date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) throw new TypeError('A valid Date is required.');
    const days = dayOfYear(date);
    const minutes = date.getUTCHours() * 60 + date.getUTCMinutes() + date.getUTCSeconds() / 60;
    const hour = minutes / 60;
    const gamma = (2 * Math.PI / 365) * (days - 1 + (hour - 12) / 24);
    const equationOfTime = 229.18 * (
      0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma)
    );
    const declination = (
      0.006918 -
      0.399912 * Math.cos(gamma) +
      0.070257 * Math.sin(gamma) -
      0.006758 * Math.cos(2 * gamma) +
      0.000907 * Math.sin(2 * gamma) -
      0.002697 * Math.cos(3 * gamma) +
      0.00148 * Math.sin(3 * gamma)
    );
    const subsolarLongitude = normalizeLongitude((720 - minutes - equationOfTime) / 4);
    return {
      dayOfYear: days,
      minutesUTC: minutes,
      equationOfTimeMinutes: equationOfTime,
      declinationDegrees: declination * DEG,
      subsolarLatitude: declination * DEG,
      subsolarLongitude
    };
  }

  function solarAltitudeDegrees(date, latitude, longitude) {
    const terms = solarTerms(date);
    const lat = clamp(Number(latitude), -90, 90) * RAD;
    const lon = normalizeLongitude(Number(longitude));
    const solarMinutes = (terms.minutesUTC + terms.equationOfTimeMinutes + 4 * lon) % 1440;
    const hourAngleDegrees = solarMinutes / 4 - 180;
    const hourAngle = hourAngleDegrees * RAD;
    const declination = terms.declinationDegrees * RAD;
    const cosZenith = clamp(
      Math.sin(lat) * Math.sin(declination) + Math.cos(lat) * Math.cos(declination) * Math.cos(hourAngle),
      -1,
      1
    );
    return 90 - Math.acos(cosZenith) * DEG;
  }

  function classifyAltitude(altitudeDegrees) {
    if (!Number.isFinite(altitudeDegrees)) return 'unknown';
    if (altitudeDegrees >= 0) return 'day';
    if (altitudeDegrees >= -6) return 'twilight';
    return 'night';
  }

  function buildAtlas(date, columns = 30, rows = 15) {
    const colCount = Math.max(4, Math.floor(columns));
    const rowCount = Math.max(3, Math.floor(rows));
    const cells = [];
    const counts = { day: 0, twilight: 0, night: 0, unknown: 0 };
    for (let row = 0; row < rowCount; row += 1) {
      const latitude = 90 - ((row + 0.5) * 180 / rowCount);
      for (let column = 0; column < colCount; column += 1) {
        const longitude = -180 + ((column + 0.5) * 360 / colCount);
        const altitude = solarAltitudeDegrees(date, latitude, longitude);
        const state = classifyAltitude(altitude);
        counts[state] += 1;
        cells.push({ row, column, latitude, longitude, altitudeDegrees: altitude, state });
      }
    }
    return { columns: colCount, rows: rowCount, cells, counts, terms: solarTerms(date) };
  }

  return {
    solarTerms,
    solarAltitudeDegrees,
    classifyAltitude,
    buildAtlas,
    normalizeLongitude
  };
});
