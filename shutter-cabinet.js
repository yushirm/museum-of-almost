(function attachShutterCabinetView(root) {
  'use strict';

  const core = root.MuseumShutterCabinetCore;
  const document = root.document;
  if (!core || !document) return;

  const SNAPSHOT_EVENT = 'museum:commons-snapshot';
  let snapshot = root.MuseumCommonsSnapshot || null;
  let leftId = 'earthquakes';
  let rightId = 'weather';
  let forced = false;

  installStylesheet();
  const ui = mount();
  render();

  document.addEventListener(SNAPSHOT_EVENT, (event) => {
    snapshot = event.detail?.snapshot || root.MuseumCommonsSnapshot || null;
    leftId = 'earthquakes';
    rightId = 'weather';
    forced = false;
    render();
  });

  function installStylesheet() {
    if (document.querySelector('link[data-shutter-cabinet-styles]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './shutter-cabinet.css';
    link.dataset.shutterCabinetStyles = 'true';
    document.head.append(link);
  }

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function mount() {
    let section = document.querySelector('#shutter-cabinet');
    if (!section) {
      section = element('section', 'shutter-cabinet-section');
      section.id = 'shutter-cabinet';
      section.setAttribute('aria-labelledby', 'shutter-cabinet-title');

      const heading = element('div', 'shutter-cabinet-heading');
      heading.append(
        element('p', 'eyebrow', 'THE SHUTTER CABINET / SAME LATCH, DIFFERENT TEMPORAL SUPPORT'),
        element('h2', null, 'One snapshot does not imply one exposure.'),
        element('p', null, 'Choose two current claim families, then try to force them onto one temporal form. The Museum will join the frame only when their declared support form matches.')
      );
      heading.querySelector('h2').id = 'shutter-cabinet-title';

      const selector = element('div', 'shutter-cabinet-selector');
      selector.append(
        buildTray('A', 'Choose claim family for shutter A'),
        buildTray('B', 'Choose claim family for shutter B')
      );

      const force = element('button', 'shutter-cabinet-force', 'FORCE ONE NOW');
      force.type = 'button';
      force.dataset.shutterForce = 'true';
      force.setAttribute('aria-pressed', 'false');

      const stage = element('div', 'shutter-cabinet-stage');
      stage.setAttribute('aria-label', 'Temporal support comparison stage');

      const left = buildPlate('A');
      const bridge = element('div', 'shutter-cabinet-bridge');
      bridge.setAttribute('aria-hidden', 'true');
      bridge.append(
        element('span', 'shutter-cabinet-rail shutter-cabinet-rail-left'),
        element('span', 'shutter-cabinet-bridge-label', 'SHARED TIME AXIS'),
        element('span', 'shutter-cabinet-rail shutter-cabinet-rail-right')
      );
      const right = buildPlate('B');
      stage.append(left, bridge, right);

      const verdict = element('div', 'shutter-cabinet-verdict');
      verdict.setAttribute('role', 'status');
      verdict.setAttribute('aria-live', 'polite');
      verdict.append(
        element('span', 'shutter-cabinet-verdict-kicker', 'TEMPORAL INTERLOCK'),
        element('strong', 'shutter-cabinet-verdict-title', 'INSPECT SUPPORT'),
        element('p', 'shutter-cabinet-verdict-copy', 'The latch is shared. Temporal form has not been forced onto one axis.')
      );

      const doctrine = element('p', 'shutter-cabinet-doctrine');
      doctrine.append(
        element('strong', null, 'THE LATCH IS A COMMIT BOUNDARY, NOT A UNIVERSAL MEASUREMENT WINDOW.'),
        document.createTextNode(' Sounding Well owns source timestamp depth. This cabinet owns only the declared temporal form of each current claim family: trailing window, current reading, or status-defined set.')
      );

      section.append(heading, selector, force, stage, verdict, doctrine);
      const anchor = document.querySelector('#quorum-gate') || document.querySelector('#shuffle-table') || document.querySelector('#gauge-bench') || document.querySelector('.windows-section');
      if (anchor?.parentNode) anchor.insertAdjacentElement('afterend', section);
    }

    let field = document.querySelector('#field-sheet-shutter-cabinet');
    const fieldMeta = document.querySelector('#field-sheet .field-sheet-meta');
    if (!field && fieldMeta) {
      field = document.createElement('span');
      field.id = 'field-sheet-shutter-cabinet';
      field.className = 'field-sheet-shutter-cabinet';
      field.append(
        element('strong', null, 'Temporal support audit: unavailable'),
        document.createElement('br'),
        element('small', null, 'same latch does not imply one temporal support form')
      );
      fieldMeta.append(field);
    }

    const mounted = {
      section,
      leftButtons: [...section.querySelectorAll('[data-shutter-side="A"] [data-shutter-claim]')],
      rightButtons: [...section.querySelectorAll('[data-shutter-side="B"] [data-shutter-claim]')],
      force: section.querySelector('[data-shutter-force]'),
      leftPlate: section.querySelector('[data-shutter-plate="A"]'),
      rightPlate: section.querySelector('[data-shutter-plate="B"]'),
      bridge: section.querySelector('.shutter-cabinet-bridge'),
      verdictTitle: section.querySelector('.shutter-cabinet-verdict-title'),
      verdictCopy: section.querySelector('.shutter-cabinet-verdict-copy'),
      field
    };

    for (const button of mounted.leftButtons) {
      button.addEventListener('click', () => {
        leftId = button.dataset.shutterClaim || 'earthquakes';
        forced = false;
        render();
      });
    }
    for (const button of mounted.rightButtons) {
      button.addEventListener('click', () => {
        rightId = button.dataset.shutterClaim || 'weather';
        forced = false;
        render();
      });
    }
    mounted.force?.addEventListener('click', () => {
      const pair = core.buildPair(snapshot, leftId, rightId);
      if (pair.waiting || pair.contract.outcome === core.OUTCOMES.SAME_CLAIM) return;
      forced = !forced;
      render();
    });

    return mounted;
  }

  function buildTray(side, label) {
    const tray = element('div', 'shutter-cabinet-tray');
    tray.dataset.shutterSide = side;
    tray.setAttribute('role', 'group');
    tray.setAttribute('aria-label', label);
    tray.append(element('span', 'shutter-cabinet-tray-label', `SHUTTER ${side}`));
    const buttons = element('div', 'shutter-cabinet-buttons');
    for (const claim of core.CLAIMS) {
      const button = element('button', null, claim.shortLabel);
      button.type = 'button';
      button.dataset.shutterClaim = claim.id;
      button.setAttribute('aria-pressed', 'false');
      buttons.append(button);
    }
    tray.append(buttons);
    return tray;
  }

  function buildPlate(side) {
    const plate = element('article', 'shutter-cabinet-plate');
    plate.dataset.shutterPlate = side;
    plate.append(
      element('span', 'shutter-cabinet-plate-side', `SHUTTER ${side}`),
      element('strong', 'shutter-cabinet-plate-title', '—'),
      element('span', 'shutter-cabinet-aperture', '—'),
      element('p', 'shutter-cabinet-readout', '—'),
      element('p', 'shutter-cabinet-contract', '—'),
      element('p', 'shutter-cabinet-scope', '—')
    );
    return plate;
  }

  function render() {
    const pair = core.buildPair(snapshot, leftId, rightId);
    const sameClaim = leftId === rightId;

    root.MuseumShutterCabinet = Object.freeze({
      receivedAt: pair.receivedAt,
      leftId,
      rightId,
      forced,
      outcome: pair.contract.outcome
    });

    updateButtons(ui.leftButtons, leftId, rightId);
    updateButtons(ui.rightButtons, rightId, leftId);

    if (ui.force) {
      ui.force.disabled = pair.waiting || sameClaim;
      ui.force.setAttribute('aria-pressed', String(forced));
      ui.force.textContent = forced ? 'RELEASE THE AXIS' : 'FORCE ONE NOW';
    }

    renderPlate(ui.leftPlate, pair.left);
    renderPlate(ui.rightPlate, pair.right);

    const outcome = forced ? pair.contract.outcome : 'INSPECT SUPPORT';
    if (ui.section) {
      ui.section.dataset.state = pair.waiting ? 'waiting' : 'ready';
      ui.section.dataset.outcome = forced
        ? (pair.contract.commonForm ? 'common' : pair.contract.outcome === core.OUTCOMES.DIFFERENT ? 'broken' : 'same')
        : 'inspect';
    }
    if (ui.bridge) ui.bridge.dataset.outcome = ui.section?.dataset.outcome || 'inspect';
    if (ui.verdictTitle) ui.verdictTitle.textContent = outcome;
    if (ui.verdictCopy) ui.verdictCopy.textContent = core.summarySentence(pair, forced);

    renderFieldSheet(pair);
  }

  function updateButtons(buttons, selectedId, oppositeId) {
    for (const button of buttons) {
      const id = button.dataset.shutterClaim;
      button.setAttribute('aria-pressed', String(id === selectedId));
      button.disabled = id === oppositeId && id !== selectedId;
    }
  }

  function renderPlate(plate, claim) {
    if (!plate || !claim) return;
    const title = plate.querySelector('.shutter-cabinet-plate-title');
    const aperture = plate.querySelector('.shutter-cabinet-aperture');
    const readout = plate.querySelector('.shutter-cabinet-readout');
    const contract = plate.querySelector('.shutter-cabinet-contract');
    const scope = plate.querySelector('.shutter-cabinet-scope');
    if (title) title.textContent = claim.label;
    if (aperture) aperture.textContent = `${claim.aperture} · ${claim.form}`;
    if (readout) readout.textContent = claim.readout;
    if (contract) contract.textContent = claim.contract;
    if (scope) scope.textContent = claim.scope;
    plate.dataset.available = String(claim.available);
    plate.dataset.form = claim.form.toLowerCase().replace(/\s+/g, '-');
  }

  function renderFieldSheet(pair) {
    if (!ui.field) return;
    const strong = ui.field.querySelector('strong');
    const small = ui.field.querySelector('small');
    if (pair.waiting) {
      if (strong) strong.textContent = 'Temporal support audit: unavailable';
      if (small) small.textContent = 'same latch does not imply one temporal support form';
      return;
    }
    if (strong) strong.textContent = `${pair.left.shortLabel} [${pair.left.form}] ↔ ${pair.right.shortLabel} [${pair.right.form}] · ${pair.contract.outcome}`;
    if (small) small.textContent = pair.contract.commonForm
      ? 'common form only; not common instant, freshness, duration, synchronization, or quality'
      : 'shared latch does not authorize one time axis; no duration is inferred for status-defined sets';
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
