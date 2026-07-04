-- Judgement leaderboard / history schema (D1 / SQLite).
-- Apply locally:  npx wrangler d1 execute judgement --local  --file=server/schema.sql
-- Apply remote:   npx wrangler d1 execute judgement --remote --file=server/schema.sql

CREATE TABLE IF NOT EXISTS players (
  id          TEXT PRIMARY KEY,          -- client reconnect token (humans only)
  name        TEXT NOT NULL,
  color       TEXT,
  avatar      TEXT,
  created_at  INTEGER DEFAULT (unixepoch() * 1000)
);

CREATE TABLE IF NOT EXISTS matches (
  id          TEXT PRIMARY KEY,          -- uuid
  code        TEXT,                      -- invite code
  started_at  INTEGER,
  ended_at    INTEGER,
  scoring     TEXT,
  start_cards INTEGER,
  status      TEXT
);

CREATE TABLE IF NOT EXISTS match_players (
  match_id     TEXT NOT NULL,
  player_id    TEXT,                     -- null for bots
  name         TEXT NOT NULL,
  color        TEXT,
  avatar       TEXT,
  seat         INTEGER,
  is_bot       INTEGER DEFAULT 0,
  final_score  INTEGER,
  place        INTEGER,
  bids_hit     INTEGER,
  bids_total   INTEGER,
  PRIMARY KEY (match_id, seat)
);

-- optional deep history (not written by default; here for future round-level stats)
CREATE TABLE IF NOT EXISTS rounds (
  match_id   TEXT NOT NULL,
  round_no   INTEGER NOT NULL,
  card_count INTEGER,
  trump      TEXT,
  PRIMARY KEY (match_id, round_no)
);

CREATE TABLE IF NOT EXISTS round_results (
  match_id  TEXT NOT NULL,
  round_no  INTEGER NOT NULL,
  seat      INTEGER NOT NULL,
  bid       INTEGER,
  made      INTEGER,
  points    INTEGER,
  PRIMARY KEY (match_id, round_no, seat)
);

CREATE INDEX IF NOT EXISTS idx_mp_name ON match_players(name);
CREATE INDEX IF NOT EXISTS idx_matches_ended ON matches(ended_at);
