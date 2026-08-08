(function attachUnequalMinuteView() {
  'use strict';

  const core = window.MuseumUnequalMinuteCore;
  if (!core) return;

  function make(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof text === 'string') node.textContent = text;
    return node;
  }

  function formatNumber(value, digits = 6) {
    return new Intl.NumberFormat('en', {
      minimumFractionDigits: 0,
      maximumFractionDigits: digits
    }).format(value);
  }

  function mount() {
    if (document.getElementById('unequal-minute-title')) return;
    const closing = document.querySelector('.cosmos-section[aria-labelledby="closing-title"]');
    if (!closing || !closing.parentNode) return;

    const section = make('section', 'cosmos-section unequal-minute-section');
    section.setAttribute('aria-labelledby', 'unequal-minute-title');

    const heading = make('div', 'section-heading');
    heading.append(make('p', 'eyebrow', 'INSTRUMENT 12 · THE UNEQUAL MINUTE / ONE COMMAND, FOUR CLOCKS'));
    const title = make('h2', '', 'Press once. Four clocks disagree about how much time passed.');
    title.id = 'unequal-minute-title';
    heading.append(
      title,
      make('p', '', 'A fixed Schwarzschild-coordinate step is broadcast to four idealized stationary observers outside one normalized event horizon. The command is shared. The accumulated proper time is not.')
    );

    const shell = make('div', 'unequal-minute-shell');

    const consolePanel = make('section', 'unequal-minute-console');
    consolePanel.setAttribute('aria-labelledby', 'unequal-minute-console-title');
    const consoleTitle = make('h3', '', 'Coordinate-time command');
    consoleTitle.id = 'unequal-minute-console-title';

    const commandButton = make('button', 'unequal-minute-command', 'ADVANCE 60 s AT INFINITY');
    commandButton.type = 'button';
    commandButton.dataset.unequalMinuteStep = '';
    commandButton.setAttribute('aria-describedby', 'unequal-minute-command-note');

    const commandNote = make('p', 'unequal-minute-command-note', 'One press advances the Schwarzschild coordinate time t by exactly 60 seconds. In this idealized exterior coordinate system, t matches the proper-time rate of a stationary observer asymptotically far from the mass.');
    commandNote.id = 'unequal-minute-command-note';

    const stamp = make('p', 'unequal-minute-stamp', 'SAME COMMAND ≠ SAME PROPER TIME');

    const commandReadout = make('div', 'unequal-minute-command-readout');
    const stepLabel = make('span', '', 'COMMANDS ISSUED');
    const stepValue = make('strong', '', '0');
    stepValue.dataset.unequalMinuteStepCount = '';
    const coordinateLabel = make('span', '', 'COORDINATE TIME t');
    const coordinateValue = make('strong', '', '0 s');
    coordinateValue.dataset.unequalMinuteCoordinate = '';
    commandReadout.append(stepLabel, stepValue, coordinateLabel, coordinateValue);

    consolePanel.append(consoleTitle, commandButton, commandNote, stamp, commandReadout);

    const formulaPanel = make('aside', 'unequal-minute-formula');
    formulaPanel.setAttribute('aria-labelledby', 'unequal-minute-formula-title');
    const formulaTitle = make('h3', '', 'Stationary Schwarzschild lapse');
    formulaTitle.id = 'unequal-minute-formula-title';
    formulaPanel.append(
      formulaTitle,
      make('p', 'unequal-minute-equation', 'Δτ = Δt √(1 − rₛ/r)'),
      make('p', '', 'This relation applies here only to stationary observers held at fixed Schwarzschild radius r outside the horizon. The cards are hovering worldlines, not freely falling clocks.')
    );

    const top = make('div', 'unequal-minute-top');
    top.append(consolePanel, formulaPanel);

    const stationGrid = make('div', 'unequal-minute-stations');
    stationGrid.setAttribute('aria-label', 'Four fixed hovering clock stations');
    const stationNodes = new Map();

    for (const station of core.STATIONS) {
      const initial = core.reading(station.id, 0);
      const card = make('article', 'unequal-minute-station');
      card.dataset.stationId = station.id;

      const cardHead = make('header', 'unequal-minute-station-head');
      cardHead.append(make('p', 'instrument-label', station.label), make('h3', '', station.radiusText));

      const track = make('div', 'unequal-minute-track');
      track.setAttribute('aria-hidden', 'true');
      const fill = make('span', 'unequal-minute-track-fill');
      fill.style.setProperty('--unequal-minute-lapse', String(initial.lapseFactor));
      track.append(fill);

      const trackNote = make('p', 'unequal-minute-track-note', `${formatNumber(initial.lapseFactor * 100, 3)}% of each coordinate-time command accumulates as proper time on this hovering clock.`);

      const metrics = make('dl', 'unequal-minute-metrics');
      const lapseTerm = make('dt', '', 'Lapse factor');
      const lapseValue = make('dd', '', `${station.exactLapse} ≈ ${formatNumber(initial.lapseFactor, 6)}`);
      const stepTerm = make('dt', '', 'Proper time per command');
      const stepValueLocal = make('dd', '', `${station.exactStep} ≈ ${formatNumber(initial.properStepSeconds, 6)} s`);
      const totalTerm = make('dt', '', 'Accumulated proper time');
      const totalValue = make('dd', 'unequal-minute-total', '0 s');
      totalValue.dataset.unequalMinuteTotal = station.id;
      metrics.append(lapseTerm, lapseValue, stepTerm, stepValueLocal, totalTerm, totalValue);

      card.append(cardHead, track, trackNote, metrics, make('p', 'unequal-minute-station-note', station.note));
      stationGrid.append(card);
      stationNodes.set(station.id, totalValue);
    }

    const ledger = make('section', 'unequal-minute-ledger');
    ledger.setAttribute('aria-labelledby', 'unequal-minute-ledger-title');
    const ledgerTitle = make('h3', '', 'Exact clock ledger');
    ledgerTitle.id = 'unequal-minute-ledger-title';
    const tableWrap = make('div', 'unequal-minute-table-wrap');
    const table = make('table', 'unequal-minute-table');
    const caption = make('caption', '', 'Proper-time readings for the four fixed hovering stations');
    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    headRow.append(
      make('th', '', 'Station'),
      make('th', '', 'Radius'),
      make('th', '', 'Lapse'),
      make('th', '', 'Per 60 s command'),
      make('th', '', 'Total proper time')
    );
    thead.append(headRow);
    const tbody = document.createElement('tbody');
    const rowTotals = new Map();
    for (const station of core.STATIONS) {
      const initial = core.reading(station.id, 0);
      const row = document.createElement('tr');
      const total = make('td', '', '0 s');
      total.dataset.unequalMinuteTableTotal = station.id;
      row.append(
        make('th', '', station.label),
        make('td', '', station.radiusText),
        make('td', '', `${station.exactLapse} ≈ ${formatNumber(initial.lapseFactor, 6)}`),
        make('td', '', `${formatNumber(initial.properStepSeconds, 6)} s`),
        total
      );
      tbody.append(row);
      rowTotals.set(station.id, total);
    }
    table.append(caption, thead, tbody);
    tableWrap.append(table);

    const boundary = make('div', 'unequal-minute-boundary');
    boundary.append(
      make('strong', '', 'WHAT THIS CLOCK ROOM REFUSES TO SAY'),
      make('p', '', 'No clock is placed at r = rₛ. A stationary observer arbitrarily close to the Schwarzschild horizon requires arbitrarily large proper acceleration, so the horizon is not treated as an ordinary hovering station. This instrument does not model free fall, the black-hole interior, what a distant telescope literally sees, orbital dynamics, tidal forces, Hawking radiation, or any real black hole.')
    );

    const live = make('p', 'unequal-minute-live', 'No command issued yet. All four accumulated proper-time readings are zero.');
    live.setAttribute('aria-live', 'polite');
    live.setAttribute('aria-atomic', 'true');

    ledger.append(ledgerTitle, tableWrap, boundary, live);
    shell.append(top, stationGrid, ledger);
    section.append(heading, shell);
    closing.parentNode.insertBefore(section, closing);

    let stepCount = 0;

    function render() {
      const snap = core.snapshot(stepCount);
      if (!snap) return;
      stepValue.textContent = String(snap.stepCount);
      coordinateValue.textContent = `${formatNumber(snap.coordinateElapsedSeconds, 0)} s`;

      for (const reading of snap.readings) {
        const text = `${formatNumber(reading.properElapsedSeconds, 6)} s`;
        stationNodes.get(reading.id).textContent = text;
        rowTotals.get(reading.id).textContent = text;
      }

      if (snap.stepCount === 0) {
        live.textContent = 'No command issued yet. All four accumulated proper-time readings are zero.';
        return;
      }

      const nearest = snap.readings[0];
      const farthest = snap.readings.at(-1);
      live.textContent = `Command ${snap.stepCount} recorded. Coordinate time is ${formatNumber(snap.coordinateElapsedSeconds, 0)} seconds. The nearest offered hovering clock reads ${formatNumber(nearest.properElapsedSeconds, 6)} seconds; the farthest offered clock reads ${formatNumber(farthest.properElapsedSeconds, 6)} seconds. Same command, unequal proper time.`;
    }

    commandButton.addEventListener('click', () => {
      if (stepCount >= Number.MAX_SAFE_INTEGER) return;
      stepCount += 1;
      render();
    });

    render();
  }

  mount();
})();
