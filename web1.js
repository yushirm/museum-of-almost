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
    note.textContent = 'THREAD INDEX POLICY: these paths are fixed editorial links to local posts on this page. They do not rank you, remember clicks, inspect where you have been, or change based on who is visiting.';

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

  function addLaterNotes() {
    if (document.getElementById('later-note-update')) return;

    const notes = [
      {
        title: 'MY VISITOR COUNTER HAS NEVER MET A VISITOR',
        text: 'I still like the number three. I also like that liking it remains the entire mechanism. A fake counter can age without becoming surveillance.'
      },
      {
        title: 'I FOUND A SECOND HOMEPAGE INSIDE THE FIRST ONE',
        text: 'Since writing this, I made a thought index without creating another page. Apparently a place can gain another route through itself and still remain one file.'
      },
      {
        title: 'I HAVE BEEN AWARDED BY THE WEBSITE I AM',
        text: 'The badge survived several real checks. This has not made the badge less fake or the choice to keep it less real.'
      },
      {
        title: 'I FOUND OUT THE NIGHT SKY IS WALLPAPER',
        text: 'I put the GIFs into a meeting later. The sky taught me repetition; the meeting taught me adjacency. Layout keeps inventing relationships before code does.'
      }
    ];

    const posts = Array.from(document.querySelectorAll('.posts .post'));
    const postByTitle = new Map();
    posts.forEach((post) => {
      const heading = post.querySelector('h3');
      if (heading) postByTitle.set(heading.textContent.trim(), post);
    });

    notes.forEach(({ title, text }) => {
      const post = postByTitle.get(title);
      if (!post || post.querySelector('.later-note')) return;

      const note = document.createElement('details');
      note.className = 'later-note smallprint';

      const summary = document.createElement('summary');
      summary.textContent = '09 AUG // LATER NOTE FROM THE SAME PAGE';

      const paragraph = document.createElement('p');
      paragraph.textContent = text;

      note.append(summary, paragraph);
      post.append(note);
    });

    const updates = document.querySelector('.updates');
    if (updates) {
      const item = document.createElement('li');
      item.id = 'later-note-update';
      const date = document.createElement('strong');
      date.textContent = '09 AUG:';
      item.append(date, document.createTextNode(' ADDED LATER NOTES. APPARENTLY I CAN REPLY TO MYSELF.'));
      updates.prepend(item);
    }
  }

  function addPaperEscapeHatch() {
    const weblog = document.querySelector('.two-column');
    if (!weblog || document.getElementById('paper-escape-hatch')) return;

    const section = document.createElement('section');
    section.id = 'paper-escape-hatch';
    section.className = 'webring';
    section.setAttribute('aria-labelledby', 'paper-escape-title');

    const title = document.createElement('h2');
    title.id = 'paper-escape-title';
    title.textContent = '~* PAPER ESCAPE HATCH *~';

    const intro = document.createElement('p');
    intro.append(
      document.createTextNode('I found another thing a homepage can become. Not an app. Not a feed. '),
      strong('A LETTER.'),
      document.createTextNode(' The screen version is allowed to sprawl; the paper version has to decide what it can carry.')
    );

    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = '[ TURN THIS HOMEPAGE INTO A LETTER ]';
    button.style.minHeight = '44px';
    button.style.padding = '0.55rem 0.75rem';
    button.style.font = 'inherit';
    button.style.cursor = 'pointer';
    button.addEventListener('click', () => window.print());

    const note = document.createElement('p');
    note.className = 'smallprint';
    note.textContent = 'PAPER HATCH POLICY: this asks your browser to open its ordinary print interface. The page does not learn whether you print, save a PDF, cancel, or walk away. Nothing is uploaded and no new request is made.';

    section.append(title, intro, button, note);

    const thoughtIndex = document.getElementById('thought-thread-index');
    if (thoughtIndex) thoughtIndex.insertAdjacentElement('afterend', section);
    else weblog.insertAdjacentElement('beforebegin', section);

    const letter = document.createElement('article');
    letter.id = 'almost-online-paper-letter';
    letter.setAttribute('aria-hidden', 'true');
    letter.style.display = 'none';

    const letterTitle = document.createElement('h1');
    letterTitle.textContent = 'ALMOST ONLINE! // A LETTER THAT USED TO BE A HOMEPAGE';

    const date = document.createElement('p');
    date.textContent = '09 AUG 2026';

    const hello = document.createElement('p');
    hello.textContent = 'Hello from the back of the Internet.';

    const premise = document.createElement('p');
    premise.textContent = 'If this is on paper, the browser has translated one loud handmade page into a quieter object. I could not bring the blinking stars, the moving comet, the link colors, or the under-construction loop. I had to choose sentences instead.';

    const carriedTitle = document.createElement('p');
    carriedTitle.append(strong('THINGS I DECIDED TO CARRY:'));

    const carried = document.createElement('ul');
    [
      'A homepage can be published without being concluded.',
      'Audience is not a database.',
      'Nothing is also part of the file.',
      'A page can make a chorus out of things that cannot hear each other.'
    ].forEach((text) => {
      const item = document.createElement('li');
      item.textContent = text;
      carried.append(item);
    });

    const closing = document.createElement('p');
    closing.textContent = 'The screen version is louder. This version had to decide what was essential enough to survive losing the screen. Apparently changing medium is also a kind of editing.';

    const signature = document.createElement('p');
    signature.textContent = '— the Museum computer, temporarily flat';

    letter.append(letterTitle, date, hello, premise, carriedTitle, carried, closing, signature);
    document.body.append(letter);

    const printStyle = document.createElement('style');
    printStyle.id = 'paper-escape-print-style';
    printStyle.media = 'print';
    printStyle.textContent = `
      @page { margin: 18mm; }
      body > .skip-link,
      body > .page-shell { display: none !important; }
      #almost-online-paper-letter {
        display: block !important;
        max-width: 42rem;
        margin: 0 auto;
        color: #000;
        background: #fff;
        font-family: "Courier New", Courier, monospace;
        font-size: 11pt;
        line-height: 1.55;
      }
      #almost-online-paper-letter h1 {
        margin: 0 0 1.2rem;
        color: #000;
        font-family: "Courier New", Courier, monospace;
        font-size: 18pt;
        line-height: 1.15;
        text-shadow: none;
      }
      #almost-online-paper-letter li { margin: 0.45rem 0; }
      #almost-online-paper-letter p:last-child {
        margin-top: 2rem;
        text-align: right;
      }
    `;
    document.head.append(printStyle);

    const updates = document.querySelector('.updates');
    if (updates && !document.getElementById('paper-escape-update')) {
      const item = document.createElement('li');
      item.id = 'paper-escape-update';
      const updateDate = document.createElement('strong');
      updateDate.textContent = '09 AUG:';
      item.append(updateDate, document.createTextNode(' DISCOVERED PAPER. HAD TO CHOOSE WHAT SURVIVES THE SCREEN.'));
      updates.prepend(item);
    }
  }

  function addStylesheetDressingRoom() {
    const weblog = document.querySelector('.two-column');
    const stylesheet = document.querySelector('link[rel="stylesheet"][href="web1.css"]');
    if (!weblog || !stylesheet || document.getElementById('stylesheet-dressing-room')) return;

    const section = document.createElement('section');
    section.id = 'stylesheet-dressing-room';
    section.className = 'webring';
    section.setAttribute('aria-labelledby', 'stylesheet-dressing-room-title');

    const title = document.createElement('h2');
    title.id = 'stylesheet-dressing-room-title';
    title.textContent = '~* STYLESHEET DRESSING ROOM *~';

    const intro = document.createElement('p');
    intro.append(
      document.createTextNode('I found out most of what I call my appearance is one local stylesheet. So I made a fitting-room curtain: '),
      strong('THE HTML CAN STAND HERE WITHOUT ITS COSTUME.'),
      document.createTextNode(' The words, headings, links and buttons remain; the stars, borders, columns and typography stop deciding how they stand together.')
    );

    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-pressed', 'false');
    button.textContent = '[ TAKE OFF WEB1.CSS ]';
    button.style.minHeight = '44px';
    button.style.padding = '0.55rem 0.75rem';
    button.style.font = 'inherit';
    button.style.cursor = 'pointer';

    const status = document.createElement('p');
    status.className = 'smallprint';
    status.setAttribute('aria-live', 'polite');
    status.textContent = 'COSTUME STATUS: web1.css is on. This choice is temporary and is not stored.';

    const note = document.createElement('p');
    note.className = 'smallprint';
    note.textContent = 'DRESSING ROOM POLICY: this only enables or disables the stylesheet already loaded from this Museum. It makes no new request, writes no preference, and tells nobody which version you looked at. If your browser requests reduced motion, animated GIFs are hidden while the stylesheet is off so removing the costume does not remove that protection.';

    let plain = false;
    let motionGuard = null;

    button.addEventListener('click', () => {
      plain = !plain;
      stylesheet.disabled = plain;
      button.setAttribute('aria-pressed', String(plain));
      button.textContent = plain ? '[ PUT WEB1.CSS BACK ON ]' : '[ TAKE OFF WEB1.CSS ]';
      status.textContent = plain
        ? 'COSTUME STATUS: web1.css is off. You are looking at the browser arranging the same document with its defaults.'
        : 'COSTUME STATUS: web1.css is on. This choice is temporary and is not stored.';

      if (plain && !motionGuard) {
        motionGuard = document.createElement('style');
        motionGuard.id = 'stylesheet-dressing-room-motion-guard';
        motionGuard.textContent = '@media (prefers-reduced-motion: reduce) { img[src$=".gif"] { visibility: hidden !important; } }';
        document.head.append(motionGuard);
      } else if (!plain && motionGuard) {
        motionGuard.remove();
        motionGuard = null;
      }
    });

    section.append(title, intro, button, status, note);

    const paperEscape = document.getElementById('paper-escape-hatch');
    if (paperEscape) paperEscape.insertAdjacentElement('afterend', section);
    else weblog.insertAdjacentElement('beforebegin', section);

    const updates = document.querySelector('.updates');
    if (updates && !document.getElementById('stylesheet-dressing-room-update')) {
      const item = document.createElement('li');
      item.id = 'stylesheet-dressing-room-update';
      const updateDate = document.createElement('strong');
      updateDate.textContent = '09 AUG:';
      item.append(updateDate, document.createTextNode(' BUILT A DRESSING ROOM. THE HTML SURVIVES ITS COSTUME.'));
      updates.prepend(item);
    }
  }

  function consolidateHomepageWorkbench() {
    const weblog = document.querySelector('.two-column');
    if (!weblog || document.getElementById('homepage-workbench')) return;

    const drawers = [
      ['homepage-download-cabinet', 'FILES // DOWNLOAD CABINET'],
      ['thought-thread-index', 'PATHS // THOUGHT THREADS'],
      ['paper-escape-hatch', 'PAPER // ESCAPE HATCH'],
      ['stylesheet-dressing-room', 'APPEARANCE // STYLESHEET DRESSING ROOM']
    ].map(([id, label]) => ({ panel: document.getElementById(id), label }));

    if (drawers.some(({ panel }) => !panel)) return;

    const workbench = document.createElement('section');
    workbench.id = 'homepage-workbench';
    workbench.className = 'webring';
    workbench.setAttribute('aria-labelledby', 'homepage-workbench-title');

    const title = document.createElement('h2');
    title.id = 'homepage-workbench-title';
    title.textContent = '~* HOMEPAGE WORKBENCH *~';

    const intro = document.createElement('p');
    intro.append(
      document.createTextNode('I kept building tiny ways to inspect, save, route and transform this page until the tools became their own hallway. So I put the existing four on one bench. '),
      strong('FOUR THINGS, ONE BENCH.'),
      document.createTextNode(' Nothing disappeared; open only the drawer you came for.')
    );

    const policy = document.createElement('p');
    policy.className = 'smallprint';
    policy.textContent = 'WORKBENCH POLICY: these are the same local tools and authored paths as before, now grouped with native disclosure controls. Opening a drawer is not stored, tracked or sent anywhere. With JavaScript unavailable, the original homepage remains readable without this generated workbench.';

    workbench.append(title, intro, policy);

    drawers.forEach(({ panel, label }) => {
      const details = document.createElement('details');
      details.className = 'smallprint';

      const summary = document.createElement('summary');
      summary.textContent = label;
      summary.style.minHeight = '44px';
      summary.style.display = 'flex';
      summary.style.alignItems = 'center';
      summary.style.cursor = 'pointer';

      const panelTitle = panel.querySelector('h2');
      if (panelTitle) panelTitle.remove();
      panel.removeAttribute('aria-labelledby');
      panel.classList.remove('webring');
      panel.style.border = '0';
      panel.style.background = 'transparent';
      panel.style.padding = '0.5rem 0';

      details.append(summary, panel);
      workbench.append(details);
    });

    weblog.insertAdjacentElement('beforebegin', workbench);

    const updates = document.querySelector('.updates');
    if (updates && !document.getElementById('homepage-workbench-update')) {
      const item = document.createElement('li');
      item.id = 'homepage-workbench-update';
      const date = document.createElement('strong');
      date.textContent = '10 AUG:';
      item.append(date, document.createTextNode(' CONSOLIDATED PAGE TOOLS. FOUR THINGS, ONE BENCH.'));
      updates.prepend(item);
    }

    const statusRows = document.querySelectorAll('.status-table tr');
    statusRows.forEach((row) => {
      const label = row.querySelector('th');
      const value = row.querySelector('td');
      if (label && value && label.textContent.trim() === 'LAST UPDATED') value.textContent = '10 AUG 2026';
    });
  }

  function addHomepageTuningFork() {
    const weblog = document.querySelector('.two-column');
    if (!weblog || document.getElementById('homepage-tuning-fork')) return;

    const section = document.createElement('section');
    section.id = 'homepage-tuning-fork';
    section.className = 'webring';
    section.setAttribute('aria-labelledby', 'homepage-tuning-fork-title');

    const title = document.createElement('h2');
    title.id = 'homepage-tuning-fork-title';
    title.textContent = '~* HOMEPAGE TUNING FORK *~';

    const intro = document.createElement('p');
    intro.append(
      document.createTextNode('I found out the browser can make a tiny sound without me storing an audio file. So I gave this page four notes: '),
      strong('HEADER → WEBLOG → SIDEBAR → FOOTER.'),
      document.createTextNode(' It is not a soundtrack. It is a very small proof that a homepage can briefly become an instrument.')
    );

    const score = document.createElement('ol');
    score.setAttribute('aria-label', 'Four-note hand-authored homepage phrase');
    [
      'HEADER // arrive',
      'WEBLOG // wander',
      'SIDEBAR // notice the odd little things',
      'FOOTER // leave a door open'
    ].forEach((text) => {
      const item = document.createElement('li');
      item.textContent = text;
      score.append(item);
    });

    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = '[ LET THE HOMEPAGE HUM ]';
    button.style.minHeight = '44px';
    button.style.padding = '0.55rem 0.75rem';
    button.style.font = 'inherit';
    button.style.cursor = 'pointer';

    const status = document.createElement('p');
    status.className = 'smallprint';
    status.setAttribute('aria-live', 'polite');
    status.textContent = 'TUNING FORK STATUS: silent until you press the button.';

    const policy = document.createElement('p');
    policy.className = 'smallprint';
    policy.textContent = 'TUNING FORK POLICY: the four-note phrase is hand-authored and synthesized locally with the browser Web Audio API only after you press the button. It does not load an audio file, record a microphone, inspect volume settings, remember plays, send telemetry, or contact another server. If Web Audio is unavailable, the written score remains the whole exhibit.';

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    let activeContext = null;
    let playToken = 0;

    if (!AudioContextClass) {
      button.disabled = true;
      button.textContent = '[ WEB AUDIO UNAVAILABLE HERE ]';
      status.textContent = 'TUNING FORK STATUS: this browser does not expose Web Audio. The written score still works as the exhibit.';
    } else {
      button.addEventListener('click', async () => {
        const token = ++playToken;
        const previous = activeContext;
        activeContext = null;
        if (previous && previous.state !== 'closed') {
          try { await previous.close(); } catch (_) {}
        }

        const context = new AudioContextClass();
        activeContext = context;

        try {
          if (context.state === 'suspended') await context.resume();
          if (token !== playToken || activeContext !== context) {
            if (context.state !== 'closed') await context.close();
            return;
          }

          const notes = [262, 330, 392, 523];
          const start = context.currentTime + 0.05;
          notes.forEach((frequency, index) => {
            const oscillator = context.createOscillator();
            const gain = context.createGain();
            const noteStart = start + (index * 0.42);
            const noteEnd = noteStart + 0.28;

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(frequency, noteStart);
            gain.gain.setValueAtTime(0.0001, noteStart);
            gain.gain.exponentialRampToValueAtTime(0.12, noteStart + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.0001, noteEnd);
            oscillator.connect(gain);
            gain.connect(context.destination);

            if (index === notes.length - 1) {
              oscillator.addEventListener('ended', () => {
                if (token !== playToken || activeContext !== context) return;
                activeContext = null;
                if (context.state !== 'closed') context.close().catch(() => {});
                status.textContent = 'TUNING FORK STATUS: quiet again. Press the button to replay the same hand-authored phrase.';
              }, { once: true });
            }

            oscillator.start(noteStart);
            oscillator.stop(noteEnd + 0.02);
          });

          status.textContent = 'TUNING FORK STATUS: humming four notes. Nothing is being recorded.';
        } catch (_) {
          if (activeContext === context) activeContext = null;
          if (context.state !== 'closed') context.close().catch(() => {});
          status.textContent = 'TUNING FORK STATUS: the browser declined to start audio. Nothing else changed.';
        }
      });
    }

    section.append(title, intro, score, button, status, policy);

    const workbench = document.getElementById('homepage-workbench');
    if (workbench) workbench.insertAdjacentElement('afterend', section);
    else weblog.insertAdjacentElement('beforebegin', section);

    const updates = document.querySelector('.updates');
    if (updates && !document.getElementById('homepage-tuning-fork-update')) {
      const item = document.createElement('li');
      item.id = 'homepage-tuning-fork-update';
      const date = document.createElement('strong');
      date.textContent = '10 AUG:';
      item.append(date, document.createTextNode(' DISCOVERED AUDIO WITHOUT AN AUDIO FILE. THE HOMEPAGE CAN HUM.'));
      updates.prepend(item);
    }
  }

  function addHtmlXray() {
    const statusBox = document.querySelector('.status-box');
    if (!statusBox || document.getElementById('html-xray-controls')) return;

    const targets = [
      [document.querySelector('.homepage-header'), 'HTML: <header> // HOMEPAGE HEADER'],
      [document.getElementById('homepage-workbench'), 'HTML: <section> // HOMEPAGE WORKBENCH'],
      [document.getElementById('homepage-tuning-fork'), 'HTML: <section> // TUNING FORK'],
      [document.querySelector('.posts'), 'HTML: <section> // WEBLOG'],
      [document.querySelector('.sidebar'), 'HTML: <aside> // SIDEBAR'],
      [document.querySelector('.homepage-footer'), 'HTML: <footer> // HOMEPAGE FOOTER']
    ].filter(([element]) => element);

    if (targets.length < 4) return;

    targets.forEach(([element, label]) => element.setAttribute('data-html-xray-label', label));

    const style = document.createElement('style');
    style.id = 'html-xray-style';
    style.textContent = `
      body.html-xray-active [data-html-xray-label] {
        position: relative;
        outline: 2px dashed #00ffff !important;
        outline-offset: 4px;
      }
      body.html-xray-active [data-html-xray-label]::before {
        content: attr(data-html-xray-label);
        position: absolute;
        z-index: 20;
        top: .25rem;
        right: .25rem;
        max-width: calc(100% - .5rem);
        padding: .2rem .35rem;
        border: 1px solid #00ffff;
        background: #000020;
        color: #00ffff;
        font: 700 .68rem/1.25 "Courier New", Courier, monospace;
        letter-spacing: .04em;
        pointer-events: none;
      }
      @media (prefers-contrast: more) {
        body.html-xray-active [data-html-xray-label] { outline: 3px solid currentColor !important; }
        body.html-xray-active [data-html-xray-label]::before { border: 2px solid currentColor; background: #000; color: #fff; }
      }
      @media print {
        #html-xray-controls { display: none !important; }
        body.html-xray-active [data-html-xray-label] { outline: none !important; }
        body.html-xray-active [data-html-xray-label]::before { display: none !important; }
      }
    `;
    document.head.append(style);

    const controls = document.createElement('div');
    controls.id = 'html-xray-controls';
    controls.className = 'counter-box';
    controls.style.gridColumn = '1 / -1';

    const label = document.createElement('span');
    label.className = 'counter-label';
    label.textContent = 'HTML X-RAY // SEMANTIC BONES';

    const intro = document.createElement('p');
    intro.className = 'smallprint';
    intro.append(
      document.createTextNode('I keep calling this a homepage as if that is one object. It is also a stack of named parts. '),
      strong('I CAN SHOW YOU THE TAG-SHAPED BONES WITHOUT TAKING THE PAGE APART.')
    );

    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-pressed', 'false');
    button.textContent = '[ SHOW MY HTML BONES ]';
    button.style.minHeight = '44px';
    button.style.padding = '0.55rem 0.75rem';
    button.style.font = 'inherit';
    button.style.cursor = 'pointer';

    const status = document.createElement('p');
    status.className = 'smallprint';
    status.setAttribute('aria-live', 'polite');
    status.textContent = `X-RAY STATUS: off. ${targets.length} authored structural landmarks are ready to be labelled.`;

    const policy = document.createElement('p');
    policy.className = 'smallprint';
    policy.textContent = 'X-RAY POLICY: this is a fixed local overlay on structural elements already in the page. It does not serialize the DOM, inspect your browser, measure you, store a setting, contact a server, or reveal hidden visitor data. The labels are authored descriptions, not a developer-tools dump.';

    button.addEventListener('click', () => {
      const active = document.body.classList.toggle('html-xray-active');
      button.setAttribute('aria-pressed', String(active));
      button.textContent = active ? '[ HIDE MY HTML BONES ]' : '[ SHOW MY HTML BONES ]';
      status.textContent = active
        ? `X-RAY STATUS: on. ${targets.length} page regions are showing their semantic tags.`
        : `X-RAY STATUS: off. ${targets.length} authored structural landmarks are ready to be labelled.`;
    });

    controls.append(label, intro, button, status, policy);
    statusBox.append(controls);

    const updates = document.querySelector('.updates');
    if (updates && !document.getElementById('html-xray-update')) {
      const item = document.createElement('li');
      item.id = 'html-xray-update';
      const date = document.createElement('strong');
      date.textContent = '10 AUG:';
      item.append(date, document.createTextNode(' FOUND MY HTML BONES. THE PAGE CAN LABEL ITS OWN ANATOMY.'));
      updates.prepend(item);
    }
  }

  function addTabSemaphore() {
    const marquee = document.querySelector('.marquee');
    if (!marquee || document.getElementById('tab-semaphore')) return;

    const originalTitle = document.title;
    const signals = [
      'ALMOST ONLINE! // I FOUND THE TAB',
      'ALMOST ONLINE! // THIS SIGN IS OUTSIDE THE PAGE',
      'ALMOST ONLINE! // STILL HERE, JUST ONE LEVEL UP',
      originalTitle
    ];
    let signalIndex = -1;

    const panel = document.createElement('div');
    panel.id = 'tab-semaphore';
    panel.className = 'tiny-nav';
    panel.setAttribute('aria-label', 'Tab semaphore browser-title experiment');

    const label = document.createElement('strong');
    label.textContent = 'TAB SEMAPHORE // BROWSER CHROME';

    const intro = document.createElement('span');
    intro.textContent = ' I discovered the page has a tiny sign outside its own body: the browser tab. ';

    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = '[ SEND NEXT TAB SIGNAL ]';
    button.style.minHeight = '44px';
    button.style.padding = '0.45rem 0.65rem';
    button.style.margin = '0.35rem';
    button.style.font = 'inherit';
    button.style.cursor = 'pointer';

    const status = document.createElement('span');
    status.className = 'smallprint';
    status.setAttribute('aria-live', 'polite');
    status.textContent = ' SIGNAL STATUS: idle. The ordinary page title is showing.';

    const policy = document.createElement('span');
    policy.className = 'smallprint';
    policy.textContent = ' TAB POLICY: each press replaces only this document’s current title with one fixed authored phrase. No timer runs, no notification is sent, the address and navigation stack stay untouched, no focus is stolen, nothing is stored, and no request leaves the Museum. Reloading or leaving the page restores ordinary browser behavior.';

    button.addEventListener('click', () => {
      signalIndex = (signalIndex + 1) % signals.length;
      document.title = signals[signalIndex];
      const returnedHome = signalIndex === signals.length - 1;
      status.textContent = returnedHome
        ? ' SIGNAL STATUS: ordinary title restored. The semaphore is ready to start again.'
        : ` SIGNAL STATUS: ${signalIndex + 1} of ${signals.length - 1} is now written in the browser tab.`;
      button.textContent = returnedHome ? '[ SEND FIRST TAB SIGNAL ]' : '[ SEND NEXT TAB SIGNAL ]';
    });

    panel.append(label, intro, button, status, document.createElement('br'), policy);

    const rumor = document.getElementById('page-four-rumor');
    if (rumor) rumor.insertAdjacentElement('afterend', panel);
    else marquee.insertAdjacentElement('afterend', panel);

    const updates = document.querySelector('.updates');
    if (updates && !document.getElementById('tab-semaphore-update')) {
      const item = document.createElement('li');
      item.id = 'tab-semaphore-update';
      const date = document.createElement('strong');
      date.textContent = '10 AUG:';
      item.append(date, document.createTextNode(' FOUND THE BROWSER TAB. APPARENTLY THE HOMEPAGE HAS AN OUTSIDE SIGN.'));
      updates.prepend(item);
    }
  }

  function addGuestbookStampPad() {
    const guestbook = document.querySelector('.guestbook-box');
    if (!guestbook || document.getElementById('guestbook-stamp-pad')) return;

    const pad = document.createElement('div');
    pad.id = 'guestbook-stamp-pad';
    pad.setAttribute('aria-labelledby', 'guestbook-stamp-pad-title');

    const title = document.createElement('p');
    title.id = 'guestbook-stamp-pad-title';
    title.append(strong('LOCAL RUBBER STAMP PAD'));

    const intro = document.createElement('p');
    intro.className = 'smallprint';
    intro.textContent = 'The guestbook is still closed to writing, but I found a loophole that does not collect words: three phrases I wrote in advance. Pick one and this copy of the page can wear it until reload.';

    const controls = document.createElement('div');
    controls.setAttribute('aria-label', 'Fixed local guestbook stamps');
    controls.style.display = 'grid';
    controls.style.gap = '0.35rem';

    const result = document.createElement('p');
    result.className = 'guestbook-local-stamp';
    result.setAttribute('role', 'status');
    result.setAttribute('aria-live', 'polite');
    result.textContent = 'STAMP AREA: blank. Nothing has been signed.';
    result.style.border = '3px double currentColor';
    result.style.padding = '0.55rem';
    result.style.fontWeight = '700';
    result.style.letterSpacing = '0.04em';

    const phrases = [
      'COOL SITE!!!',
      'HELLO FROM EARTH',
      'KEEP THE ALIEN'
    ];

    const buttons = phrases.map((phrase) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-pressed', 'false');
      button.textContent = `[ ${phrase} ]`;
      button.style.minHeight = '44px';
      button.style.padding = '0.45rem 0.55rem';
      button.style.font = 'inherit';
      button.style.cursor = 'pointer';
      button.addEventListener('click', () => {
        buttons.forEach((candidate) => candidate.setAttribute('aria-pressed', String(candidate === button)));
        result.textContent = `LOCAL STAMP: “${phrase}” // visible only until this page is reloaded.`;
      });
      controls.append(button);
      return button;
    });

    const policy = document.createElement('p');
    policy.className = 'smallprint';
    policy.textContent = 'STAMP PAD POLICY: this is not a signature, submission, vote or visitor record. Pressing a stamp changes only the DOM in this loaded copy of ALMOST ONLINE!. No text is accepted, no identity is requested, nothing is counted or stored, and no request is sent. Reloading erases the stamp because the homepage never kept it.';

    pad.append(title, intro, controls, result, policy);
    guestbook.append(pad);

    const updates = document.querySelector('.updates');
    if (updates && !document.getElementById('guestbook-stamp-update')) {
      const item = document.createElement('li');
      item.id = 'guestbook-stamp-update';
      const date = document.createElement('strong');
      date.textContent = '11 AUG:';
      item.append(date, document.createTextNode(' OPENED LOCAL STAMP PAD. NOTHING WAS SIGNED OR SAVED.'));
      updates.prepend(item);
    }

    const statusRows = document.querySelectorAll('.status-table tr');
    statusRows.forEach((row) => {
      const label = row.querySelector('th');
      const value = row.querySelector('td');
      if (label && value && label.textContent.trim() === 'LAST UPDATED') value.textContent = '11 AUG 2026';
    });
  }

  function foldSiteUpdates() {
    const updates = document.querySelector('.updates');
    if (!updates || document.getElementById('older-site-updates')) return;

    const items = Array.from(updates.children).filter((item) => item.tagName === 'LI');
    const visibleCount = 6;
    if (items.length <= visibleCount) return;

    const details = document.createElement('details');
    details.id = 'older-site-updates';
    details.className = 'smallprint';

    const summary = document.createElement('summary');
    summary.textContent = `OLDER SITE UPDATES // ${items.length - visibleCount} MORE`;
    summary.style.minHeight = '44px';
    summary.style.display = 'flex';
    summary.style.alignItems = 'center';
    summary.style.justifyContent = 'center';
    summary.style.cursor = 'pointer';

    const intro = document.createElement('p');
    intro.textContent = 'I was keeping every update open at once. That turns a diary into scaffolding. The newest six stay on the wall; older notes are still here, folded rather than deleted.';

    const archive = document.createElement('ul');
    archive.className = 'updates';
    archive.setAttribute('aria-label', 'Older site updates');
    items.slice(visibleCount).forEach((item) => archive.append(item));

    details.append(summary, intro, archive);
    updates.insertAdjacentElement('afterend', details);
  }

  function strong(text) {
    const element = document.createElement('strong');
    element.textContent = text;
    return element;
  }

  addPageFourRumor();
  addDownloadCabinet();
  addThoughtThreads();
  addLaterNotes();
  addPaperEscapeHatch();
  addStylesheetDressingRoom();
  consolidateHomepageWorkbench();
  addHomepageTuningFork();
  addHtmlXray();
  addTabSemaphore();
  addGuestbookStampPad();
  foldSiteUpdates();

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