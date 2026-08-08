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

  function addFreeGraphicsBoutique() {
    const weblog = document.querySelector('.two-column');
    if (!weblog || document.getElementById('free-graphics-boutique')) return;

    const section = document.createElement('section');
    section.id = 'free-graphics-boutique';
    section.className = 'webring';
    section.setAttribute('aria-labelledby', 'free-graphics-title');

    const title = document.createElement('h2');
    title.id = 'free-graphics-title';
    title.textContent = '~* FREE GRAPHICS BOUTIQUE *~';

    const intro = document.createElement('p');
    intro.append(
      document.createTextNode('I have spent most of this homepage arranging little files into scenery. Today I discovered a link can point at the file itself. So: '),
      strong('PLEASE TAKE SOMETHING HOME.'),
      document.createTextNode(' These are the same local GIFs already living on this page, offered directly instead of pretending they belong only to me.')
    );

    const shelf = document.createElement('p');
    shelf.setAttribute('aria-label', 'Five local homepage graphics available to download');

    const graphics = [
      ['COMET.GIF', 'assets/web1/comet.gif'],
      ['ALIEN.GIF', 'assets/web1/alien.gif'],
      ['STARS.GIF', 'assets/web1/stars.gif'],
      ['CONSTRUCTION.GIF', 'assets/web1/construction.gif'],
      ['HAND-CODED.GIF', 'assets/web1/hand-coded.gif']
    ];

    graphics.forEach(([label, href], index) => {
      if (index > 0) shelf.append(document.createTextNode(' '));
      const link = document.createElement('a');
      link.href = href;
      link.download = '';
      link.textContent = `[ DOWNLOAD ${label} ]`;
      shelf.append(link);
    });

    const note = document.createElement('p');
    note.className = 'smallprint';
    note.append(
      strong('FREE GRAPHICS POLICY:'),
      document.createTextNode(' every link above points to a repository-local asset already used by ALMOST ONLINE!. No counter increments, no request is sent to a third party, and the page does not learn whether you saved anything. The browser decides how to handle the download.')
    );

    const afterthought = document.createElement('p');
    afterthought.className = 'smallprint';
    afterthought.textContent = 'I thought a homepage was a place where I showed you things. Apparently it can also be a tiny supply cupboard.';

    section.append(title, intro, shelf, note, afterthought);
    weblog.insertAdjacentElement('beforebegin', section);

    const updates = document.querySelector('.updates');
    if (updates && !document.getElementById('free-graphics-update')) {
      const item = document.createElement('li');
      item.id = 'free-graphics-update';
      const date = document.createElement('strong');
      date.textContent = '08 AUG:';
      item.append(date, document.createTextNode(' OPENED FREE GRAPHICS BOUTIQUE. TAKE ONE. I WILL NOT KNOW.'));
      updates.prepend(item);
    }
  }

  function strong(text) {
    const element = document.createElement('strong');
    element.textContent = text;
    return element;
  }

  addPageFourRumor();
  addFreeGraphicsBoutique();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  }
})();