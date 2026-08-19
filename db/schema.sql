CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS air_preorders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identity_hash text NOT NULL UNIQUE,
  name text NOT NULL,
  email text NOT NULL,
  imessage text NOT NULL,
  consent boolean NOT NULL,
  source text NOT NULL DEFAULT 'air-landing',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS air_preorders_created_at_idx
  ON air_preorders (created_at DESC);

CREATE TABLE IF NOT EXISTS air_preorder_rate_limits (
  ip_hash text PRIMARY KEY,
  window_started_at timestamptz NOT NULL DEFAULT now(),
  hit_count integer NOT NULL DEFAULT 1 CHECK (hit_count > 0)
);
