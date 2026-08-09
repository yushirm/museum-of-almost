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

  function addCosmicStrata() {
    if (document.getElementById('cosmic-strata')) return;
    const closingSection = document.querySelector('[aria-labelledby="closing-title"]');
    if (!closingSection) return;

    const layers = [
      {
        age: '13.8 billion years',
        label: 'THE SURFACE · NOW',
        title: 'The observable universe at the age we inhabit',
        note: 'The current age is rounded. “Now” is not a universal simultaneity surface; this layer is only the top of this historical core.'
      },
      {
        age: '9.2 billion years',
        label: 'SOLAR STRATUM',
        title: 'The Sun and solar system begin to form',
        note: 'About 4.6 billion years before the present. This layer is placed by subtraction from the same rounded 13.8-billion-year reference age.'
      },
      {
        age: '≈3 billion years',
        label: 'STARBIRTH MAXIMUM',
        title: 'Cosmic star formation reaches its broad peak',
        note: 'A rounded historical landmark, not a sharp boundary: surveys place the busiest era of star formation roughly three billion years after the hot Big Bang.'
      },
      {
        age: '≤1 billion years',
        label: 'REIONIZATION STRATUM',
        title: 'Much of intergalactic hydrogen becomes ionized again',
        note: 'Reionization was extended rather than instantaneous. The one-billion-year marker is a broad upper boundary, not a single switch-on date.'
      },
      {
        age: 'after 0.00038, before 0.4 billion years',
        label: 'FIRST-LIGHT WINDOW',
        title: 'The first stars emerge somewhere inside an unresolved interval',
        note: 'The exact first appearance is not yet fixed. The honest bracket starts after recombination and ends before the earliest-known-galaxy boundary used here; most of that interval belongs to the cosmic dark ages.'
      },
      {
        age: '0.00038 billion years',
        label: 'RECOMBINATION · 380,000 YEARS',
        title: 'The cosmic fog clears and the oldest observable light is released',
        note: 'This is the cosmic microwave background boundary: before it, ordinary light could not travel freely through the hot plasma.'
      }
    ];

    const section = document.createElement('section');
    section.id = 'cosmic-strata';
    section.className = 'cosmos-section';
    section.setAttribute('aria-labelledby', 'cosmic-strata-title');

    const heading = document.createElement('div');
    heading.className = 'section-heading';
    const eyebrow = document.createElement('p');
    eyebrow.className = 'eyebrow';
    eyebrow.textContent = 'INSTRUMENT 14 · COSMIC STRATIGRAPHY';
    const title = document.createElement('h2');
    title.id = 'cosmic-strata-title';
    title.textContent = 'Scroll downward. The universe gets younger.';
    const intro = document.createElement('p');
    intro.textContent = 'Geologists read time through depth. This core sample borrows that grammar for cosmic history: no controls, no animation, no claim that the intervals are to scale. Each band is a rounded landmark in age after the hot Big Bang.';
    heading.append(eyebrow, title, intro);

    const coreSample = document.createElement('ol');
    coreSample.setAttribute('aria-label', 'Cosmic history from the present downward toward recombination');
    coreSample.style.listStyle = 'none';
    coreSample.style.margin = '0';
    coreSample.style.padding = '0';
    coreSample.style.border = '1px solid var(--line)';
    coreSample.style.background = 'rgba(7, 5, 17, 0.78)';

    layers.forEach((layer, index) => {
      const item = document.createElement('li');
      item.style.display = 'grid';
      item.style.gridTemplateColumns = '1fr';
      item.style.gap = '0.8rem';
      item.style.padding = 'clamp(1.4rem, 4vw, 3.5rem)';
      item.style.borderTop = index === 0 ? '0' : '1px solid var(--line)';
      item.style.background = `linear-gradient(90deg, rgba(132,232,255,${Math.max(0.02, 0.13 - index * 0.018)}), rgba(111,59,209,${Math.min(0.18, 0.05 + index * 0.02)}))`;

      const age = document.createElement('p');
      age.className = 'eyebrow';
      age.style.margin = '0';
      age.textContent = layer.age;

      const body = document.createElement('div');
      const label = document.createElement('p');
      label.className = 'metric-label';
      label.textContent = layer.label;
      const layerTitle = document.createElement('h3');
      layerTitle.style.margin = '0';
      layerTitle.style.maxWidth = '22ch';
      layerTitle.style.fontFamily = 'ui-serif, Georgia, serif';
      layerTitle.style.fontWeight = '500';
      layerTitle.style.fontSize = 'clamp(1.8rem, 4vw, 3.8rem)';
      layerTitle.style.lineHeight = '1';
      layerTitle.textContent = layer.title;
      const note = document.createElement('p');
      note.className = 'readout-note';
      note.style.maxWidth = '62ch';
      note.textContent = layer.note;
      body.append(label, layerTitle, note);
      item.append(age, body);
      coreSample.append(item);
    });

    const boundary = document.createElement('p');
    boundary.className = 'inventory-note';
    boundary.textContent = 'STRATIGRAPHIC BOUNDARY · Vertical spacing is editorial, not proportional to elapsed time. Ages are rounded reference landmarks; the first-star interval and reionization remain active areas of measurement. Native page scrolling is the only interaction.';

    section.append(heading, coreSample, boundary);
    closingSection.insertAdjacentElement('beforebegin', section);
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

  function loadParallaxSurvey() {
    if (!document.querySelector('link[data-parallax-survey-styles]')) {
      const stylesheet = document.createElement('link');
      stylesheet.rel = 'stylesheet';
      stylesheet.href = './parallax-survey.css';
      stylesheet.dataset.parallaxSurveyStyles = '';
      document.head.append(stylesheet);
    }

    loadLocalScript('./parallax-survey-core.js', 'parallax-survey-core', () => {
      loadLocalScript('./parallax-survey.js', 'parallax-survey-view');
    });
  }

  function loadUnequalMinute(done = loadParallaxSurvey) {
    if (!document.querySelector('link[data-unequal-minute-styles]')) {
      const stylesheet = document.createElement('link');
      stylesheet.rel = 'stylesheet';
      stylesheet.href = './unequal-minute.css';
      stylesheet.dataset.unequalMinuteStyles = '';
      document.head.append(stylesheet);
    }

    loadLocalScript('./unequal-minute-core.js', 'unequal-minute-core', () => {
      loadLocalScript('./unequal-minute.js', 'unequal-minute-view', done);
    });
  }

  function loadSameAnswerMachine(done = loadUnequalMinute) {
    if (!document.querySelector('link[data-same-answer-styles]')) {
      const stylesheet = document.createElement('link');
      stylesheet.rel = 'stylesheet';
      stylesheet.href = './same-answer-machine.css';
      stylesheet.dataset.sameAnswerStyles = '';
      document.head.append(stylesheet);
    }

    loadLocalScript('./same-answer-core.js', 'same-answer-core', () => {
      loadLocalScript('./same-answer-machine.js', 'same-answer-view', done);
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

  addCosmicStrata();
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