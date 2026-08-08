# The Load-Bearing Sample / Pull One Pin

## Design gate

Three directions were evaluated before implementation.

### Concept A — The Contribution Matrix

The conventional direction would calculate leave-one-out sensitivity for the thirteen current weather points against the five existing local weather aggregates: minimum temperature, maximum temperature, mean wind, maximum wind, and the count of points reporting precipitation.

The arithmetic is useful and testable, but a matrix alone would turn a new epistemic question into another operations table.

### Concept B — The Load-Bearing Sample

Borrow structural-engineering language. Treat one derived headline as a beam resting on current observational supports. Remove one support hypothetically and recalculate the beam.

The metaphor is deliberately narrow. A point is load-bearing **for one current headline** only when omitting that one sample changes the normalized headline or makes it unavailable. This is not a statement about physical importance, spatial representativeness, reliability, provider quality, causality, or uncertainty.

### Concept C — Pull One Pin

Break a normal web convention. Interface controls usually add, reveal, refine, or filter information. This instrument makes subtraction useful: the visitor may pull exactly one current weather point from a clearly hypothetical recomputation while the real latch stays untouched.

The hypothetical result must always sit beside the authoritative real-latch headline. A point whose omission leaves the headline unchanged must never be called redundant or unimportant.

### Decision

**Concept A was discarded** as the least additive. Its leave-one-out arithmetic remains inside the merged feature.

Concepts B and C became **The Load-Bearing Sample / Pull One Pin**.

## Product contract

The feature reads only the current normalized `MuseumCommonsSnapshot.weather` points and the fixed station list already present in `MuseumCommonsCore.STATIONS`.

It adds no data acquisition and does not retain a second provider response.

Its fixed claim scope is exactly five existing local weather aggregates:

1. `minTemp` — minimum finite current temperature;
2. `maxTemp` — maximum finite current temperature;
3. `meanWind` — arithmetic mean of finite current wind values, rounded to one decimal place;
4. `maxWind` — maximum finite current wind value;
5. `raining` — count of current points with finite precipitation greater than `0`.

The current value shown for each claim remains authoritative from the normalized snapshot. The Load-Bearing Sample recomputes only the hypothetical one-point-omitted result.

## One-point omission only

For one selected claim, every fixed station is evaluated independently.

The instrument never removes two or more points at once. It is not an optimizer and does not search for a subset that produces a preferred result.

For one point and one claim:

- **LOAD-BEARING FOR THIS HEADLINE** means the normalized headline changes when that one evaluable point is omitted;
- **HEADLINE UNCHANGED** means the normalized headline remains numerically identical after that one omission;
- **SOLE SUPPORT FOR THIS HEADLINE** means removing the point leaves no evaluable value for that claim;
- **MISSING FOR THIS CLAIM** means that point has no current finite value for the selected claim and therefore cannot be pulled as though it contributed.

A sole support is counted as load-bearing because the headline disappears when it is omitted.

## Aggregate semantics

### Minimum temperature

Use the finite current normalized point temperatures. The hypothetical result is the one-decimal minimum after one point is omitted.

### Maximum temperature

Use the finite current normalized point temperatures. The hypothetical result is the one-decimal maximum after one point is omitted.

### Mean wind

Use the finite current normalized point wind values. The hypothetical result is the arithmetic mean after one point is omitted, rounded to one decimal place exactly like the existing reducer.

The feature tests the normalized headline, not an unrounded hidden statistical quantity. An exact underlying mean may move by less than the display precision while the normalized one-decimal headline remains unchanged.

### Maximum wind

Use the finite current normalized point wind values. The hypothetical result is the one-decimal maximum after one point is omitted.

### Precipitation count

The existing reducer counts a point only when its finite current normalized precipitation is greater than `0`.

A point at `0 mm` is evaluable for this claim but its omission does not reduce the positive-count headline.

This feature does **not** translate `0 mm` into a complete `dry` weather claim. It tests membership in this one existing count only.

## The real latch remains authoritative

The visitor interaction never mutates `MuseumCommonsSnapshot`, provider availability, the thirteen fixed points, the Difference Engine, the Planetary Section, the Exposure Plate, the Border Office, or any field-sheet source data.

Every displayed alternative is explicitly labeled **HYPOTHETICAL**.

On every real `museum:commons-snapshot` event:

- the selected claim resets to **MIN TEMP**;
- the selected pin resets to none;
- all one-point results are rebuilt from the new current latch.

There is no previous-latch fallback.

## UNCHANGED DOES NOT MEAN UNIMPORTANT

A headline that survives one omission is not proof that the point is:

- unimportant;
- redundant;
- spatially representative or unrepresentative;
- correct or incorrect;
- high or low quality;
- reliable or unreliable;
- causally irrelevant;
- certain or uncertain.

It means only that **this one normalized headline remained numerically unchanged under this one current one-point omission**.

Likewise, a load-bearing point is not ranked above another point. There is no influence score, percentage, confidence score, quality score, reliability score, provider score, or representativeness score.

## Interaction

Five native buttons choose the claim family.

Each evaluable fixed point exposes one **PULL PIN** button. Only one pin can be selected at a time. Selecting the same pin again restores the no-pin view.

The comparison rail always keeps:

- the real-latch headline on one side;
- the hypothetical one-point-omitted headline on the other;
- a textual explanation of whether the headline changed, stayed unchanged, or became unavailable.

All state is memory-only.

## Field sheet and print

The full interactive rig is omitted from print.

A compact field-sheet line remains. For each of the five claims it records:

- load-bearing count;
- evaluable-point count.

The count includes sole-support cases because omission removes the headline.

The field sheet explicitly qualifies these counts as one-point current-latch aggregate sensitivity, not importance, quality, representativeness, causality, reliability, or uncertainty.

## Runtime and privacy boundary

The feature adds no:

- public-data or other external request;
- response clone;
- raw-provider payload retention;
- alternate normalizer;
- polling, timer, or animation-frame loop;
- localStorage, sessionStorage, IndexedDB, cookies, or history state;
- browser geolocation;
- visitor free-text or numeric input;
- analytics, telemetry, ads, or tracking;
- account, authentication, cloud state, or paid service;
- remote script, font, image, media, API, or runtime dependency.

The runtime uses same-origin static JavaScript and CSS only.

It contains no visitor, owner, or identifying information.

## Accessibility

- claim selectors and pin selectors are native buttons;
- selected controls expose `aria-pressed`;
- missing-for-claim pins are disabled rather than pretending a missing value contributed;
- the selected comparison uses a polite live region;
- every state and hypothetical result is written in text;
- no meaning depends on color;
- controls retain a minimum 44px target size;
- layouts collapse below 760px and 620px;
- reduced motion removes card transitions;
- increased contrast strengthens boundaries;
- the interactive rig is omitted from print while the qualified field-sheet summary remains.

## Offline behavior

`load-bearing-sample-core.js`, `load-bearing-sample.js`, `load-bearing-sample.css`, and this design record belong to the same-origin coherent Museum shell.

The feature mounts after the Border Office through the established Commons progressive loader.

Implementation began on **v29 Border Office**. Before the first release gate, concurrent **Page Four / Unfiled Archive** landed on live `main` as **v30 Page Four**. Before a replacement feature head could become evidence, concurrent **Same Answer Machine** then landed as **v31 Same Answer Machine** with its own Deep Space runtime, documentation, workflow gate, Success Archive entry, and offline assets. The Load-Bearing Sample preserves both historical markers and every concurrent asset and advances the coherent successor shell to **v32 Load-Bearing Sample**. The release must continue to reconcile with exact live `main` if another release lands before merge rather than overwriting it.

## Validation contract

Focused tests must verify:

- all five fixed claim IDs;
- one-point omission only;
- unique minimum and maximum points change their respective headline;
- non-extreme temperature points can leave min/max unchanged;
- mean-wind omission uses the same one-decimal arithmetic-mean rule as the current reducer;
- a point equal to the current mean can leave the normalized mean headline unchanged;
- a positive-precipitation point lowers the existing positive-count headline by one when omitted;
- a `0 mm` point leaves that count unchanged and is never relabeled `dry`;
- a last finite value becomes **SOLE SUPPORT FOR THIS HEADLINE**;
- missing values cannot be pulled as though they contributed;
- the current normalized snapshot headline remains authoritative;
- the implementation is pinned to the actual `data-core.js` aggregation branches so future rule drift fails loudly;
- no request, storage, timer, location, tracking, visitor-input, or remote-runtime API exists in feature code;
- keyboard, responsive, reduced-motion, increased-contrast, live-region, and print behavior;
- loader order and coherent offline-shell inclusion.

## Rebuild rule

Preserve these invariants:

1. Keep the scope to the five established current weather aggregates unless a future product decision explicitly changes it.
2. Keep the current normalized snapshot authoritative for the real headline.
3. Recompute only one-point omissions from the current normalized weather points.
4. Never mutate the real snapshot.
5. Label every alternative as hypothetical.
6. Never allow simultaneous multi-point omission or optimization.
7. Treat a missing value as missing, not as a pullable zero.
8. Keep `0 mm` distinct from a complete `dry` claim.
9. Define load-bearing only as “this one omission changes or removes this one normalized headline.”
10. Never turn the result into importance, redundancy, confidence, uncertainty, quality, reliability, causality, representativeness, or ranking.
11. Keep all deltas in their native unit or integer point count; do not normalize unlike quantities into a shared score.
12. Reset claim and pin selection on every real latch.
13. Add no data-service request, raw-payload retention, response clone, visitor input, tracking, persistence, or external runtime dependency.
14. Keep the full hypothetical rig out of print and preserve only a qualified field-sheet sensitivity summary.
15. Pin tests to the real aggregation branches in `data-core.js` so semantic drift fails loudly.
16. Advance the coherent same-origin shell without discarding concurrent releases.
17. Require the feature-complete head to pass `check`, then add the repository Success Archive entry and its focused assertion, then require the archive-bearing head to pass `check` again before merge.
