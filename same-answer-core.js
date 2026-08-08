(function attachSameAnswerMachineCore(root, factory) {
  'use strict';

  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.MuseumSameAnswerMachineCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function buildSameAnswerMachineCore() {
  'use strict';

  const A_EMIT = 0.5;
  const A_OBS = 1;
  const REDSHIFT = (A_OBS / A_EMIT) - 1;
  const SAMPLE_U = Object.freeze([0, 0.25, 0.5, 0.75, 1]);

  const HISTORIES = Object.freeze([
    Object.freeze({
      id: 'linear',
      label: 'LINEAR',
      formula: 'a(u) = 0.5 + 0.5u',
      exactIntegral: '2 ln 2',
      note: 'Scale factor grows at a constant rate in normalized toy time.'
    }),
    Object.freeze({
      id: 'early',
      label: 'EARLY GROWTH',
      formula: 'a(u) = 0.5 + 0.5√u',
      exactIntegral: '4(1 − ln 2)',
      note: 'More of the scale-factor change happens near the start of normalized toy time.'
    }),
    Object.freeze({
      id: 'late',
      label: 'LATE GROWTH',
      formula: 'a(u) = 0.5 + 0.5u²',
      exactIntegral: 'π / 2',
      note: 'More of the scale-factor change happens near the end of normalized toy time.'
    })
  ]);

  function getHistory(id) {
    return HISTORIES.find((history) => history.id === id) || null;
  }

  function validU(u) {
    return typeof u === 'number' && Number.isFinite(u) && u >= 0 && u <= 1;
  }

  function scaleFactor(id, u) {
    const history = getHistory(id);
    if (!history || !validU(u)) return null;
    if (id === 'linear') return A_EMIT + (A_OBS - A_EMIT) * u;
    if (id === 'early') return A_EMIT + (A_OBS - A_EMIT) * Math.sqrt(u);
    return A_EMIT + (A_OBS - A_EMIT) * u * u;
  }

  function pathIntegral(id) {
    if (!getHistory(id)) return null;
    if (id === 'linear') return 2 * Math.log(2);
    if (id === 'early') return 4 * (1 - Math.log(2));
    return Math.PI / 2;
  }

  function sampleHistory(id, samples = SAMPLE_U) {
    if (!getHistory(id) || !Array.isArray(samples)) return null;
    const values = [];
    for (const u of samples) {
      const a = scaleFactor(id, u);
      if (a === null) return null;
      values.push(Object.freeze({ u, a }));
    }
    return Object.freeze(values);
  }

  function snapshot(id) {
    const history = getHistory(id);
    if (!history) return null;
    return Object.freeze({
      id: history.id,
      label: history.label,
      formula: history.formula,
      exactIntegral: history.exactIntegral,
      note: history.note,
      emittedScaleFactor: A_EMIT,
      observedScaleFactor: A_OBS,
      redshift: REDSHIFT,
      stretchFactor: 1 + REDSHIFT,
      pathIntegral: pathIntegral(id),
      samples: sampleHistory(id)
    });
  }

  return Object.freeze({
    A_EMIT,
    A_OBS,
    REDSHIFT,
    SAMPLE_U,
    HISTORIES,
    getHistory,
    scaleFactor,
    pathIntegral,
    sampleHistory,
    snapshot
  });
});
