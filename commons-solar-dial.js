(function attachCommonsSolarDial(root) {
  'use strict';

  const core = root.MuseumCommonsCore;
  const document = root.document;
  if (!core || !document || !Array.isArray(core.STATIONS)) return;

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const SNAPSHOT_EVENT = 'museum:commons-snapshot';
  const ui = {
    ticks: document.querySelector('#solar-dial-ticks'),
    points: document.querySelector('#solar-dial-points'),
    latch: document.querySelector('#solar-dial-latch'),
    summary: document.querySelector('#solar-dial-summary'),
    list: document.querySelector('#solar-dial-list'),
    desc: document.querySelector('#solar-dial-svg-desc')
  };

  if (!ui.ticks || !ui.points || !ui.list) return;

  renderTicks();
  render(root.MuseumCommonsSnapshot || null);
  document.addEventListener(SNAPSHOT_EVENT, (event) => {
    render(event.detail?.snapshot || root.MuseumCommonsSnapshot || null);
  });

  function renderTicks() {
    ui.ticks.replaceChildren();
    for (let hour = 0; hour < 24; hour += 1) {
      const angle = hour * 15;
      const inner = hour % 6 === 0 ? 144 : hour % 3 === 0 ? 150 : 156;
      const outer = 166;
      const a = polar(inner, angle);
      const b = polar(outer, angle);
      const line = svg('line', {
        x1: a.x,
        y1: a.y,
        x2: b.x,
        y2: b.y,
        class: hour % 6 === 0 ? 'solar-dial-major-tick' : 'solar-dial-tick'
      });
      ui.ticks.append(line);
    }

    for (const [hour, label] of [[0, '00'], [6, '06'], [12, '12'], [18, '18']]) {
      const point = polar(132, hour * 15);
      const text = svg('text', {
        x: point.x,
        y: point.y,
        class: 'solar-dial-hour-label'
      });
      text.textContent = label;
      ui.ticks.append(text);
    }
  }

  function render(snapshot) {
    const date = snapshot?.receivedAt ? new Date(snapshot.receivedAt) : null;
    const valid = date && Number.isFinite(date.getTime());
    ui.points.replaceChildren();
    ui.list.replaceChildren();

    if (!valid) {
      if (ui.latch) ui.latch.textContent = '—';
      if (ui.summary) ui.summary.textContent = 'Waiting for the first latched snapshot.';
      if (ui.desc) ui.desc.textContent = 'A twenty-four-hour dial waiting for the first Commons snapshot.';
      for (const station of core.STATIONS) ui.list.append(buildListItem(station, null, 'unknown'));
      return;
    }

    const geometry = core.solarGeometry(date);
    const counts = { day: 0, twilight: 0, night: 0, unknown: 0 };
    const readings = core.STATIONS.map((station) => {
      const light = core.sunState(date, station.lat, station.lon);
      counts[light] = (counts[light] || 0) + 1;
      return {
        station,
        light,
        minutes: modelSolarMinutes(station.lon, geometry)
      };
    });

    if (ui.latch) ui.latch.textContent = formatUtc(date);
    if (ui.summary) {
      ui.summary.textContent = `${counts.day}/13 fixed points are in daylight, ${counts.twilight}/13 in civil twilight, and ${counts.night}/13 in night at this one latch.`;
    }
    if (ui.desc) {
      ui.desc.textContent = `Twenty-four-hour model solar dial for thirteen fixed Commons points at ${formatUtc(date)}. ${counts.day} are in daylight, ${counts.twilight} in twilight, and ${counts.night} in night.`;
    }

    for (const reading of readings) {
      ui.points.append(buildMarker(reading));
      ui.list.append(buildListItem(reading.station, reading.minutes, reading.light));
    }
  }

  function buildMarker(reading) {
    const angle = (reading.minutes / 1440) * 360;
    const point = polar(112, angle);
    const group = svg('g', {
      class: 'solar-dial-marker',
      'data-light': reading.light,
      transform: `translate(${point.x} ${point.y})`
    });
    const circle = svg('circle', { r: 12 });
    const label = svg('text', { x: 0, y: 1 });
    label.textContent = reading.station.id;
    group.append(circle, label);
    return group;
  }

  function buildListItem(station, minutes, light) {
    const item = document.createElement('li');
    item.dataset.light = light;

    const id = document.createElement('strong');
    id.textContent = `POINT ${station.id}`;
    const time = document.createElement('span');
    time.textContent = Number.isFinite(minutes) ? `${formatSolarHour(minutes)} model solar` : 'awaiting latch';
    const state = document.createElement('small');
    state.textContent = `${light.toUpperCase()} · ${formatLongitude(station.lon)}`;

    item.append(id, time, state);
    return item;
  }

  function modelSolarMinutes(longitude, geometry) {
    if (!geometry?.subsolar || !Number.isFinite(Number(longitude))) return Number.NaN;
    const hourAngle = core.normalizeLongitude(Number(longitude) - geometry.subsolar.lon);
    if (!Number.isFinite(hourAngle)) return Number.NaN;
    const rawMinutes = (12 * 60) + (hourAngle * 4);
    const wrapped = ((rawMinutes % 1440) + 1440) % 1440;
    return Math.round(wrapped / 5) * 5 % 1440;
  }

  function formatSolarHour(minutes) {
    const normalized = ((Math.round(minutes) % 1440) + 1440) % 1440;
    const hours = Math.floor(normalized / 60);
    const mins = normalized % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  }

  function formatUtc(date) {
    return new Intl.DateTimeFormat('en', {
      timeZone: 'UTC',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(date) + ' UTC';
  }

  function formatLongitude(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return 'longitude unavailable';
    return `${Math.abs(number).toFixed(2)}° ${number >= 0 ? 'E' : 'W'}`;
  }

  function polar(radius, angleDegrees) {
    const radians = (angleDegrees - 90) * Math.PI / 180;
    return {
      x: 200 + Math.cos(radians) * radius,
      y: 200 + Math.sin(radians) * radius
    };
  }

  function svg(name, attributes) {
    const node = document.createElementNS(SVG_NS, name);
    for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, String(value));
    return node;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);

(function attachCommonsStateSpace(root) {
  'use strict';

  const document = root.document;
  const core = root.MuseumCommonsCore;
  if (!document || !core || !Array.isArray(core.STATIONS)) return;

  const anchor = document.querySelector('.difference-section');
  if (!anchor) return;

  const SNAPSHOT_EVENT = 'museum:commons-snapshot';
  const lenses = Object.freeze({
    atmosphere: {
      label: 'AIR / MOTION',
      x: 'temperature',
      y: 'wind',
      xLabel: 'temperature',
      yLabel: 'wind',
      xUnit: '°C',
      yUnit: ' km/h'
    },
    water: {
      label: 'WATER / AIR',
      x: 'precipitation',
      y: 'temperature',
      xLabel: 'precipitation',
      yLabel: 'temperature',
      xUnit: ' mm',
      yUnit: '°C'
    },
    rainMotion: {
      label: 'WATER / MOTION',
      x: 'precipitation',
      y: 'wind',
      xLabel: 'precipitation',
      yLabel: 'wind',
      xUnit: ' mm',
      yUnit: ' km/h'
    }
  });

  let activeLens = 'atmosphere';
  let activeStationId = core.STATIONS[0]?.id || '01';

  const section = document.createElement('section');
  section.className = 'phase-space-section';
  section.setAttribute('aria-labelledby', 'phase-space-title');

  const heading = document.createElement('div');
  heading.className = 'section-heading phase-space-heading';
  const eyebrow = document.createElement('p');
  eyebrow.className = 'eyebrow';
  eyebrow.textContent = 'THE STATE SPACE / SAME STATIONS, DIFFERENT GEOMETRY';
  const title = document.createElement('h2');
  title.id = 'phase-space-title';
  title.textContent = 'Move the map into measurement space.';
  const intro = document.createElement('p');
  intro.textContent = 'Borrowed from state-space diagrams: the same thirteen fixed stations can be arranged by what they are measuring instead of where they are. Nearby dots are similar only in the two displayed variables. The picture does not claim a cause, trend, cluster, or unsampled condition.';
  heading.append(eyebrow, title, intro);

  const controls = document.createElement('div');
  controls.className = 'phase-space-controls';
  controls.setAttribute('role', 'group');
  controls.setAttribute('aria-label', 'Choose the two-variable state-space portrait');
  for (const [key, lens] of Object.entries(lenses)) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.phaseLens = key;
    button.setAttribute('aria-pressed', String(key === activeLens));
    button.textContent = lens.label;
    button.addEventListener('click', () => {
      activeLens = key;
      render(root.MuseumCommonsSnapshot || null);
    });
    controls.append(button);
  }

  const layout = document.createElement('div');
  layout.className = 'phase-space-layout';

  const plot = document.createElement('div');
  plot.className = 'phase-space-plot';
  plot.setAttribute('role', 'group');
  plot.setAttribute('aria-label', 'Thirteen fixed Commons points arranged in measurement space');

  const yLabel = document.createElement('span');
  yLabel.className = 'phase-space-axis phase-space-axis-y';
  const xLabel = document.createElement('span');
  xLabel.className = 'phase-space-axis phase-space-axis-x';
  const points = document.createElement('div');
  points.className = 'phase-space-points';
  plot.append(yLabel, xLabel, points);

  const readout = document.createElement('aside');
  readout.className = 'phase-space-readout';
  readout.setAttribute('aria-live', 'polite');
  const readoutEyebrow = document.createElement('span');
  readoutEyebrow.className = 'eyebrow';
  readoutEyebrow.textContent = 'SELECTED POINT';
  const readoutTitle = document.createElement('h3');
  readoutTitle.textContent = 'POINT 01';
  const readoutValues = document.createElement('p');
  readoutValues.className = 'phase-space-values';
  readoutValues.textContent = 'Waiting for the current weather snapshot.';
  const readoutHelp = document.createElement('p');
  readoutHelp.className = 'phase-space-help';
  readoutHelp.textContent = 'Choose any numbered dot. The same point will also become the selected world window above.';
  readout.append(readoutEyebrow, readoutTitle, readoutValues, readoutHelp);

  layout.append(plot, readout);

  const note = document.createElement('p');
  note.className = 'phase-space-note';
  const noteStrong = document.createElement('strong');
  noteStrong.textContent = 'Same sample, no new feed. ';
  note.append(noteStrong, document.createTextNode('Positions are derived only from the current thirteen-point weather latch. Light state uses the same local solar geometry already present elsewhere in COMMONS / NOW. Missing values stay missing.'));

  section.append(heading, controls, layout, note);
  anchor.before(section);

  render(root.MuseumCommonsSnapshot || null);
  document.addEventListener(SNAPSHOT_EVENT, (event) => {
    render(event.detail?.snapshot || root.MuseumCommonsSnapshot || null);
  });

  function render(snapshot) {
    const lens = lenses[activeLens];
    const date = snapshot?.receivedAt ? new Date(snapshot.receivedAt) : null;
    const validDate = date && Number.isFinite(date.getTime());
    const weather = Array.isArray(snapshot?.weather?.points) ? snapshot.weather.points : [];
    const weatherById = new Map(weather.map((point) => [point.id, point]));
    const readings = core.STATIONS.map((station) => buildReading(station, weatherById.get(station.id), lens, validDate ? date : null));
    const available = readings.filter((reading) => Number.isFinite(reading.x) && Number.isFinite(reading.y));
    const xRange = rangeFor(available.map((reading) => reading.x));
    const yRange = rangeFor(available.map((reading) => reading.y));

    yLabel.textContent = `${lens.yLabel} ↑`;
    xLabel.textContent = `${lens.xLabel} →`;
    controls.querySelectorAll('[data-phase-lens]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.phaseLens === activeLens));
    });

    points.replaceChildren();
    for (const reading of readings) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'phase-space-point';
      button.dataset.light = reading.light;
      button.dataset.available = String(Number.isFinite(reading.x) && Number.isFinite(reading.y));
      button.dataset.selected = String(reading.station.id === activeStationId);
      button.textContent = reading.station.id;
      button.setAttribute('aria-pressed', String(reading.station.id === activeStationId));
      button.setAttribute('aria-label', stateSpaceAriaLabel(reading, lens));

      if (Number.isFinite(reading.x) && Number.isFinite(reading.y)) {
        button.style.setProperty('--phase-x', `${position(reading.x, xRange)}%`);
        button.style.setProperty('--phase-y', `${100 - position(reading.y, yRange)}%`);
      } else {
        button.style.setProperty('--phase-x', '50%');
        button.style.setProperty('--phase-y', '92%');
      }

      button.addEventListener('click', () => {
        activeStationId = reading.station.id;
        selectExistingStation(reading.station.id);
        render(root.MuseumCommonsSnapshot || snapshot || null);
      });
      points.append(button);
    }

    const selected = readings.find((reading) => reading.station.id === activeStationId) || readings[0];
    renderReadout(selected, lens, available.length, xRange, yRange);
    plot.setAttribute('aria-label', `${lens.yLabel} by ${lens.xLabel} state-space portrait for thirteen fixed Commons points; ${available.length} points have both displayed values.`);
  }

  function buildReading(station, weather, lens, date) {
    const light = date ? core.sunState(date, station.lat, station.lon) : 'unknown';
    const values = {
      temperature: weather?.available && Number.isFinite(weather.temperature) ? weather.temperature : Number.NaN,
      wind: weather?.available && Number.isFinite(weather.wind) ? weather.wind : Number.NaN,
      precipitation: weather?.available && Number.isFinite(weather.precipitation) ? weather.precipitation : Number.NaN
    };
    return {
      station,
      light,
      x: values[lens.x],
      y: values[lens.y]
    };
  }

  function rangeFor(values) {
    const finite = values.filter(Number.isFinite);
    if (!finite.length) return { min: 0, max: 1 };
    const min = Math.min(...finite);
    const max = Math.max(...finite);
    if (min === max) return { min: min - 0.5, max: max + 0.5 };
    const pad = (max - min) * 0.08;
    return { min: min - pad, max: max + pad };
  }

  function position(value, range) {
    if (!Number.isFinite(value) || !Number.isFinite(range.min) || !Number.isFinite(range.max) || range.max === range.min) return 50;
    return Math.max(5, Math.min(95, ((value - range.min) / (range.max - range.min)) * 100));
  }

  function renderReadout(reading, lens, availableCount, xRange, yRange) {
    if (!reading) return;
    readoutTitle.textContent = `POINT ${reading.station.id}`;
    if (!Number.isFinite(reading.x) || !Number.isFinite(reading.y)) {
      readoutValues.textContent = `${availableCount}/13 points currently have both displayed values. POINT ${reading.station.id} remains visible but cannot be placed on this portrait because one or both values are unavailable.`;
      return;
    }
    readoutValues.textContent = `${formatValue(reading.x, lens.xUnit)} ${lens.xLabel} · ${formatValue(reading.y, lens.yUnit)} ${lens.yLabel} · ${reading.light.toUpperCase()}. Display range: ${formatValue(xRange.min, lens.xUnit)}–${formatValue(xRange.max, lens.xUnit)} by ${formatValue(yRange.min, lens.yUnit)}–${formatValue(yRange.max, lens.yUnit)}.`;
  }

  function stateSpaceAriaLabel(reading, lens) {
    if (!Number.isFinite(reading.x) || !Number.isFinite(reading.y)) {
      return `Point ${reading.station.id}; unavailable in this ${lens.yLabel} by ${lens.xLabel} state-space portrait`;
    }
    return `Point ${reading.station.id}; ${lens.xLabel} ${formatValue(reading.x, lens.xUnit)}; ${lens.yLabel} ${formatValue(reading.y, lens.yUnit)}; ${reading.light}`;
  }

  function formatValue(value, unit) {
    return Number.isFinite(value) ? `${value.toFixed(1)}${unit}` : 'unavailable';
  }

  function selectExistingStation(id) {
    const selector = `.station-dot[data-station="${cssEscape(id)}"]`;
    const mapButton = document.querySelector(selector);
    if (mapButton && typeof mapButton.click === 'function') mapButton.click();
  }

  function cssEscape(value) {
    if (root.CSS?.escape) return root.CSS.escape(String(value));
    return String(value).replace(/[^a-zA-Z0-9_-]/g, '');
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
