(function attachPossibilityEngineCore(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.MuseumPossibilityEngineCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function buildPossibilityEngineCore() {
  'use strict';

  const SUCCESS_CASES = [
    {
      id: 'solar-neutrinos',
      label: 'Solar neutrinos',
      question: 'Where did the missing solar electron neutrinos go?',
      startingMap: 'The deficit could have lived in the solar model, in the assumption that neutrino identity stays fixed, or in a deeper particle process.',
      possibilities: [
        { id: 'solar-model', label: 'The solar model alone explains the deficit', initialStatus: 'open' },
        { id: 'fixed-identity', label: 'Neutrino identity stays fixed in flight', initialStatus: 'open' },
        { id: 'oscillation', label: 'Neutrinos change flavour in flight', initialStatus: 'open' }
      ],
      evidence: [
        {
          title: 'The deficit persists',
          body: 'Solar experiments repeatedly detect fewer electron neutrinos than the expected flux.',
          statuses: { 'solar-model': 'open', 'fixed-identity': 'pressured', oscillation: 'open' }
        },
        {
          title: 'The missing flux changes identity',
          body: 'Atmospheric and solar-neutrino experiments show flavour change. Neutrino oscillation requires neutrinos to have non-zero mass.',
          statuses: { 'solar-model': 'retired', 'fixed-identity': 'retired', oscillation: 'survived' }
        }
      ],
      archive: {
        hinge: 'DEFICIT → TRANSFORMATION',
        result: 'A missing-particle puzzle exposed a deeper assumption: neutrinos can change flavour, so the massless-neutrino picture could not remain complete.',
        source: 'Royal Swedish Academy of Sciences · Physics 2015'
      }
    },
    {
      id: 'accelerating-universe',
      label: 'Accelerating universe',
      question: 'Was the late-time expansion of the universe slowing down?',
      startingMap: 'Gravity made deceleration the expected result. Distant Type Ia supernovae offered a way to test that expectation against the sky.',
      possibilities: [
        { id: 'slowing', label: 'Late-time cosmic expansion is slowing', initialStatus: 'open' },
        { id: 'accelerating', label: 'Late-time cosmic expansion is accelerating', initialStatus: 'open' }
      ],
      evidence: [
        {
          title: 'The test is built',
          body: 'Two teams use distant Type Ia supernovae to measure how cosmic expansion changed over time.',
          statuses: { slowing: 'open', accelerating: 'open' }
        },
        {
          title: 'The expected slowing does not survive',
          body: 'The distant-supernova observations point to an expansion rate that is accelerating rather than decelerating.',
          statuses: { slowing: 'retired', accelerating: 'survived' }
        }
      ],
      archive: {
        hinge: 'EXPECTED SLOWING → ACCELERATION',
        result: 'The surprise did not finish cosmology. It replaced an expected slowdown with observed acceleration and opened the still-unresolved dark-energy problem.',
        source: 'Royal Swedish Academy of Sciences · Physics 2011'
      }
    },
    {
      id: 'gravitational-waves',
      label: 'Gravitational waves',
      question: 'Was the first LIGO transient noise, or a gravitational wave from colliding black holes?',
      startingMap: 'A tiny detector signal has to survive coincidence, waveform and statistical tests before an astrophysical interpretation earns weight.',
      possibilities: [
        { id: 'noise', label: 'The coincident transient is detector noise', initialStatus: 'open' },
        { id: 'wave', label: 'The transient is an astrophysical gravitational wave', initialStatus: 'open' },
        { id: 'binary-black-hole', label: 'The waveform is consistent with a binary black-hole merger', initialStatus: 'open' }
      ],
      evidence: [
        {
          title: 'Two detectors hear the transient',
          body: 'The LIGO detectors record a coincident short signal with the characteristic sweep expected from a compact-binary inspiral and merger.',
          statuses: { noise: 'pressured', wave: 'open', 'binary-black-hole': 'open' }
        },
        {
          title: 'The waveform survives the hard test',
          body: "The signal matches general-relativistic binary-black-hole waveforms and survives the collaboration's tests against detector noise.",
          statuses: { noise: 'retired', wave: 'survived', 'binary-black-hole': 'survived' }
        }
      ],
      archive: {
        hinge: 'PREDICTION → DETECTION',
        result: 'A century-old prediction crossed into direct observation, while the noise-only explanation for that event stopped surviving the evidence.',
        source: 'Royal Swedish Academy of Sciences · Physics 2017'
      }
    }
  ];

  const STATUS_LABELS = Object.freeze({
    open: 'Open',
    pressured: 'Pressured',
    retired: 'Retired by this evidence',
    survived: 'Survived this evidence'
  });

  function getCase(id) {
    return SUCCESS_CASES.find((item) => item.id === id) || null;
  }

  function clampEvidenceCount(item, evidenceCount) {
    if (!item) return 0;
    const numeric = Number.isFinite(evidenceCount) ? Math.trunc(evidenceCount) : 0;
    return Math.max(0, Math.min(item.evidence.length, numeric));
  }

  function possibilitySnapshot(id, evidenceCount = 0) {
    const item = getCase(id);
    if (!item) return null;

    const applied = clampEvidenceCount(item, evidenceCount);
    const statuses = Object.fromEntries(item.possibilities.map((possibility) => [possibility.id, possibility.initialStatus]));
    for (let index = 0; index < applied; index += 1) {
      Object.assign(statuses, item.evidence[index].statuses);
    }

    return {
      id: item.id,
      label: item.label,
      question: item.question,
      startingMap: item.startingMap,
      evidenceCount: applied,
      evidenceTotal: item.evidence.length,
      currentEvidence: applied > 0 ? { ...item.evidence[applied - 1] } : null,
      possibilities: item.possibilities.map((possibility) => ({
        id: possibility.id,
        label: possibility.label,
        status: statuses[possibility.id]
      })),
      archive: { ...item.archive }
    };
  }

  function statusLabel(status) {
    return STATUS_LABELS[status] || 'Unknown';
  }

  return Object.freeze({
    SUCCESS_CASES,
    STATUS_LABELS,
    getCase,
    clampEvidenceCount,
    possibilitySnapshot,
    statusLabel
  });
});
