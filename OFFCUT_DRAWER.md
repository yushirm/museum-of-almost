# The Offcut Drawer / The Page Shaves Its Numbers

## Design gate

Three directions were evaluated before implementation.

### Concept A — Display Precision Audit

A conventional next feature would list selected current numeric fields beside their normalized in-memory values, display values, and formatting rules.

That would be useful, but it would be another administrative table. It would explain the interface without becoming an instrument.

### Concept B — The Offcut Drawer

Borrow machine-shop language. A finished part exists because material was removed. The polished number printed by the interface can likewise differ from the bounded numeric value that entered normalization.

The discarded numeric remainder is the **offcut**.

### Concept C — Put the Discarded Digits in the Biggest Type

Break a normal interface convention: polished values usually receive the strongest visual authority while rounding residues disappear.

This instrument reverses that hierarchy. When rounding changes a selected number, the signed residue is visually louder than the polished number. Exact values stay smaller.

### Decision

**Concept A was discarded** as the least additive. Its useful precision-accounting model remains inside the merged instrument.

Concepts B and C became **The Offcut Drawer / The Page Shaves Its Numbers**.

## Product contract

The instrument records a fixed precision trace for 15 numeric paths already participating in the current COMMONS / NOW acquisition:

1. strongest USGS earthquake magnitude;
2. NOAA solar-wind speed;
3. thirteen Open-Meteo current temperature readings, one for each fixed world point.

It adds no data-service request. The trace is derived from the same already-fetched public response objects observed by the existing Sounding Well fetch wrapper.

That observer already keeps short-lived cloned response objects until the five-feed latch event so it can derive timestamp semantics. The Offcut Drawer does not add a second cloning layer or extend that lifetime. It selects the finite numerics it needs, publishes the 15-path trace, and the existing cycle records are cleared immediately afterward.

The persistent in-memory precision trace contains selected public numerics only, never whole raw payloads.

## Four stages

Each trace has four explicitly different stages:

1. **Selected source numeric** — the finite number selected from the already-fetched public response for this fixed path.
2. **After range guard** — the number after the same accepted-range boundary used by the Commons normalizer.
3. **Normalized latch** — the authoritative number already stored in `MuseumCommonsSnapshot`.
4. **Main display numeric** — the numeric value represented by the main Commons display rule.

The trace never becomes an alternate data path. The normalized snapshot remains authoritative for every Museum instrument.

## What an offcut means

The signed offcut is:

`bounded numeric - displayed numeric`

Therefore:

- positive offcut means the display rounded down;
- negative offcut means the display rounded up;
- zero means the bounded and displayed numerics are equal;
- missing means a complete current numeric path does not exist.

The state labels are:

- **EXACT**;
- **ROUNDED UP**;
- **ROUNDED DOWN**;
- **MISSING**.

The sign convention is deliberately written into the interface and accessibility text.

## Bounding is not rounding

The accepted-range guard is shown separately.

If a selected source numeric lies outside the same normalizer range, the card says **RANGE GUARD APPLIED**. That change is not folded into the offcut metaphor.

The fixed mirrored ranges are:

- earthquake magnitude: `-2` to `10`;
- solar-wind speed: `0` to `2000 km/s`;
- point temperature: `-100` to `70°C`.

Focused tests compare these declarations against the established Commons normalization and display rules so drift becomes a failing check rather than a silent second interpretation.

## Existing normalization remains authoritative

The Offcut Drawer does not replace or mutate:

- `normalizeEarthquakes`;
- `normalizeSolarWind`;
- `normalizeWeather`;
- the Sample-and-Hold barrier;
- the current snapshot;
- the Witness Seal;
- the Reverse Ledger;
- the Rest Score.

The trace observes the transformation path and uses the already-normalized snapshot value as its third stage.

## Display rules represented

The 15 paths deliberately cover the visible numeric formatting rules that make the offcut concept legible without turning the instrument into an exhaustive renderer audit:

- strongest magnitude: normalized to one decimal and displayed at one decimal;
- point temperatures: normalized to one decimal and displayed at one decimal;
- solar-wind speed: normalized to one decimal and displayed as a whole `km/s` value using the existing `Math.round` rule.

The fixed scope must be stated. The drawer does not claim to enumerate every numeric transformation anywhere in the Museum.

## No uncertainty claim

The offcut is **not**:

- sensor error;
- provider error;
- uncertainty;
- confidence;
- accuracy;
- significant figures;
- a statement about the provider's measurement precision;
- a quality score;
- a reliability score;
- evidence that one provider is better than another.

A larger offcut is not worse data. Unlike units are never ranked against each other.

## Interaction

Five native memory-only buttons filter the fixed current trace set:

- All;
- Exact;
- Rounded up;
- Rounded down;
- Missing.

Filtering changes only which trace cards are visible. It does not alter the snapshot, precision trace, requests, other instruments, or field sheet.

Both the real latch event and the dedicated local precision-trace event reset the filter to **All**.

## Sample-and-hold behavior

The precision trace follows the same current-latch boundary without changing the latch itself.

During acquisition, the previous snapshot and previous precision trace remain visible. `app.js` commits the new normalized snapshot and dispatches the existing `museum:commons-snapshot` event only after all five requests settle. The already-installed Sounding Well listener handles that event, derives the new precision trace synchronously from its matching fetch-cycle records plus the just-committed snapshot, publishes `MuseumCommonsPrecisionTrace`, dispatches the local `museum:commons-precision-trace` event, and then clears the short-lived records.

Because `offcut-drawer-core.js` is a static deferred script placed before `temporal-sounding.js` and `app.js`, the precision core exists before the shared observer and first acquisition run. No dynamic-load race is required to produce the first trace.

A failed feed produces missing trace paths for its selected measures. No previous numeric path is substituted into the new trace.

## Field sheet and print

The full interactive drawer is omitted from print.

A compact field-sheet line remains, stating:

- how many of the 15 fixed traces changed through rounding;
- how many are missing;
- that the residue is bounded minus displayed;
- that range guards are separate;
- that the result is not uncertainty, accuracy, provider precision, or quality.

## Runtime and privacy boundary

The feature adds zero data-service requests.

It also adds no:

- polling or timer loop;
- storage, cookies, IndexedDB, or history state;
- browser location access;
- visitor free-text or numeric input;
- analytics, telemetry, ads, or tracking;
- remote script, font, image, media, API, or dependency;
- account, authentication, or cloud state.

The feature's own JavaScript, CSS, and design record are same-origin static Museum assets.

The selected trace contains only public scientific numerics already acquired for the Museum. It contains no visitor or owner information.

## Accessibility

- filters are native buttons with `aria-pressed`;
- summary changes use a polite live region;
- every state is written in text and never depends on color;
- every card states all four numeric stages in text;
- offcut sign meaning is duplicated in prose;
- controls retain 44px minimum targets;
- narrow layouts collapse cleanly;
- increased-contrast preferences strengthen borders;
- reduced-motion removes card transitions and decorative rotation;
- the field sheet preserves a compact textual record for print.

## Offline behavior

`offcut-drawer-core.js`, `offcut-drawer.js`, `offcut-drawer.css`, and this record are same-origin assets in the Museum's coherent offline shell.

The precision core is loaded statically before the Sounding Well observer and `app.js`; the interactive Offcut Drawer view mounts later through the existing local progressive module chain after the Rest Score.

If JavaScript is unavailable, the existing static Commons remains readable; the Offcut Drawer simply does not mount.

## Rebuild rule

Keep the drawer observational. Never let it become a second normalizer.

Preserve these invariants:

1. Use only response objects already fetched by the Commons and already observed by the existing passive fetch wrapper.
2. Add no second response-cloning layer and do not extend the observer's raw-payload lifetime.
3. Persist selected numerics only, never whole raw payloads.
4. Treat the current normalized snapshot as authoritative.
5. Show range bounding separately from rounding.
6. Define offcut as bounded minus displayed and keep the sign explanation visible.
7. Never compare unlike-unit offcut magnitudes.
8. Never convert counts into percentages, quality scores, confidence, uncertainty, or provider rankings.
9. Reset filters on every real latch / precision publication.
10. Keep the full interactive drawer out of print and carry only a compact qualification onto the field sheet.
11. Advance the coherent same-origin offline shell without discarding concurrently merged Museum assets.