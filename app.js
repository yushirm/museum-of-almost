(() => {
  'use strict';

  const STORAGE_KEY = 'museum-of-almost:v1';
  const MAX_FRAGMENTS = 6;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const canvas = document.querySelector('#room-canvas');
  const context = canvas.getContext('2d', { alpha: false });
  const stage = document.querySelector('#stage');
  const hotspotsHost = document.querySelector('#hotspots');
  const roomNumber = document.querySelector('#room-number');
  const roomTitle = document.querySelector('#room-title');
  const roomIntro = document.querySelector('#room-intro');
  const museumStatus = document.querySelector('#museum-status');
  const fragmentCount = document.querySelector('#fragment-count');
  const liveRegion = document.querySelector('#live-region');
  const nextRoomButton = document.querySelector('#next-room-button');
  const postcardButton = document.querySelector('#postcard-button');
  const soundButton = document.querySelector('#sound-button');
  const catalogueButton = document.querySelector('#catalogue-button');
  const resetButton = document.querySelector('#reset-button');

  const exhibitDialog = document.querySelector('#exhibit-dialog');
  const exhibitNumber = document.querySelector('#exhibit-number');
  const exhibitTitle = document.querySelector('#exhibit-title');
  const exhibitMedium = document.querySelector('#exhibit-medium');
  const exhibitStory = document.querySelector('#exhibit-story');
  const exhibitQuote = document.querySelector('#exhibit-quote');
  const fragmentText = document.querySelector('#fragment-text');
  const fragmentCard = document.querySelector('#fragment-card');
  const dialogArt = document.querySelector('#dialog-art');
  const keepFragmentButton = document.querySelector('#keep-fragment-button');

  const catalogueDialog = document.querySelector('#catalogue-dialog');
  const fragmentList = document.querySelector('#fragment-list');
  const catalogueEmpty = document.querySelector('#catalogue-empty');
  const cycleCount = document.querySelector('#cycle-count');
  const welcomeDialog = document.querySelector('#welcome-dialog');

  const palettes = [
    ['#c9a56a', '#4f5d63', '#766356', '#d8c9ac'],
    ['#b69c72', '#4d566c', '#7a4f48', '#d8cfb6'],
    ['#c4aa7d', '#3d5b58', '#6e5149', '#e0d1b5'],
    ['#d1b078', '#5b5068', '#34535c', '#d7c6a6'],
    ['#c79a68', '#4f6254', '#6a4c5b', '#d9c9b5'],
    ['#c6ad8f', '#445563', '#6d5746', '#e1d3bd']
  ];

  const roomFirst = [
    'Borrowed', 'Unsent', 'Patient', 'Misplaced', 'Unfinished', 'Quiet',
    'Second-Hand', 'Temporary', 'Unmeasured', 'Almost Forgotten', 'Unclaimed', 'Polite'
  ];
  const roomLast = [
    'Weather', 'Directions', 'Echoes', 'Beginnings', 'Gravity', 'Apologies',
    'Constellations', 'Blueprints', 'Thunder', 'Shadows', 'Possibilities', 'Distances'
  ];
  const roomIntros = [
    'The ceiling is remembering a sky it never had.',
    'Someone has carefully dusted the silence.',
    'Every frame is hanging one degree away from certainty.',
    'The light arrives before its explanation.',
    'A small draft keeps turning the invisible pages.',
    'The room appears to have been expecting a different century.',
    'Nothing moves, except the parts that have not happened yet.',
    'The walls are listening with professional discretion.',
    'A bell rings somewhere beyond the architecture.',
    'The floor plan has developed a private opinion.'
  ];
  const statuses = [
    'The museum has not decided whether you are early or late.',
    'A nearby corridor is pretending not to exist.',
    'The curator has stepped out to reconsider the labels.',
    'There are no cameras. The portraits remain nosy on their own.',
    'Today’s closing time has been postponed indefinitely.',
    'The gift shop sells only receipts for things you nearly bought.',
    'A velvet rope has been placed around an excellent absence.',
    'The building settles into a more interesting version of itself.'
  ];

  const subjects = [
    'Compass', 'Choir', 'Machine', 'Window', 'Map', 'Clock', 'Umbrella', 'Ladder',
    'Archive', 'Lantern', 'Key', 'Telescope', 'Envelope', 'Bridge', 'Mirror', 'Garden'
  ];
  const conditions = [
    'That Pointed at Maybe', 'Waiting for Its First Note', 'Built to Misremember',
    'Facing an Unbuilt Room', 'of Roads Not Taken', 'Practising Tomorrow',
    'for Indoor Rain', 'Missing Its Final Rung', 'of Unimportant Miracles',
    'Lit by a Previous Evening', 'for a Door with No Hurry', 'Trained on Nearby Things',
    'Addressed to Later', 'Ending Halfway Across', 'That Reflected the Next Thought',
    'Grown from Spare Afternoons'
  ];
  const media = [
    'Brass, hesitation, and borrowed light',
    'Graphite on a promise not yet made',
    'Recovered mechanism, purpose unknown',
    'Folded distance with minor weather damage',
    'Glass, thread, and an avoidable coincidence',
    'Ink on the reverse side of time',
    'Wood, velvet, and one missing instruction',
    'Acrylic possibility under museum glass'
  ];
  const stories = [
    'The object was commissioned to solve a problem that disappeared during construction. The maker continued anyway, claiming the absence had improved the brief.',
    'Conservators disagree about whether this piece is incomplete or simply facing the wrong direction. It has declined to clarify the matter.',
    'The original label contained seven confident paragraphs. During restoration, six faded and the remaining one became much more useful.',
    'Visitors often report that the object changes after they leave. The museum suspects the visitors are the moving part.',
    'Its mechanism has never worked in public. At night, however, the dust around it forms extremely persuasive diagrams.',
    'This is the third attempt to exhibit the piece. The first two displays quietly became exits.',
    'A note found inside reads: “Do not complete under ordinary lighting.” The instruction has been followed with unusual dedication.',
    'The artist described it as a rehearsal for an object. No finished object has been located, which may have been the rehearsal’s ambition.'
  ];
  const quotes = [
    '“It was more accurate before we understood it.”',
    '“Please leave enough room for the missing part.”',
    '“Completion is not included in the insurance valuation.”',
    '“The object is stable provided nobody agrees on it.”',
    '“Handle the possibility by its edges.”',
    '“A replica would be indistinguishable from the original doubt.”',
    '“The silence is structural, not decorative.”',
    '“It has reached the final stage before the final stage.”'
  ];
  const fragments = [
    'a direction that changes kindly',
    'the first note before courage',
    'a useful piece of uncertainty',
    'weather from an indoor sky',
    'the hinge of an invisible door',
    'a patient spark',
    'proof that the gap was deliberate',
    'one unspent beginning',
    'the weight of almost',
    'a map folded around hope',
    'the quiet after an idea arrives',
    'a small permission to continue',
    'the shadow of a better question',
    'an unfinished thing at peace',
    'a spare afternoon',
    'the part that did not need fixing'
  ];

  const finalRoom = {
    title: 'The Room That Was Finished',
    intro: 'It is smaller than expected, and exactly large enough.',
    status: 'For once, every label agrees. This is deeply suspicious.',
    palette: ['#e2c995', '#5c5548', '#8a7557', '#f1e6cd'],
    exhibits: [{
      title: 'The Complete Collection of What You Kept',
      medium: 'Six fragments, one witness, no missing pieces',
      story: 'The museum arranged your fragments in the order they arrived. Together they do not explain anything. They do, however, make a room—and for a moment, the room asks nothing more of them.',
      quote: '“Nothing here was waiting to become perfect. It was waiting to be seen.”',
      fragment: 'a finished moment that knows how to leave',
      artType: 5,
      artSeed: 1
    }]
  };

  let state = loadState();
  let room = null;
  let selectedExhibitIndex = 0;
  let frameRects = [];
  let dust = [];
  let width = 1;
  let height = 1;
  let dpr = 1;
  let pointer = { x: 0.5, y: 0.5 };
  let lastFrame = 0;
  let audio = null;

  function defaultState() {
    return {
      seed: globalThis.crypto?.getRandomValues
        ? globalThis.crypto.getRandomValues(new Uint32Array(1))[0]
        : Math.floor(Math.random() * 0xFFFFFFFF),
      roomIndex: 0,
      cycle: 0,
      fragments: [],
      collectedRooms: [],
      completedCollections: 0,
      welcomed: false,
      finalRoomPending: false
    };
  }

  function loadState() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!stored || typeof stored !== 'object') return defaultState();
      return {
        ...defaultState(),
        ...stored,
        fragments: Array.isArray(stored.fragments) ? stored.fragments.slice(0, MAX_FRAGMENTS) : [],
        collectedRooms: Array.isArray(stored.collectedRooms) ? stored.collectedRooms.slice(-30) : []
      };
    } catch {
      return defaultState();
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage can be disabled by browser policy. The current visit still works in memory.
    }
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

  function roomId() {
    return `${state.seed}:${state.cycle}:${state.roomIndex}`;
  }

  function generateRoom() {
    if (state.finalRoomPending) {
      return { ...finalRoom, id: `final:${state.cycle}`, final: true };
    }

    const id = roomId();
    const random = mulberry32(hashString(id));
    const palette = palettes[Math.floor(random() * palettes.length)];
    const usedTitles = new Set();
    const exhibits = Array.from({ length: 3 }, (_, index) => {
      let title = '';
      while (!title || usedTitles.has(title)) {
        title = `The ${choose(random, subjects)} ${choose(random, conditions)}`;
      }
      usedTitles.add(title);
      return {
        title,
        medium: `${choose(random, media)}, ${1880 + Math.floor(random() * 170)}–present`,
        story: choose(random, stories),
        quote: choose(random, quotes),
        fragment: choose(random, fragments),
        artType: Math.floor(random() * 6),
        artSeed: Math.floor(random() * 1_000_000) + index
      };
    });

    return {
      id,
      final: false,
      title: `The Gallery of ${choose(random, roomFirst)} ${choose(random, roomLast)}`,
      intro: choose(random, roomIntros),
      status: choose(random, statuses),
      palette,
      exhibits
    };
  }

  function announce(message) {
    liveRegion.textContent = '';
    window.setTimeout(() => { liveRegion.textContent = message; }, 20);
  }

  function openDialog(dialog) {
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  }

  function closeDialog(dialog) {
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  }

  function renderRoom() {
    room = generateRoom();
    roomNumber.textContent = room.final
      ? `ROOM ∞ · COMPLETED COLLECTION ${String(state.completedCollections + 1).padStart(2, '0')}`
      : `ROOM ${String(state.roomIndex + 1).padStart(3, '0')} · OPEN COLLECTION`;
    roomTitle.textContent = room.title;
    roomIntro.textContent = room.intro;
    museumStatus.textContent = room.status;
    fragmentCount.textContent = state.fragments.length;
    nextRoomButton.innerHTML = room.final
      ? 'Begin another collection <span aria-hidden="true">↻</span>'
      : 'Walk into another wing <span aria-hidden="true">→</span>';
    postcardButton.disabled = false;
    buildHotspots();
    fitCanvas();
    renderCatalogue();
    updateAudioNotes();
  }

  function buildHotspots() {
    hotspotsHost.replaceChildren();
    room.exhibits.forEach((exhibit, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'exhibit-hotspot';
      button.dataset.index = String(index);
      button.dataset.label = room.final ? 'Examine the collection' : `Object ${String(index + 1).padStart(2, '0')}`;
      button.setAttribute('aria-label', `Examine ${exhibit.title}`);
      button.addEventListener('click', () => showExhibit(index));
      hotspotsHost.append(button);
    });
  }

  function layoutFrames() {
    const mobile = width < 650;
    if (room.final) {
      const frameWidth = mobile ? width * 0.72 : Math.min(width * 0.42, 470);
      const frameHeight = mobile ? height * 0.35 : height * 0.5;
      return [{ x: (width - frameWidth) / 2, y: height * 0.2, w: frameWidth, h: frameHeight }];
    }

    if (mobile) {
      const margin = width * 0.08;
      const topWidth = width * 0.62;
      const topHeight = height * 0.26;
      const smallWidth = width * 0.37;
      const smallHeight = height * 0.2;
      return [
        { x: (width - topWidth) / 2, y: height * 0.13, w: topWidth, h: topHeight },
        { x: margin, y: height * 0.49, w: smallWidth, h: smallHeight },
        { x: width - margin - smallWidth, y: height * 0.49, w: smallWidth, h: smallHeight }
      ];
    }

    const frameWidth = Math.min(width * 0.22, 260);
    const frameHeight = Math.min(height * 0.42, 330);
    const gap = Math.min(width * 0.075, 90);
    const total = frameWidth * 3 + gap * 2;
    const start = (width - total) / 2;
    return Array.from({ length: 3 }, (_, index) => ({
      x: start + index * (frameWidth + gap),
      y: height * (index === 1 ? 0.18 : 0.23),
      w: frameWidth,
      h: frameHeight * (index === 1 ? 1.05 : 0.92)
    }));
  }

  function fitCanvas() {
    const rect = stage.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(rect.height));
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    frameRects = layoutFrames();
    positionHotspots();
    createDust();
    drawScene(performance.now());
  }

  function positionHotspots() {
    [...hotspotsHost.children].forEach((button, index) => {
      const rect = frameRects[index];
      if (!rect) return;
      button.style.left = `${rect.x}px`;
      button.style.top = `${rect.y}px`;
      button.style.width = `${rect.w}px`;
      button.style.height = `${rect.h}px`;
    });
  }

  function createDust() {
    const random = mulberry32(hashString(`${room.id}:dust`));
    dust = Array.from({ length: prefersReducedMotion ? 18 : 44 }, () => ({
      x: random() * width,
      y: random() * height,
      r: 0.35 + random() * 1.2,
      speed: 0.003 + random() * 0.012,
      phase: random() * Math.PI * 2,
      alpha: 0.08 + random() * 0.25
    }));
  }

  function roundedRect(ctx, x, y, w, h, radius) {
    const r = Math.min(radius, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }

  function drawScene(time) {
    const [gold, cool, warm, paper] = room.palette;
    const shiftX = (pointer.x - 0.5) * 14;
    const shiftY = (pointer.y - 0.5) * 6;

    const wall = context.createLinearGradient(0, 0, 0, height);
    wall.addColorStop(0, '#24201b');
    wall.addColorStop(0.67, '#171411');
    wall.addColorStop(1, '#0d0c0a');
    context.fillStyle = wall;
    context.fillRect(0, 0, width, height);

    context.save();
    context.globalAlpha = 0.17;
    context.strokeStyle = paper;
    context.lineWidth = 1;
    const vanishingX = width / 2 + shiftX;
    const horizon = height * 0.74 + shiftY;
    for (let x = -width; x < width * 2; x += Math.max(55, width / 10)) {
      context.beginPath();
      context.moveTo(vanishingX, horizon);
      context.lineTo(x, height);
      context.stroke();
    }
    for (let y = horizon; y < height; y += Math.max(24, (y - horizon) * 0.28 + 16)) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
    }
    context.restore();

    const ceilingGlow = context.createRadialGradient(width / 2 + shiftX, -20, 0, width / 2, 0, width * 0.58);
    ceilingGlow.addColorStop(0, `${gold}55`);
    ceilingGlow.addColorStop(1, 'transparent');
    context.fillStyle = ceilingGlow;
    context.fillRect(0, 0, width, height * 0.75);

    frameRects.forEach((rect, index) => {
      drawFrame(rect, room.exhibits[index], time, { gold, cool, warm, paper });
      drawPlaque(rect, room.exhibits[index], index, paper, gold);
    });

    dust.forEach((particle) => {
      const y = prefersReducedMotion
        ? particle.y
        : (particle.y - time * particle.speed + height * 10) % height;
      const x = particle.x + Math.sin(time * 0.0004 + particle.phase) * 8;
      context.beginPath();
      context.arc(x, y, particle.r, 0, Math.PI * 2);
      context.fillStyle = `rgba(242, 226, 196, ${particle.alpha})`;
      context.fill();
    });
  }

  function drawFrame(rect, exhibit, time, colors) {
    const { x, y, w, h } = rect;
    const border = Math.max(10, Math.min(18, w * 0.055));
    const inner = { x: x + border, y: y + border, w: w - border * 2, h: h - border * 2 };

    context.save();
    context.shadowColor = 'rgba(0,0,0,.65)';
    context.shadowBlur = 28;
    context.shadowOffsetY = 14;
    context.fillStyle = '#30281f';
    roundedRect(context, x, y, w, h, 3);
    context.fill();
    context.restore();

    const frameGradient = context.createLinearGradient(x, y, x + w, y + h);
    frameGradient.addColorStop(0, colors.gold);
    frameGradient.addColorStop(0.18, '#4a3925');
    frameGradient.addColorStop(0.55, '#1f1a15');
    frameGradient.addColorStop(0.84, '#6f5735');
    frameGradient.addColorStop(1, colors.gold);
    context.strokeStyle = frameGradient;
    context.lineWidth = Math.max(3, border * 0.42);
    context.strokeRect(x + border * 0.25, y + border * 0.25, w - border * 0.5, h - border * 0.5);

    context.save();
    context.beginPath();
    context.rect(inner.x, inner.y, inner.w, inner.h);
    context.clip();
    drawArtwork(inner, exhibit, time, colors);
    const glaze = context.createLinearGradient(inner.x, inner.y, inner.x + inner.w, inner.y + inner.h);
    glaze.addColorStop(0, 'rgba(255,255,255,.13)');
    glaze.addColorStop(0.3, 'transparent');
    glaze.addColorStop(0.72, 'rgba(255,255,255,.035)');
    glaze.addColorStop(1, 'rgba(0,0,0,.15)');
    context.fillStyle = glaze;
    context.fillRect(inner.x, inner.y, inner.w, inner.h);
    context.restore();
  }

  function drawArtwork(rect, exhibit, time, colors) {
    const random = mulberry32(exhibit.artSeed);
    const { x, y, w, h } = rect;
    const background = context.createLinearGradient(x, y, x + w, y + h);
    background.addColorStop(0, '#0d1012');
    background.addColorStop(0.52, colors.cool);
    background.addColorStop(1, '#17110f');
    context.fillStyle = background;
    context.fillRect(x, y, w, h);

    const motion = prefersReducedMotion ? 0 : time * 0.00018;
    context.save();
    context.translate(x, y);

    switch (exhibit.artType) {
      case 0:
        for (let index = 0; index < 7; index += 1) {
          const radius = (0.08 + index * 0.055) * Math.min(w, h);
          context.beginPath();
          context.arc(w * (0.42 + Math.sin(index + motion) * 0.035), h * 0.48, radius, 0, Math.PI * 2);
          context.strokeStyle = index % 2 ? `${colors.gold}aa` : `${colors.paper}66`;
          context.lineWidth = 1 + (index % 3);
          context.stroke();
        }
        break;
      case 1:
        for (let index = 0; index < 18; index += 1) {
          context.beginPath();
          const px = random() * w;
          const py = random() * h;
          context.moveTo(px, py);
          context.lineTo(px + (random() - 0.5) * w * 0.45, py + (random() - 0.5) * h * 0.45);
          context.lineTo(px + (random() - 0.5) * w * 0.2, py + (random() - 0.5) * h * 0.2);
          context.closePath();
          context.fillStyle = index % 3 === 0 ? `${colors.gold}77` : `${colors.warm}88`;
          context.fill();
        }
        break;
      case 2:
        for (let band = 0; band < 10; band += 1) {
          context.beginPath();
          for (let step = 0; step <= 20; step += 1) {
            const px = (step / 20) * w;
            const py = h * (0.12 + band * 0.085) + Math.sin(step * 0.7 + band + motion * 8) * h * 0.035;
            if (step === 0) context.moveTo(px, py);
            else context.lineTo(px, py);
          }
          context.strokeStyle = band % 2 ? `${colors.paper}55` : `${colors.gold}88`;
          context.lineWidth = 1.5;
          context.stroke();
        }
        break;
      case 3:
        context.strokeStyle = `${colors.paper}66`;
        context.lineWidth = 1;
        for (let index = 0; index < 24; index += 1) {
          const px = random() * w;
          const py = random() * h;
          const nextX = random() * w;
          const nextY = random() * h;
          context.beginPath();
          context.moveTo(px, py);
          context.lineTo(nextX, nextY);
          context.stroke();
          context.beginPath();
          context.arc(px, py, 1.5 + random() * 3.5, 0, Math.PI * 2);
          context.fillStyle = index % 4 === 0 ? colors.gold : colors.paper;
          context.fill();
        }
        break;
      case 4:
        for (let index = 0; index < 9; index += 1) {
          const paneW = w * (0.18 + random() * 0.16);
          const paneH = h * (0.14 + random() * 0.25);
          const px = random() * (w - paneW);
          const py = random() * (h - paneH);
          context.fillStyle = index % 2 ? `${colors.gold}44` : `${colors.paper}22`;
          context.fillRect(px, py, paneW, paneH);
          context.strokeStyle = `${colors.paper}55`;
          context.strokeRect(px, py, paneW, paneH);
        }
        break;
      default:
        for (let index = 0; index < 12; index += 1) {
          const px = w * 0.5 + Math.cos(index * 1.7 + motion) * w * (0.08 + index * 0.025);
          const py = h * 0.5 + Math.sin(index * 1.3 + motion) * h * (0.06 + index * 0.022);
          context.beginPath();
          context.arc(px, py, 4 + index * 1.1, 0, Math.PI * 2);
          context.fillStyle = index % 2 ? `${colors.gold}99` : `${colors.paper}77`;
          context.fill();
        }
    }

    context.restore();
  }

  function drawPlaque(rect, exhibit, index, paper, gold) {
    const plaqueWidth = Math.min(rect.w * 0.72, 150);
    const plaqueHeight = 22;
    const x = rect.x + (rect.w - plaqueWidth) / 2;
    const y = rect.y + rect.h + 13;
    context.fillStyle = 'rgba(14,12,10,.88)';
    context.fillRect(x, y, plaqueWidth, plaqueHeight);
    context.strokeStyle = `${gold}55`;
    context.strokeRect(x, y, plaqueWidth, plaqueHeight);
    context.fillStyle = paper;
    context.font = `${Math.max(8, Math.min(10, rect.w * 0.045))}px ui-sans-serif, system-ui, sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    const label = room.final ? 'THE COLLECTION' : `OBJECT ${String(index + 1).padStart(2, '0')}`;
    context.fillText(label, x + plaqueWidth / 2, y + plaqueHeight / 2 + 0.5);
  }

  function animationLoop(time) {
    if (time - lastFrame > 32) {
      drawScene(time);
      lastFrame = time;
    }
    requestAnimationFrame(animationLoop);
  }

  function showExhibit(index) {
    selectedExhibitIndex = index;
    const exhibit = room.exhibits[index];
    exhibitNumber.textContent = room.final ? 'FINAL ARRANGEMENT' : `OBJECT ${String(index + 1).padStart(2, '0')}`;
    exhibitTitle.textContent = exhibit.title;
    exhibitMedium.textContent = exhibit.medium;
    exhibitStory.textContent = exhibit.story;
    exhibitQuote.textContent = exhibit.quote;
    fragmentText.textContent = exhibit.fragment;
    dialogArt.style.setProperty('--art-a', room.palette[0]);
    dialogArt.style.setProperty('--art-b', room.palette[1]);
    dialogArt.style.setProperty('--art-c', room.palette[2]);
    dialogArt.style.setProperty('--x', `${18 + (exhibit.artSeed % 64)}%`);
    dialogArt.style.setProperty('--y', `${18 + (Math.floor(exhibit.artSeed / 7) % 64)}%`);
    dialogArt.style.setProperty('--turn', `${exhibit.artSeed % 360}deg`);

    const alreadyCollected = state.collectedRooms.includes(room.id);
    fragmentCard.hidden = alreadyCollected && !room.final;
    keepFragmentButton.disabled = alreadyCollected;
    keepFragmentButton.textContent = room.final
      ? 'Open the last door'
      : alreadyCollected
        ? 'Fragment already kept'
        : 'Keep this fragment';
    openDialog(exhibitDialog);
  }

  function keepFragment(event) {
    event.preventDefault();

    if (room.final) {
      completeCollection();
      closeDialog(exhibitDialog);
      return;
    }

    if (state.collectedRooms.includes(room.id)) return;
    const exhibit = room.exhibits[selectedExhibitIndex];
    state.fragments.push({
      text: exhibit.fragment,
      source: exhibit.title,
      room: state.roomIndex + 1
    });
    state.collectedRooms.push(room.id);
    state.finalRoomPending = state.fragments.length >= MAX_FRAGMENTS;
    saveState();
    fragmentCount.textContent = state.fragments.length;
    renderCatalogue();
    closeDialog(exhibitDialog);
    announce(`Fragment kept: ${exhibit.fragment}. ${state.fragments.length} of ${MAX_FRAGMENTS}.`);
    museumStatus.textContent = state.finalRoomPending
      ? 'Somewhere nearby, a room has reluctantly become complete.'
      : `The catalogue now contains ${state.fragments.length} of ${MAX_FRAGMENTS} fragments.`;
  }

  function nextRoom() {
    if (room.final) {
      completeCollection();
      return;
    }
    state.roomIndex += 1;
    saveState();
    renderRoom();
    stage.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' });
    announce(`Entered ${room.title}.`);
  }

  function completeCollection() {
    state.completedCollections += 1;
    state.cycle += 1;
    state.roomIndex = 0;
    state.fragments = [];
    state.collectedRooms = [];
    state.finalRoomPending = false;
    saveState();
    renderRoom();
    announce('The finished room closed gently. A new collection has begun.');
  }

  function renderCatalogue() {
    fragmentList.replaceChildren();
    state.fragments.forEach((fragment, index) => {
      const item = document.createElement('li');
      const number = document.createElement('span');
      number.className = 'fragment-index';
      number.textContent = String(index + 1).padStart(2, '0');
      const copy = document.createElement('div');
      const title = document.createElement('strong');
      title.textContent = fragment.text;
      const source = document.createElement('small');
      source.textContent = `From ${fragment.source}`;
      copy.append(title, source);
      item.append(number, copy);
      fragmentList.append(item);
    });
    catalogueEmpty.hidden = state.fragments.length > 0;
    fragmentList.hidden = state.fragments.length === 0;
    cycleCount.textContent = `Completed collections: ${state.completedCollections}`;
    fragmentCount.textContent = state.fragments.length;
  }

  function resetMuseum(event) {
    event.preventDefault();
    const confirmed = window.confirm('Return every fragment and begin with an empty catalogue?');
    if (!confirmed) return;
    const welcomed = state.welcomed;
    state = defaultState();
    state.welcomed = welcomed;
    saveState();
    closeDialog(catalogueDialog);
    renderRoom();
    announce('The catalogue is empty again.');
  }

  function savePostcard() {
    const scale = 1.5;
    const postcard = document.createElement('canvas');
    postcard.width = Math.round(canvas.width * scale / dpr);
    postcard.height = Math.round((canvas.height / dpr + 120) * scale);
    const ctx = postcard.getContext('2d');
    ctx.scale(scale, scale);
    ctx.drawImage(canvas, 0, 0, canvas.width / dpr, canvas.height / dpr);
    ctx.fillStyle = '#12100e';
    ctx.fillRect(0, canvas.height / dpr, canvas.width / dpr, 120);
    ctx.fillStyle = '#d6ad6c';
    ctx.font = '700 11px ui-sans-serif, system-ui, sans-serif';
    ctx.fillText('THE MUSEUM OF ALMOST', 24, canvas.height / dpr + 30);
    ctx.fillStyle = '#f3eadb';
    ctx.font = '28px Georgia, serif';
    ctx.fillText(room.title, 24, canvas.height / dpr + 68, canvas.width / dpr - 48);
    ctx.fillStyle = '#a99e8f';
    ctx.font = '13px Georgia, serif';
    ctx.fillText(room.intro, 24, canvas.height / dpr + 95, canvas.width / dpr - 48);

    postcard.toBlob((blob) => {
      if (!blob) return;
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = `museum-of-almost-room-${String(state.roomIndex + 1).padStart(3, '0')}.png`;
      link.click();
      URL.revokeObjectURL(url);
      announce('Postcard saved to this device.');
    }, 'image/png');
  }

  function createAudio() {
    if (audio) return audio;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    const ctx = new AudioContext();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    const oscillators = [0, 1, 2].map((index) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = index === 1 ? 'sine' : 'triangle';
      gain.gain.value = index === 0 ? 0.012 : 0.007;
      oscillator.connect(gain).connect(master);
      oscillator.start();
      return oscillator;
    });
    audio = { ctx, master, oscillators, enabled: false };
    return audio;
  }

  async function toggleSound() {
    const system = createAudio();
    if (!system) {
      soundButton.disabled = true;
      soundButton.querySelector('.button-copy').textContent = 'Sound unavailable';
      return;
    }
    if (system.ctx.state === 'suspended') await system.ctx.resume();
    system.enabled = !system.enabled;
    system.master.gain.cancelScheduledValues(system.ctx.currentTime);
    system.master.gain.linearRampToValueAtTime(system.enabled ? 0.7 : 0, system.ctx.currentTime + 0.35);
    soundButton.setAttribute('aria-pressed', String(system.enabled));
    soundButton.querySelector('.button-copy').textContent = system.enabled ? 'Sound awake' : 'Sound asleep';
    updateAudioNotes();
  }

  function updateAudioNotes() {
    if (!audio) return;
    const noteSeed = hashString(room.id);
    const base = 46 + (noteSeed % 24);
    const ratios = room.final ? [1, 1.25, 1.5] : [1, 1.2, 1.49];
    audio.oscillators.forEach((oscillator, index) => {
      oscillator.frequency.setTargetAtTime(base * ratios[index], audio.ctx.currentTime, 0.8);
    });
  }

  function registerServiceWorker() {
    if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
      navigator.serviceWorker.register('service-worker.js').catch(() => {
        // Offline installation is optional; the museum still works without it.
      });
    }
  }

  stage.addEventListener('pointermove', (event) => {
    const rect = stage.getBoundingClientRect();
    pointer = {
      x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height))
    };
    if (prefersReducedMotion) drawScene(performance.now());
  }, { passive: true });

  stage.addEventListener('pointerleave', () => {
    pointer = { x: 0.5, y: 0.5 };
  });

  keepFragmentButton.addEventListener('click', keepFragment);
  nextRoomButton.addEventListener('click', nextRoom);
  postcardButton.addEventListener('click', savePostcard);
  soundButton.addEventListener('click', toggleSound);
  catalogueButton.addEventListener('click', () => {
    renderCatalogue();
    openDialog(catalogueDialog);
  });
  resetButton.addEventListener('click', resetMuseum);
  window.addEventListener('resize', fitCanvas, { passive: true });

  welcomeDialog.addEventListener('close', () => {
    if (!state.welcomed) {
      state.welcomed = true;
      saveState();
    }
  });

  renderRoom();
  if (!prefersReducedMotion) requestAnimationFrame(animationLoop);
  registerServiceWorker();

  if (!state.welcomed) openDialog(welcomeDialog);
})();
