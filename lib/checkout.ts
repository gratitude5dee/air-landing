/**
 * This is deliberately a public URL: it points to Stripe-hosted Checkout and
 * never contains credentials or payment information. Keeping it in one place
 * also means the no-JavaScript fallback and the gated client path agree.
 */
export const AIR_STRIPE_PAYMENT_LINK =
  process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK ||
  "https://buy.stripe.com/bJe5kF8Pg49RaPw9M6a3u02";

export const AIR_ONBOARDING_LINK =
  process.env.NEXT_PUBLIC_CAL_LINK || "https://cal.com/5deestudios/air-onboarding";

