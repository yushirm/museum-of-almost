# The Border Office / The World Does Not Know Our Labels

## Design gate

Three directions were evaluated before implementation.

### Concept A — The Threshold Registry

The conventional direction would list local classification rules already embedded in COMMONS / NOW, then show the current numeric value, current category, exact threshold rule, and arithmetic distance to the nearest threshold.

The information model is useful and testable, but by itself it would become another tidy diagnostic table.

### Concept B — The Border Office

Borrow the mechanic of customs and border control. A continuous value arrives as itself, crosses a line declared by local code, and receives a category stamp.

The metaphor is deliberately limited. The border is the Museum's classification rule; it is not a seam in nature, a jurisdiction, a danger boundary, or evidence that the underlying phenomenon changes discontinuously.

### Concept C — No Label Without Its Exit Condition

Break a normal web convention. Status badges usually display only the answer. This instrument refuses to let a category stand alone: every current label must also disclose the exact condition that would make it stop applying.

The threshold receives more visual authority than the badge. The current category is the stamp; the exit condition is the main exhibit.

### Decision

**Concept A was discarded** as the least additive. Its useful threshold accounting remains inside the merged instrument.

Concepts B and C became **The Border Office / The World Does Not Know Our Labels**.

## Product contract

The Border Office exposes three local classification families already used by COMMONS / NOW:

1. solar-wind state;
2. fixed-point day / twilight / night state;
3. membership in the current precipitation-reporting count.

It does not claim that these are the only categories in the Museum. They are the fixed scope of this instrument because all three are deterministic local cuts that can be reconstructed from the current normalized latch and established local geometry without a new provider request.

The thesis is:

> The world provides values. The Museum draws some of the lines that turn those values into words.

## Declared local borders

### Solar wind

The established Commons normalizer uses the current normalized speed and assigns:

- **QUIET** below `350 km/s`;
- **STEADY** from `350 km/s` up to but not including `500 km/s`;
- **FAST** from `500 km/s` up to but not including `700 km/s`;
- **VERY FAST** at `700 km/s` and above.

The Border Office treats `350`, `500`, and `700 km/s` as local semantic borders.

The current label remains the one already stored in `MuseumCommonsSnapshot.solar.state`. The Border Office does not become a second authoritative solar normalizer.

### Light state

The established local solar geometry uses solar elevation at the snapshot latch instant and each of the thirteen fixed coordinates:

- **DAY** above `0°`;
- **TWILIGHT** above `-6°` through exactly `0°`;
- **NIGHT** at or below `-6°`.

The borders are therefore `-6°` and `0°` solar elevation.

This is local astronomical geometry, not a public astronomy feed and not a claim about civil, nautical, or astronomical twilight standards beyond the exact rule the Museum already uses.

### Precipitation count

The existing thirteen-point weather reducer increments its `raining` count only when a fixed point has a finite current normalized precipitation value greater than `0`.

The Border Office therefore exposes one local membership border:

- **COUNTED AS REPORTING** when current normalized precipitation is `> 0 mm`;
- **NOT COUNTED AS REPORTING** at `0 mm`.

It deliberately does **not** translate `0 mm` into “dry.” The rule is about membership in the Museum's current precipitation-reporting count, not a complete meteorological condition.

## Exit conditions

Every category must expose the condition that would revoke it.

Examples:

- `STEADY` expires below `350 km/s` or at `500 km/s`;
- `TWILIGHT` expires at or below `-6°`, or above `0°` solar elevation;
- `COUNTED AS REPORTING` expires at `0 mm` in the normalized Commons field.

This is the convention break. The interface is not allowed to present a categorical label without also showing its local border logic.

## Margin to nearest border

For each current finite value, the instrument calculates the absolute arithmetic distance to the nearest declared border in that measure's native unit.

The margin is **not**:

- uncertainty;
- sensor error;
- provider error;
- confidence;
- probability of changing category;
- stability;
- danger;
- accuracy;
- quality;
- reliability;
- a provider ranking.

A smaller margin does not make a value worse, less trustworthy, more volatile, or more likely to change.

Margins from unlike families are never compared or ranked. `0.2 km/s`, `0.2°`, and `0.2 mm` do not share a scale just because they share a number.

## Current-latch behavior

The feature reads only the current normalized Commons snapshot plus the existing local solar-geometry functions and fixed station coordinates.

It adds no response observation, provider payload retention, fetch, or alternate acquisition path.

When a current value is missing, its label is **MISSING** and no previous-latch value is substituted.

The selected rule family is memory-only and resets to **Solar wind** on every real `museum:commons-snapshot` event.

## Interaction

Three native buttons select the visible border family:

- Solar wind;
- Light state;
- Precipitation count.

Selection changes only the local exhibit. It does not mutate the snapshot, category rules, other Museum instruments, provider requests, or field sheet data.

The category stamp is intentionally smaller than the written exit condition. The interface gives the rule that manufactured the word more visual authority than the word itself.

## Field sheet and print

The full interactive Border Office is omitted from print.

A compact field-sheet line remains. It records:

- the current solar label;
- current day / twilight / night counts across the thirteen fixed points;
- how many fixed weather points are currently counted as reporting precipitation;
- the exact local border families;
- the qualification that proximity is not uncertainty or quality.

## Runtime and privacy boundary

The feature adds no:

- data-service or external request;
- response-cloning layer;
- polling or timer loop;
- storage, cookies, history state, or IndexedDB;
- browser geolocation;
- visitor free-text or numeric input;
- analytics, telemetry, ads, or tracking;
- account, authentication, cloud state, or paid service;
- remote script, font, image, media, API, or runtime dependency.

The feature uses same-origin static JavaScript, CSS, and documentation only.

It contains no visitor, owner, or identifying information.

## Accessibility

- family selectors are native buttons with `aria-pressed`;
- current-family summaries use a polite live region;
- every category and exit condition is written in text;
- threshold meaning never depends on color;
- every card lists the current numeric, nearest border, and arithmetic margin textually;
- controls retain a minimum 44px target size;
- layouts collapse below 760px and 620px;
- reduced motion removes transitions and the decorative stamp rotation;
- increased contrast strengthens boundaries;
- print retains the compact field-sheet qualification.

## Offline behavior

`border-office-core.js`, `border-office.js`, `border-office.css`, and this design record are same-origin assets in the coherent Museum shell.

The feature mounts after the Offcut Drawer through the established Commons progressive loader.

The offline-shell successor must preserve the Origin Machine v28 marker and every previously merged local asset while advancing the current cache to the Border Office release.

## Validation contract

Focused tests must pin the exhibit to the actual current rules in `data-core.js`, including:

- solar boundaries at `350`, `500`, and `700 km/s`;
- exact light behavior at `-6°` and `0°`;
- precipitation-count membership only above `0`;
- the current snapshot remaining authoritative for the solar label;
- the derived light labels matching `MuseumCommonsCore.sunState`;
- per-point precipitation membership summing to the established `weather.raining` count;
- missing values staying missing;
- no request, storage, timer, location, tracking, or visitor-input API in the feature runtime;
- responsive, keyboard, reduced-motion, increased-contrast, and print behavior;
- coherent service-worker inclusion and loader order.

## Rebuild rule

Preserve these invariants:

1. Treat the border as a declared local semantic rule, never a natural discontinuity.
2. Keep the normalized Commons snapshot authoritative.
3. Reuse established `sunState` / `solarElevation` geometry instead of creating a competing astronomy model.
4. Describe precipitation strictly as membership in the current reporting count; never turn `0 mm` into a complete “dry” claim.
5. Every category must show its exact exit condition.
6. Margin means native-unit arithmetic distance to a threshold only.
7. Never compare margins across unlike units.
8. Never turn margin into uncertainty, error, confidence, probability, stability, danger, accuracy, quality, or reliability.
9. Missing current values stay missing; never borrow an earlier latch.
10. Keep interaction memory-only and reset the selected family on every real latch.
11. Add no data-service request, raw-payload retention, response clone, visitor input, tracking, persistence, or external runtime dependency.
12. Keep the full interactive office out of print and preserve only its qualified field-sheet summary.
13. Pin focused tests to the real classification branches in `data-core.js` so threshold drift fails loudly.
14. Advance the same-origin offline shell without discarding concurrent releases.
15. Require the feature-complete head to pass `check`, then add the repository Success Archive entry, then require the archive-bearing head to pass `check` again before merge.
