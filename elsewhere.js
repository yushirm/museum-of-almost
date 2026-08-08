'use strict';

(() => {
  const records = [...document.querySelectorAll('[data-artifact]')];
  const button = document.querySelector('#misfile-button');
  const status = document.querySelector('#misfile-status');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let cursor = -1;

  const closeAll = () => {
    for (const record of records) record.open = false;
  };

  const openRecord = (index) => {
    if (!records.length) return;
    cursor = ((index % records.length) + records.length) % records.length;
    closeAll();
    const record = records[cursor];
    record.open = true;
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
      .environment-zone{display:flex;flex-direction:column;min-height:100%;border:1px solid currentColor;background:rgba(0,0,0,.14)}
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
      @media (max-width:800px){.environment-heading,.environment-zones{grid-template-columns:1fr}.environment-zone dl div{grid-template-columns:6.5rem 1fr}}
      @media (max-width:420px){.environment-board{padding:1rem}.environment-zone dl div{grid-template-columns:1fr;gap:.15rem}}
      @media (prefers-contrast:more){.environment-board,.environment-zone,.environment-zone header{border-width:2px}.environment-status{border-width:2px}}
      @media print{.environment-board{box-shadow:none;break-inside:avoid}.environment-zone{break-inside:avoid}}
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
        <article class="environment-zone">
          <header><span>ZONE A · PAPER / FILM</span><h3>Keep the future out of the light.</h3></header>
          <dl>
            <div><dt>Target</dt><dd>Cool, stable, low-light storage.</dd></div>
            <div><dt>Assigned</dt><dd>C0.002 ticket · C0.003 map · C0.005 film canister.</dd></div>
            <div><dt>Routine action</dt><dd>Box, support, limit handling, record condition.</dd></div>
          </dl>
          <p class="environment-conflict"><strong>Exception A0</strong>C0.005 is labelled “Exposure: Tomorrow,” while its fictional processing log says completion came first. Darkness may protect the material; the catalogue cannot say whether it also postpones the event.</p>
        </article>
        <article class="environment-zone">
          <header><span>ZONE B · BUILDING FABRIC</span><h3>Do not move the thing whose evidence is that it stayed.</h3></header>
          <dl>
            <div><dt>Target</dt><dd>Dry storage with clear access and stable mounting.</dd></div>
            <div><dt>Assigned</dt><dd>C0.001 key · C0.006 exit sign · C0.012 room plaque.</dd></div>
            <div><dt>Routine action</dt><dd>Remove load, isolate corrosion, secure loose fittings.</dd></div>
          </dl>
          <p class="environment-conflict"><strong>Exception B0</strong>C0.006 became accession-worthy because the temporary sign apparently outlasted the wall it redirected around. Removing it would improve storage and erase the institutional absurdity that justified keeping it.</p>
        </article>
        <article class="environment-zone">
          <header><span>ZONE C · OPTICAL / UNASSIGNED</span><h3>Measure without demanding that the object cooperate.</h3></header>
          <dl>
            <div><dt>Target</dt><dd>Stable illumination, repeatable imaging, sealed storage.</dd></div>
            <div><dt>Assigned</dt><dd>C0.009 postcard · C0.010 boxed shadow · C0.008 object label.</dd></div>
            <div><dt>Routine action</dt><dd>Photograph, compare, quarantine unexplained change.</dd></div>
          </dl>
          <p class="environment-conflict"><strong>Exception C0</strong>C0.010 is catalogued as a fixed shadow that refuses reproduction. The normal conservation record depends on repeatable images; this fictional object makes “document the condition” the condition that cannot be met.</p>
        </article>
      </div>
      <p class="environment-order"><strong>Standing order 0:</strong> Do not optimise the collection into normality. Stabilise the material where possible; preserve the contradiction only as a clearly fictional catalogue fact.</p>
    `;

    catalogue.before(section);
  };

  if (button) {
    button.addEventListener('click', () => openRecord(cursor + 1));
  }

  installEnvironmentBoard();

  if (reducedMotion) {
    document.documentElement.dataset.reducedMotion = 'true';
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js').catch(() => {});
    }, { once: true });
  }
})();
