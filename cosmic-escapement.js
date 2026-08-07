(function attachCelestialEscapementView(root) {
  'use strict';
  const core = root.MuseumCelestialEscapementCore;
  if (!core || !root.document) return;

  function installStylesheet(document) {
    if (document.querySelector('link[data-celestial-escapement-styles]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './cosmic-escapement.css';
    link.dataset.celestialEscapementStyles = 'true';
    document.head.append(link);
  }

  function buildSection(document) {
    const section = document.createElement('section');
    section.id = 'celestial-escapement';
    section.className = 'celestial-escapement-section';
    section.dataset.mounted = 'false';
    section.setAttribute('aria-labelledby', 'celestial-escapement-title');
    section.innerHTML = `
      <div class="section-heading escapement-heading">
        <p class="eyebrow">THE CELESTIAL ESCAPEMENT / MANY CLOCKS, ONE NOW</p>
        <h2 id="celestial-escapement-title">The world keeps more than one clock.</h2>
        <p>One captured UTC instant drives four local cycles. Nothing below ticks while you watch: the mechanism freezes with the world snapshot and moves only when <strong>Refresh world</strong> captures another instant.</p>
      </div>
      <div class="escapement-case">
        <div class="escapement-stamp"><span>CAPTURED INSTANT</span><time id="escapement-time">awaiting JavaScript</time></div>
        <ol id="escapement-gears" class="escapement-gears" aria-label="Four celestial clock dials"><li>Celestial clocks awaiting JavaScript.</li></ol>
        <article class="escapement-detail" aria-labelledby="escapement-detail-name">
          <span class="escapement-detail-label">ENGAGED WHEEL</span>
          <h3 id="escapement-detail-name">Moon month</h3>
          <p id="escapement-detail-readout" class="escapement-detail-value">—</p>
          <dl>
            <div><dt>Reference period</dt><dd id="escapement-detail-period">—</dd></div>
            <div><dt>Cycle phase</dt><dd id="escapement-detail-phase">—</dd></div>
            <div><dt>Meaning</dt><dd id="escapement-detail-note">—</dd></div>
          </dl>
          <p id="escapement-status" role="status" aria-live="polite">Choose a wheel to inspect its frozen phase.</p>
        </article>
      </div>
      <p class="attribution escapement-attribution">Local approximation only. NASA supplies the reference day/year/month periods; JPL supplies lower-accuracy planetary mean-longitude elements. <a href="CELESTIAL_ESCAPEMENT.md">Sources, approximation limits, and rebuild notes.</a> No astronomy service is contacted at runtime.</p>
    `;
    return section;
  }

  function mount(document, host) {
    if (!document?.querySelector) return;
    installStylesheet(document);
    let section = document.querySelector('#celestial-escapement');
    if (!section) {
      section = buildSection(document);
      const anchor = document.querySelector('#cosmic-latency') || document.querySelector('#cosmic-signal') || document.querySelector('.world-sentence-panel');
      if (anchor?.parentNode) anchor.parentNode.insertBefore(section, anchor.nextSibling);
    }
    if (section.dataset.mounted === 'true') return;
    section.dataset.mounted = 'true';

    const time = section.querySelector('#escapement-time');
    const gears = section.querySelector('#escapement-gears');
    const name = section.querySelector('#escapement-detail-name');
    const readout = section.querySelector('#escapement-detail-readout');
    const period = section.querySelector('#escapement-detail-period');
    const phase = section.querySelector('#escapement-detail-phase');
    const note = section.querySelector('#escapement-detail-note');
    const status = section.querySelector('#escapement-status');
    let capturedMs = now(host);
    let selectedId = 'moon-month';

    function render(resetTime = false) {
      if (resetTime) capturedMs = now(host);
      const wheels = core.clocks(capturedMs);
      const selected = wheels.find((wheel) => wheel.id === selectedId) || wheels[0];
      if (!selected) return;

      if (time) {
        time.textContent = formatUtc(capturedMs);
        time.dateTime = new Date(capturedMs).toISOString();
      }

      if (gears) {
        gears.textContent = '';
        wheels.forEach((wheel, index) => {
          const li = document.createElement('li');
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'escapement-gear';
          button.dataset.escapementId = wheel.id;
          button.setAttribute('aria-pressed', String(wheel.id === selected.id));
          button.style.setProperty('--escapement-angle', `${wheel.angle.toFixed(3)}deg`);
          button.style.setProperty('--escapement-scale', String([0.86, 1, 1.12, 1.28][index] || 1));
          button.innerHTML = `<span class="escapement-gear-face" aria-hidden="true"><i></i></span><strong>${escapeHtml(wheel.name)}</strong><small>${escapeHtml(wheel.period)}</small><span>${escapeHtml(wheel.readout)}</span>`;
          li.append(button);
          gears.append(li);
        });
      }

      if (name) name.textContent = selected.name;
      if (readout) readout.textContent = selected.readout;
      if (period) period.textContent = selected.period;
      if (phase) phase.textContent = `${(selected.phase * 100).toFixed(1)}% · ${selected.angle.toFixed(1)}°`;
      if (note) note.textContent = selected.note;
      if (status) status.textContent = `${selected.name}: ${selected.readout}. Frozen at ${formatUtc(capturedMs)}.`;

      const fieldStrip = ensureFieldStrip(document);
      if (fieldStrip) {
        const fieldTime = fieldStrip.querySelector('[data-escapement-field-time]');
        const fieldValues = fieldStrip.querySelector('[data-escapement-field-values]');
        if (fieldTime) fieldTime.textContent = `Captured ${formatUtc(capturedMs)}`;
        if (fieldValues) fieldValues.textContent = wheels.map((wheel) => `${wheel.name} ${(wheel.phase * 100).toFixed(1)}%`).join(' · ');
      }
    }

    section.addEventListener('click', (event) => {
      const button = event.target?.closest?.('[data-escapement-id]');
      if (!button || !section.contains(button)) return;
      selectedId = button.dataset.escapementId;
      render(false);
    });

    document.querySelector('#refresh-button')?.addEventListener('click', () => render(true));
    render(false);
  }

  function ensureFieldStrip(document) {
    const fieldSheet = document.querySelector('#field-sheet');
    if (!fieldSheet) return null;
    const existing = document.querySelector('#escapement-field-strip');
    if (existing) return existing;
    const strip = document.createElement('div');
    strip.id = 'escapement-field-strip';
    strip.className = 'escapement-field-strip';
    strip.setAttribute('aria-label', 'Celestial escapement phases for this field sheet');
    strip.innerHTML = `
      <strong>MANY CLOCKS, ONE NOW</strong>
      <span data-escapement-field-time>Captured locally now</span>
      <span data-escapement-field-values>Earth turn — · Moon month — · Earth year — · Jupiter year —</span>
      <small>Frozen local approximation · no astronomy service contacted</small>
    `;
    const latencyStrip = document.querySelector('#latency-field-strip');
    const cosmicStrip = document.querySelector('.cosmic-field-strip');
    const meta = fieldSheet.querySelector('.field-sheet-meta');
    if (latencyStrip?.parentNode === fieldSheet) latencyStrip.after(strip);
    else if (cosmicStrip?.parentNode === fieldSheet) cosmicStrip.after(strip);
    else if (meta) fieldSheet.insertBefore(strip, meta);
    else fieldSheet.append(strip);
    return strip;
  }

  function now(host) {
    const HostDate = host?.Date || Date;
    return HostDate.now();
  }

  function formatUtc(ms) {
    return new Date(ms).toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC');
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  root.MuseumCelestialEscapementView = Object.freeze({ mount });
  mount(root.document, root);
})(typeof globalThis !== 'undefined' ? globalThis : this);
