(function attachFaultlineView(root) {
  'use strict';

  const core = root.MuseumFaultlineCore;
  const document = root.document;
  if (!core || !document) return;

  const SNAPSHOT_EVENT = 'museum:commons-snapshot';
  let selectedA = 'solar';
  let selectedB = 'scales';
  let armed = 'a';
  let availability = core.availabilityFromSnapshot(root.MuseumCommonsSnapshot);

  installStylesheet();
  const ui = mount();
  render();

  document.addEventListener(SNAPSHOT_EVENT, (event) => {
    availability = core.availabilityFromSnapshot(event.detail?.snapshot || root.MuseumCommonsSnapshot);
    render();
  });

  function installStylesheet() {
    if (document.querySelector('link[data-faultline-styles]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './faultline.css';
    link.dataset.faultlineStyles = 'true';
    document.head.append(link);
  }

  function mount() {
    if (document.querySelector('#faultline-core')) return collectUi();
    const anchor = document.querySelector('#sounding-well') || document.querySelector('.sample-hold-section');
    if (!anchor?.parentNode) return collectUi();

    const section = document.createElement('section');
    section.id = 'faultline-core';
    section.className = 'faultline-section';
    section.setAttribute('aria-labelledby', 'faultline-title');
    section.innerHTML = `
      <div class="faultline-heading">
        <p class="eyebrow">THE FAULTLINE CORE / SEMANTIC STRATIGRAPHY</p>
        <h2 id="faultline-title">Not everything in “now” is the same kind of now.</h2>
        <p>Geologists read a core by its layers instead of grinding every layer into one average. Patch any two current feed strata together. This instrument checks the support beneath their claims and refuses a common numeric scale when the measurement types do not justify one.</p>
      </div>
      <div class="faultline-console">
        <div class="faultline-patchbay">
          <div class="faultline-arm" role="group" aria-label="Choose which semantic core lead to move">
            <button id="faultline-arm-a" type="button" aria-pressed="true">LEAD A · FLOW</button>
            <button id="faultline-arm-b" type="button" aria-pressed="false">LEAD B · SCALES</button>
          </div>
          <ol id="faultline-strata" class="faultline-strata" aria-label="Five feed strata"></ol>
          <p id="faultline-help" class="faultline-help">Lead A is armed. Choose a stratum to repatch it.</p>
        </div>
        <div class="faultline-readout">
          <div class="faultline-verdict" data-verdict="waiting">
            <span>CORE INTERPRETATION</span>
            <strong id="faultline-verdict">WAITING</strong>
          </div>
          <p id="faultline-sentence" class="faultline-sentence" aria-live="polite">Waiting for the current latch.</p>
          <dl id="faultline-dimensions" class="faultline-dimensions"></dl>
          <div class="faultline-refusal">
            <span>DIRECT NUMERIC EQUIVALENCE</span>
            <strong id="faultline-numeric">REFUSED</strong>
            <p id="faultline-numeric-note">A shared page and shared latch do not create a shared unit.</p>
          </div>
        </div>
      </div>
      <p class="faultline-note"><strong>Alignment is categorical, not a confidence score.</strong> “Same temporal support” means the feeds occupy the same broad support class; it does not claim identical observation timestamps. The instrument uses only declared local semantics and the existing latched availability flags.</p>
    `;
    anchor.insertAdjacentElement('afterend', section);

    const mounted = collectUi();
    mounted.armA?.addEventListener('click', () => arm('a'));
    mounted.armB?.addEventListener('click', () => arm('b'));
    return mounted;
  }

  function collectUi() {
    return {
      armA: document.querySelector('#faultline-arm-a'),
      armB: document.querySelector('#faultline-arm-b'),
      strata: document.querySelector('#faultline-strata'),
      help: document.querySelector('#faultline-help'),
      verdictBox: document.querySelector('.faultline-verdict'),
      verdict: document.querySelector('#faultline-verdict'),
      sentence: document.querySelector('#faultline-sentence'),
      dimensions: document.querySelector('#faultline-dimensions'),
      numeric: document.querySelector('#faultline-numeric'),
      numericNote: document.querySelector('#faultline-numeric-note')
    };
  }

  function arm(which) {
    armed = which;
    render();
  }

  function patch(id) {
    if (armed === 'a') {
      if (id === selectedB) [selectedA, selectedB] = [selectedB, selectedA];
      else selectedA = id;
    } else {
      if (id === selectedA) [selectedA, selectedB] = [selectedB, selectedA];
      else selectedB = id;
    }
    render();
  }

  function render() {
    const result = core.compareStrata(selectedA, selectedB, availability);
    if (!result) return;

    if (ui.armA) {
      ui.armA.textContent = `LEAD A · ${result.left.label}`;
      ui.armA.setAttribute('aria-pressed', String(armed === 'a'));
    }
    if (ui.armB) {
      ui.armB.textContent = `LEAD B · ${result.right.label}`;
      ui.armB.setAttribute('aria-pressed', String(armed === 'b'));
    }
    if (ui.help) ui.help.textContent = `Lead ${armed.toUpperCase()} is armed. Choose any feed stratum; selecting the opposite lead swaps the pair.`;

    renderStrata(result);
    if (ui.verdictBox) ui.verdictBox.dataset.verdict = result.verdict;
    if (ui.verdict) ui.verdict.textContent = result.verdictLabel;
    if (ui.sentence) ui.sentence.textContent = result.sentence;
    renderDimensions(result);

    if (ui.numeric) ui.numeric.textContent = result.numericComparable ? 'ALIGNED' : 'REFUSED';
    if (ui.numericNote) {
      ui.numericNote.textContent = result.numericComparable
        ? `Both leads declare ${result.left.unitLabel}.`
        : `${result.left.unitLabel} ↔ ${result.right.unitLabel}. A common page and common latch do not create a common unit.`;
    }
  }

  function renderStrata(result) {
    if (!ui.strata) return;
    ui.strata.replaceChildren();
    for (const stratum of core.STRATA) {
      const item = document.createElement('li');
      item.className = 'faultline-stratum';
      item.dataset.available = String(Boolean(availability[stratum.id]));
      item.dataset.lead = stratum.id === result.left.id ? 'a' : stratum.id === result.right.id ? 'b' : 'none';

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'faultline-stratum-button';
      button.dataset.feed = stratum.id;
      button.addEventListener('click', () => patch(stratum.id));

      const head = document.createElement('span');
      head.className = 'faultline-stratum-head';
      const source = document.createElement('small');
      source.textContent = stratum.source;
      const label = document.createElement('strong');
      label.textContent = stratum.label;
      const state = document.createElement('i');
      state.textContent = availability[stratum.id] ? 'LATCHED' : 'UNAVAILABLE';
      head.append(source, label, state);

      const traits = document.createElement('span');
      traits.className = 'faultline-traits';
      for (const text of [stratum.timeLabel, stratum.spaceLabel, stratum.shapeLabel]) {
        const trait = document.createElement('b');
        trait.textContent = text;
        traits.append(trait);
      }

      button.append(head, traits);
      item.append(button);
      ui.strata.append(item);
    }
  }

  function renderDimensions(result) {
    if (!ui.dimensions) return;
    ui.dimensions.replaceChildren();
    for (const dimension of result.dimensions) {
      const row = document.createElement('div');
      row.dataset.state = dimension.aligned ? 'aligned' : 'split';
      const term = document.createElement('dt');
      term.textContent = dimension.label;
      const value = document.createElement('dd');
      const state = document.createElement('strong');
      state.textContent = dimension.aligned ? 'ALIGNED' : 'SPLIT';
      const detail = document.createElement('small');
      detail.textContent = dimension.detail;
      value.append(state, detail);
      row.append(term, value);
      ui.dimensions.append(row);
    }
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);