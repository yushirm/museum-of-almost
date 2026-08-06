(() => {
  'use strict';

  const canvas = document.querySelector('#lab-canvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  const tabs = [...document.querySelectorAll('.tab')];
  const controlsHost = document.querySelector('#dynamic-controls');
  const pauseButton = document.querySelector('#pause');
  const hint = document.querySelector('#canvas-hint');

  const labels = {
    kicker: document.querySelector('#lab-kicker'),
    title: document.querySelector('#lab-title'),
    description: document.querySelector('#lab-description'),
    notes: document.querySelector('#lab-notes')
  };

  let width = 1;
  let height = 1;
  let dpr = 1;
  let paused = false;
  let lastTime = performance.now();
  let activeLab = null;

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const randomBetween = (min, max) => min + Math.random() * (max - min);
  const palette = ['#6ef2ff', '#b19cff', '#bcff7d', '#ff8fcf', '#ffd36e'];

  function fitCanvas() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(rect.height));
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    activeLab?.resize(width, height);
  }

  function pointerPosition(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: clamp(event.clientX - rect.left, 0, rect.width),
      y: clamp(event.clientY - rect.top, 0, rect.height)
    };
  }

  function renderControls(definitions, onChange) {
    controlsHost.replaceChildren();
    for (const definition of definitions) {
      const wrapper = document.createElement('label');
      wrapper.className = 'control';

      const row = document.createElement('span');
      row.className = 'control-row';
      const title = document.createElement('span');
      title.textContent = definition.label;
      const output = document.createElement('output');
      output.className = 'control-output';
      output.textContent = definition.format(definition.value);
      row.append(title, output);

      const input = document.createElement('input');
      input.type = 'range';
      input.min = definition.min;
      input.max = definition.max;
      input.step = definition.step;
      input.value = definition.value;
      input.addEventListener('input', () => {
        const value = Number(input.value);
        output.textContent = definition.format(value);
        onChange(definition.key, value);
      });

      wrapper.append(row, input);
      controlsHost.append(wrapper);
    }
  }

  class OrbitForge {
    constructor() {
      this.settings = { gravity: 72, trails: 0.14, bodies: 36 };
      this.bodies = [];
      this.pointer = { x: width / 2, y: height / 2, down: false };
      this.randomise();
    }

    get meta() {
      return {
        kicker: 'GRAVITY TOY',
        title: 'Orbit Forge',
        description: 'Drop luminous bodies into a soft gravity field and watch them negotiate a future.',
        hint: 'Tap to add a body. Drag to bend gravity.',
        notes: 'Each particle is pulled toward the current gravity point. Trails are simply translucent frame history; the system is intentionally playful rather than physically exact.'
      };
    }

    controls() {
      return [
        { key: 'gravity', label: 'Gravity', min: 12, max: 160, step: 1, value: this.settings.gravity, format: value => `${value}` },
        { key: 'trails', label: 'Trail memory', min: 0.03, max: 0.42, step: 0.01, value: this.settings.trails, format: value => value.toFixed(2) },
        { key: 'bodies', label: 'Bodies on reset', min: 8, max: 100, step: 1, value: this.settings.bodies, format: value => `${value}` }
      ];
    }

    change(key, value) { this.settings[key] = value; }
    resize() { this.pointer.x = clamp(this.pointer.x, 0, width); this.pointer.y = clamp(this.pointer.y, 0, height); }

    addBody(x, y, speed = randomBetween(18, 80)) {
      const angle = Math.atan2(y - this.pointer.y, x - this.pointer.x) + Math.PI / 2;
      this.bodies.push({
        x,
        y,
        vx: Math.cos(angle) * speed + randomBetween(-12, 12),
        vy: Math.sin(angle) * speed + randomBetween(-12, 12),
        radius: randomBetween(1.2, 3.4),
        colour: palette[Math.floor(Math.random() * palette.length)]
      });
    }

    randomise() {
      this.bodies = [];
      this.pointer = { x: width / 2, y: height / 2, down: false };
      const count = Math.round(this.settings.bodies);
      const radius = Math.min(width, height) * 0.34;
      for (let i = 0; i < count; i += 1) {
        const angle = Math.random() * Math.PI * 2;
        const distance = randomBetween(radius * 0.25, radius);
        this.addBody(this.pointer.x + Math.cos(angle) * distance, this.pointer.y + Math.sin(angle) * distance, randomBetween(22, 86));
      }
    }

    clear() { this.bodies = []; }

    pointerDown(position) {
      this.pointer = { ...position, down: true };
      this.addBody(position.x, position.y, 34);
    }

    pointerMove(position) {
      if (this.pointer.down) Object.assign(this.pointer, position);
    }

    pointerUp() { this.pointer.down = false; }

    frame(delta) {
      ctx.fillStyle = `rgba(7, 9, 17, ${this.settings.trails})`;
      ctx.fillRect(0, 0, width, height);

      ctx.beginPath();
      ctx.arc(this.pointer.x, this.pointer.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#6ef2ff';
      ctx.shadowBlur = 18;
      ctx.fill();
      ctx.shadowBlur = 0;

      for (const body of this.bodies) {
        const dx = this.pointer.x - body.x;
        const dy = this.pointer.y - body.y;
        const distanceSquared = Math.max(90, dx * dx + dy * dy);
        const force = this.settings.gravity * 1200 / distanceSquared;
        const distance = Math.sqrt(distanceSquared);
        body.vx += (dx / distance) * force * delta;
        body.vy += (dy / distance) * force * delta;
        body.x += body.vx * delta;
        body.y += body.vy * delta;

        if (body.x < -40 || body.x > width + 40 || body.y < -40 || body.y > height + 40) {
          body.x = this.pointer.x + randomBetween(-100, 100);
          body.y = this.pointer.y + randomBetween(-100, 100);
          body.vx *= -0.55;
          body.vy *= -0.55;
        }

        ctx.beginPath();
        ctx.arc(body.x, body.y, body.radius, 0, Math.PI * 2);
        ctx.fillStyle = body.colour;
        ctx.shadowColor = body.colour;
        ctx.shadowBlur = 10;
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    }
  }

  class CellularBloom {
    constructor() {
      this.settings = { scale: 8, threshold: 2, tempo: 22 };
      this.accumulator = 0;
      this.grid = [];
      this.columns = 0;
      this.rows = 0;
      this.resize();
    }

    get meta() {
      return {
        kicker: 'CYCLIC AUTOMATON',
        title: 'Cellular Bloom',
        description: 'A field of tiny states chases its successor and unexpectedly grows petals, fronts and storms.',
        hint: 'Tap or drag to disturb the field.',
        notes: 'A cell advances when enough neighbours are exactly one colour-step ahead. There is no goal; the pleasure is watching order appear, collapse and appear again.'
      };
    }

    controls() {
      return [
        { key: 'scale', label: 'Cell size', min: 4, max: 16, step: 1, value: this.settings.scale, format: value => `${value}px` },
        { key: 'threshold', label: 'Neighbour threshold', min: 1, max: 5, step: 1, value: this.settings.threshold, format: value => `${value}` },
        { key: 'tempo', label: 'Tempo', min: 4, max: 60, step: 1, value: this.settings.tempo, format: value => `${value}/s` }
      ];
    }

    change(key, value) {
      this.settings[key] = value;
      if (key === 'scale') this.resize();
    }

    resize() {
      this.columns = Math.max(1, Math.ceil(width / this.settings.scale));
      this.rows = Math.max(1, Math.ceil(height / this.settings.scale));
      this.randomise();
    }

    randomise() {
      this.grid = Array.from({ length: this.columns * this.rows }, () => Math.floor(Math.random() * palette.length));
    }

    clear() { this.grid.fill(0); }

    disturb(position) {
      const cx = Math.floor(position.x / this.settings.scale);
      const cy = Math.floor(position.y / this.settings.scale);
      for (let oy = -4; oy <= 4; oy += 1) {
        for (let ox = -4; ox <= 4; ox += 1) {
          const x = (cx + ox + this.columns) % this.columns;
          const y = (cy + oy + this.rows) % this.rows;
          if (Math.hypot(ox, oy) < 4.5) this.grid[y * this.columns + x] = Math.floor(Math.random() * palette.length);
        }
      }
    }

    pointerDown(position) { this.dragging = true; this.disturb(position); }
    pointerMove(position) { if (this.dragging) this.disturb(position); }
    pointerUp() { this.dragging = false; }

    step() {
      const next = this.grid.slice();
      for (let y = 0; y < this.rows; y += 1) {
        for (let x = 0; x < this.columns; x += 1) {
          const index = y * this.columns + x;
          const target = (this.grid[index] + 1) % palette.length;
          let neighbours = 0;
          for (let oy = -1; oy <= 1; oy += 1) {
            for (let ox = -1; ox <= 1; ox += 1) {
              if (ox === 0 && oy === 0) continue;
              const nx = (x + ox + this.columns) % this.columns;
              const ny = (y + oy + this.rows) % this.rows;
              if (this.grid[ny * this.columns + nx] === target) neighbours += 1;
            }
          }
          if (neighbours >= this.settings.threshold) next[index] = target;
        }
      }
      this.grid = next;
    }

    frame(delta) {
      this.accumulator += delta;
      const interval = 1 / this.settings.tempo;
      while (this.accumulator >= interval) {
        this.step();
        this.accumulator -= interval;
      }

      const size = this.settings.scale;
      for (let y = 0; y < this.rows; y += 1) {
        for (let x = 0; x < this.columns; x += 1) {
          ctx.fillStyle = palette[this.grid[y * this.columns + x]];
          ctx.fillRect(x * size, y * size, size + 0.5, size + 0.5);
        }
      }
    }
  }

  class WaveLoom {
    constructor() {
      this.settings = { strands: 9, speed: 0.55, tension: 1.4 };
      this.time = 0;
      this.pointer = { x: width / 2, y: height / 2, down: false };
      this.seed = Math.random() * 1000;
    }

    get meta() {
      return {
        kicker: 'INTERFERENCE FIELD',
        title: 'Wave Loom',
        description: 'Layer simple waves until they weave a moving textile that almost looks intentional.',
        hint: 'Move across the canvas to pull the weave.',
        notes: 'Every strand is a sum of sine waves with slightly different phases. The pointer adds a local bend. Complexity here is repetition plus disagreement.'
      };
    }

    controls() {
      return [
        { key: 'strands', label: 'Strands', min: 3, max: 20, step: 1, value: this.settings.strands, format: value => `${value}` },
        { key: 'speed', label: 'Drift speed', min: 0.05, max: 1.5, step: 0.05, value: this.settings.speed, format: value => value.toFixed(2) },
        { key: 'tension', label: 'Tension', min: 0.4, max: 3.2, step: 0.1, value: this.settings.tension, format: value => value.toFixed(1) }
      ];
    }

    change(key, value) { this.settings[key] = value; }
    resize() { this.pointer.x = clamp(this.pointer.x, 0, width); this.pointer.y = clamp(this.pointer.y, 0, height); }
    randomise() { this.seed = Math.random() * 1000; this.time = 0; }
    clear() { this.time = 0; this.seed = 0; }
    pointerDown(position) { this.pointer = { ...position, down: true }; }
    pointerMove(position) { Object.assign(this.pointer, position); }
    pointerUp() { this.pointer.down = false; }

    frame(delta) {
      this.time += delta * this.settings.speed;
      ctx.fillStyle = '#070911';
      ctx.fillRect(0, 0, width, height);

      const strands = Math.round(this.settings.strands);
      const spacing = height / (strands + 1);
      const step = Math.max(3, width / 260);

      for (let strand = 0; strand < strands; strand += 1) {
        const baseY = spacing * (strand + 1);
        const colour = palette[strand % palette.length];
        ctx.beginPath();
        for (let x = -step; x <= width + step; x += step) {
          const phase = this.seed + strand * 0.78;
          const waveA = Math.sin(x * 0.012 * this.settings.tension + this.time * 2.1 + phase) * spacing * 0.28;
          const waveB = Math.sin(x * 0.027 - this.time * 1.35 + phase * 1.7) * spacing * 0.12;
          const distance = Math.hypot(x - this.pointer.x, baseY - this.pointer.y);
          const bend = Math.max(0, 150 - distance) / 150 * (this.pointer.y - baseY) * 0.42;
          const y = baseY + waveA + waveB + bend;
          if (x <= 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = colour;
        ctx.globalAlpha = 0.72;
        ctx.lineWidth = 1.5;
        ctx.shadowColor = colour;
        ctx.shadowBlur = 10;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    }
  }

  const labs = {
    orbit: () => new OrbitForge(),
    bloom: () => new CellularBloom(),
    waves: () => new WaveLoom()
  };

  function activateLab(name) {
    activeLab = labs[name]();
    const meta = activeLab.meta;
    labels.kicker.textContent = meta.kicker;
    labels.title.textContent = meta.title;
    labels.description.textContent = meta.description;
    labels.notes.textContent = meta.notes;
    hint.textContent = meta.hint;
    renderControls(activeLab.controls(), (key, value) => activeLab.change(key, value));
    tabs.forEach(tab => {
      const selected = tab.dataset.lab === name;
      tab.classList.toggle('is-active', selected);
      tab.setAttribute('aria-pressed', String(selected));
    });
    ctx.fillStyle = '#070911';
    ctx.fillRect(0, 0, width, height);
  }

  tabs.forEach(tab => tab.addEventListener('click', () => activateLab(tab.dataset.lab)));
  document.querySelector('#randomise').addEventListener('click', () => activeLab.randomise());
  document.querySelector('#clear').addEventListener('click', () => activeLab.clear());
  pauseButton.addEventListener('click', () => {
    paused = !paused;
    pauseButton.textContent = paused ? 'Resume' : 'Pause';
  });
  document.querySelector('#snapshot').addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = `curiosity-lab-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  });

  canvas.addEventListener('pointerdown', event => {
    canvas.setPointerCapture(event.pointerId);
    activeLab.pointerDown(pointerPosition(event));
  });
  canvas.addEventListener('pointermove', event => activeLab.pointerMove(pointerPosition(event)));
  canvas.addEventListener('pointerup', event => {
    activeLab.pointerUp(pointerPosition(event));
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointercancel', () => activeLab.pointerUp());

  const observer = new ResizeObserver(fitCanvas);
  observer.observe(canvas.parentElement);
  window.addEventListener('resize', fitCanvas, { passive: true });

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('./service-worker.js').catch(() => undefined);
  }

  function animate(now) {
    const delta = Math.min(0.04, (now - lastTime) / 1000);
    lastTime = now;
    if (!paused && activeLab) activeLab.frame(delta);
    requestAnimationFrame(animate);
  }

  fitCanvas();
  activateLab('orbit');
  requestAnimationFrame(animate);
})();
