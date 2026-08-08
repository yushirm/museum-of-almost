# The Exposure Plate / The World We Did Not Measure

## Design gate

Three directions were evaluated before implementation.

### Concept A — Coverage Meter

A conventional coverage panel would count current weather points and report nearest-sample distances. It is useful, but alone it becomes another dashboard metric rather than a new way to understand the Commons.

### Concept B — The Exposure Plate

Borrow a photographic contact-sheet mechanic. A fixed weather point that actually produced a value in the current latch exposes an evidence location; farther grid cells appear darker.

The metaphor is deliberately limited. Nearness does not mean accuracy, representativeness, confidence, or similar weather.

### Concept C — The Anti-Weather Map

Break a familiar web-mapping convention: refuse to color the world by inferred weather between sparse samples. The only continuous-looking surface the Museum draws is geometric distance from a coarse grid-cell center to its nearest currently available fixed sample.

### Decision

**Concept A was discarded** as the least additive. Concepts B and C were merged into **The Exposure Plate / The World We Did Not Measure**.

## Product contract

The instrument answers only:

> How far is each coarse map cell from the nearest fixed weather point that actually produced a current value for this latch?

It does not answer what the weather probably is between the thirteen fixed points.

A point participates only when the real weather feed is available, the normalized point has `available === true`, and its fixed latitude and longitude are valid. A known coordinate without a current measurement is not current evidence.

## Distance field

The equirectangular world view is divided into fixed **10° × 10°** cells. For each of the 648 cell centers, the instrument reuses `MuseumCommonsCore.greatCircleDistanceKm` to locate the nearest currently available weather point.

Literal display bands are:

- 0–1,500 km;
- 1,500–3,000 km;
- 3,000–5,000 km;
- more than 5,000 km.

These are not error classes, forecast radii, confidence intervals, influence zones, or claims about spatial correlation. The darkest cell is not “least accurate”; it is simply farther from the nearest current sample.

## Farthest tested cell

The readout reports the farthest tested 10° grid-cell center, its nearest-sample distance, and that sample’s point ID.

This is a **grid search**, not an exact continuous solution for the farthest point on Earth. The true maximum can lie between cell centers, so the interface uses approximate language and keeps the 10° resolution visible.

## Refusals

The plate never interpolates or extrapolates temperature, wind, precipitation, light state, uncertainty, confidence, accuracy, or representativeness.

It does not draw Voronoi “territories” as if a station represents a region. It also does not convert cell counts into a percentage of Earth’s surface, because an equirectangular grid gives unequal physical area to cells at different latitudes.

Distance from evidence remains distance from evidence.

## Interaction

Five native buttons highlight all cells or one literal distance band. The highlight changes opacity only. It does not alter the real snapshot, primary weather display, Difference Engine, Isolation Board, Witness Seal, or field-sheet measurements.

The selected band exists only in page memory and resets to **All** on each real `museum:commons-snapshot` event and on reload.

## Failure behavior

If the real weather feed is unavailable, or no weather point has a current value, the plate becomes **UNEXPOSED**. It never falls back to the thirteen known coordinates as substitute evidence.

If only some points are current, only those points contribute to the distance field.

## Field sheet

The native Planetary Field Sheet receives a compact evidence-geometry note: current point count, approximate farthest tested grid-center distance, nearest point ID, 10° grid-search qualification, and an explicit statement that the value is distance only—not uncertainty or representativeness.

The full interactive plate is omitted from print.

## Runtime and privacy boundary

The feature adds **zero runtime requests**. It reads only the current in-memory snapshot, the existing snapshot event, normalized current weather points, the existing local great-circle geometry, and the already-local `world-map.svg`.

It does not use fetch, XHR, WebSocket, EventSource, sendBeacon, timers, polling, storage, cookies, browser geolocation, visitor free-text input, analytics, telemetry, accounts, remote media, external scripts, or runtime dependencies.

## Accessibility and offline behavior

The map has a changing textual alternative; current geometry and filter meaning remain in visible text; controls are native buttons with `aria-pressed`, 44px targets, and visible focus. Distance bands are written in text, not conveyed by tone alone. Responsive, reduced-motion, increased-contrast, and print states are explicit.

All new assets are same-origin members of the coherent service-worker shell. Cached code can explain the instrument offline, but without current weather evidence the plate remains unexposed.

## Rebuild rule

Use only currently available normalized fixed weather points. Reuse the established great-circle geometry. Keep grid resolution explicit. Never infer weather, uncertainty, confidence, accuracy, representativeness, spatial influence, or surface-area coverage from the plate.
