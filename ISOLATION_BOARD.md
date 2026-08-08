# The Isolation Board / What Survives a Lost Feed

## Design gate

Three directions were evaluated before implementation.

### Concept A — The Dependency Diagram

A conventional live dependency map would list the five current feeds, show their availability, and state which Commons instruments depend on each feed.

It would be useful architecture documentation, but as a standalone feature it would mostly explain the application rather than create a new way to understand it.

### Concept B — The Isolation Board

Borrow fault-isolation panels from spacecraft, ships, and industrial electrical systems. Give each of the five already-latched feed channels a breaker. Tripping a breaker creates a local hypothetical outage and shows which Commons claims would still have evidence beneath them.

The mechanic makes graceful failure tangible without introducing a second data path.

### Concept C — Deliberate Degradation

Break a normal web convention: instead of always trying to reveal more information, deliberately allow the visitor to make a parallel view know less. The useful question is not “what else can the page show?” but:

> What can this page still honestly say after evidence disappears?

The dangerous version would hide or mutate the primary live display itself. That would undermine accessibility, current-snapshot trust, and field-sheet evidence.

### Decision

Concept A was discarded as the least additive because the Faultline Core and repository records already expose much of the dependency structure.

Concepts B and C were merged into **The Isolation Board / What Survives a Lost Feed**.

## Product contract

The Isolation Board is a failure simulation layered beside the actual latched snapshot.

It has exactly five breakers matching the existing five-feed acquisition barrier:

1. USGS / EARTH;
2. NOAA / FLOW;
3. NOAA / SCALES;
4. Open-Meteo / WEATHER;
5. NASA / EVENTS.

A breaker can be tripped only when that feed is actually available in the current latch. If a provider feed is already unavailable, the breaker is disabled and labeled **ACTUALLY UNAVAILABLE**.

Tripping a live breaker does not:

- cancel a request;
- start another request;
- alter `MuseumCommonsSnapshot`;
- modify any primary live measurement;
- change source timestamp observations;
- change the Faultline Core;
- recompute the Witness Seal;
- persist anything.

It changes only the hypothetical circuit evaluation inside the Isolation Board.

## Circuit states

The board declares a small dependency model for existing Commons instruments.

### POWERED

Every declared dependency required for the circuit remains live on the simulated bus.

### DEGRADED

A multi-feed instrument that is designed to remain meaningful with only a subset of its dependencies still has at least one live dependency.

This applies to the Cosmic Signal Chain, the Sounding Well, and the Faultline Core.

“Degraded” is not a quality or confidence score. It means only that the instrument’s declared dependency set is partially available.

### DARK

No required evidence remains for the declared circuit under the actual-plus-simulated availability state.

Single-feed circuits go directly from POWERED to DARK when their one feed is unavailable or deliberately isolated.

### LOCAL

The Celestial Escapement and Planetary Heliodon are derived from the already-captured latch time and fixed local constants/geometry. Once a real latch exists, a hypothetical loss of live feeds does not remove that captured instant.

### SEALED

The Witness Seal deliberately remains tied to the actual normalized latch. It is never recalculated from the hypothetical blackout.

This distinction is essential: the seal is evidence of what really latched, while the Isolation Board is a counterfactual about what would remain if evidence were removed.

## Refresh semantics

Every real `museum:commons-snapshot` event clears all visitor-tripped breakers before the board renders the new actual availability state.

A refresh therefore cannot inherit an old hypothetical outage and silently present it as the new current condition.

## Runtime and privacy boundary

The feature adds no network request.

It reads only `MuseumCommonsSnapshot`, the existing `museum:commons-snapshot` event, and fixed local feed/circuit dependency declarations.

It does not use fetch, XHR, WebSocket, EventSource, sendBeacon, timers, polling, storage, cookies, browser geolocation, visitor free-text input, analytics, telemetry, accounts, remote media, external scripts, or runtime dependencies.

Breaker choices exist only in JavaScript memory and reset on each real snapshot event or page reload.

## Accessibility and print

- breakers and reset control are native buttons;
- `aria-pressed` exposes simulated trip state;
- actually unavailable feeds are disabled and described explicitly;
- the simulation summary is an `aria-live="polite"` status;
- state is always written as text, not color alone;
- layouts collapse below 760 px and 620 px;
- reduced-motion and increased-contrast environments have explicit handling;
- the entire hypothetical board is omitted from print so it cannot contaminate the actual Planetary Field Sheet.

## Offline behavior

`isolation-board-core.js`, `isolation-board.js`, `isolation-board.css`, and this record are same-origin local assets and belong to the coherent service-worker shell.

Offline or failed live channels remain **ACTUALLY UNAVAILABLE**. The board never invents feed availability merely because its own interface is cached.

## Rebuild rule

Start only from the current `MuseumCommonsSnapshot.feeds` availability flags. Keep actual unavailability distinct from visitor-tripped simulation. Evaluate only fixed local dependency declarations. Never mutate the real snapshot, never alter the Witness Seal, never hide the actual live page as if a simulation were real, never persist breaker state, and clear every hypothetical trip when a new real latch arrives.
