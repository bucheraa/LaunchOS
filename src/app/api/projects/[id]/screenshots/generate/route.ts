import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { getWorkspace, requireApiSession } from "@/lib/auth/session";
import { uploadMockup } from "@/lib/storage/supabase-storage";
import { logger } from "@/lib/utils/logger";
import { z } from "zod";
import { isDemoMode } from "@/lib/demo/mode";
import { generateDemoMockups } from "@/lib/demo/store";

const singleSchema = z.object({
  screenshotPlanId: z.string().cuid().optional(),
  platform: z.enum(["IOS", "ANDROID"]),
  headline: z.string().min(1).max(80),
  subtext: z.string().max(120).optional(),
  backgroundColor: z.string().default("#6C47FF"),
  textColor: z.string().default("#FFFFFF"),
  accentColor: z.string().default("#FFFFFF"),
  screenType: z.enum(["hero", "feature", "social_proof", "cta"]).default("feature"),
  screenOrder: z.number().int().min(1).default(1),
});

const batchSchema = z.object({
  screenshotPlanId: z.string().cuid(),
  platform: z.enum(["IOS", "ANDROID"]).optional(),
  backgroundColor: z.string().default("#6C47FF"),
});

// POST /api/projects/[id]/screenshots/generate
// Body: single screen or { batch: true, screenshotPlanId, platform }
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireApiSession();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    // ── DEMO MODE: return placeholder mockups, no Supabase needed ────────────
    if (isDemoMode) {
      await new Promise((r) => setTimeout(r, 800));
      const result = generateDemoMockups(params.id, body);
      if (!result) return NextResponse.json({ error: "Plan or project not found" }, { status: 404 });
      return NextResponse.json({ success: true, ...result, demo: true });
    }

    const workspace = await getWorkspace(session.user.id);
    if (!workspace) return NextResponse.json({ error: "No workspace" }, { status: 404 });

    const project = await db.project.findFirst({
      where: { id: params.id, workspaceId: workspace.id },
    });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    // ── Batch: generate all screens from a plan ──────────────────────────────
    if (body.batch === true) {
      const parsed = batchSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
      }

      const plan = await db.screenshotPlan.findFirst({
        where: { id: parsed.data.screenshotPlanId, projectId: project.id },
      });
      if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

      const screens = plan.screens as any[];

      const mockups = await Promise.all(
        screens.map(async (screen: any) => {
          const { generateMockupPng } = await import("@/lib/screenshot/generator");
          const pngBuffer = await generateMockupPng({
            platform: parsed.data.platform ?? (plan.platform as "IOS" | "ANDROID"),
            headline: screen.headline,
            subtext: screen.subtext,
            backgroundColor: parsed.data.backgroundColor,
            screenType: screen.screenType ?? "feature",
          });

          const { key, url } = await uploadMockup(pngBuffer, project.id);

          return db.screenshotMockup.create({
            data: {
              projectId: project.id,
              screenshotPlanId: plan.id,
              platform: parsed.data.platform ?? (plan.platform as "IOS" | "ANDROID"),
              screenOrder: screen.order,
              headline: screen.headline,
              subtext: screen.subtext ?? null,
              backgroundColor: parsed.data.backgroundColor,
              storageKey: key,
              storageUrl: url,
              status: "COMPLETED",
            },
          });
        })
      );

      logger.info(`Generated ${mockups.length} mockups for plan ${plan.id}`);
      return NextResponse.json({ data: mockups, count: mockups.length }, { status: 201 });
    }

    // ── Single screen ────────────────────────────────────────────────────────
    const parsed = singleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
    }

    const { generateMockupPng } = await import("@/lib/screenshot/generator");
    const pngBuffer = await generateMockupPng({
      platform: parsed.data.platform,
      headline: parsed.data.headline,
      subtext: parsed.data.subtext,
      backgroundColor: parsed.data.backgroundColor,
      textColor: parsed.data.textColor,
      accentColor: parsed.data.accentColor,
      screenType: parsed.data.screenType,
    });

    const { key, url } = await uploadMockup(pngBuffer, project.id);

    const mockup = await db.screenshotMockup.create({
      data: {
        projectId: project.id,
        screenshotPlanId: parsed.data.screenshotPlanId ?? null,
        platform: parsed.data.platform,
        screenOrder: parsed.data.screenOrder,
        headline: parsed.data.headline,
        subtext: parsed.data.subtext ?? null,
        backgroundColor: parsed.data.backgroundColor,
        textColor: parsed.data.textColor,
        accentColor: parsed.data.accentColor,
        storageKey: key,
        storageUrl: url,
        status: "COMPLETED",
      },
    });

    logger.info(`Generated mockup: ${mockup.id}`);
    return NextResponse.json({ data: mockup }, { status: 201 });
  } catch (error) {
    logger.error(`POST /api/projects/${params.id}/screenshots/generate`, error);
    return NextResponse.json({ error: "Mockup generation failed" }, { status: 500 });
  }
}
