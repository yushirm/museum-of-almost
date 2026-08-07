# The Sounding Well / The Thickness of Now

Date: 2026-08-07

## Design gate

Three concepts were evaluated before implementation against the COMMONS / NOW goal: reveal one shared current world without personalization, invented history, hidden scoring, or false precision.

### Concept A — Source Freshness Ledger

The conventional next step was a table of source-reported timestamps and ages beside the latch time. This would be useful and scientifically responsible, but it would add another dashboard-like ledger without changing how the visitor understands the snapshot.

### Concept B — The Sounding Well

Borrowed from maritime lead-line sounding, the latch instant becomes the water surface. A source timestamp can hang below that surface by the amount of time between the source-reported instant and the Museum latch. Written durations remain authoritative; the visual line length is only relative to the deepest comparable timestamp in that latch.

### Concept C — Refuse the Single “Updated At”

The deliberately anti-web concept was to reject the common fiction that one page timestamp describes every live value. The Museum would retain its honest receipt/latch instant while exposing the measurable time span contained inside that coherent snapshot.

Concept A was discarded because it solved the problem with familiar dashboard furniture. Concepts B and C were merged into **The Sounding Well / The Thickness of Now**.

## Premise

The Sample-and-Hold Bus guarantees an atomic commit: all five requests settle before the visible Museum changes. Atomic acquisition does **not** mean every provider measured or published its data at the same instant.

**The Sounding Well adds no request.** It makes that distinction visible by observing timestamp metadata already present in the existing five-feed acquisition.

- the latch instant is the surface;
- a trustworthy source timestamp is a sounding weight;
- temporal depth is the source timestamp’s offset from the latch;
- the deepest comparable past timestamp defines the current **known source-time thickness**;
- a source timestamp ahead of the latch is labeled as ahead rather than clamped to zero;
- missing timestamp metadata remains missing;
- incomparable timestamp semantics remain incomparable.

Depth is not a quality score, confidence score, uncertainty estimate, or ranking of providers. A shared vertical scale does not imply that feed-generation, observation, and current-valid timestamps have identical meanings; each channel keeps its own semantic label.

## Existing response metadata used

The feature observes only responses from the existing five-feed acquisition and reads timestamp metadata already present in those responses.

### USGS earthquakes

The past-hour GeoJSON feed exposes `metadata.generated`. The Sounding Well labels this explicitly as **feed generated**, not as the time of every earthquake in the feed.

Runtime endpoint:

`https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson`

### NOAA SWPC solar wind

The existing solar-wind product includes a timestamp alongside the current speed. The Sounding Well accepts the object-style `TimeStamp` form used by the current summary product and the table-style `time_tag` form already covered by the Museum’s reducer tests.

Runtime endpoint:

`https://services.swpc.noaa.gov/products/summary/solar-wind-speed.json`

### NOAA SWPC Space Weather Scales

The current scale record at key `0` exposes `DateStamp` and `TimeStamp`. The Sounding Well reads that current record’s timestamp only; it does not treat historical maximum or forecast records as the current instant.

Runtime endpoint:

`https://services.swpc.noaa.gov/products/noaa-scales.json`

### Open-Meteo current conditions

Open-Meteo documents that each `current` object includes `time`, the moment at which the current data is valid. The Museum requests `timezone=UTC`, so those returned current-valid times can be offset from the UTC latch. With thirteen fixed coordinates, the Sounding Well retains the oldest and newest valid time if the points do not share one exact timestamp.

Documentation:

`https://open-meteo.com/en/docs`

Runtime endpoint:

`https://api.open-meteo.com/v1/forecast`

### NASA EONET

EONET documents geometry dates as dates paired with individual event geometries. Those dates are not one feed-wide observation timestamp and may commonly use `00:00Z` when an upstream source did not supply a particular time.

The Sounding Well therefore leaves EONET **unsounded**. It does not derive a fake feed age from the newest event geometry.

Documentation:

`https://eonet.gsfc.nasa.gov/docs/v3`

Runtime endpoint:

`https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=500`

## Passive observation rule

`temporal-sounding.js` loads before `app.js` and wraps the browser’s existing `fetch` function only to observe the five already-approved requests.

For a recognized request it:

1. calls the original `fetch` exactly once;
2. preserves and returns the original response to the application;
3. reads timestamp metadata from a cloned response for USGS, NOAA, and Open-Meteo;
4. does not clone or parse the large EONET body because no feed-wide timestamp will be derived from it;
5. groups the five observations by the existing acquisition `AbortSignal`;
6. waits for the existing `museum:commons-snapshot` event before rendering;
7. discards the temporary raw timestamp records after the latch is rendered.

The observer does not create another HTTP request, retry, poll, beacon, WebSocket, EventSource, analytics event, storage write, or background timer.

## Privacy and persistence

The feature processes public scientific response metadata in page memory only. It does not inspect or derive visitor identity, location, timezone, language, browsing history, device sensors, or free-text input.

No sounding history is stored. A later refresh replaces the current display. Reloading or closing the page discards the observer state. The service worker caches only the local Sounding Well code and stylesheet; cross-origin scientific responses remain uncached.

## Accessibility and presentation

The instrument uses written source names, timestamp semantics, UTC times, and explicit duration text. The hanging-line graphic is decorative and marked `aria-hidden`; the list text is the authoritative accessible reading.

The layout has narrow-screen, reduced-motion, higher-contrast, and print handling. The Sounding Well is omitted from the field-sheet print surface because it describes transient acquisition provenance rather than an additional world measurement.

## Rebuild rule

Keep the Sounding Well passive. Load its observer before the application’s existing acquisition, recognize only the established four public-service origins and five feed paths, call the original `fetch` once, and derive temporal depth only from timestamp semantics that are genuinely comparable with the UTC latch. Never manufacture a feed-wide timestamp from EONET event geometry dates, never turn depth into a quality score, and never add history in order to explain the current snapshot.
