import { NextRequest, NextResponse } from "next/server";
import { requireAuth, getWorkspace } from "@/lib/auth/session";
import { getStripe, STRIPE_PLANS, getOrCreateStripeCustomer } from "@/lib/integrations/stripe/client";
import { db } from "@/lib/db/client";
import { logger } from "@/lib/utils/logger";
import { isDemoMode } from "@/lib/demo/mode";
import { setDemoPlan } from "@/lib/demo/store";

const PLAN_MAP: Record<string, keyof typeof STRIPE_PLANS> = {
  STARTER: "STARTER",
  GROWTH: "GROWTH",
};

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const workspace = await getWorkspace(session.user.id!);
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const body = await req.json();
    const planKey = PLAN_MAP[body.plan];
    if (!planKey) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    if (isDemoMode) {
      setDemoPlan(planKey);
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      return NextResponse.json({ url: `${appUrl}/settings?demoCheckout=1&plan=${planKey}` });
    }

    const plan = STRIPE_PLANS[planKey];
    if (!plan.priceId) {
      return NextResponse.json(
        { error: `Price ID for ${planKey} is not configured. Set STRIPE_${planKey}_PRICE_ID.` },
        { status: 500 }
      );
    }

    // Get or create Stripe customer
    const existing = await db.billingCustomer.findUnique({
      where: { workspaceId: workspace.id },
    });

    let customerId = existing?.stripeCustomerId;
    if (!customerId) {
      const customer = await getOrCreateStripeCustomer(
        session.user.email!,
        session.user.name ?? undefined
      );
      customerId = customer.id;
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const checkoutSession = await getStripe().checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      billing_address_collection: "auto",
      line_items: [{ price: plan.priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${appUrl}/settings?upgraded=true`,
      cancel_url: `${appUrl}/settings`,
      metadata: {
        workspaceId: workspace.id,
        plan: planKey,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    logger.error("Billing checkout error", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
