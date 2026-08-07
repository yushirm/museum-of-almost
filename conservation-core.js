'use strict';

globalThis.MuseumConservationCore = (() => {
  const objectSubjects = [
    'Compass', 'Lantern', 'Clock', 'Window', 'Instrument', 'Machine',
    'Archive', 'Telescope', 'Door', 'Weather Vane', 'Map', 'Bell'
  ];
  const objectConditions = [
    'That Points Toward Almost',
    'Recovered from an Unfinished Morning',
    'Whose Missing Part Is the View',
    'Built to Measure Patient Uncertainty',
    'That Remembers a Different Future',
    'With One Useful Error Preserved',
    'That Opens Only While Unresolved',
    'Designed for Several Possible Worlds'
  ];
  const media = [
    'tempered maybe, brass memory, and borrowed light',
    'painted silence with a mechanism of uncertain purpose',
    'archival glass, soft static, and one reversible conclusion',
    'folded weather mounted on a patient frame',
    'lunar dust substitute, museum wire, and incomplete instructions',
    'polished hesitation with traces of an earlier answer'
  ];
  const diagnoses = [
    'The object is structurally sound but has become separated from its preferred interpretation.',
    'Three fragments remain cooperative. Their original certainty could not be recovered and was not missed.',
    'Previous repairs attempted to make the object useful. The lab has carefully removed that damage.',
    'The break appears intentional, possibly to allow more light through the middle.',
    'No material is missing. The distance between the pieces is part of the collection.',
    'The object failed only at becoming ordinary. All other systems remain available.'
  ];
  const promises = [
    'Restore the relationship, not the illusion of perfection.',
    'Leave every seam visible enough to remember the object had choices.',
    'Do not force the fragments to agree more than necessary.',
    'The completed form should retain at least one honest uncertainty.',
    'Repair only what prevents the object from continuing to wonder.',
    'A successful treatment may remain visibly unfinished.'
  ];
  const reports = [
    'The fragments now recognise one another without pretending the break never happened.',
    'Alignment restored. Original purpose remains responsibly undetermined.',
    'The object has regained structural imagination and may return to display.',
    'Treatment complete enough for the Museum and incomplete enough for the object.',
    'The seams are stable, legible, and carrying more light than before.',
    'Conservation succeeded by preserving the exact place where certainty stopped.'
  ];
  const palettes = [
    ['#f0cf8e', '#8ab8b1', '#795f91'],
    ['#cdb7ff', '#86a9c1', '#c78978'],
    ['#a8d5c8', '#d4a36f', '#5e6d93'],
    ['#e2c6d5', '#7fa9a5', '#a67c5e'],
    ['#b9d6ed', '#d2b179', '#75668e'],
    ['#d9d1a6', '#82a9b6', '#b57986']
  ];
  const shapeSets = [
    [
      [[-0.58, -0.42], [0.06, -0.58], [0.42, -0.08], [0.12, 0.52], [-0.5, 0.34]],
      [[-0.42, -0.48], [0.5, -0.34], [0.58, 0.2], [0.02, 0.56], [-0.48, 0.12]],
      [[-0.52, -0.18], [-0.12, -0.58], [0.5, -0.4], [0.58, 0.34], [-0.04, 0.56]]
    ],
    [
      [[-0.56, -0.5], [0.18, -0.52], [0.54, 0.02], [0.18, 0.5], [-0.48, 0.28]],
      [[-0.5, -0.22], [-0.08, -0.58], [0.54, -0.28], [0.48, 0.42], [-0.2, 0.56]],
      [[-0.58, -0.38], [0.38, -0.5], [0.56, 0.18], [0.02, 0.58], [-0.5, 0.18]]
    ],
    [
      [[-0.5, -0.56], [0.4, -0.36], [0.54, 0.28], [-0.08, 0.54], [-0.56, 0.08]],
      [[-0.56, -0.12], [-0.2, -0.58], [0.46, -0.42], [0.58, 0.38], [-0.18, 0.52]],
      [[-0.5, -0.42], [0.18, -0.56], [0.56, -0.04], [0.3, 0.52], [-0.54, 0.3]]
    ],
    [
      [[-0.58, -0.24], [-0.22, -0.56], [0.52, -0.32], [0.48, 0.4], [-0.18, 0.56]],
      [[-0.52, -0.5], [0.26, -0.48], [0.56, 0.16], [0.04, 0.58], [-0.5, 0.18]],
      [[-0.56, -0.36], [0.1, -0.58], [0.52, -0.12], [0.34, 0.54], [-0.5, 0.32]]
    ]
  ];

  function hashString(value) {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function mulberry32(seed) {
    return function random() {
      let value = seed += 0x6D2B79F5;
      value = Math.imul(value ^ value >>> 15, value | 1);
      value ^= value + Math.imul(value ^ value >>> 7, value | 61);
      return ((value ^ value >>> 14) >>> 0) / 4294967296;
    };
  }

  function choose(random, options) {
    return options[Math.floor(random() * options.length)];
  }

  function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, Number.isFinite(value) ? value : minimum));
  }

  function normalizeAngle(value) {
    const angle = Number.isFinite(value) ? value : 0;
    return ((angle % 360) + 360) % 360;
  }

  function angleDistance(a, b) {
    const difference = Math.abs(normalizeAngle(a) - normalizeAngle(b));
    return Math.min(difference, 360 - difference);
  }

  function normalizeState(rawState) {
    const state = rawState && typeof rawState === 'object' ? rawState : {};
    const fragments = Array.isArray(state.fragments)
      ? state.fragments
        .filter((fragment) => fragment && typeof fragment.text === 'string' && fragment.text.trim())
        .slice(0, 6)
        .map((fragment) => ({
          text: fragment.text.trim().slice(0, 180),
          source: typeof fragment.source === 'string' ? fragment.source.slice(0, 100) : ''
        }))
      : [];

    return {
      seed: Number.isFinite(state.seed) ? state.seed >>> 0 : 0,
      cycle: Number.isFinite(state.cycle) ? Math.max(0, Math.floor(state.cycle)) : 0,
      completedCollections: Number.isFinite(state.completedCollections)
        ? Math.max(0, Math.floor(state.completedCollections))
        : 0,
      fragments
    };
  }

  function validDate(dateLike) {
    const date = dateLike instanceof Date ? new Date(dateLike.getTime()) : new Date(dateLike);
    return Number.isNaN(date.getTime()) ? new Date(0) : date;
  }

  function dateKey(dateLike) {
    const date = validDate(dateLike);
    const year = String(date.getFullYear()).padStart(4, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function copyPiece(piece) {
    return {
      id: String(piece?.id || ''),
      x: clamp(piece?.x, 0.1, 0.9),
      y: clamp(piece?.y, 0.14, 0.86),
      rotation: normalizeAngle(piece?.rotation),
      points: Array.isArray(piece?.points)
        ? piece.points.slice(0, 8).map((point) => [clamp(point?.[0], -0.7, 0.7), clamp(point?.[1], -0.7, 0.7)])
        : []
    };
  }

  function movePiece(piece, dx, dy) {
    const next = copyPiece(piece);
    next.x = clamp(next.x + (Number.isFinite(dx) ? dx : 0), 0.1, 0.9);
    next.y = clamp(next.y + (Number.isFinite(dy) ? dy : 0), 0.14, 0.86);
    return next;
  }

  function rotatePiece(piece, delta) {
    const next = copyPiece(piece);
    next.rotation = normalizeAngle(next.rotation + (Number.isFinite(delta) ? delta : 0));
    return next;
  }

  function snapPiece(piece, target) {
    const next = copyPiece(piece);
    const destination = copyPiece(target);
    next.x = destination.x;
    next.y = destination.y;
    next.rotation = destination.rotation;
    return next;
  }

  function isPieceAligned(piece, target, positionTolerance = 0.035, rotationTolerance = 8) {
    if (!piece || !target || piece.id !== target.id) return false;
    const distance = Math.hypot(piece.x - target.x, piece.y - target.y);
    return distance <= positionTolerance && angleDistance(piece.rotation, target.rotation) <= rotationTolerance;
  }

  function evaluateAssembly(pieces, targets) {
    const targetById = new Map((Array.isArray(targets) ? targets : []).map((target) => [target.id, target]));
    const aligned = (Array.isArray(pieces) ? pieces : []).filter((piece) => isPieceAligned(piece, targetById.get(piece.id))).length;
    const total = targetById.size;
    return Object.freeze({
      aligned,
      total,
      progress: total === 0 ? 0 : aligned / total,
      complete: total > 0 && aligned === total
    });
  }

  function buildCase(dateLike, rawState, variation = 0) {
    const state = normalizeState(rawState);
    const key = dateKey(dateLike);
    const safeVariation = Number.isFinite(variation) ? Math.min(98, Math.max(0, Math.floor(variation))) : 0;
    const signature = state.fragments.map((fragment) => `${fragment.text}:${fragment.source}`).join('|');
    const seed = hashString([key, state.seed, state.cycle, state.completedCollections, signature, safeVariation].join('::'));
    const random = mulberry32(seed);
    const shapeSet = shapeSets[(seed + safeVariation) % shapeSets.length];
    const targetBases = [[0.36, 0.5], [0.52, 0.43], [0.64, 0.55]];
    const startBases = [[0.18, 0.24], [0.82, 0.27], [0.5, 0.8]];
    const targetPieces = [];
    const startPieces = [];

    for (let index = 0; index < 3; index += 1) {
      const id = `fragment-${index + 1}`;
      const target = {
        id,
        x: Number((targetBases[index][0] + (random() - 0.5) * 0.035).toFixed(4)),
        y: Number((targetBases[index][1] + (random() - 0.5) * 0.035).toFixed(4)),
        rotation: Math.round(random() * 8) * 15,
        points: shapeSet[index].map((point) => [...point])
      };
      const start = {
        id,
        x: Number((startBases[index][0] + (random() - 0.5) * 0.08).toFixed(4)),
        y: Number((startBases[index][1] + (random() - 0.5) * 0.08).toFixed(4)),
        rotation: normalizeAngle(target.rotation + 75 + Math.round(random() * 10) * 15),
        points: shapeSet[index].map((point) => [...point])
      };
      targetPieces.push(Object.freeze(target));
      startPieces.push(Object.freeze(start));
    }

    const fragment = state.fragments.length > 0
      ? state.fragments[Math.floor(random() * state.fragments.length)].text
      : 'the empty space reserved for a future fragment';
    const subjectIndex = (Math.floor(random() * objectSubjects.length) + safeVariation) % objectSubjects.length;
    const conditionIndex = (Math.floor(random() * objectConditions.length) + safeVariation * 3) % objectConditions.length;

    return Object.freeze({
      caseId: `CASE ${key.replaceAll('-', '')}-${String(safeVariation + 1).padStart(2, '0')}`,
      dateKey: key,
      variation: safeVariation,
      seed,
      title: `The ${objectSubjects[subjectIndex]} ${objectConditions[conditionIndex]}`,
      medium: choose(random, media),
      diagnosis: choose(random, diagnoses),
      promise: choose(random, promises),
      report: choose(random, reports),
      fragmentEcho: `Catalogue resonance: “${fragment}.”`,
      palette: Object.freeze([...palettes[(seed + safeVariation) % palettes.length]]),
      targetPieces: Object.freeze(targetPieces),
      startPieces: Object.freeze(startPieces),
      state
    });
  }

  return Object.freeze({
    angleDistance,
    buildCase,
    copyPiece,
    dateKey,
    evaluateAssembly,
    isPieceAligned,
    movePiece,
    normalizeAngle,
    normalizeState,
    rotatePiece,
    snapPiece
  });
})();
