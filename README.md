# The Museum of Almost

A dependency-free, offline-first interactive fiction and generative art experience for the browser.

## Website

[Visit The Museum of Almost](https://yushirm.github.io/museum-of-almost/)

The museum procedurally creates gallery rooms filled with impossible unfinished artifacts. Visitors can examine objects, keep one fictional fragment from each room, reassemble a three-fragment artifact in **The Conservation Lab for Impossible Objects**, observe seven daily futures in **The Observatory of Almost Tomorrow**, tune ten impossible transmissions in **The Listening Room**, enter **The Dreaming Wing** after keeping three fragments, and unlock **The Room That Was Finished** after completing a six-fragment collection.

## What is inside

- Deterministic procedural rooms and exhibit writing.
- Canvas-rendered galleries with responsive mobile and desktop layouts.
- The Conservation Lab for Impossible Objects, a pointer and keyboard workbench with gentle exact-alignment controls.
- The Observatory of Almost Tomorrow, a daily local orrery of seven possible futures.
- The Listening Room, a keyboard-accessible constellation of ten local fictional signals.
- The Dreaming Wing, generated locally from the visitor's kept fragments.
- A local wall of public-domain photographic evidence with interactive arrangements.
- Keyboard-accessible exhibit hotspots and native dialogs.
- A local pocket catalogue with finite collection cycles.
- Optional browser-synthesised ambient sound.
- Local PNG room, conservation, tomorrow and dream postcard export.
- A same-origin service worker for offline use.
- No framework, package install, build step or external runtime dependency.

## Run it

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

A local server is recommended because browsers restrict service workers when a page is opened directly from the filesystem.

## Validate it

```bash
node --check app.js
node --check conservation-core.js
node --check conservation-lab.js
node --check tomorrow-room-core.js
node --check tomorrow-room.js
node --check signal-vault-core.js
node --check signal-vault.js
node --check dreaming-wing.js
node --check dreaming-photos.js
node --check service-worker.js
node scripts/test-conservation.mjs
node scripts/test-tomorrow-room.mjs
node scripts/test-signal-vault.mjs
node scripts/test-dreaming-wing.mjs
node scripts/test-service-worker.mjs
node scripts/check.mjs
node scripts/check-conservation.mjs
```

The repository checks verify required assets, local-only runtime references, service-worker coverage, accessibility structure, Conservation Lab movement and no-storage boundaries, Almost Tomorrow daily generation and storage boundaries, Listening Room entropy boundaries, Dreaming Wing behavior and common secret patterns.

## Privacy boundary

The Museum application contains no personal or identifying sample data and does not accept visitor text. Progress is limited to generated fictional labels, counters and a random seed stored in local browser storage.

The Conservation Lab reads only the existing fictional catalogue and local calendar date to shape a procedural object. It stores no restoration state, pointer path, completed case or postcard. Fragment positions remain in memory only until the page is closed or another case is opened.

The Observatory of Almost Tomorrow uses the browser's local calendar date and the existing fictional catalogue to generate seven alternatives. It stores only the selected alternative number and its target date when a visitor seals a tomorrow. It does not store the visitor's location, timezone or free-form text, and it does not transmit the choice.

The Listening Room retains only ten fixed numeric entropy values. The source seed strings are not stored. Its receiver may echo a fictional fragment already present in the visitor's local catalogue, but it does not send or upload that state.

All photographs are stored inside the repository. The live application does not request remote images or contact their source sites. See [PHOTO_CREDITS.md](PHOTO_CREDITS.md) for provenance and rights.

On the GitHub Pages site, GitHub provides the public hosting and may process technical connection information under its own privacy terms.

See [PRIVACY.md](PRIVACY.md) for the full boundary.

## Public availability and copyright

This repository is intended to be publicly viewable for transparency and to support the hosted Museum website. Public visibility does not make it an open-source project.

No open-source licence is granted. The absence of a licence is deliberate, and all rights are reserved except where applicable law, GitHub's Terms of Service or the separately documented photograph rights provide otherwise. See [RIGHTS.md](RIGHTS.md) and [PHOTO_CREDITS.md](PHOTO_CREDITS.md).

External contributions are not accepted unless explicitly invited by the repository owner. See [CONTRIBUTING.md](CONTRIBUTING.md).
