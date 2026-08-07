(function attachEntropyCore(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.MuseumEntropyCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function buildEntropyCore() {
  'use strict';

  const EXECUTION_SEED = 'eb11a896ddf843d260cb13fac4261168f632a18964cd96724f9650e4cd4cacf8';
  const STATE_KEY = 'museum-of-almost:entropy:v3';
  const LEGACY_KEYS = [
    'museum-of-almost:entropy:v2',
    'museum-of-almost:entropy:v1',
    'museum-of-almost:v1',
    'museum-of-almost:tomorrow:v1'
  ];
  const SOURCES = ['pressure', 'distance', 'friction', 'silence', 'weight', 'interval'];
  const CONTRADICTIONS = [
    ['held', 'not held'],
    ['near', 'not near'],
    ['smooth', 'not smooth'],
    ['heard', 'not heard'],
    ['carried', 'not carried'],
    ['before', 'not before'],
    ['joined', 'not joined'],
    ['still', 'not still']
  ];
  const ECOSYSTEMS = ['scatter', 'braid', 'drift', 'cluster'];

  function hashString(value) {
    let hash = 2166136261;
    const text = String(value);
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function cleanWord(value, fallback) {
    const text = String(value || '').toLowerCase().replace(/[^a-z -]/g, '').trim();
    return text.slice(0, 24) || fallback;
  }

  function sanitizeContradiction(value) {
    if (!value || typeof value !== 'object') return null;
    return {
      source: cleanWord(value.source, 'pressure'),
      left: cleanWord(value.left, 'held'),
      right: cleanWord(value.right, 'not held')
    };
  }

  function createState(installSeed, contradiction = null) {
    return {
      version: 3,
      installSeed: Number(installSeed) >>> 0 || 1,
      contradiction: sanitizeContradiction(contradiction)
    };
  }

  function sanitizeState(candidate, fallbackSeed = 1) {
    if (!candidate || typeof candidate !== 'object') return createState(fallbackSeed);
    return createState(candidate.installSeed || fallbackSeed, candidate.contradiction);
  }

  function migrateLegacy(...legacyValues) {
    const hadLegacyState = legacyValues.some((value) => typeof value === 'string' && value.length > 0);
    return {
      migrated: hadLegacyState,
      contradiction: hadLegacyState
        ? { source: 'alignment', left: 'settled', right: 'not settled' }
        : null
    };
  }

  function sessionStart(state) {
    const contradiction = sanitizeContradiction(state?.contradiction);
    const memory = contradiction ? `${contradiction.source}:${contradiction.left}:${contradiction.right}` : 'blank';
    return hashString(`${EXECUTION_SEED}:${state.installSeed}:${memory}:start`) % SOURCES.length;
  }

  function ecosystemState(state, cycle) {
    const memory = state.contradiction ? `${state.contradiction.left}:${state.contradiction.right}` : 'none';
    const index = hashString(`${EXECUTION_SEED}:${state.installSeed}:${memory}:${cycle}:micro`) % ECOSYSTEMS.length;
    const pressure = 3 + (hashString(`${EXECUTION_SEED}:${state.installSeed}:${cycle}:pressure`) % 5);
    return { name: ECOSYSTEMS[index], pressure };
  }

  function translationFor(state, cycle, interference = false) {
    const start = sessionStart(state);
    const ecosystem = ecosystemState(state, cycle);
    const sourceIndex = (start + cycle + ecosystem.pressure) % SOURCES.length;
    const pairIndex = hashString(
      `${EXECUTION_SEED}:${state.installSeed}:${cycle}:${ecosystem.name}:${interference ? 'bend' : 'wait'}`
    ) % CONTRADICTIONS.length;
    const pair = CONTRADICTIONS[pairIndex];
    const flip = interference && (hashString(`${EXECUTION_SEED}:${cycle}:flip`) % 2 === 1);
    return {
      source: SOURCES[sourceIndex],
      left: flip ? pair[1] : pair[0],
      right: flip ? pair[0] : pair[1],
      ecosystem: ecosystem.name
    };
  }

  function settle(state, translation) {
    const next = sanitizeState(state, state?.installSeed || 1);
    next.contradiction = sanitizeContradiction(translation);
    return next;
  }

  function waitDuration(state, cycle) {
    return 1050 + (hashString(`${EXECUTION_SEED}:${state.installSeed}:${cycle}:wait`) % 4) * 180;
  }

  function openDuration(state, cycle) {
    return 1150 + (hashString(`${EXECUTION_SEED}:${state.installSeed}:${cycle}:open`) % 3) * 180;
  }

  function memoryText(state) {
    const contradiction = sanitizeContradiction(state?.contradiction);
    if (!contradiction) return 'No contradiction is retained yet.';
    return `One contradiction remains: ${contradiction.left} / ${contradiction.right}.`;
  }

  return Object.freeze({
    EXECUTION_SEED,
    STATE_KEY,
    LEGACY_KEYS,
    SOURCES,
    CONTRADICTIONS,
    ECOSYSTEMS,
    hashString,
    createState,
    sanitizeState,
    sanitizeContradiction,
    migrateLegacy,
    sessionStart,
    ecosystemState,
    translationFor,
    settle,
    waitDuration,
    openDuration,
    memoryText
  });
});
