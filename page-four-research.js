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
  addNavLink();

  if (!document.getElementById('page-four-examination-style')) {
    const examinationStyle = document.createElement('link');
    examinationStyle.id = 'page-four-examination-style';
    examinationStyle.rel = 'stylesheet';
    examinationStyle.href = 'page-four-examination.css';
    document.head.append(examinationStyle);
  }

  if (!document.getElementById('page-four-examination-script')) {
    const examinationScript = document.createElement('script');
    examinationScript.id = 'page-four-examination-script';
    examinationScript.src = 'page-four-examination.js';
    examinationScript.defer = true;
    document.body.append(examinationScript);
  }
})();
