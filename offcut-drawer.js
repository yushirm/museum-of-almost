(function attachOffcutDrawerView(root) {
  'use strict';

  const core = root.MuseumOffcutDrawerCore;
  const document = root.document;
  if (!core || !document) return;

  const SNAPSHOT_EVENT = 'museum:commons-snapshot';
  const PRECISION_EVENT = 'museum:commons-precision-trace';
  let trace = root.MuseumCommonsPrecisionTrace || null;
  let activeFilter = 'all';

  installStylesheet();
  const ui = mount();
  render();

  document.addEventListener(SNAPSHOT_EVENT, () => {
    trace = root.MuseumCommonsPrecisionTrace || null;
    activeFilter = 'all';
    render();
  });

  document.addEventListener(PRECISION_EVENT, (event) => {
    trace = event.detail?.trace || root.MuseumCommonsPrecisionTrace || null;
    activeFilter = 'all';
    render();
  });

  function installStylesheet() {
    if (document.querySelector('link[data-offcut-drawer-styles]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './offcut-drawer.css';
    link.dataset.offcutDrawerStyles = 'true';
    document.head.append(link);
  }

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function mount() {
    let section = document.querySelector('#offcut-drawer');
    if (!section) {
      section = element('section', 'offcut-drawer-section');
      section.id = 'offcut-drawer';
      section.setAttribute('aria-labelledby', 'offcut-drawer-title');

      const heading = element('div', 'offcut-drawer-heading');
      heading.append(
        element('p', 'eyebrow', 'THE OFFCUT DRAWER / THE PAGE SHAVES ITS NUMBERS'),
        element('h2', null, 'The polished number is not the whole transformation.'),
        element('p', null, 'Fifteen fixed traces follow selected public numeric inputs through range guards, normalization, and the number finally printed by the Commons. The discarded rounding remainder is shown instead of hidden.')
      );
      heading.querySelector('h2').id = 'offcut-drawer-title';

      const consoleNode = element('div', 'offcut-drawer-console');
      const summary = element('aside', 'offcut-drawer-summary');
      summary.setAttribute('aria-label', 'Offcut Drawer summary and filters');
      summary.append(element('span', 'eyebrow', 'CURRENT DRAWER'));
      const summaryLine = element('strong', 'offcut-drawer-summary-line', 'WAITING FOR LATCH');
      summaryLine.id = 'offcut-drawer-summary-line';
      const status = element('p', 'offcut-drawer-status', 'Waiting for the first real Commons precision trace.');
      status.id = 'offcut-drawer-status';
      status.setAttribute('role', 'status');
      status.setAttribute('aria-live', 'polite');
      summary.append(summaryLine, status);

      const counters = element('dl', 'offcut-drawer-counters');
      for (const [state, label] of [
        ['exact', 'Exact'],
        ['up', 'Rounded up'],
        ['down', 'Rounded down'],
        ['missing', 'Missing']
      ]) {
        const item = element('div', 'offcut-drawer-counter');
        item.dataset.state = state;
        item.append(element('dt', null, label));
        const value = element('dd', null, '—');
        value.dataset.offcutCount = state;
        item.append(value);
        counters.append(item);
      }
      summary.append(counters);

      const filterGroup = element('div', 'offcut-drawer-filters');
      filterGroup.setAttribute('role', 'group');
      filterGroup.setAttribute('aria-label', 'Show one Offcut Drawer rounding state');
      filterGroup.append(element('span', null, 'OPEN ONE DRAWER'));
      for (const [filter, label] of [
        ['all', 'All'],
        ['exact', 'Exact'],
        ['up', 'Rounded up'],
        ['down', 'Rounded down'],
        ['missing', 'Missing']
      ]) {
        const button = element('button', null, label);
        button.type = 'button';
        button.dataset.offcutFilter = filter;
        button.setAttribute('aria-pressed', String(filter === 'all'));
        filterGroup.append(button);
      }
      summary.append(filterGroup);

      const filterStatus = element('p', 'offcut-drawer-filter-status', 'All fixed traces are shown.');
      filterStatus.id = 'offcut-drawer-filter-status';
      summary.append(filterStatus);

      const measures = element('div', 'offcut-drawer-grid');
      measures.id = 'offcut-drawer-grid';
      measures.setAttribute('aria-label', 'Current numeric transformation traces');
      consoleNode.append(summary, measures);
      section.append(heading, consoleNode);

      const note = element('p', 'offcut-drawer-note');
      const strong = element('strong', null, 'Offcut is not error.');
      note.append(
        strong,
        document.createTextNode(' The signed remainder is bounded numeric minus displayed numeric. Positive means the display rounded down; negative means it rounded up. Range bounding is labeled separately. Nothing here estimates sensor error, provider precision, uncertainty, accuracy, or data quality.')
      );
      section.append(note);

      const anchor = document.querySelector('#rest-score') || document.querySelector('#reverse-ledger') || document.querySelector('.windows-section');
      if (anchor?.parentNode) anchor.insertAdjacentElement('afterend', section);
    }

    let field = document.querySelector('#field-sheet-offcut');
    const fieldMeta = document.querySelector('#field-sheet .field-sheet-meta');
    if (!field && fieldMeta) {
      field = document.createElement('span');
      field.id = 'field-sheet-offcut';
      field.className = 'field-sheet-offcut';
      field.append(
        element('strong', null, 'Numeric offcuts: unavailable'),
        document.createElement('br'),
        element('small', null, 'selected source number → bounded → normalized → displayed; rounding residue only')
      );
      fieldMeta.append(field);
    }

    const mounted = {
      section,
      summaryLine: document.querySelector('#offcut-drawer-summary-line'),
      status: document.querySelector('#offcut-drawer-status'),
      grid: document.querySelector('#offcut-drawer-grid'),
      filterStatus: document.querySelector('#offcut-drawer-filter-status'),
      counts: new Map([...document.querySelectorAll('[data-offcut-count]')].map((node) => [node.dataset.offcutCount, node])),
      buttons: [...document.querySelectorAll('[data-offcut-filter]')],
      field
    };

    for (const button of mounted.buttons) {
      button.addEventListener('click', () => {
        activeFilter = button.dataset.offcutFilter || 'all';
        render();
      });
    }
    return mounted;
  }

  function render() {
    const current = trace || core.buildTrace(null, null, []);
    const visible = activeFilter === 'all' ? current.measures || [] : core.filterMeasures(current, activeFilter);

    root.MuseumOffcutDrawer = Object.freeze({
      receivedAt: current.receivedAt || null,
      waiting: Boolean(current.waiting),
      total: current.total || 0,
      counts: current.counts || Object.freeze({ exact: 0, up: 0, down: 0, missing: 0 }),
      activeFilter
    });

    for (const button of ui.buttons) button.setAttribute('aria-pressed', String(button.dataset.offcutFilter === activeFilter));

    if (current.waiting) {
      if (ui.section) ui.section.dataset.state = 'waiting';
      if (ui.summaryLine) ui.summaryLine.textContent = 'WAITING FOR LATCH';
      if (ui.status) ui.status.textContent = core.summarySentence(current);
      for (const node of ui.counts.values()) node.textContent = '—';
      if (ui.filterStatus) ui.filterStatus.textContent = 'No offcut exists before a real public numeric trace is committed.';
      renderMeasures([]);
      renderFieldSheet(null);
      return;
    }

    if (ui.section) ui.section.dataset.state = 'ready';
    if (ui.summaryLine) ui.summaryLine.textContent = `${current.counts.up + current.counts.down} SHAVED · ${current.counts.exact} EXACT`;
    if (ui.status) ui.status.textContent = core.summarySentence(current);
    for (const [state, node] of ui.counts) node.textContent = String(current.counts[state] || 0);

    if (ui.filterStatus) {
      if (activeFilter === 'all') {
        ui.filterStatus.textContent = `All ${current.total} fixed traces are shown. Counts are not a quality score.`;
      } else {
        const label = core.STATE_LABELS[activeFilter] || activeFilter;
        ui.filterStatus.textContent = `${visible.length} of ${current.total} traces are ${label}. This is a local display filter, not a ranking.`;
      }
    }
    renderMeasures(visible);
    renderFieldSheet(current);
  }

  function renderMeasures(measures) {
    if (!ui.grid) return;
    ui.grid.replaceChildren();
    const fragment = document.createDocumentFragment();

    for (const entry of measures) {
      const card = element('article', 'offcut-measure');
      card.dataset.state = entry.state;
      card.append(element('span', 'offcut-state', entry.stateLabel));
      card.append(element('h3', null, entry.label));

      const offcut = element('strong', 'offcut-value', formatOffcut(entry));
      offcut.setAttribute('aria-label', offcutAria(entry));
      card.append(offcut, element('span', 'offcut-equation', 'OFFCUT = BOUNDED − DISPLAYED'));

      const stages = element('dl', 'offcut-stages');
      for (const [label, key] of [
        ['Selected source numeric', 'source'],
        ['After range guard', 'bounded'],
        ['Normalized latch', 'normalized'],
        ['Main display numeric', 'displayed']
      ]) {
        const row = element('div');
        row.append(element('dt', null, label), element('dd', null, formatStage(entry, entry[key])));
        stages.append(row);
      }
      card.append(stages);

      const residues = element('p', 'offcut-residues');
      residues.textContent = entry.state === 'missing'
        ? 'No current numeric path reached all four stages.'
        : `Normalization shave ${formatResidue(entry, entry.normalizationResidue)} · display shave ${formatResidue(entry, entry.displayResidue)}.`;
      card.append(residues);

      const bound = element('p', 'offcut-bound');
      bound.textContent = entry.boundingApplied
        ? 'RANGE GUARD APPLIED — this bound is separate from the rounding offcut.'
        : 'NO RANGE GUARD CHANGE — source numeric was already inside the accepted range.';
      card.append(bound);
      fragment.append(card);
    }
    ui.grid.append(fragment);
  }

  function renderFieldSheet(current) {
    if (!ui.field) return;
    const strong = ui.field.querySelector('strong');
    const small = ui.field.querySelector('small');
    if (!current || current.waiting) {
      if (strong) strong.textContent = 'Numeric offcuts: unavailable';
      if (small) small.textContent = 'selected source number → bounded → normalized → displayed; rounding residue only';
      return;
    }
    const shaved = (current.counts.up || 0) + (current.counts.down || 0);
    if (strong) strong.textContent = `Numeric offcuts: ${shaved}/${current.total} selected traces changed by rounding · ${current.counts.missing || 0} missing`;
    if (small) small.textContent = 'bounded − displayed residue only · range guards separate · not uncertainty, accuracy, provider precision, or quality';
  }

  function formatStage(entry, value) {
    if (!Number.isFinite(value)) return '—';
    const number = Number(value).toLocaleString('en-US', { maximumFractionDigits: 6, useGrouping: false });
    if (entry.unit === 'M') return `M${number}`;
    return `${number}${entry.unit}`;
  }

  function formatOffcut(entry) {
    if (entry.state === 'missing') return 'NO PATH';
    if (entry.state === 'exact') return 'EXACT';
    return formatResidue(entry, entry.offcut);
  }

  function formatResidue(entry, value) {
    if (!Number.isFinite(value)) return '—';
    const rounded = Math.abs(value) < 1e-9 ? 0 : Number(value);
    const sign = rounded > 0 ? '+' : rounded < 0 ? '−' : '±';
    const magnitude = Math.abs(rounded).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 6, useGrouping: false });
    if (entry.unit === 'M') return `${sign}${magnitude} magnitude`;
    return `${sign}${magnitude}${entry.unit}`;
  }

  function offcutAria(entry) {
    if (entry.state === 'missing') return `${entry.label}: current numeric trace missing.`;
    if (entry.state === 'exact') return `${entry.label}: bounded and displayed numeric values are equal; no rounding offcut.`;
    return `${entry.label}: ${entry.stateLabel.toLowerCase()}, signed offcut ${formatResidue(entry, entry.offcut)}.`;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
