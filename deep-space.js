'use strict';

(function initialiseDeepSpace() {
  const core = window.MuseumDeepSpaceCore;
  if (!core) return;

  const scaleButtons = [...document.querySelectorAll('[data-scale-id]')];
  const scaleName = document.querySelector('#scale-name');
  const scaleDistance = document.querySelector('#scale-distance');
  const scaleLightTime = document.querySelector('#scale-light-time');
  const scaleNote = document.querySelector('#scale-note');
  const scaleBeam = document.querySelector('#scale-beam');

  const blackHoleButtons = [...document.querySelectorAll('[data-black-hole-id]')];
  const blackHoleName = document.querySelector('#black-hole-name');
  const blackHoleMass = document.querySelector('#black-hole-mass');
  const blackHoleRadius = document.querySelector('#black-hole-radius');
  const blackHoleDiameter = document.querySelector('#black-hole-diameter');
  const blackHoleNote = document.querySelector('#black-hole-note');
  const gravityWell = document.querySelector('#gravity-well');

  const mysteryButtons = [...document.querySelectorAll('[data-mystery-id]')];
  const mysteryTitle = document.querySelector('#mystery-title');
  const mysteryKnown = document.querySelector('#mystery-known');
  const mysteryUnknown = document.querySelector('#mystery-unknown');

  function selectButton(buttons, activeButton) {
    for (const button of buttons) {
      const active = button === activeButton;
      button.dataset.active = String(active);
      button.setAttribute('aria-pressed', String(active));
    }
  }

  function renderScale(id) {
    const item = core.SCALE_STOPS.find((candidate) => candidate.id === id);
    if (!item) return;
    scaleName.textContent = item.label;
    scaleDistance.textContent = core.formatDistance(item.distanceKm);
    scaleLightTime.textContent = core.formatDuration(core.lightTimeSeconds(item.distanceKm));
    scaleNote.textContent = item.note;
    const index = core.SCALE_STOPS.indexOf(item);
    scaleBeam.style.setProperty('--beam-progress', `${20 + index * 18}%`);
  }

  function renderBlackHole(id) {
    const item = core.BLACK_HOLES.find((candidate) => candidate.id === id);
    if (!item) return;
    const radius = core.schwarzschildRadiusKm(item.solarMasses);
    blackHoleName.textContent = item.label;
    const massLabel = item.solarMasses >= 1e9
      ? `${(item.solarMasses / 1e9).toFixed(1)} billion solar masses`
      : item.solarMasses >= 1e6
        ? `${(item.solarMasses / 1e6).toFixed(1)} million solar masses`
        : `${new Intl.NumberFormat('en', { maximumFractionDigits: 1 }).format(item.solarMasses)} solar masses`;
    blackHoleMass.textContent = massLabel;
    blackHoleRadius.textContent = `${new Intl.NumberFormat('en', { maximumFractionDigits: radius >= 1e6 ? 0 : 1 }).format(radius)} km`;
    blackHoleDiameter.textContent = `${new Intl.NumberFormat('en', { maximumFractionDigits: radius >= 1e6 ? 0 : 1 }).format(radius * 2)} km`;
    blackHoleNote.textContent = `${item.note} The radius shown uses the Schwarzschild approximation: non-rotating and uncharged.`;
    const visualDepth = Math.min(1, Math.log10(item.solarMasses + 1) / 10);
    gravityWell.style.setProperty('--horizon-size', `${20 + visualDepth * 10}%`);
    gravityWell.style.setProperty('--well-squash', String(0.64 - visualDepth * 0.12));
  }

  function renderMystery(id) {
    const item = core.MYSTERIES.find((candidate) => candidate.id === id);
    if (!item) return;
    mysteryTitle.textContent = item.title;
    mysteryKnown.textContent = item.known;
    mysteryUnknown.textContent = item.unknown;
  }

  function loadLocalScript(src, marker, done) {
    if (document.querySelector(`script[data-deep-space-module="${marker}"]`)) {
      if (typeof done === 'function') done();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.defer = true;
    script.dataset.deepSpaceModule = marker;
    if (typeof done === 'function') script.addEventListener('load', done, { once: true });
    document.head.append(script);
  }

  function loadCausalSignalBox(done) {
    if (!document.querySelector('link[data-causal-signal-styles]')) {
      const stylesheet = document.createElement('link');
      stylesheet.rel = 'stylesheet';
      stylesheet.href = './causal-signal.css';
      stylesheet.dataset.causalSignalStyles = '';
      document.head.append(stylesheet);
    }

    loadLocalScript('./causal-signal-core.js', 'causal-signal-core', () => {
      loadLocalScript('./causal-signal.js', 'causal-signal-view', done);
    });
  }

  function loadSameAnswerMachine() {
    if (!document.querySelector('link[data-same-answer-styles]')) {
      const stylesheet = document.createElement('link');
      stylesheet.rel = 'stylesheet';
      stylesheet.href = './same-answer-machine.css';
      stylesheet.dataset.sameAnswerStyles = '';
      document.head.append(stylesheet);
    }

    loadLocalScript('./same-answer-core.js', 'same-answer-core', () => {
      loadLocalScript('./same-answer-machine.js', 'same-answer-view');
    });
  }

  function loadOriginMachine(done = loadSameAnswerMachine) {
    if (!document.querySelector('link[data-origin-machine-styles]')) {
      const stylesheet = document.createElement('link');
      stylesheet.rel = 'stylesheet';
      stylesheet.href = './origin-machine.css';
      stylesheet.dataset.originMachineStyles = '';
      document.head.append(stylesheet);
    }

    loadLocalScript('./origin-machine-core.js', 'origin-machine-core', () => {
      loadLocalScript('./origin-machine.js', 'origin-machine-view', done);
    });
  }

  function loadRedshiftRuler(done = loadOriginMachine) {
    if (!document.querySelector('link[data-redshift-ruler-styles]')) {
      const stylesheet = document.createElement('link');
      stylesheet.rel = 'stylesheet';
      stylesheet.href = './redshift-ruler.css';
      stylesheet.dataset.redshiftRulerStyles = '';
      document.head.append(stylesheet);
    }

    loadLocalScript('./redshift-ruler-core.js', 'redshift-ruler-core', () => {
      loadLocalScript('./redshift-ruler.js', 'redshift-ruler-view', done);
    });
  }

  function loadGravitationalCopyRoom(done = loadRedshiftRuler) {
    if (!document.querySelector('link[data-gravitational-copy-styles]')) {
      const stylesheet = document.createElement('link');
      stylesheet.rel = 'stylesheet';
      stylesheet.href = './gravitational-copy.css';
      stylesheet.dataset.gravitationalCopyStyles = '';
      document.head.append(stylesheet);
    }

    loadLocalScript('./gravitational-copy-core.js', 'gravitational-copy-core', () => {
      loadLocalScript('./gravitational-copy.js', 'gravitational-copy-view', done);
    });
  }

  for (const button of scaleButtons) {
    button.addEventListener('click', () => {
      selectButton(scaleButtons, button);
      renderScale(button.dataset.scaleId);
    });
  }

  for (const button of blackHoleButtons) {
    button.addEventListener('click', () => {
      selectButton(blackHoleButtons, button);
      renderBlackHole(button.dataset.blackHoleId);
    });
  }

  for (const button of mysteryButtons) {
    button.addEventListener('click', () => {
      selectButton(mysteryButtons, button);
      renderMystery(button.dataset.mysteryId);
    });
  }

  renderScale('sun');
  renderBlackHole('sagittarius-a');
  renderMystery('dark-matter');
  loadCausalSignalBox(loadGravitationalCopyRoom);

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js').catch(() => {});
    }, { once: true });
  }
})();
