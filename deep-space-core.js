(function attachDeepSpaceCore(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.MuseumDeepSpaceCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function buildDeepSpaceCore() {
  'use strict';

  const C_KM_S = 299792.458;
  const AU_KM = 149597870.7;
  const JULIAN_YEAR_SECONDS = 365.25 * 24 * 60 * 60;
  const LIGHT_YEAR_KM = C_KM_S * JULIAN_YEAR_SECONDS;
  const G_SI = 6.67430e-11;
  const SOLAR_MASS_KG = 1.98847e30;
  const C_M_S = C_KM_S * 1000;

  const SCALE_STOPS = [
    {
      id: 'moon',
      label: 'Moon',
      distanceKm: 384400,
      note: 'Average Earth–Moon distance. A reply to a laser pulse is never instantaneous.'
    },
    {
      id: 'sun',
      label: 'Sun',
      distanceKm: AU_KM,
      note: 'One astronomical unit. Sunlight reaching Earth is already a little over eight minutes old.'
    },
    {
      id: 'proxima',
      label: 'Proxima Centauri',
      distanceKm: 4.2465 * LIGHT_YEAR_KM,
      note: 'The nearest known star to the Sun. Even light needs more than four years for the crossing.'
    },
    {
      id: 'milky-way',
      label: 'Milky Way',
      distanceKm: 100000 * LIGHT_YEAR_KM,
      note: 'A rounded diameter. “Now” cannot be shared across a galaxy in any ordinary human sense.'
    },
    {
      id: 'andromeda',
      label: 'Andromeda Galaxy',
      distanceKm: 2.5e6 * LIGHT_YEAR_KM,
      note: 'A rounded distance. We see our large galactic neighbour by ancient light.'
    }
  ];

  const BLACK_HOLES = [
    {
      id: 'stellar',
      label: 'Stellar black hole',
      solarMasses: 10,
      note: 'A ten-solar-mass reference object: compact enough for its horizon to fit inside a city-scale map.'
    },
    {
      id: 'sagittarius-a',
      label: 'Sagittarius A*',
      solarMasses: 4.3e6,
      note: 'A rounded mass for the supermassive black hole at the centre of the Milky Way.'
    },
    {
      id: 'm87',
      label: 'M87*',
      solarMasses: 6.5e9,
      note: 'A rounded mass for the black hole whose shadow was first imaged by the Event Horizon Telescope.'
    }
  ];

  const COSMIC_INVENTORY = [
    { id: 'ordinary', label: 'Ordinary matter', percent: 4.9, note: 'Atoms: stars, planets, gas, dust, bodies, instruments.' },
    { id: 'dark-matter', label: 'Dark matter', percent: 26.8, note: 'Detected through gravity; its particle identity remains unknown.' },
    { id: 'dark-energy', label: 'Dark energy', percent: 68.3, note: 'A name for whatever drives the observed accelerated cosmic expansion.' }
  ];

  const MYSTERIES = [
    {
      id: 'dark-matter',
      title: 'What is dark matter?',
      known: 'Galaxies and clusters behave as though much more gravitating matter exists than we can see. Gravitational lensing maps the same hidden mass.',
      unknown: 'We still do not know the underlying particle or field, or whether the final explanation requires a deeper change to gravity.'
    },
    {
      id: 'dark-energy',
      title: 'Why is expansion accelerating?',
      known: 'Distant supernovae and other cosmological measurements show that cosmic expansion has accelerated in the recent universe.',
      unknown: 'We do not know whether the cause is vacuum energy, a dynamical field, modified gravity, or something not yet imagined.'
    },
    {
      id: 'time',
      title: 'Why does time have an arrow?',
      known: 'Many microscopic laws work almost equally well forward and backward, while macroscopic life remembers the past and not the future.',
      unknown: 'The deep connection between entropy, initial cosmic conditions, gravity, information and the experienced direction of time remains unsettled.'
    },
    {
      id: 'information',
      title: 'What happens to information in a black hole?',
      known: 'Quantum theory resists true information loss; general relativity creates horizons that hide regions from outside observers.',
      unknown: 'A complete account of evaporation, horizons and quantum information still requires a theory that unifies gravity with quantum physics.'
    },
    {
      id: 'quantum-gravity',
      title: 'What is spacetime made of?',
      known: 'General relativity treats spacetime as dynamical geometry. Quantum field theory describes matter and forces with extraordinary precision.',
      unknown: 'At the Planck scale, we do not yet know the correct quantum description of spacetime itself.'
    }
  ];

  function lightTimeSeconds(distanceKm) {
    return Number.isFinite(distanceKm) && distanceKm >= 0 ? distanceKm / C_KM_S : null;
  }

  function schwarzschildRadiusKm(solarMasses) {
    if (!Number.isFinite(solarMasses) || solarMasses < 0) return null;
    const massKg = solarMasses * SOLAR_MASS_KG;
    return (2 * G_SI * massKg / (C_M_S * C_M_S)) / 1000;
  }

  function formatNumber(value, maximumFractionDigits = 1) {
    return new Intl.NumberFormat('en', { maximumFractionDigits }).format(value);
  }

  function formatDistance(distanceKm) {
    if (!Number.isFinite(distanceKm)) return 'Unavailable';
    const ly = distanceKm / LIGHT_YEAR_KM;
    if (ly >= 0.1) return `${formatNumber(ly, ly >= 1000 ? 0 : 2)} light-years`;
    if (distanceKm >= 1e6) return `${formatNumber(distanceKm / 1e6, 1)} million km`;
    return `${formatNumber(distanceKm, 0)} km`;
  }

  function formatDuration(seconds) {
    if (!Number.isFinite(seconds)) return 'Unavailable';
    if (seconds >= JULIAN_YEAR_SECONDS) {
      const years = seconds / JULIAN_YEAR_SECONDS;
      return `${formatNumber(years, years >= 1000 ? 0 : 2)} years`;
    }
    if (seconds >= 86400) return `${formatNumber(seconds / 86400, 1)} days`;
    if (seconds >= 3600) return `${formatNumber(seconds / 3600, 1)} hours`;
    if (seconds >= 60) return `${formatNumber(seconds / 60, 1)} minutes`;
    return `${formatNumber(seconds, 2)} seconds`;
  }

  function inventoryTotal() {
    return COSMIC_INVENTORY.reduce((sum, item) => sum + item.percent, 0);
  }

  return Object.freeze({
    C_KM_S,
    AU_KM,
    JULIAN_YEAR_SECONDS,
    LIGHT_YEAR_KM,
    SCALE_STOPS,
    BLACK_HOLES,
    COSMIC_INVENTORY,
    MYSTERIES,
    lightTimeSeconds,
    schwarzschildRadiusKm,
    formatDistance,
    formatDuration,
    inventoryTotal
  });
});
