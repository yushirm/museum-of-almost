'use strict';

(() => {
  const archive = document.getElementById('archive');
  const footer = document.querySelector('.archive-footer');
  const caseNav = document.querySelector('.case-nav');
  const archiveStatus = document.getElementById('archive-status');
  if (!archive || !footer || document.getElementById('instrument-room')) return;

  const channels = [
    {
      id: 'visual',
      label: 'VISUAL / REPORT CLASSIFICATION',
      state: 'METHOD-LIMITED',
      documented: 'The 1984 field report logged 188 light reports. It placed 53 at F5 or higher in the group treated as possible Hessdalen-phenomenon reports.',
      limit: 'The report says the F score was a subjective judgment about whether a known-light explanation could be found. Only six reports reached F9 or F10, and only four of those had a G quality score of 7 or higher.',
      source: 'PROJECT HESSDALEN 1984 / §3.1'
    },
    {
      id: 'radar',
      label: 'RADAR',
      state: 'COINCIDENT / LIMITED',
      documented: 'The report lists 36 radar recordings. Three were probably also seen as lights; in those cases the reported visual direction and radar return were described as broadly coincident.',
      limit: 'Radar was not continuously watched, its display was often limited to 5.5 km instead of the 33 km maximum, only strong screen returns were recorded, and most radar returns had no visual counterpart. Visual and radar timing accuracy was about ±3 seconds.',
      source: 'PROJECT HESSDALEN 1984 / §§3.4, A4'
    },
    {
      id: 'radio',
      label: 'RADIO SPECTRUM',
      state: 'NON-COINCIDENT',
      documented: 'The spectrum analyser recorded unusual repeating spikes during part of the campaign.',
      limit: 'The report explicitly says those recordings were not seen at the same time as the lights. Radar noise was considered as a possible natural explanation for the spikes.',
      source: 'PROJECT HESSDALEN 1984 / §3.5'
    },
    {
      id: 'magnetic',
      label: 'MAGNETOMETER',
      state: 'SUGGESTIVE / WEAK',
      documented: 'No simple correlation was found with slowly varying magnetic fluctuations. During a short recording window, 4 of 10 F5-or-higher light records occurred near a recorded pulsation.',
      limit: 'The report says coincidence remained possible because pulsations were common during that window, and the available magnetometer was not designed as a dedicated pulsation instrument.',
      source: 'PROJECT HESSDALEN 1984 / §§3.6, 4.4'
    },
    {
      id: 'laser',
      label: 'LASER RESPONSE TEST',
      state: 'CLAIMED RESPONSE / UNREPLICATED',
      documented: 'Across two light observations on the same evening, the team reported a change from single to double flashing during 8 of 9 attempts to point a low-power red laser toward the light. The observer calling the flashes could not see where the laser operator was pointing.',
      limit: 'The response was not instrument-recorded, the test involved only two observations, and the report called for repetition rather than treating the result as an explanation.',
      source: 'PROJECT HESSDALEN 1984 / §§3.7, 4.5'
    },
    {
      id: 'seismic',
      label: 'SEISMOGRAPH',
      state: 'NULL',
      documented: 'The field report found no local seismic activity associated with the light observations.',
      limit: 'A null result constrains an earthquake-linked explanation within the sensitivity and coverage of that campaign; it does not identify the light source.',
      source: 'PROJECT HESSDALEN 1984 / §3.3'
    },
    {
      id: 'ir-radiation',
      label: 'GEIGER + INFRARED',
      state: 'NULL / LOW COVERAGE',
      documented: 'The Geiger counters showed no audible change in counting rate during light observations, and two uses of the infrared viewers showed no strong infrared signal.',
      limit: 'The report says the lights were not close to the counters, the infrared observations were of distant lights, and two infrared attempts were not enough for a conclusion.',
      source: 'PROJECT HESSDALEN 1984 / §§3.8–3.9, 4.6'
    }
  ];

  const hypotheses = [
    {
      code: 'H0',
      title: 'MULTIPLE ORDINARY SOURCES',
      status: 'SURVIVES AS BASELINE',
      claim: 'The retained archive may combine conventional lights, environmental effects, and instrument-specific artifacts rather than one single phenomenon.',
      change: 'Repeated, calibrated multi-sensor events with independently reconstructed position, spectrum and motion that exclude aircraft, celestial sources, reflections, weather and instrument artifacts.',
      readings: {
        visual: ['INCONCLUSIVE', 'The report separated many known-light cases, but the retained F5+ group still contains observations the team could not readily explain.'],
        radar: ['INCONCLUSIVE', 'Three visual/radar coincidences are interesting, but incomplete coverage and many radar-only returns prevent a clean one-cause inference.'],
        radio: ['WEIGHS FOR', 'Non-coincident radio spikes and a possible equipment-related source show why instrument-specific artifacts remain live.'],
        magnetic: ['INCONCLUSIVE', 'A weak limited-window correlation does not require one unusual source.'],
        laser: ['WEIGHS AGAINST', 'A repeatable response would be awkward for a purely passive conventional-light account, but this result was not independently replicated.'],
        seismic: ['NEUTRAL', 'No local seismic link neither identifies nor excludes ordinary visual sources.'],
        'ir-radiation': ['NEUTRAL', 'Limited null coverage does not distinguish ordinary from unusual distant lights.']
      }
    },
    {
      code: 'H1',
      title: 'NATURAL LUMINOUS PHENOMENON',
      status: 'SURVIVES / UNCONFIRMED',
      claim: 'At least some retained observations could arise from a recurrent atmospheric or geophysical luminous process rather than a vehicle or deliberate agent.',
      change: 'Repeatable optical spectra tied to the same event as calibrated meteorology, electric-field or plasma measurements, plus independently reconstructed range and motion under predictive environmental conditions.',
      readings: {
        visual: ['WEIGHS FOR', 'Repeated luminous reports motivate a natural-light hypothesis without identifying a mechanism.'],
        radar: ['INCONCLUSIVE', 'A natural process would need to account for the strongest radar coincidences or show that they were unrelated returns.'],
        radio: ['INCONCLUSIVE', 'The radio records were not simultaneous with lights, so they cannot presently supply the mechanism.'],
        magnetic: ['INCONCLUSIVE', 'The limited pulsation coincidence is hypothesis-generating, not mechanism-confirming.'],
        laser: ['INCONCLUSIVE', 'The reported flash response is intriguing but lacks the replication needed to establish physical coupling.'],
        seismic: ['WEIGHS AGAINST', 'The campaign found no local seismic association, weakening simple earthquake-triggered versions of the hypothesis.'],
        'ir-radiation': ['INCONCLUSIVE', 'Sparse distant infrared nulls do not establish a thermal profile.']
      }
    },
    {
      code: 'H2',
      title: 'INSTRUMENT / GEOMETRY CONTRIBUTION',
      status: 'STRONGLY RELEVANT / NOT COMPLETE',
      claim: 'Some apparent performance or cross-channel mystery may be created or amplified by range assumptions, incomplete metadata, atmospheric effects, equipment limits or unrelated returns.',
      change: 'Synchronized independent sensors with preserved location, pointing, calibration and timing metadata that reconstruct the same event and survive geometry, weather and equipment checks.',
      readings: {
        visual: ['INCONCLUSIVE', 'Human visual reports have their own classification limits but are not themselves sensor-display artifacts.'],
        radar: ['WEIGHS FOR', 'Variable radar range, intermittent staffing, strong-return-only logging and radar-only events leave room for geometry or unrelated targets.'],
        radio: ['WEIGHS FOR', 'The team itself considered radar noise as a possible source of the non-coincident spectrum spikes.'],
        magnetic: ['WEIGHS FOR', 'The magnetometer was not the ideal instrument for the pulsation question and covered only a short suitable window.'],
        laser: ['INCONCLUSIVE', 'The reported response was observer-mediated rather than captured by an independent instrument.'],
        seismic: ['NEUTRAL', 'The seismograph null is a useful control rather than a display anomaly.'],
        'ir-radiation': ['WEIGHS FOR', 'Distance and sparse use limited what the infrared viewers could establish.']
      }
    },
    {
      code: 'H3',
      title: 'COHERENT EXTERNAL AGENT',
      status: 'NOT ESTABLISHED',
      claim: 'PAGE FOUR HYPOTHESIS: one structured external agent produced the visual events and at least some of the radar or reported response behavior.',
      change: 'Repeated independently calibrated observations showing coordinated motion or physical interaction that survives known natural and conventional explanations, ideally with a recoverable physical signature and documented chain of custody.',
      readings: {
        visual: ['INCONCLUSIVE', 'Unusual appearance or motion is not evidence by itself of agency.'],
        radar: ['INCONCLUSIVE', 'A few visual/radar coincidences are compatible with a physical target but do not establish identity, intent or one shared source.'],
        radio: ['WEIGHS AGAINST', 'The radio anomalies were not simultaneous with the lights.'],
        magnetic: ['INCONCLUSIVE', 'The weak limited-window association does not establish deliberate coupling.'],
        laser: ['WEIGHS FOR', 'If independently replicated, a stimulus-linked response would be unusually important evidence for interaction. The 1984 result alone is insufficient.'],
        seismic: ['NEUTRAL', 'The seismic null does not test agency.'],
        'ir-radiation': ['INCONCLUSIVE', 'Sparse null observations do not establish the absence of a physical target.']
      }
    }
  ];

  const controls = [
    {
      code: 'CTRL-GF-2015',
      title: 'GOFAST / MOTION PARALLAX',
      apparent: 'A small object appeared to move at high speed near the ocean surface in infrared footage.',
      assessed: 'AARO assessed the object at roughly 13,000 feet and 5–92 mph after wind compensation, with the apparent high speed attributable to motion parallax. AARO did not definitively identify the object.',
      lesson: 'CONTROL LESSON: dramatic apparent speed can change when observer motion, range and wind are reconstructed.'
    },
    {
      code: 'CTRL-PR-2013',
      title: 'PUERTO RICO / LOOK ANGLE',
      apparent: 'Infrared footage appeared to show one fast object splitting and entering or leaving the ocean.',
      assessed: 'AARO assessed with high confidence that the objects showed no anomalous performance; reconstruction indicated two nearby objects moving in a straight line at wind speed without entering the water. AARO assessed with moderate confidence that they were sky lanterns.',
      lesson: 'CONTROL LESSON: viewpoint, occlusion and multiple unresolved objects can create a more extraordinary story than the reconstructed path supports.'
    },
    {
      code: 'CTRL-ETNA-2018',
      title: 'MT. ETNA / ATMOSPHERE + SENSOR',
      apparent: 'Infrared footage appeared to show a round object moving about 345 mph through a superheated volcanic plume.',
      assessed: 'AARO assessed about 24 mph at roughly 15,000 feet, moderate confidence the object was a balloon, and high confidence that optical effects, turbulent atmosphere and sensor limits distorted the apparent behavior.',
      lesson: 'CONTROL LESSON: atmosphere and sensor capability belong inside the case file, not outside it.'
    }
  ];

  function text(tag, value, className = '') {
    const node = document.createElement(tag);
    node.textContent = value;
    if (className) node.className = className;
    return node;
  }

  function announce(message) {
    if (archiveStatus) archiveStatus.textContent = message;
  }

  function addNavLink() {
    if (!caseNav || document.getElementById('instrument-room-link')) return;
    const link = document.createElement('a');
    link.id = 'instrument-room-link';
    link.href = '#instrument-room';
    const number = document.createElement('span');
    number.textContent = '11';
    link.append(number, document.createTextNode(' Instrument room'));
    link.addEventListener('click', () => announce('Instrument Room opened. Null results stay in the file.'));
    caseNav.append(link);
  }

  function channelCard(item) {
    const card = document.createElement('article');
    card.className = 'instrument-channel';
    card.dataset.channel = item.id;

    const head = document.createElement('header');
    head.append(text('h3', item.label), text('span', item.state, 'instrument-state'));

    const ledger = document.createElement('dl');
    ledger.append(
      text('dt', 'DOCUMENTED'), text('dd', item.documented),
      text('dt', 'LIMIT'), text('dd', item.limit)
    );

    card.append(head, ledger, text('p', item.source, 'instrument-source'));
    return card;
  }

  const section = document.createElement('section');
  section.id = 'instrument-room';
  section.className = 'instrument-room';
  section.tabIndex = -1;
  section.setAttribute('aria-labelledby', 'instrument-room-title');

  const heading = document.createElement('header');
  heading.className = 'instrument-heading';
  const title = text('h2', 'THE INSTRUMENT ROOM');
  title.id = 'instrument-room-title';
  heading.append(
    text('span', '11 / HESSDALEN, 1984 / FIELD CROSS-EXAMINATION'),
    title,
    text('p', 'Every sensor gets cross-examined. Null results remain evidence. A strange file is not allowed to become one clean story just because the clean story is better television.')
  );

  const rule = document.createElement('div');
  rule.className = 'instrument-rule';
  rule.append(
    text('strong', 'DOCUMENTED FIELD RECORD // PAGE FOUR HYPOTHESES QUARANTINED'),
    text('span', 'Coincidence is not identity.'),
    text('span', 'A null is not nothing.'),
    text('span', 'A failed instrument is part of provenance.'),
    text('span', 'Controls may expose a failure mode without explaining this case.')
  );

  const channelGrid = document.createElement('div');
  channelGrid.className = 'instrument-channel-grid';
  channels.forEach((item) => channelGrid.append(channelCard(item)));

  const bench = document.createElement('section');
  bench.className = 'hypothesis-bench';
  bench.setAttribute('aria-labelledby', 'hypothesis-bench-title');
  const benchTitle = text('h3', 'HYPOTHESIS CROSS-EXAMINATION');
  benchTitle.id = 'hypothesis-bench-title';
  const benchIntro = text('p', 'Select a hypothesis. The room does not score belief; it shows how each surviving record bears on that claim.', 'hypothesis-intro');

  const hypothesisButtons = document.createElement('div');
  hypothesisButtons.className = 'hypothesis-buttons';
  hypothesisButtons.setAttribute('role', 'group');
  hypothesisButtons.setAttribute('aria-label', 'Competing hypotheses');

  const hypothesisOutput = document.createElement('div');
  hypothesisOutput.id = 'hypothesis-output';
  hypothesisOutput.className = 'hypothesis-output';
  hypothesisOutput.setAttribute('role', 'status');
  hypothesisOutput.setAttribute('aria-live', 'polite');

  const crossExam = document.createElement('div');
  crossExam.className = 'cross-exam-grid';

  let activeHypothesis = 0;
  function renderHypothesis() {
    const hypothesis = hypotheses[activeHypothesis];
    [...hypothesisButtons.children].forEach((button, index) => {
      button.setAttribute('aria-pressed', String(index === activeHypothesis));
    });

    const claim = document.createElement('div');
    claim.className = 'hypothesis-claim';
    claim.append(
      text('span', `${hypothesis.code} / ${hypothesis.status}`, 'hypothesis-status'),
      text('strong', hypothesis.title),
      text('p', hypothesis.claim),
      text('h4', 'WHAT WOULD CHANGE OUR MIND?'),
      text('p', hypothesis.change)
    );
    hypothesisOutput.replaceChildren(claim);

    crossExam.replaceChildren();
    channels.forEach((channel) => {
      const [relation, explanation] = hypothesis.readings[channel.id];
      const row = document.createElement('article');
      row.className = 'cross-exam-row';
      row.dataset.relation = relation.toLowerCase().replaceAll(' ', '-');
      row.append(
        text('strong', channel.label),
        text('span', relation, 'cross-exam-relation'),
        text('p', explanation)
      );
      crossExam.append(row);
    });
    announce(`Instrument Room: ${hypothesis.title.toLowerCase()} cross-examined. This is Page Four analysis, not a source conclusion.`);
  }

  hypotheses.forEach((hypothesis, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = `${hypothesis.code} · ${hypothesis.title}`;
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => {
      activeHypothesis = index;
      renderHypothesis();
    });
    hypothesisButtons.append(button);
  });

  bench.append(benchTitle, benchIntro, hypothesisButtons, hypothesisOutput, crossExam);

  const controlDesk = document.createElement('section');
  controlDesk.className = 'control-desk';
  controlDesk.setAttribute('aria-labelledby', 'control-desk-title');
  const controlTitle = text('h3', 'MODERN CONTROL FILES');
  controlTitle.id = 'control-desk-title';
  const controlBoundary = text('p', 'CONTROLS TEACH FAILURE MODES. THEY DO NOT RETROACTIVELY EXPLAIN HESSDALEN.', 'control-boundary');
  const controlButtons = document.createElement('div');
  controlButtons.className = 'control-buttons';
  controlButtons.setAttribute('role', 'group');
  controlButtons.setAttribute('aria-label', 'Modern sensor-analysis control files');
  const controlOutput = document.createElement('div');
  controlOutput.className = 'control-output';
  controlOutput.setAttribute('role', 'status');
  controlOutput.setAttribute('aria-live', 'polite');

  let activeControl = 0;
  function renderControl() {
    const control = controls[activeControl];
    [...controlButtons.children].forEach((button, index) => {
      button.setAttribute('aria-pressed', String(index === activeControl));
    });
    controlOutput.replaceChildren(
      text('span', control.code, 'control-code'),
      text('strong', control.title),
      text('h4', 'APPEARED'),
      text('p', control.apparent),
      text('h4', 'AFTER RECONSTRUCTION'),
      text('p', control.assessed),
      text('small', control.lesson)
    );
    announce(`Instrument Room control loaded: ${control.title.toLowerCase()}. Control file is methodological, not a Hessdalen explanation.`);
  }

  controls.forEach((control, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = control.code;
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => {
      activeControl = index;
      renderControl();
    });
    controlButtons.append(button);
  });

  controlDesk.append(controlTitle, controlBoundary, controlButtons, controlOutput);

  const sourceLedger = document.createElement('a');
  sourceLedger.className = 'instrument-ledger-link';
  sourceLedger.href = 'PAGE_FOUR_HESSDALEN.md';
  sourceLedger.textContent = 'OPEN HESSDALEN + CONTROL SOURCE LEDGER →';

  const finalRule = text('p', 'STRANGE DESERVES INVESTIGATION. INVESTIGATION DESERVES EVIDENCE. EVIDENCE DOES NOT OWE US A STRANGE ANSWER.', 'instrument-final-rule');

  section.append(heading, rule, channelGrid, bench, controlDesk, sourceLedger, finalRule);
  footer.insertAdjacentElement('beforebegin', section);
  addNavLink();
  renderHypothesis();
  renderControl();
})();