(function attachEntropyCore(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.MuseumEntropyCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function buildEntropyCore() {
  'use strict';

  const EXECUTION_SEED = '679e472a1e31e8c20074426565d9ed6ccc2f5115266f731bc3acd03470b35c02';
  const STATE_KEY = 'museum-of-almost:entropy:v5';
  const LEGACY_KEYS = [
    'museum-of-almost:entropy:v4',
    'museum-of-almost:entropy:v3',
    'museum-of-almost:entropy:v2',
    'museum-of-almost:entropy:v1',
    'museum-of-almost:v1',
    'museum-of-almost:tomorrow:v1'
  ];
  const MAX_SUSPENSIONS = 6;
  const UNKNOWN_UNITS = ['q?', 'ø?', '∴?', 'u?'];

  function clampInt(value, min, max, fallback = min) {
    const numeric = Math.round(Number(value));
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

  function sanitizeGhost(value) {
    if (!value || typeof value !== 'object') return null;
    return {
      position: clampInt(value.position, 0, 1000, 500),
      weight: clampInt(value.weight, 1, 5, 1)
    };
  }

  function createState(installSeed, ghost = null) {
    return {
      version: 5,
      installSeed: Number(installSeed) >>> 0 || 1,
      ghost: sanitizeGhost(ghost)
    };
  }

  function sanitizeState(candidate, fallbackSeed = 1) {
    if (!candidate || typeof candidate !== 'object') return createState(fallbackSeed);
    return createState(candidate.installSeed || fallbackSeed, candidate.ghost);
  }

  function migrateLegacy(...legacyValues) {
    let migrated = false;
    let installSeed = null;

    for (const value of legacyValues) {
      if (typeof value !== 'string' || value.length === 0) continue;
      migrated = true;
      if (installSeed !== null) continue;
      try {
        const parsed = JSON.parse(value);
        const candidate = Number(parsed?.installSeed) >>> 0;
        if (candidate) installSeed = candidate;
      } catch {
        // Obsolete fictional state is intentionally ignored.
      }
    }

    return { migrated, installSeed };
  }

  function initialCursor(inputState) {
    const state = sanitizeState(inputState, inputState?.installSeed || 1);
    if (state.ghost) return state.ghost.position;
    return 180 + (hashString(`${EXECUTION_SEED}:${state.installSeed}:cursor`) % 641);
  }

  function createSession(inputState) {
    const state = sanitizeState(inputState, inputState?.installSeed || 1);
    return {
      cursor: initialCursor(state),
      suspensions: [],
      inversion: false,
      sequence: 0
    };
  }

  function sanitizeSession(candidate, inputState) {
    const state = sanitizeState(inputState, inputState?.installSeed || 1);
    const input = candidate && typeof candidate === 'object' ? candidate : {};
    const suspensions = Array.isArray(input.suspensions)
      ? input.suspensions.slice(-MAX_SUSPENSIONS).map((mark, index) => ({
        id: clampInt(mark?.id, 1, 9999, index + 1),
        position: clampInt(mark?.position, 0, 1000, initialCursor(state)),
        weight: clampInt(mark?.weight, 1, 5, 1)
      }))
      : [];
    return {
      cursor: clampInt(input.cursor, 0, 1000, initialCursor(state)),
      suspensions,
      inversion: Boolean(input.inversion),
      sequence: clampInt(input.sequence, 0, 9999, suspensions.length)
    };
  }

  function moveCursor(inputState, inputSession, delta) {
    const state = sanitizeState(inputState, inputState?.installSeed || 1);
    const session = sanitizeSession(inputSession, state);
    return {
      ...session,
      cursor: clampInt(session.cursor + Number(delta || 0), 0, 1000, session.cursor)
    };
  }

  function weightForDuration(durationMs) {
    const duration = Math.max(0, Math.min(3000, Number(durationMs) || 0));
    return Math.max(1, Math.min(5, 1 + Math.floor(duration / 600)));
  }

  function suspend(inputState, inputSession, rawPosition, durationMs = 600) {
    const state = sanitizeState(inputState, inputState?.installSeed || 1);
    const session = sanitizeSession(inputSession, state);
    const position = clampInt(rawPosition, 0, 1000, session.cursor);
    const sequence = Math.min(9999, session.sequence + 1);
    const mark = {
      id: sequence,
      position,
      weight: weightForDuration(durationMs)
    };
    return {
      ...session,
      cursor: position,
      sequence,
      suspensions: [...session.suspensions, mark].slice(-MAX_SUSPENSIONS)
    };
  }

  function attemptErase(inputState, inputSession) {
    const state = sanitizeState(inputState, inputState?.installSeed || 1);
    const session = sanitizeSession(inputSession, state);
    if (session.suspensions.length === 0) {
      return { state, session, erased: null, firstEvent: false };
    }

    const erased = session.suspensions[session.suspensions.length - 1];
    const firstEvent = state.ghost === null;
    const nextState = createState(state.installSeed, {
      position: erased.position,
      weight: erased.weight
    });
    const nextSession = {
      ...session,
      suspensions: session.suspensions.slice(0, -1),
      inversion: firstEvent ? !session.inversion : session.inversion
    };

    return { state: nextState, session: nextSession, erased, firstEvent };
  }

  function treatyState(inputState, inputSession) {
    const state = sanitizeState(inputState, inputState?.installSeed || 1);
    const session = sanitizeSession(inputSession, state);
    const count = session.suspensions.length;
    if (count === 0) return 'too-exact';
    if (count === 1) return 'holding';
    return 'overwritten';
  }

  function forceState(inputState, inputSession) {
    const state = sanitizeState(inputState, inputState?.installSeed || 1);
    const session = sanitizeSession(inputSession, state);
    const latest = session.suspensions[session.suspensions.length - 1] || state.ghost;
    const positionBias = latest ? (latest.position - 500) / 500 : 0;
    const weightBias = latest ? latest.weight / 5 : 0;
    const crowding = Math.min(1, session.suspensions.length / MAX_SUSPENSIONS);
    const counterweight = Math.max(-0.24, Math.min(0.24, positionBias * 0.15 + weightBias * 0.09));
    const order = treatyState(state, session);
    const orderFactor = order === 'holding' ? 0.05 : order === 'overwritten' ? -0.05 : 0;

    return {
      scaleA: Number((1 + counterweight + orderFactor).toFixed(3)),
      scaleB: Number((1 - counterweight - orderFactor).toFixed(3)),
      fieldScale: Number((1 + crowding * 0.24 + (state.ghost ? 0.04 : 0)).toFixed(3)),
      direction: session.inversion ? -1 : 1
    };
  }

  function measurementFor(inputState, inputSession) {
    const state = sanitizeState(inputState, inputState?.installSeed || 1);
    const session = sanitizeSession(inputSession, state);
    const signature = session.suspensions
      .map((mark) => `${mark.position}:${mark.weight}`)
      .join('|');
    const ghost = state.ghost ? `${state.ghost.position}:${state.ghost.weight}` : 'none';
    const hash = hashString(`${EXECUTION_SEED}:${state.installSeed}:${signature}:${ghost}:${session.inversion}`);
    return {
      value: 11 + (hash % 87),
      unit: UNKNOWN_UNITS[(hash >>> 5) % UNKNOWN_UNITS.length]
    };
  }

  function statusText(inputState, inputSession) {
    const state = sanitizeState(inputState, inputState?.installSeed || 1);
    const session = sanitizeSession(inputSession, state);
    const order = treatyState(state, session);
    if (order === 'holding') return 'One deliberate error is holding the agreement.';
    if (order === 'overwritten') return 'Too many errors are arguing with each other.';
    return state.ghost
      ? 'The active field is exact. An erased error remains underneath.'
      : 'The forces match too perfectly to agree.';
  }

  function memoryText(inputState) {
    const state = sanitizeState(inputState, inputState?.installSeed || 1);
    if (!state.ghost) return 'Nothing attempted to erase has been preserved yet.';
    return 'Only the last attempted erasure survives a return visit.';
  }

  function timelinePositions(inputState, inputSession, phase) {
    const state = sanitizeState(inputState, inputState?.installSeed || 1);
    const session = sanitizeSession(inputSession, state);
    const force = forceState(state, session);
    const normalized = ((Number(phase) || 0) % 1 + 1) % 1;
    const a = force.direction > 0 ? normalized : 1 - normalized;
    const b = force.direction > 0 ? 1 - normalized : normalized;
    return {
      a: Math.round(a * 1000),
      b: Math.round(b * 1000)
    };
  }

  return Object.freeze({
    EXECUTION_SEED,
    STATE_KEY,
    LEGACY_KEYS,
    MAX_SUSPENSIONS,
    UNKNOWN_UNITS,
    hashString,
    sanitizeGhost,
    createState,
    sanitizeState,
    migrateLegacy,
    initialCursor,
    createSession,
    sanitizeSession,
    moveCursor,
    weightForDuration,
    suspend,
    attemptErase,
    treatyState,
    forceState,
    measurementFor,
    statusText,
    memoryText,
    timelinePositions
  });
});
