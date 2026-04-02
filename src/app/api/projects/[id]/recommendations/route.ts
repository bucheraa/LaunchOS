import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { getWorkspace, requireApiSession } from "@/lib/auth/session";
import { generateRecommendations, buildProjectContext } from "@/lib/ai/service";
import { logger } from "@/lib/utils/logger";
import { isDemoMode } from "@/lib/demo/mode";
import { createDemoRecommendations } from "@/lib/demo/store";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireApiSession();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (isDemoMode) {
      const recommendations = await createDemoRecommendations(params.id);
      if (!recommendations) return NextResponse.json({ error: "Project not found" }, { status: 404 });
      return NextResponse.json({ count: recommendations.length }, { status: 201 });
    }

    const workspace = await getWorkspace(session.user.id);
    if (!workspace) return NextResponse.json({ error: "No workspace" }, { status: 404 });

    const project = await db.project.findFirst({
      where: { id: params.id, workspaceId: workspace.id },
      include: {
        analysis: true,
        listingVariants: { take: 2 },
        screenshotPlans: { take: 1 },
      },
    });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const projectContext = buildProjectContext(project as any);
    const contextWithData = `${projectContext}

Analysis Summary: ${project.analysis?.productSummary ?? "Not analyzed yet"}
Store Variants: ${project.listingVariants.length} variants created
Screenshot Plans: ${project.screenshotPlans.length} plans created`;

    const recs = await generateRecommendations(contextWithData);

    await db.recommendation.createMany({
      data: recs.map((r) => ({
        projectId: project.id,
        title: r.title,
        description: r.description,
        category: r.category as any,
        priority: r.priority as any,
        effort: r.effort as any,
        impact: r.impact,
        status: "OPEN",
      })),
    });

    logger.info(`Generated ${recs.length} recommendations for project: ${project.id}`);
    return NextResponse.json({ count: recs.length }, { status: 201 });
  } catch (error) {
    logger.error(`POST /api/projects/${params.id}/recommendations`, error);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
