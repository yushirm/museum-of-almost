# Almost Online — Shared Counter and Guestbook Security

Gallery 03 can use one isolated Cloudflare Worker plus one D1 database to provide a real shared page-hit counter and guestbook.

This is deliberately the only Museum feature that needs shared mutable state. COMMONS / NOW and DEEP SPACE / ALMOST remain separate from it.

## Data model

The public counter stores one integer: total accepted page-hit increments.

The guestbook stores only:

- an integer row ID;
- one message ID selected from a fixed server-side allowlist;
- one stamp ID selected from a fixed server-side allowlist;
- a server-generated UTC timestamp.

It does **not** accept or store names, email addresses, URLs, usernames, locations, free text, browser fingerprints, cookies, account IDs, user-agent strings, IP addresses, or arbitrary HTML.

## Why there is no free-text box

An automatically published free-text guestbook would create a durable path for visitors to publish personal information, harassment, links, scripts, or other unsafe material. Rule-based filters cannot make that boundary reliable.

The Museum therefore uses the old guestbook *gesture* without collecting identity: visitors choose a phrase and a pixel-style stamp. Entries are real, shared, timestamped, and visible to later visitors, but the publishable vocabulary is finite and auditable.

## API boundary

The Worker exposes only:

- `GET /v1/state` — current accepted hit count and the newest public entries;
- `POST /v1/hit` — claims one database-enforced hit budget token, then atomically increments the page-hit counter;
- `POST /v1/sign` — validates and stores one allowlisted guestbook selection;
- `OPTIONS` — CORS preflight for the exact configured Museum origin.

Every response is `no-store`. The Worker accepts only the configured HTTPS origin and returns no permissive `*` CORS header.

The browser uses `credentials: omit`, `referrerPolicy: no-referrer`, `cache: no-store`, and CORS mode. No cookie or local visitor identifier is created.

## Abuse containment

Because there is intentionally no visitor identifier, the service does not attempt per-person accounting.

The D1 database enforces global, identity-free budgets and bounds:

- at most 300 accepted page-hit increments per UTC minute window;
- minimum five seconds between accepted guestbook entries;
- identical consecutive stamp/message pairs are rejected for one minute;
- maximum 120 accepted guestbook entries per UTC day;
- only the newest 240 entries are retained;
- only the newest 24 are returned to browsers;
- request bodies are capped at 256 bytes;
- only `application/json` is accepted for signatures;
- SQL values are parameter-bound;
- arbitrary SQL, HTML, JavaScript, URLs, names, and free text are never accepted.

The page-hit budget uses a single D1 row keyed only as `page-hit`; it contains a minute boundary and count, not a visitor identifier. The Worker does not read or store IP addresses, user-agent strings, referrers, cookies, or browser fingerprints.

This makes automated nuisance possible in principle, but bounds what can be persisted and how quickly the visible counter can be inflated. It deliberately avoids creating a tracking identifier merely to make spam controls more precise.

## Hosting and failure behavior

The Worker and D1 are isolated from the GitHub Pages application. An outage leaves Gallery 03 available as a static page; the live counter and guestbook show an unavailable state.

The service requires no runtime secret. The D1 binding grants database capability directly to the Worker. The public API origin is configured only after deployment and verification.

Do not commit Cloudflare account identifiers, API tokens, private URLs, production Wrangler configuration, `.dev.vars`, `.env` files, or dashboard data.

## Deployment checklist

1. Create a D1 database named `museum-almost-guestbook`.
2. Apply `guestbook-api/migrations/0001_guestbook.sql` to that database.
3. Create a Worker using `guestbook-api/worker.mjs` and `guestbook-api/policy.mjs`.
4. Bind the D1 database as `DB`.
5. Set `SITE_ORIGIN` to the Museum's public GitHub Pages origin.
6. Deploy the Worker and record its public HTTPS origin.
7. Verify another Origin receives `403`, the allowed Origin can read state, invalid message/stamp IDs are rejected, hit increments are bounded, and no request metadata is stored by application code.
8. Put only that verified public Worker origin into the Gallery 03 `museum-guestbook-api` meta tag.
9. Rerun the repository's required `check` job before merging.
