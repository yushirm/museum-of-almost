(function attachCosmicSignalView(root) {
  'use strict';
  const core = root.MuseumCosmicSignalCore;
  if (!core || !root.document) return;
  const { SOURCE, normalizeNoaaScales, cosmicSentence } = core;
  function mount(document, host) {
    if (!document?.querySelector || !host?.fetch) return;
    if (document.querySelector('#cosmic-signal')) return;

    installStylesheet(document);
    const section = buildSection(document);
    const anchor = document.querySelector('.world-sentence-panel');
    if (anchor?.parentNode) anchor.parentNode.insertBefore(section, anchor.nextSibling);

    const fieldStrip = buildFieldStrip(document);
    const fieldMeta = document.querySelector('#field-sheet .field-sheet-meta');
    if (fieldMeta?.parentNode) fieldMeta.parentNode.insertBefore(fieldStrip, fieldMeta);

    const snapshotDetail = document.querySelector('#snapshot-detail');
    if (snapshotDetail?.textContent?.includes('One request per source')) {
      snapshotDetail.textContent = 'Four public services · five current feeds. No automatic polling.';
    }

    const ui = {
      solar: document.querySelector('#cosmic-solar-wind'),
      solarState: document.querySelector('#cosmic-solar-state'),
      geomagnetic: document.querySelector('#cosmic-geomagnetic'),
      geomagneticState: document.querySelector('#cosmic-geomagnetic-state'),
      radiation: document.querySelector('#cosmic-radiation'),
      radiationState: document.querySelector('#cosmic-radiation-state'),
      status: document.querySelector('#cosmic-status'),
      sentence: document.querySelector('#cosmic-sentence'),
      geomagneticStage: document.querySelector('[data-cosmic-stage="geomagnetic"]'),
      radiationStage: document.querySelector('[data-cosmic-stage="radiation"]'),
      fieldSolar: document.querySelector('#cosmic-field-solar'),
      fieldGeomagnetic: document.querySelector('#cosmic-field-geomagnetic'),
      fieldRadiation: document.querySelector('#cosmic-field-radiation')
    };

    let controller = null;
    let scales = normalizeNoaaScales(null);

    const syncSolarWind = () => {
      const sourceValue = document.querySelector('#solar-wind')?.textContent?.trim() || '—';
      const sourceState = document.querySelector('#solar-state')?.textContent?.trim() || 'No space-weather snapshot';
      if (ui.solar) ui.solar.textContent = sourceValue;
      if (ui.solarState) ui.solarState.textContent = sourceState;
      if (ui.fieldSolar) ui.fieldSolar.textContent = `Flow ${sourceValue}`;
      renderSentence();
    };

    const renderScales = () => {
      renderScale(ui.geomagnetic, ui.geomagneticState, ui.geomagneticStage, scales.geomagnetic);
      renderScale(ui.radiation, ui.radiationState, ui.radiationStage, scales.radiation);
      if (ui.fieldGeomagnetic) {
        ui.fieldGeomagnetic.textContent = scales.geomagnetic.available
          ? `Field ${scales.geomagnetic.code} · ${scales.geomagnetic.text}`
          : 'Field G— · unavailable';
      }
      if (ui.fieldRadiation) {
        ui.fieldRadiation.textContent = scales.radiation.available
          ? `Particles ${scales.radiation.code} · ${scales.radiation.text}`
          : 'Particles S— · unavailable';
      }
      renderSentence();
    };

    const renderSentence = () => {
      if (!ui.sentence) return;
      const solarText = ui.solar?.textContent?.trim() || '—';
      ui.sentence.textContent = cosmicSentence(solarText, scales);
    };

    async function refreshScales() {
      controller?.abort();
      controller = new host.AbortController();
      const activeController = controller;
      const timeout = host.setTimeout(() => activeController.abort(), 9000);
      scales = normalizeNoaaScales(null);
      renderScales();
      if (ui.status) ui.status.textContent = 'Reading NOAA SWPC current space-weather scales…';

      try {
        const response = await host.fetch(SOURCE, {
          method: 'GET',
          mode: 'cors',
          cache: 'no-store',
          credentials: 'omit',
          referrerPolicy: 'no-referrer',
          signal: activeController.signal
        });
        if (!response.ok) throw new Error(`Source returned ${response.status}`);
        scales = normalizeNoaaScales(await response.json());
        if (ui.status) {
          ui.status.textContent = scales.available
            ? `NOAA SWPC scale feed answered${scales.observedAt ? ` · ${scales.observedAt}` : ''}.`
            : 'NOAA SWPC answered without a usable current scale value.';
        }
      } catch {
        scales = normalizeNoaaScales(null);
        if (ui.status) ui.status.textContent = 'NOAA SWPC scale feed did not answer. Cosmic scale values stay unavailable.';
      } finally {
        host.clearTimeout(timeout);
        if (controller === activeController) controller = null;
        renderScales();
      }
    }

    const solarSource = document.querySelector('#solar-wind');
    if (solarSource && host.MutationObserver) {
      new host.MutationObserver(syncSolarWind).observe(solarSource, { childList: true, characterData: true, subtree: true });
    }

    document.querySelector('#refresh-button')?.addEventListener('click', refreshScales);
    syncSolarWind();
    renderScales();
    refreshScales();
  }

  function installStylesheet(document) {
    if (document.querySelector('link[data-cosmic-styles]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './cosmic-signal.css';
    link.dataset.cosmicStyles = 'true';
    document.head.append(link);
  }

  function buildSection(document) {
    const section = document.createElement('section');
    section.id = 'cosmic-signal';
    section.className = 'cosmic-signal-section';
    section.setAttribute('aria-labelledby', 'cosmic-signal-title');
    section.innerHTML = `
      <div class="section-heading cosmic-heading">
        <p class="eyebrow">COSMIC SIGNAL CHAIN</p>
        <h2 id="cosmic-signal-title">Three detectors, one near-Earth moment.</h2>
        <p>Borrowed from an analog signal rack: read left to right, but do not read the rail as cause and effect. Solar-wind speed, geomagnetic storm level, and solar-radiation storm level are independently reported current measurements.</p>
      </div>
      <ol class="cosmic-rail" aria-label="Three current near-Earth space-weather measurements">
        <li class="cosmic-stage" data-cosmic-stage="flow">
          <span class="cosmic-stage-number">01 · FLOW</span>
          <strong id="cosmic-solar-wind">—</strong>
          <p id="cosmic-solar-state">No space-weather snapshot</p>
          <small>solar wind near Earth</small>
        </li>
        <li class="cosmic-stage" data-cosmic-stage="geomagnetic" data-alert="false">
          <span class="cosmic-stage-number">02 · FIELD</span>
          <strong id="cosmic-geomagnetic">G—</strong>
          <p id="cosmic-geomagnetic-state">unavailable</p>
          <small>NOAA geomagnetic storm scale</small>
        </li>
        <li class="cosmic-stage" data-cosmic-stage="radiation" data-alert="false">
          <span class="cosmic-stage-number">03 · PARTICLES</span>
          <strong id="cosmic-radiation">S—</strong>
          <p id="cosmic-radiation-state">unavailable</p>
          <small>NOAA solar-radiation storm scale</small>
        </li>
      </ol>
      <div class="cosmic-readout">
        <p id="cosmic-sentence">Cosmic measurements are unavailable in this snapshot.</p>
        <p id="cosmic-status" role="status" aria-live="polite">Preparing the cosmic scale feed.</p>
      </div>
      <p class="attribution">NOAA Space Weather Prediction Center. The G and S values use NOAA's current public scales; level 0 means no scale threshold is active. No automatic polling.</p>
    `;
    return section;
  }

  function buildFieldStrip(document) {
    const strip = document.createElement('div');
    strip.className = 'cosmic-field-strip';
    strip.setAttribute('aria-label', 'Cosmic signal chain for this field sheet');
    strip.innerHTML = `
      <strong>COSMIC SIGNAL CHAIN</strong>
      <span id="cosmic-field-solar">Flow —</span>
      <span id="cosmic-field-geomagnetic">Field G— · unavailable</span>
      <span id="cosmic-field-radiation">Particles S— · unavailable</span>
      <small>NOAA SWPC · independent current measurements · reading order is not a causal timeline</small>
    `;
    return strip;
  }

  function renderScale(valueNode, stateNode, stageNode, measurement) {
    if (valueNode) valueNode.textContent = measurement?.available ? measurement.code : `${measurement?.code?.[0] || ''}—`;
    if (stateNode) stateNode.textContent = measurement?.available ? measurement.text : 'unavailable';
    if (stageNode) {
      const scale = measurement?.available ? measurement.scale : null;
      stageNode.dataset.level = scale === null ? 'unavailable' : String(scale);
      stageNode.dataset.alert = String(Number.isInteger(scale) && scale > 0);
    }
  }


  root.MuseumCosmicSignalView = Object.freeze({ mount });
  mount(root.document, root);
})(typeof globalThis !== 'undefined' ? globalThis : this);
