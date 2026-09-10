import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { neon } from "@neondatabase/serverless";

export function verifyStripeSignature(payload: string, signature: string, secret: string, toleranceSeconds = 300, now = Math.floor(Date.now() / 1000)) {
  const parts = signature.split(",").reduce<Record<string, string[]>>((result, part) => {
    const [key, value] = part.split("=", 2); if (key && value) (result[key] ||= []).push(value); return result;
  }, {});
  const timestamp = Number(parts.t?.[0]);
  if (!Number.isFinite(timestamp) || Math.abs(now - timestamp) > toleranceSeconds) return false;
  const expected = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");
  return (parts.v1 || []).some((candidate) => {
    const a = Buffer.from(candidate, "hex"); const b = Buffer.from(expected, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  });
}

type StripeObject = Record<string, unknown>;
function stringValue(value: unknown) { return typeof value === "string" ? value : null; }
function intValue(value: unknown) { return typeof value === "number" && Number.isFinite(value) ? Math.round(value) : null; }
function uuid(value: string | null) { return value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value) ? value : null; }

export async function recordStripeEvent(event: StripeObject) {
  const url = process.env.DATABASE_URL?.trim();
  if (!url || (process.env.VERCEL_ENV && process.env.AIR_DATABASE_ENV !== process.env.VERCEL_ENV)) throw new Error("database_unavailable");
  const db = neon(url);
  const eventId = stringValue(event.id); const type = stringValue(event.type); const data = event.data as StripeObject | undefined; const object = data?.object as StripeObject | undefined;
  if (!eventId || !type || !object) throw new Error("invalid_event");
  const query = db;
  const inserted = await query`
    INSERT INTO air_stripe_events (event_id, event_type, payload_hash, livemode, created_at, processed_at)
    VALUES (${eventId}, ${type}, ${createHash("sha256").update(JSON.stringify(event)).digest("hex")}, ${Boolean(event.livemode)}, to_timestamp(${intValue(event.created) || Math.floor(Date.now()/1000)}), now())
    ON CONFLICT (event_id) DO NOTHING RETURNING event_id
  `;
  if (!inserted.length) return { duplicate: true };

  const receipt = uuid(stringValue(object.client_reference_id));
  const metadata = object.metadata as StripeObject | undefined;
  const preorderId = receipt || uuid(stringValue(metadata?.preorder_id));
  if (type === "checkout.session.completed" || type === "checkout.session.async_payment_succeeded") {
    const id = stringValue(object.payment_intent) || stringValue(object.id);
    if (id) await query`INSERT INTO air_stripe_payments (stripe_payment_id, preorder_id, checkout_session_id, amount, currency, status, paid_at) VALUES (${id}, ${preorderId}, ${stringValue(object.id)}, ${intValue(object.amount_total)}, ${stringValue(object.currency)}, ${type.endsWith('succeeded') || object.payment_status === 'paid' ? 'paid' : 'pending'}, ${type.endsWith('succeeded') || object.payment_status === 'paid' ? new Date().toISOString() : null}) ON CONFLICT (stripe_payment_id) DO UPDATE SET preorder_id=COALESCE(EXCLUDED.preorder_id, air_stripe_payments.preorder_id), status=EXCLUDED.status, updated_at=now()`;
  } else if (type.startsWith("payment_intent.")) {
    const id = stringValue(object.id); if (id) await query`INSERT INTO air_stripe_payments (stripe_payment_id, preorder_id, amount, currency, status, paid_at) VALUES (${id}, ${preorderId}, ${intValue(object.amount)}, ${stringValue(object.currency)}, ${type.endsWith('succeeded') ? 'paid' : type.replace('payment_intent.','')}, ${type.endsWith('succeeded') ? new Date().toISOString() : null}) ON CONFLICT (stripe_payment_id) DO UPDATE SET preorder_id=COALESCE(EXCLUDED.preorder_id, air_stripe_payments.preorder_id), status=EXCLUDED.status, updated_at=now()`;
  } else if (type === "charge.refunded" || type === "charge.dispute.created") {
    const id = stringValue(object.payment_intent) || stringValue(object.id); if (id) await query`UPDATE air_stripe_payments SET refunded_amount=COALESCE(${intValue(object.amount_refunded)}, refunded_amount), disputed=${type === 'charge.dispute.created'}, status=${type === 'charge.dispute.created' ? 'disputed' : 'refunded'}, updated_at=now() WHERE stripe_payment_id=${id}`;
  } else if (type.startsWith("customer.subscription.")) {
    const id = stringValue(object.id); if (id) await query`INSERT INTO air_stripe_subscriptions (stripe_subscription_id, preorder_id, status, current_period_end, cancel_at_period_end, latest_invoice_id) VALUES (${id}, ${preorderId}, ${stringValue(object.status) || 'unknown'}, ${intValue(object.current_period_end) ? new Date(intValue(object.current_period_end)! * 1000).toISOString() : null}, ${Boolean(object.cancel_at_period_end)}, ${stringValue(object.latest_invoice)}) ON CONFLICT (stripe_subscription_id) DO UPDATE SET preorder_id=COALESCE(EXCLUDED.preorder_id, air_stripe_subscriptions.preorder_id), status=EXCLUDED.status, current_period_end=EXCLUDED.current_period_end, cancel_at_period_end=EXCLUDED.cancel_at_period_end, latest_invoice_id=EXCLUDED.latest_invoice_id, updated_at=now()`;
  } else if (type === "customer.created") {
    const id = stringValue(object.id); if (id) await query`INSERT INTO air_stripe_customers (stripe_customer_id, preorder_id) VALUES (${id}, ${preorderId}) ON CONFLICT (stripe_customer_id) DO UPDATE SET preorder_id=COALESCE(EXCLUDED.preorder_id, air_stripe_customers.preorder_id), updated_at=now()`;
  }
  return { duplicate: false };
}
