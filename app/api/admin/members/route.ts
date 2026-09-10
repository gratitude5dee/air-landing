import { NextResponse } from "next/server";
import { listAdminMembers, requireAdminSession } from "@/lib/admin";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!(await requireAdminSession(request).catch(() => false))) return NextResponse.json({ ok: false }, { status: 401 });
  const url = new URL(request.url);
  try {
    const members = await listAdminMembers(url.searchParams.get("q")?.slice(0, 80) || "", url.searchParams.get("source") || "all", Number(url.searchParams.get("limit") || 100), Number(url.searchParams.get("offset") || 0));
    return NextResponse.json({ ok: true, members }, { headers: { "cache-control": "private, no-store" } });
  } catch { return NextResponse.json({ ok: false, message: "Could not load members." }, { status: 503 }); }
}
