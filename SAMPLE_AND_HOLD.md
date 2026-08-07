# The Sample-and-Hold Bus / One Now, Latched

Date: 2026-08-07

## Design gate

Three concepts were evaluated before implementation against the COMMONS / NOW goal: make one shared current world legible without personalization, invented history, hidden scoring, or unnecessary collection.

### Concept A — Atomic Snapshot Commit

The conventional next step was to make the existing “one current snapshot” contract technically explicit. All five approved requests would acquire into a temporary cycle, and visible measurements would change only after every request had either answered or failed. A failed feed would become unavailable inside that committed snapshot rather than leaving an old/new mixture.

This directly strengthens the Museum's core claim, but by itself the mechanism would be invisible.

### Concept B — Sample-and-Hold Bus

Borrowed from analog electronics, a sample-and-hold circuit acquires changing input and then holds one stable value for downstream use. Applied here, the five public feeds become channels on a compact bus with two understandable states: **ACQUIRE** while a new cycle settles and **HOLD** once one snapshot has been latched.

The metaphor is useful because it explains the actual runtime rule instead of decorating unrelated behavior.

### Concept C — Shutter the Museum During Refresh

The deliberately anti-web concept was to blank or close the current exhibits while a refresh was in progress. Most interfaces preserve stale content during loading; this would refuse to show the previous world while asking for the next one.

Concept C was discarded. It would increase visual churn, remove useful context during acquisition, and spend accessibility and usability budget without improving measurement integrity.

Concepts A and B were merged into **The Sample-and-Hold Bus / One Now, Latched**.

## Runtime contract

A normal acquisition contains exactly five approved requests across four public services:

1. USGS past-hour earthquakes;
2. NOAA SWPC solar-wind speed;
3. NOAA SWPC current Space Weather Scales;
4. Open-Meteo current weather for the thirteen fixed coordinates;
5. NASA EONET current open events.

All five promises cross one `Promise.allSettled` barrier. During acquisition, the previous committed measurements remain visible while the bus alone indicates **ACQUIRE**. After every channel settles, the application replaces the single in-memory snapshot and renders the new state. Missing channels remain explicitly unavailable.

The discarded snapshot is not retained as application history.

## Cosmic Signal Chain integration

Before this feature, the main application acquired four feeds together while the Cosmic Signal Chain independently requested NOAA's current scale product. That meant the page described five feeds as one snapshot even though one feed belonged to a separate refresh cycle.

The NOAA Scales request now belongs to the shared acquisition barrier. The Cosmic Signal Chain consumes the latched in-memory response and does not issue its own `fetch` call. Its solar-wind detector still mirrors the already-rendered NOAA solar-wind value locally.

## Ordering and failure rules

- starting a newer acquisition aborts the older controller;
- an older cycle is rejected if it completes after a newer controller has become active;
- one failed feed does not prevent the other settled results from being committed;
- a fulfilled NOAA scale response may still normalize to unavailable if its scientific values are invalid or out of range;
- NOAA counts as an answered public service when either of its two approved channels answers;
- no automatic polling or timer loop is introduced;
- the service worker never caches or proxies cross-origin live responses.

## Privacy and product boundary

The feature adds no endpoint, service, visitor input, location access, account, cookie, analytics, telemetry, identifier, storage layer, framework, dependency, or backend.

The bus state and current snapshot exist only in page memory and the DOM. Refreshing replaces them. Reloading or closing the page discards them. The same-origin service worker caches only the static interface shell, including the local Sample-and-Hold stylesheet.

## Accessibility and presentation

The bus uses text labels in addition to indicator marks. Its status is exposed through a polite live region. It has explicit narrow-screen, higher-contrast, reduced-motion, and print behavior. The printed field sheet omits the acquisition control surface because the sheet represents the already-latched snapshot rather than the transient refresh process.

## Rebuild rule

Keep the five approved current requests in one acquisition barrier. Preserve the previously committed measurements while that barrier is open. Commit one replacement snapshot only after all five requests settle, reject obsolete acquisition cycles, and make missing channels visible rather than substituting stale or invented values. Downstream instruments must consume that same latch rather than starting independent refresh clocks.