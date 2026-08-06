'use strict';

globalThis.MuseumSignalVaultCore = (() => {
  // Fixed numeric entropy derived from an anonymous seed batch. Source strings are not retained.
  const SIGNAL_ENTROPY = Object.freeze([
    4179756989,
    680761782,
    2970942892,
    2302458881,
    535564338,
    44966624,
    1352229988,
    2447362168,
    167591857,
    1710611290
  ]);

  const subjects = [
    'Satellite', 'Choir', 'Window', 'Comet', 'Elevator',
    'Library', 'Moon', 'Beacon', 'Garden', 'Machine'
  ];
  const conditions = [
    'That Forgot Its Orbit',
    'Broadcasting from the Wrong Tomorrow',
    'With One Light Still Thinking',
    'Waiting Outside the Known Sky',
    'That Learned to Whisper in Vacuum',
    'Carrying an Unfinished Sunrise',
    'Whose Map Ends at Maybe',
    'Built from Patient Static',
    'That Mistook Distance for a Door',
    'Returning Without Having Left'
  ];
  const origins = [
    'the north side of a missing constellation',
    'a moon omitted from every careful map',
    'the quiet between two respectable galaxies',
    'an orbit reserved for unfinished machinery',
    'a small planet still deciding on gravity',
    'the far end of a telescope pointed inward',
    'a relay station assembled from spare eclipses',
    'the corridor beyond measurable distance',
    'a weather system moving through deep space',
    'an address the universe nearly remembered'
  ];
  const transmissions = [
    'We have completed the instructions except for the part that explains what they are for.',
    'Please confirm whether your sky is also making room for one more impossible thing.',
    'The signal arrived before the event and has been waiting with admirable patience.',
    'Nothing is wrong. The machine is simply homesick for a future that did not happen.',
    'We found the missing distance. It was folded inside the shortest route.',
    'Do not repair the silence. It is carrying the most accurate portion of this message.',
    'Our instruments detect a museum where the universe expected an answer.',
    'The stars remain operational, though several have developed private interpretations.',
    'Send no rescue vessel. Send a window and enough time to look through it.',
    'This transmission will repeat until someone mistakes it for an invitation.'
  ];
  const interpretations = [
    'A request for directions written by something with no concept of arrival.',
    'Evidence that static becomes sentimental when observed for long enough.',
    'A maintenance report from a machine whose only fault is imagination.',
    'An invitation addressed to whoever is willing to remain uncertain.',
    'A postcard from a place that exists only while being listened to.',
    'The acoustic shadow of an event that chose not to become history.',
    'An emergency beacon calmly reporting that no emergency was required.',
    'A navigation signal calibrated to the nearest better question.',
    'A weather bulletin for conditions occurring inside the listener.',
    'A perfectly clear message translated through several layers of almost.'
  ];
  const tones = [
    'brass static with a blue aftertaste',
    'three patient notes and one absent bell',
    'a low pulse shaped like an open doorway',
    'white noise arranged with museum precision',
    'a signal that brightens when nobody explains it',
    'soft machinery turning somewhere behind the stars',
    'the frequency of a room remembering its visitor',
    'a distant chord holding one place open',
    'a small thunderstorm translated into light',
    'silence with an unusually convincing rhythm'
  ];
  const echoLeads = [
    'The signal borrows a catalogue fragment',
    'Your pocket catalogue answers in its sleep',
    'The transmission briefly recognises',
    'A local fragment enters the carrier wave',
    'The listening room returns one thing you kept'
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
        .filter((fragment) => fragment && typeof fragment.text === 'string')
        .slice(0, 6)
        .map((fragment) => ({ text: fragment.text, source: String(fragment.source || '') }))
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

  function buildSignals() {
    return SIGNAL_ENTROPY.map((seed, index) => {
      const random = mulberry32(seed);
      const column = index % 5;
      const row = Math.floor(index / 5);
      const x = 10 + column * 20 + (random() - 0.5) * 8;
      const y = 13 + row * 50 + 12 + (random() - 0.5) * 12;
      const distance = 4 + Math.floor(random() * 93);
      const decimal = Math.floor(random() * 10);

      return Object.freeze({
        index,
        seed,
        designation: `SIGNAL ${String(index + 1).padStart(2, '0')}`,
        title: `The ${choose(random, subjects)} ${choose(random, conditions)}`,
        origin: choose(random, origins),
        transmission: choose(random, transmissions),
        interpretation: choose(random, interpretations),
        tone: choose(random, tones),
        distance: `${distance}.${decimal} almost-light-years`,
        x: Number(x.toFixed(2)),
        y: Number(y.toFixed(2)),
        pulse: Number((1.8 + random() * 2.6).toFixed(2)),
        delay: Number((random() * 2.5).toFixed(2))
      });
    });
  }

  function echoForSignal(signal, rawState) {
    const state = normalizeState(rawState);
    if (state.fragments.length === 0) {
      return 'No catalogue fragment has answered yet. The signal remains politely on hold.';
    }

    const selector = (signal.seed ^ state.seed ^ Math.imul(state.cycle + 1, 2654435761)) >>> 0;
    const fragment = state.fragments[selector % state.fragments.length];
    const random = mulberry32(signal.seed ^ hashString(fragment.text));
    return `${choose(random, echoLeads)}: “${fragment.text}.”`;
  }

  function roomNote(rawState) {
    const state = normalizeState(rawState);
    if (state.completedCollections > 0) {
      return `The receiver remembers ${state.completedCollections} completed collection${state.completedCollections === 1 ? '' : 's'}.`;
    }
    if (state.fragments.length > 0) {
      return `The receiver is using ${state.fragments.length} kept fragment${state.fragments.length === 1 ? '' : 's'} as a local antenna.`;
    }
    return 'The receiver is listening with an empty catalogue and unreasonable optimism.';
  }

  return Object.freeze({
    SIGNAL_ENTROPY,
    buildSignals,
    echoForSignal,
    normalizeState,
    roomNote
  });
})();
