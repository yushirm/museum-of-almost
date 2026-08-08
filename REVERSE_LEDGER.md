# The Reverse Ledger / Every Claim Owes a Source

## Design gate

Three directions were evaluated before implementation.

### Concept A — Provenance Matrix

A conventional matrix would list major Commons readouts beside their provider, transformation type, and dependencies.

It would be accurate and useful, but too administrative. COMMONS / NOW already contains enough panels; another table would explain the system without becoming a meaningful instrument.

### Concept B — The Double-Entry Evidence Ledger

Borrow bookkeeping. A displayed claim cannot appear as an unexplained number: it must be paired with explicit upstream accounts showing which normalization, local derivation, public source, fixed input, or local input it owes.

The metaphor is deliberately bounded. A complete ledger means the expected ancestry is explicit. It does not mean the claim is true, accurate, complete, representative, independently verified, or scientifically validated.

### Concept C — Read the Page Backwards

Break the usual top-down web-reading convention. Start from a finished claim and navigate backward through the transformations that produced it.

A missing current input terminates the reverse trace visibly instead of being replaced by a fallback or inferred substitute.

### Decision

Concept A was discarded as the least additive.

Concepts B and C were merged into **The Reverse Ledger / Every Claim Owes a Source**.

## Product contract

The Reverse Ledger answers one narrow question:

> What current inputs and Museum transformations does this displayed Commons claim depend on?

It does not attempt to prove the claim.

The visitor chooses from six fixed claims:

- earthquakes recorded in the past hour;
- current solar-wind speed;
- the thirteen-point temperature range;
- currently open natural-event count;
- the count of fixed points currently in daylight;
- the Exposure Plate’s approximate farthest tested grid-cell center.

There is no visitor free-text claim lookup.

## Account types

Every trace uses explicit account types:

- **DISPLAYED** — the current user-facing result;
- **DERIVED** — a local Museum calculation or aggregation;
- **NORMALIZED** — current public feed material reduced into the Museum’s internal shape;
- **SOURCE** — a current public scientific feed;
- **FIXED INPUT** — repository-baked constants such as the thirteen fixed coordinates or the 10° grid;
- **LOCAL INPUT** — a device-local current input such as the latch instant captured by the browser clock.

A claim may legitimately have no public feed at the end of one branch. For example, the daylight count is derived from the local latch instant plus fixed coordinates and solar geometry. The ledger must show that rather than pretending an astronomy service was consulted.

## Dependency entries

The interface renders each dependency as an **OWES TO** entry between two accounts.

Examples:

`DISPLAYED temperature range → OWES TO → DERIVED min/max aggregation`

`DERIVED min/max aggregation → OWES TO → NORMALIZED fixed-point temperatures`

`NORMALIZED fixed-point temperatures → OWES TO → SOURCE Open-Meteo response`

The Exposure Plate trace branches because its displayed result depends on both current normalized weather evidence and fixed local geometry.

## Complete and open traces

A trace is **TRACE COMPLETE** only when:

- the displayed value exists; and
- every expected upstream account for that fixed trace is present in the current latch.

A trace is **TRACE OPEN** when one or more expected current accounts are missing.

These labels describe dependency visibility only. They are not confidence scores, truth values, provider-health scores, quality grades, or scientific validation.

## Current-latch behavior

The ledger reads only the current in-memory `MuseumCommonsSnapshot` and existing local Commons cores.

Every new real `museum:commons-snapshot` event recomputes the selected trace from the new latch. The visitor’s selected fixed claim exists only in page memory and is not stored or transmitted.

Missing feeds stay missing. The ledger does not reuse the previous latch, substitute another provider, or infer unavailable measurements.

## Claim-specific boundaries

### Earthquake count

The trace ends at the existing USGS past-hour earthquake feed and the Museum’s earthquake normalization.

### Solar-wind speed

The trace ends at the existing NOAA SWPC solar-wind-speed product and the Museum’s normalized speed value.

### Temperature range

The trace makes the local min/max aggregation explicit and keeps the thirteen fixed coordinates visible as a separate fixed input. It does not imply continuous world coverage.

### Natural-event count

The trace ends at the existing NASA EONET open-events feed. Trace completeness does not mean EONET is a complete census of all natural events on Earth.

### Daylight count

The trace has no public astronomy source. It uses the current latch instant, the thirteen fixed coordinates, and the Museum’s existing approximate solar-elevation geometry.

### Exposure Plate farthest grid center

The trace reuses `MuseumExposurePlateCore.distanceField`, which itself reuses the established Commons great-circle distance geometry. It preserves the Exposure Plate contract: the farthest value is an approximate farthest tested 10° grid-cell center, not an exact continuous global maximum and not an uncertainty estimate.

## Runtime and privacy boundary

The Reverse Ledger adds **zero runtime requests**.

It uses no fetch, XHR, WebSocket, EventSource, beacon, polling, timers, storage, cookies, geolocation, account, visitor free-text input, analytics, telemetry, remote media, third-party script, or runtime dependency.

The instrument reads only current in-memory normalized state plus fixed same-origin JavaScript.

## Accessibility and offline behavior

- claim selectors are native buttons with `aria-pressed` state;
- the current trace state is duplicated in a polite live region;
- missing accounts are written explicitly rather than encoded by border treatment alone;
- account types and dependency directions are text, not color-only signals;
- controls retain a 44px minimum target height and visible keyboard focus;
- layouts collapse at 760px and 620px;
- reduced-motion, increased-contrast, and print environments have explicit handling;
- the interactive ledger is omitted from the native field-sheet print layout;
- all runtime assets are same-origin members of the coherent offline shell.

Offline or failed live sources never become invented ancestry. Without a current source, the relevant trace remains open.

## Rebuild rule

Keep the fixed claim list small and auditable. Every displayed dependency must correspond to actual current code paths or fixed local inputs. Never label trace completeness as truth, confidence, quality, verification, or representativeness. Never introduce a new runtime source merely to make the ledger appear more complete.
