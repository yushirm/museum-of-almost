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

    if (caseNav && !document.getElementById('signal-echo-channel')) {
      const channel = document.createElement('a');
      channel.id = 'signal-echo-channel';
      channel.href = 'deep-space.html';
      const number = document.createElement('span');
      number.textContent = '??';
      channel.append(number, document.createTextNode(' Signal echo / Deep Space'));
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
    const space = document.createElement('span');
    space.textContent = 'DEEP SPACE / SIGNAL ANOMALY';
    const boundary = document.createElement('small');
    boundary.textContent = 'STATIC ROUTES. NO VISITOR STATE OR COUNTING.';

    log.append(title, entrance, web, space, boundary);
    const fictionLabel = archiveSidebar.querySelector('.fiction-label');
    if (fictionLabel) archiveSidebar.insertBefore(log, fictionLabel);
    else archiveSidebar.append(log);
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

    if (!document.getElementById('page-four-instrument-room-script')) {
      const script = document.createElement('script');
      script.id = 'page-four-instrument-room-script';
      script.src = 'page-four-instrument-room.js';
      script.defer = true;
      document.body.append(script);
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
