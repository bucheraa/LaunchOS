/**
 * Push a ListingVariant directly to App Store Connect or Google Play.
 * Requires the workspace to have the corresponding integration connected.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { db } from "@/lib/db/client";
import { getWorkspace } from "@/lib/auth/session";
import { createAppleClientFromCredentials } from "@/lib/integrations/apple/client";
import { createGooglePlayClient } from "@/lib/integrations/google/client";
import { logger } from "@/lib/utils/logger";
import { z } from "zod";

const schema = z.object({
  variantId: z.string().cuid(),
  appId: z.string().min(1), // Apple app ID or Android package name
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const workspace = await getWorkspace(session.user.id);
    if (!workspace) return NextResponse.json({ error: "No workspace" }, { status: 404 });

    const body = await req.json();
    const parsed = schema.safeParse(body);

    // In DEMO_MODE, simulate a successful push without hitting real store APIs
    if (process.env.DEMO_MODE === "true") {
      if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
      await new Promise((r) => setTimeout(r, 1000));
      await db.listingVariant.update({
        where: { id: parsed.data.variantId },
        data: { pushedToStore: true, pushedAt: new Date(), status: "LIVE" },
      });
      return NextResponse.json({ success: true, demo: true });
    }
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
    }

    const variant = await db.listingVariant.findFirst({
      where: { id: parsed.data.variantId, projectId: params.id },
    });
    if (!variant) return NextResponse.json({ error: "Variant not found" }, { status: 404 });

    const provider =
      variant.platform === "IOS" ? "APPLE_APP_STORE_CONNECT" : "GOOGLE_PLAY_DEVELOPER";

    const integration = await db.integration.findUnique({
      where: { workspaceId_provider: { workspaceId: workspace.id, provider } },
    });

    if (!integration || integration.status !== "CONNECTED" || !integration.credentials) {
      return NextResponse.json(
        { error: `${provider} integration not connected. Please connect in Settings.` },
        { status: 400 }
      );
    }

    const creds = integration.credentials as any;

    if (variant.platform === "IOS") {
      const client = createAppleClientFromCredentials(creds);
      const result = await client.pushListing(parsed.data.appId, variant.locale, {
        name: variant.appName ?? undefined,
        subtitle: variant.subtitle ?? undefined,
        description: variant.description ?? undefined,
        promotionalText: variant.promotionalText ?? undefined,
        keywords: variant.keywords.join(","),
      });

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
    } else {
      const client = createGooglePlayClient(creds);
      const langMap: Record<string, string> = { en: "en-US", de: "de-DE" };
      const language = langMap[variant.locale] ?? "en-US";

      const result = await client.updateListing(parsed.data.appId, language, {
        title: variant.appName ?? undefined,
        shortDescription: variant.shortDescription ?? undefined,
        fullDescription: variant.description ?? undefined,
      });

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
    }

    // Mark as pushed
    await db.listingVariant.update({
      where: { id: variant.id },
      data: { pushedToStore: true, pushedAt: new Date(), status: "LIVE" },
    });

    logger.info(`Pushed variant ${variant.id} to ${provider}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error(`POST /api/projects/${params.id}/store-copy/push`, error);
    return NextResponse.json({ error: "Push failed" }, { status: 500 });
  }
}
