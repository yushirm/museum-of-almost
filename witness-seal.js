(function attachWitnessSealView(root) {
  'use strict';

  const core = root.MuseumWitnessSealCore;
  const cosmicCore = root.MuseumCosmicSignalCore;
  const document = root.document;
  if (!core || !document) return;

  const SNAPSHOT_EVENT = 'museum:commons-snapshot';
  let renderVersion = 0;

  installStylesheet();
  const ui = mount();
  render(root.MuseumCommonsSnapshot);

  document.addEventListener(SNAPSHOT_EVENT, (event) => {
    render(event.detail?.snapshot || root.MuseumCommonsSnapshot);
  });

  function installStylesheet() {
    if (document.querySelector('link[data-witness-seal-styles]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './witness-seal.css';
    link.dataset.witnessSealStyles = 'true';
    document.head.append(link);
  }

  function mount() {
    if (!document.querySelector('#witness-seal')) {
      const anchor = document.querySelector('#faultline-core') || document.querySelector('#sounding-well') || document.querySelector('.sample-hold-section');
      if (anchor?.parentNode) {
        const section = document.createElement('section');
        section.id = 'witness-seal';
        section.className = 'witness-seal-section';
        section.setAttribute('aria-labelledby', 'witness-seal-title');
        section.innerHTML = `
          <div class="witness-seal-heading">
            <p class="eyebrow">THE WITNESS SEAL / ONE NOW, ATTESTED</p>
            <h2 id="witness-seal-title">The Museum forgets the snapshot. The seal can still say which snapshot it was.</h2>
            <p>Borrowed from accession marks and evidence seals: after the five-feed latch commits, the browser reduces only the normalized public values shown by COMMONS / NOW into one canonical receipt and hashes that receipt locally. No raw provider payload is preserved.</p>
          </div>
          <div class="witness-seal-console">
            <div class="witness-seal-mark" data-state="waiting">
              <span>EPHEMERAL ACCESSION</span>
              <strong id="witness-seal-code">WAITING FOR LATCH</strong>
              <small>SHA-256 · LOCAL ONLY</small>
            </div>
            <div class="witness-seal-receipt">
              <dl>
                <div><dt>Latch time</dt><dd id="witness-seal-time">—</dd></div>
                <div><dt>Channels present</dt><dd id="witness-seal-feeds">0 / 5</dd></div>
                <div><dt>Canonical schema</dt><dd>${core.SCHEMA}</dd></div>
              </dl>
              <div class="witness-seal-digest">
                <span>FULL LOCAL DIGEST</span>
                <code id="witness-seal-digest">—</code>
              </div>
            </div>
          </div>
          <p id="witness-seal-status" class="witness-seal-status" role="status" aria-live="polite">Waiting for the first committed public snapshot.</p>
          <p class="witness-seal-note"><strong>This is an identity check, not a truth score.</strong> Matching seals mean the Museum canonicalized the same displayed public snapshot. A seal does not certify provider accuracy, freshness, authenticity, or scientific quality, and it is never stored by the application.</p>
        `;
        anchor.insertAdjacentElement('afterend', section);
      }
    }

    let field = document.querySelector('#field-sheet-witness-seal');
    const fieldMeta = document.querySelector('#field-sheet .field-sheet-meta');
    if (!field && fieldMeta) {
      field = document.createElement('span');
      field.id = 'field-sheet-witness-seal';
      field.className = 'field-sheet-witness-seal';
      field.innerHTML = '<strong>Witness seal: unavailable</strong><br><small>Local SHA-256 of the normalized latched snapshot</small>';
      fieldMeta.append(field);
    }

    return {
      mark: document.querySelector('.witness-seal-mark'),
      code: document.querySelector('#witness-seal-code'),
      time: document.querySelector('#witness-seal-time'),
      feeds: document.querySelector('#witness-seal-feeds'),
      digest: document.querySelector('#witness-seal-digest'),
      status: document.querySelector('#witness-seal-status'),
      field
    };
  }

  async function render(snapshot) {
    const version = ++renderVersion;
    const canonical = core.canonicalSnapshot(snapshot, normalizeScales(snapshot));
    if (!canonical) {
      renderWaiting();
      return;
    }

    const feeds = core.availableFeedCount(snapshot);
    if (ui.mark) ui.mark.dataset.state = 'hashing';
    if (ui.code) ui.code.textContent = 'SEALING THIS NOW…';
    if (ui.time) ui.time.textContent = formatUtc(canonical.receivedAt);
    if (ui.feeds) ui.feeds.textContent = `${feeds} / 5`;
    if (ui.digest) ui.digest.textContent = 'computing locally';
    if (ui.status) ui.status.textContent = 'Computing the current witness seal locally.';

    let digest = null;
    try {
      digest = await core.sha256Hex(core.stableStringify(canonical));
    } catch {
      digest = null;
    }
    if (version !== renderVersion) return;

    const code = core.sealCode(digest);
    if (!digest || !code) {
      renderUnavailable(canonical, feeds);
      return;
    }

    root.MuseumWitnessSeal = Object.freeze({ code, digest, schema: core.SCHEMA, receivedAt: canonical.receivedAt });
    if (ui.mark) ui.mark.dataset.state = 'sealed';
    if (ui.code) ui.code.textContent = code;
    if (ui.digest) ui.digest.textContent = digest;
    if (ui.status) ui.status.textContent = `Witness seal ${code} attests this latched presentation locally; ${feeds} of 5 channels were present.`;
    renderField(code, digest);
  }

  function normalizeScales(snapshot) {
    if (!cosmicCore?.normalizeNoaaScales) return null;
    return cosmicCore.normalizeNoaaScales(snapshot?.scales?.value);
  }

  function renderWaiting() {
    root.MuseumWitnessSeal = null;
    if (ui.mark) ui.mark.dataset.state = 'waiting';
    if (ui.code) ui.code.textContent = 'WAITING FOR LATCH';
    if (ui.time) ui.time.textContent = '—';
    if (ui.feeds) ui.feeds.textContent = '0 / 5';
    if (ui.digest) ui.digest.textContent = '—';
    if (ui.status) ui.status.textContent = 'Waiting for the first committed public snapshot.';
    renderField(null, null);
  }

  function renderUnavailable(canonical, feeds) {
    root.MuseumWitnessSeal = null;
    if (ui.mark) ui.mark.dataset.state = 'unavailable';
    if (ui.code) ui.code.textContent = 'SEAL UNAVAILABLE';
    if (ui.time) ui.time.textContent = formatUtc(canonical.receivedAt);
    if (ui.feeds) ui.feeds.textContent = `${feeds} / 5`;
    if (ui.digest) ui.digest.textContent = 'Web Crypto unavailable';
    if (ui.status) ui.status.textContent = 'The snapshot is latched, but this browser could not compute its local SHA-256 witness seal.';
    renderField(null, null);
  }

  function renderField(code, digest) {
    if (!ui.field) return;
    const strong = ui.field.querySelector('strong');
    const small = ui.field.querySelector('small');
    if (strong) strong.textContent = code ? `Witness seal: ${code}` : 'Witness seal: unavailable';
    if (small) small.textContent = digest ? `SHA-256 ${digest}` : 'Local SHA-256 of the normalized latched snapshot';
  }

  function formatUtc(value) {
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return '—';
    return `${date.toISOString().replace('T', ' ').replace('.000Z', 'Z')}`;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
