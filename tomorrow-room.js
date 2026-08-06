(() => {
  'use strict';

  const MUSEUM_STORAGE_KEY = 'museum-of-almost:v1';
  const SEAL_STORAGE_KEY = 'museum-of-almost:tomorrow:v1';
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const core = globalThis.MuseumTomorrowCore;
  const headerActions = document.querySelector('.header-actions');
  const catalogueButton = document.querySelector('#catalogue-button');
  const fragmentCount = document.querySelector('#fragment-count');
  const liveRegion = document.querySelector('#live-region');

  if (!core || !headerActions || !catalogueButton) return;

  let activeIndex = 0;
  let observatory = null;
  let sealedIndex = null;

  injectStyles();
  const tomorrowButton = createTomorrowButton();
  const tomorrowDialog = createTomorrowDialog();
  const targetDate = tomorrowDialog.querySelector('#tomorrow-target-date');
  const orbitLines = tomorrowDialog.querySelector('#tomorrow-orbit-lines');
  const orbitNodes = tomorrowDialog.querySelector('#tomorrow-orbit-nodes');
  const orbitCore = tomorrowDialog.querySelector('#tomorrow-orbit-core');
  const designation = tomorrowDialog.querySelector('#tomorrow-designation');
  const title = tomorrowDialog.querySelector('#tomorrow-reading-title');
  const likelihood = tomorrowDialog.querySelector('#tomorrow-likelihood');
  const forecast = tomorrowDialog.querySelector('#tomorrow-forecast');
  const opening = tomorrowDialog.querySelector('#tomorrow-opening');
  const turn = tomorrowDialog.querySelector('#tomorrow-turn');
  const gift = tomorrowDialog.querySelector('#tomorrow-gift');
  const caution = tomorrowDialog.querySelector('#tomorrow-caution');
  const fragmentEcho = tomorrowDialog.querySelector('#tomorrow-fragment-echo');
  const roomNote = tomorrowDialog.querySelector('#tomorrow-room-note');
  const sealStatus = tomorrowDialog.querySelector('#tomorrow-seal-status');
  const previousButton = tomorrowDialog.querySelector('#tomorrow-previous');
  const nextButton = tomorrowDialog.querySelector('#tomorrow-next');
  const sealButton = tomorrowDialog.querySelector('#tomorrow-seal');
  const postcardButton = tomorrowDialog.querySelector('#tomorrow-postcard');

  tomorrowButton.addEventListener('click', openObservatory);
  previousButton.addEventListener('click', () => selectTomorrow(activeIndex - 1, true));
  nextButton.addEventListener('click', () => selectTomorrow(activeIndex + 1, true));
  sealButton.addEventListener('click', sealTomorrow);
  postcardButton.addEventListener('click', saveTomorrowPostcard);
  window.addEventListener('storage', refreshFromLocalState);

  if (fragmentCount && typeof MutationObserver === 'function') {
    const observer = new MutationObserver(() => {
      if (tomorrowDialog.hasAttribute('open')) refreshObservatory(false);
    });
    observer.observe(fragmentCount, { childList: true, characterData: true, subtree: true });
  }

  function injectStyles() {
    const style = document.createElement('style');
    style.dataset.museumTomorrowRoom = '';
    style.textContent = `
      .tomorrow-button > span:first-child {
        color: #f4d58d;
      }

      .tomorrow-dialog {
        width: min(960px, calc(100% - 1.2rem));
        max-width: none;
      }

      .tomorrow-dialog::backdrop {
        background: rgba(5, 6, 12, 0.91);
        backdrop-filter: blur(13px);
      }

      .tomorrow-frame {
        width: 100%;
        max-height: min(92vh, 920px);
        overflow: auto;
        background:
          radial-gradient(circle at 18% 4%, rgba(244, 213, 141, 0.16), transparent 28rem),
          radial-gradient(circle at 88% 38%, rgba(109, 105, 163, 0.18), transparent 31rem),
          #0d0f18;
      }

      .tomorrow-kicker {
        color: #f4d58d;
      }

      .tomorrow-intro {
        max-width: 53rem;
        margin-bottom: 1rem;
        color: var(--muted);
        font-family: Georgia, "Times New Roman", serif;
        font-size: clamp(1rem, 2.2vw, 1.22rem);
        line-height: 1.58;
      }

      .tomorrow-date {
        color: #d9c9a7;
        font-size: 0.78rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .tomorrow-orbit {
        position: relative;
        min-height: clamp(330px, 53vw, 510px);
        overflow: hidden;
        margin-block: 1rem 1.2rem;
        border: 1px solid rgba(244, 213, 141, 0.2);
        border-radius: 1rem;
        background:
          radial-gradient(circle at 50% 50%, rgba(244, 213, 141, 0.13), transparent 10%),
          radial-gradient(circle at 50% 50%, transparent 0 25%, rgba(194, 181, 255, 0.07) 25.3% 25.7%, transparent 26%),
          radial-gradient(circle at 50% 50%, transparent 0 38%, rgba(244, 213, 141, 0.07) 38.3% 38.7%, transparent 39%),
          radial-gradient(circle at 50% 50%, transparent 0 48%, rgba(164, 202, 210, 0.055) 48.3% 48.7%, transparent 49%),
          linear-gradient(180deg, #070812, #10111d 62%, #080911);
        box-shadow: inset 0 0 100px rgba(0, 0, 0, 0.58), 0 25px 72px rgba(0, 0, 0, 0.3);
      }

      .tomorrow-orbit::before {
        position: absolute;
        inset: 0;
        opacity: 0.52;
        pointer-events: none;
        content: "";
        background-image:
          radial-gradient(circle, rgba(255, 255, 255, 0.62) 0 1px, transparent 1.3px),
          radial-gradient(circle, rgba(205, 183, 255, 0.42) 0 1px, transparent 1.2px);
        background-position: 4px 8px, 29px 17px;
        background-size: 57px 61px, 83px 79px;
      }

      .tomorrow-orbit-lines,
      .tomorrow-orbit-nodes {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
      }

      .tomorrow-orbit-lines {
        pointer-events: none;
      }

      .tomorrow-orbit-lines line {
        stroke: rgba(244, 213, 141, 0.18);
        stroke-width: 0.32;
        vector-effect: non-scaling-stroke;
      }

      .tomorrow-orbit-core {
        position: absolute;
        left: 50%;
        top: 50%;
        display: grid;
        width: clamp(6.8rem, 18vw, 9.5rem);
        aspect-ratio: 1;
        place-items: center;
        padding: 1rem;
        color: #f4d58d;
        text-align: center;
        border: 1px solid rgba(244, 213, 141, 0.42);
        border-radius: 50%;
        background:
          radial-gradient(circle, rgba(244, 213, 141, 0.2), rgba(244, 213, 141, 0.04) 55%, transparent 72%);
        box-shadow: 0 0 3rem rgba(244, 213, 141, 0.13);
        font-family: Georgia, "Times New Roman", serif;
        font-size: clamp(0.72rem, 1.8vw, 0.92rem);
        line-height: 1.25;
        transform: translate(-50%, -50%);
      }

      .tomorrow-node {
        --pulse: 4s;
        --delay: 0s;
        position: absolute;
        width: clamp(2.65rem, 7vw, 3.5rem);
        height: clamp(2.65rem, 7vw, 3.5rem);
        padding: 0;
        color: #f6e8c9;
        border: 0;
        border-radius: 50%;
        background: transparent;
        transform: translate(-50%, -50%);
        cursor: pointer;
      }

      .tomorrow-node::before,
      .tomorrow-node::after {
        position: absolute;
        left: 50%;
        top: 50%;
        border-radius: 50%;
        content: "";
        transform: translate(-50%, -50%);
      }

      .tomorrow-node::before {
        width: 0.7rem;
        height: 0.7rem;
        background: currentColor;
        box-shadow: 0 0 0.55rem currentColor, 0 0 1.4rem rgba(244, 213, 141, 0.55);
      }

      .tomorrow-node::after {
        width: 1.8rem;
        height: 1.8rem;
        border: 1px solid currentColor;
        opacity: 0.36;
        animation: tomorrow-pulse var(--pulse) ease-out var(--delay) infinite;
      }

      .tomorrow-node:hover,
      .tomorrow-node:focus-visible,
      .tomorrow-node[aria-pressed="true"] {
        color: #cdb7ff;
      }

      .tomorrow-node:focus-visible {
        outline: 2px solid #f4d58d;
        outline-offset: 4px;
      }

      .tomorrow-node[aria-pressed="true"]::before {
        width: 0.95rem;
        height: 0.95rem;
      }

      .tomorrow-node[data-sealed="true"] {
        color: #9ed7cf;
      }

      .tomorrow-node[data-sealed="true"]::after {
        border-width: 2px;
        opacity: 0.7;
      }

      @keyframes tomorrow-pulse {
        from { opacity: 0.55; transform: translate(-50%, -50%) scale(0.55); }
        to { opacity: 0; transform: translate(-50%, -50%) scale(1.75); }
      }

      .tomorrow-reading {
        display: grid;
        grid-template-columns: minmax(0, 1.25fr) minmax(15rem, 0.75fr);
        gap: 1rem;
        padding: 1.15rem;
        border: 1px solid rgba(244, 213, 141, 0.16);
        border-radius: 1rem;
        background: rgba(255, 255, 255, 0.025);
      }

      .tomorrow-reading h3 {
        margin: 0.2rem 0 0.5rem;
        font-family: Georgia, "Times New Roman", serif;
        font-size: clamp(1.5rem, 3.4vw, 2.45rem);
        font-weight: 400;
        line-height: 1.05;
      }

      .tomorrow-likelihood {
        margin: 0 0 1rem;
        color: #c8baa0;
        font-size: 0.76rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .tomorrow-forecast {
        margin: 0 0 1rem;
        color: #ede4d5;
        font-family: Georgia, "Times New Roman", serif;
        font-size: clamp(1rem, 2.2vw, 1.22rem);
        font-style: italic;
        line-height: 1.55;
      }

      .tomorrow-story {
        display: grid;
        gap: 0.6rem;
      }

      .tomorrow-story p {
        margin: 0;
        color: #c9c2b8;
        line-height: 1.6;
      }

      .tomorrow-side-notes {
        display: grid;
        align-content: start;
        gap: 0.72rem;
      }

      .tomorrow-note {
        display: grid;
        gap: 0.28rem;
        padding: 0.82rem 0.9rem;
        border-left: 2px solid rgba(244, 213, 141, 0.45);
        background: rgba(244, 213, 141, 0.045);
      }

      .tomorrow-note span {
        color: #f4d58d;
        font-size: 0.63rem;
        font-weight: 800;
        letter-spacing: 0.14em;
      }

      .tomorrow-note p {
        margin: 0;
        color: #c9c2b8;
        font-size: 0.86rem;
        line-height: 1.48;
      }

      .tomorrow-fragment-echo {
        margin-top: 0.9rem;
        padding: 0.9rem 1rem;
        border: 1px solid rgba(205, 183, 255, 0.23);
        border-radius: 0.8rem;
        color: #dfd2f0;
        background: rgba(205, 183, 255, 0.05);
        font-family: Georgia, "Times New Roman", serif;
      }

      .tomorrow-controls {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: center;
        gap: 0.8rem;
        margin-top: 1rem;
      }

      .tomorrow-room-note,
      .tomorrow-seal-status {
        margin: 0;
        color: var(--muted);
        font-size: 0.78rem;
        line-height: 1.45;
      }

      .tomorrow-seal-status {
        margin-top: 0.28rem;
        color: #9ed7cf;
      }

      .tomorrow-step-buttons,
      .tomorrow-actions {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: 0.52rem;
      }

      @media (max-width: 760px) {
        .tomorrow-reading {
          grid-template-columns: 1fr;
        }

        .tomorrow-controls {
          grid-template-columns: 1fr;
        }

        .tomorrow-step-buttons,
        .tomorrow-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
        }

        .tomorrow-actions button:last-child {
          grid-column: 1 / -1;
        }
      }

      @media (max-width: 500px) {
        .tomorrow-orbit {
          min-height: 360px;
        }

        .tomorrow-step-buttons,
        .tomorrow-actions {
          grid-template-columns: 1fr;
        }

        .tomorrow-actions button:last-child {
          grid-column: auto;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .tomorrow-node::after {
          animation: none;
          opacity: 0.3;
        }

        .tomorrow-dialog *,
        .tomorrow-button {
          scroll-behavior: auto !important;
          transition-duration: 0.001ms !important;
        }
      }
    `;
    document.head.append(style);
  }

  function createTomorrowButton() {
    const button = document.createElement('button');
    button.type = 'button';
    button.id = 'tomorrow-button';
    button.className = 'quiet-button tomorrow-button';
    button.setAttribute('aria-haspopup', 'dialog');
    button.setAttribute('aria-controls', 'tomorrow-dialog');
    button.title = 'Open the Observatory of Almost Tomorrow';
    button.innerHTML = `
      <span aria-hidden="true">◒</span>
      <span class="button-copy">Tomorrow</span>
    `;
    headerActions.insertBefore(button, catalogueButton);
    return button;
  }

  function createTomorrowDialog() {
    const dialog = document.createElement('dialog');
    dialog.id = 'tomorrow-dialog';
    dialog.className = 'museum-dialog tomorrow-dialog';
    dialog.setAttribute('aria-labelledby', 'tomorrow-room-title');
    dialog.innerHTML = `
      <form method="dialog" class="dialog-frame tomorrow-frame">
        <button class="dialog-close" value="close" aria-label="Close the Observatory of Almost Tomorrow">×</button>
        <p class="eyebrow tomorrow-kicker">SEVEN POSSIBLE MORNINGS · ONE LOCAL SKY</p>
        <h2 id="tomorrow-room-title">The Observatory of Almost Tomorrow</h2>
        <p class="tomorrow-intro">
          The telescope refuses to predict. It offers seven equally careful alternatives instead.
          Choose a light, inspect what might happen, and seal one possibility until the date changes.
        </p>
        <p class="tomorrow-date" id="tomorrow-target-date"></p>
        <div class="tomorrow-orbit" aria-label="Orrery of seven possible tomorrows">
          <svg class="tomorrow-orbit-lines" id="tomorrow-orbit-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"></svg>
          <div class="tomorrow-orbit-core" id="tomorrow-orbit-core" aria-hidden="true">ALMOST<br>TOMORROW</div>
          <div class="tomorrow-orbit-nodes" id="tomorrow-orbit-nodes" role="group" aria-label="Seven possible tomorrow selectors"></div>
        </div>
        <section class="tomorrow-reading" aria-live="polite" aria-labelledby="tomorrow-reading-title">
          <div>
            <p class="eyebrow tomorrow-kicker" id="tomorrow-designation">TOMORROW 01</p>
            <h3 id="tomorrow-reading-title"></h3>
            <p class="tomorrow-likelihood" id="tomorrow-likelihood"></p>
            <blockquote class="tomorrow-forecast" id="tomorrow-forecast"></blockquote>
            <div class="tomorrow-story">
              <p id="tomorrow-opening"></p>
              <p id="tomorrow-turn"></p>
            </div>
            <p class="tomorrow-fragment-echo" id="tomorrow-fragment-echo"></p>
          </div>
          <div class="tomorrow-side-notes">
            <div class="tomorrow-note">
              <span>THE DAY MAY LEAVE YOU</span>
              <p id="tomorrow-gift"></p>
            </div>
            <div class="tomorrow-note">
              <span>CURATORIAL CAUTION</span>
              <p id="tomorrow-caution"></p>
            </div>
          </div>
        </section>
        <div class="tomorrow-controls">
          <div>
            <p class="tomorrow-room-note" id="tomorrow-room-note"></p>
            <p class="tomorrow-seal-status" id="tomorrow-seal-status"></p>
          </div>
          <div class="tomorrow-step-buttons">
            <button class="text-button" id="tomorrow-previous" type="button">← Previous future</button>
            <button class="primary-button" id="tomorrow-next" type="button">Next future →</button>
          </div>
        </div>
        <menu class="tomorrow-actions">
          <button class="text-button" id="tomorrow-postcard" type="button">⇩ Save tomorrow postcard</button>
          <button class="text-button" id="tomorrow-seal" type="button">Seal this tomorrow</button>
          <button class="primary-button" value="close">Return to today</button>
        </menu>
      </form>
    `;
    document.body.append(dialog);
    return dialog;
  }

  function readMuseumState() {
    try {
      return JSON.parse(localStorage.getItem(MUSEUM_STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  }

  function readSeal(targetKey) {
    try {
      const stored = JSON.parse(localStorage.getItem(SEAL_STORAGE_KEY));
      if (!stored || stored.targetKey !== targetKey || !Number.isInteger(stored.index) || stored.index < 0 || stored.index > 6) {
        if (stored) localStorage.removeItem(SEAL_STORAGE_KEY);
        return null;
      }
      return stored.index;
    } catch {
      return null;
    }
  }

  function openObservatory() {
    refreshObservatory(true);
    if (typeof tomorrowDialog.showModal === 'function') tomorrowDialog.showModal();
    else tomorrowDialog.setAttribute('open', '');
  }

  function refreshFromLocalState() {
    if (tomorrowDialog.hasAttribute('open')) refreshObservatory(false);
  }

  function refreshObservatory(useSeal) {
    observatory = core.buildTomorrows(new Date(), readMuseumState());
    sealedIndex = readSeal(observatory.targetKey);
    targetDate.textContent = `Possibilities observed for ${formatDate(observatory.targetDate)}`;
    orbitCore.innerHTML = sealedIndex === null ? 'ALMOST<br>TOMORROW' : 'ONE FUTURE<br>SEALED';
    roomNote.textContent = core.observatoryNote(observatory.state);
    renderOrrery();
    const preferredIndex = useSeal && sealedIndex !== null ? sealedIndex : activeIndex;
    selectTomorrow(preferredIndex, false);
  }

  function renderOrrery() {
    orbitNodes.replaceChildren();
    const lines = [];
    observatory.tomorrows.forEach((tomorrow, index) => {
      const radians = tomorrow.angle * Math.PI / 180;
      const x = 50 + Math.cos(radians) * tomorrow.radius;
      const y = 50 + Math.sin(radians) * tomorrow.radius;
      lines.push(`<line x1="50" y1="50" x2="${x.toFixed(2)}" y2="${y.toFixed(2)}"></line>`);

      const node = document.createElement('button');
      node.type = 'button';
      node.className = 'tomorrow-node';
      node.style.left = `${x}%`;
      node.style.top = `${y}%`;
      node.style.setProperty('--pulse', `${tomorrow.pulse}s`);
      node.style.setProperty('--delay', `${tomorrow.delay}s`);
      node.setAttribute('aria-label', `${tomorrow.designation}: ${tomorrow.title}`);
      node.setAttribute('aria-pressed', 'false');
      node.dataset.index = String(index);
      node.dataset.sealed = String(index === sealedIndex);
      node.addEventListener('click', () => selectTomorrow(index, false));
      orbitNodes.append(node);
    });
    orbitLines.innerHTML = lines.join('');
  }

  function selectTomorrow(index, focusNode) {
    if (!observatory) return;
    const count = observatory.tomorrows.length;
    activeIndex = ((index % count) + count) % count;
    const selected = observatory.tomorrows[activeIndex];

    orbitNodes.querySelectorAll('.tomorrow-node').forEach((node) => {
      node.setAttribute('aria-pressed', String(Number(node.dataset.index) === activeIndex));
      node.dataset.sealed = String(Number(node.dataset.index) === sealedIndex);
    });

    designation.textContent = selected.designation;
    title.textContent = selected.title;
    likelihood.textContent = `Likelihood: ${selected.likelihood}`;
    forecast.textContent = selected.forecast;
    opening.textContent = selected.opening;
    turn.textContent = selected.turn;
    gift.textContent = selected.gift;
    caution.textContent = selected.caution;
    fragmentEcho.textContent = selected.fragmentEcho;

    if (sealedIndex === null) {
      sealStatus.textContent = 'No tomorrow has been sealed for this date.';
      sealButton.textContent = 'Seal this tomorrow';
    } else if (sealedIndex === activeIndex) {
      sealStatus.textContent = `${selected.designation} is sealed locally until the date changes.`;
      sealButton.textContent = 'This tomorrow is sealed';
    } else {
      sealStatus.textContent = `${observatory.tomorrows[sealedIndex].designation} is currently sealed.`;
      sealButton.textContent = 'Replace today’s seal';
    }

    if (focusNode) orbitNodes.querySelector(`[data-index="${activeIndex}"]`)?.focus();
  }

  function sealTomorrow() {
    if (!observatory) return;
    try {
      localStorage.setItem(SEAL_STORAGE_KEY, JSON.stringify({
        targetKey: observatory.targetKey,
        index: activeIndex
      }));
      sealedIndex = activeIndex;
      orbitCore.innerHTML = 'ONE FUTURE<br>SEALED';
      selectTomorrow(activeIndex, false);
      announce(`${observatory.tomorrows[activeIndex].designation} sealed locally until the date changes.`);
    } catch {
      sealStatus.textContent = 'The observatory could not store the seal in this browser.';
      announce('The tomorrow seal could not be stored.');
    }
  }

  function announce(message) {
    if (liveRegion) liveRegion.textContent = message;
  }

  function formatDate(date) {
    try {
      return new Intl.DateTimeFormat(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    } catch {
      return observatory?.targetKey || 'tomorrow';
    }
  }

  function saveTomorrowPostcard() {
    if (!observatory) return;
    const selected = observatory.tomorrows[activeIndex];
    const postcard = document.createElement('canvas');
    postcard.width = 1440;
    postcard.height = 1000;
    const context = postcard.getContext('2d');
    const [light, cool, warm] = selected.palette;

    const background = context.createLinearGradient(0, 0, postcard.width, postcard.height);
    background.addColorStop(0, '#070812');
    background.addColorStop(0.55, cool);
    background.addColorStop(1, '#0b0912');
    context.fillStyle = background;
    context.fillRect(0, 0, postcard.width, postcard.height);

    drawPostcardStars(context, selected.seed, postcard.width, 620);
    drawPostcardOrrery(context, selected, postcard.width, 620, light, warm);

    const footer = context.createLinearGradient(0, 620, postcard.width, postcard.height);
    footer.addColorStop(0, '#12131d');
    footer.addColorStop(1, '#080912');
    context.fillStyle = footer;
    context.fillRect(0, 620, postcard.width, 380);

    context.fillStyle = light;
    context.font = '700 22px ui-sans-serif, system-ui, sans-serif';
    context.fillText('THE MUSEUM OF ALMOST · OBSERVATORY OF ALMOST TOMORROW', 58, 678);
    context.fillStyle = '#f3eadb';
    context.font = '50px Georgia, serif';
    wrapText(context, selected.title, 58, 752, postcard.width - 116, 56, 2);
    context.fillStyle = '#c8baa0';
    context.font = '24px Georgia, serif';
    wrapText(context, selected.forecast, 58, 880, postcard.width - 116, 34, 2);
    context.fillStyle = '#9ed7cf';
    context.font = '700 18px ui-sans-serif, system-ui, sans-serif';
    context.fillText(
      `${selected.designation} · ${selected.likelihood.toUpperCase()} · ${formatDate(observatory.targetDate).toUpperCase()}`,
      58,
      964
    );

    postcard.toBlob((blob) => {
      if (!blob) return;
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = `museum-of-almost-tomorrow-${observatory.targetKey}-${String(activeIndex + 1).padStart(2, '0')}.png`;
      link.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  }

  function drawPostcardStars(context, seed, width, height) {
    let value = seed >>> 0;
    for (let index = 0; index < 95; index += 1) {
      value = Math.imul(value ^ value >>> 15, value | 1) >>> 0;
      const x = (value % 10000) / 10000 * width;
      value = Math.imul(value ^ value >>> 13, value | 5) >>> 0;
      const y = (value % 10000) / 10000 * height;
      const radius = 0.6 + (value % 18) / 10;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(244, 238, 224, ${0.18 + (value % 55) / 100})`;
      context.fill();
    }
  }

  function drawPostcardOrrery(context, selected, width, height, light, warm) {
    const centerX = width * 0.5;
    const centerY = height * 0.52;
    const maxRadius = Math.min(width, height) * 0.38;

    context.save();
    context.translate(centerX, centerY);
    [0.34, 0.58, 0.82].forEach((scale, index) => {
      context.beginPath();
      context.ellipse(0, 0, maxRadius * scale, maxRadius * scale * 0.45, -0.18 + index * 0.16, 0, Math.PI * 2);
      context.strokeStyle = `rgba(244, 213, 141, ${0.18 - index * 0.035})`;
      context.lineWidth = 2;
      context.stroke();
    });

    const coreGlow = context.createRadialGradient(0, 0, 0, 0, 0, 120);
    coreGlow.addColorStop(0, light);
    coreGlow.addColorStop(0.18, `${warm}cc`);
    coreGlow.addColorStop(1, 'transparent');
    context.fillStyle = coreGlow;
    context.beginPath();
    context.arc(0, 0, 120, 0, Math.PI * 2);
    context.fill();

    observatory.tomorrows.forEach((tomorrow, index) => {
      const radians = tomorrow.angle * Math.PI / 180;
      const radius = maxRadius * tomorrow.radius / 45;
      const x = Math.cos(radians) * radius;
      const y = Math.sin(radians) * radius * 0.66;
      context.beginPath();
      context.moveTo(0, 0);
      context.lineTo(x, y);
      context.strokeStyle = 'rgba(244, 213, 141, 0.16)';
      context.lineWidth = 1.5;
      context.stroke();
      context.beginPath();
      context.arc(x, y, index === selected.index ? 15 : 8, 0, Math.PI * 2);
      context.fillStyle = index === selected.index ? '#cdb7ff' : '#f4d58d';
      context.shadowColor = context.fillStyle;
      context.shadowBlur = index === selected.index ? 30 : 14;
      context.fill();
      context.shadowBlur = 0;
    });
    context.restore();
  }

  function wrapText(context, text, x, y, maxWidth, lineHeight, maxLines) {
    const words = text.split(/\s+/);
    let line = '';
    let lineIndex = 0;
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (context.measureText(candidate).width > maxWidth && line) {
        context.fillText(line, x, y + lineIndex * lineHeight);
        line = word;
        lineIndex += 1;
        if (lineIndex >= maxLines - 1) break;
      } else {
        line = candidate;
      }
    }
    if (lineIndex < maxLines) context.fillText(line, x, y + lineIndex * lineHeight);
  }
})();
