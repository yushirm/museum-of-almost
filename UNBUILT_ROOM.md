# The Unbuilt Room — 404 recovery

## Purpose

The Unbuilt Room is the Museum's custom missing-page response. It exists to keep a broken or mistyped route inside a coherent recovery experience without promoting failure into another gallery, puzzle, unlock, or fictional discovery system.

Its job is deliberately narrow:

> Admit that no room is filed here, then help the visitor recover.

## Design gate

Three directions were evaluated before implementation.

### Concept A — Museum 404

The conventional next step: replace the generic hosting error with a clear Museum-branded missing-page response and a reliable way back to the entrance.

### Concept B — Registrar's Rejection Slip

Borrow the language of museum accession work. A missing route becomes an unfiled room with a small registrar slip: no accession exists, no collection event occurred, and recovery is the correct action.

### Concept C — The 404 Maze

Turn every broken route into a procedurally different almost-room, encouraging visitors to hunt invalid URLs for hidden material.

**Discarded:** C. It would reward broken navigation, blur the difference between intentional hidden spaces and errors, create pressure to inspect visitor-supplied paths, and make recovery less predictable.

**Merged:** A + B into **The Unbuilt Room / This Room Almost Existed**.

## Product contract

- `404.html` is a failure surface, not Gallery 05, Gallery 06, a Page Four file, a Catalogue 0 accession, or a secret progression route.
- The page does not echo the missing URL, query string, hash, or path into the DOM.
- The Museum application does not store, persist, submit, classify, score, or build history from the missing path.
- Ordinary hosting and network request logs remain outside the Museum application and are acknowledged in the page footer.
- No analytics, telemetry, beacon, external asset, remote script, remote font, API call, account, cookie, local storage, session storage, IndexedDB, geolocation, visitor text input, timer, or polling is added.
- The recovery page is self-contained so a deeply nested missing URL cannot break its styling or depend on a relative stylesheet lookup.

## Recovery behavior

The page offers two explicit actions:

1. **Return to Museum Entrance** — JavaScript derives the project root locally. On `*.github.io`, the first pathname segment is treated as the GitHub Pages project path. On ordinary local development hosts, recovery returns to `/`.
2. **Go Back One Door** — use browser history when a prior entry exists; otherwise fall back to the derived Museum root.

The route is never displayed while deriving that root.

If JavaScript is unavailable, the page tells the visitor to use the browser's Back control. The initial entrance link remains a harmless `./` fallback, but the script replaces it with the project-root path during normal operation.

## Offline behavior

The coherent service-worker shell advances from v43 Dead Drop to **v44 Unbuilt Room** and caches `404.html` locally. Unequal Minute remains preserved as v42 lineage.

Same-origin navigations remain network-first:

- the Museum scope root falls back to cached `index.html` when offline;
- known cached Museum documents fall back to their requested cached response when offline;
- an uncached or unknown same-origin navigation falls back to cached `404.html` instead of a browser network-error page.

The service worker still ignores cross-origin requests and does not proxy or cache the COMMONS scientific services.

The offline fallback response comes from the cached 404 document and therefore cannot reproduce the network's HTTP 404 status code. Its role offline is recovery, not transport-level status simulation.

## Accessibility

- semantic header, main, footer and recovery controls;
- skip link to recovery controls;
- native anchor and button controls with visible focus;
- minimum 44 CSS-pixel interactive targets;
- responsive single-column layout on narrow screens;
- increased-contrast treatment;
- text remains authoritative over the decorative floor-plan drawing;
- no motion or timed behavior is required.

## Rebuild rule

Keep the Unbuilt Room boring in the most important way: one missing route must not become content about the visitor.

Future changes must preserve predictable recovery, avoid displaying the requested path, and keep intentional hidden Museum spaces distinguishable from ordinary errors.
