# Privacy Boundary

The Museum of Almost is a static, local-first browser experience.

## The application does not

- create accounts or profiles;
- accept visitor text;
- use analytics, advertising, telemetry, tracking, fingerprinting, or remote AI;
- request third-party scripts, fonts, media, images, or APIs at runtime;
- transmit local state;
- store names, contact details, locations, timestamps, routines, or personal content.

## Local state

The application may store one JSON value under `museum-of-almost:entropy:v4`.

It contains only bounded fictional and technical state:

- a random numeric install seed;
- a bounded visit counter used to reinterpret fictional labels;
- preserved geometry consisting of four bounded integers: spread, axis, fold, and generation.

The visible semantic labels are generated from that state and are not stored as visitor content. No action history is stored. Pointer coordinates are not stored; drag coordinates exist only transiently in memory long enough to classify one gesture as north, east, south, or west. No pointer path, timestamp, free-form text, or identifying data is retained.

The data is inspectable in browser storage, remains on the device, and can be removed with the visible **Reset local state** control or browser storage controls. If storage is unavailable, the current session continues in memory only.

## State migration

The application may check obsolete Museum keys only to determine whether old fictional state exists. It does not preserve old contradiction words, translations, offsets, seasons, action counts, fragments, selections, timing, or pointer data. Obsolete-state existence is compressed to a small neutral starting geometry and the old keys are removed.

## Sound

Sound is off by default. When explicitly enabled, brief tones are generated locally with browser WebAudio only during visitor separation. Inactivity remains silent. No recording, microphone access, uploaded audio, or remote media is used.

## Offline support

A same-origin service worker caches the small static application files. It ignores cross-origin requests and removes obsolete Museum cache versions during activation.

## Hosting

The public host may process ordinary technical connection information under its own terms. The application does not add analytics or tracking on top of that hosting.
