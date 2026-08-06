# The Museum of Almost

A dependency-free, offline-first interactive fiction and generative art experience for the browser.

The museum procedurally creates gallery rooms filled with impossible unfinished artifacts. Visitors can examine objects, keep one fictional fragment from each room, save local postcards, and unlock **The Room That Was Finished** after completing a six-fragment collection.

## What is inside

- Deterministic procedural rooms and exhibit writing.
- Canvas-rendered galleries with responsive mobile and desktop layouts.
- Keyboard-accessible exhibit hotspots and native dialogs.
- A local pocket catalogue with finite collection cycles.
- Optional browser-synthesised ambient sound.
- Local PNG postcard export.
- A same-origin service worker for offline use.
- No framework, package install, build step or external dependency.

## Run it

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

A local server is recommended because browsers restrict service workers when a page is opened directly from the filesystem.

## Validate it

```bash
node --check app.js
node --check service-worker.js
node scripts/check.mjs
```

The repository check verifies required assets, local-only runtime references, service-worker coverage, basic accessibility structure and common secret patterns.

## Privacy boundary

This project contains no personal or identifying sample data and does not accept visitor text. Progress is limited to generated fictional labels, counters and a random seed stored in local browser storage.

See [PRIVACY.md](PRIVACY.md) for the full contract. Public deployment is intentionally out of scope.
