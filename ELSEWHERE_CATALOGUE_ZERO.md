# ELSEWHERE / CATALOGUE 0

## Decision

The fifth Museum space deliberately does not become a fifth gallery card.

The entrance keeps four public galleries and gains a narrow facilities notice that exposes a service door. That door leads to **ELSEWHERE / CATALOGUE 0**, an interstitial maintenance level connecting the four existing spaces to a fictional collections store.

The design merges three earlier directions:

- **NO MAN'S LAND / BETWEEN PAGES** supplies the impossible service corridor between the public spaces;
- **THE BASEMENT / CATALOGUE 0** supplies the institutional collections-store structure;
- **LOST & FOUND / ELSEWHERE** supplies the objects: artifacts from versions of the world that almost existed.

The result is one coherent page rather than three separate products.

## Product contract

ELSEWHERE is a same-origin, dependency-free static page.

It adds:

- one maintenance-level entrance on `index.html`, outside the four-card public gallery grid;
- an interstitial corridor with explicit return doors to COMMONS / NOW, DEEP SPACE / ALMOST, ALMOST ONLINE!, and PAGE FOUR;
- a freight lift marked `0` that moves the visitor conceptually into Catalogue 0;
- twelve fixed fictional artifact records;
- native `<details>` disclosure so every record remains usable without JavaScript;
- one optional **OPEN NEXT MISFILE** control that cycles deterministically through the twelve records in memory only;
- one same-origin service-worker registration from the page;
- responsive, reduced-motion, increased-contrast, keyboard-focus, and print behavior;
- complete offline-shell inclusion.

## Fiction boundary

Every Catalogue 0 object, accession code, condition note, contradiction, and provenance statement is fictional.

The page explicitly says this in the runtime UI. It does not present invented objects as historical evidence, scientific evidence, leaked material, or claims about real institutions or people.

The twelve records are generic and owner-independent:

1. The Key to Room 0
2. A Ticket for the Unbuilt Line
3. Map with the Geography Removed
4. Warranty for a Machine Not Yet Manufactured
5. Film Canister Marked “Exposure: Tomorrow”
6. Permanent Temporary Exit
7. Ticket Number 000
8. Label for “The Last Tuesday”
9. Postcard from a Place Not on the Chart
10. Spare Shadow, Boxed
11. Manual for Model 0
12. Room 0 Plaque

No personal names, correspondence, addresses, precise locations, employment material, financial information, health information, credentials, private URLs, or unrelated conversational material are used.

## Interaction and state

The baseline experience needs no JavaScript. Artifact records are native `<details>` elements and all navigation is ordinary same-origin linking or fragment navigation.

`elsewhere.js` adds only two behaviors:

1. **OPEN NEXT MISFILE** closes the current record, opens the next fixed record, updates a polite live status, and scrolls that record into view;
2. on page load, it registers the existing same-origin `service-worker.js`.

The cursor is a local JavaScript variable. It is not persisted.

The page uses no:

- visitor free-text input;
- form submission;
- cookies;
- `localStorage`, `sessionStorage`, or IndexedDB;
- geolocation;
- analytics or telemetry;
- timers, polling, animation-frame loops, or background monitoring;
- external scripts, fonts, images, media, APIs, or runtime services;
- `fetch`, XHR, WebSocket, EventSource, or beacon calls.

## Entrance hierarchy

The Museum entrance still has four public gallery cards. ELSEWHERE appears below that grid as **FACILITIES NOTICE 05 / FLOOR PLAN DISAGREEMENT**.

This is intentional. The fifth space should alter how the existing Museum is understood rather than flattening itself into another peer card.

The service door is fully keyboard reachable and visible. The concept is hidden institutionally, not hidden from accessibility tooling or dependent on secret interaction.

## Accessibility

The page includes:

- a skip link directly to Catalogue 0;
- semantic sections, headings, navigation, `<details>` and `<summary>` elements;
- a polite `role="status"` region for the optional misfile control;
- visible `:focus-visible` treatment;
- minimum 44px interactive target treatment;
- responsive layouts down to the established 320px floor;
- `prefers-reduced-motion` handling that disables smooth scrolling;
- `prefers-contrast: more` handling;
- text-authoritative object descriptions so CSS illustrations carry no exclusive meaning.

## Offline shell

The release advances the coherent service-worker shell to:

`museum-of-almost-v39-catalogue-zero`

The previous `v38-quorum-gate` cache is retained as a named historical marker and the following assets are installed into the same-origin shell:

- `elsewhere.html`
- `elsewhere.css`
- `elsewhere.js`
- `elsewhere-teaser.css`
- `ELSEWHERE_CATALOGUE_ZERO.md`

The existing network-first same-origin behavior and cross-origin non-interception rule remain unchanged.

## Test evidence

`scripts/test-elsewhere.mjs` validates:

- all twelve fixed accession records and their exact contiguous IDs;
- native progressive-disclosure structure;
- fiction and no-submission disclosures;
- absence of external runtime URLs and visitor-input surfaces;
- absence of persistence, geolocation, analytics, telemetry, live-network APIs, polling, and animation loops;
- service-worker registration and local misfile behavior;
- keyboard, responsive, reduced-motion, contrast, and print CSS hooks;
- entrance integration outside the ordinary gallery-card grid;
- v39 offline-shell inclusion.

The required GitHub Actions job remains exactly `check`.
