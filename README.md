# The Museum of Almost

A dependency-free, offline-first browser experiment governed by a law that becomes coherent only while it remains partly broken.

The current experience is one touchable timeline. The browser continuously tries to repair its own misregistration; the visitor acts as an obstacle by repairing points incorrectly. The timeline develops seasons, inactivity pushes it toward excessive exactness, delayed corrections return elsewhere, and exactly one visitor repair may be remembered between visits.

## What is inside

- One whole-site timeline with no destination navigation or feature launchers.
- Pointer and keyboard interaction on the same continuous surface.
- Seasonal behavior that changes how incorrect repair works.
- A duplicate timeline with one mechanically significant disagreement.
- Delayed consequences that return at a different term.
- Inactivity-driven self-correction.
- Exactly one remembered visitor action.
- Misregistered print and botanical growth structure expressed with typography and geometry only.
- No images, canvas, icons, framework, package install, build step, account, analytics, tracking, visitor text, or external runtime dependency.
- Optional browser-synthesised sound, visible reset, reduced-motion support, and offline service-worker behavior.

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

The checks cover deterministic entropy replay and rerolls, state migration, seasonal changes, incorrect repair, delayed consequences, duplicate-state behavior, return visits, one-action memory, inactivity, privacy boundaries, local-only runtime behavior, accessibility structure, image prohibition, old-fixation vocabulary removal, and service-worker cache cleanup.

## Entropy records

- `ENTROPY_LOG.md` records the inspected creative basin, seed selections, rerolls, mutation thesis, migration strategy, authored irregularities, and adversarial audit.
- `ENTROPY_HISTORY.md` records each reproducible execution without personal or repository identity data.

## Privacy boundary

The application stores one bounded local JSON value containing a random install seed, season and action counters, eight fictional misregistration values, up to three delayed corrections, exactly one remembered visitor repair, and a small numeric migration bias. It stores no visitor text, pointer paths, timestamps, names, locations, contact details, or behavioral profile.

The public host may process ordinary connection information under its own terms. The application adds no analytics or tracking.

See `PRIVACY.md` for the full boundary.

## Public availability and copyright

This repository is publicly viewable for transparency and to support the hosted website. Public visibility does not make it an open-source project.

No open-source licence is granted. All rights are reserved except where applicable law or platform terms provide otherwise. See `RIGHTS.md`.

External contributions are not accepted unless explicitly invited. See `CONTRIBUTING.md`.
