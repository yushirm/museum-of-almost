# The Museum of Almost

A dependency-free, offline-first browser experiment currently behaving as an agreement between impossible forces.

The current experience is one continuous treaty line carrying two forces in opposite directions. The visitor acts as a counterweight by suspending the line at any point. A suspension is a deliberate error: exactly one error creates temporary order, while perfect symmetry or too many errors destabilise the agreement. An erasure attempt removes an active mark but preserves that mark as the only durable fictional memory. The first erasure in a local installation also causes one field reversal that cannot repeat until local state is reset.

## What is inside

- One continuous, touchable timeline rather than destinations, layers, named slots, or feature launchers.
- Two opposing forces whose apparent scale changes as the visitor acts as counterweight.
- Hold-to-suspend pointer interaction with duration-sensitive suspension weight.
- Keyboard parity: arrows move the counterweight, Space can be held, Enter creates a fixed suspension, and Delete attempts erasure.
- Exactly-one-error treaty logic with qualitative feedback and no score, percentage, level, or progress bar.
- Attempted erasure as the only persistent fictional memory; active suspensions disappear on return.
- One field reversal that can occur only once per local installation unless the visitor explicitly resets local state.
- A deterministic measurement with a deliberately unresolved unit.
- Magnetic-field geometry and temporary construction markings generated entirely with local HTML and CSS.
- Scale as a semantic feedback channel: both forces and the field change apparent size as treaty conditions change.
- Optional local WebAudio whose pitch reflects suspension position and weight.
- Live cross-tab refresh of the erased-memory ghost without storing or transmitting interaction history.
- Reduced-motion support, high-contrast support, keyboard access, mobile scrolling, responsive layout, and offline service-worker behavior.
- No framework, package install, build step, account, analytics, tracking, visitor text, remote AI, or external runtime dependency.

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

The checks cover deterministic entropy-history replay, the Execution 5 seed, bounded v5 persistence, legacy migration, continuous counterweight movement, duration-sensitive suspension, exactly-one-error treaty logic, attempted-erasure memory, the once-per-installation event, unresolved measurement, scale feedback, pointer-data privacy, responsive accessibility hooks, local-only runtime behavior, and service-worker cache cleanup.

## Entropy records

- `ENTROPY_LOG.md` records the inspected creative basin, reproducible seed, selections, dynamic exile, mutation thesis, state migration, authored irregularities, and adversarial audit.
- `ENTROPY_HISTORY.md` records each execution without personal or repository identity data.

## Privacy boundary

The application stores one bounded local JSON value containing a random install seed and, optionally, the last fictional suspension the visitor attempted to erase. That ghost contains only a bounded position integer and bounded weight integer. Active suspensions, pointer coordinates, hold durations, animation phases, action histories, semantic labels, timestamps, and visitor text are not stored.

The public host may process ordinary connection information under its own terms. The application adds no analytics or tracking.

See `PRIVACY.md` for the full boundary.

## Public availability and copyright

This repository is publicly viewable for transparency and to support the hosted website. Public visibility does not make it an open-source project.

No open-source licence is granted. All rights are reserved except where applicable law or platform terms provide otherwise. See `RIGHTS.md`.

External contributions are not accepted unless explicitly invited. See `CONTRIBUTING.md`.
