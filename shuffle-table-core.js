(function attachShuffleTableCore(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.MuseumShuffleTableCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function buildShuffleTableCore() {
  'use strict';

  const LENSES = Object.freeze([
    Object.freeze({
      id: 'temperature',
      label: 'Temperature range',
      shortLabel: 'TEMPERATURE',
      field: 'temperature',
      unit: '°C',
      digits: 1,
      summaryKeys: Object.freeze(['minTemp', 'maxTemp']),
      summaryLabel: 'MIN / MAX RANGE'
    }),
    Object.freeze({
      id: 'wind',
      label: 'Terrestrial wind summary',
      shortLabel: 'WIND',
      field: 'wind',
      unit: ' km/h',
      digits: 1,
      summaryKeys: Object.freeze(['meanWind', 'maxWind']),
      summaryLabel: 'MEAN / MAX'
    }),
    Object.freeze({
      id: 'precipitation',
      label: 'Precipitation-reporting count',
      shortLabel: 'PRECIPITATION',
      field: 'precipitation',
      unit: ' mm',
      digits: 1,
      summaryKeys: Object.freeze(['raining']),
      summaryLabel: 'REPORTING COUNT'
    })
  ]);

  function finite(value) {
    if (value === null || value === undefined || value === '') return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function validDate(value) {
    if (value === null || value === undefined || value === '') return null;
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? date : null;
  }

  function round(value, digits = 1) {
    const number = finite(value);
    if (number === null) return null;
    const factor = 10 ** digits;
    return Math.round(number * factor) / factor;
  }

  function lensById(id) {
    return LENSES.find((lens) => lens.id === id) || null;
  }

  function pointId(point, index) {
    const id = String(point?.id || '').trim();
    return id || String(index + 1).padStart(2, '0');
  }

  function sourceEntries(snapshot, lensOrId) {
    const lens = typeof lensOrId === 'string' ? lensById(lensOrId) : lensOrId;
    if (!lens) return [];
    const points = Array.isArray(snapshot?.weather?.points) ? snapshot.weather.points : [];
    return points
      .map((point, index) => Object.freeze({
        id: pointId(point, index),
        value: finite(point?.[lens.field])
      }))
      .sort((a, b) => a.id.localeCompare(b.id));
  }

  function rotateFiniteAssignments(entries) {
    const rows = Array.isArray(entries) ? entries : [];
    const finiteRows = rows.filter((entry) => finite(entry?.value) !== null);
    const donorById = new Map();

    if (finiteRows.length >= 2) {
      finiteRows.forEach((entry, index) => {
        donorById.set(entry.id, finiteRows[(index + 1) % finiteRows.length]);
      });
    } else if (finiteRows.length === 1) {
      donorById.set(finiteRows[0].id, finiteRows[0]);
    }

    return Object.freeze(rows.map((entry) => {
      const actualValue = finite(entry?.value);
      if (actualValue === null) {
        return Object.freeze({
          id: entry?.id || '—',
          actualValue: null,
          hypotheticalValue: null,
          donorId: null,
          assignmentMoved: false,
          valueChanged: false,
          missing: true
        });
      }

      const donor = donorById.get(entry.id) || entry;
      const hypotheticalValue = finite(donor.value);
      return Object.freeze({
        id: entry.id,
        actualValue,
        hypotheticalValue,
        donorId: donor.id,
        assignmentMoved: donor.id !== entry.id,
        valueChanged: hypotheticalValue !== actualValue,
        missing: false
      });
    }));
  }

  function computeSummary(lensOrId, values) {
    const lens = typeof lensOrId === 'string' ? lensById(lensOrId) : lensOrId;
    if (!lens) return null;
    const numbers = (Array.isArray(values) ? values : [])
      .map(finite)
      .filter((value) => value !== null);
    if (!numbers.length) return null;

    if (lens.id === 'temperature') {
      return Object.freeze({
        minTemp: round(Math.min(...numbers), 1),
        maxTemp: round(Math.max(...numbers), 1)
      });
    }

    if (lens.id === 'wind') {
      const mean = numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
      return Object.freeze({
        meanWind: round(mean, 1),
        maxWind: round(Math.max(...numbers), 1)
      });
    }

    if (lens.id === 'precipitation') {
      return Object.freeze({
        raining: numbers.filter((value) => value > 0).length
      });
    }

    return null;
  }

  function authoritativeSummary(snapshot, lensOrId) {
    const lens = typeof lensOrId === 'string' ? lensById(lensOrId) : lensOrId;
    if (!lens || snapshot?.weather?.available !== true) return null;
    const weather = snapshot.weather;

    if (lens.id === 'temperature') {
      const minTemp = finite(weather.minTemp);
      const maxTemp = finite(weather.maxTemp);
      return minTemp === null || maxTemp === null ? null : Object.freeze({ minTemp, maxTemp });
    }

    if (lens.id === 'wind') {
      const meanWind = finite(weather.meanWind);
      const maxWind = finite(weather.maxWind);
      return meanWind === null || maxWind === null ? null : Object.freeze({ meanWind, maxWind });
    }

    if (lens.id === 'precipitation') {
      const raining = finite(weather.raining);
      return raining === null ? null : Object.freeze({ raining });
    }

    return null;
  }

  function summaryEqual(lensOrId, left, right) {
    const lens = typeof lensOrId === 'string' ? lensById(lensOrId) : lensOrId;
    if (!lens || !left || !right) return false;
    return lens.summaryKeys.every((key) => finite(left[key]) === finite(right[key]));
  }

  function formatNumber(value, digits) {
    const number = finite(value);
    if (number === null) return '—';
    return number.toLocaleString('en-US', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
      useGrouping: false
    });
  }

  function formatValue(lensOrId, value) {
    const lens = typeof lensOrId === 'string' ? lensById(lensOrId) : lensOrId;
    if (!lens) return '—';
    const number = finite(value);
    if (number === null) return '—';
    return `${formatNumber(number, lens.digits)}${lens.unit}`;
  }

  function formatSummary(lensOrId, summary) {
    const lens = typeof lensOrId === 'string' ? lensById(lensOrId) : lensOrId;
    if (!lens || !summary) return '—';
    if (lens.id === 'temperature') {
      return `${formatNumber(summary.minTemp, 1)}°C → ${formatNumber(summary.maxTemp, 1)}°C`;
    }
    if (lens.id === 'wind') {
      return `mean ${formatNumber(summary.meanWind, 1)} km/h · max ${formatNumber(summary.maxWind, 1)} km/h`;
    }
    if (lens.id === 'precipitation') {
      const count = finite(summary.raining);
      return count === null ? '—' : `${formatNumber(count, 0)} reporting point${count === 1 ? '' : 's'}`;
    }
    return '—';
  }

  function buildTable(snapshot, lensId = 'temperature') {
    const lens = lensById(lensId) || LENSES[0];
    const receivedAt = validDate(snapshot?.receivedAt);
    const source = sourceEntries(snapshot, lens);
    const entries = rotateFiniteAssignments(source);
    const finiteCount = entries.filter((entry) => !entry.missing).length;
    const actualValues = entries.map((entry) => entry.actualValue);
    const hypotheticalValues = entries.map((entry) => entry.hypotheticalValue);
    const actualComputed = computeSummary(lens, actualValues);
    const hypotheticalComputed = computeSummary(lens, hypotheticalValues);
    const authoritative = receivedAt ? authoritativeSummary(snapshot, lens) : null;
    const actualMatchesCanonical = Boolean(authoritative && summaryEqual(lens, authoritative, actualComputed));
    const hypotheticalMatchesCanonical = Boolean(authoritative && summaryEqual(lens, authoritative, hypotheticalComputed));
    const canPermute = Boolean(receivedAt && authoritative && finiteCount >= 2 && actualMatchesCanonical);

    return Object.freeze({
      waiting: !receivedAt,
      receivedAt: receivedAt?.toISOString() || null,
      lens,
      entries,
      finiteCount,
      missingCount: entries.length - finiteCount,
      canPermute,
      authoritative,
      actualComputed,
      hypotheticalComputed,
      actualMatchesCanonical,
      hypotheticalMatchesCanonical,
      sameHeadline: Boolean(canPermute && hypotheticalMatchesCanonical),
      movedAssignments: entries.filter((entry) => entry.assignmentMoved).length,
      changedValues: entries.filter((entry) => entry.valueChanged).length
    });
  }

  function summarySentence(table, shuffled = false) {
    if (!table || table.waiting) return 'Waiting for the first real Commons latch before the deck can be inspected.';
    if (!table.authoritative) return `${table.lens.label} is unavailable in the current normalized latch.`;
    if (!table.actualMatchesCanonical) return `The current point values no longer reproduce the authoritative ${table.lens.label.toLowerCase()} headline. The shuffle is withheld until that contract is reconciled.`;
    if (!table.canPermute) return `The current latch has fewer than two finite ${table.lens.field} values, so there is no non-trivial permutation to show.`;
    if (!shuffled) return `Actual deal: ${table.finiteCount} finite values support ${formatSummary(table.lens, table.authoritative)}. The headline does not record which point owns which value.`;
    return `Hypothetical permutation: ${table.movedAssignments} assignments moved while the authoritative headline remains ${formatSummary(table.lens, table.authoritative)}. This is not alternate weather.`;
  }

  return Object.freeze({
    LENSES,
    finite,
    validDate,
    round,
    lensById,
    sourceEntries,
    rotateFiniteAssignments,
    computeSummary,
    authoritativeSummary,
    summaryEqual,
    formatValue,
    formatSummary,
    buildTable,
    summarySentence
  });
});
