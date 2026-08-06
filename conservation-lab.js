(() => {
  'use strict';

  const MUSEUM_STORAGE_KEY = 'museum-of-almost:v1';
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const core = globalThis.MuseumConservationCore;
  const headerActions = document.querySelector('.header-actions');
  const catalogueButton = document.querySelector('#catalogue-button');
  const liveRegion = document.querySelector('#live-region');

  if (!core || !headerActions || !catalogueButton) return;

  let variation = 0;
  let caseFile = null;
  let pieces = [];
  let selectedIndex = 0;
  let dragging = false;
  let dragOffset = { x: 0, y: 0 };

  injectStyles();
  const labButton = createLabButton();
  const labDialog = createLabDialog();
  const canvas = labDialog.querySelector('#conservation-canvas');
  const context = canvas.getContext('2d');
  const caseId = labDialog.querySelector('#conservation-case-id');
  const title = labDialog.querySelector('#conservation-title');
  const medium = labDialog.querySelector('#conservation-medium');
  const diagnosis = labDialog.querySelector('#conservation-diagnosis');
  const promise = labDialog.querySelector('#conservation-promise');
  const fragmentEcho = labDialog.querySelector('#conservation-fragment-echo');
  const pieceSelectors = labDialog.querySelector('#conservation-piece-selectors');
  const progressText = labDialog.querySelector('#conservation-progress');
  const report = labDialog.querySelector('#conservation-report');
  const reportText = labDialog.querySelector('#conservation-report-text');
  const guideButton = labDialog.querySelector('#conservation-guide');
  const nextCaseButton = labDialog.querySelector('#conservation-next-case');
  const postcardButton = labDialog.querySelector('#conservation-postcard');

  labButton.addEventListener('click', openLab);
  guideButton.addEventListener('click', guideSelectedPiece);
  nextCaseButton.addEventListener('click', beginAnotherCase);
  postcardButton.addEventListener('click', saveConservationPostcard);
  labDialog.querySelector('#conservation-left').addEventListener('click', () => nudgeSelected(-0.025, 0));
  labDialog.querySelector('#conservation-right').addEventListener('click', () => nudgeSelected(0.025, 0));
  labDialog.querySelector('#conservation-up').addEventListener('click', () => nudgeSelected(0, -0.025));
  labDialog.querySelector('#conservation-down').addEventListener('click', () => nudgeSelected(0, 0.025));
  labDialog.querySelector('#conservation-rotate-left').addEventListener('click', () => rotateSelected(-15));
  labDialog.querySelector('#conservation-rotate-right').addEventListener('click', () => rotateSelected(15));

  canvas.addEventListener('pointerdown', beginDrag);
  canvas.addEventListener('pointermove', continueDrag);
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);
  canvas.addEventListener('keydown', handleCanvasKeydown);
  window.addEventListener('resize', resizeCanvas);

  if (typeof ResizeObserver === 'function') {
    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(canvas.parentElement);
  }

  function injectStyles() {
    const style = document.createElement('style');
    style.dataset.museumConservationLab = '';
    style.textContent = `
      .conservation-button > span:first-child { color: #9ed7cf; }

      .conservation-dialog {
        width: min(980px, calc(100% - 1.2rem));
        max-width: none;
      }

      .conservation-dialog::backdrop {
        background: rgba(5, 8, 10, 0.92);
        backdrop-filter: blur(13px);
      }

      .conservation-frame {
        width: 100%;
        max-height: min(93vh, 940px);
        overflow: auto;
        background:
          radial-gradient(circle at 10% 2%, rgba(158, 215, 207, 0.17), transparent 30rem),
          radial-gradient(circle at 94% 42%, rgba(205, 183, 255, 0.13), transparent 32rem),
          #0c1113;
      }

      .conservation-kicker { color: #9ed7cf; }

      .conservation-intro {
        max-width: 56rem;
        margin-bottom: 1rem;
        color: var(--muted);
        font-family: Georgia, "Times New Roman", serif;
        font-size: clamp(1rem, 2.2vw, 1.2rem);
        line-height: 1.58;
      }

      .conservation-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 0.45rem 0.9rem;
        margin: 0 0 1rem;
        color: #aabcb9;
        font-size: 0.76rem;
      }

      .conservation-workbench {
        display: grid;
        grid-template-columns: minmax(0, 1.45fr) minmax(16rem, 0.55fr);
        gap: 1rem;
      }

      .conservation-canvas-wrap {
        position: relative;
        min-height: clamp(380px, 58vw, 600px);
        overflow: hidden;
        border: 1px solid rgba(158, 215, 207, 0.2);
        border-radius: 1rem;
        background:
          linear-gradient(rgba(158, 215, 207, 0.035) 1px, transparent 1px),
          linear-gradient(90deg, rgba(158, 215, 207, 0.035) 1px, transparent 1px),
          radial-gradient(circle at 50% 45%, rgba(158, 215, 207, 0.1), transparent 46%),
          #071012;
        background-size: 32px 32px, 32px 32px, auto, auto;
        box-shadow: inset 0 0 100px rgba(0, 0, 0, 0.52);
      }

      .conservation-canvas-wrap::after {
        position: absolute;
        inset: auto 1rem 0.8rem;
        color: rgba(206, 229, 225, 0.45);
        content: "Move with pointer or arrow keys · rotate with Q and E";
        font-size: 0.66rem;
        letter-spacing: 0.08em;
        pointer-events: none;
        text-align: center;
        text-transform: uppercase;
      }

      #conservation-canvas {
        display: block;
        width: 100%;
        height: 100%;
        min-height: inherit;
        cursor: grab;
        touch-action: none;
      }

      #conservation-canvas:active { cursor: grabbing; }
      #conservation-canvas:focus-visible { outline: 2px solid #f0cf8e; outline-offset: -4px; }

      .conservation-panel {
        display: grid;
        align-content: start;
        gap: 0.8rem;
      }

      .conservation-note {
        padding: 0.85rem 0.9rem;
        border-left: 2px solid rgba(158, 215, 207, 0.48);
        background: rgba(158, 215, 207, 0.045);
      }

      .conservation-note span {
        display: block;
        margin-bottom: 0.28rem;
        color: #9ed7cf;
        font-size: 0.62rem;
        font-weight: 800;
        letter-spacing: 0.14em;
      }

      .conservation-note p {
        margin: 0;
        color: #c5cfcd;
        font-size: 0.86rem;
        line-height: 1.5;
      }

      .conservation-fragment-echo {
        padding: 0.85rem 0.9rem;
        border: 1px solid rgba(205, 183, 255, 0.2);
        border-radius: 0.75rem;
        color: #dfd3ec;
        background: rgba(205, 183, 255, 0.045);
        font-family: Georgia, "Times New Roman", serif;
        line-height: 1.5;
      }

      .conservation-piece-selectors {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.45rem;
      }

      .conservation-piece-selectors button {
        justify-content: center;
        min-width: 0;
        padding-inline: 0.55rem;
      }

      .conservation-piece-selectors button[aria-pressed="true"] {
        color: #071012;
        border-color: #9ed7cf;
        background: #9ed7cf;
      }

      .conservation-controls {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.42rem;
      }

      .conservation-controls button {
        justify-content: center;
        min-height: 2.7rem;
        padding: 0.55rem;
      }

      .conservation-controls .wide { grid-column: span 3; }

      .conservation-progress {
        margin: 0;
        color: #aabcb9;
        font-size: 0.78rem;
        line-height: 1.45;
      }

      .conservation-report {
        padding: 0.9rem 1rem;
        border: 1px solid rgba(240, 207, 142, 0.25);
        border-radius: 0.8rem;
        color: #eadbbd;
        background: rgba(240, 207, 142, 0.055);
        font-family: Georgia, "Times New Roman", serif;
      }

      .conservation-report[hidden] { display: none; }
      .conservation-report strong { display: block; margin-bottom: 0.3rem; color: #f0cf8e; font-family: ui-sans-serif, system-ui, sans-serif; font-size: 0.65rem; letter-spacing: 0.13em; }
      .conservation-report p { margin: 0; line-height: 1.55; }

      .conservation-actions {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: 0.55rem;
      }

      @media (max-width: 760px) {
        .conservation-workbench { grid-template-columns: 1fr; }
        .conservation-canvas-wrap { min-height: 430px; }
        .conservation-panel { grid-template-columns: 1fr 1fr; }
        .conservation-panel > * { min-width: 0; }
        .conservation-piece-selectors,
        .conservation-controls,
        .conservation-progress,
        .conservation-report { grid-column: 1 / -1; }
      }

      @media (max-width: 520px) {
        .conservation-panel { grid-template-columns: 1fr; }
        .conservation-actions { display: grid; grid-template-columns: 1fr; }
        .conservation-actions button { justify-content: center; }
      }

      @media (prefers-reduced-motion: reduce) {
        .conservation-dialog *,
        .conservation-button {
          scroll-behavior: auto !important;
          transition-duration: 0.001ms !important;
        }
      }
    `;
    document.head.append(style);
  }

  function createLabButton() {
    const button = document.createElement('button');
    button.type = 'button';
    button.id = 'conservation-button';
    button.className = 'quiet-button conservation-button';
    button.setAttribute('aria-haspopup', 'dialog');
    button.setAttribute('aria-controls', 'conservation-dialog');
    button.title = 'Open the Conservation Lab for Impossible Objects';
    button.innerHTML = `
      <span aria-hidden="true">⌬</span>
      <span class="button-copy">Restore</span>
    `;
    headerActions.insertBefore(button, catalogueButton);
    return button;
  }

  function createLabDialog() {
    const dialog = document.createElement('dialog');
    dialog.id = 'conservation-dialog';
    dialog.className = 'museum-dialog conservation-dialog';
    dialog.setAttribute('aria-labelledby', 'conservation-lab-title');
    dialog.innerHTML = `
      <form method="dialog" class="dialog-frame conservation-frame">
        <button class="dialog-close" value="close" aria-label="Close the Conservation Lab">×</button>
        <p class="eyebrow conservation-kicker">VISIBLE SEAMS · REVERSIBLE CERTAINTY</p>
        <h2 id="conservation-lab-title">The Conservation Lab for Impossible Objects</h2>
        <p class="conservation-intro">
          Three fragments have agreed to share a workbench. Select one, move and rotate it toward
          its pale outline, or let the lab guide it gently into place. The seams are meant to remain.
        </p>
        <p class="conservation-meta">
          <span id="conservation-case-id"></span>
          <span aria-hidden="true">·</span>
          <span id="conservation-medium"></span>
        </p>
        <div class="conservation-workbench">
          <div class="conservation-canvas-wrap">
            <canvas id="conservation-canvas" tabindex="0" aria-label="Conservation workbench with three movable artifact fragments"></canvas>
          </div>
          <aside class="conservation-panel" aria-label="Conservation controls and notes">
            <div class="conservation-note">
              <span>OBJECT</span>
              <p id="conservation-title"></p>
            </div>
            <div class="conservation-note">
              <span>CONDITION REPORT</span>
              <p id="conservation-diagnosis"></p>
            </div>
            <div class="conservation-note">
              <span>TREATMENT PROMISE</span>
              <p id="conservation-promise"></p>
            </div>
            <p class="conservation-fragment-echo" id="conservation-fragment-echo"></p>
            <div class="conservation-piece-selectors" id="conservation-piece-selectors" role="group" aria-label="Artifact fragments"></div>
            <div class="conservation-controls" aria-label="Move and rotate selected fragment">
              <button class="text-button" id="conservation-rotate-left" type="button" aria-label="Rotate selected fragment left">↺</button>
              <button class="text-button" id="conservation-up" type="button" aria-label="Move selected fragment up">↑</button>
              <button class="text-button" id="conservation-rotate-right" type="button" aria-label="Rotate selected fragment right">↻</button>
              <button class="text-button" id="conservation-left" type="button" aria-label="Move selected fragment left">←</button>
              <button class="text-button" id="conservation-down" type="button" aria-label="Move selected fragment down">↓</button>
              <button class="text-button" id="conservation-right" type="button" aria-label="Move selected fragment right">→</button>
              <button class="primary-button wide" id="conservation-guide" type="button">Let the lab guide this fragment</button>
            </div>
            <p class="conservation-progress" id="conservation-progress" aria-live="polite"></p>
            <div class="conservation-report" id="conservation-report" hidden>
              <strong>TREATMENT REPORT</strong>
              <p id="conservation-report-text"></p>
            </div>
          </aside>
        </div>
        <menu class="conservation-actions">
          <button class="text-button" id="conservation-postcard" type="button">⇩ Preserve workbench postcard</button>
          <button class="text-button" id="conservation-next-case" type="button">Open another case</button>
          <button class="primary-button" value="close">Return to the galleries</button>
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

  function openLab() {
    if (!caseFile) buildCase();
    if (typeof labDialog.showModal === 'function') labDialog.showModal();
    else labDialog.setAttribute('open', '');
    resizeCanvas();
    canvas.focus();
  }

  function buildCase() {
    caseFile = core.buildCase(new Date(), readMuseumState(), variation);
    pieces = caseFile.startPieces.map((piece) => core.copyPiece(piece));
    selectedIndex = 0;
    caseId.textContent = caseFile.caseId;
    title.textContent = caseFile.title;
    medium.textContent = caseFile.medium;
    diagnosis.textContent = caseFile.diagnosis;
    promise.textContent = caseFile.promise;
    fragmentEcho.textContent = caseFile.fragmentEcho;
    reportText.textContent = caseFile.report;
    renderPieceSelectors();
    updateAssembly();
    resizeCanvas();
  }

  function beginAnotherCase() {
    variation += 1;
    buildCase();
    announce(`Opened ${caseFile.caseId}.`);
  }

  function renderPieceSelectors() {
    pieceSelectors.replaceChildren();
    pieces.forEach((piece, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'text-button';
      button.dataset.index = String(index);
      button.setAttribute('aria-pressed', String(index === selectedIndex));
      button.textContent = `Fragment ${index + 1}`;
      button.addEventListener('click', () => selectPiece(index, true));
      pieceSelectors.append(button);
    });
  }

  function selectPiece(index, announceSelection = false) {
    selectedIndex = Math.max(0, Math.min(pieces.length - 1, index));
    pieceSelectors.querySelectorAll('button').forEach((button) => {
      button.setAttribute('aria-pressed', String(Number(button.dataset.index) === selectedIndex));
    });
    if (announceSelection) announce(`Fragment ${selectedIndex + 1} selected.`);
    drawWorkbench();
  }

  function nudgeSelected(dx, dy) {
    pieces[selectedIndex] = core.movePiece(pieces[selectedIndex], dx, dy);
    updateAssembly();
  }

  function rotateSelected(delta) {
    pieces[selectedIndex] = core.rotatePiece(pieces[selectedIndex], delta);
    updateAssembly();
  }

  function guideSelectedPiece() {
    const target = caseFile.targetPieces[selectedIndex];
    pieces[selectedIndex] = core.snapPiece(pieces[selectedIndex], target);
    updateAssembly();
    announce(`Fragment ${selectedIndex + 1} guided into place.`);
  }

  function updateAssembly() {
    if (!caseFile) return;
    const assessment = core.evaluateAssembly(pieces, caseFile.targetPieces);
    const remaining = assessment.total - assessment.aligned;
    progressText.textContent = assessment.complete
      ? 'All three fragments are aligned. The object remains beautifully, visibly repaired.'
      : `${assessment.aligned} of ${assessment.total} fragments aligned. ${remaining} still ${remaining === 1 ? 'needs' : 'need'} a patient adjustment.`;
    report.hidden = !assessment.complete;
    guideButton.textContent = core.isPieceAligned(pieces[selectedIndex], caseFile.targetPieces[selectedIndex])
      ? 'This fragment is aligned'
      : 'Let the lab guide this fragment';
    guideButton.disabled = core.isPieceAligned(pieces[selectedIndex], caseFile.targetPieces[selectedIndex]);
    drawWorkbench();
    if (assessment.complete) announce('Conservation treatment complete. The seams remain visible.');
  }

  function resizeCanvas() {
    if (!caseFile || !canvas.parentElement) return;
    const rect = canvas.parentElement.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(320, Math.round(rect.width));
    const height = Math.max(380, Math.round(rect.height));
    if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) {
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    }
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    drawWorkbench(width, height);
  }

  function drawWorkbench(forcedWidth, forcedHeight) {
    if (!caseFile || !context) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = forcedWidth || canvas.width / ratio;
    const height = forcedHeight || canvas.height / ratio;
    context.clearRect(0, 0, width, height);
    drawBenchLight(width, height);
    caseFile.targetPieces.forEach((piece, index) => drawPiece(piece, width, height, {
      fill: 'rgba(210, 235, 231, 0.035)',
      stroke: 'rgba(210, 235, 231, 0.34)',
      lineWidth: 1.5,
      dashed: true,
      label: index + 1
    }));
    pieces.forEach((piece, index) => {
      const aligned = core.isPieceAligned(piece, caseFile.targetPieces[index]);
      drawPiece(piece, width, height, {
        fill: caseFile.palette[index],
        stroke: index === selectedIndex ? '#f5ead2' : aligned ? '#9ed7cf' : 'rgba(255,255,255,0.48)',
        lineWidth: index === selectedIndex ? 3 : 1.5,
        shadow: index === selectedIndex || aligned,
        label: index + 1
      });
    });
  }

  function drawBenchLight(width, height) {
    const gradient = context.createRadialGradient(width * 0.5, height * 0.46, 0, width * 0.5, height * 0.46, Math.max(width, height) * 0.58);
    gradient.addColorStop(0, 'rgba(158, 215, 207, 0.08)');
    gradient.addColorStop(0.5, 'rgba(82, 108, 113, 0.025)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.18)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
  }

  function drawPiece(piece, width, height, options) {
    const scale = Math.min(width, height) * 0.18;
    context.save();
    context.translate(piece.x * width, piece.y * height);
    context.rotate(piece.rotation * Math.PI / 180);
    context.beginPath();
    piece.points.forEach((point, index) => {
      const x = point[0] * scale;
      const y = point[1] * scale;
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    });
    context.closePath();
    if (options.shadow) {
      context.shadowColor = options.fill;
      context.shadowBlur = prefersReducedMotion ? 0 : 22;
    }
    context.fillStyle = options.fill;
    context.fill();
    context.shadowBlur = 0;
    context.setLineDash(options.dashed ? [7, 7] : []);
    context.strokeStyle = options.stroke;
    context.lineWidth = options.lineWidth;
    context.stroke();
    context.setLineDash([]);
    context.rotate(-piece.rotation * Math.PI / 180);
    context.fillStyle = options.dashed ? 'rgba(220,235,232,0.45)' : '#071012';
    context.font = '700 12px ui-sans-serif, system-ui, sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(String(options.label), 0, 0);
    context.restore();
  }

  function pointerPosition(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height
    };
  }

  function beginDrag(event) {
    if (!caseFile) return;
    const point = pointerPosition(event);
    let nearestIndex = -1;
    let nearestDistance = Infinity;
    pieces.forEach((piece, index) => {
      const distance = Math.hypot(point.x - piece.x, point.y - piece.y);
      if (distance < nearestDistance && distance < 0.15) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });
    if (nearestIndex < 0) return;
    selectPiece(nearestIndex, false);
    dragging = true;
    dragOffset = {
      x: point.x - pieces[selectedIndex].x,
      y: point.y - pieces[selectedIndex].y
    };
    canvas.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  }

  function continueDrag(event) {
    if (!dragging) return;
    const point = pointerPosition(event);
    const current = pieces[selectedIndex];
    pieces[selectedIndex] = core.movePiece(current, point.x - dragOffset.x - current.x, point.y - dragOffset.y - current.y);
    drawWorkbench();
    event.preventDefault();
  }

  function endDrag(event) {
    if (!dragging) return;
    dragging = false;
    canvas.releasePointerCapture?.(event.pointerId);
    updateAssembly();
  }

  function handleCanvasKeydown(event) {
    const commands = {
      ArrowLeft: () => nudgeSelected(-0.02, 0),
      ArrowRight: () => nudgeSelected(0.02, 0),
      ArrowUp: () => nudgeSelected(0, -0.02),
      ArrowDown: () => nudgeSelected(0, 0.02),
      q: () => rotateSelected(-15),
      Q: () => rotateSelected(-15),
      e: () => rotateSelected(15),
      E: () => rotateSelected(15),
      '[': () => selectPiece((selectedIndex + pieces.length - 1) % pieces.length, true),
      ']': () => selectPiece((selectedIndex + 1) % pieces.length, true)
    };
    const command = commands[event.key];
    if (!command) return;
    event.preventDefault();
    command();
  }

  function saveConservationPostcard() {
    if (!caseFile) return;
    const postcard = document.createElement('canvas');
    postcard.width = 1440;
    postcard.height = 1000;
    const postcardContext = postcard.getContext('2d');
    const assessment = core.evaluateAssembly(pieces, caseFile.targetPieces);
    const [light, cool, warm] = caseFile.palette;

    const background = postcardContext.createLinearGradient(0, 0, postcard.width, postcard.height);
    background.addColorStop(0, '#071012');
    background.addColorStop(0.55, cool);
    background.addColorStop(1, '#0c0911');
    postcardContext.fillStyle = background;
    postcardContext.fillRect(0, 0, postcard.width, postcard.height);

    postcardContext.save();
    const original = context;
    const originalCanvas = canvas;
    drawPostcardPieces(postcardContext, postcard.width, 610, light, warm);
    void original;
    void originalCanvas;
    postcardContext.restore();

    const footer = postcardContext.createLinearGradient(0, 610, postcard.width, postcard.height);
    footer.addColorStop(0, '#12181a');
    footer.addColorStop(1, '#080a0c');
    postcardContext.fillStyle = footer;
    postcardContext.fillRect(0, 610, postcard.width, 390);
    postcardContext.fillStyle = light;
    postcardContext.font = '700 21px ui-sans-serif, system-ui, sans-serif';
    postcardContext.fillText('THE MUSEUM OF ALMOST · CONSERVATION LAB', 58, 670);
    postcardContext.fillStyle = '#f3eadb';
    postcardContext.font = '50px Georgia, serif';
    wrapText(postcardContext, caseFile.title, 58, 748, postcard.width - 116, 56, 2);
    postcardContext.fillStyle = '#c7d0cd';
    postcardContext.font = '24px Georgia, serif';
    wrapText(postcardContext, assessment.complete ? caseFile.report : caseFile.promise, 58, 875, postcard.width - 116, 34, 2);
    postcardContext.fillStyle = '#9ed7cf';
    postcardContext.font = '700 18px ui-sans-serif, system-ui, sans-serif';
    postcardContext.fillText(`${caseFile.caseId} · ${assessment.aligned} OF ${assessment.total} FRAGMENTS ALIGNED`, 58, 962);

    postcard.toBlob((blob) => {
      if (!blob) return;
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = `museum-of-almost-conservation-${caseFile.dateKey}-${String(variation + 1).padStart(2, '0')}.png`;
      link.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  }

  function drawPostcardPieces(postcardContext, width, height, light, warm) {
    const gradient = postcardContext.createRadialGradient(width * 0.5, height * 0.48, 0, width * 0.5, height * 0.48, width * 0.55);
    gradient.addColorStop(0, `${light}33`);
    gradient.addColorStop(0.5, `${warm}18`);
    gradient.addColorStop(1, 'transparent');
    postcardContext.fillStyle = gradient;
    postcardContext.fillRect(0, 0, width, height);

    const scale = Math.min(width, height) * 0.22;
    pieces.forEach((piece, index) => {
      postcardContext.save();
      postcardContext.translate(piece.x * width, piece.y * height);
      postcardContext.rotate(piece.rotation * Math.PI / 180);
      postcardContext.beginPath();
      piece.points.forEach((point, pointIndex) => {
        const x = point[0] * scale;
        const y = point[1] * scale;
        if (pointIndex === 0) postcardContext.moveTo(x, y);
        else postcardContext.lineTo(x, y);
      });
      postcardContext.closePath();
      postcardContext.fillStyle = caseFile.palette[index];
      postcardContext.shadowColor = caseFile.palette[index];
      postcardContext.shadowBlur = 28;
      postcardContext.fill();
      postcardContext.shadowBlur = 0;
      postcardContext.strokeStyle = 'rgba(255,255,255,0.58)';
      postcardContext.lineWidth = 3;
      postcardContext.stroke();
      postcardContext.restore();
    });
  }

  function wrapText(targetContext, text, x, y, maxWidth, lineHeight, maxLines) {
    const words = text.split(/\s+/);
    let line = '';
    let lineIndex = 0;
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (targetContext.measureText(candidate).width > maxWidth && line) {
        targetContext.fillText(line, x, y + lineIndex * lineHeight);
        line = word;
        lineIndex += 1;
        if (lineIndex >= maxLines - 1) break;
      } else {
        line = candidate;
      }
    }
    if (lineIndex < maxLines) targetContext.fillText(line, x, y + lineIndex * lineHeight);
  }

  function announce(message) {
    if (liveRegion) liveRegion.textContent = message;
  }
})();
