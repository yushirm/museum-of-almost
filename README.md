# The Museum of Almost

A dependency-free, offline-first browser experiment currently behaving as an organism made from several simultaneous unfinished realities.

The current experience is three translucent membrane-states occupying one interface. The visitor is treated as a boundary: dragging, tapping, or using arrow keys can only separate the layers. Visitor activity changes geometry immediately but does not advance the organism's internal generation. A quiet interval advances time, partially re-folds the geometry, changes what the preserved shapes mean, reveals additional annotations, and issues a warning after the reinterpretation has already happened.

## What is inside

- Three simultaneous realities sharing one interface rather than destinations or sequential states.
- Separation as the primary verb; visitor input can pull layers apart but cannot merge them.
- Time that advances only after inactivity, with hidden-tab time ignored.
- Preserved geometry whose semantic labels change between visits and silent generations.
- Geometric transformation expressed through overlapping translucent membranes and woven-map contour marks.
- A deliberately late warning coupled to the same silent state transition that changes meaning.
- Transient drag coordinates used only to classify one gesture direction; they are never stored.
- Optional local WebAudio for separation only, so silence remains mechanically informative.
- No images, framework, package install, build step, account, analytics, tracking, visitor text, or external runtime dependency.
- Visible local reset, reduced-motion support, keyboard access, high-contrast support, mobile scrolling, responsive layout, and offline service-worker behavior.

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

The checks cover deterministic entropy replay and rerolls, v4 state sanitisation and migration, geometry persistence with semantic reinterpretation, silence-only generation changes, late-warning behavior, no-image enforcement, local-only runtime behavior, privacy boundaries, responsive accessibility hooks, anti-convergence vocabulary, and service-worker cache cleanup.

## Entropy records

- `ENTROPY_LOG.md` records the inspected creative basin, reproducible seed, selections, rerolls, dynamic exile, mutation thesis, state migration, authored irregularities, and adversarial audit.
- `ENTROPY_HISTORY.md` records each execution without personal or repository identity data.

## Privacy boundary

The application stores one bounded local JSON value containing a random install seed, a bounded visit counter, and four bounded geometry integers. Semantic labels are generated rather than stored. It stores no visitor text, pointer coordinates, pointer paths, action history, timestamps, names, locations, contact details, routines, or behavioural profile.

The public host may process ordinary connection information under its own terms. The application adds no analytics or tracking.

See `PRIVACY.md` for the full boundary.

## Public availability and copyright

This repository is publicly viewable for transparency and to support the hosted website. Public visibility does not make it an open-source project.

No open-source licence is granted. All rights are reserved except where applicable law or platform terms provide otherwise. See `RIGHTS.md`.

External contributions are not accepted unless explicitly invited. See `CONTRIBUTING.md`.
