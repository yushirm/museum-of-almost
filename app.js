(() => {
  'use strict';

  const core = globalThis.MuseumEntropyCore;
  if (!core) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const organism = document.querySelector('#organism');
  const canvas = document.querySelector('#weave-canvas');
  const context = canvas.getContext('2d');
  const knotField = document.querySelector('#knot-field');
  const ruleText = document.querySelector('#rule-text');
  const fieldStatus = document.querySelector('#field-status');
  const warning = document.querySelector('#warning');
  const memoryNote = document.querySelector('#memory-note');
  const soundButton = document.querySelector('#sound-button');
  const resetButton = document.querySelector('#reset-button');

  const consequenceTimers = new Map();
  let state;
  let storageEnabled = true;
  let knotButtons = [];
  let lastPressed = -1;
  let idleTimer = 0;
  let stillTimer = 0;
  let animationFrame = 0;
  let audioContext = null;
  let soundEnabled = false;
  let canvasSize = { width: 1, height: 1, dpr: 1 };

  initialise();

  function initialise() {
    state = loadState();
    const visit = core.advanceVisit(state);
    state = visit.state;
    persistState();
    buildKnotButtons();
    renderAll(visit.returnedConsequences > 0 ? visit.line : 'The weave is listening without recording you.');
    schedulePendingConsequences();
    resetIdleTimer();
    bindEvents();
    registerServiceWorker();
    if (!reducedMotion) animate();
  }

  function bindEvents() {
    soundButton.addEventListener('click', toggleSound);
    resetButton.addEventListener('click', resetLocalState);
    window.addEventListener('resize', resizeCanvas, { passive: true });
    window.addEventListener('orientationchange', resizeCanvas, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        resizeCanvas();
        resetIdleTimer();
      }
    });
    window.addEventListener('storage', (event) => {
      if (event.key !== core.STATE_KEY || !event.newValue) return;
      try {
        state = core.sanitizeState(JSON.parse(event.newValue), state.installSeed);
        renderAll('Another local copy changed the tension.');
      } catch {
        // Ignore malformed local state and keep the current in-memory experience.
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
    let legacyMain = null;
    let legacyTomorrow = null;
    try {
      stored = localStorage.getItem(core.STATE_KEY);
      legacyMain = localStorage.getItem(core.LEGACY_KEYS[0]);
      legacyTomorrow = localStorage.getItem(core.LEGACY_KEYS[1]);
    } catch {
      storageEnabled = false;
    }

    if (stored) {
      try {
        return core.sanitizeState(JSON.parse(stored), generateInstallSeed());
      } catch {
        // A damaged fictional state is replaced safely below.
      }
    }

    const migration = core.migrateLegacy(legacyMain, legacyTomorrow);
    const fresh = core.createState(generateInstallSeed(), migration.legacyPressure);
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

  function buildKnotButtons() {
    knotField.replaceChildren();
    knotButtons = Array.from({ length: core.KNOT_COUNT }, (_, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'knot';
      button.dataset.index = String(index);
      button.innerHTML = '<span></span><small></small>';
      button.addEventListener('click', () => contradictKnot(index));
      knotField.append(button);
      return button;
    });
  }

  function contradictKnot(index) {
    resetIdleTimer();
    const result = core.contradict(state, index);
    state = result.state;
    lastPressed = index;
    persistState();
    renderAll(result.line);
    scheduleConsequence(result.consequence);
    playContradiction(index);

    if (result.accident) {
      warning.hidden = false;
      warning.textContent = 'Administrative warning: one harmless thread has become historically significant.';
    }

    if (state.actionCount === 5 || state.actionCount % 11 === 0) beginStillness();
  }

  function schedulePendingConsequences() {
    state.pendingReturn.forEach(scheduleConsequence);
  }

  function scheduleConsequence(consequence) {
    if (!consequence || consequenceTimers.has(consequence.id)) return;
    const delay = 4800 + (core.hashString(`${core.EXECUTION_SEED}:${consequence.id}:delay`) % 6200);
    const timer = window.setTimeout(() => {
      consequenceTimers.delete(consequence.id);
      const current = state.pendingReturn.find((item) => item.id === consequence.id);
      if (!current) return;
      const applied = core.applyConsequence(state, current);
      state = applied.state;
      persistState();
      renderAll(applied.line);
      playConsequence(current.target);
    }, reducedMotion ? Math.min(delay, 5200) : delay);
    consequenceTimers.set(consequence.id, timer);
  }

  function applyIdleShift() {
    const result = core.idleShift(state);
    state = result.state;
    persistState();
    renderAll(result.line);
    idleTimer = window.setTimeout(applyIdleShift, 11000);
  }

  function resetIdleTimer() {
    window.clearTimeout(idleTimer);
    idleTimer = window.setTimeout(applyIdleShift, 8000);
  }

  function beginStillness() {
    window.clearTimeout(stillTimer);
    organism.classList.add('still');
    fieldStatus.textContent = 'The organism refuses immediate movement for four seconds.';
    stillTimer = window.setTimeout(() => {
      organism.classList.remove('still');
      renderAll('The withheld movement returns through every fibre.');
    }, 4000);
  }

  function renderAll(message) {
    const knots = core.buildKnots(state.installSeed, state.mutation);
    const predicted = core.predictIndex(state);
    ruleText.textContent = core.ruleText(state);
    memoryNote.textContent = storageEnabled
      ? core.memoryText(state)
      : 'Local storage is unavailable. This visit remains in memory only.';
    warning.hidden = !state.memory;
    if (state.memory) {
      warning.textContent = 'Administrative warning: one harmless thread has become historically significant.';
    }
    organism.dataset.mobileSeam = state.actionCount >= 3 ? 'closed' : 'open';

    knotButtons.forEach((button, index) => {
      const tension = state.tensions[index];
      const stress = Math.min(1, Math.abs(tension));
      const phrase = knots[index].phrase;
      const remembered = state.memory?.target === index;
      button.querySelector('span').textContent = remembered ? `${phrase}, remembered incorrectly` : phrase;
      button.querySelector('small').textContent = state.rule === 0 ? 'Bind against the rule' : 'Loosen against the rule';
      button.setAttribute('aria-label', core.contradictionLabel(state, phrase));
      button.setAttribute('aria-pressed', String(index === lastPressed));
      button.classList.toggle('predicted', index === predicted);
      button.style.setProperty('--stress', stress.toFixed(3));
      button.style.setProperty('--turn', `${(tension * 11 + (index % 2 ? 2 : -2)).toFixed(2)}deg`);
      button.style.setProperty('--lift', `${(tension * 18).toFixed(1)}px`);
      button.style.setProperty('--spread', `${(tension * (index % 3 - 1) * 15).toFixed(1)}px`);
    });

    fieldStatus.textContent = message;
    resizeCanvas();
  }

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    }
    canvasSize = { width, height, dpr };
    drawWeave(performance.now());
  }

  function animate(time = performance.now()) {
    drawWeave(time);
    animationFrame = window.requestAnimationFrame(animate);
  }

  function drawWeave(time) {
    const { width, height, dpr } = canvasSize;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, width, height);
    if (!knotButtons.length) return;

    const canvasRect = canvas.getBoundingClientRect();
    const points = knotButtons.map((button, index) => {
      const rect = button.getBoundingClientRect();
      return {
        x: rect.left - canvasRect.left + rect.width / 2,
        y: rect.top - canvasRect.top + rect.height / 2,
        tension: state.tensions[index]
      };
    });
    const predicted = core.predictIndex(state);
    const breath = reducedMotion || organism.classList.contains('still') ? 0 : Math.sin(time / 1900) * 3.5;

    context.lineCap = 'round';
    for (let index = 0; index < points.length; index += 1) {
      const start = points[index];
      const end = points[(index + 1) % points.length];
      drawFibre(start, end, index, breath, index === predicted || (index + 1) % points.length === predicted);
    }
    drawFibre(points[0], points[4], 8, -breath, predicted === 0 || predicted === 4);
    drawFibre(points[1], points[5], 9, breath, predicted === 1 || predicted === 5);
    drawFibre(points[2], points[3], 10, -breath, predicted === 2 || predicted === 3);

    const centre = points.reduce((sum, point) => ({ x: sum.x + point.x, y: sum.y + point.y }), { x: 0, y: 0 });
    centre.x /= points.length;
    centre.y /= points.length;
    const average = points.reduce((sum, point) => sum + point.tension, 0) / points.length;
    const radius = 18 + Math.abs(average) * 15 + breath * 0.25;
    context.beginPath();
    context.arc(centre.x, centre.y, radius, 0, Math.PI * 2);
    context.strokeStyle = state.rule === 0 ? 'rgba(154,79,66,0.72)' : 'rgba(123,155,146,0.72)';
    context.lineWidth = 2;
    context.stroke();
    context.beginPath();
    context.moveTo(centre.x - radius * 0.6, centre.y + radius * 0.25);
    context.lineTo(centre.x + radius * 0.55, centre.y - radius * 0.3);
    context.strokeStyle = 'rgba(230,220,197,0.55)';
    context.lineWidth = 1;
    context.stroke();
  }

  function drawFibre(start, end, index, breath, anticipated) {
    const midpointX = (start.x + end.x) / 2;
    const midpointY = (start.y + end.y) / 2;
    const perpendicularX = -(end.y - start.y);
    const perpendicularY = end.x - start.x;
    const length = Math.hypot(perpendicularX, perpendicularY) || 1;
    const bend = (start.tension - end.tension) * 26 + breath * (index % 2 ? 1 : -1);
    const controlX = midpointX + perpendicularX / length * bend;
    const controlY = midpointY + perpendicularY / length * bend;

    for (let strand = -1; strand <= 1; strand += 1) {
      context.beginPath();
      context.moveTo(start.x + strand * 1.6, start.y - strand * 1.2);
      context.quadraticCurveTo(controlX + strand * 2.2, controlY, end.x + strand * 1.6, end.y + strand * 1.2);
      context.strokeStyle = anticipated
        ? `rgba(123,155,146,${0.32 + strand * 0.03})`
        : `rgba(184,167,127,${0.2 + Math.abs(start.tension - end.tension) * 0.14})`;
      context.lineWidth = strand === 0 ? 1.4 : 0.7;
      context.stroke();
    }
  }

  function toggleSound() {
    soundEnabled = !soundEnabled;
    soundButton.setAttribute('aria-pressed', String(soundEnabled));
    soundButton.textContent = soundEnabled ? 'Sound on' : 'Sound off';
    if (soundEnabled) {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      audioContext.resume().catch(() => {});
      playTone(196, 0.07, 0.16);
    }
  }

  function playContradiction(index) {
    if (!soundEnabled) return;
    const tension = state.tensions[index];
    playTone(150 + index * 27 + tension * 32, 0.08, 0.22);
    window.setTimeout(() => playTone(228 + (5 - index) * 19 - tension * 24, 0.045, 0.16), 90);
  }

  function playConsequence(index) {
    if (!soundEnabled) return;
    playTone(110 + index * 23, 0.04, 0.28);
  }

  function playTone(frequency, volume, duration) {
    if (!audioContext || !soundEnabled) return;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = Math.max(60, frequency);
    gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(volume, audioContext.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration + 0.03);
  }

  function resetLocalState() {
    consequenceTimers.forEach((timer) => window.clearTimeout(timer));
    consequenceTimers.clear();
    try {
      localStorage.removeItem(core.STATE_KEY);
      core.LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
      storageEnabled = true;
    } catch {
      storageEnabled = false;
    }
    state = core.createState(generateInstallSeed(), 0);
    const visit = core.advanceVisit(state);
    state = visit.state;
    lastPressed = -1;
    persistState();
    renderAll('Local memory cleared. The rule begins unstable again.');
    resetIdleTimer();
    resetButton.blur();
  }

  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js').catch(() => {
        // The site remains usable online when service workers are unavailable.
      });
    }, { once: true });
  }
})();
