# The Museum of Almost — COMMONS / NOW

Live site: https://yushirm.github.io/museum-of-almost/

**COMMONS / NOW** is a dependency-free, static public instrument that answers one plain question:

> What is the shared world doing right now?

The page takes one current snapshot from four free public scientific services and presents it without personalization, visitor analytics, or invented history.

## Current experience

The page shows:

- USGS earthquakes recorded in the past hour, including the current count and strongest reported magnitude;
- NOAA SWPC current solar-wind speed near Earth;
- current Open-Meteo temperature, wind, and precipitation at thirteen fixed coordinates distributed around the planet;
- NASA EONET currently open natural-event counts and aggregate categories;
- an approximate local day / twilight / night state for each fixed coordinate, calculated in the browser from UTC time and geometry;
- a locally stored equirectangular world basemap so the thirteen fixed points have real geographic context;
- **The Difference Engine**, a two-point patchboard that compares any pair of the thirteen fixed windows across the same current snapshot;
- **The Planetary Section / Field Sheet**, a west-to-east architectural section of the thirteen discrete measurements with a user-controlled native print/PDF path for preserving one snapshot outside the application.

The world basemap is generated from Natural Earth 110m public-domain land geometry and stored in this repository as `world-map.svg`. It uses the same equirectangular formula as the station positions, so points are not shifted by eye. No map API, tile server, remote image, or runtime mapping library is contacted.

The Difference Engine adds no data source and makes no extra network request. It derives great-circle distance locally and compares temperature, wind, precipitation, and light between two visitor-selected fixed points. A lens control also places both points inside the observed range of the current thirteen-point snapshot. It describes difference without ranking places as better or worse.

The Planetary Section orders the same thirteen fixed points from west to east. Temperature controls the vertical position of each measured post inside the current thirteen-point range; wind and precipitation are separate local marks; daylight state is explicit. It deliberately **does not interpolate** between stations: there is no connecting weather curve, filled area, or implied measurement in the space between samples.

**Make field sheet** invokes the browser's native print dialog. The print layout reduces the page to the current world map, the discrete Planetary Section, the thirteen values, snapshot time, source provenance, and privacy statement. A visitor can print it or choose a local PDF destination if their browser/operating system offers one. The Museum does not upload or store the result.

The thirteen weather points include both land and ocean. They were derived once from opaque seed material rather than selected by population, borders, visitor location, or editorial preference.

Build seed:

`6bc76dc33337414e7c9f9ccbd7539976d98ac371444860c605fb88003174ded2`

The original opaque seed inputs are deliberately not stored in the repository.

## Product reset

This rebuild intentionally removed the previous Treaty 05 interaction model, dashboard metaphors, visitor state, erased-memory persistence, fictional measurements, sound, postcards, construction journal, and entropy controls from the runtime.

Historical design records remain in the repository as history only. They are not part of the current application.

## Network behavior

Live data is central to the product, so the page makes one current request to each source when it opens. It does not poll automatically. **Refresh world** performs one additional manual snapshot.

The four public services are:

- USGS Earthquake Hazards Program;
- NOAA Space Weather Prediction Center;
- Open-Meteo;
- NASA Earth Observatory Natural Event Tracker.

The map, Difference Engine, Planetary Section, and field-sheet print action add no live service or extra request.

No API keys, paid services, accounts, external scripts, remote fonts, remote images, analytics, ads, tracking, map APIs, or tile services are used.

See `SOURCES.md` for exact endpoints and attribution.

## Privacy

There is no visitor persistence. The application does not use `localStorage`, `sessionStorage`, IndexedDB, cookies, browser geolocation, or visitor free-text input.

Difference Engine selections and lenses exist only in page memory and reset on reload. They are not sent to any external service.

The Planetary Section is derived only from the current in-memory weather snapshot, the fixed station coordinates, and local light geometry. It is not stored by the application.

**Make field sheet** uses native browser print. The application does not upload, receive, store, or transmit the resulting print job or PDF. Any printer, PDF destination, browser print history, or operating-system behavior is outside the Museum application and is controlled by the visitor's own browser/device.

The world basemap is a same-origin static file. Viewing or interacting with the map does not contact a mapping provider.

Live requests omit credentials and referrer and use no-store caching. Normal direct internet requests still expose network-layer information such as an IP address to the requested public service. See `PRIVACY.md` for the full boundary.

## Offline behavior

The explanatory application shell, local map asset, local styles, Difference Engine, and field-sheet presentation are cached same-origin by a service worker. Cross-origin live responses are never cached by the Museum. If the page is offline, the fixed world map and derived controls still render, while live scientific values remain visibly unavailable.

The service worker keeps one coherent cached shell across upgrades and reloads open pages once after a complete shell upgrade so HTML, scripts, and styles do not split across versions.

## Run locally

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Validate

```bash
node --check data-core.js
node --check app.js
node --check service-worker.js
node --check scripts/test-data-core.mjs
node --check scripts/test-service-worker.mjs
node --check scripts/check.mjs
node scripts/test-data-core.mjs
node scripts/test-service-worker.mjs
node scripts/check.mjs
```

The checks enforce the four-source network allowlist, thirteen fixed sampling points, local-map projection and provenance, truthful Difference Engine derivation, west-to-east Planetary Section ordering, no interpolation between sparse samples, native-only field-sheet printing, missing-value integrity, no visitor storage or location access, no polling, coherent same-origin service-worker behavior, responsive accessibility hooks, source attribution, seed privacy, and deterministic data reduction.

## Records

- `REBUILD_LOG.md` records the current product reset and subsequent COMMONS / NOW extensions.
- `CONSTRUCTION_LOG.md` records the earlier constructive Treaty period.
- `ENTROPY_LOG.md` and `ENTROPY_HISTORY.md` record older mutation experiments.

Those historical files describe previous versions and are not current product documentation.

## Rights

This repository is publicly viewable for transparency and to host the website. No open-source licence is granted to the Museum code. `world-map.svg` is derived from Natural Earth public-domain geographic data; that public-domain source status is not restricted by the Museum's rights notice. See `RIGHTS.md`.

External contributions are not accepted unless explicitly invited. See `CONTRIBUTING.md`.
