(function attachSameAnswerMachineView() {
  'use strict';

  const core = window.MuseumSameAnswerMachineCore;
  if (!core) return;

  const SVG_NS = 'http://www.w3.org/2000/svg';

  function make(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof text === 'string') node.textContent = text;
    return node;
  }

  function makeSvg(tag, className) {
    const node = document.createElementNS(SVG_NS, tag);
    if (className) node.setAttribute('class', className);
    return node;
  }

  function formatNumber(value, digits = 6) {
    return new Intl.NumberFormat('en', { maximumFractionDigits: digits }).format(value);
  }

  function curvePoints(historyId) {
    const samples = Array.from({ length: 41 }, (_, index) => index / 40);
    const history = core.sampleHistory(historyId, samples);
    if (!history) return '';
    return history.map(({ u, a }) => {
      const x = 8 + 84 * u;
      const y = 54 - 44 * ((a - core.A_EMIT) / (core.A_OBS - core.A_EMIT));
      return `${x.toFixed(3)},${y.toFixed(3)}`;
    }).join(' ');
  }

  function mount() {
    if (document.getElementById('same-answer-title')) return;
    const closing = document.querySelector('.cosmos-section[aria-labelledby="closing-title"]');
    if (!closing || !closing.parentNode) return;

    const section = make('section', 'cosmos-section same-answer-section');
    section.setAttribute('aria-labelledby', 'same-answer-title');

    const heading = make('div', 'section-heading');
    heading.append(make('p', 'eyebrow', 'INSTRUMENT 11 · THE SAME ANSWER MACHINE / THREE HISTORIES, ONE REDSHIFT'));
    const title = make('h2', '', 'Change the history. The biggest answer refuses to move.');
    title.id = 'same-answer-title';
    heading.append(
      title,
      make('p', '', 'Choose one of three fixed toy expansion histories. Every choice begins at a = 0.5 and ends at a = 1, so every choice keeps the same endpoint redshift. What changes is the dimensionless path integral through the history.')
    );

    const shell = make('div', 'same-answer-shell');

    const controls = make('div', 'same-answer-controls');
    controls.setAttribute('role', 'group');
    controls.setAttribute('aria-label', 'Choose a fixed toy expansion history');
    for (const [index, history] of core.HISTORIES.entries()) {
      const button = make('button', '', history.label);
      button.type = 'button';
      button.dataset.sameAnswerHistory = history.id;
      button.dataset.active = String(index === 0);
      button.setAttribute('aria-pressed', String(index === 0));
      controls.append(button);
    }

    const invariant = make('section', 'same-answer-invariant');
    invariant.setAttribute('aria-labelledby', 'same-answer-invariant-title');
    const invariantLabel = make('h3', '', 'Endpoint redshift');
    invariantLabel.id = 'same-answer-invariant-title';
    const invariantValue = make('strong', 'same-answer-invariant-value', 'z = 1');
    invariantValue.dataset.sameAnswerInvariant = '';
    invariant.append(
      invariantLabel,
      invariantValue,
      make('p', 'same-answer-invariant-stamp', 'UNCHANGED BY HISTORY SELECTION'),
      make('p', 'same-answer-invariant-equation', '1 + z = aobs / aemit = 1 / 0.5 = 2')
    );

    const layout = make('div', 'same-answer-layout');

    const chartPanel = make('section', 'same-answer-chart-panel');
    chartPanel.setAttribute('aria-labelledby', 'same-answer-chart-title');
    const chartHead = make('div', 'same-answer-panel-head');
    const chartTitle = make('h3', '', 'Three paths between the same endpoints');
    chartTitle.id = 'same-answer-chart-title';
    chartHead.append(chartTitle, make('span', '', 'schematic a(u), all endpoints fixed'));

    const chart = makeSvg('svg', 'same-answer-chart');
    chart.setAttribute('viewBox', '0 0 100 64');
    chart.setAttribute('preserveAspectRatio', 'none');
    chart.setAttribute('aria-hidden', 'true');

    const axisX = makeSvg('line', 'same-answer-axis');
    axisX.setAttribute('x1', '8');
    axisX.setAttribute('x2', '92');
    axisX.setAttribute('y1', '54');
    axisX.setAttribute('y2', '54');
    const axisY = makeSvg('line', 'same-answer-axis');
    axisY.setAttribute('x1', '8');
    axisY.setAttribute('x2', '8');
    axisY.setAttribute('y1', '10');
    axisY.setAttribute('y2', '54');
    chart.append(axisX, axisY);

    const curveNodes = new Map();
    for (const [index, history] of core.HISTORIES.entries()) {
      const polyline = makeSvg('polyline', 'same-answer-curve');
      polyline.dataset.historyId = history.id;
      polyline.dataset.active = String(index === 0);
      polyline.setAttribute('points', curvePoints(history.id));
      polyline.setAttribute('fill', 'none');
      chart.append(polyline);
      curveNodes.set(history.id, polyline);
    }

    for (const [x, y] of [[8, 54], [92, 10]]) {
      const endpoint = makeSvg('circle', 'same-answer-endpoint');
      endpoint.setAttribute('cx', String(x));
      endpoint.setAttribute('cy', String(y));
      endpoint.setAttribute('r', '1.6');
      chart.append(endpoint);
    }

    const chartLabels = make('div', 'same-answer-chart-labels');
    chartLabels.append(
      make('span', '', 'u = 0 · a = 0.5'),
      make('span', '', 'u = 1 · a = 1')
    );

    const legend = make('ul', 'same-answer-legend');
    for (const history of core.HISTORIES) {
      const item = document.createElement('li');
      item.dataset.historyId = history.id;
      item.dataset.active = String(history.id === core.HISTORIES[0].id);
      item.append(make('strong', '', history.label), make('span', '', history.formula));
      legend.append(item);
    }

    const chartNote = make('p', 'same-answer-chart-note', 'The horizontal axis is normalized toy time u, not seconds or years. The vertical axis is the normalized scale factor. The curves are exact functions drawn on a schematic screen; the chart is not a fitted history of our Universe.');
    chartPanel.append(chartHead, chart, chartLabels, legend, chartNote);

    const ledger = make('section', 'same-answer-ledger');
    ledger.setAttribute('aria-live', 'polite');
    const ledgerHead = make('div', 'same-answer-panel-head');
    ledgerHead.append(make('h3', '', 'History-dependent path ledger'), make('span', '', 'endpoint answer stays fixed'));
    const historyTitle = make('h3', 'same-answer-history-title', '');
    historyTitle.id = 'same-answer-history-title';
    const historyNote = make('p', 'same-answer-history-note', '');
    const formula = make('p', 'same-answer-formula', '');
    const integral = make('div', 'same-answer-integral');
    integral.append(make('span', '', 'Dimensionless path integral J'), make('strong', '', ''));
    const integralValue = integral.querySelector('strong');

    const tableWrap = make('div', 'same-answer-table-wrap');
    const table = make('table', 'same-answer-table');
    const caption = make('caption', '', 'Selected toy history sample values');
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.append(make('th', '', 'u'), make('th', '', 'a(u)'));
    thead.append(headerRow);
    const tbody = document.createElement('tbody');
    table.append(caption, thead, tbody);
    tableWrap.append(table);

    const boundary = make('div', 'same-answer-boundary');
    boundary.append(
      make('strong', '', 'WHAT THIS INTEGRAL REFUSES TO BECOME'),
      make('p', '', 'J = ∫du/a(u) is dimensionless because u is a normalized toy coordinate. It is not a distance, lookback time, cosmic age, Hubble parameter, or fit to the real Universe. Turning a null-path integral into a physical cosmological distance requires a physical time scale and an expansion model that this instrument deliberately does not provide.')
    );

    const feedback = make('p', 'same-answer-feedback', '');
    feedback.id = 'same-answer-feedback';
    ledger.append(ledgerHead, historyTitle, historyNote, formula, integral, tableWrap, boundary, feedback);

    layout.append(chartPanel, ledger);
    shell.append(controls, invariant, layout);
    section.append(heading, shell);
    closing.parentNode.insertBefore(section, closing);

    const buttons = [...controls.querySelectorAll('[data-same-answer-history]')];
    const legendItems = [...legend.querySelectorAll('[data-history-id]')];

    function render(historyId) {
      const snap = core.snapshot(historyId);
      if (!snap) return;

      for (const button of buttons) {
        const active = button.dataset.sameAnswerHistory === historyId;
        button.dataset.active = String(active);
        button.setAttribute('aria-pressed', String(active));
      }
      for (const [id, curve] of curveNodes) curve.dataset.active = String(id === historyId);
      for (const item of legendItems) item.dataset.active = String(item.dataset.historyId === historyId);

      historyTitle.textContent = snap.label;
      historyNote.textContent = snap.note;
      formula.textContent = snap.formula;
      integralValue.textContent = `${snap.exactIntegral} ≈ ${formatNumber(snap.pathIntegral, 6)}`;

      tbody.replaceChildren();
      for (const sample of snap.samples) {
        const row = document.createElement('tr');
        row.append(make('td', '', formatNumber(sample.u, 2)), make('td', '', formatNumber(sample.a, 6)));
        tbody.append(row);
      }

      feedback.textContent = `${snap.label} selected. The endpoint redshift is still z = ${formatNumber(snap.redshift, 3)}. Only the history curve and dimensionless path integral changed.`;
    }

    for (const button of buttons) {
      button.addEventListener('click', () => render(button.dataset.sameAnswerHistory));
    }

    render(core.HISTORIES[0].id);
  }

  mount();
})();
