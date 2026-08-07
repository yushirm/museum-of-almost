# The Celestial Escapement / Many Clocks, One Now

Date: 2026-08-07

## Design gate

Three concepts were evaluated before implementation against COMMONS / NOW's core purpose: make a shared world legible without personalization, fabricated history, hidden scoring, or unnecessary collection.

- **A — Orbital Now:** add a compact local ephemeris-like readout for current celestial cycles.
- **B — The Celestial Escapement:** borrow mechanical-horology grammar and let one captured instant engage several independent cosmic clocks.
- **C — The Page Refuses to Stay Still:** continuously advance the cosmic section from device time even when the visitor does not refresh.

Concept C was discarded. Continuous hidden drift would undermine the Museum's coherent-snapshot model, printable field sheet, reduced-motion discipline, and deliberate **Refresh world** action.

Concepts A and B were merged into **The Celestial Escapement / Many Clocks, One Now**.

## Museum contract

The Earth-facing thesis remains **“The world is doing this without us.”** The escapement extends that observer-independence: Earth rotates, the Moon changes phase, and planets continue their orbits whether or not the page is open.

This must not become a generic astronomy dashboard or a false precision ephemeris. The instrument freezes at the same locally captured instant as the current page snapshot and moves only when **Refresh world** captures a new instant.

## Four wheels

1. **Earth turn** — a 24-hour mean-solar reference expressed through the UTC day fraction. It is a shared rotation reference, not visitor-local solar time.
2. **Moon month** — approximate lunar phase from the mean 29.53059-day synodic month, anchored to the 2026-08-12 ecliptic conjunction associated with the total solar eclipse.
3. **Earth year** — JPL's lower-accuracy Earth–Moon-barycenter mean longitude, using the J2000 element and rate valid for 1800–2050.
4. **Jupiter year** — JPL's lower-accuracy Jupiter mean longitude from the same approximation set. NASA describes one Jovian orbit as about 4,333 Earth days.

## Reference sources

These references are documentation only and are never contacted at runtime:

- NASA Earth facts — 23.9-hour day and 365.25-day year: `https://science.nasa.gov/earth/facts/`
- NASA Basics of Space Flight — mean solar rotation/revolution distinction: `https://science.nasa.gov/learn/basics-of-space-flight/chapter2-1/`
- NASA GSFC — mean synodic month 29.53059 days: `https://eclipse.gsfc.nasa.gov/SEhelp/moonorbit.html`
- NASA GSFC — 2026-08-12 ecliptic conjunction at 17:36:42.1 UT: `https://eclipse.gsfc.nasa.gov/SEbeselm/SEbeselm2001/SE2026Aug12Tbeselm.html`
- JPL Solar System Dynamics — lower-accuracy planetary position formulae and J2000 mean-longitude elements: `https://ssd.jpl.nasa.gov/planets/approx_pos.html`
- NASA Jupiter facts — Jovian year about 4,333 Earth days: `https://science.nasa.gov/jupiter/jupiter-facts/`

## Integrity rules

- no astronomy API, Horizons request, telescope service, remote media, or extra runtime request;
- no timer loop, animation clock, polling, storage, geolocation, analytics, telemetry, or visitor text input;
- one captured device-clock instant drives every wheel;
- **Refresh world** recaptures the instant; otherwise the dials remain frozen;
- the Moon value is explicitly approximate and based on a mean synodic month;
- Earth/Jupiter orbital wheels use JPL's published lower-accuracy mean-longitude approximation, not an assertion of telescope-grade apparent position;
- Earth turn uses UTC as a shared mean-solar reference and does not claim local solar noon;
- the field sheet carries only the frozen local phases and source boundary.

## Rebuild rule

Start with one captured UTC instant. Derive the Earth-turn fraction locally, derive approximate lunar phase from the documented synodic month and fixed 2026 new-Moon conjunction, and derive Earth/Jupiter mean longitudes from JPL's J2000 base values plus rates. Freeze all four values until the established refresh action captures a new instant. Never add an automatic clock or runtime astronomy service to make the mechanism appear more “live.”
