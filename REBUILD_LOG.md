# Rebuild Log

## Reset 1 — COMMONS / NOW

Date: 2026-08-07

Starting point:

- Treaty 05 live operations dashboard;
- live entropy from USGS and NOAA;
- local visitor construction mechanics and bounded erased-memory persistence.

Direction:

The previous experience had become difficult to explain without internal vocabulary. The rebuild was explicitly authorized to remove it and create a product with an immediately legible purpose.

New premise:

**COMMONS / NOW** is a live public instrument for shared planetary conditions. It asks what the world is doing right now and answers with current public data rather than fictional state.

Seed handling:

Opaque supplied values were treated as reproducible seed material, not decoded as hidden prose. They were reduced one-way to:

`6bc76dc33337414e7c9f9ccbd7539976d98ac371444860c605fb88003174ded2`

That build seed produced thirteen fixed global sampling coordinates. The original opaque values are intentionally absent from the repository.

Runtime removed:

- Treaty 05 ontology and interaction surface;
- counterweight, suspensions, resonance, echo, undo, and weight editing;
- erased-ghost visitor memory and installation seed persistence;
- fictional measurement system and one-time field reversal;
- WebAudio cues;
- local postcard generation and printing controls;
- session journal and field ledger;
- the previous dashboard layer and its derived world-pressure score;
- entropy-selection runtime and tests that existed only for prior versions.

Runtime added:

1. USGS past-hour earthquake snapshot.
2. NOAA SWPC current solar-wind speed.
3. Open-Meteo current weather across thirteen fixed global points.
4. NASA EONET current open-event aggregates.
5. A locally drawn equirectangular sampling field with selectable points.
6. Local calculation of daylight, twilight, and night for each point.
7. Plain-language explanation of exactly what the site requests and does.
8. Source-level failure visibility rather than fabricated fallback metrics.
9. Manual **Refresh world** with no automatic polling.
10. A same-origin offline shell that never caches cross-origin live data.

Privacy consequence:

The current application stores no visitor state at all. The only persistent browser data created by the application is the same-origin static service-worker cache. Live source responses remain memory-only and are discarded on reload or close.

## Extension 1 — The Difference Engine

Date: 2026-08-07

Design gate:

Three concepts were generated before code was written.

- **A — Signal Lens:** a conventional current-snapshot comparison mode across temperature, wind, precipitation, and daylight.
- **B — World Switchboard:** an analog-hardware patchboard mechanic connecting two fixed world windows into a difference circuit.
- **C — The Page Refuses to Scroll:** a viewport-locked interface that would replace ordinary reading and scrolling with state changes.

Concept C was discarded because it spent too much accessibility and familiarity budget without adding enough meaning. Concepts A and B were merged.

Feature premise:

**The Difference Engine asks: How different can the same planet be at the same moment?**

The visitor patches any two of the existing thirteen fixed weather points together. No new service is contacted. The feature derives:

- great-circle surface distance between the two fixed coordinates;
- current temperature difference;
- current wind-speed difference;
- current precipitation difference;
- simultaneous daylight / twilight / night relationship.

A lens selector emphasizes one dimension at a time and places both selected points within the current observed thirteen-point range for temperature, wind, or precipitation. Light uses its three local states; distance uses the physical maximum great-circle separation as its scale.

Integrity rules:

- difference is described, not scored;
- neither point is presented as a winner or a better place;
- missing source values remain unavailable and must never coerce to numeric zero;
- no historical trend is implied;
- patch selections and lens state remain memory-only;
- no visitor state is persisted;
- no additional network request, analytics event, or telemetry is created;
- the existing four-source allowlist remains unchanged.

Runtime changes:

- `data-core.js` adds pure great-circle distance, observed-range, scale-position, pair-comparison, and plain-language comparison helpers;
- `app.js` adds the two-ended patch cable, five comparison lenses, current-snapshot metric rendering, and local scale placement;
- `difference-engine.css` provides the local analog-switchboard presentation layer;
- `index.html` adds the Difference Engine section after the thirteen-window world view;
- the service-worker cache version advances and includes the new local stylesheet;
- reducer tests include missing-value regressions so `null` can never silently become zero.
