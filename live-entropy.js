(() => {
  'use strict';

  const liveCore = globalThis.MuseumLiveEntropyCore;
  if (!liveCore) return;

  const main = document.querySelector('#treaty');
  const inviteButton = document.querySelector('#live-invite-button');
  const releaseButton = document.querySelector('#live-release-button');
  const marker = document.querySelector('#live-entropy-marker');
  const liveStatus = document.querySelector('#live-entropy-status');
  const quakeStatus = document.querySelector('#live-quake-status');
  const solarStatus = document.querySelector('#live-solar-status');
  const vectorStatus = document.querySelector('#live-vector-status');
  const correspondenceStatus = document.querySelector('#live-correspondence-status');
  const ledgerCount = document.querySelector('#ledger-count');
  const ledgerCenter = document.querySelector('#ledger-center');
  const status = document.querySelector('#status');

  if (!main || !inviteButton || !releaseButton || !marker || !liveStatus) return;

  let currentEntropy = null;
  let currentEarthquakes = null;
  let currentSolarWind = null;
  let requestController = null;

  inviteButton.addEventListener('click', inviteLiveEntropy);
  releaseButton.addEventListener('click', releaseLiveEntropy);

  const observer = new MutationObserver(() => {
    if (currentEntropy?.available) renderCorrespondence();
  });
  if (ledgerCount) observer.observe(ledgerCount, { childList: true, subtree: true, characterData: true });
  if (ledgerCenter) observer.observe(ledgerCenter, { childList: true, subtree: true, characterData: true });

  async function inviteLiveEntropy() {
    requestController?.abort();
    requestController = new AbortController();
    const timeout = window.setTimeout(() => requestController.abort(), 6500);

    main.dataset.liveRequest = 'requesting';
    inviteButton.disabled = true;
    inviteButton.textContent = 'Listening outside…';
    liveStatus.textContent = 'Requesting one current aggregate from USGS and one current solar-wind value from NOAA SWPC.';
    announce('Live entropy requested. The treaty is listening to two public scientific services once.');

    const [quakeResult, solarResult] = await Promise.allSettled([
      fetchJson(liveCore.USGS_URL, requestController.signal),
      fetchJson(liveCore.NOAA_URL, requestController.signal)
    ]);

    window.clearTimeout(timeout);
    requestController = null;

    currentEarthquakes = quakeResult.status === 'fulfilled'
      ? liveCore.normalizeEarthquakes(quakeResult.value)
      : { available: false, count: 0, strongest: 0, meanDepth: 0, pressure: 0 };
    currentSolarWind = solarResult.status === 'fulfilled'
      ? liveCore.normalizeSolarWind(solarResult.value)
      : { available: false, speed: 0, pressure: 0 };
    currentEntropy = liveCore.composeLiveEntropy(currentEarthquakes, currentSolarWind);

    inviteButton.disabled = false;
    inviteButton.textContent = currentEntropy.available ? 'Refresh live entropy' : 'Try live entropy again';

    if (!currentEntropy.available) {
      releaseLiveEntropy(false);
      liveStatus.textContent = 'Neither public source answered. The local treaty continues unchanged.';
      quakeStatus.textContent = 'USGS: unavailable.';
      solarStatus.textContent = 'NOAA SWPC: unavailable.';
      vectorStatus.textContent = 'World pressure: not applied.';
      correspondenceStatus.textContent = 'The local treaty remains fully usable without live data.';
      announce('Live entropy was unavailable. Nothing in the local treaty changed.');
      return;
    }

    applyLiveEntropy();
    renderSourceStatus();
    renderCorrespondence();
    releaseButton.disabled = false;
    liveStatus.textContent = currentEntropy.sourceCount === 2
      ? 'Two outside signals are temporarily leaning on this session. Refresh only when you ask.'
      : 'One outside signal answered. Its influence is temporary and the missing source contributes nothing.';
    announce(`Live entropy applied: ${currentEntropy.label} outside pressure. It will not be stored.`);
  }

  async function fetchJson(url, signal) {
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-store',
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      signal
    });
    if (!response.ok) throw new Error(`Live entropy source returned ${response.status}`);
    return response.json();
  }

  function applyLiveEntropy() {
    main.dataset.liveRequest = 'active';
    main.dataset.liveEntropy = 'true';
    main.style.setProperty('--live-force-a-scale', String(currentEntropy.scaleA));
    main.style.setProperty('--live-force-b-scale', String(currentEntropy.scaleB));
    main.style.setProperty('--live-field-scale', String(currentEntropy.fieldScale));
    main.style.setProperty('--live-entropy-x', `${currentEntropy.position / 10}%`);
    marker.style.left = `${currentEntropy.position / 10}%`;
    marker.hidden = false;
    exposeLiveSnapshot();
  }

  function exposeLiveSnapshot() {
    main.dataset.worldPressure = String(currentEntropy.pressure);
    main.dataset.worldPressureLabel = currentEntropy.label;
    main.dataset.liveSourceCount = String(currentEntropy.sourceCount);
    main.dataset.livePosition = String(currentEntropy.position);

    if (currentEarthquakes?.available) {
      main.dataset.quakeCount = String(currentEarthquakes.count);
      main.dataset.quakeStrongest = currentEarthquakes.strongest.toFixed(1);
    } else {
      delete main.dataset.quakeCount;
      delete main.dataset.quakeStrongest;
    }

    if (currentSolarWind?.available) {
      main.dataset.solarSpeed = String(Math.round(currentSolarWind.speed));
    } else {
      delete main.dataset.solarSpeed;
    }
  }

  function releaseLiveEntropy(announceRelease = true) {
    requestController?.abort();
    requestController = null;
    currentEntropy = null;
    currentEarthquakes = null;
    currentSolarWind = null;
    delete main.dataset.liveRequest;
    delete main.dataset.liveEntropy;
    delete main.dataset.correspondence;
    delete main.dataset.worldPressure;
    delete main.dataset.worldPressureLabel;
    delete main.dataset.liveSourceCount;
    delete main.dataset.livePosition;
    delete main.dataset.quakeCount;
    delete main.dataset.quakeStrongest;
    delete main.dataset.solarSpeed;
    main.style.removeProperty('--live-force-a-scale');
    main.style.removeProperty('--live-force-b-scale');
    main.style.removeProperty('--live-field-scale');
    main.style.removeProperty('--live-entropy-x');
    marker.hidden = true;
    releaseButton.disabled = true;
    inviteButton.disabled = false;
    inviteButton.textContent = 'Invite live entropy';
    liveStatus.textContent = 'No outside signal is influencing the treaty. Nothing will be requested until invited.';
    quakeStatus.textContent = 'USGS: not requested.';
    solarStatus.textContent = 'NOAA SWPC: not requested.';
    vectorStatus.textContent = 'World pressure: local-only baseline.';
    correspondenceStatus.textContent = 'The treaty is answering only its own session state.';
    if (announceRelease) announce('Live entropy released. The treaty returned to its local-only baseline.');
  }

  function renderSourceStatus() {
    quakeStatus.textContent = currentEarthquakes?.available
      ? `USGS: ${currentEarthquakes.count} earthquakes in the past hour · strongest M${currentEarthquakes.strongest.toFixed(1)}.`
      : 'USGS: unavailable; no terrestrial pressure applied.';
    solarStatus.textContent = currentSolarWind?.available
      ? `NOAA SWPC: solar wind ${Math.round(currentSolarWind.speed)} km/s.`
      : 'NOAA SWPC: unavailable; no solar pressure applied.';

    const direction = currentEntropy.bias > 0.08
      ? 'leaning toward FORCE A · OUTWARD'
      : currentEntropy.bias < -0.08
        ? 'leaning toward FORCE B · RETURNING'
        : 'nearly balanced between the two forces';
    vectorStatus.textContent = `World pressure: ${currentEntropy.label}, ${direction}, crossing the treaty near ${(currentEntropy.position / 10).toFixed(1)}%.`;
  }

  function renderCorrespondence() {
    if (!currentEntropy?.available) return;
    const count = Math.max(0, Number.parseInt(ledgerCount?.textContent || '0', 10) || 0);
    const centerText = ledgerCenter?.textContent || '';
    const centerPercent = Number.parseFloat(centerText);
    const center = Number.isFinite(centerPercent) ? centerPercent * 10 : NaN;
    const correspondence = liveCore.correspondenceFor(currentEntropy.position, center, count);
    main.dataset.correspondence = correspondence.key;
    correspondenceStatus.textContent = correspondence.text;
  }

  function announce(message) {
    if (!status || !message) return;
    status.textContent = '';
    window.setTimeout(() => {
      status.textContent = message;
    }, 20);
  }
})();
