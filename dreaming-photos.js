(() => {
  'use strict';

  const dialog = document.querySelector('#dream-dialog');
  const dreamTitle = document.querySelector('#dream-title');
  const dreamLines = document.querySelector('#dream-lines');

  if (!dialog || !dreamTitle || !dreamLines) return;

  const photographs = [
    {
      path: 'assets/dreaming-wing/atrium.webp',
      alt: 'A tall museum atrium lit through a skylight',
      caption: 'The corridor before it learned gravity.'
    },
    {
      path: 'assets/dreaming-wing/clouds.webp',
      alt: 'Towering storm clouds in a pale sky',
      caption: 'Indoor weather escaping through a service stair.'
    },
    {
      path: 'assets/dreaming-wing/moon.webp',
      alt: 'A rocky lunar landscape photographed during Apollo 15',
      caption: 'The museum’s backup location, should Earth become too complete.'
    }
  ];

  injectStyles();
  const evidenceSection = createEvidenceSection();
  const wall = evidenceSection.querySelector('#dream-photo-wall');
  const cards = photographs.map(createPhotoCard);
  dreamLines.before(evidenceSection);

  const titleObserver = new MutationObserver(arrangeEvidence);
  titleObserver.observe(dreamTitle, { childList: true, characterData: true, subtree: true });
  arrangeEvidence();

  function injectStyles() {
    const style = document.createElement('style');
    style.dataset.museumDreamPhotos = '';
    style.textContent = `
      .header-actions {
        flex-wrap: wrap;
        justify-content: flex-end;
      }

      .dream-evidence {
        margin-block: 1.2rem 1.5rem;
        padding-top: 1.25rem;
        border-top: 1px solid rgba(225, 214, 255, 0.14);
      }

      .dream-evidence-heading {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(12rem, 0.58fr);
        align-items: end;
        gap: 1.25rem;
        margin-bottom: 1rem;
      }

      .dream-evidence-heading h3 {
        margin: 0;
        font-family: Georgia, "Times New Roman", serif;
        font-size: clamp(1.35rem, 3vw, 2rem);
        font-weight: 400;
        line-height: 1.05;
      }

      .dream-evidence-heading p,
      .dream-photo-credit {
        margin: 0;
        color: var(--muted);
        font-size: 0.76rem;
        line-height: 1.55;
      }

      .dream-photo-wall {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 0.75rem;
      }

      .dream-photo-card {
        display: grid;
        align-content: start;
        gap: 0.65rem;
        min-width: 0;
        padding: 0.65rem;
        color: var(--ink);
        text-align: left;
        border: 1px solid rgba(225, 214, 255, 0.16);
        border-radius: 0.9rem;
        background: rgba(255, 255, 255, 0.025);
        cursor: zoom-in;
        transition: border-color 180ms ease, background 180ms ease, transform 180ms ease;
      }

      .dream-photo-card:hover,
      .dream-photo-card:focus-visible {
        border-color: rgba(202, 180, 255, 0.52);
        background: rgba(202, 180, 255, 0.055);
        transform: translateY(-2px);
      }

      .dream-photo-card.is-remembered {
        grid-column: span 2;
        border-color: rgba(202, 180, 255, 0.62);
        background: rgba(202, 180, 255, 0.075);
        cursor: zoom-out;
      }

      .dream-photo-mat {
        position: relative;
        display: block;
        aspect-ratio: 4 / 5;
        overflow: hidden;
        border-radius: 0.6rem;
        background: #080912;
      }

      .dream-photo-card.is-remembered .dream-photo-mat {
        aspect-ratio: 16 / 9;
      }

      .dream-photo-mat::after {
        content: "";
        position: absolute;
        inset: 0;
        background:
          linear-gradient(145deg, rgba(202, 180, 255, 0.14), transparent 38%),
          radial-gradient(circle at 50% 110%, rgba(8, 9, 18, 0), rgba(8, 9, 18, 0.55));
        pointer-events: none;
      }

      .dream-photo-card img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
        filter: saturate(0.72) contrast(1.08) brightness(0.82);
        transform: scale(1.015);
      }

      .dream-photo-card:nth-child(2) img {
        object-position: center 38%;
      }

      .dream-photo-card:nth-child(3) img {
        filter: grayscale(1) contrast(1.12) brightness(0.84);
      }

      .dream-photo-label {
        display: block;
        color: #cab4ff;
        font-size: 0.62rem;
        font-weight: 800;
        letter-spacing: 0.15em;
      }

      .dream-photo-caption {
        display: block;
        font-family: Georgia, "Times New Roman", serif;
        font-size: 0.95rem;
        line-height: 1.4;
      }

      .dream-photo-credit {
        margin-top: 0.8rem;
      }

      .dream-photo-credit a {
        color: #cab4ff;
      }

      @media (max-width: 720px) {
        .dream-evidence-heading {
          grid-template-columns: 1fr;
        }

        .dream-photo-wall {
          grid-template-columns: 1fr;
        }

        .dream-photo-card.is-remembered {
          grid-column: span 1;
        }

        .dream-photo-mat,
        .dream-photo-card.is-remembered .dream-photo-mat {
          aspect-ratio: 16 / 10;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .dream-photo-card {
          transition: none;
        }

        .dream-photo-card:hover,
        .dream-photo-card:focus-visible {
          transform: none;
        }
      }
    `;
    document.head.append(style);
  }

  function createEvidenceSection() {
    const section = document.createElement('section');
    section.className = 'dream-evidence';
    section.setAttribute('aria-labelledby', 'dream-evidence-title');
    section.innerHTML = `
      <div class="dream-evidence-heading">
        <div>
          <p class="eyebrow dream-kicker">PHOTOGRAPHIC EVIDENCE · PROVENANCE UNCERTAIN</p>
          <h3 id="dream-evidence-title">Photographs the museum insists it did not take</h3>
        </div>
        <p>Select an image to let the dream remember it more clearly.</p>
      </div>
      <div class="dream-photo-wall" id="dream-photo-wall"></div>
      <p class="dream-photo-credit">
        Local public-domain and CC0 source photographs. No remote image requests.
        <a href="PHOTO_CREDITS.md">Sources and rights</a>.
      </p>
    `;
    return section;
  }

  function createPhotoCard(photo) {
    const card = document.createElement('button');
    card.className = 'dream-photo-card';
    card.type = 'button';
    card.setAttribute('aria-pressed', 'false');

    const mat = document.createElement('span');
    mat.className = 'dream-photo-mat';
    const image = document.createElement('img');
    image.src = photo.path;
    image.alt = photo.alt;
    image.loading = 'lazy';
    image.decoding = 'async';
    image.draggable = false;
    mat.append(image);

    const label = document.createElement('span');
    label.className = 'dream-photo-label';
    const caption = document.createElement('span');
    caption.className = 'dream-photo-caption';
    caption.textContent = photo.caption;
    card.append(mat, label, caption);

    card.addEventListener('click', () => {
      const becomingRemembered = !card.classList.contains('is-remembered');
      cards.forEach((otherCard) => {
        otherCard.classList.remove('is-remembered');
        otherCard.setAttribute('aria-pressed', 'false');
      });
      if (becomingRemembered) {
        card.classList.add('is-remembered');
        card.setAttribute('aria-pressed', 'true');
      }
    });

    return card;
  }

  function arrangeEvidence() {
    const seed = hashString(dreamTitle.textContent || 'The museum is dreaming.');
    const random = mulberry32(seed);
    const ordered = cards
      .map((card) => ({ card, rank: random() }))
      .sort((left, right) => left.rank - right.rank)
      .map(({ card }) => card);

    ordered.forEach((card, index) => {
      card.classList.remove('is-remembered');
      card.setAttribute('aria-pressed', 'false');
      card.querySelector('.dream-photo-label').textContent = `EVIDENCE ${String(index + 1).padStart(2, '0')}`;
    });
    wall.replaceChildren(...ordered);
  }

  function hashString(value) {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function mulberry32(seed) {
    return function random() {
      let value = seed += 0x6D2B79F5;
      value = Math.imul(value ^ value >>> 15, value | 1);
      value ^= value + Math.imul(value ^ value >>> 7, value | 61);
      return ((value ^ value >>> 14) >>> 0) / 4294967296;
    };
  }
})();
