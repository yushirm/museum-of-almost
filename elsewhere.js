'use strict';

(() => {
  const records = [...document.querySelectorAll('[data-artifact]')];
  const button = document.querySelector('#misfile-button');
  const status = document.querySelector('#misfile-status');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let cursor = -1;
  let freightLiftOut = false;

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

  const cycleCountSteps = Object.freeze([
    {
      zone: 'ZONE A · PAPER / FILM',
      expected: '6 accessions',
      located: '6 accessions',
      reconciliation: 'Location and accession identifiers agree for C0.002, C0.003, C0.004, C0.005, C0.007 and C0.011.',
      boundary: 'The count confirms custody. It does not validate the unbuilt railway, missing geography, future-facing film label, queue chronology or absent Model 0.'
    },
    {
      zone: 'ZONE B · BUILDING FABRIC',
      expected: '3 accessions',
      located: '3 accessions',
      reconciliation: 'C0.001, C0.006 and C0.012 are physically accounted for in their assigned building-fabric zone.',
      boundary: 'A shelf check cannot prove that Room 0 existed, that the exit was temporary, or that the key ever belonged to a real lock.'
    },
    {
      zone: 'ZONE C · OPTICAL / UNASSIGNED',
      expected: '3 accessions',
      located: '3 accessions',
      reconciliation: 'C0.008, C0.009 and the sealed container catalogued as C0.010 are present at the recorded location.',
      boundary: 'Presence of the box is not independent verification of the boxed shadow, the island, or the calendar object described by their records.'
    },
    {
      zone: 'CYCLE COUNT COMPLETE',
      expected: '12 accessions',
      located: '12 accessions',
      reconciliation: 'No location discrepancy found in this fixed fictional count. The store can account for every accession it claims to hold.',
      boundary: 'Inventory reconciliation proves custody and location only. Twelve objects present does not make twelve impossible provenances true.'
    }
  ]);

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
    if (actionNode) actionNode.textContent = freightLiftOut ? `HOLD IN PLACE — freight lift unavailable. ${route.action}` : route.action;
    if (holdNode) holdNode.textContent = route.hold;
    if (routeNode) routeNode.textContent = freightLiftOut
      ? `CATALOGUE 0 · ${accessionCode} · MOVEMENT PAUSED · FREIGHT LIFT OUT OF SERVICE`
      : `CATALOGUE 0 → ZONE ${route.zoneId} → CONTRADICTION HOLD`;
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
      .salvage-drawer,.dependency-drawer,.cycle-drawer{margin:1rem 0 0;border:1px dashed currentColor;background:rgba(0,0,0,.1)}
      .salvage-drawer summary,.dependency-drawer summary,.cycle-drawer summary{display:flex;align-items:center;justify-content:space-between;gap:1rem;min-height:48px;padding:.75rem 1rem;cursor:pointer;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:.75rem;font-weight:800;letter-spacing:.07em;text-transform:uppercase}
      .salvage-drawer summary::after{content:'OPEN CARD +';white-space:nowrap;font-size:.68rem}
      .dependency-drawer summary::after{content:'TRACE DEPENDENCIES +';white-space:nowrap;font-size:.68rem}
      .cycle-drawer summary::after{content:'OPEN REGISTER +';white-space:nowrap;font-size:.68rem}
      .salvage-drawer[open] summary,.dependency-drawer[open] summary,.cycle-drawer[open] summary{border-bottom:1px dashed currentColor}
      .salvage-drawer[open] summary::after{content:'CLOSE CARD −'}
      .dependency-drawer[open] summary::after{content:'CLOSE MAP −'}
      .cycle-drawer[open] summary::after{content:'CLOSE REGISTER −'}
      .salvage-intro,.dependency-intro,.cycle-intro{margin:0;padding:1rem 1rem .25rem;max-width:74ch}
      .salvage-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0;margin:1rem}
      .salvage-case{padding:1rem;border:1px solid currentColor;background:rgba(0,0,0,.12)}
      .salvage-case:nth-child(even){border-left:0}
      .salvage-case:nth-child(n+3){border-top:0}
      .salvage-case h3{margin:0 0 .65rem;font-size:1rem}
      .salvage-case p{margin:.4rem 0;font-size:.9rem;line-height:1.5}
      .salvage-case strong{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:.68rem;letter-spacing:.06em;text-transform:uppercase}
      .salvage-rule,.dependency-rule,.cycle-rule{margin:0 1rem 1rem;padding:1rem;border-left:4px solid currentColor;background:rgba(229,168,38,.07)}
      .salvage-rule strong,.dependency-rule strong,.cycle-rule strong{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;text-transform:uppercase}
      .dependency-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1px;margin:1rem;background:currentColor;border:1px solid currentColor}
      .dependency-service{padding:1rem;background:#1d201a}
      .dependency-service h3{margin:0 0 .7rem;font-size:1rem}
      .dependency-service dl{margin:0;display:grid;gap:.65rem}
      .dependency-service dl div{display:grid;grid-template-columns:7.5rem 1fr;gap:.75rem}
      .dependency-service dt{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:.68rem;letter-spacing:.06em;text-transform:uppercase;opacity:.72}
      .dependency-service dd{margin:0;font-size:.9rem;line-height:1.45}
      .cycle-console{margin:1rem;border:1px solid currentColor;background:rgba(0,0,0,.14)}
      .cycle-console header{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:1rem;border-bottom:1px solid currentColor}
      .cycle-console button{min-height:44px;padding:.55rem .8rem;border:1px solid currentColor;background:transparent;color:inherit;font:800 .72rem/1 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.06em;text-transform:uppercase;cursor:pointer}
      .cycle-console button:hover,.cycle-console button:focus-visible{background:currentColor;color:#1d201a}
      .cycle-console dl{margin:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}
      .cycle-console dl div{padding:1rem}
      .cycle-console dl div:nth-child(even){border-left:1px solid currentColor}
      .cycle-console dl div:nth-child(n+3){border-top:1px solid currentColor}
      .cycle-console dt{margin-bottom:.35rem;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:.68rem;letter-spacing:.06em;text-transform:uppercase;opacity:.72}
      .cycle-console dd{margin:0;line-height:1.5}
      .cycle-status{margin:0;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:.72rem;font-weight:800;letter-spacing:.05em;text-transform:uppercase}
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
      @media (max-width:620px){.salvage-grid,.dependency-grid,.cycle-console dl{grid-template-columns:1fr}.salvage-case:nth-child(even),.salvage-case:nth-child(n+3){border-left:1px solid currentColor}.salvage-case+.salvage-case{border-top:0}.cycle-console dl div:nth-child(even){border-left:0}.cycle-console dl div+div{border-top:1px solid currentColor}.transfer-route-row{align-items:stretch;flex-direction:column}.transfer-trace{align-self:flex-start}}
      @media (max-width:520px){.transfer-desk header{grid-template-columns:1fr}.transfer-stamp{justify-self:start}.salvage-drawer summary,.dependency-drawer summary,.cycle-drawer summary,.cycle-console header{align-items:flex-start;flex-direction:column}.dependency-service dl div{grid-template-columns:1fr;gap:.15rem}}
      @media (max-width:420px){.environment-board{padding:1rem}.environment-zone dl div{grid-template-columns:1fr;gap:.15rem}.environment-zone.is-active-route::after{position:static;display:block;margin:.65rem .65rem 0;width:max-content;max-width:calc(100% - 1.3rem)}}
      @media (prefers-contrast:more){.environment-board,.environment-zone,.environment-zone header,.salvage-drawer,.dependency-drawer,.cycle-drawer,.salvage-case,.dependency-grid,.cycle-console,.cycle-console header,.cycle-console button,.cycle-console dl div,.transfer-desk,.transfer-desk header,.transfer-grid>div+div,.transfer-trace{border-width:2px}.environment-status{border-width:2px}.environment-zone.is-active-route{outline-width:4px}}
      @media print{.environment-board{box-shadow:none}.environment-zone,.salvage-drawer,.dependency-drawer,.cycle-drawer,.salvage-case,.dependency-service,.cycle-console,.transfer-desk{break-inside:avoid}.salvage-drawer:not([open])>*:not(summary),.dependency-drawer:not([open])>*:not(summary),.cycle-drawer:not([open])>*:not(summary){display:block}.environment-zone.is-active-route{outline:0}.environment-zone.is-active-route::after,.transfer-trace,.cycle-console button{display:none}}
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
      <details class="dependency-drawer">
        <summary>BUILDING SERVICES / DEPENDENCY MAP · ONE ORDINARY FAILURE CAN REACH SEVERAL IMPOSSIBLE OBJECTS</summary>
        <p class="dependency-intro">Reliability engineering asks which functions depend on the same supporting service before that service fails. Catalogue 0 applies the same question to the building. These are not predictions or live alarms: they are a fictional maintenance map showing where ordinary infrastructure couples otherwise unrelated accessions.</p>
        <div class="dependency-grid" aria-label="Fictional building-service dependencies across Catalogue 0">
          <article class="dependency-service">
            <h3>01 · HVAC / HUMIDITY CONTROL</h3>
            <dl>
              <div><dt>Supports</dt><dd>Zone A paper and film; stable sealed storage in Zone C.</dd></div>
              <div><dt>Couples</dt><dd>C0.002–005, C0.007, C0.008–011 can share one mundane environmental failure despite unrelated provenance.</dd></div>
              <div><dt>Work order</dt><dd>Freeze non-essential movement; stabilise the room before interpreting any apparent object change.</dd></div>
            </dl>
          </article>
          <article class="dependency-service">
            <h3>02 · CONTROLLED LIGHT / IMAGING POWER</h3>
            <dl>
              <div><dt>Supports</dt><dd>Zone C comparison photography and condition documentation.</dd></div>
              <div><dt>Couples</dt><dd>C0.008 label, C0.009 postcard and C0.010 boxed shadow all become less documentable at once.</dd></div>
              <div><dt>Work order</dt><dd>Record the documentation gap. Do not convert missing images into evidence of object behaviour.</dd></div>
            </dl>
          </article>
          <article class="dependency-service">
            <h3>03 · DRAINAGE / WATER ISOLATION</h3>
            <dl>
              <div><dt>Supports</dt><dd>Dry storage across Zone A and lower-level circulation.</dd></div>
              <div><dt>Couples</dt><dd>A leak can threaten six paper/film accessions while also closing the route needed to move them safely.</dd></div>
              <div><dt>Work order</dt><dd>Stop the water, isolate electrics where required, then salvage by material vulnerability rather than catalogue drama.</dd></div>
            </dl>
          </article>
          <article class="dependency-service">
            <h3>04 · FREIGHT LIFT / SERVICE CORRIDOR</h3>
            <dl>
              <div><dt>Supports</dt><dd>All accession movement between Catalogue 0, conservation zones and the rest of the museum.</dd></div>
              <div><dt>Couples</dt><dd>Every route can become unavailable without changing a single object's assigned storage destination.</dd></div>
              <div><dt>Work order</dt><dd>Stabilise in place and reopen the route. A transport failure is not a provenance event.</dd></div>
            </dl>
          </article>
        </div>
        <p class="dependency-rule"><strong>Dependency rule 0:</strong> Shared failure does not imply shared origin. When several accessions change status together, inspect the building before inventing a relationship among the objects.</p>
      </details>
      <details class="cycle-drawer">
        <summary>COLLECTIONS RECONCILIATION / CYCLE COUNT · FIND THE OBJECT WITHOUT PROVING THE STORY</summary>
        <p class="cycle-intro">Inventory control asks a narrower question than provenance research: is the accession physically where the register says it is? Catalogue 0 can answer that ordinary custody question without treating an impossible history as verified fact.</p>
        <div class="cycle-console">
          <header>
            <p class="cycle-status" data-cycle-status role="status" aria-live="polite">Cycle count not started. Three storage zones await reconciliation.</p>
            <button type="button" data-cycle-next>COUNT NEXT ZONE</button>
          </header>
          <dl>
            <div><dt>Count position</dt><dd data-cycle-zone>NOT STARTED</dd></div>
            <div><dt>Expected / located</dt><dd><span data-cycle-expected>—</span> / <span data-cycle-located>—</span></dd></div>
            <div><dt>Reconciliation</dt><dd data-cycle-reconciliation>Run the fixed local count to compare the three established storage zones with their existing accession assignments.</dd></div>
            <div><dt>Audit boundary</dt><dd data-cycle-boundary>Physical custody and impossible provenance are different questions.</dd></div>
          </dl>
        </div>
        <p class="cycle-rule"><strong>Inventory rule 0:</strong> Located is not authenticated. A cycle count can prove where the museum put something; it cannot prove the world once made the thing described on its label.</p>
      </details>
      <p class="environment-order"><strong>Standing order 0:</strong> Do not optimise the collection into normality. Stabilise the material where possible; preserve the contradiction only as a clearly fictional catalogue fact.</p>
    `;

    catalogue.before(section);

    const cycleButton = section.querySelector('[data-cycle-next]');
    if (cycleButton) {
      let cycleCursor = -1;
      const cycleStatus = section.querySelector('[data-cycle-status]');
      const zoneNode = section.querySelector('[data-cycle-zone]');
      const expectedNode = section.querySelector('[data-cycle-expected]');
      const locatedNode = section.querySelector('[data-cycle-located]');
      const reconciliationNode = section.querySelector('[data-cycle-reconciliation]');
      const boundaryNode = section.querySelector('[data-cycle-boundary]');

      cycleButton.addEventListener('click', () => {
        cycleCursor += 1;
        if (cycleCursor >= cycleCountSteps.length) cycleCursor = 0;
        const step = cycleCountSteps[cycleCursor];
        if (zoneNode) zoneNode.textContent = step.zone;
        if (expectedNode) expectedNode.textContent = step.expected;
        if (locatedNode) locatedNode.textContent = step.located;
        if (reconciliationNode) reconciliationNode.textContent = step.reconciliation;
        if (boundaryNode) boundaryNode.textContent = step.boundary;
        if (cycleStatus) cycleStatus.textContent = cycleCursor === cycleCountSteps.length - 1
          ? 'Cycle count complete: twelve of twelve accessions located; provenance remains unaudited.'
          : `Cycle count ${cycleCursor + 1} of 3: ${step.zone}.`;
        cycleButton.textContent = cycleCursor === cycleCountSteps.length - 1 ? 'RESTART CYCLE COUNT' : 'COUNT NEXT ZONE';
      });
    }
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

  const installFreightLiftConsequence = () => {
    const lift = document.querySelector('.freight-lift');
    const corridor = document.querySelector('.corridor');
    const handover = document.querySelector('#shift-handover .lost-copy');
    if (!lift || !corridor || !handover || document.querySelector('#lift-service-state')) return;

    const style = document.createElement('style');
    style.dataset.elsewhereLiftConsequence = 'true';
    style.textContent = `
      .lift-service-state{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:1rem;align-items:center;margin:1rem 0 0;padding:.8rem 1rem;border:1px dashed currentColor;background:rgba(0,0,0,.16)}
      .lift-service-copy{margin:0;font-size:.78rem;line-height:1.5}.lift-service-copy strong{display:block;margin-bottom:.18rem;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:.7rem;letter-spacing:.08em;text-transform:uppercase}
      .lift-service-toggle{min-height:44px;padding:.55rem .75rem;border:1px solid currentColor;background:transparent;color:inherit;font:800 .68rem/1.25 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.06em;text-transform:uppercase;cursor:pointer}
      .lift-service-toggle:hover,.lift-service-toggle:focus-visible{background:currentColor;color:#1d201a}
      .freight-lift.is-out-of-service{opacity:.58;outline:3px double currentColor;outline-offset:4px;text-decoration:line-through}.freight-lift.is-out-of-service span{transform:none!important}
      .lift-consequence{display:none;margin:.75rem 0 0;padding:.75rem 1rem;border-left:4px solid currentColor;background:rgba(229,168,38,.09);font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:.72rem;font-weight:800;letter-spacing:.04em;text-transform:uppercase;line-height:1.5}
      .lift-consequence.is-active{display:block}
      #transfer-desk[data-lift-state="out"]{box-shadow:inset 0 0 0 3px rgba(229,168,38,.18)}
      @media(max-width:620px){.lift-service-state{grid-template-columns:1fr}.lift-service-toggle{justify-self:start}}
      @media(prefers-contrast:more){.lift-service-state,.lift-service-toggle{border-width:2px}.freight-lift.is-out-of-service{outline-width:4px}}
      @media(prefers-reduced-motion:reduce){.freight-lift.is-out-of-service span{transform:none!important}}
      @media print{.lift-service-toggle{display:none}.lift-consequence{border-left-width:2px}}
    `;
    document.head.append(style);

    const panel = document.createElement('aside');
    panel.className = 'lift-service-state';
    panel.id = 'lift-service-state';
    panel.setAttribute('aria-label', 'Freight lift service state');
    panel.innerHTML = `
      <p class="lift-service-copy" role="status" aria-live="polite"><strong data-lift-service-label>LIFT 0 · AVAILABLE</strong><span data-lift-service-copy>The ordinary handling route is open. Catalogue contradictions remain unaffected.</span></p>
      <button class="lift-service-toggle" type="button" aria-pressed="false">TAKE LIFT OUT OF SERVICE</button>
    `;
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
      consequence.classList.toggle('is-active', freightLiftOut);
      const desk = document.querySelector('#transfer-desk');
      if (desk) desk.dataset.liftState = freightLiftOut ? 'out' : 'available';
      if (label) label.textContent = freightLiftOut ? 'LIFT 0 · OUT OF SERVICE' : 'LIFT 0 · AVAILABLE';
      if (copy) copy.textContent = freightLiftOut
        ? 'Movement work pauses at the building boundary. Objects stay where they are safely supported.'
        : 'The ordinary handling route is open. Catalogue contradictions remain unaffected.';
      if (toggle) {
        toggle.setAttribute('aria-pressed', String(freightLiftOut));
        toggle.textContent = freightLiftOut ? 'CLEAR OUT-OF-SERVICE TAG' : 'TAKE LIFT OUT OF SERVICE';
      }
      if (liftCaption) liftCaption.textContent = freightLiftOut ? 'OUT OF SERVICE · STABILISE IN PLACE' : originalCaption;
      const openRecordNow = records.find((record) => record.open);
      if (openRecordNow) updateTransferDesk(openRecordNow);
      else if (desk) {
        const routeNode = desk.querySelector('[data-transfer-route]');
        const actionNode = desk.querySelector('[data-transfer-action]');
        if (routeNode) routeNode.textContent = freightLiftOut ? 'CATALOGUE 0 · ALL MOVEMENT PAUSED · FREIGHT LIFT OUT OF SERVICE' : 'CATALOGUE 0 → ROUTE PENDING';
        if (actionNode) actionNode.textContent = freightLiftOut ? 'Hold accessions in their current safe locations until the ordinary service route returns.' : 'No handling order issued.';
      }
    };

    lift.addEventListener('click', (event) => {
      if (!freightLiftOut) return;
      event.preventDefault();
      panel.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
    });
    toggle.addEventListener('click', () => {
      freightLiftOut = !freightLiftOut;
      sync();
    });
    sync();
  };

  if (button) {
    button.addEventListener('click', () => openRecord(cursor + 1));
  }

  installEnvironmentBoard();
  installTransferDesk();
  installFreightLiftConsequence();

  if (reducedMotion) {
    document.documentElement.dataset.reducedMotion = 'true';
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js').catch(() => {});
    }, { once: true });
  }
})();