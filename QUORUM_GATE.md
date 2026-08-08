# The Quorum Gate / The Pie Refuses to Close

## Design gate

Three directions were evaluated before implementation.

### Concept A — The Ratio Ledger

The conventional direction was a static table listing current Commons counts, candidate denominators, and whether a percentage could be defended.

It was precise but too administrative. COMMONS already has strong ledgers and audits, and the useful part of this idea can live inside a more experiential instrument.

### Concept B — The Quorum Gate

Borrow a mechanic from parliamentary procedure: before a vote percentage means anything, establish who belongs to the voting population.

The feature treats every proposed current fraction as a motion brought to a quorum clerk. A nearby count is never allowed to become a denominator merely because the arithmetic is possible.

### Concept C — The Pie Refuses to Close

Break a common dashboard convention: category counts do not automatically earn a percentage or pie chart.

The visitor asks the interface to **MAKE IT A PERCENT**. The page may license the share, scope it to a returned window, refuse the percentage because the denominator was lost, or allow an individual membership share while refusing a pie partition.

### Decision

**Concept A was discarded** as the least additive presentation.

Concepts B and C became **The Quorum Gate / The Pie Refuses to Close**.

The central doctrine is:

**NO DENOMINATOR. NO PERCENT.**

A second invariant follows:

**AN ALLOWED INDIVIDUAL SHARE DOES NOT AUTOMATICALLY AUTHORIZE A PIE PARTITION.**

## Product contract

The feature reads only the existing normalized `MuseumCommonsSnapshot` plus the current fixed normalization contract already present in `data-core.js` and `app.js`.

It adds no acquisition, response clone, raw-provider retention, alternate normalizer, interpolation, estimator, random generator, or external model.

Exactly four fixed cases are offered.

## Case 1 — Precipitation membership

Numerator:

- authoritative current `weather.raining`.

Denominator:

- the number of current normalized weather points whose `precipitation` value is finite.

The feature independently recomputes the number of finite precipitation values greater than `0` and requires that count to equal authoritative `weather.raining` before it licenses a percentage.

This denominator is intentionally **not** `weather.availableCount`, because a weather point is marked available when any of temperature, wind, or precipitation is finite. A point can therefore be weather-available without having an evaluable precipitation value.

If at least one finite precipitation value exists and the count contract matches, the fraction is licensed.

The two membership states are finite precipitation `> 0 mm` and finite precipitation not `> 0 mm`. They partition the finite precipitation-value set, but the second state is not expanded into a complete “dry weather” claim.

The percentage is only a share of evaluable **fixed samples**. It is not geographic rainfall coverage, world prevalence, representativeness, probability, or area.

## Case 2 — Feed return

Numerator:

- number of `true` values among the fixed five current feed channels: earthquakes, solar wind, NOAA scales, weather, and events.

Denominator:

- exactly `5` requested feed channels.

Returned versus unavailable is an exhaustive operational partition once the latch settles.

The percentage says only what share of those five fixed requests returned data in this latch. It is not source quality, world completeness, reliability, provider ranking, or scientific coverage.

## Case 3 — Significant earthquakes

Numerator:

- authoritative normalized `earthquakes.significant`, which is counted from finite normalized magnitudes at or above `4.5`.

Candidate nearby count:

- `earthquakes.count`, which is the total number of earthquake features after filtering feature type.

The percentage is **refused**.

Why:

- `normalizeEarthquakes` retains total earthquake features as `quakes.length`;
- it separately builds `magnitudes` by converting magnitude values and discarding non-finite values;
- `significant` is counted only from that finite-magnitude array;
- the normalized snapshot does not retain the number of earthquake features that had a finite magnitude.

Therefore total earthquake features are not a safe substitute for the missing classification denominator.

The verdict is **DENOMINATOR LOST**. No `0%`, guessed denominator, inferred eligibility count, or previous-latch fallback is allowed.

## Case 4 — Top EONET category membership

Numerator:

- the retained count for the first normalized top category.

Denominator:

- current returned `events.count`.

An individual category count can form a membership share of the returned event response when the count is between zero and the returned-event count.

However the feature always refuses to turn the visible top categories into one pie because:

- an event can carry multiple categories;
- category counts are membership counts rather than exclusive bins;
- only the top five category counts are retained;
- the visible top five therefore need not exhaust the returned events;
- when `events.capped` is true, the returned event response has hit the existing `500`-event limit and is explicitly a bounded returned window rather than “all open events.”

When capped, the verdict is **WINDOWED QUORUM**.

When not capped, the individual share can be licensed, but the pie still receives **MEMBERSHIP SHARE ALLOWED. PIE CHART REFUSED.**

## Interaction model

The interface has four native case buttons and one native **MAKE IT A PERCENT / RESTORE COUNTS** button.

Selecting a case returns to the counts-only state.

Pressing **MAKE IT A PERCENT** does not guarantee a percentage. The resulting refusal is a successful interaction when the denominator contract does not authorize the requested transformation.

All state is memory-only. Every real `museum:commons-snapshot` event resets the active case to precipitation membership and requested-percentage state to false. No previous latch is used.

## Visual contract

The circular display has three meaningful modes:

1. **PARTITION LICENSED** — a percentage and a two-state partition can both be shown;
2. **PIE CHART REFUSED** — an individual percentage may be shown, but the circular partition stays broken;
3. **PERCENT REFUSED / NO DENOMINATOR** — neither percentage nor pie is shown as valid.

Text is authoritative. The circle is supplemental and meaning never depends on color.

## Relationship to existing COMMONS instruments

- **Gauge Bench** decides whether two normalized quantities may share one magnitude ruler. It does not decide whether one count is a valid denominator for another.
- **Reverse Ledger** traces claims backward through source and transformation ancestry. It does not license ratios.
- **Rest Score** distinguishes zero, missing, and not-applicable states. It does not establish a population for percentages.
- **Border Office** owns threshold-generated categories and exit conditions.
- **Load-Bearing Sample** owns one-point omission sensitivity.
- **Shuffle Table** owns permutation invariance and point/value correspondence loss.
- **The Quorum Gate** owns denominator retention, subset membership, returned-window scope, and the distinction between a valid individual share and a valid partition.

## Missing, zero, and denominator semantics

- Missing is never coerced to zero.
- A zero numerator can produce `0.0%` only when a positive, retained denominator exists and the subset contract is valid.
- A zero denominator never produces a percentage.
- A lost denominator never borrows a nearby count.
- An unavailable feed never borrows a previous latch.
- Numeric percentages are rounded to one decimal only after exact numerator/denominator selection.

## Field sheet and print

The full interactive Quorum Gate is omitted from print.

The field sheet retains the selected case, current proposed fraction, percentage or explicit refusal, verdict, population scope, and whether a partition is licensed or refused.

## Runtime and privacy boundary

The feature adds no public-data or external request, response clone, raw-provider payload retention, alternate normalizer, polling, timer or animation-frame loop, localStorage, sessionStorage, IndexedDB, cookies, history state, browser geolocation, visitor free-text or numeric input, analytics, telemetry, ads, tracking, account, authentication, cloud state, paid service, remote script, font, image, media, API, or runtime dependency.

It uses same-origin static JavaScript and CSS only and contains no visitor, owner, or identifying information.

## Accessibility

- all controls are native buttons;
- case and requested-percentage states expose `aria-pressed`;
- the main verdict is a polite live region;
- all numerator, denominator, verdict, scope, percentage, and pie-refusal information is textual;
- controls preserve at least a 44px target;
- responsive breakpoints are provided at 760px and 620px;
- reduced-motion removes decorative rotation;
- increased contrast strengthens boundaries;
- the full interactive instrument is omitted from print while the qualified field-sheet line remains.

## Offline behavior

Local assets are `quorum-gate-core.js`, `quorum-gate.js`, `quorum-gate.css`, and `QUORUM_GATE.md`.

The implementation baseline is **v37 Shuffle Table**. The initial successor is **v38 Quorum Gate** and must preserve v37, v36 Page Four Evidence Lattice, and all earlier assets.

If another release lands first, the branch must be reconstructed or reconciled onto exact live `main` and advance beyond the true current shell before any green run is accepted as release evidence.

## Validation contract

Focused tests must verify exactly four fixed cases; missing is not zero; a zero numerator can become `0.0%` only with a positive valid denominator; zero denominator refuses a percentage; precipitation denominator counts only finite normalized precipitation values; precipitation numerator is independently reproduced from finite values greater than zero; precipitation contract drift refuses a percentage; feed return uses exactly five fixed feed keys; significant-earthquake percentage is refused because the finite-magnitude eligibility denominator is not retained; the refusal is pinned to the exact `quakes.length`, finite-magnitude filter, and significant-count branches in `data-core.js`; EONET individual top-category membership can form a returned-window percentage; EONET always refuses a pie partition because memberships may overlap and only top five counts are retained; `limit=500` and `events.capped` produce explicit returned-window scope; top-category count greater than returned-event count is treated as contract drift; all state resets on every real Commons latch; no previous-latch fallback; no request, persistence, timer, geolocation, tracking, visitor input, remote runtime asset, or dependency; keyboard, live-region, responsive, reduced-motion, increased-contrast, and print behavior; progressive loader order after Shuffle Table; and coherent same-origin offline-shell inclusion and release-marker preservation.

## Rebuild invariants

1. Use only the current normalized Commons latch.
2. Never infer a denominator from numeric type or nearby visual placement.
3. Keep precipitation eligibility tied to finite normalized precipitation values, not broad weather availability.
4. Keep feed-return scope fixed to the five requested channels.
5. Keep significant-earthquake percentage refused until the normalized latch explicitly retains the finite-magnitude eligibility count.
6. Keep EONET category percentage scoped to returned events and preserve the 500-event cap warning when active.
7. Never convert overlapping/non-exhaustive EONET category memberships into one pie.
8. Keep zero numerator distinct from zero or missing denominator.
9. Keep the normalized snapshot authoritative and refuse source/derived-contract drift.
10. Keep percentage rounding downstream of exact membership and denominator selection.
11. Keep all state memory-only and reset on each real latch.
12. Keep the interactive instrument out of print and the qualified denominator statement on the field sheet.
13. Add no acquisition, raw-response retention, persistence, visitor input, tracking, timer loop, or external runtime dependency.
14. Advance the coherent same-origin service-worker shell without discarding concurrent releases.
15. Require the feature-complete head to pass the required `check`, then append repository Success Archive evidence and a focused assertion, then require the archive-bearing head to pass `check` again before merge.
