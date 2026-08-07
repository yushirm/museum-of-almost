(function attachCosmicLatencyView(root) {
  'use strict';
  const core = root.MuseumCosmicLatencyCore;
  if (!core || !root.document) return;
  const { snapshot, sentence, formatUtc } = core;

  function installStylesheet(document) {
    if (document.querySelector('link[data-cosmic-latency-styles]')) return;
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='./cosmic-latency.css';
    link.dataset.cosmicLatencyStyles='true';
    document.head.append(link);
  }

  function buildSection(document) {
    const section=document.createElement('section');
    section.id='cosmic-latency';
    section.className='cosmic-latency-section';
    section.setAttribute('aria-labelledby','latency-title');
    section.dataset.mounted='false';
    section.innerHTML=`
      <div class="section-heading latency-heading"><p class="eyebrow">THE LATENCY OF NOW / COSMIC RECEIVE DESK</p><h2 id="latency-title">Every telescope receives a delayed message.</h2><p>One reception instant can contain light that left its source seconds, years, millions of years, or almost the age of the universe ago. This instrument treats distance as signal latency. It does not contact a telescope or astronomy service.</p></div>
      <div class="latency-console"><div class="latency-reception"><span>RECEIVED HERE · DEVICE CLOCK</span><time id="latency-received" datetime="">local clock awaiting JavaScript</time><p>A normal webpage presents one current time. Astronomy gives us many observed pasts at once.</p></div><div class="latency-scale"><p class="latency-scale-note"><span>LIGHT DELAY · LOGARITHMIC</span><span>seconds ↔ billions of years</span></p><ol id="latency-nodes" class="latency-rail" aria-label="Cosmic landmarks ordered by light travel time"><li>Local light-delay scale awaiting JavaScript.</li></ol></div><article class="latency-detail" aria-labelledby="latency-selected-name"><div><span class="latency-detail-label">TUNED SOURCE</span><h3 id="latency-selected-name">Andromeda Galaxy</h3></div><p id="latency-selected-delay" class="latency-detail-value">~2.5 million years</p><dl><div><dt>Reference distance</dt><dd id="latency-selected-distance">about 2.5 million light-years</dd></div><div><dt>Light departed</dt><dd id="latency-selected-departure">~2.5 million years before reception</dd></div><div><dt>Interpretation</dt><dd id="latency-selected-note">The light arriving now is not a live view of Andromeda now.</dd></div></dl><p id="latency-readout" role="status" aria-live="polite">Choose a signal source to inspect its light delay.</p></article></div>
      <p class="attribution latency-attribution">Reference distances and lookback values are fixed local constants sourced from NASA. Nearby values are approximate because real distances vary; the cosmic microwave background is shown as lookback time, not a simple present-day distance. <a href="COSMIC_RECEIVE_DESK.md">Reference sources and rebuild notes.</a> No new runtime request.</p>`;
    return section;
  }

  function mount(document, host) {
    if (!document?.querySelector) return;
    installStylesheet(document);
    let section = document.querySelector('#cosmic-latency');
    if (!section) {
      section = buildSection(document);
      const anchor = document.querySelector('#cosmic-signal') || document.querySelector('.world-sentence-panel');
      if (anchor?.parentNode) anchor.parentNode.insertBefore(section, anchor.nextSibling);
    }
    if (section.dataset.mounted === 'true') return;
    section.dataset.mounted = 'true';

    const rail = document.querySelector('#latency-nodes');
    const received = document.querySelector('#latency-received');
    const selectedName = document.querySelector('#latency-selected-name');
    const selectedDelay = document.querySelector('#latency-selected-delay');
    const selectedDistance = document.querySelector('#latency-selected-distance');
    const selectedDeparture = document.querySelector('#latency-selected-departure');
    const selectedNote = document.querySelector('#latency-selected-note');
    const readout = document.querySelector('#latency-readout');
    let selectedId = 'andromeda';
    let receptionMs = now(host);

    if (rail) {
      rail.textContent = '';
      for (const item of snapshot(receptionMs)) {
        const li = document.createElement('li');
        li.style.setProperty('--latency-position', `${item.position.toFixed(3)}%`);
        li.style.setProperty('--latency-lane', String(item.lane));
        li.style.setProperty('--latency-shift', item.position <= 0 ? '0%' : item.position >= 100 ? '-100%' : '-50%');
        li.style.setProperty('--latency-anchor', item.position <= 0 ? '0%' : item.position >= 100 ? '100%' : '50%');
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'latency-node';
        button.dataset.latencyId = item.id;
        button.setAttribute('aria-pressed', String(item.id === selectedId));
        button.innerHTML = `<strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.delay)}</span>`;
        li.append(button);
        rail.append(li);
      }
    }

    const fieldStrip = ensureFieldStrip(document);

    function render(resetReception = false) {
      if (resetReception) receptionMs = now(host);
      const items = snapshot(receptionMs);
      const selected = items.find((item) => item.id === selectedId) || items[0];
      if (!selected) return;

      if (received) {
        received.textContent = formatUtc(receptionMs);
        received.dateTime = new Date(receptionMs).toISOString();
      }
      if (selectedName) selectedName.textContent = selected.name;
      if (selectedDelay) selectedDelay.textContent = selected.delay;
      if (selectedDistance) selectedDistance.textContent = selected.distance;
      if (selectedDeparture) selectedDeparture.textContent = selected.departure;
      if (selectedNote) selectedNote.textContent = selected.note;
      if (readout) readout.textContent = sentence(receptionMs, selected);

      for (const button of section.querySelectorAll('[data-latency-id]')) {
        button.setAttribute('aria-pressed', String(button.dataset.latencyId === selected.id));
      }

      if (fieldStrip) {
        const fieldTime = fieldStrip.querySelector('[data-latency-field-time]');
        if (fieldTime) fieldTime.textContent = `Received ${formatUtc(receptionMs)}`;
      }
    }

    section.addEventListener('click', (event) => {
      const button = event.target?.closest?.('[data-latency-id]');
      if (!button || !section.contains(button)) return;
      selectedId = button.dataset.latencyId;
      render(false);
    });

    document.querySelector('#refresh-button')?.addEventListener('click', () => render(true));
    render(false);
  }

  function now(host) {
    const HostDate = host?.Date || Date;
    return HostDate.now();
  }

  function ensureFieldStrip(document) {
    const fieldSheet = document.querySelector('#field-sheet');
    if (!fieldSheet) return null;
    const existing = document.querySelector('#latency-field-strip');
    if (existing) return existing;

    const strip = document.createElement('div');
    strip.id = 'latency-field-strip';
    strip.className = 'latency-field-strip';
    strip.setAttribute('aria-label', 'Cosmic light-delay note for this field sheet');
    strip.innerHTML = `
      <strong>THE LATENCY OF NOW</strong>
      <span data-latency-field-time>Received locally now</span>
      <span>Sunlight ~8 min 21 sec old · Andromeda light ~2.5 million years old · oldest observable light ~13.8 billion years</span>
      <small>Local reference scale only · no astronomy service contacted</small>
    `;

    const cosmicStrip = document.querySelector('.cosmic-field-strip');
    const meta = fieldSheet.querySelector('.field-sheet-meta');
    if (cosmicStrip?.parentNode === fieldSheet) cosmicStrip.after(strip);
    else if (meta) fieldSheet.insertBefore(strip, meta);
    else fieldSheet.append(strip);
    return strip;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }


  root.MuseumCosmicLatencyView=Object.freeze({ mount });
  mount(root.document,root);
})(typeof globalThis!=='undefined'?globalThis:this);
