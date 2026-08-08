import {
  MAX_HITS_PER_MINUTE,
  MAX_PUBLIC_ENTRIES,
  MAX_SIGNS_PER_DAY,
  MAX_STORED_ENTRIES,
  MIN_SIGN_INTERVAL_MS,
  isAllowedOrigin,
  publicEntry,
  startOfHitWindow,
  startOfUtcDay,
  validateSelection
} from './policy.mjs';

const JSON_TYPE = 'application/json; charset=utf-8';
const MAX_BODY_BYTES = 256;

function securityHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '600',
    'Cache-Control': 'no-store, max-age=0',
    'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
    'Cross-Origin-Resource-Policy': 'cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
    'Referrer-Policy': 'no-referrer',
    'Vary': 'Origin',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY'
  };
}

function json(origin, body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...securityHeaders(origin), 'Content-Type': JSON_TYPE }
  });
}

function empty(origin, status = 204) {
  return new Response(null, { status, headers: securityHeaders(origin) });
}

function methodNotAllowed(origin) {
  return json(origin, { error: 'method_not_allowed' }, 405);
}

async function readSmallJson(request) {
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.toLowerCase().startsWith('application/json')) return null;

  const length = Number(request.headers.get('content-length') || 0);
  if (Number.isFinite(length) && length > MAX_BODY_BYTES) return null;

  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function readState(db) {
  const [counter, entries] = await db.batch([
    db.prepare("SELECT value FROM stats WHERE key = 'page_hits' LIMIT 1"),
    db.prepare(
      'SELECT id, message_id, stamp_id, created_at FROM guestbook_entries ORDER BY id DESC LIMIT ?1'
    ).bind(MAX_PUBLIC_ENTRIES)
  ]);

  const hits = Number(counter.results?.[0]?.value ?? 0);
  const publicEntries = (entries.results || []).map(publicEntry).filter(Boolean);
  return { hits: Number.isSafeInteger(hits) && hits >= 0 ? hits : 0, entries: publicEntries };
}

async function takeHitToken(db, now) {
  const windowStart = startOfHitWindow(now);
  if (windowStart === null) return false;

  const row = await db.prepare(`
    INSERT INTO write_windows (key, window_start, count)
    VALUES ('page-hit', ?1, 1)
    ON CONFLICT(key) DO UPDATE SET
      window_start = CASE
        WHEN write_windows.window_start = excluded.window_start THEN write_windows.window_start
        ELSE excluded.window_start
      END,
      count = CASE
        WHEN write_windows.window_start = excluded.window_start THEN write_windows.count + 1
        ELSE 1
      END
    RETURNING count
  `).bind(windowStart).first();

  const count = Number(row?.count);
  return Number.isSafeInteger(count) && count > 0 && count <= MAX_HITS_PER_MINUTE;
}

async function recordHit(db) {
  const result = await db.prepare(
    "UPDATE stats SET value = value + 1 WHERE key = 'page_hits' RETURNING value"
  ).first();
  const hits = Number(result?.value);
  if (!Number.isSafeInteger(hits) || hits < 0) throw new Error('counter_update_failed');
  return hits;
}

async function signGuestbook(db, selection, now) {
  const dayStart = startOfUtcDay(now);
  const inserted = await db.prepare(`
    INSERT INTO guestbook_entries (message_id, stamp_id, created_at)
    SELECT ?1, ?2, ?3
    WHERE
      (SELECT COUNT(*) FROM guestbook_entries WHERE created_at >= ?4) < ?5
      AND NOT EXISTS (
        SELECT 1 FROM guestbook_entries
        WHERE created_at > ?3 - ?6
      )
      AND NOT EXISTS (
        SELECT 1 FROM guestbook_entries
        WHERE message_id = ?1 AND stamp_id = ?2 AND created_at > ?3 - 60000
      )
    RETURNING id
  `).bind(
    selection.message,
    selection.stamp,
    now,
    dayStart,
    MAX_SIGNS_PER_DAY,
    MIN_SIGN_INTERVAL_MS
  ).first();

  if (!inserted?.id) return { ok: false, reason: 'rate_limited' };

  const cleanup = await db.prepare(
    'DELETE FROM guestbook_entries WHERE id NOT IN (SELECT id FROM guestbook_entries ORDER BY id DESC LIMIT ?1)'
  ).bind(MAX_STORED_ENTRIES).run();

  if (!cleanup.success) throw new Error('guestbook_cleanup_failed');
  return { ok: true };
}

export default {
  async fetch(request, env) {
    const requestOrigin = request.headers.get('origin') || '';
    const configuredOrigin = env.SITE_ORIGIN || '';
    if (!isAllowedOrigin(requestOrigin, configuredOrigin)) {
      return new Response('Forbidden', {
        status: 403,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
          'Content-Type': 'text/plain; charset=utf-8',
          'Referrer-Policy': 'no-referrer',
          'X-Content-Type-Options': 'nosniff'
        }
      });
    }

    const origin = new URL(configuredOrigin).origin;
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') return empty(origin);

    try {
      if (url.pathname === '/v1/state') {
        if (request.method !== 'GET') return methodNotAllowed(origin);
        return json(origin, await readState(env.DB));
      }

      if (url.pathname === '/v1/hit') {
        if (request.method !== 'POST') return methodNotAllowed(origin);
        if (!await takeHitToken(env.DB, Date.now())) return json(origin, { error: 'rate_limited' }, 429);
        return json(origin, { hits: await recordHit(env.DB) });
      }

      if (url.pathname === '/v1/sign') {
        if (request.method !== 'POST') return methodNotAllowed(origin);
        const selection = validateSelection(await readSmallJson(request));
        if (!selection) return json(origin, { error: 'invalid_selection' }, 400);

        const result = await signGuestbook(env.DB, selection, Date.now());
        if (!result.ok) return json(origin, { error: result.reason }, 429);
        return json(origin, await readState(env.DB), 201);
      }

      return json(origin, { error: 'not_found' }, 404);
    } catch {
      return json(origin, { error: 'service_unavailable' }, 503);
    }
  }
};
