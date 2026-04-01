import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { db } from "@/lib/db/client";
import { getWorkspace } from "@/lib/auth/session";
import {
  analyzeProductInput,
  generateAudienceSegments,
  generateMessagingAngles,
  buildProjectContext,
} from "@/lib/ai/service";
import { logger } from "@/lib/utils/logger";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const workspace = await getWorkspace(session.user.id);
    if (!workspace) return NextResponse.json({ error: "No workspace" }, { status: 404 });

    const project = await db.project.findFirst({
      where: { id: params.id, workspaceId: workspace.id },
    });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const body = await req.json();
    const extraContext = body.additionalContext as string | undefined;

    // Update analysis status to running
    await db.appAnalysis.upsert({
      where: { projectId: project.id },
      update: { analysisStatus: "RUNNING" },
      create: {
        projectId: project.id,
        productSummary: "",
        analysisStatus: "RUNNING",
      },
    });

    // Run AI analysis
    const projectContext = buildProjectContext(project as any);
    const [analysis, segments] = await Promise.all([
      analyzeProductInput(project.description, extraContext),
      generateAudienceSegments(projectContext),
    ]);

    // Generate messaging based on segments
    const segmentsText = segments.map((s) => `${s.name}: ${s.description}`).join("\n");
    const { angles, valueProps } = await generateMessagingAngles(projectContext, segmentsText);

    // Save all results
    await db.$transaction(async (tx) => {
      // Update analysis
      await tx.appAnalysis.upsert({
        where: { projectId: project.id },
        update: {
          productSummary: analysis.productSummary,
          keyDifferentiators: analysis.keyDifferentiators,
          competitorContext: analysis.competitorContext ?? null,
          rawInput: extraContext ?? null,
          analysisStatus: "COMPLETED",
        },
        create: {
          projectId: project.id,
          productSummary: analysis.productSummary,
          keyDifferentiators: analysis.keyDifferentiators,
          competitorContext: analysis.competitorContext ?? null,
          rawInput: extraContext ?? null,
          analysisStatus: "COMPLETED",
        },
      });

      // Delete old segments + angles + valueProps
      await tx.audienceSegment.deleteMany({ where: { projectId: project.id } });
      await tx.messagingAngle.deleteMany({ where: { projectId: project.id } });
      await tx.valueProp.deleteMany({ where: { projectId: project.id } });

      // Create segments
      await tx.audienceSegment.createMany({
        data: segments.map((s) => ({
          projectId: project.id,
          name: s.name,
          description: s.description,
          demographics: s.demographics,
          psychographics: s.psychographics,
          painPoints: s.painPoints,
          goals: s.goals,
          isPrimary: s.isPrimary,
        })),
      });

      // Create messaging angles
      await tx.messagingAngle.createMany({
        data: angles.map((a) => ({
          projectId: project.id,
          angle: a.angle,
          headline: a.headline,
          subheadline: a.subheadline,
          bodyText: a.bodyText,
          tone: a.tone,
        })),
      });

      // Create value props
      await tx.valueProp.createMany({
        data: valueProps.map((vp) => ({
          projectId: project.id,
          headline: vp.headline,
          description: vp.description,
          benefit: vp.benefit,
        })),
      });
    });

    logger.info(`Analysis complete for project: ${project.id}`);
    return NextResponse.json({ message: "Analysis complete" });
  } catch (error) {
    logger.error(`POST /api/projects/${params.id}/analyze`, error);

    // Update analysis to failed
    await db.appAnalysis.updateMany({
      where: { projectId: params.id },
      data: { analysisStatus: "FAILED" },
    }).catch(() => {});

    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
