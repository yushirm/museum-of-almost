(() => {
  'use strict';

  const main = document.querySelector('#treaty');
  if (!main) return;

  const agreement = document.querySelector('#dashboard-agreement');
  const agreementDetail = document.querySelector('#dashboard-agreement-detail');
  const pressure = document.querySelector('#dashboard-pressure');
  const pressureDetail = document.querySelector('#dashboard-pressure-detail');
  const sessionLoad = document.querySelector('#dashboard-session-load');
  const sessionDetail = document.querySelector('#dashboard-session-detail');
  const memory = document.querySelector('#dashboard-memory');
  const memoryDetail = document.querySelector('#dashboard-memory-detail');
  const quakes = document.querySelector('#dashboard-quakes');
  const magnitude = document.querySelector('#dashboard-magnitude');
  const solar = document.querySelector('#dashboard-solar');
  const correspondence = document.querySelector('#dashboard-correspondence');
  const network = document.querySelector('#dashboard-network');
  const storage = document.querySelector('#dashboard-storage');
  const worker = document.querySelector('#dashboard-worker');
  const live = document.querySelector('#dashboard-live');
  const treatyState = document.querySelector('#treaty-state');
  const memoryNote = document.querySelector('#memory-note');
  const ledgerCount = document.querySelector('#ledger-count');
  const ledgerWeight = document.querySelector('#ledger-weight');
  const ledgerSpread = document.querySelector('#ledger-spread');
  const liveStatus = document.querySelector('#live-entropy-status');
  const correspondenceStatus = document.querySelector('#live-correspondence-status');
  let serviceWorkerReady = false;

  const observed = [
    treatyState,
    memoryNote,
    ledgerCount,
    ledgerWeight,
    ledgerSpread,
    liveStatus,
    correspondenceStatus
  ].filter(Boolean);

  const observer = new MutationObserver(renderDashboard);
  observed.forEach((node) => observer.observe(node, { childList: true, subtree: true, characterData: true }));
  observer.observe(main, {
    attributes: true,
    attributeFilter: [
      'data-order',
      'data-live-entropy',
      'data-correspondence',
      'data-world-pressure',
      'data-world-pressure-label',
      'data-live-source-count',
      'data-quake-count',
      'data-quake-strongest',
      'data-solar-speed'
    ]
  });

  window.addEventListener('online', renderDashboard);
  window.addEventListener('offline', renderDashboard);

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', renderSystemHealth);
    navigator.serviceWorker.ready
      .then(() => {
        serviceWorkerReady = true;
        renderSystemHealth();
      })
      .catch(renderSystemHealth);
  }

  renderDashboard();
  renderSystemHealth();

  function renderDashboard() {
    const order = main.dataset.order || 'too-exact';
    const count = readNumber(ledgerCount?.textContent, 0);
    const weight = readNumber(ledgerWeight?.textContent, 0);
    const spread = readNumber(ledgerSpread?.textContent, 0);
    const liveActive = main.dataset.liveEntropy === 'true';
    const worldPressure = readNumber(main.dataset.worldPressure, 0);
    const pressurePercent = Math.max(0, Math.min(100, Math.round(worldPressure * 100)));

    agreement.textContent = order === 'holding'
      ? 'HOLDING'
      : order === 'overwritten'
        ? 'OVERWRITTEN'
        : 'TOO EXACT';
    agreementDetail.textContent = treatyState?.textContent || 'Treaty state unavailable.';

    pressure.textContent = liveActive
      ? `${pressurePercent}% ${String(main.dataset.worldPressureLabel || 'active').toUpperCase()}`
      : 'LOCAL BASELINE';
    pressureDetail.textContent = liveActive
      ? `${main.dataset.liveSourceCount || '0'} live source${main.dataset.liveSourceCount === '1' ? '' : 's'} influencing this session.`
      : 'No outside signal is currently applied.';
    main.style.setProperty('--dashboard-pressure', `${pressurePercent}%`);

    sessionLoad.textContent = `${count} / ${weight}`;
    sessionDetail.textContent = `${count} active ${count === 1 ? 'mark' : 'marks'} · total weight ${weight} · spread ${formatSpread(spread)}.`;

    const retained = Boolean(document.querySelector('#ghost-mark:not([hidden])'));
    memory.textContent = retained ? 'RETAINED' : 'EMPTY';
    memoryDetail.textContent = memoryNote?.textContent || 'Erasure-only local memory.';

    quakes.textContent = liveActive && main.dataset.quakeCount !== undefined
      ? main.dataset.quakeCount || '—'
      : '—';
    magnitude.textContent = liveActive && main.dataset.quakeStrongest
      ? `M${main.dataset.quakeStrongest}`
      : '—';
    solar.textContent = liveActive && main.dataset.solarSpeed
      ? `${main.dataset.solarSpeed} km/s`
      : '—';
    correspondence.textContent = liveActive
      ? correspondenceLabel(main.dataset.correspondence)
      : 'LOCAL ONLY';

    live.textContent = liveActive
      ? `${main.dataset.liveSourceCount || '0'} SOURCE${main.dataset.liveSourceCount === '1' ? '' : 'S'}`
      : 'IDLE';

    renderSystemHealth();
  }

  function renderSystemHealth() {
    network.textContent = navigator.onLine ? 'AVAILABLE' : 'OFFLINE';
    storage.textContent = memoryNote?.textContent?.includes('Local storage is unavailable')
      ? 'MEMORY ONLY'
      : 'LOCAL';

    if (!('serviceWorker' in navigator)) {
      worker.textContent = 'UNAVAILABLE';
      return;
    }
    worker.textContent = navigator.serviceWorker.controller
      ? 'CONTROLLING'
      : serviceWorkerReady
        ? 'READY'
        : 'READYING';
  }

  function readNumber(value, fallback) {
    const parsed = Number.parseFloat(String(value ?? '').replace(/[^0-9.+-]/g, ''));
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function formatSpread(value) {
    return Number.isFinite(value) ? `${value.toFixed(1)}%` : '0.0%';
  }

  function correspondenceLabel(value) {
    if (value === 'accord') return 'ACCORD';
    if (value === 'near') return 'NEAR';
    if (value === 'counterpoint') return 'COUNTERPOINT';
    if (value === 'resistance') return 'RESISTANCE';
    return 'UNANSWERED';
  }
})();
