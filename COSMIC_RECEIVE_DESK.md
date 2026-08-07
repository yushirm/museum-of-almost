# The Latency of Now / Cosmic Receive Desk

Date: 2026-08-07

## Design gate

Three concepts were evaluated before implementation against COMMONS / NOW's core purpose: make a shared world legible without personalization, hidden scoring, fabricated history, or unnecessary collection.

- **A — Cosmic Distance Ladder:** a conventional ladder from the Moon to the oldest observable light, using fixed reference distances and light-travel times.
- **B — Deep-Space Latency Board:** borrow the grammar of network operations and packet routing; treat arriving photons as messages with measurable delay.
- **C — Break the One-Clock Web:** reject the usual webpage assumption that one displayed present is enough; one reception instant opens onto several observed pasts at once.

Concept A was discarded as a standalone feature. It teaches scale clearly, but would mostly become a static astronomy infographic.

Concepts B and C were merged into **The Latency of Now / Cosmic Receive Desk**.

## Feature premise

A single reception instant can contain light that left its source seconds, years, millions of years, or almost the age of the universe earlier. The Receive Desk places seven fixed NASA reference landmarks on a logarithmic light-delay rail and lets a visitor inspect the delay without implying a live view of the remote object.

The landmarks are the Moon, Sun, Alpha Centauri A/B, Sirius, the Milky Way center, the Andromeda Galaxy, and the cosmic microwave background. For nearby light the desk can derive an approximate departure UTC from the device clock. Deep-space values stay approximate lookback intervals rather than fabricated ancient timestamps. The cosmic microwave background is explicitly treated as lookback time, not a simple present-day distance.



## Museum contract

The Earth-facing thesis remains **“The world is doing this without us.”** The Receive Desk extends that same observer-independence rather than replacing it: opening the page does not make a distant object current, and arriving light does not become “now” because a visitor is watching.

This must not become a general astronomy-facts panel. The **Cosmic Signal Chain** remains the genuinely current near-Earth instrument. The **Cosmic Receive Desk** remains a deliberately local reference instrument about delayed light, and must never masquerade as a live telescope feed.

## Reference sources

The fixed local landmarks are documented against NASA references; none of these pages is contacted at runtime:

- Moon average distance 384,400 km: `https://science.nasa.gov/moon/facts/`
- Sun–Earth one-way light time about 8.3 minutes: `https://science.nasa.gov/learn/basics-of-space-flight/chapter1-1/`
- Alpha Centauri A/B about 4.37 light-years: `https://science.nasa.gov/sun/facts/`
- Sirius about 8.6 light-years: `https://science.nasa.gov/asset/hubble/the-dog-star-sirius-and-its-tiny-companion/`
- Milky Way center about 26,000 light-years: `https://science.nasa.gov/asset/hubble/milky-way-bulge/`
- Andromeda about 2.5 million light-years: `https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-31/`
- cosmic microwave background as the oldest observable light in a roughly 13.8-billion-year-old universe: `https://science.nasa.gov/universe/overview/`

## Integrity rules

- no astronomy API, telescope service, remote media, or additional runtime request;
- fixed reference constants and their authoritative references are documented above;
- the device clock is a display reference, not a network-synchronized scientific time source;
- the rail is logarithmic because the span runs from seconds to billions of years;
- mathematical rail positions are not shifted to avoid label collisions; labels use separate display lanes instead;
- selection and reception time remain memory-only;
- **Refresh world** also updates the local reception reference without adding any request beyond the Museum’s existing refresh requests;
- no timer loop, polling, storage, geolocation, analytics, telemetry, or visitor text input;
- the field sheet receives only a local compact latency note.

## Rebuild rule

Start from the fixed documented light-delay landmarks. Convert every delay to seconds, place the values on a base-10 logarithmic rail from the shortest to longest delay, and keep display collision handling separate from mathematical position. Use exact UTC only where the source delay supports nearby clock-scale interpretation; use approximate lookback language for deep time. Never turn the reference constants into a claim that the Museum is receiving live astronomy data.
