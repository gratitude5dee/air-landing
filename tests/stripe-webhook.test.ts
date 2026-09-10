import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";

import { verifyStripeSignature } from "@/lib/stripe-webhook";

describe("Stripe webhook signatures", () => {
  it("accepts a signed raw payload within the tolerance window", () => {
    const payload = JSON.stringify({ id: "evt_test", type: "checkout.session.completed" });
    const timestamp = 1_700_000_000;
    const secret = "whsec_test";
    const signature = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");
    expect(verifyStripeSignature(payload, `t=${timestamp},v1=${signature}`, secret, 300, timestamp + 10)).toBe(true);
  });

  it("rejects tampered and stale payloads", () => {
    const timestamp = 1_700_000_000;
    const secret = "whsec_test";
    const signature = createHmac("sha256", secret).update(`${timestamp}.payload`).digest("hex");
    expect(verifyStripeSignature("tampered", `t=${timestamp},v1=${signature}`, secret, 300, timestamp)).toBe(false);
    expect(verifyStripeSignature("payload", `t=${timestamp},v1=${signature}`, secret, 300, timestamp + 301)).toBe(false);
  });
});
