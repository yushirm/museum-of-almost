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

The application may store one JSON value under `museum-of-almost:entropy:v5`.

It contains only bounded fictional and technical state:

- a random numeric install seed;
- optionally, the last fictional suspension the visitor attempted to erase, represented by one bounded position integer and one bounded weight integer.

Active suspensions are session-only and are not stored. Hold durations and pointer coordinates exist only transiently in memory while a gesture is being interpreted. Pointer paths, action histories, visit counters, timestamps, semantic labels, movement histories, sound choices, and animation phases are not stored.

The once-per-installation field reversal is inferred from whether an attempted-erasure ghost already exists. It does not require a separate tracking flag. Using **Reset local state** intentionally clears that local installation memory and permits the fictional one-time event to occur again.

The stored data is inspectable in browser storage, remains on the device, and can be removed with the visible reset control or browser storage controls. If storage is unavailable, the current session continues in memory only.

## State migration

The application may read obsolete Museum keys only to preserve an existing random install seed when one is safely available. Previous geometry, labels, contradictions, translations, offsets, seasons, action counts, fragments, selections, timing, pointer data, and other fictional state are discarded. Obsolete keys are then removed.

## Sound

Sound is off by default. When explicitly enabled, brief tones are generated locally with browser WebAudio for suspensions, erasure attempts, and the one-time fictional reversal. The application does not record audio, request microphone access, upload sound, or fetch remote media.

## Motion

The two fictional forces move only as a local visual animation. Animation phase is never stored. Reduced-motion preferences replace continuous movement with a stable equivalent state while preserving all interaction and information.

## Offline support

A same-origin service worker caches the small static application files. It ignores cross-origin requests and removes obsolete Museum cache versions during activation.

## Hosting

The public host may process ordinary technical connection information under its own terms. The application does not add analytics or tracking on top of that hosting.
