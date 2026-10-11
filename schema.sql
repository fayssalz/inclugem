-- D1 Database Schema for Hyperion Gem Inclusions

CREATE TABLE IF NOT EXISTS inclusions (
  id TEXT PRIMARY KEY,
  imageNumber TEXT,
  title TEXT NOT NULL,
  gemType TEXT,
  taxonomy TEXT,
  origin TEXT,
  enhancement TEXT,
  lighting TEXT,
  photographer TEXT,
  fieldOfView TEXT,
  magnification TEXT,
  datePosted TEXT,
  description TEXT,
  imageUrl TEXT NOT NULL,
  thumbUrl TEXT,
  tags TEXT,        -- JSON array string
  references TEXT,  -- JSON array string
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
