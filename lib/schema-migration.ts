import "server-only";

import { neon } from "@neondatabase/serverless";

const statements = [
  `CREATE EXTENSION IF NOT EXISTS pgcrypto`,
  `CREATE TABLE IF NOT EXISTS air_preorders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    identity_hash text NOT NULL UNIQUE,
    name text NOT NULL,
    email text NOT NULL,
    imessage text NOT NULL,
    consent boolean NOT NULL,
    source text NOT NULL DEFAULT 'air-landing',
    referral_code text,
    referrer_id uuid,
    referral_count integer NOT NULL DEFAULT 0,
    checkout_returned_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  )`,
  `ALTER TABLE air_preorders ADD COLUMN IF NOT EXISTS referral_code text`,
  `ALTER TABLE air_preorders ADD COLUMN IF NOT EXISTS referrer_id uuid`,
  `ALTER TABLE air_preorders ADD COLUMN IF NOT EXISTS referral_count integer NOT NULL DEFAULT 0`,
  `ALTER TABLE air_preorders ADD COLUMN IF NOT EXISTS checkout_returned_at timestamptz`,
  `ALTER TABLE air_preorders ADD COLUMN IF NOT EXISTS first_source text`,
  `ALTER TABLE air_preorders ADD COLUMN IF NOT EXISTS latest_source text`,
  `ALTER TABLE air_preorders ADD COLUMN IF NOT EXISTS interest text`,
  `UPDATE air_preorders SET first_source = COALESCE(first_source, source, 'air-landing'), latest_source = COALESCE(latest_source, source, 'air-landing'), interest = COALESCE(interest, 'General') WHERE first_source IS NULL OR latest_source IS NULL OR interest IS NULL`,
  `ALTER TABLE air_preorders ALTER COLUMN first_source SET DEFAULT 'air-landing'`,
  `ALTER TABLE air_preorders ALTER COLUMN latest_source SET DEFAULT 'air-landing'`,
  `ALTER TABLE air_preorders ALTER COLUMN interest SET DEFAULT 'General'`,
  `UPDATE air_preorders SET referral_code = encode(gen_random_bytes(18), 'hex') WHERE referral_code IS NULL`,
  `ALTER TABLE air_preorders ALTER COLUMN referral_code SET NOT NULL`,
  `CREATE INDEX IF NOT EXISTS air_preorders_created_at_idx ON air_preorders (created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS air_preorders_updated_at_idx ON air_preorders (updated_at ASC)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS air_preorders_referral_code_idx ON air_preorders (referral_code)`,
  `CREATE INDEX IF NOT EXISTS air_preorders_waitlist_rank_idx ON air_preorders (checkout_returned_at DESC NULLS LAST, referral_count DESC, created_at ASC)`,
  `CREATE TABLE IF NOT EXISTS air_preorder_rate_limits (ip_hash text PRIMARY KEY, window_started_at timestamptz NOT NULL DEFAULT now(), hit_count integer NOT NULL DEFAULT 1)`,
  `CREATE INDEX IF NOT EXISTS air_preorder_rate_limits_window_idx ON air_preorder_rate_limits (window_started_at ASC)`,
  `CREATE TABLE IF NOT EXISTS air_admin_sessions (token_hash text PRIMARY KEY, expires_at timestamptz NOT NULL, created_at timestamptz NOT NULL DEFAULT now())`,
  `CREATE INDEX IF NOT EXISTS air_admin_sessions_expires_idx ON air_admin_sessions (expires_at)`,
  `CREATE TABLE IF NOT EXISTS air_admin_login_attempts (ip_hash text PRIMARY KEY, window_started_at timestamptz NOT NULL DEFAULT now(), attempt_count integer NOT NULL DEFAULT 0)`,
  `CREATE TABLE IF NOT EXISTS air_stripe_events (event_id text PRIMARY KEY, event_type text NOT NULL, payload_hash text NOT NULL, livemode boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now(), processed_at timestamptz)`,
  `CREATE TABLE IF NOT EXISTS air_stripe_customers (stripe_customer_id text PRIMARY KEY, preorder_id uuid REFERENCES air_preorders(id) ON DELETE SET NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now())`,
  `CREATE TABLE IF NOT EXISTS air_stripe_subscriptions (stripe_subscription_id text PRIMARY KEY, preorder_id uuid REFERENCES air_preorders(id) ON DELETE SET NULL, status text NOT NULL, current_period_end timestamptz, cancel_at_period_end boolean NOT NULL DEFAULT false, latest_invoice_id text, updated_at timestamptz NOT NULL DEFAULT now())`,
  `CREATE TABLE IF NOT EXISTS air_stripe_payments (stripe_payment_id text PRIMARY KEY, preorder_id uuid REFERENCES air_preorders(id) ON DELETE SET NULL, checkout_session_id text, invoice_id text, amount integer, currency text, status text NOT NULL, refunded_amount integer NOT NULL DEFAULT 0, disputed boolean NOT NULL DEFAULT false, paid_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now())`,
];

export async function migrateWaitlistSchema() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url || (process.env.VERCEL_ENV && process.env.AIR_DATABASE_ENV !== process.env.VERCEL_ENV)) {
    throw new Error("database_unavailable");
  }
  const query = neon(url);
  for (const statement of statements) await query.query(statement);
  return { statements: statements.length };
}
