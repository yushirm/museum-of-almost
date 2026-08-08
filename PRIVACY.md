# Privacy Boundary

The Museum of Almost is primarily a static GitHub Pages site. **COMMONS / NOW** and **DEEP SPACE / ALMOST** do not create visitor accounts, profiles, histories, scores, identifiers, or personalized views.

**ALMOST ONLINE!** is the single deliberate exception to the Museum's otherwise local/static state model: when its shared service is configured, it may contact one isolated HTTPS Worker to increment a global page-hit counter and read or write a tightly constrained guestbook entry. That exception is designed not to identify a visitor.

## What the application does not collect

The application does not:

- ask for a name, email address, account, URL, location, or visitor free-text input;
- request browser geolocation;
- access contacts, camera, microphone, files, or sensors;
- use analytics, advertising, telemetry, fingerprinting, pixels, or behavioral tracking;
- create cookies;
- write visitor state to `localStorage`, `sessionStorage`, or IndexedDB;
- store previous live scientific snapshots;
- create a unique-visitor counter.

The Gallery 03 hit counter stores only one global integer. A page load may increment that number; it is not a count of distinct people.

The Gallery 03 guestbook stores only an allowlisted message ID, an allowlisted stamp ID, and a server-generated UTC timestamp. It has no name, email, URL, location, username, free-text, HTML, or contact field.

## Almost Online shared counter and guestbook

The shared feature is isolated behind one Cloudflare Worker and one D1 database. The browser is configured with one explicit HTTPS API origin after deployment.

The Worker exposes only:

- `GET /v1/state` for the global hit count and newest guestbook entries;
- `POST /v1/hit` to atomically increment the global page-hit counter;
- `POST /v1/sign` to store one allowlisted phrase/stamp selection;
- CORS preflight for the exact configured Museum origin.

Requests use CORS mode, `credentials: omit`, `referrerPolicy: no-referrer`, and `cache: no-store`. The Museum creates no cookie or browser identifier for this feature.

The Worker does not store IP addresses, user-agent strings, referrers, browser fingerprints, or account identifiers. Cloudflare and ordinary network infrastructure can still process network-layer information such as the visitor's IP address as part of serving an HTTPS request; the Museum application does not receive or persist that value.

Guestbook vocabulary is finite and server-side allowlisted. This is intentional: automatically publishing arbitrary visitor text would create an unsafe path for personal information, harassment, links, or stored script content. The browser renders guestbook entries with DOM `textContent`, never user-controlled HTML.

Abuse controls do not require a visitor identity. Cloudflare route-level rate-limit bindings use fixed route labels rather than IP/user keys, and the database additionally enforces a minimum interval, a daily accepted-entry cap, duplicate suppression, bounded retention, and a 256-byte request-body limit. See `GUESTBOOK_SECURITY.md`.

If the isolated API is unavailable, Gallery 03 remains a usable static page and shows the shared counter/guestbook as unavailable.

## Live public data requests

COMMONS / NOW is intentionally a live public-data instrument. When that page opens it makes five direct HTTP requests across four public services:

- USGS Earthquake Hazards Program;
- NOAA Space Weather Prediction Center;
- Open-Meteo;
- NASA Earth Observatory Natural Event Tracker.

NOAA SWPC is read through two current public product endpoints: one for solar-wind speed and one for the current NOAA Space Weather Scales. The scale response supplies the Cosmic Signal Chain's geomagnetic (`G`) and solar-radiation (`S`) readings; the existing solar-wind value is mirrored locally into that instrument rather than fetched again.

All five requests share the Sample-and-Hold Bus acquisition barrier. Pressing **Refresh world** makes one new set of those same five requests. There is no automatic polling or background refresh loop.

Requests use CORS mode, `credentials: omit`, `referrerPolicy: no-referrer`, and `cache: no-store`. The application does not intentionally send cookies, the Museum page URL, visitor location, or local visitor data with those requests.

As with any direct internet request, the requested service and ordinary network infrastructure can see network-layer information such as the visitor's IP address. Each provider may process connection information under its own policies. The Museum does not receive their server logs.

## Sample-and-Hold Bus

The Sample-and-Hold Bus coordinates the existing requests in page memory. While a refresh is in flight, the previously committed measurements remain visible. After all five requests settle, one replacement snapshot is committed. The discarded snapshot is not stored as history.

The bus does not create a new identifier, cookie, storage entry, URL parameter, analytics event, or background timer.

## Sounding Well / The Thickness of Now

The Sounding Well adds no network request. Its local observer loads before the existing application acquisition and wraps the browser's `fetch` function only so it can observe the five already-approved requests.

For recognized USGS, NOAA, and Open-Meteo responses, it reads timestamp metadata from a cloned response while returning the original response to the application unchanged. It does **not** clone or parse the NASA EONET body because EONET event geometry dates are not treated as a feed-wide observation timestamp.

The observer temporarily holds only public scientific response metadata needed for the current latch, then discards it. It does not store sounding history, forward response data, derive visitor information, or create another retry or polling path.

The Sounding Well reads:

- USGS feed-generation time;
- NOAA solar-wind observation time when supplied;
- NOAA current Space Weather Scales timestamp;
- Open-Meteo current-valid time for the thirteen fixed locations.

NASA EONET remains explicitly unsounded because its geometry dates belong to individual events rather than one feed-wide current instant.

## Fixed world sample and map

The Open-Meteo request contains thirteen fixed latitude/longitude pairs that are built into the application. They are the same for every visitor. They are not generated from browser location, IP address, language, timezone, or any other visitor characteristic.

The geographic basemap is `world-map.svg`, a same-origin static asset derived from Natural Earth public-domain land geometry. Loading, selecting, or viewing map points does not contact a map API, tile provider, geocoder, or other mapping service.

## Difference Engine

The Difference Engine compares two existing fixed points. The selected pair and lens remain in page memory. Distance is calculated locally; temperature, wind, and precipitation differences are derived only from the already-loaded Open-Meteo snapshot; light state is calculated locally from UTC time and geometry.

## Local cosmic reference instruments

The **Cosmic Receive Desk**, **Celestial Escapement**, and **Planetary Heliodon / Earth Casts the Night** use only fixed local reference constants, existing Museum snapshot data, and local geometry. The Planetary Heliodon adds no network request and collects no visitor information.

The derived subsolar point, antisolar point, terminator path, night-side hatching, and field-sheet copy exist only in page memory and the current DOM. They are not uploaded or persisted by the Museum.

## Cosmic Signal Chain

The Cosmic Signal Chain reads the already-rendered solar-wind value and the NOAA current-scale response from the same shared five-feed latch. It does not issue an independent NOAA request and does not use visitor input, location, device sensors, or stored state.

## Planetary Section and field sheet

The Planetary Section is another view of the same thirteen fixed coordinates and the same current Open-Meteo response. It does not request another data source or infer measurements between stations.

Pressing **Make field sheet** calls the native browser print function. The Museum application does not create a remote document, call a PDF service, upload a screenshot, send the print job to a server, or write a file itself.

## Data handling

Live scientific responses are held in page memory only long enough to render the current snapshot and local derived instruments. Reloading or closing COMMONS / NOW discards them. The application does not forward source responses to the guestbook service.

The page deliberately reduces source data:

- USGS event names, nearby places, IDs, and event URLs are not displayed;
- NASA EONET event titles and coordinates are not displayed;
- Open-Meteo is queried only for the thirteen fixed coordinates;
- NOAA contributes a numeric solar-wind speed plus current geomagnetic and solar-radiation scale values;
- the Sounding Well exposes source-time semantics, UTC timestamp text, and derived offsets, not raw scientific payloads.

## Offline shell

A same-origin service worker caches only the Museum's static application shell. It does not cache or proxy the cross-origin public scientific services or the shared guestbook API.

The service worker prefers deployed same-origin files while online and falls back to cached static files when offline. Shared Gallery 03 state is intentionally not cached as authoritative data.

## Hosting

GitHub Pages, Cloudflare for the isolated Gallery 03 shared-state API, and the public scientific providers may process ordinary technical connection information under their own terms. The Museum adds no analytics or behavioral tracking on top of that hosting.

See `SOURCES.md` for the exact scientific endpoints and `GUESTBOOK_SECURITY.md` for the shared-state architecture.
