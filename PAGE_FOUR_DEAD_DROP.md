# Page Four Dead Drop

## Outcome

**THE DEAD DROP / FOUR LOCKS, ONE ROUTE** turns Page Four into a playable investigation space without turning the Museum into an account system, ARG backend, telemetry product, or visitor-input collection surface.

The visitor solves four fixed local puzzles in any order. Each solved lock reveals one route fragment. All four fragments assemble into a fictional Museum route:

`05 // LEVEL −1 // FREIGHT LIFT`

The recovered route opens the existing same-origin `elsewhere.html` fifth space.

The game is fiction. The one puzzle that refers to the Hessdalen Instrument Room preserves the real source limits already established there.

## Product idea

The Evidence Lattice asks the visitor to compare records. The Instrument Room asks the visitor to cross-examine measurements. The Dead Drop adds a third verb: **solve**.

The goal is not to bolt a generic quiz onto Page Four. The room behaves like someone deliberately left a recruitment file inside the archive:

1. a repeating signal strip;
2. a simple cipher;
3. a logic drawer;
4. an evidence-boundary test;
5. a recovered route card.

The first three puzzles are wholly fictional. The fourth tests whether the visitor can preserve an existing real-evidence caveat instead of selecting a more sensational overclaim.

## Puzzle solutions

The client necessarily contains its own answers. This is not treated as a security problem. View-source readers are allowed to inspect the mechanism; there is no server-side secret and no claim that the puzzle can resist deliberate source inspection.

### Lock 01 — The Missing Beat

Strip:

`○ ○ ●  ○ ○ ●  ○ ○ ?`

The sequence repeats every third position, so the correct final mark is `●`.

Recovered route fragment:

`05`

### Lock 02 — The Redaction Strip

Ciphertext:

`WKH ILOH LV QRW KHUH`

A Caesar shift of `−3` produces:

`THE FILE IS NOT HERE`

Recovered route fragment:

`LEVEL −1`

### Lock 03 — The Three Drawers

Statements:

- A: “The envelope is in C.”
- B: “The envelope is not in A.”
- C: “The envelope is not in C.”

Exactly one statement is true only when the envelope is in **Drawer A**:

- A is false;
- B is false;
- C is true.

Recovered route fragment:

`FREIGHT`

### Lock 04 — The Evidence Test

The accepted claim is:

> RADAR — three probable visual/radar coincidences were recorded, with important limits.

The rejected claims deliberately violate existing Instrument Room boundaries:

- the radio spectrum spikes were **not** recorded simultaneously with the lights;
- a local seismic null does **not** prove a non-physical mechanism.

Recovered route fragment:

`LIFT`

## Hint model

Each lock has two progressive hints.

Hints:

- never consume progress;
- never change the solution;
- never create a score penalty;
- remain visitor-triggered;
- do not use timers or automatic reveal;
- are announced through polite live feedback.

The interface states: **Hints are evidence, not failure.**

## State model

All game state is in memory only:

- solved lock IDs use a JavaScript `Set`;
- hint progress uses a JavaScript `Map`;
- there is no `localStorage`, `sessionStorage`, IndexedDB, cookie, URL-state encoding, account, cloud state, or visitor identity;
- reload starts from four sealed locks;
- the visitor may explicitly reseal all four locks with the reset control.

## Input boundary

The Dead Drop does not collect free text or numbers.

All choices are fixed buttons with accessible labels and `aria-pressed` state. This preserves the Museum rule against visitor free-text input while still allowing actual puzzle play.

## Evidence and fiction boundary

The Dead Drop is labeled:

`PUZZLE FICTION // REAL-EVIDENCE QUESTIONS KEEP THEIR ORIGINAL LIMITS`

The final route is labeled:

`MUSEUM FICTION. SAME-ORIGIN ROUTE. NO CLAIM ABOUT THE WORLD OUTSIDE.`

The permanent rule is:

**A PUZZLE MAY HIDE AN ANSWER. EVIDENCE MAY NOT.**

The feature must never turn the Hessdalen material into proof of an extraordinary cause merely because a puzzle needs a dramatic answer.

## Runtime and privacy boundary

The feature:

- loads only same-origin local JavaScript and CSS;
- performs no fetch, XHR, beacon, WebSocket, EventSource, polling, timer, or animation-frame loop;
- adds no analytics, telemetry, tracking, visitor counting, ad technology, account, authentication, geolocation, or remote runtime dependency;
- uses DOM node creation rather than HTML-string injection;
- does not call Web Share;
- does not store puzzle progress;
- does not require a package manager, framework, build system, database, or backend.

## Accessibility

The game keeps:

- 44px minimum interactive targets;
- visible `:focus-visible` treatment;
- grouped answer controls with accessible labels;
- `aria-pressed` state on choices;
- polite live regions for puzzle and overall feedback;
- textual progress labels (`SEALED` / `OPEN`) rather than color-only state;
- responsive layouts;
- reduced-motion handling;
- increased-contrast handling;
- a printable static fallback.

## Offline model

The Dead Drop is an ordinary local Page Four progressive enhancement and belongs in the coherent Museum application shell.

Its local assets are:

- `page-four-dead-drop.js`
- `page-four-dead-drop.css`
- `PAGE_FOUR_DEAD_DROP.md`

The service-worker lineage preserves:

- **v41 — The Shutter Cabinet**;
- **v42 — The Unequal Minute**;
- **v43 — Page Four Dead Drop** as the current coherent shell.

Current cache name:

`museum-of-almost-v43-page-four-dead-drop`

The same-origin fresh-online / cached-offline behavior remains unchanged.

## Recovery from the earlier draft

The first Dead Drop branch was prepared while Shutter Cabinet v41 was current. Before release, Deep Space Instrument 12 shipped as **The Unequal Minute** and claimed v42. The old Dead Drop branch therefore could not own v42 or overwrite the newer workflow/service-worker tree.

The release candidate must be rebuilt directly on canonical v42 `main`. Only the Dead Drop feature files and Page Four integration are reused from the earlier draft; current workflow, service-worker lineage, Unequal Minute assets, tests, privacy boundary, and Museum documentation remain authoritative.

The earlier `PAGE_FOUR_DEAD_DROP_RELEASE.md` draft is not part of the canonical runtime/release tree. Canonical release evidence belongs in the connected Success Archives after exact-head CI, protected merge, post-merge CI, Pages deployment, and cleanup all succeed.

## Anti-drift invariants

- Exactly four locks make the first Dead Drop case.
- The four puzzle types remain materially different: pattern, cipher, logic, evidence.
- Hints never penalize the visitor.
- Wrong answers never lock the visitor out.
- Reload forgets progress.
- No visitor free-text answer field is added.
- The final route remains same-origin.
- The route is Museum fiction, not a real-world claim.
- Lock 04 preserves the Instrument Room’s radio simultaneity and seismic-null limits.
- Existing nine fictional Page Four files remain fictional.
- Existing Evidence Lattice records remain sourced records.
- Existing Hessdalen investigation remains evidence-first.
- COMMONS / NOW remains outside Page Four conspiracy-fiction framing.

## Rebuild recipe

1. Mount the Dead Drop progressively after the existing Page Four investigative layers.
2. Keep puzzle definitions fixed and local.
3. Give each puzzle one unambiguous correct fixed-choice answer.
4. Attach two progressive no-penalty hints to each puzzle.
5. Keep solved and hint state in memory only.
6. Reveal one route fragment per solved lock.
7. Reveal the final same-origin route only after all locks are solved.
8. Label puzzle fiction separately from real evidence.
9. Extend Page Four, workflow, privacy, accessibility, and offline regressions.
10. Reconcile against exact live `main`, require exact-head `check`, merge through `protect-main`, then verify canonical `main`, Pages, branch cleanup, and the Success Archives.
