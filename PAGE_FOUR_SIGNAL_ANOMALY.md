# Page Four Signal Anomaly / The Rumor Crosses Galleries

## Release intent

“Spread the word” is implemented as in-Museum propagation, not external social sharing, outbound automation, analytics, visitor counting, or a third-party distribution service.

Page Four remains explicitly fictional. The feature lets that fictional archive appear to leak into other Museum rooms while keeping factual product boundaries intact.

## Product decision

Three surfaces were considered:

- **COMMONS / NOW** — rejected for contamination. Its job is to present a current, evidence-qualified planetary instrument. Conspiracy framing would weaken that semantic contract.
- **DEEP SPACE / ALMOST** — selected as the second sighting point. Its existing unknown-universe framing can host a clearly labeled fictional anomaly without changing any scientific calculation.
- **ALMOST ONLINE!** — selected as the amplifier. Its personal-homepage bulletin grammar is already the Museum’s natural rumor channel.

Page Four itself becomes the static record of where the rumor has appeared.

## What changed

- Deep Space adds a same-origin `? Page Four / unfiled` navigation link.
- Deep Space adds a `SIGNAL ANOMALY` note that says a fourth page is being reported elsewhere in the Museum and explicitly states that the archive is fictional and the route is local.
- ALMOST ONLINE! amplifies its existing Page Four bulletin with `DEEP SPACE NOW REPORTS THE SAME ANOMALY` and records `DEEP SPACE SAW IT TOO` in the local site-update list.
- Page Four adds a `Signal echo / Deep Space` route.
- Page Four adds a static `KNOWN LEAK POINTS` card listing the Museum entrance, ALMOST ONLINE!, and Deep Space.
- The leak-points card explicitly says `STATIC ROUTES. NO VISITOR STATE OR COUNTING.` It is authored product copy, not observed visitor activity.
- The coherent service-worker shell advances from v34 Gauge Bench to `museum-of-almost-v35-page-four-signal-anomaly` while preserving all prior assets.

## Boundaries

- No external share target or social SDK.
- No Web Share API.
- No added data-service or external runtime request.
- No visitor free text or numeric input.
- No localStorage, sessionStorage, IndexedDB, cookies, or geolocation.
- No analytics, telemetry, audience counting, personalization, or visitor-state inspection.
- No new framework, package, dependency, build system, backend, account, or cloud state.
- All new navigation is ordinary same-origin relative linking.
- Existing Deep Space calculations and progressive instruments are unchanged.
- COMMONS / NOW remains untouched by the fictional contamination layer.

## Accessibility and failure behavior

The new routes use ordinary anchors and inherit the galleries’ existing keyboard focus, responsive layout, increased-contrast, reduced-motion, and print behavior. No animation, timer, polling loop, or viewport-inspection logic was added.

If JavaScript does not run, the original gallery content remains intact; the contamination layer is progressive enhancement rather than a prerequisite for the core galleries.

## Validation evidence

Baseline live `main` after the concurrent True Width release:

`64821f14a99623a789697aff2a84a8d2e068b1a6`

Feature-complete reconciled head:

`82d19b2d6a1a769764f40b6c6a89e5ee8df0dd28`

Pull request:

`#77 — Let Page Four contaminate Deep Space`

Required feature-complete check:

- workflow: `Check museum`;
- required job: `check`;
- run: `237`;
- conclusion: `success`.

An earlier green run, `234`, is not release evidence because `main` advanced before release. The branch was reconciled onto the exact new `main`. During that reconciliation, adversarial review caught that the carried ALMOST ONLINE! regression file would have dropped the concurrent True Width assertions; those assertions were restored before run `237`.

## Anti-drift invariants

- Page Four must remain explicitly fictional and unverified.
- Cross-gallery propagation must stay same-origin and visitor-controlled.
- A static leak list must never become visitor observation, counting, analytics, or personalization.
- COMMONS / NOW must remain semantically separate from Page Four’s conspiracy-fiction framing unless a future product decision explicitly changes that contract.
- Deep Space anomaly copy must distinguish the fictional archive from the gallery’s scientific material.
- ALMOST ONLINE! may amplify the rumor in its own voice without acquiring audience state.
- The offline shell must remain fresh-online / cached-offline and same-origin only.

## Final-merge rule

This recovery note is added only after the reconciled feature-complete head passed the required `check` job. Because adding it changes the branch head, the archive-bearing final head must pass the same required `check` job again before merge.
