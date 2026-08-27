CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS air_preorders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identity_hash text NOT NULL UNIQUE,
  name text NOT NULL,
  email text NOT NULL,
  imessage text NOT NULL,
  consent boolean NOT NULL,
  source text NOT NULL DEFAULT 'air-landing',
  referral_code text,
  referrer_id uuid,
  referral_count integer NOT NULL DEFAULT 0 CHECK (referral_count >= 0),
  checkout_returned_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Existing Air databases predate the waitlist fields. Keep this schema safe to
-- apply in-place as well as to a fresh Neon database.
ALTER TABLE air_preorders ADD COLUMN IF NOT EXISTS referral_code text;
ALTER TABLE air_preorders ADD COLUMN IF NOT EXISTS referrer_id uuid;
ALTER TABLE air_preorders ADD COLUMN IF NOT EXISTS referral_count integer NOT NULL DEFAULT 0;
ALTER TABLE air_preorders ADD COLUMN IF NOT EXISTS checkout_returned_at timestamptz;

UPDATE air_preorders
SET referral_code = encode(gen_random_bytes(18), 'hex')
WHERE referral_code IS NULL;

ALTER TABLE air_preorders ALTER COLUMN referral_code SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'air_preorders_referral_count_nonnegative'
  ) THEN
    ALTER TABLE air_preorders
      ADD CONSTRAINT air_preorders_referral_count_nonnegative CHECK (referral_count >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'air_preorders_referrer_id_fkey'
  ) THEN
    ALTER TABLE air_preorders
      ADD CONSTRAINT air_preorders_referrer_id_fkey
      FOREIGN KEY (referrer_id) REFERENCES air_preorders(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS air_preorders_created_at_idx
  ON air_preorders (created_at DESC);

CREATE INDEX IF NOT EXISTS air_preorders_updated_at_idx
  ON air_preorders (updated_at ASC);

CREATE UNIQUE INDEX IF NOT EXISTS air_preorders_referral_code_idx
  ON air_preorders (referral_code);

CREATE INDEX IF NOT EXISTS air_preorders_waitlist_rank_idx
  ON air_preorders (checkout_returned_at DESC NULLS LAST, referral_count DESC, created_at ASC);

CREATE TABLE IF NOT EXISTS air_preorder_rate_limits (
  ip_hash text PRIMARY KEY,
  window_started_at timestamptz NOT NULL DEFAULT now(),
  hit_count integer NOT NULL DEFAULT 1 CHECK (hit_count > 0)
);

CREATE INDEX IF NOT EXISTS air_preorder_rate_limits_window_idx
  ON air_preorder_rate_limits (window_started_at ASC);
