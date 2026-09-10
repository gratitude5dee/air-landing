import { NextResponse } from "next/server";

const DEFAULT_ALLOWED = ["https://wzrd.tech", "https://www.wzrd.tech"];

export function allowedWaitlistOrigin(origin: string | null) {
  if (!origin) return null;
  const configured = (process.env.AIR_WAITLIST_ALLOWED_ORIGINS || "")
    .split(",")
    .map((value) => value.trim().replace(/\/$/, ""))
    .filter(Boolean);
  const allowed = configured.length ? configured : DEFAULT_ALLOWED;
  return allowed.includes(origin.replace(/\/$/, "")) ? origin : null;
}

export function corsHeaders(request: Request) {
  const origin = allowedWaitlistOrigin(request.headers.get("origin"));
  return {
    "access-control-allow-origin": origin || "null",
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    "cache-control": "private, no-store",
    "vary": "Origin",
    "x-content-type-options": "nosniff",
  };
}

export function corsOptions(request: Request) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(request) });
}

export function originAllowed(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || Boolean(allowedWaitlistOrigin(origin));
}
