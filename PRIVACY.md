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

Pressing **Refresh world** makes one new set of requests. There is no automatic polling or background refresh loop.

Requests use CORS mode, `credentials: omit`, `referrerPolicy: no-referrer`, and `cache: no-store`. The application does not intentionally send cookies, the Museum page URL, visitor location, or local visitor data with those requests.

As with any direct internet request, the requested service and ordinary network infrastructure can see network-layer information such as the visitor's IP address. Each provider may process connection information under its own policies. The Museum does not receive their server logs.

## Fixed world sample

The Open-Meteo request contains thirteen fixed latitude/longitude pairs that are built into the application. They are the same for every visitor. They are not generated from browser location, IP address, language, timezone, or any other visitor characteristic.

The coordinates were derived once from opaque seed material supplied for the rebuild. Only the resulting one-way build seed and fixed coordinates are retained in the repository. The original opaque values are not stored or published by the application.

## Data handling

Live responses are held in page memory only long enough to render the current snapshot. Reloading or closing the page discards them. The application does not forward source responses to another service.

The page deliberately reduces source data:

- USGS event names, nearby places, IDs, and event URLs are not displayed;
- NASA EONET event titles and coordinates are not displayed;
- Open-Meteo is queried only for the thirteen fixed coordinates;
- NOAA contributes a numeric solar-wind speed.

## Offline shell

A same-origin service worker caches only the Museum's static application shell so that the explanatory interface can still open offline. The service worker ignores cross-origin requests and does not cache, proxy, or persist USGS, NOAA, Open-Meteo, or NASA responses.

When offline, live values are shown as unavailable. The page does not display stale live values from storage.

## Hosting

GitHub Pages and the public data providers may process ordinary technical connection information under their own terms. The Museum adds no analytics or tracking on top of that hosting.

See `SOURCES.md` for the exact public endpoints and source documentation.
