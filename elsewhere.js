'use strict';

(() => {
  const records = [...document.querySelectorAll('[data-artifact]')];
  const button = document.querySelector('#misfile-button');
  const status = document.querySelector('#misfile-status');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let cursor = -1;

  const handlingRoutes = Object.freeze({
    'artifact-c0-001': { zone: 'ZONE B · BUILDING FABRIC', zoneId: 'B', action: 'Support the key without testing it against unverified locks.', hold: 'No matching lock exists in the building survey.' },
    'artifact-c0-002': { zone: 'ZONE A · PAPER / FILM', zoneId: 'A', action: 'Sleeve flat; preserve both punched marks; do not validate the route.', hold: 'The railway line named by the ticket was never built.' },
    'artifact-c0-003': { zone: 'ZONE A · PAPER / FILM', zoneId: 'A', action: 'Store flat with full edge support; do not restore missing geography.', hold: 'The sheet keeps cartographic structure after the geography is removed.' },
    'artifact-c0-004': { zone: 'ZONE A · PAPER / FILM', zoneId: 'A', action: 'File with technical papers; avoid treating warranty language as proof of manufacture.', hold: 'The covered machine has no manufacturing record.' },
    'artifact-c0-005': { zone: 'ZONE A · PAPER / FILM', zoneId: 'A', action: 'Keep cool and dark; do not process, expose, or advance the stated date.', hold: 'The canister is labelled “Exposure: Tomorrow” while the fictional processing log finishes first.' },
    'artifact-c0-006': { zone: 'ZONE B · BUILDING FABRIC', zoneId: 'B', action: 'Brace in place where possible; document before any relocation.', hold: 'Removing the temporary exit may erase the reason it was accessioned.' },
    'artifact-c0-007': { zone: 'ZONE A · PAPER / FILM', zoneId: 'A', action: 'Sleeve with queue documents; preserve the printed zero as issued.', hold: 'The number precedes a queue whose first issued ticket is recorded as 001.' },
    'artifact-c0-008': { zone: 'ZONE C · OPTICAL / UNASSIGNED', zoneId: 'C', action: 'Box with labels; photograph under stable light without resolving the named date.', hold: 'The label describes an object category that cannot be reconciled with a calendar.' },
    'artifact-c0-009': { zone: 'ZONE C · OPTICAL / UNASSIGNED', zoneId: 'C', action: 'Store flat; image both sides; retain the unresolved destination wording.', hold: 'The pictured place is absent from the chart supplied with the record.' },
    'artifact-c0-010': { zone: 'ZONE C · OPTICAL / UNASSIGNED', zoneId: 'C', action: 'Keep sealed; attempt repeatable imaging without opening the enclosure.', hold: 'The object is catalogued as a fixed shadow that refuses reproduction.' },
    'artifact-c0-011': { zone: 'ZONE A · PAPER / FILM', zoneId: 'A', action: 'File with manuals; preserve pagination and model designation exactly.', hold: 'The instructions describe a model for which no machine is accessioned.' },
    'artifact-c0-012': { zone: 'ZONE B · BUILDING FABRIC', zoneId: 'B', action: 'Support as architectural signage; do not mount it on an invented room.', hold: 'The plaque names Room 0, which is absent from the building survey.' }
  });

  const closeAll = () => {
    for (const record of records) record.open = false;
  };

  const markActiveRoute = (route, accession) => {
    for (const zone of document.querySelectorAll('[data-storage-zone]')) {
      const active = zone.dataset.storageZone === route.zoneId;
      zone.classList.toggle('is-active-route', active);
      if (active) zone.setAttribute('data-current-accession', accession);
      else zone.removeAttribute('data-current-accession');
    }
  };

  const updateTransferDesk = (record) => {
    const desk = document.querySelector('#transfer-desk');
    if (!desk || !record) return;
    const route = handlingRoutes[record.id];
    if (!route) return;
    const accession = record.querySelector('summary span')?.textContent?.trim() || record.id.replace('artifact-', '').toUpperCase();
    const title = record.querySelector('summary strong')?.textContent?.trim() || 'Untitled record';
    const accessionCode = accession.split(' · ')[0];
    const accessionNode = desk.querySelector('[data-transfer-accession]');
    const titleNode = desk.querySelector('[data-transfer-title]');
    const zoneNode = desk.querySelector('[data-transfer-zone]');
    const actionNode = desk.querySelector('[data-transfer-action]');
    const holdNode = desk.querySelector('[data-transfer-hold]');
    const routeNode = desk.querySelector('[data-transfer-route]');
    const traceNode = desk.querySelector('[data-transfer-trace]');
    if (accessionNode) accessionNode.textContent = accession;
    if (titleNode) titleNode.textContent = title;
    if (zoneNode) zoneNode.textContent = route.zone;
    if (actionNode) actionNode.textContent = route.action;
    if (holdNode) holdNode.textContent = route.hold;
    if (routeNode) routeNode.textContent = `CATALOGUE 0 → ZONE ${route.zoneId} → CONTRADICTION HOLD`;
    if (traceNode) {
      traceNode.removeAttribute('hidden');
      traceNode.setAttribute('aria-label', `Trace ${accessionCode} storage route to Zone ${route.zoneId}`);
    }
    markActiveRoute(route, accessionCode);
  };

  const openRecord = (index) => {
    if (!records.length) return;
    cursor = ((index % records.length) + records.length) % records.length;
    closeAll();
    const record = records[cursor];
    record.open = true;
    updateTransferDesk(record);
    const title = record.querySelector('summary strong')?.textContent?.trim() || `Record ${cursor + 1}`;
    if (status) status.textContent = `Misfile ${cursor + 1} of ${records.length}: ${title}.`;
    record.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
  };

  const installEnvironmentBoard = () => {
    const catalogue = document.querySelector('#catalogue');
    if (!catalogue || document.querySelector('#environment-board')) return;

    const style = document.createElement('style');
    style.dataset.elsewhereEnvironment = 'true';
    style.textContent = `
      .environment-board{margin:clamp(3rem,8vw,7rem) auto;padding:clamp(1.25rem,4vw,2.5rem);max-width:1180px;border:1px solid currentColor;background:rgba(239,235,218,.04);box-shadow:0 0 0 6px rgba(0,0,0,.14)}
      .environment-heading{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(16rem,.6fr);gap:1.5rem;align-items:end;margin-bottom:1.5rem}
      .environment-heading h2{margin:.2rem 0 .65rem;font-size:clamp(2rem,5vw,4.8rem);line-height:.93;letter-spacing:-.045em}
      .environment-heading p{max-width:64ch}
      .environment-status{border:1px dashed currentColor;padding:1rem;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;text-transform:uppercase;font-size:.82rem;line-height:1.5}
      .environment-status strong{display:block;font-size:1.25rem;margin-top:.3rem}
      .environment-zones{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1rem}
      .environment-zone{position:relative;display:flex;flex-direction:column;min-height:100%;border:1px solid currentColor;background:rgba(0,0,0,.14)}
      .environment-zone.is-active-route{outline:3px double currentColor;outline-offset:4px;background:rgba(229,168,38,.08)}
      .environment-zone.is-active-route::after{content:'CURRENT MOVEMENT · ' attr(data-current-accession);position:absolute;top:.55rem;right:.55rem;padding:.2rem .35rem;border:1px solid currentColor;background:#1d201a;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:.58rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase}
      .environment-zone header{padding:1rem;border-bottom:1px solid currentColor}
      .environment-zone header span{display:block;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;opacity:.8}
      .environment-zone h3{margin:.25rem 0 0;font-size:1.25rem}
      .environment-zone dl{margin:0;padding:1rem;display:grid;gap:.85rem}
      .environment-zone dl div{display:grid;grid-template-columns:7.5rem 1fr;gap:.75rem;align-items:start}
      .environment-zone dt{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:.7rem;letter-spacing:.06em;text-transform:uppercase;opacity:.72}
      .environment-zone dd{margin:0}
      .environment-conflict{margin:auto 1rem 1rem;padding-top:1rem;border-top:1px dashed currentColor;font-size:.92rem}
      .environment-conflict strong{display:block;margin-bottom:.35rem;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:.72rem;letter-spacing:.06em;text-transform:uppercase}
      .environment-order{margin:1rem 0 0;padding:1rem;border-left:4px solid currentColor;background:rgba(0,0,0,.18)}
      .environment-order strong{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;text-transform:uppercase}
      .salvage-drawer{margin:1rem 0 0;border:1px dashed currentColor;background:rgba(0,0,0,.1)}
      .salvage-drawer summary{display:flex;align-items:center;justify-content:space-between;gap:1rem;min-height:48px;padding:.75rem 1rem;cursor:pointer;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:.75rem;font-weight:800;letter-spacing:.07em;text-transform:uppercase}
      .salvage-drawer summary::after{content:'OPEN CARD +';white-space:nowrap;font-size:.68rem}
      .salvage-drawer[open] summary{border-bottom:1px dashed currentColor}
      .salvage-drawer[open] summary::after{content:'CLOSE CARD −'}
      .salvage-intro{margin:0;padding:1rem 1rem .25rem;max-width:74ch}
      .salvage-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0;margin:1rem}
      .salvage-case{padding:1rem;border:1px solid currentColor;background:rgba(0,0,0,.12)}
      .salvage-case:nth-child(even){border-left:0}
      .salvage-case:nth-child(n+3){border-top:0}
      .salvage-case h3{margin:0 0 .65rem;font-size:1rem}
      .salvage-case p{margin:.4rem 0;font-size:.9rem;line-height:1.5}
      .salvage-case strong{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:.68rem;letter-spacing:.06em;text-transform:uppercase}
      .salvage-rule{margin:0 1rem 1rem;padding:1rem;border-left:4px solid currentColor;background:rgba(229,168,38,.07)}
      .salvage-rule strong{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;text-transform:uppercase}
      .transfer-desk{margin:1.5rem 0 2rem;border:1px solid currentColor;background:rgba(0,0,0,.12)}
      .transfer-desk header{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:1rem;align-items:end;padding:1rem;border-bottom:1px solid currentColor}
      .transfer-desk header p{margin:0;max-width:58ch}
      .transfer-stamp{padding:.35rem .55rem;border:1px solid currentColor;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:.68rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase}
      .transfer-grid{display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,.9fr) minmax(0,1.3fr);margin:0}
      .transfer-grid>div{min-width:0;padding:1rem}
      .transfer-grid>div+div{border-left:1px solid currentColor}
      .transfer-grid dt{margin:0 0 .45rem;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:.68rem;letter-spacing:.08em;text-transform:uppercase;opacity:.72}
      .transfer-grid dd{margin:0;line-height:1.45}
      .transfer-grid strong{display:block;margin-bottom:.2rem}
      .transfer-route-row{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:.75rem 1rem;border-top:1px dashed currentColor}
      .transfer-route{margin:0;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:.72rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase}
      .transfer-trace{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:.45rem .7rem;border:1px solid currentColor;color:inherit;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:.7rem;font-weight:800;letter-spacing:.06em;text-decoration:none;text-transform:uppercase}
      .transfer-trace:hover,.transfer-trace:focus-visible{background:currentColor;color:#1d201a}
      .transfer-hold{padding:1rem;border-top:1px dashed currentColor;background:rgba(229,168,38,.07)}
      .transfer-hold strong{display:block;margin-bottom:.35rem;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:.68rem;letter-spacing:.08em;text-transform:uppercase}
      @media (max-width:800px){.environment-heading,.environment-zones{grid-template-columns:1fr}.environment-zone dl div{grid-template-columns:6.5rem 1fr}.transfer-grid{grid-template-columns:1fr}.transfer-grid>div+div{border-left:0;border-top:1px solid currentColor}}
      @media (max-width:620px){.salvage-grid{grid-template-columns:1fr}.salvage-case:nth-child(even),.salvage-case:nth-child(n+3){border-left:1px solid currentColor}.salvage-case+.salvage-case{border-top:0}.transfer-route-row{align-items:stretch;flex-direction:column}.transfer-trace{align-self:flex-start}}
      @media (max-width:520px){.transfer-desk header{grid-template-columns:1fr}.transfer-stamp{justify-self:start}.salvage-drawer summary{align-items:flex-start;flex-direction:column}}
      @media (max-width:420px){.environment-board{padding:1rem}.environment-zone dl div{grid-template-columns:1fr;gap:.15rem}.environment-zone.is-active-route::after{position:static;display:block;margin:.65rem .65rem 0;width:max-content;max-width:calc(100% - 1.3rem)}}
      @media (prefers-contrast:more){.environment-board,.environment-zone,.environment-zone header,.salvage-drawer,.salvage-case,.transfer-desk,.transfer-desk header,.transfer-grid>div+div,.transfer-trace{border-width:2px}.environment-status{border-width:2px}.environment-zone.is-active-route{outline-width:4px}}
      @media print{.environment-board{box-shadow:none}.environment-zone,.salvage-drawer,.salvage-case,.transfer-desk{break-inside:avoid}.salvage-drawer:not([open])>*:not(summary){display:block}.environment-zone.is-active-route{outline:0}.environment-zone.is-active-route::after,.transfer-trace{display:none}}
    `;
    document.head.append(style);

    const section = document.createElement('section');
    section.className = 'environment-board';
    section.id = 'environment-board';
    section.setAttribute('aria-labelledby', 'environment-title');
    section.innerHTML = `
      <div class="environment-heading">
        <div>
          <p class="kicker">COLLECTIONS ENVIRONMENT / EXCEPTION BOARD</p>
          <h2 id="environment-title">The building can preserve the objects. It cannot preserve all their conditions at once.</h2>
          <p>Preventive conservation normally reduces risk by stabilising light, moisture, temperature and handling. Catalogue 0 has translated that ordinary discipline into three fictional storage zones. The targets are intentionally plain; the contradictions belong to the collection.</p>
        </div>
        <div class="environment-status" aria-label="Environmental control status">
          BUILDING SERVICES / ZONE 0
          <strong>3 EXCEPTIONS OPEN</strong>
          No live sensors · no measurements · fictional control board
        </div>
      </div>
      <div class="environment-zones" aria-label="Three fictional conservation exception zones">
        <article class="environment-zone" data-storage-zone="A">
          <header><span>ZONE A · PAPER / FILM</span><h3>Keep the future out of the light.</h3></header>
          <dl>
            <div><dt>Target</dt><dd>Cool, stable, low-light storage.</dd></div>
            <div><dt>Assigned</dt><dd>C0.002 ticket · C0.003 map · C0.004 warranty · C0.005 film · C0.007 queue ticket · C0.011 manual.</dd></div>
            <div><dt>Routine action</dt><dd>Box, support, limit handling, record condition.</dd></div>
          </dl>
          <p class="environment-conflict"><strong>Exception A0</strong>C0.005 is labelled “Exposure: Tomorrow,” while its fictional processing log says completion came first. Darkness may protect the material; the catalogue cannot say whether it also postpones the event.</p>
        </article>
        <article class="environment-zone" data-storage-zone="B">
          <header><span>ZONE B · BUILDING FABRIC</span><h3>Do not move the thing whose evidence is that it stayed.</h3></header>
          <dl>
            <div><dt>Target</dt><dd>Dry storage with clear access and stable mounting.</dd></div>
            <div><dt>Assigned</dt><dd>C0.001 key · C0.006 exit sign · C0.012 room plaque.</dd></div>
            <div><dt>Routine action</dt><dd>Remove load, isolate corrosion, secure loose fittings.</dd></div>
          </dl>
          <p class="environment-conflict"><strong>Exception B0</strong>C0.006 became accession-worthy because the temporary sign apparently outlasted the wall it redirected around. Removing it would improve storage and erase the institutional absurdity that justified keeping it.</p>
        </article>
        <article class="environment-zone" data-storage-zone="C">
          <header><span>ZONE C · OPTICAL / UNASSIGNED</span><h3>Measure without demanding that the object cooperate.</h3></header>
          <dl>
            <div><dt>Target</dt><dd>Stable illumination, repeatable imaging, sealed storage.</dd></div>
            <div><dt>Assigned</dt><dd>C0.008 object label · C0.009 postcard · C0.010 boxed shadow.</dd></div>
            <div><dt>Routine action</dt><dd>Photograph, compare, quarantine unexplained change.</dd></div>
          </dl>
          <p class="environment-conflict"><strong>Exception C0</strong>C0.010 is catalogued as a fixed shadow that refuses reproduction. The normal conservation record depends on repeatable images; this fictional object makes “document the condition” the condition that cannot be met.</p>
        </article>
      </div>
      <details class="salvage-drawer">
        <summary>EMERGENCY SALVAGE / FIRST RESPONSE CARD · PRIORITY IS ABOUT MATERIAL RISK, NOT PROVENANCE</summary>
        <p class="salvage-intro">Museum emergency plans normally decide what can be safely moved, stabilised or left in place after water, fire suppression, power loss or structural damage. Catalogue 0 uses the same plain logic. An impossible history does not make an object physically invulnerable.</p>
        <div class="salvage-grid">
          <article class="salvage-case">
            <h3>01 · WATER INGRESS / ZONE A</h3>
            <p><strong>First action</strong> Move wet paper and film to a dry staging surface; interleave and separate before surfaces bond.</p>
            <p><strong>Priority tension</strong> C0.005 is treated as a metal canister with a paper label. “Tomorrow” is not an emergency instruction.</p>
          </article>
          <article class="salvage-case">
            <h3>02 · OBSTRUCTED EGRESS / ZONE B</h3>
            <p><strong>First action</strong> Life safety outranks collection context. Clear the route before documenting the accession in place.</p>
            <p><strong>Priority tension</strong> C0.006 may lose the very placement that made the temporary exit meaningful. The loss is recorded; the sign does not get to block an exit.</p>
          </article>
          <article class="salvage-case">
            <h3>03 · LIGHT / POWER FAILURE / ZONE C</h3>
            <p><strong>First action</strong> Keep boxes closed, suspend imaging and restore stable conditions before attempting comparison photography.</p>
            <p><strong>Priority tension</strong> C0.010 cannot be verified by emergency torchlight. The response plan accepts an undocumented interval rather than inventing a condition report.</p>
          </article>
          <article class="salvage-case">
            <h3>04 · FREIGHT LIFT UNAVAILABLE / ALL ZONES</h3>
            <p><strong>First action</strong> Stabilise in place. Do not improvise public-stair transport for objects whose safe handling route depends on service access.</p>
            <p><strong>Priority tension</strong> The building may temporarily know less about where an object can go than the catalogue knows about where it came from.</p>
          </article>
        </div>
        <p class="salvage-rule"><strong>Emergency rule 0:</strong> Save people first, then stabilise material reality. Impossible provenance never outranks an ordinary fire door, a dry surface, or a safe lifting route.</p>
      </details>
      <p class="environment-order"><strong>Standing order 0:</strong> Do not optimise the collection into normality. Stabilise the material where possible; preserve the contradiction only as a clearly fictional catalogue fact.</p>
    `;

    catalogue.before(section);
  };

  const installTransferDesk = () => {
    const catalogueRule = document.querySelector('.catalogue-rule');
    if (!catalogueRule || document.querySelector('#transfer-desk') || !records.length) return;
    const desk = document.createElement('aside');
    desk.className = 'transfer-desk';
    desk.id = 'transfer-desk';
    desk.setAttribute('aria-labelledby', 'transfer-title');
    desk.innerHTML = `
      <header>
        <div>
          <p class="kicker">COLLECTIONS TRANSFER / HANDLING DESK</p>
          <h3 id="transfer-title">Every object gets a route. No route resolves the object.</h3>
          <p>Open any accession record below. This docket follows that existing record through the fictional storage plan and states the ordinary handling action that can proceed without pretending its provenance problem has been solved.</p>
        </div>
        <span class="transfer-stamp">MOVEMENT COPY · LOCAL ONLY</span>
      </header>
      <dl class="transfer-grid">
        <div><dt>Current accession</dt><dd><strong data-transfer-accession>NO ACCESSION SELECTED</strong><span data-transfer-title>Open a record below to issue a movement copy.</span></dd></div>
        <div><dt>Storage route</dt><dd data-transfer-zone>PENDING ACCESSION</dd></div>
        <div><dt>Handling order</dt><dd data-transfer-action>No handling order issued.</dd></div>
      </dl>
      <div class="transfer-route-row">
        <p class="transfer-route" data-transfer-route aria-hidden="true">CATALOGUE 0 → ROUTE PENDING</p>
        <a class="transfer-trace" data-transfer-trace href="#environment-board" hidden>TRACE STORAGE ROUTE ↑</a>
      </div>
      <p class="transfer-hold"><strong>Contradiction hold</strong><span data-transfer-hold>No contradiction hold issued.</span></p>
    `;
    catalogueRule.after(desk);

    for (const record of records) {
      record.addEventListener('toggle', () => {
        if (record.open) updateTransferDesk(record);
      });
    }
  };

  if (button) {
    button.addEventListener('click', () => openRecord(cursor + 1));
  }

  installEnvironmentBoard();
  installTransferDesk();

  if (reducedMotion) {
    document.documentElement.dataset.reducedMotion = 'true';
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js').catch(() => {});
    }, { once: true });
  }
})();
