(() => {
  'use strict';

  const core = globalThis.MuseumEntropyCore;
  if (!core) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const main = document.querySelector('#translator');
  const surface = document.querySelector('#weave-surface');
  const weave = document.querySelector('#weave');
  const ecosystem = document.querySelector('#micro-ecosystem');
  const sourceLabel = document.querySelector('#source-label');
  const left = document.querySelector('#translation-left');
  const right = document.querySelector('#translation-right');
  const actionWindow = document.querySelector('#action-window');
  const instruction = document.querySelector('#instruction');
  const condition = document.querySelector('#condition');
  const status = document.querySelector('#status');
  const memoryNote = document.querySelector('#memory-note');
  const soundButton = document.querySelector('#sound-button');
  const resetButton = document.querySelector('#reset-button');

  let state;
  let storageEnabled = true;
  let phase = 'ready';
  let cycle = 0;
  let candidate = null;
  let revealTimer = 0;
  let settleTimer = 0;
  let beatTimer = 0;
  let soundEnabled = false;
  let audioContext = null;

  initialise();

  function initialise() {
    state = loadState();
    buildWeave();
    bindEvents();
    renderMemory();
    renderReady('The translator is waiting for a first measure.');
    registerServiceWorker();
  }

  function generateInstallSeed() {
    if (globalThis.crypto?.getRandomValues) {
      return globalThis.crypto.getRandomValues(new Uint32Array(1))[0] || 1;
    }
    return Math.floor(Math.random() * 0xFFFFFFFF) >>> 0 || 1;
  }

  function loadState() {
    let stored = null;
    let legacyValues = [];
    try {
      stored = localStorage.getItem(core.STATE_KEY);
      legacyValues = core.LEGACY_KEYS.map((key) => localStorage.getItem(key));
    } catch {
      storageEnabled = false;
    }

    if (stored) {
      try {
        return core.sanitizeState(JSON.parse(stored), generateInstallSeed());
      } catch {
        // Damaged fictional state is replaced below.
      }
    }

    const migration = core.migrateLegacy(...legacyValues);
    const fresh = core.createState(generateInstallSeed(), migration.contradiction);
    persist(fresh);
    removeLegacy();
    return fresh;
  }

  function persist(nextState = state) {
    if (!storageEnabled) return;
    try {
      localStorage.setItem(core.STATE_KEY, JSON.stringify(nextState));
    } catch {
      storageEnabled = false;
    }
  }

  function removeLegacy() {
    if (!storageEnabled) return;
    try {
      core.LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
    } catch {
      storageEnabled = false;
    }
  }

  function buildWeave() {
    weave.replaceChildren();
    ecosystem.replaceChildren();
    for (let index = 0; index < 12; index += 1) {
      const strand = document.createElement('i');
      strand.style.setProperty('--strand', String(index));
      weave.append(strand);
    }
    for (let index = 0; index < 7; index += 1) {
      const mote = document.createElement('i');
      mote.style.setProperty('--mote', String(index));
      ecosystem.append(mote);
    }
  }

  function bindEvents() {
    surface.addEventListener('click', handleSurface);
    soundButton.addEventListener('click', toggleSound);
    resetButton.addEventListener('click', resetLocalState);
    document.addEventListener('visibilitychange', handleVisibility);
  }

  function handleSurface(event) {
    event.preventDefault();
    if (phase === 'ready') {
      startMeasure();
      return;
    }
    if (phase === 'open') interfere();
  }

  function startMeasure() {
    clearTimers();
    phase = 'gather';
    candidate = core.translationFor(state, cycle, false);
    const micro = core.ecosystemState(state, cycle);
    main.dataset.phase = 'gather';
    main.dataset.meaning = candidate.source;
    main.dataset.ecosystem = micro.name;
    main.dataset.beat = '1';
    surface.setAttribute('aria-disabled', 'true');
    sourceLabel.textContent = candidate.source;
    left.textContent = '…';
    right.textContent = '…';
    instruction.textContent = 'Wait. The effect must appear before action is possible.';
    actionWindow.textContent = 'No action is available yet.';
    condition.textContent = 'The weave is translating without asking where you touched.';
    announce(`Translating ${candidate.source}. Wait for the effect.`);
    playBeat(0);
    scheduleBeats();
    revealTimer = window.setTimeout(revealEffect, reducedMotion ? 620 : core.waitDuration(state, cycle));
  }

  function scheduleBeats() {
    window.clearInterval(beatTimer);
    let beat = 1;
    beatTimer = window.setInterval(() => {
      beat = beat % 3 + 1;
      main.dataset.beat = String(beat);
      playBeat(beat);
    }, reducedMotion ? 420 : 520);
  }

  function revealEffect() {
    window.clearInterval(beatTimer);
    beatTimer = 0;
    phase = 'open';
    main.dataset.phase = 'open';
    main.dataset.beat = '3';
    surface.setAttribute('aria-disabled', 'false');
    left.textContent = candidate.left;
    right.textContent = candidate.right;
    instruction.textContent = 'The effect is visible. Interfere anywhere, or keep waiting.';
    actionWindow.textContent = 'Action is available now. Waiting also counts.';
    condition.textContent = 'A successful translation has produced a contradiction.';
    announce(`${candidate.left}, and ${candidate.right}. Action is now available.`);
    playReveal();
    settleTimer = window.setTimeout(() => settleCandidate(false), reducedMotion ? 900 : core.openDuration(state, cycle));
  }

  function interfere() {
    if (phase !== 'open') return;
    window.clearTimeout(settleTimer);
    candidate = core.translationFor(state, cycle, true);
    left.textContent = candidate.left;
    right.textContent = candidate.right;
    main.dataset.meaning = candidate.source;
    main.dataset.ecosystem = candidate.ecosystem;
    condition.textContent = 'Interference changed the wording, not the uncertainty.';
    settleCandidate(true);
  }

  function settleCandidate(interfered) {
    if (phase !== 'open') return;
    phase = 'settled';
    state = core.settle(state, candidate);
    persist();
    renderMemory();
    main.dataset.phase = 'settled';
    surface.setAttribute('aria-disabled', 'true');
    instruction.textContent = 'Another meaning will use the same weave.';
    actionWindow.textContent = interfered
      ? 'Your interference became part of the contradiction.'
      : 'Waiting became part of the contradiction.';
    condition.textContent = 'Success created uncertainty, so the translator continues.';
    announce(interfered
      ? 'Interference accepted. A new uncertainty remains.'
      : 'Waiting accepted. A new uncertainty remains.');
    playSettle();
    cycle += 1;
    phase = 'ready';
    surface.setAttribute('aria-disabled', 'false');
    instruction.textContent = 'The contradiction remains. Start another measure when you choose.';
    actionWindow.textContent = 'Touch anywhere to begin another measure.';
  }

  function renderMemory() {
    memoryNote.textContent = storageEnabled
      ? core.memoryText(state)
      : 'Local storage is unavailable. This session keeps no durable contradiction.';
  }

  function renderReady(message) {
    phase = 'ready';
    main.dataset.phase = 'ready';
    main.dataset.beat = '0';
    main.dataset.meaning = core.SOURCES[core.sessionStart(state)];
    main.dataset.ecosystem = core.ecosystemState(state, cycle).name;
    surface.setAttribute('aria-disabled', 'false');
    sourceLabel.textContent = main.dataset.meaning;
    left.textContent = state.contradiction?.left || 'untranslated';
    right.textContent = state.contradiction?.right || 'still untranslated';
    instruction.textContent = 'Start one measure. Then do nothing.';
    actionWindow.textContent = 'Touch anywhere once to begin.';
    condition.textContent = state.contradiction
      ? 'The previous contradiction is the only durable memory.'
      : 'Nothing has agreed to be equivalent yet.';
    announce(message);
  }

  function handleVisibility() {
    if (document.hidden) {
      clearTimers();
      return;
    }
    renderReady('The translator resumes only when you are present.');
  }

  function clearTimers() {
    window.clearTimeout(revealTimer);
    window.clearTimeout(settleTimer);
    window.clearInterval(beatTimer);
    revealTimer = 0;
    settleTimer = 0;
    beatTimer = 0;
  }

  function announce(message) {
    status.textContent = '';
    window.setTimeout(() => {
      status.textContent = message;
    }, 20);
  }

  function toggleSound() {
    soundEnabled = !soundEnabled;
    soundButton.setAttribute('aria-pressed', String(soundEnabled));
    soundButton.textContent = soundEnabled ? 'Sound on' : 'Sound off';
    if (soundEnabled) {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      audioContext.resume().catch(() => {});
      playTone(132, 0.03, 0.12);
    }
  }

  function playBeat(beat) {
    if (!soundEnabled) return;
    playTone(108 + beat * 14, 0.022, 0.08);
  }

  function playReveal() {
    if (!soundEnabled) return;
    playTone(176, 0.035, 0.18);
    window.setTimeout(() => playTone(181, 0.024, 0.14), 100);
  }

  function playSettle() {
    if (!soundEnabled) return;
    playTone(122, 0.028, 0.15);
  }

  function playTone(frequency, volume, duration) {
    if (!audioContext || !soundEnabled) return;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(volume, audioContext.currentTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration + 0.03);
  }

  function resetLocalState() {
    clearTimers();
    try {
      localStorage.removeItem(core.STATE_KEY);
      core.LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
      storageEnabled = true;
    } catch {
      storageEnabled = false;
    }
    state = core.createState(generateInstallSeed());
    persist();
    cycle = 0;
    candidate = null;
    renderMemory();
    renderReady('Local memory cleared. No contradiction remains.');
    resetButton.blur();
  }

  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js').catch(() => {
        // The translator remains usable when service workers are unavailable.
      });
    }, { once: true });
  }
})();
