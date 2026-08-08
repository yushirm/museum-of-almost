# Origin Machine / Every Point Gets to Be Zero

## Purpose

**Instrument 10 · The Origin Machine / Every Point Gets to Be Zero** extends DEEP SPACE / ALMOST from cosmological redshift into a deliberately narrow model of homogeneous expansion.

It is a fixed, local teaching toy. It does not estimate the real Universe or any real astronomical object.

## Pre-code design gate

### Concept A — The Expansion Bench

The conventional direction was a fixed scale-factor exercise: hold comoving coordinates fixed, choose a normalized scale factor, and calculate how physical separation changes on a flat spatial slice.

This supplied the useful scientific core but risked becoming another ordinary selector plus ledger.

### Concept B — The Darkroom Enlarger

The lateral direction borrowed photographic enlargement: fixed points on a negative are printed at different enlargement factors.

It was memorable, but it introduced exactly the wrong surrounding intuitions. A photographic print has an outside viewer, edges, a sheet, and a privileged optical center. Those implications are not part of the homogeneous cosmology model.

**Concept B was discarded.**

### Concept C — The Page Has No Permanent Center

The convention-breaking direction makes the interface itself refuse a permanent spatial origin. Selecting any fixed marker makes the stage recenter that marker at coordinate zero. The marker records do not move in comoving coordinates; only the coordinate description and scale-factor-dependent relative positions change.

This supplied an interface behavior that directly supports the science instead of decorating it.

**Concepts A and C were merged.**

## Fixed model

The model contains five fictional comoving markers:

| Marker | Comoving coordinate χ |
| --- | ---: |
| A | -4 |
| B | -2 |
| C | 0 |
| D | +3 |
| E | +5 |

It offers only three normalized scale factors:

- `a = 0.5`
- `a = 1`
- `a = 2`

Any of the five markers can be selected as the coordinate origin.

No visitor-entered cosmological value is accepted.

## Calculation

For a marker at fixed comoving coordinate `χ` and selected origin `χ_observer`, the flat one-dimensional toy displays:

`x_relative = a (χ - χ_observer)`

and the corresponding normalized separation on that fixed-time spatial slice:

`D = a |χ - χ_observer|`

The core intentionally contains no `H0`, time derivative of the scale factor, Friedmann equation, redshift conversion, velocity conversion, horizon integral, curvature term, or real distance unit.

## What recentering means

The selected marker is displayed at `x = 0` because the interface has changed coordinate origin.

That is **not** a claim that the marker became a physical center, that every real observer sees identical data, or that causal visibility is unlimited. The finite five-marker window is not an edge or center of the Universe; it exists only because a browser needs a bounded diagram. Its left and right edges are not cosmological edges.

The fixed marker records remain in the same DOM/data order. Re-centering never rewrites marker identity or comoving coordinate.

## Visual boundary

The stage uses one fixed linear mapping from the largest possible relative coordinate in this toy to the available screen width. The mapping reserves side margins so even the largest offered separation remains legible. Therefore changing `a` changes marker separation on screen without changing marker glyph size.

Keeping glyph size fixed is deliberate. The feature is about separation between ideal comoving locations; it must not visually imply that every bound object is simply scaled up with the cosmological scale factor.

When markers are close horizontally, their labels use fixed vertical clearance lanes. **Vertical staggering is only label clearance and carries no second spatial coordinate.** The selected origin moves to a central label lane, but only the horizontal position represents the toy coordinate.

The screen is still schematic. The exact ledger is authoritative.

## What this instrument refuses to infer

It does **not** calculate or assert:

- a real Hubble constant or Hubble parameter;
- recession velocity;
- cosmological redshift;
- gravitational or Doppler redshift;
- acceleration or dark-energy dynamics;
- particle, event, or Hubble horizons;
- what a selected observer can currently see;
- nonzero spatial curvature;
- a real source distance;
- a center or edge of the real Universe;
- expansion of gravitationally or electromagnetically bound objects.

Those require different models.

## Source basis

Documentation sources only; visitor runtime never loads them.

- NASA Science, **Webb Telescope & The Big Bang**, includes John Mather's explanation that the expanding universe is not a firecracker with a spatial center and that the Big Bang happened everywhere: https://science.nasa.gov/mission/webb/big-bang-q-and-a/
- NASA/IPAC Extragalactic Database, Frieman, Turner & Huterer, **Dark Energy and the Accelerating Universe — Basic Cosmology**, describes the homogeneous/isotropic FRW framework, comoving coordinates, spatial curvature, and the cosmic scale factor `a(t)`: https://ned.ipac.caltech.edu/level5/March08/Frieman/Frieman2.html
- NASA/IPAC Extragalactic Database, Steigman, **Primordial Alchemy**, states that comoving coordinates remain fixed while physical distances between comoving locations change with the scale factor: https://ned.ipac.caltech.edu/level5/March04/Steigman3/Steigman1.html

The Museum implementation is deliberately smaller than the source models: flat, one-dimensional, kinematic, normalized, and finite for display.

## Runtime and privacy boundary

Instrument 10 is static and local.

It adds:

- no data-service or external runtime request;
- no visitor text or numeric input;
- no storage, cookies, IndexedDB, or history state;
- no account, authentication, cloud state, analytics, telemetry, geolocation, or tracking;
- no timer, polling loop, animation frame loop, remote script, font, image, media, API, or dependency.

Only normal same-origin local asset loading is used.

## Accessibility

- Origin and scale-factor choices are native buttons with `aria-pressed`.
- Interactive targets are at least 44 CSS pixels high.
- Exact values are duplicated in a semantic table and polite live region.
- The schematic stage is keyboard-focusable and labeled but is never the sole carrier of meaning.
- The selected origin is written in text, not conveyed only by position or color.
- Marker motion is disabled under `prefers-reduced-motion`.
- Increased-contrast, mobile, horizontal table overflow, and print handling are explicit.
- Re-centering does not move keyboard focus or page scroll.
- Vertical label lanes are decorative clearance only and are explained in text.

## Offline behavior

The core, view, stylesheet, focused test contract, and this design record belong to the coherent same-origin offline shell.

The release must preserve every earlier Museum shell asset. If a concurrent release advances the cache before merge, this feature must rebase onto that exact `main` and take the next coherent cache identity rather than overwrite the concurrent release marker.

## Rebuild rule

A valid rebuild must preserve all of these:

1. five fixed fictional comoving markers at `χ = -4, -2, 0, +3, +5`;
2. only the fixed scale factors `0.5`, `1`, and `2`;
3. any marker can become coordinate zero without mutating its fixed comoving coordinate;
4. `x_relative = a(χ - χ_observer)`;
5. `D = a|χ - χ_observer|` for this flat 1D toy;
6. marker glyph size remains fixed while horizontal separation changes;
7. vertical staggering remains label clearance only and never becomes a second coordinate;
8. exact text remains authoritative over screen geometry;
9. finite stage edges are never described as cosmological edges;
10. no velocity, Hubble-constant, redshift, acceleration, horizon, curvature, or real-distance inference;
11. no visitor-entered values, persistence, telemetry, remote runtime dependency, or new data service.
