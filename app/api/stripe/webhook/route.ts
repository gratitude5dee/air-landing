import { NextResponse } from "next/server";
import { recordStripeEvent, verifyStripeSignature } from "@/lib/stripe-webhook";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const payload = await request.text();
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  const signature = request.headers.get("stripe-signature") || "";
  if (!secret || !verifyStripeSignature(payload, signature, secret)) return NextResponse.json({ ok: false }, { status: 400 });
  try { const result = await recordStripeEvent(JSON.parse(payload) as Record<string, unknown>); return NextResponse.json({ received: true, ...result }); }
  catch { return NextResponse.json({ ok: false, message: "Webhook processing failed." }, { status: 500 }); }
}
