(function attachGravitationalCopyCore(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.MuseumGravitationalCopyCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function buildGravitationalCopyCore() {
  'use strict';

  const EPSILON = 1e-9;
  const SOURCE_ID = 'SRC-01';

  const CASES = Object.freeze([
    Object.freeze({
      id: 'aligned',
      label: 'Perfect alignment',
      sourceOffset: 0,
      note: 'In the ideal circular point-lens model, exact alignment turns the discrete image pair into a continuous Einstein ring.'
    }),
    Object.freeze({
      id: 'near-axis',
      label: 'Near axis',
      sourceOffset: 0.5,
      note: 'A small source offset breaks the ring symmetry into two apparent images of the same source on opposite sides of the lens.'
    }),
    Object.freeze({
      id: 'off-axis',
      label: 'Farther off axis',
      sourceOffset: 1.5,
      note: 'The same ideal source still produces two point-lens solutions, but one image lies close to the lens and the other farther out.'
    })
  ]);

  function getCase(id) {
    return CASES.find((item) => item.id === id) || null;
  }

  function solveImagePositions(sourceOffset) {
    const y = Number(sourceOffset);
    if (!Number.isFinite(y)) return null;
    const discriminant = Math.sqrt((y * y) + 4);
    return Object.freeze({
      positive: (y + discriminant) / 2,
      negative: (y - discriminant) / 2
    });
  }

  function lensResidual(sourceOffset, imagePosition) {
    const y = Number(sourceOffset);
    const x = Number(imagePosition);
    if (!Number.isFinite(y) || !Number.isFinite(x) || Math.abs(x) < EPSILON) return null;
    return x - (1 / x) - y;
  }

  function imageParity(imagePosition) {
    const x = Number(imagePosition);
    if (!Number.isFinite(x) || Math.abs(x) < EPSILON) return null;
    return Math.abs(x) > 1 ? 'positive' : 'negative';
  }

  function snapshot(caseId) {
    const item = getCase(caseId);
    if (!item) return null;
    const y = item.sourceOffset;
    const aligned = Math.abs(y) < EPSILON;
    const roots = solveImagePositions(y);
    if (!roots) return null;
    const rootProduct = roots.positive * roots.negative;

    if (aligned) {
      return Object.freeze({
        id: item.id,
        label: item.label,
        sourceId: SOURCE_ID,
        sourceOffset: y,
        aligned: true,
        ringRadius: 1,
        rootProduct,
        note: item.note,
        images: Object.freeze([]),
        equation: 'y = x − 1/x'
      });
    }

    const images = [
      Object.freeze({
        id: 'image-a',
        label: 'IMAGE A',
        sourceId: SOURCE_ID,
        position: roots.positive,
        parity: imageParity(roots.positive),
        residual: lensResidual(y, roots.positive)
      }),
      Object.freeze({
        id: 'image-b',
        label: 'IMAGE B',
        sourceId: SOURCE_ID,
        position: roots.negative,
        parity: imageParity(roots.negative),
        residual: lensResidual(y, roots.negative)
      })
    ];

    return Object.freeze({
      id: item.id,
      label: item.label,
      sourceId: SOURCE_ID,
      sourceOffset: y,
      aligned: false,
      ringRadius: null,
      rootProduct,
      note: item.note,
      images: Object.freeze(images),
      separation: roots.positive - roots.negative,
      equation: 'y = x − 1/x'
    });
  }

  return Object.freeze({
    EPSILON,
    SOURCE_ID,
    CASES,
    getCase,
    solveImagePositions,
    lensResidual,
    imageParity,
    snapshot
  });
});
