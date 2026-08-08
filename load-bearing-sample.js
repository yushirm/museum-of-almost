(function attachLoadBearingSampleView(root) {
  'use strict';

  const core = root.MuseumLoadBearingSampleCore;
  const commons = root.MuseumCommonsCore;
  const document = root.document;
  if (!core || !commons || !document) return;

  const SNAPSHOT_EVENT = 'museum:commons-snapshot';
  let snapshot = root.MuseumCommonsSnapshot || null;
  let activeClaim = 'min-temp';
  let selectedPin = null;

  installStylesheet();
  const ui = mount();
  render();

  document.addEventListener(SNAPSHOT_EVENT, (event) => {
    snapshot = event.detail?.snapshot || root.MuseumCommonsSnapshot || null;
    activeClaim = 'min-temp';
    selectedPin = null;
    render();
  });

  function installStylesheet() {
    if (document.querySelector('link[data-load-bearing-sample-styles]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './load-bearing-sample.css';
    link.dataset.loadBearingSampleStyles = 'true';
    document.head.append(link);
  }

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function mount() {
    let section = document.querySelector('#load-bearing-sample');
    if (!section) {
      section = element('section', 'load-bearing-sample-section');
      section.id = 'load-bearing-sample';
      section.setAttribute('aria-labelledby', 'load-bearing-sample-title');

      const heading = element('div', 'load-bearing-sample-heading');
      heading.append(
        element('p', 'eyebrow', 'THE LOAD-BEARING SAMPLE / PULL ONE PIN'),
        element('h2', null, 'Which observation is holding this headline up?'),
        element('p', null, 'Take one current weather point out of one existing local summary and recompute it. The real latch never changes. The omission is a hypothetical load test, not a judgment about the place or the provider.')
      );
      heading.querySelector('h2').id = 'load-bearing-sample-title';

      const controls = element('div', 'load-bearing-claim-controls');
      controls.setAttribute('role', 'group');
      controls.setAttribute('aria-label', 'Choose a current weather aggregate to load test');
      for (const claim of core.CLAIMS) {
        const button = element('button', null, claim.shortLabel);
        button.type = 'button';
        button.dataset.loadClaim = claim.id;
        button.setAttribute('aria-pressed', String(claim.id === activeClaim));
        controls.append(button);
      }

      const beam = element('div', 'load-bearing-beam');
      const actual = element('div', 'load-bearing-beam-cell');
      actual.append(element('span', 'eyebrow', 'REAL LATCH'), element('strong', 'load-bearing-real', '—'));
      const joint = element('div', 'load-bearing-joint');
      joint.append(element('span', null, 'PULL ONE PIN'), element('b', null, '→'));
      const hypothetical = element('div', 'load-bearing-beam-cell hypothetical');
      hypothetical.append(element('span', 'eyebrow', 'HYPOTHETICAL'), element('strong', 'load-bearing-hypothetical', 'NO PIN PULLED'));
      beam.append(actual, joint, hypothetical);

      const detail = element('p', 'load-bearing-detail', 'Choose one current point below to test a one-point omission.');
      detail.id = 'load-bearing-detail';
      detail.setAttribute('role', 'status');
      detail.setAttribute('aria-live', 'polite');

      const grid = element('div', 'load-bearing-grid');
      grid.id = 'load-bearing-grid';
      grid.setAttribute('aria-label', 'Thirteen fixed weather samples tested against the selected headline');

      const doctrine = element('p', 'load-bearing-doctrine');
      doctrine.append(
        element('strong', null, 'UNCHANGED DOES NOT MEAN UNIMPORTANT.'),
        document.createTextNode(' A point is called load-bearing only when removing that one current sample changes or removes this one normalized headline. The test says nothing about representativeness, causality, uncertainty, quality, reliability, or the importance of a location in the world.')
      );

      section.append(heading, controls, beam, detail, grid, doctrine);
      const anchor = document.querySelector('#border-office') || document.querySelector('#offcut-drawer') || document.querySelector('#rest-score') || document.querySelector('.windows-section');
      if (anchor?.parentNode) anchor.insertAdjacentElement('afterend', section);
    }

    let field = document.querySelector('#field-sheet-load-bearing-sample');
    const fieldMeta = document.querySelector('#field-sheet .field-sheet-meta');
    if (!field && fieldMeta) {
      field = document.createElement('span');
      field.id = 'field-sheet-load-bearing-sample';
      field.className = 'field-sheet-load-bearing-sample';
      field.append(
        element('strong', null, 'One-point aggregate sensitivity: unavailable'),
        document.createElement('br'),
        element('small', null, 'current-latch one-point omissions only · counts are not importance, quality, representativeness, or uncertainty')
      );
      fieldMeta.append(field);
    }

    const mounted = {
      section,
      buttons: [...document.querySelectorAll('[data-load-claim]')],
      real: section.querySelector('.load-bearing-real'),
      hypothetical: section.querySelector('.load-bearing-hypothetical'),
      detail: document.querySelector('#load-bearing-detail'),
      grid: document.querySelector('#load-bearing-grid'),
      field
    };

    for (const button of mounted.buttons) {
      button.addEventListener('click', () => {
        activeClaim = button.dataset.loadClaim || 'min-temp';
        selectedPin = null;
        render();
      });
    }
    return mounted;
  }

  function render() {
    const rig = core.buildRig(snapshot, commons.STATIONS);
    const claim = core.claimById(rig, activeClaim);

    root.MuseumLoadBearingSample = Object.freeze({
      receivedAt: rig.receivedAt || null,
      waiting: Boolean(rig.waiting),
      activeClaim,
      selectedPin
    });

    for (const button of ui.buttons) button.setAttribute('aria-pressed', String(button.dataset.loadClaim === activeClaim));

    if (rig.waiting || !claim) {
      if (ui.section) ui.section.dataset.state = 'waiting';
      if (ui.real) ui.real.textContent = '—';
      if (ui.hypothetical) ui.hypothetical.textContent = 'NO PIN PULLED';
      if (ui.detail) ui.detail.textContent = core.summarySentence(rig, activeClaim);
      renderCards(null);
      renderFieldSheet(null);
      return;
    }

    if (ui.section) ui.section.dataset.state = claim.current === null ? 'unavailable' : 'ready';
    if (ui.real) ui.real.textContent = `${claim.shortLabel} · ${formatClaimValue(claim, claim.current)}`;
    renderCards(claim);
    renderSelected(claim);
    renderFieldSheet(rig);
  }

  function renderSelected(claim) {
    if (!ui.hypothetical || !ui.detail) return;
    if (claim.current === null) {
      selectedPin = null;
      ui.hypothetical.textContent = 'HEADLINE UNAVAILABLE';
      ui.detail.textContent = core.summarySentence({ waiting: false, claims: [claim] }, claim.id);
      return;
    }

    const selected = selectedPin ? core.entryById(claim, selectedPin) : null;
    if (!selected || !selected.canPull) {
      selectedPin = null;
      ui.hypothetical.textContent = 'NO PIN PULLED';
      ui.detail.textContent = core.summarySentence({ waiting: false, claims: [claim] }, claim.id);
      return;
    }

    ui.hypothetical.textContent = selected.hypothetical === null
      ? `WITHOUT POINT ${selected.id} · UNAVAILABLE`
      : `WITHOUT POINT ${selected.id} · ${formatClaimValue(claim, selected.hypothetical)}`;

    if (selected.state === 'sole') {
      ui.detail.textContent = `HYPOTHETICAL: pulling Point ${selected.id} removes the last evaluable support for ${claim.shortLabel}. The real latch remains unchanged.`;
      return;
    }
    if (selected.state === 'unchanged') {
      ui.detail.textContent = `HYPOTHETICAL: pulling Point ${selected.id} leaves the normalized ${claim.shortLabel} headline unchanged. That does not make the point redundant or unimportant.`;
      return;
    }
    ui.detail.textContent = `HYPOTHETICAL: pulling Point ${selected.id} changes ${claim.shortLabel} by ${formatDelta(claim, selected.delta)}. The real latch remains authoritative.`;
  }

  function renderCards(claim) {
    if (!ui.grid) return;
    ui.grid.replaceChildren();
    if (!claim) return;
    const fragment = document.createDocumentFragment();

    for (const entry of claim.entries) {
      const card = element('article', 'load-bearing-card');
      card.dataset.state = entry.state;
      if (entry.id === selectedPin) card.dataset.selected = 'true';

      const top = element('div', 'load-bearing-card-top');
      top.append(element('span', 'load-bearing-station', `POINT ${entry.id}`), element('span', 'load-bearing-state', entry.stateLabel));
      card.append(top);

      const value = entry.value === null ? '—' : formatInputValue(claim, entry.value);
      const effect = entry.hypothetical === null
        ? (entry.state === 'missing' ? 'No current value for this claim' : 'Headline becomes unavailable')
        : sameDisplay(entry.current, entry.hypothetical)
          ? `Without point ${entry.id}: headline unchanged`
          : `Without point ${entry.id}: ${formatClaimValue(claim, entry.hypothetical)}`;
      card.append(element('strong', 'load-bearing-value', value), element('p', 'load-bearing-effect', effect));

      const button = element('button', 'load-bearing-pin', entry.state === 'missing' ? `POINT ${entry.id} MISSING` : `PULL PIN ${entry.id}`);
      button.type = 'button';
      button.dataset.loadPin = entry.id;
      button.disabled = !entry.canPull || claim.current === null;
      button.setAttribute('aria-pressed', String(entry.id === selectedPin));
      if (!button.disabled) {
        button.addEventListener('click', () => {
          selectedPin = selectedPin === entry.id ? null : entry.id;
          render();
        });
      }
      card.append(button);
      fragment.append(card);
    }
    ui.grid.append(fragment);
  }

  function renderFieldSheet(rig) {
    if (!ui.field) return;
    const strong = ui.field.querySelector('strong');
    const small = ui.field.querySelector('small');
    if (!rig || rig.waiting) {
      if (strong) strong.textContent = 'One-point aggregate sensitivity: unavailable';
      if (small) small.textContent = 'current-latch one-point omissions only · counts are not importance, quality, representativeness, or uncertainty';
      return;
    }

    const parts = rig.claims.map((claim) => claim.current === null
      ? `${claim.shortLabel.toLowerCase()} unavailable`
      : `${claim.shortLabel.toLowerCase()} ${claim.loadBearingCount}/${claim.evaluableCount}`);
    if (strong) strong.textContent = `One-point load-bearing counts: ${parts.join(' · ')}`;
    if (small) small.textContent = 'Each count asks whether one omission changes/removes that normalized headline; not importance, quality, representativeness, causality, or uncertainty';
  }

  function sameDisplay(left, right) {
    if (left === null || right === null) return left === right;
    return Number(left) === Number(right);
  }

  function formatInputValue(claim, value) {
    if (!Number.isFinite(value)) return '—';
    if (claim.id === 'precip-count') return `${Number(value).toFixed(1)} mm at this point`;
    return formatClaimValue(claim, value);
  }

  function formatClaimValue(claim, value) {
    if (!Number.isFinite(value)) return '—';
    const number = Number(value).toLocaleString('en-US', {
      minimumFractionDigits: claim.digits,
      maximumFractionDigits: claim.digits,
      useGrouping: false
    });
    if (claim.id === 'precip-count') return `${number} reporting point${Number(value) === 1 ? '' : 's'}`;
    return `${number}${claim.unit}`;
  }

  function formatDelta(claim, value) {
    if (!Number.isFinite(value)) return '—';
    const sign = value > 0 ? '+' : '';
    if (claim.id === 'precip-count') return `${sign}${Number(value).toFixed(0)} point${Math.abs(Number(value)) === 1 ? '' : 's'}`;
    return `${sign}${Number(value).toFixed(claim.digits)}${claim.unit}`;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
