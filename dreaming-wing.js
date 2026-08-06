(() => {
  'use strict';

  const STORAGE_KEY = 'museum-of-almost:v1';
  const MIN_FRAGMENTS = 3;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const fragmentCount = document.querySelector('#fragment-count');
  const headerActions = document.querySelector('.header-actions');
  const catalogueButton = document.querySelector('#catalogue-button');

  if (!fragmentCount || !headerActions || !catalogueButton) return;

  const palettes = [
    ['#e5c184', '#596b84', '#a56f7c', '#f6ead5'],
    ['#cab4ff', '#536782', '#7c5b85', '#f1e8ff'],
    ['#9ed7cf', '#405f6b', '#7d668e', '#e8fbf6'],
    ['#eab995', '#5a577a', '#8a6e56', '#fff0dc']
  ];
  const awakenings = [
    'The museum falls asleep without closing its eyes.',
    'Every locked door dreams of becoming weather.',
    'The building borrows your fragments and forgets which way is up.',
    'Somewhere above the ceiling, the night staff misplaces gravity.',
    'The galleries turn inward and discover they have been carrying a sky.'
  ];
  const transformations = [
    'learns the floor plan by heart',
    'opens a door in the ceiling',
    'becomes the shadow of a kinder question',
    'is catalogued as a minor constellation',
    'waits inside a frame that opens inward',
    'forgets its purpose and becomes more accurate'
  ];
  const dawns = [
    'By morning, the museum will deny all of this.',
    'At dawn, every label returns one word shorter.',
    'When the lights wake, the room will be gone but not absent.',
    'The first visitor tomorrow will mistake the afterimage for architecture.',
    'Nothing survives the dream except the part that noticed you.'
  ];
  const quotes = [
    '“A museum can only dream with what its visitors are willing to carry.”',
    '“The sleeping building has no use for finished things.”',
    '“Please do not wake the metaphor until it has found its coat.”',
    '“The dream is not part of the collection. The collection is part of the dream.”',
    '“Every afterimage is an object that chose not to stay.”'
  ];
  const afterimages = [
    'a doorway remembering your shape',
    'three fragments briefly agreeing on a sky',
    'the sound of a room turning inward',
    'a constellation with no obligation to be found',
    'the soft machinery behind almost',
    'one impossible thing dreaming responsibly'
  ];

  let dreamTurn = 0;
  let currentDream = null;
  let currentScene = null;
  let animationFrame = 0;

  injectStyles();
  const dreamButton = createDreamButton();
  const dreamDialog = createDreamDialog();
  const dreamCanvas = dreamDialog.querySelector('#dream-canvas');
  const dreamTitle = dreamDialog.querySelector('#dream-title');
  const dreamProse = dreamDialog.querySelector('#dream-prose');
  const dreamLines = dreamDialog.querySelector('#dream-lines');
  const dreamQuote = dreamDialog.querySelector('#dream-quote');
  const dreamAfterimage = dreamDialog.querySelector('#dream-afterimage');
  const dreamAgainButton = dreamDialog.querySelector('#dream-again-button');
  const saveDreamButton = dreamDialog.querySelector('#save-dream-button');

  const countObserver = new MutationObserver(updateAvailability);
  countObserver.observe(fragmentCount, { childList: true, characterData: true, subtree: true });
  window.addEventListener('storage', updateAvailability);
  window.addEventListener('resize', () => {
    if (dreamDialog.hasAttribute('open') && currentDream) drawDream(performance.now());
  }, { passive: true });

  dreamButton.addEventListener('click', openDreamingWing);
  dreamAgainButton.addEventListener('click', () => {
    dreamTurn += 1;
    renderDream();
  });
  saveDreamButton.addEventListener('click', saveDreamPostcard);
  dreamDialog.addEventListener('close', stopAnimation);
  dreamDialog.addEventListener('cancel', stopAnimation);

  updateAvailability();

  function injectStyles() {
    const style = document.createElement('style');
    style.dataset.museumDreamingWing = '';
    style.textContent = `
      .dream-button:disabled {
        cursor: not-allowed;
        opacity: 0.48;
      }

      .dream-button:not(:disabled) > span:first-child {
        color: var(--gold-bright);
      }

      .dream-dialog {
        width: min(940px, calc(100% - 1.2rem));
        max-width: none;
      }

      .dream-dialog::backdrop {
        background: rgba(5, 7, 14, 0.88);
        backdrop-filter: blur(12px);
      }

      .dream-frame {
        width: 100%;
        max-height: min(92vh, 880px);
        overflow: auto;
        background:
          radial-gradient(circle at 18% 8%, rgba(130, 109, 176, 0.18), transparent 31rem),
          radial-gradient(circle at 92% 34%, rgba(96, 155, 157, 0.14), transparent 28rem),
          #111018;
      }

      .dream-kicker {
        color: #cab4ff;
      }

      .dream-prose {
        max-width: 52rem;
        margin-bottom: 1.25rem;
        color: var(--muted);
        font-family: Georgia, "Times New Roman", serif;
        font-size: clamp(1rem, 2.2vw, 1.25rem);
        font-style: italic;
        line-height: 1.55;
      }

      .dream-canvas-frame {
        position: relative;
        overflow: hidden;
        margin-block: 1rem 1.25rem;
        border: 1px solid rgba(225, 214, 255, 0.2);
        border-radius: 1rem;
        background: #080912;
        box-shadow: inset 0 0 80px rgba(0, 0, 0, 0.45), 0 24px 70px rgba(0, 0, 0, 0.34);
      }

      #dream-canvas {
        display: block;
        width: 100%;
        aspect-ratio: 16 / 8.5;
      }

      .dream-lines {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 0.75rem;
        padding: 0;
        margin: 0 0 1.25rem;
        list-style: none;
      }

      .dream-lines li {
        min-height: 7.5rem;
        padding: 1rem;
        color: rgba(243, 234, 219, 0.86);
        border: 1px solid rgba(225, 214, 255, 0.13);
        border-radius: 0.9rem;
        background: rgba(255, 255, 255, 0.025);
        font-family: Georgia, "Times New Roman", serif;
        line-height: 1.5;
      }

      .dream-quote {
        color: rgba(243, 234, 219, 0.78);
      }

      .dream-afterimage {
        display: grid;
        gap: 0.35rem;
        margin-block: 1rem 0;
        padding: 1rem 1.1rem;
        border: 1px solid rgba(202, 180, 255, 0.26);
        border-radius: 0.9rem;
        background: rgba(202, 180, 255, 0.065);
      }

      .dream-afterimage span {
        color: #cab4ff;
        font-size: 0.65rem;
        font-weight: 800;
        letter-spacing: 0.17em;
      }

      .dream-afterimage strong {
        font-family: Georgia, "Times New Roman", serif;
        font-size: clamp(1.05rem, 2vw, 1.3rem);
        font-weight: 400;
      }

      .dream-actions {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: 0.65rem;
      }

      @media (max-width: 720px) {
        .dream-lines {
          grid-template-columns: 1fr;
        }

        .dream-lines li {
          min-height: 0;
        }

        .dream-actions {
          align-items: stretch;
          flex-direction: column;
        }

        .dream-actions button {
          width: 100%;
          justify-content: center;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .dream-dialog *,
        .dream-button {
          scroll-behavior: auto !important;
          transition-duration: 0.001ms !important;
        }
      }
    `;
    document.head.append(style);
  }

  function createDreamButton() {
    const button = document.createElement('button');
    button.className = 'quiet-button dream-button';
    button.id = 'dream-button';
    button.type = 'button';
    button.disabled = true;
    button.setAttribute('aria-haspopup', 'dialog');

    const icon = document.createElement('span');
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = '☾';
    const copy = document.createElement('span');
    copy.className = 'button-copy';
    copy.textContent = 'Dreaming wing · 0/3';
    button.append(icon, copy);
    headerActions.insertBefore(button, catalogueButton);
    return button;
  }

  function createDreamDialog() {
    const dialog = document.createElement('dialog');
    dialog.className = 'museum-dialog dream-dialog';
    dialog.id = 'dream-dialog';
    dialog.setAttribute('aria-labelledby', 'dream-title');
    dialog.innerHTML = `
      <form method="dialog" class="dialog-frame dream-frame">
        <button class="dialog-close" value="close" aria-label="Wake from the dreaming wing">×</button>
        <p class="eyebrow dream-kicker">THE DREAMING WING · OPEN AFTER THREE FRAGMENTS</p>
        <h2 id="dream-title">The museum is dreaming.</h2>
        <p class="dream-prose" id="dream-prose"></p>
        <div class="dream-canvas-frame">
          <canvas id="dream-canvas" aria-hidden="true"></canvas>
        </div>
        <ol class="dream-lines" id="dream-lines"></ol>
        <blockquote class="dream-quote" id="dream-quote"></blockquote>
        <div class="dream-afterimage">
          <span>AFTERIMAGE · CANNOT BE CATALOGUED</span>
          <strong id="dream-afterimage"></strong>
        </div>
        <menu class="dream-actions">
          <button class="text-button" id="save-dream-button" type="button">⇩ Save dream postcard</button>
          <button class="text-button" id="dream-again-button" type="button">Dream differently</button>
          <button class="primary-button" value="close">Wake gently</button>
        </menu>
      </form>
    `;
    document.body.append(dialog);
    return dialog;
  }

  function readMuseumState() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!stored || typeof stored !== 'object') return null;
      const fragments = Array.isArray(stored.fragments)
        ? stored.fragments.filter((fragment) => (
          fragment
          && typeof fragment.text === 'string'
          && typeof fragment.source === 'string'
        )).slice(0, 6)
        : [];
      return {
        seed: Number.isFinite(stored.seed) ? stored.seed : 0,
        cycle: Number.isFinite(stored.cycle) ? stored.cycle : 0,
        fragments
      };
    } catch {
      return null;
    }
  }

  function updateAvailability() {
    const state = readMuseumState();
    const count = state?.fragments.length || Number.parseInt(fragmentCount.textContent, 10) || 0;
    const available = count >= MIN_FRAGMENTS;
    dreamButton.disabled = !available;
    dreamButton.querySelector('.button-copy').textContent = available
      ? 'Dreaming wing'
      : `Dreaming wing · ${Math.min(count, MIN_FRAGMENTS)}/${MIN_FRAGMENTS}`;
    dreamButton.title = available
      ? 'Enter a dream generated from the fragments you kept'
      : `Keep ${MIN_FRAGMENTS - count} more fragment${MIN_FRAGMENTS - count === 1 ? '' : 's'} to open the dreaming wing`;
    if (!available && dreamDialog.hasAttribute('open')) closeDialog(dreamDialog);
  }

  function openDreamingWing() {
    const state = readMuseumState();
    if (!state || state.fragments.length < MIN_FRAGMENTS) {
      updateAvailability();
      return;
    }
    dreamTurn = 0;
    openDialog(dreamDialog);
    renderDream();
  }

  function openDialog(dialog) {
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  }

  function closeDialog(dialog) {
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  }

  function hashString(value) {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function mulberry32(seed) {
    return function random() {
      let value = seed += 0x6D2B79F5;
      value = Math.imul(value ^ value >>> 15, value | 1);
      value ^= value + Math.imul(value ^ value >>> 7, value | 61);
      return ((value ^ value >>> 14) >>> 0) / 4294967296;
    };
  }

  function choose(random, options) {
    return options[Math.floor(random() * options.length)];
  }

  function capitalise(value) {
    return value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : value;
  }

  function selectFragments(random, fragments) {
    const pool = [...fragments];
    for (let index = pool.length - 1; index > 0; index -= 1) {
      const other = Math.floor(random() * (index + 1));
      [pool[index], pool[other]] = [pool[other], pool[index]];
    }
    return pool.slice(0, 3);
  }

  function buildDream(state) {
    const signature = state.fragments.map((fragment) => `${fragment.text}:${fragment.source}`).join('|');
    const seed = hashString(`${state.seed}:${state.cycle}:${signature}:${dreamTurn}`);
    const random = mulberry32(seed);
    const [first, second, third] = selectFragments(random, state.fragments);
    const palette = choose(random, palettes);
    const opening = choose(random, awakenings);
    const transformationA = choose(random, transformations);
    let transformationB = choose(random, transformations);
    if (transformationB === transformationA) transformationB = transformations[(transformations.indexOf(transformationB) + 1) % transformations.length];
    const dawn = choose(random, dawns);

    return {
      seed,
      palette,
      title: `The Museum Dreams of ${capitalise(first.text)}`,
      prose: `${opening} It begins with ${first.text}, then borrows ${second.text} to remember what a corridor is for.`,
      lines: [
        `${capitalise(first.text)} ${transformationA}.`,
        `${capitalise(second.text)} meets ${third.text}; neither agrees to wake first.`,
        `${capitalise(third.text)} ${transformationB}. ${dawn}`
      ],
      quote: choose(random, quotes),
      afterimage: choose(random, afterimages),
      fragments: [first, second, third]
    };
  }

  function renderDream() {
    const state = readMuseumState();
    if (!state || state.fragments.length < MIN_FRAGMENTS) {
      updateAvailability();
      return;
    }

    stopAnimation();
    currentDream = buildDream(state);
    currentScene = buildScene(currentDream);
    dreamTitle.textContent = currentDream.title;
    dreamProse.textContent = currentDream.prose;
    dreamQuote.textContent = currentDream.quote;
    dreamAfterimage.textContent = currentDream.afterimage;
    dreamLines.replaceChildren(...currentDream.lines.map((line) => {
      const item = document.createElement('li');
      item.textContent = line;
      return item;
    }));

    drawDream(performance.now());
    if (!prefersReducedMotion) animationFrame = requestAnimationFrame(animateDream);
  }

  function buildScene(dream) {
    const random = mulberry32(dream.seed);
    return {
      rings: Array.from({ length: 9 }, (_, index) => ({
        radius: 0.1 + index * 0.055,
        offset: random() * Math.PI * 2,
        lean: 0.55 + random() * 0.35,
        alpha: 0.12 + random() * 0.24
      })),
      motes: Array.from({ length: 68 }, () => ({
        x: random(),
        y: random(),
        size: 0.5 + random() * 2.4,
        phase: random() * Math.PI * 2,
        drift: 0.002 + random() * 0.01,
        alpha: 0.12 + random() * 0.45
      })),
      nodes: dream.fragments.map((fragment, index) => ({
        x: [0.25, 0.5, 0.75][index] + (random() - 0.5) * 0.08,
        y: [0.58, 0.34, 0.6][index] + (random() - 0.5) * 0.1,
        radius: 0.038 + random() * 0.025,
        phase: random() * Math.PI * 2,
        labelSeed: hashString(fragment.text)
      }))
    };
  }

  function fitDreamCanvas() {
    const rect = dreamCanvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    const pixelWidth = Math.round(width * dpr);
    const pixelHeight = Math.round(height * dpr);
    if (dreamCanvas.width !== pixelWidth || dreamCanvas.height !== pixelHeight) {
      dreamCanvas.width = pixelWidth;
      dreamCanvas.height = pixelHeight;
    }
    const context = dreamCanvas.getContext('2d');
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { context, width, height };
  }

  function drawDream(time) {
    if (!currentDream || !currentScene) return;
    const { context, width, height } = fitDreamCanvas();
    const [light, cool, warm, paper] = currentDream.palette;
    const motion = prefersReducedMotion ? 0 : time * 0.00025;

    const background = context.createLinearGradient(0, 0, width, height);
    background.addColorStop(0, '#070812');
    background.addColorStop(0.5, cool);
    background.addColorStop(1, '#0a0710');
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);

    const glow = context.createRadialGradient(width * 0.5, height * 0.48, 0, width * 0.5, height * 0.48, width * 0.48);
    glow.addColorStop(0, `${light}38`);
    glow.addColorStop(0.48, `${warm}16`);
    glow.addColorStop(1, 'transparent');
    context.fillStyle = glow;
    context.fillRect(0, 0, width, height);

    context.save();
    context.translate(width * 0.5, height * 0.49);
    currentScene.rings.forEach((ring, index) => {
      const pulse = 1 + Math.sin(motion * 2 + ring.offset) * (prefersReducedMotion ? 0 : 0.035);
      context.beginPath();
      context.ellipse(
        0,
        0,
        width * ring.radius * pulse,
        height * ring.radius * ring.lean * pulse,
        ring.offset + motion * (index % 2 ? -0.35 : 0.25),
        0,
        Math.PI * 2
      );
      context.strokeStyle = index % 2 ? `${paper}${alphaHex(ring.alpha)}` : `${light}${alphaHex(ring.alpha)}`;
      context.lineWidth = index % 3 === 0 ? 1.6 : 0.8;
      context.stroke();
    });
    context.restore();

    context.save();
    context.lineWidth = 1.2;
    for (let index = 0; index < currentScene.nodes.length; index += 1) {
      const node = currentScene.nodes[index];
      const next = currentScene.nodes[(index + 1) % currentScene.nodes.length];
      const x1 = node.x * width;
      const y1 = node.y * height;
      const x2 = next.x * width;
      const y2 = next.y * height;
      context.beginPath();
      context.moveTo(x1, y1);
      context.bezierCurveTo(
        width * 0.5 + Math.sin(motion + index) * width * 0.12,
        height * (0.12 + index * 0.08),
        width * 0.5 + Math.cos(motion + index) * width * 0.12,
        height * (0.82 - index * 0.06),
        x2,
        y2
      );
      context.strokeStyle = `${paper}52`;
      context.stroke();
    }
    context.restore();

    currentScene.nodes.forEach((node, index) => {
      const x = node.x * width + Math.sin(motion * 2 + node.phase) * (prefersReducedMotion ? 0 : width * 0.008);
      const y = node.y * height + Math.cos(motion * 1.7 + node.phase) * (prefersReducedMotion ? 0 : height * 0.012);
      const radius = Math.min(width, height) * node.radius;
      const nodeGlow = context.createRadialGradient(x, y, 0, x, y, radius * 3.2);
      nodeGlow.addColorStop(0, index === 1 ? paper : light);
      nodeGlow.addColorStop(0.18, index === 2 ? `${warm}cc` : `${light}aa`);
      nodeGlow.addColorStop(1, 'transparent');
      context.fillStyle = nodeGlow;
      context.beginPath();
      context.arc(x, y, radius * 3.2, 0, Math.PI * 2);
      context.fill();

      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fillStyle = index === 1 ? `${paper}d8` : `${light}c8`;
      context.fill();
      context.strokeStyle = `${paper}8a`;
      context.lineWidth = 1;
      context.stroke();
    });

    currentScene.motes.forEach((mote) => {
      const x = (mote.x * width + Math.sin(motion + mote.phase) * width * 0.025 + width) % width;
      const y = prefersReducedMotion
        ? mote.y * height
        : (mote.y * height - time * mote.drift + height * 5) % height;
      context.beginPath();
      context.arc(x, y, mote.size, 0, Math.PI * 2);
      context.fillStyle = `rgba(244, 236, 255, ${mote.alpha})`;
      context.fill();
    });

    const vignette = context.createRadialGradient(width * 0.5, height * 0.48, width * 0.18, width * 0.5, height * 0.48, width * 0.72);
    vignette.addColorStop(0, 'transparent');
    vignette.addColorStop(1, 'rgba(2, 2, 7, 0.82)');
    context.fillStyle = vignette;
    context.fillRect(0, 0, width, height);
  }

  function alphaHex(alpha) {
    return Math.round(Math.max(0, Math.min(1, alpha)) * 255).toString(16).padStart(2, '0');
  }

  function animateDream(time) {
    drawDream(time);
    animationFrame = requestAnimationFrame(animateDream);
  }

  function stopAnimation() {
    if (animationFrame) cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  }

  function saveDreamPostcard() {
    if (!currentDream) return;
    drawDream(performance.now());
    const postcard = document.createElement('canvas');
    postcard.width = 1440;
    postcard.height = 1000;
    const context = postcard.getContext('2d');
    context.fillStyle = '#080912';
    context.fillRect(0, 0, postcard.width, postcard.height);
    context.drawImage(dreamCanvas, 0, 0, postcard.width, 765);

    const footer = context.createLinearGradient(0, 765, postcard.width, postcard.height);
    footer.addColorStop(0, '#111018');
    footer.addColorStop(1, '#080912');
    context.fillStyle = footer;
    context.fillRect(0, 765, postcard.width, 235);
    context.fillStyle = '#cab4ff';
    context.font = '700 22px ui-sans-serif, system-ui, sans-serif';
    context.fillText('THE MUSEUM OF ALMOST · THE DREAMING WING', 54, 820);
    context.fillStyle = '#f3eadb';
    context.font = '48px Georgia, serif';
    wrapText(context, currentDream.title, 54, 882, postcard.width - 108, 54, 2);
    context.fillStyle = '#b7ac9b';
    context.font = '24px Georgia, serif';
    context.fillText(`Afterimage: ${currentDream.afterimage}`, 54, 963, postcard.width - 108);

    postcard.toBlob((blob) => {
      if (!blob) return;
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = `museum-of-almost-dream-${String(dreamTurn + 1).padStart(2, '0')}.png`;
      link.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
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
