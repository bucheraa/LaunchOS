import { NextRequest, NextResponse } from "next/server";
import { requireAuth, getWorkspace } from "@/lib/auth/session";
import { createCustomerPortalSession } from "@/lib/integrations/stripe/client";
import { db } from "@/lib/db/client";
import { logger } from "@/lib/utils/logger";

export async function POST(_req: NextRequest) {
  try {
    const session = await requireAuth();
    const workspace = await getWorkspace(session.user.id!);
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const billing = await db.billingCustomer.findUnique({
      where: { workspaceId: workspace.id },
    });

    if (!billing?.stripeCustomerId) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const portalSession = await createCustomerPortalSession({
      customerId: billing.stripeCustomerId,
      returnUrl: `${appUrl}/settings`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    logger.error("Billing portal error", error);
    return NextResponse.json({ error: "Failed to open billing portal" }, { status: 500 });
  }
}
