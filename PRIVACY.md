# Privacy Boundary

The Museum of Almost is a static, local-first browser experience.

## The application does not

- create accounts or profiles;
- accept visitor text;
- use analytics, advertising, telemetry, tracking, fingerprinting, or remote AI;
- request third-party scripts, fonts, media, images, or APIs at runtime;
- transmit local state;
- store names, contact details, locations, timestamps, pointer paths, routines, or personal content.

## Local state

The application may store one JSON value under `museum-of-almost:entropy:v2`.

It contains only bounded fictional and technical state:

- a random numeric install seed;
- visit and repair counters;
- one season index;
- eight bounded fictional misregistration values;
- a bounded inactivity counter;
- up to three fictional delayed corrections;
- exactly one visitor action, represented only by a timeline slot and bounded fictional delta;
- one small bounded numeric bias produced while migrating obsolete fictional state.

No action history, pointer coordinates, timestamps, free-form text, or identifying data are stored. The remembered action is replaced by the next repair.

The data is inspectable in browser storage, remains on the device, and can be removed with the visible **Reset local state** control or browser storage controls. If storage is unavailable, the current visit continues in memory only.

## State migration

The application may read obsolete fictional keys only to derive one small bounded starting bias. Old generated labels, rules, repeated actions, fictional accidents, room-era state, and sealed selections are not retained. After successful conversion, obsolete keys are removed.

## Sound

Sound is off by default. When explicitly enabled, tones are generated locally with browser WebAudio. No recording, microphone access, uploaded audio, or remote media is used.

## Offline support

A same-origin service worker caches the small static application files. It ignores cross-origin requests and removes obsolete Museum cache versions during activation.

## Hosting

The public host may process ordinary technical connection information under its own terms. The application does not add analytics or tracking on top of that hosting.
