'use strict';

(function initialisePossibilityEngine() {
  const core = window.MuseumPossibilityEngineCore;
  if (!core) return;

  const caseButtons = [...document.querySelectorAll('[data-success-case-id]')];
  const caseTitle = document.querySelector('#success-case-title');
  const caseQuestion = document.querySelector('#success-case-question');
  const caseMap = document.querySelector('#success-case-map');
  const progress = document.querySelector('#success-progress');
  const evidenceTitle = document.querySelector('#success-evidence-title');
  const evidenceBody = document.querySelector('#success-evidence-body');
  const possibilityList = document.querySelector('#success-possibilities');
  const applyButton = document.querySelector('#success-apply');
  const resetButton = document.querySelector('#success-reset');
  const archiveHeading = document.querySelector('.success-archive-heading');
  const archiveGrid = document.querySelector('.success-archive-grid');

  if (!caseButtons.length || !caseTitle || !caseQuestion || !caseMap || !progress ||
      !evidenceTitle || !evidenceBody || !possibilityList || !applyButton || !resetButton ||
      !archiveHeading || !archiveGrid) return;

  const archiveEyebrow = archiveHeading.querySelector('.eyebrow');
  const archiveTitle = archiveHeading.querySelector('h3');
  const archiveIntro = archiveHeading.querySelector(':scope > p');

  let activeCaseId = caseButtons.find((button) => button.dataset.active === 'true')?.dataset.successCaseId
    || core.SUCCESS_CASES[0]?.id;
  let evidenceCount = 0;

  function selectCaseButton(id) {
    for (const button of caseButtons) {
      const active = button.dataset.successCaseId === id;
      button.dataset.active = String(active);
      button.setAttribute('aria-pressed', String(active));
    }
  }

  function possibilityCard(item) {
    const card = document.createElement('article');
    card.className = 'possibility-card';
    card.dataset.status = item.status;

    const label = document.createElement('p');
    label.className = 'possibility-label';
    label.textContent = item.label;

    const status = document.createElement('strong');
    status.className = 'possibility-status';
    status.textContent = core.statusLabel(item.status);

    const gauge = document.createElement('span');
    gauge.className = 'possibility-gauge';
    gauge.setAttribute('aria-hidden', 'true');
    const fill = document.createElement('span');
    fill.className = 'possibility-gauge-fill';
    gauge.append(fill);

    card.append(label, status, gauge);
    return card;
  }

  function archiveRecord(snapshot) {
    const record = document.createElement('article');
    record.className = 'success-record';

    const hinge = document.createElement('p');
    hinge.className = 'archive-hinge';
    hinge.textContent = snapshot.archive.hinge;

    const title = document.createElement('h4');
    title.textContent = snapshot.label;

    const result = document.createElement('p');
    result.textContent = snapshot.archive.result;

    const source = document.createElement('span');
    source.className = 'archive-source';
    source.textContent = `Historical source record · ${snapshot.archive.source}`;

    record.append(hinge, title, result, source);
    return record;
  }

  function renderArchive(snapshot, complete) {
    archiveHeading.hidden = !complete;
    archiveGrid.hidden = !complete;
    if (!complete) return;

    archiveGrid.dataset.earnedArchive = 'true';
    if (archiveEyebrow) archiveEyebrow.textContent = 'SUCCESS ARCHIVE · EVIDENCE RUN COMPLETE';
    if (archiveTitle) archiveTitle.textContent = 'Archive reached.';
    if (archiveIntro) {
      archiveIntro.textContent = 'The record appears only after this fixed evidence sequence reaches its end. It files what changed without pretending the surviving explanation closes the wider question.';
    }
    archiveGrid.replaceChildren(archiveRecord(snapshot));
  }

  function render() {
    const snapshot = core.possibilitySnapshot(activeCaseId, evidenceCount);
    if (!snapshot) return;

    evidenceCount = snapshot.evidenceCount;
    selectCaseButton(snapshot.id);
    caseTitle.textContent = snapshot.label;
    caseQuestion.textContent = snapshot.question;
    caseMap.textContent = snapshot.startingMap;
    progress.textContent = `Evidence ${snapshot.evidenceCount} of ${snapshot.evidenceTotal}`;

    if (snapshot.currentEvidence) {
      evidenceTitle.textContent = snapshot.currentEvidence.title;
      evidenceBody.textContent = snapshot.currentEvidence.body;
    } else {
      evidenceTitle.textContent = 'Chamber ready';
      evidenceBody.textContent = 'No evidence has been applied yet. Every listed possibility starts open.';
    }

    possibilityList.replaceChildren(...snapshot.possibilities.map(possibilityCard));
    const complete = snapshot.evidenceCount >= snapshot.evidenceTotal;
    applyButton.disabled = complete;
    applyButton.textContent = complete ? 'Archive reached' : 'Apply next evidence';
    resetButton.disabled = snapshot.evidenceCount === 0;
    renderArchive(snapshot, complete);
  }

  for (const button of caseButtons) {
    button.addEventListener('click', () => {
      activeCaseId = button.dataset.successCaseId;
      evidenceCount = 0;
      render();
    });
  }

  applyButton.addEventListener('click', () => {
    evidenceCount += 1;
    render();
  });

  resetButton.addEventListener('click', () => {
    evidenceCount = 0;
    render();
  });

  render();
})();