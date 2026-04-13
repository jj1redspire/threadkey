import Stripe from "stripe";

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Lazy Stripe instance — only initialized on first use (at request time, not build time)
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    _stripe = new Stripe(key);
  }
  return _stripe;
}

// Named export for routes that import `stripe` directly
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (getStripe() as any)[prop as string];
  },
});
