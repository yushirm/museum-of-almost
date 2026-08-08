# The Shuffle Table / The Headline Does Not Know Where the Values Lived

## Design gate

Three directions were evaluated before implementation.

### Concept A — The Aggregation Audit

The conventional direction would enumerate what each current Commons weather headline retains from its point-level inputs and what it leaves out.

That accounting is useful, but as a standalone exhibit it would become another explanatory table. It also risks feeling too close to the Load-Bearing Sample because both would inspect the same aggregate family without changing the visitor’s relationship to it.

### Concept B — The Shuffle Table

Borrow a card-dealing mechanic.

Treat the current finite point values as a deck that is already dealt to the fixed thirteen weather points. A deterministic one-seat rotation moves those same finite values among the same evaluable points.

The value multiset is unchanged. Only point-to-value assignment changes.

The feature never invents a numeric value, fills a missing point, or asks a provider for anything new.

### Concept C — The Headline Refuses to Update

Break a familiar web-interface convention: a visitor action changes the details while the hero headline deliberately stays the same.

For the selected aggregation families, the one-seat permutation preserves the aggregate by construction. The interface therefore refuses to manufacture a new headline merely to reward the click.

Instead it makes the changed correspondence visible and states:

**SAME HEADLINE. DIFFERENT ASSIGNMENT.**

### Decision

**Concept A was discarded** as the least additive presentation.

Concepts B and C became **The Shuffle Table / The Headline Does Not Know Where the Values Lived**.

The audit logic survives inside the rule engine, but the visitor experiences aggregation loss as a deterministic counterfactual rather than a documentation table.

## Product contract

The feature reads only the existing normalized `MuseumCommonsSnapshot.weather` object.

It adds no acquisition, response observer, raw-provider retention, alternate normalizer, interpolation model, random generator, or synthetic measurement.

The fixed lenses are exactly:

1. **Temperature range** — current finite point temperatures, authoritative `weather.minTemp` and `weather.maxTemp`;
2. **Terrestrial wind summary** — current finite point wind values, authoritative `weather.meanWind` and `weather.maxWind`;
3. **Precipitation-reporting count** — current finite point precipitation values, authoritative `weather.raining`, whose existing membership rule is finite precipitation greater than `0`.

These three families are chosen because their current Commons headline is invariant under a permutation of the same finite values.

## The deterministic deal

The normalized fixed weather points are ordered by point ID.

For the selected lens:

1. read the current finite value for every point;
2. leave missing values missing and outside the deck;
3. keep the finite values in point-ID order;
4. give each evaluable point the next evaluable point’s current value;
5. wrap the last finite value back to the first evaluable point.

This is a fixed cyclic permutation, not randomness.

With fewer than two finite values there is no non-trivial permutation, so the shuffle control is disabled.

## What is preserved

The hypothetical permutation preserves:

- the exact finite numeric multiset for the selected field;
- the number of finite values;
- every missing point’s missing state;
- temperature minimum and maximum;
- wind arithmetic mean and maximum;
- the number of finite precipitation values greater than zero.

The focused core independently recomputes these aggregate values from the current point array and requires them to match the authoritative normalized headline before the shuffle is permitted.

The normalized snapshot remains authoritative. The Shuffle Table is not a second normalizer.

## What is not preserved

The permutation changes point-to-value correspondence.

For each evaluable point the interface can state:

- its actual current normalized value;
- which other point donates the hypothetical value;
- the hypothetical value after the one-seat rotation;
- whether the assignment moved;
- whether the displayed number actually changed.

The last distinction matters when repeated equal values occur. A value can move between point identities even when the displayed number at a receiving point happens to remain equal.

## The invariant headline

The central headline is always the authoritative normalized current summary.

When the visitor activates **CUT THE DECK**, the point assignment ledger changes but the hero headline does not.

For a valid current latch the interface states:

**SAME HEADLINE. DIFFERENT ASSIGNMENT.**

That is the purpose of the exhibit: an aggregate can remain exactly correct while failing to encode which point owned which value.

## Interpretation boundary

The hypothetical deal is deliberately narrow.

It is not:

- alternate weather;
- a forecast;
- interpolation;
- a physically plausible atmospheric state;
- a repaired dataset;
- imputation;
- uncertainty;
- probability;
- confidence;
- representativeness;
- a provider error model;
- a station ranking;
- a quality score;
- evidence that the actual point assignment is arbitrary.

The feature makes one mathematical statement only:

> these selected aggregate headlines are invariant under a permutation of the same finite values, so the headline alone does not encode point-to-value correspondence.

## Relationship to existing Commons instruments

The Shuffle Table owns a separate epistemic question.

- **Difference Engine** compares the same weather quantity between two actual fixed points.
- **Exposure Plate** shows the geometry of where current weather evidence exists without interpolation.
- **Reverse Ledger** traces a claim backward through transformations and inputs.
- **Rest Score** distinguishes numeric values, field-specific zeroes, missingness, and not-applicable states.
- **Offcut Drawer** exposes range guarding and display rounding.
- **Border Office** exposes threshold-generated categories and exit conditions.
- **Load-Bearing Sample** removes one actual point hypothetically and asks whether an aggregate changes.
- **Gauge Bench** asks whether two already-normalized claims may share one magnitude ruler.
- **Shuffle Table** keeps every finite selected value but changes correspondence, asking what the unchanged aggregate fails to preserve about assignment.

It does not remove points, change the value multiset, or compare unlike measures.

## Missing and zero semantics

Missing values are never dealt into another point and never receive a finite hypothetical value.

A missing point stays missing.

Real numeric zero remains an ordinary finite numeric value and participates in the permutation.

For precipitation, `0 mm` remains a finite value that does not contribute to the existing `> 0` reporting count. The feature does not translate `0 mm` into a complete “dry” weather condition.

There is no previous-latch fallback.

## Interaction state

The interface has:

- three native lens buttons;
- one native **CUT THE DECK / RESTORE ACTUAL DEAL** button.

All state is memory-only.

Every real `museum:commons-snapshot` event resets:

- active lens to temperature;
- deal state to actual.

No selection persists across reloads or latches.

## Field sheet and print

The full interactive Shuffle Table is omitted from print.

A compact field-sheet line remains. It records:

- selected lens;
- number of finite values;
- authoritative current aggregate;
- that the aggregate is invariant under the fixed one-seat rotation;
- that aggregate invariance does not preserve point/value correspondence;
- that the permutation is hypothetical only.

## Runtime and privacy boundary

The feature adds no:

- public-data or external request;
- response clone;
- raw-provider payload retention;
- alternate normalizer;
- polling;
- timer or animation-frame loop;
- localStorage, sessionStorage, IndexedDB, cookies, or history state;
- browser geolocation;
- visitor free-text or numeric input;
- analytics, telemetry, ads, or tracking;
- account, authentication, cloud state, or paid service;
- remote script, font, image, media, API, or runtime dependency.

The runtime uses same-origin static JavaScript and CSS only.

It contains no visitor, owner, or identifying information.

## Accessibility

- all controls are native buttons;
- lens and deal states expose `aria-pressed`;
- the shuffle control is disabled when a non-trivial permutation cannot be formed;
- the main verdict is a polite live region;
- every actual value, donor point, hypothetical value, assignment movement, value equality, and invariant headline is written as text;
- meaning does not depend on color;
- controls preserve a minimum 44px target;
- layout collapses below 760px and 620px;
- reduced-motion removes decorative rotation/transitions;
- increased contrast strengthens boundaries;
- the full instrument is omitted from print while the qualified field-sheet line remains.

## Offline behavior

Local assets are:

- `shuffle-table-core.js`;
- `shuffle-table.js`;
- `shuffle-table.css`;
- `SHUFFLE_TABLE.md`.

Implementation began while **v35 Page Four Signal Anomaly** was current and initially targeted v36.

During validation, **v36 Page Four Evidence Lattice** landed on `main` and legitimately took that shell generation. The Shuffle Table was therefore reconciled onto exact Evidence Lattice `main` and advanced to **v37 Shuffle Table**.

The v37 shell must preserve v36 Evidence Lattice, v35 Signal Anomaly, v34 Gauge Bench, their local assets and tests, and all earlier Museum assets.

Any later concurrent release must be inherited from exact live `main`; Shuffle Table must never overwrite another release’s shell marker or assets.

## Validation contract

Focused tests must verify:

- exactly three fixed lenses;
- missing is not zero;
- real zero remains finite and participates in a permutation;
- point ordering is deterministic by ID;
- finite values rotate one evaluable point forward with wraparound;
- missing points remain missing and outside the finite rotation;
- at least two finite values are required for a non-trivial shuffle;
- the actual finite multiset equals the hypothetical finite multiset for every lens;
- temperature minimum and maximum remain equal before and after permutation;
- wind one-decimal arithmetic mean and maximum remain equal before and after permutation;
- precipitation finite `> 0` membership count remains equal before and after permutation;
- authoritative normalized headlines are checked against the current point values before a shuffle is allowed;
- repeated equal values distinguish assignment movement from displayed numeric change;
- no previous-latch fallback;
- lens and deal state reset on every real Commons latch;
- feature code contains no request, persistence, timers, location, tracking, visitor input, or remote runtime API;
- keyboard, live-region, responsive, reduced-motion, increased-contrast, and print behavior;
- loader order after Gauge Bench;
- coherent same-origin offline-shell inclusion and release-marker preservation.

## Rebuild invariants

1. Use only current normalized weather points already in `MuseumCommonsSnapshot`.
2. Keep the selected finite value multiset exact; invent no numeric values.
3. Keep missing points outside the deck and missing after permutation.
4. Keep real zero as a finite value.
5. Use one deterministic cyclic permutation, not randomness.
6. Require at least two finite values.
7. Recompute the aggregate from the actual point values and require it to match the authoritative normalized headline before showing the hypothetical deal.
8. Keep the normalized snapshot authoritative.
9. Preserve temperature min/max, wind mean/max, and precipitation `> 0` count exactly under permutation.
10. Keep assignment movement distinct from numeric-value change.
11. Keep the hypothetical state explicitly labeled and refuse alternate-weather, forecast, interpolation, plausibility, uncertainty, probability, repair, quality, and ranking claims.
12. Keep all interaction state memory-only and reset it on every real latch.
13. Add no acquisition, raw-response retention, persistence, visitor input, tracking, timer loop, or external runtime dependency.
14. Keep the full interactive table out of print and preserve the qualified field-sheet statement.
15. Pin tests to the actual normalized reducer declarations.
16. Advance the coherent same-origin shell without discarding concurrent releases.
17. Require the feature-complete head to pass `check`, then append repository Success Archive evidence and a focused assertion, then require the archive-bearing head to pass `check` again before merge.
