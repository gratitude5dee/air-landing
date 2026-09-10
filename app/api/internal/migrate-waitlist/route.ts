import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

import { migrateWaitlistSchema } from "@/lib/schema-migration";

export const runtime = "nodejs";

function authorized(request: Request) {
  const configured = process.env.AIR_ADMIN_SESSION_SECRET?.trim();
  const supplied = request.headers.get("x-air-migration-secret") || "";
  if (!configured || !supplied) return false;
  const expected = Buffer.from(configured);
  const actual = Buffer.from(supplied);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ ok: false }, { status: 404 });
  try {
    return NextResponse.json({ ok: true, ...(await migrateWaitlistSchema()) }, { headers: { "cache-control": "no-store" } });
  } catch {
    return NextResponse.json({ ok: false, message: "Schema migration failed." }, { status: 503 });
  }
}
