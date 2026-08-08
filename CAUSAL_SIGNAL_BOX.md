# The Causal Signal Box / The Button Cannot Reach Everything

## Design gate

Three directions were evaluated before implementation.

### Concept A — The Light-Cone Atlas

A conventional next instrument would draw a Minkowski-style light-cone diagram and classify fixed event pairs as timelike, lightlike, or spacelike.

That is scientifically natural after the Frame Shifter, but it would repeat much of Instrument 06's existing coordinate-time stage and causal-class readout.

### Concept B — The Causal Signal Box

Borrow railway interlocking. A fixed set of spacetime stations becomes a signal box. A route can clear only when every segment can be traversed by a future-directed signal moving at or below light speed.

The metaphor is deliberately limited. Cosmic signals do not travel on tracks; the interlocking is only a way to make a hard routing constraint tangible.

### Concept C — The Button Cannot Reach Everything

Break a normal web convention: a click usually has effectively unlimited reach over the document. In this instrument, dispatch is allowed to update only the causally reachable prefix of the selected route. A spacelike or past target refuses the update and immediately explains the refusal in text.

The useful violation is not delay theatre. It is the refusal to let the interface imply action at a distance.

### Decision

Concept A was discarded as the least additive because the Frame Shifter already provides a spacetime stage, transformed coordinates, and causal classification.

Concepts B and C were merged into **The Causal Signal Box / The Button Cannot Reach Everything**.

## Product contract

The signal box uses a one-dimensional idealized spacetime with seconds for time and light-seconds for distance, so `c = 1`.

Each station is a fixed event with coordinate `(x, t)`. Every route begins at `ORIGIN = (0, 0)` and names one or more later or earlier fixed events.

For a route segment from event A to event B:

- `Δt = tB - tA`
- `Δx = xB - xA`
- spatial separation is `|Δx|`

The local interlock classifies the segment as:

- **CLEAR** when `Δt > |Δx|`: future-directed timelike separation;
- **LIGHT-SPEED EDGE** when `Δt = |Δx|`: future-directed lightlike separation;
- **LOCKED OUTSIDE CONE** when `0 <= Δt < |Δx|`: spacelike separation;
- **LOCKED IN THE PAST** when `Δt < 0`.

Only CLEAR and LIGHT-SPEED EDGE segments are reachable.

## Fixed routes

The feature contains four fixed generic routes.

### Light edge

`ORIGIN (0, 0) → EDGE (2, 2)`

The one segment is lightlike. The dispatch reaches EDGE exactly on the future light-cone boundary.

### Relay chain

`ORIGIN (0, 0) → RELAY (-1, 2) → DEEP (2, 6)`

Both segments are timelike. The dispatch reaches RELAY and then DEEP.

### Impossible shortcut

`ORIGIN (0, 0) → RELAY (-1, 2) → FAR (4, 4)`

ORIGIN → RELAY is timelike and may update RELAY. RELAY → FAR has `Δt = 2 s` and `|Δx| = 5 light-s`, so FAR is spacelike-separated from the relay event. Dispatch therefore stops after RELAY. FAR remains visibly unchanged and is labeled REFUSED.

This is the central convention-breaking case: one click updates a causally reachable prefix rather than every intended target.

### Past call

`ORIGIN (0, 0) → BEFORE (-2, -1)`

The destination event is earlier than the dispatch event, so the route is locked in the past and BEFORE remains unchanged.

## Important scope

This is a causal-structure instrument, not a communication simulator.

The station coordinates and routes are fictional teaching geometry. The feature does not model radio hardware, signal strength, energy, bandwidth, propagation through matter, gravitational curvature, expanding-universe distances, quantum effects, or real astronomical objects.

The screen update happens immediately because JavaScript execution is not being slowed to a physical light-travel time. The physical rule is represented by **which targets are permitted to change**, not by artificial waiting.

The stage is a schematic. Exact coordinate values and segment readouts are authoritative.

## Runtime and privacy boundary

The feature is entirely local.

It adds no:

- runtime network request;
- visitor free-text or numeric input;
- storage, cookies, history state, or persistence;
- timer, polling loop, or animation frame;
- location access;
- analytics or telemetry;
- remote script, font, media, or API;
- account, cloud state, or dependency.

Route selection and dispatch state exist only in JavaScript memory and reset on route change or page reload.

## Accessibility

- route selection and dispatch use native buttons;
- route buttons expose `aria-pressed`;
- the result is a polite live region;
- every station state is written in text;
- every route segment is listed textually with `Δt`, `|Δx|`, and its interlock state;
- refused dispatches always produce immediate textual feedback;
- no scientific meaning depends on animation, color, or spatial placement;
- controls retain 44px minimum targets;
- reduced-motion removes station transitions;
- increased-contrast and mobile layouts have explicit handling;
- print removes interactive controls while retaining the fixed explanatory geometry.

## Offline behavior

`causal-signal-core.js`, `causal-signal.js`, `causal-signal.css`, and this record are same-origin local assets and belong to the Museum's coherent offline shell.

The feature makes no external request when online or offline.

## Rebuild rule

Keep the station and route declarations fixed and generic. Classify each segment only from its two event coordinates. A dispatch may update route stations only until the first unreachable segment. Never use artificial timers to imitate light travel, never persist dispatch history, never accept visitor coordinates, and never turn the schematic stage position into a second physics calculation.
