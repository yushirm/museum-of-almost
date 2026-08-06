'use strict';

globalThis.MuseumAfterDarkCore = (() => {
  const nameSubjects = [
    'Door', 'Weather', 'Lantern', 'Machine', 'Window', 'Corridor', 'Map',
    'Garden', 'Choir', 'Clock', 'Museum', 'Elevator', 'Moon', 'Library'
  ];
  const nameConditions = [
    'That Nearly Became a Direction',
    'Reserved for the Unfinished',
    'Waiting Behind the Ordinary',
    'With One Better Question Inside',
    'That Learned to Leave Room',
    'Borrowed from a Quiet Future',
    'Whose Missing Part Is Accurate',
    'That Refuses the Final Label',
    'Built from Patient Maybe',
    'Returning with More Sky'
  ];
  const nameNotes = [
    'Suitable for a room, a plan, or a small impossible institution.',
    'The label fits best when nothing is forced to become complete.',
    'Museum handwriting indicates confidence, then politely withdraws it.',
    'Filed under names that open more doors than they close.',
    'A useful title for anything still deciding what kind of thing it is.',
    'The archive recommends speaking it softly near unfinished machinery.'
  ];

  const weatherKinds = [
    'patient rain', 'borrowed sunlight', 'indoor thunder', 'low certainty',
    'clear hesitation', 'soft static', 'unseasonable courage', 'drifting maybe'
  ];
  const weatherDetails = [
    'Plans may become easier to see once they stop pretending to be instructions.',
    'A minor pressure system is moving through the parts of the day left unlabeled.',
    'Visibility improves around questions that are allowed to remain open.',
    'Several ordinary moments are expected to develop private interpretations.',
    'The forecast remains calm wherever completion is not treated as an emergency.',
    'One useful opening may arrive disguised as a harmless delay.',
    'Conditions favour small experiments and doors with uncertain destinations.',
    'The atmosphere is carrying more possibility than the instruments can justify.'
  ];
  const weatherTimes = ['MORNING', 'AFTERNOON', 'EVENING', 'BETWEEN HOURS'];
  const pressureStates = [
    'falling toward a better question',
    'steady with local pockets of maybe',
    'rising behind unfinished plans',
    'unmeasurable but unusually polite'
  ];
  const visibilityStates = [
    'clear to the nearest useful uncertainty',
    'good beyond the obvious answer',
    'limited only by unnecessary conclusions',
    'excellent through windows facing inward'
  ];

  const permissionOpeners = [
    'You may', 'The museum permits you to', 'Today is allowed to',
    'No curator will object if you', 'It is officially acceptable to'
  ];
  const permissionActions = [
    'leave one beautiful thing unresolved',
    'change direction without declaring the old route a failure',
    'keep a question longer than an answer',
    'make something small enough to remain honest',
    'rest before the work has earned a dramatic ending',
    'prefer curiosity to certainty for the next hour',
    'treat a delay as a room rather than a wall',
    'return to an idea that left without saying goodbye',
    'remove one unnecessary conclusion from the day',
    'protect the part of the plan that still feels alive'
  ];
  const permissionFootnotes = [
    'No form is required.',
    'The stamp expires only when it stops being useful.',
    'This permission is valid in all unfinished jurisdictions.',
    'Keep the receipt if you need proof that gentleness was authorised.',
    'The museum assumes no liability for improved perspective.'
  ];

  const postcardTitles = [
    'Postcard from the Room That Waited',
    'The Museum After Everyone Went Home',
    'Weather Report from an Indoor Sky',
    'A Window Sent Before It Existed',
    'Instructions for Returning Differently',
    'The Corridor Beyond the Last Label',
    'Evidence of a Useful Detour',
    'The Night Staff Misplaces Gravity'
  ];
  const postcardCaptions = [
    'Wish you were nearly here.',
    'The building kept one light on for uncertainty.',
    'Nothing was finished. Everything remained available.',
    'The view improved when the frame stopped explaining itself.',
    'Sent from a place that exists only while remembered.',
    'Please forward to the part of tomorrow that still has room.'
  ];
  const postcardPhotos = [
    'assets/dreaming-wing/atrium.webp',
    'assets/dreaming-wing/clouds.webp',
    'assets/dreaming-wing/moon.webp'
  ];
  const postcardPalettes = [
    ['#f2d39b', '#28364c', '#9b6f80'],
    ['#cdb7ff', '#24384a', '#6d7f93'],
    ['#9ed7cf', '#273743', '#8a667b'],
    ['#efbfa2', '#3c3348', '#657f88'],
    ['#d8d0a6', '#2d4040', '#8e6374'],
    ['#b8d5ee', '#302f48', '#8d6f4f']
  ];

  const corridorNotes = [
    'The room remains in the building, though not necessarily in the same place.',
    'The corridor has kept the title but misplaced the directions.',
    'Museum records indicate that you were both early and remembered.',
    'The door is no longer visible. The visit still counts.',
    'A faint outline remains where the room almost became permanent.'
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

  function cleanText(value, maximum = 120) {
    return typeof value === 'string'
      ? value.replace(/[&<>]/g, '').trim().slice(0, maximum)
      : '';
  }

  function normalizeState(rawState) {
    const state = rawState && typeof rawState === 'object' ? rawState : {};
    const fragments = Array.isArray(state.fragments)
      ? state.fragments
        .filter((fragment) => fragment && cleanText(fragment.text))
        .slice(0, 6)
        .map((fragment) => ({
          text: cleanText(fragment.text, 160),
          source: cleanText(fragment.source, 120)
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

  function normalizeHistory(rawHistory) {
    if (!Array.isArray(rawHistory)) return [];
    return rawHistory
      .filter((entry) => entry && cleanText(entry.title))
      .slice(-8)
      .map((entry) => ({
        title: cleanText(entry.title, 120),
        room: cleanText(entry.room, 80)
      }));
  }

  function validDate(dateLike) {
    const date = new Date(dateLike);
    return Number.isNaN(date.getTime()) ? new Date(0) : date;
  }

  function dateKey(dateLike) {
    const date = validDate(dateLike);
    const year = String(date.getFullYear()).padStart(4, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function stateSignature(state) {
    return [
      state.seed,
      state.cycle,
      state.completedCollections,
      state.fragments.map((fragment) => `${fragment.text}:${fragment.source}`).join('|')
    ].join('::');
  }

  function fragmentText(random, state, fallback) {
    if (state.fragments.length === 0) return fallback;
    return state.fragments[Math.floor(random() * state.fragments.length)].text;
  }

  function dailySeed(dateLike, state, namespace) {
    return hashString(`${namespace}::${dateKey(dateLike)}::${stateSignature(state)}`);
  }

  function buildNames(dateLike, rawState) {
    const state = normalizeState(rawState);
    const seed = dailySeed(dateLike, state, 'names');
    const used = new Set();
    const names = Array.from({ length: 9 }, (_, index) => {
      const random = mulberry32((seed ^ Math.imul(index + 1, 0x9E3779B1)) >>> 0);
      let subjectIndex = (Math.floor(random() * nameSubjects.length) + index * 3) % nameSubjects.length;
      let conditionIndex = (Math.floor(random() * nameConditions.length) + index * 5) % nameConditions.length;
      let title = `The ${nameSubjects[subjectIndex]} ${nameConditions[conditionIndex]}`;
      while (used.has(title)) {
        conditionIndex = (conditionIndex + 1) % nameConditions.length;
        if (conditionIndex === 0) subjectIndex = (subjectIndex + 1) % nameSubjects.length;
        title = `The ${nameSubjects[subjectIndex]} ${nameConditions[conditionIndex]}`;
      }
      used.add(title);
      const echo = fragmentText(random, state, 'an empty catalogue with excellent posture');
      return Object.freeze({
        index,
        title,
        accession: `NAME ${String(index + 1).padStart(2, '0')} · ${dateKey(dateLike)}`,
        note: choose(random, nameNotes),
        echo: `Filed beside “${echo}.”`
      });
    });
    return Object.freeze({ seed, dateKey: dateKey(dateLike), state, names: Object.freeze(names) });
  }

  function buildWeather(dateLike, rawState) {
    const state = normalizeState(rawState);
    const seed = dailySeed(dateLike, state, 'weather');
    const random = mulberry32(seed);
    const conditions = weatherTimes.map((time, index) => {
      const local = mulberry32((seed ^ Math.imul(index + 7, 0x85EBCA6B)) >>> 0);
      return Object.freeze({
        time,
        kind: choose(local, weatherKinds),
        detail: choose(local, weatherDetails),
        almostDegrees: 12 + Math.floor(local() * 17),
        chance: 23 + Math.floor(local() * 67)
      });
    });
    const echo = fragmentText(random, state, 'an unoccupied shelf waiting for weather');
    return Object.freeze({
      seed,
      dateKey: dateKey(dateLike),
      headline: `${choose(random, weatherKinds)} moving through the interior`,
      pressure: choose(random, pressureStates),
      visibility: choose(random, visibilityStates),
      echo: `The instruments are using “${echo}” as a local barometer.`,
      conditions: Object.freeze(conditions)
    });
  }

  function buildPermissions(dateLike, rawState) {
    const state = normalizeState(rawState);
    const seed = dailySeed(dateLike, state, 'permissions');
    const permissions = Array.from({ length: 7 }, (_, index) => {
      const random = mulberry32((seed ^ Math.imul(index + 11, 0xC2B2AE35)) >>> 0);
      const action = permissionActions[(Math.floor(random() * permissionActions.length) + index) % permissionActions.length];
      return Object.freeze({
        index,
        text: `${choose(random, permissionOpeners)} ${action}.`,
        footnote: choose(random, permissionFootnotes),
        stamp: `PERMISSION ${String(index + 1).padStart(2, '0')}`
      });
    });
    return Object.freeze({
      seed,
      dateKey: dateKey(dateLike),
      featuredIndex: seed % permissions.length,
      permissions: Object.freeze(permissions)
    });
  }

  function buildPostcards(dateLike, rawState) {
    const state = normalizeState(rawState);
    const seed = dailySeed(dateLike, state, 'postcards');
    const postcards = Array.from({ length: 6 }, (_, index) => {
      const random = mulberry32((seed ^ Math.imul(index + 3, 0x27D4EB2D)) >>> 0);
      const echo = fragmentText(random, state, 'the empty pocket at the end of the tour');
      return Object.freeze({
        index,
        title: postcardTitles[(Math.floor(random() * postcardTitles.length) + index) % postcardTitles.length],
        caption: choose(random, postcardCaptions),
        echo: `Reverse side note: “${echo}.”`,
        photo: postcardPhotos[index % postcardPhotos.length],
        palette: Object.freeze(postcardPalettes[index % postcardPalettes.length]),
        cropX: Number((35 + random() * 30).toFixed(2)),
        cropY: Number((30 + random() * 40).toFixed(2)),
        rotation: Number(((random() - 0.5) * 2.4).toFixed(2))
      });
    });
    return Object.freeze({ seed, dateKey: dateKey(dateLike), postcards: Object.freeze(postcards) });
  }

  function buildCorridor(rawHistory, rawState) {
    const history = normalizeHistory(rawHistory);
    const state = normalizeState(rawState);
    const seed = hashString(`corridor::${stateSignature(state)}::${history.map((entry) => entry.title).join('|')}`);
    return Object.freeze(history.map((entry, index) => {
      const random = mulberry32((seed ^ Math.imul(index + 1, 0x165667B1)) >>> 0);
      return Object.freeze({
        ...entry,
        note: choose(random, corridorNotes),
        position: String(index + 1).padStart(2, '0')
      });
    }));
  }

  function buildExpansion(dateLike, rawState, rawHistory) {
    const state = normalizeState(rawState);
    return Object.freeze({
      dateKey: dateKey(dateLike),
      state,
      names: buildNames(dateLike, state),
      weather: buildWeather(dateLike, state),
      permissions: buildPermissions(dateLike, state),
      postcards: buildPostcards(dateLike, state),
      corridor: buildCorridor(rawHistory, state)
    });
  }

  return Object.freeze({
    buildCorridor,
    buildExpansion,
    buildNames,
    buildPermissions,
    buildPostcards,
    buildWeather,
    dateKey,
    normalizeHistory,
    normalizeState
  });
})();
