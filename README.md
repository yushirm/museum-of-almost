# The Museum of Almost

Live site: https://yushirm.github.io/museum-of-almost/

The Museum of Almost is a dependency-free, static experimental museum built for GitHub Pages. The entrance presents four public galleries and one facilities route that deliberately refuses to become Gallery 05.

The Museum is local-first, offline-capable, accessible on mobile and desktop, and intentionally free of accounts, analytics, advertising, tracking, visitor free-text input, cloud storage, third-party runtime scripts, remote fonts, and remote media.

## Museum map

| Route | Space | Contract |
| --- | --- | --- |
| `index.html` | **MUSEUM ENTRANCE** | Four public gallery cards plus one facilities seam. No script and no live-data request. |
| `commons-now.html` | **COMMONS / NOW** | A live public instrument: five current requests across four public scientific services, thirteen fixed weather windows, and local derived instruments. |
| `deep-space.html` | **DEEP SPACE / ALMOST** | Local cosmic instruments and fixed thought experiments about light, gravity, relativity, lensing, redshift, expansion, and unresolved physics. No data-service request. |
| `almost-online.html` | **ALMOST ONLINE!** | A hand-built Web 1.0 personal homepage with local GIFs, diary entries, strange links, badges, and deliberate old-web texture. No analytics or visitor memory. |
| `page-four.html` | **PAGE FOUR** | An explicitly fictional, unfiled archive of impossible maps, cryptids, suspicious broadcasts, diagrams, and red-string evidence theater. Nothing here is presented as real-world evidence. |
| `elsewhere.html` | **ELSEWHERE / CATALOGUE 0** | The fifth space: an accessible service corridor, freight lift `0`, and twelve fixed fictional accession records recovered from worlds that almost existed. It remains outside the four-card gallery grid. |

The entrance hierarchy is part of the product model. `ELSEWHERE / CATALOGUE 0` is discoverable through **FACILITIES NOTICE 05 / FLOOR PLAN DISAGREEMENT**, not promoted into an ordinary gallery card.

## Product boundaries

The Museum preserves these defaults:

- static files only; no framework, package manager, build system, database, backend, account system, or paid runtime service;
- relative same-origin paths that work under a GitHub Pages project URL;
- no visitor accounts, authentication, profiles, cloud state, comments, uploads, forms, or free-text submissions;
- no analytics, telemetry, advertising, behavioral tracking, fingerprinting, or third-party runtime scripts;
- no remote fonts or remote runtime media;
- no browser geolocation, camera, microphone, contacts, or sensor access;
- no automatic polling loops;
- local interaction state stays in page memory unless a feature explicitly documents otherwise;
- same-origin service-worker caching is limited to the Museum application shell;
- cross-origin live scientific responses are never cached, proxied, or persisted by the Museum.

## Network behavior

Most of the Museum is local-only at runtime.

**COMMONS / NOW** is the deliberate exception. Opening it makes exactly five current public-data requests across four services:

- USGS Earthquake Hazards Program;
- NOAA Space Weather Prediction Center — solar-wind speed;
- NOAA Space Weather Prediction Center — current NOAA Space Weather Scales;
- Open-Meteo;
- NASA Earth Observatory Natural Event Tracker.

Those five requests enter one shared acquisition barrier. Pressing **Refresh world** performs one new five-request snapshot. There is no background polling.

The entrance, DEEP SPACE / ALMOST, ALMOST ONLINE!, PAGE FOUR, and ELSEWHERE / CATALOGUE 0 do not initiate data-service requests or load third-party runtime assets. Ordinary navigation remains ordinary browser navigation.

See `SOURCES.md` for the exact COMMONS endpoints, source semantics, and attribution.

## Privacy and fiction boundaries

The Museum does not ask for a visitor name, email address, account, location, story, upload, comment, or free-text input. It does not create cookies or write visitor history into `localStorage`, `sessionStorage`, or IndexedDB. It adds no analytics or tracking on top of GitHub Pages hosting.

Direct COMMONS requests still expose ordinary network-layer information, such as an IP address, to the requested public service and network infrastructure. The Museum does not receive provider server logs.

**PAGE FOUR** and **ELSEWHERE / CATALOGUE 0** are explicitly fictional spaces. Their records, accession codes, provenance claims, diagrams, contradictions, rumors, and institutional notes are not historical or scientific evidence and are not claims about real people or institutions.

See `PRIVACY.md` for the complete application boundary.

## Offline behavior

A same-origin service worker keeps one coherent Museum shell for the entrance and active spaces. Static HTML, JavaScript, CSS, local images, local maps, and documentation assets needed by the runtime can fall back to the cache when the network is unavailable.

Cross-origin COMMONS scientific responses are excluded from service-worker caching. Offline COMMONS therefore opens its explanatory shell but reports live scientific values as unavailable instead of showing a persisted stale snapshot. The local-only spaces retain their static and locally computed material without needing a data provider.

After a complete shell upgrade, open Museum pages reload once so HTML, scripts, styles, and local assets do not remain split across cache versions.

## Run locally

No install step is required.

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Validate

The required GitHub Actions job is exactly `check`. It performs JavaScript syntax validation, focused feature regressions, privacy and network-boundary checks, service-worker lifecycle checks, and documentation/application-contract checks.

A useful local equivalent is:

```bash
git ls-files '*.js' '*.mjs' | xargs -n1 node --check
for test in scripts/test-*.mjs; do node "$test"; done
node scripts/check.mjs
```

## Durable records

The repository keeps implementation records alongside the runtime. Important entry points include:

- `PRIVACY.md` — application privacy and data-handling boundaries;
- `SOURCES.md` — exact COMMONS public-data endpoints, semantics, and attribution;
- `DEEP_SPACE.md` — the Deep Space gallery contract and scientific boundaries;
- `ELSEWHERE_CATALOGUE_ZERO.md` — the fifth-space product, fiction, accessibility, privacy, and offline contract;
- `SUCCESS_ARCHIVE.md` — selected release evidence recorded after successful required checks;
- `REBUILD_LOG.md`, `CONSTRUCTION_LOG.md`, `ENTROPY_LOG.md`, and `ENTROPY_HISTORY.md` — earlier product and mutation history.

Historical records remain useful as history, but the active runtime is defined by the current entrance, current pages, current tests, and current service-worker shell.

## Rights

This repository is publicly viewable for transparency and GitHub Pages hosting. No open-source licence is granted to the Museum code. `world-map.svg` is derived from Natural Earth public-domain geographic data; that source status is not restricted by the Museum's rights notice.

See `RIGHTS.md` for the rights position and `CONTRIBUTING.md` for the contribution policy.
