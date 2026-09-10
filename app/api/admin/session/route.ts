import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const authenticated = await requireAdminSession(request).catch(() => false);
  return NextResponse.json({ ok: true, authenticated }, { headers: { "cache-control": "private, no-store" } });
}
