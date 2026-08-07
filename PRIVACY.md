# Privacy Boundary

The Museum of Almost is a static, local-first browser experience.

## The application does not

- create accounts or profiles;
- accept visitor text;
- use analytics, advertising, telemetry, tracking, fingerprinting, or remote AI;
- request third-party scripts, fonts, media, or APIs at runtime;
- transmit local state;
- store names, contact details, locations, timestamps, pointer paths, routines, or personal content.

## Local state

The application may store one JSON value under `museum-of-almost:entropy:v1`.

It contains only bounded fictional and technical state:

- a random numeric install seed;
- a visit counter;
- a contradiction counter;
- six numeric tension values;
- bounded repetition and mutation counters;
- up to four fictional delayed consequences;
- one seeded fictional accident;
- one bounded numeric pressure value produced while migrating obsolete fictional state.

The data is inspectable in browser storage, remains on the device, and can be removed with the visible **Reset local state** control or browser storage controls. If storage is unavailable, the current visit continues in memory only.

## State migration

The application reads the obsolete keys `museum-of-almost:v1` and `museum-of-almost:tomorrow:v1` only to derive one bounded pressure number. It does not retain old generated text, labels, room identifiers, catalogue entries, or sealed selections. After successful migration, those obsolete keys are removed.

## Sound

Sound is off by default. When explicitly enabled, tones are generated locally with browser WebAudio. No recording, microphone access, uploaded audio, or remote media is used.

## Offline support

A same-origin service worker caches the small static application files. It ignores cross-origin requests and removes obsolete Museum cache versions during activation.

## Hosting

The public site is hosted by GitHub Pages. GitHub may process technical connection information under its own privacy terms. The application does not add analytics or tracking on top of that hosting.
