# Almost Online — Shared Counter and Guestbook Security

Gallery 03 can use one isolated Cloudflare Worker plus one D1 database to provide a real shared hit counter and guestbook.

This is deliberately the only Museum feature that needs shared mutable state. Commons / Now and Deep Space / Almost remain unchanged.

## Data model

The public counter stores one integer: total successful page-hit increments.

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

- `GET /v1/state` — current hit count and the newest public entries;
- `POST /v1/hit` — atomically increments the page-hit counter;
- `POST /v1/sign` — validates and stores one allowlisted guestbook selection;
- `OPTIONS` — CORS preflight for the exact configured Museum origin.

Every response is `no-store`. The Worker accepts only the configured HTTPS origin and returns no permissive `*` CORS header.

The browser uses `credentials: omit`, `referrerPolicy: no-referrer`, `cache: no-store`, and CORS mode. No cookie or local visitor identifier is created.

## Abuse containment

Because there is intentionally no visitor identifier, the service does not attempt per-person accounting.

Guestbook writes use privacy-preserving global controls rather than a visitor identifier:

- a Cloudflare Worker rate-limiter binding caps hit writes at 300/minute per edge location;
- a separate binding caps guestbook attempts at 12/minute per edge location;
- the rate-limiter keys are fixed route labels, not IP addresses, cookies, fingerprints, or user IDs;
- minimum five seconds between accepted entries;
- identical consecutive stamp/message pairs are rejected for one minute;
- maximum 120 accepted entries per UTC day;
- only the newest 240 entries are retained;
- only the newest 24 are returned to browsers;
- request bodies are capped at 256 bytes;
- only `application/json` is accepted;
- SQL values are parameter-bound;
- arbitrary SQL, HTML, JavaScript, URLs, names, and free text are never accepted.

This makes automated nuisance possible in principle but bounds the damage to repetition of harmless allowlisted phrases. It avoids storing a visitor identifier merely to make spam controls more precise.

## Hosting

The Worker and D1 are isolated from the GitHub Pages application. A failure or outage leaves the static Gallery 03 page available; the live counter and guestbook show an unavailable state.

Cloudflare D1 is available on the Workers Free plan with included daily read/write and storage limits. The implementation requires no runtime secret. The D1 binding grants database capability directly to the Worker.

The public `workers.dev` endpoint is configured only after deployment. Do not commit Cloudflare account identifiers, API tokens, private URLs, or dashboard data.

## Deployment checklist

1. Create a D1 database named `museum-almost-guestbook`.
2. Copy `wrangler.example.jsonc` to `wrangler.jsonc`.
3. Replace only `<D1_DATABASE_ID>` with the new database ID.
4. Replace the example `SITE_ORIGIN` with the Museum's public GitHub Pages origin.
5. Apply `migrations/0001_guestbook.sql` to the remote D1 database.
6. Deploy the Worker.
7. Put the resulting public HTTPS Worker origin into the Gallery 03 `museum-guestbook-api` meta tag.
8. Verify CORS rejects another origin, guestbook choices are allowlisted, the hit counter increments, and no raw request metadata is stored.
