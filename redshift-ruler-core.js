(function attachRedshiftRulerCore(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.MuseumRedshiftRulerCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function buildRedshiftRulerCore() {
  'use strict';

  const REFERENCE_WAVELENGTH_NM = 500;
  const CASES = Object.freeze([
    Object.freeze({ id: 'modest', label: 'z = 0.1', redshift: 0.1, note: 'A modest cosmological stretch: the received wavelength is 1.1 times the emitted wavelength.' }),
    Object.freeze({ id: 'double', label: 'z = 1', redshift: 1, note: 'At redshift one, the received wavelength is exactly twice the emitted wavelength.' }),
    Object.freeze({ id: 'deep', label: 'z = 6', redshift: 6, note: 'At redshift six, the received wavelength is seven times the emitted wavelength in this ideal expansion model.' })
  ]);

  function isValidRedshift(value) {
    return Number.isFinite(value) && value > -1;
  }

  function stretchFactor(redshift) {
    const z = Number(redshift);
    if (!isValidRedshift(z)) return null;
    return 1 + z;
  }

  function observedWavelengthNm(emittedWavelengthNm, redshift) {
    const emitted = Number(emittedWavelengthNm);
    const factor = stretchFactor(redshift);
    if (!Number.isFinite(emitted) || emitted <= 0 || factor === null) return null;
    return emitted * factor;
  }

  function emissionScaleFactor(redshift) {
    const factor = stretchFactor(redshift);
    if (factor === null) return null;
    return 1 / factor;
  }

  function getCase(id) {
    return CASES.find((item) => item.id === id) || null;
  }

  function snapshot(caseId) {
    const item = getCase(caseId);
    if (!item) return null;
    const factor = stretchFactor(item.redshift);
    const observed = observedWavelengthNm(REFERENCE_WAVELENGTH_NM, item.redshift);
    const emittedScale = emissionScaleFactor(item.redshift);

    return Object.freeze({
      id: item.id,
      label: item.label,
      redshift: item.redshift,
      emittedWavelengthNm: REFERENCE_WAVELENGTH_NM,
      observedWavelengthNm: observed,
      stretchFactor: factor,
      emissionScaleFactor: emittedScale,
      note: item.note,
      wavelengthEquation: 'λobs = λemit (1 + z)',
      scaleEquation: 'aemit = 1 / (1 + z)'
    });
  }

  return Object.freeze({
    REFERENCE_WAVELENGTH_NM,
    CASES,
    isValidRedshift,
    stretchFactor,
    observedWavelengthNm,
    emissionScaleFactor,
    getCase,
    snapshot
  });
});
