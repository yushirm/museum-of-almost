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

  function observedNm(restNm, redshift) {
    return restNm * (1 + redshift);
  }

  function positionPercent(wavelengthNm) {
    return ((wavelengthNm - MIN_NM) / (MAX_NM - MIN_NM)) * 100;
  }

  const section = document.createElement('section');
  section.id = 'redshift-window';
  section.className = 'cosmos-section';
  section.setAttribute('aria-labelledby', 'redshift-window-title');

  const heading = document.createElement('div');
  heading.className = 'section-heading';
  heading.innerHTML = '<p class="eyebrow">INSTRUMENT 15 · THE REDSHIFT WINDOW</p><h2 id="redshift-window-title">The same spectral fingerprint can arrive somewhere else.</h2><p>Redshift does not repaint a source. It changes where familiar spectral features arrive in wavelength. Move one fixed three-line reference spectrum through four illustrative redshifts and watch the lines cross the human-visible window.</p>';

  const shell = document.createElement('div');
  shell.className = 'redshift-window-shell';

  const controls = document.createElement('div');
  controls.className = 'redshift-window-controls';
  controls.setAttribute('role', 'group');
  controls.setAttribute('aria-label', 'Choose an illustrative redshift');

  const spectrum = document.createElement('div');
  spectrum.className = 'redshift-spectrum';
  spectrum.setAttribute('aria-hidden', 'true');

  const visibleWindow = document.createElement('div');
  visibleWindow.className = 'redshift-visible-window';
  visibleWindow.innerHTML = '<span>approx. human-visible window · 380–780 nm</span>';
  spectrum.append(visibleWindow);

  const axis = document.createElement('div');
  axis.className = 'redshift-axis';
  spectrum.append(axis);

  [350, 500, 780, 1000, 1250, 1450].forEach((wavelength) => {
    const label = document.createElement('span');
    label.className = 'redshift-axis-label';
    label.style.left = `${positionPercent(wavelength)}%`;
    label.textContent = `${wavelength} nm`;
    spectrum.append(label);
  });

  const lineElements = new Map();
  lines.forEach((line) => {
    const marker = document.createElement('span');
    marker.className = 'redshift-line';
    marker.dataset.lineId = line.id;
    marker.dataset.lineLabel = `${line.label} · rest ${line.restNm.toFixed(1)} nm`;
    marker.dataset.observedLabel = `${line.restNm.toFixed(1)} nm`;
    spectrum.append(marker);
    lineElements.set(line.id, marker);
  });

  const readout = document.createElement('div');
  readout.className = 'redshift-window-readout';
  readout.setAttribute('aria-live', 'polite');
  readout.innerHTML = '<div><span>Selected redshift</span><strong id="redshift-window-z">z = 0.0</strong></div><div><span>What changed</span><strong id="redshift-window-state">Rest wavelengths</strong></div>';

  const note = document.createElement('p');
  note.className = 'redshift-window-note';
  note.id = 'redshift-window-note';

  const boundary = document.createElement('p');
  boundary.className = 'inventory-note';
  boundary.textContent = 'REDSHIFT WINDOW BOUNDARY · The three rest wavelengths are rounded reference lines. Positions use λobserved = λrest × (1 + z). The buttons illustrate the wavelength relation only: they do not infer distance, age, velocity, or a cosmological model from z, and redshift can have cosmological, Doppler, or gravitational contributions.';

  function render(redshift, activeButton) {
    [...controls.querySelectorAll('button')].forEach((button) => {
      const active = button === activeButton;
      button.setAttribute('aria-pressed', String(active));
    });

    lines.forEach((line) => {
      const observed = observedNm(line.restNm, redshift);
      const marker = lineElements.get(line.id);
      marker.style.left = `${positionPercent(observed)}%`;
      marker.dataset.observedLabel = `${observed.toFixed(1)} nm observed`;
    });

    const allVisible = lines.every((line) => {
      const observed = observedNm(line.restNm, redshift);
      return observed >= 380 && observed <= 780;
    });
    const anyVisible = lines.some((line) => {
      const observed = observedNm(line.restNm, redshift);
      return observed >= 380 && observed <= 780;
    });

    const state = allVisible
      ? 'All three reference lines remain in the visible window'
      : anyVisible
        ? 'The reference spectrum now straddles visible and infrared wavelengths'
        : 'All three reference lines have shifted beyond the visible window';

    document.getElementById('redshift-window-z').textContent = `z = ${redshift.toFixed(1)}`;
    document.getElementById('redshift-window-state').textContent = state;
    note.textContent = redshift === 0
      ? 'At z = 0 the markers sit at their rounded rest wavelengths. The fingerprint is defined by the pattern of lines, not by one colour.'
      : `At z = ${redshift.toFixed(1)}, every marker is multiplied by the same factor of ${(1 + redshift).toFixed(1)}. Their spacing stretches in wavelength while their identity as this reference pattern is preserved.`;
  }

  shifts.forEach((redshift, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = `z = ${redshift.toFixed(1)}`;
    button.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');
    button.addEventListener('click', () => render(redshift, button));
    controls.append(button);
  });

  shell.append(controls, spectrum, readout, note, boundary);
  section.append(heading, shell);
  closingSection.insertAdjacentElement('beforebegin', section);

  render(shifts[0], controls.querySelector('button'));
})();
