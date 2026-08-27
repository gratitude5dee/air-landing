import "server-only";

import { createHmac, randomBytes, randomUUID } from "node:crypto";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

import { AIR_STRIPE_PAYMENT_LINK } from "@/lib/checkout";

export type Preorder = {
  name: string;
  email: string;
  imessage: string;
  consent: boolean;
  createdAt: string;
  source: string;
};

export type WaitlistStatus = {
  totalWaiting: number;
  position: number;
  referralCode: string;
  referralCount: number;
};

export type WaitlistSaveResult = WaitlistStatus & {
  stored: "postgres" | "memory";
  receipt: string;
  referralCredited: boolean;
};

type LocalWaitlistEntry = {
  preorder: Preorder;
  receipt: string;
  referralCode: string;
  referrerReceipt?: string;
  referralCount: number;
};

declare global {
  // eslint-disable-next-line no-var
  var airLocalPreorders: Map<string, LocalWaitlistEntry> | undefined;
  // eslint-disable-next-line no-var
  var airLocalRateLimits: Map<string, { count: number; resetAt: number }> | undefined;
}

const REFERRAL_CODE_PATTERN = /^[A-Za-z0-9_-]{16,64}$/;

function requiresDurableStorage() {
  return process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL_ENV);
}

function configuredSecret() {
  const configured = process.env.AIR_ID_HASH_SECRET?.trim();
  if (
    requiresDurableStorage() &&
    (!configured || configured.length < 32 || configured.startsWith("replace-"))
  ) {
    throw new Error("identity_hash_secret_unavailable");
  }
  return configured || "local-air-preorder-secret";
}

function hash(value: string) {
  return createHmac("sha256", configuredSecret()).update(value).digest("hex");
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

function normalizeIdentity(preorder: Preorder) {
  return `${preorder.email.trim().toLowerCase()}|${preorder.imessage.replace(/\D/g, "")}`;
}

function normalizeReferralCode(value?: string | null) {
  const code = value?.trim() || "";
  return REFERRAL_CODE_PATTERN.test(code) ? code : null;
}

function createReferralCode() {
  return randomBytes(18).toString("base64url");
}

function sortedLocalEntries(store: Map<string, LocalWaitlistEntry>) {
  return [...store.values()].sort((left, right) => {
    if (left.referralCount !== right.referralCount) return right.referralCount - left.referralCount;
    return Date.parse(left.preorder.createdAt) - Date.parse(right.preorder.createdAt);
  });
}

function localStatus(entry: LocalWaitlistEntry, store: Map<string, LocalWaitlistEntry>): WaitlistStatus {
  const entries = sortedLocalEntries(store);
  return {
    totalWaiting: entries.length,
    position: Math.max(1, entries.findIndex(({ receipt }) => receipt === entry.receipt) + 1),
    referralCode: entry.referralCode,
    referralCount: entry.referralCount,
  };
}

async function databaseStatusById(
  db: NeonQueryFunction<false, false>,
  id: string,
): Promise<WaitlistStatus | null> {
  const rows = await db`
    WITH ranked AS (
      SELECT
        id,
        referral_code,
        referral_count,
        count(*) OVER ()::integer AS total_waiting,
        row_number() OVER (
          ORDER BY referral_count DESC, created_at ASC, id ASC
        )::integer AS position
      FROM air_preorders
    )
    SELECT referral_code, referral_count, total_waiting, position
    FROM ranked
    WHERE id = ${id}::uuid
  `;
  const row = rows[0];
  if (!row?.referral_code) return null;
  return {
    totalWaiting: Math.max(0, Number(row.total_waiting ?? 0)),
    position: Math.max(1, Number(row.position ?? 1)),
    referralCode: String(row.referral_code),
    referralCount: Math.max(0, Number(row.referral_count ?? 0)),
  };
}

export async function rateLimit(ip: string, scope = "preorder") {
  const ipHash = hash(`${scope}:${ip}`);
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
  const key = `air:${scope}:rate:${ipHash.slice(0, 28)}`;
  const now = Date.now();
  const current = store.get(key);
  if (!current || current.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + 600_000 });
    return true;
  }
  current.count += 1;
  return current.count <= 5;
}

export async function savePreorder(preorder: Preorder, referralCode?: string | null): Promise<WaitlistSaveResult> {
  const identityHash = hash(normalizeIdentity(preorder));
  const referrerCode = normalizeReferralCode(referralCode);
  const db = database();

  if (db) {
    const generatedReferralCode = createReferralCode();
    const rows = await db`
      WITH referrer AS (
        SELECT id
        FROM air_preorders
        WHERE referral_code = ${referrerCode}
        LIMIT 1
      ), upserted AS (
        INSERT INTO air_preorders (
          identity_hash, name, email, imessage, consent, source, referral_code, referrer_id, created_at, updated_at
        ) VALUES (
          ${identityHash}, ${preorder.name}, ${preorder.email}, ${preorder.imessage},
          ${preorder.consent}, ${preorder.source}, ${generatedReferralCode}, (SELECT id FROM referrer),
          ${preorder.createdAt}, ${preorder.createdAt}
        )
        ON CONFLICT (identity_hash) DO UPDATE SET
          name = EXCLUDED.name,
          email = EXCLUDED.email,
          imessage = EXCLUDED.imessage,
          consent = EXCLUDED.consent,
          source = EXCLUDED.source,
          updated_at = now()
        RETURNING id, (xmax = 0) AS inserted, referrer_id
      ), credited AS (
        UPDATE air_preorders
        SET referral_count = referral_count + 1, updated_at = now()
        WHERE id = (SELECT referrer_id FROM upserted)
          AND (SELECT inserted FROM upserted)
        RETURNING id
      )
      SELECT id, EXISTS(SELECT 1 FROM credited) AS referral_credited
      FROM upserted
    `;
    const row = rows[0];
    const receipt = String(row?.id ?? "");
    if (!receipt) throw new Error("receipt_unavailable");
    const status = await databaseStatusById(db, receipt);
    if (!status) throw new Error("waitlist_status_unavailable");
    return {
      stored: "postgres",
      receipt,
      referralCredited: Boolean(row.referral_credited),
      ...status,
    };
  }

  if (requiresDurableStorage()) throw new Error("database_unavailable");

  const store = (globalThis.airLocalPreorders ??= new Map());
  const existing = store.get(identityHash);
  if (existing) {
    existing.preorder = preorder;
    const status = localStatus(existing, store);
    return { stored: "memory", receipt: existing.receipt, referralCredited: false, ...status };
  }

  const referrer = referrerCode
    ? [...store.values()].find((entry) => entry.referralCode === referrerCode)
    : undefined;
  const entry: LocalWaitlistEntry = {
    preorder,
    receipt: `local_${randomUUID()}`,
    referralCode: createReferralCode(),
    referrerReceipt: referrer?.receipt,
    referralCount: 0,
  };
  store.set(identityHash, entry);
  if (referrer) referrer.referralCount += 1;
  const status = localStatus(entry, store);
  return { stored: "memory", receipt: entry.receipt, referralCredited: Boolean(referrer), ...status };
}

export async function getWaitlistSummary() {
  const db = database();
  if (db) {
    const rows = await db`SELECT count(*)::integer AS total_waiting FROM air_preorders`;
    return { totalWaiting: Math.max(0, Number(rows[0]?.total_waiting ?? 0)) };
  }
  if (requiresDurableStorage()) throw new Error("database_unavailable");
  return { totalWaiting: (globalThis.airLocalPreorders ?? new Map()).size };
}

export async function getWaitlistStatusByReferralCode(code: string) {
  const referralCode = normalizeReferralCode(code);
  if (!referralCode) return null;
  const db = database();
  if (db) {
    const rows = await db`SELECT id FROM air_preorders WHERE referral_code = ${referralCode} LIMIT 1`;
    const id = String(rows[0]?.id ?? "");
    return id ? databaseStatusById(db, id) : null;
  }
  if (requiresDurableStorage()) throw new Error("database_unavailable");
  const store = globalThis.airLocalPreorders ?? new Map();
  const entry = [...store.values()].find((item) => item.referralCode === referralCode);
  return entry ? localStatus(entry, store) : null;
}

export async function getWaitlistStatusByReceipt(receipt: string) {
  const db = database();
  if (db) return databaseStatusById(db, receipt);
  if (requiresDurableStorage()) throw new Error("database_unavailable");
  const store = globalThis.airLocalPreorders ?? new Map();
  const entry = [...store.values()].find((item) => item.receipt === receipt);
  return entry ? localStatus(entry, store) : null;
}

export function checkoutUrlForReceipt(receipt: string) {
  const url = new URL(AIR_STRIPE_PAYMENT_LINK);
  url.searchParams.set("client_reference_id", receipt);
  return url.toString();
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
