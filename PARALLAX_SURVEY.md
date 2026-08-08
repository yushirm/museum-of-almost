# Parallax Survey

## Room

DEEP SPACE / ALMOST

## Generation thesis

The room had accumulated a strong but increasingly habitual interaction family: choose or press a control, then watch exact readouts change. This generation keeps the room's fixed-model honesty and rejects the control/readout reflex.

**The Parallax Survey / One Orbit, Three Triangles** is a static survey plate. It uses no visitor control and no runtime state. The visitor reads three fixed synthetic stellar-parallax cases side by side.

## Evolutionary selection

### Retention

Keep Deep Space's strongest trait: every visible claim is backed by a narrow mathematical model whose limits are stated in the room.

### Pressure

Recent Deep Space generations overexpressed button-driven comparison instruments. The scientific subject was changing; the interaction grammar was not.

### Mutation

Replace active manipulation with a fixed spatial document. The page becomes something closer to a survey sheet than a dashboard.

### Crossover

Borrow the baseline-and-sightline logic of land surveying. Astronomy measures a known observer baseline and a tiny angular displacement to infer distance.

### Reversal

A new instrument does not have to ask the visitor to operate it. This one refuses controls entirely. Its scientific lesson is carried by juxtaposition, scale and a ledger.

## Fixed model

Astronomical parallax `p` is half the apparent seasonal displacement of a nearby star when observed from opposite sides of Earth's orbit.

For small stellar parallax angles, the standard relation is:

`d(pc) ≈ 1 / p(arcsec)`

The three synthetic cases are:

| Case | Parallax `p` | Full seasonal shift `2p` | Distance | Approx. light-years |
| --- | ---: | ---: | ---: | ---: |
| Survey A | 1 arcsec | 2 arcsec | 1 pc | 3.26 ly |
| Survey B | 0.1 arcsec | 0.2 arcsec | 10 pc | 32.6 ly |
| Survey C | 0.01 arcsec | 0.02 arcsec | 100 pc | 326 ly |

The light-year conversions use the fixed local factor `1 pc = 3.26156 ly` for display only.

## Scientific boundary

The instrument deliberately uses synthetic cases rather than pretending to fit real astrometric observations.

It does not model:

- measurement uncertainty;
- proper motion;
- binary orbital motion;
- perspective acceleration;
- real catalogue measurements;
- detector calibration;
- relativistic astrometric corrections;
- the observational limits of a particular telescope or mission.

The sky diagrams are schematic. The apparent offsets are magnified for legibility and are not to angular scale. The written arcsecond values and table are authoritative.

The `d(pc) ≈ 1/p(arcsec)` relation is presented explicitly as the standard small-angle stellar-parallax relation, not as an unrestricted distance law for arbitrary angles or arbitrary distances.

## Runtime boundary

The feature is entirely local and deterministic:

- `parallax-survey-core.js` owns fixed frozen cases and pure calculations;
- `parallax-survey.js` creates the static semantic section using DOM APIs and `textContent`;
- `parallax-survey.css` supplies the survey-sheet layout and schematic sky plates;
- there are no controls, timers, polling loops, persistence mechanisms, visitor inputs or external requests.

No account, authentication, location, analytics, telemetry, cookies, storage, third-party script, font, image, media, API or build dependency is added.

## Accessibility

The diagrams are decorative and hidden from the accessibility tree. Every scientific quantity appears in semantic text and in the survey ledger table. The layout collapses to one column on narrower screens, the table can scroll horizontally when necessary, increased-contrast behavior is explicit, and the feature contains no motion that must be followed to understand the science.

## Source basis

Documentation sources only; none are loaded by visitor runtime.

- NASA Science, Universe glossary — parallax and parsec definitions: https://science.nasa.gov/universe/glossary/
- NASA Hubble — stellar parallax described as geometry using Earth's orbital baseline: https://science.nasa.gov/missions/hubble/hubble-stretches-stellar-tape-measure-10-times-farther-into-space/

## Anti-drift invariants

- exactly three fixed synthetic cases remain present unless the product contract explicitly changes;
- their parallax angles remain `1`, `0.1`, and `0.01` arcseconds;
- full seasonal displacement remains `2p`;
- inferred parsec distances remain `1`, `10`, and `100` under the stated small-angle relation;
- the feature remains control-free and state-free;
- schematic sky offsets never become scientific authority;
- no real star is silently implied by a synthetic case;
- no external runtime request, persistence, tracking or visitor input is introduced;
- later Deep Space generations may inherit the survey metaphor, but should not merely append more static parallax cards.
