# The Unequal Minute / One Command, Four Clocks

## Purpose

**Instrument 12 · The Unequal Minute / One Command, Four Clocks** extends DEEP SPACE / ALMOST with a fixed Schwarzschild-exterior clock comparison.

It makes one narrow statement experiential:

**A shared Schwarzschild coordinate-time interval does not produce the same proper-time interval on stationary worldlines at different radii.**

The feature is an idealized teaching instrument. It is not a black-hole simulator and it does not reconstruct any real astrophysical object.

## Pre-code design gate

### Concept A — The Schwarzschild Clock Bench

The logical next step after the Frame Shifter, Causal Signal Box, gravitational lens, redshift, origin and expansion-history instruments was to add curved-spacetime clock rate without introducing a live ephemeris or a full numerical relativity model.

The conventional scientific core is the stationary Schwarzschild lapse outside a non-rotating, uncharged spherical mass.

### Concept B — The Clockmaker's Escapement Rack

The lateral concept borrowed a mechanical-watch repair bench: four escapements receive one winding command but advance by different amounts.

The mechanic was memorable, but its metaphor was scientifically expensive. It suggests that gravity acts like resistance on clockwork or slows a physical mechanism rather than changing the relation between coordinate time and proper time along different worldlines.

**Concept B was discarded.**

### Concept C — One Button Is Not One Amount

The convention-breaking concept attacks a normal interface expectation: repeated counters receiving the same command usually change by the same delta.

Here there is one command:

`ADVANCE 60 s AT INFINITY`

Every clock updates immediately, but by a different exact amount.

The result is not a latency trick. There is no ticking animation and no delayed event. The unequal increments are the scientific content.

**Concepts A and C were merged.**

## Fixed geometry

The instrument uses the Schwarzschild exterior only.

The Schwarzschild radius is:

`r_s = 2GM / c^2`

but the Museum never chooses a mass. Instead, every station radius is expressed as a fixed ratio:

`R = r / r_s`

This makes the clock-rate comparison dimensionless and avoids pretending to estimate a real black hole.

The four fixed hovering stations are:

- `R = 1.1`
- `R = 1.5`
- `R = 2`
- `R = 5`

No station is placed at or inside `R = 1`.

## Stationary-clock relation

For the Schwarzschild exterior, hold a timelike observer at fixed Schwarzschild coordinates:

- `dr = 0`
- `dtheta = 0`
- `dphi = 0`

The Schwarzschild metric then reduces to the stationary proper-time relation:

`dτ = dt sqrt(1 - r_s / r)`

or, using the normalized ratio `R = r / r_s`:

`dτ = dt sqrt(1 - 1/R)`

For one fixed coordinate-time command:

`Δt = 60 s`

the four exact lapse factors and proper-time steps are:

### R = 1.1

`1 - 1/R = 1/11`

`dτ/dt = 1/sqrt(11)`

`Δτ = 60/sqrt(11) s ≈ 18.090680675 s`

### R = 1.5

`1 - 1/R = 1/3`

`dτ/dt = 1/sqrt(3)`

`Δτ = 60/sqrt(3) s ≈ 34.641016151 s`

### R = 2

`1 - 1/R = 1/2`

`dτ/dt = 1/sqrt(2)`

`Δτ = 60/sqrt(2) s ≈ 42.426406871 s`

### R = 5

`1 - 1/R = 4/5`

`dτ/dt = 2/sqrt(5)`

`Δτ = 120/sqrt(5) s ≈ 53.665631460 s`

Every repeated command uses the same fixed coordinate-time increment. Total proper time is calculated from the integer command count rather than by repeatedly adding floating-point decimals, so accumulated readings do not drift through incremental rounding.

## Coordinate-time wording

The button says **ADVANCE 60 s AT INFINITY** because Schwarzschild coordinate time is normalized so that its rate agrees asymptotically with proper time for a stationary observer infinitely far from the central mass.

This is a coordinate reference, not a claim that a literal physical clock card exists at spatial infinity.

The instrument therefore keeps two kinds of time distinct:

- shared Schwarzschild coordinate time `t`;
- local proper time `τ` accumulated along each fixed hovering worldline.

## Hovering is not falling

Every offered station is a **stationary/hovering** observer at constant Schwarzschild radius.

That distinction is essential.

A freely falling observer follows a different worldline and does not obey this fixed-radius clock relation throughout a fall. The feature therefore refuses to reuse its stationary formula as a free-fall simulator.

Hovering increasingly close to the Schwarzschild horizon also requires increasingly large proper acceleration. The Museum does not calculate that acceleration because doing so would require choosing a mass scale, but the qualitative boundary matters: `R = 1` is not represented as an ordinary stationary station.

## Horizon boundary

The interface explicitly refuses the phrase **time stops at the horizon**.

The lapse factor for the chosen Schwarzschild coordinate description tends toward zero for a stationary worldline as `r` approaches `r_s` from outside. But a physical hovering observer cannot remain stationary at the horizon with finite proper acceleration.

The instrument therefore stops at `R = 1.1` and keeps the horizon as an excluded boundary rather than turning a coordinate-limit statement into a universal claim about every observer.

## Interface behavior

There is one primary interactive control.

Each press:

1. increments an in-memory integer command count by one;
2. advances the displayed Schwarzschild coordinate time by exactly `60 s`;
3. recomputes all four proper-time totals from the command count and exact lapse factors;
4. updates each station card immediately;
5. updates the semantic ledger immediately;
6. writes a polite live-region summary that the same coordinate command produced unequal proper-time readings.

There is deliberately no reset control. Reloading restores the fixed zero state.

There is deliberately no timer. The browser never waits 60 real seconds and never pretends that wall-clock time is the modeled coordinate time.

## Visual model

Each station includes a small fraction track whose width is the exact lapse factor expressed as a fraction of the 60-second coordinate-time command.

The track is redundant. It is `aria-hidden` and carries no scientific information that is not already written in exact text.

The station cards are not positioned on a radial scale. A screen grid would make the ratios `1.1`, `1.5`, `2`, and `5` visually misleading if treated as literal radial geometry, so exact radius labels remain authoritative.

## Scientific boundary

The feature models only:

- the idealized Schwarzschild exterior;
- stationary observers at four fixed radii outside the horizon;
- the relation between one Schwarzschild coordinate-time interval and local proper-time intervals.

It does **not** calculate or infer:

- a real black-hole mass;
- a real Schwarzschild radius in kilometres;
- a freely falling trajectory;
- an orbit;
- proper acceleration required to hover;
- tidal acceleration;
- gravitational redshift between arbitrary emitter/receiver pairs;
- what a distant telescope literally sees;
- coordinate time inside the horizon;
- interior black-hole geometry;
- Kerr rotation;
- charge;
- frame dragging;
- accretion physics;
- Hawking radiation;
- evaporation;
- a singularity model;
- GPS corrections;
- a real astrophysical clock observation.

## Source basis

Documentation sources only; visitor runtime never loads them.

- NASA APOD / Nemiroff, **Gravitational Principles and Mathematics**, gives the Schwarzschild metric and `R_S = 2GM/c^2`: https://apod.nasa.gov/htmltest/gifcity/nslens_math.html
- Einstein Online, **time dilation**, distinguishes gravitational time dilation from special-relativistic moving-clock time dilation: https://www.einstein-online.info/en/explandict/time-dilation/
- Einstein Online, **Descent into a black hole**, explicitly treats stationary positions outside a Schwarzschild horizon and notes the enormous acceleration needed to hover very close to it: https://www.einstein-online.info/en/spotlight/descent_bh/
- NASA Technical Reports Server, Finch, **Coordinate Families for the Schwarzschild Geometry Based on Radial Timelike Geodesics**, documents that freely falling observer-adapted time coordinates are distinct from the stationary Schwarzschild-coordinate picture: https://ntrs.nasa.gov/citations/20160011342

The Museum uses only the smaller stationary exterior relation needed by this instrument.

## Architecture and runtime boundary

The feature is static and local.

### `unequal-minute-core.js`

Owns:

- the fixed `60 s` coordinate step;
- the four frozen station declarations;
- lapse-factor calculation;
- coordinate-to-proper-time conversion;
- immutable per-station readings;
- immutable whole-instrument snapshots.

### `unequal-minute.js`

Owns:

- DOM-only mounting;
- the single step button;
- in-memory integer command count;
- textual station cards and semantic ledger;
- visual lapse-fraction tracks;
- polite live-region feedback.

It uses `document.createElement` and `textContent`; it does not build the feature from HTML strings.

### `unequal-minute.css`

Owns:

- responsive card and ledger layout;
- 44px-or-larger interactive target;
- visible keyboard focus;
- fraction-track presentation;
- high-contrast handling;
- reduced-motion handling;
- mobile and print behavior.

### `deep-space.js`

The proven progressive chain remains deterministic. Instrument 12 mounts after Instrument 11 rather than rewriting `deep-space.html`.

## Privacy and application boundary

Instrument 12 adds:

- no visitor text input;
- no visitor numeric input;
- no external or data-service request;
- no `fetch`, XHR, WebSocket, EventSource or beacon;
- no localStorage, sessionStorage, IndexedDB or cookies;
- no history manipulation;
- no geolocation;
- no account or authentication;
- no analytics, telemetry or tracking;
- no timer, polling loop or animation-frame loop;
- no remote script, font, image, media or API;
- no dependency or build system.

Repeated command state exists in JavaScript memory only and disappears on reload.

## Accessibility

- The command is a native button.
- The button is at least 44 CSS pixels tall.
- The command has an explicit explanatory `aria-describedby` relationship.
- Coordinate time and command count are exact text.
- Each station writes radius, exact lapse factor, exact per-command increment and accumulated proper time.
- A semantic table duplicates the four current readings independently of card layout.
- The visual fraction tracks are decorative and hidden from the accessibility tree.
- A polite atomic live region announces each command result.
- No scientific meaning depends on animation or color.
- Mobile layouts collapse to two columns and then one column.
- Increased-contrast handling strengthens boundaries.
- Print omits the live command control while retaining the model, fixed factors and ledger.

## Testing strategy

Focused tests must verify:

1. exactly four fixed station ratios `1.1`, `1.5`, `2`, and `5`;
2. no station at or inside `R = 1`;
3. exact lapse values against independent direct formula evaluation;
4. exact one-command proper-time values;
5. all proper-time steps are below `60 s` and strictly increase with radius across the fixed offered set;
6. cumulative totals are calculated from integer command count;
7. invalid station IDs and invalid step counts fail closed;
8. fixed declarations are immutable;
9. DOM-only mounting with no HTML-string injection;
10. one primary command and no timer or animation-frame loop;
11. memory-only state and no persistence/network/telemetry surface;
12. textual scientific boundaries and hovering/free-fall distinction;
13. responsive, focus, reduced-motion, increased-contrast and print contracts;
14. deterministic Instrument 07 → 08 → 09 → 10 → 11 → 12 loading;
15. coherent offline-shell membership and predecessor preservation.

## Rebuild rule

A valid rebuild must preserve all of these:

1. Schwarzschild exterior only.
2. Non-rotating, uncharged idealization.
3. Four fixed station ratios `1.1`, `1.5`, `2`, `5` unless the product contract deliberately changes.
4. No station at or inside `r = r_s`.
5. Stationary/hovering observers only.
6. `dτ = dt sqrt(1 - r_s/r)` as the only clock-rate relation.
7. Fixed coordinate-time step of `60 s`.
8. One command must produce four unequal proper-time increments.
9. No real-time waiting or ticking animation.
10. Cumulative totals must derive from command count rather than repeatedly adding rounded display values.
11. The phrase “time stops at the horizon” must remain refused.
12. No silent conversion into a free-fall, orbital, Kerr, acceleration, tidal-force or real-black-hole model.
13. Exact text remains authoritative over visual tracks.
14. No visitor input, persistence, telemetry or remote runtime dependency.
15. Instrument 12 remains a same-origin progressive enhancement after Instrument 11 unless a future architecture change is explicitly justified.
