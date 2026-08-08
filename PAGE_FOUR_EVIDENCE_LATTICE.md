# Page Four Evidence Lattice

## Outcome

The Evidence Lattice turns Page Four from a purely fictional conspiracy archive into a two-layer casework room:

- the original nine Page Four files remain explicitly fictional;
- a separate research intake presents six real primary-source records with their evidentiary limits intact;
- a fixed correlation desk lets the visitor inspect editorial cross-case patterns without turning those patterns into new evidence.

The creative reference point was procedural fringe-science television: investigate the impossible seriously, keep case files, compare anomalies, and allow patterns to emerge. The Museum does not copy any existing characters, organizations, cases, or mythology.

## Evidence model

Every real dossier has three fields:

1. **DOCUMENTED** — what the cited primary or official record supports.
2. **LIMIT** — what that record does not establish.
3. **PAGE FOUR NOTE** — editorial interpretation or fictional connective tissue.

The six dossiers cover:

- Project BLUE BOOK and its unresolved classification records;
- the FBI laboratory examination of a submitted Bigfoot-associated hair sample;
- paired CIA STARGATE / GRILL FLAME remote-viewing session records with mixed assessments;
- NOAA’s Bloop recording and later icequake explanation;
- NASA’s observations of the interstellar object ʻOumuamua;
- NASA’s UAP independent-study emphasis on high-quality data and metadata.

The detailed source URLs and wording boundaries are recorded in `PAGE_FOUR_RESEARCH.md`. No external source is loaded by the site at runtime.

## Anti-misinformation invariants

- “Unidentified” is a data or classification state, not a cause.
- Government attention is not government validation.
- A physical sample constrains the claim attached to that sample; it does not automatically prove or disprove an entire folklore category.
- Resolved anomalies remain evidence: an explanation arriving later does not make the original observation fictional.
- Editorial cross-case connections are labeled **not new evidence**.
- The strongest recurring pattern in the current lattice is uncertainty itself: the gap between observation and explanation.
- COMMONS / NOW remains outside Page Four’s conspiracy-fiction framing.

## Product and runtime model

The research wing mounts progressively after the original evidence board. If it does not load, the original Page Four document remains intact.

The feature:

- uses local static text only;
- creates interface nodes with DOM methods rather than HTML-string injection;
- performs no data-service fetch, polling, timer loop, or animation-frame loop;
- stores no visitor state and collects no visitor text;
- uses no analytics, telemetry, counting, cookies, geolocation, social SDK, Web Share API, or remote runtime dependency;
- keeps source URLs in the local repository ledger instead of embedding or loading source sites;
- provides keyboard focus, 44px controls, responsive layout, reduced-motion, increased-contrast, and print handling;
- participates in the same-origin fresh-online / cached-offline service-worker shell.

## Offline release

The service-worker lineage preserves v35 Signal Anomaly and advances the current shell to:

`museum-of-almost-v36-page-four-evidence-lattice`

The v36 shell includes:

- `page-four-research.js`;
- `page-four-research.css`;
- `PAGE_FOUR_RESEARCH.md`.

## Build and review evidence

Initial baseline:

`226fd3a46313c110884cfcec41931a00dbcd87b6`

While research was being implemented, `main` advanced to:

`c7d787c8e73e0348177f403f9478e7a49d8656fc`

The feature was reconciled onto that exact main state before PR validation, preserving the concurrent ALMOST ONLINE! wallpaper-sky release and its regression guards.

Reconciled feature head:

`a4b7754f564e2755b14bd9ce90ae3129a8bd6db1`

PR:

`#81 — Add Page Four evidence lattice`

Required-check history:

- run `249` failed on an overly strict punctuation assertion in the new source-ledger regression test;
- the source ledger itself already contained the intended Project BLUE BOOK sentence;
- the test was corrected to pin the exact punctuation rather than weakening or removing the evidence guard;
- corrected feature head `e2b551748ac82211e3ca9a05af728fa140157675` passed required run `251`.

Run `251` verified JavaScript syntax, the full existing Museum suite, Page Four’s six evidence dossiers and epistemic boundaries, the v36 service-worker lifecycle, and the repository privacy/application contract.

Because this recovery note changes the branch head, the final archive-bearing head must pass the same required `check` again before merge.

## Rebuild rule

To rebuild the same successful idea, preserve the separation between **record**, **limit**, and **speculation**. Page Four may be strange, obsessive, and suspicious. Its sourced evidence must remain more careful than its red string.
