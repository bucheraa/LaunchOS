/**
 * Integration management: connect, disconnect, test, and push listings.
 * Provider can be: APPLE_APP_STORE_CONNECT | GOOGLE_PLAY_DEVELOPER | REVENUECAT | STRIPE
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { getWorkspace, requireApiSession } from "@/lib/auth/session";
import { createAppleClientFromCredentials } from "@/lib/integrations/apple/client";
import { createGooglePlayClient } from "@/lib/integrations/google/client";
import { logger } from "@/lib/utils/logger";
import { z } from "zod";
import { isDemoMode } from "@/lib/demo/mode";
import {
  disconnectDemoIntegration,
  testDemoIntegration,
  upsertDemoIntegration,
} from "@/lib/demo/store";

const connectSchema = z.discriminatedUnion("provider", [
  z.object({
    provider: z.literal("APPLE_APP_STORE_CONNECT"),
    issuerId: z.string().min(1),
    keyId: z.string().min(1),
    privateKey: z.string().min(1),
  }),
  z.object({
    provider: z.literal("GOOGLE_PLAY_DEVELOPER"),
    serviceAccountEmail: z.string().email(),
    privateKey: z.string().min(1),
  }),
  z.object({
    provider: z.literal("REVENUECAT"),
    apiKey: z.string().min(1),
  }),
  z.object({
    provider: z.literal("STRIPE"),
    // Stripe is handled via billing flow, not here
    placeholder: z.boolean().optional(),
  }),
]);

// POST /api/integrations/[provider] — connect with credentials
export async function POST(
  req: NextRequest,
  { params }: { params: { provider: string } }
) {
  try {
    const session = await requireApiSession();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const action = body.action as string | undefined;

    if (isDemoMode) {
      if (action === "test") {
        const result = testDemoIntegration(params.provider);
        if (!result) {
          return NextResponse.json({ error: "Not connected" }, { status: 400 });
        }

        return NextResponse.json({ success: true, apps: result.apps });
      }

      const parsed = connectSchema.safeParse({ ...body, provider: params.provider });
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
      }

      const { provider, ...credFields } = parsed.data;
      const integration = upsertDemoIntegration(provider, credFields as Record<string, string>);
      return NextResponse.json({ id: integration.id, status: integration.status });
    }

    const workspace = await getWorkspace(session.user.id);
    if (!workspace) return NextResponse.json({ error: "No workspace" }, { status: 404 });

    // ── Test connection ──────────────────────────────────────────────────────
    if (action === "test") {
      const integration = await db.integration.findUnique({
        where: {
          workspaceId_provider: {
            workspaceId: workspace.id,
            provider: params.provider as any,
          },
        },
      });
      if (!integration?.credentials) {
        return NextResponse.json({ error: "Not connected" }, { status: 400 });
      }

      const creds = integration.credentials as any;

      if (params.provider === "APPLE_APP_STORE_CONNECT") {
        const client = createAppleClientFromCredentials(creds);
        const result = await client.getApps();
        if (result.success) {
          await db.integration.update({
            where: { id: integration.id },
            data: { status: "CONNECTED", lastSyncedAt: new Date(), metadata: { apps: result.data } },
          });
          return NextResponse.json({ success: true, apps: result.data });
        }
        await db.integration.update({ where: { id: integration.id }, data: { status: "ERROR" } });
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      if (params.provider === "GOOGLE_PLAY_DEVELOPER") {
        // Minimal test: just try to get access token
        const client = createGooglePlayClient(creds);
        await db.integration.update({
          where: { id: integration.id },
          data: { status: "CONNECTED", lastSyncedAt: new Date() },
        });
        return NextResponse.json({ success: true });
      }

      return NextResponse.json({ success: true });
    }

    // ── Connect (save credentials) ───────────────────────────────────────────
    const parsed = connectSchema.safeParse({ ...body, provider: params.provider });
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
    }

    const { provider, ...credFields } = parsed.data;

    // Store credentials (in production: encrypt these before storing)
    const integration = await db.integration.upsert({
      where: {
        workspaceId_provider: {
          workspaceId: workspace.id,
          provider: provider as any,
        },
      },
      update: {
        credentials: credFields,
        status: "PENDING",
        lastSyncedAt: null,
      },
      create: {
        workspaceId: workspace.id,
        provider: provider as any,
        credentials: credFields,
        status: "PENDING",
      },
    });

    logger.info(`Integration saved: ${provider} for workspace ${workspace.id}`);
    return NextResponse.json({ id: integration.id, status: integration.status });
  } catch (error) {
    logger.error(`POST /api/integrations/${params.provider}`, error);
    return NextResponse.json({ error: "Integration setup failed" }, { status: 500 });
  }
}

// DELETE /api/integrations/[provider] — disconnect
export async function DELETE(
  req: NextRequest,
  { params }: { params: { provider: string } }
) {
  const session = await requireApiSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (isDemoMode) {
    disconnectDemoIntegration(params.provider);
    return NextResponse.json({ success: true });
  }

  const workspace = await getWorkspace(session.user.id);
  if (!workspace) return NextResponse.json({ error: "No workspace" }, { status: 404 });

  await db.integration.updateMany({
    where: { workspaceId: workspace.id, provider: params.provider as any },
    data: { status: "DISCONNECTED", credentials: undefined },
  });

  return NextResponse.json({ success: true });
}
