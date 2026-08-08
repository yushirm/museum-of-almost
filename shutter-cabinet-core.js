(function attachShutterCabinetCore(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.MuseumShutterCabinetCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function buildShutterCabinetCore() {
  'use strict';

  const OUTCOMES = Object.freeze({
    COMMON: 'COMMON TEMPORAL FORM',
    DIFFERENT: 'SAME LATCH. DIFFERENT TEMPORAL SUPPORT.',
    SAME_CLAIM: 'SAME CLAIM',
    WAITING: 'WAITING FOR LATCH'
  });

  const FORMS = Object.freeze({
    TRAILING_WINDOW: 'TRAILING WINDOW',
    CURRENT_READING: 'CURRENT READING',
    STATUS_SET: 'STATUS-DEFINED SET'
  });

  const CLAIMS = Object.freeze([
    Object.freeze({
      id: 'earthquakes',
      label: 'Past-hour earthquake population',
      shortLabel: 'EARTHQUAKES',
      form: FORMS.TRAILING_WINDOW,
      aperture: 'ONE-HOUR SHUTTER',
      contract: 'USGS request path: all_hour.geojson',
      scope: 'The normalized earthquake headlines are drawn from the returned past-hour feed population. This describes the feed window, not a claim that one sensor exposed continuously for exactly sixty minutes.'
    }),
    Object.freeze({
      id: 'solar',
      label: 'Solar-wind summary',
      shortLabel: 'SOLAR WIND',
      form: FORMS.CURRENT_READING,
      aperture: 'CURRENT APERTURE',
      contract: 'NOAA SWPC summary product: solar-wind-speed.json',
      scope: 'The page uses the current solar-wind summary product. Current-reading form does not mean synchronized with the other current products or valid for a shared duration.'
    }),
    Object.freeze({
      id: 'scales',
      label: 'NOAA space-weather scales',
      shortLabel: 'NOAA SCALES',
      form: FORMS.CURRENT_READING,
      aperture: 'CURRENT APERTURE',
      contract: 'NOAA SWPC noaa-scales current record',
      scope: 'The existing signal reducer selects the current G/S/R record. The temporal form is current-record, not a common freshness or forecast horizon.'
    }),
    Object.freeze({
      id: 'weather',
      label: 'Fixed-point current weather',
      shortLabel: 'WEATHER',
      form: FORMS.CURRENT_READING,
      aperture: 'CURRENT APERTURE',
      contract: 'Open-Meteo request parameter: current=temperature_2m,wind_speed_10m,precipitation',
      scope: 'The thirteen fixed points use current fields. Their source-valid timestamps may differ from the latch; Sounding Well owns that timestamp-depth question.'
    }),
    Object.freeze({
      id: 'events',
      label: 'Open EONET event set',
      shortLabel: 'EONET OPEN',
      form: FORMS.STATUS_SET,
      aperture: 'OPEN-STATUS GATE',
      contract: 'EONET request parameter: status=open&limit=500',
      scope: 'The returned population is selected by open status at acquisition. The Museum does not turn that status membership into a trailing duration or infer how long each event has been open.'
    })
  ]);

  function validDate(value) {
    if (value === null || value === undefined || value === '') return null;
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? date : null;
  }

  function finite(value) {
    if (value === null || value === undefined || value === '') return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function claimById(id) {
    return CLAIMS.find((claim) => claim.id === id) || null;
  }

  function availability(snapshot, claimOrId) {
    const claim = typeof claimOrId === 'string' ? claimById(claimOrId) : claimOrId;
    if (!claim) return false;
    if (claim.id === 'earthquakes') return snapshot?.earthquakes?.available === true;
    if (claim.id === 'solar') return snapshot?.solar?.available === true;
    if (claim.id === 'scales') return snapshot?.scales?.available === true;
    if (claim.id === 'weather') return snapshot?.weather?.available === true;
    if (claim.id === 'events') return snapshot?.events?.available === true;
    return false;
  }

  function currentReadout(snapshot, claimOrId) {
    const claim = typeof claimOrId === 'string' ? claimById(claimOrId) : claimOrId;
    if (!claim || !availability(snapshot, claim)) return 'UNAVAILABLE IN THIS LATCH';

    if (claim.id === 'earthquakes') {
      const count = finite(snapshot?.earthquakes?.count);
      return count === null ? 'RETURNED · COUNT UNAVAILABLE' : `${count} earthquake feature${count === 1 ? '' : 's'} in returned past-hour feed`;
    }
    if (claim.id === 'solar') {
      const speed = finite(snapshot?.solar?.speed);
      return speed === null ? 'CURRENT PRODUCT RETURNED' : `${speed.toFixed(1)} km/s current solar-wind summary`;
    }
    if (claim.id === 'scales') return 'CURRENT G/S/R PRODUCT RETURNED';
    if (claim.id === 'weather') {
      const count = finite(snapshot?.weather?.availableCount);
      return count === null ? 'CURRENT FIELDS RETURNED' : `${count}/13 fixed points returned at least one current weather field`;
    }
    if (claim.id === 'events') {
      const count = finite(snapshot?.events?.count);
      const suffix = snapshot?.events?.capped === true ? ' · RETURNED WINDOW CAPPED AT 500' : '';
      return count === null ? `OPEN-STATUS RESPONSE RETURNED${suffix}` : `${count} returned open event${count === 1 ? '' : 's'}${suffix}`;
    }
    return '—';
  }

  function comparisonContract(leftOrId, rightOrId) {
    const left = typeof leftOrId === 'string' ? claimById(leftOrId) : leftOrId;
    const right = typeof rightOrId === 'string' ? claimById(rightOrId) : rightOrId;
    if (!left || !right) return null;
    if (left.id === right.id) {
      return Object.freeze({ outcome: OUTCOMES.SAME_CLAIM, commonForm: false, reason: 'Choose two different claim families; repeating one claim does not test temporal compatibility.' });
    }
    if (left.form === right.form) {
      return Object.freeze({
        outcome: OUTCOMES.COMMON,
        commonForm: true,
        reason: `Both claims use the Museum-local temporal form ${left.form}. This does not establish one measurement instant, freshness, duration, synchronization, or quality.`
      });
    }
    return Object.freeze({
      outcome: OUTCOMES.DIFFERENT,
      commonForm: false,
      reason: `${left.form} and ${right.form} are different temporal support forms. One latch can hold both without turning them into one shared time axis.`
    });
  }

  function buildPair(snapshot, leftId = 'earthquakes', rightId = 'weather') {
    const left = claimById(leftId) || CLAIMS[0];
    const right = claimById(rightId) || CLAIMS[3];
    const receivedAt = validDate(snapshot?.receivedAt);
    const contract = comparisonContract(left, right);
    return Object.freeze({
      waiting: !receivedAt,
      receivedAt: receivedAt?.toISOString() || null,
      left: Object.freeze({
        ...left,
        available: Boolean(receivedAt && availability(snapshot, left)),
        readout: receivedAt ? currentReadout(snapshot, left) : 'WAITING FOR FIRST REAL LATCH'
      }),
      right: Object.freeze({
        ...right,
        available: Boolean(receivedAt && availability(snapshot, right)),
        readout: receivedAt ? currentReadout(snapshot, right) : 'WAITING FOR FIRST REAL LATCH'
      }),
      contract: receivedAt ? contract : Object.freeze({ outcome: OUTCOMES.WAITING, commonForm: false, reason: 'Waiting for the first real Commons latch before temporal support can be inspected.' })
    });
  }

  function summarySentence(pair, forced = false) {
    if (!pair || pair.waiting) return 'Waiting for the first real Commons latch before the shutter cabinet can compare claim support.';
    if (!forced) return `${pair.left.shortLabel}: ${pair.left.form}. ${pair.right.shortLabel}: ${pair.right.form}. The latch is shared; no common time axis has been requested.`;
    if (pair.contract.outcome === OUTCOMES.COMMON) {
      return `COMMON TEMPORAL FORM: both selected claims are ${pair.left.form}. Same form is not the same instant, timestamp age, duration, synchronization, or measurement process.`;
    }
    if (pair.contract.outcome === OUTCOMES.DIFFERENT) {
      return `SAME LATCH. DIFFERENT TEMPORAL SUPPORT. ${pair.left.shortLabel} is ${pair.left.form}; ${pair.right.shortLabel} is ${pair.right.form}. The shared timeline is refused.`;
    }
    return pair.contract.reason;
  }

  return Object.freeze({
    OUTCOMES,
    FORMS,
    CLAIMS,
    validDate,
    finite,
    claimById,
    availability,
    currentReadout,
    comparisonContract,
    buildPair,
    summarySentence
  });
});
