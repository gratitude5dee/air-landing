import { NextResponse } from "next/server";

import { adminCookieOptions, AIR_ADMIN_COOKIE } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(AIR_ADMIN_COOKIE, "", { ...adminCookieOptions(), maxAge: 0 });
  return response;
}
