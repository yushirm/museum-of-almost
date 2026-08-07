# Data Sources

**COMMONS / NOW** uses four public data services across five current feeds. The website makes one request to USGS, one to Open-Meteo, one to NASA EONET, and two current-product requests to NOAA SWPC when the page opens. Another set is requested only when the visitor presses **Refresh world**. It does not poll automatically.

The **Sample-and-Hold Bus** commits those five responses together. The **Sounding Well / The Thickness of Now** adds no request: it passively reads timestamp metadata already present in the existing responses, where the provider exposes source-time semantics that can honestly be offset from the Museum's UTC latch.

## USGS Earthquake Hazards Program

Current metric:

- all earthquakes in the past hour;
- strongest reported magnitude in that response;
- mean reported depth across events with a numeric depth.

Endpoint:

`https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson`

Documentation:

`https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php`

The page does not reproduce event titles, nearby places, event IDs, or event links.

For temporal sounding, the response's `metadata.generated` value is labeled **feed generated**. It is not represented as the event time of every earthquake in the rolling past-hour feed.

## NOAA Space Weather Prediction Center

Current metrics:

- current solar-wind speed near Earth, expressed in kilometres per second;
- current NOAA geomagnetic-storm scale (`G`);
- current NOAA solar-radiation-storm scale (`S`).

Endpoints:

`https://services.swpc.noaa.gov/products/summary/solar-wind-speed.json`

`https://services.swpc.noaa.gov/products/noaa-scales.json`

Product directories and scale explanation:

`https://services.swpc.noaa.gov/products/summary/`

`https://services.swpc.noaa.gov/products/`

`https://www.swpc.noaa.gov/noaa-scales-explanation`

The **Cosmic Signal Chain** reuses both NOAA responses from the shared five-feed latch. It mirrors the existing solar-wind value as its first detector and reads current `G` and `S` values from the already-acquired NOAA Scales response. It does not issue an independent request. The three readings appear in a left-to-right instrument rack for comparison only. The rail is explicitly **not a causal timeline**: the Museum does not infer that one displayed measurement caused another.

NOAA scale values outside the documented 0–5 range are treated as unavailable rather than clamped or guessed. A feed value of 0 is displayed as no active scale threshold; levels 1–5 retain NOAA's minor-through-extreme wording.

For temporal sounding, the solar-wind product's timestamp is labeled **solar-wind observation**. The NOAA Scales timestamp is read only from the current record at key `0` and labeled **space-weather scale observation**; historical maximum and forecast records are not treated as the current instant.

## Open-Meteo

Current metrics for thirteen fixed coordinates:

- temperature at 2 m;
- wind speed at 10 m;
- precipitation.

Endpoint base:

`https://api.open-meteo.com/v1/forecast`

Documentation:

`https://open-meteo.com/en/docs`

Open-Meteo provides no-key access for non-commercial use and requires attribution for its CC BY 4.0 data. The visible website includes the required Open-Meteo attribution. The coordinates are fixed in source code and are not derived from visitor location.

Open-Meteo documents that each `current` object contains `time`, the moment at which the current data is valid. The Museum requests `timezone=UTC`. The Sounding Well therefore offsets those current-valid timestamps from the UTC latch. If the thirteen locations do not return the exact same valid time, the instrument retains the oldest and newest valid time and uses the oldest as that channel's temporal depth.

The Difference Engine reuses this same thirteen-point response. It makes no second Open-Meteo request: pair deltas and the observed comparison range are calculated locally from the current snapshot already in page memory.

The **Planetary Section** also reuses this exact response. It orders the fixed stations west to east and derives temperature height, wind-flag length, and precipitation marks only from the thirteen values already in memory. There is **no interpolation** between samples, no smoothing, and no additional weather request.

## NASA Earth Observatory Natural Event Tracker (EONET)

Current metrics:

- count of currently open events returned in the snapshot;
- aggregate counts for the most common event categories.

Endpoint:

`https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=500`

Documentation:

`https://eonet.gsfc.nasa.gov/docs/v3`

The page intentionally aggregates categories rather than reproducing event titles, coordinates, or source links.

EONET documents each event geometry as a pairing of a date/time with a particular event location and notes that the time will commonly be `00:00Z` unless an upstream source supplied a particular time. That is not one feed-wide observation instant. The Sounding Well therefore leaves EONET **unsounded** rather than using the newest event geometry to manufacture a feed age.

## Local world basemap

`world-map.svg` is a same-origin static asset generated from Natural Earth 110m land geometry. Natural Earth states that its raster and vector map data are in the public domain.

Natural Earth land data:

`https://www.naturalearthdata.com/downloads/110m-physical-vectors/110m-land/`

Terms of use:

`https://www.naturalearthdata.com/about/terms-of-use/`

The Museum simplifies the public-domain geometry locally and projects it into a 360 × 180 equirectangular SVG using the same station placement formula:

- `x = longitude + 180`;
- `y = 90 - latitude`.

The SVG is committed to the repository and cached with the static application shell. The browser does not contact Natural Earth, a map API, a tile server, or a geocoder at runtime.

## Local celestial reference calculations

The **Cosmic Receive Desk** and **Celestial Escapement** add no runtime source. Their reference pages are documentation only and are not fetched by the browser.

The Celestial Escapement uses:

- NASA Earth facts for the approximate 24-hour day and 365.25-day year: `https://science.nasa.gov/earth/facts/`
- NASA GSFC's mean synodic month of 29.53059 days: `https://eclipse.gsfc.nasa.gov/SEhelp/moonorbit.html`
- NASA GSFC's 2026-08-12 ecliptic conjunction at 17:36:42.1 UT as the fixed lunar phase anchor: `https://eclipse.gsfc.nasa.gov/SEbeselm/SEbeselm2001/SE2026Aug12Tbeselm.html`
- JPL Solar System Dynamics lower-accuracy J2000 mean-longitude elements for the Earth–Moon barycenter and Jupiter: `https://ssd.jpl.nasa.gov/planets/approx_pos.html`
- NASA Jupiter facts for the roughly 4,333-Earth-day Jovian year: `https://science.nasa.gov/jupiter/jupiter-facts/`

The dials are approximation instruments, not a substitute for JPL Horizons or a precision lunar ephemeris. They freeze at one captured instant until the established refresh action is used.

## Local derived values

The following values do not come from an additional service:

- daylight, twilight, and night at each fixed point are approximated locally from UTC time and geometry;
- Difference Engine surface distance is calculated locally as great-circle distance between two fixed coordinates;
- Difference Engine temperature, wind, and precipitation deltas are derived from the existing Open-Meteo response;
- Planetary Section west-to-east ordering comes from each fixed point's longitude;
- Planetary Section temperature, wind, and precipitation positions are normalized only against the current thirteen reporting points;
- the field-sheet timestamp is the time the current snapshot was received by the page;
- the Cosmic Signal Chain's first value is a local mirror of the already-loaded solar-wind headline rather than a duplicate NOAA request;
- the Sounding Well's known **source-time thickness** is the largest non-negative difference between the UTC latch and the oldest comparable source timestamp in the current acquisition.

The Sounding Well's hanging-line lengths are normalized only within the current latch. Written durations, UTC times, and each channel's timestamp-semantic label are authoritative. Visual depth is not a fixed time scale, provider score, confidence score, uncertainty estimate, or claim that all source timestamps mean the same thing.

The Planetary Section intentionally draws discrete posts rather than a connecting path. A blank span between stations means **not measured here**, not a hidden estimate.

## Field-sheet output

**Make field sheet** uses the browser's native print capability. Printing is not a data source and does not contact a Museum document service. The print layout carries source provenance with the current snapshot so a paper or local-PDF copy remains interpretable outside the live page. The Cosmic Signal Chain adds a compact NOAA SWPC strip to the same field sheet; it does not create a second document or upload anything.

The Sounding Well is intentionally omitted from the field-sheet print surface. It describes acquisition provenance for the live latch rather than another measured world variable.

## Availability and interpretation

These are third-party public services. Their availability, update cadence, definitions, timestamp semantics, and terms are controlled by their respective providers. A missing or failed response is shown as unavailable rather than replaced with a guessed value. A missing or incomparable timestamp is likewise left missing or incomparable.

No API key, paid service, account, analytics provider, tracking service, map API, tile provider, PDF service, or document-storage service is used by the Museum.

## Planetary Heliodon local solar geometry

The **Planetary Heliodon / Earth Casts the Night** makes no runtime request. It derives an approximate subsolar point, antisolar point, and day/night terminator from the Museum's captured UTC snapshot instant and the same simplified seasonal solar-declination model already used for the thirteen station light states.

Reference for the standard solar-position relationship between declination, hour angle, latitude, and zenith/elevation:

- NOAA Global Monitoring Laboratory — General Solar Position Calculations: `https://gml.noaa.gov/grad/solcalc/solareqns.PDF`
- NOAA Global Monitoring Laboratory — Solar Calculator and accuracy caveat: `https://gml.noaa.gov/grad/solcalc/`

These references are documentation only and are **not contacted at runtime**. The Museum intentionally does not claim NOAA-calculator precision: the Heliodon preserves the application's existing approximate daylight model so station light states and the map boundary cannot disagree because of two different local algorithms. See `PLANETARY_HELIODON.md` for the design gate and approximation boundary.
