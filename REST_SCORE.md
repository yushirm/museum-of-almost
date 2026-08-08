# The Rest Score / Nothing Is Not Missing

## Design gate

Three directions were evaluated before implementation.

### Concept A — Completeness Audit

The conventional next feature would enumerate selected current fields and label each available, zero, missing, or not applicable.

That is useful, but it would turn the Commons into an operations dashboard and invite the phrase “data quality” where the instrument only knows about current presence and field semantics.

### Concept B — The Rest Score

Borrow orchestral notation. A written rest is intentional silence; a blank or missing measure is absence of notation.

For this instrument:

- **SOUNDED VALUE** means the current latch contains a value for that field;
- **WRITTEN ZERO** means the current latch contains numeric zero **and that specific field’s semantics make zero mean none or no occurrence**;
- **MISSING MEASURE** means the current latch cannot supply that field;
- **NOT APPLICABLE** means the field has no meaningful value in the current state.

The metaphor is deliberately limited. The public services are not synchronized performers, their values do not share units, and the score does not imply harmony, causation, simultaneity, or scientific agreement.

### Concept C — The Empty State Becomes the Main Exhibit

Break a normal web convention: empty states usually receive the least visual attention. Here, written zeros, missing measures, and not-applicable states become the largest cards while ordinary nonzero readings remain supporting context.

That inversion is useful because interfaces routinely make `0`, `—`, missing, and “none” look interchangeable even when they encode very different knowledge.

### Decision

**Concept A was discarded** as the least additive. Its useful semantic categories were retained inside the merged B+C instrument.

Concepts B and C became **The Rest Score / Nothing Is Not Missing**.

## Product contract

The instrument reads only the existing in-memory COMMONS / NOW snapshot. It never starts its own data acquisition.

Every real `museum:commons-snapshot` event rewrites the score from the new latch and resets the memory-only state filter to **All**.

The score contains a fixed set of 19 semantic measures across the existing five feed channels:

1. USGS past-hour earthquake count;
2. USGS strongest-earthquake magnitude;
3. NOAA solar-wind speed;
4. NOAA geomagnetic-storm scale (`G`);
5. NOAA solar-radiation-storm scale (`S`);
6. thirteen Open-Meteo current precipitation readings, one for each fixed world point;
7. NASA EONET open-event count.

The NOAA scales are normalized with the existing `cosmic-signal-core.js` scale parser. The feature does not create a second interpretation of those scale values.

## Zero is field-specific

The Rest Score never assumes that the number `0` means “nothing happened.” Numeric zero does not automatically mean silence.

A value becomes **WRITTEN ZERO** only when the field already has a none-or-no-occurrence zero semantics:

- earthquake count `0` means zero events recorded by that feed in the stated past-hour window;
- NOAA `G0` and `S0` mean none at those current public storm scales;
- Open-Meteo precipitation `0.0 mm` is an explicit current precipitation value at that fixed point;
- NASA EONET count `0` means the current response contains zero open events.

Other numeric-zero cases remain **SOUNDED VALUE**:

- an earthquake magnitude of `0.0`, if present for a recorded event, is still a magnitude value;
- a solar-wind speed of `0`, if a current normalized reading ever contained it, would still be a speed value.

This rule prevents visual language from becoming a fabricated scientific interpretation.

## Not applicable is not missing

The strongest-earthquake field demonstrates the distinction.

- if the earthquake feed is unavailable, strongest magnitude is **MISSING MEASURE** because the current state is unknown;
- if the feed is available and reports zero earthquakes, strongest magnitude is **NOT APPLICABLE** because there is no event to rank;
- if one or more earthquakes are recorded but strongest magnitude is absent, the field is **MISSING MEASURE**;
- if a strongest magnitude is present, it is **SOUNDED VALUE**, including a possible magnitude zero.

The feature must preserve this ordering. A failed earthquake feed must never become “not applicable.”

## Presentation rule

Zero, missing, and not-applicable cards are intentionally larger than ordinary sounded-value cards.

That is a web-layout inversion, not a statement of scientific importance. The text labels remain authoritative, and every card includes the fixed semantic explanation that produced its state.

The filter control can solo:

- all measures;
- written zeros;
- missing measures;
- not-applicable measures;
- sounded values.

Filtering changes only what is visible. It does not alter the snapshot, score classification, requests, other instruments, or printed source data.

## Summary counts

The summary may count how many of the 19 fixed measures occupy each category.

Those counts are not a completeness percentage or any other overall score. They are also not:

- a provider score;
- a data-quality score;
- a confidence score;
- a reliability ranking;
- evidence that unlike feeds are synchronized or comparable.

The score never weights one measure against another and never divides the category counts into percentages.

## Current-latch boundary

The Rest Score uses only the current shared latch.

It does not retain the previous score, calculate trends, remember filters across reloads, or substitute prior values when a new feed is unavailable.

A missing current input remains **MISSING MEASURE** even if the page previously displayed a value before Refresh world.

## Runtime and privacy boundary

The feature adds zero runtime data-service requests.

It also adds no:

- polling or timer loop;
- storage, cookies, IndexedDB, history state, or persistence;
- browser location access;
- visitor free-text or numeric input;
- analytics, telemetry, ads, or tracking;
- remote script, font, image, media, API, or dependency;
- account, authentication, or cloud state.

The feature’s own JavaScript and CSS are same-origin static Museum assets.

## Accessibility

- all state filters are native buttons with `aria-pressed`;
- the current summary is a polite live region;
- every semantic state is written as text and never depends on color;
- every card includes a plain-language explanation;
- controls retain 44px minimum targets;
- narrow layouts collapse cleanly;
- increased-contrast preferences increase borders;
- reduced-motion disables transitions and animation;
- print removes the interactive filter while retaining the semantic score.

## Offline behavior

`rest-score-core.js`, `rest-score.js`, `rest-score.css`, and this record are same-origin assets in the Museum’s coherent offline shell.

When offline before any current latch exists, the instrument stays in **WAITING FOR LATCH** rather than inventing a zero-filled score.

## Rebuild rule

Keep the 19 measures fixed unless the Commons product contract changes. Never infer “rest” from numeric zero alone; encode zero semantics per field. Preserve missing versus not-applicable as distinct states. Reuse the existing NOAA scale normalizer. Never convert category counts into a percentage or quality score. Never retain prior-latch values to fill a missing current measure.
