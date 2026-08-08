(function attachBorderOfficeView(root) {
  'use strict';

  const core = root.MuseumBorderOfficeCore;
  const document = root.document;
  if (!core || !document) return;

  const SNAPSHOT_EVENT = 'museum:commons-snapshot';
  let snapshot = root.MuseumCommonsSnapshot || null;
  let activeFamily = 'solar';

  installStylesheet();
  const ui = mount();
  render();

  document.addEventListener(SNAPSHOT_EVENT, (event) => {
    snapshot = event.detail?.snapshot || root.MuseumCommonsSnapshot || null;
    activeFamily = 'solar';
    render();
  });

  function installStylesheet() {
    if (document.querySelector('link[data-border-office-styles]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './border-office.css';
    link.dataset.borderOfficeStyles = 'true';
    document.head.append(link);
  }

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function mount() {
    let section = document.querySelector('#border-office');
    if (!section) {
      section = element('section', 'border-office-section');
      section.id = 'border-office';
      section.setAttribute('aria-labelledby', 'border-office-title');

      const heading = element('div', 'border-office-heading');
      const eyebrow = element('p', 'eyebrow', 'THE BORDER OFFICE / THE WORLD DOES NOT KNOW OUR LABELS');
      const title = element('h2', null, 'A number crosses a line. The interface gives it a word.');
      title.id = 'border-office-title';
      const intro = element('p', null, 'This office exposes three local classification systems already used by COMMONS / NOW. The border is code, not a seam in nature. Every category must show the exact condition that would make it stop applying.');
      heading.append(eyebrow, title, intro);

      const consoleNode = element('div', 'border-office-console');
      const passport = element('aside', 'border-office-passport');
      passport.setAttribute('aria-label', 'Border Office selector and current rule');
      passport.append(element('span', 'eyebrow', 'CHOOSE A BORDER FAMILY'));

      const controls = element('div', 'border-office-controls');
      controls.setAttribute('role', 'group');
      controls.setAttribute('aria-label', 'Choose one local classification border family');
      for (const family of core.FAMILIES) {
        const button = element('button', null, family.shortLabel);
        button.type = 'button';
        button.dataset.borderFamily = family.id;
        button.setAttribute('aria-pressed', String(family.id === activeFamily));
        controls.append(button);
      }
      passport.append(controls);

      const ruleName = element('strong', 'border-office-rule-name', 'WAITING FOR LATCH');
      ruleName.id = 'border-office-rule-name';
      const ruleText = element('p', 'border-office-rule-text', 'The current local rule will appear after the first real Commons latch.');
      ruleText.id = 'border-office-rule-text';
      const borders = element('p', 'border-office-borders', 'BORDERS · —');
      borders.id = 'border-office-borders';
      passport.append(ruleName, ruleText, borders);

      const status = element('p', 'border-office-status', 'Waiting for the first real Commons latch.');
      status.id = 'border-office-status';
      status.setAttribute('role', 'status');
      status.setAttribute('aria-live', 'polite');
      passport.append(status);

      const exhibit = element('div', 'border-office-exhibit');
      const doctrine = element('div', 'border-office-doctrine');
      doctrine.append(
        element('span', null, 'OFFICE RULE'),
        element('strong', null, 'NO LABEL WITHOUT ITS EXIT CONDITION'),
        element('p', null, 'The category is the stamp. The threshold is the rule that produced it. Margin to the nearest border is shown only in that measure’s own unit and is never compared across families.')
      );
      const cards = element('div', 'border-office-grid');
      cards.id = 'border-office-grid';
      cards.setAttribute('aria-label', 'Current local classification labels and their exit conditions');
      exhibit.append(doctrine, cards);
      consoleNode.append(passport, exhibit);

      const note = element('p', 'border-office-note');
      const noteStrong = element('strong', null, 'Near a border is not uncertain.');
      note.append(
        noteStrong,
        document.createTextNode(' It is not unstable, dangerous, inaccurate, low quality, or more likely to change. The margin is arithmetic distance to a Museum-local classification threshold only.')
      );

      section.append(heading, consoleNode, note);
      const anchor = document.querySelector('#offcut-drawer') || document.querySelector('#rest-score') || document.querySelector('#reverse-ledger') || document.querySelector('.windows-section');
      if (anchor?.parentNode) anchor.insertAdjacentElement('afterend', section);
    }

    let field = document.querySelector('#field-sheet-border-office');
    const fieldMeta = document.querySelector('#field-sheet .field-sheet-meta');
    if (!field && fieldMeta) {
      field = document.createElement('span');
      field.id = 'field-sheet-border-office';
      field.className = 'field-sheet-border-office';
      field.append(
        element('strong', null, 'Local classification borders: unavailable'),
        document.createElement('br'),
        element('small', null, 'solar 350/500/700 km/s · light −6°/0° elevation · precipitation counted only above 0 mm')
      );
      fieldMeta.append(field);
    }

    const mounted = {
      section,
      ruleName: document.querySelector('#border-office-rule-name'),
      ruleText: document.querySelector('#border-office-rule-text'),
      borders: document.querySelector('#border-office-borders'),
      status: document.querySelector('#border-office-status'),
      grid: document.querySelector('#border-office-grid'),
      buttons: [...document.querySelectorAll('[data-border-family]')],
      field
    };

    for (const button of mounted.buttons) {
      button.addEventListener('click', () => {
        activeFamily = button.dataset.borderFamily || 'solar';
        render();
      });
    }
    return mounted;
  }

  function render() {
    const office = core.buildOffice(snapshot);
    const family = core.familyById(office, activeFamily);
    root.MuseumBorderOffice = Object.freeze({
      receivedAt: office.receivedAt || null,
      waiting: Boolean(office.waiting),
      totalLabels: office.totalLabels || 0,
      activeFamily
    });

    for (const button of ui.buttons) button.setAttribute('aria-pressed', String(button.dataset.borderFamily === activeFamily));

    if (office.waiting || !family) {
      if (ui.section) ui.section.dataset.state = 'waiting';
      if (ui.ruleName) ui.ruleName.textContent = 'WAITING FOR LATCH';
      if (ui.ruleText) ui.ruleText.textContent = 'The current local rule will appear after the first real Commons latch.';
      if (ui.borders) ui.borders.textContent = 'BORDERS · —';
      if (ui.status) ui.status.textContent = core.summarySentence(office, activeFamily);
      renderCards([]);
      renderFieldSheet(null);
      return;
    }

    if (ui.section) ui.section.dataset.state = 'ready';
    if (ui.ruleName) ui.ruleName.textContent = family.shortLabel;
    if (ui.ruleText) ui.ruleText.textContent = family.rule;
    if (ui.borders) ui.borders.textContent = `BORDERS · ${family.borderText}`;
    if (ui.status) ui.status.textContent = core.summarySentence(office, activeFamily);
    renderCards(family.entries);
    renderFieldSheet(office);
  }

  function renderCards(entries) {
    if (!ui.grid) return;
    ui.grid.replaceChildren();
    const fragment = document.createDocumentFragment();

    for (const current of entries) {
      const card = element('article', 'border-office-card');
      card.dataset.state = current.state;

      const stamp = element('span', 'border-office-stamp', current.stateLabel);
      const title = element('h3', null, current.label);
      const exit = element('strong', 'border-office-exit', current.exit);
      card.append(stamp, title, exit);

      const ledger = element('dl', 'border-office-ledger');
      const rows = [
        ['Current numeric', formatValue(current, current.value, current.valueDigits)],
        ['Nearest local border', formatValue(current, current.nearestBorder, current.borderDigits)],
        ['Arithmetic margin', formatMargin(current)]
      ];
      for (const [label, value] of rows) {
        const row = element('div');
        row.append(element('dt', null, label), element('dd', null, value));
        ledger.append(row);
      }
      card.append(ledger);

      const qualification = element('p', 'border-office-qualification');
      qualification.textContent = current.state === 'missing'
        ? 'No current value is substituted from an earlier latch.'
        : 'Margin is distance to this declared threshold only — not uncertainty, error, confidence, or quality.';
      card.append(qualification);
      fragment.append(card);
    }
    ui.grid.append(fragment);
  }

  function renderFieldSheet(office) {
    if (!ui.field) return;
    const strong = ui.field.querySelector('strong');
    const small = ui.field.querySelector('small');
    if (!office || office.waiting) {
      if (strong) strong.textContent = 'Local classification borders: unavailable';
      if (small) small.textContent = 'solar 350/500/700 km/s · light −6°/0° elevation · precipitation counted only above 0 mm';
      return;
    }

    const solar = core.familyById(office, 'solar');
    const light = core.familyById(office, 'light');
    const precipitation = core.familyById(office, 'precipitation');
    const solarLabel = solar?.entries?.[0]?.stateLabel || 'MISSING';
    const dayCount = light?.counts?.day || 0;
    const twilightCount = light?.counts?.twilight || 0;
    const nightCount = light?.counts?.night || 0;
    const reportingCount = precipitation?.counts?.reporting || 0;
    if (strong) strong.textContent = `Local labels: solar ${solarLabel} · light ${dayCount} day / ${twilightCount} twilight / ${nightCount} night · precipitation ${reportingCount}/13 counted`;
    if (small) small.textContent = 'Borders are Museum-local rules: solar 350/500/700 km/s · light −6°/0° elevation · precipitation >0 mm · proximity is not uncertainty or quality';
  }

  function formatValue(current, value, digits) {
    if (!Number.isFinite(value)) return '—';
    const number = Number(value).toLocaleString('en-US', {
      minimumFractionDigits: Math.max(0, digits || 0),
      maximumFractionDigits: Math.max(0, digits || 0),
      useGrouping: false
    });
    return `${number}${current.unit}`;
  }

  function formatMargin(current) {
    if (!Number.isFinite(current.margin)) return '—';
    const digits = current.familyId === 'light' ? 2 : 1;
    return formatValue(current, current.margin, digits);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
