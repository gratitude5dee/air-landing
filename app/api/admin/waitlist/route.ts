import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AIR_ADMIN_COOKIE, verifyAdminSession } from "@/lib/admin-auth";
import { getAdminWaitlistEntries, WAITLIST_BASE_COUNT } from "@/lib/preorders";

export const runtime = "nodejs";

export async function GET() {
  const cookieStore = await cookies();
  if (!verifyAdminSession(cookieStore.get(AIR_ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const entries = await getAdminWaitlistEntries();
    return NextResponse.json(
      { entries, total: WAITLIST_BASE_COUNT + entries.length },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    console.error("admin_waitlist_unavailable", error);
    return NextResponse.json({ error: "waitlist_unavailable" }, { status: 503 });
  }
}
