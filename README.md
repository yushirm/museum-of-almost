# The Museum of Almost

A dependency-free, offline-first browser experience about maintaining an unstable rule.

The site is one continuous living weave. Six procedural unfinished ideas appear as connected wax-seal knots. The visitor contradicts the current rule by binding what must remain separate or loosening what must remain joined. Each action changes several relationships immediately and returns later as a different consequence. Repetition changes meaning rather than increasing a score.

## What is inside

- One shared responsive surface with no destination navigation.
- Deterministic procedural knot labels and seeded behavior.
- Pointer, touch, and keyboard operation through large native controls.
- Delayed consequences that affect related knots.
- Inactivity behavior that changes tension and anticipation.
- One minimal fictional memory retained between visits.
- Safe compression and removal of obsolete local state.
- Optional browser-synthesised sound with an explicit control.
- Reduced-motion support and visible keyboard focus.
- A same-origin service worker for offline use.
- No framework, package install, build step, account, analytics, tracking, visitor text, or external runtime dependency.

## Run it

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

A local server is recommended because browsers restrict service workers when a page is opened directly from the filesystem.

## Validate it

```bash
node --check app.js
node --check entropy-core.js
node --check service-worker.js
node --check scripts/entropy-select.mjs
node --check scripts/test-entropy.mjs
node --check scripts/test-service-worker.mjs
node --check scripts/check.mjs
node scripts/test-entropy.mjs
node scripts/test-service-worker.mjs
node scripts/check.mjs
```

The checks cover deterministic entropy replay, state migration, delayed consequences, return visits, inactivity, repetition differences, seeded memory, privacy boundaries, local-only runtime behavior, accessibility structure, obsolete navigation removal, and service-worker cache cleanup.

## Entropy records

- [ENTROPY_LOG.md](ENTROPY_LOG.md) documents the inspected creative basin, seed selections, mutation thesis, migration, and adversarial audit.
- [ENTROPY_HISTORY.md](ENTROPY_HISTORY.md) records each reproducible execution without personal or repository identity data.

## Privacy boundary

The application stores only bounded fictional state: a random local install seed, numeric tension, counters, a small delayed-consequence queue, one seeded fictional accident, and a compressed numeric trace of obsolete state. It does not store visitor text, pointer paths, timestamps, names, identifiers, or behavioral profiles.

On the GitHub Pages site, GitHub provides public hosting and may process technical connection information under its own privacy terms.

See [PRIVACY.md](PRIVACY.md) for the full boundary.

## Public availability and copyright

This repository is publicly viewable for transparency and to support the hosted website. Public visibility does not make it an open-source project.

No open-source licence is granted. All rights are reserved except where applicable law or GitHub's Terms of Service provide otherwise. See [RIGHTS.md](RIGHTS.md).

External contributions are not accepted unless explicitly invited. See [CONTRIBUTING.md](CONTRIBUTING.md).
