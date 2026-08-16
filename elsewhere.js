'use strict';

(() => {
  const records = [...document.querySelectorAll('[data-artifact]')];
  const controls = document.querySelector('.catalogue-controls');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let freightLiftOut = false;
  let liftServiceScar = false;
  let currentRecord = null;
  let returnCartRecord = null;
  let reshelvedRecord = null;

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

  const accessionCode = (record) => record?.querySelector('summary span')?.textContent?.trim().split(' · ')[0] || 'UNASSIGNED';

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
    const code = accession.split(' · ')[0];
    desk.querySelector('[data-transfer-accession]').textContent = accession;
    desk.querySelector('[data-transfer-title]').textContent = title;
    desk.querySelector('[data-transfer-zone]').textContent = route.zone;
    desk.querySelector('[data-transfer-action]').textContent = freightLiftOut ? `HOLD IN PLACE — freight lift unavailable. ${route.action}` : route.action;
    desk.querySelector('[data-transfer-hold]').textContent = route.hold;
    desk.querySelector('[data-transfer-route]').textContent = freightLiftOut
      ? `CATALOGUE 0 · ${code} · MOVEMENT PAUSED · FREIGHT LIFT OUT OF SERVICE`
      : `CATALOGUE 0 → ZONE ${route.zoneId} → CONTRADICTION HOLD`;
    const trace = desk.querySelector('[data-transfer-trace]');
    trace.removeAttribute('hidden');
    trace.setAttribute('aria-label', `Trace ${code} storage route to Zone ${route.zoneId}`);
    markActiveRoute(route, code);
  };

  const installEnvironmentBoard = () => {
    const catalogue = document.querySelector('#catalogue');
    if (!catalogue || document.querySelector('#environment-board')) return;
    const style = document.createElement('style');
    style.dataset.elsewhereEnvironment = 'true';
    style.textContent = `
      .environment-board{margin:clamp(3rem,8vw,7rem) auto;padding:clamp(1.25rem,4vw,2.5rem);max-width:1180px;border:1px solid currentColor;background:rgba(239,235,218,.04);box-shadow:0 0 0 6px rgba(0,0,0,.14)}
      .environment-heading{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(16rem,.6fr);gap:1.5rem;align-items:end;margin-bottom:1.5rem}.environment-heading h2{margin:.2rem 0 .65rem;font-size:clamp(2rem,5vw,4.8rem);line-height:.93;letter-spacing:-.045em}.environment-heading p{max-width:64ch}
      .environment-status{border:1px dashed currentColor;padding:1rem;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;text-transform:uppercase;font-size:.82rem;line-height:1.5}.environment-status strong{display:block;font-size:1.25rem;margin-top:.3rem}
      .environment-zones{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1rem}.environment-zone{position:relative;display:flex;flex-direction:column;min-height:100%;border:1px solid currentColor;background:rgba(0,0,0,.14)}
      .environment-zone.is-active-route{outline:3px double currentColor;outline-offset:4px;background:rgba(229,168,38,.08)}.environment-zone.is-active-route::after{content:'CURRENT MOVEMENT · ' attr(data-current-accession);position:absolute;top:.55rem;right:.55rem;padding:.2rem .35rem;border:1px solid currentColor;background:#1d201a;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:.58rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase}
      .environment-zone header{padding:1rem;border-bottom:1px solid currentColor}.environment-zone header span{display:block;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;opacity:.8}.environment-zone h3{margin:.25rem 0 0;font-size:1.25rem}.environment-zone dl{margin:0;padding:1rem;display:grid;gap:.85rem}.environment-zone dl div{display:grid;grid-template-columns:7.5rem 1fr;gap:.75rem;align-items:start}.environment-zone dt{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:.7rem;letter-spacing:.06em;text-transform:uppercase;opacity:.72}.environment-zone dd{margin:0}
      .environment-conflict{margin:auto 1rem 1rem;padding-top:1rem;border-top:1px dashed currentColor;font-size:.92rem}.environment-conflict strong{display:block;margin-bottom:.35rem;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:.72rem;letter-spacing:.06em;text-transform:uppercase}.environment-order{margin:1rem 0 0;padding:1rem;border-left:4px solid currentColor;background:rgba(0,0,0,.18)}.environment-ipm-order{display:block;margin-top:.55rem;padding-top:.55rem;border-top:1px dashed currentColor;font-size:.82rem;line-height:1.55}
      .transfer-desk{margin:1.5rem 0 2rem;border:1px solid currentColor;background:rgba(0,0,0,.12)}.transfer-desk header{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:1rem;align-items:end;padding:1rem;border-bottom:1px solid currentColor}.transfer-desk header p{margin:0;max-width:58ch}.transfer-stamp{padding:.35rem .55rem;border:1px solid currentColor;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:.68rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase}
      .transfer-grid{display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,.9fr) minmax(0,1.3fr);margin:0}.transfer-grid>div{min-width:0;padding:1rem}.transfer-grid>div+div{border-left:1px solid currentColor}.transfer-grid dt{margin:0 0 .45rem;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:.68rem;letter-spacing:.08em;text-transform:uppercase;opacity:.72}.transfer-grid dd{margin:0;line-height:1.45}.transfer-grid strong{display:block;margin-bottom:.2rem}
      .transfer-route-row{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:.75rem 1rem;border-top:1px dashed currentColor}.transfer-route{margin:0;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:.72rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase}.transfer-trace{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:.45rem .7rem;border:1px solid currentColor;color:inherit;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:.7rem;font-weight:800;letter-spacing:.06em;text-decoration:none;text-transform:uppercase}.transfer-trace:hover,.transfer-trace:focus-visible{background:currentColor;color:#1d201a}.transfer-hold{padding:1rem;border-top:1px dashed currentColor;background:rgba(229,168,38,.07)}
      @media(max-width:800px){.environment-heading,.environment-zones{grid-template-columns:1fr}.environment-zone dl div{grid-template-columns:6.5rem 1fr}.transfer-grid{grid-template-columns:1fr}.transfer-grid>div+div{border-left:0;border-top:1px solid currentColor}}@media(max-width:620px){.transfer-route-row{align-items:stretch;flex-direction:column}.transfer-trace{align-self:flex-start}}@media(max-width:520px){.transfer-desk header{grid-template-columns:1fr}.transfer-stamp{justify-self:start}}@media(max-width:420px){.environment-board{padding:1rem}.environment-zone dl div{grid-template-columns:1fr;gap:.15rem}.environment-zone.is-active-route::after{position:static;display:block;margin:.65rem .65rem 0;width:max-content;max-width:calc(100% - 1.3rem)}}
      @media(prefers-contrast:more){.environment-board,.environment-zone,.environment-zone header,.transfer-desk,.transfer-desk header,.transfer-grid>div+div,.transfer-trace{border-width:2px}.environment-zone.is-active-route{outline-width:4px}}@media print{.environment-board{box-shadow:none}.environment-zone,.transfer-desk{break-inside:avoid}.environment-zone.is-active-route{outline:0}.environment-zone.is-active-route::after,.transfer-trace{display:none}}
    `;
    document.head.append(style);
    const section = document.createElement('section');
    section.className = 'environment-board';
    section.id = 'environment-board';
    section.setAttribute('aria-labelledby', 'environment-title');
    section.innerHTML = `
      <div class="environment-heading"><div><p class="kicker">COLLECTIONS ENVIRONMENT / EXCEPTION BOARD</p><h2 id="environment-title">The building can preserve the objects. It cannot preserve all their conditions at once.</h2><p>Preventive conservation normally reduces risk by stabilising light, moisture, temperature and handling. Catalogue 0 has translated that ordinary discipline into three fictional storage zones. The targets are intentionally plain; the contradictions belong to the collection.</p></div><div class="environment-status" aria-label="Environmental control status">BUILDING SERVICES / ZONE 0<strong>3 EXCEPTIONS OPEN</strong>No live sensors · no measurements · fictional control board</div></div>
      <div class="environment-zones" aria-label="Three fictional conservation exception zones">
        <article class="environment-zone" data-storage-zone="A"><header><span>ZONE A · PAPER / FILM</span><h3>Keep the future out of the light.</h3></header><dl><div><dt>Target</dt><dd>Cool, stable, low-light storage.</dd></div><div><dt>Assigned</dt><dd>C0.002 ticket · C0.003 map · C0.004 warranty · C0.005 film · C0.007 queue ticket · C0.011 manual.</dd></div><div><dt>Routine action</dt><dd>Box, support, limit handling, record condition.</dd></div></dl><p class="environment-conflict"><strong>Exception A0</strong>C0.005 is labelled “Exposure: Tomorrow,” while its fictional processing log says completion came first. Darkness may protect the material; the catalogue cannot say whether it also postpones the event.</p></article>
        <article class="environment-zone" data-storage-zone="B"><header><span>ZONE B · BUILDING FABRIC</span><h3>Do not move the thing whose evidence is that it stayed.</h3></header><dl><div><dt>Target</dt><dd>Dry storage with clear access and stable mounting.</dd></div><div><dt>Assigned</dt><dd>C0.001 key · C0.006 exit sign · C0.012 room plaque.</dd></div><div><dt>Routine action</dt><dd>Remove load, isolate corrosion, secure loose fittings.</dd></div></dl><p class="environment-conflict"><strong>Exception B0</strong>C0.006 became accession-worthy because the temporary sign apparently outlasted the wall it redirected around. Removing it would improve storage and erase the institutional absurdity that justified keeping it.</p></article>
        <article class="environment-zone" data-storage-zone="C"><header><span>ZONE C · OPTICAL / UNASSIGNED</span><h3>Measure without demanding that the object cooperate.</h3></header><dl><div><dt>Target</dt><dd>Stable illumination, repeatable imaging, sealed storage.</dd></div><div><dt>Assigned</dt><dd>C0.008 object label · C0.009 postcard · C0.010 boxed shadow.</dd></div><div><dt>Routine action</dt><dd>Photograph, compare, quarantine unexplained change.</dd></div></dl><p class="environment-conflict"><strong>Exception C0</strong>C0.010 is catalogued as a fixed shadow that refuses reproduction. The normal conservation record depends on repeatable images; this fictional object makes “document the condition” the condition that cannot be met.</p></article>
      </div><p class="environment-order"><strong>Standing order 0:</strong> Do not optimise the collection into normality. Stabilise the material where possible; preserve the contradiction only as a clearly fictional catalogue fact.</p>`;
    catalogue.before(section);
  };

  const installIpmStandingOrder = () => {
    const sweep = document.querySelector('.ipm-sweep');
    const order = document.querySelector('.environment-order');
    if (!sweep || !order) return;
    const note = document.createElement('span');
    note.className = 'environment-ipm-order';
    note.innerHTML = '<strong>IPM standing duty:</strong> inspect thresholds, service edges and storage perimeters as ordinary building clues. A finding may change where staff look next; it never changes an accession’s provenance or authenticates a contradiction.';
    order.append(note);
    sweep.remove();
  };

  const installTransferDesk = () => {
    const catalogueRule = document.querySelector('.catalogue-rule');
    if (!catalogueRule || document.querySelector('#transfer-desk') || !records.length) return;
    const desk = document.createElement('aside');
    desk.className = 'transfer-desk';
    desk.id = 'transfer-desk';
    desk.setAttribute('aria-labelledby', 'transfer-title');
    desk.innerHTML = `<header><div><p class="kicker">COLLECTIONS TRANSFER / HANDLING DESK</p><h3 id="transfer-title">Every object gets a route. No route resolves the object.</h3><p>Open any accession record below. This docket follows that existing record through the fictional storage plan and states the ordinary handling action that can proceed without pretending its provenance problem has been solved.</p></div><span class="transfer-stamp">MOVEMENT COPY · LOCAL ONLY</span></header><dl class="transfer-grid"><div><dt>Current accession</dt><dd><strong data-transfer-accession>NO ACCESSION SELECTED</strong><span data-transfer-title>Open a record below to issue a movement copy.</span></dd></div><div><dt>Storage route</dt><dd data-transfer-zone>PENDING ACCESSION</dd></div><div><dt>Handling order</dt><dd data-transfer-action>No handling order issued.</dd></div></dl><div class="transfer-route-row"><p class="transfer-route" data-transfer-route aria-hidden="true">CATALOGUE 0 → ROUTE PENDING</p><a class="transfer-trace" data-transfer-trace href="#environment-board" hidden>TRACE STORAGE ROUTE ↑</a></div><p class="transfer-hold"><strong>Contradiction hold</strong><span data-transfer-hold>No contradiction hold issued.</span></p>`;
    catalogueRule.after(desk);
  };

  const markReshelved = (record) => {
    if (!record) return;
    if (reshelvedRecord && reshelvedRecord !== record) reshelvedRecord.removeAttribute('data-reshelved');
    reshelvedRecord = record;
    reshelvedRecord.setAttribute('data-reshelved', 'true');
  };

  const installReturnCart = () => {
    if (!controls || !records.length) return;
    controls.replaceChildren();
    controls.classList.add('return-cart-status');
    controls.setAttribute('role', 'status');
    controls.setAttribute('aria-live', 'polite');
    controls.innerHTML = '<strong>RETURN CART · EMPTY</strong><span>Open an accession directly. When you move to another record, the previous object waits here and its shelf bay remains visibly vacant until reshelving.</span>';
    const style = document.createElement('style');
    style.dataset.elsewhereReturnCart = 'true';
    style.textContent = `
      .return-cart-status{display:grid;gap:.35rem;padding:.85rem 1rem;border:1px dashed currentColor;background:rgba(229,168,38,.07);font-size:.75rem;line-height:1.45}.return-cart-status strong{color:#e5a826;font-size:.68rem;letter-spacing:.08em;text-transform:uppercase}.artifact[data-return-cart="true"]{position:relative;outline:2px dashed #e5a826;outline-offset:-4px;background:repeating-linear-gradient(135deg,rgba(229,168,38,.06) 0 10px,rgba(0,0,0,.16) 10px 20px),#161912;box-shadow:inset 0 0 0 6px rgba(0,0,0,.28)}.artifact[data-return-cart="true"] summary{margin:.55rem;border:1px dashed rgba(229,168,38,.55);background:rgba(29,32,26,.88)}.artifact[data-return-cart="true"] summary::before{content:'RETURN CART · AWAITING RESHELF · SHELF BAY VACANT';display:block;margin-bottom:.2rem;color:#e5a826;font-size:.58rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase}.artifact[data-return-cart="true"] summary::after{content:'↳ OPEN FROM CART'}.artifact[data-return-cart="true"]::after{content:'VACANT BAY';position:absolute;right:.65rem;bottom:.5rem;color:rgba(229,168,38,.7);font:800 .55rem/1 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.12em;text-transform:uppercase;pointer-events:none}.artifact[data-reshelved="true"]{box-shadow:inset 4px 0 0 #93a77c}.artifact[data-reshelved="true"] summary::before{content:'RESHELVED · RETURN COMPLETE';display:block;margin-bottom:.2rem;color:#b8c9a2;font-size:.58rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase}
      @media(prefers-contrast:more){.return-cart-status,.artifact[data-return-cart="true"],.artifact[data-return-cart="true"] summary{border-width:2px;outline-width:3px}.artifact[data-reshelved="true"]{box-shadow:inset 6px 0 0 currentColor}}@media print{.return-cart-status{display:none}.artifact[data-return-cart="true"]{outline:0;background:var(--concrete-2);box-shadow:none}.artifact[data-return-cart="true"] summary{margin:0;border:0;background:transparent}.artifact[data-return-cart="true"]::after,.artifact[data-return-cart="true"] summary::before,.artifact[data-reshelved="true"] summary::before{display:none}.artifact[data-reshelved="true"]{box-shadow:none}}
    `;
    document.head.append(style);

    for (const record of records) {
      record.addEventListener('toggle', () => {
        if (!record.open) return;
        const openedFromCart = record === returnCartRecord;
        if (record === reshelvedRecord) {
          record.removeAttribute('data-reshelved');
          reshelvedRecord = null;
        }
        if (currentRecord && currentRecord !== record) {
          if (returnCartRecord) {
            returnCartRecord.removeAttribute('data-return-cart');
            if (!openedFromCart) markReshelved(returnCartRecord);
          }
          returnCartRecord = currentRecord;
          returnCartRecord.setAttribute('data-return-cart', 'true');
        }
        currentRecord = record;
        updateTransferDesk(record);
        const cartCode = returnCartRecord ? accessionCode(returnCartRecord) : null;
        const reshelvedCode = reshelvedRecord ? accessionCode(reshelvedRecord) : null;
        controls.innerHTML = cartCode && reshelvedCode
          ? `<strong>RETURN CART · ${cartCode}</strong><span>${reshelvedCode} returned to shelf; ${cartCode} now waits in a visibly vacant bay while ${accessionCode(record)} is on the movement desk.</span>`
          : cartCode
            ? `<strong>RETURN CART · ${cartCode}</strong><span>The previously handled accession is waiting for reshelving; its shelf bay remains visibly vacant while ${accessionCode(record)} is on the movement desk.</span>`
            : `<strong>RETURN CART · EMPTY</strong><span>${accessionCode(record)} is the first accession handled this visit.</span>`;
      });
    }
  };

  const installFreightLiftConsequence = () => {
    const lift = document.querySelector('.freight-lift');
    const corridor = document.querySelector('.corridor');
    const handover = document.querySelector('#shift-handover .lost-copy');
    if (!lift || !corridor || !handover || document.querySelector('#lift-service-state')) return;
    const style = document.createElement('style');
    style.dataset.elsewhereLiftConsequence = 'true';
    style.textContent = `
      .lift-service-state{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:1rem;align-items:center;margin:1rem 0 0;padding:.8rem 1rem;border:1px dashed currentColor;background:rgba(0,0,0,.16)}.lift-service-copy{margin:0;font-size:.78rem;line-height:1.5}.lift-service-copy strong{display:block;margin-bottom:.18rem;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:.7rem;letter-spacing:.08em;text-transform:uppercase}.lift-service-toggle{min-height:44px;padding:.55rem .75rem;border:1px solid currentColor;background:transparent;color:inherit;font:800 .68rem/1.25 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.06em;text-transform:uppercase;cursor:pointer}.lift-service-toggle:hover,.lift-service-toggle:focus-visible{background:currentColor;color:#1d201a}.freight-lift.is-out-of-service{opacity:.58;outline:3px double currentColor;outline-offset:4px;text-decoration:line-through}.freight-lift.is-out-of-service span{transform:none!important}.corridor.has-lift-service-scar .freight-lift:not(.is-out-of-service)::after{content:'SERVICE INTERRUPTION · CLEARED';position:absolute;right:-.8rem;bottom:-1.1rem;padding:.3rem .45rem;border:1px solid currentColor;color:#171912;background:#e9e3d0;font:800 .58rem/1.2 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.06em;text-decoration:line-through;text-transform:uppercase;transform:rotate(-4deg);box-shadow:3px 4px 0 rgba(0,0,0,.2)}.corridor.has-lift-service-scar .corridor-note::after{content:' · cleared service tag remains for this visit';color:#e5a826}.lift-consequence{display:none;margin:.75rem 0 0;padding:.75rem 1rem;border-left:4px solid currentColor;background:rgba(229,168,38,.09);font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:.72rem;font-weight:800;letter-spacing:.04em;text-transform:uppercase;line-height:1.5}.lift-consequence.is-active{display:block}#transfer-desk[data-lift-state="out"]{box-shadow:inset 0 0 0 3px rgba(229,168,38,.18)}
      body:has(.freight-lift.is-out-of-service){--chalk:#f4e2b4;--muted:#c8ba8d;--line:rgba(229,168,38,.38);background:radial-gradient(circle at 50% 0,rgba(229,168,38,.16),transparent 34rem),linear-gradient(180deg,rgba(147,75,47,.13),transparent 42rem),#171810}
      body:has(.freight-lift.is-out-of-service) :is(.service-header,.access-bay,.corridor,.catalogue,.lost-found,.exit-board,.service-footer){border-color:rgba(229,168,38,.45)}
      body:has(.freight-lift.is-out-of-service) .corridor-plan{box-shadow:inset 0 0 90px rgba(229,168,38,.12)}
      @media(max-width:620px){.lift-service-state{grid-template-columns:1fr}.lift-service-toggle{justify-self:start}.corridor.has-lift-service-scar .freight-lift:not(.is-out-of-service)::after{right:.25rem;bottom:-1.25rem}}
      @media(prefers-contrast:more){.lift-service-state,.lift-service-toggle{border-width:2px}.freight-lift.is-out-of-service{outline-width:4px}body:has(.freight-lift.is-out-of-service){--chalk:#fff;--muted:#fff;--line:currentColor;background:#000}}
      @media(forced-colors:active){body:has(.freight-lift.is-out-of-service){forced-color-adjust:auto;background:Canvas;color:CanvasText}}
      @media(prefers-reduced-motion:reduce){.corridor.has-lift-service-scar .freight-lift:not(.is-out-of-service)::after{transform:none}}
      @media print{body:has(.freight-lift.is-out-of-service){--chalk:#000;--muted:#000;--line:#000;background:#fff;color:#000}.lift-service-toggle{display:none}.lift-consequence{border-left-width:2px}.corridor.has-lift-service-scar .freight-lift::after,.corridor.has-lift-service-scar .corridor-note::after{display:none}}
    `;
    document.head.append(style);
    const panel = document.createElement('aside');
    panel.className = 'lift-service-state';
    panel.id = 'lift-service-state';
    panel.setAttribute('aria-label', 'Freight lift service state');
    panel.innerHTML = `<p class="lift-service-copy" role="status" aria-live="polite"><strong data-lift-service-label>LIFT 0 · AVAILABLE</strong><span data-lift-service-copy>The ordinary handling route is open. Catalogue contradictions remain unaffected.</span></p><button class="lift-service-toggle" type="button" aria-pressed="false">TAKE LIFT OUT OF SERVICE</button>`;
    corridor.append(panel);
    const consequence = document.createElement('p');
    consequence.className = 'lift-consequence';
    consequence.textContent = 'ACTIVE FACILITIES CONSEQUENCE · FREIGHT LIFT UNAVAILABLE · ACCESSION MOVEMENT HOLDS IN PLACE · PROVENANCE UNCHANGED';
    handover.prepend(consequence);
    const toggle = panel.querySelector('.lift-service-toggle');
    const label = panel.querySelector('[data-lift-service-label]');
    const copy = panel.querySelector('[data-lift-service-copy]');
    const liftCaption = lift.querySelector('small');
    const originalCaption = liftCaption?.textContent || 'NO FLOOR RECORDED';
    const sync = () => {
      lift.classList.toggle('is-out-of-service', freightLiftOut);
      lift.setAttribute('aria-disabled', String(freightLiftOut));
      corridor.classList.toggle('has-lift-service-scar', liftServiceScar);
      consequence.classList.toggle('is-active', freightLiftOut);
      const desk = document.querySelector('#transfer-desk');
      if (desk) desk.dataset.liftState = freightLiftOut ? 'out' : 'available';
      label.textContent = freightLiftOut ? 'LIFT 0 · OUT OF SERVICE' : liftServiceScar ? 'LIFT 0 · AVAILABLE · SERVICE TAG CLEARED' : 'LIFT 0 · AVAILABLE';
      copy.textContent = freightLiftOut ? 'Movement work pauses at the building boundary. Objects stay where they are safely supported.' : liftServiceScar ? 'The ordinary handling route is open again. A crossed-out service tag remains on the lift for this visit; catalogue contradictions remain unaffected.' : 'The ordinary handling route is open. Catalogue contradictions remain unaffected.';
      toggle.setAttribute('aria-pressed', String(freightLiftOut));
      toggle.textContent = freightLiftOut ? 'CLEAR OUT-OF-SERVICE TAG' : 'TAKE LIFT OUT OF SERVICE';
      if (liftCaption) liftCaption.textContent = freightLiftOut ? 'OUT OF SERVICE · STABILISE IN PLACE' : originalCaption;
      if (currentRecord) updateTransferDesk(currentRecord);
    };
    lift.addEventListener('click', (event) => {
      if (!freightLiftOut) return;
      event.preventDefault();
      panel.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
    });
    toggle.addEventListener('click', () => {
      const wasOut = freightLiftOut;
      freightLiftOut = !freightLiftOut;
      if (wasOut && !freightLiftOut) liftServiceScar = true;
      sync();
    });
    sync();
  };

  const installRoomZeroRegistration = () => {
    const roomZero = document.querySelector('#artifact-c0-012');
    const corridor = document.querySelector('.corridor');
    const lift = document.querySelector('.freight-lift');
    const liftCaption = lift?.querySelector('small');
    const corridorNote = corridor?.querySelector('.corridor-note');
    if (!roomZero || !corridor || !lift || !liftCaption || !corridorNote || document.querySelector('style[data-elsewhere-room-zero]')) return;

    const originalCaption = liftCaption.textContent;
    const originalNote = corridorNote.textContent;
    const style = document.createElement('style');
    style.dataset.elsewhereRoomZero = 'true';
    style.textContent = `
      .corridor.has-room-zero-registration .freight-lift:not(.is-out-of-service){box-shadow:0 0 0 3px rgba(229,168,38,.24),7px 7px 0 rgba(0,0,0,.2)}
      .corridor.has-room-zero-registration .freight-lift::before{content:'ROOM 0? · PROVISIONAL';position:absolute;left:-1rem;top:-1.15rem;padding:.28rem .42rem;border:1px solid currentColor;background:#e9e3d0;color:#171912;font:800 .56rem/1.2 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.07em;text-transform:uppercase;transform:rotate(-3deg);box-shadow:3px 4px 0 rgba(0,0,0,.18)}
      #artifact-c0-012[open] .plaque-object{outline:3px double #e5a826;outline-offset:5px;box-shadow:7px 7px 0 rgba(229,168,38,.12)}
      @media(max-width:620px){.corridor.has-room-zero-registration .freight-lift::before{left:.2rem;top:-1.35rem}}
      @media(prefers-contrast:more){.corridor.has-room-zero-registration .freight-lift::before,#artifact-c0-012[open] .plaque-object{border-width:2px;outline-width:4px}}
      @media(prefers-reduced-motion:reduce){.corridor.has-room-zero-registration .freight-lift::before{transform:none}}
      @media print{.corridor.has-room-zero-registration .freight-lift::before{display:none}.corridor.has-room-zero-registration .freight-lift:not(.is-out-of-service),#artifact-c0-012[open] .plaque-object{box-shadow:none;outline:0}}
    `;
    document.head.append(style);
    corridorNote.setAttribute('role', 'status');
    corridorNote.setAttribute('aria-live', 'polite');

    const sync = () => {
      const registered = roomZero.open;
      corridor.classList.toggle('has-room-zero-registration', registered);
      if (registered) {
        if (!freightLiftOut) liftCaption.textContent = 'ROOM 0? · PROVISIONAL / UNRECORDED';
        corridorNote.textContent = 'C0.012 is open. The lift has started calling its unrecorded destination “Room 0”. Close the accession and the building forgets.';
      } else {
        if (!freightLiftOut) liftCaption.textContent = originalCaption;
        corridorNote.textContent = originalNote;
      }
    };

    roomZero.addEventListener('toggle', sync);
    document.querySelector('.lift-service-toggle')?.addEventListener('click', () => queueMicrotask(sync));
    sync();
  };

  const installAcclimationMaterialResponse = () => {
    const stage = document.querySelector('.acclimation-stage');
    const shell = stage?.querySelector('.acclimation-shell');
    if (!stage || !shell || document.querySelector('style[data-elsewhere-acclimation-material]')) return;
    const style = document.createElement('style');
    style.dataset.elsewhereAcclimationMaterial = 'true';
    style.textContent = `
      .acclimation-stage .acclimation-shell{position:relative;overflow:hidden;isolation:isolate;transition:background .28s ease,box-shadow .28s ease,color .28s ease}
      .acclimation-stage .acclimation-shell::before,.acclimation-stage .acclimation-shell::after{position:absolute;pointer-events:none}
      .acclimation-stage .acclimation-shell::before{content:'';inset:0;z-index:-1}
      .acclimation-stage .acclimation-shell::after{right:.45rem;bottom:.38rem;padding:.2rem .32rem;border:1px solid currentColor;background:rgba(233,227,208,.88);color:#171912;font:800 .54rem/1.2 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.06em;text-transform:uppercase}
      .acclimation-stage[data-state="cold-dry"] .acclimation-shell{background:linear-gradient(135deg,#dfe8e6 0 48%,#eef3ef 49% 64%,#cfdad8 65%);box-shadow:inset 0 0 0 3px rgba(255,255,255,.68),inset 0 0 26px rgba(177,208,214,.75);color:#1b2929}
      .acclimation-stage[data-state="cold-dry"] .acclimation-shell::before{background:repeating-linear-gradient(115deg,transparent 0 8px,rgba(255,255,255,.5) 9px 10px,transparent 11px 18px),radial-gradient(circle at 16% 20%,rgba(255,255,255,.9) 0 2px,transparent 3px),radial-gradient(circle at 77% 32%,rgba(255,255,255,.8) 0 2px,transparent 3px)}
      .acclimation-stage[data-state="cold-dry"] .acclimation-shell::after{content:'FROSTED OUTER SHELL'}
      .acclimation-stage[data-state="warm-humid"] .acclimation-shell{background:linear-gradient(135deg,#c5ae8d,#d5c5a8 58%,#ab967d);box-shadow:inset 0 0 28px rgba(255,244,220,.35);color:#231d17}
      .acclimation-stage[data-state="warm-humid"] .acclimation-shell::before{background:radial-gradient(circle at 15% 18%,rgba(255,255,255,.58) 0 3px,transparent 4px),radial-gradient(circle at 28% 64%,rgba(255,255,255,.48) 0 5px,transparent 6px),radial-gradient(circle at 62% 25%,rgba(255,255,255,.52) 0 4px,transparent 5px),radial-gradient(circle at 82% 72%,rgba(255,255,255,.44) 0 6px,transparent 7px),linear-gradient(180deg,rgba(255,255,255,.14),transparent 55%)}
      .acclimation-stage[data-state="warm-humid"] .acclimation-shell::after{content:'CONDENSATION ON OUTER SHELL'}
      .acclimation-stage[data-state="matched"] .acclimation-shell{background:linear-gradient(135deg,#d7d0bd,#e9e3d0 55%,#c8c0aa);box-shadow:inset 0 0 0 1px rgba(23,25,18,.28);color:#171912}
      .acclimation-stage[data-state="matched"] .acclimation-shell::before{background:linear-gradient(90deg,transparent 49.5%,rgba(23,25,18,.08) 50%,transparent 50.5%),linear-gradient(transparent 49.5%,rgba(23,25,18,.08) 50%,transparent 50.5%);background-size:26px 26px}
      .acclimation-stage[data-state="matched"] .acclimation-shell::after{content:'OUTER SHELL CLEAR'}
      @media(prefers-reduced-motion:reduce){.acclimation-stage .acclimation-shell{transition:none}}
      @media(prefers-contrast:more){.acclimation-stage .acclimation-shell{box-shadow:inset 0 0 0 3px currentColor}.acclimation-stage .acclimation-shell::after{border-width:2px;background:#e9e3d0}}
      @media(forced-colors:active){.acclimation-stage .acclimation-shell{forced-color-adjust:auto;background:Canvas;color:CanvasText;box-shadow:none;outline:2px solid CanvasText}.acclimation-stage .acclimation-shell::before{display:none}.acclimation-stage .acclimation-shell::after{background:Canvas;color:CanvasText}}
      @media print{.acclimation-stage .acclimation-shell{transition:none;background:transparent!important;box-shadow:none!important;color:inherit}.acclimation-stage .acclimation-shell::before,.acclimation-stage .acclimation-shell::after{display:none}}
    `;
    document.head.append(style);
  };

  installEnvironmentBoard();
  installIpmStandingOrder();
  installTransferDesk();
  installReturnCart();
  installFreightLiftConsequence();
  installRoomZeroRegistration();
  installAcclimationMaterialResponse();

  if (reducedMotion) document.documentElement.dataset.reducedMotion = 'true';
  if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js').catch(() => {}), { once: true });
})();