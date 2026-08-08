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
  }

  mount();
})();
