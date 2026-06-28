-- Contact form submissions schema.
-- Run this once in the D1 console to create the table that the
-- contact form writes to.

CREATE TABLE IF NOT EXISTS contacts (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name  TEXT NOT NULL,
  last_name   TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  location    TEXT NOT NULL,
  purpose     TEXT NOT NULL,
  urgency     TEXT NOT NULL,
  referral    TEXT NOT NULL,
  created_at  TEXT NOT NULL
);
