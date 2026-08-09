'use strict';

(() => {
  const cases = [...document.querySelectorAll('[data-case]')];
  const status = document.getElementById('archive-status');
  const randomButton = document.getElementById('random-file');
  const classificationButton = document.getElementById('classification-toggle');
  const evidenceButtons = [...document.querySelectorAll('[data-target]')];
  const controlStack = document.querySelector('.control-stack');
  const caseNav = document.querySelector('.case-nav');
  const archiveSidebar = document.querySelector('.archive-sidebar');
  const reducedMotion = typeof globalThis.matchMedia === 'function'
    ? globalThis.matchMedia('(prefers-reduced-motion: reduce)')
    : null;

  function announce(message) {
    if (status) status.textContent = message;
  }

  function caseById(id) {
    return cases.find((item) => item.id === id) || null;
  }

  function markActive(target) {
    cases.forEach((item) => item.classList.toggle('is-active', item === target));
  }

  function focusCase(id, sourceLabel = 'Archive') {
    const target = caseById(id);
    if (!target) return;

    markActive(target);
    target.scrollIntoView({ behavior: reducedMotion?.matches ? 'auto' : 'smooth', block: 'start' });
    target.focus({ preventScroll: true });
    announce(`${sourceLabel}: file ${id.replaceAll('-', ' ')} selected. Evidence remains unverified.`);
  }

  function randomIndex(length) {
    if (length < 2) return 0;
    if (globalThis.crypto && typeof globalThis.crypto.getRandomValues === 'function') {
      const value = new Uint32Array(1);
      globalThis.crypto.getRandomValues(value);
      return value[0] % length;
    }
    return Math.floor(Math.random() * length);
  }

  function currentCase() {
    const active = cases.find((item) => item.classList.contains('is-active'));
    if (active) return active;

    const hashId = globalThis.location.hash.replace(/^#/, '');
    return caseById(hashId);
  }

  function caseTitle(target) {
    return target?.querySelector('h2')?.textContent?.trim() || target?.id?.replaceAll('-', ' ') || 'UNFILED CASE';
  }

  function pageUrl(caseId = '') {
    const url = new URL(globalThis.location.href);
    url.hash = caseId ? `#${caseId}` : '';
    return url.toString();
  }

  function leakText(target = null) {
    if (!target) {
      return `PAGE FOUR / THE UNFILED ARCHIVE — fictional folklore + speculative fiction, no claim of fact. ${pageUrl()}`;
    }

    return `PAGE FOUR / FILE ${target.id.toUpperCase()} — ${caseTitle(target)}. Fictional, unverified archive material; no claim of fact. ${pageUrl(target.id)}`;
  }

  async function copyLeak(target = null) {
    const clipboard = navigator.clipboard;
    if (!clipboard || typeof clipboard.writeText !== 'function') {
      announce('Leak desk unavailable: this browser did not grant clipboard access. The case permalink remains in the address bar when you open a file.');
      return;
    }

    try {
      await clipboard.writeText(leakText(target));
      announce(target
        ? `Leak desk: copied a fictional permalink for ${caseTitle(target)}. You decide where it goes next.`
        : 'Leak desk: copied the Page Four address with its fictional-archive warning. You decide where it goes next.');
    } catch (error) {
      announce('Leak desk blocked by the browser. Nothing was transmitted; use the browser address bar if you still want the link.');
    }
  }

  function addLeakDesk() {
    if (controlStack && !document.getElementById('copy-page-four')) {
      const copyPageButton = document.createElement('button');
      copyPageButton.type = 'button';
      copyPageButton.id = 'copy-page-four';
      copyPageButton.textContent = 'COPY PAGE FOUR LINK';
      copyPageButton.addEventListener('click', () => copyLeak());

      const copyFileButton = document.createElement('button');
      copyFileButton.type = 'button';
      copyFileButton.id = 'copy-active-file';
      copyFileButton.textContent = 'COPY ACTIVE FILE LINK';
      copyFileButton.addEventListener('click', () => {
        const target = currentCase();
        if (!target) {
          announce('Leak desk: open or select a file first, then copy its permalink.');
          return;
        }
        copyLeak(target);
      });

      controlStack.append(copyPageButton, copyFileButton);
    }

    if (caseNav && !document.getElementById('public-leak-channel')) {
      const channel = document.createElement('a');
      channel.id = 'public-leak-channel';
      channel.href = 'almost-online.html';
      const number = document.createElement('span');
      number.textContent = '!!';
      channel.append(number, document.createTextNode(' Public leak channel'));
      caseNav.append(channel);
    }
  }

  function addRumorSightings() {
    if (!archiveSidebar || document.getElementById('rumor-sightings')) return;

    const log = document.createElement('div');
    log.id = 'rumor-sightings';
    log.className = 'note-card';

    const title = document.createElement('strong');
    title.textContent = 'KNOWN LEAK POINTS:';
    const entrance = document.createElement('span');
    entrance.textContent = 'MUSEUM ENTRANCE / PUBLIC LISTING';
    const web = document.createElement('span');
    web.textContent = 'ALMOST ONLINE! / UNLISTED BULLETIN';
    const boundary = document.createElement('small');
    boundary.textContent = 'STATIC ROUTES. NO VISITOR STATE OR COUNTING.';

    log.append(title, entrance, web, boundary);
    const fictionLabel = archiveSidebar.querySelector('.fiction-label');
    if (fictionLabel) archiveSidebar.insertBefore(log, fictionLabel);
    else archiveSidebar.append(log);
  }

  function injectFindingAidStyles() {
    if (document.getElementById('page-four-finding-aid-style')) return;

    const style = document.createElement('style');
    style.id = 'page-four-finding-aid-style';
    style.textContent = `
      .finding-aid{margin:0 0 2rem;border-block:1px solid rgba(164,190,118,.22);background:rgba(5,8,5,.58)}
      .finding-aid summary{min-height:64px;display:grid;grid-template-columns:minmax(9rem,.28fr) minmax(0,.72fr);gap:1rem 2rem;align-items:center;padding:1rem;cursor:pointer;list-style:none}
      .finding-aid summary::-webkit-details-marker{display:none}.finding-aid summary::after{content:"OPEN +";grid-column:1;color:#8fbf55;font-size:.62rem;font-weight:700;letter-spacing:.11em}.finding-aid[open] summary::after{content:"CLOSE −"}
      .finding-aid summary span{color:#8fbf55;font-size:.66rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase}.finding-aid summary strong{color:#edf8d8;font-family:Georgia,"Times New Roman",serif;font-size:clamp(1.35rem,3vw,2.3rem);font-weight:500;line-height:1.05}
      .finding-aid summary:focus-visible{outline:3px solid #b8ee75;outline-offset:3px}.finding-aid-body{padding:0 1rem 1.2rem}.finding-aid-intro{max-width:76ch;margin:0 0 1rem;color:#b7bea3;line-height:1.55}
      .finding-aid-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));border-top:1px solid rgba(164,190,118,.18);border-left:1px solid rgba(164,190,118,.18)}.finding-aid-entry{min-width:0;padding:1rem;border-right:1px solid rgba(164,190,118,.18);border-bottom:1px solid rgba(164,190,118,.18)}
      .finding-aid-entry h3{margin:0;color:#d0a75b;font-size:.72rem;letter-spacing:.09em}.finding-aid-entry p{margin:.55rem 0;color:#aeb7a0;font-size:.76rem;line-height:1.5}.finding-aid-links{display:flex;flex-wrap:wrap;gap:.4rem}.finding-aid-links a{min-height:44px;display:inline-flex;align-items:center;padding:.45rem .6rem;border:1px solid rgba(184,238,117,.24);color:#dce8c8;font-size:.66rem;text-decoration:none}.finding-aid-links a:hover{border-color:#b8ee75;background:rgba(143,191,85,.08)}.finding-aid-links a:focus-visible{outline:3px solid #b8ee75;outline-offset:2px}
      .finding-aid-boundary{margin:1rem 0 0;padding:.7rem;border-left:3px solid #d64f3a;color:#d99a86;font-size:.65rem;line-height:1.5;letter-spacing:.07em;text-transform:uppercase}
      @media(max-width:700px){.finding-aid summary{grid-template-columns:1fr;gap:.45rem}.finding-aid summary::after{grid-column:auto}.finding-aid-grid{grid-template-columns:1fr}}
      @media(prefers-contrast:more){.finding-aid,.finding-aid-grid,.finding-aid-entry,.finding-aid-links a{border-color:currentColor}.finding-aid-intro,.finding-aid-entry p{color:#fff}}
      @media print{.finding-aid{color:#000;background:#fff;border-color:#555}.finding-aid summary{display:none}.finding-aid:not([open])>.finding-aid-body{display:block}.finding-aid-body,.finding-aid-entry,.finding-aid-links a,.finding-aid-boundary{color:#000!important;background:#fff;border-color:#555}}
    `;
    document.head.append(style);
  }

  function mountFindingAid() {
    const caseGrid = document.querySelector('.case-grid');
    if (!caseGrid || document.getElementById('finding-aid')) return;

    injectFindingAidStyles();

    const threads = [
      {
        term: 'UNRELIABLE SCALE',
        files: ['cryptids', 'maps', 'diagrams'],
        note: 'Distance, size, orientation or proportion is doing more work than the surviving record can support.'
      },
      {
        term: 'MISSING ORIGIN',
        files: ['maps', 'broadcasts', 'redactions'],
        note: 'A route, transmission or fragment survives after its source metadata has gone missing. Shared absence does not imply a shared source.'
      },
      {
        term: 'WITNESS FILTER',
        files: ['cryptids', 'field-notes', 'witnesses'],
        note: 'Observation arrives through viewpoint, memory and retelling. Similar language may describe the recorder as much as the event.'
      },
      {
        term: 'PATTERN PRESSURE',
        files: ['celestial', 'diagrams', 'evidence'],
        note: 'The archive notices repeated shapes, timings and alignments. An index may preserve resemblance without promoting it to mechanism.'
      }
    ];

    const details = document.createElement('details');
    details.id = 'finding-aid';
    details.className = 'finding-aid';

    const summary = document.createElement('summary');
    const label = document.createElement('span');
    label.textContent = 'FINDING AID / SUBJECT ACCESS';
    const title = document.createElement('strong');
    title.textContent = 'THE FILES DO NOT AGREE ON WHY THEY RHYME.';
    summary.append(label, title);

    const body = document.createElement('div');
    body.className = 'finding-aid-body';
    const intro = document.createElement('p');
    intro.className = 'finding-aid-intro';
    intro.textContent = 'Archivists use finding aids to expose relationships without rewriting the records themselves. PAGE FOUR now keeps four hand-authored subject threads across its existing fictional files. Each thread names a recurring archival problem, not a hidden explanation.';

    const grid = document.createElement('div');
    grid.className = 'finding-aid-grid';
    threads.forEach((thread) => {
      const entry = document.createElement('article');
      entry.className = 'finding-aid-entry';
      const heading = document.createElement('h3');
      heading.textContent = thread.term;
      const note = document.createElement('p');
      note.textContent = thread.note;
      const links = document.createElement('nav');
      links.className = 'finding-aid-links';
      links.setAttribute('aria-label', `${thread.term} cross-references`);

      thread.files.forEach((fileId) => {
        const target = caseById(fileId);
        if (!target) return;
        const link = document.createElement('a');
        link.href = `#${fileId}`;
        link.textContent = caseTitle(target);
        link.addEventListener('click', () => {
          markActive(target);
          announce(`Finding aid: ${thread.term.toLowerCase()} cross-reference opened. Shared index terms are not evidence of a common cause.`);
        });
        links.append(link);
      });

      entry.append(heading, note, links);
      grid.append(entry);
    });

    const boundary = document.createElement('p');
    boundary.className = 'finding-aid-boundary';
    boundary.textContent = 'FICTIONAL CROSS-REFERENCES // SHARED MOTIFS ARE EDITORIAL INDEX TERMS, NOT EVIDENCE OF A COMMON CAUSE.';

    body.append(intro, grid, boundary);
    details.append(summary, body);
    details.addEventListener('toggle', () => {
      if (details.open) announce('Finding aid opened. Cross-references describe recurring archival problems, not a solved pattern.');
    });
    caseGrid.insertAdjacentElement('beforebegin', details);
  }

  function injectProvenanceStyles() {
    if (document.getElementById('page-four-provenance-style')) return;

    const style = document.createElement('style');
    style.id = 'page-four-provenance-style';
    style.textContent = `
      .provenance-rewind{position:relative;margin-top:2rem;padding:clamp(1rem,3vw,2rem);border:1px solid rgba(184,238,117,.28);background:linear-gradient(100deg,rgba(10,13,9,.98),rgba(17,15,9,.96));box-shadow:inset 0 0 36px rgba(0,0,0,.55)}
      .provenance-rewind::before{content:"FICTIONAL CLAIM / PROVENANCE TRACE";position:absolute;top:-.72rem;right:1rem;padding:.28rem .55rem;border:1px solid #b8ee75;background:#080b07;color:#b8ee75;font-size:.64rem;letter-spacing:.12em}
      .provenance-rewind header{display:grid;gap:.55rem;padding-bottom:1rem;border-bottom:1px dashed rgba(184,238,117,.26)}
      .provenance-rewind header>span,.provenance-boundary,.provenance-stage-label,.provenance-source,.provenance-rule{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono",monospace;letter-spacing:.09em;text-transform:uppercase}
      .provenance-rewind header>span{color:#8fbf55;font-size:.72rem}.provenance-rewind h2{margin:0;color:#edf8d8;font-size:clamp(1.8rem,5vw,4rem);line-height:.95}.provenance-rewind header p{max-width:72ch;margin:0;color:#b7bea3;line-height:1.55}.provenance-boundary{color:#d99a86!important;font-size:.64rem}
      .provenance-tape{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:1rem;margin-top:1rem;padding:clamp(1rem,3vw,1.6rem);border:1px solid rgba(208,167,91,.32);background:repeating-linear-gradient(0deg,rgba(208,167,91,.035) 0 1px,transparent 1px 5px),#0b0c08}
      .provenance-stage{min-width:0}.provenance-stage-label{display:block;margin-bottom:.7rem;color:#d0a75b;font-size:.68rem}.provenance-claim{margin:0;color:#fff3d5;font-family:Georgia,"Times New Roman",serif;font-size:clamp(1.25rem,3vw,2.15rem);line-height:1.3}.provenance-source{margin:.8rem 0 0;color:#879174;font-size:.65rem;line-height:1.5}.provenance-state{align-self:start;min-width:9rem;padding:.7rem;border:1px solid rgba(184,238,117,.28);color:#b8ee75;text-align:center;font-size:.68rem;font-weight:700;letter-spacing:.08em}
      .provenance-delta{display:grid;grid-template-columns:auto 1fr;gap:.65rem;margin:1rem 0 0;padding:.8rem;border-left:3px solid #d0a75b;background:rgba(208,167,91,.055);color:#c7cbb9;font-size:.76rem;line-height:1.55}.provenance-delta strong{color:#e5c784}
      .provenance-trace{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.35rem;margin:1rem 0}.provenance-trace span{min-height:2.6rem;display:grid;place-items:center;padding:.45rem;border:1px solid rgba(184,238,117,.17);color:#728063;font-size:.62rem;text-align:center}.provenance-trace span[data-active="true"]{border-color:#b8ee75;color:#e8ffd0;background:rgba(143,191,85,.09)}
      .provenance-controls{display:flex;flex-wrap:wrap;gap:.65rem}.provenance-controls button{min-height:44px;padding:.65rem .85rem;border:1px solid #8fbf55;background:#070a06;color:#d9efb9;font:inherit;font-size:.72rem;font-weight:700;cursor:pointer}.provenance-controls button:disabled{opacity:.42;cursor:default}.provenance-controls button:not(:disabled):hover{background:#14200e}.provenance-controls button:focus-visible{outline:3px solid #b8ee75;outline-offset:3px}
      .provenance-live{min-height:1.4em;margin:.8rem 0 0;color:#879174;font-size:.7rem}.provenance-rule{margin:1rem 0 0;padding:.75rem;border:1px dashed rgba(184,238,117,.28);color:#b8ee75;text-align:center;font-size:.7rem}
      @media(max-width:700px){.provenance-tape{grid-template-columns:1fr}.provenance-state{width:fit-content}.provenance-trace{grid-template-columns:repeat(2,minmax(0,1fr))}.provenance-delta{grid-template-columns:1fr}.provenance-rewind::before{position:static;display:inline-block;margin-bottom:.8rem}}
      @media(prefers-reduced-motion:reduce){.provenance-rewind *{scroll-behavior:auto!important;transition:none!important;animation:none!important}}
      @media(prefers-contrast:more){.provenance-rewind,.provenance-tape,.provenance-state,.provenance-trace span,.provenance-controls button{border-color:currentColor}.provenance-rewind header p,.provenance-delta,.provenance-live{color:#fff}}
      @media print{.provenance-rewind{break-before:page;color:#000;background:#fff;box-shadow:none}.provenance-rewind::before,.provenance-controls,.provenance-live{display:none!important}.provenance-tape,.provenance-state,.provenance-trace span,.provenance-delta{color:#000;background:#fff;border-color:#555}.provenance-rewind *{color:#000!important}}
    `;
    document.head.append(style);
  }

  function mountProvenanceRewind() {
    const footer = document.querySelector('.archive-footer');
    if (!footer || document.getElementById('provenance-rewind')) return;

    injectProvenanceStyles();

    const stages = [
      {
        label: 'HANDOFF 04 / EVIDENCE BOARD CLAIM',
        state: 'MOST ASSERTIVE WORDING',
        claim: 'THE NORTH CUT FIGURE RETURNS EVERY THIRTEEN NIGHTS.',
        source: 'FICTIONAL SYNTHESIS / NO PRIMARY SUPPORT FOR RECURRENCE OR INTERVAL',
        delta: 'The archive added a recurring identity and an exact thirteen-night schedule. Neither survives upstream.'
      },
      {
        label: 'HANDOFF 03 / CASE SUMMARY',
        state: 'COMPRESSED SUMMARY',
        claim: 'Several files describe the same tall figure returning to North Cut.',
        source: 'FICTIONAL CASE SUMMARY / MULTIPLE UNVERIFIED FILES',
        delta: 'The summary turned resemblance into sameness and separate sightings into a return.'
      },
      {
        label: 'HANDOFF 02 / RETELLING',
        state: 'UNRESOLVED RESEMBLANCE',
        claim: 'Two fictional accounts mention something tall near a treeline. Their dates, distance estimates and descriptions do not agree.',
        source: 'FICTIONAL RETELLING / ACCOUNTS DO NOT SHARE A VERIFIED SCALE OR DATE',
        delta: 'A vague resemblance remains. The shared identity, location precision and schedule are gone.'
      },
      {
        label: 'HANDOFF 01 / EARLIEST SURVIVING NOTE',
        state: 'OBSERVED, NOT IDENTIFIED',
        claim: '20:11 — movement at treeline. One observer. Distance unknown. No scale. Could not identify.',
        source: 'FICTIONAL FIELD NOTE / SINGLE OBSERVATION',
        delta: 'This is as far back as the fictional record goes. It contains no identity, recurrence, cause or interval.'
      }
    ];

    let stageIndex = 0;

    const section = document.createElement('section');
    section.id = 'provenance-rewind';
    section.className = 'provenance-rewind';
    section.setAttribute('aria-labelledby', 'provenance-rewind-title');

    const heading = document.createElement('header');
    const eyebrow = document.createElement('span');
    eyebrow.textContent = '13 / PROVENANCE REWIND / CLAIM ANATOMY';
    const title = document.createElement('h2');
    title.id = 'provenance-rewind-title';
    title.textContent = 'THE MORE WE OPEN, THE LESS IT KNOWS.';
    const intro = document.createElement('p');
    intro.textContent = 'Start with the archive’s most confident sentence, then rewind one handoff at a time. Nothing is solved. Each step restores context the next retelling compressed away.';
    const boundary = document.createElement('p');
    boundary.className = 'provenance-boundary';
    boundary.textContent = 'FICTIONAL CASE // THIS TRACE DEMONSTRATES HOW WORDING CAN GAIN CERTAINTY WHILE SOURCES LOSE DETAIL';
    heading.append(eyebrow, title, intro, boundary);

    const tape = document.createElement('div');
    tape.className = 'provenance-tape';
    const stage = document.createElement('div');
    stage.className = 'provenance-stage';
    const stageLabel = document.createElement('span');
    stageLabel.className = 'provenance-stage-label';
    const claim = document.createElement('p');
    claim.className = 'provenance-claim';
    const source = document.createElement('p');
    source.className = 'provenance-source';
    stage.append(stageLabel, claim, source);
    const state = document.createElement('div');
    state.className = 'provenance-state';
    tape.append(stage, state);

    const delta = document.createElement('p');
    delta.className = 'provenance-delta';
    const deltaLabel = document.createElement('strong');
    deltaLabel.textContent = 'WHAT CHANGED:';
    const deltaText = document.createElement('span');
    delta.append(deltaLabel, deltaText);

    const trace = document.createElement('div');
    trace.className = 'provenance-trace';
    trace.setAttribute('aria-label', 'Four handoffs from amplified claim back to earliest surviving fictional note');
    const traceLabels = ['04 BOARD CLAIM', '03 CASE SUMMARY', '02 RETELLING', '01 FIELD NOTE'];
    traceLabels.forEach((traceLabel) => {
      const cell = document.createElement('span');
      cell.textContent = traceLabel;
      trace.append(cell);
    });

    const controls = document.createElement('div');
    controls.className = 'provenance-controls';
    const rewindButton = document.createElement('button');
    rewindButton.type = 'button';
    rewindButton.textContent = 'REWIND ONE HANDOFF';
    const amplifyButton = document.createElement('button');
    amplifyButton.type = 'button';
    amplifyButton.textContent = 'RESTORE ONE HANDOFF';
    controls.append(rewindButton, amplifyButton);

    const live = document.createElement('p');
    live.className = 'provenance-live';
    live.setAttribute('role', 'status');
    live.setAttribute('aria-live', 'polite');

    const rule = document.createElement('p');
    rule.className = 'provenance-rule';
    rule.textContent = 'CONTEXT IS NOT A REWARD. IT IS THE CASE.';

    function render() {
      const current = stages[stageIndex];
      stageLabel.textContent = current.label;
      claim.textContent = current.claim;
      source.textContent = current.source;
      state.textContent = current.state;
      deltaText.textContent = current.delta;
      rewindButton.disabled = stageIndex === stages.length - 1;
      amplifyButton.disabled = stageIndex === 0;
      [...trace.children].forEach((cell, index) => {
        cell.dataset.active = String(index === stageIndex);
      });
      live.textContent = stageIndex === stages.length - 1
        ? 'Earliest surviving fictional note reached. The record stops before the archive’s certainty does.'
        : `Handoff ${4 - stageIndex} of 4. Rewind to restore more source context.`;
    }

    rewindButton.addEventListener('click', () => {
      if (stageIndex >= stages.length - 1) return;
      stageIndex += 1;
      render();
      announce(`Provenance rewind: handoff ${4 - stageIndex} opened. The wording is less certain because more context is visible.`);
    });

    amplifyButton.addEventListener('click', () => {
      if (stageIndex <= 0) return;
      stageIndex -= 1;
      render();
      announce(`Provenance rewind: handoff ${4 - stageIndex} restored. The wording becomes more assertive as context is compressed.`);
    });

    section.append(heading, tape, delta, trace, controls, live, rule);
    footer.insertAdjacentElement('beforebegin', section);

    if (caseNav && !document.getElementById('provenance-rewind-link')) {
      const link = document.createElement('a');
      link.id = 'provenance-rewind-link';
      link.href = '#provenance-rewind';
      const number = document.createElement('span');
      number.textContent = '13';
      link.append(number, document.createTextNode(' Provenance rewind'));
      caseNav.append(link);
    }

    render();
  }

  function loadResearchWing() {
    if (!document.getElementById('page-four-research-style')) {
      const style = document.createElement('link');
      style.id = 'page-four-research-style';
      style.rel = 'stylesheet';
      style.href = 'page-four-research.css';
      document.head.append(style);
    }

    if (!document.getElementById('page-four-research-script')) {
      const script = document.createElement('script');
      script.id = 'page-four-research-script';
      script.src = 'page-four-research.js';
      script.defer = true;
      document.body.append(script);
    }

    if (!document.getElementById('page-four-instrument-room-style')) {
      const style = document.createElement('link');
      style.id = 'page-four-instrument-room-style';
      style.rel = 'stylesheet';
      style.href = 'page-four-instrument-room.css';
      document.head.append(style);
    }

    const instrumentScript = document.getElementById('page-four-instrument-room-script');
    if (!instrumentScript) {
      const script = document.createElement('script');
      script.id = 'page-four-instrument-room-script';
      script.src = 'page-four-instrument-room.js';
      script.defer = true;
      script.addEventListener('load', loadDeadDrop, { once: true });
      document.body.append(script);
    } else if (document.getElementById('instrument-room')) {
      loadDeadDrop();
    } else {
      instrumentScript.addEventListener('load', loadDeadDrop, { once: true });
    }
  }

  function loadDeadDrop() {
    if (!document.getElementById('page-four-dead-drop-style')) {
      const style = document.createElement('link');
      style.id = 'page-four-dead-drop-style';
      style.rel = 'stylesheet';
      style.href = 'page-four-dead-drop.css';
      document.head.append(style);
    }

    const deadDropScript = document.getElementById('page-four-dead-drop-script');
    if (!deadDropScript) {
      const script = document.createElement('script');
      script.id = 'page-four-dead-drop-script';
      script.src = 'page-four-dead-drop.js';
      script.defer = true;
      script.addEventListener('load', mountProvenanceRewind, { once: true });
      document.body.append(script);
    } else if (document.getElementById('dead-drop')) {
      mountProvenanceRewind();
    } else {
      deadDropScript.addEventListener('load', mountProvenanceRewind, { once: true });
    }
  }

  if (randomButton) {
    randomButton.addEventListener('click', () => {
      const target = cases[randomIndex(cases.length)];
      if (!target) return;
      focusCase(target.id, 'Random access');
    });
  }

  if (classificationButton) {
    classificationButton.addEventListener('click', () => {
      const active = document.body.classList.toggle('is-reclassified');
      classificationButton.setAttribute('aria-pressed', String(active));
      classificationButton.textContent = active ? 'DECLASSIFY PAGE' : 'RECLASSIFY PAGE';
      announce(active
        ? 'Reclassification active. Most readable material has become administratively inconvenient.'
        : 'Reclassification lifted. Files are readable again, which may have been a mistake.');
    });
  }

  evidenceButtons.forEach((button) => {
    button.addEventListener('click', () => focusCase(button.dataset.target, 'Evidence board'));
  });

  document.querySelectorAll('.case-nav a[href^="#"]').forEach((link) => {
    link.addEventListener('click', () => {
      const target = caseById(link.getAttribute('href').slice(1));
      if (!target) return;
      markActive(target);
      announce(`Archive index: file ${target.id.replaceAll('-', ' ')} selected. Evidence remains unverified.`);
    });
  });

  document.querySelectorAll('.case-file details').forEach((details) => {
    details.addEventListener('toggle', () => {
      if (!details.open) return;
      const file = details.closest('[data-case]');
      if (!file) return;
      markActive(file);
      announce(`File ${file.id.replaceAll('-', ' ')} opened. Treat contents as fictional archive material.`);
    });
  });

  globalThis.addEventListener('hashchange', () => {
    const target = caseById(globalThis.location.hash.replace(/^#/, ''));
    if (target) markActive(target);
  });

  addLeakDesk();
  addRumorSightings();
  mountFindingAid();
  loadResearchWing();

  const sharedCase = caseById(globalThis.location.hash.replace(/^#/, ''));
  if (sharedCase) {
    markActive(sharedCase);
    announce(`Shared case permalink opened: ${caseTitle(sharedCase)}. Evidence remains fictional and unverified.`);
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {
      announce('Archive available. Offline filing clerk failed to report for duty.');
    });
  }
})();
