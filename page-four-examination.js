'use strict';

(() => {
  const evidence = document.getElementById('evidence');
  const research = document.getElementById('research-intake');
  const caseNav = document.querySelector('.case-nav');
  const status = document.getElementById('archive-status');
  if (!evidence || document.getElementById('examination-light-table')) return;

  const modes = {
    incident: {
      label: 'NORMAL / INCIDENT LIGHT',
      observation: 'The face of the fictional sheet is readable only where ink survives. Redaction bars remain opaque. The examination adds no hidden words.',
      question: 'What is actually present on the visible face of the record?'
    },
    raking: {
      label: 'RAKING / OBLIQUE LIGHT',
      observation: 'Low-angle light exaggerates the reconstruction’s surface relief: a fold, two shallow pressure tracks and a lifted corner become easier to notice. No legible text is recovered from the pressure marks.',
      question: 'Which marks belong to the paper’s handling history rather than its written claim?'
    },
    transmitted: {
      label: 'TRANSMITTED LIGHT',
      observation: 'Backlighting exposes the reconstruction’s paper structure: two pinholes, the fold and a fictional partial watermark. The black redactions still do not become readable.',
      question: 'What can the support reveal without pretending the censored content has been recovered?'
    }
  };

  function text(tag, value, className = '') {
    const node = document.createElement(tag);
    node.textContent = value;
    if (className) node.className = className;
    return node;
  }

  const section = document.createElement('section');
  section.id = 'examination-light-table';
  section.className = 'examination-table';
  section.dataset.mode = 'incident';
  section.tabIndex = -1;
  section.setAttribute('aria-labelledby', 'examination-light-table-title');

  const heading = document.createElement('header');
  heading.className = 'examination-heading';
  heading.append(
    text('span', '08-X / DOCUMENT EXAMINATION / FICTIONAL RECONSTRUCTION'),
    text('h2', 'THREE LIGHTS. ONE FRAGMENT.', 'examination-title'),
    text('p', 'The archive usually asks what a document says. The light table asks what kind of object the document is before the story gets involved.')
  );

  const workspace = document.createElement('div');
  workspace.className = 'examination-workspace';

  const stage = document.createElement('div');
  stage.className = 'examination-stage';
  stage.setAttribute('aria-hidden', 'true');

  const sheet = document.createElement('div');
  sheet.className = 'examination-sheet';
  sheet.innerHTML = `
    <span class="exam-fold"></span>
    <span class="exam-pinhole exam-pinhole-a"></span>
    <span class="exam-pinhole exam-pinhole-b"></span>
    <span class="exam-pressure exam-pressure-a"></span>
    <span class="exam-pressure exam-pressure-b"></span>
    <span class="exam-watermark">ARCHIVE STOCK<br>— 04 —</span>
    <small>DOCUMENT ID: FOUR-08 / RECONSTRUCTION</small>
    <p>Subject exhibits <b></b> when exposed to <b></b>.</p>
    <p>Secondary effects include <b></b> and <b></b>.</p>
    <p>Recommended action: <b></b>.</p>
    <p>Do not <b></b> under any circumstances.</p>
  `;
  stage.append(sheet);

  const consolePanel = document.createElement('div');
  consolePanel.className = 'examination-console';
  const controls = document.createElement('div');
  controls.className = 'examination-controls';
  controls.setAttribute('role', 'group');
  controls.setAttribute('aria-label', 'Examination lighting mode');

  const modeButtons = Object.keys(modes).map((mode) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.examMode = mode;
    button.setAttribute('aria-pressed', String(mode === 'incident'));
    button.textContent = modes[mode].label;
    controls.append(button);
    return button;
  });

  const live = document.createElement('div');
  live.className = 'examination-live';
  live.setAttribute('role', 'status');
  live.setAttribute('aria-live', 'polite');
  live.setAttribute('aria-atomic', 'true');
  const modeLabel = text('strong', '', 'examination-mode-label');
  const observation = text('p', '', 'examination-observation');
  const question = text('p', '', 'examination-question');
  live.append(modeLabel, observation, question);

  const boundary = text(
    'p',
    'FICTIONAL EXAMINATION // THE MODES CHANGE WHICH PHYSICAL FEATURES ARE EMPHASIZED. THEY DO NOT REVEAL THE WORDS UNDER THE REDACTIONS, AUTHENTICATE THE DOCUMENT, OR TURN PAGE FOUR INTO A CLAIM OF FACT.',
    'examination-boundary'
  );

  consolePanel.append(controls, live, boundary);
  workspace.append(stage, consolePanel);
  section.append(heading, workspace);

  function render(mode, announce = false) {
    const entry = modes[mode] || modes.incident;
    section.dataset.mode = mode in modes ? mode : 'incident';
    modeButtons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.examMode === section.dataset.mode));
    });
    modeLabel.textContent = entry.label;
    observation.textContent = entry.observation;
    question.textContent = `ARCHIVE QUESTION: ${entry.question}`;
    if (announce && status) {
      status.textContent = `Examination light table: ${entry.label.toLowerCase()} selected. Physical clues changed; fictional redactions remain unreadable.`;
    }
  }

  modeButtons.forEach((button) => {
    button.addEventListener('click', () => render(button.dataset.examMode, true));
  });

  if (research) research.insertAdjacentElement('beforebegin', section);
  else evidence.insertAdjacentElement('afterend', section);

  if (caseNav && !document.getElementById('examination-light-table-link')) {
    const link = document.createElement('a');
    link.id = 'examination-light-table-link';
    link.href = '#examination-light-table';
    const number = document.createElement('span');
    number.textContent = '08X';
    link.append(number, document.createTextNode(' Examination light table'));
    link.addEventListener('click', () => {
      if (status) status.textContent = 'Examination light table selected. Three fixed lighting modes; no hidden text recovery.';
    });
    caseNav.append(link);
  }

  render('incident');
})();
