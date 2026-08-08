'use strict';

(() => {
  function addPageFourRumor() {
    const marquee = document.querySelector('.marquee');
    if (marquee && !document.getElementById('page-four-rumor')) {
      const rumor = document.createElement('p');
      rumor.id = 'page-four-rumor';
      rumor.className = 'tiny-nav';
      rumor.append(document.createTextNode('*** UNLISTED BULLETIN: PAGE FOUR REFUSES TO STAY SECRET. DEEP SPACE NOW REPORTS THE SAME ANOMALY. '));
      const link = document.createElement('a');
      link.href = 'page-four.html';
      link.textContent = '[ OPEN THE UNFILED ARCHIVE ]';
      rumor.append(link, document.createTextNode(' ***'));
      marquee.insertAdjacentElement('afterend', rumor);
    }

    const coolStuff = document.querySelector('.sidebar .side-box ul');
    if (coolStuff && !coolStuff.querySelector('a[href="page-four.html"]')) {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = 'page-four.html';
      link.textContent = "THE PAGE THAT WASN'T THERE";
      item.append(link);
      coolStuff.append(item);
    }

    const updates = document.querySelector('.updates');
    if (updates && !document.getElementById('page-four-update')) {
      const item = document.createElement('li');
      item.id = 'page-four-update';
      const date = document.createElement('strong');
      date.textContent = '08 AUG:';
      item.append(date, document.createTextNode(' PAGE FOUR REFUSES TO STAY SECRET. DEEP SPACE SAW IT TOO.'));
      updates.prepend(item);
    }
  }

  addPageFourRumor();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  }
})();