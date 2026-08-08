'use strict';

(() => {
  const records = [...document.querySelectorAll('[data-artifact]')];
  const button = document.querySelector('#misfile-button');
  const status = document.querySelector('#misfile-status');
  let cursor = -1;

  const closeAll = () => {
    for (const record of records) record.open = false;
  };

  const openRecord = (index) => {
    if (!records.length) return;
    cursor = ((index % records.length) + records.length) % records.length;
    closeAll();
    const record = records[cursor];
    record.open = true;
    const title = record.querySelector('summary strong')?.textContent?.trim() || `Record ${cursor + 1}`;
    if (status) status.textContent = `Misfile ${cursor + 1} of ${records.length}: ${title}.`;
    record.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  if (button) {
    button.addEventListener('click', () => openRecord(cursor + 1));
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.dataset.reducedMotion = 'true';
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js').catch(() => {});
    }, { once: true });
  }
})();
