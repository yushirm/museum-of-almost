(() => {
  'use strict';

  const core = globalThis.MuseumEntropyCore;
  if (!core) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const main = document.querySelector('#treaty');
  const surface = document.querySelector('#treaty-surface');
  const constructionMarks = document.querySelector('#construction-marks');
  const fieldLines = document.querySelector('#field-lines');
  const forceA = document.querySelector('#force-a');
  const forceB = document.querySelector('#force-b');
  const suspensions = document.querySelector('#suspensions');
  const ghostMark = document.querySelector('#ghost-mark');
  const counterweight = document.querySelector('#counterweight');
  const onceEvent = document.querySelector('#once-event');
  const instruction = document.querySelector('#instruction');
  const treatyState = document.querySelector('#treaty-state');
  const measurement = document.querySelector('#measurement');
  const memoryNote = document.querySelector('#memory-note');
  const status = document.querySelector('#status');
  const eraseButton = document.querySelector('#erase-button');
  const soundButton = document.querySelector('#sound-button');
  const resetButton = document.querySelector('#reset-button');

  let state;
  let session;
  let storageEnabled = true;
  let pointerHold = null;
  let keyboardHoldStarted = 0;
  let soundEnabled = false;
  let audioContext = null;
  let animationFrame = 0;
  let animationOrigin = performance.now();
  let frozenPhase = null;
  let eventTimer = 0;

  initialise();

  function initialise() {
    state = loadState();
    session = core.createSession(state);
    buildConstructionMarks();
    buildFieldLines();
    bindEvents();
    render('The treaty has assigned you the role of counterweight.');
    startMotion();
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
        const next = core.sanitizeState(JSON.parse(stored), generateInstallSeed());
        removeLegacy();
        return next;
      } catch {
        // Damaged fictional state is replaced below.
      }
    }

    const migration = core.migrateLegacy(...legacyValues);
    const fresh = core.createState(migration.installSeed || generateInstallSeed());
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

  function buildConstructionMarks() {
    constructionMarks.replaceChildren();
    for (let index = 1; index <= 9; index += 1) {
      const mark = document.createElement('i');
      mark.style.left = `${index * 10}%`;
      mark.dataset.mark = `M${String(index).padStart(2, '0')}`;
      constructionMarks.append(mark);
    }
  }

  function buildFieldLines() {
    fieldLines.replaceChildren();
    for (let index = 0; index < 6; index += 1) {
      const line = document.createElement('i');
      line.style.setProperty('--field-index', String(index));
      fieldLines.append(line);
    }
  }

  function bindEvents() {
    surface.addEventListener('pointerdown', handlePointerDown);
    surface.addEventListener('pointermove', handlePointerMove);
    surface.addEventListener('pointerup', handlePointerUp);
    surface.addEventListener('pointercancel', cancelPointerHold);
    surface.addEventListener('keydown', handleKeydown);
    surface.addEventListener('keyup', handleKeyup);
    eraseButton.addEventListener('click', attemptErase);
    soundButton.addEventListener('click', toggleSound);
    resetButton.addEventListener('click', resetLocalState);
    window.addEventListener('storage', handleStorage);
    document.addEventListener('visibilitychange', handleVisibility);
  }

  function handlePointerDown(event) {
    if (event.button !== 0 && event.pointerType !== 'touch') return;
    const position = positionFromClientX(event.clientX);
    pointerHold = {
      id: event.pointerId,
      started: performance.now(),
      position
    };
    session = { ...session, cursor: position };
    frozenPhase = currentPhase();
    main.dataset.holding = 'true';
    surface.setPointerCapture?.(event.pointerId);
    render('Suspension started. Release to leave one deliberate error.');
  }

  function handlePointerMove(event) {
    if (!pointerHold || event.pointerId !== pointerHold.id) return;
    const position = positionFromClientX(event.clientX);
    pointerHold.position = position;
    session = { ...session, cursor: position };
    renderCursor();
  }

  function handlePointerUp(event) {
    if (!pointerHold || event.pointerId !== pointerHold.id) return;
    const position = positionFromClientX(event.clientX);
    const duration = performance.now() - pointerHold.started;
    pointerHold = null;
    frozenPhase = null;
    main.dataset.holding = 'false';
    performSuspend(position, duration, 'Pointer suspension');
    surface.focus({ preventScroll: true });
  }

  function cancelPointerHold() {
    pointerHold = null;
    frozenPhase = null;
    main.dataset.holding = 'false';
    render('Suspension cancelled. The forces resumed without an error.');
  }

  function positionFromClientX(clientX) {
    const rect = surface.getBoundingClientRect();
    if (!rect.width) return session.cursor;
    return Math.max(0, Math.min(1000, Math.round(((clientX - rect.left) / rect.width) * 1000)));
  }

  function handleKeydown(event) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      const delta = event.key === 'ArrowLeft' ? -50 : 50;
      session = core.moveCursor(state, session, delta);
      render('Counterweight moved. Time and memory did not change.');
      return;
    }

    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      session = core.moveCursor(state, session, event.key === 'Home' ? -1000 : 1000);
      render('Counterweight moved to a treaty edge.');
      return;
    }

    if (event.key === ' ' && keyboardHoldStarted === 0) {
      event.preventDefault();
      keyboardHoldStarted = performance.now();
      frozenPhase = currentPhase();
      main.dataset.holding = 'true';
      render('Keyboard suspension started. Release Space to leave the error.');
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      performSuspend(session.cursor, 900, 'Keyboard suspension');
      return;
    }

    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      attemptErase();
    }
  }

  function handleKeyup(event) {
    if (event.key !== ' ' || keyboardHoldStarted === 0) return;
    event.preventDefault();
    const duration = performance.now() - keyboardHoldStarted;
    keyboardHoldStarted = 0;
    frozenPhase = null;
    main.dataset.holding = 'false';
    performSuspend(session.cursor, duration, 'Keyboard suspension');
  }

  function performSuspend(position, duration, origin) {
    session = core.suspend(state, session, position, duration);
    render(`${origin} accepted. The agreement now contains ${session.suspensions.length === 1 ? 'one error' : 'another error'}.`);
    playSuspension(position, session.suspensions.at(-1)?.weight || 1);
  }

  function attemptErase() {
    const result = core.attemptErase(state, session);
    if (!result.erased) {
      announce('There is no active suspension to erase.');
      return;
    }

    state = result.state;
    session = result.session;
    persist();
    render('Erasure failed as designed. The removed mark became the only durable memory.');
    playErase(result.erased.weight);

    if (result.firstEvent) triggerOnceEvent();
  }

  function triggerOnceEvent() {
    window.clearTimeout(eventTimer);
    main.dataset.event = 'true';
    onceEvent.hidden = false;
    renderForcePositions();
    announce('A one-time field reversal occurred. It cannot repeat while this local installation remains.');
    playOnceEvent();
    eventTimer = window.setTimeout(() => {
      onceEvent.hidden = true;
      main.dataset.event = 'false';
      render('The one-time reversal is over. Its erased cause remains.');
    }, reducedMotion ? 900 : 1800);
  }

  function render(message) {
    const force = core.forceState(state, session);
    const measured = core.measurementFor(state, session);
    const order = core.treatyState(state, session);

    main.dataset.order = order;
    main.style.setProperty('--force-a-scale', String(force.scaleA));
    main.style.setProperty('--force-b-scale', String(force.scaleB));
    main.style.setProperty('--field-scale', String(force.fieldScale));

    renderCursor();
    renderSuspensions();
    renderGhost();
    treatyState.textContent = core.statusText(state, session);
    measurement.textContent = `Measured: ${measured.value} ${measured.unit} · unit unresolved`;
    memoryNote.textContent = storageEnabled
      ? core.memoryText(state)
      : 'Local storage is unavailable. Attempted erasure will not survive this session.';
    eraseButton.disabled = session.suspensions.length === 0;
    instruction.textContent = session.suspensions.length === 1
      ? 'One error holds the treaty. Add another, or attempt to erase this one.'
      : 'Hold anywhere on the line. Arrow keys move the keyboard counterweight.';
    renderForcePositions();
    announce(message);
  }

  function renderCursor() {
    const cursorPercent = `${session.cursor / 10}%`;
    main.style.setProperty('--cursor-x', cursorPercent);
    counterweight.style.left = cursorPercent;
    fieldLines.style.setProperty('--cursor-x', cursorPercent);
  }

  function renderSuspensions() {
    suspensions.replaceChildren();
    session.suspensions.forEach((mark, index) => {
      const element = document.createElement('i');
      element.className = 'suspension-mark';
      element.style.setProperty('--mark-x', `${mark.position / 10}%`);
      element.style.setProperty('--mark-weight', String(mark.weight));
      element.style.setProperty('--mark-tilt', `${((mark.id + index) % 3 - 1) * 1.3}deg`);
      suspensions.append(element);
    });
  }

  function renderGhost() {
    if (!state.ghost) {
      ghostMark.hidden = true;
      return;
    }
    ghostMark.hidden = false;
    ghostMark.style.setProperty('--ghost-x', `${state.ghost.position / 10}%`);
  }

  function startMotion() {
    if (reducedMotion) {
      renderForcePositions(0.25);
      return;
    }
    const tick = () => {
      renderForcePositions();
      animationFrame = window.requestAnimationFrame(tick);
    };
    animationFrame = window.requestAnimationFrame(tick);
  }

  function currentPhase() {
    if (frozenPhase !== null) return frozenPhase;
    return ((performance.now() - animationOrigin) % 7200) / 7200;
  }

  function renderForcePositions(explicitPhase = null) {
    const phase = explicitPhase === null
      ? (reducedMotion ? 0.25 : currentPhase())
      : explicitPhase;
    const positions = core.timelinePositions(state, session, phase);
    const a = `${positions.a / 10}%`;
    const b = `${positions.b / 10}%`;
    main.style.setProperty('--force-a-x', a);
    main.style.setProperty('--force-b-x', b);
    forceA.style.setProperty('--force-a-x', a);
    forceB.style.setProperty('--force-b-x', b);
  }

  function announce(message) {
    if (!message) return;
    status.textContent = '';
    window.setTimeout(() => {
      status.textContent = message;
    }, 20);
  }

  function toggleSound() {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) {
      soundButton.textContent = 'Sound unavailable';
      soundButton.disabled = true;
      announce('Local audio synthesis is unavailable in this browser.');
      return;
    }

    soundEnabled = !soundEnabled;
    soundButton.setAttribute('aria-pressed', String(soundEnabled));
    soundButton.textContent = soundEnabled ? 'Sound on' : 'Sound off';
    announce(soundEnabled ? 'Sound enabled. Suspensions now have local tones.' : 'Sound disabled. The treaty remains fully usable.');

    if (soundEnabled) {
      audioContext ||= new AudioCtor();
      audioContext.resume().catch(() => {});
      playTone(118, 0.022, 0.12, 'sine');
    }
  }

  function playSuspension(position, weight) {
    if (!soundEnabled) return;
    const frequency = 92 + (position / 1000) * 170;
    playTone(frequency, 0.018 + weight * 0.004, 0.09 + weight * 0.025, 'triangle');
    window.setTimeout(() => playTone(frequency * 0.75, 0.015, 0.11, 'sine'), 55);
  }

  function playErase(weight) {
    if (!soundEnabled) return;
    playTone(82 + weight * 7, 0.022, 0.16, 'sine');
  }

  function playOnceEvent() {
    if (!soundEnabled) return;
    [97, 131, 173].forEach((frequency, index) => {
      window.setTimeout(() => playTone(frequency, 0.02, 0.26, 'triangle'), index * 55);
    });
  }

  function playTone(frequency, volume, duration, type) {
    if (!audioContext || !soundEnabled) return;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(volume, audioContext.currentTime + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration + 0.03);
  }

  function handleStorage(event) {
    if (event.key !== core.STATE_KEY || !event.newValue) return;
    try {
      state = core.sanitizeState(JSON.parse(event.newValue), state.installSeed);
      render('Another local copy changed the erased memory. Active suspensions here were left alone.');
    } catch {
      // Ignore malformed local state.
    }
  }

  function handleVisibility() {
    if (document.hidden) {
      pointerHold = null;
      keyboardHoldStarted = 0;
      frozenPhase = null;
      main.dataset.holding = 'false';
      return;
    }
    animationOrigin = performance.now();
    render('Hidden time had no treaty authority. The forces resumed from here.');
  }

  function resetLocalState() {
    window.clearTimeout(eventTimer);
    onceEvent.hidden = true;
    main.dataset.event = 'false';
    try {
      localStorage.removeItem(core.STATE_KEY);
      core.LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
      storageEnabled = true;
    } catch {
      storageEnabled = false;
    }

    state = core.createState(generateInstallSeed());
    session = core.createSession(state);
    pointerHold = null;
    keyboardHoldStarted = 0;
    frozenPhase = null;
    animationOrigin = performance.now();
    persist();
    render('Local treaty state cleared. The one-time event is possible again.');
    resetButton.blur();
  }

  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js').catch(() => {
        // The treaty remains usable without service-worker support.
      });
    }, { once: true });
  }
})();
