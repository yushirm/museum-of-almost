# Same Answer Machine / Three Histories, One Redshift

## Purpose

**Instrument 11 · The Same Answer Machine / Three Histories, One Redshift** extends DEEP SPACE / ALMOST by separating an endpoint redshift relation from the expansion history between emission and observation.

It is a fixed, normalized teaching toy. It is not a reconstruction of the real Universe.

## Pre-code design gate

### Concept A — The Expansion-History Comparator

The conventional next step after the Redshift Ruler and Origin Machine was to compare fixed scale-factor histories rather than infer a unique distance or age from redshift alone.

The useful scientific core is that a photon-path quantity depending on an integral through `a(t)` requires more information than the endpoint ratio `a_obs / a_emit`.

### Concept B — The Route Planner

The lateral concept borrowed navigation software: same origin, same destination, different routes, different accumulated costs.

It was memorable, but it introduced the wrong agency. Photons do not choose among three roads through one Universe, and the fixed toy histories are not alternative routes simultaneously available to one light ray.

**Concept B was discarded.**

### Concept C — Three Buttons That Give the Same Answer

The convention-breaking concept makes every history control preserve the most prominent result on the page.

All three buttons deliberately leave:

`z = 1`

unchanged.

Only the history curve and the path integral change. This makes underdetermination an interaction rule instead of merely explanatory prose.

**Concepts A and C were merged.**

## Fixed endpoint relation

Every offered toy history uses:

- `a_emit = 0.5`
- `a_obs = 1`

Therefore:

`1 + z = a_obs / a_emit = 2`

and:

`z = 1`

The endpoint redshift is intentionally identical for every offered history.

## Three fixed toy histories

The normalized toy coordinate is `u` with:

`0 <= u <= 1`

The histories are:

### Linear

`a(u) = 0.5 + 0.5u`

### Early growth

`a(u) = 0.5 + 0.5 sqrt(u)`

### Late growth

`a(u) = 0.5 + 0.5u^2`

All satisfy:

`a(0) = 0.5`

and:

`a(1) = 1`

They are fictional analytic curves selected for a transparent comparison. None is asserted to be the expansion history of the real Universe.

## Dimensionless null-path analogue

For each fixed toy history the instrument calculates:

`J = integral_0^1 du / a(u)`

Because `u` is dimensionless normalized toy time, `J` is also dimensionless.

The exact values are:

- Linear: `J = 2 ln 2 ≈ 1.386294`
- Early growth: `J = 4(1 - ln 2) ≈ 1.227411`
- Late growth: `J = pi / 2 ≈ 1.570796`

The three values differ even though the endpoint redshift is the same.

That is the whole lesson.

## Scientific basis and boundary

In a Robertson-Walker / FLRW description, radial photon propagation is null, and comoving/conformal path quantities involve an integral through the scale factor, conventionally written with a factor like `dt / a(t)`. Cosmological redshift relates the received/emitted wavelength ratio to the scale-factor ratio between observation and emission.

This toy keeps the structural distinction while removing physical time units and cosmological parameters.

It therefore supports only the narrow conclusion:

**The same endpoint scale-factor ratio, and therefore the same endpoint cosmological redshift, does not by itself specify a history-dependent path integral.**

It does **not** calculate or infer:

- real comoving distance;
- proper distance;
- luminosity distance;
- angular-diameter distance;
- lookback time;
- cosmic age;
- a Hubble constant or Hubble parameter;
- matter, radiation, curvature, or dark-energy density parameters;
- acceleration;
- a Friedmann-equation solution;
- a real source identity;
- a real observational fit;
- which of the three toy histories better describes our Universe.

No conclusion about real distance may be read from the ordering of the three `J` values.

## Source basis

Documentation sources only; visitor runtime never loads them.

- NASA Science, **What is Cosmological Redshift?**, describes cosmological redshift as light being stretched as the Universe expands: https://science.nasa.gov/asset/hubble/what-is-cosmological-redshift/
- NASA/IPAC Extragalactic Database, Peacock, **Cosmological Physics**, discusses conformal time and radial photon propagation through the Robertson-Walker scale factor: https://ned.ipac.caltech.edu/level5/Peacock/Peacock3_1.html
- NASA/IPAC Extragalactic Database, Hu & Dodelson, **Cosmic Microwave Background Anisotropies**, explicitly writes conformal time as an integral `dt / a(t)`: https://ned.ipac.caltech.edu/level5/Sept05/Hu/Hu3.html
- NASA/IPAC Extragalactic Database, Hogg, **Distance Measures in Cosmology**, emphasizes that cosmological distance measures depend on photon trajectories and cosmological model information: https://ned.ipac.caltech.edu/level5/Hogg/Hogg1.html

The Museum implementation is deliberately smaller than these physical models.

## Interface behavior

The history buttons intentionally violate a normal interface expectation: the hero number does not change after a valid selection.

Every selection:

1. keeps the invariant endpoint redshift at `z = 1`;
2. highlights the selected analytic history curve;
3. updates the exact formula;
4. updates the exact and decimal `J` value;
5. updates a five-sample semantic table;
6. writes live-region feedback explaining that the endpoint answer stayed fixed while the history-dependent quantity changed.

All three curves remain visible simultaneously so the shared endpoints are explicit.

The chart is schematic. Exact formulas and ledger values are authoritative.

## Runtime and privacy boundary

Instrument 11 is static and local.

It adds:

- no data-service or external runtime request;
- no visitor text or numeric input;
- no storage, cookies, IndexedDB, or history state;
- no account, authentication, cloud state, analytics, telemetry, geolocation, or tracking;
- no timer, polling loop, animation-frame loop, remote script, font, image, media, API, or dependency.

Only normal same-origin local asset loading is used.

## Accessibility

- History choices are native buttons with `aria-pressed`.
- Interactive targets are at least 44 CSS pixels high.
- The selected history and changed integral are announced in a polite live region.
- The invariant `z = 1` result is explicit text and never encoded only by visual sameness.
- The exact selected curve formula and five sampled `a(u)` values are textual.
- The SVG chart is decorative because all of its scientific meaning is duplicated in text.
- Distinct dash patterns supplement the selected-state emphasis so the three curves do not depend on color alone.
- Curve transitions are disabled under `prefers-reduced-motion`.
- Increased-contrast, mobile, table overflow, and print handling are explicit.

## Offline behavior

The core, view, stylesheet, focused test contract, and this design record belong to the coherent same-origin offline shell.

Page Four landed first and owns `museum-of-almost-v30-page-four`. This release is rebased on that exact baseline, preserves every Page Four and Border Office shell asset and release marker, and advances the coherent shell to `museum-of-almost-v31-same-answer-machine`. Future concurrent releases must likewise be preserved rather than overwritten.

## Rebuild rule

A valid rebuild must preserve all of these:

1. fixed endpoints `a_emit = 0.5` and `a_obs = 1`;
2. invariant endpoint `z = 1` for every history;
3. exactly the three fixed toy histories unless the product contract deliberately changes;
4. exact analytic path integrals `2 ln 2`, `4(1 - ln 2)`, and `pi/2`;
5. `J` remains dimensionless because `u` is normalized and dimensionless;
6. no `J` value is relabeled as a physical distance, lookback time, or cosmic age;
7. selecting a history keeps the hero redshift unchanged while updating the curve and path ledger;
8. all curve meaning is duplicated in exact semantic text;
9. no visitor-entered cosmological values, persistence, telemetry, remote runtime dependency, or new data service;
10. no silent addition of Hubble, density-parameter, Friedmann-fit, acceleration, or real-Universe inference.
