# Page Four Instrument Room

## Outcome

The Instrument Room turns one documented anomaly archive into a procedural investigation rather than another mystery card.

It uses the 1984 Project Hessdalen field campaign as the primary case and forces seven evidence channels to keep their strengths, nulls, coverage gaps and instrument limitations visible. Four competing hypotheses can then be cross-examined against those same channels. Three modern official AARO cases act as methodological controls showing how geometry, observer motion, atmosphere and sensor limits can change an extraordinary-looking observation without being treated as explanations for Hessdalen.

The interaction rule is:

> Strange deserves investigation. Investigation deserves evidence. Evidence does not owe us a strange answer.

## Investigation gate

### Concept A — Hessdalen Field File

The logical procedural case. The 1984 final technical report contains a rare combination of visual classification, radar, radio spectrum, magnetic, laser-response, seismic, radiation and infrared evidence, plus explicit measurement limitations and unresolved conclusions.

### Concept B — The Sensor Stack

The cross-case method. NASA UAP methodology and AARO case resolutions show why range, geometry, observer motion, atmosphere, calibration and metadata belong inside the evidence file rather than being treated as cleanup after an interpretation.

### Concept C — The Observer-Dependent Intruder

The dangerous hypothesis: one underlying phenomenon presents a different manifestation to each observing instrument.

**Discarded:** C. The available evidence does not establish a single hidden mechanism that changes appearance by observation channel. It would require repeatable synchronized independent detections with preserved calibration, timing, location and metadata that survive known artifacts.

**Merged:** A + B into **The Instrument Room — Hessdalen, 1984 / Every Sensor Gets Cross-Examined**.

## What changed

- Added `page-four-instrument-room.js` and `page-four-instrument-room.css` as progressive local Page Four assets.
- Added seven historical field channels: visual classification, radar, radio spectrum, magnetometer, laser-response test, seismograph, and combined Geiger/infrared null evidence.
- Every historical channel exposes **DOCUMENTED** and **LIMIT** text derived from the source ledger.
- Added four competing authored hypotheses:
  - H0 — Multiple ordinary sources;
  - H1 — Natural luminous phenomenon;
  - H2 — Instrument / geometry contribution;
  - H3 — Coherent external agent.
- H3 is explicitly labeled **PAGE FOUR HYPOTHESIS** and **NOT ESTABLISHED**.
- Every hypothesis contains **WHAT WOULD CHANGE OUR MIND?** and a seven-channel relation matrix using `WEIGHS FOR`, `WEIGHS AGAINST`, `INCONCLUSIVE`, or `NEUTRAL` rather than a belief score.
- Added three modern control files: GoFast, Puerto Rico and Mt. Etna.
- Added `PAGE_FOUR_HESSDALEN.md` as the complete source/provenance ledger.
- Added a same-page `11 / Instrument room` navigation route.
- Advanced the coherent offline shell from v39 Catalogue Zero to `museum-of-almost-v40-page-four-instrument-room`.

## Evidence preserved

### Visual classification

The 1984 report logged 188 light reports and treated 53 F5-or-higher reports as possible phenomenon records for analysis. The Instrument Room also preserves the report's admission that the F score was subjective and that only a small number of records combined very high strangeness and report quality.

### Radar

The report lists 36 radar recordings and three probable visual/radar coincidences. The room also preserves intermittent staffing, variable radar range, strong-return-only logging, radar-only events and approximate timing/direction limits. A radar return is not converted into an identity claim.

### Radio spectrum

The unusual repeating spectrum spikes remain in the file, but so does the decisive inconvenience: the report says they were not recorded at the same time as the lights. Possible radar noise remains visible.

### Magnetometer

The limited-window 4-of-10 pulsation coincidence remains visible beside the report's explicit statement that chance coincidence remained possible and that the instrument was not ideal for the pulsation question.

### Laser response

The reported 8-of-9 single-to-double flash changes remain visible, including the useful partial blinding procedure. The room also states that only two observations were involved, the effect was not independently instrument-recorded, and the source called for repetition.

### Seismic, radiation and infrared nulls

The campaign's no-local-seismic result, no audible Geiger change and two no-strong-IR observations remain first-class evidence. Their sensitivity, distance and sample-size limits remain attached. A null is not repurposed as positive evidence for another theory.

## Modern control files

The control files teach failure modes only.

- **GoFast:** apparent high speed changes under range, observer-motion and wind reconstruction; AARO did not definitively identify the object.
- **Puerto Rico:** apparent splitting/transmedium behavior changes under reconstructed look angle, occlusion and two-object motion.
- **Mt. Etna:** apparent extreme speed through a plume changes under reconstructed range plus atmospheric and sensor effects.

The interface states: **CONTROLS TEACH FAILURE MODES. THEY DO NOT RETROACTIVELY EXPLAIN HESSDALEN.**

## Interaction model

The visitor does not enter a theory or vote on belief.

They can:

1. inspect the seven historical evidence channels;
2. select one of four fixed hypotheses;
3. read how each field channel bears on that claim;
4. see exactly what new evidence would change the assessment;
5. load one of three modern control files to study a known analysis failure mode.

All state is in-memory and changes only after explicit button activation. Reload returns the room to its fixed initial hypothesis and control.

## Privacy, security, accessibility and offline boundaries

- No external source page, script, font, image, embed, media or API is loaded at visitor runtime.
- No analytics, telemetry, visitor counting, cookies, localStorage, sessionStorage, IndexedDB, geolocation, account or cloud state.
- No visitor free-text or numeric input.
- No polling, timers or animation-frame loops.
- No Web Share API.
- DOM nodes are created through DOM APIs rather than HTML-string injection.
- Hypothesis and control selectors expose grouped button semantics and `aria-pressed` state.
- Dynamic analysis uses polite live regions.
- Controls preserve 44px minimum target size and visible keyboard focus.
- Responsive, reduced-motion, increased-contrast and print behavior are explicit.
- The service worker remains same-origin, fresh-online and cached-offline.

## Source provenance

Exact source URLs, quotations-by-summary, caveats and hypothesis boundaries are recorded in `PAGE_FOUR_HESSDALEN.md`.

Primary case source:

- Project Hessdalen 1984 Final Technical Report.

Method/control sources:

- NASA UAP Independent Study materials;
- AARO GoFast case resolution;
- AARO Puerto Rico case resolution;
- AARO Mt. Etna case resolution.

The external URLs live only in repository documentation, not visitor runtime code.

## Adversarial review

Review specifically challenged:

- whether a null result was being treated as evidence for a preferred alternative;
- whether visual/radar coincidence was being upgraded into identity;
- whether non-simultaneous radio evidence was being silently presented as simultaneous;
- whether limited magnetic/laser/IR evidence was overstated;
- whether AARO control cases were being implied to explain Hessdalen;
- whether H3 crossed from Page Four speculation into sourced fact;
- whether runtime introduced remote requests, persistence, free text or unbounded execution.

No Critical or High product/security finding remained.

A test-quality defect was caught before the required workflow ran: two design-gate regexes matched the wrong Markdown punctuation for `**Discarded:**` and `**Merged:**`. The source ledger was correct. The test matchers were corrected without weakening the assertions.

## Validation

Initial exact baseline:

`c380a6479078481018f0ddb904d9a4dae9371dab`

Feature-complete head:

`733e0f8514043cf55ab57a8d9af547ec0ee59f16`

PR:

`#84 — Add Page Four Hessdalen instrument room`

Required workflow:

- `Check museum` run **271** passed on the exact feature-complete head.
- The job remained exactly `check`.
- The run passed JavaScript syntax, every existing Museum feature test, the wider Page Four test, the focused Hessdalen Instrument Room test, Elsewhere, the v40 service-worker lifecycle and the repository privacy/application contract.

Because this recovery record changes the branch head, the exact archive-bearing head must pass the complete required `check` again before merge.

## Rebuild recipe

1. Start from the existing Page Four fiction and Evidence Lattice without reclassifying either layer.
2. Choose a primary case with a source record rich enough to preserve positive, negative and failed measurements.
3. Write `DOCUMENTED` and `LIMIT` for every instrument before writing any Page Four hypothesis.
4. Preserve null channels and inconvenient non-coincidences.
5. Build at least one conventional baseline hypothesis and one evidence-quality/instrument hypothesis before an extraordinary hypothesis.
6. Require every hypothesis to state what evidence would change the assessment.
7. Use resolved modern cases only as methodological controls; never use analogy as explanation.
8. Keep visitor interaction fixed-choice, local and memory-only.
9. Add focused source-boundary, privacy, accessibility and offline regression tests.
10. Reconcile against exact live `main`, require exact-head CI, merge only while behind zero, and verify post-merge CI and Pages.

## Anti-drift invariants

- Null results remain evidence and cannot be deleted because they make the case less dramatic.
- Coincidence never becomes identity without additional evidence.
- Non-simultaneous records cannot be narrated as simultaneous.
- Instrument limits and missing metadata remain attached to the observation they constrain.
- A modern resolved case may teach a failure mode but may not explain a different historical case by analogy alone.
- H3 and any future extraordinary hypothesis remain explicitly Page Four analysis until evidence independently supports them.
- Every hypothesis must state falsifying or assessment-changing evidence.
- Existing nine fictional Page Four files remain fictional.
- Existing six Evidence Lattice dossiers remain distinct real-source records.
- COMMONS / NOW remains outside conspiracy-fiction framing.
- Preserve local-only runtime, no visitor state, no tracking, no third-party dependencies, and fresh-online / cached-offline behavior.