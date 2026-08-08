(function attachTemporalSounding(root) {
  'use strict';

  const core = root.MuseumTemporalSoundingCore;
  const document = root.document;
  if (!core || !document || typeof root.fetch !== 'function') return;

  const SNAPSHOT_EVENT = 'museum:commons-snapshot';
  const PRECISION_EVENT = 'museum:commons-precision-trace';
  const CHANNEL_IDS = core.CHANNELS.map((channel) => channel.id);
  const nativeFetch = root.fetch.bind(root);
  const cyclesBySignal = new WeakMap();
  let cycles = [];
  let nextCycleId = 1;

  installStylesheet();
  const ui = mount();
  renderWaiting();

  root.fetch = async function observedCommonsFetch(input, init) {
    const channel = channelFor(input);
    if (!channel) return nativeFetch(input, init);

    const signal = init?.signal || (typeof Request !== 'undefined' && input instanceof Request ? input.signal : null);
    const cycle = cycleFor(signal);
    let response = null;

    try {
      response = await nativeFetch(input, init);
      const record = { answered: Boolean(response?.ok), payload: null };
      if (record.answered && channel !== 'events') {
        try {
          record.payload = await response.clone().json();
        } catch {
          record.payload = null;
        }
      }
      cycle.records[channel] = record;
      return response;
    } catch (error) {
      cycle.records[channel] = { answered: false, payload: null };
      throw error;
    } finally {
      cycle.settled.add(channel);
    }
  };

  document.addEventListener(SNAPSHOT_EVENT, (event) => {
    const snapshot = event.detail?.snapshot || root.MuseumCommonsSnapshot || null;
    const cycle = latestSettledCycle();
    if (!snapshot?.receivedAt || !cycle) {
      renderWaiting();
      return;
    }

    cycle.consumed = true;
    for (const candidate of cycles) {
      if (candidate.id < cycle.id) candidate.consumed = true;
    }

    const sounding = core.deriveSounding(cycle.records, snapshot.receivedAt);
    renderSounding(sounding);
    publishPrecisionTrace(cycle.records, snapshot);
    cycle.records = {};
    cycles = cycles.filter((candidate) => !candidate.consumed).slice(-4);
  });

  function publishPrecisionTrace(records, snapshot) {
    const offcutCore = root.MuseumOffcutDrawerCore;
    const commonsCore = root.MuseumCommonsCore;
    if (!offcutCore || !commonsCore || !Array.isArray(commonsCore.STATIONS)) return;

    const trace = offcutCore.buildTrace({
      earthquakes: records?.earthquakes?.payload || null,
      solar: records?.solar?.payload || null,
      weather: records?.weather?.payload || null
    }, snapshot, commonsCore.STATIONS);

    root.MuseumCommonsPrecisionTrace = trace;
    document.dispatchEvent(new CustomEvent(PRECISION_EVENT, { detail: { trace } }));
  }

  function cycleFor(signal) {
    if (signal && typeof signal === 'object') {
      const existing = cyclesBySignal.get(signal);
      if (existing) return existing;
      const created = createCycle(signal);
      cyclesBySignal.set(signal, created);
      return created;
    }
    return createCycle(null);
  }

  function createCycle(signal) {
    const cycle = {
      id: nextCycleId++,
      signal,
      records: {},
      settled: new Set(),
      consumed: false
    };
    cycles.push(cycle);
    if (cycles.length > 8) cycles = cycles.slice(-8);
    return cycle;
  }

  function latestSettledCycle() {
    return cycles
      .filter((cycle) => !cycle.consumed && cycle.settled.size === CHANNEL_IDS.length)
      .sort((a, b) => b.id - a.id)[0] || null;
  }

  function channelFor(input) {
    const raw = typeof input === 'string' || input instanceof URL ? String(input) : input?.url;
    if (!raw) return null;
    let url;
    try {
      url = new URL(raw, document.baseURI);
    } catch {
      return null;
    }

    if (url.protocol !== 'https:') return null;
    if (url.hostname === 'earthquake.usgs.gov' && url.pathname === '/earthquakes/feed/v1.0/summary/all_hour.geojson') return 'earthquakes';
    if (url.hostname === 'services.swpc.noaa.gov' && url.pathname === '/products/summary/solar-wind-speed.json') return 'solar';
    if (url.hostname === 'services.swpc.noaa.gov' && url.pathname === '/products/noaa-scales.json') return 'scales';
    if (url.hostname === 'api.open-meteo.com' && url.pathname === '/v1/forecast') return 'weather';
    if (
      url.hostname === 'eonet.gsfc.nasa.gov'
      && url.pathname === '/api/v3/events'
      && url.searchParams.get('status') === 'open'
      && url.searchParams.get('limit') === '500'
    ) return 'events';
    return null;
  }

  function installStylesheet() {
    if (document.querySelector('link[data-temporal-sounding-styles]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './sounding-well.css';
    link.dataset.temporalSoundingStyles = 'true';
    document.head.append(link);
  }

  function mount() {
    if (document.querySelector('#sounding-well')) return collectUi();
    const anchor = document.querySelector('.sample-hold-section');
    if (!anchor?.parentNode) return collectUi();

    const section = document.createElement('section');
    section.id = 'sounding-well';
    section.className = 'sounding-section';
    section.setAttribute('aria-labelledby', 'sounding-title');
    section.innerHTML = `
      <div class="sounding-heading">
        <p class="eyebrow">THE SOUNDING WELL / THE THICKNESS OF NOW</p>
        <h2 id="sounding-title">A latched moment can still have depth.</h2>
        <p>The five requests commit together, but their source timestamps do not necessarily describe the same instant or the same timestamp semantics. Borrowed from maritime sounding: the latch is the surface; a trustworthy source time hangs below it by how long before the latch it occurred.</p>
      </div>
      <div class="sounding-summary">
        <span>KNOWN SOURCE-TIME THICKNESS</span>
        <strong id="sounding-thickness">—</strong>
        <p id="sounding-span">Waiting for the first latched snapshot.</p>
      </div>
      <div class="sounding-instrument">
        <div class="sounding-surface">
          <span>SURFACE · LATCH</span>
          <strong id="sounding-latch">—</strong>
        </div>
        <ol id="sounding-lines" class="sounding-lines" aria-label="Temporal depth of source timestamps in the current latch"></ol>
        <p class="sounding-scale-note">Line depth is relative to the deepest comparable source timestamp in this latch. The written durations and timestamp labels are authoritative; depth is not a quality score, confidence score, or claim that every provider timestamp means the same thing.</p>
      </div>
      <p id="sounding-status" class="sounding-status" role="status" aria-live="polite">Waiting for source timestamp metadata from the shared acquisition.</p>
      <p class="sounding-note"><strong>No fake timestamp.</strong> NASA EONET pairs dates with individual event geometries rather than publishing one feed-wide observation instant, so its channel is left unsounded instead of forcing unlike time semantics onto one scale.</p>
    `;
    anchor.insertAdjacentElement('afterend', section);
    return collectUi();
  }

  function collectUi() {
    return {
      section: document.querySelector('#sounding-well'),
      thickness: document.querySelector('#sounding-thickness'),
      span: document.querySelector('#sounding-span'),
      latch: document.querySelector('#sounding-latch'),
      lines: document.querySelector('#sounding-lines'),
      status: document.querySelector('#sounding-status')
    };
  }

  function renderWaiting() {
    if (ui.thickness) ui.thickness.textContent = '—';
    if (ui.span) ui.span.textContent = 'Waiting for the first latched snapshot.';
    if (ui.latch) ui.latch.textContent = '—';
    if (ui.status) ui.status.textContent = 'Waiting for source timestamp metadata from the shared acquisition.';
    if (!ui.lines) return;
    ui.lines.replaceChildren();
    for (const channel of core.CHANNELS) {
      ui.lines.append(buildLine({
        ...channel,
        state: 'waiting',
        oldestAt: null,
        newestAt: null,
        ageMs: null,
        sampleCount: 0
      }, 0));
    }
  }

  function renderSounding(sounding) {
    const deepest = Number.isFinite(sounding.thicknessMs) ? sounding.thicknessMs : 0;
    if (ui.thickness) {
      ui.thickness.textContent = sounding.available ? core.formatDuration(deepest) : '—';
    }
    if (ui.latch) ui.latch.textContent = sounding.latchAt ? formatUtc(sounding.latchAt) : '—';
    if (ui.span) {
      ui.span.textContent = sounding.available
        ? `${sounding.comparableCount} of 5 channels expose a source timestamp that can be offset from this latch.`
        : 'No comparable source timestamp was available in this latch.';
    }
    if (ui.status) {
      ui.status.textContent = sounding.available
        ? `Known source-time thickness: ${core.formatDuration(deepest)} across ${sounding.comparableCount} comparable channels.`
        : 'The snapshot is latched, but no comparable source timestamp could be sounded.';
    }

    if (!ui.lines) return;
    ui.lines.replaceChildren();
    for (const reading of sounding.readings) {
      const fraction = deepest > 0 && Number.isFinite(reading.ageMs) && reading.ageMs > 0
        ? Math.min(1, reading.ageMs / deepest)
        : 0;
      ui.lines.append(buildLine(reading, fraction));
    }
  }

  function buildLine(reading, fraction) {
    const item = document.createElement('li');
    item.className = 'sounding-line-item';
    item.dataset.state = reading.state;
    item.style.setProperty('--depth', `${Math.round(fraction * 100)}%`);

    const head = document.createElement('div');
    head.className = 'sounding-line-head';
    const source = document.createElement('span');
    source.textContent = reading.source;
    const label = document.createElement('strong');
    label.textContent = reading.label;
    head.append(source, label);

    const well = document.createElement('div');
    well.className = 'sounding-dropzone';
    well.setAttribute('aria-hidden', 'true');
    const line = document.createElement('span');
    line.className = 'sounding-drop-line';
    const weight = document.createElement('i');
    weight.className = 'sounding-weight';
    line.append(weight);
    well.append(line);

    const detail = document.createElement('div');
    detail.className = 'sounding-line-detail';
    const age = document.createElement('strong');
    const semantic = document.createElement('small');
    semantic.textContent = reading.semantic;

    if (reading.state === 'waiting') {
      age.textContent = 'awaiting latch';
    } else if (reading.state === 'unavailable') {
      age.textContent = 'feed unavailable';
    } else if (reading.state === 'timestamp-unavailable') {
      age.textContent = 'timestamp unavailable';
    } else if (reading.state === 'incomparable') {
      age.textContent = 'not comparable';
    } else {
      age.textContent = core.formatDuration(reading.ageMs);
      const observed = document.createElement('small');
      observed.textContent = timestampDetail(reading);
      detail.append(age, semantic, observed);
      item.append(head, well, detail);
      return item;
    }

    detail.append(age, semantic);
    item.append(head, well, detail);
    return item;
  }

  function timestampDetail(reading) {
    if (!reading.oldestAt) return 'no source time';
    if (reading.newestAt && reading.newestAt !== reading.oldestAt) {
      return `${reading.sampleCount} valid times · oldest ${formatUtc(reading.oldestAt)} · newest ${formatUtc(reading.newestAt)}`;
    }
    return formatUtc(reading.oldestAt);
  }

  function formatUtc(value) {
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return '—';
    return new Intl.DateTimeFormat('en', {
      timeZone: 'UTC',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(date) + ' UTC';
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
