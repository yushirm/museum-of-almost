(function attachEntropyCore(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.MuseumEntropyCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function buildEntropyCore() {
  'use strict';

  const EXECUTION_SEED = '18fe665945016bff2168f9c3ad6110e5c684dc9e8ef0983d9a300a8ac848782c';
  const STATE_KEY = 'museum-of-almost:entropy:v2';
  const LEGACY_KEYS = [
    'museum-of-almost:entropy:v1',
    'museum-of-almost:v1',
    'museum-of-almost:tomorrow:v1'
  ];
  const TERM_COUNT = 8;
  const MAX_PENDING = 3;
  const TARGET_ERROR = 0.28;
  const SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter'];
  const TERMS = ['root', 'stem', 'vein', 'bud', 'bloom', 'fruit', 'husk', 'seed'];

  function clamp(value, min = -1, max = 1) {
    return Math.max(min, Math.min(max, Number(value) || 0));
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

  function mulberry32(seed) {
    let value = seed >>> 0;
    return function random() {
      value += 0x6D2B79F5;
      let result = value;
      result = Math.imul(result ^ result >>> 15, result | 1);
      result ^= result + Math.imul(result ^ result >>> 7, result | 61);
      return ((result ^ result >>> 14) >>> 0) / 4294967296;
    };
  }

  function structuredCloneSafe(value) {
    if (typeof structuredClone === 'function') return structuredClone(value);
    return JSON.parse(JSON.stringify(value));
  }

  function createState(installSeed, legacyBias = 0) {
    const safeSeed = Number(installSeed) >>> 0 || 1;
    const random = mulberry32(hashString(`${EXECUTION_SEED}:${safeSeed}:field`));
    const bias = clamp(legacyBias, -0.2, 0.2);
    return {
      version: 2,
      installSeed: safeSeed,
      visits: 0,
      actionCount: 0,
      season: hashString(`${EXECUTION_SEED}:${safeSeed}:season`) % SEASONS.length,
      offsets: Array.from({ length: TERM_COUNT }, (_, index) => {
        const sign = index % 2 === 0 ? 1 : -1;
        return clamp(sign * (0.08 + random() * 0.16) + bias * 0.35, -0.65, 0.65);
      }),
      idleCycles: 0,
      pending: [],
      rememberedAction: null,
      legacyBias: bias
    };
  }

  function sanitizeState(candidate, fallbackSeed = 1) {
    if (!candidate || typeof candidate !== 'object') return createState(fallbackSeed, 0);
    const installSeed = Number(candidate.installSeed) >>> 0 || (Number(fallbackSeed) >>> 0) || 1;
    const base = createState(installSeed, clamp(candidate.legacyBias, -0.2, 0.2));
    const pending = Array.isArray(candidate.pending)
      ? candidate.pending.slice(-MAX_PENDING).map((item, index) => ({
          id: String(item?.id || `recovered-${index}`),
          source: Math.abs(Math.floor(Number(item?.source) || 0)) % TERM_COUNT,
          target: Math.abs(Math.floor(Number(item?.target) || 0)) % TERM_COUNT,
          delta: clamp(item?.delta, -0.4, 0.4),
          longDelay: Boolean(item?.longDelay)
        }))
      : [];
    const rememberedAction = candidate.rememberedAction && typeof candidate.rememberedAction === 'object'
      ? {
          slot: Math.abs(Math.floor(Number(candidate.rememberedAction.slot) || 0)) % TERM_COUNT,
          delta: clamp(candidate.rememberedAction.delta, -0.4, 0.4)
        }
      : null;

    return {
      ...base,
      visits: Math.max(0, Math.min(9999, Math.floor(Number(candidate.visits) || 0))),
      actionCount: Math.max(0, Math.min(999999, Math.floor(Number(candidate.actionCount) || 0))),
      season: Math.abs(Math.floor(Number(candidate.season) || 0)) % SEASONS.length,
      offsets: Array.from({ length: TERM_COUNT }, (_, index) => clamp(candidate.offsets?.[index], -0.75, 0.75)),
      idleCycles: Math.max(0, Math.min(9999, Math.floor(Number(candidate.idleCycles) || 0))),
      pending,
      rememberedAction
    };
  }

  function migrateLegacy(entropyV1, museumV1, tomorrowV1) {
    let legacyBias = 0;
    let migrated = false;

    try {
      const previous = typeof entropyV1 === 'string' ? JSON.parse(entropyV1) : entropyV1;
      if (previous && typeof previous === 'object') {
        const tensions = Array.isArray(previous.tensions) ? previous.tensions.slice(0, 6) : [];
        if (tensions.length) {
          const average = tensions.reduce((sum, value) => sum + clamp(value), 0) / tensions.length;
          legacyBias += clamp(average * 0.16, -0.12, 0.12);
        }
        migrated = true;
      }
    } catch {
      migrated = true;
    }

    try {
      const museum = typeof museumV1 === 'string' ? JSON.parse(museumV1) : museumV1;
      if (museum && typeof museum === 'object') {
        const fragments = Array.isArray(museum.fragments) ? Math.min(museum.fragments.length, 6) : 0;
        legacyBias += fragments * 0.008;
        migrated = true;
      }
    } catch {
      migrated = true;
    }

    try {
      const tomorrow = typeof tomorrowV1 === 'string' ? JSON.parse(tomorrowV1) : tomorrowV1;
      if (tomorrow && typeof tomorrow === 'object') {
        legacyBias -= 0.02;
        migrated = true;
      }
    } catch {
      migrated = true;
    }

    return { migrated, legacyBias: clamp(legacyBias, -0.2, 0.2) };
  }

  function seasonName(state) {
    return SEASONS[Math.abs(Number(state.season) || 0) % SEASONS.length];
  }

  function lawText(state) {
    const lines = [
      'A repair is valid only while one error remains.',
      'Growth is permitted only when alignment is incomplete.',
      'A finished correction must immediately become approximate.',
      'Dormancy ends when the smallest flaw survives.'
    ];
    return lines[state.season % lines.length];
  }

  function instructionText(state) {
    const lines = [
      'Touch the timeline. Repair the break incorrectly.',
      'The law is over-correcting. Obstruct it.',
      'Leave enough error for the sequence to remain legible.',
      'Wake one fault without making it exact.'
    ];
    return lines[state.season % lines.length];
  }

  function coherence(state) {
    const averageError = state.offsets.reduce((sum, value) => sum + Math.abs(value), 0) / TERM_COUNT;
    return clamp(1 - Math.abs(averageError - TARGET_ERROR) / TARGET_ERROR, 0, 1);
  }

  function density(state) {
    return clamp(0.32 + (1 - coherence(state)) * 0.68, 0.32, 1);
  }

  function conditionText(state) {
    const value = coherence(state);
    if (value > 0.76) return 'The law is coherent because it remains partly wrong.';
    if (value > 0.42) return 'The law is holding, but exactness is approaching.';
    return density(state) > 0.78
      ? 'The law has become too exact and therefore difficult to read.'
      : 'The law has become too scattered to agree with itself.';
  }

  function duplicateActive(state) {
    return state.actionCount >= 2 || state.visits > 1;
  }

  function duplicateIndex(state) {
    return hashString(
      `${EXECUTION_SEED}:${state.installSeed}:${state.season}:${Math.floor(state.actionCount / 2)}:duplicate`
    ) % TERM_COUNT;
  }

  function targetMagnitude(state, slot) {
    const seasonal = [0.24, 0.33, 0.29, 0.21][state.season % 4];
    const wobble = ((hashString(`${EXECUTION_SEED}:${state.installSeed}:${state.actionCount}:${slot}:target`) % 9) - 4) / 100;
    return clamp(seasonal + wobble, 0.16, 0.4);
  }

  function repairIncorrectly(inputState, rawSlot) {
    const state = sanitizeState(inputState, inputState?.installSeed || 1);
    const slot = Math.abs(Math.floor(Number(rawSlot) || 0)) % TERM_COUNT;
    const next = structuredCloneSafe(state);
    next.actionCount += 1;

    const current = next.offsets[slot];
    const sign = Math.abs(current) > 0.035
      ? Math.sign(current)
      : (hashString(`${EXECUTION_SEED}:${next.installSeed}:${slot}:sign`) % 2 ? 1 : -1);
    const target = targetMagnitude(next, slot);
    const duplicate = duplicateActive(state) && duplicateIndex(state) === slot;
    const resistance = duplicate ? 0.45 : 1;
    const proposed = sign * target;
    const delta = clamp((proposed - current) * resistance, -0.38, 0.38);

    next.offsets[slot] = clamp(current + delta, -0.72, 0.72);
    const neighbour = duplicate ? (slot + 2) % TERM_COUNT : (slot + 1) % TERM_COUNT;
    next.offsets[neighbour] = clamp(next.offsets[neighbour] - delta * 0.26, -0.72, 0.72);

    next.rememberedAction = { slot, delta: clamp(delta, -0.4, 0.4) };

    const consequenceSeed = hashString(`${EXECUTION_SEED}:${next.installSeed}:${next.actionCount}:${slot}:return`);
    const targetSlot = (slot + 3 + consequenceSeed % 4) % TERM_COUNT;
    const consequence = {
      id: `${next.actionCount}-${consequenceSeed.toString(16)}`,
      source: slot,
      target: targetSlot,
      delta: clamp(-delta * (duplicate ? 1.75 : 0.92), -0.38, 0.38),
      longDelay: next.actionCount === 5
    };
    next.pending = [...next.pending, consequence].slice(-MAX_PENDING);

    const seasonChanged = next.actionCount % 4 === 0;
    if (seasonChanged) next.season = (next.season + 1) % SEASONS.length;

    return {
      state: next,
      consequence,
      slot,
      neighbour,
      duplicate,
      seasonChanged,
      refuseImmediate: next.actionCount === 7,
      line: duplicate
        ? 'The duplicate disagrees here. The repair lands elsewhere first.'
        : seasonChanged
          ? `The incorrect repair holds. ${seasonName(next)} begins.`
          : 'The repair remains slightly wrong. The law becomes easier to read.'
    };
  }

  function applyConsequence(inputState, consequenceInput) {
    const state = sanitizeState(inputState, inputState?.installSeed || 1);
    const consequence = consequenceInput || state.pending[0];
    if (!consequence) return { state, line: 'No delayed repair remained.' };
    const next = structuredCloneSafe(state);
    const target = Math.abs(Math.floor(Number(consequence.target) || 0)) % TERM_COUNT;
    const source = Math.abs(Math.floor(Number(consequence.source) || 0)) % TERM_COUNT;
    const delta = clamp(consequence.delta, -0.4, 0.4);

    next.offsets[target] = clamp(next.offsets[target] + delta, -0.72, 0.72);
    next.offsets[(target + TERM_COUNT - 1) % TERM_COUNT] = clamp(
      next.offsets[(target + TERM_COUNT - 1) % TERM_COUNT] - delta * 0.22,
      -0.72,
      0.72
    );
    next.pending = next.pending.filter((item) => item.id !== consequence.id);

    return {
      state: next,
      target,
      source,
      line: target === source
        ? 'The delayed repair returns to its source with one detail changed.'
        : 'A later correction arrives somewhere that was not touched.'
    };
  }

  function idleShift(inputState) {
    const state = sanitizeState(inputState, inputState?.installSeed || 1);
    const next = structuredCloneSafe(state);
    next.idleCycles += 1;
    next.offsets = next.offsets.map((value, index) => {
      const pull = index === duplicateIndex(next) ? 0.78 : 0.69;
      return clamp(value * pull, -0.72, 0.72);
    });

    const seasonChanged = next.idleCycles % 3 === 0;
    if (seasonChanged) next.season = (next.season + 1) % SEASONS.length;

    return {
      state: next,
      seasonChanged,
      line: seasonChanged
        ? `Inactivity over-corrects the timeline. ${seasonName(next)} arrives without permission.`
        : 'Left alone, the law repairs itself toward failure.'
    };
  }

  function advanceVisit(inputState) {
    let state = sanitizeState(inputState, inputState?.installSeed || 1);
    const pendingCount = state.pending.length;
    let line = 'The browser begins from a seasonal error.';

    for (const consequence of [...state.pending]) {
      const applied = applyConsequence(state, consequence);
      state = applied.state;
      line = applied.line;
    }

    state.visits = Math.min(9999, state.visits + 1);

    if (state.rememberedAction) {
      const scar = (state.rememberedAction.slot + 1) % TERM_COUNT;
      state.offsets[scar] = clamp(
        state.offsets[scar] + state.rememberedAction.delta * 0.18,
        -0.72,
        0.72
      );
      line = pendingCount
        ? 'A delayed repair returns, and the remembered action scars one term late.'
        : 'The remembered action returns one term later than expected.';
    }

    return { state, returnedConsequences: pendingCount, line };
  }

  function memoryText(state) {
    if (!state.rememberedAction) return 'No visitor action is remembered yet.';
    return `The browser remembers only the last repair at ${TERMS[state.rememberedAction.slot]}.`;
  }

  function termData(state) {
    const duplicate = duplicateIndex(state);
    return TERMS.map((term, index) => ({
      id: `term-${index + 1}`,
      label: term,
      offset: state.offsets[index],
      duplicateDifference: duplicateActive(state) && index === duplicate
    }));
  }

  return Object.freeze({
    EXECUTION_SEED,
    STATE_KEY,
    LEGACY_KEYS,
    TERM_COUNT,
    MAX_PENDING,
    TARGET_ERROR,
    SEASONS,
    TERMS,
    hashString,
    mulberry32,
    createState,
    sanitizeState,
    migrateLegacy,
    seasonName,
    lawText,
    instructionText,
    coherence,
    density,
    conditionText,
    duplicateActive,
    duplicateIndex,
    repairIncorrectly,
    applyConsequence,
    idleShift,
    advanceVisit,
    memoryText,
    termData
  });
});
