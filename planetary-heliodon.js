(function attachPlanetaryHeliodonView(root) {
  'use strict';
  const core = root.MuseumPlanetaryHeliodonCore;
  const commons = root.MuseumCommonsCore;
  if (!core || !commons || !root.document) return;

  const SVG_NS = 'http://www.w3.org/2000/svg';

  function installStylesheet(document) {
    if (document.querySelector('link[data-planetary-heliodon-styles]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './planetary-heliodon.css';
    link.dataset.planetaryHeliodonStyles = 'true';
    document.head.append(link);
  }

  function buildOverlay(document) {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.id = 'planetary-heliodon-overlay';
    svg.classList.add('planetary-heliodon-overlay');
    svg.setAttribute('viewBox', `0 0 ${core.WIDTH} ${core.HEIGHT}`);
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = `
      <defs>
        <pattern id="heliodon-night-hatch" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(25)">
          <line class="heliodon-hatch-line" x1="0" y1="0" x2="0" y2="18"></line>
        </pattern>
      </defs>
      <path class="heliodon-night-grid" data-heliodon-night></path>
      <path class="heliodon-terminator" data-heliodon-terminator></path>
      <g class="heliodon-point heliodon-point-sun" data-heliodon-sun>
        <circle r="12"></circle><circle r="3"></circle>
      </g>
      <g class="heliodon-point heliodon-point-night" data-heliodon-night-point>
        <circle r="10"></circle><path d="M-5 0H5M0-5V5"></path>
      </g>
    `;
    return svg;
  }

  function buildReadout(document) {
    const panel = document.createElement('div');
    panel.id = 'planetary-heliodon-readout';
    panel.className = 'planetary-heliodon-readout';
    panel.setAttribute('aria-live', 'polite');
    panel.innerHTML = `
      <div class="heliodon-heading">
        <span class="eyebrow">THE PLANETARY HELIODON / EARTH CASTS THE NIGHT</span>
        <strong>One captured instant lights one hemisphere and leaves the other facing away.</strong>
      </div>
      <dl>
        <div><dt>Sun overhead</dt><dd data-heliodon-subsolar>—</dd></div>
        <div><dt>Facing away</dt><dd data-heliodon-antisolar>—</dd></div>
        <div><dt>Boundary</dt><dd>solar elevation ≈ 0°</dd></div>
      </dl>
      <p data-heliodon-status>Waiting for the Museum snapshot clock.</p>
    `;
    return panel;
  }

  function mount(document, host) {
    if (!document?.querySelector) return;
    installStylesheet(document);

    const map = document.querySelector('.world-map');
    const legend = document.querySelector('.map-legend');
    if (!map || !legend) return;

    let overlay = document.querySelector('#planetary-heliodon-overlay');
    if (!overlay) {
      overlay = buildOverlay(document);
      map.append(overlay);
    }

    let readout = document.querySelector('#planetary-heliodon-readout');
    if (!readout) {
      readout = buildReadout(document);
      legend.after(readout);
    }

    const fieldStrip = ensureFieldStrip(document);
    const terminator = overlay.querySelector('[data-heliodon-terminator]');
    const night = overlay.querySelector('[data-heliodon-night]');
    const sunPoint = overlay.querySelector('[data-heliodon-sun]');
    const nightPoint = overlay.querySelector('[data-heliodon-night-point]');
    const subsolar = readout.querySelector('[data-heliodon-subsolar]');
    const antisolar = readout.querySelector('[data-heliodon-antisolar]');
    const status = readout.querySelector('[data-heliodon-status]');

    function render() {
      const capturedMs = snapshotTime(document, host);
      if (!Number.isFinite(capturedMs)) {
        if (terminator) terminator.setAttribute('d', '');
        if (night) night.setAttribute('d', '');
        if (sunPoint) sunPoint.removeAttribute('transform');
        if (nightPoint) nightPoint.removeAttribute('transform');
        if (status) status.textContent = 'Waiting for a captured Museum snapshot before deriving solar geometry.';
        return;
      }
      const plate = core.plate(capturedMs);
      if (!plate) {
        if (status) status.textContent = 'Solar geometry unavailable for this snapshot instant.';
        return;
      }

      if (terminator) terminator.setAttribute('d', plate.terminatorPath);
      if (night) night.setAttribute('d', plate.nightPath);
      if (sunPoint) sunPoint.setAttribute('transform', `translate(${plate.subsolar.x.toFixed(2)} ${plate.subsolar.y.toFixed(2)})`);
      if (nightPoint) nightPoint.setAttribute('transform', `translate(${plate.antisolar.x.toFixed(2)} ${plate.antisolar.y.toFixed(2)})`);

      const sunText = coordinatePair(plate.geometry.subsolar);
      const nightText = coordinatePair(plate.geometry.antisolar);
      if (subsolar) subsolar.textContent = sunText;
      if (antisolar) antisolar.textContent = nightText;
      if (status) status.textContent = `Frozen at ${formatUtc(capturedMs)}. Hatched cells face away from the Sun; the line is the derived day/night terminator.`;

      if (fieldStrip) {
        const time = fieldStrip.querySelector('[data-heliodon-field-time]');
        const values = fieldStrip.querySelector('[data-heliodon-field-values]');
        if (time) time.textContent = `Captured ${formatUtc(capturedMs)}`;
        if (values) values.textContent = `Sun overhead ${sunText} · facing away ${nightText}`;
      }
    }

    const snapshotTimeNode = document.querySelector('#snapshot-time');
    if (snapshotTimeNode && typeof root.MutationObserver === 'function') {
      const observer = new root.MutationObserver(render);
      observer.observe(snapshotTimeNode, { childList: true, characterData: true, subtree: true });
    } else {
      document.querySelector('#refresh-button')?.addEventListener('click', render);
    }
    render();
  }

  function ensureFieldStrip(document) {
    const fieldSheet = document.querySelector('#field-sheet');
    if (!fieldSheet) return null;
    const existing = document.querySelector('#heliodon-field-strip');
    if (existing) return existing;

    const strip = document.createElement('div');
    strip.id = 'heliodon-field-strip';
    strip.className = 'heliodon-field-strip';
    strip.setAttribute('aria-label', 'Planetary heliodon geometry for this field sheet');
    strip.innerHTML = `
      <strong>EARTH CASTS THE NIGHT</strong>
      <span data-heliodon-field-time>Captured locally now</span>
      <span data-heliodon-field-values>Sun overhead — · facing away —</span>
      <small>Derived solar geometry · not measured weather · no additional service contacted</small>
    `;

    const escapementStrip = document.querySelector('#escapement-field-strip');
    const latencyStrip = document.querySelector('#latency-field-strip');
    const cosmicStrip = document.querySelector('.cosmic-field-strip');
    const meta = fieldSheet.querySelector('.field-sheet-meta');
    if (escapementStrip?.parentNode === fieldSheet) escapementStrip.after(strip);
    else if (latencyStrip?.parentNode === fieldSheet) latencyStrip.after(strip);
    else if (cosmicStrip?.parentNode === fieldSheet) cosmicStrip.after(strip);
    else if (meta) fieldSheet.insertBefore(strip, meta);
    else fieldSheet.append(strip);
    return strip;
  }

  function snapshotTime(document, host) {
    const HostDate = host?.Date || Date;
    const nowMs = HostDate.now();
    const text = document.querySelector('#snapshot-time')?.textContent || '';
    const match = text.match(/Snapshot received (\d{2}):(\d{2}):(\d{2}) UTC/);
    if (!match) return null;

    const now = new HostDate(nowMs);
    const hour = Number(match[1]);
    const minute = Number(match[2]);
    const second = Number(match[3]);
    const day = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hour, minute, second);
    return [day - 86400000, day, day + 86400000]
      .sort((a, b) => Math.abs(a - nowMs) - Math.abs(b - nowMs))[0];
  }

  function coordinatePair(point) {
    return `${commons.formatCoordinate(point?.lat, 'N', 'S')} · ${commons.formatCoordinate(point?.lon, 'E', 'W')}`;
  }

  function formatUtc(ms) {
    return new Date(ms).toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC');
  }

  root.MuseumPlanetaryHeliodonView = Object.freeze({ mount });
  mount(root.document, root);
})(typeof globalThis !== 'undefined' ? globalThis : this);
