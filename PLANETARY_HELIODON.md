# The Planetary Heliodon / Earth Casts the Night

Date: 2026-08-07

## Design gate

Three concepts were evaluated before implementation against COMMONS / NOW's core purpose: make a shared world legible without personalization, fabricated history, hidden scoring, or unnecessary collection.

- **A — Global Day/Night Terminator:** add the current subsolar point, antisolar point, and day/night boundary to the existing world map.
- **B — Planetary Heliodon:** borrow the daylighting instrument used in architecture; treat Earth itself as the model and the captured snapshot instant as the lamp position.
- **C — Make the Whole Page a Horizon:** let the calculated terminator divide the entire webpage into visual day and night.

Concept C was discarded. It would make the geometry memorable, but would weaken contrast, print fidelity, reduced-motion expectations, and the coherent one-snapshot evidence model.

Concepts A and B were merged into **The Planetary Heliodon / Earth Casts the Night**.

## Museum contract

The Earth-facing thesis remains **“The world is doing this without us.”** The Heliodon extends that same observer-independence: daylight and night move across Earth whether or not the page is open, and the visitor's location is irrelevant.

This must not become a decorative day/night wallpaper or a precision solar ephemeris. It is a local geometric plate attached to the Museum's captured snapshot instant.

## Feature premise

At one captured UTC instant, one point on Earth is approximately beneath the Sun and the antipodal point faces directly away. The great circle between the illuminated and unilluminated hemispheres is the day/night terminator.

The existing thirteen station light states already use a local seasonal solar-declination approximation. This feature promotes that same calculation into explicit geometry rather than creating a competing daylight model.

The world map receives:

- an approximate **subsolar point**;
- its exact antipode as the **antisolar point** within the same approximation;
- a sampled great-circle terminator where calculated solar elevation is 0°;
- a coarse hatched night-side plate for visual legibility.

The hatching is intentionally lower precision than the terminator line and is not a measurement. Weather, cloud, topography, refraction, and atmospheric twilight are not encoded in the plate.

## Reference source

NOAA Global Monitoring Laboratory documents the standard relationship between solar declination, local hour angle, latitude, and solar zenith/elevation:

`https://gml.noaa.gov/grad/solcalc/solareqns.PDF`

The Museum does **not** reproduce NOAA's full solar-position algorithm. To remain coherent with the light-state logic already used by the thirteen fixed stations, it keeps the existing simplified seasonal declination model and derives the Heliodon from that same model. The result is therefore explicitly approximate.

The NOAA calculator also notes that calculated and observed solar position can differ because of atmospheric conditions and algorithmic uncertainty:

`https://gml.noaa.gov/grad/solcalc/`

Neither reference is contacted at runtime.

## Integrity rules

- no new runtime request, astronomy service, map service, tile service, remote media, or API key;
- no visitor location or timezone input; UTC and the fixed global map are sufficient;
- the Heliodon follows the same visible `Snapshot received HH:MM:SS UTC` value as the Celestial Escapement;
- no timer loop, polling, animation clock, storage, analytics, telemetry, or visitor text input;
- the subsolar point and station day/night states share the same `data-core.js` solar-geometry functions;
- the terminator is generated from a great circle perpendicular to the Sun direction and is split at the map seam instead of drawing a false line across the date line;
- the night hatching is a coarse visual classification only; the terminator line carries the geometric boundary;
- the printable field sheet records the same subsolar and antisolar coordinates;
- missing or invalid snapshot time fails closed rather than fabricating a solar position.

## Rebuild rule

Start with the Museum's existing solar-declination approximation and the captured UTC snapshot instant. Derive the approximate subsolar longitude from local solar noon, derive the antisolar point as its antipode, construct a great circle perpendicular to the Sun direction, and project it with the same equirectangular map formula used by the fixed stations. Never present the result as measured sunlight, current cloud cover, or precision ephemeris data.
