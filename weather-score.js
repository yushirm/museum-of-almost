(() => {
  'use strict';

  const core = globalThis.MuseumWeatherScoreCore;
  if (!core) return;

  const SNAPSHOT_EVENT = 'museum:commons-snapshot';
  const loom = document.querySelector('.weather-loom-section');
  const loomReadout = loom?.querySelector('.weather-loom-readout');
  if (!loom || !loomReadout || document.querySelector('#weather-score-play')) return;

  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = './weather-score.css';
  stylesheet.dataset.weatherScoreStyles = 'true';
  document.head.append(stylesheet);

  const controls = document.createElement('div');
  controls.className = 'weather-score-loom';
  controls.innerHTML = `
    <div class="weather-score-loom-action">
      <button id="weather-score-play" type="button" disabled>Listen to this weave</button>
      <p id="weather-score-status" class="weather-score-status" role="status" aria-live="polite">Waiting for the thirteen fixed temperatures.</p>
    </div>
    <p class="weather-score-contract"><strong>Optional local audio.</strong> Temperature maps linearly from −100°C = 140 Hz to +70°C = 700 Hz in the same west-to-east thread order shown above; missing temperature is a silent rest. The weave is being encoded, not recorded: Earth is not singing, and no environmental sound or network audio is used.</p>`;
  loomReadout.insertAdjacentElement('afterend', controls);

  const ui = {
    status: controls.querySelector('#weather-score-status'),
    button: controls.querySelector('#weather-score-play')
  };

  let score = [];
  let audioContext = null;
  let activeNodes = [];
  let highlightTimers = [];
  let playbackToken = 0;

  ui.button.addEventListener('click', () => {
    if (ui.button.disabled) return;
    playScore().catch(() => {
      stopPlayback();
      ui.status.textContent = 'Audio playback is unavailable in this browser. The visual weave and exact station readings remain complete.';
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
    score = orderScoreToWeave(core.buildScore(snapshot));
    const summary = core.summarize(score);
    const hasAudio = 'AudioContext' in globalThis || 'webkitAudioContext' in globalThis;
    const playable = summary.measured > 0 && hasAudio;

    ui.button.disabled = !playable;
    ui.button.textContent = hasAudio ? 'Listen to this weave' : 'Audio unavailable';

    if (!summary.total) {
      ui.status.textContent = 'Waiting for the thirteen fixed temperatures.';
      return;
    }

    if (!summary.measured) {
      ui.status.textContent = `${summary.total} fixed threads are present, but none has a current temperature. The whole score is rest.`;
      return;
    }

    ui.status.textContent = `${summary.measured}/${summary.total} threads can sound; ${summary.rests} ${summary.rests === 1 ? 'thread is a silent rest' : 'threads are silent rests'}. Playback follows the same west-to-east weave shown above.`;
  }

  function orderScoreToWeave(entries) {
    const order = [...loom.querySelectorAll('.weather-loom-thread[data-station]')]
      .map((thread) => String(thread.dataset.station || ''));
    if (!order.length) return entries;
    const rank = new Map(order.map((id, index) => [id, index]));
    return [...entries].sort((a, b) => {
      const aRank = rank.has(String(a.id)) ? rank.get(String(a.id)) : Number.MAX_SAFE_INTEGER;
      const bRank = rank.has(String(b.id)) ? rank.get(String(b.id)) : Number.MAX_SAFE_INTEGER;
      return aRank - bRank;
    });
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
      const noteStart = start + index * step;
      const noteDuration = Math.min(step * 0.72, 0.14);
      scheduleThreadBeat(entry, index, token, noteDuration);

      if (entry.rest || !Number.isFinite(entry.frequency)) return;
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const noteEnd = noteStart + noteDuration;

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
    ui.button.textContent = 'Listening…';
    ui.status.textContent = `Reading the weave west to east: ${audible} sounding temperatures; missing temperatures remain silent rests.`;

    const duration = Math.max(score.length * core.POINT_DURATION_MS + 120, 120);
    highlightTimers.push(window.setTimeout(() => {
      if (token !== playbackToken) return;
      clearThreadBeats();
      activeNodes = [];
      ui.button.disabled = audible === 0;
      ui.button.textContent = 'Listen to this weave';
      const summary = core.summarize(score);
      ui.status.textContent = `Weave playback complete: ${summary.measured} sounding threads and ${summary.rests} ${summary.rests === 1 ? 'silent rest' : 'silent rests'}.`;
    }, duration));
  }

  function scheduleThreadBeat(entry, index, token, noteDuration) {
    const delay = 40 + index * core.POINT_DURATION_MS;
    const visibleDuration = Math.max(70, noteDuration * 1000);
    highlightTimers.push(window.setTimeout(() => {
      if (token !== playbackToken) return;
      clearThreadBeats();
      const thread = loom.querySelector(`.weather-loom-thread[data-station="${safeStationId(entry.id)}"]`);
      if (!thread) return;
      thread.dataset.sounding = 'true';
      thread.dataset.scoreRest = String(entry.rest);
      highlightTimers.push(window.setTimeout(() => {
        if (token !== playbackToken) return;
        thread.removeAttribute('data-sounding');
        thread.removeAttribute('data-score-rest');
      }, visibleDuration));
    }, delay));
  }

  function safeStationId(value) {
    return String(value).replace(/[^a-zA-Z0-9_-]/g, '');
  }

  function clearThreadBeats() {
    loom.querySelectorAll('.weather-loom-thread[data-sounding]').forEach((thread) => {
      thread.removeAttribute('data-sounding');
      thread.removeAttribute('data-score-rest');
    });
  }

  function stopPlayback() {
    playbackToken += 1;
    for (const timer of highlightTimers) window.clearTimeout(timer);
    highlightTimers = [];
    clearThreadBeats();
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