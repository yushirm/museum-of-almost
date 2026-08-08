# Deep Space / Almost

`deep-space.html` is the Museum's second gallery. It is intentionally separate from Commons / Now and does not reuse, mutate or depend on the live world snapshot.

## Product contract

- Static and GitHub Pages compatible.
- No account, visitor identity, geolocation, analytics, telemetry or visitor free-text.
- No third-party runtime scripts, fonts, media or APIs.
- No runtime network request beyond same-origin service-worker registration and normal local asset loading.
- Works from relative paths under the GitHub Pages project URL.
- Included in the offline application shell.

## Scientific instruments

### Light as a clock

The page uses the exact SI speed of light, `299,792.458 km/s`, and the exact IAU astronomical unit, `149,597,870.7 km`, to convert fixed reference distances into one-way light travel times.

The Moon distance (`384,400 km`), Proxima Centauri distance (`4.2465 ly`), Milky Way diameter (`100,000 ly`) and Andromeda distance (`2.5 million ly`) are deliberately rounded reference values. They are not live ephemerides or precision astrometry.

### Gravity as geometry

The event-horizon instrument uses the Schwarzschild radius:

`r = 2GM / c²`

It is explicitly presented as a non-rotating, uncharged approximation. Real astrophysical black holes are expected to rotate.

Reference masses are rounded: `10` solar masses, `4.3 million` solar masses for Sagittarius A*, and `6.5 billion` solar masses for M87*.

### Cosmic inventory

The `4.9% / 26.8% / 68.3%` ordinary-matter / dark-matter / dark-energy split is a rounded reference representation of the standard cosmological model, not a live measurement and not a claim that the underlying physics is fully understood.

### Unsolved room

The mystery cards deliberately separate observationally grounded statements from unresolved theory. They avoid ranking hypotheses or presenting speculative answers as settled science.

### Possibility Engine / Success Archives

The fifth instrument uses three fixed historical case studies to show how evidence can reduce a possibility space without turning scientific method into a certainty game. Each case begins with a small set of deliberately broad possibilities. Fixed evidence steps can leave a possibility open, place it under pressure, retire the narrower claim for that case, or mark it as having survived that evidence.

Those labels are categorical. The visual bar width is not a probability, confidence score, Bayesian posterior, or ranking of scientific importance. A surviving possibility is not presented as permanently correct, and a retired possibility is scoped to the evidence and wording shown by the case.

The **Success Archives** are organized by the kind of epistemic revision the evidence forced rather than by publication date. They preserve three cases: the solar-neutrino puzzle becoming evidence for flavour change and non-zero neutrino mass; distant-supernova observations overturning the expected late-time cosmic slowdown; and the first direct observation of gravitational waves by LIGO. Source records and the pre-code design gate are documented in `POSSIBILITY_ENGINE.md`.

The instrument is entirely local. It does not fetch papers, query a science service, accept visitor text, store progress, assign scores, or keep a history of clicks. Selecting another case or reloading starts from the fixed initial map.

### Frame Shifter / No Universal Now

The sixth instrument demonstrates one-dimensional special relativity using three fixed event pairs and five fixed inertial frames. Distances are expressed in light-seconds and times in seconds, so the local calculation uses `c = 1`.

For `beta = v/c`, it applies:

`Δt′ = gamma (Δt - beta Δx)`

`Δx′ = gamma (Δx - beta Δt)`

with:

`gamma = 1 / sqrt(1 - beta²)`

The instrument verifies the invariant `Δx² - Δt²` before classifying each pair as spacelike, lightlike or timelike. The default spacelike pair is simultaneous in the gallery frame and reverses coordinate-time order between opposite moving frames. Lightlike and timelike pairs retain causal order across every displayed subluminal frame.

The deliberately misaligned event cards are a visualization of transformed coordinate time, not a physical scale. Exact numerical readouts remain authoritative. Full design, calculation, accessibility and rebuild rules are documented in `FRAME_SHIFTER.md`.

The Frame Shifter is entirely local and timer-free. It makes no request, accepts no visitor-entered values, stores no frame selection, and resets to the fixed gallery-frame state on reload.

### Causal Signal Box / The Button Cannot Reach Everything

The seventh instrument turns causal reachability into a fixed spacetime routing problem. It uses fictional station events with coordinates in seconds and light-seconds, again with `c = 1`.

For each route segment, the local interlock compares future coordinate-time separation `Δt` with spatial separation `|Δx|`. A future-directed segment clears only when `Δt >= |Δx|`. Equality is explicitly labeled the **LIGHT-SPEED EDGE**; a smaller non-negative `Δt` is **LOCKED OUTSIDE CONE**; negative `Δt` is **LOCKED IN THE PAST**.

The convention-breaking interaction is intentional: one dispatch click may update only the causally reachable prefix of the selected fixed route. In the **Impossible shortcut** case, ORIGIN can reach RELAY, so RELAY changes to RECEIVED, but RELAY cannot reach FAR at its fixed event coordinate, so FAR remains unchanged and becomes REFUSED. This makes the browser stop implying that a click has unlimited action-at-a-distance reach.

The screen response is immediate. No timer is used to imitate physical light-travel time. The physical rule is represented only by which fixed targets are permitted to change. The diagram is schematic and never becomes a measuring surface; exact coordinates and segment readouts remain authoritative.

The section is mounted by the existing local `deep-space.js` bootstrap after the static gallery is available, keeping the large proven document untouched while the feature remains a same-origin progressive enhancement. The full design gate, fixed routes, causal classification, accessibility contract and rebuild rule are documented in `CAUSAL_SIGNAL_BOX.md`.

The signal box is entirely local. It makes no request, accepts no visitor-entered coordinates or text, stores no dispatch state, and uses no timers, location access, analytics, telemetry, remote assets or dependencies.

## Accessibility

The gallery uses semantic sections, visible keyboard focus, 44px minimum interactive targets, polite live regions for changing instrument readouts, a skip link, responsive layouts, `prefers-reduced-motion`, `prefers-contrast`, and print handling. The Possibility Engine also preserves a static initial possibility map and the full Success Archives in HTML so the historical record remains readable without JavaScript. The Frame Shifter duplicates every visual event-order change in text and removes its card transition under reduced-motion preferences. The Causal Signal Box writes every station and route state in text, gives refused dispatches immediate live-region feedback, lists each segment's `Δt` and `|Δx|`, and removes station transitions under reduced-motion preferences.
