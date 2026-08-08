CREATE TABLE IF NOT EXISTS stats (
  key TEXT PRIMARY KEY,
  value INTEGER NOT NULL CHECK (value >= 0)
) STRICT;

INSERT OR IGNORE INTO stats (key, value) VALUES ('page_hits', 0);

CREATE TABLE IF NOT EXISTS write_windows (
  key TEXT PRIMARY KEY,
  window_start INTEGER NOT NULL CHECK (window_start >= 0),
  count INTEGER NOT NULL CHECK (count >= 0)
) STRICT;

CREATE TABLE IF NOT EXISTS guestbook_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message_id TEXT NOT NULL CHECK (length(message_id) BETWEEN 1 AND 32),
  stamp_id TEXT NOT NULL CHECK (length(stamp_id) BETWEEN 1 AND 24),
  created_at INTEGER NOT NULL CHECK (created_at > 0)
) STRICT;

CREATE INDEX IF NOT EXISTS idx_guestbook_entries_created_at
  ON guestbook_entries (created_at DESC);
