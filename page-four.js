'use strict';

(() => {
  const cases = [...document.querySelectorAll('[data-case]')];
  const status = document.getElementById('archive-status');
  const randomButton = document.getElementById('random-file');
  const classificationButton = document.getElementById('classification-toggle');
  const evidenceButtons = [...document.querySelectorAll('[data-target]')];
  const reducedMotion = typeof globalThis.matchMedia === 'function'
    ? globalThis.matchMedia('(prefers-reduced-motion: reduce)')
    : null;

  function announce(message) {
    if (status) status.textContent = message;
  }

  function focusCase(id, sourceLabel = 'Archive') {
    const target = document.getElementById(id);
    if (!target) return;

    cases.forEach((item) => item.classList.toggle('is-active', item === target));
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

  document.querySelectorAll('.case-file details').forEach((details) => {
    details.addEventListener('toggle', () => {
      if (!details.open) return;
      const file = details.closest('[data-case]');
      if (!file) return;
      cases.forEach((item) => item.classList.toggle('is-active', item === file));
      announce(`File ${file.id.replaceAll('-', ' ')} opened. Treat contents as fictional archive material.`);
    });
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {
      announce('Archive available. Offline filing clerk failed to report for duty.');
    });
  }
})();
