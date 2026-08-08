(function attachIsolationBoardView(root) {
  'use strict';

  const core = root.MuseumIsolationBoardCore;
  const document = root.document;
  if (!core || !document) return;

  const SNAPSHOT_EVENT = 'museum:commons-snapshot';
  let snapshot = root.MuseumCommonsSnapshot || null;
  let tripped = new Set();

  installStylesheet();
  const ui = mount();
  render();

  document.addEventListener(SNAPSHOT_EVENT, (event) => {
    snapshot = event.detail?.snapshot || root.MuseumCommonsSnapshot || null;
    tripped = new Set();
    render();
  });

  function installStylesheet() {
    if (document.querySelector('link[data-isolation-board-styles]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './isolation-board.css';
    link.dataset.isolationBoardStyles = 'true';
    document.head.append(link);
  }

  function mount() {
    if (!document.querySelector('#isolation-board')) {
      const anchor = document.querySelector('#witness-seal') || document.querySelector('#faultline-core') || document.querySelector('#sounding-well');
      if (anchor?.parentNode) {
        const section = document.createElement('section');
        section.id = 'isolation-board';
        section.className = 'isolation-board-section';
        section.setAttribute('aria-labelledby', 'isolation-board-title');
        section.innerHTML = `
          <div class="isolation-board-heading">
            <p class="eyebrow">THE ISOLATION BOARD / WHAT SURVIVES A LOST FEED</p>
            <h2 id="isolation-board-title">Make the page know less on purpose.</h2>
            <p>Borrowed from fault-isolation panels: trip any live feed below and this parallel board shows what COMMONS / NOW could still honestly support if that channel disappeared. The real latched snapshot remains untouched.</p>
          </div>
          <div class="isolation-console" data-simulation="idle">
            <div class="isolation-breaker-bank">
              <div class="isolation-bank-heading">
                <div>
                  <span>FIVE-FEED BUS</span>
                  <strong>SIMULATED ISOLATION ONLY</strong>
                </div>
                <button id="isolation-reset" type="button" disabled>Restore simulated feeds</button>
              </div>
              <ol id="isolation-breakers" class="isolation-breakers" aria-label="Simulated feed isolation breakers"></ol>
              <p class="isolation-safety"><strong>Nothing here cancels or repeats a request.</strong> A tripped breaker masks one already-latched channel only inside this hypothetical board. An actual unavailable feed is labeled separately and cannot be switched back on here. “Powered” means declared feed dependencies remain; it does not guarantee every downstream value or source timestamp is valid.</p>
            </div>
            <div class="isolation-readout">
              <div class="isolation-summary">
                <span>FAILURE SIMULATION</span>
                <strong id="isolation-summary-count">WAITING</strong>
                <p id="isolation-status" role="status" aria-live="polite">Waiting for a real latched snapshot.</p>
              </div>
              <ol id="isolation-circuits" class="isolation-circuits" aria-label="Commons circuits under simulated feed loss"></ol>
            </div>
          </div>
          <div class="isolation-key" aria-label="Isolation Board state key">
            <span><i data-state="powered"></i> powered</span>
            <span><i data-state="degraded"></i> degraded</span>
            <span><i data-state="dark"></i> dark</span>
            <span><i data-state="local"></i> local derivation survives</span>
            <span><i data-state="actual"></i> actual evidence path untouched</span>
          </div>
          <p class="isolation-note"><strong>A simulation is not a source failure.</strong> Refreshing the world clears every hypothetical trip. The Witness Seal is outside this simulation and is never recomputed from the imagined blackout; its own instrument remains authoritative about whether a seal was actually available.</p>
        `;
        anchor.insertAdjacentElement('afterend', section);
      }
    }

    const mounted = {
      console: document.querySelector('.isolation-console'),
      breakers: document.querySelector('#isolation-breakers'),
      circuits: document.querySelector('#isolation-circuits'),
      reset: document.querySelector('#isolation-reset'),
      summary: document.querySelector('#isolation-summary-count'),
      status: document.querySelector('#isolation-status')
    };
    mounted.reset?.addEventListener('click', () => {
      tripped = new Set();
      render();
    });
    return mounted;
  }

  function render() {
    const result = core.evaluateBoard(snapshot, tripped);
    root.MuseumIsolationSimulation = Object.freeze({
      receivedAt: result.hasLatch ? new Date(snapshot.receivedAt).toISOString() : null,
      tripped: Object.freeze([...tripped].sort()),
      counts: Object.freeze({ ...result.counts })
    });

    if (ui.console) ui.console.dataset.simulation = result.trippedCount > 0 ? 'active' : result.hasLatch ? 'idle' : 'waiting';
    if (ui.reset) ui.reset.disabled = result.trippedCount === 0;
    if (ui.summary) {
      ui.summary.textContent = result.hasLatch
        ? `${result.liveCount} LIVE · ${result.trippedCount} TRIPPED · ${result.unavailableCount} ACTUAL OUT`
        : 'WAITING';
    }
    if (ui.status) ui.status.textContent = core.stateSentence(result);

    renderBreakers(result);
    renderCircuits(result);
  }

  function renderBreakers(result) {
    if (!ui.breakers) return;
    ui.breakers.replaceChildren();

    for (const feed of result.feeds) {
      const item = document.createElement('li');
      item.className = 'isolation-breaker';
      item.dataset.state = feed.state;

      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.feed = feed.id;
      button.dataset.state = feed.state;
      button.disabled = feed.state === 'unavailable' || feed.state === 'waiting';
      button.setAttribute('aria-pressed', String(feed.state === 'tripped'));
      button.setAttribute('aria-label', breakerAria(feed));
      button.addEventListener('click', () => toggle(feed.id));

      const source = document.createElement('small');
      source.textContent = feed.source;
      const label = document.createElement('strong');
      label.textContent = feed.label;
      const state = document.createElement('span');
      state.textContent = breakerStateLabel(feed.state);
      const detail = document.createElement('em');
      detail.textContent = feed.detail;

      button.append(source, label, state, detail);
      item.append(button);
      ui.breakers.append(item);
    }
  }

  function renderCircuits(result) {
    if (!ui.circuits) return;
    ui.circuits.replaceChildren();

    for (const circuit of result.circuits) {
      const item = document.createElement('li');
      item.className = 'isolation-circuit';
      item.dataset.state = circuit.state;

      const head = document.createElement('div');
      const label = document.createElement('strong');
      label.textContent = circuit.label;
      const state = document.createElement('span');
      state.textContent = circuit.state.toUpperCase();
      head.append(label, state);

      const detail = document.createElement('p');
      detail.textContent = circuit.detail;
      const dependency = document.createElement('small');
      dependency.textContent = dependencySentence(circuit);

      item.append(head, detail, dependency);
      ui.circuits.append(item);
    }
  }

  function toggle(id) {
    const availability = core.availabilityFromSnapshot(snapshot);
    if (availability[id] !== true) return;
    const next = new Set(tripped);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    tripped = next;
    render();
  }

  function breakerStateLabel(state) {
    if (state === 'live') return 'LIVE · TRIP';
    if (state === 'tripped') return 'TRIPPED · RESTORE';
    if (state === 'unavailable') return 'ACTUALLY UNAVAILABLE';
    return 'WAITING FOR LATCH';
  }

  function breakerAria(feed) {
    if (feed.state === 'live') return `${feed.source} ${feed.label} is live. Trip this feed in the local failure simulation.`;
    if (feed.state === 'tripped') return `${feed.source} ${feed.label} is deliberately tripped in the local failure simulation. Restore it.`;
    if (feed.state === 'unavailable') return `${feed.source} ${feed.label} is actually unavailable in the current latch; simulation control disabled.`;
    return `${feed.source} ${feed.label} is waiting for a current latch.`;
  }

  function dependencySentence(circuit) {
    if (circuit.state === 'waiting') return 'No real latch is available yet.';
    if (circuit.mode === 'local') return 'Uses the captured latch time and fixed local geometry; no live feed dependency remains after capture.';
    if (circuit.mode === 'actual') return 'Outside the hypothetical bus. See the actual Witness Seal instrument for its real availability and digest state.';

    const names = new Map(core.FEEDS.map((feed) => [feed.id, `${feed.source} ${feed.label}`]));
    const causes = [];
    if (circuit.tripped.length) causes.push(`simulated off: ${circuit.tripped.map((id) => names.get(id)).join(', ')}`);
    if (circuit.unavailable.length) causes.push(`actually unavailable: ${circuit.unavailable.map((id) => names.get(id)).join(', ')}`);
    const requirement = circuit.mode === 'any' ? 'can degrade with a subset' : 'requires this feed';
    return causes.length
      ? `${circuit.active}/${circuit.total} dependencies remain · ${requirement} · ${causes.join(' · ')}`
      : `${circuit.active}/${circuit.total} dependencies remain · ${requirement}`;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
