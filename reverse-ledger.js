(function attachReverseLedgerView(root) {
  'use strict';

  const core = root.MuseumReverseLedgerCore;
  const document = root.document;
  if (!core || !document) return;

  const SNAPSHOT_EVENT = 'museum:commons-snapshot';
  let snapshot = root.MuseumCommonsSnapshot || null;
  let selectedClaimId = core.CLAIMS[0]?.id || 'earthquake-count';

  installStylesheet();
  const ui = mount();
  render();

  document.addEventListener(SNAPSHOT_EVENT, (event) => {
    snapshot = event.detail?.snapshot || root.MuseumCommonsSnapshot || null;
    render();
  });

  function installStylesheet() {
    if (document.querySelector('link[data-reverse-ledger-styles]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './reverse-ledger.css';
    link.dataset.reverseLedgerStyles = 'true';
    document.head.append(link);
  }

  function mount() {
    if (!document.querySelector('#reverse-ledger')) {
      const anchor = document.querySelector('#exposure-plate') || document.querySelector('.planetary-section');
      if (anchor?.parentNode) {
        const section = document.createElement('section');
        section.id = 'reverse-ledger';
        section.className = 'reverse-ledger-section';
        section.setAttribute('aria-labelledby', 'reverse-ledger-title');
        section.innerHTML = `
          <div class="reverse-ledger-heading">
            <p class="eyebrow">THE REVERSE LEDGER / EVERY CLAIM OWES A SOURCE</p>
            <h2 id="reverse-ledger-title">Read a conclusion backward.</h2>
            <p>Choose something the Commons currently says. The ledger starts at the displayed claim and walks upstream through Museum transformations until it reaches public, fixed, or local inputs. Missing links stay missing.</p>
          </div>
          <div class="reverse-ledger-console">
            <div class="reverse-ledger-claims">
              <span>SELECT A CURRENT CLAIM</span>
              <div id="reverse-ledger-buttons" class="reverse-ledger-buttons" role="group" aria-label="Choose a Commons claim to trace backward"></div>
            </div>
            <div class="reverse-ledger-book">
              <div class="reverse-ledger-book-head">
                <div>
                  <span class="eyebrow">CURRENT REVERSE TRACE</span>
                  <strong id="reverse-ledger-value">—</strong>
                </div>
                <b id="reverse-ledger-state" data-state="open">TRACE OPEN</b>
              </div>
              <p id="reverse-ledger-status" class="reverse-ledger-status" role="status" aria-live="polite">Waiting for a current latch.</p>
              <div class="reverse-ledger-body">
                <div>
                  <span class="reverse-ledger-kicker">ACCOUNTS</span>
                  <ol id="reverse-ledger-accounts" class="reverse-ledger-accounts"></ol>
                </div>
                <div>
                  <span class="reverse-ledger-kicker">DEPENDENCY ENTRIES</span>
                  <ol id="reverse-ledger-entries" class="reverse-ledger-entries"></ol>
                </div>
              </div>
              <p id="reverse-ledger-note" class="reverse-ledger-note">Traceability is not verification, confidence, quality, completeness, or truth.</p>
            </div>
          </div>
          <p class="reverse-ledger-boundary"><strong>What “complete” means here:</strong> every expected upstream account for this claim is present in the current trace. It does not mean the provider is correct, the Museum calculation is scientifically validated, or the claim is representative beyond its stated scope.</p>
        `;
        anchor.insertAdjacentElement('afterend', section);
      }
    }

    const mounted = {
      buttons: document.querySelector('#reverse-ledger-buttons'),
      value: document.querySelector('#reverse-ledger-value'),
      state: document.querySelector('#reverse-ledger-state'),
      status: document.querySelector('#reverse-ledger-status'),
      accounts: document.querySelector('#reverse-ledger-accounts'),
      entries: document.querySelector('#reverse-ledger-entries'),
      note: document.querySelector('#reverse-ledger-note')
    };

    if (mounted.buttons && !mounted.buttons.children.length) {
      for (const claim of core.CLAIMS) {
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.reverseClaim = claim.id;
        button.setAttribute('aria-pressed', String(claim.id === selectedClaimId));
        button.textContent = claim.label;
        button.addEventListener('click', () => {
          selectedClaimId = claim.id;
          render();
        });
        mounted.buttons.append(button);
      }
    }

    return mounted;
  }

  function render() {
    const trace = core.traceClaim(snapshot, selectedClaimId);
    root.MuseumReverseLedger = Object.freeze({
      claimId: trace.id,
      complete: trace.complete,
      value: trace.value,
      receivedAt: isoOrNull(snapshot?.receivedAt)
    });

    for (const button of document.querySelectorAll('[data-reverse-claim]')) {
      button.setAttribute('aria-pressed', String(button.dataset.reverseClaim === selectedClaimId));
    }

    if (ui.value) ui.value.textContent = trace.value || 'UNAVAILABLE';
    if (ui.state) {
      ui.state.dataset.state = trace.complete ? 'complete' : 'open';
      ui.state.textContent = trace.complete ? 'TRACE COMPLETE' : 'TRACE OPEN';
    }
    if (ui.status) ui.status.textContent = core.traceSentence(trace);
    if (ui.note) ui.note.textContent = trace.note;

    renderAccounts(trace);
    renderEntries(trace);
  }

  function renderAccounts(trace) {
    if (!ui.accounts) return;
    ui.accounts.replaceChildren();
    const fragment = document.createDocumentFragment();

    for (const account of trace.nodes) {
      const item = document.createElement('li');
      item.className = 'reverse-ledger-account';
      item.dataset.state = account.state;

      const type = document.createElement('span');
      type.className = 'reverse-ledger-type';
      type.textContent = core.NODE_TYPES[account.type] || String(account.type).toUpperCase();

      const label = document.createElement('strong');
      label.textContent = account.label;

      const detail = document.createElement('p');
      detail.textContent = account.detail;

      item.append(type, label, detail);
      fragment.append(item);
    }
    ui.accounts.append(fragment);
  }

  function renderEntries(trace) {
    if (!ui.entries) return;
    ui.entries.replaceChildren();
    const accounts = new Map(trace.nodes.map((account) => [account.id, account]));
    const fragment = document.createDocumentFragment();

    for (const transaction of trace.edges) {
      const from = accounts.get(transaction.from);
      const to = accounts.get(transaction.to);
      if (!from || !to) continue;

      const item = document.createElement('li');
      item.className = 'reverse-ledger-entry';
      item.dataset.state = from.state === 'missing' || to.state === 'missing' ? 'missing' : 'present';

      const debtor = document.createElement('span');
      debtor.innerHTML = `<small>${escapeText(core.NODE_TYPES[from.type] || from.type)}</small><b>${escapeText(from.label)}</b>`;
      const owes = document.createElement('strong');
      owes.textContent = transaction.label;
      const creditor = document.createElement('span');
      creditor.innerHTML = `<small>${escapeText(core.NODE_TYPES[to.type] || to.type)}</small><b>${escapeText(to.label)}</b>`;

      item.append(debtor, owes, creditor);
      fragment.append(item);
    }
    ui.entries.append(fragment);
  }

  function escapeText(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function isoOrNull(value) {
    if (value === null || value === undefined || value === '') return null;
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? date.toISOString() : null;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
