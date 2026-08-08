export const MESSAGE_OPTIONS = Object.freeze({
  'cool-site': 'COOL SITE!!!',
  'i-was-here': 'I WAS HERE',
  'more-gifs': 'MORE GIFS PLEASE',
  'keep-web-weird': 'KEEP THE WEB WEIRD',
  'nice-comet': 'NICE COMET',
  'hello-internet': 'HELLO, INTERNET'
});

export const STAMP_OPTIONS = Object.freeze({
  star: '★',
  alien: '👽',
  moon: '🌝',
  floppy: '💾',
  comet: '☄'
});

export const MAX_PUBLIC_ENTRIES = 24;
export const MAX_STORED_ENTRIES = 240;
export const MAX_SIGNS_PER_DAY = 120;
export const MIN_SIGN_INTERVAL_MS = 5_000;

export function validateSelection(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  const keys = Object.keys(input).sort();
  if (keys.length !== 2 || keys[0] !== 'message' || keys[1] !== 'stamp') return null;

  const message = typeof input.message === 'string' ? input.message : '';
  const stamp = typeof input.stamp === 'string' ? input.stamp : '';
  if (!Object.hasOwn(MESSAGE_OPTIONS, message) || !Object.hasOwn(STAMP_OPTIONS, stamp)) return null;
  return Object.freeze({ message, stamp });
}

export function publicEntry(row) {
  if (!row || !Object.hasOwn(MESSAGE_OPTIONS, row.message_id) || !Object.hasOwn(STAMP_OPTIONS, row.stamp_id)) {
    return null;
  }
  const createdAt = Number(row.created_at);
  if (!Number.isSafeInteger(createdAt) || createdAt <= 0) return null;
  return {
    id: Number(row.id),
    message: MESSAGE_OPTIONS[row.message_id],
    stamp: STAMP_OPTIONS[row.stamp_id],
    createdAt
  };
}

export function isAllowedOrigin(requestOrigin, configuredOrigin) {
  if (typeof requestOrigin !== 'string' || typeof configuredOrigin !== 'string') return false;
  try {
    const request = new URL(requestOrigin);
    const configured = new URL(configuredOrigin);
    return request.origin === configured.origin && request.protocol === 'https:';
  } catch {
    return false;
  }
}

export function startOfUtcDay(now) {
  const date = new Date(now);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}
