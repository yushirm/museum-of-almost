(function attachGravitationalCopyView() {
  'use strict';

  const core = window.MuseumGravitationalCopyCore;
  if (!core) return;

  function make(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof text === 'string') node.textContent = text;
    return node;
  }

  function formatSigned(value, digits = 3) {
    const rounded = Number(value).toFixed(digits);
    return `${value > 0 ? '+' : ''}${rounded}`;
  }

  function mount() {
    if (document.getElementById('gravitational-copy-title')) return;
    const closing = document.querySelector('.cosmos-section[aria-labelledby="closing-title"]');
    if (!closing || !closing.parentNode) return;

    const section = make('section', 'cosmos-section');
    section.setAttribute('aria-labelledby', 'gravitational-copy-title');

    const heading = make('div', 'section-heading');
    heading.append(make('p', 'eyebrow', 'INSTRUMENT 08 · THE GRAVITATIONAL COPY ROOM / ONE SOURCE, MORE THAN ONE IMAGE'));
    const title = make('h2', '', 'Two cards can be one thing.');
    title.id = 'gravitational-copy-title';
    heading.append(
      title,
      make('p', '', 'Choose a fixed source offset behind an idealized point-mass lens. The page deliberately permits one immutable source identity to appear in more than one image card because the lens equation admits more than one apparent image position.')
    );

    const shell = make('div', 'gravitational-copy-room');
    const controls = make('div', 'copy-room-controls');
    controls.setAttribute('role', 'group');
    controls.setAttribute('aria-label', 'Choose a normalized source offset');
    for (const [index, item] of core.CASES.entries()) {
      const button = make('button', '', item.label);
      button.type = 'button';
      button.dataset.lensCaseId = item.id;
      button.dataset.active = String(index === 0);
      button.setAttribute('aria-pressed', String(index === 0));
      controls.append(button);
    }

    const layout = make('div', 'copy-room-layout');
    const stagePanel = make('section', 'copy-stage-panel');
    stagePanel.setAttribute('aria-labelledby', 'copy-stage-title');
    const stageHead = make('div', 'copy-stage-head');
    const stageTitle = make('h3', '', 'Apparent image field');
    stageTitle.id = 'copy-stage-title';
    stageHead.append(stageTitle, make('span', '', 'positions in Einstein-radius units'));

    const stage = make('div', 'copy-stage');
    stage.setAttribute('aria-label', 'Schematic one-dimensional gravitational lens image field');
    const axis = make('span', 'copy-axis');
    axis.setAttribute('aria-hidden', 'true');
    const lens = make('div', 'copy-lens');
    lens.append(make('strong', '', 'LENS'), make('span', '', 'x = 0'));
    const ring = make('div', 'copy-ring');
    ring.setAttribute('aria-hidden', 'true');
    const imageLayer = make('div', 'copy-image-layer');
    imageLayer.id = 'copy-image-layer';
    const invariantBadge = make('div', 'copy-invariant-badge');
    invariantBadge.id = 'copy-invariant-badge';
    invariantBadge.setAttribute('aria-hidden', 'true');
    stage.append(axis, ring, lens, imageLayer, invariantBadge);

    const identity = make('div', 'copy-identity-spine');
    identity.append(
      make('span', 'copy-identity-kicker', 'SOURCE IDENTITY'),
      make('strong', '', core.SOURCE_ID),
      make('span', '', 'One fictional source. Apparent image count may change; identity does not.')
    );

    stagePanel.append(
      stageHead,
      stage,
      identity,
      make('p', 'copy-stage-note', 'The stage is schematic and one-dimensional. Card position is normalized from the exact lens-equation solution; it is not a sky coordinate, mass estimate, or distance measurement.')
    );

    const readout = make('section', 'copy-readout');
    readout.setAttribute('aria-live', 'polite');
    const readoutHead = make('div', 'copy-readout-head');
    readoutHead.append(make('h3', '', 'Lens equation ledger'), make('span', '', 'θE = 1'));
    const caseTitle = make('h3', 'copy-case-title', 'Perfect alignment');
    caseTitle.id = 'copy-case-title';
    const caseNote = make('p', '', '');
    caseNote.id = 'copy-case-note';

    const metrics = make('div', 'copy-metrics');
    const metricDefinitions = [
      ['copy-source-offset', 'Source offset y'],
      ['copy-image-a', 'Image A position x+'],
      ['copy-image-b', 'Image B position x−'],
      ['copy-separation', 'Image separation'],
      ['copy-root-product', '1D root product x+ × x−'],
      ['copy-model-state', 'Apparent image state']
    ];
    for (const [id, label] of metricDefinitions) {
      const metric = make('div', 'copy-metric');
      metric.append(make('span', '', label));
      const value = make('strong', '', '—');
      value.id = id;
      metric.append(value);
      metrics.append(metric);
    }

    const equation = make('p', 'copy-equation', 'Normalized point-lens equation: y = x − 1/x');
    const integrity = make('p', 'copy-integrity', 'Repeated image cards are not repeated source records. The reciprocal root product is an invariant of this normalized ideal equation, not an extra observation. This toy model describes apparent image positions only; it does not infer lens mass, source distance, brightness, or a real sky configuration.');
    readout.append(readoutHead, caseTitle, caseNote, metrics, equation, integrity);

    layout.append(stagePanel, readout);
    shell.append(controls, layout);
    section.append(heading, shell);
    closing.parentNode.insertBefore(section, closing);

    const buttons = [...controls.querySelectorAll('[data-lens-case-id]')];
    const imageAValue = readout.querySelector('#copy-image-a');
    const imageBValue = readout.querySelector('#copy-image-b');
    const separationValue = readout.querySelector('#copy-separation');
    const rootProductValue = readout.querySelector('#copy-root-product');
    const sourceOffsetValue = readout.querySelector('#copy-source-offset');
    const modelStateValue = readout.querySelector('#copy-model-state');

    function imageCard(image) {
      const card = make('article', 'copy-image-card');
      card.dataset.parity = image.parity;
      card.dataset.apparentImageId = image.id;
      card.append(
        make('span', 'copy-image-kicker', 'APPARENT IMAGE'),
        make('strong', '', image.label),
        make('span', 'copy-shared-source', `SOURCE ${image.sourceId}`),
        make('span', 'copy-position', `x = ${formatSigned(image.position)}`),
        make('span', 'copy-parity', `${image.parity.toUpperCase()} PARITY`)
      );
      const left = 50 + Math.max(-38, Math.min(38, image.position * 16));
      card.style.setProperty('--copy-left', `${left}%`);
      return card;
    }

    function render(caseId) {
      const snap = core.snapshot(caseId);
      if (!snap) return;
      for (const button of buttons) {
        const active = button.dataset.lensCaseId === caseId;
        button.dataset.active = String(active);
        button.setAttribute('aria-pressed', String(active));
      }

      caseTitle.textContent = snap.label;
      caseNote.textContent = snap.note;
      sourceOffsetValue.textContent = `${snap.sourceOffset.toFixed(3)} θE`;
      rootProductValue.textContent = snap.aligned
        ? `${snap.rootProduct.toFixed(3)} · 1D roots become ring by symmetry`
        : `${snap.rootProduct.toFixed(3)} · reciprocal lock`;
      imageLayer.replaceChildren();
      stage.dataset.aligned = String(snap.aligned);

      if (snap.aligned) {
        imageAValue.textContent = 'continuous ring';
        imageBValue.textContent = 'continuous ring';
        separationValue.textContent = 'not two discrete images';
        modelStateValue.textContent = 'EINSTEIN RING · radius 1.000 θE';
        invariantBadge.dataset.state = 'ring';
        invariantBadge.textContent = 'ALIGNMENT LIMIT · 1D ROOTS ±1 → RING';
        ring.dataset.visible = 'true';
        const ringLabel = make('p', 'copy-ring-label', `ONE SOURCE ${snap.sourceId} → CONTINUOUS RING IMAGE`);
        imageLayer.append(ringLabel);
        return;
      }

      ring.dataset.visible = 'false';
      invariantBadge.dataset.state = 'reciprocal';
      invariantBadge.textContent = 'RECIPROCAL LOCK · x+ × x− = −1';
      imageLayer.append(...snap.images.map(imageCard));
      imageAValue.textContent = `${formatSigned(snap.images[0].position)} θE · ${snap.images[0].parity} parity`;
      imageBValue.textContent = `${formatSigned(snap.images[1].position)} θE · ${snap.images[1].parity} parity`;
      separationValue.textContent = `${snap.separation.toFixed(3)} θE`;
      modelStateValue.textContent = `TWO IMAGES · ONE SOURCE ${snap.sourceId}`;
    }

    for (const button of buttons) {
      button.addEventListener('click', () => render(button.dataset.lensCaseId));
    }

    render(core.CASES[0].id);
  }

  mount();
})();
