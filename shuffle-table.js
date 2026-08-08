(function attachShuffleTableView(root) {
  'use strict';

  const core = root.MuseumShuffleTableCore;
  const document = root.document;
  if (!core || !document) return;

  const SNAPSHOT_EVENT = 'museum:commons-snapshot';
  let snapshot = root.MuseumCommonsSnapshot || null;
  let activeLens = 'temperature';
  let shuffled = false;

  installStylesheet();
  const ui = mount();
  render();

  document.addEventListener(SNAPSHOT_EVENT, (event) => {
    snapshot = event.detail?.snapshot || root.MuseumCommonsSnapshot || null;
    activeLens = 'temperature';
    shuffled = false;
    render();
  });

  function installStylesheet() {
    if (document.querySelector('link[data-shuffle-table-styles]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './shuffle-table.css';
    link.dataset.shuffleTableStyles = 'true';
    document.head.append(link);
  }

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function mount() {
    let section = document.querySelector('#shuffle-table');
    if (!section) {
      section = element('section', 'shuffle-table-section');
      section.id = 'shuffle-table';
      section.setAttribute('aria-labelledby', 'shuffle-table-title');

      const heading = element('div', 'shuffle-table-heading');
      heading.append(
        element('p', 'eyebrow', 'THE SHUFFLE TABLE / THE HEADLINE DOES NOT KNOW WHERE THE VALUES LIVED'),
        element('h2', null, 'Cut the deck. Keep the headline.'),
        element('p', null, 'The real latch stays authoritative. This table rotates the same finite current values among the same evaluable fixed points to expose what an aggregate cannot encode: point-to-value correspondence.')
      );
      heading.querySelector('h2').id = 'shuffle-table-title';

      const controls = element('div', 'shuffle-table-controls');
      controls.setAttribute('aria-label', 'Shuffle Table controls');

      const lenses = element('div', 'shuffle-table-lenses');
      lenses.setAttribute('role', 'group');
      lenses.setAttribute('aria-label', 'Choose a current weather aggregate');
      for (const lens of core.LENSES) {
        const button = element('button', null, lens.shortLabel);
        button.type = 'button';
        button.dataset.shuffleLens = lens.id;
        button.setAttribute('aria-pressed', String(lens.id === activeLens));
        lenses.append(button);
      }

      const cut = element('button', 'shuffle-table-cut', 'CUT THE DECK');
      cut.type = 'button';
      cut.dataset.shuffleCut = 'true';
      cut.setAttribute('aria-pressed', 'false');
      controls.append(lenses, cut);

      const stage = element('div', 'shuffle-table-stage');
      const headline = element('div', 'shuffle-table-headline');
      headline.append(
        element('span', 'eyebrow', 'AUTHORITATIVE NORMALIZED HEADLINE'),
        element('strong', 'shuffle-table-headline-value', '—'),
        element('small', 'shuffle-table-headline-state', 'REAL LATCH')
      );

      const verdict = element('div', 'shuffle-table-verdict');
      verdict.setAttribute('role', 'status');
      verdict.setAttribute('aria-live', 'polite');
      verdict.append(
        element('span', 'shuffle-table-verdict-kicker', 'ASSIGNMENT TEST'),
        element('strong', 'shuffle-table-verdict-title', 'ACTUAL DEAL'),
        element('p', 'shuffle-table-verdict-copy', 'The current point-to-value correspondence is unchanged.')
      );
      stage.append(headline, verdict);

      const ledger = element('div', 'shuffle-table-ledger');
      ledger.id = 'shuffle-table-ledger';
      ledger.setAttribute('aria-label', 'Actual and hypothetical permutation weather point assignment ledger');

      const doctrine = element('p', 'shuffle-table-doctrine');
      doctrine.append(
        element('strong', null, 'THIS IS NOT AN ALTERNATE WEATHER REPORT.'),
        document.createTextNode(' The HYPOTHETICAL PERMUTATION preserves the current finite value multiset and changes only point-to-value assignment. It is not a forecast, interpolation, repaired dataset, probability, uncertainty statement, or claim about physically plausible weather.')
      );

      section.append(heading, controls, stage, ledger, doctrine);
      const anchor = document.querySelector('#gauge-bench') || document.querySelector('#load-bearing-sample') || document.querySelector('#border-office') || document.querySelector('.windows-section');
      if (anchor?.parentNode) anchor.insertAdjacentElement('afterend', section);
    }

    let field = document.querySelector('#field-sheet-shuffle-table');
    const fieldMeta = document.querySelector('#field-sheet .field-sheet-meta');
    if (!field && fieldMeta) {
      field = document.createElement('span');
      field.id = 'field-sheet-shuffle-table';
      field.className = 'field-sheet-shuffle-table';
      field.append(
        element('strong', null, 'Permutation audit: unavailable'),
        document.createElement('br'),
        element('small', null, 'aggregate invariance does not preserve point/value correspondence · hypothetical permutation only')
      );
      fieldMeta.append(field);
    }

    const mounted = {
      section,
      lensButtons: [...section.querySelectorAll('[data-shuffle-lens]')],
      cut: section.querySelector('[data-shuffle-cut]'),
      headline: section.querySelector('.shuffle-table-headline-value'),
      headlineState: section.querySelector('.shuffle-table-headline-state'),
      verdictTitle: section.querySelector('.shuffle-table-verdict-title'),
      verdictCopy: section.querySelector('.shuffle-table-verdict-copy'),
      ledger: document.querySelector('#shuffle-table-ledger'),
      field
    };

    for (const button of mounted.lensButtons) {
      button.addEventListener('click', () => {
        activeLens = button.dataset.shuffleLens || 'temperature';
        shuffled = false;
        render();
      });
    }

    mounted.cut?.addEventListener('click', () => {
      const table = core.buildTable(snapshot, activeLens);
      if (!table.canPermute) return;
      shuffled = !shuffled;
      render();
    });

    return mounted;
  }

  function render() {
    const table = core.buildTable(snapshot, activeLens);

    root.MuseumShuffleTable = Object.freeze({
      receivedAt: table.receivedAt,
      activeLens,
      shuffled,
      sameHeadline: Boolean(table.sameHeadline)
    });

    for (const button of ui.lensButtons) {
      button.setAttribute('aria-pressed', String(button.dataset.shuffleLens === activeLens));
    }
    if (ui.cut) {
      ui.cut.disabled = !table.canPermute;
      ui.cut.setAttribute('aria-pressed', String(shuffled));
      ui.cut.textContent = shuffled ? 'RESTORE ACTUAL DEAL' : 'CUT THE DECK';
    }

    if (ui.section) {
      ui.section.dataset.state = table.waiting ? 'waiting' : !table.authoritative ? 'unavailable' : !table.actualMatchesCanonical ? 'drift' : 'ready';
      ui.section.dataset.deal = shuffled ? 'hypothetical' : 'actual';
    }

    if (ui.headline) ui.headline.textContent = core.formatSummary(table.lens, table.authoritative);
    if (ui.headlineState) ui.headlineState.textContent = shuffled && table.sameHeadline ? 'UNCHANGED AFTER HYPOTHETICAL PERMUTATION' : 'REAL LATCH';

    if (ui.verdictTitle) {
      ui.verdictTitle.textContent = shuffled && table.canPermute
        ? (table.sameHeadline ? 'SAME HEADLINE. DIFFERENT ASSIGNMENT.' : 'HEADLINE CONTRACT DRIFT')
        : 'ACTUAL DEAL';
    }
    if (ui.verdictCopy) ui.verdictCopy.textContent = core.summarySentence(table, shuffled);

    renderLedger(table);
    renderFieldSheet(table);
  }

  function renderLedger(table) {
    if (!ui.ledger) return;
    ui.ledger.replaceChildren();

    if (!table.entries.length) {
      ui.ledger.append(element('p', 'shuffle-table-empty', 'No fixed-point rows are available yet.'));
      return;
    }

    const fragment = document.createDocumentFragment();
    for (const entry of table.entries) {
      const card = element('article', 'shuffle-table-card');
      card.dataset.state = entry.missing ? 'missing' : shuffled ? 'hypothetical' : 'actual';
      if (entry.assignmentMoved) card.dataset.assignmentMoved = 'true';
      if (entry.valueChanged) card.dataset.valueChanged = 'true';

      const top = element('div', 'shuffle-table-card-top');
      top.append(
        element('span', 'shuffle-table-point', `POINT ${entry.id}`),
        element('span', 'shuffle-table-card-state', entry.missing ? 'MISSING' : shuffled ? 'HYPOTHETICAL PERMUTATION' : 'ACTUAL')
      );
      card.append(top);

      if (entry.missing) {
        card.append(
          element('strong', 'shuffle-table-value', '—'),
          element('p', 'shuffle-table-assignment', 'Missing stays missing. No value is dealt into this point.')
        );
        fragment.append(card);
        continue;
      }

      const actual = core.formatValue(table.lens, entry.actualValue);
      const hypothetical = core.formatValue(table.lens, entry.hypotheticalValue);
      card.append(element('strong', 'shuffle-table-value', shuffled ? hypothetical : actual));

      if (!shuffled) {
        card.append(element('p', 'shuffle-table-assignment', `Current latch: Point ${entry.id} owns ${actual}.`));
      } else {
        const motion = entry.assignmentMoved ? `receives Point ${entry.donorId}’s current value` : 'keeps its own current value';
        const equality = entry.valueChanged ? 'Displayed value changes.' : 'Assignment moves, but the displayed numeric value happens to match.';
        card.append(
          element('p', 'shuffle-table-assignment', `Actual ${actual} → hypothetical ${hypothetical}; ${motion}. ${equality}`)
        );
      }
      fragment.append(card);
    }
    ui.ledger.append(fragment);
  }

  function renderFieldSheet(table) {
    if (!ui.field) return;
    const strong = ui.field.querySelector('strong');
    const small = ui.field.querySelector('small');
    if (!table || table.waiting || !table.authoritative) {
      if (strong) strong.textContent = 'Permutation audit: unavailable';
      if (small) small.textContent = 'aggregate invariance does not preserve point/value correspondence · hypothetical permutation only';
      return;
    }

    if (!table.actualMatchesCanonical) {
      if (strong) strong.textContent = `${table.lens.shortLabel} permutation audit: source/headline drift`;
      if (small) small.textContent = 'shuffle withheld because current point values do not reproduce the authoritative normalized headline';
      return;
    }

    if (strong) strong.textContent = `${table.lens.shortLabel} permutation audit: ${table.finiteCount} finite values · headline ${core.formatSummary(table.lens, table.authoritative)} · invariant under one-seat rotation`;
    if (small) small.textContent = 'Same value multiset and aggregate do not preserve point/value correspondence; hypothetical permutation only, not alternate weather';
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
