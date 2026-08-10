'use strict';

(() => {
  const mountAfter = document.getElementById('evidence');
  const caseNav = document.querySelector('.case-nav');
  const status = document.getElementById('archive-status');
  if (!mountAfter || document.getElementById('research-intake')) return;

  const evidence = [
    {
      code: 'PB-701',
      title: 'PROJECT BLUE BOOK',
      source: 'NATIONAL ARCHIVES / USAF / MICROFILM T1206',
      documented: 'The Air Force recorded 12,618 UFO reports from 1947–1969; 701 remained categorized as unidentified.',
      limit: 'The Air Force reported no evidence that the unidentified cases were extraterrestrial vehicles or technology beyond then-known science.',
      note: 'UNIDENTIFIED IS A FILE STATUS, NOT A CAUSE.',
      mirror: '#celestial',
      mirrorLabel: 'Fiction mirror: celestial theories'
    },
    {
      code: 'BF-1977',
      title: 'THE FBI BIGFOOT HAIR FILE',
      source: 'FBI VAULT / BIGFOOT PART 01 / FEBRUARY 1977',
      documented: 'The FBI Laboratory examined submitted hairs by microscopy and comparison with known animal hairs.',
      limit: 'The tested hairs were identified as deer-family origin. That result applies to the submitted sample, not every cryptid story.',
      note: 'A NEGATIVE SAMPLE IS STILL EVIDENCE.',
      mirror: '#cryptids',
      mirrorLabel: 'Fiction mirror: cryptid sightings'
    },
    {
      code: 'RV-XCI/LIII',
      title: 'STARGATE / GRILL FLAME',
      source: 'CIA READING ROOM / REMOTE-VIEWING SESSION RECORDS',
      documented: 'Declassified records show government-sponsored remote-viewing experiments. One training record reported apparent geographic correlation; another reported no target correlation.',
      limit: 'The archive proves the experiments and their mixed session records existed. It does not make an individual session proof of paranormal perception.',
      note: 'GOVERNMENT ATTENTION IS NOT GOVERNMENT VALIDATION.',
      mirror: '#witnesses',
      mirrorLabel: 'Fiction mirror: witness accounts'
    },
    {
      code: 'NOAA-1997',
      title: 'THE BLOOP',
      source: 'NOAA PMEL / ACOUSTICS MONITORING PROGRAM',
      documented: 'Hydrophones recorded a powerful low-frequency sound in the Pacific in 1997. Later comparisons matched the signal to large-iceberg icequakes.',
      limit: 'A mysterious signal became an identified cryogenic process. The original anomaly was real; the sea-monster explanation was not required.',
      note: 'EXPLANATION CAN ARRIVE YEARS AFTER THE RUMOR.',
      mirror: '#broadcasts',
      mirrorLabel: 'Fiction mirror: missing broadcasts'
    },
    {
      code: '1I/2017 U1',
      title: 'ʻOUMUAMUA',
      source: 'NASA / FIRST KNOWN INTERSTELLAR OBJECT / RELEASE 18-056',
      documented: 'The first known interstellar object showed a small nongravitational acceleration as it left the solar system.',
      limit: 'NASA described comet-like outgassing as the likely explanation. An unusual trajectory is not evidence of artificial origin.',
      note: 'STRANGE DESERVES MEASUREMENT BEFORE MYTHOLOGY.',
      mirror: '#celestial',
      mirrorLabel: 'Fiction mirror: celestial theories'
    },
    {
      code: 'UAP-IST-2023',
      title: 'THE DATA PROBLEM',
      source: 'NASA / UAP INDEPENDENT STUDY TEAM / 2023',
      documented: 'NASA’s independent study emphasized that the limited number of high-quality UAP observations prevents firm scientific conclusions about their nature.',
      limit: 'The report focused on better collection, calibration, metadata and analysis. Lack of identification is not evidence of an extraordinary cause.',
      note: 'THE MOST IMPORTANT MISSING EVIDENCE MAY BE METADATA.',
      mirror: '#evidence',
      mirrorLabel: 'Fiction mirror: evidence board'
    }
  ];

  const lattice = [
    {
      title: 'UNKNOWN IS A DATA STATE',
      cases: 'PB-701 + UAP-IST-2023',
      finding: 'Two generations of official inquiry preserve a category for observations that are not resolved by the available record.',
      boundary: 'That shared category does not identify a shared cause.'
    },
    {
      title: 'TEST THE SAMPLE, NOT THE STORY',
      cases: 'BF-1977 + NOAA-1997',
      finding: 'Direct examination changed both narratives: hair became deer-family hair; a monster-sized sound became moving ice.',
      boundary: 'A resolved sample or signal does not erase the folklore around it, but it does constrain the claim.'
    },
    {
      title: 'ATTENTION IS NOT VALIDATION',
      cases: 'RV-XCI/LIII + PB-701',
      finding: 'Government institutions can spend time, paper and expertise on anomalous claims without confirming the extraordinary explanation attached to them.',
      boundary: 'An archive file proves archival activity. It does not automatically prove the phenomenon described by a claimant.'
    },
    {
      title: 'ANOMALY CAN HAVE A NATURAL CAUSE',
      cases: '1I/2017 U1 + NOAA-1997',
      finding: 'Both cases began with genuinely unusual observations and moved toward physical explanations through additional measurement and comparison.',
      boundary: 'Unusual is a reason to investigate, not a shortcut to artificial or paranormal origin.'
    },
    {
      title: 'METHOD MATTERS MORE THAN MYSTIQUE',
      cases: 'UAP-IST-2023 + RV-XCI/LIII',
      finding: 'The strongest recurring question is not “how weird is this?” but “what was measured, how was it controlled, and what metadata survived?”',
      boundary: 'Page Four may speculate in red ink. The evidence column stays tied to the record.'
    },
    {
      title: 'THE RECURRING PHENOMENON IS UNCERTAINTY',
      cases: 'ALL SIX FILES',
      finding: 'The durable pattern is the gap between observation and explanation—and the human tendency to fill that gap faster than evidence can.',
      boundary: 'This connection is an editorial synthesis for the Museum, not evidence of one hidden mechanism joining the cases.'
    }
  ];

  function text(tag, value, className = '') {
    const node = document.createElement(tag);
    node.textContent = value;
    if (className) node.className = className;
    return node;
  }

  function addNavLink() {
    if (!caseNav || document.getElementById('research-intake-link')) return;
    const link = document.createElement('a');
    link.id = 'research-intake-link';
    link.href = '#research-intake';
    const number = document.createElement('span');
    number.textContent = '10';
    link.append(number, document.createTextNode(' Evidence research'));
    link.addEventListener('click', () => {
      if (status) status.textContent = 'Research intake opened. Sourced record and Page Four speculation remain separate.';
    });
    caseNav.append(link);
  }

  function createDossier(item) {
    const card = document.createElement('article');
    card.className = 'research-dossier';
    card.dataset.evidence = item.code;

    const head = document.createElement('header');
    head.append(text('span', item.code, 'research-code'), text('h3', item.title));
    card.append(head, text('p', item.source, 'research-source'));

    const ledger = document.createElement('dl');
    const rows = [
      ['DOCUMENTED', item.documented],
      ['LIMIT', item.limit],
      ['PAGE FOUR NOTE', item.note]
    ];
    rows.forEach(([label, value]) => {
      ledger.append(text('dt', label), text('dd', value));
    });
    card.append(ledger);

    const mirror = document.createElement('a');
    mirror.href = item.mirror;
    mirror.textContent = `${item.mirrorLabel} →`;
    mirror.addEventListener('click', () => {
      if (status) status.textContent = `${item.code}: returning from sourced evidence to the fictional archive.`;
    });
    card.append(mirror);
    return card;
  }

  function mountExaminationLightTable(researchSection) {
    if (!researchSection || document.getElementById('examination-light-table')) return;

    if (!document.getElementById('page-four-examination-style')) {
      const style = document.createElement('style');
      style.id = 'page-four-examination-style';
      style.textContent = `
        .examination-table{position:relative;margin:2rem 0;padding:clamp(1rem,3vw,2rem);border:1px solid rgba(208,167,91,.36);background:#080a07;color:#dce8c8;box-shadow:inset 0 0 42px rgba(0,0,0,.55)}.examination-table::before{content:"CONSERVATION BENCH / FICTIONAL OBJECT";position:absolute;top:-.72rem;right:1rem;padding:.28rem .55rem;border:1px solid #d0a75b;background:#070906;color:#e5c784;font-size:.62rem;letter-spacing:.11em}.examination-heading{display:grid;gap:.55rem;padding-bottom:1rem;border-bottom:1px dashed rgba(208,167,91,.28)}.examination-heading>span,.examination-mode-label,.examination-question,.examination-boundary{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono",monospace;letter-spacing:.08em;text-transform:uppercase}.examination-heading>span{color:#d0a75b;font-size:.7rem}.examination-title{margin:0;color:#f3ead2;font-family:Georgia,"Times New Roman",serif;font-size:clamp(1.9rem,5vw,4rem);font-weight:500;line-height:.95}.examination-heading p{max-width:72ch;margin:0;color:#aeb7a0;line-height:1.55}.examination-workspace{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(17rem,.85fr);gap:1rem;margin-top:1rem}.examination-stage{min-height:28rem;display:grid;place-items:center;overflow:hidden;padding:clamp(1rem,4vw,3rem);border:1px solid rgba(184,238,117,.18);background:#12130d}.examination-sheet{position:relative;width:min(100%,34rem);min-height:22rem;padding:2.2rem 2rem;background:#cbbf98;color:#2d291f;box-shadow:0 18px 42px rgba(0,0,0,.5),inset 0 0 2rem rgba(83,66,31,.16);transform:rotate(-1deg);font-family:Georgia,"Times New Roman",serif}.examination-sheet small{display:block;margin-bottom:2rem;font:700 .58rem/1.5 ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono",monospace;letter-spacing:.08em}.examination-sheet p{position:relative;margin:1.15rem 0;font-size:clamp(.9rem,2vw,1.05rem);line-height:1.6}.examination-sheet b{display:inline-block;width:clamp(4rem,11vw,7rem);height:.82em;background:#211f19;vertical-align:baseline;transform:rotate(-.5deg)}.exam-fold{position:absolute;inset:0 auto 0 48%;width:1px;background:rgba(79,61,30,.14)}.exam-pinhole{position:absolute;width:.42rem;height:.42rem;border-radius:50%;background:#443e2f;opacity:.15}.exam-pinhole-a{top:16%;right:13%}.exam-pinhole-b{bottom:18%;left:12%}.exam-pressure{position:absolute;left:13%;right:10%;height:1px;background:transparent;box-shadow:0 1px rgba(65,49,24,.18);opacity:0}.exam-pressure-a{top:37%;transform:rotate(1deg)}.exam-pressure-b{top:43%;transform:rotate(-1.5deg)}.exam-watermark{position:absolute;right:8%;bottom:10%;display:grid;place-items:center;width:7rem;height:7rem;border:2px solid currentColor;border-radius:50%;color:rgba(93,76,37,.16);font:700 .68rem/1.35 ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono",monospace;text-align:center;letter-spacing:.08em;opacity:0;transform:rotate(12deg)}.examination-console{display:grid;align-content:start;gap:1rem;padding:1rem;border:1px solid rgba(184,238,117,.18);background:#0b0d09}.examination-controls{display:grid;gap:.55rem}.examination-controls button{min-height:48px;padding:.7rem .8rem;border:1px solid rgba(184,238,117,.36);background:#070a06;color:#d7e9bc;font:700 .7rem/1.25 ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono",monospace;letter-spacing:.06em;text-align:left;cursor:pointer}.examination-controls button[aria-pressed="true"]{border-color:#b8ee75;background:#16210f;color:#f1ffdf}.examination-controls button:hover{border-color:#b8ee75}.examination-controls button:focus-visible{outline:3px solid #b8ee75;outline-offset:3px}.examination-live{min-height:12rem;padding:1rem;border-left:3px solid #d0a75b;background:rgba(208,167,91,.055)}.examination-mode-label{display:block;color:#e5c784;font-size:.7rem}.examination-observation{margin:.8rem 0;color:#d5d8ca;font-size:.78rem;line-height:1.65}.examination-question{margin:.8rem 0 0;color:#a9b891;font-size:.66rem;line-height:1.55}.examination-boundary{margin:0;padding:.8rem;border:1px dashed rgba(214,79,58,.45);color:#d99a86;font-size:.62rem;line-height:1.55}.examination-table[data-mode="raking"] .examination-stage{background:linear-gradient(105deg,#090a07 0 42%,#574c31 43%,#13140d 58%)}.examination-table[data-mode="raking"] .examination-sheet{box-shadow:-20px 18px 30px rgba(0,0,0,.68),inset 12px 0 14px rgba(255,238,184,.13)}.examination-table[data-mode="raking"] .exam-pressure{opacity:1}.examination-table[data-mode="raking"] .exam-fold{background:rgba(72,51,18,.34);box-shadow:2px 0 rgba(255,244,204,.16)}.examination-table[data-mode="raking"] .exam-pinhole{opacity:.42;box-shadow:3px 2px 2px rgba(0,0,0,.42)}.examination-table[data-mode="transmitted"] .examination-stage{background:#d5b66a}.examination-table[data-mode="transmitted"] .examination-sheet{background:rgba(235,218,162,.78);box-shadow:0 0 2.5rem rgba(255,237,168,.75),inset 0 0 3rem rgba(111,82,33,.12)}.examination-table[data-mode="transmitted"] .exam-watermark{opacity:1;color:rgba(78,61,28,.34)}.examination-table[data-mode="transmitted"] .exam-pinhole{opacity:1;background:#f7df98;box-shadow:0 0 .3rem rgba(255,243,193,.85)}.examination-table[data-mode="transmitted"] .exam-fold{background:rgba(83,61,24,.26)}.examination-table[data-mode="transmitted"] .examination-sheet b{background:#26231c}@media(max-width:800px){.examination-workspace{grid-template-columns:1fr}.examination-stage{min-height:22rem}.examination-sheet{min-height:19rem;padding:1.6rem 1.3rem}.examination-table::before{position:static;display:inline-block;margin-bottom:.8rem}}@media(prefers-reduced-motion:reduce){.examination-table *{scroll-behavior:auto!important;transition:none!important;animation:none!important}.examination-sheet{transform:none}}@media(prefers-contrast:more){.examination-table,.examination-stage,.examination-console,.examination-controls button,.examination-boundary{border-color:currentColor}.examination-heading p,.examination-observation,.examination-question{color:#fff}.examination-sheet{outline:3px solid #000}}@media print{.examination-table{break-before:page;color:#000;background:#fff;box-shadow:none;border-color:#555}.examination-table::before,.examination-controls{display:none!important}.examination-workspace{display:block}.examination-stage,.examination-console,.examination-live,.examination-boundary{color:#000;background:#fff;border-color:#555}.examination-sheet{margin:1rem auto;box-shadow:none;transform:none}.exam-pressure,.exam-watermark{opacity:1!important}.examination-table *{color:#000!important}}
      `;
      document.head.append(style);
    }

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

    const lightTable = document.createElement('section');
    lightTable.id = 'examination-light-table';
    lightTable.className = 'examination-table';
    lightTable.dataset.mode = 'incident';
    lightTable.tabIndex = -1;
    lightTable.setAttribute('aria-labelledby', 'examination-light-table-title');

    const examHeading = document.createElement('header');
    examHeading.className = 'examination-heading';
    examHeading.append(
      text('span', '08-X / DOCUMENT EXAMINATION / FICTIONAL RECONSTRUCTION'),
      text('h2', 'THREE LIGHTS. ONE FRAGMENT.', 'examination-title'),
      text('p', 'The archive usually asks what a document says. The light table asks what kind of object the document is before the story gets involved.')
    );
    examHeading.querySelector('h2').id = 'examination-light-table-title';

    const workspace = document.createElement('div');
    workspace.className = 'examination-workspace';
    const stage = document.createElement('div');
    stage.className = 'examination-stage';
    stage.setAttribute('aria-hidden', 'true');
    const sheet = document.createElement('div');
    sheet.className = 'examination-sheet';
    sheet.innerHTML = '<span class="exam-fold"></span><span class="exam-pinhole exam-pinhole-a"></span><span class="exam-pinhole exam-pinhole-b"></span><span class="exam-pressure exam-pressure-a"></span><span class="exam-pressure exam-pressure-b"></span><span class="exam-watermark">ARCHIVE STOCK<br>— 04 —</span><small>DOCUMENT ID: FOUR-08 / RECONSTRUCTION</small><p>Subject exhibits <b></b> when exposed to <b></b>.</p><p>Secondary effects include <b></b> and <b></b>.</p><p>Recommended action: <b></b>.</p><p>Do not <b></b> under any circumstances.</p>';
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
    const boundary = text('p', 'FICTIONAL EXAMINATION // THE MODES CHANGE WHICH PHYSICAL FEATURES ARE EMPHASIZED. THEY DO NOT REVEAL THE WORDS UNDER THE REDACTIONS, AUTHENTICATE THE DOCUMENT, OR TURN PAGE FOUR INTO A CLAIM OF FACT.', 'examination-boundary');
    consolePanel.append(controls, live, boundary);
    workspace.append(stage, consolePanel);
    lightTable.append(examHeading, workspace);

    function render(mode, announceChange = false) {
      const safeMode = Object.hasOwn(modes, mode) ? mode : 'incident';
      const entry = modes[safeMode];
      lightTable.dataset.mode = safeMode;
      modeButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.examMode === safeMode)));
      modeLabel.textContent = entry.label;
      observation.textContent = entry.observation;
      question.textContent = `ARCHIVE QUESTION: ${entry.question}`;
      if (announceChange && status) status.textContent = `Examination light table: ${entry.label.toLowerCase()} selected. Physical clues changed; fictional redactions remain unreadable.`;
    }

    modeButtons.forEach((button) => button.addEventListener('click', () => render(button.dataset.examMode, true)));
    researchSection.insertAdjacentElement('beforebegin', lightTable);

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
  }

  const section = document.createElement('section');
  section.id = 'research-intake';
  section.className = 'research-wing';
  section.tabIndex = -1;
  section.setAttribute('aria-labelledby', 'research-intake-title');

  const heading = document.createElement('header');
  heading.className = 'research-heading';
  heading.append(
    text('span', '10 / EVIDENCE INTAKE'),
    text('h2', 'THE LATTICE', 'research-title'),
    text('p', 'Six real records. Zero permission to confuse a documented anomaly with the theory wrapped around it.')
  );

  const protocol = document.createElement('div');
  protocol.className = 'research-protocol';
  protocol.append(
    text('strong', 'INTAKE PROTOCOL:'),
    text('span', 'A record existing is evidence that a record exists.'),
    text('span', '“Unidentified” describes a gap, not a cause.'),
    text('span', 'A government file is not a government endorsement.'),
    text('span', 'Fiction is allowed to connect dots only after the dots are labeled honestly.')
  );

  const grid = document.createElement('div');
  grid.className = 'research-grid';
  evidence.forEach((item) => grid.append(createDossier(item)));

  const patternDesk = document.createElement('section');
  patternDesk.className = 'lattice-desk';
  patternDesk.setAttribute('aria-labelledby', 'lattice-desk-title');
  const deskHeader = text('h3', 'CROSS-CASE CORRELATION DESK');
  deskHeader.id = 'lattice-desk-title';
  const deskBoundary = text('p', 'EDITORIAL CONNECTIONS ONLY // NOT NEW EVIDENCE', 'lattice-boundary');
  const traceButton = document.createElement('button');
  traceButton.type = 'button';
  traceButton.id = 'trace-lattice';
  traceButton.textContent = 'TRACE NEXT CONNECTION';

  const output = document.createElement('div');
  output.id = 'lattice-output';
  output.className = 'lattice-output';
  output.setAttribute('role', 'status');
  output.setAttribute('aria-live', 'polite');

  let latticeIndex = 0;
  function renderConnection() {
    const item = lattice[latticeIndex];
    output.replaceChildren(
      text('strong', item.title),
      text('span', item.cases, 'lattice-cases'),
      text('p', item.finding),
      text('small', `BOUNDARY: ${item.boundary}`)
    );
    if (status) status.textContent = `Correlation desk: ${item.title.toLowerCase()}. Editorial connection only; source records unchanged.`;
  }

  traceButton.addEventListener('click', () => {
    latticeIndex = (latticeIndex + 1) % lattice.length;
    renderConnection();
  });
  renderConnection();
  patternDesk.append(deskHeader, deskBoundary, traceButton, output);

  const sourceLedger = document.createElement('a');
  sourceLedger.className = 'research-ledger-link';
  sourceLedger.href = 'PAGE_FOUR_RESEARCH.md';
  sourceLedger.textContent = 'OPEN PRIMARY-SOURCE LEDGER →';

  const finalRule = text('p', 'THE LATTICE IS NOT “THE ANSWER.” IT IS A MACHINE FOR ASKING BETTER QUESTIONS WITHOUT LYING ABOUT WHAT THE FILES SAY.', 'research-final-rule');

  section.append(heading, protocol, grid, patternDesk, sourceLedger, finalRule);
  mountAfter.insertAdjacentElement('afterend', section);
  mountExaminationLightTable(section);
  addNavLink();
})();
