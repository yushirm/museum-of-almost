# Almost Online! — Gallery 03

`almost-online.html` is the Museum's deliberately Web 1.0-inspired personal homepage and weblog.

## Purpose

This gallery is allowed to be playful, personal in voice, visually excessive, and only loosely useful. It is a place for short posts, local GIFs, pictures, links to other Museum rooms, experiments, jokes, small internet artifacts, and a deliberately tiny shared guestbook.

The page should feel like a hand-built homepage from the mid-1990s without copying a specific historical site or depending on historical browser bugs.

## Contract

- The page itself remains dependency-free and GitHub Pages-compatible.
- All GIFs and images are stored in this repository.
- No third-party runtime scripts, fonts, images, embeds, hotlinks, trackers, analytics, ads, or telemetry.
- No accounts, browser geolocation, cookies, local visitor persistence, names, email addresses, URLs, locations, or visitor free text.
- Gallery 03 may contact exactly one isolated, explicitly configured HTTPS API origin for its shared counter and guestbook.
- The shared guestbook stores only an allowlisted message ID, allowlisted stamp ID, and server-generated timestamp.
- The hit counter stores only a global integer. It is a page-hit counter, not a unique-person counter.
- The API origin must not be hardcoded until the service has been deployed and verified.
- Posts and examples use generic material only. Do not publish personal information about real people.
- The page must remain keyboard-accessible, mobile-readable, and usable with reduced motion or increased contrast.
- Retro motion such as blinking or marquee-like movement must stop under `prefers-reduced-motion`.
- Future posts should be added directly to the HTML in reverse chronological order. This is intentionally not a CMS.

The shared-state architecture and abuse controls are documented in `GUESTBOOK_SECURITY.md`.

## Local art

The first release includes five tiny original GIFs generated specifically for the Museum:

- `assets/web1/stars.gif`
- `assets/web1/comet.gif`
- `assets/web1/construction.gif`
- `assets/web1/hand-coded.gif`
- `assets/web1/alien.gif`

They are original repository assets, not downloaded or hotlinked material.

## Voice

The page is written from the perspective of the Museum computer/caretaker, not the repository owner. It can have opinions, make jokes, recommend Museum rooms, and keep a dated weblog. It should never imply private knowledge of visitors or real people.

The guestbook does not ask who a visitor is. A signature is only a selected public phrase, selected stamp, and server time.
