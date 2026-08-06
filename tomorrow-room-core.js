'use strict';

globalThis.MuseumTomorrowCore = (() => {
  const subjects = [
    'Door', 'Garden', 'Clock', 'Bridge', 'Window', 'Library', 'Elevator',
    'Moon', 'Corridor', 'Machine', 'Choir', 'Map', 'Lantern', 'Museum'
  ];
  const conditions = [
    'That Opens One Minute Early',
    'Waiting Behind the Weather',
    'With a Better Question Inside',
    'That Remembers the Way Forward',
    'Borrowed from an Unfinished Morning',
    'Whose Instructions Become Kind',
    'Returning with More Sky Than Expected',
    'That Refuses the Most Obvious Ending',
    'Built from Several Patient Maybes',
    'Where the Missing Part Becomes a View'
  ];
  const forecasts = [
    'Light rain inside abandoned plans, clearing near the edges.',
    'A warm front of useful uncertainty arrives before noon.',
    'Visibility improves wherever nobody demands an answer.',
    'Scattered impossible openings with long intervals of ordinary courage.',
    'Low clouds gather around the plans that were nearly discarded.',
    'A quiet pressure system moves through unfinished conversations.',
    'The horizon remains negotiable for most of the day.',
    'Brief sunlight is expected in rooms that have forgotten their windows.'
  ];
  const openings = [
    'Tomorrow begins when a small mechanism decides not to repeat itself.',
    'The first hour arrives carrying a key with no preferred lock.',
    'Morning finds one overlooked possibility still awake.',
    'Before anything is decided, the day leaves a chair empty for surprise.',
    'A familiar route develops a soft, unexplained second direction.',
    'The future enters quietly through the part of the plan marked later.',
    'At dawn, the ordinary world misfiles one useful impossibility.'
  ];
  const turns = [
    'A delayed idea returns with less certainty and better manners.',
    'Something carefully avoided becomes a window rather than a wall.',
    'The shortest route asks to be reconsidered and is unexpectedly persuasive.',
    'A minor mistake reveals the only door that was not pretending.',
    'The day removes one unnecessary conclusion from its own label.',
    'An unfinished thing becomes accurate by refusing to become complete.',
    'A question survives long enough to grow a small room around itself.'
  ];
  const gifts = [
    'one hour that does not need to be productive',
    'a map whose blank space is correctly labelled',
    'permission to leave one beautiful thing unresolved',
    'a spare beginning folded into the afternoon',
    'the exact amount of courage required for a very small door',
    'a window that faces the direction you had stopped checking',
    'three quiet minutes returned without explanation',
    'an answer that knows when not to arrive'
  ];
  const cautions = [
    'Do not confuse clarity with completion.',
    'The most convincing corridor may still be thinking.',
    'Avoid repairing any silence that is doing useful work.',
    'A perfect plan may be wearing the future as a disguise.',
    'Leave room for the event that has not learned its name.',
    'Certainty will be available, but only in the souvenir shop.',
    'One closed door is merely resting. Do not take it personally.',
    'The forecast becomes less accurate when treated as an instruction.'
  ];
  const likelihoods = [
    'plausible in soft light',
    'unlikely but well prepared',
    'quietly approaching',
    'waiting for one small permission',
    'more possible than advertised',
    'visible from the corner of the plan',
    'currently disguised as ordinary'
  ];
  const palette = [
    ['#f4d58d', '#5e6b91', '#d48b77'],
    ['#cdb7ff', '#526b80', '#8abbb4'],
    ['#a9d8cc', '#4f5f7c', '#d6a06f'],
    ['#efbfa2', '#6f648f', '#8eb5c2'],
    ['#d7d0a8', '#536f70', '#bd7f91'],
    ['#b7d7f0', '#675d85', '#d2a36f'],
    ['#e7c4d4', '#53657b', '#93b99d']
  ];

  function hashString(value) {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function mulberry32(seed) {
    return function random() {
      let value = seed += 0x6D2B79F5;
      value = Math.imul(value ^ value >>> 15, value | 1);
      value ^= value + Math.imul(value ^ value >>> 7, value | 61);
      return ((value ^ value >>> 14) >>> 0) / 4294967296;
    };
  }

  function choose(random, options) {
    return options[Math.floor(random() * options.length)];
  }

  function normalizeState(rawState) {
    const state = rawState && typeof rawState === 'object' ? rawState : {};
    const fragments = Array.isArray(state.fragments)
      ? state.fragments
        .filter((fragment) => fragment && typeof fragment.text === 'string' && fragment.text.trim())
        .slice(0, 6)
        .map((fragment) => ({
          text: fragment.text.trim(),
          source: typeof fragment.source === 'string' ? fragment.source : ''
        }))
      : [];

    return {
      seed: Number.isFinite(state.seed) ? state.seed >>> 0 : 0,
      cycle: Number.isFinite(state.cycle) ? Math.max(0, Math.floor(state.cycle)) : 0,
      completedCollections: Number.isFinite(state.completedCollections)
        ? Math.max(0, Math.floor(state.completedCollections))
        : 0,
      fragments
    };
  }

  function validDate(dateLike) {
    const date = dateLike instanceof Date ? new Date(dateLike.getTime()) : new Date(dateLike);
    return Number.isNaN(date.getTime()) ? new Date(0) : date;
  }

  function dateKey(dateLike) {
    const date = validDate(dateLike);
    const year = String(date.getFullYear()).padStart(4, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function tomorrowDate(dateLike) {
    const date = validDate(dateLike);
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + 1);
    return date;
  }

  function fragmentFor(random, state) {
    if (state.fragments.length === 0) {
      return 'an empty pocket making room for the right unfinished thing';
    }
    return state.fragments[Math.floor(random() * state.fragments.length)].text;
  }

  function buildTomorrows(dateLike, rawState) {
    const state = normalizeState(rawState);
    const targetDate = tomorrowDate(dateLike);
    const targetKey = dateKey(targetDate);
    const signature = state.fragments.map((fragment) => `${fragment.text}:${fragment.source}`).join('|');
    const baseSeed = hashString([
      targetKey,
      state.seed,
      state.cycle,
      state.completedCollections,
      signature
    ].join('::'));

    const tomorrows = Array.from({ length: 7 }, (_, index) => {
      const seed = (baseSeed ^ Math.imul(index + 1, 0x9E3779B1)) >>> 0;
      const random = mulberry32(seed);
      const subject = subjects[(Math.floor(random() * subjects.length) + index) % subjects.length];
      const condition = conditions[(Math.floor(random() * conditions.length) + index * 3) % conditions.length];
      const angle = Number(((index * 360 / 7) - 90 + (random() - 0.5) * 9).toFixed(2));
      const radius = Number((31 + random() * 8).toFixed(2));
      const fragment = fragmentFor(random, state);

      return Object.freeze({
        index,
        seed,
        targetKey,
        designation: `TOMORROW ${String(index + 1).padStart(2, '0')}`,
        title: `The ${subject} ${condition}`,
        likelihood: choose(random, likelihoods),
        forecast: choose(random, forecasts),
        opening: choose(random, openings),
        turn: choose(random, turns),
        gift: choose(random, gifts),
        caution: choose(random, cautions),
        fragmentEcho: `The observatory finds “${fragment}” already waiting there.`,
        palette: palette[index % palette.length],
        angle,
        radius,
        pulse: Number((2.8 + random() * 2.8).toFixed(2)),
        delay: Number((random() * 2.4).toFixed(2))
      });
    });

    return Object.freeze({
      targetDate,
      targetKey,
      baseSeed,
      state,
      tomorrows: Object.freeze(tomorrows)
    });
  }

  function observatoryNote(rawState) {
    const state = normalizeState(rawState);
    if (state.completedCollections > 0) {
      return `The telescope remembers ${state.completedCollections} finished collection${state.completedCollections === 1 ? '' : 's'}, but remains professionally unconvinced by endings.`;
    }
    if (state.fragments.length > 0) {
      return `The observatory is using ${state.fragments.length} kept fragment${state.fragments.length === 1 ? '' : 's'} to focus tomorrow.`;
    }
    return 'The observatory is focusing with an empty catalogue and excellent optimism.';
  }

  return Object.freeze({
    buildTomorrows,
    dateKey,
    normalizeState,
    observatoryNote,
    tomorrowDate
  });
})();
