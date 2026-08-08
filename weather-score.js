(() => {
  'use strict';

  const core = globalThis.MuseumWeatherScoreCore;
  if (!core) return;

  const SNAPSHOT_EVENT = 'museum:commons-snapshot';
  const anchor = document.querySelector('.windows-section');
  if (!anchor || document.querySelector('#weather-score')) return;

  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = './weather-score.css';
  stylesheet.dataset.weatherScoreStyles = 'true';
  document.head.append(stylesheet);

  const section = document.createElement('section');
  section.id = 'weather-score';
  section.className = 'weather-score-section';
  section.setAttribute('aria-labelledby', 'weather-score-title');
  section.innerHTML = `
    <div class="weather-score-shell">
      <div class="weather-score-copy">
        <p class="eyebrow">THE WEATHER SCORE · OPTIONAL LOCAL AUDIO</p>
        <h2 id="weather-score-title">Thirteen temperatures. Thirteen notes. No claim that Earth is singing.</h2>
        <p>The fixed weather windows already form a discrete sample. This score borrows one device from musical notation: a sequence can make differences perceptible in another sense. Each current temperature becomes one locally generated sine tone; a missing temperature becomes a rest.</p>
        <p class="weather-score-contract"><strong>Encoding contract:</strong> −100°C maps to 140 Hz and +70°C maps to 700 Hz, linearly and consistently across latches. The thirteen positions play in fixed Museum point order at equal beat spacing. Beat spacing is not geographic distance, pitch is not climate meaning, and the audio is not environmental sound.</p>
      </div>
      <div class="weather-score-console">
        <div class="weather-score-controls">
          <button id="weather-score-play" type="button" disabled>Play this latch</button>
          <p id="weather-score-status" class="weather-score-status" role="status" aria-live="polite">Waiting for the thirteen fixed weather points.</p>
        </div>
        <ol id="weather-score-list" class="weather-score-list" aria-label="Textual score for thirteen fixed temperature readings"></ol>
        <p class="weather-score-legend">The textual temperatures are authoritative. Audio is supplemental, starts only after a button press, uses the browser's local Web Audio engine, and makes no network request.</p>
      </div>
    </div>`;
  anchor.insertAdjacentElement('afterend', section);

  const ui = {
    list: section.querySelector('#weather-score-list'),
    status: section.querySelector('#weather-score-status'),
    button: section.querySelector('#weather-score-play')
  };

  let score = [];
  let audioContext = null;
  let activeNodes = [];
  let playbackToken = 0;

  ui.button.addEventListener('click', () => {
    if (ui.button.disabled) return;
    playScore().catch(() => {
      stopPlayback();
      ui.status.textContent = 'Audio playback is unavailable in this browser. The textual score remains complete below.';
      ui.button.disabled = true;
      ui.button.textContent = 'Audio unavailable';
    });
  });

  document.addEventListener(SNAPSHOT_EVENT, (event) => {
    stopPlayback();
    render(event?.detail?.snapshot || globalThis.MuseumCommonsSnapshot);
  });

  render(globalThis.MuseumCommonsSnapshot);

  function render(snapshot) {
    score = core.buildScore(snapshot);
    const summary = core.summarize(score);
    ui.list.replaceChildren();

    for (const entry of score) {
      const item = document.createElement('li');
      item.className = 'weather-score-note';
      item.dataset.rest = entry.rest ? 'true' : 'false';

      const point = document.createElement('strong');
      point.textContent = `POINT ${entry.id}`;

      const reading = document.createElement('span');
      reading.textContent = entry.rest
        ? 'REST · temperature unavailable'
        : `${entry.temperature.toFixed(1)}°C · ${entry.frequency.toFixed(1)} Hz`;

      item.append(point, reading);
      ui.list.append(item);
    }

    const hasAudio = 'AudioContext' in globalThis || 'webkitAudioContext' in globalThis;
    const playable = summary.measured > 0 && hasAudio;
    ui.button.disabled = !playable;
    ui.button.textContent = hasAudio ? 'Play this latch' : 'Audio unavailable';

    if (!summary.total) {
      ui.status.textContent = 'Waiting for the thirteen fixed weather points.';
      return;
    }

    if (!summary.measured) {
      ui.status.textContent = `${summary.total} fixed points are present, but none has a current temperature. Every position is a rest.`;
      return;
    }

    ui.status.textContent = `${summary.measured}/${summary.total} fixed points have temperature readings; ${summary.rests} ${summary.rests === 1 ? 'rest' : 'rests'}. The audio is a deterministic encoding of this latch, not environmental sound.`;
  }

  async function playScore() {
    stopPlayback();
    const AudioContextCtor = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AudioContextCtor) throw new Error('Web Audio unavailable');

    if (!audioContext || audioContext.state === 'closed') {
      audioContext = new AudioContextCtor();
    }
    if (audioContext.state === 'suspended') await audioContext.resume();

    const token = ++playbackToken;
    const start = audioContext.currentTime + 0.04;
    const step = core.POINT_DURATION_MS / 1000;
    const audible = score.filter((entry) => !entry.rest).length;

    score.forEach((entry, index) => {
      if (entry.rest || !Number.isFinite(entry.frequency)) return;
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const noteStart = start + index * step;
      const noteEnd = noteStart + Math.min(step * 0.72, 0.14);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(entry.frequency, noteStart);
      gain.gain.setValueAtTime(0.0001, noteStart);
      gain.gain.exponentialRampToValueAtTime(0.035, noteStart + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteEnd);

      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start(noteStart);
      oscillator.stop(noteEnd + 0.02);
      activeNodes.push(oscillator, gain);
    });

    ui.button.disabled = true;
    ui.button.textContent = 'Playing latch…';
    ui.status.textContent = `Playing ${audible} measured temperatures in fixed point order; missing temperatures remain silent rests.`;

    const duration = Math.max(score.length * core.POINT_DURATION_MS + 120, 120);
    window.setTimeout(() => {
      if (token !== playbackToken) return;
      activeNodes = [];
      ui.button.disabled = audible === 0;
      ui.button.textContent = 'Play this latch';
      const summary = core.summarize(score);
      ui.status.textContent = `Playback complete: ${summary.measured} measured temperatures and ${summary.rests} ${summary.rests === 1 ? 'rest' : 'rests'}.`;
    }, duration);
  }

  function stopPlayback() {
    playbackToken += 1;
    for (const node of activeNodes) {
      try {
        if (typeof node.stop === 'function') node.stop();
        if (typeof node.disconnect === 'function') node.disconnect();
      } catch (_) {
        // Nodes may already have ended. Silence is the safe fallback.
      }
    }
    activeNodes = [];
  }
})();
