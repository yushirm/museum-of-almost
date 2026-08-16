'use strict';

(function initialiseFrameShifter() {
  const core = window.MuseumFrameShifterCore;
  if (!core) return;

  const scenarioButtons = [...document.querySelectorAll('[data-spacetime-scenario-id]')];
  const frameButtons = [...document.querySelectorAll('[data-frame-beta]')];
  const stage = document.querySelector('#frame-stage');
  const scenarioTitle = document.querySelector('#frame-scenario-title');
  const scenarioNote = document.querySelector('#frame-scenario-note');
  const eventA = document.querySelector('#frame-event-a');
  const eventB = document.querySelector('#frame-event-b');
  const frameName = document.querySelector('#frame-name');
  const deltaTime = document.querySelector('#frame-delta-time');
  const deltaSpace = document.querySelector('#frame-delta-space');
  const invariant = document.querySelector('#frame-invariant');
  const causalClass = document.querySelector('#frame-causal-class');
  const order = document.querySelector('#frame-order');
  const causalNote = document.querySelector('#frame-causal-note');

  if (!stage || !scenarioTitle || !eventA || !eventB) return;

  const BASE_STAGE_GRID = [
    'repeating-linear-gradient(to bottom, rgba(132,232,255,0.08) 0 1px, transparent 1px 44px)',
    'linear-gradient(90deg, rgba(111,59,209,0.08), transparent 38% 62%, rgba(209,104,255,0.08))'
  ];

  const CAUSAL_STAGE_FIELDS = Object.freeze({
    spacelike: [
      'radial-gradient(circle at 25% 50%, rgba(132,232,255,0.16) 0 6%, transparent 22%)',
      'radial-gradient(circle at 75% 50%, rgba(209,104,255,0.16) 0 6%, transparent 22%)',
      ...BASE_STAGE_GRID
    ],
    lightlike: [
      'linear-gradient(135deg, transparent 46%, rgba(132,232,255,0.06) 47%, rgba(132,232,255,0.24) 49.5% 50.5%, rgba(132,232,255,0.06) 53%, transparent 54%)',
      ...BASE_STAGE_GRID
    ],
    timelike: [
      'linear-gradient(90deg, transparent 42%, rgba(209,104,255,0.05) 42%, rgba(209,104,255,0.16) 48% 52%, rgba(209,104,255,0.05) 58%, transparent 58%)',
      ...BASE_STAGE_GRID
    ]
  });

  let scenarioId = 'distant-flashes';
  let beta = 0;

  function selectButton(buttons, activeButton) {
    for (const button of buttons) {
      const active = button === activeButton;
      button.dataset.active = String(active);
      button.setAttribute('aria-pressed', String(active));
    }
  }

  function buildCausalCompass() {
    const readout = document.querySelector('.frame-readout');
    const metrics = document.querySelector('.frame-metrics');
    if (!readout || !metrics || document.getElementById('frame-causal-compass')) return;

    const shell = document.createElement('section');
    shell.id = 'frame-causal-compass';
    shell.className = 'frame-causal-compass';
    shell.setAttribute('aria-labelledby', 'frame-causal-compass-title');

    const heading = document.createElement('div');
    heading.className = 'frame-causal-compass-head';

    const kicker = document.createElement('p');
    kicker.className = 'frame-control-label';
    kicker.textContent = 'CAUSAL COMPASS · INVARIANT CLASS';

    const title = document.createElement('h3');
    title.id = 'frame-causal-compass-title';
    title.textContent = 'Changing frame moves the coordinates, not the causal region.';

    const note = document.createElement('p');
    note.textContent = 'This is a categorical map, not a scaled spacetime diagram. The invariant interval decides which region the selected event pair occupies.';

    heading.append(kicker, title, note);

    const map = document.createElement('ol');
    map.className = 'frame-causal-compass-map';
    map.setAttribute('aria-label', 'Three invariant causal classes');

    const classes = [
      ['spacelike', 'SPACELIKE', 'No light-speed-or-slower route'],
      ['lightlike', 'LIGHTLIKE', 'Light-speed route'],
      ['timelike', 'TIMELIKE', 'Slower-than-light route possible']
    ];

    for (const [id, label, description] of classes) {
      const item = document.createElement('li');
      item.dataset.causalRegion = id;

      const marker = document.createElement('span');
      marker.className = 'frame-causal-compass-marker';
      marker.setAttribute('aria-hidden', 'true');
      marker.textContent = '●';

      const copy = document.createElement('span');
      const strong = document.createElement('strong');
      strong.textContent = label;
      const small = document.createElement('small');
      small.textContent = description;
      copy.append(strong, small);

      item.append(marker, copy);
      map.append(item);
    }

    shell.append(heading, map);
    metrics.insertAdjacentElement('afterend', shell);
  }

  function renderCausalCompass(kind) {
    const items = [...document.querySelectorAll('[data-causal-region]')];
    for (const item of items) {
      const active = item.dataset.causalRegion === kind;
      item.dataset.active = String(active);
      if (active) item.setAttribute('aria-current', 'true');
      else item.removeAttribute('aria-current');
    }
  }

  function renderCausalField(kind) {
    const layers = CAUSAL_STAGE_FIELDS[kind] || CAUSAL_STAGE_FIELDS.spacelike;
    stage.style.backgroundImage = layers.join(', ');
    stage.dataset.causalField = kind;
  }

  function render() {
    const state = core.frameState(scenarioId, beta);
    if (!state) return;

    scenarioTitle.textContent = state.scenario.label;
    scenarioNote.textContent = state.scenario.note;
    eventA.textContent = state.scenario.eventA;
    eventB.textContent = state.scenario.eventB;
    frameName.textContent = `${state.frame.label} · ${state.frame.detail}`;
    deltaTime.textContent = state.formattedDeltaT;
    deltaSpace.textContent = state.formattedDeltaX;
    invariant.textContent = state.formattedInvariant;
    causalClass.textContent = state.causalClass.toUpperCase();
    order.textContent = state.order;
    causalNote.textContent = state.causalNote;

    stage.dataset.causalClass = state.causalClass;
    stage.style.setProperty('--event-b-top', `${50 + state.visualOffsetPercent}%`);
    renderCausalField(state.causalClass);
    renderCausalCompass(state.causalClass);
  }

  for (const button of scenarioButtons) {
    button.addEventListener('click', () => {
      selectButton(scenarioButtons, button);
      scenarioId = button.dataset.spacetimeScenarioId;
      render();
    });
  }

  for (const button of frameButtons) {
    button.addEventListener('click', () => {
      const nextBeta = Number(button.dataset.frameBeta);
      if (!core.getFrame(nextBeta)) return;
      selectButton(frameButtons, button);
      beta = nextBeta;
      render();
    });
  }

  window.addEventListener('beforeprint', () => {
    stage.style.removeProperty('background-image');
  });
  window.addEventListener('afterprint', () => {
    renderCausalField(stage.dataset.causalClass || 'spacelike');
  });

  buildCausalCompass();
  render();
})();