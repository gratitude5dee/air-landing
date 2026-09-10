import { NextResponse } from "next/server";
import { allowAdminLogin, adminSessionCookie, createAdminSession, verifyAdminPassword } from "@/lib/admin";

export const runtime = "nodejs";

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ ok: false, message: "Origin not allowed." }, { status: 400 });
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
  try {
    if (!(await allowAdminLogin(ip))) return NextResponse.json({ ok: false, message: "Too many attempts. Try again later." }, { status: 429 });
    const body = await request.json().catch(() => null) as { password?: unknown } | null;
    const password = typeof body?.password === "string" ? body.password : "";
    if (!password || !(await verifyAdminPassword(password))) return NextResponse.json({ ok: false, message: "Invalid admin password." }, { status: 401 });
    const token = await createAdminSession();
    const response = NextResponse.json({ ok: true });
    response.headers.set("set-cookie", adminSessionCookie(token));
    return response;
  } catch {
    return NextResponse.json({ ok: false, message: "Admin authentication is not configured." }, { status: 503 });
  }
}
