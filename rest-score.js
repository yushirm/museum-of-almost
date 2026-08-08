(function attachRestScoreView(root) {
  'use strict';

  const core = root.MuseumRestScoreCore;
  const document = root.document;
  if (!core || !document) return;

  const SNAPSHOT_EVENT = 'museum:commons-snapshot';
  let snapshot = root.MuseumCommonsSnapshot || null;
  let activeFilter = 'all';

  installStylesheet();
  const ui = mount();
  render();

  document.addEventListener(SNAPSHOT_EVENT, (event) => {
    snapshot = event.detail?.snapshot || root.MuseumCommonsSnapshot || null;
    activeFilter = 'all';
    render();
  });

  function installStylesheet() {
    if (document.querySelector('link[data-rest-score-styles]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './rest-score.css';
    link.dataset.restScoreStyles = 'true';
    document.head.append(link);
  }

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function mount() {
    let section = document.querySelector('#rest-score');
    if (!section) {
      section = element('section', 'rest-score-section');
      section.id = 'rest-score';
      section.setAttribute('aria-labelledby', 'rest-score-title');

      const heading = element('div', 'rest-score-heading');
      heading.append(
        element('p', 'eyebrow', 'THE REST SCORE / NOTHING IS NOT MISSING'),
        element('h2', null, 'Silence only counts when the source actually wrote it.'),
        element('p', null, 'A written zero, a missing reading, and a field that does not apply are three different states. This score keeps them separate without ranking the providers or comparing unlike units.')
      );

      const consoleNode = element('div', 'rest-score-console');
      const summary = element('aside', 'rest-score-summary');
      summary.setAttribute('aria-label', 'Rest Score semantic summary');
      summary.append(element('span', 'eyebrow', 'CURRENT SCORE'));
      const summaryLine = element('strong', 'rest-score-summary-line', 'WAITING FOR LATCH');
      summaryLine.id = 'rest-score-summary-line';
      summary.append(summaryLine);
      const status = element('p', 'rest-score-status', 'Waiting for the first real Commons snapshot.');
      status.id = 'rest-score-status';
      status.setAttribute('role', 'status');
      status.setAttribute('aria-live', 'polite');
      summary.append(status);

      const counters = element('dl', 'rest-score-counters');
      for (const [state, label] of [
        ['sounded', 'Sounded values'],
        ['rest', 'Written zeros'],
        ['missing', 'Missing measures'],
        ['not-applicable', 'Not applicable']
      ]) {
        const item = element('div', 'rest-score-counter');
        item.dataset.state = state;
        item.append(element('dt', null, label));
        const value = element('dd', null, '—');
        value.dataset.restCount = state;
        item.append(value);
        counters.append(item);
      }
      summary.append(counters);

      const filterGroup = element('div', 'rest-score-filters');
      filterGroup.setAttribute('role', 'group');
      filterGroup.setAttribute('aria-label', 'Solo one Rest Score semantic state');
      filterGroup.append(element('span', null, 'SOLO A STATE'));
      for (const [filter, label] of [
        ['all', 'All'],
        ['rest', 'Written zeros'],
        ['missing', 'Missing'],
        ['not-applicable', 'Not applicable'],
        ['sounded', 'Sounded']
      ]) {
        const button = element('button', null, label);
        button.type = 'button';
        button.dataset.restFilter = filter;
        button.setAttribute('aria-pressed', String(filter === 'all'));
        filterGroup.append(button);
      }
      summary.append(filterGroup);

      const filterStatus = element('p', 'rest-score-filter-status', 'All semantic measures are shown.');
      filterStatus.id = 'rest-score-filter-status';
      summary.append(filterStatus);

      const score = element('div', 'rest-score-grid');
      score.id = 'rest-score-grid';
      score.setAttribute('aria-label', 'Current semantic measures');

      consoleNode.append(summary, score);
      section.append(heading, consoleNode);

      const note = element('p', 'rest-score-note');
      const strong = element('strong', null, 'Zero is data. Missing is ignorance.');
      note.append(strong, document.createTextNode(' “Written rest” is used only where zero has a field-specific none-or-no-occurrence meaning. A numeric zero in another field—such as magnitude or speed—remains a sounded value. The score does not synchronize feeds, compare units, or measure data quality.'));
      section.append(note);

      const anchor = document.querySelector('#reverse-ledger') || document.querySelector('#exposure-plate') || document.querySelector('.windows-section');
      if (anchor?.parentNode) anchor.insertAdjacentElement('afterend', section);
    }

    const mounted = {
      section,
      summaryLine: document.querySelector('#rest-score-summary-line'),
      status: document.querySelector('#rest-score-status'),
      grid: document.querySelector('#rest-score-grid'),
      filterStatus: document.querySelector('#rest-score-filter-status'),
      counts: new Map([...document.querySelectorAll('[data-rest-count]')].map((node) => [node.dataset.restCount, node])),
      buttons: [...document.querySelectorAll('[data-rest-filter]')]
    };

    for (const button of mounted.buttons) {
      button.addEventListener('click', () => {
        activeFilter = button.dataset.restFilter || 'all';
        render();
      });
    }

    return mounted;
  }

  function render() {
    const score = core.buildScore(snapshot);
    const visible = core.filterMeasures(score, activeFilter);

    root.MuseumRestScore = Object.freeze({
      receivedAt: score.receivedAt,
      waiting: score.waiting,
      total: score.total,
      counts: score.counts,
      activeFilter
    });

    for (const button of ui.buttons) {
      button.setAttribute('aria-pressed', String(button.dataset.restFilter === activeFilter));
    }

    if (score.waiting) {
      if (ui.section) ui.section.dataset.state = 'waiting';
      if (ui.summaryLine) ui.summaryLine.textContent = 'WAITING FOR LATCH';
      if (ui.status) ui.status.textContent = core.scoreSentence(score);
      for (const node of ui.counts.values()) node.textContent = '—';
      if (ui.filterStatus) ui.filterStatus.textContent = 'No measure can be classified before the first real latch.';
      renderMeasures([]);
      return;
    }

    if (ui.section) ui.section.dataset.state = 'ready';
    if (ui.summaryLine) ui.summaryLine.textContent = `${score.counts.rest} RESTS · ${score.counts.missing} GAPS`;
    if (ui.status) ui.status.textContent = core.scoreSentence(score);
    for (const [state, node] of ui.counts) node.textContent = String(score.counts[state] || 0);

    if (ui.filterStatus) {
      if (activeFilter === 'all') {
        ui.filterStatus.textContent = `All ${score.total} fixed semantic measures are shown.`;
      } else {
        const label = core.STATE_LABELS[activeFilter] || activeFilter;
        ui.filterStatus.textContent = `${visible.length} of ${score.total} measures are classified ${label}. This is a filter, not a score.`;
      }
    }
    renderMeasures(visible);
  }

  function renderMeasures(measures) {
    if (!ui.grid) return;
    ui.grid.replaceChildren();
    const fragment = document.createDocumentFragment();

    for (const entry of measures) {
      const card = element('article', 'rest-score-measure');
      card.dataset.state = entry.state;
      card.append(element('span', 'rest-score-state', entry.stateLabel));
      card.append(element('h3', null, entry.label));
      card.append(element('strong', 'rest-score-value', entry.display));
      const source = element('p', 'rest-score-source', `${entry.group} · ${entry.source}`);
      const note = element('p', 'rest-score-explanation', entry.note);
      card.append(source, note);
      fragment.append(card);
    }

    ui.grid.append(fragment);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
