import { NextResponse } from "next/server";
import { adminSummary, requireAdminSession } from "@/lib/admin";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!(await requireAdminSession(request).catch(() => false))) return NextResponse.json({ ok: false }, { status: 401 });
  try { return NextResponse.json({ ok: true, ...(await adminSummary()) }, { headers: { "cache-control": "private, no-store" } }); }
  catch { return NextResponse.json({ ok: false, message: "Could not load summary." }, { status: 503 }); }
}
