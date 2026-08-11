'use strict';

(() => {
  const footer = document.querySelector('.archive-footer');
  const caseNav = document.querySelector('.case-nav');
  const archiveStatus = document.getElementById('archive-status');
  if (!footer || document.getElementById('dead-drop')) return;

  const puzzles = [
    {
      id: 'signal',
      number: 'LOCK 01',
      title: 'THE MISSING BEAT',
      challenge: '○ ○ ●  ○ ○ ●  ○ ○ ?',
      prompt: 'The strip repeats cleanly. What completes it?',
      options: [
        { label: '○', correct: false },
        { label: '●', correct: true },
        { label: '■', correct: false }
      ],
      hints: [
        'Look for a period, not a story.',
        'Count the distance between the filled beats.'
      ],
      solvedMessage: 'Pattern accepted. Every third beat is filled.',
      fragment: '05'
    },
    {
      id: 'cipher',
      number: 'LOCK 02',
      title: 'THE REDACTION STRIP',
      challenge: 'WKH ILOH LV QRW KHUH',
      prompt: 'One backward shift turns the strip into plain English. Which shift?',
      options: [
        { label: 'SHIFT −1', correct: false },
        { label: 'SHIFT −2', correct: false },
        { label: 'SHIFT −3', correct: true },
        { label: 'SHIFT −4', correct: false }
      ],
      hints: [
        'A Caesar shift moves every letter by the same amount.',
        'Move W backward three places and it becomes T.'
      ],
      solvedMessage: 'Strip opened: THE FILE IS NOT HERE.',
      fragment: 'LEVEL −1'
    },
    {
      id: 'logic',
      number: 'LOCK 03',
      title: 'THE THREE DRAWERS',
      challenge: 'A: “The envelope is in C.”  B: “The envelope is not in A.”  C: “The envelope is not in C.”',
      prompt: 'Exactly one statement is true. Which drawer holds the envelope?',
      options: [
        { label: 'DRAWER A', correct: true },
        { label: 'DRAWER B', correct: false },
        { label: 'DRAWER C', correct: false }
      ],
      hints: [
        'Test each drawer and count how many statements become true.',
        'If the envelope is in A, only statement C survives.'
      ],
      solvedMessage: 'Drawer A opens. The envelope contains no letter—only a routing stamp.',
      fragment: 'FREIGHT'
    },
    {
      id: 'evidence',
      number: 'LOCK 04',
      title: 'THE SOURCE COUNT',
      challenge: 'A: original fictional field note from one observer.  B: “copied from A.”  C: “summary of A/B packet.”',
      prompt: 'How many independent observations does this packet establish?',
      options: [
        { label: 'THREE — three records exist.', correct: false },
        { label: 'TWO — A and B agree.', correct: false },
        { label: 'ONE AT MOST — B and C descend from A.', correct: true }
      ],
      hints: [
        'Count source ancestors, not sheets of paper.',
        'A copy can multiply records without multiplying observations.'
      ],
      solvedMessage: 'Claim accepted. Three documents, one surviving source family. Repetition is not independent corroboration.',
      fragment: 'LIFT'
    }
  ];

  const solved = new Set();
  const hintIndex = new Map(puzzles.map((puzzle) => [puzzle.id, 0]));
  const puzzleViews = new Map();

  function text(tag, value, className = '') {
    const node = document.createElement(tag);
    node.textContent = value;
    if (className) node.className = className;
    return node;
  }

  function announce(message) {
    if (archiveStatus) archiveStatus.textContent = message;
    if (liveOutput) liveOutput.textContent = message;
  }

  function addNavLink() {
    if (!caseNav || document.getElementById('dead-drop-link')) return;
    const link = document.createElement('a');
    link.id = 'dead-drop-link';
    link.href = '#dead-drop';
    const number = document.createElement('span');
    number.textContent = '12';
    link.append(number, document.createTextNode(' Dead drop'));
    caseNav.append(link);
  }

  function renderProgress() {
    progress.replaceChildren();
    puzzles.forEach((puzzle, index) => {
      const cell = document.createElement('span');
      cell.className = 'dead-drop-progress-cell';
      const isSolved = solved.has(puzzle.id);
      cell.dataset.state = isSolved ? 'open' : 'sealed';
      cell.textContent = `${index + 1} ${isSolved ? 'OPEN' : 'SEALED'}`;
      progress.append(cell);
    });
    progress.setAttribute('aria-label', `${solved.size} of ${puzzles.length} locks opened`);
  }

  function checkFinalRoute() {
    renderProgress();
    const complete = solved.size === puzzles.length;
    finalRoute.hidden = !complete;
    resetButton.hidden = !solved.size;
    if (!complete) return;

    announce('Dead Drop complete. Route 05 recovered: service level minus one, freight lift. Museum fiction; same-origin route only.');
  }

  function solvePuzzle(puzzle, optionButton, option) {
    const view = puzzleViews.get(puzzle.id);
    if (!view || solved.has(puzzle.id)) return;

    [...view.options.children].forEach((button) => button.setAttribute('aria-pressed', 'false'));
    optionButton.setAttribute('aria-pressed', 'true');

    if (!option.correct) {
      view.feedback.textContent = 'NO MATCH. Nothing is locked out. Re-read the clue or request a hint.';
      announce(`${puzzle.title}: no match. Try again or request a hint.`);
      return;
    }

    solved.add(puzzle.id);
    view.card.dataset.state = 'solved';
    [...view.options.children].forEach((button) => {
      button.disabled = true;
      if (button !== optionButton) button.setAttribute('aria-pressed', 'false');
    });
    view.feedback.replaceChildren(
      text('strong', puzzle.solvedMessage),
      text('span', `ROUTE FRAGMENT: ${puzzle.fragment}`, 'dead-drop-fragment')
    );
    announce(`${puzzle.title} solved. Route fragment recovered: ${puzzle.fragment}.`);
    checkFinalRoute();
  }

  function requestHint(puzzle) {
    const view = puzzleViews.get(puzzle.id);
    if (!view) return;
    const index = hintIndex.get(puzzle.id) || 0;
    const clamped = Math.min(index, puzzle.hints.length - 1);
    view.hintOutput.textContent = `HINT ${clamped + 1}/${puzzle.hints.length}: ${puzzle.hints[clamped]}`;
    hintIndex.set(puzzle.id, Math.min(index + 1, puzzle.hints.length));
    view.hintButton.textContent = clamped + 1 >= puzzle.hints.length ? 'HINT FILE EXHAUSTED' : 'REQUEST ANOTHER HINT';
    announce(`${puzzle.title}: hint ${clamped + 1} opened. Hints do not reduce progress.`);
  }

  function createPuzzle(puzzle) {
    const card = document.createElement('article');
    card.className = 'dead-drop-puzzle';
    card.dataset.puzzle = puzzle.id;
    card.dataset.state = 'sealed';

    const head = document.createElement('header');
    head.append(text('span', puzzle.number, 'dead-drop-lock-number'), text('h3', puzzle.title));

    const challenge = text('p', puzzle.challenge, 'dead-drop-challenge');
    const prompt = text('p', puzzle.prompt, 'dead-drop-prompt');

    const options = document.createElement('div');
    options.className = 'dead-drop-options';
    options.setAttribute('role', 'group');
    options.setAttribute('aria-label', `${puzzle.title} answer choices`);

    puzzle.options.forEach((option) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = option.label;
      button.setAttribute('aria-pressed', 'false');
      button.addEventListener('click', () => solvePuzzle(puzzle, button, option));
      options.append(button);
    });

    const hintRow = document.createElement('div');
    hintRow.className = 'dead-drop-hint-row';
    const hintButton = document.createElement('button');
    hintButton.type = 'button';
    hintButton.className = 'dead-drop-hint-button';
    hintButton.textContent = 'REQUEST HINT';
    const hintOutput = text('p', 'HINT FILE SEALED. Asking for help never costs progress.', 'dead-drop-hint-output');
    hintButton.addEventListener('click', () => requestHint(puzzle));
    hintRow.append(hintButton, hintOutput);

    const feedback = document.createElement('div');
    feedback.className = 'dead-drop-feedback';
    feedback.setAttribute('role', 'status');
    feedback.setAttribute('aria-live', 'polite');
    feedback.textContent = 'LOCK SEALED.';

    card.append(head, challenge, prompt, options, hintRow, feedback);
    puzzleViews.set(puzzle.id, { card, options, hintButton, hintOutput, feedback });
    return card;
  }

  function resetCase() {
    solved.clear();
    puzzles.forEach((puzzle) => {
      hintIndex.set(puzzle.id, 0);
      const view = puzzleViews.get(puzzle.id);
      if (!view) return;
      view.card.dataset.state = 'sealed';
      [...view.options.children].forEach((button) => {
        button.disabled = false;
        button.setAttribute('aria-pressed', 'false');
      });
      view.hintButton.textContent = 'REQUEST HINT';
      view.hintOutput.textContent = 'HINT FILE SEALED. Asking for help never costs progress.';
      view.feedback.textContent = 'LOCK SEALED.';
    });
    finalRoute.hidden = true;
    resetButton.hidden = true;
    renderProgress();
    announce('Dead Drop reset. Four locks sealed. Nothing was stored.');
  }

  const section = document.createElement('section');
  section.id = 'dead-drop';
  section.className = 'dead-drop';
  section.setAttribute('aria-labelledby', 'dead-drop-title');

  const heading = document.createElement('header');
  heading.className = 'dead-drop-heading';
  const eyebrow = text('span', '12 / DEAD DROP / RECRUITMENT FILE');
  const title = text('h2', 'FOUR LOCKS, ONE ROUTE', 'dead-drop-title');
  title.id = 'dead-drop-title';
  const intro = text('p', 'Someone left a route inside four small problems. Solve them in any order. Hints are evidence, not failure.');
  const boundary = text('p', 'PUZZLE FICTION // REAL-EVIDENCE QUESTIONS KEEP THEIR ORIGINAL LIMITS', 'dead-drop-boundary');
  heading.append(eyebrow, title, intro, boundary);

  const protocol = document.createElement('div');
  protocol.className = 'dead-drop-protocol';
  protocol.append(
    text('strong', 'FIELD RULES:'),
    text('span', 'No typed answers.'),
    text('span', 'No timer.'),
    text('span', 'No penalty for hints.'),
    text('span', 'No progress leaves this page.')
  );

  const progress = document.createElement('div');
  progress.className = 'dead-drop-progress';
  progress.setAttribute('role', 'status');
  progress.setAttribute('aria-live', 'polite');

  const liveOutput = text('p', 'Dead Drop ready. Four locks sealed.', 'dead-drop-live');
  liveOutput.setAttribute('role', 'status');
  liveOutput.setAttribute('aria-live', 'polite');

  const grid = document.createElement('div');
  grid.className = 'dead-drop-grid';
  puzzles.forEach((puzzle) => grid.append(createPuzzle(puzzle)));

  const finalRoute = document.createElement('section');
  finalRoute.className = 'dead-drop-final';
  finalRoute.hidden = true;
  finalRoute.setAttribute('aria-labelledby', 'dead-drop-final-title');
  const finalLabel = text('span', 'BLACK FILE 000 / ROUTE RECOVERED');
  const finalTitle = text('h3', '05 // LEVEL −1 // FREIGHT LIFT');
  finalTitle.id = 'dead-drop-final-title';
  const finalCopy = text('p', 'The public floor plan stops before this route. The freight lift does not.');
  const finalLink = document.createElement('a');
  finalLink.href = 'elsewhere.html';
  finalLink.textContent = 'FOLLOW ROUTE 05 →';
  const finalBoundary = text('small', 'MUSEUM FICTION. SAME-ORIGIN ROUTE. NO CLAIM ABOUT THE WORLD OUTSIDE.');
  finalRoute.append(finalLabel, finalTitle, finalCopy, finalLink, finalBoundary);

  const resetButton = document.createElement('button');
  resetButton.type = 'button';
  resetButton.id = 'dead-drop-reset';
  resetButton.textContent = 'RESEAL ALL FOUR LOCKS';
  resetButton.hidden = true;
  resetButton.addEventListener('click', resetCase);

  const finalRule = text('p', 'A PUZZLE MAY HIDE AN ANSWER. EVIDENCE MAY NOT.', 'dead-drop-final-rule');

  section.append(heading, protocol, progress, liveOutput, grid, finalRoute, resetButton, finalRule);
  footer.insertAdjacentElement('beforebegin', section);
  addNavLink();
  renderProgress();
})();

(() => {
  const maps = document.getElementById('maps');
  const deadDrop = document.getElementById('dead-drop');
  const caseNav = document.querySelector('.case-nav');
  const archiveStatus = document.getElementById('archive-status');
  if (!maps || !deadDrop || document.getElementById('map-comparison-table')) return;

  const style = document.createElement('style');
  style.id = 'page-four-map-comparison-style';
  style.textContent = `
    .map-comparison{--split:50%;position:relative;margin:2rem 0;padding:clamp(1rem,3vw,2rem);border:1px solid rgba(138,165,174,.35);background:#0c1110;color:#dce8e5;box-shadow:inset 0 0 34px rgba(0,0,0,.42)}
    .map-comparison>header{display:grid;gap:.55rem;padding-bottom:1rem;border-bottom:1px dashed rgba(138,165,174,.32)}.map-comparison>header span,.map-swipe-label,.map-swipe-readout,.map-comparison-boundary{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono",monospace;letter-spacing:.08em;text-transform:uppercase}.map-comparison>header span{color:#b8d3dc;font-size:.7rem}.map-comparison h2{margin:0;color:#eef6f3;font-family:Georgia,"Times New Roman",serif;font-size:clamp(1.8rem,5vw,3.7rem);font-weight:500;line-height:.96}.map-comparison>header p{max-width:76ch;margin:0;color:#b8c5c4;line-height:1.6}
    .map-swipe-stage{position:relative;min-height:25rem;margin-top:1rem;overflow:hidden;border:1px solid rgba(184,211,220,.24);background:#c6bea0;color:#25281f;box-shadow:0 14px 28px rgba(0,0,0,.38)}.map-swipe-layer{position:absolute;inset:0}.map-swipe-layer::before{content:"";position:absolute;inset:8% 7%;background:repeating-linear-gradient(8deg,transparent 0 22px,rgba(42,49,39,.12) 23px 24px),repeating-linear-gradient(92deg,transparent 0 34px,rgba(42,49,39,.08) 35px 36px)}.map-swipe-layer::after{content:"";position:absolute;width:46%;height:34%;left:13%;top:20%;border:3px solid currentColor;border-radius:48% 41% 52% 44%;transform:rotate(-7deg);box-shadow:8rem 7rem 0 -6rem currentColor}.map-swipe-a{background:#c6bea0}.map-swipe-b{clip-path:inset(0 0 0 var(--split));background:#aeb8ae}.map-swipe-b::after{left:24%;top:17%;width:43%;height:38%;transform:rotate(4deg);border-radius:42% 55% 44% 50%;box-shadow:7rem 8rem 0 -6rem currentColor}.map-road{position:absolute;left:8%;right:7%;top:59%;height:3px;background:currentColor;transform:rotate(-8deg);transform-origin:left center}.map-road::after{content:"ROUTE 6";position:absolute;right:9%;top:.6rem;font:700 .58rem/1 ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono",monospace}.map-swipe-b .map-road{top:48%;left:18%;right:3%;transform:rotate(6deg)}.map-swipe-b .map-road::after{content:"ROUTE 6B"}.map-landmark{position:absolute;left:62%;top:31%;width:1rem;height:1rem;border:3px solid currentColor;transform:rotate(45deg)}.map-swipe-b .map-landmark{left:58%;top:42%}.map-edition{position:absolute;left:1rem;bottom:1rem;padding:.35rem .5rem;border:1px solid currentColor;background:rgba(246,241,216,.82);font:700 .62rem/1.2 ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono",monospace;letter-spacing:.07em}.map-swipe-b .map-edition{left:auto;right:1rem;background:rgba(228,237,231,.88)}.map-swipe-divider{position:absolute;z-index:3;top:0;bottom:0;left:var(--split);width:3px;background:#d64f3a;transform:translateX(-1.5px);pointer-events:none}.map-swipe-divider::before{content:"↔";position:absolute;top:50%;left:50%;display:grid;place-items:center;width:2.5rem;height:2.5rem;border:2px solid #d64f3a;border-radius:50%;background:#0b0d0a;color:#ffd9cf;transform:translate(-50%,-50%);font-weight:700}
    .map-swipe-controls{display:grid;grid-template-columns:minmax(10rem,.35fr) minmax(0,.65fr);gap:1rem;align-items:center;margin-top:1rem;padding:1rem;border:1px solid rgba(184,211,220,.18);background:#0a0e0d}.map-swipe-label{color:#c5e0e8;font-size:.68rem}.map-swipe-readout{display:block;margin-top:.35rem;color:#e5c784;font-size:.62rem;line-height:1.5}.map-swipe-controls input[type="range"]{width:100%;min-height:44px;accent-color:#d64f3a}.map-swipe-controls input[type="range"]:focus-visible{outline:3px solid #b8d3dc;outline-offset:4px}.map-comparison-note{max-width:76ch;margin:1rem 0 0;color:#c5d0ce;font-size:.76rem;line-height:1.65}.map-comparison-note strong{color:#f1f5f3}.map-comparison-boundary{margin:1rem 0 0;padding:.75rem;border-left:3px solid #d64f3a;color:#d99a86;font-size:.62rem;line-height:1.55}
    @media(max-width:700px){.map-swipe-stage{min-height:19rem}.map-swipe-controls{grid-template-columns:1fr}.map-swipe-divider::before{width:2.1rem;height:2.1rem}}@media(prefers-reduced-motion:reduce){.map-comparison *{scroll-behavior:auto!important;transition:none!important;animation:none!important}}@media(prefers-contrast:more){.map-comparison,.map-swipe-stage,.map-swipe-controls{border:2px solid currentColor}.map-comparison>header p,.map-comparison-note{color:#fff}.map-swipe-divider{width:5px}}@media print{.map-comparison{--split:50%;color:#000;background:#fff;box-shadow:none;border-color:#555}.map-comparison *{color:#000!important;border-color:#555!important}.map-swipe-controls input{display:none}.map-swipe-stage{background:#fff}.map-swipe-a{background:#eee}.map-swipe-b{background:#ddd}}
  `;
  document.head.append(style);

  const section = document.createElement('section');
  section.id = 'map-comparison-table';
  section.className = 'map-comparison';
  section.setAttribute('aria-labelledby', 'map-comparison-title');

  const heading = document.createElement('header');
  const eyebrow = document.createElement('span');
  eyebrow.textContent = '02-X / MAP TABLE / EDITION SWIPE';
  const title = document.createElement('h2');
  title.id = 'map-comparison-title';
  title.textContent = 'THE ROAD MOVED. OR THE EDITION DID.';
  const intro = document.createElement('p');
  intro.textContent = 'File 02 says two surviving copies disagree. Slide the divider across two authored fictional editions and inspect exactly what changes before deciding that “the map moved” is the only story available.';
  heading.append(eyebrow, title, intro);

  const stage = document.createElement('div');
  stage.className = 'map-swipe-stage';
  stage.setAttribute('role', 'img');
  stage.setAttribute('aria-label', 'Two fictional map editions overlaid. Edition B is revealed to the right of the movable comparison divider. Coastline, route and landmark positions differ.');

  const editionA = document.createElement('div');
  editionA.className = 'map-swipe-layer map-swipe-a';
  editionA.setAttribute('aria-hidden', 'true');
  const roadA = document.createElement('span');
  roadA.className = 'map-road';
  const landmarkA = document.createElement('span');
  landmarkA.className = 'map-landmark';
  const labelA = document.createElement('span');
  labelA.className = 'map-edition';
  labelA.textContent = 'EDITION A / ENDPOINT COPY';
  editionA.append(roadA, landmarkA, labelA);

  const editionB = document.createElement('div');
  editionB.className = 'map-swipe-layer map-swipe-b';
  editionB.setAttribute('aria-hidden', 'true');
  const roadB = document.createElement('span');
  roadB.className = 'map-road';
  const landmarkB = document.createElement('span');
  landmarkB.className = 'map-landmark';
  const labelB = document.createElement('span');
  labelB.className = 'map-edition';
  labelB.textContent = 'EDITION B / ENDPOINT COPY';
  editionB.append(roadB, landmarkB, labelB);

  const divider = document.createElement('span');
  divider.className = 'map-swipe-divider';
  divider.setAttribute('aria-hidden', 'true');
  stage.append(editionA, editionB, divider);

  const controls = document.createElement('div');
  controls.className = 'map-swipe-controls';
  const controlCopy = document.createElement('div');
  const controlLabel = document.createElement('label');
  controlLabel.className = 'map-swipe-label';
  controlLabel.htmlFor = 'map-edition-swipe';
  controlLabel.textContent = 'COMPARE EDITIONS';
  const readout = document.createElement('output');
  readout.className = 'map-swipe-readout';
  readout.htmlFor = 'map-edition-swipe';
  readout.textContent = '50% A / 50% B';
  controlCopy.append(controlLabel, readout);

  const slider = document.createElement('input');
  slider.id = 'map-edition-swipe';
  slider.type = 'range';
  slider.min = '5';
  slider.max = '95';
  slider.value = '50';
  slider.step = '1';
  slider.setAttribute('aria-describedby', 'map-comparison-note');
  slider.addEventListener('input', () => {
    const split = Number(slider.value);
    section.style.setProperty('--split', `${split}%`);
    readout.textContent = `${split}% A / ${100 - split}% B`;
  });
  controls.append(controlCopy, slider);

  const note = document.createElement('p');
  note.id = 'map-comparison-note';
  note.className = 'map-comparison-note';
  const strong = document.createElement('strong');
  strong.textContent = 'What the comparison earns:';
  note.append(strong, document.createTextNode(' the coastline, route and landmark differ between these two endpoint copies. It does not tell us whether the cause was an ordinary revision, a redraw, a copying error, a missing intermediate edition, or anything stranger.'));

  const boundary = document.createElement('p');
  boundary.className = 'map-comparison-boundary';
  boundary.textContent = 'FICTIONAL CARTOGRAPHIC COMPARISON // TWO DISCREPANT ENDPOINTS DO NOT REVEAL THE MISSING REVISION HISTORY. DIFFERENCE IS OBSERVED; CAUSE REMAINS OPEN.';

  section.append(heading, stage, controls, note, boundary);
  deadDrop.insertAdjacentElement('beforebegin', section);

  if (caseNav && !document.getElementById('map-comparison-link')) {
    const link = document.createElement('a');
    link.id = 'map-comparison-link';
    link.href = '#map-comparison-table';
    const number = document.createElement('span');
    number.textContent = '02X';
    link.append(number, document.createTextNode(' Map comparison'));
    caseNav.append(link);
  }

  if (archiveStatus) {
    slider.addEventListener('change', () => {
      archiveStatus.textContent = 'Map comparison adjusted. The editions differ; the missing revision history still does not tell us why.';
    });
  }
})();
