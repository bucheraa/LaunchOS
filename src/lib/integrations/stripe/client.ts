import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2024-06-20",
      typescript: true,
    });
  }
  return stripeInstance;
}

export const STRIPE_PLANS = {
  FREE: {
    priceId: null,
    name: "Free",
    price: 0,
    features: ["3 projects", "Basic store copy", "5 AI analyses/month"],
  },
  STARTER: {
    priceId: process.env.STRIPE_STARTER_PRICE_ID,
    name: "Starter",
    price: 49,
    features: [
      "10 projects",
      "Unlimited store copy",
      "50 AI analyses/month",
      "Screenshot planner",
      "A/B experiment planner",
    ],
  },
  GROWTH: {
    priceId: process.env.STRIPE_GROWTH_PRICE_ID,
    name: "Growth",
    price: 149,
    features: [
      "Unlimited projects",
      "Unlimited AI usage",
      "All integrations",
      "Priority support",
      "Custom locales",
    ],
  },
} as const;

export async function createCheckoutSession({
  customerId,
  priceId,
  successUrl,
  cancelUrl,
  metadata,
}: {
  customerId?: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}) {
  const stripe = getStripe();
  return stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    billing_address_collection: "auto",
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "subscription",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
  });
}

export async function createCustomerPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}) {
  const stripe = getStripe();
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

export async function getOrCreateStripeCustomer(email: string, name?: string) {
  const stripe = getStripe();
  const existing = await stripe.customers.list({ email, limit: 1 });
  if (existing.data.length > 0) return existing.data[0];
  return stripe.customers.create({ email, name });
}
