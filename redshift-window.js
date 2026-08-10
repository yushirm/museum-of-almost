'use strict';

(function initialiseRedshiftWindow() {
  const closingSection = document.querySelector('[aria-labelledby="closing-title"]');
  if (!closingSection || document.getElementById('redshift-window')) return;

  const MIN_NM = 350;
  const MAX_NM = 1450;
  const lines = [
    { id: 'hbeta', label: 'Hβ', restNm: 486.1 },
    { id: 'oiii', label: '[O III]', restNm: 500.7 },
    { id: 'halpha', label: 'Hα', restNm: 656.3 }
  ];
  const shifts = [0, 0.1, 0.5, 1.0];
  const observingWindows = [
    {
      id: 'visible',
      label: 'Visible channel',
      minNm: 380,
      maxNm: 780,
      note: 'A deliberately broad gallery-visible window. Human visual sensitivity has soft edges; this is an illustrative observing gate, not a biological cutoff.'
    },
    {
      id: 'near-ir',
      label: 'Near-IR channel',
      minNm: 780,
      maxNm: 1400,
      note: 'An illustrative near-infrared gate chosen to fit this stage. Real instruments use their own detector and filter bandpasses.'
    }
  ];

  let selectedRedshift = shifts[0];
  let selectedWindow = observingWindows[0];

  function observedNm(restNm, redshift) {
    return restNm * (1 + redshift);
  }

  function positionPercent(wavelengthNm) {
    return ((wavelengthNm - MIN_NM) / (MAX_NM - MIN_NM)) * 100;
  }

  function make(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof text === 'string') node.textContent = text;
    return node;
  }

  const section = document.createElement('section');
  section.id = 'redshift-window';
  section.className = 'cosmos-section';
  section.setAttribute('aria-labelledby', 'redshift-window-title');

  const heading = make('div', 'section-heading');
  heading.append(
    make('p', 'eyebrow', 'INSTRUMENT 15 · THE REDSHIFT WINDOW'),
    make('h2', '', 'The same spectral fingerprint can arrive somewhere else.'),
    make('p', '', 'Redshift changes where familiar spectral features arrive in wavelength. Move one fixed three-line reference spectrum through four illustrative redshifts, then change the observing window and see which parts of the same fingerprint are admitted.')
  );
  heading.querySelector('h2').id = 'redshift-window-title';

  const shell = make('div', 'redshift-window-shell');

  const shiftLabel = make('p', 'redshift-window-control-label', 'Shift the source spectrum');
  const controls = make('div', 'redshift-window-controls');
  controls.setAttribute('role', 'group');
  controls.setAttribute('aria-label', 'Choose an illustrative redshift');

  const bandLabel = make('p', 'redshift-window-control-label', 'Change the observing window');
  const bandControls = make('div', 'redshift-band-controls');
  bandControls.setAttribute('role', 'group');
  bandControls.setAttribute('aria-label', 'Choose an illustrative observing wavelength window');

  const spectrum = make('div', 'redshift-spectrum');
  spectrum.setAttribute('aria-hidden', 'true');

  const visibleWindow = make('div', 'redshift-visible-window');
  const visibleWindowLabel = make('span', '', 'visible channel · 380–780 nm');
  visibleWindow.append(visibleWindowLabel);
  spectrum.append(visibleWindow);

  const axis = make('div', 'redshift-axis');
  spectrum.append(axis);

  [350, 500, 780, 1000, 1250, 1450].forEach((wavelength) => {
    const label = make('span', 'redshift-axis-label', `${wavelength} nm`);
    label.style.left = `${positionPercent(wavelength)}%`;
    spectrum.append(label);
  });

  const lineElements = new Map();
  lines.forEach((line) => {
    const marker = make('span', 'redshift-line');
    marker.dataset.lineId = line.id;
    marker.dataset.lineLabel = `${line.label} · rest ${line.restNm.toFixed(1)} nm`;
    marker.dataset.observedLabel = `${line.restNm.toFixed(1)} nm`;
    spectrum.append(marker);
    lineElements.set(line.id, marker);
  });

  const readout = make('div', 'redshift-window-readout');
  readout.setAttribute('aria-live', 'polite');

  const redshiftReadout = make('div');
  redshiftReadout.append(make('span', '', 'Selected redshift'), make('strong', '', 'z = 0.0'));
  redshiftReadout.querySelector('strong').id = 'redshift-window-z';

  const bandReadout = make('div');
  bandReadout.append(make('span', '', 'Observing window'), make('strong', '', 'Visible channel · 380–780 nm'));
  bandReadout.querySelector('strong').id = 'redshift-window-band';

  const stateReadout = make('div');
  stateReadout.append(make('span', '', 'What the window admits'), make('strong', '', 'All three reference lines'));
  stateReadout.querySelector('strong').id = 'redshift-window-state';

  const linesReadout = make('div');
  linesReadout.append(make('span', '', 'Observed lines'), make('strong', '', 'Hβ 486.1 nm · [O III] 500.7 nm · Hα 656.3 nm'));
  linesReadout.querySelector('strong').id = 'redshift-window-lines';
  readout.append(redshiftReadout, bandReadout, stateReadout, linesReadout);

  const note = make('p', 'redshift-window-note');
  note.id = 'redshift-window-note';

  const windowNote = make('p', 'redshift-window-note');
  windowNote.id = 'redshift-window-band-note';

  const boundary = make('p', 'inventory-note', 'REDSHIFT + SELECTION BOUNDARY · The three rest wavelengths are rounded reference lines. Positions use λobserved = λrest × (1 + z). The two wavelength gates are illustrative, not real telescope filters. A feature falling outside the selected gate has not ceased to exist; this toy observer has simply stopped admitting that wavelength. The controls do not infer distance, age, velocity, source abundance, or a cosmological model from z.');

  function render() {
    [...controls.querySelectorAll('button')].forEach((button) => {
      button.setAttribute('aria-pressed', String(Number(button.dataset.redshift) === selectedRedshift));
    });
    [...bandControls.querySelectorAll('button')].forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.windowId === selectedWindow.id));
    });

    lines.forEach((line) => {
      const observed = observedNm(line.restNm, selectedRedshift);
      const marker = lineElements.get(line.id);
      marker.style.left = `${positionPercent(observed)}%`;
      marker.dataset.observedLabel = `${observed.toFixed(1)} nm observed`;
    });

    visibleWindow.style.left = `${positionPercent(selectedWindow.minNm)}%`;
    visibleWindow.style.width = `${positionPercent(selectedWindow.maxNm) - positionPercent(selectedWindow.minNm)}%`;
    visibleWindowLabel.textContent = `${selectedWindow.label.toLowerCase()} · ${selectedWindow.minNm}–${selectedWindow.maxNm} nm`;

    const admitted = lines.filter((line) => {
      const observed = observedNm(line.restNm, selectedRedshift);
      return observed >= selectedWindow.minNm && observed <= selectedWindow.maxNm;
    });
    const admittedLabels = admitted.map((line) => line.label).join(', ');
    const state = admitted.length === lines.length
      ? 'All three reference lines'
      : admitted.length === 0
        ? 'No reference lines'
        : `${admitted.length} of 3 · ${admittedLabels}`;
    const observedSummary = lines
      .map((line) => `${line.label} ${observedNm(line.restNm, selectedRedshift).toFixed(1)} nm`)
      .join(' · ');

    document.getElementById('redshift-window-z').textContent = `z = ${selectedRedshift.toFixed(1)}`;
    document.getElementById('redshift-window-band').textContent = `${selectedWindow.label} · ${selectedWindow.minNm}–${selectedWindow.maxNm} nm`;
    document.getElementById('redshift-window-state').textContent = state;
    document.getElementById('redshift-window-lines').textContent = observedSummary;

    note.textContent = selectedRedshift === 0
      ? 'At z = 0 the markers sit at their rounded rest wavelengths. The fingerprint is defined by the pattern of lines, not by one colour.'
      : `At z = ${selectedRedshift.toFixed(1)}, every marker is multiplied by the same factor of ${(1 + selectedRedshift).toFixed(1)}. Their spacing stretches in wavelength while their identity as this reference pattern is preserved.`;
    windowNote.textContent = `${selectedWindow.note} At this redshift it admits ${admitted.length} of the 3 reference lines shown.`;
  }

  shifts.forEach((redshift) => {
    const button = make('button', '', `z = ${redshift.toFixed(1)}`);
    button.type = 'button';
    button.dataset.redshift = String(redshift);
    button.addEventListener('click', () => {
      selectedRedshift = redshift;
      render();
    });
    controls.append(button);
  });

  observingWindows.forEach((window) => {
    const button = make('button', '', window.label);
    button.type = 'button';
    button.dataset.windowId = window.id;
    button.addEventListener('click', () => {
      selectedWindow = window;
      render();
    });
    bandControls.append(button);
  });

  shell.append(shiftLabel, controls, bandLabel, bandControls, spectrum, readout, note, windowNote, boundary);
  section.append(heading, shell);
  closingSection.insertAdjacentElement('beforebegin', section);

  render();
})();
