# The Shutter Cabinet / Same Latch, Different Temporal Support

Date: 2026-08-08

## Purpose

COMMONS / NOW is deliberately latched: five requests settle before the visible snapshot commits. That gives the page one coherent receipt boundary, but it does **not** make every displayed claim describe the same kind of time support.

The Shutter Cabinet exposes that distinction without becoming another freshness, latency, history, or quality instrument.

Its governing sentence is:

**SAME LATCH. DIFFERENT TEMPORAL SUPPORT.**

The latch says when the Museum committed the current snapshot. The shutter cabinet asks what temporal form each claim family had **before** that commit.

## Design gate

Three concepts were evaluated before implementation.

### Concept A — The Temporal Support Ledger

The conventional next step was a registry beside the current headlines declaring whether each one describes a trailing interval, a current reading, or a status-defined set.

This would be accurate and testable, but it would add another administrative table to a gallery that already has strong ledger instruments.

**Discarded:** Concept A as the least additive presentation. Its useful classification logic survives as the pure static rule set underneath the chosen feature.

### Concept B — The Shutter Cabinet

Borrow a mechanic from large-format photography. Each current claim family receives a Museum-local temporal aperture card:

- **ONE-HOUR SHUTTER**;
- **CURRENT APERTURE**;
- **OPEN-STATUS GATE**.

The metaphor is intentionally limited. It does not claim that the Museum controlled a provider sensor's exposure duration. The cards describe the temporal support encoded by the existing request/product contract.

### Concept C — One Timestamp Is Not One Time Axis

Break the common live-dashboard convention that every value on one page can be placed under one universal timeline merely because the page committed them together.

The interaction deliberately offers **FORCE ONE NOW**. When the selected claim families have different temporal forms, the shared rail breaks rather than fabricating one time axis.

### Decision

Concept A was discarded. Concepts B and C were merged into **The Shutter Cabinet / Same Latch, Different Temporal Support**.

## Boundary from the Sounding Well

The distinction is strict:

- **Sounding Well** asks: how far is a trustworthy source timestamp from the Museum latch?
- **Shutter Cabinet** asks: what kind of temporal population or validity form does this claim family describe?

The Shutter Cabinet does not parse provider timestamps, compute age, rank freshness, or derive source-time thickness.

A source can be old or new without changing its declared support form. A current-reading form can have a timestamp offset. A trailing-window feed can have its own generation timestamp. Those are Sounding Well questions, not Shutter Cabinet questions.

## Fixed registry

The feature exposes exactly five existing Commons claim families, corresponding to the established five-feed latch. No arbitrary visitor-defined claim is accepted.

### 1. Past-hour earthquake population

**ID:** `earthquakes`

**Temporal form:** `TRAILING WINDOW`

**Aperture label:** `ONE-HOUR SHUTTER`

**Repository contract:**

`app.js` requests:

`https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson`

The normalized earthquake count, strongest magnitude, mean depth, and significant count are all reduced from that returned earthquake feature population.

The cabinet therefore says the family is supported by the returned past-hour feed window.

It does **not** say:

- one instrument observed continuously for exactly sixty minutes;
- every event is the same age;
- the feed generation timestamp is the start or end of the support window;
- an event occurred at the Museum latch time;
- the window proves completeness, quality, or representativeness.

### 2. Solar-wind summary

**ID:** `solar`

**Temporal form:** `CURRENT READING`

**Aperture label:** `CURRENT APERTURE`

**Repository contract:**

`app.js` requests NOAA SWPC's existing summary product:

`https://services.swpc.noaa.gov/products/summary/solar-wind-speed.json`

The cabinet classifies the product as a current-reading form because the Museum already uses the current summary product.

It does not convert the source timestamp into a validity duration or claim synchronization with another current-reading product.

### 3. NOAA space-weather scales

**ID:** `scales`

**Temporal form:** `CURRENT READING`

**Aperture label:** `CURRENT APERTURE`

**Repository contract:**

`app.js` requests:

`https://services.swpc.noaa.gov/products/noaa-scales.json`

The existing `cosmic-signal-core.js` reducer selects the current G/S/R record, preferring payload key `0` when present.

The cabinet uses only that already-established current-record contract. It does not reinterpret historical maximum or forecast material as the current support form.

### 4. Fixed-point current weather

**ID:** `weather`

**Temporal form:** `CURRENT READING`

**Aperture label:** `CURRENT APERTURE`

**Repository contract:**

`buildWeatherUrl()` requests:

`current=temperature_2m,wind_speed_10m,precipitation`

for the existing thirteen fixed coordinates with `timezone=UTC`.

The cabinet classifies the normalized temperature, wind, and precipitation fields as current-reading form.

It does not claim all thirteen source-valid timestamps are identical. Sounding Well already owns that question.

### 5. Open EONET event set

**ID:** `events`

**Temporal form:** `STATUS-DEFINED SET`

**Aperture label:** `OPEN-STATUS GATE`

**Repository contract:**

`app.js` requests:

`https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=500`

The returned population is selected by `status=open` at acquisition.

The cabinet does not turn that status membership into a trailing duration. It does not infer how long any event has been open and does not infer that all returned events began within one shared interval.

The existing `limit=500` boundary remains a response-window boundary, not a duration.

## Comparison contract

Two different claim families can produce only two substantive comparison outcomes.

### COMMON TEMPORAL FORM

Allowed only when the two fixed registry entries have the same declared `form`.

Initial matching examples include:

- solar wind ↔ NOAA scales;
- solar wind ↔ current weather;
- NOAA scales ↔ current weather.

This outcome means only that both claims use the same **Museum-local support-form category**.

It does **not** mean:

- same observation instant;
- same timestamp;
- same freshness;
- same duration;
- synchronized sensors;
- same update cadence;
- same provider process;
- same uncertainty;
- same quality.

### SAME LATCH. DIFFERENT TEMPORAL SUPPORT.

Used when the selected forms differ.

Examples:

- past-hour earthquakes ↔ current weather;
- past-hour earthquakes ↔ EONET open set;
- solar wind ↔ EONET open set.

The interface refuses one shared time rail instead of translating unlike temporal forms into one normalized duration.

## Same-claim prevention

The interface exposes two trays, **SHUTTER A** and **SHUTTER B**.

The claim selected in the opposite tray is disabled. This prevents a trivial same-claim comparison.

The pure core still defines `SAME CLAIM` defensively so direct programmatic calls cannot accidentally describe a repeated claim as a meaningful temporal comparison.

## Interaction model

Initial state on every real latch:

- Shutter A: earthquakes;
- Shutter B: weather;
- force state: off.

The visitor can:

1. choose one fixed claim family for each shutter;
2. inspect each temporal form and repository contract;
3. press **FORCE ONE NOW**;
4. receive either a common-form join or a broken shared rail;
5. press **RELEASE THE AXIS** to return to unforced inspection.

Selecting either claim automatically releases the forced state.

Every real `museum:commons-snapshot` event resets both trays and the force state. Nothing persists across latches or reloads.

## Missing current values

Temporal-form classification is static contract metadata, not a numeric inference.

If a selected feed is unavailable in the current latch:

- its current readout says unavailable;
- its temporal support form remains visible;
- the comparison contract remains visible;
- no previous latch is borrowed.

This is intentional. The question is what temporal form the claim family has when present, not whether the provider succeeded in this cycle.

## Presentation

The stage uses two shutter plates separated by a shared time rail.

Before forcing:

- both plates show their declared temporal form;
- the rail is provisional;
- the verdict says `INSPECT SUPPORT`.

When forced and compatible:

- the rail remains joined;
- the verdict says `COMMON TEMPORAL FORM`;
- the text immediately states that this is form-only compatibility.

When forced and incompatible:

- the rail visibly fractures;
- the verdict says `SAME LATCH. DIFFERENT TEMPORAL SUPPORT.`;
- the written forms remain authoritative.

The broken rail is supplemental. Color, rotation, or line shape is never required to understand the result.

## Field sheet and print

The interactive cabinet is omitted from print.

The field sheet retains a compact line containing:

- selected claim A;
- selected temporal form A;
- selected claim B;
- selected temporal form B;
- comparison outcome;
- qualification that common form is not common instant/freshness/duration, or that different forms do not authorize one time axis.

## Runtime and privacy boundary

The feature adds no:

- public-data or other external request;
- response clone;
- raw-provider payload retention;
- alternate acquisition path;
- alternate normalizer;
- provider timestamp parser;
- polling;
- setInterval;
- setTimeout;
- requestAnimationFrame loop;
- localStorage;
- sessionStorage;
- IndexedDB;
- cookies;
- history state;
- geolocation;
- visitor free-text or numeric input;
- analytics;
- telemetry;
- ads;
- tracking;
- remote script, font, image, media, or API;
- account;
- authentication;
- cloud state;
- dependency or build system.

The feature is a same-origin static JavaScript/CSS progressive enhancement over the already-normalized current snapshot.

## Accessibility

- all selectors and the force control are native buttons;
- selection and force state use `aria-pressed`;
- opposite same-claim controls are disabled;
- the verdict is a polite live region;
- every temporal form, current availability/readout, contract statement, scope qualification, and comparison result is written in text;
- targets preserve a minimum 44px height;
- layouts collapse at 760px and 620px;
- reduced motion removes the decorative fracture rotation;
- increased contrast strengthens borders;
- print omits the interactive cabinet and keeps the qualified field-sheet line.

## Offline lineage

Implementation baseline:

`77f64c958eb3890b0d2de9fb4f42c157f0cdd0d5`

That baseline is the canonical Page Four Hessdalen Instrument Room release and current shell:

`museum-of-almost-v40-page-four-instrument-room`

The planned successor shell is:

`museum-of-almost-v41-shutter-cabinet`

The service worker must preserve v40 as the immediate predecessor marker and retain v39 Catalogue 0, v38 Quorum Gate, and all existing shell assets.

If `main` advances before accepted feature evidence, this branch must be reconciled onto exact new `main`, preserving the winning concurrent release and advancing the current shell beyond its real generation.

## Focused validation contract

`scripts/test-shutter-cabinet.mjs` must prove:

- exactly five fixed claim-family IDs;
- exact three support forms;
- solar/scales/weather share `CURRENT READING`;
- earthquakes are `TRAILING WINDOW`;
- EONET is `STATUS-DEFINED SET`;
- current-reading pairs produce `COMMON TEMPORAL FORM`;
- cross-form pairs produce `SAME LATCH. DIFFERENT TEMPORAL SUPPORT.`;
- same-claim calls are defensively refused;
- unavailable current feeds do not erase static support metadata;
- numeric zero is not confused with missing in current readouts;
- the exact `app.js` request contracts remain pinned: `all_hour`, NOAA summary products, Open-Meteo `current`, EONET `status=open&limit=500`;
- the NOAA scale classification remains pinned to the existing current-record selector;
- the view exposes the exact interaction language, reset behavior, `aria-pressed`, disabled same-claim interlock, and live region;
- the progressive loader places the cabinet after Quorum Gate;
- runtime code contains no network, storage, timer, analytics, location, history, secret, email, home-path, or remote-runtime signature;
- CSS preserves focus, target size, responsive, reduced-motion, increased-contrast, and print behavior;
- the design record preserves the A/B/C decision and strict Sounding Well boundary;
- the service worker caches all Shutter Cabinet assets and advances the coherent shell while preserving the immediate predecessor.

## Release protocol

1. Build and test on a focused branch from exact live `main`.
2. Require the feature-complete head to pass required GitHub Actions job exactly `check`.
3. Re-read live `main` and require branch behind count `0` before accepting that green run as feature evidence.
4. Only after valid feature evidence, append `SUCCESS_ARCHIVE.md` using public repository evidence only.
5. Verify the archive change is append-only.
6. Extend the focused Shutter Cabinet test to require the archive evidence.
7. Require the archive-bearing head to pass `check` again.
8. Re-run the final live-main/head/behind-zero race.
9. Merge with an expected-head guard through `protect-main`.
10. Require canonical-main `check` success and exact Pages deployment.
11. Confirm merged-branch cleanup and live protection state.
12. Fetch the Notion Success Archives hub live, choose the next unclaimed sequence number, create a detailed recovery manual from canonical evidence, and verify the saved page.

## Rebuild rule

Preserve the distinction between **latch time**, **source timestamp depth**, and **claim temporal support**.

Never use receipt time as a claim window. Never use source timestamp age as a validity duration. Never turn `status=open` into a trailing interval. Never infer temporal form from the current numeric values. Never call two claims synchronized merely because they share `CURRENT READING` form. Never add history just to explain the current snapshot.
