(function attachFrameShifterCore(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.MuseumFrameShifterCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function buildFrameShifterCore() {
  'use strict';

  const EPSILON = 1e-9;
  const MAX_VISUAL_OFFSET_PERCENT = 30;

  const FRAMES = Object.freeze([
    Object.freeze({ id: 'left-fast', beta: -0.8, label: '−0.8c', detail: 'frame moving left at 0.8c' }),
    Object.freeze({ id: 'left', beta: -0.6, label: '−0.6c', detail: 'frame moving left at 0.6c' }),
    Object.freeze({ id: 'gallery', beta: 0, label: '0c', detail: 'gallery reference frame' }),
    Object.freeze({ id: 'right', beta: 0.6, label: '+0.6c', detail: 'frame moving right at 0.6c' }),
    Object.freeze({ id: 'right-fast', beta: 0.8, label: '+0.8c', detail: 'frame moving right at 0.8c' })
  ]);

  const SCENARIOS = Object.freeze([
    Object.freeze({
      id: 'distant-flashes',
      label: 'Distant flashes',
      eventA: 'FLASH A',
      eventB: 'FLASH B',
      deltaT: 0,
      deltaX: 4,
      note: 'Two flashes are simultaneous in the gallery frame and separated by four light-seconds. Because the separation is spacelike, another inertial frame can reverse their coordinate-time order.'
    }),
    Object.freeze({
      id: 'light-pulse',
      label: 'Light pulse',
      eventA: 'EMISSION',
      eventB: 'RECEPTION',
      deltaT: 3,
      deltaX: 3,
      note: 'A light pulse crosses three light-seconds in three seconds. Every subluminal inertial frame keeps this separation lightlike and keeps emission before reception.'
    }),
    Object.freeze({
      id: 'timelike-exchange',
      label: 'Timelike exchange',
      eventA: 'BEACON',
      eventB: 'REPLY',
      deltaT: 5,
      deltaX: 2,
      note: 'The reply occurs five seconds after the beacon and two light-seconds away in the gallery frame. The separation is timelike, so their order cannot flip between inertial frames.'
    })
  ]);

  function validNumber(value) {
    return Number.isFinite(value);
  }

  function gamma(beta) {
    if (!validNumber(beta) || Math.abs(beta) >= 1) return null;
    return 1 / Math.sqrt(1 - beta * beta);
  }

  function intervalSquared(deltaT, deltaX) {
    if (!validNumber(deltaT) || !validNumber(deltaX)) return null;
    return deltaX * deltaX - deltaT * deltaT;
  }

  function causalClass(interval) {
    if (!validNumber(interval)) return 'unknown';
    if (Math.abs(interval) <= EPSILON) return 'lightlike';
    return interval > 0 ? 'spacelike' : 'timelike';
  }

  function transformSeparation(deltaT, deltaX, beta) {
    const factor = gamma(beta);
    if (factor === null || !validNumber(deltaT) || !validNumber(deltaX)) return null;
    return Object.freeze({
      deltaT: factor * (deltaT - beta * deltaX),
      deltaX: factor * (deltaX - beta * deltaT),
      gamma: factor
    });
  }

  function getScenario(id) {
    return SCENARIOS.find((scenario) => scenario.id === id) || null;
  }

  function getFrame(beta) {
    if (!validNumber(beta)) return null;
    return FRAMES.find((frame) => Math.abs(frame.beta - beta) <= EPSILON) || null;
  }

  function formatMagnitude(value, digits = 2) {
    if (!validNumber(value)) return 'Unavailable';
    if (Math.abs(value) <= EPSILON) return '0';
    return new Intl.NumberFormat('en', { maximumFractionDigits: digits }).format(Math.abs(value));
  }

  function formatSigned(value, unit) {
    if (!validNumber(value)) return 'Unavailable';
    if (Math.abs(value) <= EPSILON) return `0 ${unit}`;
    const sign = value > 0 ? '+' : '−';
    return `${sign}${formatMagnitude(value)} ${unit}`;
  }

  function orderDescription(deltaT) {
    if (!validNumber(deltaT)) return 'Event order unavailable.';
    if (Math.abs(deltaT) <= EPSILON) return 'A and B are simultaneous in this frame.';
    if (deltaT > 0) return `A occurs before B by ${formatMagnitude(deltaT)} seconds in this frame.`;
    return `B occurs before A by ${formatMagnitude(deltaT)} seconds in this frame.`;
  }

  function causalDescription(kind) {
    if (kind === 'spacelike') return 'No light-speed-or-slower signal can connect these events. Their coordinate-time order may depend on the inertial frame.';
    if (kind === 'lightlike') return 'A light-speed signal can connect these events in the ideal model. Their causal order is preserved across subluminal inertial frames.';
    if (kind === 'timelike') return 'A slower-than-light signal could connect these events. Their time order is preserved across inertial frames.';
    return 'Causal relation unavailable.';
  }

  function maxAbsTransformedTime(scenario) {
    if (!scenario) return null;
    const values = FRAMES.map((frame) => transformSeparation(scenario.deltaT, scenario.deltaX, frame.beta))
      .filter(Boolean)
      .map((result) => Math.abs(result.deltaT));
    return values.length ? Math.max(...values) : null;
  }

  function visualOffsetPercent(scenario, transformedDeltaT) {
    const maximum = maxAbsTransformedTime(scenario);
    if (!validNumber(transformedDeltaT) || !validNumber(maximum) || maximum <= EPSILON) return 0;
    const normalized = Math.max(-1, Math.min(1, transformedDeltaT / maximum));
    return normalized * MAX_VISUAL_OFFSET_PERCENT;
  }

  function frameState(scenarioId, beta) {
    const scenario = getScenario(scenarioId);
    const frame = getFrame(beta);
    if (!scenario || !frame) return null;

    const transformed = transformSeparation(scenario.deltaT, scenario.deltaX, beta);
    const invariant = intervalSquared(scenario.deltaT, scenario.deltaX);
    const transformedInvariant = intervalSquared(transformed.deltaT, transformed.deltaX);
    const kind = causalClass(invariant);

    return Object.freeze({
      scenario,
      frame,
      transformed,
      invariant,
      transformedInvariant,
      causalClass: kind,
      order: orderDescription(transformed.deltaT),
      causalNote: causalDescription(kind),
      visualOffsetPercent: visualOffsetPercent(scenario, transformed.deltaT),
      formattedDeltaT: formatSigned(transformed.deltaT, 's'),
      formattedDeltaX: formatSigned(transformed.deltaX, 'light-s'),
      formattedInvariant: `${formatSigned(invariant, 'light-s²')}`
    });
  }

  return Object.freeze({
    EPSILON,
    FRAMES,
    SCENARIOS,
    gamma,
    intervalSquared,
    causalClass,
    transformSeparation,
    getScenario,
    getFrame,
    orderDescription,
    causalDescription,
    visualOffsetPercent,
    frameState
  });
});
