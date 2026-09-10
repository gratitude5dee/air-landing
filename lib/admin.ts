import "server-only";

import { createHash, randomBytes, scrypt as nodeScrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

const scrypt = promisify(nodeScrypt);
const SESSION_COOKIE = "air_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

function db(): NeonQueryFunction<false, false> {
  const url = process.env.DATABASE_URL?.trim();
  if (!url || (process.env.VERCEL_ENV && process.env.AIR_DATABASE_ENV !== process.env.VERCEL_ENV)) {
    throw new Error("database_unavailable");
  }
  return neon(url);
}

function digest(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export async function hashAdminPassword(password: string, salt = randomBytes(16).toString("hex")) {
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyAdminPassword(password: string) {
  const encoded = process.env.AIR_ADMIN_PASSWORD_HASH?.trim();
  if (!encoded) return false;
  const [salt, expectedHex] = encoded.split(":");
  if (!salt || !expectedHex || !/^[a-f0-9]{128}$/i.test(expectedHex)) return false;
  const actual = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(expectedHex, "hex");
  return expected.length === actual.length && timingSafeEqual(actual, expected);
}

function cookies(request: Request) {
  const value = request.headers.get("cookie") || "";
  const match = value.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  return match ? decodeURIComponent(match.slice(SESSION_COOKIE.length + 1)) : null;
}

export function adminSessionCookie(token: string) {
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${SESSION_TTL_SECONDS}; HttpOnly; SameSite=Strict; Secure`;
}

export function clearAdminSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict; Secure`;
}

export async function createAdminSession() {
  const token = randomBytes(32).toString("base64url");
  const query = db();
  await query`INSERT INTO air_admin_sessions (token_hash, expires_at) VALUES (${digest(token)}, now() + interval '8 hours')`;
  return token;
}

export async function destroyAdminSession(request: Request) {
  const token = cookies(request);
  if (token) { const query = db(); await query`DELETE FROM air_admin_sessions WHERE token_hash = ${digest(token)}`; }
}

export async function requireAdminSession(request: Request) {
  const token = cookies(request);
  if (!token) return false;
  const query = db();
  const rows = await query`SELECT 1 FROM air_admin_sessions WHERE token_hash = ${digest(token)} AND expires_at > now() LIMIT 1`;
  return rows.length > 0;
}

export async function allowAdminLogin(ip: string) {
  const ipHash = digest(`${process.env.AIR_ADMIN_SESSION_SECRET || process.env.AIR_ID_HASH_SECRET || "local"}:${ip}`);
  const query = db();
  const rows = await query`
    INSERT INTO air_admin_login_attempts (ip_hash, window_started_at, attempt_count)
    VALUES (${ipHash}, now(), 1)
    ON CONFLICT (ip_hash) DO UPDATE SET
      window_started_at = CASE WHEN air_admin_login_attempts.window_started_at < now() - interval '15 minutes' THEN now() ELSE air_admin_login_attempts.window_started_at END,
      attempt_count = CASE WHEN air_admin_login_attempts.window_started_at < now() - interval '15 minutes' THEN 1 ELSE air_admin_login_attempts.attempt_count + 1 END
    RETURNING attempt_count
  `;
  return Number(rows[0]?.attempt_count || 0) <= 8;
}

export type AdminMember = {
  id: string;
  name: string;
  email: string;
  imessage: string;
  source: string;
  interest: string;
  referralCount: number;
  position: number;
  createdAt: string;
  paid: boolean;
  paymentStatus: string | null;
};

export async function listAdminMembers(search = "", source = "all", limit = 100, offset = 0) {
  const safeLimit = Math.min(250, Math.max(1, Math.floor(limit)));
  const safeOffset = Math.max(0, Math.floor(offset));
  const query = db();
  const rows = await query`
    WITH ranked AS (
      SELECT p.*, row_number() OVER (ORDER BY p.referral_count DESC, p.created_at ASC, p.id ASC)::integer AS position
      FROM air_preorders p
    )
    SELECT r.id, r.name, r.email, r.imessage, r.source, COALESCE(r.interest, 'General') AS interest,
      r.referral_count, r.position, r.created_at,
      EXISTS (SELECT 1 FROM air_stripe_payments pay WHERE pay.preorder_id = r.id AND pay.status IN ('paid', 'succeeded')) AS paid,
      (SELECT pay.status FROM air_stripe_payments pay WHERE pay.preorder_id = r.id ORDER BY pay.updated_at DESC LIMIT 1) AS payment_status
    FROM ranked r
    WHERE (${search} = '' OR r.name ILIKE '%' || ${search} || '%' OR r.email ILIKE '%' || ${search} || '%' OR r.imessage ILIKE '%' || ${search} || '%')
      AND (${source} = 'all' OR r.source LIKE ${source} || ':%' OR (${source} = 'air' AND r.source = 'air-landing'))
    ORDER BY r.position ASC
    LIMIT ${safeLimit} OFFSET ${safeOffset}
  `;
  return rows.map((row) => ({
    id: String(row.id), name: String(row.name), email: String(row.email), imessage: String(row.imessage), source: String(row.source),
    interest: String(row.interest), referralCount: Number(row.referral_count || 0), position: Number(row.position || 0),
    createdAt: new Date(String(row.created_at)).toISOString(), paid: Boolean(row.paid), paymentStatus: row.payment_status ? String(row.payment_status) : null,
  })) as AdminMember[];
}

export async function adminSummary() {
  const rows = await db()`
    SELECT count(*)::integer AS total,
      count(*) FILTER (WHERE source LIKE 'wzrd:%')::integer AS from_wzrd,
      count(*) FILTER (WHERE source LIKE 'air:%' OR source = 'air-landing')::integer AS from_air,
      count(*) FILTER (WHERE EXISTS (SELECT 1 FROM air_stripe_payments pay WHERE pay.preorder_id = air_preorders.id AND pay.status IN ('paid','succeeded')))::integer AS paid
    FROM air_preorders
  `;
  const row = rows[0] || {};
  return { total: Number(row.total || 0), fromWzrd: Number(row.from_wzrd || 0), fromAir: Number(row.from_air || 0), paid: Number(row.paid || 0) };
}

export async function exportAdminMembers(search = "", source = "all") {
  return listAdminMembers(search, source, 250, 0);
}
