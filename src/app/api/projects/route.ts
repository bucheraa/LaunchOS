import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { db } from "@/lib/db/client";
import { getWorkspace } from "@/lib/auth/session";
import { createProjectSchema } from "@/lib/validations/project";
import { logger } from "@/lib/utils/logger";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const workspace = await getWorkspace(session.user.id);
    if (!workspace) return NextResponse.json({ error: "No workspace" }, { status: 404 });

    const projects = await db.project.findMany({
      where: { workspaceId: workspace.id },
      include: { _count: { select: { listingVariants: true, experiments: true } } },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ data: projects });
  } catch (error) {
    logger.error("GET /api/projects", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const workspace = await getWorkspace(session.user.id);
    if (!workspace) return NextResponse.json({ error: "No workspace" }, { status: 404 });

    const body = await req.json();
    const parsed = createProjectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
    }

    const {
      landingPageUrl, appStoreUrl, playStoreUrl, ...rest
    } = parsed.data;

    const project = await db.project.create({
      data: {
        ...rest,
        workspaceId: workspace.id,
        landingPageUrl: landingPageUrl || null,
        appStoreUrl: appStoreUrl || null,
        playStoreUrl: playStoreUrl || null,
      },
    });

    logger.info(`Project created: ${project.id}`);
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    logger.error("POST /api/projects", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
