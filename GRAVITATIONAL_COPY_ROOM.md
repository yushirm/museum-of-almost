# The Gravitational Copy Room / One Source, More Than One Image

## Design gate

Three directions were evaluated before implementation.

### Concept A — The Einstein Lens Bench

A conventional next instrument would use a simple gravitational-lens model to show how one source position maps to apparent image positions and to the perfectly aligned Einstein-ring case.

This is scientifically additive because Deep Space already presents gravity as geometry and notes that unseen matter can be inferred gravitationally, but another ordinary calculator would repeat the gallery's readout-card grammar.

### Concept B — The Printmaker's Ghost Plate

Borrow printmaking and registration-proof language: one original mark produces several displaced impressions.

The metaphor is visually useful but was discarded. Printing mechanically copies marks, while gravitational lensing redirects light paths through curved spacetime. The analogy risks becoming stronger than the physics.

### Concept C — Duplicate Cards Are Not Duplicate Things

Break a common interface convention: repeated cards normally represent repeated records. Here two apparent-image cards deliberately carry the same immutable source identity. In the aligned case the discrete pair gives way to a continuous ring representation.

### Decision

Concept B was discarded as the least useful because of its misleading causal analogy.

Concepts A and C were merged into **The Gravitational Copy Room / One Source, More Than One Image**.

## Scientific model

The feature uses an idealized, circular, point-mass gravitational lens in dimensionless Einstein-radius units.

Let:

- `y = beta / theta_E` be the source angular offset normalized by the Einstein radius;
- `x = theta / theta_E` be an apparent image angular position normalized by the Einstein radius.

The normalized point-lens equation is:

`y = x - 1/x`

For `y != 0`, the two one-dimensional solutions are:

`x+ = (y + sqrt(y^2 + 4)) / 2`

`x- = (y - sqrt(y^2 + 4)) / 2`

The two roots have opposite image parity in this ideal model. The outer solution has positive parity and the inner solution has negative parity.

For exact alignment, `y = 0`. The one-dimensional roots lie at `x = +/-1`, but circular symmetry means the physical idealization is a continuous Einstein ring of radius `theta_E`, not two discrete point images. The interface therefore switches from cards to a ring state instead of pretending the aligned case is simply another two-card layout.

## Fixed cases

The feature contains three fixed source offsets:

- **Perfect alignment**: `y = 0`;
- **Near axis**: `y = 0.5`;
- **Farther off axis**: `y = 1.5`.

Every case uses the same fictional immutable source identity: `SRC-01`.

The source identity is deliberately not an astronomical catalog entry. It exists only to make the interface distinction between one source and multiple apparent images explicit.

## Integrity boundary

This is a teaching model, not a lens-modeling or mass-inference tool.

It does not estimate or imply:

- lens mass;
- source, lens, or observer distance;
- redshift;
- angular diameter distance;
- physical Einstein radius;
- image brightness or magnification;
- time delay;
- shear, convergence, ellipticity, substructure, or external fields;
- a real sky coordinate;
- a real astronomical object.

The visual stage is schematic. Exact normalized numerical solutions are authoritative.

The feature does not use magnification bars or confidence-like scoring. It does not imply that repeated image cards are separate sources.

## Runtime and privacy boundary

The feature is a same-origin local progressive enhancement.

Beyond loading its own local script and stylesheet assets, it adds no:

- data-service or external request;
- visitor text or numeric input;
- storage, cookies, history state, or persistence;
- timer, polling loop, or animation frame;
- location access;
- analytics or telemetry;
- remote script, font, image, media, or API;
- account, cloud state, or dependency.

Case selection exists only in JavaScript memory and resets on reload.

## Accessibility

- case selection uses native buttons;
- buttons expose `aria-pressed`;
- the numerical ledger is a polite live region;
- every apparent image repeats the shared source identity in text;
- parity is written in text and is not conveyed only by mirroring;
- the Einstein-ring state is stated textually and does not depend on the circle graphic;
- the schematic stage has an explicit non-measuring disclaimer;
- controls retain 44px minimum targets;
- reduced motion removes stage transitions;
- increased contrast, mobile, and print layouts have explicit handling.

## Offline behavior

`gravitational-copy-core.js`, `gravitational-copy.js`, `gravitational-copy.css`, and this record are same-origin local assets and belong to the Museum's coherent offline shell.

## Source basis

The implementation is based on standard gravitational-lensing references and uses no runtime science service.

Phenomenon references:

- NASA Science, Hubble gravitational lensing overview: `https://science.nasa.gov/solar-system/10-things-einstein-got-right/`
- NASA Science, Hubble double Einstein ring: `https://science.nasa.gov/missions/hubble/nasa-hubble-finds-rare-double-ring-in-space/`

Model reference:

- NASA/IPAC Extragalactic Database, Saas Fee Lectures on Strong Gravitational Lensing: `https://ned.ipac.caltech.edu/level5/March04/Kochanek2/Kochanek3_2.html`

These URLs are documentation references only. They are never loaded by the visitor runtime.

## Rebuild rule

Keep the source identity fixed and generic. Keep the teaching model normalized to `theta_E = 1` unless the product contract is explicitly changed. Derive every displayed image position from the lens equation, special-case exact alignment as a ring, and never let schematic screen position become a second scientific calculation. Never add visitor-entered lens parameters or imply that this toy model can infer a real lens mass or sky configuration.
