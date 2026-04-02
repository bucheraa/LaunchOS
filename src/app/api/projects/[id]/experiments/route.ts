import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { getWorkspace, requireApiSession } from "@/lib/auth/session";
import { generateExperimentIdeas, buildProjectContext } from "@/lib/ai/service";
import { rateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/utils/logger";
import { isDemoMode } from "@/lib/demo/mode";
import { createDemoExperiments } from "@/lib/demo/store";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireApiSession();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (isDemoMode) {
      const experiments = await createDemoExperiments(params.id);
      if (!experiments) return NextResponse.json({ error: "Project not found" }, { status: 404 });
      return NextResponse.json({ count: experiments.length }, { status: 201 });
    }

    const rl = await rateLimit(`experiments:${session.user.id}`, { max: 20, window: 3600 });
    if (!rl.success) {
      return NextResponse.json({ error: "Rate limit exceeded. Try again later." }, { status: 429 });
    }

    const workspace = await getWorkspace(session.user.id);
    if (!workspace) return NextResponse.json({ error: "No workspace" }, { status: 404 });

    const project = await db.project.findFirst({
      where: { id: params.id, workspaceId: workspace.id },
      include: { listingVariants: { take: 3 } },
    });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const projectContext = buildProjectContext(project as any);
    const existingVariants =
      project.listingVariants.length > 0
        ? project.listingVariants.map((v) => v.variantName).join(", ")
        : undefined;

    const ideas = await generateExperimentIdeas(projectContext, existingVariants);

    const experiments = await db.experiment.createMany({
      data: ideas.map((idea) => ({
        projectId: project.id,
        name: idea.name,
        hypothesis: idea.hypothesis,
        elements: idea.elements,
        targetMetric: idea.targetMetric,
        priority: idea.priority,
        expectedImpact: idea.expectedImpact,
        status: "PLANNED",
      })),
    });

    logger.info(`Generated ${ideas.length} experiments for project: ${project.id}`);
    return NextResponse.json({ count: ideas.length }, { status: 201 });
  } catch (error) {
    logger.error(`POST /api/projects/${params.id}/experiments`, error);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
