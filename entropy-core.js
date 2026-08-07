(function attachEntropyCore(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.MuseumEntropyCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function buildEntropyCore() {
  'use strict';

  const EXECUTION_SEED = '800cbe27a5b38bddb19ba0b4eb8a65dea8507e39afeeb06b77aa54043e5424b9';
  const STATE_KEY = 'museum-of-almost:entropy:v4';
  const LEGACY_KEYS = [
    'museum-of-almost:entropy:v3',
    'museum-of-almost:entropy:v2',
    'museum-of-almost:entropy:v1',
    'museum-of-almost:v1',
    'museum-of-almost:tomorrow:v1'
  ];
  const DIRECTIONS = ['north', 'east', 'south', 'west'];
  const MEANINGS = [
    'scaffold', 'appetite', 'weather', 'shelter', 'scar', 'orientation',
    'permission', 'balance', 'rehearsal', 'boundary', 'pulse', 'remainder'
  ];
  const NOTES = [
    'edge unconfirmed',
    'fold still growing',
    'map refuses north',
    'surface remembers depth',
    'inside remains provisional',
    'outside has moved'
  ];

  function clampInt(value, min, max, fallback = min) {
    const numeric = Math.floor(Number(value));
    if (!Number.isFinite(numeric)) return fallback;
    return Math.max(min, Math.min(max, numeric));
  }

  function hashString(value) {
    let hash = 2166136261;
    const text = String(value);
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function sanitizeGeometry(value) {
    const input = value && typeof value === 'object' ? value : {};
    return {
      spread: clampInt(input.spread, 0, 4, 0),
      axis: clampInt(input.axis, 0, 3, 0),
      fold: clampInt(input.fold, 0, 2, 0),
      generation: clampInt(input.generation, 0, 999, 0)
    };
  }

  function createState(installSeed, geometry = null) {
    return {
      version: 4,
      installSeed: Number(installSeed) >>> 0 || 1,
      visit: 0,
      geometry: sanitizeGeometry(geometry)
    };
  }

  function sanitizeState(candidate, fallbackSeed = 1) {
    if (!candidate || typeof candidate !== 'object') return createState(fallbackSeed);
    const next = createState(candidate.installSeed || fallbackSeed, candidate.geometry);
    next.visit = clampInt(candidate.visit, 0, 9999, 0);
    return next;
  }

  function migrateLegacy(...legacyValues) {
    const first = legacyValues.findIndex((value) => typeof value === 'string' && value.length > 0);
    if (first < 0) return { migrated: false, geometry: null };
    return {
      migrated: true,
      geometry: {
        spread: 1 + (first % 2),
        axis: first % DIRECTIONS.length,
        fold: first % 3,
        generation: 0
      }
    };
  }

  function advanceVisit(inputState) {
    const state = sanitizeState(inputState, inputState?.installSeed || 1);
    return {
      ...state,
      visit: Math.min(9999, state.visit + 1)
    };
  }

  function meaningIndex(state, slot) {
    const base = hashString(`${EXECUTION_SEED}:${state.installSeed}:meaning-base`) % MEANINGS.length;
    return (base + state.visit + state.geometry.generation + slot * 4) % MEANINGS.length;
  }

  function meaningsFor(inputState) {
    const state = sanitizeState(inputState, inputState?.installSeed || 1);
    return Array.from({ length: 3 }, (_, slot) => MEANINGS[meaningIndex(state, slot)]);
  }

  function notesFor(inputState) {
    const state = sanitizeState(inputState, inputState?.installSeed || 1);
    const visible = Math.min(3, 1 + Math.floor(state.geometry.generation / 2));
    return Array.from({ length: 3 }, (_, slot) => {
      const index = hashString(
        `${EXECUTION_SEED}:${state.installSeed}:${state.geometry.generation}:${slot}:note`
      ) % NOTES.length;
      return {
        text: NOTES[index],
        visible: slot < visible
      };
    });
  }

  function nextDirection(inputState) {
    const state = sanitizeState(inputState, inputState?.installSeed || 1);
    const index = hashString(
      `${EXECUTION_SEED}:${state.installSeed}:${state.visit}:${state.geometry.generation}:${state.geometry.fold}:direction`
    ) % DIRECTIONS.length;
    return DIRECTIONS[index];
  }

  function separate(inputState, rawDirection) {
    const state = sanitizeState(inputState, inputState?.installSeed || 1);
    const direction = DIRECTIONS.includes(rawDirection) ? rawDirection : nextDirection(state);
    const axis = DIRECTIONS.indexOf(direction);
    const spread = Math.min(4, state.geometry.spread + 1);
    const fold = state.geometry.spread >= 4
      ? (state.geometry.fold + 1 + (axis % 2)) % 3
      : state.geometry.fold;

    return {
      ...state,
      geometry: {
        ...state.geometry,
        spread,
        axis,
        fold
      }
    };
  }

  function advanceSilence(inputState) {
    const before = sanitizeState(inputState, inputState?.installSeed || 1);
    const beforeMeanings = meaningsFor(before);
    const generation = Math.min(999, before.geometry.generation + 1);
    const step = 1 + (hashString(
      `${EXECUTION_SEED}:${before.installSeed}:${generation}:idle-axis`
    ) % 3);
    const after = {
      ...before,
      geometry: {
        spread: Math.max(0, before.geometry.spread - 1),
        axis: (before.geometry.axis + step) % DIRECTIONS.length,
        fold: (before.geometry.fold + 1) % 3,
        generation
      }
    };
    const afterMeanings = meaningsFor(after);
    const warningIndex = hashString(
      `${EXECUTION_SEED}:${after.installSeed}:${generation}:late-warning`
    ) % 3;

    return {
      state: after,
      warningIndex,
      warning: `Late warning: ${beforeMeanings[warningIndex]} has already become ${afterMeanings[warningIndex]}.`
    };
  }

  function geometryFor(inputState) {
    const state = sanitizeState(inputState, inputState?.installSeed || 1);
    const spread = state.geometry.spread * 12;
    const vectors = [
      { x: 0, y: -1 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: -1, y: 0 }
    ];
    const vector = vectors[state.geometry.axis];
    const orderSets = [
      [1, 2, 3],
      [3, 1, 2],
      [2, 3, 1]
    ];
    const order = orderSets[state.geometry.fold];

    return [-1, 0, 1].map((band, index) => ({
      x: vector.x * spread * band,
      y: vector.y * spread * band,
      rotation: band * (2 + state.geometry.fold * 0.7),
      scale: 1 - Math.abs(band) * 0.018,
      z: order[index]
    }));
  }

  function memoryText(inputState) {
    const state = sanitizeState(inputState, inputState?.installSeed || 1);
    if (state.visit <= 1 && state.geometry.generation === 0 && state.geometry.spread === 0) {
      return 'No earlier geometry is being carried yet.';
    }
    return 'The geometry is preserved. Its meaning is allowed to change.';
  }

  function summaryText(inputState) {
    const meanings = meaningsFor(inputState);
    return `Three realities currently read as ${meanings[0]}, ${meanings[1]}, and ${meanings[2]}.`;
  }

  return Object.freeze({
    EXECUTION_SEED,
    STATE_KEY,
    LEGACY_KEYS,
    DIRECTIONS,
    MEANINGS,
    NOTES,
    hashString,
    sanitizeGeometry,
    createState,
    sanitizeState,
    migrateLegacy,
    advanceVisit,
    meaningsFor,
    notesFor,
    nextDirection,
    separate,
    advanceSilence,
    geometryFor,
    memoryText,
    summaryText
  });
});
