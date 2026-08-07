(() => {
  'use strict';

  const core = globalThis.MuseumCommonsCore;
  if (!core) return;

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const SNAPSHOT_EVENT = 'museum:commons-snapshot';
  const SOURCES = Object.freeze({
    earthquakes: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson',
    solar: 'https://services.swpc.noaa.gov/products/summary/solar-wind-speed.json',
    scales: 'https://services.swpc.noaa.gov/products/noaa-scales.json',
    weather: 'https://api.open-meteo.com/v1/forecast',
    events: 'https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=500'
  });

  const ui = {
    refresh: document.querySelector('#refresh-button'),
    connection: document.querySelector('#connection-state'),
    liveStatus: document.querySelector('#live-status'),
    snapshotTime: document.querySelector('#snapshot-time'),
    snapshotDetail: document.querySelector('#snapshot-detail'),
    worldSentence: document.querySelector('#world-sentence'),
    sourceCount: document.querySelector('#source-count'),
    samplePanel: document.querySelector('#sample-hold-panel'),
    samplePhase: document.querySelector('#sample-phase'),
    sampleCycle: document.querySelector('#sample-cycle'),
    sampleStatus: document.querySelector('#sample-status'),
    sampleFeeds: [...document.querySelectorAll('[data-sample-feed]')],
    quakeCount: document.querySelector('#quake-count'),
    quakeStrongest: document.querySelector('#quake-strongest'),
    quakeDepth: document.querySelector('#quake-depth'),
    quakeStrongestCopy: document.querySelector('#quake-strongest-copy'),
    solarWind: document.querySelector('#solar-wind'),
    solarState: document.querySelector('#solar-state'),
    eventCount: document.querySelector('#event-count'),
    eventCategories: document.querySelector('#event-categories'),
    weatherRange: document.querySelector('#weather-range'),
    weatherWind: document.querySelector('#weather-wind'),
    weatherRain: document.querySelector('#weather-rain'),
    daylightCount: document.querySelector('#daylight-count'),
    stationPoints: document.querySelector('#station-points'),
    stationList: document.querySelector('#station-list'),
    stationName: document.querySelector('#station-name'),
    stationCoordinates: document.querySelector('#station-coordinates'),
    stationTemperature: document.querySelector('#station-temperature'),
    stationWind: document.querySelector('#station-wind'),
    stationRain: document.querySelector('#station-rain'),
    stationLight: document.querySelector('#station-light'),
    patchA: document.querySelector('#patch-a'),
    patchB: document.querySelector('#patch-b'),
    patchPoints: document.querySelector('#difference-points'),
    patchHelp: document.querySelector('#patch-help'),
    lensButtons: [...document.querySelectorAll('[data-lens]')],
    differenceReadout: document.querySelector('#difference-readout'),
    differenceScale: document.querySelector('#difference-scale'),
    differenceScaleLabel: document.querySelector('#difference-scale-label'),
    markerA: document.querySelector('#difference-marker-a'),
    markerB: document.querySelector('#difference-marker-b'),
    differenceDistance: document.querySelector('#difference-distance'),
    differenceTemperature: document.querySelector('#difference-temperature'),
    differenceWind: document.querySelector('#difference-wind'),
    differenceRain: document.querySelector('#difference-rain'),
    differenceLight: document.querySelector('#difference-light'),
    sectionGuides: document.querySelector('#section-guides'),
    sectionPosts: document.querySelector('#section-posts'),
    sectionPlotDesc: document.querySelector('#section-plot-desc'),
    sectionStatus: document.querySelector('#section-status'),
    sectionTableBody: document.querySelector('#section-table-body'),
    fieldSheetTime: document.querySelector('#field-sheet-time'),
    fieldSheetButton: document.querySelector('#field-sheet-button')
  };

  let requestController = null;
  let snapshot = emptySnapshot();
  globalThis.MuseumCommonsSnapshot = snapshot;
  let selectedStationId = core.STATIONS[0].id;
  let comparisonAId = '01';
  let comparisonBId = '09';
  let comparisonTarget = 'a';
  let comparisonLens = 'temperature';

  ui.refresh?.addEventListener('click', refreshSnapshot);
  ui.patchA?.addEventListener('click', () => armComparisonEnd('a'));
  ui.patchB?.addEventListener('click', () => armComparisonEnd('b'));
  ui.fieldSheetButton?.addEventListener('click', () => window.print());
  for (const button of ui.lensButtons) {
    button.addEventListener('click', () => {
      comparisonLens = button.dataset.lens || 'temperature';
      renderDifferenceEngine();
    });
  }
  window.addEventListener('online', renderConnection);
  window.addEventListener('offline', renderConnection);

  renderConnection();
  renderStations();
  renderSnapshot();
  renderSampleHold();
  refreshSnapshot();

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js').catch(() => {});
    }, { once: true });
  }

  async function refreshSnapshot() {
    requestController?.abort();
    requestController = new AbortController();
    const activeController = requestController;
    const timeout = window.setTimeout(() => activeController.abort(), 9000);

    if (ui.refresh) {
      ui.refresh.disabled = true;
      ui.refresh.textContent = 'Reading the world…';
    }
    if (ui.liveStatus) ui.liveStatus.textContent = 'Acquiring one five-feed snapshot from four public services.';
    document.body.dataset.loading = 'true';
    renderSampleAcquire();

    const weatherUrl = buildWeatherUrl();
    const results = await Promise.allSettled([
      fetchJson(SOURCES.earthquakes, activeController.signal),
      fetchJson(SOURCES.solar, activeController.signal),
      fetchJson(SOURCES.scales, activeController.signal),
      fetchJson(weatherUrl, activeController.signal),
      fetchJson(SOURCES.events, activeController.signal)
    ]);

    window.clearTimeout(timeout);
    if (requestController !== activeController) return;
    requestController = null;

    const [quakeResult, solarResult, scalesResult, weatherResult, eventResult] = results;
    snapshot = {
      earthquakes: quakeResult.status === 'fulfilled'
        ? core.normalizeEarthquakes(quakeResult.value)
        : { available: false, count: null, strongest: null, meanDepth: null, significant: null },
      solar: solarResult.status === 'fulfilled'
        ? core.normalizeSolarWind(solarResult.value)
        : { available: false, speed: null, state: 'unavailable' },
      scales: scalesResult.status === 'fulfilled'
        ? { available: true, value: scalesResult.value }
        : { available: false, value: null },
      weather: weatherResult.status === 'fulfilled'
        ? core.normalizeWeather(weatherResult.value)
        : core.normalizeWeather(null),
      events: eventResult.status === 'fulfilled'
        ? core.normalizeEvents(eventResult.value)
        : { available: false, count: null, capped: false, categories: [] },
      feeds: {
        earthquakes: quakeResult.status === 'fulfilled',
        solar: solarResult.status === 'fulfilled',
        scales: scalesResult.status === 'fulfilled',
        weather: weatherResult.status === 'fulfilled',
        events: eventResult.status === 'fulfilled'
      },
      receivedAt: new Date()
    };

    globalThis.MuseumCommonsSnapshot = snapshot;
    document.body.dataset.loading = 'false';
    renderSnapshot();
    renderStations();
    renderSampleHold();
    document.dispatchEvent(new CustomEvent(SNAPSHOT_EVENT, { detail: { snapshot } }));

    if (ui.refresh) {
      ui.refresh.disabled = false;
      ui.refresh.textContent = 'Refresh world';
    }
  }

  async function fetchJson(url, signal) {
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-store',
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      signal
    });
    if (!response.ok) throw new Error(`Source returned ${response.status}`);
    return response.json();
  }

  function buildWeatherUrl() {
    const url = new URL(SOURCES.weather);
    url.searchParams.set('latitude', core.STATIONS.map((station) => station.lat).join(','));
    url.searchParams.set('longitude', core.STATIONS.map((station) => station.lon).join(','));
    url.searchParams.set('current', 'temperature_2m,wind_speed_10m,precipitation');
    url.searchParams.set('timezone', 'UTC');
    return url.toString();
  }

  function emptySnapshot() {
    return {
      earthquakes: { available: false, count: null, strongest: null, meanDepth: null, significant: null },
      solar: { available: false, speed: null, state: 'unavailable' },
      scales: { available: false, value: null },
      weather: core.normalizeWeather(null),
      events: { available: false, count: null, capped: false, categories: [] },
      feeds: { earthquakes: false, solar: false, scales: false, weather: false, events: false },
      receivedAt: null
    };
  }

  function renderSampleAcquire() {
    if (ui.samplePanel) ui.samplePanel.dataset.phase = 'acquire';
    if (ui.samplePhase) ui.samplePhase.textContent = 'ACQUIRE';
    if (ui.sampleCycle) {
      ui.sampleCycle.textContent = snapshot.receivedAt
        ? `Holding ${formatUtc(snapshot.receivedAt)} while the next five-feed sample settles.`
        : 'Acquiring the first five-feed sample.';
    }
    for (const feed of ui.sampleFeeds) {
      feed.dataset.state = 'acquiring';
      const state = feed.querySelector('small');
      if (state) state.textContent = 'sampling…';
    }
    if (ui.sampleStatus) {
      ui.sampleStatus.textContent = 'The visible exhibits do not partially update during acquisition.';
    }
  }

  function renderSampleHold() {
    const answeredFeeds = Object.values(snapshot.feeds).filter(Boolean).length;
    if (ui.samplePanel) ui.samplePanel.dataset.phase = 'hold';
    if (ui.samplePhase) ui.samplePhase.textContent = 'HOLD';
    if (ui.sampleCycle) {
      ui.sampleCycle.textContent = snapshot.receivedAt
        ? `Latched ${formatUtc(snapshot.receivedAt)} · ${answeredFeeds}/5 feeds returned data.`
        : 'No sample latched yet.';
    }
    for (const feed of ui.sampleFeeds) {
      const key = feed.dataset.sampleFeed;
      const answered = Boolean(snapshot.feeds[key]);
      feed.dataset.state = snapshot.receivedAt ? (answered ? 'latched' : 'unavailable') : 'waiting';
      const state = feed.querySelector('small');
      if (state) {
        state.textContent = snapshot.receivedAt
          ? (answered ? 'latched in this sample' : 'unavailable in this sample')
          : 'awaiting first sample';
      }
    }
    if (ui.sampleStatus) {
      ui.sampleStatus.textContent = snapshot.receivedAt
        ? `All five channels settled before commit. ${answeredFeeds} returned data; missing feeds remain explicitly unavailable.`
        : 'Five public channels will settle before the first visible snapshot is committed.';
    }
  }

  function renderSnapshot() {
    const availableSources = [snapshot.earthquakes, snapshot.solar, snapshot.weather, snapshot.events]
      .filter((source) => source.available).length;
    const answeredFeeds = Object.values(snapshot.feeds).filter(Boolean).length;

    document.body.dataset.sourceCount = String(availableSources);
    if (ui.sourceCount) ui.sourceCount.textContent = `${availableSources}/4 SOURCES`;

    if (ui.quakeCount) ui.quakeCount.textContent = snapshot.earthquakes.available
      ? String(snapshot.earthquakes.count)
      : '—';
    if (ui.quakeStrongest) ui.quakeStrongest.textContent = snapshot.earthquakes.available && Number.isFinite(snapshot.earthquakes.strongest)
      ? `M${snapshot.earthquakes.strongest.toFixed(1)}`
      : '—';
    if (ui.quakeDepth) ui.quakeDepth.textContent = snapshot.earthquakes.available && Number.isFinite(snapshot.earthquakes.meanDepth)
      ? `${snapshot.earthquakes.meanDepth.toFixed(1)} km mean depth`
      : 'No earthquake snapshot';
    if (ui.quakeStrongestCopy) ui.quakeStrongestCopy.textContent = snapshot.earthquakes.available && Number.isFinite(snapshot.earthquakes.strongest)
      ? `M${snapshot.earthquakes.strongest.toFixed(1)}`
      : '—';

    if (ui.solarWind) ui.solarWind.textContent = snapshot.solar.available
      ? `${Math.round(snapshot.solar.speed)} km/s`
      : '—';
    if (ui.solarState) ui.solarState.textContent = snapshot.solar.available
      ? `${snapshot.solar.state} solar wind at Earth`
      : 'No space-weather snapshot';

    if (ui.eventCount) {
      ui.eventCount.textContent = snapshot.events.available
        ? `${snapshot.events.count}${snapshot.events.capped ? '+' : ''}`
        : '—';
    }
    renderEventCategories();

    if (ui.weatherRange) ui.weatherRange.textContent = snapshot.weather.available
      ? `${snapshot.weather.minTemp.toFixed(1)}–${snapshot.weather.maxTemp.toFixed(1)}°C`
      : '—';
    if (ui.weatherWind) ui.weatherWind.textContent = snapshot.weather.available
      ? `${snapshot.weather.meanWind.toFixed(1)} km/h mean wind`
      : 'No weather snapshot';
    if (ui.weatherRain) ui.weatherRain.textContent = snapshot.weather.available
      ? `${snapshot.weather.raining}/${snapshot.weather.availableCount} reporting precipitation`
      : '—';

    if (ui.worldSentence) ui.worldSentence.textContent = core.snapshotSentence(snapshot);

    if (ui.snapshotTime) {
      ui.snapshotTime.textContent = snapshot.receivedAt
        ? `Snapshot received ${formatUtc(snapshot.receivedAt)}`
        : 'No live snapshot yet';
    }
    if (ui.snapshotDetail) {
      ui.snapshotDetail.textContent = answeredFeeds === 5
        ? 'All five feeds across four public services answered. No automatic polling.'
        : `${answeredFeeds} of 5 current feeds answered. Missing feeds stay visibly unavailable.`;
    }
    if (ui.liveStatus) {
      ui.liveStatus.textContent = answeredFeeds
        ? `Current snapshot ready: ${answeredFeeds} of 5 feeds answered across ${availableSources} of 4 public services.`
        : 'No live source answered. The fixed world sample remains available; try Refresh world when connected.';
    }
  }

  function renderEventCategories() {
    if (!ui.eventCategories) return;
    ui.eventCategories.replaceChildren();

    if (!snapshot.events.available || snapshot.events.categories.length === 0) {
      const item = document.createElement('li');
      item.textContent = 'No category snapshot';
      ui.eventCategories.append(item);
      return;
    }

    for (const category of snapshot.events.categories) {
      const item = document.createElement('li');
      const label = document.createElement('span');
      const count = document.createElement('strong');
      label.textContent = category.title;
      count.textContent = String(category.count);
      item.append(label, count);
      ui.eventCategories.append(item);
    }
  }

  function lightStatesForCurrentSnapshot() {
    const now = snapshot.receivedAt || new Date();
    return core.STATIONS.map((station) => ({
      id: station.id,
      state: core.sunState(now, station.lat, station.lon)
    }));
  }

  function renderStations() {
    const pointsById = new Map(snapshot.weather.points.map((point) => [point.id, point]));
    const lightStates = lightStatesForCurrentSnapshot();
    const dayCount = lightStates.filter((entry) => entry.state === 'day').length;

    if (ui.daylightCount) ui.daylightCount.textContent = `${dayCount}/13 in daylight`;

    renderMap(pointsById, lightStates);
    renderStationList(pointsById, lightStates);
    renderSelectedStation(pointsById, lightStates);
    renderDifferenceEngine();
    renderPlanetarySection();
  }

  function renderMap(pointsById, lightStates) {
    if (!ui.stationPoints) return;
    ui.stationPoints.replaceChildren();

    for (const station of core.STATIONS) {
      const weather = pointsById.get(station.id);
      const light = lightStates.find((entry) => entry.id === station.id)?.state || 'unknown';
      const position = core.stationPosition(station);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'station-dot';
      button.dataset.station = station.id;
      button.dataset.light = light;
      button.dataset.selected = String(station.id === selectedStationId);
      button.style.setProperty('--x', `${position.x}%`);
      button.style.setProperty('--y', `${position.y}%`);
      const size = 32 + Math.min(24, Math.max(0, weather?.wind || 0)) * 0.35;
      button.style.setProperty('--size', `${size.toFixed(1)}px`);
      button.setAttribute('aria-pressed', String(station.id === selectedStationId));
      button.setAttribute('aria-label', stationAriaLabel(station, weather, light));

      const label = document.createElement('span');
      label.textContent = station.id;
      button.append(label);
      button.addEventListener('click', () => selectStation(station.id));
      ui.stationPoints.append(button);
    }
  }

  function renderStationList(pointsById, lightStates) {
    if (!ui.stationList) return;
    ui.stationList.replaceChildren();

    for (const station of core.STATIONS) {
      const weather = pointsById.get(station.id);
      const light = lightStates.find((entry) => entry.id === station.id)?.state || 'unknown';
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'station-card';
      button.dataset.selected = String(station.id === selectedStationId);
      button.setAttribute('aria-pressed', String(station.id === selectedStationId));
      button.addEventListener('click', () => selectStation(station.id));

      const id = document.createElement('span');
      id.className = 'station-card-id';
      id.textContent = `POINT ${station.id}`;
      const temp = document.createElement('strong');
      temp.textContent = weather?.available && Number.isFinite(weather.temperature)
        ? `${weather.temperature.toFixed(1)}°C`
        : '—';
      const meta = document.createElement('small');
      meta.textContent = weather?.available
        ? `${Math.round(weather.wind || 0)} km/h wind · ${light}`
        : `${coordinatePair(station)} · ${light}`;

      button.append(id, temp, meta);
      ui.stationList.append(button);
    }
  }

  function renderSelectedStation(pointsById, lightStates) {
    const station = core.STATIONS.find((candidate) => candidate.id === selectedStationId) || core.STATIONS[0];
    const weather = pointsById.get(station.id);
    const light = lightStates.find((entry) => entry.id === station.id)?.state || 'unknown';

    if (ui.stationName) ui.stationName.textContent = `POINT ${station.id}`;
    if (ui.stationCoordinates) ui.stationCoordinates.textContent = coordinatePair(station);
    if (ui.stationTemperature) ui.stationTemperature.textContent = weather?.available && Number.isFinite(weather.temperature)
      ? `${weather.temperature.toFixed(1)}°C`
      : '—';
    if (ui.stationWind) ui.stationWind.textContent = weather?.available && Number.isFinite(weather.wind)
      ? `${weather.wind.toFixed(1)} km/h`
      : '—';
    if (ui.stationRain) ui.stationRain.textContent = weather?.available && Number.isFinite(weather.precipitation)
      ? `${weather.precipitation.toFixed(1)} mm`
      : '—';
    if (ui.stationLight) ui.stationLight.textContent = light.toUpperCase();
  }

  function selectStation(id) {
    selectedStationId = id;
    renderStations();
  }

  function armComparisonEnd(target) {
    comparisonTarget = target === 'b' ? 'b' : 'a';
    renderDifferenceEngine();
  }

  function patchComparisonPoint(id) {
    if (!core.STATIONS.some((station) => station.id === id)) return;

    if (comparisonTarget === 'a') {
      if (id === comparisonBId) {
        [comparisonAId, comparisonBId] = [comparisonBId, comparisonAId];
      } else {
        comparisonAId = id;
      }
      comparisonTarget = 'b';
    } else {
      if (id === comparisonAId) {
        [comparisonAId, comparisonBId] = [comparisonBId, comparisonAId];
      } else {
        comparisonBId = id;
      }
      comparisonTarget = 'a';
    }

    renderDifferenceEngine();
  }

  function renderDifferenceEngine() {
    if (!ui.patchPoints) return;

    const pointsById = new Map(snapshot.weather.points.map((point) => [point.id, point]));
    const lightStates = new Map(lightStatesForCurrentSnapshot().map((entry) => [entry.id, entry.state]));
    const stationA = core.STATIONS.find((station) => station.id === comparisonAId) || core.STATIONS[0];
    const stationB = core.STATIONS.find((station) => station.id === comparisonBId) || core.STATIONS[1];
    const pointA = pointsById.get(stationA.id) || { ...stationA, available: false };
    const pointB = pointsById.get(stationB.id) || { ...stationB, available: false };
    const comparison = core.compareStationPair(
      pointA,
      pointB,
      lightStates.get(stationA.id) || 'unknown',
      lightStates.get(stationB.id) || 'unknown'
    );

    if (ui.patchA) {
      ui.patchA.textContent = `END A · POINT ${stationA.id}`;
      ui.patchA.dataset.active = String(comparisonTarget === 'a');
      ui.patchA.setAttribute('aria-pressed', String(comparisonTarget === 'a'));
    }
    if (ui.patchB) {
      ui.patchB.textContent = `END B · POINT ${stationB.id}`;
      ui.patchB.dataset.active = String(comparisonTarget === 'b');
      ui.patchB.setAttribute('aria-pressed', String(comparisonTarget === 'b'));
    }
    if (ui.patchHelp) {
      ui.patchHelp.textContent = `End ${comparisonTarget.toUpperCase()} is armed. Choose any fixed point below; the other end stays connected.`;
    }

    ui.patchPoints.replaceChildren();
    for (const station of core.STATIONS) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'patch-point';
      button.dataset.connection = station.id === comparisonAId ? 'a' : station.id === comparisonBId ? 'b' : 'none';
      button.setAttribute('aria-label', `Patch point ${station.id} to end ${comparisonTarget.toUpperCase()}`);
      button.addEventListener('click', () => patchComparisonPoint(station.id));

      const number = document.createElement('strong');
      number.textContent = station.id;
      const socket = document.createElement('span');
      socket.setAttribute('aria-hidden', 'true');
      button.append(number, socket);
      ui.patchPoints.append(button);
    }

    for (const button of ui.lensButtons) {
      const active = button.dataset.lens === comparisonLens;
      button.dataset.active = String(active);
      button.setAttribute('aria-pressed', String(active));
    }

    if (ui.differenceReadout) ui.differenceReadout.textContent = core.differenceSentence(comparison, comparisonLens);
    if (ui.differenceDistance) ui.differenceDistance.textContent = Number.isFinite(comparison.distanceKm)
      ? `${comparison.distanceKm.toLocaleString('en')} km`
      : '—';
    if (ui.differenceTemperature) ui.differenceTemperature.textContent = formatDelta(comparison.temperatureDelta, '°C');
    if (ui.differenceWind) ui.differenceWind.textContent = formatDelta(comparison.windDelta, ' km/h');
    if (ui.differenceRain) ui.differenceRain.textContent = formatDelta(comparison.precipitationDelta, ' mm');
    if (ui.differenceLight) ui.differenceLight.textContent = `${comparison.lightA.toUpperCase()} · ${comparison.lightB.toUpperCase()}`;

    renderDifferenceScale(comparison, pointA, pointB);
  }

  function renderDifferenceScale(comparison, pointA, pointB) {
    if (!ui.differenceScale || !ui.markerA || !ui.markerB || !ui.differenceScaleLabel) return;

    let positionA = 0;
    let positionB = 100;
    let label = '';

    if (comparisonLens === 'distance') {
      positionA = 0;
      positionB = core.metricPosition(comparison.distanceKm, 0, 20015);
      label = '0 km · 20,015 km maximum surface separation';
    } else if (comparisonLens === 'light') {
      const positions = { night: 10, twilight: 50, day: 90, unknown: 50 };
      positionA = positions[comparison.lightA] ?? 50;
      positionB = positions[comparison.lightB] ?? 50;
      label = 'NIGHT · TWILIGHT · DAY';
    } else {
      const metricKey = comparisonLens === 'wind'
        ? 'wind'
        : comparisonLens === 'precipitation'
          ? 'precipitation'
          : 'temperature';
      const range = core.observedRange(snapshot.weather.points, metricKey);
      const valueA = pointA?.[metricKey];
      const valueB = pointB?.[metricKey];
      positionA = range.available ? core.metricPosition(valueA, range.min, range.max) : 50;
      positionB = range.available ? core.metricPosition(valueB, range.min, range.max) : 50;
      const unit = metricKey === 'temperature' ? '°C' : metricKey === 'wind' ? ' km/h' : ' mm';
      label = range.available
        ? range.min === range.max
          ? `All reporting points: ${range.min.toFixed(1)}${unit}`
          : `13-point observed range: ${range.min.toFixed(1)}–${range.max.toFixed(1)}${unit}`
        : 'Live weather unavailable for this lens';
    }

    ui.differenceScale.dataset.lens = comparisonLens;
    ui.markerA.style.setProperty('--position', `${positionA}%`);
    ui.markerB.style.setProperty('--position', `${positionB}%`);
    ui.markerA.textContent = `A ${comparison.idA}`;
    ui.markerB.textContent = `B ${comparison.idB}`;
    ui.differenceScaleLabel.textContent = label;
  }

  function renderPlanetarySection() {
    if (!ui.sectionGuides || !ui.sectionPosts || !ui.sectionTableBody) return;

    const timestamp = snapshot.receivedAt || new Date();
    const section = core.planetarySection(snapshot.weather, timestamp);
    const reporting = section.points.filter((point) => point.temperature !== null || point.wind !== null || point.precipitation !== null).length;
    const daylight = section.points.filter((point) => point.light === 'day').length;

    if (ui.sectionStatus) {
      ui.sectionStatus.textContent = section.available
        ? `${reporting}/13 weather posts reporting · ${daylight}/13 daylight`
        : `No live weather · ${daylight}/13 daylight from local geometry`;
    }
    if (ui.fieldSheetTime) {
      ui.fieldSheetTime.textContent = snapshot.receivedAt
        ? `Snapshot received ${formatUtc(snapshot.receivedAt)}`
        : 'No live snapshot yet';
    }
    if (ui.sectionPlotDesc) {
      ui.sectionPlotDesc.textContent = section.ranges.temperature.available
        ? `Thirteen discrete posts ordered west to east. ${reporting} have current weather. Temperature ranges from ${section.ranges.temperature.min.toFixed(1)} to ${section.ranges.temperature.max.toFixed(1)} degrees Celsius. Wind and precipitation are separate local marks. Missing temperatures are marked at the baseline, not placed on the temperature scale. No values are interpolated between posts.`
        : `Thirteen discrete posts ordered west to east. Live weather is unavailable; light state is calculated locally. Missing temperatures stay off the temperature scale. No values are interpolated between posts.`;
    }

    ui.sectionGuides.replaceChildren();
    ui.sectionPosts.replaceChildren();

    const left = 35;
    const right = 965;
    const top = 55;
    const bottom = 245;
    const baseline = 285;

    appendSvgLine(ui.sectionGuides, left, baseline, right, baseline, 'section-axis');
    appendSvgLine(ui.sectionGuides, left, top, right, top, 'section-guide');
    appendSvgLine(ui.sectionGuides, left, bottom, right, bottom, 'section-guide');

    if (section.ranges.temperature.available) {
      appendSvgText(ui.sectionGuides, left, top - 10, `${section.ranges.temperature.max.toFixed(1)}°C`, 'section-axis-label', 'start');
      appendSvgText(ui.sectionGuides, left, bottom + 18, `${section.ranges.temperature.min.toFixed(1)}°C`, 'section-axis-label', 'start');
    } else {
      appendSvgText(ui.sectionGuides, left, top - 10, 'LIVE TEMPERATURE UNAVAILABLE', 'section-axis-label', 'start');
    }
    appendSvgText(ui.sectionGuides, left, 344, '180°W', 'section-axis-label', 'start');
    appendSvgText(ui.sectionGuides, right, 344, '180°E', 'section-axis-label', 'end');

    for (const point of section.points) {
      const x = left + (point.longitudePosition / 100) * (right - left);
      const temperatureAvailable = point.temperaturePosition !== null;
      const temperatureY = temperatureAvailable
        ? bottom - (point.temperaturePosition / 100) * (bottom - top)
        : baseline - 14;

      const post = appendSvgLine(
        ui.sectionPosts,
        x,
        temperatureY,
        x,
        baseline,
        temperatureAvailable ? 'section-post' : 'section-post section-post-missing'
      );
      post.dataset.light = point.light;

      if (temperatureAvailable) {
        const node = document.createElementNS(SVG_NS, 'circle');
        node.setAttribute('cx', x.toFixed(2));
        node.setAttribute('cy', temperatureY.toFixed(2));
        node.setAttribute('r', '6');
        node.setAttribute('class', 'section-temperature-node');
        node.dataset.light = point.light;
        ui.sectionPosts.append(node);
      } else {
        appendSvgLine(ui.sectionPosts, x - 4, temperatureY - 4, x + 4, temperatureY + 4, 'section-missing');
        appendSvgLine(ui.sectionPosts, x - 4, temperatureY + 4, x + 4, temperatureY - 4, 'section-missing');
      }

      if (point.windPosition !== null) {
        const windLength = 8 + (point.windPosition / 100) * 28;
        const direction = x > 920 ? -1 : 1;
        const windY = temperatureAvailable
          ? Math.min(baseline - 18, temperatureY + 16)
          : baseline - 34;
        appendSvgLine(
          ui.sectionPosts,
          x,
          windY,
          x + windLength * direction,
          windY,
          'section-wind'
        );
      }

      if (point.precipitation !== null && point.precipitation > 0) {
        const rainLength = 5 + (point.precipitationPosition / 100) * 15;
        appendSvgLine(ui.sectionPosts, x, baseline + 2, x, baseline + 2 + rainLength, 'section-rain');
      }

      appendSvgText(
        ui.sectionPosts,
        x,
        temperatureAvailable ? Math.max(20, temperatureY - 11) : baseline - 25,
        temperatureAvailable ? `${point.temperature.toFixed(1)}°` : '—',
        'section-temperature-label',
        'middle'
      );
      appendSvgText(ui.sectionPosts, x, 329, point.id, 'section-point-label', 'middle');
    }

    ui.sectionTableBody.replaceChildren();
    for (const point of section.points) {
      const row = document.createElement('tr');
      const values = [
        `POINT ${point.id}`,
        core.formatCoordinate(point.lon, 'E', 'W'),
        point.temperature === null ? '—' : `${point.temperature.toFixed(1)}°C`,
        point.wind === null ? '—' : `${point.wind.toFixed(1)} km/h`,
        point.precipitation === null ? '—' : `${point.precipitation.toFixed(1)} mm`,
        point.light.toUpperCase()
      ];
      for (const value of values) {
        const cell = document.createElement('td');
        cell.textContent = value;
        row.append(cell);
      }
      ui.sectionTableBody.append(row);
    }
  }

  function appendSvgLine(parent, x1, y1, x2, y2, className) {
    const line = document.createElementNS(SVG_NS, 'line');
    line.setAttribute('x1', Number(x1).toFixed(2));
    line.setAttribute('y1', Number(y1).toFixed(2));
    line.setAttribute('x2', Number(x2).toFixed(2));
    line.setAttribute('y2', Number(y2).toFixed(2));
    line.setAttribute('class', className);
    parent.append(line);
    return line;
  }

  function appendSvgText(parent, x, y, text, className, anchor) {
    const label = document.createElementNS(SVG_NS, 'text');
    label.setAttribute('x', Number(x).toFixed(2));
    label.setAttribute('y', Number(y).toFixed(2));
    label.setAttribute('class', className);
    label.setAttribute('text-anchor', anchor);
    label.textContent = text;
    parent.append(label);
    return label;
  }

  function formatDelta(value, unit) {
    if (!Number.isFinite(value)) return '—';
    const sign = value > 0 ? '+' : value < 0 ? '−' : '±';
    return `${sign}${Math.abs(value).toFixed(1)}${unit}`;
  }

  function stationAriaLabel(station, weather, light) {
    const readings = weather?.available
      ? `${weather.temperature?.toFixed(1) ?? 'unknown'} degrees Celsius, ${weather.wind?.toFixed(1) ?? 'unknown'} kilometers per hour wind, ${weather.precipitation?.toFixed(1) ?? 'unknown'} millimeters precipitation`
      : 'live weather unavailable';
    return `Point ${station.id}, ${coordinatePair(station)}, ${light}, ${readings}`;
  }

  function coordinatePair(station) {
    return `${core.formatCoordinate(station.lat, 'N', 'S')} · ${core.formatCoordinate(station.lon, 'E', 'W')}`;
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

  function renderConnection() {
    if (!ui.connection) return;
    ui.connection.textContent = navigator.onLine ? 'NETWORK AVAILABLE' : 'OFFLINE';
    ui.connection.dataset.online = String(navigator.onLine);
  }
})();