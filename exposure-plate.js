(function attachExposurePlateView(root) {
  'use strict';

  const core = root.MuseumExposurePlateCore;
  const document = root.document;
  if (!core || !document) return;

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const SNAPSHOT_EVENT = 'museum:commons-snapshot';
  let snapshot = root.MuseumCommonsSnapshot || null;
  let activeBand = 'all';

  installStylesheet();
  const ui = mount();
  render();

  document.addEventListener(SNAPSHOT_EVENT, (event) => {
    snapshot = event.detail?.snapshot || root.MuseumCommonsSnapshot || null;
    activeBand = 'all';
    render();
  });

  function installStylesheet() {
    if (document.querySelector('link[data-exposure-plate-styles]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './exposure-plate.css';
    link.dataset.exposurePlateStyles = 'true';
    document.head.append(link);
  }

  function mount() {
    if (!document.querySelector('#exposure-plate')) {
      const anchor = document.querySelector('.windows-section');
      if (anchor?.parentNode) {
        const section = document.createElement('section');
        section.id = 'exposure-plate';
        section.className = 'exposure-plate-section';
        section.setAttribute('aria-labelledby', 'exposure-plate-title');
        section.innerHTML = `
          <div class="exposure-plate-heading">
            <p class="eyebrow">THE EXPOSURE PLATE / THE WORLD WE DID NOT MEASURE</p>
            <h2 id="exposure-plate-title">The blank space between samples is part of the result.</h2>
            <p>Most weather maps fill the gaps. This one refuses. Every cell below says only how far its center is from the nearest fixed weather point that actually produced a value in the current latch.</p>
          </div>
          <div class="exposure-console">
            <div class="exposure-map-column">
              <div id="exposure-map" class="exposure-map" data-filter="all" data-state="waiting" role="img" aria-label="Waiting for current weather evidence geometry">
                <img class="exposure-map-image" src="world-map.svg" alt="" aria-hidden="true">
                <svg class="exposure-grid" viewBox="0 0 360 180" aria-hidden="true" focusable="false">
                  <g id="exposure-cells"></g><g id="exposure-stations"></g>
                </svg>
              </div>
              <div class="exposure-legend" aria-label="Distance from nearest current weather sample">
                <span><i data-band="near"></i> 0–1,500 km</span>
                <span><i data-band="middle"></i> 1,500–3,000 km</span>
                <span><i data-band="far"></i> 3,000–5,000 km</span>
                <span><i data-band="remote"></i> more than 5,000 km</span>
              </div>
              <p class="exposure-map-note">A 10° × 10° grid makes distance-from-evidence visible. Cell tone is not weather, probability, uncertainty, accuracy, or representativeness.</p>
            </div>
            <aside class="exposure-readout">
              <span class="eyebrow">CURRENT EVIDENCE GEOMETRY</span>
              <strong id="exposure-count">WAITING</strong>
              <p id="exposure-status" role="status" aria-live="polite">Waiting for the current latched weather sample.</p>
              <dl>
                <div><dt>Available weather points</dt><dd id="exposure-station-count">—</dd></div>
                <div><dt>Farthest grid-cell center</dt><dd id="exposure-farthest">—</dd></div>
                <div><dt>Nearest sample there</dt><dd id="exposure-nearest">—</dd></div>
              </dl>
              <div class="exposure-filter" role="group" aria-label="Highlight a literal nearest-sample distance band">
                <span>HIGHLIGHT DISTANCE BAND</span>
                <button type="button" data-exposure-band="all" aria-pressed="true">All</button>
                <button type="button" data-exposure-band="near" aria-pressed="false">≤ 1,500 km</button>
                <button type="button" data-exposure-band="middle" aria-pressed="false">1,500–3,000</button>
                <button type="button" data-exposure-band="far" aria-pressed="false">3,000–5,000</button>
                <button type="button" data-exposure-band="remote" aria-pressed="false">&gt; 5,000 km</button>
              </div>
              <p id="exposure-filter-status" class="exposure-filter-status">All grid cells are shown. The plate does not infer conditions between the thirteen fixed points.</p>
            </aside>
          </div>
          <p class="exposure-note"><strong>Distance is not uncertainty.</strong> A nearby fixed point is not promised to represent its surroundings, and a distant cell is not assigned a larger error bar. This plate shows sampling geometry only.</p>`;
        anchor.insertAdjacentElement('afterend', section);
      }
    }

    let field = document.querySelector('#field-sheet-exposure');
    const fieldMeta = document.querySelector('#field-sheet .field-sheet-meta');
    if (!field && fieldMeta) {
      field = document.createElement('span');
      field.id = 'field-sheet-exposure';
      field.className = 'field-sheet-exposure';
      field.innerHTML = '<strong>Weather evidence geometry: unavailable</strong><br><small>10° grid search · nearest current fixed sample distance only</small>';
      fieldMeta.append(field);
    }

    const mounted = {
      map: document.querySelector('#exposure-map'),
      cells: document.querySelector('#exposure-cells'),
      stations: document.querySelector('#exposure-stations'),
      count: document.querySelector('#exposure-count'),
      status: document.querySelector('#exposure-status'),
      stationCount: document.querySelector('#exposure-station-count'),
      farthest: document.querySelector('#exposure-farthest'),
      nearest: document.querySelector('#exposure-nearest'),
      filterStatus: document.querySelector('#exposure-filter-status'),
      buttons: [...document.querySelectorAll('[data-exposure-band]')],
      field
    };
    for (const button of mounted.buttons) button.addEventListener('click', () => {
      activeBand = button.dataset.exposureBand || 'all';
      applyFilter();
    });
    return mounted;
  }

  function render() {
    const field = core.distanceField(snapshot);
    root.MuseumExposurePlate = Object.freeze({
      receivedAt: field.available ? isoOrNull(snapshot?.receivedAt) : null,
      available: field.available,
      stationCount: field.stationCount,
      gridStepDegrees: field.step,
      farthest: field.farthest ? Object.freeze({
        lat: field.farthest.lat,
        lon: field.farthest.lon,
        distanceKm: field.farthest.distanceKm,
        nearestId: field.farthest.nearestId
      }) : null
    });

    draw(field);
    if (!field.available) {
      ui.map?.setAttribute('aria-label', 'No currently available weather point can expose the distance-from-evidence plate.');
      if (ui.map) ui.map.dataset.state = 'unexposed';
      if (ui.count) ui.count.textContent = 'UNEXPOSED';
      if (ui.status) ui.status.textContent = core.fieldSentence(field);
      if (ui.stationCount) ui.stationCount.textContent = '0 / 13';
      if (ui.farthest) ui.farthest.textContent = '—';
      if (ui.nearest) ui.nearest.textContent = '—';
      renderFieldSheet(null);
      applyFilter(field);
      return;
    }

    const farthest = field.farthest;
    if (ui.map) {
      ui.map.dataset.state = 'exposed';
      ui.map.setAttribute('aria-label', `${core.fieldSentence(field)} The toned surface shows only nearest-sample distance bands.`);
    }
    if (ui.count) ui.count.textContent = `${field.stationCount} / 13 POINTS`;
    if (ui.status) ui.status.textContent = core.fieldSentence(field);
    if (ui.stationCount) ui.stationCount.textContent = `${field.stationCount} / 13`;
    if (ui.farthest) ui.farthest.textContent = farthest ? `≈ ${formatKm(farthest.distanceKm)} · ${formatCoordinates(farthest.lat, farthest.lon)}` : '—';
    if (ui.nearest) ui.nearest.textContent = farthest ? `POINT ${farthest.nearestId}` : '—';
    renderFieldSheet(field);
    applyFilter(field);
  }

  function draw(field) {
    ui.cells?.replaceChildren();
    ui.stations?.replaceChildren();
    if (!field.available) return;
    const cells = document.createDocumentFragment();
    for (const cell of field.cells) {
      const rect = document.createElementNS(SVG_NS, 'rect');
      for (const [name, value] of Object.entries({ x: cell.x, y: cell.y, width: cell.width, height: cell.height })) rect.setAttribute(name, String(value));
      rect.setAttribute('class', 'exposure-cell');
      rect.dataset.band = cell.band;
      cells.append(rect);
    }
    ui.cells?.append(cells);
    const stations = document.createDocumentFragment();
    for (const station of field.stations) {
      const circle = document.createElementNS(SVG_NS, 'circle');
      circle.setAttribute('cx', String(station.lon + 180));
      circle.setAttribute('cy', String(90 - station.lat));
      circle.setAttribute('r', '2.2');
      circle.setAttribute('class', 'exposure-station');
      stations.append(circle);
    }
    ui.stations?.append(stations);
  }

  function applyFilter(fieldInput) {
    const field = fieldInput || core.distanceField(snapshot);
    if (ui.map) ui.map.dataset.filter = activeBand;
    for (const button of ui.buttons) button.setAttribute('aria-pressed', String(button.dataset.exposureBand === activeBand));
    if (!ui.filterStatus) return;
    if (!field.available) {
      ui.filterStatus.textContent = 'No distance band exists until at least one current fixed weather point is available.';
    } else if (activeBand === 'all') {
      ui.filterStatus.textContent = `All ${field.cells.length} grid-cell centers are shown. The plate does not infer weather between samples.`;
    } else {
      const band = core.DISTANCE_BANDS.find((entry) => entry.id === activeBand);
      ui.filterStatus.textContent = `${field.counts[activeBand] || 0} grid-cell centers are ${band?.label || activeBand} from their nearest current sample. This is distance, not uncertainty.`;
    }
  }

  function renderFieldSheet(field) {
    if (!ui.field) return;
    const strong = ui.field.querySelector('strong');
    const small = ui.field.querySelector('small');
    if (!field?.available || !field.farthest) {
      if (strong) strong.textContent = 'Weather evidence geometry: unavailable';
      if (small) small.textContent = '10° grid search · nearest current fixed sample distance only';
      return;
    }
    if (strong) strong.textContent = `Weather evidence geometry: ${field.stationCount}/13 points · farthest grid center ≈ ${formatKm(field.farthest.distanceKm)}`;
    if (small) small.textContent = `10° grid search · nearest there: Point ${field.farthest.nearestId} · distance only, not uncertainty or representativeness`;
  }

  function isoOrNull(value) {
    if (value === null || value === undefined || value === '') return null;
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? date.toISOString() : null;
  }
  function formatKm(value) { return `${Number(value).toLocaleString('en-US', { maximumFractionDigits: 0 })} km`; }
  function formatCoordinates(lat, lon) {
    return `${Math.abs(lat).toFixed(0)}°${lat >= 0 ? 'N' : 'S'} · ${Math.abs(lon).toFixed(0)}°${lon >= 0 ? 'E' : 'W'}`;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
