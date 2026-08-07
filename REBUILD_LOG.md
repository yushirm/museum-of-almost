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

## Extension 2 — Thirteen Windows Get a World

Date: 2026-08-07

Reason:

The original thirteen-window field used truthful longitude and latitude placement, but the empty graticule made visitors mentally reconstruct the planet around the points. The next step was not another metric; it was geographic context.

Implementation:

- `world-map.svg` is generated from Natural Earth 110m public-domain land geometry;
- the geometry is simplified locally but not redrawn or repositioned by eye;
- the SVG uses a 360 × 180 equirectangular coordinate space;
- the map uses exactly the same projection as the station points: `x = longitude + 180`, `y = 90 - latitude`;
- `world-map.css` locks the geographic field to a 2:1 aspect ratio and places the map beneath the existing grid and interactive station buttons;
- a visible provenance note states that the basemap is local and that no map or tile service is contacted;
- the map asset and stylesheet are included in the same-origin offline shell.

Boundary:

The map does not introduce a fifth data source, mapping API, tile server, geocoder, remote image, runtime library, visitor location request, persistence, analytics, or polling. It changes context, not collection.

Rebuild rule:

To rebuild the basemap, start from Natural Earth 110m land geometry in WGS84, simplify only the geometry, project every longitude/latitude pair with the formulas above into a 360 × 180 SVG, store the result locally as `world-map.svg`, and keep the interactive station positions on the identical projection. Never hand-adjust a point to make the map look better.

## Extension 3 — The Planetary Section / Field Sheet

Date: 2026-08-07

Design gate:

The map was completed, merged, deployed, and archived before any code for this extension was written. Then three fresh concepts were evaluated against the core goal: make the shared world legible right now without personalization, fake history, hidden scoring, or puzzle language.

- **A — Sample Extremes:** conventionally highlight the hottest, coldest, windiest, and wettest of the thirteen current samples.
- **B — Planetary Section:** borrow the architectural section drawing. Order the fixed points west to east and represent each as a discrete measured post, with temperature height, wind flag, precipitation mark, and explicit light state.
- **C — Print Is Memory:** deliberately invert the normal web model. The application continues to store no history, but a user-controlled print action can turn one current moment into a local paper/PDF field sheet.

Concept A was discarded. It mostly repackaged information already available in the range and Difference Engine, risked leaderboard/dashboard semantics, and could encourage a thirteen-point sample to be mistaken for a true global extreme.

Concepts B and C were merged.

Feature premise:

**The Planetary Section / Field Sheet asks visitors to cut through the planet as it is now.**

The section presents the thirteen fixed stations in actual west-to-east longitude order. Each station remains an individual measurement:

- temperature controls vertical post position only within the current thirteen-point observed range;
- wind is a separate local flag whose length is normalized only within the current snapshot;
- precipitation is a separate local mark;
- day, twilight, or night is derived locally from UTC time and geometry;
- longitude controls horizontal position;
- an accessible table repeats every value explicitly.

The section **does not interpolate** between stations. There is no line, curve, filled area, or hidden estimate joining the posts. Unmeasured space stays unmeasured.

Print Is Memory:

The application still stores no visitor history. **Make field sheet** calls `window.print()` and relies only on the browser's native print surface. The print layout reduces the current experience to the local world map, Planetary Section, values, snapshot time, source provenance, and privacy statement.

The Museum does not generate or upload a remote PDF, choose a destination, retain a print record, or store the sheet. If the browser or operating system offers a local PDF destination, that file is created under the visitor's own browser/device control rather than Museum application state.

Integrity rules:

- no interpolation between sparse samples;
- no “global hottest/coldest” claim from thirteen points;
- missing measurements remain missing and are not mapped to fake zero values;
- the section derives from the already-loaded Open-Meteo snapshot and local geometry only;
- field-sheet creation makes no network request;
- `window.print()` is the only print mechanism;
- no PDF library, screenshot uploader, document service, storage layer, account, analytics, or telemetry is introduced;
- the four-source runtime allowlist remains unchanged;
- the map and station projection remain unchanged;
- the coherent offline-shell upgrade lifecycle is preserved.

Runtime changes:

- `data-core.js` adds a pure `planetarySection` reducer that sorts canonical stations by longitude and derives within-snapshot positions while preserving `null` for missing values;
- `app.js` renders SVG using only discrete `line`, `circle`, and `text` marks and renders an authoritative HTML table;
- `field-sheet.css` provides the on-screen architectural instrument and a landscape native-print layout;
- `index.html` adds the Planetary Section / Field Sheet after the Difference Engine;
- **Make field sheet** uses `window.print()`;
- the service-worker shell advances from `museum-of-almost-commons-now-v4-world-map` to `museum-of-almost-commons-now-v5-field-sheet` and includes the new stylesheet;
- tests verify exact west-to-east station order, missing-value integrity, no interpolating SVG path/polyline/polygon, native-only printing, responsive/print behavior, and the unchanged four-source network boundary.

Rebuild rule:

Start with the thirteen canonical station coordinates and one current normalized weather snapshot. Sort a copy of the station list by longitude. Derive temperature, wind, and precipitation ranges only from numeric readings in that same snapshot. Keep every missing value and derived position `null`. Render one post per station at its true longitude position; do not draw connecting geometry. Add an explicit values table. For preservation, use native browser print CSS and `window.print()` only. Keep the map and section source provenance on the printed sheet and do not add application persistence in order to create history.

## Extension 4 — Cosmic Signal Chain

Date: 2026-08-07

Design gate:

Three concepts were generated before code was written and evaluated against COMMONS / NOW's core job: reveal a shared current world with scientific provenance, minimal interpretation, no personalization, and no invented history.

- **A — Fifth Card: Cosmic Weather:** conventionally add geomagnetic and radiation conditions beside the existing solar-wind card.
- **B — Cosmic Signal Chain:** borrow the visual grammar of analog instrumentation and control racks. Place independent current near-Earth space-weather measurements into one compact readout so the visitor can compare them without turning the page into another dashboard row.
- **C — The Page Becomes the Detector:** break the normal section model by allowing cosmic conditions to alter the page's global tick density, pulse cadence, and field-sheet marginalia.

Concept C was discarded. Making the interface itself react to scientific data would turn measurement into ambience, spend accessibility budget, and make interpretation harder to distinguish from physics.

Concepts A and B were merged.

Feature premise:

**The Cosmic Signal Chain asks what is arriving at and registering around Earth right now.**

The instrument has three numbered detectors:

1. **Flow** — the already-loaded NOAA SWPC solar-wind speed near Earth.
2. **Field** — the current NOAA geomagnetic-storm scale (`G`).
3. **Particles** — the current NOAA solar-radiation-storm scale (`S`).

The numbering is reading order, not a causal timeline. The rack uses neutral separators rather than arrows so the interface does not imply that one displayed current value caused the next.

Network consequence:

The feature adds one request to NOAA SWPC's public `noaa-scales.json` product. It does not add a fifth service or fetch solar wind twice. A normal snapshot therefore uses five HTTP requests across the existing four public services.

Integrity rules:

- current record `0` is used for the NOAA `G` and `S` readings; historical maximum `-1` and forecast records are not presented as current;
- scale values are accepted only as integers from 0 through 5;
- invalid or out-of-range values become unavailable rather than being clamped or guessed;
- level 0 is retained as a real “none” state rather than being confused with missing data;
- each detector may fail independently;
- the rack explicitly states that reading order is not a causal timeline;
- the new request uses CORS, `credentials: omit`, `referrerPolicy: no-referrer`, and `cache: no-store`;
- no automatic polling, visitor storage, visitor location, analytics, telemetry, account, or new runtime dependency is added;
- cross-origin NOAA responses remain outside the service-worker cache.

Runtime changes:

- `cosmic-signal.js` isolates NOAA Scales normalization, current-record selection, missing-value handling, one-shot fetching, solar-wind mirroring, DOM rendering, and the compact field-sheet copy;
- `cosmic-signal.css` supplies the analog-rack presentation, mobile stack, higher-contrast treatment, reduced-motion boundary, print strip, and deliberately non-directional detector separators;
- `index.html` loads the local cosmic module after the established application;
- the same-origin offline shell caches only the new local JavaScript and CSS, never the NOAA response;
- `scripts/test-cosmic-signal.mjs` pins the added network allowlist to the single NOAA Scales endpoint and verifies scale reduction, missing-value integrity, privacy constraints, secret patterns, accessibility media hooks, and non-causal presentation;
- the required `check` job runs the new cosmic reducer contract alongside the existing repository gates;
- the printed Planetary Field Sheet carries a compact current Cosmic Signal Chain without adding application persistence or a document service.

Rebuild rule:

Read only the current NOAA Scales record at key `0`. Treat `G` and `S` as independent current scale measurements and accept only integer levels 0–5. Mirror the existing solar-wind headline locally rather than requesting it again. Keep missing data missing. Present the three values in numbered reading order with neutral separators and explicit non-causal language. If the public scale feed fails, leave `G` and `S` unavailable. Never persist or cache the live NOAA response.


## Extension 5 — The Celestial Escapement / Many Clocks, One Now

Date: 2026-08-07

Design gate:

- **A — Orbital Now:** a conventional local readout for current celestial cycles.
- **B — The Celestial Escapement:** borrow mechanical-horology grammar so one captured instant engages several independent cosmic clocks.
- **C — The Page Refuses to Stay Still:** continuously advance orbital indicators from device time without an explicit refresh.

Concept C was discarded because silent temporal drift conflicts with COMMONS / NOW's coherent-snapshot model, print evidence, reduced-motion discipline, and deliberate refresh semantics. Concepts A and B were merged.

Feature premise:

**The world is doing this without us, and it is keeping several clocks without us.** One captured instant drives four frozen local wheels: Earth turn, Moon synodic phase, Earth orbital mean longitude, and Jupiter orbital mean longitude. The mechanism does not tick automatically; **Refresh world** recaptures the instant.

Integrity rules:

- no new runtime request, telescope service, Horizons call, remote media, or runtime dependency;
- no timer loop, animation clock, polling, persistence, geolocation, analytics, telemetry, or visitor text input;
- Moon phase is a documented approximation based on the mean synodic month and a fixed NASA GSFC 2026 conjunction;
- Earth and Jupiter orbital dials use JPL's published lower-accuracy J2000 mean-longitude formulae and are labeled as approximations, not apparent sky positions;
- the field sheet receives only the same frozen phases;
- the coherent offline shell advances to `museum-of-almost-commons-now-v8-celestial-escapement`.

Rebuild rule:

Capture one UTC instant, derive all four wheels locally, and freeze them until the existing refresh control recaptures time. Keep the approximation sources explicit and never add a live astronomy service merely to make the mechanism feel more animated.

## Extension 6 — The Planetary Heliodon / Earth Casts the Night

Date: 2026-08-07

Before implementation, three concepts were evaluated:

- **A — Global Day/Night Terminator:** the conventional next step, adding subsolar/antisolar points and the day/night boundary to the existing map.
- **B — Planetary Heliodon:** borrow an architectural daylighting instrument and treat Earth itself as the model illuminated at the captured snapshot instant.
- **C — Make the Whole Page a Horizon:** allow the calculated terminator to divide the entire webpage into visual day and night.

Concept C was discarded because the whole-page effect would weaken contrast, print fidelity, reduced-motion expectations, and the coherent one-snapshot evidence model.

Concepts A and B were merged into **The Planetary Heliodon / Earth Casts the Night**.

Implementation rules:

- reuse the same local solar-declination/elevation machinery that already classifies the thirteen fixed stations;
- derive subsolar and antisolar points from the captured UTC snapshot instant;
- generate the terminator as a sampled great circle and split it at the equirectangular map seam;
- use coarse hatching only to distinguish the night-facing hemisphere, never as a claim of measured illumination;
- make no new runtime request and request no visitor location;
- keep the geometry frozen to the Museum snapshot rather than running an independent clock;
- add the same derived coordinates to the printable field sheet;
- advance the coherent offline shell for every new local asset.

The feature extends the existing thesis without changing it: **The world is doing this without us. Half of it is always turning into night.**
