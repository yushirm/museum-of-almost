# The Faultline Core / Semantic Stratigraphy

## Design gate

Before implementation, three directions were evaluated.

### Concept A — The Snapshot Ledger

A conventional provenance table would list all five feeds and explain their temporal support, spatial support, aggregation shape, units, and current availability.

This is useful, but much of that explanatory work already exists in the page copy and source records. As a standalone feature it would mostly turn documentation into another dashboard panel.

### Concept B — The Stratigraphic Core

Borrow geological core-reading instead of dashboard charting. Treat the five latched feeds as strata with different structures rather than as values waiting to be flattened onto a common axis.

The useful part of the metaphor is categorical: each channel has a temporal support class, spatial support class, and measurement shape. The core does not assign a depth, age, confidence, or quality score.

### Concept C — The Interface Refuses False Equivalence

Break a common dashboard convention: do not imply that values become comparable merely because they share a screen or timestamp. Let the visitor patch two feed strata together and make the interface explicitly refuse direct numeric equivalence where units and measurement families differ.

### Decision

Concept A was discarded as the least additive. Concepts B and C were merged into **The Faultline Core / Semantic Stratigraphy**.

## Product contract

The thesis remains:

> The world is doing this without us.

The shared five-feed latch is real, but a common acquisition barrier does not make the underlying measurements the same kind of claim.

The Faultline Core exposes four categorical checks for any selected pair:

1. **Acquisition latch** — always shared because both channels belong to the same sample-and-hold cycle.
2. **Temporal support** — whether both feeds occupy the same broad temporal-support class.
3. **Spatial support** — whether both feeds make claims over the same broad kind of spatial support.
4. **Measurement shape** — whether both feeds have the same structural form, such as a single state or distributed event set.

Direct numeric equivalence is a separate gate. A common latch never supplies a common unit.

“Aligned” is not a confidence score, source-quality score, freshness score, or claim that source timestamps are identical. It means only that two declared categorical support classes match.

## Declared strata

- **USGS / EARTH** — rolling past-hour catalog; distributed global event locations; event set with derived summary values; count, magnitude, and depth.
- **NOAA / FLOW** — source-timestamped current reading; near-Earth space-weather observation; latest scalar state; km/s.
- **NOAA / SCALES** — source-timestamped current scale state; near-Earth / planetary space-weather state; latest ordinal state; G/S levels 0–5.
- **Open-Meteo / WEATHER** — current-valid times at thirteen fixed points; thirteen fixed coordinates; multi-point field; temperature, wind, and precipitation units.
- **NASA / EVENTS** — currently open inventory; distributed global event locations; open event set with category summary; count and categories.

These are local semantic declarations about how the Museum already uses each approved feed. They do not replace provider documentation.

## Interaction

Two leads, A and B, can be patched to any two of the five strata. Selecting the stratum already attached to the opposite lead swaps the two leads instead of creating a meaningless self-pair.

The readout reports:

- **SHARED STRATA** when multiple categorical support classes align while numeric equivalence is still refused;
- **PARTIAL ALIGNMENT** when exactly one structural class aligns;
- **FAULT LINE** when the shared acquisition latch is the only common frame;
- **DEGRADED CORE** when one or both selected feeds are unavailable in the current latch.

Unavailable channels remain unavailable. The feature does not infer, backfill, interpolate, score, or retain a missing value.

## Runtime and privacy boundary

The feature adds no network request.

It reads only:

- the existing `museum:commons-snapshot` event;
- `MuseumCommonsSnapshot.feeds` availability flags already held in page memory;
- fixed local semantic declarations in `faultline-core.js`.

It does not use fetch, polling, timers, storage, cookies, browser geolocation, visitor free-text input, analytics, telemetry, accounts, remote media, external scripts, or runtime dependencies.

Selections exist only in JavaScript memory and reset on reload.

## Offline behavior

`faultline-core.js`, `faultline.js`, `faultline.css`, this record, and the test are same-origin local assets. The runtime assets are included in the coherent service-worker shell. Cross-origin scientific responses remain outside the service-worker cache.

## Accessibility

- lead controls are native buttons with `aria-pressed` state;
- strata are native buttons inside an ordered list;
- the interpretation sentence is an `aria-live="polite"` region;
- controls retain the Museum’s global focus-visible treatment and minimum target sizing;
- the layout collapses below 760 px and again below 620 px;
- reduced-motion, increased-contrast, and print environments have explicit handling.

## Validation

`scripts/test-faultline-core.mjs` covers:

- exactly five declared strata;
- expected shared-structure behavior for NOAA FLOW ↔ SCALES;
- expected shared event-set/spatial structure for EARTH ↔ EVENTS while temporal support remains split;
- a full fault line for EARTH ↔ WEATHER;
- degraded-state behavior without invented values;
- current-latch availability reduction;
- no network, storage, location, timer, or tracking APIs in the view;
- responsive, reduced-motion, increased-contrast, and print style hooks;
- preservation of the design gate and refusal contract.