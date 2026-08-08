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

The signal box is entirely local. Beyond loading its own same-origin script and stylesheet assets, it makes no data-service or external request, accepts no visitor-entered coordinates or text, stores no dispatch state, and uses no timers, location access, analytics, telemetry, remote assets or dependencies.

### Gravitational Copy Room / One Source, More Than One Image

The eighth instrument uses an idealized circular point-mass gravitational lens normalized to an Einstein radius of `1`. A fixed fictional source identity, `SRC-01`, is placed at one of three fixed source offsets `y = beta / theta_E`.

The local model uses:

`y = x - 1/x`

with non-aligned solutions:

`x+ = (y + sqrt(y² + 4)) / 2`

`x- = (y - sqrt(y² + 4)) / 2`

For nonzero source offset, the interface deliberately renders two apparent-image cards carrying the same immutable source identity. Their opposite parity is written explicitly. This breaks the normal web assumption that repeated cards necessarily represent repeated records.

For exact alignment, `y = 0`, the two one-dimensional roots at `x = +/-1` represent a continuous Einstein ring in the circular model. The interface therefore replaces the discrete cards with a ring state instead of pretending the aligned geometry is simply another two-image case.

The stage is schematic and normalized. It is not a sky map, mass estimator, distance estimator, magnification tool, time-delay model, or real lens reconstruction. Exact numerical solutions remain authoritative. Full design, source basis, accessibility contract and rebuild rules are documented in `GRAVITATIONAL_COPY_ROOM.md`.

The section mounts after the Causal Signal Box through the existing local `deep-space.js` bootstrap, preserving deterministic Instrument 07 → Instrument 08 order without rewriting the proven static document. Beyond normal same-origin local asset loading it makes no data-service or external request, accepts no visitor-entered astrophysical parameters, stores no case selection, and uses no timers, location access, analytics, telemetry, remote assets or dependencies.

### Redshift Ruler / The Tick Marks Will Not Stay Put

The ninth instrument models cosmological redshift with one fixed generic `500 nm` reference wavelength and three fixed cases: `z = 0.1`, `1`, and `6`.

The exact local relations are:

`1 + z = lambda_obs / lambda_emit`

`lambda_obs = lambda_emit (1 + z)`

and, with today's scale factor normalized to `a_obs = 1`:

`a_emit = 1 / (1 + z)`

The calculated observed wavelengths are therefore `550 nm`, `1000 nm`, and `3500 nm` for the three fixed cases. The corresponding emission scale factors are `1/1.1`, `0.5`, and `1/7`.

The convention-breaking visualization makes the observed ruler's screen span change by exactly `1 + z` relative to the fixed emitted ruler. Large redshift can therefore create intentional horizontal overflow inside the instrument viewport. That overflow is a local teaching device, not a broken responsive layout and not a second scientific calculation.

The feature covers **cosmological redshift only**. It does not infer Doppler velocity, gravitational redshift, peculiar velocity, distance, lookback time, cosmic age, `H0`, density parameters, a real source identity, or a real spectral-line identification. The ruler is schematic; exact numerical readouts remain authoritative. Full design, source basis, accessibility contract and rebuild rules are documented in `REDSHIFT_RULER.md`.

The Redshift Ruler mounts after the Gravitational Copy Room through the existing same-origin bootstrap, preserving deterministic Instrument 07 → 08 → 09 order without rewriting `deep-space.html`. It adds no data-service or external runtime request, visitor-entered values, storage, cookies, history state, location access, analytics, telemetry, timer loop, remote assets or dependencies.

### Origin Machine / Every Point Gets to Be Zero

The tenth instrument uses five fictional fixed comoving markers at `χ = -4, -2, 0, +3, +5` and three normalized scale factors, `a = 0.5`, `1`, and `2`, in a deliberately flat one-dimensional homogeneous expansion toy.

Any marker can become coordinate zero. For marker coordinate `χ` and selected origin `χ_observer`, the exact local relations are:

`x_relative = a (χ - χ_observer)`

`D = a |χ - χ_observer|`

Changing the selected origin therefore changes every signed coordinate description without mutating marker identity, fixed comoving coordinate, or pairwise geometry. Changing `a` multiplies every normalized separation by the same factor. The interface breaks the normal web convention of a permanent coordinate origin by physically re-centering the selected marker in the bounded stage.

Only horizontal position carries the toy spatial coordinate. Marker glyph size remains fixed, and vertical staggering exists only to keep compressed labels legible; it is not a second spatial coordinate. The finite five-marker stage is not an edge or center of the real Universe, and the exact ledger remains authoritative over schematic screen geometry.

The feature does not calculate a Hubble constant or parameter, recession velocity, redshift, acceleration, horizon, nonzero curvature, causal visibility, or real-object distance. It does not claim that a selected marker is a privileged observer or physical center. Full design, source basis, accessibility contract and rebuild rules are documented in `ORIGIN_MACHINE.md`.

The Origin Machine mounts after the Redshift Ruler through the same-origin bootstrap, preserving deterministic Instrument 07 → 08 → 09 → 10 loading without rewriting `deep-space.html`. It adds no data-service or external runtime request, visitor-entered values, storage, cookies, history state, location access, analytics, telemetry, timer loop, remote assets or dependencies.

## Accessibility

The gallery uses semantic sections, visible keyboard focus, 44px minimum interactive targets, polite live regions for changing instrument readouts, a skip link, responsive layouts, `prefers-reduced-motion`, `prefers-contrast`, and print handling. The Possibility Engine also preserves a static initial possibility map and the full Success Archives in HTML so the historical record remains readable without JavaScript. The Frame Shifter duplicates every visual event-order change in text and removes its card transition under reduced-motion preferences. The Causal Signal Box writes every station and route state in text, gives refused dispatches immediate live-region feedback, lists each segment's `Δt` and `|Δx|`, and removes station transitions under reduced-motion preferences. The Gravitational Copy Room repeats shared source identity and parity in text, states the Einstein-ring case textually, and never relies on card duplication, mirroring, or animation alone to carry scientific meaning. The Redshift Ruler duplicates every visual width change in exact redshift, wavelength, stretch-factor and scale-factor text; confines deliberate horizontal overflow to a labeled keyboard-focusable viewport; and removes ruler transitions under reduced-motion preferences. The Origin Machine duplicates every re-centering and scale-factor result in an exact semantic table, explains that vertical label lanes are non-spatial, keeps the stage keyboard-focusable, and disables horizontal marker motion under reduced-motion preferences.
