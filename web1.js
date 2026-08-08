'use strict';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js').catch(() => {});
}

const config = document.querySelector('meta[name="museum-guestbook-api"]');
const counter = document.getElementById('visitor-count');
const counterNote = document.getElementById('counter-note');
const form = document.getElementById('guestbook-form');
const submit = document.getElementById('guestbook-submit');
const status = document.getElementById('guestbook-status');
const list = document.getElementById('guestbook-list');

function configuredApiOrigin() {
  const value = config?.content?.trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.pathname !== '/' || url.search || url.hash) return null;
    return url.origin;
  } catch {
    return null;
  }
}

function endpoint(origin, path) {
  return `${origin}${path}`;
}

async function apiRequest(origin, path, options = {}) {
  const response = await fetch(endpoint(origin, path), {
    ...options,
    mode: 'cors',
    credentials: 'omit',
    cache: 'no-store',
    referrerPolicy: 'no-referrer',
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {})
    }
  });
  if (!response.ok) {
    const error = new Error(`guestbook request failed: ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return response.json();
}

function formatHits(value) {
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < 0) return '------';
  return String(number).padStart(6, '0');
}

function formatTimestamp(value) {
  const date = new Date(Number(value));
  if (!Number.isFinite(date.getTime())) return 'UNKNOWN TIME';
  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
    timeZoneName: 'short'
  }).format(date).toUpperCase();
}

function renderEntries(entries) {
  list.replaceChildren();
  if (!Array.isArray(entries) || entries.length === 0) {
    const item = document.createElement('li');
    item.className = 'guestbook-placeholder';
    item.textContent = 'NO SIGNATURES YET. THIS IS YOUR CHANCE TO BECOME INTERNET HISTORY.';
    list.append(item);
    return;
  }

  for (const entry of entries) {
    if (!entry || typeof entry.message !== 'string' || typeof entry.stamp !== 'string') continue;
    const item = document.createElement('li');
    const stamp = document.createElement('strong');
    const message = document.createElement('span');
    const time = document.createElement('time');

    stamp.className = 'guestbook-stamp';
    stamp.textContent = entry.stamp;
    message.className = 'guestbook-message';
    message.textContent = entry.message;
    time.className = 'guestbook-time';
    time.dateTime = new Date(Number(entry.createdAt)).toISOString();
    time.textContent = formatTimestamp(entry.createdAt);

    item.append(stamp, message, time);
    list.append(item);
  }
}

function setUnavailable() {
  counter.textContent = 'OFFLINE';
  counterNote.textContent = 'The static page still works; shared state needs its isolated API.';
  status.textContent = 'LIVE GUESTBOOK UNAVAILABLE. TRY AGAIN WHEN THE INTERNET IS FEELING BETTER.';
  submit.disabled = true;
  renderEntries([]);
}

async function loadSharedState(origin) {
  const [hitResult, stateResult] = await Promise.allSettled([
    apiRequest(origin, '/v1/hit', { method: 'POST' }),
    apiRequest(origin, '/v1/state')
  ]);

  if (stateResult.status !== 'fulfilled') throw stateResult.reason;
  const state = stateResult.value;
  const hits = hitResult.status === 'fulfilled' ? hitResult.value.hits : state.hits;

  counter.textContent = formatHits(hits);
  if (hitResult.status !== 'fulfilled') {
    counterNote.textContent = 'Shared count loaded; this page load was not added because the counter is busy.';
  }
  renderEntries(state.entries);
  status.textContent = 'GUESTBOOK ONLINE. CHOOSE YOUR MESSAGE AND LEAVE A TINY MARK.';
  submit.disabled = false;
}

async function sign(origin) {
  const data = new FormData(form);
  const message = data.get('message');
  const stamp = data.get('stamp');
  if (typeof message !== 'string' || typeof stamp !== 'string') return;

  submit.disabled = true;
  status.textContent = 'SIGNING…';

  try {
    const state = await apiRequest(origin, '/v1/sign', {
      method: 'POST',
      body: JSON.stringify({ message, stamp })
    });
    counter.textContent = formatHits(state.hits);
    renderEntries(state.entries);
    status.textContent = 'SIGNED!!! YOUR TINY MARK IS NOW ON THE SHARED WEB.';
  } catch (error) {
    status.textContent = error?.status === 429
      ? 'THE GUESTBOOK IS BUSY. GIVE THE MODEM A MOMENT AND TRY AGAIN.'
      : 'THE SIGNATURE DID NOT MAKE IT THROUGH. NOTHING WAS STORED.';
  } finally {
    submit.disabled = false;
  }
}

const apiOrigin = configuredApiOrigin();
if (!apiOrigin) {
  setUnavailable();
} else {
  submit.disabled = true;
  loadSharedState(apiOrigin).catch(setUnavailable);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    sign(apiOrigin);
  });
}
