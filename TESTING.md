# Test Engineering

The Museum uses dependency-free Node checks. Tests protect visitor-visible behavior, privacy, offline operation and the room contracts without turning every feature into a new test harness.

## Architecture

The suite has four responsibilities:

1. **Domain behavior** — pure/core logic belongs in the closest existing `scripts/test-*.mjs` file for that module or feature.
2. **Room integration** — room-level wiring, authored surfaces and lifecycle behavior belong in the existing room test such as `test-web1.mjs`, `test-page-four.mjs`, `test-elsewhere.mjs`, `test-deep-space.mjs`, or the Commons integration tests.
3. **Cross-cutting contracts** — privacy, approved network boundaries, required files, global accessibility expectations, workflow integrity and repository-wide invariants belong in `scripts/check.mjs` or reusable assertions from `scripts/test-support.mjs`. Do not copy their regular expressions into each feature test.
4. **Offline behavior** — service-worker behavior belongs in `scripts/test-service-worker.mjs`; a feature test may assert only that its own required assets are cached by using `assertOfflineAssets`.

`node scripts/run-tests.mjs` discovers all `scripts/test-*.mjs` files, runs them in isolated Node processes with bounded parallelism, then runs `scripts/check.mjs`. This keeps test state isolated while avoiding a hand-maintained workflow command list.

## Before adding a test

Use this order:

1. Identify the behavior that could regress.
2. Find the existing test that owns that behavior.
3. **Extend or refactor that test by default.** A new production feature does not automatically deserve a new test file.
4. If the assertion is a repeated cross-cutting rule, add or reuse a helper in `test-support.mjs` instead of repeating the rule.
5. Create a new test file only when the code has an independent behavioral boundary that benefits from isolated failure reporting, usually a new pure/core module or a materially separate subsystem.
6. If a feature is pruned, merged or replaced, prune or merge its tests in the same PR. Historical tests remain only when they still protect a live compatibility, loader, cache or data-contract boundary.

A new test file should be rarer than a new feature. If two existing files now test one coherent subsystem, consolidate them instead of adding a third.

## Reuse rule

When substantially the same setup or assertion appears in three places, refactor it before adding a fourth copy. Prefer small composable helpers over one opaque mega-helper.

Reusable examples already provided by `test-support.mjs` include:

- repository file loading and existence checks;
- positive and negative pattern assertions;
- local-only runtime boundaries;
- no-network, no visitor-state, no timer and no-tracking checks;
- local CSS/accessibility environment checks;
- offline cache membership checks.

Feature tests should still contain the assertions that explain **what makes that feature correct**. Helpers are for policy and setup, not for hiding domain behavior.

## Test design rules

Tests must be deterministic and local. Do not use live network calls, sleeps, polling, random values without a fixed seed, current wall-clock expectations, visitor data or external services. Use fixed timestamps and explicit fixtures.

Prefer semantic assertions over implementation trivia. Test observable contracts, calculations, state transitions, accessibility semantics and integration boundaries. Avoid large snapshots and assertions whose only purpose is to freeze formatting.

Keep failure messages specific. A failing assertion should make the broken contract obvious without opening several files.

Do not duplicate repository-wide privacy or secret scans in a feature test unless that feature has a narrower, feature-specific boundary. The global contract remains the source of truth.

## Running tests

Full suite:

```sh
node scripts/run-tests.mjs
```

List discovered targets without running them:

```sh
node scripts/run-tests.mjs --list
```

Run a focused subset while developing:

```sh
node scripts/run-tests.mjs --match=origin-machine
node scripts/run-tests.mjs --match=page-four,elsewhere
```

Force serial execution when investigating order or resource problems:

```sh
node scripts/run-tests.mjs --serial
```

The runner reports wall time and the slowest targets. Use those measurements to guide optimization; do not add timing thresholds that can become runner-flaky.

## PR checklist for tests

Before opening a PR that changes tests:

- reuse an existing owner test where practical;
- remove duplicated setup/policy checks by using `test-support.mjs`;
- keep new tests deterministic and network-free;
- remove tests for code that was actually removed;
- keep compatibility tests only when a live compatibility boundary still exists;
- run the focused target first, then the full suite;
- run JavaScript syntax checks;
- ensure `.github/workflows/check.yml` invokes the central runner rather than enumerating individual tests.

## Automation rule

Autonomous Museum evolution should inspect this file and the target room's existing tests before writing new tests. The default action is to extend or refactor existing coverage. New test files require a real isolation boundary, not merely a new generation number or feature name.
