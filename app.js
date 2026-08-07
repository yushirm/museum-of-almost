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
  const suspensionSpans = document.querySelector('#suspension-spans');
  const suspensions = document.querySelector('#suspensions');
  const ghostMark = document.querySelector('#ghost-mark');
  const counterweight = document.querySelector('#counterweight');
  const onceEvent = document.querySelector('#once-event');
  const instruction = document.querySelector('#instruction');
  const treatyState = document.querySelector('#treaty-state');
  const measurement = document.querySelector('#measurement');
  const memoryNote = document.querySelector('#memory-note');
  const ledgerSummary = document.querySelector('#ledger-summary');
  const ledgerCount = document.querySelector('#ledger-count');
  const ledgerWeight = document.querySelector('#ledger-weight');
  const ledgerCenter = document.querySelector('#ledger-center');
  const ledgerSpread = document.querySelector('#ledger-spread');
  const resonanceSummary = document.querySelector('#resonance-summary');
  const sessionJournal = document.querySelector('#session-journal');
  const status = document.querySelector('#status');
  const eraseButton = document.querySelector('#erase-button');
  const echoButton = document.querySelector('#echo-button');
  const undoButton = document.querySelector('#undo-button');
  const softenButton = document.querySelector('#soften-button');
  const intensifyButton = document.querySelector('#intensify-button');
  const postcardButton = document.querySelector('#postcard-button');
  const printButton = document.querySelector('#print-button');
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
  let journalEntries = ['The treaty opened without an active suspension.'];

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
    echoButton.addEventListener('click', castEcho);
    undoButton.addEventListener('click', undoSessionMark);
    softenButton.addEventListener('click', () => adjustLatest(-1));
    intensifyButton.addEventListener('click', () => adjustLatest(1));
    postcardButton.addEventListener('click', makePostcard);
    printButton.addEventListener('click', printTreaty);
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
    if (event.shiftKey && !event.repeat && event.key.toLowerCase() === 'e') {
      event.preventDefault();
      castEcho();
      return;
    }

    if (event.shiftKey && !event.repeat && event.key.toLowerCase() === 'u') {
      event.preventDefault();
      undoSessionMark();
      return;
    }

    if (event.key === '[' || event.key === ']') {
      event.preventDefault();
      adjustLatest(event.key === '[' ? -1 : 1);
      return;
    }

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
    const latest = session.suspensions.at(-1);
    recordJournal(`${origin} left a weight-${latest?.weight || 1} mark at ${Math.round(position / 10)}%.`);
    render(`${origin} accepted. The agreement now contains ${session.suspensions.length === 1 ? 'one error' : 'another error'}.`);
    playSuspension(position, latest?.weight || 1);
  }

  function castEcho() {
    const result = core.echoLatest(state, session);
    if (!result.echoed) {
      announce('Create a suspension before casting an echo.');
      return;
    }
    session = result.session;
    recordJournal(`An echo mirrored the latest mark to ${Math.round(result.echoed.position / 10)}%.`);
    render('The latest suspension cast a mirrored echo across the treaty.');
    playEcho(result.echoed.position, result.echoed.weight);
  }

  function undoSessionMark() {
    const result = core.undoLatest(state, session);
    if (!result.removed) {
      announce('There is no session-only mark to undo.');
      return;
    }
    session = result.session;
    recordJournal(`A session-only mark at ${Math.round(result.removed.position / 10)}% was undone without becoming memory.`);
    render('The latest session mark was undone. Durable erased memory was untouched.');
    playUndo(result.removed.weight);
  }

  function adjustLatest(delta) {
    const before = session.suspensions.at(-1);
    const result = core.adjustLatestWeight(state, session, delta);
    if (!result.changed || !before) {
      announce('Create a suspension before changing its weight.');
      return;
    }
    session = result.session;
    if (result.changed.weight === before.weight) {
      announce(delta < 0 ? 'The latest mark is already at minimum weight.' : 'The latest mark is already at maximum weight.');
      return;
    }
    recordJournal(`The latest mark changed from weight ${before.weight} to ${result.changed.weight}.`);
    render(delta < 0 ? 'The latest suspension softened.' : 'The latest suspension intensified.');
    playAdjustment(result.changed.weight);
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
    recordJournal(`Erasure removed an active mark at ${Math.round(result.erased.position / 10)}% and preserved its ghost.`);
    render('Erasure failed as designed. The removed mark became the only durable memory.');
    playErase(result.erased.weight);

    if (result.firstEvent) triggerOnceEvent();
  }

  function triggerOnceEvent() {
    window.clearTimeout(eventTimer);
    main.dataset.event = 'true';
    onceEvent.hidden = false;
    renderForcePositions();
    recordJournal('The installation used its one field reversal.');
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
    const latest = session.suspensions.at(-1);

    main.dataset.order = order;
    main.style.setProperty('--force-a-scale', String(force.scaleA));
    main.style.setProperty('--force-b-scale', String(force.scaleB));
    main.style.setProperty('--field-scale', String(force.fieldScale));

    renderCursor();
    renderSpans();
    renderSuspensions();
    renderGhost();
    renderLedger();
    renderJournal();
    treatyState.textContent = core.statusText(state, session);
    measurement.textContent = `Measured: ${measured.value} ${measured.unit} · unit unresolved`;
    memoryNote.textContent = storageEnabled
      ? core.memoryText(state)
      : 'Local storage is unavailable. Attempted erasure will not survive this session.';
    eraseButton.disabled = session.suspensions.length === 0;
    echoButton.disabled = session.suspensions.length === 0;
    undoButton.disabled = session.suspensions.length === 0;
    softenButton.disabled = !latest || latest.weight <= 1;
    intensifyButton.disabled = !latest || latest.weight >= 5;
    instruction.textContent = session.suspensions.length === 1
      ? 'One error holds the treaty. Build around it, echo it, edit its weight, or attempt erasure.'
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

  function renderSpans() {
    suspensionSpans.replaceChildren();
    core.spanState(state, session).forEach((span) => {
      const element = document.createElement('i');
      element.className = 'suspension-span';
      element.style.setProperty('--span-left', `${span.from / 10}%`);
      element.style.setProperty('--span-width', `${span.distance / 10}%`);
      element.dataset.resonance = span.resonance;
      suspensionSpans.append(element);
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

  function renderLedger() {
    const ledger = core.ledgerFor(state, session);
    ledgerCount.textContent = String(ledger.count);
    ledgerWeight.textContent = String(ledger.totalWeight);
    ledgerCenter.textContent = ledger.count ? `${(ledger.averagePosition / 10).toFixed(1)}%` : '—';
    ledgerSpread.textContent = `${(ledger.spread / 10).toFixed(1)}%`;
    resonanceSummary.textContent = `Resonance: ${ledger.resonance}.`;
    ledgerSummary.textContent = ledger.count
      ? `${ledger.count} active ${ledger.count === 1 ? 'mark' : 'marks'}, total weight ${ledger.totalWeight}, ${ledger.resonance}.`
      : 'No active marks. The session ledger is unwritten.';
  }

  function recordJournal(entry) {
    journalEntries = [...journalEntries, entry].slice(-6);
  }

  function renderJournal() {
    sessionJournal.replaceChildren();
    journalEntries.forEach((entry) => {
      const item = document.createElement('li');
      item.textContent = entry;
      sessionJournal.append(item);
    });
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

  function playEcho(position, weight) {
    if (!soundEnabled) return;
    const frequency = 108 + (position / 1000) * 150;
    playTone(frequency, 0.017 + weight * 0.003, 0.12, 'sine');
    window.setTimeout(() => playTone(frequency * 1.25, 0.013, 0.09, 'triangle'), 70);
  }

  function playAdjustment(weight) {
    if (!soundEnabled) return;
    playTone(115 + weight * 24, 0.016, 0.09, 'triangle');
  }

  function playUndo(weight) {
    if (!soundEnabled) return;
    playTone(142 - weight * 9, 0.014, 0.08, 'sine');
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

  function makePostcard() {
    const data = core.postcardData(state, session);
    const marks = session.suspensions.map((mark) => {
      const x = 80 + (mark.position / 1000) * 640;
      const height = 36 + mark.weight * 9;
      return `<line x1="${x.toFixed(1)}" y1="${260 - height}" x2="${x.toFixed(1)}" y2="${260 + height}" stroke="#df9e58" stroke-width="${1 + mark.weight}" />`;
    }).join('');
    const ghost = state.ghost
      ? `<line x1="${(80 + (state.ghost.position / 1000) * 640).toFixed(1)}" y1="180" x2="${(80 + (state.ghost.position / 1000) * 640).toFixed(1)}" y2="340" stroke="#a7ada7" stroke-width="1" stroke-dasharray="6 5" />`
      : '';
    const namespace = ['http:', '//www.w3.org/2000/svg'].join('');
    const svg = `<svg xmlns="${namespace}" width="800" height="520" viewBox="0 0 800 520">
  <rect width="800" height="520" fill="#101317"/>
  <text x="64" y="64" fill="#eef1ea" font-family="Georgia, serif" font-size="28">The Museum of Almost</text>
  <text x="64" y="96" fill="#a7ada7" font-family="system-ui, sans-serif" font-size="13" letter-spacing="2">TREATY 05 · LOCAL POSTCARD · ${data.code}</text>
  <line x1="80" y1="260" x2="720" y2="260" stroke="#616b68" stroke-width="1"/>
  <line x1="80" y1="205" x2="720" y2="205" stroke="#77b8b2" stroke-width="${Math.max(1, data.scaleA * 2).toFixed(2)}"/>
  <line x1="80" y1="315" x2="720" y2="315" stroke="#c98772" stroke-width="${Math.max(1, data.scaleB * 2).toFixed(2)}"/>
  ${ghost}${marks}
  <text x="64" y="408" fill="#eef1ea" font-family="Georgia, serif" font-size="20">${data.order.replace('-', ' ')}</text>
  <text x="64" y="438" fill="#a7ada7" font-family="system-ui, sans-serif" font-size="14">${data.count} active marks · weight ${data.totalWeight} · ${data.resonance}</text>
  <text x="64" y="465" fill="#a7ada7" font-family="system-ui, sans-serif" font-size="14">Measured ${data.measurement} · unit unresolved · erased ghost ${data.ghost ? 'present' : 'absent'}</text>
  <text x="64" y="496" fill="#e3c765" font-family="system-ui, sans-serif" font-size="11" letter-spacing="1.5">GENERATED LOCALLY · NO VISITOR TEXT · NO REMOTE ASSETS</text>
</svg>`;
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = 'museum-of-almost-treaty.svg';
    link.hidden = true;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
    recordJournal('A local postcard was generated from the current visible treaty state.');
    renderJournal();
    announce('Local postcard generated. No network request was used.');
  }

  function printTreaty() {
    recordJournal('The current treaty was prepared for local printing.');
    renderJournal();
    announce('Opening the browser print dialog.');
    window.print();
  }

  function handleStorage(event) {
    if (event.key !== core.STATE_KEY || !event.newValue) return;
    try {
      state = core.sanitizeState(JSON.parse(event.newValue), state.installSeed);
      recordJournal('Another local copy changed the erased ghost; this session kept its active marks.');
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
    journalEntries = ['Local treaty state and this session record were cleared.'];
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
