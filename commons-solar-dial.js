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
