# Privacy Boundary

The Museum of Almost is a static, local-first browser experience. Its core treaty remains fully usable without a network connection.

## The application does not

- create accounts or profiles;
- accept visitor text;
- use analytics, advertising, telemetry, tracking, fingerprinting, or remote AI;
- request third-party scripts, fonts, media, or images at runtime;
- request browser location, microphone, camera, contacts, or other personal-device data;
- transmit local treaty state to any remote service;
- store names, contact details, locations, timestamps, routines, or personal content.

The only intentional cross-origin runtime data requests are the two optional public scientific feeds described under **Live entropy** below.

## Local state

The application may store one JSON value under `museum-of-almost:entropy:v5`.

It contains only bounded fictional and technical state:

- a random numeric install seed;
- optionally, the last fictional suspension the visitor attempted to erase, represented by one bounded position integer and one bounded weight integer.

Active suspensions are session-only and are not stored. The constructive field ledger, resonance spans, mirrored echoes, session undo state, weight edits, and current-visit journal are also session-only. Hold durations and pointer coordinates exist only transiently in memory while a gesture is being interpreted. Pointer paths, action histories, visit counters, timestamps, semantic labels, movement histories, sound choices, postcard history, print history, live entropy responses, live pressure, and animation phases are not stored.

The once-per-installation field reversal is inferred from whether an attempted-erasure ghost already exists. It does not require a separate tracking flag. Using **Reset local state** intentionally clears that local installation memory and permits the fictional one-time event to occur again.

The stored data is inspectable in browser storage, remains on the device, and can be removed with the visible reset control or browser storage controls. If storage is unavailable, the current session continues in memory only.

## Live entropy

Live entropy is off by default. Nothing outside the same-origin application is requested until the visitor presses **Invite live entropy**.

One invitation makes at most one direct request to each of these fixed public scientific endpoints:

- USGS Earthquake Hazards Program: the public all-earthquakes GeoJSON summary for the past hour;
- NOAA Space Weather Prediction Center: the public current solar-wind-speed summary.

The request URLs are fixed in application code. Local treaty state, the install seed, active marks, erased memory, visitor input, and browser location are not added to either request.

For both requests the application explicitly uses `credentials: omit`, `referrerPolicy: no-referrer`, `cache: no-store`, and CORS mode. The application therefore does not intentionally send cookies or the Museum page URL. A normal direct internet request still necessarily exposes network-layer information such as the visitor's IP address to USGS or NOAA and to ordinary network infrastructure. Those services may process connection information under their own policies; the Museum does not receive their server logs.

The Museum does not poll these services automatically. Pressing **Refresh live entropy** makes a new explicit pair of requests. Pressing **Release influence**, closing the page, or reloading removes the live influence from memory.

Raw source data is reduced immediately to a small fictional influence:

- USGS contributes only aggregate earthquake count, strongest magnitude, and aggregate depth calculations; event names, places, identifiers, coordinates, URLs, and timestamps are ignored;
- NOAA contributes only the current numeric solar-wind speed;
- those values become bounded pressure, bias, scale, and a position on the existing treaty line.

The reduced values and raw responses are not written to local storage, IndexedDB, cookies, the postcard, or the service-worker cache. They are not forwarded to another service. If one source fails, the other may contribute alone. If both fail or the visitor is offline, the local treaty continues unchanged.

## Local postcard and printing

**Make local postcard** generates an SVG file entirely in the browser from the currently visible fictional treaty state. It includes bounded mark positions and weights, the visible unresolved measurement, the current resonance classification, whether an erased ghost is visible, and an installation-neutral code derived from the postcard's fictional configuration. It does not include the install seed, visitor text, timestamps, browser details, network information, or live entropy. The generated file is not uploaded or transmitted by the application.

**Print treaty** opens the browser's local print dialog. The application does not receive printer information or a copy of the printed output.

## State migration

The application may read obsolete Museum keys only to preserve an existing random install seed when one is safely available. Previous geometry, labels, contradictions, translations, offsets, seasons, action counts, fragments, selections, timing, pointer data, and other fictional state are discarded. Obsolete keys are then removed.

## Sound

Sound is off by default. When explicitly enabled, brief tones are generated locally with browser WebAudio for suspensions, constructive edits, erasure attempts, and the one-time fictional reversal. The application does not record audio, request microphone access, upload sound, or fetch remote media.

## Motion

The two fictional forces move only as a local visual animation. Animation phase is never stored. Reduced-motion preferences replace continuous movement with a stable equivalent state while preserving all interaction and information. Live entropy changes bounded scale and position variables but does not override reduced-motion behavior.

## Offline support

A same-origin service worker caches the small static application files, including the local live-entropy code and styles. It ignores cross-origin requests, does not cache or proxy the USGS or NOAA responses, and removes obsolete Museum cache versions during activation.

## Hosting

The public host may process ordinary technical connection information under its own terms. The application does not add analytics or tracking on top of that hosting.
