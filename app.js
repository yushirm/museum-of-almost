(() => {
  'use strict';

  const core = globalThis.MuseumCommonsCore;
  if (!core) return;

  const SOURCES = Object.freeze({
    earthquakes: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson',
    solar: 'https://services.swpc.noaa.gov/products/summary/solar-wind-speed.json',
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
    stationLight: document.querySelector('#station-light')
  };

  let requestController = null;
  let snapshot = emptySnapshot();
  let selectedStationId = core.STATIONS[0].id;

  ui.refresh?.addEventListener('click', refreshSnapshot);
  window.addEventListener('online', renderConnection);
  window.addEventListener('offline', renderConnection);

  renderConnection();
  renderStations();
  renderSnapshot();
  refreshSnapshot();

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js').catch(() => {});
    }, { once: true });
  }

  async function refreshSnapshot() {
    requestController?.abort();
    requestController = new AbortController();
    const timeout = window.setTimeout(() => requestController?.abort(), 9000);

    if (ui.refresh) {
      ui.refresh.disabled = true;
      ui.refresh.textContent = 'Reading the world…';
    }
    if (ui.liveStatus) ui.liveStatus.textContent = 'Requesting one current snapshot from four public services.';
    if (ui.snapshotDetail) ui.snapshotDetail.textContent = 'USGS · NOAA SWPC · Open-Meteo · NASA EONET';
    document.body.dataset.loading = 'true';

    const weatherUrl = buildWeatherUrl();
    const results = await Promise.allSettled([
      fetchJson(SOURCES.earthquakes, requestController.signal),
      fetchJson(SOURCES.solar, requestController.signal),
      fetchJson(weatherUrl, requestController.signal),
      fetchJson(SOURCES.events, requestController.signal)
    ]);

    window.clearTimeout(timeout);
    requestController = null;

    const [quakeResult, solarResult, weatherResult, eventResult] = results;
    snapshot = {
      earthquakes: quakeResult.status === 'fulfilled'
        ? core.normalizeEarthquakes(quakeResult.value)
        : { available: false, count: null, strongest: null, meanDepth: null, significant: null },
      solar: solarResult.status === 'fulfilled'
        ? core.normalizeSolarWind(solarResult.value)
        : { available: false, speed: null, state: 'unavailable' },
      weather: weatherResult.status === 'fulfilled'
        ? core.normalizeWeather(weatherResult.value)
        : core.normalizeWeather(null),
      events: eventResult.status === 'fulfilled'
        ? core.normalizeEvents(eventResult.value)
        : { available: false, count: null, capped: false, categories: [] },
      receivedAt: new Date()
    };

    document.body.dataset.loading = 'false';
    renderSnapshot();
    renderStations();

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
      weather: core.normalizeWeather(null),
      events: { available: false, count: null, capped: false, categories: [] },
      receivedAt: null
    };
  }

  function renderSnapshot() {
    const availableSources = [snapshot.earthquakes, snapshot.solar, snapshot.weather, snapshot.events]
      .filter((source) => source.available).length;

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
      ui.snapshotDetail.textContent = availableSources === 4
        ? 'All four public services answered. No automatic polling.'
        : `${availableSources} of 4 public services answered. Missing sources stay visibly unavailable.`;
    }
    if (ui.liveStatus) {
      ui.liveStatus.textContent = availableSources
        ? `Current snapshot ready: ${availableSources} of 4 sources answered.`
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

  function renderStations() {
    const now = snapshot.receivedAt || new Date();
    const pointsById = new Map(snapshot.weather.points.map((point) => [point.id, point]));
    const lightStates = core.STATIONS.map((station) => ({
      id: station.id,
      state: core.sunState(now, station.lat, station.lon)
    }));
    const dayCount = lightStates.filter((entry) => entry.state === 'day').length;

    if (ui.daylightCount) ui.daylightCount.textContent = `${dayCount}/13 in daylight`;

    renderMap(pointsById, lightStates);
    renderStationList(pointsById, lightStates);
    renderSelectedStation(pointsById, lightStates);
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
