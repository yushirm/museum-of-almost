# The Witness Seal / One Now, Attested

## Design gate

Three directions were evaluated before implementation.

### Concept A — Snapshot Receipt

A conventional provenance receipt would record the latch time, current channel availability, normalized values, and a deterministic identifier for the visible snapshot.

Useful, but on its own it would read like administrative metadata rather than an instrument.

### Concept B — The Witness Seal

Borrow museum accessioning and forensic evidence seals. Give each committed snapshot an ephemeral local seal derived from the exact normalized public state that COMMONS / NOW claims to show.

The useful contradiction is deliberate: a museum normally assigns accession marks to objects it intends to keep. COMMONS / NOW keeps no snapshot history, so the mark survives only if the visitor preserves the native field sheet or otherwise records it outside the application.

### Concept C — The Page Has No Stable URL

Rewrite the page URL fragment after every refresh so browser history becomes an implicit snapshot archive.

This was discarded. It would turn navigation history into unintended persistence, make reload semantics harder to explain, and weaken the application’s no-history contract.

### Decision

Concept C was discarded. Concepts A and B were merged into **The Witness Seal / One Now, Attested**.

## Product contract

The Witness Seal answers a narrow question:

> Do these displayed measurements belong to the same normalized latch?

After the existing five-feed `Promise.allSettled` barrier commits, the feature builds one canonical local receipt from the normalized snapshot already held in page memory. The receipt contains:

- the UTC latch time;
- five feed-availability flags;
- the normalized earthquake summary;
- the normalized solar-wind state;
- the current normalized NOAA G and S scale values;
- the normalized thirteen-point weather values and summary;
- the normalized current EONET aggregate count and category summary.

It deliberately does **not** hash raw provider payloads. The seal identifies the Museum’s normalized current presentation, not unseen upstream response bytes.

The canonical receipt is serialized with stable object-key ordering and hashed locally with browser Web Crypto SHA-256. The visible accession code is the first sixteen hexadecimal digest characters formatted as `NOW-XXXX-XXXX-XXXX-XXXX`; the full 64-character digest remains visible beside it.

## What the seal does not mean

The seal is not:

- a provider signature;
- proof that a provider response was authentic;
- a freshness or latency score;
- a scientific confidence score;
- evidence that unlike feed timestamps mean the same thing;
- a permanent Museum accession record.

Matching seals mean only that the Museum canonicalized the same displayed public snapshot under the same `commons-witness-v1` schema.

## Runtime and privacy boundary

The feature adds no network request.

It reads only:

- `MuseumCommonsSnapshot` and the existing `museum:commons-snapshot` event;
- the already-loaded local NOAA scale normalizer;
- the browser’s local `crypto.subtle.digest` implementation.

It does not use fetch, XHR, WebSocket, EventSource, sendBeacon, timers, polling, storage, cookies, browser geolocation, visitor free-text input, analytics, telemetry, accounts, remote media, external scripts, or runtime dependencies.

The digest and canonical receipt live only in page memory. Refreshing replaces them. Reloading or closing the page discards them.

## Field sheet

The native Planetary Field Sheet receives the short witness code and full SHA-256 digest. Printing remains entirely browser-native through the existing `window.print()` path. The Museum does not create, upload, store, or receive a PDF or print artifact.

## Failure behavior

If there is no committed snapshot, the seal remains waiting.

If Web Crypto is unavailable or hashing fails, the feature says **SEAL UNAVAILABLE**. It never substitutes a weaker checksum and never invents a digest.

If one or more live feeds fail, their absence is part of the canonical receipt. A degraded latch may therefore still have a valid witness seal; the seal attests identity, not completeness or quality.

## Accessibility and offline behavior

The instrument is text-first, has a polite live-status sentence, preserves explicit full-digest text, collapses below 760 px and 620 px, and includes reduced-motion, increased-contrast, and print handling.

`witness-seal-core.js`, `witness-seal.js`, `witness-seal.css`, and this record are same-origin local assets and belong to the coherent offline shell. Web Crypto computation itself is local and makes no request.

## Rebuild rule

Canonicalize only the normalized public state the page actually presents. Preserve `null` and failed-channel state. Serialize deterministically. Hash locally with SHA-256. Never silently downgrade to a non-cryptographic checksum. Never persist the receipt or digest in application storage, URL state, cookies, or navigation history.
