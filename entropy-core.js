(function attachEntropyCore(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.MuseumEntropyCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function buildEntropyCore() {
  'use strict';

  const EXECUTION_SEED = '3a69eb87180cbca48d2919a9d7e4722d0c54aaaac9e62855a03554f8c389c627';
  const STATE_KEY = 'museum-of-almost:entropy:v1';
  const LEGACY_KEYS = ['museum-of-almost:v1', 'museum-of-almost:tomorrow:v1'];
  const KNOT_COUNT = 6;
  const MAX_PENDING = 4;

  const firstWords = [
    'quiet', 'unspent', 'borrowed', 'patient', 'misplaced', 'unfinished',
    'second-hand', 'temporary', 'unmeasured', 'unclaimed', 'folded', 'softened'
  ];
  const lastWords = [
    'direction', 'echo', 'beginning', 'weather', 'hinge', 'spark',
    'question', 'distance', 'shadow', 'permission', 'apology', 'possibility'
  ];
  const rememberedWords = [
    'a knot that arrived too early',
    'a thread the organism denies making',
    'a seal remembered one position sideways',
    'a harmless warning preserved too carefully'
  ];
  const consequenceLines = [
    'A distant knot answers for an action it did not witness.',
    'The seal changes its mind after the pressure has passed.',
    'Two fibres exchange consequences without exchanging causes.',
    'The weave returns your contradiction in a different tense.',
    'A quiet thread moves outside your attention.',
    'The organism accepts the action and disputes the result.'
  ];

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

  function seededIndex(label, length) {
    return hashString(`${EXECUTION_SEED}:${label}`) % length;
  }

  function buildKnots(installSeed, mutation = []) {
    const random = mulberry32(hashString(`${EXECUTION_SEED}:${installSeed}:knots`));
    const used = new Set();
    return Array.from({ length: KNOT_COUNT }, (_, index) => {
      let phrase = '';
      while (!phrase || used.has(phrase)) {
        const first = firstWords[Math.floor(random() * firstWords.length)];
        const last = lastWords[Math.floor(random() * lastWords.length)];
        phrase = `the ${first} ${last}`;
      }
      used.add(phrase);
      const shift = Math.max(0, Math.min(9, Number(mutation[index]) || 0));
      return {
        id: `knot-${index + 1}`,
        phrase: shift > 0 ? `${phrase}, revised ${shift}` : phrase,
        basePhrase: phrase
      };
    });
  }

  function createState(installSeed, legacyPressure = 0) {
    const safeSeed = Number.isFinite(Number(installSeed)) ? Number(installSeed) >>> 0 : 1;
    const random = mulberry32(hashString(`${EXECUTION_SEED}:${safeSeed}:state`));
    const pressure = clamp(legacyPressure, 0, 1);
    return {
      version: 1,
      installSeed: safeSeed,
      visits: 0,
      actionCount: 0,
      rule: seededIndex('initial-rule', 2),
      tensions: Array.from({ length: KNOT_COUNT }, () => clamp((random() - 0.5) * 0.55 + pressure * 0.2)),
      repeats: Array(KNOT_COUNT).fill(0),
      mutation: Array(KNOT_COUNT).fill(0),
      idleCycles: 0,
      pendingReturn: [],
      memory: null,
      legacyPressure: pressure
    };
  }

  function sanitizeState(candidate, fallbackSeed = 1) {
    if (!candidate || typeof candidate !== 'object') return createState(fallbackSeed, 0);
    const installSeed = Number(candidate.installSeed) >>> 0 || (Number(fallbackSeed) >>> 0) || 1;
    const base = createState(installSeed, clamp(candidate.legacyPressure, 0, 1));
    const pending = Array.isArray(candidate.pendingReturn)
      ? candidate.pendingReturn.slice(-MAX_PENDING).map((item, index) => ({
          id: String(item?.id || `recovered-${index}`),
          source: Math.abs(Number(item?.source) || 0) % KNOT_COUNT,
          target: Math.abs(Number(item?.target) || 0) % KNOT_COUNT,
          delta: clamp(item?.delta, -0.5, 0.5),
          flip: Boolean(item?.flip),
          line: Math.abs(Number(item?.line) || 0) % consequenceLines.length
        }))
      : [];
    const memory = candidate.memory && typeof candidate.memory === 'object'
      ? {
          kind: Math.abs(Number(candidate.memory.kind) || 0) % rememberedWords.length,
          target: Math.abs(Number(candidate.memory.target) || 0) % KNOT_COUNT,
          offset: clamp(candidate.memory.offset, -0.3, 0.3)
        }
      : null;

    return {
      ...base,
      visits: Math.max(0, Math.min(9999, Math.floor(Number(candidate.visits) || 0))),
      actionCount: Math.max(0, Math.min(999999, Math.floor(Number(candidate.actionCount) || 0))),
      rule: Math.abs(Number(candidate.rule) || 0) % 2,
      tensions: Array.from({ length: KNOT_COUNT }, (_, index) => clamp(candidate.tensions?.[index])),
      repeats: Array.from({ length: KNOT_COUNT }, (_, index) => Math.max(0, Math.min(99, Math.floor(Number(candidate.repeats?.[index]) || 0)))),
      mutation: Array.from({ length: KNOT_COUNT }, (_, index) => Math.max(0, Math.min(9, Math.floor(Number(candidate.mutation?.[index]) || 0)))),
      idleCycles: Math.max(0, Math.min(9999, Math.floor(Number(candidate.idleCycles) || 0))),
      pendingReturn: pending,
      memory
    };
  }

  function migrateLegacy(mainValue, tomorrowValue) {
    let legacyPressure = 0;
    let migrated = false;
    try {
      const main = typeof mainValue === 'string' ? JSON.parse(mainValue) : mainValue;
      if (main && typeof main === 'object') {
        const fragmentCount = Array.isArray(main.fragments) ? Math.min(main.fragments.length, 6) : 0;
        const completed = Math.max(0, Math.min(20, Number(main.completedCollections) || 0));
        const roomIndex = Math.max(0, Math.min(100, Number(main.roomIndex) || 0));
        legacyPressure += fragmentCount / 12 + completed / 100 + roomIndex / 500;
        migrated = true;
      }
    } catch {
      migrated = true;
    }
    try {
      const tomorrow = typeof tomorrowValue === 'string' ? JSON.parse(tomorrowValue) : tomorrowValue;
      if (tomorrow && typeof tomorrow === 'object') {
        legacyPressure += 0.08;
        migrated = true;
      }
    } catch {
      migrated = true;
    }
    return { migrated, legacyPressure: clamp(legacyPressure, 0, 1) };
  }

  function ruleText(state) {
    return state.rule === 0
      ? 'Keep every unfinished idea separate.'
      : 'Bind every unfinished idea together.';
  }

  function contradictionLabel(state, phrase) {
    return state.rule === 0
      ? `Contradict by binding ${phrase}`
      : `Contradict by loosening ${phrase}`;
  }

  function predictIndex(state) {
    return hashString(`${EXECUTION_SEED}:${state.installSeed}:${state.actionCount}:${state.idleCycles}:anticipate`) % KNOT_COUNT;
  }

  function accidentalKind() {
    return seededIndex('retained-accident', rememberedWords.length);
  }

  function accidentalTrigger(state) {
    return 3 + (hashString(`${EXECUTION_SEED}:${state.installSeed}:accident-trigger`) % 5);
  }

  function contradict(inputState, rawIndex) {
    const state = sanitizeState(inputState, inputState?.installSeed || 1);
    const index = Math.abs(Number(rawIndex) || 0) % KNOT_COUNT;
    const next = structuredCloneSafe(state);
    const repeat = Math.min(99, next.repeats[index] + 1);
    next.repeats[index] = repeat;
    next.actionCount += 1;

    const predicted = predictIndex(state);
    const requestedDirection = state.rule === 0 ? -1 : 1;
    const repetitionDifference = repeat % 2 === 0 ? -0.58 : 1;
    const predictedResistance = index === predicted ? 0.5 : 1;
    const immediateDelta = requestedDirection * 0.22 * repetitionDifference * predictedResistance;
    next.tensions[index] = clamp(next.tensions[index] + immediateDelta);
    next.tensions[(index + 1) % KNOT_COUNT] = clamp(next.tensions[(index + 1) % KNOT_COUNT] - immediateDelta * 0.24);
    next.mutation[index] = Math.min(9, next.mutation[index] + (repeat % 3 === 0 ? 1 : 0));

    const consequenceSeed = hashString(`${EXECUTION_SEED}:${next.installSeed}:${next.actionCount}:${index}:consequence`);
    const target = (index + 2 + consequenceSeed % 3) % KNOT_COUNT;
    const consequence = {
      id: `${next.actionCount}-${consequenceSeed.toString(16)}`,
      source: index,
      target,
      delta: clamp(-immediateDelta * (index === predicted ? 1.9 : 1.18), -0.48, 0.48),
      flip: next.actionCount % 3 === 0,
      line: consequenceSeed % consequenceLines.length
    };
    next.pendingReturn = [...next.pendingReturn, consequence].slice(-MAX_PENDING);

    let accident = false;
    if (!next.memory && next.actionCount >= accidentalTrigger(next)) {
      next.memory = {
        kind: accidentalKind(),
        target: hashString(`${EXECUTION_SEED}:${next.installSeed}:accident-target`) % KNOT_COUNT,
        offset: ((hashString(`${EXECUTION_SEED}:accident-offset`) % 31) - 15) / 100
      };
      accident = true;
    }

    const repeated = repeat > 1;
    const line = repeated
      ? 'The same contradiction produces a different pressure.'
      : index === predicted
        ? 'The organism expected that knot and resisted politely.'
        : 'The knot moves now. The consequence does not.';

    return { state: next, consequence, line, accident, predicted };
  }

  function applyConsequence(inputState, consequenceInput) {
    const state = sanitizeState(inputState, inputState?.installSeed || 1);
    const consequence = consequenceInput || state.pendingReturn[0];
    if (!consequence) return { state, line: 'No delayed consequence remained.' };
    const next = structuredCloneSafe(state);
    const target = Math.abs(Number(consequence.target) || 0) % KNOT_COUNT;
    const source = Math.abs(Number(consequence.source) || 0) % KNOT_COUNT;
    next.tensions[target] = clamp(next.tensions[target] + clamp(consequence.delta, -0.5, 0.5));
    next.tensions[(target + KNOT_COUNT - 1) % KNOT_COUNT] = clamp(
      next.tensions[(target + KNOT_COUNT - 1) % KNOT_COUNT] - clamp(consequence.delta, -0.5, 0.5) * 0.32
    );
    next.mutation[target] = Math.min(9, next.mutation[target] + 1);
    if (consequence.flip) next.rule = next.rule === 0 ? 1 : 0;
    next.pendingReturn = next.pendingReturn.filter((item) => item.id !== consequence.id);
    if (next.memory && next.memory.target === source) {
      next.tensions[next.memory.target] = clamp(next.tensions[next.memory.target] + next.memory.offset);
    }
    return {
      state: next,
      line: consequenceLines[Math.abs(Number(consequence.line) || 0) % consequenceLines.length]
    };
  }

  function advanceVisit(inputState) {
    let state = sanitizeState(inputState, inputState?.installSeed || 1);
    const count = state.pendingReturn.length;
    const lines = [];
    for (const consequence of [...state.pendingReturn]) {
      const applied = applyConsequence(state, consequence);
      state = applied.state;
      lines.push(applied.line);
    }
    state.visits = Math.min(9999, state.visits + 1);
    if (state.memory) {
      state.tensions[state.memory.target] = clamp(state.tensions[state.memory.target] + state.memory.offset);
    }
    return {
      state,
      returnedConsequences: count,
      line: count > 0 ? lines[lines.length - 1] : 'The organism begins from a remembered imbalance.'
    };
  }

  function idleShift(inputState) {
    const state = sanitizeState(inputState, inputState?.installSeed || 1);
    const next = structuredCloneSafe(state);
    next.idleCycles = Math.min(9999, next.idleCycles + 1);
    const anticipated = predictIndex(next);
    const opposite = (anticipated + 3) % KNOT_COUNT;
    const delta = next.idleCycles % 2 === 0 ? -0.13 : 0.11;
    next.tensions[anticipated] = clamp(next.tensions[anticipated] + delta);
    next.tensions[opposite] = clamp(next.tensions[opposite] - delta * 0.8);
    next.mutation[anticipated] = Math.min(9, next.mutation[anticipated] + (next.idleCycles % 3 === 0 ? 1 : 0));
    if (next.idleCycles % 4 === 0) next.rule = next.rule === 0 ? 1 : 0;
    return {
      state: next,
      anticipated,
      line: next.idleCycles % 2 === 0
        ? 'Inactivity gives the anticipated knot more authority.'
        : 'The weave changes more when left alone.'
    };
  }

  function memoryText(state) {
    if (!state.memory) return 'One fictional accident may remain between visits.';
    return `The organism retains ${rememberedWords[state.memory.kind]}.`;
  }

  function structuredCloneSafe(value) {
    if (typeof structuredClone === 'function') return structuredClone(value);
    return JSON.parse(JSON.stringify(value));
  }

  return Object.freeze({
    EXECUTION_SEED,
    STATE_KEY,
    LEGACY_KEYS,
    KNOT_COUNT,
    MAX_PENDING,
    hashString,
    mulberry32,
    buildKnots,
    createState,
    sanitizeState,
    migrateLegacy,
    ruleText,
    contradictionLabel,
    predictIndex,
    accidentalKind,
    accidentalTrigger,
    contradict,
    applyConsequence,
    advanceVisit,
    idleShift,
    memoryText
  });
});
