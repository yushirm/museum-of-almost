(() => {
  'use strict';

  const MUSEUM_STORAGE_KEY = 'museum-of-almost:v1';
  const HISTORY_STORAGE_KEY = 'museum-of-almost:corridor:v1';
  const NAME_STORAGE_KEY = 'museum-of-almost:almost-name:v1';
  const NIGHT_STORAGE_KEY = 'museum-of-almost:night-watch:v1';
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const core = globalThis.MuseumAfterDarkCore;
  const headerActions = document.querySelector('.header-actions');
  const catalogueButton = document.querySelector('#catalogue-button');
  const fragmentCount = document.querySelector('#fragment-count');
  const roomTitle = document.querySelector('#room-title');
  const roomNumber = document.querySelector('#room-number');
  const liveRegion = document.querySelector('#live-region');

  if (!core || !headerActions || !catalogueButton || !roomTitle || !roomNumber) return;

  let expansion = null;
  let activePanel = 'map';
  let activePermissionIndex = 0;
  let history = readHistory();
  let pinnedNameIndex = null;
  let nightWatchEnabled = readNightWatch();

  injectStyles();
  const mapButton = createMapButton();
  const dialog = createDialog();
  const navButtons = [...dialog.querySelectorAll('[data-after-dark-panel]')];
  const panels = [...dialog.querySelectorAll('.after-dark-panel')];
  const mapGrid = dialog.querySelector('#after-dark-map-grid');
  const namesGrid = dialog.querySelector('#almost-name-grid');
  const nameStatus = dialog.querySelector('#almost-name-status');
  const weatherHeadline = dialog.querySelector('#interior-weather-headline');
  const weatherMeta = dialog.querySelector('#interior-weather-meta');
  const weatherEcho = dialog.querySelector('#interior-weather-echo');
  const weatherGrid = dialog.querySelector('#interior-weather-grid');
  const postcardGrid = dialog.querySelector('#unsent-postcard-grid');
  const corridorList = dialog.querySelector('#remembered-corridor-list');
  const corridorEmpty = dialog.querySelector('#remembered-corridor-empty');
  const forgetCorridorButton = dialog.querySelector('#forget-corridor');
  const permissionStamp = dialog.querySelector('#permission-stamp');
  const permissionText = dialog.querySelector('#permission-text');
  const permissionFootnote = dialog.querySelector('#permission-footnote');
  const permissionDots = dialog.querySelector('#permission-dots');
  const previousPermissionButton = dialog.querySelector('#permission-previous');
  const nextPermissionButton = dialog.querySelector('#permission-next');
  const nightToggle = dialog.querySelector('#night-watch-toggle');
  const nightStatus = dialog.querySelector('#night-watch-status');

  applyNightWatch();
  rememberCurrentRoom();
  refreshExpansion();
  openPanel('map', false);

  mapButton.addEventListener('click', () => {
    refreshExpansion();
    openPanel('map', false);
    openDialog(dialog);
  });

  navButtons.forEach((button, index) => {
    button.addEventListener('click', () => openPanel(button.dataset.afterDarkPanel, false));
    button.addEventListener('keydown', (event) => {
      if (!['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let nextIndex = index;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') nextIndex = (index + 1) % navButtons.length;
      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') nextIndex = (index + navButtons.length - 1) % navButtons.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = navButtons.length - 1;
      navButtons[nextIndex].focus();
      openPanel(navButtons[nextIndex].dataset.afterDarkPanel, false);
    });
  });

  dialog.addEventListener('click', (event) => {
    const destination = event.target.closest('[data-map-destination]');
    if (destination) {
      const panel = destination.dataset.mapDestination;
      openPanel(panel, true);
      return;
    }

    const existing = event.target.closest('[data-existing-destination]');
    if (existing) openExistingDestination(existing.dataset.existingDestination);

    const nameCard = event.target.closest('[data-name-index]');
    if (nameCard) pinName(Number(nameCard.dataset.nameIndex));

    const postcardButton = event.target.closest('[data-postcard-index]');
    if (postcardButton) saveArchivePostcard(Number(postcardButton.dataset.postcardIndex));

    const permissionDot = event.target.closest('[data-permission-index]');
    if (permissionDot) showPermission(Number(permissionDot.dataset.permissionIndex), false);
  });

  previousPermissionButton.addEventListener('click', () => showPermission(activePermissionIndex - 1, false));
  nextPermissionButton.addEventListener('click', () => showPermission(activePermissionIndex + 1, false));
  forgetCorridorButton.addEventListener('click', forgetCorridor);
  nightToggle.addEventListener('click', toggleNightWatch);

  const titleObserver = new MutationObserver(() => rememberCurrentRoom());
  titleObserver.observe(roomTitle, { childList: true, characterData: true, subtree: true });
  titleObserver.observe(roomNumber, { childList: true, characterData: true, subtree: true });

  if (fragmentCount) {
    const fragmentObserver = new MutationObserver(() => {
      if (dialog.hasAttribute('open')) refreshExpansion();
    });
    fragmentObserver.observe(fragmentCount, { childList: true, characterData: true, subtree: true });
  }

  window.addEventListener('storage', (event) => {
    if (event.key === HISTORY_STORAGE_KEY) history = readHistory();
    if (event.key === NIGHT_STORAGE_KEY) {
      nightWatchEnabled = readNightWatch();
      applyNightWatch();
    }
    if (dialog.hasAttribute('open')) refreshExpansion();
  });

  function injectStyles() {
    const style = document.createElement('style');
    style.dataset.museumAfterDark = '';
    style.textContent = `
      .map-button > span:first-child { color: #dfc8ff; }

      body.night-watch-enabled {
        background: #08090d;
      }

      body.night-watch-enabled .page-noise { opacity: 0.08; }
      body.night-watch-enabled .site-header,
      body.night-watch-enabled .room-card,
      body.night-watch-enabled .rules-card {
        filter: saturate(0.72) brightness(0.84);
      }
      body.night-watch-enabled .stage-vignette {
        box-shadow: inset 0 0 8rem 2rem rgba(0, 0, 0, 0.75);
      }
      body.night-watch-enabled .museum-status::before {
        content: "NIGHT WATCH · ";
        color: #bca5e8;
      }

      .after-dark-dialog {
        width: min(1040px, calc(100% - 1.2rem));
        max-width: none;
      }
      .after-dark-dialog::backdrop {
        background: rgba(4, 5, 10, 0.92);
        backdrop-filter: blur(14px);
      }
      .after-dark-frame {
        width: 100%;
        max-height: min(94vh, 940px);
        overflow: auto;
        background:
          radial-gradient(circle at 14% 4%, rgba(173, 135, 220, 0.18), transparent 28rem),
          radial-gradient(circle at 88% 34%, rgba(85, 137, 151, 0.14), transparent 32rem),
          #0d0e15;
      }
      .after-dark-kicker { color: #d9c1ff; }
      .after-dark-intro {
        max-width: 53rem;
        margin-bottom: 1.2rem;
        color: var(--muted);
        font-family: Georgia, "Times New Roman", serif;
        font-size: clamp(1rem, 2.2vw, 1.22rem);
        line-height: 1.58;
      }
      .after-dark-layout {
        display: grid;
        grid-template-columns: minmax(11rem, 0.27fr) minmax(0, 1fr);
        gap: 1rem;
      }
      .after-dark-nav {
        display: grid;
        align-content: start;
        gap: 0.42rem;
        padding: 0.6rem;
        border: 1px solid rgba(217, 193, 255, 0.15);
        border-radius: 1rem;
        background: rgba(255, 255, 255, 0.02);
      }
      .after-dark-nav button {
        display: grid;
        grid-template-columns: 1.6rem minmax(0, 1fr);
        align-items: center;
        gap: 0.55rem;
        width: 100%;
        padding: 0.65rem 0.7rem;
        color: #b9b6c2;
        text-align: left;
        border: 1px solid transparent;
        border-radius: 0.7rem;
        background: transparent;
        cursor: pointer;
      }
      .after-dark-nav button:hover,
      .after-dark-nav button:focus-visible,
      .after-dark-nav button[aria-selected="true"] {
        color: #f1e9fb;
        border-color: rgba(217, 193, 255, 0.28);
        background: rgba(217, 193, 255, 0.065);
      }
      .after-dark-nav button:focus-visible {
        outline: 2px solid #d9c1ff;
        outline-offset: 2px;
      }
      .after-dark-panel {
        min-width: 0;
        padding: 1rem;
        border: 1px solid rgba(217, 193, 255, 0.13);
        border-radius: 1rem;
        background: rgba(255, 255, 255, 0.018);
      }
      .after-dark-panel[hidden] { display: none; }
      .after-dark-panel h3 {
        margin: 0.15rem 0 0.55rem;
        font-family: Georgia, "Times New Roman", serif;
        font-size: clamp(1.45rem, 3vw, 2.25rem);
        font-weight: 400;
      }
      .after-dark-panel-intro {
        max-width: 45rem;
        margin: 0 0 1rem;
        color: var(--muted);
        line-height: 1.55;
      }

      .after-dark-map-grid,
      .almost-name-grid,
      .interior-weather-grid,
      .unsent-postcard-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.72rem;
      }
      .after-dark-map-card,
      .almost-name-card,
      .interior-weather-card,
      .permission-card {
        padding: 0.9rem;
        border: 1px solid rgba(217, 193, 255, 0.15);
        border-radius: 0.85rem;
        background: rgba(255, 255, 255, 0.025);
      }
      .after-dark-map-card {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr);
        gap: 0.75rem;
        align-items: start;
      }
      .after-dark-map-icon {
        display: grid;
        width: 2.55rem;
        aspect-ratio: 1;
        place-items: center;
        color: #d9c1ff;
        border: 1px solid rgba(217, 193, 255, 0.25);
        border-radius: 50%;
        background: rgba(217, 193, 255, 0.06);
      }
      .after-dark-map-card h4,
      .almost-name-card h4,
      .unsent-postcard-card h4 {
        margin: 0 0 0.3rem;
        font-family: Georgia, "Times New Roman", serif;
        font-size: 1.05rem;
        font-weight: 400;
      }
      .after-dark-map-card p,
      .almost-name-card p,
      .interior-weather-card p {
        margin: 0;
        color: #b9b6c2;
        font-size: 0.82rem;
        line-height: 1.48;
      }
      .after-dark-map-card button {
        margin-top: 0.65rem;
      }
      .after-dark-map-status {
        display: block;
        margin-top: 0.42rem;
        color: #9ed7cf;
        font-size: 0.68rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .after-dark-known-wings {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid rgba(217, 193, 255, 0.12);
      }

      .almost-name-card {
        display: grid;
        align-content: start;
        gap: 0.42rem;
        text-align: left;
        cursor: pointer;
        transition: transform 160ms ease, border-color 160ms ease;
      }
      .almost-name-card:hover,
      .almost-name-card:focus-visible,
      .almost-name-card[aria-pressed="true"] {
        border-color: rgba(217, 193, 255, 0.55);
        transform: translateY(-2px);
      }
      .almost-name-card:focus-visible {
        outline: 2px solid #d9c1ff;
        outline-offset: 2px;
      }
      .almost-name-accession,
      .interior-weather-time,
      .permission-stamp {
        color: #d9c1ff;
        font-size: 0.62rem;
        font-weight: 800;
        letter-spacing: 0.14em;
      }
      .almost-name-echo { color: #c7b8d5 !important; font-family: Georgia, "Times New Roman", serif; }
      .almost-name-status {
        margin: 0 0 0.8rem;
        color: #9ed7cf;
        font-size: 0.78rem;
      }

      .interior-weather-summary {
        display: grid;
        grid-template-columns: minmax(0, 1.25fr) minmax(13rem, 0.75fr);
        gap: 0.8rem;
        margin-bottom: 0.8rem;
        padding: 0.9rem 1rem;
        border-left: 2px solid #9ed7cf;
        background: rgba(158, 215, 207, 0.045);
      }
      .interior-weather-summary blockquote {
        margin: 0;
        color: #eee8df;
        font-family: Georgia, "Times New Roman", serif;
        font-size: clamp(1.05rem, 2.4vw, 1.35rem);
        line-height: 1.45;
      }
      .interior-weather-summary p {
        margin: 0;
        color: #b9c9c6;
        font-size: 0.8rem;
        line-height: 1.5;
      }
      .interior-weather-card strong {
        display: block;
        margin: 0.25rem 0 0.4rem;
        color: #eee8df;
        font-family: Georgia, "Times New Roman", serif;
        font-weight: 400;
      }
      .interior-weather-reading {
        display: flex;
        justify-content: space-between;
        gap: 0.6rem;
        margin-top: 0.65rem;
        color: #9ed7cf;
        font-size: 0.72rem;
      }

      .unsent-postcard-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      .unsent-postcard-card {
        overflow: hidden;
        border: 1px solid rgba(217, 193, 255, 0.16);
        border-radius: 0.85rem;
        background: rgba(255, 255, 255, 0.025);
      }
      .unsent-postcard-image {
        position: relative;
        display: block;
        aspect-ratio: 4 / 3;
        overflow: hidden;
        background: #090a10;
      }
      .unsent-postcard-image::after {
        position: absolute;
        inset: 0;
        content: "";
        pointer-events: none;
        background: linear-gradient(145deg, rgba(217, 193, 255, 0.15), transparent 40%), linear-gradient(0deg, rgba(5, 6, 10, 0.62), transparent 55%);
      }
      .unsent-postcard-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        filter: saturate(0.68) contrast(1.08) brightness(0.82);
      }
      .unsent-postcard-copy { padding: 0.8rem; }
      .unsent-postcard-copy p {
        margin: 0.3rem 0 0;
        color: #b9b6c2;
        font-size: 0.78rem;
        line-height: 1.45;
      }
      .unsent-postcard-copy button { margin-top: 0.7rem; width: 100%; justify-content: center; }

      .remembered-corridor-list {
        display: grid;
        gap: 0.55rem;
        margin: 0;
        padding: 0;
        list-style: none;
        counter-reset: corridor;
      }
      .remembered-corridor-list li {
        display: grid;
        grid-template-columns: 2.5rem minmax(0, 1fr);
        gap: 0.75rem;
        padding: 0.78rem 0.85rem;
        border-left: 1px solid rgba(217, 193, 255, 0.35);
        background: linear-gradient(90deg, rgba(217, 193, 255, 0.055), transparent);
      }
      .remembered-corridor-number {
        color: #d9c1ff;
        font-size: 0.66rem;
        font-weight: 800;
        letter-spacing: 0.12em;
      }
      .remembered-corridor-list strong {
        display: block;
        color: #eee8f3;
        font-family: Georgia, "Times New Roman", serif;
        font-weight: 400;
      }
      .remembered-corridor-list small,
      .remembered-corridor-list p {
        color: #aaa7b1;
        font-size: 0.75rem;
      }
      .remembered-corridor-list p { margin: 0.28rem 0 0; line-height: 1.42; }
      .remembered-corridor-empty { color: var(--muted); font-family: Georgia, "Times New Roman", serif; }
      .corridor-actions { display: flex; justify-content: flex-end; margin-top: 0.8rem; }

      .permission-card {
        position: relative;
        min-height: 13rem;
        display: grid;
        align-content: center;
        gap: 0.75rem;
        overflow: hidden;
        padding: clamp(1.3rem, 4vw, 2.6rem);
        text-align: center;
        background:
          radial-gradient(circle at 50% 15%, rgba(217, 193, 255, 0.12), transparent 44%),
          rgba(255, 255, 255, 0.02);
      }
      .permission-card::before,
      .permission-card::after {
        position: absolute;
        width: 6rem;
        aspect-ratio: 1;
        border: 1px solid rgba(217, 193, 255, 0.16);
        border-radius: 50%;
        content: "";
      }
      .permission-card::before { left: -3rem; top: -3rem; }
      .permission-card::after { right: -3rem; bottom: -3rem; }
      .permission-text {
        margin: 0;
        color: #f1e9fb;
        font-family: Georgia, "Times New Roman", serif;
        font-size: clamp(1.35rem, 3.4vw, 2.2rem);
        line-height: 1.25;
      }
      .permission-footnote { margin: 0; color: #aaa7b1; font-size: 0.8rem; }
      .permission-controls {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) auto;
        align-items: center;
        gap: 0.65rem;
        margin-top: 0.75rem;
      }
      .permission-dots { display: flex; justify-content: center; gap: 0.35rem; }
      .permission-dot {
        width: 0.72rem;
        height: 0.72rem;
        padding: 0;
        border: 1px solid rgba(217, 193, 255, 0.48);
        border-radius: 50%;
        background: transparent;
        cursor: pointer;
      }
      .permission-dot[aria-pressed="true"] { background: #d9c1ff; }
      .permission-dot:focus-visible { outline: 2px solid #d9c1ff; outline-offset: 3px; }

      .night-watch-console {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: center;
        gap: 1rem;
        min-height: 12rem;
        padding: clamp(1rem, 4vw, 2rem);
        border: 1px solid rgba(158, 215, 207, 0.18);
        border-radius: 1rem;
        background:
          radial-gradient(circle at 12% 10%, rgba(158, 215, 207, 0.11), transparent 38%),
          linear-gradient(135deg, #0b0d14, #11101a);
      }
      .night-watch-console h4 {
        margin: 0 0 0.45rem;
        color: #eee8f3;
        font-family: Georgia, "Times New Roman", serif;
        font-size: clamp(1.2rem, 2.8vw, 1.8rem);
        font-weight: 400;
      }
      .night-watch-console p { margin: 0; color: #aaa7b1; line-height: 1.52; }
      .night-watch-toggle {
        min-width: 10rem;
        justify-content: center;
      }
      .night-watch-status { margin-top: 0.65rem !important; color: #9ed7cf !important; font-size: 0.78rem; }

      @media (max-width: 820px) {
        .after-dark-layout { grid-template-columns: 1fr; }
        .after-dark-nav { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        .after-dark-nav button { grid-template-columns: 1fr; justify-items: center; text-align: center; font-size: 0.7rem; }
        .unsent-postcard-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      }
      @media (max-width: 620px) {
        .after-dark-nav { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .after-dark-map-grid,
        .almost-name-grid,
        .interior-weather-grid,
        .unsent-postcard-grid,
        .interior-weather-summary,
        .night-watch-console { grid-template-columns: 1fr; }
        .permission-controls { grid-template-columns: 1fr; }
        .permission-controls button { justify-content: center; }
      }
      @media (prefers-reduced-motion: reduce) {
        .almost-name-card { transition: none; }
        .almost-name-card:hover,
        .almost-name-card:focus-visible,
        .almost-name-card[aria-pressed="true"] { transform: none; }
        .after-dark-dialog *,
        .map-button { scroll-behavior: auto !important; transition-duration: 0.001ms !important; }
      }
    `;
    document.head.append(style);
  }

  function createMapButton() {
    const button = document.createElement('button');
    button.type = 'button';
    button.id = 'museum-map-button';
    button.className = 'quiet-button map-button';
    button.setAttribute('aria-haspopup', 'dialog');
    button.setAttribute('aria-controls', 'after-dark-dialog');
    button.title = 'Open The Unfinished Map';
    button.innerHTML = `
      <span aria-hidden="true">⌖</span>
      <span class="button-copy">Map</span>
    `;
    headerActions.insertBefore(button, catalogueButton);
    return button;
  }

  function createDialog() {
    const element = document.createElement('dialog');
    element.id = 'after-dark-dialog';
    element.className = 'museum-dialog after-dark-dialog';
    element.setAttribute('aria-labelledby', 'after-dark-title');
    element.innerHTML = `
      <form method="dialog" class="dialog-frame after-dark-frame">
        <button class="dialog-close" value="close" aria-label="Close The Unfinished Map">×</button>
        <p class="eyebrow after-dark-kicker">THE MUSEUM AFTER DARK · SEVEN LOCAL EXPERIENCES</p>
        <h2 id="after-dark-title">The Unfinished Map</h2>
        <p class="after-dark-intro">
          The night staff drew a floor plan after the building stopped agreeing with architecture.
          Choose a room. Everything here is generated locally from fictional Museum state.
        </p>
        <div class="after-dark-layout">
          <nav class="after-dark-nav" aria-label="Museum After Dark rooms" role="tablist" aria-orientation="vertical">
            <button type="button" role="tab" data-after-dark-panel="map"><span aria-hidden="true">⌖</span><span>Map</span></button>
            <button type="button" role="tab" data-after-dark-panel="names"><span aria-hidden="true">◇</span><span>Names</span></button>
            <button type="button" role="tab" data-after-dark-panel="weather"><span aria-hidden="true">☁</span><span>Weather</span></button>
            <button type="button" role="tab" data-after-dark-panel="postcards"><span aria-hidden="true">▱</span><span>Postcards</span></button>
            <button type="button" role="tab" data-after-dark-panel="corridor"><span aria-hidden="true">⋯</span><span>Corridor</span></button>
            <button type="button" role="tab" data-after-dark-panel="permissions"><span aria-hidden="true">✓</span><span>Permissions</span></button>
            <button type="button" role="tab" data-after-dark-panel="night"><span aria-hidden="true">◐</span><span>Night Watch</span></button>
          </nav>
          <div class="after-dark-panels">
            <section class="after-dark-panel" id="after-dark-panel-map" role="tabpanel" tabindex="0">
              <p class="eyebrow after-dark-kicker">FLOOR PLAN · ACCURACY OPTIONAL</p>
              <h3>The Museum has more rooms than walls.</h3>
              <p class="after-dark-panel-intro">The map connects the galleries, the known wings, and six rooms maintained by the night staff.</p>
              <div class="after-dark-map-grid" id="after-dark-map-grid"></div>
              <div class="after-dark-known-wings" aria-label="Existing Museum wings">
                <button type="button" class="text-button" data-existing-destination="#tomorrow-button">◒ Almost Tomorrow</button>
                <button type="button" class="text-button" data-existing-destination="#signal-button">⌁ Listening Room</button>
                <button type="button" class="text-button" data-existing-destination=".dream-button">◇ Dreaming Wing</button>
                <button type="button" class="text-button" data-existing-destination="#catalogue-button">▤ Pocket Catalogue</button>
              </div>
            </section>

            <section class="after-dark-panel" id="after-dark-panel-names" role="tabpanel" tabindex="0" hidden>
              <p class="eyebrow after-dark-kicker">CABINET 09 · TITLES SEEKING OBJECTS</p>
              <h3>The Cabinet of Almost Names</h3>
              <p class="after-dark-panel-intro">Nine names are generated each local day. Pin one to this date, or leave all of them available for future rooms.</p>
              <p class="almost-name-status" id="almost-name-status"></p>
              <div class="almost-name-grid" id="almost-name-grid"></div>
            </section>

            <section class="after-dark-panel" id="after-dark-panel-weather" role="tabpanel" tabindex="0" hidden>
              <p class="eyebrow after-dark-kicker">BUREAU 04 · CONDITIONS OCCURRING INDOORS</p>
              <h3>The Bureau of Interior Weather</h3>
              <p class="after-dark-panel-intro">A forecast for the atmosphere around unfinished plans. It is not a measurement of the visitor.</p>
              <div class="interior-weather-summary">
                <blockquote id="interior-weather-headline"></blockquote>
                <p id="interior-weather-meta"></p>
              </div>
              <p class="after-dark-panel-intro" id="interior-weather-echo"></p>
              <div class="interior-weather-grid" id="interior-weather-grid"></div>
            </section>

            <section class="after-dark-panel" id="after-dark-panel-postcards" role="tabpanel" tabindex="0" hidden>
              <p class="eyebrow after-dark-kicker">ARCHIVE 06 · CORRESPONDENCE NEVER REQUIRED TO ARRIVE</p>
              <h3>The Archive of Unsent Postcards</h3>
              <p class="after-dark-panel-intro">Six local compositions remix the Museum’s three public-domain photographs. Saving a card creates a PNG entirely in the browser.</p>
              <div class="unsent-postcard-grid" id="unsent-postcard-grid"></div>
            </section>

            <section class="after-dark-panel" id="after-dark-panel-corridor" role="tabpanel" tabindex="0" hidden>
              <p class="eyebrow after-dark-kicker">CORRIDOR 08 · RECENT ROOMS ONLY</p>
              <h3>The Corridor That Remembers</h3>
              <p class="after-dark-panel-intro">The last eight fictional gallery titles seen in this browser. No timestamps, routes, or visitor identity are kept.</p>
              <ol class="remembered-corridor-list" id="remembered-corridor-list"></ol>
              <p class="remembered-corridor-empty" id="remembered-corridor-empty">The corridor is empty. It is practising.</p>
              <div class="corridor-actions"><button type="button" class="text-button danger-button" id="forget-corridor">Let the corridor forget</button></div>
            </section>

            <section class="after-dark-panel" id="after-dark-panel-permissions" role="tabpanel" tabindex="0" hidden>
              <p class="eyebrow after-dark-kicker">CABINET 07 · AUTHORISATIONS WITHOUT BUREAUCRACY</p>
              <h3>The Cabinet of Small Permissions</h3>
              <p class="after-dark-panel-intro">Seven permissions are issued each local day. None require acceptance, productivity, or proof.</p>
              <div class="permission-card">
                <span class="permission-stamp" id="permission-stamp"></span>
                <blockquote class="permission-text" id="permission-text"></blockquote>
                <p class="permission-footnote" id="permission-footnote"></p>
              </div>
              <div class="permission-controls">
                <button type="button" class="text-button" id="permission-previous">← Previous permission</button>
                <div class="permission-dots" id="permission-dots" role="group" aria-label="Seven daily permissions"></div>
                <button type="button" class="primary-button" id="permission-next">Another permission →</button>
              </div>
            </section>

            <section class="after-dark-panel" id="after-dark-panel-night" role="tabpanel" tabindex="0" hidden>
              <p class="eyebrow after-dark-kicker">NIGHT DESK · LIGHTS LOWERED BY REQUEST</p>
              <h3>The Night Watch</h3>
              <p class="after-dark-panel-intro">A persistent local display mode that dims and quiets the galleries. It does not replace the browser’s reduced-motion preference.</p>
              <div class="night-watch-console">
                <div>
                  <h4>The building can keep watch for you.</h4>
                  <p>Night Watch lowers saturation, softens the galleries, and leaves one discreet status mark. The setting stays only in this browser.</p>
                  <p class="night-watch-status" id="night-watch-status"></p>
                </div>
                <button type="button" class="primary-button night-watch-toggle" id="night-watch-toggle" aria-pressed="false">Begin Night Watch</button>
              </div>
            </section>
          </div>
        </div>
        <menu><button class="primary-button" value="close">Return to the current room</button></menu>
      </form>
    `;
    document.body.append(element);
    return element;
  }

  function openDialog(element) {
    if (typeof element.showModal === 'function') element.showModal();
    else element.setAttribute('open', '');
  }

  function readMuseumState() {
    try {
      return JSON.parse(localStorage.getItem(MUSEUM_STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  }

  function readHistory() {
    try {
      return core.normalizeHistory(JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY)) || []);
    } catch {
      return [];
    }
  }

  function writeHistory(nextHistory) {
    history = core.normalizeHistory(nextHistory);
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch {
      // The remembered corridor is optional and remains in memory when storage is unavailable.
    }
  }

  function readPinnedName(dateKey) {
    try {
      const stored = JSON.parse(localStorage.getItem(NAME_STORAGE_KEY));
      if (!stored || stored.dateKey !== dateKey || !Number.isInteger(stored.index) || stored.index < 0 || stored.index > 8) {
        if (stored) localStorage.removeItem(NAME_STORAGE_KEY);
        return null;
      }
      return stored.index;
    } catch {
      return null;
    }
  }

  function readNightWatch() {
    try {
      return JSON.parse(localStorage.getItem(NIGHT_STORAGE_KEY)) === true;
    } catch {
      return false;
    }
  }

  function refreshExpansion() {
    history = readHistory();
    expansion = core.buildExpansion(new Date(), readMuseumState(), history);
    pinnedNameIndex = readPinnedName(expansion.dateKey);
    renderMap();
    renderNames();
    renderWeather();
    renderPostcards();
    renderCorridor();
    activePermissionIndex = Math.min(activePermissionIndex, expansion.permissions.permissions.length - 1);
    if (!Number.isInteger(activePermissionIndex) || activePermissionIndex < 0) activePermissionIndex = expansion.permissions.featuredIndex;
    renderPermissionDots();
    showPermission(activePermissionIndex, false);
    renderNightWatch();
  }

  function openPanel(panelName, focusPanel) {
    const known = panels.some((panel) => panel.id === `after-dark-panel-${panelName}`);
    activePanel = known ? panelName : 'map';
    navButtons.forEach((button) => {
      const selected = button.dataset.afterDarkPanel === activePanel;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
    panels.forEach((panel) => {
      const selected = panel.id === `after-dark-panel-${activePanel}`;
      panel.hidden = !selected;
    });
    if (activePanel === 'corridor') renderCorridor();
    if (activePanel === 'night') renderNightWatch();
    if (focusPanel) dialog.querySelector(`#after-dark-panel-${activePanel}`)?.focus();
  }

  function renderMap() {
    const cards = [
      ['names', '◇', 'Cabinet of Almost Names', 'Nine daily titles looking for the right unfinished object.', pinnedNameIndex === null ? 'No name pinned' : `Name ${pinnedNameIndex + 1} pinned`],
      ['weather', '☁', 'Bureau of Interior Weather', 'Four forecasts for the atmosphere around unfinished plans.', 'Forecast generated locally'],
      ['postcards', '▱', 'Archive of Unsent Postcards', 'Six compositions made from the Museum’s local photographs.', 'Six cards available'],
      ['corridor', '⋯', 'The Corridor That Remembers', 'A bounded record of the last eight fictional gallery titles.', `${expansion.corridor.length} room${expansion.corridor.length === 1 ? '' : 's'} remembered`],
      ['permissions', '✓', 'Cabinet of Small Permissions', 'Seven gentle authorisations issued without paperwork.', 'Seven permissions issued'],
      ['night', '◐', 'The Night Watch', 'A quiet local display mode for galleries after dark.', nightWatchEnabled ? 'Night Watch active' : 'Night Watch sleeping']
    ];
    mapGrid.innerHTML = cards.map(([panel, icon, title, copy, status]) => `
      <article class="after-dark-map-card">
        <span class="after-dark-map-icon" aria-hidden="true">${icon}</span>
        <div>
          <h4>${title}</h4>
          <p>${copy}</p>
          <span class="after-dark-map-status">${status}</span>
          <button type="button" class="text-button" data-map-destination="${panel}">Enter room →</button>
        </div>
      </article>
    `).join('');
  }

  function openExistingDestination(selector) {
    const destination = document.querySelector(selector);
    if (!destination) {
      announce('That wing is still rearranging its doors.');
      return;
    }
    if (destination.disabled) {
      announce('That wing has not unlocked yet.');
      return;
    }
    dialog.close?.();
    if (dialog.hasAttribute('open')) dialog.removeAttribute('open');
    destination.click();
  }

  function renderNames() {
    namesGrid.innerHTML = expansion.names.names.map((entry) => `
      <button type="button" class="almost-name-card" data-name-index="${entry.index}" aria-pressed="${entry.index === pinnedNameIndex}">
        <span class="almost-name-accession">${entry.accession}</span>
        <h4>${entry.title}</h4>
        <p>${entry.note}</p>
        <p class="almost-name-echo">${entry.echo}</p>
      </button>
    `).join('');
    if (pinnedNameIndex === null) {
      nameStatus.textContent = 'No name is pinned. All nine remain available.';
    } else {
      nameStatus.textContent = `${expansion.names.names[pinnedNameIndex].title} is pinned locally for ${expansion.dateKey}.`;
    }
  }

  function pinName(index) {
    if (!Number.isInteger(index) || index < 0 || index > 8) return;
    try {
      localStorage.setItem(NAME_STORAGE_KEY, JSON.stringify({ dateKey: expansion.dateKey, index }));
      pinnedNameIndex = index;
      renderNames();
      renderMap();
      announce(`${expansion.names.names[index].title} pinned locally for today.`);
    } catch {
      nameStatus.textContent = 'The browser could not store this name pin.';
      announce('The almost name could not be pinned.');
    }
  }

  function renderWeather() {
    weatherHeadline.textContent = expansion.weather.headline;
    weatherMeta.textContent = `Pressure ${expansion.weather.pressure}. Visibility ${expansion.weather.visibility}.`;
    weatherEcho.textContent = expansion.weather.echo;
    weatherGrid.innerHTML = expansion.weather.conditions.map((condition) => `
      <article class="interior-weather-card">
        <span class="interior-weather-time">${condition.time}</span>
        <strong>${condition.kind}</strong>
        <p>${condition.detail}</p>
        <div class="interior-weather-reading">
          <span>${condition.almostDegrees}° almost</span>
          <span>${condition.chance}% possible</span>
        </div>
      </article>
    `).join('');
  }

  function renderPostcards() {
    postcardGrid.innerHTML = expansion.postcards.postcards.map((card) => `
      <article class="unsent-postcard-card">
        <span class="unsent-postcard-image">
          <img src="${card.photo}" alt="" loading="lazy" style="object-position:${card.cropX}% ${card.cropY}%; transform:rotate(${card.rotation}deg) scale(1.04)">
        </span>
        <div class="unsent-postcard-copy">
          <h4>${card.title}</h4>
          <p>${card.caption}</p>
          <p>${card.echo}</p>
          <button type="button" class="text-button" data-postcard-index="${card.index}">⇩ Save unsent postcard</button>
        </div>
      </article>
    `).join('');
  }

  async function saveArchivePostcard(index) {
    const card = expansion?.postcards.postcards[index];
    if (!card) return;
    try {
      const image = new Image();
      image.src = card.photo;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = 1400;
      canvas.height = 980;
      const context = canvas.getContext('2d');
      const [light, cool, warm] = card.palette;
      drawCoverImage(context, image, canvas.width, 650, card.cropX / 100, card.cropY / 100);

      const veil = context.createLinearGradient(0, 0, canvas.width, 650);
      veil.addColorStop(0, `${cool}aa`);
      veil.addColorStop(0.55, 'rgba(5, 6, 10, 0.08)');
      veil.addColorStop(1, `${warm}99`);
      context.fillStyle = veil;
      context.fillRect(0, 0, canvas.width, 650);

      const footer = context.createLinearGradient(0, 650, canvas.width, canvas.height);
      footer.addColorStop(0, '#14131c');
      footer.addColorStop(1, '#080910');
      context.fillStyle = footer;
      context.fillRect(0, 650, canvas.width, 330);

      context.fillStyle = light;
      context.font = '700 21px ui-sans-serif, system-ui, sans-serif';
      context.fillText('THE MUSEUM OF ALMOST · ARCHIVE OF UNSENT POSTCARDS', 58, 710);
      context.fillStyle = '#f4edf7';
      context.font = '52px Georgia, serif';
      wrapText(context, card.title, 58, 790, canvas.width - 116, 58, 2);
      context.fillStyle = '#c9becf';
      context.font = '26px Georgia, serif';
      wrapText(context, card.caption, 58, 895, canvas.width - 116, 36, 2);
      context.fillStyle = '#9ed7cf';
      context.font = '700 17px ui-sans-serif, system-ui, sans-serif';
      context.fillText(`UNSENT · ${expansion.dateKey} · CARD ${String(index + 1).padStart(2, '0')}`, 58, 950);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = `museum-of-almost-unsent-${expansion.dateKey}-${String(index + 1).padStart(2, '0')}.png`;
        link.click();
        URL.revokeObjectURL(url);
        announce(`Unsent postcard ${index + 1} saved locally.`);
      }, 'image/png');
    } catch {
      announce('The postcard could not be rendered in this browser.');
    }
  }

  function drawCoverImage(context, image, width, height, focusX, focusY) {
    const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
    const drawWidth = image.naturalWidth * scale;
    const drawHeight = image.naturalHeight * scale;
    const x = Math.min(0, Math.max(width - drawWidth, width * 0.5 - drawWidth * focusX));
    const y = Math.min(0, Math.max(height - drawHeight, height * 0.5 - drawHeight * focusY));
    context.drawImage(image, x, y, drawWidth, drawHeight);
  }

  function renderCorridor() {
    const entries = expansion?.corridor || core.buildCorridor(history, readMuseumState());
    corridorList.innerHTML = entries.map((entry) => `
      <li>
        <span class="remembered-corridor-number">${entry.position}</span>
        <div>
          <strong>${entry.title}</strong>
          <small>${entry.room || 'ROOM LABEL MISPLACED'}</small>
          <p>${entry.note}</p>
        </div>
      </li>
    `).join('');
    corridorEmpty.hidden = entries.length > 0;
    corridorList.hidden = entries.length === 0;
    forgetCorridorButton.disabled = entries.length === 0;
  }

  function rememberCurrentRoom() {
    const title = roomTitle.textContent.trim().slice(0, 120);
    const room = roomNumber.textContent.trim().slice(0, 80);
    if (!title) return;
    const last = history.at(-1);
    if (last?.title === title && last?.room === room) return;
    writeHistory([...history, { title, room }]);
    if (dialog?.hasAttribute('open')) refreshExpansion();
  }

  function forgetCorridor() {
    writeHistory([]);
    refreshExpansion();
    announce('The corridor has forgotten its recent rooms.');
  }

  function renderPermissionDots() {
    permissionDots.innerHTML = expansion.permissions.permissions.map((permission) => `
      <button type="button" class="permission-dot" data-permission-index="${permission.index}" aria-label="Show permission ${permission.index + 1}" aria-pressed="false"></button>
    `).join('');
  }

  function showPermission(index, focusDot) {
    if (!expansion) return;
    const permissions = expansion.permissions.permissions;
    activePermissionIndex = ((index % permissions.length) + permissions.length) % permissions.length;
    const permission = permissions[activePermissionIndex];
    permissionStamp.textContent = permission.stamp;
    permissionText.textContent = permission.text;
    permissionFootnote.textContent = permission.footnote;
    permissionDots.querySelectorAll('.permission-dot').forEach((dot) => {
      dot.setAttribute('aria-pressed', String(Number(dot.dataset.permissionIndex) === activePermissionIndex));
    });
    if (focusDot) permissionDots.querySelector(`[data-permission-index="${activePermissionIndex}"]`)?.focus();
  }

  function toggleNightWatch() {
    nightWatchEnabled = !nightWatchEnabled;
    try {
      localStorage.setItem(NIGHT_STORAGE_KEY, JSON.stringify(nightWatchEnabled));
    } catch {
      nightWatchEnabled = !nightWatchEnabled;
      nightStatus.textContent = 'The browser could not remember a Night Watch setting.';
      announce('Night Watch could not be changed.');
      return;
    }
    applyNightWatch();
    renderNightWatch();
    renderMap();
    announce(nightWatchEnabled ? 'Night Watch has begun.' : 'Night Watch has ended.');
  }

  function applyNightWatch() {
    document.body.classList.toggle('night-watch-enabled', nightWatchEnabled);
  }

  function renderNightWatch() {
    nightToggle.setAttribute('aria-pressed', String(nightWatchEnabled));
    nightToggle.textContent = nightWatchEnabled ? 'End Night Watch' : 'Begin Night Watch';
    nightStatus.textContent = nightWatchEnabled
      ? 'Night Watch is active in this browser.'
      : 'Night Watch is currently asleep.';
    if (prefersReducedMotion) nightStatus.textContent += ' Reduced motion remains controlled by the browser.';
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

  function announce(message) {
    if (liveRegion) liveRegion.textContent = message;
  }
})();
