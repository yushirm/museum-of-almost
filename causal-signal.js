(function attachCausalSignalView() {
  'use strict';

  const core = window.MuseumCausalSignalCore;
  if (!core) return;

  function make(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof text === 'string') node.textContent = text;
    return node;
  }

  function button(text, attributes) {
    const node = make('button', '', text);
    node.type = 'button';
    for (const [name, value] of Object.entries(attributes || {})) node.setAttribute(name, value);
    return node;
  }

  function buildStation(station, left, top, initialRoute) {
    const article = make('article', 'causal-station');
    article.dataset.causalStationId = station.id;
    article.dataset.routeState = initialRoute ? 'route' : 'idle';
    article.style.setProperty('--station-left', left);
    article.style.setProperty('--station-top', top);
    article.append(
      make('strong', '', station.label),
      make('span', 'causal-coordinate', `x ${station.x > 0 ? '+' : ''}${station.x} · t ${station.t > 0 ? '+' : ''}${station.t}`)
    );
    const state = make('span', '', station.id === 'origin' ? 'DISPATCH POINT' : 'WAITING');
    state.dataset.causalStationState = '';
    article.append(state);
    return article;
  }

  function mount() {
    if (document.getElementById('causal-signal-title')) return;
    const closing = document.querySelector('.cosmos-section[aria-labelledby="closing-title"]');
    if (!closing || !closing.parentNode) return;

    const section = make('section', 'cosmos-section');
    section.setAttribute('aria-labelledby', 'causal-signal-title');

    const heading = make('div', 'section-heading');
    heading.append(
      make('p', 'eyebrow', 'INSTRUMENT 07 · THE CAUSAL SIGNAL BOX / THE BUTTON CANNOT REACH EVERYTHING')
    );
    const title = make('h2', '', 'The page stops pretending a click has infinite reach.');
    title.id = 'causal-signal-title';
    heading.append(
      title,
      make('p', '', 'Choose a fixed route through an idealized spacetime signal box, then throw the lever. The click may update only the future-directed route prefix that can be traversed at or below light speed. A spacelike or past target stays unchanged and says why.')
    );

    const shell = make('div', 'causal-signal-box');
    const controls = make('div', 'causal-route-controls');
    controls.setAttribute('role', 'group');
    controls.setAttribute('aria-label', 'Choose a causal signal route');
    for (const [index, route] of core.ROUTES.entries()) {
      const routeButton = button(route.label, {
        'data-causal-route-id': route.id,
        'data-active': index === 0 ? 'true' : 'false',
        'aria-pressed': index === 0 ? 'true' : 'false'
      });
      controls.append(routeButton);
    }

    const layout = make('div', 'causal-signal-layout');
    const stagePanel = make('section', 'causal-stage-panel');
    stagePanel.setAttribute('aria-labelledby', 'causal-stage-title');
    const stageHead = make('div', 'causal-stage-head');
    const stageTitle = make('h3', '', 'Spacetime interlocking');
    stageTitle.id = 'causal-stage-title';
    stageHead.append(stageTitle, make('span', '', 'time increases downward · x is in light-seconds'));

    const stage = make('div', 'causal-stage');
    stage.setAttribute('aria-label', 'Schematic spacetime station field');
    const axisTime = make('span', 'causal-axis-time');
    const axisSpace = make('span', 'causal-axis-space');
    const rayRight = make('span', 'causal-cone-ray');
    const rayLeft = make('span', 'causal-cone-ray');
    for (const decorative of [axisTime, axisSpace, rayRight, rayLeft]) decorative.setAttribute('aria-hidden', 'true');
    rayRight.dataset.ray = 'right';
    rayLeft.dataset.ray = 'left';
    stage.append(axisTime, axisSpace, rayRight, rayLeft);

    const positions = Object.freeze({
      before: ['30%', '10%'],
      origin: ['50%', '24%'],
      relay: ['40%', '43%'],
      edge: ['70%', '43%'],
      far: ['88%', '62%'],
      deep: ['70%', '88%']
    });
    for (const station of core.STATIONS) {
      const [left, top] = positions[station.id];
      stage.append(buildStation(station, left, top, station.id === 'origin' || station.id === 'edge'));
    }

    stagePanel.append(
      stageHead,
      stage,
      make('p', 'causal-coordinate-note', 'The stage is schematic. Exact coordinates and the segment ledger are authoritative; the drawn cone is orientation, not a measuring device.')
    );

    const readout = make('section', 'causal-readout');
    const readoutHead = make('div', 'causal-readout-head');
    readoutHead.append(make('h3', '', 'Route ledger'), make('span', '', 'c = 1'));
    const routeCopy = make('div', 'causal-route-copy');
    routeCopy.append(make('p', 'frame-control-label', 'Selected route'));
    const routeTitle = make('h3', '', 'Light edge');
    routeTitle.id = 'causal-route-title';
    const routeSummary = make('p', '', 'ORIGIN → EDGE. The signal reaches the boundary only at light speed.');
    routeSummary.id = 'causal-route-summary';
    routeCopy.append(routeTitle, routeSummary);

    const segments = make('ul', 'causal-segment-list');
    segments.id = 'causal-route-segments';
    const outcome = make('p', 'causal-outcome', 'READY — no signal has been sent. A click may update only the causally reachable prefix of the selected route.');
    outcome.id = 'causal-outcome';
    outcome.dataset.outcome = 'ready';
    outcome.setAttribute('aria-live', 'polite');

    const actions = make('div', 'causal-actions');
    const dispatch = button('Throw route lever');
    dispatch.id = 'causal-dispatch';
    const reset = button('Reset signal box');
    reset.id = 'causal-reset';
    reset.disabled = true;
    actions.append(dispatch, reset);
    readout.append(readoutHead, routeCopy, segments, outcome, actions);
    layout.append(stagePanel, readout);

    const rule = make('p', 'causal-rule');
    const ruleStrong = make('strong', '', 'Interlock rule:');
    rule.append(ruleStrong, document.createTextNode(' for each segment, future-directed propagation is allowed only when Δt ≥ |Δx|. The JavaScript response is immediate; the lesson is which targets are allowed to change, not artificial waiting.'));

    shell.append(controls, layout, rule);
    section.append(heading, shell);
    closing.parentNode.insertBefore(section, closing);
  }

  mount();

  const routeButtons = [...document.querySelectorAll('[data-causal-route-id]')];
  const dispatchButton = document.getElementById('causal-dispatch');
  const resetButton = document.getElementById('causal-reset');
  const routeTitle = document.getElementById('causal-route-title');
  const routeSummary = document.getElementById('causal-route-summary');
  const routeSegments = document.getElementById('causal-route-segments');
  const outcome = document.getElementById('causal-outcome');
  const stations = [...document.querySelectorAll('[data-causal-station-id]')];

  if (!routeButtons.length || !dispatchButton || !resetButton || !routeTitle || !routeSummary || !routeSegments || !outcome || !stations.length) return;

  let activeRouteId = 'light-edge';
  let dispatched = false;

  function stationElement(id) {
    return stations.find((element) => element.dataset.causalStationId === id) || null;
  }

  function resetStationStates() {
    for (const station of stations) {
      station.dataset.routeState = 'idle';
      const state = station.querySelector('[data-causal-station-state]');
      if (state) state.textContent = station.dataset.causalStationId === 'origin' ? 'DISPATCH POINT' : 'WAITING';
    }
  }

  function renderRoute() {
    const evaluation = core.evaluateRoute(activeRouteId);
    if (!evaluation) return;

    for (const routeButton of routeButtons) {
      const active = routeButton.dataset.causalRouteId === activeRouteId;
      routeButton.dataset.active = String(active);
      routeButton.setAttribute('aria-pressed', String(active));
    }

    resetStationStates();
    for (const id of evaluation.stationIds) {
      const station = stationElement(id);
      if (station) station.dataset.routeState = 'route';
    }

    routeTitle.textContent = evaluation.label;
    routeSummary.textContent = evaluation.summary;
    routeSegments.replaceChildren();

    for (const segment of evaluation.segments) {
      const item = document.createElement('li');
      item.dataset.segmentClass = segment.causalClass;
      const path = make('strong', '', `${core.getStation(segment.fromId).label} → ${core.getStation(segment.toId).label}`);
      const detail = make('span', '', `Δt ${segment.deltaT >= 0 ? '+' : ''}${segment.deltaT} s · |Δx| ${segment.distance} light-s · ${segment.label}`);
      item.append(path, detail);
      routeSegments.append(item);
    }

    dispatched = false;
    dispatchButton.disabled = false;
    dispatchButton.textContent = 'Throw route lever';
    resetButton.disabled = true;
    outcome.dataset.outcome = 'ready';
    outcome.textContent = 'READY — no signal has been sent. A click may update only the causally reachable prefix of the selected route.';
  }

  function dispatch() {
    const evaluation = core.evaluateRoute(activeRouteId);
    if (!evaluation || dispatched) return;

    dispatched = true;

    for (const id of evaluation.reachedStationIds) {
      const station = stationElement(id);
      if (!station) continue;
      station.dataset.routeState = 'received';
      const state = station.querySelector('[data-causal-station-state]');
      if (state) state.textContent = 'RECEIVED';
    }

    if (evaluation.firstLocked) {
      const blockedStation = stationElement(evaluation.firstLocked.toId);
      if (blockedStation) {
        blockedStation.dataset.routeState = 'refused';
        const state = blockedStation.querySelector('[data-causal-station-state]');
        if (state) state.textContent = 'REFUSED';
      }
    }

    if (evaluation.outcome === 'delivered') {
      const finalStation = core.getStation(evaluation.stationIds[evaluation.stationIds.length - 1]);
      outcome.dataset.outcome = 'delivered';
      outcome.textContent = `DELIVERED — ${finalStation.label} changed because every route segment is future-directed and at or below light speed.`;
    } else if (evaluation.outcome === 'partial') {
      const reached = evaluation.reachedStationIds.map((id) => core.getStation(id).label).join(' → ');
      const blocked = core.getStation(evaluation.firstLocked.toId).label;
      outcome.dataset.outcome = 'partial';
      outcome.textContent = `PARTIAL — the signal reached ${reached}, then ${blocked} refused the update: ${evaluation.firstLocked.label}.`;
    } else {
      const blocked = core.getStation(evaluation.firstLocked.toId).label;
      outcome.dataset.outcome = 'refused';
      outcome.textContent = `REFUSED — ${blocked} did not change: ${evaluation.firstLocked.label}.`;
    }

    dispatchButton.disabled = true;
    dispatchButton.textContent = 'Signal spent';
    resetButton.disabled = false;
  }

  for (const routeButton of routeButtons) {
    routeButton.addEventListener('click', () => {
      activeRouteId = routeButton.dataset.causalRouteId;
      renderRoute();
    });
  }

  dispatchButton.addEventListener('click', dispatch);
  resetButton.addEventListener('click', renderRoute);

  renderRoute();
})();
