import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { getStripe } from "@/lib/integrations/stripe/client";
import { db } from "@/lib/db/client";
import { logger } from "@/lib/utils/logger";
import type Stripe from "stripe";

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
        await db.billingCustomer.updateMany({
          where: { stripeCustomerId: subscription.customer as string },
          data: {
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0]?.price.id,
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        });
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
