import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { db } from "@/lib/db/client";
import { getWorkspace } from "@/lib/auth/session";
import { generateExperimentIdeas, buildProjectContext } from "@/lib/ai/service";
import { logger } from "@/lib/utils/logger";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
