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
