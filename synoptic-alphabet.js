(() => {
  'use strict';

  const core = globalThis.MuseumSynopticAlphabetCore;
  if (!core) return;
  const SNAPSHOT_EVENT = 'museum:commons-snapshot';
  const anchor = document.querySelector('#weather-score') || document.querySelector('.windows-section');
  if (!anchor || document.querySelector('#synoptic-alphabet')) return;

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
    <div class="synoptic-alphabet-shell">
      <div class="synoptic-alphabet-copy">
        <p class="eyebrow">THE SYNOPTIC ALPHABET · THIRTEEN DISCRETE STATIONS</p>
        <h2 id="synoptic-alphabet-title">A weather map would have to invent the space between these marks.</h2>
        <p>Meteorological station models compress several observations into one compact glyph. COMMONS / NOW borrows that idea, but not the standard symbol set: each fixed point gets a deliberately local Museum glyph for temperature, wind speed and precipitation only.</p>
        <p class="synoptic-alphabet-contract"><strong>Encoding contract:</strong> the vertical notch places temperature on the fixed −100°C to +70°C acquisition range; the horizontal bar places wind speed on the fixed 0–400 km/h range; the precipitation mark is hollow for 0 mm, filled for a current value above 0 mm, and absent when that field is missing. Numeric text remains authoritative.</p>
        <p class="synoptic-alphabet-refusal"><strong>What is not here matters:</strong> no wind direction, pressure, cloud cover, front analysis, interpolation or inferred condition exists in this instrument. These thirteen glyphs do not join up into weather between stations.</p>
      </div>
      <div class="synoptic-alphabet-panel">
        <p id="synoptic-alphabet-status" class="synoptic-alphabet-status" role="status" aria-live="polite">Waiting for the thirteen fixed weather points.</p>
        <ol id="synoptic-alphabet-list" class="synoptic-alphabet-list" aria-label="Thirteen compact Museum station glyphs"></ol>
        <p class="synoptic-alphabet-note">Inspired by the compression principle of synoptic station notation; this is not WMO station-model notation and should not be read as one.</p>
      </div>
    </div>`;
  anchor.insertAdjacentElement('afterend', section);

  const list = section.querySelector('#synoptic-alphabet-list');
  const status = section.querySelector('#synoptic-alphabet-status');

  document.addEventListener(SNAPSHOT_EVENT, (event) => {
    render(event?.detail?.snapshot || globalThis.MuseumCommonsSnapshot);
  });

  render(globalThis.MuseumCommonsSnapshot);

  function formatNumber(value, suffix) {
    return Number.isFinite(value) ? `${value.toFixed(1)}${suffix}` : 'unavailable';
  }

  function render(snapshot) {
    const glyphs = core.buildAlphabet(snapshot);
    const summary = core.summarize(glyphs);
    list.replaceChildren();

    for (const glyph of glyphs) {
      const item = document.createElement('li');
      item.className = 'synoptic-glyph-card';

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
      else wind.style.setProperty('--wind-extent', `${Math.max(6, glyph.windExtent * 100)}%`);

      const rain = document.createElement('span');
      rain.className = 'synoptic-rain-mark';
      rain.dataset.state = glyph.precipitationState;

      symbol.append(spine, wind, rain);

      const copy = document.createElement('div');
      copy.className = 'synoptic-glyph-copy';
      const heading = document.createElement('strong');
      heading.textContent = `POINT ${glyph.id}`;
      const readings = document.createElement('span');
      readings.textContent = `Temperature ${formatNumber(glyph.temperature, '°C')} · Wind ${formatNumber(glyph.wind, ' km/h')} · Precipitation ${formatNumber(glyph.precipitation, ' mm')}`;
      copy.append(heading, readings);

      item.append(symbol, copy);
      list.append(item);
    }

    if (!summary.points) {
      status.textContent = 'Waiting for the thirteen fixed weather points.';
      return;
    }
    status.textContent = `${summary.complete}/${summary.points} points have all three encoded fields; ${summary.partial} partial; ${summary.empty} with none. Missing fields remain gaps, not zeros.`;
  }
})();