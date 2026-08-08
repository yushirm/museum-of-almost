(() => {
  'use strict';

  const core = globalThis.MuseumWeatherScoreCore;
  if (!core) return;

  const SNAPSHOT_EVENT = 'museum:commons-snapshot';
  const ui = {
    section: document.querySelector('#weather-score'),
    list: document.querySelector('#weather-score-list'),
    status: document.querySelector('#weather-score-status'),
    button: document.querySelector('#weather-score-play')
  };

  if (!ui.section || !ui.list || !ui.status || !ui.button) return;

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
