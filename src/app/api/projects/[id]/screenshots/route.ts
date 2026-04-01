import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { db } from "@/lib/db/client";
import { getWorkspace } from "@/lib/auth/session";
import { generateScreenshotPlan, buildProjectContext } from "@/lib/ai/service";
import { generateScreenshotPlanSchema } from "@/lib/validations/project";
import { logger } from "@/lib/utils/logger";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const workspace = await getWorkspace(session.user.id);
    if (!workspace) return NextResponse.json({ error: "No workspace" }, { status: 404 });

    const project = await db.project.findFirst({
      where: { id: params.id, workspaceId: workspace.id },
      include: { audienceSegments: { where: { isPrimary: true }, take: 1 } },
    });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const body = await req.json();
    const parsed = generateScreenshotPlanSchema.safeParse({
      ...body,
      projectId: params.id,
    });
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
    }

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
