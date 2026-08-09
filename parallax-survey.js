(function attachParallaxSurveyView() {
  'use strict';

  const core = window.MuseumParallaxSurveyCore;
  if (!core) return;

  function make(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof text === 'string') node.textContent = text;
    return node;
  }

  function formatNumber(value, digits = 2) {
    return new Intl.NumberFormat('en', {
      minimumFractionDigits: 0,
      maximumFractionDigits: digits
    }).format(value);
  }

  function addSkyPlate(parent, position, shiftClass) {
    const plate = make('div', `parallax-sky parallax-sky-${position} parallax-shift-${shiftClass}`);
    plate.setAttribute('aria-hidden', 'true');
    plate.append(
      make('span', 'parallax-background-star star-a'),
      make('span', 'parallax-background-star star-b'),
      make('span', 'parallax-background-star star-c'),
      make('span', 'parallax-background-star star-d'),
      make('span', 'parallax-target-star')
    );
    parent.append(plate);
  }

  function makeRouteLink(targetId, label) {
    const link = make('a', '', label);
    link.href = `#${targetId}`;
    link.style.display = 'inline-flex';
    link.style.alignItems = 'center';
    link.style.minHeight = '44px';
    link.style.padding = '.55rem .75rem';
    link.style.border = '1px solid var(--line)';
    link.style.textDecoration = 'none';
    return link;
  }

  function mountConcordance() {
    const strata = document.getElementById('cosmic-strata');
    if (!strata || document.getElementById('cosmic-concordance')) return;

    const details = make('details', 'instrument');
    details.id = 'cosmic-concordance';
    details.style.marginTop = 'clamp(1.5rem, 4vw, 3rem)';

    const summary = make('summary', '', 'COSMIC CONCORDANCE · OPEN THE GALLERY’S EVIDENCE GRAMMAR');
    summary.style.minHeight = '44px';
    summary.style.display = 'flex';
    summary.style.alignItems = 'center';
    summary.style.padding = '1rem';
    summary.style.cursor = 'pointer';
    summary.style.fontSize = '.72rem';
    summary.style.fontWeight = '760';
    summary.style.letterSpacing = '.12em';
    summary.style.textTransform = 'uppercase';

    const body = make('div', 'instrument-body');
    const intro = make('p', 'readout-note', 'The gallery mixes exact relations, rounded reference values, idealized models, observational inference and genuinely unresolved questions. These are not ranks of certainty: one instrument can contain an exact equation inside a deliberately simplified model. The concordance shows what kind of claim is doing the work, then cross-cuts instruments that answer different parts of the same cosmic problem.');
    intro.style.maxWidth = '78ch';
    intro.style.marginTop = '0';

    const grammar = make('div', 'inventory-grid');
    grammar.setAttribute('aria-label', 'Four evidence grammars used across Deep Space');

    const groups = [
      {
        label: 'EXACT RELATIONS',
        instruments: '01 · 06 · 07 · 09',
        title: 'Definitions and invariant mathematics',
        text: 'Light-time conversion, Lorentz transforms, causal reach and the redshift wavelength relation use fixed equations. Their arithmetic can be exact even when the chosen examples are simplified.'
      },
      {
        label: 'IDEALIZED MODELS',
        instruments: '02 · 08 · 10 · 11 · 12',
        title: 'Useful universes with declared walls',
        text: 'Schwarzschild geometry, point-mass lensing, homogeneous expansion and toy histories deliberately remove real-world complications so one physical relationship can remain visible.'
      },
      {
        label: 'OBSERVATIONAL INFERENCE',
        instruments: '03 · 13 · 14',
        title: 'The universe inferred from what reaches us',
        text: 'Cosmic composition, parallax distance and historical strata depend on observation plus interpretation. Rounded values and observational boundaries remain visibly different from definitions.'
      },
      {
        label: 'OPEN / REVISION',
        instruments: '04 · 05',
        title: 'Where evidence narrows without closing',
        text: 'The Unsolved Room protects live unknowns; the Possibility Engine preserves cases where evidence changed the map of candidate explanations without ending inquiry.'
      }
    ];

    for (const group of groups) {
      const card = make('article', 'inventory-card');
      const kicker = make('p', 'metric-label', `${group.label} · ${group.instruments}`);
      const title = make('h3', '', group.title);
      const text = make('p', '', group.text);
      card.append(kicker, title, text);
      grammar.append(card);
    }

    const crosscuts = make('section', 'readout-grid');
    crosscuts.setAttribute('aria-labelledby', 'cosmic-concordance-crosscuts');
    crosscuts.style.marginTop = 'clamp(1.5rem, 4vw, 3rem)';
    const crosscutTitle = make('h3', '', 'Crosscuts: read these instruments together');
    crosscutTitle.id = 'cosmic-concordance-crosscuts';
    crosscutTitle.style.margin = '0';
    crosscutTitle.style.fontFamily = 'ui-serif, Georgia, serif';
    crosscutTitle.style.fontWeight = '500';
    crosscutTitle.style.fontSize = 'clamp(1.6rem, 3vw, 2.6rem)';
    crosscuts.append(crosscutTitle);

    const bridges = [
      {
        label: '01 + 13 · LIGHT-TIME ↔ PARALLAX',
        text: 'Light travel time converts a known distance into delay; parallax works the other direction, turning a measured angle and known baseline into distance. Together they show why “how far?” and “how old is the light?” are related but not identical questions.',
        targets: [['light-title', 'GO TO 01 · LIGHT-TIME'], ['parallax-survey-title', 'GO TO 13 · PARALLAX']]
      },
      {
        label: '02 + 12 · HORIZON SCALE ↔ UNEQUAL CLOCKS',
        text: 'Both use the Schwarzschild family. One asks how mass sets a characteristic radius; the other asks how stationary clocks compare outside that radius. Sharing a model does not make the instruments interchangeable.',
        targets: [['gravity-title', 'GO TO 02 · HORIZON SCALE'], ['unequal-minute-title', 'GO TO 12 · UNEQUAL CLOCKS']]
      },
      {
        label: '03 + 08 · COSMIC INVENTORY ↔ GRAVITATIONAL LENSING',
        text: 'Dark matter is not listed because it glows. Gravitational lensing is one of the ways mass can be inferred through its effect on light, linking the inventory’s unseen component to a measurable gravitational consequence.',
        targets: [['inventory-title', 'GO TO 03 · INVENTORY'], ['gravitational-copy-title', 'GO TO 08 · LENSING']]
      },
      {
        label: '06 + 07 · FRAME ORDER ↔ CAUSAL REACH',
        text: 'The Frame Shifter lets spacelike event order change with inertial frame. The Causal Signal Box asks the invariant question underneath: can a light-speed-or-slower influence connect the events at all?',
        targets: [['frame-shifter-title', 'GO TO 06 · FRAME ORDER'], ['causal-signal-title', 'GO TO 07 · CAUSAL REACH']]
      },
      {
        label: '09 + 14 · REDSHIFT ↔ COSMIC STRATA',
        text: 'Redshift records wavelength stretch between emission and observation; the strata arrange rounded cosmic history. Redshift alone is not an age label—the bridge exists to prevent that tempting shortcut.',
        targets: [['redshift-ruler-title', 'GO TO 09 · REDSHIFT'], ['cosmic-strata-title', 'GO TO 14 · STRATA']]
      }
    ];

    for (const bridge of bridges) {
      const row = make('div', 'readout');
      row.append(make('span', 'metric-label', bridge.label), make('p', 'readout-note', bridge.text));
      const route = make('nav', '', '');
      route.setAttribute('aria-label', `${bridge.label} reading route`);
      route.style.display = 'flex';
      route.style.flexWrap = 'wrap';
      route.style.gap = '.5rem';
      route.style.marginTop = '.75rem';
      for (const [targetId, label] of bridge.targets) route.append(makeRouteLink(targetId, label));
      row.append(route);
      crosscuts.append(row);
    }

    const limits = make('details', 'readout');
    limits.id = 'model-boundary-ledger';
    limits.style.marginTop = 'clamp(1.5rem, 4vw, 3rem)';
    const limitsSummary = make('summary', '', 'MODEL BOUNDARY LEDGER · WHERE THE TOYS STOP WORKING');
    limitsSummary.style.minHeight = '44px';
    limitsSummary.style.display = 'flex';
    limitsSummary.style.alignItems = 'center';
    limitsSummary.style.cursor = 'pointer';
    limitsSummary.style.fontSize = '.72rem';
    limitsSummary.style.fontWeight = '760';
    limitsSummary.style.letterSpacing = '.1em';
    limitsSummary.style.textTransform = 'uppercase';

    const limitsBody = make('div', 'readout-grid');
    limitsBody.style.marginTop = '1rem';
    const limitsIntro = make('p', 'readout-note', 'A useful model is not a miniature copy of reality. Numerical analysis asks a harder question than “is the equation right?”: under what conditions is this approximation still the right tool? These stop-signs belong to the instrument, not outside it.');
    limitsIntro.style.maxWidth = '78ch';
    limitsBody.append(limitsIntro);

    const modelLimits = [
      ['01 · LIGHT AS A CLOCK', 'distance ÷ c', 'Stop treating the conversion as a complete propagation model when gravitational delay, cosmological expansion, or a non-vacuum path matters. The gallery uses fixed reference distances to expose scale, not to reconstruct an observed signal path.'],
      ['02 + 12 · SCHWARZSCHILD FAMILY', 'isolated · non-rotating · uncharged', 'Real astrophysical black holes rotate and sit in environments. Horizon scale and stationary-clock comparisons here deliberately use the Schwarzschild limit; do not carry these readouts unchanged into a rotating spacetime or through the horizon.'],
      ['08 · GRAVITATIONAL LENSING', 'point-mass / thin-lens simplification', 'A real lens can have extended mass, multiple deflectors and line-of-sight structure. The instrument isolates how gravity can copy and redirect light; its schematic geometry is not an image-reconstruction pipeline.'],
      ['10 + 11 · EXPANSION TOYS', 'homogeneous histories with chosen parameters', 'Toy expansion histories are explanatory counterfactuals, not fitted cosmologies. Change the matter-energy contents, curvature, parameterization or observational constraints and the resulting history changes with them.'],
      ['13 · PARALLAX SURVEY', 'd(pc) ≈ 1 / p(arcsec)', 'The three cases assume the standard small-angle stellar-parallax relation and a clean baseline. At tiny measured angles, uncertainty, calibration, proper motion and orbital complications matter; the magnified sky drawings never become evidence.']
    ];

    for (const [label, model, boundaryText] of modelLimits) {
      const row = make('div', 'readout');
      row.append(
        make('span', 'metric-label', label),
        make('strong', 'readout-value', model),
        make('p', 'readout-note', boundaryText)
      );
      limitsBody.append(row);
    }

    const limitsBoundary = make('p', 'inventory-note', 'MODEL-VALIDATION BOUNDARY · These are domain-of-use warnings, not error bars, confidence levels or claims that the listed omissions dominate every real observation. Each instrument’s stated equation, constants and caveats remain authoritative for its own toy problem.');
    limitsBody.append(limitsBoundary);
    limits.append(limitsSummary, limitsBody);

    const sensitivity = make('details', 'readout');
    sensitivity.id = 'sensitivity-ledger';
    sensitivity.style.marginTop = 'clamp(1.5rem, 4vw, 3rem)';
    const sensitivitySummary = make('summary', '', 'SENSITIVITY LEDGER · NUDGE ONE THING, WATCH WHAT MUST MOVE');
    sensitivitySummary.style.minHeight = '44px';
    sensitivitySummary.style.display = 'flex';
    sensitivitySummary.style.alignItems = 'center';
    sensitivitySummary.style.cursor = 'pointer';
    sensitivitySummary.style.fontSize = '.72rem';
    sensitivitySummary.style.fontWeight = '760';
    sensitivitySummary.style.letterSpacing = '.1em';
    sensitivitySummary.style.textTransform = 'uppercase';

    const sensitivityBody = make('div', 'readout-grid');
    sensitivityBody.style.marginTop = '1rem';
    const sensitivityIntro = make('p', 'readout-note', 'A model boundary says where a toy should stop. Sensitivity analysis asks a different question inside the valid toy: if one input changes while the stated assumptions stay fixed, how strongly and in what direction must the output respond? These are exact scaling statements for the gallery equations, not forecasts for real observations.');
    sensitivityIntro.style.maxWidth = '78ch';
    sensitivityBody.append(sensitivityIntro);

    const sensitivityCases = [
      ['01 · LIGHT AS A CLOCK', 't = d / c', 'DOUBLE DISTANCE → DOUBLE LIGHT-TIME', 'With c fixed, light-time is directly proportional to the chosen distance. A 10% larger reference distance gives exactly 10% more one-way light-time inside this conversion.'],
      ['02 · HORIZON SCALE', 'rₛ = 2GM / c²', 'DOUBLE MASS → DOUBLE SCHWARZSCHILD RADIUS', 'With G and c fixed, the Schwarzschild radius is directly proportional to mass. The clean scaling belongs to the idealized model; rotation and environment are still outside its walls.'],
      ['09 · REDSHIFT RULER', 'λobs = λemit (1 + z)', 'DOUBLE (1 + z) → DOUBLE OBSERVED WAVELENGTH', 'The multiplicative stretch is 1 + z, not z by itself. Holding emitted wavelength fixed, a 10% increase in the stretch factor gives exactly 10% more observed wavelength.'],
      ['13 · PARALLAX SURVEY', 'd ≈ 1 / p', 'HALVE PARALLAX → DOUBLE INFERRED DISTANCE', 'The inverse relation amplifies small-angle changes differently from a direct proportion. A 10% smaller parallax implies about 11.1% greater distance in this ideal small-angle relation, before measurement uncertainty enters.'],
      ['12 · UNEQUAL MINUTE', 'Δτ = Δt √(1 − 1/R)', 'THE SAME ΔR DOES NOT GIVE THE SAME CLOCK CHANGE', 'The lapse factor is nonlinear in normalized radius R. Near the excluded horizon boundary, equal radial nudges can change the stationary-clock factor much more strongly than the same nudges farther out.']
    ];

    for (const [label, relation, perturbation, explanation] of sensitivityCases) {
      const row = make('div', 'readout');
      row.append(
        make('span', 'metric-label', label),
        make('strong', 'readout-value', relation),
        make('p', 'metric-label', perturbation),
        make('p', 'readout-note', explanation)
      );
      sensitivityBody.append(row);
    }

    const sensitivityBoundary = make('p', 'inventory-note', 'SENSITIVITY BOUNDARY · One-at-a-time perturbations reveal mathematical dependence, not observational uncertainty. They do not say how likely an input is to change, which omitted physics dominates, or how correlated parameters behave in a real fit.');
    sensitivityBody.append(sensitivityBoundary);
    sensitivity.append(sensitivitySummary, sensitivityBody);

    const inverse = make('details', 'readout');
    inverse.id = 'inverse-problem-ledger';
    inverse.style.marginTop = 'clamp(1.5rem, 4vw, 3rem)';
    const inverseSummary = make('summary', '', 'INFERENCE LEDGER · WHICH WAY DOES THE QUESTION RUN?');
    inverseSummary.style.minHeight = '44px';
    inverseSummary.style.display = 'flex';
    inverseSummary.style.alignItems = 'center';
    inverseSummary.style.cursor = 'pointer';
    inverseSummary.style.fontSize = '.72rem';
    inverseSummary.style.fontWeight = '760';
    inverseSummary.style.letterSpacing = '.1em';
    inverseSummary.style.textTransform = 'uppercase';

    const inverseBody = make('div', 'readout-grid');
    inverseBody.style.marginTop = '1rem';
    const inverseIntro = make('p', 'readout-note', 'A forward problem starts with a model and predicts what should follow. An inverse problem starts with what reached the observer and asks what underlying state could have produced it. Running an equation backward is not automatically the same as making a unique inference: several hidden states can sometimes fit the same visible result.');
    inverseIntro.style.maxWidth = '78ch';
    inverseBody.append(inverseIntro);

    const inverseCases = [
      ['01 · LIGHT AS A CLOCK', 'FORWARD', 'KNOWN DISTANCE → LIGHT-TIME', 'The instrument chooses a reference distance and divides by c. Multiplying a measured delay by c would only become a distance inference after independently justifying what path the signal took and what else affected its travel time.'],
      ['09 · REDSHIFT RULER', 'OBSERVATION → DERIVED RATIO', 'IDENTIFIED WAVELENGTHS → z', 'Once an emitted spectral feature is identified, the wavelength ratio determines z. Turning that redshift into a unique distance or cosmic age requires additional cosmological assumptions; redshift itself is not a distance label.'],
      ['13 · PARALLAX SURVEY', 'GEOMETRIC INFERENCE', 'ANGLE + KNOWN BASELINE → DISTANCE', 'Parallax is unusually direct: geometry maps a measured angle and known orbital baseline to distance in the stated regime. At tiny angles, calibration and measurement uncertainty still decide whether the inverse result is useful.'],
      ['08 · GRAVITATIONAL LENSING', 'INVERSE / MODEL-DEPENDENT', 'DISTORTED LIGHT → MASS DISTRIBUTION', 'A chosen mass model predicts deflection forward. Working backward from images requires source and lens geometry plus a mass model, and different mass arrangements can reproduce similar lensing observables. A schematic arc is therefore not a unique mass map.'],
      ['11 · SAME ANSWER MACHINE', 'NON-IDENTIFIABLE INVERSE', 'ONE VISIBLE SNAPSHOT → MORE THAN ONE HISTORY', 'This instrument exists to demonstrate the failure of uniqueness: different parameter histories can land on the same displayed answer. Matching an outcome can constrain a model without identifying one inevitable cause.']
    ];

    for (const [label, direction, mapping, explanation] of inverseCases) {
      const row = make('div', 'readout');
      row.append(
        make('span', 'metric-label', label),
        make('strong', 'readout-value', direction),
        make('p', 'metric-label', mapping),
        make('p', 'readout-note', explanation)
      );
      inverseBody.append(row);
    }

    const inverseBoundary = make('p', 'inventory-note', 'INVERSE-PROBLEM BOUNDARY · This ledger labels direction and identifiability; it does not fit real observations, assign probabilities or priors, propagate measurement error, reconstruct images, or turn any schematic drawing into data. The gallery’s fixed examples remain explanatory toys.');
    inverseBody.append(inverseBoundary);
    inverse.append(inverseSummary, inverseBody);

    const routeBoundary = make('p', 'readout-note', 'READING ROUTES · These are ordinary in-page links, not recommendations, scores or a hidden sequence. They simply let one scientific relationship become a path through the existing gallery. Browser back returns you to the concordance.');
    routeBoundary.style.maxWidth = '78ch';

    const boundary = make('p', 'inventory-note', 'CONCORDANCE BOUNDARY · This is an editorial map of the gallery’s claim types and relationships, not a confidence score, hierarchy of truth, probability scale, or assertion that paired instruments share a single model. Numerical readouts and each instrument’s stated approximation remain authoritative.');

    body.append(intro, grammar, crosscuts, limits, sensitivity, inverse, routeBoundary, boundary);
    details.append(summary, body);
    strata.append(details);
  }

  function mount() {
    if (document.getElementById('parallax-survey-title')) return;
    const closing = document.querySelector('.cosmos-section[aria-labelledby="closing-title"]');
    if (!closing || !closing.parentNode) return;

    const section = make('section', 'cosmos-section parallax-survey-section');
    section.setAttribute('aria-labelledby', 'parallax-survey-title');

    const heading = make('div', 'section-heading');
    heading.append(make('p', 'eyebrow', 'INSTRUMENT 13 · THE PARALLAX SURVEY / ONE ORBIT, THREE TRIANGLES'));
    const title = make('h2', '', 'The farther star barely moves.');
    title.id = 'parallax-survey-title';
    heading.append(
      title,
      make('p', '', 'Land surveyors turn a known baseline and two sightlines into distance. Astronomy can do the same with Earth’s orbit. This instrument freezes three synthetic stellar cases into one survey sheet: no controls, no state, just geometry.')
    );

    const shell = make('div', 'parallax-survey-shell');
    const premise = make('aside', 'parallax-survey-premise');
    premise.append(
      make('strong', '', 'THE BASELINE IS THE INSTRUMENT'),
      make('p', '', 'Astronomical parallax p is half the apparent seasonal shift measured from opposite sides of Earth’s orbit. Using the standard small-angle stellar-parallax relation, distance in parsecs is approximately 1 / p when p is measured in arcseconds.'),
      make('p', 'parallax-survey-equation', 'd(pc) ≈ 1 / p(arcsec)'),
      make('p', 'parallax-survey-caveat', 'The sky drawings below are schematic and deliberately magnify the tiny apparent shifts. The written arcsecond values and ledger carry the scientific meaning.')
    );

    const cases = make('div', 'parallax-survey-cases');
    cases.setAttribute('aria-label', 'Three fixed synthetic stellar parallax survey cases');

    for (const item of core.CASES) {
      const snap = core.snapshot(item.id);
      const card = make('article', 'parallax-survey-card');
      card.dataset.parallaxCase = item.id;

      const cardHead = make('header', 'parallax-survey-card-head');
      cardHead.append(
        make('p', 'instrument-label', item.label),
        make('h3', '', `p = ${formatNumber(snap.parallaxArcseconds, 2)}″`)
      );

      const skyPair = make('div', 'parallax-sky-pair');
      addSkyPlate(skyPair, 'left', item.visualShift);
      addSkyPlate(skyPair, 'right', item.visualShift);
      const baseline = make('div', 'parallax-baseline');
      baseline.setAttribute('aria-hidden', 'true');
      baseline.append(make('span', 'parallax-earth earth-left'), make('span', 'parallax-sun'), make('span', 'parallax-earth earth-right'));

      const metrics = make('dl', 'parallax-survey-metrics');
      metrics.append(
        make('dt', '', 'Parallax angle'), make('dd', '', `${formatNumber(snap.parallaxArcseconds, 2)} arcsec`),
        make('dt', '', 'Full seasonal shift'), make('dd', '', `${formatNumber(snap.fullSeasonalShiftArcseconds, 2)} arcsec`),
        make('dt', '', 'Distance'), make('dd', '', `${formatNumber(snap.distanceParsecs, 0)} pc ≈ ${formatNumber(snap.distanceLightYears, 1)} ly`)
      );

      card.append(cardHead, skyPair, baseline, metrics, make('p', 'parallax-survey-note', item.note));
      cases.append(card);
    }

    const ledger = make('section', 'parallax-survey-ledger');
    ledger.setAttribute('aria-labelledby', 'parallax-survey-ledger-title');
    const ledgerTitle = make('h3', '', 'Survey ledger');
    ledgerTitle.id = 'parallax-survey-ledger-title';
    const tableWrap = make('div', 'parallax-survey-table-wrap');
    const table = make('table', 'parallax-survey-table');
    const caption = make('caption', '', 'Fixed synthetic parallax cases using the standard small-angle relation');
    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    headRow.append(
      make('th', '', 'Case'),
      make('th', '', 'Parallax p'),
      make('th', '', 'Full shift 2p'),
      make('th', '', 'Distance'),
      make('th', '', 'Approx. light-years')
    );
    thead.append(headRow);
    const tbody = document.createElement('tbody');
    for (const item of core.CASES) {
      const snap = core.snapshot(item.id);
      const row = document.createElement('tr');
      row.append(
        make('th', '', item.label),
        make('td', '', `${formatNumber(snap.parallaxArcseconds, 2)}″`),
        make('td', '', `${formatNumber(snap.fullSeasonalShiftArcseconds, 2)}″`),
        make('td', '', `${formatNumber(snap.distanceParsecs, 0)} pc`),
        make('td', '', `${formatNumber(snap.distanceLightYears, 1)} ly`)
      );
      tbody.append(row);
    }
    table.append(caption, thead, tbody);
    tableWrap.append(table);

    const reading = make('div', 'parallax-survey-reading');
    reading.append(
      make('strong', '', 'READ THE SHRINKING ANGLE, NOT THE DRAWING'),
      make('p', '', 'Every tenfold decrease in parallax angle makes the inferred distance ten times larger in this fixed small-angle model. The observer baseline stays the same; only the target’s apparent displacement collapses.'),
      make('p', '', 'This plate does not fit a real star, model measurement uncertainty, include proper motion, solve orbital motion, or extend parallax beyond the regime where the approximation and available angular precision are useful.')
    );

    ledger.append(ledgerTitle, tableWrap, reading);
    shell.append(premise, cases, ledger);
    section.append(heading, shell);
    closing.parentNode.insertBefore(section, closing);
    mountConcordance();
  }

  mount();
})();