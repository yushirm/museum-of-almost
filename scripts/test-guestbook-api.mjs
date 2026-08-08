import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  HIT_WINDOW_MS,
  MAX_HITS_PER_MINUTE,
  MAX_PUBLIC_ENTRIES,
  MAX_SIGNS_PER_DAY,
  MAX_STORED_ENTRIES,
  MIN_SIGN_INTERVAL_MS,
  MESSAGE_OPTIONS,
  STAMP_OPTIONS,
  isAllowedOrigin,
  publicEntry,
  startOfHitWindow,
  startOfUtcDay,
  validateSelection
} from '../guestbook-api/policy.mjs';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');

for (const name of [
  'guestbook-api/policy.mjs',
  'guestbook-api/worker.mjs',
  'guestbook-api/schema.sql',
  'guestbook-api/migrations/0001_guestbook.sql',
  'guestbook-api/wrangler.example.jsonc',
  'GUESTBOOK_SECURITY.md',
  'PRIVACY.md'
]) assert.ok(fs.existsSync(path.join(root, name)), `missing ${name}`);

assert.deepEqual(validateSelection({ message: 'cool-site', stamp: 'alien' }), {
  message: 'cool-site',
  stamp: 'alien'
});
assert.equal(validateSelection({ message: '<script>', stamp: 'alien' }), null);
assert.equal(validateSelection({ message: 'cool-site', stamp: 'http://spam.invalid' }), null);
assert.equal(validateSelection({ message: 'cool-site', stamp: 'alien', extra: 'nope' }), null);
assert.equal(validateSelection('cool-site'), null);
assert.ok(Object.keys(MESSAGE_OPTIONS).length >= 6);
assert.ok(Object.keys(STAMP_OPTIONS).length >= 5);
for (const value of Object.values(MESSAGE_OPTIONS)) assert.doesNotMatch(value, /https?:\/\/|@|<|>/);
for (const value of Object.values(STAMP_OPTIONS)) assert.ok(value.length <= 4);

assert.equal(isAllowedOrigin('https://example.github.io', 'https://example.github.io/path'), true);
assert.equal(isAllowedOrigin('https://evil.example', 'https://example.github.io'), false);
assert.equal(isAllowedOrigin('http://example.github.io', 'https://example.github.io'), false);
assert.equal(isAllowedOrigin('', 'https://example.github.io'), false);
assert.equal(startOfUtcDay(Date.parse('2026-08-08T17:44:00Z')), Date.parse('2026-08-08T00:00:00Z'));
assert.equal(startOfHitWindow(Date.parse('2026-08-08T17:44:59.999Z')), Date.parse('2026-08-08T17:44:00Z'));
assert.equal(startOfHitWindow(-1), null);

assert.deepEqual(publicEntry({
  id: 7,
  message_id: 'keep-web-weird',
  stamp_id: 'star',
  created_at: 1786160000000
}), {
  id: 7,
  message: 'KEEP THE WEB WEIRD',
  stamp: '★',
  createdAt: 1786160000000
});
assert.equal(publicEntry({ id: 1, message_id: 'unknown', stamp_id: 'star', created_at: 1 }), null);

assert.equal(MAX_PUBLIC_ENTRIES, 24);
assert.equal(MAX_STORED_ENTRIES, 240);
assert.equal(MAX_SIGNS_PER_DAY, 120);
assert.equal(MIN_SIGN_INTERVAL_MS, 5000);
assert.equal(MAX_HITS_PER_MINUTE, 300);
assert.equal(HIT_WINDOW_MS, 60000);

const worker = read('guestbook-api/worker.mjs');
const schema = read('guestbook-api/schema.sql');
const migration = read('guestbook-api/migrations/0001_guestbook.sql');
const config = read('guestbook-api/wrangler.example.jsonc');
const security = read('GUESTBOOK_SECURITY.md');
const privacy = read('PRIVACY.md');

for (const pattern of [
  /request\.headers\.get\('origin'\)/,
  /isAllowedOrigin\(requestOrigin, configuredOrigin\)/,
  /Access-Control-Allow-Origin/,
  /Cache-Control': 'no-store, max-age=0'/,
  /Content-Security-Policy/,
  /X-Content-Type-Options/,
  /MAX_BODY_BYTES = 256/,
  /application\/json/,
  /INSERT INTO write_windows/,
  /ON CONFLICT\(key\) DO UPDATE SET/,
  /RETURNING count/,
  /count <= MAX_HITS_PER_MINUTE/,
  /UPDATE stats SET value = value \+ 1/,
  /RETURNING value/,
  /INSERT INTO guestbook_entries/,
  /RETURNING id/,
  /DELETE FROM guestbook_entries/,
  /SELECT COUNT\(\*\) FROM guestbook_entries/,
  /created_at > \?3 - \?6/,
  /message_id = \?1 AND stamp_id = \?2/,
  /service_unavailable/
]) assert.match(worker, pattern);

assert.doesNotMatch(worker, /HIT_RATE_LIMITER|SIGN_RATE_LIMITER|cf-connecting-ip|user-agent|referer/i,
  'Worker must not use edge/person identifiers or external limiter bindings');
assert.doesNotMatch(worker, /console\.(?:log|info|warn|error)/,
  'Worker must not emit request data to application logs');
assert.doesNotMatch(worker, /https?:\/\//,
  'Worker source must not contain a remote runtime destination');

for (const pattern of [
  /CREATE TABLE IF NOT EXISTS stats/,
  /CREATE TABLE IF NOT EXISTS write_windows/,
  /CREATE TABLE IF NOT EXISTS guestbook_entries/,
  /STRICT/,
  /CHECK \(value >= 0\)/,
  /CHECK \(window_start >= 0\)/,
  /CHECK \(count >= 0\)/,
  /CHECK \(length\(message_id\) BETWEEN 1 AND 32\)/,
  /CHECK \(length\(stamp_id\) BETWEEN 1 AND 24\)/
]) assert.match(schema, pattern);
assert.equal(schema, migration);

assert.match(config, /"observability":\s*\{\s*"enabled": false/);
assert.match(config, /"SITE_ORIGIN": "https:\/\/example\.github\.io"/);
assert.match(config, /"database_id": "<D1_DATABASE_ID>"/);
assert.doesNotMatch(config, /ratelimits|RATE_LIMITER/i,
  'deployment should require only the D1 binding and public site origin');
assert.doesNotMatch(config, /api[_-]?token|password|secret/i);

for (const pattern of [
  /does \*\*not\*\* accept or store names/i,
  /no free-text box/i,
  /fixed server-side allowlist/i,
  /at most 300 accepted page-hit increments per UTC minute window/i,
  /request bodies are capped at 256 bytes/i,
  /single D1 row keyed only as `page-hit`/i,
  /Do not commit Cloudflare account identifiers, API tokens, private URLs/i
]) assert.match(security, pattern);

for (const pattern of [
  /does not create visitor accounts, profiles, histories, scores, identifiers/i,
  /create a unique-visitor counter/i,
  /stores only one global integer/i,
  /stores only an allowlisted message ID, an allowlisted stamp ID, and a server-generated UTC timestamp/i,
  /does not store IP addresses, user-agent strings, referrers, browser fingerprints, or account identifiers/i,
  /D1 holds a global minute-window counter keyed only as `page-hit`/i,
  /renders guestbook entries with DOM `textContent`/i
]) assert.match(privacy, pattern, `privacy record missing shared-state boundary: ${pattern}`);

console.log('Shared counter/guestbook policy, D1-global budgets, API boundary, input allowlist, schema, privacy record, and no-identifier design verified.');
