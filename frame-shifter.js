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

  let scenarioId = 'distant-flashes';
  let beta = 0;

  function selectButton(buttons, activeButton) {
    for (const button of buttons) {
      const active = button === activeButton;
      button.dataset.active = String(active);
      button.setAttribute('aria-pressed', String(active));
    }
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

  render();
})();
