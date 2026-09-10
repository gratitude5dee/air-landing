import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import {
  checkoutUrlForReceipt,
  getWaitlistStatusByReceipt,
  rateLimit,
} from "@/lib/preorders";
import { corsHeaders, corsOptions, originAllowed } from "@/lib/cors";

export const runtime = "nodejs";

const schema = z.object({ receipt: z.string().trim().min(1).max(80) });

function headers(request: Request) {
  return corsHeaders(request);
}

export function OPTIONS(request: Request) {
  return corsOptions(request);
}

export async function POST(request: Request) {
  const requestId = randomUUID();
  if (!originAllowed(request)) return NextResponse.json({ ok: false, message: "Origin not allowed.", requestId }, { status: 400, headers: headers(request) });
  try {
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || "anonymous";
    if (!(await rateLimit(ip, "checkout-intent"))) {
      return NextResponse.json(
        { ok: false, message: "Too many checkout attempts. Try again in a few minutes.", requestId },
        { status: 429, headers: headers(request) },
      );
    }
    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "Your waitlist session has expired. Please join again.", requestId },
        { status: 400, headers: headers(request) },
      );
    }
    const status = await getWaitlistStatusByReceipt(parsed.data.receipt);
    if (!status) {
      return NextResponse.json(
        { ok: false, message: "Your waitlist session has expired. Please join again.", requestId },
        { status: 404, headers: headers(request) },
      );
    }
    return NextResponse.json(
      { ok: true, checkoutUrl: checkoutUrlForReceipt(parsed.data.receipt) },
      { headers: headers(request) },
    );
  } catch {
    console.error("air_waitlist_checkout_intent_failed", { requestId });
    return NextResponse.json(
      { ok: false, message: "Air could not start checkout right now. Please try again.", requestId },
      { status: 503, headers: headers(request) },
    );
  }
}
