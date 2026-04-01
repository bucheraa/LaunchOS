import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { db } from "@/lib/db/client";
import { getWorkspace } from "@/lib/auth/session";
import { generateStoreCopy, buildProjectContext } from "@/lib/ai/service";
import { generateStoreCopySchema } from "@/lib/validations/project";
import { logger } from "@/lib/utils/logger";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const workspace = await getWorkspace(session.user.id);
    if (!workspace) return NextResponse.json({ error: "No workspace" }, { status: 404 });

    const project = await db.project.findFirst({
      where: { id: params.id, workspaceId: workspace.id },
      include: {
        audienceSegments: true,
        messagingAngles: { take: 1 },
      },
    });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const body = await req.json();
    const parsed = generateStoreCopySchema.safeParse({ ...body, projectId: params.id });
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
    }

    const { platform, locale, audienceSegmentId, variantName } = parsed.data;

    const projectContext = buildProjectContext(project as any);

    let audienceContext: string | undefined;
    if (audienceSegmentId) {
      const seg = project.audienceSegments.find((s) => s.id === audienceSegmentId);
      if (seg) {
        audienceContext = `${seg.name}: ${seg.description}\nPain points: ${seg.painPoints.join(", ")}\nGoals: ${seg.goals.join(", ")}`;
      }
    }

    const messagingContext = project.messagingAngles[0]
      ? `${project.messagingAngles[0].headline}: ${project.messagingAngles[0].bodyText}`
      : undefined;

    const platformLower = platform.toLowerCase() as "ios" | "android";
    const result = await generateStoreCopy(
      projectContext,
      platformLower,
      locale,
      audienceContext,
      messagingContext
    );

    const copy = platformLower === "ios" ? result.ios! : result.android!;

    // Map result fields
    const variantData =
      platformLower === "ios"
        ? {
            appName: (copy as any).appName,
            subtitle: (copy as any).subtitle,
            promotionalText: (copy as any).promotionalText,
            description: (copy as any).description,
            keywords: (copy as any).keywords ?? [],
          }
        : {
            appName: (copy as any).title,
            shortDescription: (copy as any).shortDescription,
            description: (copy as any).description,
            keywords: (copy as any).keywords ?? [],
          };

    const variant = await db.listingVariant.create({
      data: {
        projectId: project.id,
        audienceSegmentId: audienceSegmentId ?? null,
        platform,
        locale,
        variantName,
        status: "DRAFT",
        isControl: false,
        ...variantData,
      },
    });

    logger.info(`Store copy generated: ${variant.id}`);
    return NextResponse.json(variant, { status: 201 });
  } catch (error) {
    logger.error(`POST /api/projects/${params.id}/store-copy`, error);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
