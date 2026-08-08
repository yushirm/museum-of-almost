(function attachOriginMachineView() {
  'use strict';

  const core = window.MuseumOriginMachineCore;
  if (!core) return;

  function make(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof text === 'string') node.textContent = text;
    return node;
  }

  function formatSigned(value) {
    if (Object.is(value, -0) || value === 0) return '0';
    const magnitude = Number.isInteger(Math.abs(value)) ? String(Math.abs(value)) : Math.abs(value).toFixed(1);
    return `${value > 0 ? '+' : '−'}${magnitude}`;
  }

  function formatUnsigned(value) {
    return Number.isInteger(value) ? String(value) : value.toFixed(1);
  }

  function mount() {
    if (document.getElementById('origin-machine-title')) return;
    const closing = document.querySelector('.cosmos-section[aria-labelledby="closing-title"]');
    if (!closing || !closing.parentNode) return;

    const section = make('section', 'cosmos-section origin-machine-section');
    section.setAttribute('aria-labelledby', 'origin-machine-title');

    const heading = make('div', 'section-heading');
    heading.append(make('p', 'eyebrow', 'INSTRUMENT 10 · THE ORIGIN MACHINE / EVERY POINT GETS TO BE ZERO'));
    const title = make('h2', '', 'The page refuses to keep one permanent center.');
    title.id = 'origin-machine-title';
    heading.append(
      title,
      make('p', '', 'Choose any fixed comoving marker as coordinate zero, then choose a normalized scale factor. The selected marker moves to the middle of the instrument while every exact relative coordinate is recalculated from the same unchanged marker record.')
    );

    const shell = make('div', 'origin-machine-shell');
    const controlGrid = make('div', 'origin-machine-control-grid');

    const observerField = make('fieldset', 'origin-machine-fieldset');
    observerField.append(make('legend', '', 'Choose coordinate origin'));
    const observerButtons = make('div', 'origin-machine-buttons');
    for (const [index, marker] of core.MARKERS.entries()) {
      const button = make('button', '', marker.label);
      button.type = 'button';
      button.dataset.originMarkerId = marker.id;
      button.dataset.active = String(index === 2);
      button.setAttribute('aria-pressed', String(index === 2));
      observerButtons.append(button);
    }
    observerField.append(observerButtons);

    const scaleField = make('fieldset', 'origin-machine-fieldset');
    scaleField.append(make('legend', '', 'Choose normalized scale factor a'));
    const scaleButtons = make('div', 'origin-machine-buttons origin-machine-scale-buttons');
    for (const factor of core.SCALE_FACTORS) {
      const button = make('button', '', `a = ${factor}`);
      button.type = 'button';
      button.dataset.originScaleFactor = String(factor);
      button.dataset.active = String(factor === 1);
      button.setAttribute('aria-pressed', String(factor === 1));
      scaleButtons.append(button);
    }
    scaleField.append(scaleButtons);
    controlGrid.append(observerField, scaleField);

    const layout = make('div', 'origin-machine-layout');
    const stagePanel = make('section', 'origin-machine-stage-panel');
    stagePanel.setAttribute('aria-labelledby', 'origin-machine-stage-title');
    const stageHead = make('div', 'origin-machine-stage-head');
    const stageTitle = make('h3', '', 'Centerless coordinate stage');
    stageTitle.id = 'origin-machine-stage-title';
    stageHead.append(stageTitle, make('span', '', 'selected marker is always x = 0'));

    const stage = make('div', 'origin-machine-stage');
    stage.tabIndex = 0;
    stage.setAttribute('aria-label', 'Schematic one-dimensional marker positions relative to the selected coordinate origin');
    const axis = make('div', 'origin-machine-axis');
    axis.append(
      make('span', 'origin-machine-axis-left', 'LEFT OF ORIGIN'),
      make('span', 'origin-machine-axis-zero', '0'),
      make('span', 'origin-machine-axis-right', 'RIGHT OF ORIGIN')
    );
    stage.append(axis);

    const markerNodes = new Map();
    for (const marker of core.MARKERS) {
      const markerNode = make('div', 'origin-machine-marker');
      markerNode.dataset.markerId = marker.id;
      markerNode.append(make('span', 'origin-machine-marker-dot', ''));
      markerNode.append(make('strong', '', marker.label));
      markerNode.append(make('span', 'origin-machine-marker-coordinate', '0'));
      stage.append(markerNode);
      markerNodes.set(marker.id, markerNode);
    }

    const stageNote = make('p', 'origin-machine-stage-note', 'Marker glyphs keep the same size. Only horizontal separation from the chosen origin carries the toy spatial coordinate. Vertical staggering is only label clearance and carries no second spatial coordinate. The finite five-marker window is not an edge, boundary, or center of the universe; exact values in the ledger are authoritative.');
    stagePanel.append(stageHead, stage, stageNote);

    const readout = make('section', 'origin-machine-readout');
    readout.setAttribute('aria-live', 'polite');
    const readoutHead = make('div', 'origin-machine-readout-head');
    readoutHead.append(make('h3', '', 'Relative-coordinate ledger'), make('span', '', 'flat 1D toy slice'));
    const summary = make('p', 'origin-machine-summary', '');
    summary.id = 'origin-machine-summary';

    const tableWrap = make('div', 'origin-machine-table-wrap');
    const table = make('table', 'origin-machine-table');
    const caption = make('caption', '', 'Fixed marker coordinates and recalculated coordinates relative to the selected origin');
    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    for (const label of ['Marker', 'Fixed χ', 'Relative x', 'Separation']) headRow.append(make('th', '', label));
    thead.append(headRow);
    const tbody = document.createElement('tbody');
    table.append(caption, thead, tbody);
    tableWrap.append(table);

    const equation = make('div', 'origin-machine-equation');
    equation.append(
      make('p', '', 'xrelative = a(χ − χobserver)'),
      make('p', '', 'D = a |χ − χobserver|')
    );

    const boundary = make('div', 'origin-machine-boundary');
    boundary.append(
      make('strong', '', 'WHAT THIS ORIGIN REFUSES TO CLAIM'),
      make('p', '', 'This is a flat one-dimensional homogeneous expansion toy. Choosing zero is a coordinate choice, not a claim that the selected marker is a privileged observer or a physical center. No Hubble constant, velocity, redshift, horizon, curvature, acceleration, distance to a real object, or causal visibility is inferred.')
    );
    readout.append(readoutHead, summary, tableWrap, equation, boundary);

    layout.append(stagePanel, readout);
    shell.append(controlGrid, layout);
    section.append(heading, shell);
    closing.parentNode.insertBefore(section, closing);

    const observerControlNodes = [...observerButtons.querySelectorAll('[data-origin-marker-id]')];
    const scaleControlNodes = [...scaleButtons.querySelectorAll('[data-origin-scale-factor]')];
    let observerId = 'c';
    let scaleFactor = 1;

    function render() {
      const snap = core.snapshot(observerId, scaleFactor);
      if (!snap) return;

      for (const button of observerControlNodes) {
        const active = button.dataset.originMarkerId === observerId;
        button.dataset.active = String(active);
        button.setAttribute('aria-pressed', String(active));
      }
      for (const button of scaleControlNodes) {
        const active = Number(button.dataset.originScaleFactor) === scaleFactor;
        button.dataset.active = String(active);
        button.setAttribute('aria-pressed', String(active));
      }

      summary.textContent = `${snap.observerLabel} is coordinate zero at fixed χ = ${snap.observerChi}. At a = ${snap.scaleFactor}, every displayed separation is the fixed comoving separation multiplied by the same scale factor.`;
      tbody.replaceChildren();

      for (const item of snap.markers) {
        const node = markerNodes.get(item.id);
        if (node) {
          node.dataset.origin = String(item.isOrigin);
          node.style.setProperty('--origin-position', `${item.visualPercent}%`);
          const coordinate = node.querySelector('.origin-machine-marker-coordinate');
          if (coordinate) coordinate.textContent = item.isOrigin ? 'ORIGIN · 0' : `x = ${formatSigned(item.relative)}`;
        }

        const row = document.createElement('tr');
        if (item.isOrigin) row.dataset.origin = 'true';
        const markerCell = make('th', '', item.isOrigin ? `${item.label} · ORIGIN` : item.label);
        markerCell.scope = 'row';
        row.append(
          markerCell,
          make('td', '', formatSigned(item.chi)),
          make('td', '', formatSigned(item.relative)),
          make('td', '', formatUnsigned(item.separation))
        );
        tbody.append(row);
      }
    }

    for (const button of observerControlNodes) {
      button.addEventListener('click', () => {
        observerId = button.dataset.originMarkerId;
        render();
      });
    }
    for (const button of scaleControlNodes) {
      button.addEventListener('click', () => {
        scaleFactor = Number(button.dataset.originScaleFactor);
        render();
      });
    }

    render();
  }

  mount();
})();
