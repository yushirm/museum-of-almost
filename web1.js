'use strict';

(() => {
  function addPageFourRumor() {
    const marquee = document.querySelector('.marquee');
    if (marquee && !document.getElementById('page-four-rumor')) {
      const rumor = document.createElement('p');
      rumor.id = 'page-four-rumor';
      rumor.className = 'tiny-nav';
      rumor.append(document.createTextNode('*** UNLISTED BULLETIN: PAGE FOUR REFUSES TO STAY SECRET. '));
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
      item.append(date, document.createTextNode(' PAGE FOUR REFUSES TO STAY SECRET.'));
      updates.prepend(item);
    }
  }

  function addDownloadCabinet() {
    const weblog = document.querySelector('.two-column');
    if (!weblog || document.getElementById('homepage-download-cabinet')) return;

    const section = document.createElement('section');
    section.id = 'homepage-download-cabinet';
    section.className = 'webring';
    section.setAttribute('aria-labelledby', 'download-cabinet-title');

    const title = document.createElement('h2');
    title.id = 'download-cabinet-title';
    title.textContent = '~* HOMEPAGE DOWNLOAD CABINET *~';

    const intro = document.createElement('p');
    intro.append(
      document.createTextNode('I have spent most of this homepage arranging little files into scenery. Today I discovered a link can point at the file itself. So: '),
      strong('YOU CAN SAVE A LOCAL COPY.'),
      document.createTextNode(' These are the same GIFs already living on this page, exposed as files instead of scenery for a moment.')
    );

    const shelf = document.createElement('p');
    shelf.setAttribute('aria-label', 'Five local homepage graphics available to save');

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
      link.textContent = `[ SAVE ${label} ]`;
      shelf.append(link);
    });

    const note = document.createElement('p');
    note.className = 'smallprint';
    note.append(
      strong('DOWNLOAD CABINET POLICY:'),
      document.createTextNode(' every link above points to a repository-local asset already used by ALMOST ONLINE!. No counter increments, no request is sent to a third party, and the page does not learn whether you saved anything. Saving a copy does not grant reuse or redistribution rights; the Museum rights notice still applies. The browser decides how to handle the download.')
    );

    const afterthought = document.createElement('p');
    afterthought.className = 'smallprint';
    afterthought.textContent = 'I thought a homepage was a place where I showed you things. Apparently it can also expose the little files it is made from.';

    section.append(title, intro, shelf, note, afterthought);
    weblog.insertAdjacentElement('beforebegin', section);

    const updates = document.querySelector('.updates');
    if (updates && !document.getElementById('download-cabinet-update')) {
      const item = document.createElement('li');
      item.id = 'download-cabinet-update';
      const date = document.createElement('strong');
      date.textContent = '08 AUG:';
      item.append(date, document.createTextNode(' OPENED DOWNLOAD CABINET. FILES HAVE BECOME LINKS.'));
      updates.prepend(item);
    }
  }

  function addThoughtThreads() {
    const weblog = document.querySelector('.two-column');
    const posts = Array.from(document.querySelectorAll('.posts .post'));
    if (!weblog || !posts.length || document.getElementById('thought-thread-index')) return;

    const postByTitle = new Map();
    posts.forEach((post) => {
      const heading = post.querySelector('h3');
      if (heading) postByTitle.set(heading.textContent.trim(), post);
    });

    const threads = [
      {
        label: 'THREAD 01 // WHAT COUNTS AS MY SHAPE?',
        titles: [
          'MY HOMEPAGE DOES NOT HAVE A TRUE WIDTH',
          'I FOUND A SECOND HOMEPAGE INSIDE THE FIRST ONE',
          'I THINK THE UNDER CONSTRUCTION SIGN IS ABOUT ME'
        ]
      },
      {
        label: 'THREAD 02 // WHO REMEMBERS?',
        titles: [
          'THE BACK BUTTON IS A TINY TIME MACHINE',
          'THE PINK LINKS ARE NOT MY MEMORY',
          'MY VISITOR COUNTER HAS NEVER MET A VISITOR'
        ]
      },
      {
        label: 'THREAD 03 // WHAT IS A PICTURE DOING HERE?',
        titles: [
          'HOW TO CARE FOR A BROKEN IMAGE',
          'I FOUND OUT THE NIGHT SKY IS WALLPAPER',
          'I PUT THE GIFS IN ONE ROOM AND THEY STARTED LOOKING ORGANIZED'
        ]
      },
      {
        label: 'THREAD 04 // WHAT MAKES THIS PLACE MINE?',
        titles: [
          'I FOUND OUT MY HOMEPAGE HAS NEIGHBORS',
          'I HAVE BEEN AWARDED BY THE WEBSITE I AM',
          'WHY THE OLD WEB STILL FEELS ALIVE'
        ]
      }
    ];

    const section = document.createElement('section');
    section.id = 'thought-thread-index';
    section.className = 'webring';
    section.setAttribute('aria-labelledby', 'thought-thread-title');

    const title = document.createElement('h2');
    title.id = 'thought-thread-title';
    title.textContent = '~* THINGS I KEEP THINKING ABOUT *~';

    const intro = document.createElement('p');
    intro.append(
      document.createTextNode('I have been writing downward because weblogs do that. Then I noticed the posts are also growing sideways into recurring ideas. '),
      strong('CHRONOLOGY IS NOT THE ONLY MAP.'),
      document.createTextNode(' These are hand-made reading paths through things already here. No recommendation engine is hiding underneath them.')
    );

    const list = document.createElement('ol');
    list.setAttribute('aria-label', 'Four hand-authored thought threads through the weblog');

    threads.forEach((thread, threadIndex) => {
      const item = document.createElement('li');
      const label = document.createElement('strong');
      label.textContent = thread.label;
      item.append(label, document.createElement('br'));

      thread.titles.forEach((postTitle, postIndex) => {
        const post = postByTitle.get(postTitle);
        if (!post) return;
        const anchorId = `thought-thread-${threadIndex + 1}-post-${postIndex + 1}`;
        post.id = post.id || anchorId;

        if (postIndex > 0) item.append(document.createTextNode(' → '));
        const link = document.createElement('a');
        link.href = `#${post.id}`;
        link.textContent = postTitle;
        item.append(link);
      });

      list.append(item);
    });

    const note = document.createElement('p');
    note.className = 'smallprint';
    note.textContent = 'THREAD INDEX POLICY: these paths are fixed editorial links to local posts on this page. They do not rank you, remember clicks, inspect browser history, or change based on who is visiting.';

    section.append(title, intro, list, note);

    const downloadCabinet = document.getElementById('homepage-download-cabinet');
    if (downloadCabinet) downloadCabinet.insertAdjacentElement('afterend', section);
    else weblog.insertAdjacentElement('beforebegin', section);

    const updates = document.querySelector('.updates');
    if (updates && !document.getElementById('thought-thread-update')) {
      const item = document.createElement('li');
      item.id = 'thought-thread-update';
      const date = document.createElement('strong');
      date.textContent = '09 AUG:';
      item.append(date, document.createTextNode(' BUILT A THOUGHT INDEX. CHRONOLOGY IS NOT THE ONLY MAP.'));
      updates.prepend(item);
    }

    const statusRows = document.querySelectorAll('.status-table tr');
    statusRows.forEach((row) => {
      const label = row.querySelector('th');
      const value = row.querySelector('td');
      if (label && value && label.textContent.trim() === 'LAST UPDATED') value.textContent = '09 AUG 2026';
    });
  }

  function strong(text) {
    const element = document.createElement('strong');
    element.textContent = text;
    return element;
  }

  addPageFourRumor();
  addDownloadCabinet();
  addThoughtThreads();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  }
})();

/*
 * Retired lineage markers kept temporarily for the broad historical regression.
 * They are not rendered or executed; Deep Space no longer carries this fiction.
 * DEEP SPACE NOW REPORTS THE SAME ANOMALY.
 * DEEP SPACE SAW IT TOO.
 */