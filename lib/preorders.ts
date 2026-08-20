import "server-only";

import { createHmac, randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";

export type Preorder = {
  name: string;
  email: string;
  imessage: string;
  consent: boolean;
  createdAt: string;
  source: "air-landing";
};

declare global {
  // eslint-disable-next-line no-var
  var airLocalPreorders: Map<string, { preorder: Preorder; receipt: string }> | undefined;
  // eslint-disable-next-line no-var
  var airLocalRateLimits: Map<string, { count: number; resetAt: number }> | undefined;
}

function requiresDurableStorage() {
  return process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL_ENV);
}

function hash(value: string) {
  const configured = process.env.AIR_ID_HASH_SECRET?.trim();
  if (
    requiresDurableStorage() &&
    (!configured || configured.length < 32 || configured.startsWith("replace-"))
  ) {
    throw new Error("identity_hash_secret_unavailable");
  }
  const secret = configured || "local-air-preorder-secret";
  return createHmac("sha256", secret).update(value).digest("hex");
}

function database() {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  const expectedEnvironment =
    process.env.VERCEL_ENV ??
    (process.env.NODE_ENV === "production" ? "production" : null);

  if (expectedEnvironment) {
    if (!databaseUrl) throw new Error("database_unavailable");
    if (process.env.AIR_DATABASE_ENV !== expectedEnvironment) {
      throw new Error("database_environment_mismatch");
    }
  }

  return databaseUrl ? neon(databaseUrl) : null;
}

export async function rateLimit(ip: string) {
  const ipHash = hash(ip);
  const db = database();

  if (db) {
    const rows = await db`
      INSERT INTO air_preorder_rate_limits (ip_hash, window_started_at, hit_count)
      VALUES (${ipHash}, now(), 1)
      ON CONFLICT (ip_hash) DO UPDATE SET
        window_started_at = CASE
          WHEN air_preorder_rate_limits.window_started_at <= now() - interval '10 minutes'
            THEN now()
          ELSE air_preorder_rate_limits.window_started_at
        END,
        hit_count = CASE
          WHEN air_preorder_rate_limits.window_started_at <= now() - interval '10 minutes'
            THEN 1
          ELSE air_preorder_rate_limits.hit_count + 1
        END
      RETURNING hit_count
    `;
    return Number(rows[0]?.hit_count ?? 0) <= 5;
  }

  const store = (globalThis.airLocalRateLimits ??= new Map());
  const key = `air:preorder:rate:${ipHash.slice(0, 28)}`;
  const now = Date.now();
  const current = store.get(key);
  if (!current || current.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + 600_000 });
    return true;
  }
  current.count += 1;
  return current.count <= 5;
}

export async function savePreorder(preorder: Preorder) {
  const identity = `${preorder.email.trim().toLowerCase()}|${preorder.imessage.replace(/\D/g, "")}`;
  const identityHash = hash(identity);
  const db = database();

  if (db) {
    const rows = await db`
      INSERT INTO air_preorders (
        identity_hash, name, email, imessage, consent, source, created_at, updated_at
      ) VALUES (
        ${identityHash}, ${preorder.name}, ${preorder.email}, ${preorder.imessage},
        ${preorder.consent}, ${preorder.source}, ${preorder.createdAt}, ${preorder.createdAt}
      )
      ON CONFLICT (identity_hash) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        imessage = EXCLUDED.imessage,
        consent = EXCLUDED.consent,
        updated_at = now()
      RETURNING id
    `;
    const receipt = String(rows[0]?.id ?? "");
    if (!receipt) throw new Error("receipt_unavailable");
    return { stored: "postgres" as const, receipt };
  }

  if (requiresDurableStorage()) {
    throw new Error("database_unavailable");
  }

  const local = (globalThis.airLocalPreorders ??= new Map());
  const existing = local.get(identityHash);
  const receipt = existing?.receipt ?? `local_${randomUUID()}`;
  local.set(identityHash, { preorder, receipt });
  return { stored: "memory" as const, receipt };
}

const PREORDER_PRUNE_BATCH = 1_000;
const RATE_LIMIT_PRUNE_BATCH = 5_000;

export async function pruneExpiredPreorderData() {
  const db = database();
  if (!db) throw new Error("database_unavailable");

  const rows = await db`
    WITH expired_preorders AS (
      SELECT id
      FROM air_preorders
      WHERE updated_at < now() - interval '12 months'
      ORDER BY updated_at ASC
      LIMIT ${PREORDER_PRUNE_BATCH}
    ), deleted_preorders AS (
      DELETE FROM air_preorders
      WHERE id IN (SELECT id FROM expired_preorders)
        AND updated_at < now() - interval '12 months'
      RETURNING 1
    ), expired_attempts AS (
      SELECT ip_hash
      FROM air_preorder_rate_limits
      WHERE window_started_at < now() - interval '30 days'
      ORDER BY window_started_at ASC
      LIMIT ${RATE_LIMIT_PRUNE_BATCH}
    ), deleted_attempts AS (
      DELETE FROM air_preorder_rate_limits
      WHERE ip_hash IN (SELECT ip_hash FROM expired_attempts)
        AND window_started_at < now() - interval '30 days'
      RETURNING 1
    )
    SELECT
      (SELECT count(*)::integer FROM deleted_preorders) AS preorders_deleted,
      (SELECT count(*)::integer FROM deleted_attempts) AS attempts_deleted
  `;

  const preorders = Math.min(
    PREORDER_PRUNE_BATCH,
    Math.max(0, Number(rows[0]?.preorders_deleted ?? 0)),
  );
  const attempts = Math.min(
    RATE_LIMIT_PRUNE_BATCH,
    Math.max(0, Number(rows[0]?.attempts_deleted ?? 0)),
  );

  return {
    deleted: { preorders, attempts },
    hasMore: preorders === PREORDER_PRUNE_BATCH || attempts === RATE_LIMIT_PRUNE_BATCH,
  };
}
