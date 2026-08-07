(() => {
  'use strict';

  const core = globalThis.MuseumEntropyCore;
  if (!core) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const main = document.querySelector('#organism');
  const surface = document.querySelector('#organism-surface');
  const layers = [...document.querySelectorAll('.membrane')];
  const instruction = document.querySelector('#instruction');
  const realitySummary = document.querySelector('#reality-summary');
  const status = document.querySelector('#status');
  const memoryNote = document.querySelector('#memory-note');
  const soundButton = document.querySelector('#sound-button');
  const resetButton = document.querySelector('#reset-button');

  let state;
  let storageEnabled = true;
  let idleTimer = 0;
  let pointerStart = null;
  let soundEnabled = false;
  let audioContext = null;

  initialise();

  function initialise() {
    state = loadState();
    buildContours();
    bindEvents();
    render('The organism has mistaken you for one of its boundaries.');
    scheduleIdle();
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

    let next = null;
    if (stored) {
      try {
        next = core.sanitizeState(JSON.parse(stored), generateInstallSeed());
      } catch {
        next = null;
      }
    }

    if (!next) {
      const migration = core.migrateLegacy(...legacyValues);
      next = core.createState(generateInstallSeed(), migration.geometry);
    }

    next = core.advanceVisit(next);
    persist(next);
    removeLegacy();
    return next;
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

  function buildContours() {
    layers.forEach((layer, layerIndex) => {
      const holder = layer.querySelector('.contours');
      holder.replaceChildren();
      for (let index = 0; index < 8; index += 1) {
        const line = document.createElement('i');
        const top = 12 + index * 10;
        const inset = 5 + ((index + layerIndex * 2) % 4) * 4;
        line.style.top = `${top}%`;
        line.style.left = `${inset}%`;
        line.style.right = `${Math.max(4, 18 - inset)}%`;
        holder.append(line);
      }
    });
  }

  function bindEvents() {
    surface.addEventListener('pointerdown', handlePointerDown);
    surface.addEventListener('pointerup', handlePointerUp);
    surface.addEventListener('pointercancel', handlePointerCancel);
    surface.addEventListener('keydown', handleKeydown);
    soundButton.addEventListener('click', toggleSound);
    resetButton.addEventListener('click', resetLocalState);
    window.addEventListener('storage', handleStorage);
    document.addEventListener('visibilitychange', handleVisibility);
  }

  function handlePointerDown(event) {
    if (event.button !== 0 && event.pointerType !== 'touch') return;
    cancelIdle();
    pointerStart = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY
    };
    surface.setPointerCapture?.(event.pointerId);
    main.dataset.active = 'true';
  }

  function handlePointerUp(event) {
    if (!pointerStart || event.pointerId !== pointerStart.id) return;
    const dx = event.clientX - pointerStart.x;
    const dy = event.clientY - pointerStart.y;
    const direction = Math.max(Math.abs(dx), Math.abs(dy)) < 14
      ? core.nextDirection(state)
      : directionFrom(dx, dy);
    pointerStart = null;
    main.dataset.active = 'false';
    performSeparation(direction);
    surface.focus({ preventScroll: true });
  }

  function handlePointerCancel() {
    pointerStart = null;
    main.dataset.active = 'false';
    scheduleIdle();
  }

  function directionFrom(dx, dy) {
    if (Math.abs(dx) >= Math.abs(dy)) return dx >= 0 ? 'east' : 'west';
    return dy >= 0 ? 'south' : 'north';
  }

  function handleKeydown(event) {
    const keyDirections = {
      ArrowUp: 'north',
      ArrowRight: 'east',
      ArrowDown: 'south',
      ArrowLeft: 'west'
    };

    if (keyDirections[event.key]) {
      event.preventDefault();
      cancelIdle();
      performSeparation(keyDirections[event.key]);
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      cancelIdle();
      performSeparation(core.nextDirection(state));
    }
  }

  function performSeparation(direction) {
    state = core.separate(state, direction);
    persist();
    render(`The ${direction} edge separated. Time did not advance.`);
    playSeparation(direction);
    scheduleIdle();
  }

  function scheduleIdle() {
    cancelIdle();
    idleTimer = window.setTimeout(advanceSilence, reducedMotion ? 2600 : 3200);
  }

  function cancelIdle() {
    window.clearTimeout(idleTimer);
    idleTimer = 0;
  }

  function advanceSilence() {
    idleTimer = 0;
    const result = core.advanceSilence(state);
    state = result.state;
    persist();
    render(result.warning, true);
  }

  function render(message, late = false) {
    const meanings = core.meaningsFor(state);
    const notes = core.notesFor(state);
    const geometry = core.geometryFor(state);

    main.dataset.late = String(late);
    main.dataset.generation = String(Math.min(9, state.geometry.generation));
    main.dataset.fold = String(state.geometry.fold);

    layers.forEach((layer, index) => {
      const form = geometry[index];
      layer.style.setProperty('--tx', `${form.x}px`);
      layer.style.setProperty('--ty', `${form.y}px`);
      layer.style.setProperty('--rotation', `${form.rotation}deg`);
      layer.style.setProperty('--scale', String(form.scale));
      layer.style.zIndex = String(form.z);
      layer.querySelector('.membrane-label').textContent = meanings[index];
      const note = layer.querySelector('.membrane-note');
      note.textContent = notes[index].text;
      note.hidden = !notes[index].visible;
    });

    realitySummary.textContent = core.summaryText(state);
    memoryNote.textContent = storageEnabled
      ? core.memoryText(state)
      : 'Local storage is unavailable. Geometry will not survive this session.';
    instruction.textContent = 'Separate in any direction. Then stop touching it so time can move.';
    announce(message);
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
      render('Another local copy changed the preserved geometry.');
      scheduleIdle();
    } catch {
      // Ignore malformed local state.
    }
  }

  function handleVisibility() {
    if (document.hidden) {
      cancelIdle();
      pointerStart = null;
      main.dataset.active = 'false';
      return;
    }
    render('Hidden time was ignored. The organism resumes from the same geometry.');
    scheduleIdle();
  }

  function toggleSound() {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) {
      soundButton.textContent = 'Sound unavailable';
      soundButton.disabled = true;
      return;
    }

    soundEnabled = !soundEnabled;
    soundButton.setAttribute('aria-pressed', String(soundEnabled));
    soundButton.textContent = soundEnabled ? 'Sound on' : 'Sound off';

    if (soundEnabled) {
      audioContext ||= new AudioCtor();
      audioContext.resume().catch(() => {});
      playTone(118, 0.024, 0.12);
    }
  }

  function playSeparation(direction) {
    if (!soundEnabled) return;
    const index = core.DIRECTIONS.indexOf(direction);
    const base = 92 + index * 18;
    playTone(base, 0.024, 0.11);
    window.setTimeout(() => playTone(base * 1.5, 0.018, 0.09), 65);
  }

  function playTone(frequency, volume, duration) {
    if (!audioContext || !soundEnabled) return;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(volume, audioContext.currentTime + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration + 0.03);
  }

  function resetLocalState() {
    cancelIdle();
    try {
      localStorage.removeItem(core.STATE_KEY);
      core.LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
      storageEnabled = true;
    } catch {
      storageEnabled = false;
    }

    state = core.advanceVisit(core.createState(generateInstallSeed()));
    pointerStart = null;
    persist();
    render('Local geometry cleared. The meanings begin without inheritance.');
    scheduleIdle();
    resetButton.blur();
  }

  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js').catch(() => {
        // The organism remains usable without service-worker support.
      });
    }, { once: true });
  }
})();
