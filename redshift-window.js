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

(function initialiseResolutionBench() {
  const closingSection = document.querySelector('[aria-labelledby="closing-title"]');
  if (!closingSection || document.getElementById('resolution-bench')) return;

  const pairSeparationArcsec = 0.10;
  const apertures = [
    { id: 'small', label: '0.10 m', diameterM: 0.10 },
    { id: 'medium', label: '1.00 m', diameterM: 1.00 },
    { id: 'large', label: '4.00 m', diameterM: 4.00 }
  ];
  const wavelengths = [
    { id: 'blue', label: 'Blue · 400 nm', wavelengthNm: 400 },
    { id: 'green', label: 'Green · 550 nm', wavelengthNm: 550 },
    { id: 'near-ir', label: 'Near-IR · 800 nm', wavelengthNm: 800 }
  ];
  let selectedAperture = apertures[1];
  let selectedWavelength = wavelengths[1];

  function make(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof text === 'string') node.textContent = text;
    return node;
  }

  function rayleighArcsec(diameterM, wavelengthNm) {
    const radians = (1.22 * wavelengthNm * 1e-9) / diameterM;
    return radians * 206265;
  }

  const section = make('section', 'cosmos-section');
  section.id = 'resolution-bench';
  section.setAttribute('aria-labelledby', 'resolution-bench-title');

  const heading = make('div', 'section-heading');
  const eyebrow = make('p', 'eyebrow', 'INSTRUMENT 16 · THE RESOLUTION BENCH');
  const title = make('h2', '', 'Two stars can exist where one blur arrives.');
  title.id = 'resolution-bench-title';
  const intro = make('p', '', 'Keep one idealized pair of equal-brightness point sources fixed at 0.10 arcsecond separation. Change the diameter of a perfect circular aperture, then change the observing wavelength. The same mirror can separate the pair at one wavelength and blur it at another because the diffraction limit depends on both λ and D.');
  heading.append(eyebrow, title, intro);

  const shell = make('div', 'instrument');
  const controlBank = make('div');
  controlBank.style.display = 'grid';
  controlBank.style.gap = '0.85rem';
  controlBank.style.padding = 'clamp(1rem, 3vw, 1.5rem)';
  controlBank.style.borderBottom = '1px solid var(--line)';

  const apertureLabel = make('p', 'metric-label', 'Change aperture diameter');
  apertureLabel.style.margin = '0';
  const apertureControls = make('div', 'instrument-controls');
  apertureControls.setAttribute('role', 'group');
  apertureControls.setAttribute('aria-label', 'Choose an ideal circular aperture diameter');

  const wavelengthLabel = make('p', 'metric-label', 'Change observing wavelength');
  wavelengthLabel.style.margin = '0.35rem 0 0';
  const wavelengthControls = make('div', 'instrument-controls');
  wavelengthControls.setAttribute('role', 'group');
  wavelengthControls.setAttribute('aria-label', 'Choose an observing wavelength for the diffraction calculation');

  controlBank.append(apertureLabel, apertureControls, wavelengthLabel, wavelengthControls);

  const body = make('div', 'instrument-body');
  body.style.display = 'grid';
  body.style.gap = '1rem';

  const field = make('div', 'resolution-field');
  field.setAttribute('aria-hidden', 'true');
  field.style.position = 'relative';
  field.style.minHeight = '230px';
  field.style.overflow = 'hidden';
  field.style.borderRadius = '1rem';
  field.style.border = '1px solid rgba(173, 195, 255, 0.28)';
  field.style.background = 'radial-gradient(circle at 50% 50%, rgba(57, 72, 128, 0.22), rgba(7, 5, 17, 0.96) 68%)';

  const guide = make('span', '', 'schematic focal-plane view');
  guide.style.position = 'absolute';
  guide.style.left = '1rem';
  guide.style.top = '0.85rem';
  guide.style.fontSize = '0.72rem';
  guide.style.letterSpacing = '0.08em';
  guide.style.textTransform = 'uppercase';
  guide.style.opacity = '0.7';
  field.append(guide);

  const starA = make('span');
  const starB = make('span');
  [starA, starB].forEach((star, index) => {
    star.style.position = 'absolute';
    star.style.top = '50%';
    star.style.left = index === 0 ? 'calc(50% - 18px)' : 'calc(50% + 18px)';
    star.style.transform = 'translate(-50%, -50%)';
    star.style.borderRadius = '50%';
    star.style.background = 'radial-gradient(circle, rgba(255,255,255,0.98) 0 6%, rgba(190,210,255,0.76) 16%, rgba(115,150,255,0.24) 52%, rgba(100,135,255,0) 72%)';
  });
  field.append(starA, starB);

  const readout = make('div', 'readout-grid');
  readout.setAttribute('aria-live', 'polite');

  function metric(label, initialValue, id) {
    const box = make('div', 'readout');
    box.append(make('span', 'metric-label', label));
    const value = make('strong', 'readout-value', initialValue);
    value.id = id;
    box.append(value);
    return box;
  }

  readout.append(
    metric('Aperture diameter', '1.00 m', 'resolution-aperture'),
    metric('Observing wavelength', '550 nm', 'resolution-wavelength'),
    metric('Rayleigh limit', '0.138 arcsec', 'resolution-limit'),
    metric('Fixed source separation', '0.100 arcsec', 'resolution-separation'),
    metric('Idealized result', 'NOT RESOLVED', 'resolution-result')
  );
  const note = make('p', 'readout-note', 'The visual blur is schematic; the numerical Rayleigh value is authoritative for this toy model.');
  note.id = 'resolution-note';
  readout.append(note);

  const boundary = make('p', 'inventory-note', 'DIFFRACTION BOUNDARY · This bench uses the Rayleigh approximation θ ≈ 1.22 λ / D for an ideal circular aperture and equal-brightness point sources. Its three fixed wavelengths are illustrative monochromatic cases, not telescope filters or colour images. It does not model atmosphere, detector sampling, optical aberrations, source contrast, signal-to-noise, deconvolution, interferometry, or a real telescope. “Not resolved” means this idealized aperture-wavelength pair cannot separate the sources by this criterion; it does not mean only one source exists.');

  function render() {
    const limit = rayleighArcsec(selectedAperture.diameterM, selectedWavelength.wavelengthNm);
    const resolved = pairSeparationArcsec >= limit;
    const visualDiameter = Math.max(18, Math.min(150, (limit / pairSeparationArcsec) * 42));

    apertureControls.querySelectorAll('button').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.apertureId === selectedAperture.id));
    });
    wavelengthControls.querySelectorAll('button').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.wavelengthId === selectedWavelength.id));
    });

    [starA, starB].forEach((star) => {
      star.style.width = `${visualDiameter}px`;
      star.style.height = `${visualDiameter}px`;
    });

    document.getElementById('resolution-aperture').textContent = selectedAperture.label;
    document.getElementById('resolution-wavelength').textContent = `${selectedWavelength.wavelengthNm} nm`;
    document.getElementById('resolution-limit').textContent = `${limit.toFixed(3)} arcsec`;
    document.getElementById('resolution-separation').textContent = `${pairSeparationArcsec.toFixed(3)} arcsec`;
    document.getElementById('resolution-result').textContent = resolved ? 'RESOLVED BY THIS CRITERION' : 'NOT RESOLVED BY THIS CRITERION';
    note.textContent = resolved
      ? `At ${selectedWavelength.wavelengthNm} nm, the pair separation is larger than the ${limit.toFixed(3)} arcsec Rayleigh limit for this ${selectedAperture.label} aperture. The schematic point-spread patterns separate, but real observing performance can still be worse.`
      : `At ${selectedWavelength.wavelengthNm} nm, the pair separation is smaller than the ${limit.toFixed(3)} arcsec Rayleigh limit for this ${selectedAperture.label} aperture. The same two sources remain in the scene even though this aperture-wavelength pair does not separate them.`;
  }

  apertures.forEach((aperture) => {
    const button = make('button', '', aperture.label);
    button.type = 'button';
    button.dataset.apertureId = aperture.id;
    button.setAttribute('aria-pressed', String(aperture.id === selectedAperture.id));
    button.addEventListener('click', () => {
      selectedAperture = aperture;
      render();
    });
    apertureControls.append(button);
  });

  wavelengths.forEach((wavelength) => {
    const button = make('button', '', wavelength.label);
    button.type = 'button';
    button.dataset.wavelengthId = wavelength.id;
    button.setAttribute('aria-pressed', String(wavelength.id === selectedWavelength.id));
    button.addEventListener('click', () => {
      selectedWavelength = wavelength;
      render();
    });
    wavelengthControls.append(button);
  });

  body.append(field, readout, boundary);
  shell.append(controlBank, body);
  section.append(heading, shell);
  closingSection.insertAdjacentElement('beforebegin', section);
  render();
})();