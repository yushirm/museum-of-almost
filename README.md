# The Museum of Almost

A dependency-free, offline-first browser experiment currently behaving as an agreement between impossible forces.

The current experience is one continuous treaty line carrying two forces in opposite directions. The visitor acts as a counterweight by suspending the line at any point. A suspension is a deliberate error: exactly one error creates temporary order, while perfect symmetry or too many errors destabilise the agreement. An erasure attempt removes an active mark but preserves that mark as the only durable fictional memory. The first erasure in a local installation also causes one field reversal that cannot repeat until local state is reset.

The Museum is now in a **constructive building mode**: Treaty 05 is a stable foundation. New work should extend its behavior, expression, accessibility, local tools, and meaningful connections rather than replacing the current experience unless a future task explicitly calls for a new direction.

## Operations dashboard

Treaty 05 is now composed as a real **operations dashboard** rather than a single long-form instrument page. The dashboard does not create a second product or a separate analytics layer; it makes the existing Museum state legible at a glance while leaving the interactive treaty as the dominant workbench.

The summary band reports:

- current agreement state;
- bounded live world pressure when invited;
- current session mark count and total weight;
- whether erased memory is empty or retained.

The surrounding panels expose:

- real USGS earthquake count and strongest magnitude for the current invited snapshot;
- real NOAA SWPC solar-wind speed for the current invited snapshot;
- the derived correspondence between outside pressure and the visitor's current counterweight;
- field-ledger count, weight, center, spread, and resonance;
- the current-visit session record;
- network availability, local durable-store availability, service-worker control, and whether live requests are active or idle.

The dashboard itself performs no network requests, creates no storage, and keeps no history. It reflects the existing local Treaty state plus the already-bounded live entropy snapshot. There are no fabricated charts or implied time series.

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

## Constructive additions

Treaty 05 also supports additive session mechanics without changing its durable state model:

- **Suspension spans** connect adjacent active marks and classify their spacing as near lock, close drift, balanced interval, or wide accord.
- A live **field ledger** reports active mark count, total weight, center, spread, and current resonance.
- **Cast echo** mirrors the latest active mark across the treaty and complements its weight.
- **Undo session mark** removes the latest active addition without creating erased memory.
- **Soften latest** and **Intensify latest** edit the newest mark within the existing bounded weight range.
- A current-visit **session record** keeps the six most recent constructive actions in memory only; it is never persisted.
- Keyboard construction shortcuts add `[` / `]` weight editing plus `Shift+E` echo and `Shift+U` session undo.
- **Make local postcard** downloads an SVG generated entirely in-browser from the visible fictional configuration. It uses no remote images, fonts, install-identifying code, or live entropy data.
- **Print treaty** provides a dedicated print layout through the browser's local print dialog.

None of those additions store active-session history. The erased ghost remains the only durable fictional visitor action.

## Live entropy

Live entropy lets present-day public scientific conditions influence the existing Treaty.

It is an **explicit opt-in**. Nothing is fetched automatically. Pressing **Invite live entropy** makes one direct request to each of two fixed public sources:

- the USGS all-earthquakes GeoJSON feed for the past hour;
- the NOAA Space Weather Prediction Center current solar-wind-speed summary.

USGS event data is reduced to aggregate disturbance only. NOAA contributes the numeric solar-wind speed. Those signals are combined into a bounded, session-only **world pressure** with a position, force bias, and field-scale influence. The Treaty then describes whether the visitor's current counterweight is answering, approaching, countering, or resisting that outside pressure.

The dashboard surfaces only the bounded snapshot values that have genuine operational meaning: earthquake count, strongest magnitude, solar-wind speed, world pressure, and correspondence. It does not surface earthquake places, event IDs, news links, maps, personal location, or a forecast interface.

The browser sends no treaty state to either source. Requests omit credentials and referrer, are not cached, and are never polled in the background. Live values are not persisted and are discarded on release, reload, or page close. The core experience remains fully usable offline.

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
node --check live-entropy-core.js
node --check live-entropy.js
node --check dashboard.js
node --check service-worker.js
node --check scripts/entropy-select.mjs
node --check scripts/test-entropy.mjs
node --check scripts/test-live-entropy.mjs
node --check scripts/test-service-worker.mjs
node --check scripts/check.mjs
node scripts/test-entropy.mjs
node scripts/test-live-entropy.mjs
node scripts/test-service-worker.mjs
node scripts/check.mjs
```

The checks cover deterministic entropy-history replay, the Execution 5 seed, bounded v5 persistence, legacy migration, continuous counterweight movement, duration-sensitive suspension, exactly-one-error treaty logic, attempted-erasure memory, the once-per-installation event, unresolved measurement, scale feedback, constructive spans, resonance classification, echo, session undo, weight editing, postcard data, bounded live-data reduction, explicit opt-in network behavior, live correspondence, dashboard snapshot mirroring, dashboard no-storage/no-network behavior, pointer-data privacy, responsive accessibility hooks, offline fallback, and service-worker cache cleanup.

## Project records

- `ENTROPY_LOG.md` records the historical mutation executions that produced the current foundation.
- `ENTROPY_HISTORY.md` records each entropy execution without personal or repository identity data.
- `CONSTRUCTION_LOG.md` records additive work performed after Treaty 05 became the stable foundation.

## Privacy boundary

The application stores one bounded local JSON value containing a random install seed and, optionally, the last fictional suspension the visitor attempted to erase. That ghost contains only a bounded position integer and bounded weight integer. Active suspensions, the field ledger, resonance spans, echoes, undo state, weight edits, the session record, pointer coordinates, hold durations, animation phases, postcard history, print history, dashboard state, live entropy responses, live pressure, timestamps, and visitor text are not stored.

Live entropy is optional and makes direct requests only after visitor activation. A normal internet request exposes network-layer information such as an IP address to the requested public service; the Museum sends no local treaty state, location, credentials, or referrer with those requests.

The public host may process ordinary connection information under its own terms. The application adds no analytics or tracking.

See `PRIVACY.md` for the full boundary.

## Public availability and copyright

This repository is publicly viewable for transparency and to support the hosted website. Public visibility does not make it an open-source project.

No open-source licence is granted. All rights are reserved except where applicable law or platform terms provide otherwise. See `RIGHTS.md`.

External contributions are not accepted unless explicitly invited. See `CONTRIBUTING.md`.
