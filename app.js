(() => {
  'use strict';

  const core = globalThis.MuseumEntropyCore;
  if (!core) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const narrowLayout = window.matchMedia('(max-width: 600px)');
  const root = document.documentElement;
  const main = document.querySelector('#law');
  const surface = document.querySelector('#timeline-surface');
  const primaryTrack = document.querySelector('#primary-track');
  const duplicateTrack = document.querySelector('#duplicate-track');
  const seasonText = document.querySelector('#season-text');
  const lawText = document.querySelector('#law-text');
  const instruction = document.querySelector('#instruction');
  const condition = document.querySelector('#condition');
  const memoryNote = document.querySelector('#memory-note');
  const status = document.querySelector('#status');
  const soundButton = document.querySelector('#sound-button');
  const resetButton = document.querySelector('#reset-button');

  let state;
  let storageEnabled = true;
  let cursor = 0;
  let idleTimer = 0;
  let withheldTimer = 0;
  let soundEnabled = false;
  let audioContext = null;
  const consequenceTimers = new Map();

  initialise();

  function initialise() {
    state = loadState();
    const visit = core.advanceVisit(state);
    state = visit.state;
    cursor = state.rememberedAction?.slot ?? 0;
    persistState();
    buildTracks();
    render(visit.line);
    schedulePending();
    bindEvents();
    resetIdleTimer();
    registerServiceWorker();
  }

  function bindEvents() {
    surface.addEventListener('pointerdown', handlePointer);
    surface.addEventListener('keydown', handleKeydown);
    soundButton.addEventListener('click', toggleSound);
    resetButton.addEventListener('click', resetLocalState);
    narrowLayout.addEventListener?.('change', () => render('The timeline changes orientation, not order.'));
    window.addEventListener('storage', handleStorage);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        resetIdleTimer();
        render('The browser returns to the same law.');
      }
    });
  }

  function generateInstallSeed() {
    if (globalThis.crypto?.getRandomValues) {
      return globalThis.crypto.getRandomValues(new Uint32Array(1))[0] || 1;
    }
    return Math.floor(Math.random() * 0xFFFFFFFF) >>> 0 || 1;
  }

  function loadState() {
    let stored = null;
    let legacy = [];
    try {
      stored = localStorage.getItem(core.STATE_KEY);
      legacy = core.LEGACY_KEYS.map((key) => localStorage.getItem(key));
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

    const migration = core.migrateLegacy(legacy[0], legacy[1], legacy[2]);
    const fresh = core.createState(generateInstallSeed(), migration.legacyBias);

    if (storageEnabled) {
      try {
        localStorage.setItem(core.STATE_KEY, JSON.stringify(fresh));
        core.LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
      } catch {
        storageEnabled = false;
      }
    }
    return fresh;
  }

  function persistState() {
    if (!storageEnabled) return;
    try {
      localStorage.setItem(core.STATE_KEY, JSON.stringify(state));
    } catch {
      storageEnabled = false;
    }
  }

  function buildTracks() {
    primaryTrack.replaceChildren();
    duplicateTrack.replaceChildren();

    for (let index = 0; index < core.TERM_COUNT; index += 1) {
      const term = document.createElement('span');
      term.className = 'term';
      term.id = `term-${index + 1}`;
      term.dataset.index = String(index);
      term.innerHTML = '<strong></strong><small></small>';
      primaryTrack.append(term);

      const echo = document.createElement('span');
      echo.className = 'term duplicate-term';
      echo.setAttribute('aria-hidden', 'true');
      echo.innerHTML = '<strong></strong><small></small>';
      duplicateTrack.append(echo);
    }
  }

  function handlePointer(event) {
    if (event.button !== 0 && event.pointerType !== 'touch') return;
    event.preventDefault();
    const rect = surface.getBoundingClientRect();
    const ratio = narrowLayout.matches
      ? (event.clientY - rect.top) / Math.max(1, rect.height)
      : (event.clientX - rect.left) / Math.max(1, rect.width);
    cursor = Math.max(0, Math.min(core.TERM_COUNT - 1, Math.floor(ratio * core.TERM_COUNT)));
    repair(cursor);
    surface.focus({ preventScroll: true });
  }

  function handleKeydown(event) {
    const horizontal = !narrowLayout.matches;
    const previous = horizontal ? 'ArrowLeft' : 'ArrowUp';
    const next = horizontal ? 'ArrowRight' : 'ArrowDown';

    if (event.key === previous || event.key === next || event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      if (event.key === previous) cursor = (cursor + core.TERM_COUNT - 1) % core.TERM_COUNT;
      if (event.key === next) cursor = (cursor + 1) % core.TERM_COUNT;
      if (event.key === 'Home') cursor = 0;
      if (event.key === 'End') cursor = core.TERM_COUNT - 1;
      updateCursor();
      announce(`Repair position ${core.TERMS[cursor]}.`);
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      repair(cursor);
    }
  }

  function repair(slot) {
    resetIdleTimer();
    const result = core.repairIncorrectly(state, slot);
    state = result.state;
    persistState();
    scheduleConsequence(result.consequence);
    playRepair(slot);

    if (result.refuseImmediate) {
      window.clearTimeout(withheldTimer);
      main.dataset.withheld = 'true';
      announce('The law is checking the wrong repair. Visual feedback will return shortly.');
      withheldTimer = window.setTimeout(() => {
        main.dataset.withheld = 'false';
        render('The withheld repair reappears slightly displaced.');
      }, reducedMotion ? 900 : 1800);
      return;
    }

    render(result.line);
  }

  function schedulePending() {
    state.pending.forEach(scheduleConsequence);
  }

  function scheduleConsequence(consequence) {
    if (!consequence || consequenceTimers.has(consequence.id)) return;
    const ordinary = 3600 + (core.hashString(`${core.EXECUTION_SEED}:${consequence.id}:delay`) % 3400);
    const delay = consequence.longDelay ? 14000 : ordinary;
    const timer = window.setTimeout(() => {
      consequenceTimers.delete(consequence.id);
      const current = state.pending.find((item) => item.id === consequence.id);
      if (!current) return;
      const applied = core.applyConsequence(state, current);
      state = applied.state;
      persistState();
      render(applied.line);
      playConsequence(current.target);
    }, reducedMotion ? Math.min(delay, 5200) : delay);
    consequenceTimers.set(consequence.id, timer);
  }

  function applyIdleShift() {
    const result = core.idleShift(state);
    state = result.state;
    persistState();
    render(result.line);
    idleTimer = window.setTimeout(applyIdleShift, 11000);
  }

  function resetIdleTimer() {
    window.clearTimeout(idleTimer);
    idleTimer = window.setTimeout(applyIdleShift, 8000);
  }

  function render(message) {
    const terms = core.termData(state);
    const density = core.density(state);
    const duplicateIndex = core.duplicateIndex(state);
    const duplicateActive = core.duplicateActive(state);

    root.style.setProperty('--density', density.toFixed(3));
    main.dataset.season = String(state.season);
    main.dataset.duplicate = duplicateActive ? 'active' : 'quiet';
    main.dataset.mobileSlip = narrowLayout.matches && state.actionCount >= 3 ? 'active' : 'quiet';

    seasonText.textContent = core.seasonName(state);
    lawText.textContent = core.lawText(state);
    instruction.textContent = core.instructionText(state);
    condition.textContent = core.conditionText(state);
    memoryNote.textContent = storageEnabled
      ? core.memoryText(state)
      : 'Local storage is unavailable. This visit remains in memory only.';

    [...primaryTrack.children].forEach((node, index) => {
      const term = terms[index];
      const offset = term.offset;
      node.querySelector('strong').textContent = term.label;
      node.querySelector('small').textContent = offset >= 0 ? 'late' : 'early';
      node.style.setProperty('--misregister', `${(offset * 28).toFixed(2)}px`);
      node.style.setProperty('--weight', `${Math.min(1, Math.abs(offset) / 0.72).toFixed(3)}`);
      node.dataset.cursor = index === cursor ? 'true' : 'false';
      node.dataset.difference = term.duplicateDifference ? 'true' : 'false';
    });

    [...duplicateTrack.children].forEach((node, index) => {
      const term = terms[index];
      const label = index === duplicateIndex && duplicateActive
        ? `${term.label.slice(0, -1)}${term.label.endsWith('m') ? 'rn' : term.label.slice(-1)}`
        : term.label;
      node.querySelector('strong').textContent = label;
      node.querySelector('small').textContent = index === duplicateIndex ? 'other copy' : '';
      node.style.setProperty('--misregister', `${(-term.offset * 20 + 4).toFixed(2)}px`);
      node.dataset.difference = index === duplicateIndex ? 'true' : 'false';
    });

    duplicateTrack.hidden = !duplicateActive;
    updateCursor();
    status.textContent = message;
  }

  function updateCursor() {
    surface.setAttribute('aria-activedescendant', `term-${cursor + 1}`);
    [...primaryTrack.children].forEach((node, index) => {
      node.dataset.cursor = index === cursor ? 'true' : 'false';
    });
  }

  function announce(message) {
    status.textContent = '';
    window.setTimeout(() => {
      status.textContent = message;
    }, 20);
  }

  function handleStorage(event) {
    if (event.key !== core.STATE_KEY || !event.newValue) return;
    try {
      state = core.sanitizeState(JSON.parse(event.newValue), state.installSeed);
      cursor = state.rememberedAction?.slot ?? cursor;
      render('Another local copy changed the law.');
    } catch {
      // Ignore malformed local state.
    }
  }

  function toggleSound() {
    soundEnabled = !soundEnabled;
    soundButton.setAttribute('aria-pressed', String(soundEnabled));
    soundButton.textContent = soundEnabled ? 'Sound on' : 'Sound off';
    if (soundEnabled) {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      audioContext.resume().catch(() => {});
      playTone(174 + state.season * 28, 0.045, 0.18);
    }
  }

  function playRepair(slot) {
    if (!soundEnabled) return;
    const base = 140 + state.season * 31 + slot * 9;
    playTone(base, 0.045, 0.16);
    window.setTimeout(() => playTone(base * 1.012, 0.028, 0.13), 80);
  }

  function playConsequence(slot) {
    if (!soundEnabled) return;
    playTone(96 + slot * 17 + state.season * 13, 0.032, 0.24);
  }

  function playTone(frequency, volume, duration) {
    if (!audioContext || !soundEnabled) return;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.value = Math.max(60, frequency);
    gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(volume, audioContext.currentTime + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration + 0.03);
  }

  function resetLocalState() {
    consequenceTimers.forEach((timer) => window.clearTimeout(timer));
    consequenceTimers.clear();
    window.clearTimeout(withheldTimer);

    try {
      localStorage.removeItem(core.STATE_KEY);
      core.LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
      storageEnabled = true;
    } catch {
      storageEnabled = false;
    }

    state = core.createState(generateInstallSeed(), 0);
    state = core.advanceVisit(state).state;
    cursor = 0;
    persistState();
    main.dataset.withheld = 'false';
    render('Local memory cleared. The law starts with fresh errors.');
    resetIdleTimer();
    resetButton.blur();
  }

  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js').catch(() => {
        // The site remains usable when service workers are unavailable.
      });
    }, { once: true });
  }
})();
