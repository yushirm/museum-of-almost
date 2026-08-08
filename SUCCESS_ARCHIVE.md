# Success Archive

This file records completed feature heads only after the repository’s required `check` job has passed. It is an implementation archive, not a visitor log, analytics record, personal history, or runtime data store.

Entries should contain only public repository evidence and generic product information.

## 2026-08-08 — COMMONS / NOW — The Witness Seal

Feature:

**The Witness Seal / One Now, Attested**

Design outcome:

- Concept A, **Snapshot Receipt**, supplied the conventional provenance structure.
- Concept B, **The Witness Seal**, supplied the museum-accession and evidence-seal mechanic.
- Concept C, **The Page Has No Stable URL**, was discarded because URL history would introduce unintended persistence and weaken the no-history contract.
- Concepts A and B were merged.

Feature-complete evidence head:

`e913246cd3e9a633319780b5a5eb23bc84ecebe5`

Pull request:

`#50 — Add the Witness Seal`

Required-check evidence:

- workflow: `Check museum`;
- required job: `check`;
- run: `119`;
- conclusion: `success`.

What succeeded:

- deterministic canonicalization of the normalized five-feed latch;
- SHA-256 equivalence with Node’s reference implementation;
- missing values preserved as missing rather than coerced to zero or epoch time;
- stale asynchronous digest results rejected after a newer latch;
- zero additional runtime requests;
- no storage, cookies, location access, analytics, telemetry, visitor text, remote media, or runtime dependency;
- local field-sheet witness code and full digest;
- responsive, reduced-motion, increased-contrast, and print handling;
- coherent same-origin offline-shell upgrade.

Final-merge rule:

This archive entry is added after the feature-complete head passed. Because adding the archive changes the branch head, the archive-bearing final head must pass the same required `check` job again before merge.
