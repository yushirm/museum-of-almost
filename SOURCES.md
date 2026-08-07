# Data Sources

**COMMONS / NOW** uses four public data services. The website makes one request to each source when the page opens and another set only when the visitor presses **Refresh world**. It does not poll automatically.

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

## NOAA Space Weather Prediction Center

Current metric:

- current solar-wind speed near Earth, expressed in kilometres per second.

Endpoint:

`https://services.swpc.noaa.gov/products/summary/solar-wind-speed.json`

Product directory:

`https://services.swpc.noaa.gov/products/summary/`

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

## NASA Earth Observatory Natural Event Tracker (EONET)

Current metrics:

- count of currently open events returned in the snapshot;
- aggregate counts for the most common event categories.

Endpoint:

`https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=500`

Documentation:

`https://eonet.gsfc.nasa.gov/docs/v3`

The page intentionally aggregates categories rather than reproducing event titles, coordinates, or source links.

## Availability and interpretation

These are third-party public services. Their availability, update cadence, definitions, and terms are controlled by their respective providers. A missing or failed response is shown as unavailable rather than replaced with a guessed value.

No API key, paid service, account, analytics provider, or tracking service is used by the Museum.
