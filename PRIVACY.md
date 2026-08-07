# Privacy Boundary

The Museum of Almost is a static website. **COMMONS / NOW** does not create visitor accounts, profiles, histories, scores, identifiers, or personalized views.

## What the application does not collect

The application does not:

- ask for a name, email address, account, or free-text input;
- request browser geolocation;
- access contacts, camera, microphone, files, or sensors;
- use analytics, advertising, telemetry, fingerprinting, pixels, or behavioral tracking;
- create cookies;
- write visitor state to `localStorage`, `sessionStorage`, or IndexedDB;
- store previous live snapshots;
- send visitor actions or Museum state to a remote service.

## Live public data requests

The current product is intentionally a live public-data instrument. When the page opens it makes one direct request to each of four public services:

- USGS Earthquake Hazards Program;
- NOAA Space Weather Prediction Center;
- Open-Meteo;
- NASA Earth Observatory Natural Event Tracker.

NOAA SWPC is read through two current public product endpoints: one for solar-wind speed and one for the current NOAA Space Weather Scales. That means a normal current snapshot uses five HTTP requests across the four services. The second NOAA request supplies the Cosmic Signal Chain's geomagnetic (`G`) and solar-radiation (`S`) scale readings; the existing solar-wind value is mirrored locally into that instrument rather than fetched again.

Pressing **Refresh world** makes one new set of those five requests. There is no automatic polling or background refresh loop.

Requests use CORS mode, `credentials: omit`, `referrerPolicy: no-referrer`, and `cache: no-store`. The application does not intentionally send cookies, the Museum page URL, visitor location, or local visitor data with those requests.

As with any direct internet request, the requested service and ordinary network infrastructure can see network-layer information such as the visitor's IP address. Each provider may process connection information under its own policies. The Museum does not receive their server logs.

## Fixed world sample and map

The Open-Meteo request contains thirteen fixed latitude/longitude pairs that are built into the application. They are the same for every visitor. They are not generated from browser location, IP address, language, timezone, or any other visitor characteristic.

The coordinates were derived once from opaque seed material supplied for the rebuild. Only the resulting one-way build seed and fixed coordinates are retained in the repository. The original opaque values are not stored or published by the application.

The geographic basemap under those points is `world-map.svg`, a same-origin static asset derived from Natural Earth public-domain land geometry. Loading, selecting, or viewing map points does not contact a map API, tile provider, geocoder, or other mapping service.

## Difference Engine

The Difference Engine compares two of those existing fixed points. Choosing cable ends or a comparison lens does not create another network request and is not sent to USGS, NOAA, Open-Meteo, NASA, GitHub, or another service by the application.

The active pair and selected lens exist only in JavaScript memory. They are not written to browser storage, encoded into the URL, placed in the service-worker cache, or retained across reloads.

Distance is calculated locally from the two fixed coordinates. Temperature, wind, and precipitation differences are derived only from the already-loaded Open-Meteo snapshot. Light state is calculated locally from UTC time and geometry.

## Cosmic Signal Chain

The Cosmic Signal Chain reads the already-rendered solar-wind value in page memory and one additional NOAA SWPC current-scale response. It does not use visitor input, location, device sensors, or stored state.

The current `G` and `S` values exist only in page memory and in the rendered DOM. They are discarded on reload or close. The instrument's left-to-right rail is a reading order only; the application does not construct a causal history or infer that one displayed measurement caused another.

A compact copy of the current cosmic readings is inserted into the printable field sheet. As with the rest of the field sheet, that copy is created locally in the page and is not uploaded or retained by the Museum.

## Planetary Section and field sheet

The Planetary Section is another view of the same thirteen fixed coordinates and the same current Open-Meteo response. It orders the stations west to east and derives only within-snapshot positions for temperature, wind, and precipitation. It does not request another data source or infer measurements between stations.

The section and its table exist only in the page DOM and memory. They are not stored as Museum history.

Pressing **Make field sheet** calls the native browser print function. The Museum application does not create a remote document, call a PDF service, upload a screenshot, send the print job to a server, or write a file itself. It does not upload, receive, store, or transmit the printed sheet or PDF.

A browser or operating system may offer destinations such as a local printer or local PDF file. Any print history, printer queue, PDF destination, or operating-system file behavior is controlled by that browser/device and is outside the Museum application's data handling.

## Data handling

Live responses are held in page memory only long enough to render the current snapshot. Reloading or closing the page discards them. The application does not forward source responses to another service.

The page deliberately reduces source data:

- USGS event names, nearby places, IDs, and event URLs are not displayed;
- NASA EONET event titles and coordinates are not displayed;
- Open-Meteo is queried only for the thirteen fixed coordinates;
- NOAA contributes a numeric solar-wind speed plus the current geomagnetic and solar-radiation scale values used by the Cosmic Signal Chain.

## Offline shell

A same-origin service worker caches only the Museum's static application shell, including the local world map, field-sheet stylesheet, and local Cosmic Signal Chain code and stylesheet, so that the explanatory interface can still open offline. The service worker ignores cross-origin requests and does not cache, proxy, or persist USGS, NOAA, Open-Meteo, or NASA responses.

The service worker keeps one coherent static shell across upgrades. After a complete shell replacement, open Museum windows are reloaded once so HTML, scripts, styles, and local assets adopt the new version together.

When offline, live values are shown as unavailable. The page does not display stale live values from storage.

## Hosting

GitHub Pages and the public data providers may process ordinary technical connection information under their own terms. The Museum adds no analytics or tracking on top of that hosting.

See `SOURCES.md` for the exact public endpoints and source documentation.
