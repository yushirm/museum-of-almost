(function attachRedshiftRulerView() {
  'use strict';

  const core = window.MuseumRedshiftRulerCore;
  if (!core) return;

  function make(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof text === 'string') node.textContent = text;
    return node;
  }

  function formatNumber(value, digits = 3) {
    return new Intl.NumberFormat('en', { maximumFractionDigits: digits }).format(value);
  }

  function mount() {
    if (document.getElementById('redshift-ruler-title')) return;
    const closing = document.querySelector('.cosmos-section[aria-labelledby="closing-title"]');
    if (!closing || !closing.parentNode) return;

    const section = make('section', 'cosmos-section');
    section.setAttribute('aria-labelledby', 'redshift-ruler-title');

    const heading = make('div', 'section-heading');
    heading.append(make('p', 'eyebrow', 'INSTRUMENT 09 · THE REDSHIFT RULER / THE TICK MARKS WILL NOT STAY PUT'));
    const title = make('h2', '', 'The ruler changes after the light leaves.');
    title.id = 'redshift-ruler-title';
    heading.append(
      title,
      make('p', '', 'Choose a fixed cosmological redshift. The exact ledger calculates how one generic 500 nm reference wavelength would be received in an ideal expanding-universe model. The observed ruler is then allowed to take up more screen space by the same factor 1 + z.')
    );

    const shell = make('div', 'redshift-ruler-shell');
    const controls = make('div', 'redshift-ruler-controls');
    controls.setAttribute('role', 'group');
    controls.setAttribute('aria-label', 'Choose a fixed cosmological redshift');

    for (const [index, item] of core.CASES.entries()) {
      const button = make('button', '', item.label);
      button.type = 'button';
      button.dataset.redshiftCaseId = item.id;
      button.dataset.active = String(index === 0);
      button.setAttribute('aria-pressed', String(index === 0));
      controls.append(button);
    }

    const layout = make('div', 'redshift-ruler-layout');

    const stagePanel = make('section', 'redshift-stage-panel');
    stagePanel.setAttribute('aria-labelledby', 'redshift-stage-title');
    const stageHead = make('div', 'redshift-stage-head');
    const stageTitle = make('h3', '', 'Wavelength ruler');
    stageTitle.id = 'redshift-stage-title';
    stageHead.append(stageTitle, make('span', '', 'screen span follows 1 + z'));

    const stageViewport = make('div', 'redshift-stage-viewport');
    stageViewport.tabIndex = 0;
    stageViewport.setAttribute('aria-label', 'Scrollable schematic comparing emitted and observed wavelength spans');

    const stage = make('div', 'redshift-stage');
    const emittedRow = make('div', 'redshift-row');
    emittedRow.append(make('span', 'redshift-row-label', 'EMITTED'));
    const emittedRuler = make('div', 'redshift-ruler redshift-ruler-emitted');
    emittedRuler.append(make('span', 'redshift-ruler-start', '0'), make('span', 'redshift-ruler-end', '500 nm'));
    emittedRow.append(emittedRuler);

    const observedRow = make('div', 'redshift-row');
    observedRow.append(make('span', 'redshift-row-label', 'OBSERVED'));
    const observedRuler = make('div', 'redshift-ruler redshift-ruler-observed');
    observedRuler.id = 'redshift-observed-ruler';
    const observedEnd = make('span', 'redshift-ruler-end', '550 nm');
    observedEnd.id = 'redshift-observed-end';
    observedRuler.append(make('span', 'redshift-ruler-start', '0'), observedEnd);
    observedRow.append(observedRuler);
    stage.append(emittedRow, observedRow);
    stageViewport.append(stage);

    const visualNote = make('p', 'redshift-stage-note', 'The changing width is a schematic consequence of the exact wavelength ratio, not a literal picture of space, a distance scale, or a claim that a browser pixel is a cosmological coordinate. Horizontal overflow is intentional when the selected stretch is large.');
    stagePanel.append(stageHead, stageViewport, visualNote);

    const readout = make('section', 'redshift-readout');
    readout.setAttribute('aria-live', 'polite');
    const readoutHead = make('div', 'redshift-readout-head');
    readoutHead.append(make('h3', '', 'Cosmological stretch ledger'), make('span', '', 'aobs = 1'));
    const caseTitle = make('h3', 'redshift-case-title', 'z = 0.1');
    caseTitle.id = 'redshift-case-title';
    const caseNote = make('p', '', '');
    caseNote.id = 'redshift-case-note';

    const metrics = make('div', 'redshift-metrics');
    const metricDefinitions = [
      ['redshift-z', 'Redshift z'],
      ['redshift-emitted', 'Emitted wavelength λemit'],
      ['redshift-observed', 'Observed wavelength λobs'],
      ['redshift-stretch', 'Stretch factor 1 + z'],
      ['redshift-scale', 'Emission scale factor aemit']
    ];
    for (const [id, label] of metricDefinitions) {
      const metric = make('div', 'redshift-metric');
      metric.append(make('span', '', label));
      const value = make('strong', '', '—');
      value.id = id;
      metric.append(value);
      metrics.append(metric);
    }

    const equations = make('div', 'redshift-equations');
    equations.append(
      make('p', '', 'λobs = λemit (1 + z)'),
      make('p', '', 'aemit = 1 / (1 + z), with aobs = 1')
    );

    const boundary = make('div', 'redshift-boundary');
    boundary.append(
      make('strong', '', 'WHAT THIS RULER REFUSES TO INFER'),
      make('p', '', 'No distance, lookback time, age, real source identity, or recession speed is calculated. This instrument models cosmological redshift only. Doppler and gravitational redshift are different mechanisms and are outside this calculation.')
    );

    readout.append(readoutHead, caseTitle, caseNote, metrics, equations, boundary);
    layout.append(stagePanel, readout);
    shell.append(controls, layout);
    section.append(heading, shell);
    closing.parentNode.insertBefore(section, closing);

    const buttons = [...controls.querySelectorAll('[data-redshift-case-id]')];
    const zValue = readout.querySelector('#redshift-z');
    const emittedValue = readout.querySelector('#redshift-emitted');
    const observedValue = readout.querySelector('#redshift-observed');
    const stretchValue = readout.querySelector('#redshift-stretch');
    const scaleValue = readout.querySelector('#redshift-scale');

    function render(caseId) {
      const snap = core.snapshot(caseId);
      if (!snap) return;

      for (const button of buttons) {
        const active = button.dataset.redshiftCaseId === caseId;
        button.dataset.active = String(active);
        button.setAttribute('aria-pressed', String(active));
      }

      caseTitle.textContent = snap.label;
      caseNote.textContent = snap.note;
      zValue.textContent = formatNumber(snap.redshift, 3);
      emittedValue.textContent = `${formatNumber(snap.emittedWavelengthNm, 3)} nm`;
      observedValue.textContent = `${formatNumber(snap.observedWavelengthNm, 3)} nm`;
      stretchValue.textContent = `× ${formatNumber(snap.stretchFactor, 3)}`;
      scaleValue.textContent = formatNumber(snap.emissionScaleFactor, 6);
      observedEnd.textContent = `${formatNumber(snap.observedWavelengthNm, 3)} nm`;
      observedRuler.style.setProperty('--redshift-stretch', String(snap.stretchFactor));
      stageViewport.scrollLeft = 0;
    }

    for (const button of buttons) {
      button.addEventListener('click', () => render(button.dataset.redshiftCaseId));
    }

    render(core.CASES[0].id);
  }

  mount();
})();
