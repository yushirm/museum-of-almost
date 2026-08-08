(function attachQuorumGateView(root) {
  'use strict';

  const core = root.MuseumQuorumGateCore;
  const document = root.document;
  if (!core || !document) return;

  const SNAPSHOT_EVENT = 'museum:commons-snapshot';
  let snapshot = root.MuseumCommonsSnapshot || null;
  let activeCase = 'precipitation';
  let asked = false;

  installStylesheet();
  const ui = mount();
  render();

  document.addEventListener(SNAPSHOT_EVENT, (event) => {
    snapshot = event.detail?.snapshot || root.MuseumCommonsSnapshot || null;
    activeCase = 'precipitation';
    asked = false;
    render();
  });

  function installStylesheet() {
    if (document.querySelector('link[data-quorum-gate-styles]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './quorum-gate.css';
    link.dataset.quorumGateStyles = 'true';
    document.head.append(link);
  }

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function mount() {
    let section = document.querySelector('#quorum-gate');
    if (!section) {
      section = element('section', 'quorum-gate-section');
      section.id = 'quorum-gate';
      section.setAttribute('aria-labelledby', 'quorum-gate-title');

      const heading = element('div', 'quorum-gate-heading');
      const title = element('h2', null, 'A count is not yet a percentage.');
      title.id = 'quorum-gate-title';
      heading.append(
        element('p', 'eyebrow', 'THE QUORUM GATE / THE PIE REFUSES TO CLOSE'),
        title,
        element('p', null, 'Before a fraction becomes a percentage, this desk asks which population actually belongs underneath it. A valid share can still fail to form a valid pie.')
      );

      const controls = element('div', 'quorum-gate-controls');
      const cases = element('div', 'quorum-gate-cases');
      cases.setAttribute('role', 'group');
      cases.setAttribute('aria-label', 'Choose a denominator case');
      for (const definition of core.CASES) {
        const button = element('button', null, definition.shortLabel);
        button.type = 'button';
        button.dataset.quorumCase = definition.id;
        button.setAttribute('aria-pressed', String(definition.id === activeCase));
        cases.append(button);
      }

      const ask = element('button', 'quorum-gate-ask', 'MAKE IT A PERCENT');
      ask.type = 'button';
      ask.dataset.quorumAsk = 'true';
      ask.setAttribute('aria-pressed', 'false');
      controls.append(cases, ask);

      const chamber = element('div', 'quorum-gate-chamber');
      const fraction = element('div', 'quorum-gate-fraction');
      fraction.append(
        element('span', 'eyebrow', 'PROPOSED FRACTION'),
        element('strong', 'quorum-gate-fraction-value', '—'),
        element('small', 'quorum-gate-fraction-labels', 'NUMERATOR / DENOMINATOR')
      );

      const verdict = element('div', 'quorum-gate-verdict');
      verdict.setAttribute('role', 'status');
      verdict.setAttribute('aria-live', 'polite');
      verdict.append(
        element('span', 'eyebrow', 'QUORUM CLERK'),
        element('strong', 'quorum-gate-verdict-title', 'COUNTS ONLY'),
        element('p', 'quorum-gate-verdict-copy', 'Ask for a percentage to inspect the denominator contract.')
      );

      const pie = element('div', 'quorum-gate-pie');
      pie.setAttribute('aria-hidden', 'true');
      pie.append(
        element('span', 'quorum-gate-pie-value', '—'),
        element('small', 'quorum-gate-pie-state', 'PIE NOT REQUESTED')
      );
      chamber.append(fraction, verdict, pie);

      const scope = element('div', 'quorum-gate-scope');
      scope.append(
        element('div', 'quorum-gate-scope-card'),
        element('div', 'quorum-gate-partition-card')
      );

      const doctrine = element('p', 'quorum-gate-doctrine');
      doctrine.append(
        element('strong', null, 'NO DENOMINATOR. NO PERCENT.'),
        document.createTextNode(' A percentage is allowed only when the current normalized latch retains the population it describes. An allowed individual membership share does not automatically authorize a pie chart.')
      );

      section.append(heading, controls, chamber, scope, doctrine);
      const anchor = document.querySelector('#shuffle-table') || document.querySelector('#gauge-bench') || document.querySelector('.windows-section');
      if (anchor?.parentNode) anchor.insertAdjacentElement('afterend', section);
    }

    let field = document.querySelector('#field-sheet-quorum-gate');
    const fieldMeta = document.querySelector('#field-sheet .field-sheet-meta');
    if (!field && fieldMeta) {
      field = document.createElement('span');
      field.id = 'field-sheet-quorum-gate';
      field.className = 'field-sheet-quorum-gate';
      field.append(
        element('strong', null, 'Denominator gate: unavailable'),
        document.createElement('br'),
        element('small', null, 'no percentage without a retained population · pie partition requires exclusive exhaustive membership')
      );
      fieldMeta.append(field);
    }

    const mounted = {
      section,
      caseButtons: [...section.querySelectorAll('[data-quorum-case]')],
      ask: section.querySelector('[data-quorum-ask]'),
      fractionValue: section.querySelector('.quorum-gate-fraction-value'),
      fractionLabels: section.querySelector('.quorum-gate-fraction-labels'),
      verdictTitle: section.querySelector('.quorum-gate-verdict-title'),
      verdictCopy: section.querySelector('.quorum-gate-verdict-copy'),
      pie: section.querySelector('.quorum-gate-pie'),
      pieValue: section.querySelector('.quorum-gate-pie-value'),
      pieState: section.querySelector('.quorum-gate-pie-state'),
      scopeCard: section.querySelector('.quorum-gate-scope-card'),
      partitionCard: section.querySelector('.quorum-gate-partition-card'),
      field
    };

    for (const button of mounted.caseButtons) {
      button.addEventListener('click', () => {
        activeCase = button.dataset.quorumCase || 'precipitation';
        asked = false;
        render();
      });
    }

    mounted.ask?.addEventListener('click', () => {
      const result = core.buildCase(snapshot, activeCase);
      if (!result.canAsk) return;
      asked = !asked;
      render();
    });

    return mounted;
  }

  function render() {
    const result = core.buildCase(snapshot, activeCase);
    root.MuseumQuorumGate = Object.freeze({
      receivedAt: result.receivedAt,
      activeCase,
      asked,
      verdict: result.verdict,
      canPercent: result.canPercent,
      partition: result.partition
    });

    for (const button of ui.caseButtons) {
      button.setAttribute('aria-pressed', String(button.dataset.quorumCase === activeCase));
    }
    if (ui.ask) {
      ui.ask.disabled = !result.canAsk;
      ui.ask.setAttribute('aria-pressed', String(asked));
      ui.ask.textContent = asked ? 'RESTORE COUNTS' : 'MAKE IT A PERCENT';
    }

    if (ui.section) {
      ui.section.dataset.state = result.waiting ? 'waiting' : result.canPercent ? 'licensed' : result.verdict === 'DENOMINATOR LOST' ? 'lost' : 'refused';
      ui.section.dataset.partition = result.partition;
      ui.section.dataset.asked = String(asked);
    }

    if (ui.fractionValue) ui.fractionValue.textContent = core.formatFraction(result);
    if (ui.fractionLabels) ui.fractionLabels.textContent = `${result.numeratorLabel} / ${result.denominatorLabel}`;
    if (ui.verdictTitle) ui.verdictTitle.textContent = asked ? result.verdict : 'COUNTS ONLY';
    if (ui.verdictCopy) ui.verdictCopy.textContent = core.summarySentence(result, asked);

    renderPie(result);
    renderScope(result);
    renderFieldSheet(result);
  }

  function renderPie(result) {
    if (!ui.pie) return;
    ui.pie.style.removeProperty('--share');
    ui.pie.dataset.mode = 'idle';

    if (!asked) {
      if (ui.pieValue) ui.pieValue.textContent = '—';
      if (ui.pieState) ui.pieState.textContent = 'PIE NOT REQUESTED';
      return;
    }

    if (!result.canPercent) {
      ui.pie.dataset.mode = 'refused';
      if (ui.pieValue) ui.pieValue.textContent = '∅%';
      if (ui.pieState) ui.pieState.textContent = result.verdict === 'DENOMINATOR LOST' ? 'NO DENOMINATOR' : 'PERCENT REFUSED';
      return;
    }

    if (ui.pieValue) ui.pieValue.textContent = core.formatPercent(result.percent);
    if (result.partition !== 'allowed') {
      ui.pie.dataset.mode = 'broken';
      if (ui.pieState) ui.pieState.textContent = 'PIE CHART REFUSED';
      return;
    }

    ui.pie.dataset.mode = 'partition';
    ui.pie.style.setProperty('--share', `${Math.max(0, Math.min(100, result.percent))}%`);
    if (ui.pieState) ui.pieState.textContent = 'PARTITION LICENSED';
  }

  function renderScope(result) {
    if (ui.scopeCard) {
      ui.scopeCard.replaceChildren(
        element('span', 'eyebrow', 'POPULATION SCOPE'),
        element('strong', null, result.denominatorLabel),
        element('p', null, result.scope)
      );
    }
    if (ui.partitionCard) {
      const heading = result.partition === 'allowed' ? 'PARTITION LICENSED' : result.partition === 'refused' ? 'PARTITION REFUSED' : 'PARTITION UNAVAILABLE';
      ui.partitionCard.replaceChildren(
        element('span', 'eyebrow', 'PIE CONTRACT'),
        element('strong', null, heading),
        element('p', null, result.pieReason)
      );
    }
  }

  function renderFieldSheet(result) {
    if (!ui.field) return;
    const strong = ui.field.querySelector('strong');
    const small = ui.field.querySelector('small');
    if (!result || result.waiting) {
      if (strong) strong.textContent = 'Denominator gate: unavailable';
      if (small) small.textContent = 'no percentage without a retained population · pie partition requires exclusive exhaustive membership';
      return;
    }

    const percent = result.canPercent ? core.formatPercent(result.percent) : 'percentage refused';
    if (strong) strong.textContent = `${result.definition.shortLabel}: ${core.formatFraction(result)} · ${percent} · ${result.verdict}`;
    if (small) small.textContent = `${result.scope} ${result.partition === 'allowed' ? 'Partition licensed for this membership split.' : 'Individual share does not authorize a pie partition.'}`;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);