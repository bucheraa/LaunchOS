import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { getWorkspace, requireApiSession } from "@/lib/auth/session";
import { generateScreenshotPlan, buildProjectContext } from "@/lib/ai/service";
import { generateScreenshotPlanSchema } from "@/lib/validations/project";
import { logger } from "@/lib/utils/logger";
import { isDemoMode } from "@/lib/demo/mode";
import { createDemoScreenshotPlan } from "@/lib/demo/store";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireApiSession();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = generateScreenshotPlanSchema.safeParse({
      ...body,
      projectId: params.id,
    });
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
    }

    if (isDemoMode) {
      const plan = await createDemoScreenshotPlan(params.id, parsed.data);
      if (!plan) return NextResponse.json({ error: "Project not found" }, { status: 404 });
      return NextResponse.json(plan, { status: 201 });
    }

    const workspace = await getWorkspace(session.user.id);
    if (!workspace) return NextResponse.json({ error: "No workspace" }, { status: 404 });

    const project = await db.project.findFirst({
      where: { id: params.id, workspaceId: workspace.id },
      include: { audienceSegments: { where: { isPrimary: true }, take: 1 } },
    });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const { platform, locale, planName } = parsed.data;
    const projectContext = buildProjectContext(project as any);

    const primarySeg = project.audienceSegments[0];
    const audienceContext = primarySeg
      ? `${primarySeg.name}: ${primarySeg.description}`
      : undefined;

    const screens = await generateScreenshotPlan(
      projectContext,
      platform.toLowerCase() as "ios" | "android",
      audienceContext
    );

    const plan = await db.screenshotPlan.create({
      data: {
        projectId: project.id,
        platform,
        locale,
        name: planName,
        screens: screens as any,
        status: "COMPLETED",
      },
    });

    logger.info(`Screenshot plan generated: ${plan.id}`);
    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    logger.error(`POST /api/projects/${params.id}/screenshots`, error);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
