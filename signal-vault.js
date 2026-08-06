(() => {
  'use strict';

  const STORAGE_KEY = 'museum-of-almost:v1';
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const core = globalThis.MuseumSignalVaultCore;
  const headerActions = document.querySelector('.header-actions');
  const catalogueButton = document.querySelector('#catalogue-button');
  const fragmentCount = document.querySelector('#fragment-count');

  if (!core || !headerActions || !catalogueButton) return;

  const signals = core.buildSignals();
  let activeIndex = 0;

  injectStyles();
  const signalButton = createSignalButton();
  const signalDialog = createSignalDialog();
  const lineLayer = signalDialog.querySelector('#signal-lines');
  const nodeHost = signalDialog.querySelector('#signal-nodes');
  const designation = signalDialog.querySelector('#signal-designation');
  const title = signalDialog.querySelector('#signal-reading-title');
  const origin = signalDialog.querySelector('#signal-origin');
  const distance = signalDialog.querySelector('#signal-distance');
  const transmission = signalDialog.querySelector('#signal-transmission');
  const interpretation = signalDialog.querySelector('#signal-interpretation');
  const tone = signalDialog.querySelector('#signal-tone');
  const echo = signalDialog.querySelector('#signal-echo');
  const roomNote = signalDialog.querySelector('#signal-room-note');
  const previousButton = signalDialog.querySelector('#signal-previous');
  const nextButton = signalDialog.querySelector('#signal-next');

  renderConstellation();
  selectSignal(0, false);

  signalButton.addEventListener('click', () => {
    selectSignal(activeIndex, false);
    openDialog(signalDialog);
  });
  previousButton.addEventListener('click', () => selectSignal((activeIndex + signals.length - 1) % signals.length));
  nextButton.addEventListener('click', () => selectSignal((activeIndex + 1) % signals.length));
  window.addEventListener('storage', refreshLocalEcho);

  if (fragmentCount && typeof MutationObserver === 'function') {
    const observer = new MutationObserver(refreshLocalEcho);
    observer.observe(fragmentCount, { childList: true, characterData: true, subtree: true });
  }

  function injectStyles() {
    const style = document.createElement('style');
    style.dataset.museumSignalVault = '';
    style.textContent = `
      .signal-button > span:first-child {
        color: #91d8ff;
      }

      .signal-dialog {
        width: min(920px, calc(100% - 1.2rem));
        max-width: none;
      }

      .signal-dialog::backdrop {
        background: rgba(3, 7, 13, 0.9);
        backdrop-filter: blur(12px);
      }

      .signal-frame {
        width: 100%;
        max-height: min(92vh, 900px);
        overflow: auto;
        background:
          radial-gradient(circle at 14% 4%, rgba(60, 142, 183, 0.2), transparent 28rem),
          radial-gradient(circle at 88% 40%, rgba(111, 75, 145, 0.15), transparent 30rem),
          #0d1118;
      }

      .signal-kicker {
        color: #91d8ff;
      }

      .signal-intro {
        max-width: 50rem;
        margin-bottom: 1.1rem;
        color: var(--muted);
        font-family: Georgia, "Times New Roman", serif;
        font-size: clamp(1rem, 2.2vw, 1.2rem);
        line-height: 1.55;
      }

      .signal-map {
        position: relative;
        min-height: clamp(260px, 45vw, 430px);
        overflow: hidden;
        margin-block: 1rem 1.2rem;
        border: 1px solid rgba(145, 216, 255, 0.2);
        border-radius: 1rem;
        background:
          radial-gradient(circle at 50% 45%, rgba(45, 87, 121, 0.2), transparent 48%),
          linear-gradient(180deg, #050812, #090d17 65%, #06080d);
        box-shadow: inset 0 0 90px rgba(0, 0, 0, 0.55), 0 24px 70px rgba(0, 0, 0, 0.3);
      }

      .signal-map::before,
      .signal-map::after {
        position: absolute;
        inset: 0;
        pointer-events: none;
        content: "";
      }

      .signal-map::before {
        opacity: 0.5;
        background-image:
          radial-gradient(circle, rgba(255, 255, 255, 0.72) 0 1px, transparent 1.2px),
          radial-gradient(circle, rgba(145, 216, 255, 0.45) 0 1px, transparent 1.3px);
        background-position: 0 0, 21px 17px;
        background-size: 43px 47px, 67px 71px;
      }

      .signal-map::after {
        background: linear-gradient(transparent 49.6%, rgba(145, 216, 255, 0.05) 50%, transparent 50.4%);
        background-size: 100% 14px;
      }

      .signal-lines,
      .signal-nodes {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
      }

      .signal-lines {
        pointer-events: none;
      }

      .signal-lines line {
        stroke: rgba(145, 216, 255, 0.18);
        stroke-width: 0.35;
        vector-effect: non-scaling-stroke;
      }

      .signal-node {
        --pulse: 2.5s;
        --delay: 0s;
        position: absolute;
        width: 2.35rem;
        height: 2.35rem;
        padding: 0;
        border: 0;
        border-radius: 50%;
        color: #dff5ff;
        background: transparent;
        transform: translate(-50%, -50%);
        cursor: pointer;
      }

      .signal-node::before,
      .signal-node::after {
        position: absolute;
        inset: 50% auto auto 50%;
        border-radius: 50%;
        content: "";
        transform: translate(-50%, -50%);
      }

      .signal-node::before {
        width: 0.55rem;
        height: 0.55rem;
        background: currentColor;
        box-shadow: 0 0 0.45rem currentColor, 0 0 1.25rem rgba(145, 216, 255, 0.7);
      }

      .signal-node::after {
        width: 1.45rem;
        height: 1.45rem;
        border: 1px solid currentColor;
        opacity: 0.45;
        animation: signal-pulse var(--pulse) ease-out var(--delay) infinite;
      }

      .signal-node:hover,
      .signal-node:focus-visible,
      .signal-node[aria-pressed="true"] {
        color: #f2c981;
      }

      .signal-node:focus-visible {
        outline: 2px solid #f2c981;
        outline-offset: 3px;
      }

      .signal-node[aria-pressed="true"]::before {
        width: 0.78rem;
        height: 0.78rem;
      }

      @keyframes signal-pulse {
        from { opacity: 0.6; transform: translate(-50%, -50%) scale(0.5); }
        to { opacity: 0; transform: translate(-50%, -50%) scale(1.65); }
      }

      .signal-reading {
        display: grid;
        grid-template-columns: minmax(0, 1.2fr) minmax(15rem, 0.8fr);
        gap: 1rem;
        padding: 1.1rem;
        border: 1px solid rgba(145, 216, 255, 0.16);
        border-radius: 1rem;
        background: rgba(255, 255, 255, 0.025);
      }

      .signal-reading-copy {
        min-width: 0;
      }

      .signal-reading h3 {
        margin: 0.2rem 0 0.55rem;
        font-family: Georgia, "Times New Roman", serif;
        font-size: clamp(1.45rem, 3.2vw, 2.35rem);
        font-weight: 400;
      }

      .signal-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem 0.9rem;
        margin: 0 0 1rem;
        color: #aeb9c4;
        font-size: 0.78rem;
      }

      .signal-transmission {
        margin: 0;
        color: #edf7fb;
        font-family: Georgia, "Times New Roman", serif;
        font-size: clamp(1.02rem, 2.2vw, 1.25rem);
        line-height: 1.58;
      }

      .signal-side-notes {
        display: grid;
        align-content: start;
        gap: 0.75rem;
      }

      .signal-note {
        display: grid;
        gap: 0.25rem;
        padding: 0.8rem 0.9rem;
        border-left: 2px solid rgba(145, 216, 255, 0.45);
        background: rgba(145, 216, 255, 0.045);
      }

      .signal-note span {
        color: #91d8ff;
        font-size: 0.64rem;
        font-weight: 800;
        letter-spacing: 0.14em;
      }

      .signal-note p {
        margin: 0;
        color: #c4ced6;
        font-size: 0.86rem;
        line-height: 1.45;
      }

      .signal-echo {
        margin-top: 1rem;
        padding: 0.9rem 1rem;
        border: 1px solid rgba(242, 201, 129, 0.22);
        border-radius: 0.8rem;
        color: #ead9ba;
        background: rgba(242, 201, 129, 0.05);
        font-family: Georgia, "Times New Roman", serif;
      }

      .signal-controls {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.7rem;
        margin-top: 1rem;
      }

      .signal-room-note {
        margin: 0;
        color: var(--muted);
        font-size: 0.8rem;
      }

      .signal-step-buttons {
        display: flex;
        gap: 0.5rem;
      }

      @media (max-width: 720px) {
        .signal-reading {
          grid-template-columns: 1fr;
        }

        .signal-controls {
          align-items: stretch;
          flex-direction: column;
        }

        .signal-step-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
        }

        .signal-step-buttons button {
          justify-content: center;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .signal-node::after {
          animation: none;
          opacity: 0.25;
        }

        .signal-dialog *,
        .signal-button {
          scroll-behavior: auto !important;
          transition-duration: 0.001ms !important;
        }
      }
    `;
    document.head.append(style);
  }

  function createSignalButton() {
    const button = document.createElement('button');
    button.type = 'button';
    button.id = 'signal-button';
    button.className = 'quiet-button signal-button';
    button.setAttribute('aria-haspopup', 'dialog');
    button.setAttribute('aria-controls', 'signal-dialog');
    button.title = 'Open The Listening Room';
    button.innerHTML = `
      <span aria-hidden="true">⌁</span>
      <span class="button-copy">Signals</span>
      <span class="count-badge" aria-label="10 signals">10</span>
    `;
    headerActions.insertBefore(button, catalogueButton);
    return button;
  }

  function createSignalDialog() {
    const dialog = document.createElement('dialog');
    dialog.id = 'signal-dialog';
    dialog.className = 'museum-dialog signal-dialog';
    dialog.setAttribute('aria-labelledby', 'signal-vault-title');
    dialog.innerHTML = `
      <form method="dialog" class="dialog-frame signal-frame">
        <button class="dialog-close" value="close" aria-label="Close The Listening Room">×</button>
        <p class="eyebrow signal-kicker">TEN RECEIVED TRANSMISSIONS</p>
        <h2 id="signal-vault-title">The Listening Room</h2>
        <p class="signal-intro">
          Ten anonymous signals reached the museum at the same impossible moment. Choose a light.
          The receiver will translate as carefully as uncertainty allows.
        </p>
        <div class="signal-map" aria-label="Constellation of ten received signals">
          <svg class="signal-lines" id="signal-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"></svg>
          <div class="signal-nodes" id="signal-nodes" role="group" aria-label="Ten signal selectors"></div>
        </div>
        <section class="signal-reading" aria-live="polite" aria-labelledby="signal-reading-title">
          <div class="signal-reading-copy">
            <p class="eyebrow signal-kicker" id="signal-designation">SIGNAL 01</p>
            <h3 id="signal-reading-title"></h3>
            <p class="signal-meta">
              <span id="signal-origin"></span>
              <span aria-hidden="true">·</span>
              <span id="signal-distance"></span>
            </p>
            <blockquote class="signal-transmission" id="signal-transmission"></blockquote>
            <p class="signal-echo" id="signal-echo"></p>
          </div>
          <div class="signal-side-notes">
            <div class="signal-note">
              <span>MUSEUM INTERPRETATION</span>
              <p id="signal-interpretation"></p>
            </div>
            <div class="signal-note">
              <span>RECEIVED AS</span>
              <p id="signal-tone"></p>
            </div>
          </div>
        </section>
        <div class="signal-controls">
          <p class="signal-room-note" id="signal-room-note"></p>
          <div class="signal-step-buttons">
            <button class="text-button" id="signal-previous" type="button">← Previous signal</button>
            <button class="primary-button" id="signal-next" type="button">Next signal →</button>
          </div>
        </div>
        <menu>
          <button class="text-button" value="close">Return to the galleries</button>
        </menu>
      </form>
    `;
    document.body.append(dialog);
    return dialog;
  }

  function renderConstellation() {
    const linePairs = signals.map((signal, index) => [signal, signals[(index + 1) % signals.length]]);
    linePairs.push([signals[1], signals[7]], [signals[3], signals[8]], [signals[0], signals[6]]);
    lineLayer.innerHTML = linePairs
      .map(([from, to]) => `<line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}"></line>`)
      .join('');

    nodeHost.replaceChildren();
    signals.forEach((signal, index) => {
      const node = document.createElement('button');
      node.type = 'button';
      node.className = 'signal-node';
      node.style.left = `${signal.x}%`;
      node.style.top = `${signal.y}%`;
      node.style.setProperty('--pulse', `${signal.pulse}s`);
      node.style.setProperty('--delay', `${signal.delay}s`);
      node.setAttribute('aria-label', `${signal.designation}: ${signal.title}`);
      node.setAttribute('aria-pressed', 'false');
      node.dataset.index = String(index);
      node.addEventListener('click', () => selectSignal(index));
      nodeHost.append(node);
    });
  }

  function readMuseumState() {
    try {
      return core.normalizeState(JSON.parse(localStorage.getItem(STORAGE_KEY)));
    } catch {
      return core.normalizeState(null);
    }
  }

  function selectSignal(index, focusNode = true) {
    activeIndex = index;
    const signal = signals[index];
    const state = readMuseumState();

    designation.textContent = signal.designation;
    title.textContent = signal.title;
    origin.textContent = `Origin: ${signal.origin}`;
    distance.textContent = signal.distance;
    transmission.textContent = `“${signal.transmission}”`;
    interpretation.textContent = signal.interpretation;
    tone.textContent = signal.tone;
    echo.textContent = core.echoForSignal(signal, state);
    roomNote.textContent = core.roomNote(state);

    [...nodeHost.children].forEach((node, nodeIndex) => {
      node.setAttribute('aria-pressed', String(nodeIndex === index));
    });

    const selectedNode = nodeHost.children[index];
    if (focusNode && selectedNode && signalDialog.hasAttribute('open')) selectedNode.focus();
  }

  function refreshLocalEcho() {
    const state = readMuseumState();
    echo.textContent = core.echoForSignal(signals[activeIndex], state);
    roomNote.textContent = core.roomNote(state);
  }

  function openDialog(dialog) {
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');

    if (!prefersReducedMotion) {
      const selectedNode = nodeHost.children[activeIndex];
      window.setTimeout(() => selectedNode?.focus(), 40);
    }
  }
})();
