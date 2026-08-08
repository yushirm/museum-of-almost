# The Gauge Bench / Break the Chart Before It Lies

## Design gate

Three directions were evaluated before implementation.

### Concept A — The Dimensional Ledger

The conventional direction would register current COMMONS / NOW claims by quantity family, unit, aggregation, semantic subject, and whether another claim can share a magnitude axis.

That bookkeeping is useful, but on its own it would become another static diagnostic table.

### Concept B — The Gauge Bench

Borrow a metrology mechanic. Put two current claims into a comparator fixture and require a declared comparison contract before a shared ruler is allowed.

The fixture distinguishes:

- **COMMON RULER** — both claims belong to one declared Museum-local comparison group;
- **SAME DIMENSION, DIFFERENT THING** — both claims share a broad dimension family but describe different semantic subjects;
- **NO COMMON AXIS** — the claims belong to different dimension families.

The declaration is deliberately local to this interface. It is not a universal scientific ontology and does not prohibit careful cross-domain scientific reasoning outside this Museum interaction.

### Concept C — Break the Chart Before It Lies

Break a common data-visualization convention: choosing two numbers does not guarantee a chart.

If the selected pair does not share a declared comparison group, the interface refuses to create one magnitude axis. The refusal occupies the chart space itself and explains why it stopped.

No incompatible pair receives a ratio, percent difference, winner, normalized score, or fake common scale.

### Decision

**Concept A was discarded** as the least engaging presentation. Its dimensional and semantic registry survives as the rule engine.

Concepts B and C became **The Gauge Bench / Break the Chart Before It Lies**.

## Product contract

The feature reads only existing normalized values already present in `MuseumCommonsSnapshot`.

It adds no acquisition, provider metadata, alternate normalizer, or raw-response retention.

The fixed registry contains exactly nine current claims:

1. strongest earthquake magnitude;
2. past-hour earthquake count;
3. solar-wind speed;
4. minimum fixed-point temperature;
5. maximum fixed-point temperature;
6. mean fixed-point terrestrial wind;
7. maximum fixed-point terrestrial wind;
8. precipitation-reporting point count;
9. open EONET natural-event count.

Each registry entry declares:

- a broad dimension family;
- a narrower Museum-local comparison group;
- a semantic subject;
- native display unit;
- display precision;
- the authoritative normalized snapshot field.

The comparison rule never inspects the numeric values to decide whether a pair is legitimate.

## Comparison outcomes

### COMMON RULER

A common ruler is permitted only when both claims have the same declared `comparisonGroup`.

The initial compatible pairs are:

- minimum fixed-point temperature ↔ maximum fixed-point temperature;
- mean fixed-point terrestrial wind ↔ maximum fixed-point terrestrial wind.

For a compatible pair the interface may show:

- both authoritative current values;
- a signed native-unit difference defined as `B - A`.

It does not calculate a ratio, percentage, winner, score, or normalized cross-unit quantity.

### SAME DIMENSION, DIFFERENT THING

This state is used when both claims share a broad dimension but do not share one semantic comparison group.

Important fixed examples are:

- solar-wind speed ↔ terrestrial wind speed;
- earthquake count ↔ precipitation-reporting point count;
- earthquake count ↔ open EONET event count.

The first pair consists of speed quantities but describes different phenomena and observational contexts. The count pairs are all integers but count different populations under different definitions.

This state explicitly demonstrates that matching dimensions, numeric types, or count-like syntax do not automatically create one meaningful magnitude axis.

### NO COMMON AXIS

This state is used when the broad dimensions differ.

For example, strongest earthquake magnitude and fixed-point temperature do not share one declared dimension family or comparison group.

The chart area is replaced by a visible axis break rather than a fabricated shared scale.

## Missing values

Missing is not zero.

If a selected provider channel is unavailable or the authoritative normalized field is non-finite, that claim's current value is shown as missing.

The comparison contract remains visible because it is a static Museum-local declaration, but no native-unit difference or common ruler is rendered until both current values exist.

There is no previous-latch fallback.

## Same-claim selection

The interface exposes two claim trays, **GAUGE A** and **GAUGE B**.

The claim currently selected on the opposite tray is disabled. This prevents the bench from creating a trivial same-claim comparison while keeping all nine fixed claims available on both sides.

The initial pair is minimum temperature versus maximum temperature.

Both trays reset to that initial pair on every real `museum:commons-snapshot` event.

All interaction state is memory-only.

## The shared-ruler presentation

When a pair is compatible, the chart space becomes a simple comparator bridge:

- Gauge A current value;
- a central native-unit `B - A` difference;
- Gauge B current value.

The bridge is intentionally not a global domain or score. It does not invent a zero baseline or map unlike measures onto one normalized range.

When a pair is not compatible, the chart space physically splits into two independent half-axes with the refusal state in the middle.

The absence of a shared chart is the useful result.

## What the feature refuses to claim

The feature does not produce or imply:

- universal scientific comparability rules;
- data quality;
- reliability;
- confidence;
- uncertainty;
- importance;
- risk;
- causal relation;
- provider ranking;
- station ranking;
- a cross-unit score;
- a cross-family ratio;
- a cross-family percentage difference;
- a winner or loser.

A **COMMON RULER** means only that this Museum interface declares the two selected current claims to share one magnitude comparison group.

A refusal means only that this interface declines to place that pair on one magnitude axis.

## Relationship to existing COMMONS instruments

The Gauge Bench occupies a separate epistemic axis.

- Difference Engine compares the same weather quantity between two fixed points.
- Reverse Ledger traces a displayed claim back through its transformations and inputs.
- Rest Score distinguishes sounded values, written zero, missing, and not-applicable states.
- Offcut Drawer exposes range guarding and display precision.
- Border Office exposes local categorical thresholds.
- Load-Bearing Sample exposes one-point influence inside selected weather aggregates.
- Gauge Bench decides whether two already-normalized claims are allowed to share one magnitude axis at all.

It does not replace any of those instruments.

## Field sheet and print

The full interactive Gauge Bench is omitted from print.

A compact field-sheet line remains. It records the currently selected pair and comparison outcome and states the governing rule:

- shared rulers require a declared Museum-local comparison group;
- same dimension can still mean different semantic subjects;
- cross-family normalization is refused.

## Runtime and privacy boundary

The feature adds no:

- public-data or external request;
- response clone;
- raw-provider response retention;
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

- both claim trays use native buttons;
- selected claims expose `aria-pressed`;
- the opposite tray's currently selected claim is disabled to prevent same-claim pairing;
- the comparison verdict uses a polite live region;
- every dimension, semantic subject, current value, refusal state, and native-unit difference is written in text;
- meaning does not depend on color;
- controls retain a minimum 44px target size;
- the layout collapses below 760px and 620px;
- reduced-motion removes the deliberately skewed break effect;
- increased contrast strengthens boundaries;
- the full interactive bench is omitted from print while the qualified field-sheet line remains.

## Offline behavior

`gauge-bench-core.js`, `gauge-bench.js`, `gauge-bench.css`, and this design record belong to the same-origin coherent Museum shell.

Implementation began while **v32 Load-Bearing Sample** was current. Before release evidence could be accepted, concurrent **Page Four Rumor Relay** landed on live `main` and legitimately became **v33 Page Four Rumor Relay**, updating Page Four/Web1 runtime plus the coherent offline shell.

The Gauge Bench therefore preserves the v32 Load-Bearing Sample marker, preserves the v33 Page Four Rumor Relay marker and runtime assets, and advances the successor shell to **v34 Gauge Bench**.

If another release lands before merge, the feature must again reconcile with exact live `main` and advance beyond that new current shell rather than overwriting it.

## Validation contract

Focused tests must verify:

- exactly nine fixed registry claims;
- authoritative extraction from the actual normalized snapshot fields;
- minimum versus maximum temperature → **COMMON RULER**;
- mean versus maximum terrestrial wind → **COMMON RULER**;
- solar-wind speed versus terrestrial wind → **SAME DIMENSION, DIFFERENT THING**;
- earthquake count versus precipitation-reporting point count → **SAME DIMENSION, DIFFERENT THING**;
- earthquake count versus EONET event count → **SAME DIMENSION, DIFFERENT THING**;
- earthquake magnitude versus temperature → **NO COMMON AXIS**;
- compatible native-unit difference uses `B - A` only;
- incompatible pairs never receive a numeric difference or common ruler;
- missing authoritative values remain missing rather than zero;
- the contract remains declared when a current value is missing;
- opposite-tray same-claim buttons are disabled;
- selection resets on every real latch;
- the feature is pinned to the current snapshot field names and current reducer declarations in `data-core.js`;
- no request, storage, timer, location, tracking, visitor-input, or remote-runtime API exists in feature code;
- keyboard, live-region, responsive, reduced-motion, increased-contrast, and print behavior;
- loader order after Load-Bearing Sample;
- coherent offline-shell inclusion and release-marker preservation.

## Rebuild rule

Preserve these invariants:

1. Keep the registry fixed and explicit; never infer comparability from the values themselves.
2. Keep normalized `MuseumCommonsSnapshot` values authoritative.
3. A shared ruler requires an exact comparison-group match.
4. A broad dimension match alone is insufficient.
5. Keep the solar-wind versus terrestrial-wind false friend.
6. Keep the count-population false friends.
7. Keep incompatible pairs free of ratios, percentages, winners, rankings, and normalized scores.
8. For compatible pairs, keep the only cross-value arithmetic to signed native-unit `B - A` difference.
9. Keep missing distinct from zero and do not use previous-latch fallback.
10. Prevent same-claim pairing in the interface.
11. Reset both trays on every real Commons latch.
12. Keep the declaration explicitly Museum-local rather than a universal scientific ontology.
13. Add no acquisition, raw-response retention, provider metadata, visitor input, tracking, persistence, timer loop, or external runtime dependency.
14. Keep the full bench out of print and preserve only a qualified field-sheet note.
15. Pin tests to the actual normalized snapshot fields and reducer declarations.
16. Preserve v33 Page Four Rumor Relay and any later concurrent release before advancing the coherent same-origin shell.
17. Require the feature-complete head to pass `check`, then add the repository Success Archive entry and its focused assertion, then require the archive-bearing head to pass `check` again before merge.