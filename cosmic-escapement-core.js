(function attachCelestialEscapementCore(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.MuseumCelestialEscapementCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function buildCelestialEscapementCore() {
  'use strict';

  const DAY_MS = 86400000;
  const J2000_MS = Date.UTC(2000, 0, 1, 12, 0, 0);
  const MOON_NEW_EPOCH_MS = Date.UTC(2026, 7, 12, 17, 36, 42);
  const SYNODIC_MONTH_DAYS = 29.53059;
  const EARTH_YEAR_DAYS = 365.25;
  const JUPITER_YEAR_DAYS = 4333;
  const JPL_MEAN_LONGITUDE = Object.freeze({
    earth: Object.freeze({ base: 100.46457166, ratePerCentury: 35999.37244981 }),
    jupiter: Object.freeze({ base: 34.39644051, ratePerCentury: 3034.74612775 })
  });

  const positiveMod = (value, modulus) => ((value % modulus) + modulus) % modulus;
  const clamp01 = (value) => Math.min(1, Math.max(0, value));
  const degrees = (fraction) => positiveMod(fraction, 1) * 360;

  function julianDate(ms) {
    return ms / DAY_MS + 2440587.5;
  }

  function centuriesSinceJ2000(ms) {
    return (julianDate(ms) - 2451545.0) / 36525;
  }

  function meanLongitude(ms, planet) {
    const element = JPL_MEAN_LONGITUDE[planet];
    if (!element || !Number.isFinite(ms)) return null;
    const longitude = element.base + element.ratePerCentury * centuriesSinceJ2000(ms);
    return positiveMod(longitude, 360);
  }

  function moonPhaseFraction(ms) {
    if (!Number.isFinite(ms)) return null;
    return positiveMod((ms - MOON_NEW_EPOCH_MS) / (SYNODIC_MONTH_DAYS * DAY_MS), 1);
  }

  function moonPhaseName(fraction) {
    if (!Number.isFinite(fraction)) return 'unavailable';
    const f = positiveMod(fraction, 1);
    if (f < 0.0625 || f >= 0.9375) return 'new Moon';
    if (f < 0.1875) return 'waxing crescent';
    if (f < 0.3125) return 'first quarter';
    if (f < 0.4375) return 'waxing gibbous';
    if (f < 0.5625) return 'full Moon';
    if (f < 0.6875) return 'waning gibbous';
    if (f < 0.8125) return 'third quarter';
    return 'waning crescent';
  }

  function moonIllumination(fraction) {
    if (!Number.isFinite(fraction)) return null;
    return clamp01((1 - Math.cos(2 * Math.PI * positiveMod(fraction, 1))) / 2) * 100;
  }

  function earthTurnFraction(ms) {
    if (!Number.isFinite(ms)) return null;
    return positiveMod(ms, DAY_MS) / DAY_MS;
  }

  function formatPercent(value) {
    return `${(value * 100).toFixed(1)}%`;
  }

  function formatAngle(value) {
    return `${value.toFixed(1)}°`;
  }

  function utcClock(ms) {
    if (!Number.isFinite(ms)) return 'unavailable';
    return new Date(ms).toISOString().slice(11, 19) + ' UTC';
  }

  function clocks(ms) {
    const receivedAt = Number.isFinite(ms) ? ms : Date.now();
    const earthTurn = earthTurnFraction(receivedAt);
    const moonPhase = moonPhaseFraction(receivedAt);
    const earthLongitude = meanLongitude(receivedAt, 'earth');
    const jupiterLongitude = meanLongitude(receivedAt, 'jupiter');

    return [
      {
        id: 'earth-turn',
        name: 'Earth turn',
        period: '24.0 h mean-solar reference',
        phase: earthTurn,
        angle: degrees(earthTurn),
        readout: `${utcClock(receivedAt)} · ${formatPercent(earthTurn)} through the UTC day`,
        note: 'A shared mean-solar reference for Earth’s rotation. This is not visitor-local solar time.'
      },
      {
        id: 'moon-month',
        name: 'Moon month',
        period: `${SYNODIC_MONTH_DAYS.toFixed(5)} d mean synodic`,
        phase: moonPhase,
        angle: degrees(moonPhase),
        readout: `${moonPhaseName(moonPhase)} · ~${moonIllumination(moonPhase).toFixed(0)}% illuminated`,
        note: 'Approximate phase from a fixed NASA eclipse-era new-Moon conjunction and the mean synodic month; not a precision lunar ephemeris.'
      },
      {
        id: 'earth-year',
        name: 'Earth year',
        period: `${EARTH_YEAR_DAYS.toFixed(2)} d reference year`,
        phase: earthLongitude / 360,
        angle: earthLongitude,
        readout: `${formatAngle(earthLongitude)} J2000 mean longitude`,
        note: 'JPL lower-accuracy Earth–Moon-barycenter mean longitude. Useful as an orbital phase dial, not a precision apparent sky position.'
      },
      {
        id: 'jupiter-year',
        name: 'Jupiter year',
        period: `${JUPITER_YEAR_DAYS.toLocaleString('en-US')} Earth days`,
        phase: jupiterLongitude / 360,
        angle: jupiterLongitude,
        readout: `${formatAngle(jupiterLongitude)} J2000 mean longitude`,
        note: 'JPL lower-accuracy Jupiter mean longitude. One Jovian year is about twelve Earth years, so this hand barely moves between ordinary snapshots.'
      }
    ];
  }

  return Object.freeze({
    DAY_MS,
    J2000_MS,
    MOON_NEW_EPOCH_MS,
    SYNODIC_MONTH_DAYS,
    EARTH_YEAR_DAYS,
    JUPITER_YEAR_DAYS,
    JPL_MEAN_LONGITUDE,
    positiveMod,
    julianDate,
    centuriesSinceJ2000,
    meanLongitude,
    moonPhaseFraction,
    moonPhaseName,
    moonIllumination,
    earthTurnFraction,
    clocks
  });
});
