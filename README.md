# The Museum of Almost

A dependency-free, offline-first browser experiment currently behaving as a translation system for things that do not have language.

The current experience is one self-translating weave. The visitor begins a measure and then waits while the same fibres acquire a new meaning. An effect must become visible before interference is accepted; doing nothing is also a valid action. Every settled measure creates a contradiction, and exactly one contradiction may survive between visits.

## What is inside

- One repeated woven structure whose meaning changes each measure.
- Waiting as the dominant interaction instead of target selection or correction.
- A broad interaction surface that ignores pointer coordinates and does not require precise pointing.
- Effects that appear before any interference becomes mechanically available.
- Exactly one retained contradiction; no action history or durable interaction counts.
- A tiny procedural ecosystem whose fictional motion influences translation without becoming a separate feature.
- Rhythm expressed through timed state changes and optional local WebAudio.
- Woven-fibre and temporary-construction-marking material language built only from local HTML and CSS.
- No framework, package install, build step, account, analytics, tracking, visitor text, or external runtime dependency.
- Visible local reset, reduced-motion support, keyboard access, high-contrast support, responsive layout, and offline service-worker behavior.

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

The checks cover deterministic entropy replay, v3 state sanitisation and migration, contradiction-only persistence, imprecise interaction, delayed action availability, local-only runtime behavior, privacy boundaries, responsive accessibility hooks, anti-convergence vocabulary, and service-worker cache cleanup.

## Entropy records

- `ENTROPY_LOG.md` records the inspected creative basin, reproducible seed, selections, dynamic exile, mutation thesis, state migration, authored irregularities, and adversarial audit.
- `ENTROPY_HISTORY.md` records each execution without personal or repository identity data.

## Privacy boundary

The application stores one bounded local JSON value containing a random install seed and exactly one fictional contradiction. It stores no visitor text, pointer coordinates, action history, timestamps, names, locations, contact details, routines, or behavioural profile.

The public host may process ordinary connection information under its own terms. The application adds no analytics or tracking.

See `PRIVACY.md` for the full boundary.

## Public availability and copyright

This repository is publicly viewable for transparency and to support the hosted website. Public visibility does not make it an open-source project.

No open-source licence is granted. All rights are reserved except where applicable law or platform terms provide otherwise. See `RIGHTS.md`.

External contributions are not accepted unless explicitly invited. See `CONTRIBUTING.md`.
