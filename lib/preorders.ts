import "server-only";

import { createHmac } from "node:crypto";
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
  var airLocalPreorders: Map<string, Preorder> | undefined;
  // eslint-disable-next-line no-var
  var airLocalRateLimits: Map<string, { count: number; resetAt: number }> | undefined;
}

function hash(value: string) {
  const configured = process.env.AIR_ID_HASH_SECRET;
  if (process.env.NODE_ENV === "production" && (!configured || configured.length < 32)) {
    throw new Error("AIR_ID_HASH_SECRET must be at least 32 characters in production");
  }
  const secret = configured || "local-air-preorder-secret";
  return createHmac("sha256", secret).update(value).digest("hex");
}

function database() {
  return process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
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
    await db`
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
    `;
    return { stored: "postgres" as const };
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("Preorder storage is not configured");
  }

  const local = (globalThis.airLocalPreorders ??= new Map());
  local.set(identityHash, preorder);
  return { stored: "memory" as const };
}
