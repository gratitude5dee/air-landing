import { NextResponse } from "next/server";
import { clearAdminSessionCookie, destroyAdminSession } from "@/lib/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  await destroyAdminSession(request).catch(() => undefined);
  const response = NextResponse.json({ ok: true });
  response.headers.set("set-cookie", clearAdminSessionCookie());
  return response;
}
