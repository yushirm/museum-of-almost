(function attachTemporalSoundingCore(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.MuseumTemporalSoundingCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function buildTemporalSoundingCore() {
  'use strict';

  const CHANNELS = Object.freeze([
    { id: 'earthquakes', source: 'USGS', label: 'EARTH', semantic: 'feed generated' },
    { id: 'solar', source: 'NOAA', label: 'FLOW', semantic: 'solar-wind observation' },
    { id: 'scales', source: 'NOAA', label: 'SCALES', semantic: 'space-weather scale observation' },
    { id: 'weather', source: 'OPEN-METEO', label: 'WEATHER', semantic: 'current-valid time' },
    { id: 'events', source: 'NASA', label: 'EVENTS', semantic: 'event geometry dates are per event' }
  ]);

  function parseUtcTimestamp(value) {
    if (value instanceof Date) {
      const time = value.getTime();
      return Number.isFinite(time) ? time : null;
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      const milliseconds = Math.abs(value) < 1e11 ? value * 1000 : value;
      return Number.isFinite(milliseconds) ? milliseconds : null;
    }

    const raw = String(value ?? '').trim();
    if (!raw) return null;
    if (/^\d{10,13}$/.test(raw)) return parseUtcTimestamp(Number(raw));

    let normalized = raw;
    if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?$/.test(raw)) {
      normalized = raw.replace(' ', 'T') + 'Z';
    }
    const time = Date.parse(normalized);
    return Number.isFinite(time) ? time : null;
  }

  function solarWindTimestamp(payload) {
    if (!payload) return null;
    if (Array.isArray(payload)) {
      const header = Array.isArray(payload[0]) ? payload[0].map((value) => String(value).toLowerCase()) : [];
      const timeIndex = header.findIndex((value) => /time|date|stamp/.test(value));
      if (timeIndex >= 0) {
        for (let index = payload.length - 1; index >= 1; index -= 1) {
          const row = payload[index];
          if (!Array.isArray(row)) continue;
          const parsed = parseUtcTimestamp(row[timeIndex]);
          if (parsed !== null) return parsed;
        }
      }
      return null;
    }
    if (typeof payload !== 'object') return null;
    for (const key of ['TimeStamp', 'time_tag', 'timeTag', 'timestamp', 'time']) {
      const parsed = parseUtcTimestamp(payload[key]);
      if (parsed !== null) return parsed;
    }
    return null;
  }

  function scalesTimestamp(payload) {
    if (!payload || typeof payload !== 'object') return null;
    const current = payload['0'] && typeof payload['0'] === 'object' ? payload['0'] : payload;
    const date = String(current.DateStamp ?? current.dateStamp ?? '').trim();
    const time = String(current.TimeStamp ?? current.timeStamp ?? '').trim();
    if (date && time) return parseUtcTimestamp(`${date}T${time}Z`);
    return parseUtcTimestamp(current.TimeStamp ?? current.timestamp ?? current.time);
  }

  function weatherTimestamps(payload) {
    const responses = Array.isArray(payload) ? payload : payload ? [payload] : [];
    return responses
      .map((response) => parseUtcTimestamp(response?.current?.time))
      .filter((value) => value !== null)
      .sort((a, b) => a - b);
  }

  function readingFor(channel, record, latchMs) {
    const definition = CHANNELS.find((entry) => entry.id === channel);
    const base = {
      id: channel,
      source: definition?.source || channel.toUpperCase(),
      label: definition?.label || channel.toUpperCase(),
      semantic: definition?.semantic || 'source timestamp',
      state: 'unavailable',
      oldestAt: null,
      newestAt: null,
      ageMs: null,
      sampleCount: 0
    };

    if (!record?.answered) return base;
    if (channel === 'events') {
      return {
        ...base,
        state: 'incomparable',
        semantic: 'event geometry dates are per event, not a feed-wide observation time'
      };
    }

    let times = [];
    if (channel === 'earthquakes') {
      const generated = parseUtcTimestamp(record.payload?.metadata?.generated);
      if (generated !== null) times = [generated];
    } else if (channel === 'solar') {
      const observed = solarWindTimestamp(record.payload);
      if (observed !== null) times = [observed];
    } else if (channel === 'scales') {
      const observed = scalesTimestamp(record.payload);
      if (observed !== null) times = [observed];
    } else if (channel === 'weather') {
      times = weatherTimestamps(record.payload);
    }

    if (!times.length) {
      return { ...base, state: 'timestamp-unavailable' };
    }

    const oldest = times[0];
    const newest = times[times.length - 1];
    if (!Number.isFinite(latchMs)) {
      return {
        ...base,
        state: 'timestamp-unavailable',
        oldestAt: new Date(oldest).toISOString(),
        newestAt: new Date(newest).toISOString(),
        ageMs: null,
        sampleCount: times.length
      };
    }

    const offset = latchMs - oldest;
    return {
      ...base,
      state: offset >= 0 ? 'sounded' : 'ahead',
      oldestAt: new Date(oldest).toISOString(),
      newestAt: new Date(newest).toISOString(),
      ageMs: offset,
      sampleCount: times.length
    };
  }

  function deriveSounding(records, latchTime) {
    const latchMs = parseUtcTimestamp(latchTime);
    const readings = CHANNELS.map((channel) => readingFor(channel.id, records?.[channel.id], latchMs));
    if (latchMs === null) {
      return { available: false, latchAt: null, thicknessMs: null, comparableCount: 0, readings };
    }

    const comparable = readings.filter((reading) => reading.oldestAt !== null && Number.isFinite(reading.ageMs));
    const pastAges = comparable.map((reading) => Math.max(0, reading.ageMs));
    return {
      available: comparable.length > 0,
      latchAt: new Date(latchMs).toISOString(),
      thicknessMs: pastAges.length ? Math.max(...pastAges) : null,
      comparableCount: comparable.length,
      readings
    };
  }

  function formatDuration(milliseconds) {
    if (!Number.isFinite(milliseconds)) return 'unknown';
    const ahead = milliseconds < 0;
    const seconds = Math.round(Math.abs(milliseconds) / 1000);
    let text;
    if (seconds < 1) text = 'under 1 second';
    else if (seconds < 60) text = `${seconds} second${seconds === 1 ? '' : 's'}`;
    else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainder = seconds % 60;
      text = remainder ? `${minutes}m ${remainder}s` : `${minutes} minute${minutes === 1 ? '' : 's'}`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      text = minutes ? `${hours}h ${minutes}m` : `${hours} hour${hours === 1 ? '' : 's'}`;
    }
    return ahead ? `${text} ahead of latch` : text;
  }

  return Object.freeze({
    CHANNELS,
    parseUtcTimestamp,
    solarWindTimestamp,
    scalesTimestamp,
    weatherTimestamps,
    deriveSounding,
    formatDuration
  });
});
