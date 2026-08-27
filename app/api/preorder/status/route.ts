import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

import { getWaitlistStatusByReferralCode, getWaitlistSummary, rateLimit } from "@/lib/preorders";

export const runtime = "nodejs";

function headers() {
  return {
    "cache-control": "private, no-store",
    "x-content-type-options": "nosniff",
  };
}

export async function GET(request: Request) {
  const requestId = randomUUID();
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "anonymous";
  try {
    if (!(await rateLimit(ip, "status"))) {
      return NextResponse.json(
        { ok: false, message: "Too many attempts. Try again in a few minutes.", requestId },
        { status: 429, headers: headers() },
      );
    }
    const code = new URL(request.url).searchParams.get("code");
    if (code) {
      const status = await getWaitlistStatusByReferralCode(code);
      // A referral URL is intentionally public, but it must remain a
      // status-only surface. Do not return checkout state, contact data, or
      // the code itself from this endpoint.
      const publicStatus = status
        ? {
            totalWaiting: status.totalWaiting,
            position: status.position,
            referralCount: status.referralCount,
          }
        : null;
      return NextResponse.json({ ok: true, status: publicStatus }, { headers: headers() });
    }
    return NextResponse.json({ ok: true, ...(await getWaitlistSummary()) }, { headers: headers() });
  } catch {
    console.error("air_waitlist_status_failed", { requestId });
    return NextResponse.json(
      { ok: false, message: "Air could not load the waitlist right now.", requestId },
      { status: 503, headers: headers() },
    );
  }
}
