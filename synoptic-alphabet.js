(() => {
  'use strict';

  const core = globalThis.MuseumSynopticAlphabetCore;
  if (!core) return;
  const SNAPSHOT_EVENT = 'museum:commons-snapshot';
  const windowsSection = document.querySelector('.windows-section');
  const anchor = document.querySelector('#station-list');
  if (!windowsSection || !anchor || document.querySelector('#synoptic-alphabet')) return;

  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = './synoptic-alphabet.css';
  stylesheet.dataset.synopticAlphabetStyles = 'true';
  document.head.append(stylesheet);

  const section = document.createElement('section');
  section.id = 'synoptic-alphabet';
  section.className = 'synoptic-alphabet-section';
  section.setAttribute('aria-labelledby', 'synoptic-alphabet-title');
  section.innerHTML = `
    <div class="synoptic-alphabet-heading">
      <div>
        <p class="eyebrow">STATION NOTATION · THE SAME THIRTEEN WINDOWS</p>
        <h3 id="synoptic-alphabet-title">Same stations. Another grammar.</h3>
      </div>
      <p>Meteorological station models compress several observations into one mark. These local Museum glyphs encode only temperature, wind speed and precipitation from the same fixed snapshot above. Select a glyph and the map, numeric detail and notation stay on the same point.</p>
    </div>
    <div class="synoptic-alphabet-panel">
      <div class="synoptic-alphabet-contract">
        <p id="synoptic-alphabet-status" class="synoptic-alphabet-status" role="status" aria-live="polite">Waiting for the thirteen fixed weather points.</p>
        <p><strong>Encoding:</strong> vertical notch = temperature on −100°C to +70°C; horizontal bar = wind on 0–400 km/h; precipitation mark = hollow at 0 mm, filled above 0 mm, absent when missing.</p>
        <p><strong>Refusal:</strong> no wind direction, pressure, cloud cover, front analysis, interpolation or inferred condition. Numeric text remains authoritative.</p>
      </div>
      <ol id="synoptic-alphabet-list" class="synoptic-alphabet-list" aria-label="Thirteen linked Museum station glyphs"></ol>
      <div class="synoptic-relay" aria-labelledby="synoptic-relay-title">
        <div>
          <strong id="synoptic-relay-title">CARRY THIS WINDOW FORWARD</strong>
          <p>Selection can now cross the seam between observing one point and comparing two. The Difference Engine below remains the authoritative comparison surface.</p>
        </div>
        <div class="synoptic-relay-controls" role="group" aria-label="Patch the selected station into the Difference Engine">
          <button type="button" data-synoptic-patch="a">PATCH SELECTED AS A</button>
          <button type="button" data-synoptic-patch="b">PATCH SELECTED AS B</button>
        </div>
        <p id="synoptic-relay-status" class="synoptic-relay-status" role="status" aria-live="polite">POINT 01 is ready to carry into either comparison end.</p>
      </div>
      <p class="synoptic-alphabet-note">Inspired by the compression principle of synoptic station notation; this is not WMO station-model notation and should not be read as one.</p>
    </div>`;
  anchor.insertAdjacentElement('afterend', section);

  const list = section.querySelector('#synoptic-alphabet-list');
  const status = section.querySelector('#synoptic-alphabet-status');
  const relayStatus = section.querySelector('#synoptic-relay-status');
  const relayButtons = [...section.querySelectorAll('[data-synoptic-patch]')];
  let selectedId = currentSelectedStationId();

  document.addEventListener(SNAPSHOT_EVENT, (event) => {
    render(event?.detail?.snapshot || globalThis.MuseumCommonsSnapshot);
  });

  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    const stationControl = event.target.closest('.station-dot[data-station], .station-card');
    if (!stationControl || section.contains(stationControl)) return;
    const id = stationControl.dataset.station || stationControl.querySelector('.station-card-id')?.textContent?.match(/\d+/)?.[0];
    if (id) selectGlyph(id);
  });

  for (const button of relayButtons) {
    button.addEventListener('click', () => patchSelected(button.dataset.synopticPatch));
  }

  render(globalThis.MuseumCommonsSnapshot);

  function currentSelectedStationId() {
    return document.querySelector('.station-dot[data-selected="true"]')?.dataset.station || '01';
  }

  function formatNumber(value, suffix) {
    return Number.isFinite(value) ? `${value.toFixed(1)}${suffix}` : 'unavailable';
  }

  function selectGlyph(id) {
    selectedId = id;
    for (const button of list.querySelectorAll('[data-synoptic-station]')) {
      const active = button.dataset.synopticStation === selectedId;
      button.dataset.selected = String(active);
      button.setAttribute('aria-pressed', String(active));
    }
    updateStatus(core.buildAlphabet(globalThis.MuseumCommonsSnapshot));
    if (relayStatus) relayStatus.textContent = `POINT ${selectedId} is ready to carry into either comparison end.`;
  }

  function patchSelected(target) {
    if (target !== 'a' && target !== 'b') return;
    const targetLabel = target.toUpperCase();
    const arm = document.querySelector(`#patch-${target}`);
    if (!(arm instanceof HTMLButtonElement)) {
      if (relayStatus) relayStatus.textContent = 'The Difference Engine is unavailable in this rendering.';
      return;
    }

    arm.click();
    const expectedLabel = `Patch point ${selectedId} to end ${targetLabel}`;
    const patchPoint = [...document.querySelectorAll('.patch-point')]
      .find((button) => button.getAttribute('aria-label') === expectedLabel);

    if (!(patchPoint instanceof HTMLButtonElement)) {
      if (relayStatus) relayStatus.textContent = `POINT ${selectedId} could not be carried to end ${targetLabel}. Use the Difference Engine patchbay below.`;
      return;
    }

    patchPoint.click();
    if (relayStatus) relayStatus.textContent = `POINT ${selectedId} is now patched as end ${targetLabel}. The Difference Engine below shows the resulting comparison.`;
  }

  function updateStatus(glyphs) {
    const summary = core.summarize(glyphs);
    if (!summary.points) {
      status.textContent = 'Waiting for the thirteen fixed weather points.';
      return;
    }
    status.textContent = `POINT ${selectedId} is selected across map, detail and notation. ${summary.complete}/${summary.points} points have all three encoded fields; ${summary.partial} partial; ${summary.empty} with none. Missing fields remain gaps, not zeros.`;
  }

  function render(snapshot) {
    const glyphs = core.buildAlphabet(snapshot);
    selectedId = currentSelectedStationId();
    list.replaceChildren();

    for (const glyph of glyphs) {
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'synoptic-glyph-card';
      button.dataset.synopticStation = glyph.id;
      button.dataset.selected = String(glyph.id === selectedId);
      button.setAttribute('aria-pressed', String(glyph.id === selectedId));
      button.setAttribute('aria-label', `Select point ${glyph.id}. Temperature ${formatNumber(glyph.temperature, ' degrees Celsius')}; wind ${formatNumber(glyph.wind, ' kilometres per hour')}; precipitation ${formatNumber(glyph.precipitation, ' millimetres')}.`);
      button.addEventListener('click', () => {
        const mapControl = document.querySelector(`.station-dot[data-station="${glyph.id}"]`);
        if (mapControl instanceof HTMLButtonElement) mapControl.click();
        else selectGlyph(glyph.id);
      });

      const symbol = document.createElement('div');
      symbol.className = 'synoptic-glyph';
      symbol.setAttribute('aria-hidden', 'true');

      const spine = document.createElement('span');
      spine.className = 'synoptic-temperature-spine';
      const notch = document.createElement('span');
      notch.className = 'synoptic-temperature-notch';
      if (glyph.temperaturePosition === null) notch.dataset.missing = 'true';
      else notch.style.bottom = `${glyph.temperaturePosition * 100}%`;
      spine.append(notch);

      const wind = document.createElement('span');
      wind.className = 'synoptic-wind-bar';
      if (glyph.windExtent === null) wind.dataset.missing = 'true';
      else wind.style.setProperty('--wind-extent', `${(glyph.windExtent * 1.55).toFixed(3)}rem`);

      const rain = document.createElement('span');
      rain.className = 'synoptic-rain-mark';
      rain.dataset.state = glyph.precipitationState;

      symbol.append(spine, wind, rain);

      const copy = document.createElement('span');
      copy.className = 'synoptic-glyph-copy';
      const heading = document.createElement('strong');
      heading.textContent = `POINT ${glyph.id}`;
      const readings = document.createElement('span');
      readings.textContent = `${formatNumber(glyph.temperature, '°C')} · ${formatNumber(glyph.wind, ' km/h')} · ${formatNumber(glyph.precipitation, ' mm')}`;
      copy.append(heading, readings);

      button.append(symbol, copy);
      item.append(button);
      list.append(item);
    }

    updateStatus(glyphs);
    if (relayStatus) relayStatus.textContent = `POINT ${selectedId} is ready to carry into either comparison end.`;
  }
})();
