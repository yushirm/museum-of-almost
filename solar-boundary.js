(() => {
  'use strict';
  const core = globalThis.MuseumSolarBoundaryCore;
  if (!core) return;
  const anchor = document.querySelector('.world-sentence-panel');
  if (!anchor || document.querySelector('#solar-boundary')) return;

  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = './solar-boundary.css';
  stylesheet.dataset.solarBoundaryStyles = 'true';
  document.head.append(stylesheet);

  const capturedAt = new Date();
  const atlas = core.buildAtlas(capturedAt, 30, 15);
  const terms = atlas.terms;

  const section = document.createElement('section');
  section.id = 'solar-boundary';
  section.className = 'solar-boundary-section';
  section.setAttribute('aria-labelledby', 'solar-boundary-title');
  section.innerHTML = `
    <div class="solar-boundary-shell">
      <div class="solar-boundary-copy">
        <p class="eyebrow">SOLAR BOUNDARY ATLAS · ONE UTC INSTANT</p>
        <h2 id="solar-boundary-title">Half the planet is turning away.</h2>
        <p>This instrument reverses the usual COMMONS pattern: it asks no public service for a value. It uses one UTC instant from the device clock plus approximate solar geometry to show where the Sun is above the geometric horizon, where civil twilight is possible, and where the sampled grid is in night.</p>
        <p class="solar-boundary-contract"><strong>Encoding contract:</strong> the map is a coarse 30 × 15 grid. Each cell is classified at its centre from the calculated solar altitude: day ≥ 0°, civil twilight 0° to −6°, night below −6°. Atmospheric refraction, terrain, clouds and local horizon are not modelled.</p>
        <p class="solar-boundary-note">Calculated once when this page loaded. It does not tick, poll, request location, or contact a time or map service. Reload the page to take another instant. A wrong device clock produces a wrong atlas.</p>
      </div>
      <div class="solar-boundary-atlas">
        <div class="solar-boundary-map" role="img" aria-label="Coarse world atlas showing calculated daylight, civil twilight and night for the UTC instant when this page loaded">
          <img src="world-map.svg" alt="" aria-hidden="true">
          <div class="solar-boundary-grid" aria-hidden="true"></div>
          <span class="solar-boundary-subsolar" aria-hidden="true"></span>
        </div>
        <dl class="solar-boundary-meta">
          <div><dt>UTC instant</dt><dd id="solar-boundary-time"></dd></div>
          <div><dt>Subsolar latitude</dt><dd id="solar-boundary-lat"></dd></div>
          <div><dt>Subsolar longitude</dt><dd id="solar-boundary-lon"></dd></div>
        </dl>
        <div class="solar-boundary-legend" aria-label="Solar boundary atlas legend">
          <span class="day">Day cells: ${atlas.counts.day}</span>
          <span class="twilight">Twilight cells: ${atlas.counts.twilight}</span>
          <span class="night">Night cells: ${atlas.counts.night}</span>
        </div>
      </div>
    </div>`;

  anchor.insertAdjacentElement('afterend', section);
  const grid = section.querySelector('.solar-boundary-grid');
  const fragment = document.createDocumentFragment();
  for (const cell of atlas.cells) {
    const item = document.createElement('span');
    item.className = 'solar-boundary-cell';
    item.dataset.state = cell.state;
    fragment.append(item);
  }
  grid.append(fragment);

  const marker = section.querySelector('.solar-boundary-subsolar');
  marker.style.left = `${((terms.subsolarLongitude + 180) / 360) * 100}%`;
  marker.style.top = `${((90 - terms.subsolarLatitude) / 180) * 100}%`;

  section.querySelector('#solar-boundary-time').textContent = capturedAt.toISOString().replace('.000Z', 'Z');
  section.querySelector('#solar-boundary-lat').textContent = `${Math.abs(terms.subsolarLatitude).toFixed(1)}° ${terms.subsolarLatitude >= 0 ? 'N' : 'S'}`;
  section.querySelector('#solar-boundary-lon').textContent = `${Math.abs(terms.subsolarLongitude).toFixed(1)}° ${terms.subsolarLongitude >= 0 ? 'E' : 'W'}`;
})();
