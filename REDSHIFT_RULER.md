# The Redshift Ruler / The Tick Marks Will Not Stay Put

## Design gate

Three directions were evaluated before implementation.

### Concept A — The Redshift Desk

The conventional next instrument would calculate how a fixed emitted wavelength changes under a fixed cosmological redshift, and relate the same redshift to the normalized cosmic scale factor.

This is scientifically additive after the gallery's light-time, spacetime, causal and lensing instruments, but another ordinary calculator would repeat the existing ledger-card grammar.

### Concept B — The Spectral Bellows

Borrow the mechanism of an accordion bellows: a fixed spectral mark would sit across folding panels whose spacing increased as the bellows opened.

This was discarded. The tactile stretching metaphor is memorable, but a mechanical medium risks implying that light is carried by an ether-like substance or literal elastic material. That causal baggage is not worth the visual analogy.

### Concept C — The Ruler Refuses to Stay the Same Size

Break a normal web convention: coordinate systems and rulers usually remain visually stable while values change. Here the observed wavelength ruler deliberately changes physical screen span by the calculated factor `1 + z`.

The exact numbers remain textual and authoritative. Screen width is only a downstream visualization of the ratio.

### Decision

Concept B was discarded as the least useful because its mechanical-medium implication can distort the science.

Concepts A and C were merged into **The Redshift Ruler / The Tick Marks Will Not Stay Put**.

## Scientific model

The feature models **cosmological redshift only** in an ideal expanding-universe teaching model.

A fixed generic reference wavelength is used:

`lambda_emit = 500 nm`

For cosmological redshift `z`:

`1 + z = lambda_obs / lambda_emit`

so:

`lambda_obs = lambda_emit (1 + z)`

When the observation epoch is normalized to scale factor `a_obs = 1`, the corresponding emission scale factor is:

`a_emit = 1 / (1 + z)`

The feature contains three fixed cases:

- `z = 0.1` → `lambda_obs = 550 nm`, `a_emit = 1 / 1.1`;
- `z = 1` → `lambda_obs = 1000 nm`, `a_emit = 0.5`;
- `z = 6` → `lambda_obs = 3500 nm`, `a_emit = 1 / 7`.

The 500 nm line is generic. It is not a catalog object, atomic-line identification, real observation, or source claim.

## Redshift boundary

Astronomical redshift has more than one physical cause. This feature intentionally covers only cosmological redshift from large-scale expansion.

It does not model or infer:

- Doppler redshift from source/observer motion;
- gravitational redshift;
- peculiar velocity;
- recession velocity;
- distance;
- lookback time;
- age of the Universe at emission;
- cosmological parameters such as `H0`, matter density or dark-energy density;
- a real galaxy, quasar, star, transient or spectral line.

A large cosmological redshift must not be converted here into a special-relativistic recession speed. Doing so would introduce a different model and erase the feature's central distinction.

## Visual rule

The emitted ruler has a fixed base span. The observed ruler uses:

`observed screen span = emitted screen span × (1 + z)`

This is deliberately literal about the **ratio** and deliberately non-literal about physical space.

The stage therefore allows local horizontal overflow at high redshift. That convention break is confined to the instrument viewport and is keyboard-focusable. It is not a page-layout accident.

The ruler is not:

- a sky coordinate;
- a distance ruler;
- a map of expanding space;
- a timeline;
- a physical wavelength drawn to real-world scale;
- a claim that browser pixels are cosmological coordinates.

Exact numerical readouts remain authoritative.

## Runtime and privacy boundary

The feature is a same-origin local progressive enhancement.

Beyond loading its own local script and stylesheet assets, it adds no:

- data-service or external request;
- visitor text or numeric input;
- storage, cookies, history state, IndexedDB or persistence;
- timer, polling loop or animation frame;
- location access;
- analytics or telemetry;
- remote script, font, image, media or API;
- account, cloud state or runtime dependency.

Case selection exists only in JavaScript memory and resets on reload.

## Accessibility

- fixed cases use native buttons with `aria-pressed`;
- the exact ledger is a polite live region;
- the scrollable ruler viewport is keyboard-focusable and explicitly labeled;
- every visual stretch is duplicated by exact wavelength, redshift, stretch-factor and scale-factor text;
- horizontal overflow is local to the instrument and does not force page-level scrolling;
- controls retain 44px minimum targets;
- reduced-motion removes ruler-width transitions;
- increased contrast strengthens boundaries;
- mobile collapses the two-column instrument without changing the calculation;
- print removes interactive controls and disables transitions.

## Offline behavior

`redshift-ruler-core.js`, `redshift-ruler.js`, `redshift-ruler.css`, and this record are same-origin local assets and belong to the Museum's coherent offline shell.

## Source basis

The implementation uses documentation sources only; none are loaded by the visitor runtime.

Phenomenon and mechanism boundary:

- NASA Science, **What Is Cosmological Redshift?**: `https://science.nasa.gov/asset/webb/what-is-cosmological-redshift/`
- NASA Science, **Universe glossary — redshift (z)**: `https://science.nasa.gov/universe/glossary/`

Equation and scale-factor basis:

- NASA/IPAC Extragalactic Database, **Dark Energy and the Accelerating Universe — Basic Cosmology**: `https://ned.ipac.caltech.edu/level5/March08/Frieman/Frieman2.html`
- NASA/IPAC Extragalactic Database, **Cosmological Physics**: `https://ned.ipac.caltech.edu/level5/Peacock/Peacock3_1.html`

The NED material gives `1 + z = lambda_obs / lambda_emit = 1 / a_emit` when today's scale factor is normalized to one, and cautions against treating large cosmological redshift as a simple special-relativistic recession velocity.

## Rebuild rule

Keep the generic reference wavelength fixed at 500 nm and the three fixed redshifts at `0.1`, `1`, and `6` unless the product contract explicitly changes. Derive every displayed wavelength and scale factor from the exact redshift relations. Keep the visual ruler strictly downstream of those values. Preserve the explicit distinction between cosmological, Doppler and gravitational redshift. Never add a velocity, distance, lookback-time or age inference without a separately justified cosmological model and explicit product decision.
