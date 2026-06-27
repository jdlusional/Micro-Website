-- Newsletter signups database schema.
-- One table holds every signup. The "newsletter" column tags each row
-- as House Rules or Fellowships4Free, which is how the two CSV exports
-- are split apart later.

CREATE TABLE IF NOT EXISTS subscribers (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  newsletter    TEXT NOT NULL,
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  email         TEXT NOT NULL,
  organization  TEXT,
  referral      TEXT,
  created_at    TEXT NOT NULL
);

-- Speeds up the per newsletter export and prevents the same email
-- from signing up twice for the same newsletter.
CREATE UNIQUE INDEX IF NOT EXISTS idx_news_email
  ON subscribers (newsletter, email);
