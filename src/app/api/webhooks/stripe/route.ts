import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { getStripe } from "@/lib/integrations/stripe/client";
import { db } from "@/lib/db/client";
import { logger } from "@/lib/utils/logger";
import type Stripe from "stripe";

// Map Stripe price IDs → workspace Plan enum values
function planFromPriceId(priceId: string): "STARTER" | "GROWTH" | null {
  if (priceId === process.env.STRIPE_STARTER_PRICE_ID) return "STARTER";
  if (priceId === process.env.STRIPE_GROWTH_PRICE_ID) return "GROWTH";
  return null;
}

async function syncWorkspacePlan(stripeCustomerId: string, priceId: string | null) {
  const plan = priceId ? planFromPriceId(priceId) : null;
  const billing = await db.billingCustomer.findUnique({
    where: { stripeCustomerId },
    select: { workspaceId: true },
  });
  if (billing?.workspaceId) {
    await db.workspace.update({
      where: { id: billing.workspaceId },
      data: { plan: plan ?? "FREE" },
    });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    logger.error("Stripe webhook signature verification failed", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }

  logger.info(`Stripe webhook: ${event.type}`);

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const priceId = subscription.items.data[0]?.price.id ?? null;
        await db.billingCustomer.updateMany({
          where: { stripeCustomerId: subscription.customer as string },
          data: {
            stripeSubscriptionId: subscription.id,
            stripePriceId: priceId,
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        });
        await syncWorkspacePlan(subscription.customer as string, priceId);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await db.billingCustomer.updateMany({
          where: { stripeCustomerId: subscription.customer as string },
          data: {
            stripeSubscriptionId: null,
            stripePriceId: null,
            stripeCurrentPeriodEnd: null,
          },
        });
        // Downgrade workspace to FREE
        await syncWorkspacePlan(subscription.customer as string, null);
        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.CheckoutSession;
        if (session.mode === "subscription" && session.customer && session.metadata?.workspaceId) {
          await db.billingCustomer.upsert({
            where: { workspaceId: session.metadata.workspaceId },
            update: { stripeCustomerId: session.customer as string },
            create: {
              workspaceId: session.metadata.workspaceId,
              stripeCustomerId: session.customer as string,
            },
          });
        }
        break;
      }

      default:
        logger.debug(`Unhandled Stripe event: ${event.type}`);
    }
  } catch (err) {
    logger.error("Stripe webhook handler error", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
