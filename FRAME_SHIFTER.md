# The Frame Shifter / No Universal Now

This record documents the sixth instrument in **Deep Space / Almost**.

## Pre-code concept gate

### Concept A — The Relativity Desk

The conventional next step was a special-relativity explorer: choose a fixed event pair and an inertial frame, then show the Lorentz-transformed time separation, space separation, invariant interval, and causal class.

This adds a genuinely new idea to the gallery. Light travel time already makes distance temporal, but it does not show that distant simultaneity itself depends on the chosen inertial frame.

### Concept B — The Registration Press

Borrow multicolour print registration. Two distant events become registration marks on separate plates. A frame change shears the plates out of alignment while an invariant mark remains fixed.

The metaphor is memorable, but it risks making relativity sound like a mechanical alignment defect rather than a coordinate transformation.

### Concept C — The Page Refuses a Universal Row

Break a normal web-layout convention: related items are usually kept neatly aligned. Here, changing inertial frame deliberately pulls two event cards out of the same horizontal row. For a spacelike-separated pair, their visual order can reverse.

The layout change is useful only if it is mathematically bound to the transformed coordinate-time separation and is duplicated in text. A purely decorative drift would be misleading and inaccessible.

### Decision

**Concept B was discarded.** Concepts A and C were merged into **The Frame Shifter / No Universal Now**.

## Physics contract

The instrument works entirely with coordinate differences between two idealized events in one spatial dimension.

Distance is measured in **light-seconds** and time in **seconds**, so the speed of light is `c = 1` in the displayed equations.

For a frame moving at dimensionless speed `beta = v/c`, with `|beta| < 1`:

`gamma = 1 / sqrt(1 - beta²)`

The event separation transforms as:

`Δt′ = gamma (Δt - beta Δx)`

`Δx′ = gamma (Δx - beta Δt)`

The instrument also computes:

`I = Δx² - Δt²`

The transformed coordinates may change, but `I` must remain the same apart from floating-point roundoff.

The sign of `I` defines the displayed causal class:

- `I > 0` — **spacelike**;
- `I = 0` — **lightlike**;
- `I < 0` — **timelike**.

The interface never turns this classification into a probability, confidence score, or statement about experimental uncertainty.

## Fixed scenarios

### Distant flashes

- `Δt = 0 s`
- `Δx = 4 light-s`
- spacelike

The flashes are simultaneous in the gallery frame. In the `+0.6c` frame, B precedes A by `3 s`; in the `−0.6c` frame, A precedes B by `3 s`. The order reversal is allowed because no light-speed-or-slower signal can connect the two events.

### Light pulse

- `Δt = 3 s`
- `Δx = 3 light-s`
- lightlike

Emission remains before reception for every displayed subluminal frame, and the invariant remains zero.

### Timelike exchange

- `Δt = 5 s`
- `Δx = 2 light-s`
- timelike

Beacon remains before reply for every displayed frame. The exact coordinate separations change, but the causal order does not.

## Frame controls

The visitor chooses from five fixed inertial frames:

- `−0.8c`;
- `−0.6c`;
- `0c`;
- `+0.6c`;
- `+0.8c`.

There is deliberately no continuous slider, visitor-entered velocity, timer, animation loop, or hidden state.

## Layout contract

Event A stays on the stage's reference-time row. Event B moves vertically according to the transformed `Δt′` for the selected scenario and frame.

The visual displacement is normalized only for legibility inside the finite stage. It is **not** a second physical scale and is never used for calculation. The numeric `Δt′` readout is authoritative.

The stage labels time as earlier at the top and later at the bottom. A horizontal line through Event A means only **the same coordinate time as Event A in the selected frame**. It is not a universal present and it is not a claim about cosmological time.

## Runtime and privacy contract

- No runtime network request or remote asset.
- No visitor free-text, account, identity, location, analytics, telemetry or tracking.
- No `localStorage`, `sessionStorage`, IndexedDB, cookies, URL-state, or click-history persistence.
- No polling, timer loop, animation loop, WebSocket, beacon, or external dependency.
- Scenario and frame choices exist only in page memory and reset on reload.
- All calculations use fixed local scenario values and pure JavaScript math.

## Accessibility and reduced motion

- scenario and frame choices are native buttons with `aria-pressed`;
- changing numerical and causal results are exposed in text inside a polite live region;
- the event-order sentence repeats the visual result explicitly;
- causal class is written as text and not encoded by color alone;
- targets retain a 44px minimum height;
- layouts collapse for narrow screens;
- `prefers-reduced-motion` removes the event-card transition while preserving the final position;
- `prefers-contrast` and print receive explicit styles;
- the initial `0c` distant-flashes state is meaningful static HTML even if JavaScript is unavailable.

## Offline behavior

`frame-shifter-core.js`, `frame-shifter.js`, `frame-shifter.css`, and this record are same-origin local assets in the coherent service-worker shell.

## Rebuild rule

Keep the event scenarios fixed and generic. Transform only coordinate differences with the one-dimensional Lorentz transform above. Preserve the interval to floating-point tolerance. Never allow a spacelike order flip to masquerade as causation, never allow a timelike or lightlike order flip, never derive physics from the normalized visual offset, and never introduce visitor-entered values or persistent frame state without a separate product decision.
