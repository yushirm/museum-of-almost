(function attachGaugeBenchView(root) {
  'use strict';

  const core = root.MuseumGaugeBenchCore;
  const document = root.document;
  if (!core || !document) return;

  const SNAPSHOT_EVENT = 'museum:commons-snapshot';
  let snapshot = root.MuseumCommonsSnapshot || null;
  let leftId = 'min-temp';
  let rightId = 'max-temp';

  installStylesheet();
  const ui = mount();
  render();

  document.addEventListener(SNAPSHOT_EVENT, (event) => {
    snapshot = event.detail?.snapshot || root.MuseumCommonsSnapshot || null;
    leftId = 'min-temp';
    rightId = 'max-temp';
    render();
  });

  function installStylesheet() {
    if (document.querySelector('link[data-gauge-bench-styles]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './gauge-bench.css';
    link.dataset.gaugeBenchStyles = 'true';
    document.head.append(link);
  }

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function buildTray(side, selectedId) {
    const tray = element('div', 'gauge-bench-tray');
    tray.dataset.side = side;
    tray.append(element('p', 'gauge-bench-tray-label', side === 'left' ? 'GAUGE A' : 'GAUGE B'));
    const buttons = element('div', 'gauge-bench-buttons');
    buttons.setAttribute('role', 'group');
    buttons.setAttribute('aria-label', side === 'left' ? 'Choose the first Commons claim' : 'Choose the second Commons claim');

    for (const claim of core.CLAIMS) {
      const button = element('button', 'gauge-bench-claim', claim.shortLabel);
      button.type = 'button';
      button.dataset.gaugeSide = side;
      button.dataset.gaugeClaim = claim.id;
      button.setAttribute('aria-pressed', String(claim.id === selectedId));
      button.addEventListener('click', () => {
        if (side === 'left') leftId = claim.id;
        else rightId = claim.id;
        render();
      });
      buttons.append(button);
    }
    tray.append(buttons);
    return tray;
  }

  function mount() {
    let section = document.querySelector('#gauge-bench');
    if (!section) {
      section = element('section', 'gauge-bench-section');
      section.id = 'gauge-bench';
      section.setAttribute('aria-labelledby', 'gauge-bench-title');

      const heading = element('div', 'gauge-bench-heading');
      heading.append(
        element('p', 'eyebrow', 'THE GAUGE BENCH / BREAK THE CHART BEFORE IT LIES'),
        element('h2', null, 'Do these two numbers belong on one ruler?'),
        element('p', null, 'Choose two existing Commons claims. The bench checks a fixed Museum-local comparison contract before it permits a shared magnitude axis. Similar-looking numbers do not earn comparison merely by being numbers.')
      );
      heading.querySelector('h2').id = 'gauge-bench-title';

      const selectors = element('div', 'gauge-bench-selectors');
      selectors.append(buildTray('left', leftId), buildTray('right', rightId));

      const verdict = element('div', 'gauge-bench-verdict');
      verdict.setAttribute('role', 'status');
      verdict.setAttribute('aria-live', 'polite');
      verdict.append(
        element('span', 'eyebrow', 'COMPARISON INTERLOCK'),
        element('strong', 'gauge-bench-outcome', '—'),
        element('p', 'gauge-bench-reason', 'Waiting for the first real Commons latch.')
      );

      const specimen = element('div', 'gauge-bench-specimen');
      const leftSpecimen = element('article', 'gauge-bench-specimen-card');
      leftSpecimen.dataset.side = 'left';
      leftSpecimen.append(
        element('span', 'eyebrow', 'GAUGE A'),
        element('strong', 'gauge-bench-left-label', '—'),
        element('b', 'gauge-bench-left-value', '—'),
        element('small', 'gauge-bench-left-meta', '—')
      );
      const rightSpecimen = element('article', 'gauge-bench-specimen-card');
      rightSpecimen.dataset.side = 'right';
      rightSpecimen.append(
        element('span', 'eyebrow', 'GAUGE B'),
        element('strong', 'gauge-bench-right-label', '—'),
        element('b', 'gauge-bench-right-value', '—'),
        element('small', 'gauge-bench-right-meta', '—')
      );
      specimen.append(leftSpecimen, rightSpecimen);

      const stage = element('div', 'gauge-bench-stage');
      stage.id = 'gauge-bench-stage';
      stage.setAttribute('aria-label', 'Comparison result');

      const doctrine = element('p', 'gauge-bench-doctrine');
      doctrine.append(
        element('strong', null, 'SAME DIMENSION DOES NOT MEAN SAME CLAIM.'),
        document.createTextNode(' The bench is a local interface rule, not a universal scientific ontology. It refuses cross-family ratios, percent differences, winners, and normalized scores rather than pretending unlike quantities share one axis.')
      );

      section.append(heading, selectors, verdict, specimen, stage, doctrine);
      const anchor = document.querySelector('#load-bearing-sample') || document.querySelector('#border-office') || document.querySelector('#offcut-drawer') || document.querySelector('.windows-section');
      if (anchor?.parentNode) anchor.insertAdjacentElement('afterend', section);
    }

    let field = document.querySelector('#field-sheet-gauge-bench');
    const fieldMeta = document.querySelector('#field-sheet .field-sheet-meta');
    if (!field && fieldMeta) {
      field = document.createElement('span');
      field.id = 'field-sheet-gauge-bench';
      field.className = 'field-sheet-gauge-bench';
      field.append(
        element('strong', null, 'Comparison interlock: waiting'),
        document.createElement('br'),
        element('small', null, 'shared rulers require a declared Museum-local comparison group · no cross-family normalization')
      );
      fieldMeta.append(field);
    }

    return {
      section,
      buttons: [...section.querySelectorAll('[data-gauge-claim]')],
      outcome: section.querySelector('.gauge-bench-outcome'),
      reason: section.querySelector('.gauge-bench-reason'),
      leftLabel: section.querySelector('.gauge-bench-left-label'),
      leftValue: section.querySelector('.gauge-bench-left-value'),
      leftMeta: section.querySelector('.gauge-bench-left-meta'),
      rightLabel: section.querySelector('.gauge-bench-right-label'),
      rightValue: section.querySelector('.gauge-bench-right-value'),
      rightMeta: section.querySelector('.gauge-bench-right-meta'),
      stage: section.querySelector('#gauge-bench-stage'),
      field
    };
  }

  function render() {
    const pair = core.buildPair(snapshot, leftId, rightId);

    root.MuseumGaugeBench = Object.freeze({
      receivedAt: pair.receivedAt || null,
      waiting: Boolean(pair.waiting),
      leftId,
      rightId,
      outcome: pair.contract?.outcome || null
    });

    syncButtons();

    if (pair.waiting || !pair.left || !pair.right || !pair.contract) {
      ui.section.dataset.state = 'waiting';
      ui.outcome.textContent = 'WAITING FOR LATCH';
      ui.reason.textContent = core.summarySentence(pair);
      writeSpecimen(ui.leftLabel, ui.leftValue, ui.leftMeta, null);
      writeSpecimen(ui.rightLabel, ui.rightValue, ui.rightMeta, null);
      ui.stage.replaceChildren();
      renderField(pair);
      return;
    }

    ui.section.dataset.state = pair.contract.outcome;
    ui.outcome.textContent = pair.contract.label;
    ui.reason.textContent = `${pair.contract.reason} ${core.summarySentence(pair)}`;
    writeSpecimen(ui.leftLabel, ui.leftValue, ui.leftMeta, pair.left);
    writeSpecimen(ui.rightLabel, ui.rightValue, ui.rightMeta, pair.right);
    renderStage(pair);
    renderField(pair);
  }

  function syncButtons() {
    for (const button of ui.buttons) {
      const side = button.dataset.gaugeSide;
      const claimId = button.dataset.gaugeClaim;
      const selected = side === 'left' ? leftId : rightId;
      const opposite = side === 'left' ? rightId : leftId;
      button.setAttribute('aria-pressed', String(claimId === selected));
      button.disabled = claimId === opposite;
    }
  }

  function writeSpecimen(labelNode, valueNode, metaNode, claim) {
    if (!claim) {
      labelNode.textContent = '—';
      valueNode.textContent = '—';
      metaNode.textContent = '—';
      return;
    }
    labelNode.textContent = claim.label;
    valueNode.textContent = core.formatValue(claim, claim.value);
    metaNode.textContent = `${claim.dimension} · ${claim.subject}`;
  }

  function renderStage(pair) {
    ui.stage.replaceChildren();
    if (pair.canDrawRuler) renderCommonRuler(pair);
    else renderRefusal(pair);
  }

  function renderCommonRuler(pair) {
    const rail = element('div', 'gauge-bench-common-rail');
    rail.dataset.mode = 'common-ruler';

    const leftMark = element('div', 'gauge-bench-mark');
    leftMark.append(element('span', null, 'A'), element('b', null, core.formatValue(pair.left, pair.left.value)));

    const bridge = element('div', 'gauge-bench-bridge');
    bridge.append(
      element('span', null, 'NATIVE-UNIT DIFFERENCE · B − A'),
      element('strong', null, core.formatDelta(pair)),
      element('small', null, 'Shared ruler permitted by the declared comparison group. No ratio or normalized score is calculated.')
    );

    const rightMark = element('div', 'gauge-bench-mark');
    rightMark.append(element('span', null, 'B'), element('b', null, core.formatValue(pair.right, pair.right.value)));

    rail.append(leftMark, bridge, rightMark);
    ui.stage.append(rail);
  }

  function renderRefusal(pair) {
    const split = element('div', 'gauge-bench-split-axis');
    split.dataset.mode = pair.contract.outcome;

    const leftHalf = element('div', 'gauge-bench-half-axis');
    leftHalf.append(element('span', null, pair.left.shortLabel), element('b', null, core.formatValue(pair.left, pair.left.value)));

    const breakNode = element('div', 'gauge-bench-break');
    breakNode.append(
      element('strong', null, pair.contract.label),
      element('span', null, pair.left.missing || pair.right.missing ? 'CURRENT VALUE MISSING · CONTRACT STILL DECLARED' : 'THE SHARED CHART STOPS HERE')
    );

    const rightHalf = element('div', 'gauge-bench-half-axis');
    rightHalf.append(element('span', null, pair.right.shortLabel), element('b', null, core.formatValue(pair.right, pair.right.value)));

    split.append(leftHalf, breakNode, rightHalf);
    ui.stage.append(split);
  }

  function renderField(pair) {
    if (!ui.field) return;
    const strong = ui.field.querySelector('strong');
    const small = ui.field.querySelector('small');
    if (!pair || pair.waiting || !pair.contract || !pair.left || !pair.right) {
      if (strong) strong.textContent = 'Comparison interlock: waiting';
      if (small) small.textContent = 'shared rulers require a declared Museum-local comparison group · no cross-family normalization';
      return;
    }
    if (strong) strong.textContent = `Comparison interlock: ${pair.left.shortLabel} ↔ ${pair.right.shortLabel} · ${pair.contract.label}`;
    if (small) small.textContent = 'Museum-local pair contract only · same dimension can still mean different semantic subjects · no cross-family ratio, percentage, ranking, or normalized score';
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);