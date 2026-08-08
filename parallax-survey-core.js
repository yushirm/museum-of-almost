(function exposeParallaxSurveyCore(root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.MuseumParallaxSurveyCore = api;
})(typeof window !== 'undefined' ? window : globalThis, function buildParallaxSurveyCore() {
  'use strict';

  const PARSEC_TO_LIGHT_YEARS = 3.26156;

  const CASES = Object.freeze([
    Object.freeze({
      id: 'one-arcsecond',
      label: 'SURVEY A',
      parallaxArcseconds: 1,
      visualShift: 'wide',
      note: 'The defining parsec case: a one-arcsecond annual parallax corresponds to one parsec.'
    }),
    Object.freeze({
      id: 'one-tenth-arcsecond',
      label: 'SURVEY B',
      parallaxArcseconds: 0.1,
      visualShift: 'medium',
      note: 'Ten times less angular parallax places the synthetic target ten times farther away in the standard small-angle relation.'
    }),
    Object.freeze({
      id: 'one-hundredth-arcsecond',
      label: 'SURVEY C',
      parallaxArcseconds: 0.01,
      visualShift: 'narrow',
      note: 'A hundredth of an arcsecond is tiny; the schematic displacement is enlarged so the comparison remains visible.'
    })
  ]);

  function getCase(id) {
    return CASES.find((item) => item.id === id) || null;
  }

  function distanceParsecs(parallaxArcseconds) {
    if (!Number.isFinite(parallaxArcseconds) || parallaxArcseconds <= 0) return null;
    return 1 / parallaxArcseconds;
  }

  function fullSeasonalShiftArcseconds(parallaxArcseconds) {
    if (!Number.isFinite(parallaxArcseconds) || parallaxArcseconds <= 0) return null;
    return 2 * parallaxArcseconds;
  }

  function snapshot(id) {
    const item = getCase(id);
    if (!item) return null;
    const parsecs = distanceParsecs(item.parallaxArcseconds);
    return Object.freeze({
      ...item,
      distanceParsecs: parsecs,
      distanceLightYears: parsecs * PARSEC_TO_LIGHT_YEARS,
      fullSeasonalShiftArcseconds: fullSeasonalShiftArcseconds(item.parallaxArcseconds)
    });
  }

  return Object.freeze({
    PARSEC_TO_LIGHT_YEARS,
    CASES,
    getCase,
    distanceParsecs,
    fullSeasonalShiftArcseconds,
    snapshot
  });
});
