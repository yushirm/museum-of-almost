# Privacy Boundary

The Museum of Almost is a static, local-first browser experience.

## The application does not

- create accounts or profiles;
- accept visitor text;
- use analytics, advertising, telemetry, tracking, fingerprinting, or remote AI;
- request third-party scripts, fonts, media, images, or APIs at runtime;
- transmit local state;
- store names, contact details, locations, timestamps, pointer coordinates, routines, or personal content.

## Local state

The application may store one JSON value under `museum-of-almost:entropy:v3`.

It contains only:

- a random numeric install seed used for local procedural variation;
- exactly one fictional contradiction with a bounded source label and two bounded terms.

No action history, interaction counts, pointer paths, timestamps, free-form text, behavioural profile, or identifying data are stored. Each settled translation replaces the previous contradiction.

The value is inspectable in browser storage, remains on the device, and can be removed with the visible **Reset local state** control or browser storage controls. If storage is unavailable, the current session continues without durable memory.

## State migration

Obsolete Museum keys may be read once only to detect that earlier fictional state existed. When detected, that existence is compressed into the generic contradiction `settled / not settled`; no previous values, labels, counters, actions, timing, or generated content are retained. Obsolete keys are then removed.

## Sound

Sound is off by default. When explicitly enabled, short tones are generated locally with browser WebAudio. No recording, microphone access, uploaded audio, or remote media is used.

## Offline support

A same-origin service worker caches the small static application files. It ignores cross-origin requests and removes obsolete Museum cache versions during activation.

## Hosting

The public host may process ordinary technical connection information under its own terms. The application does not add analytics or tracking on top of that hosting.
