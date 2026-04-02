import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { getWorkspace, requireApiSession } from "@/lib/auth/session";
import {
  searchIosCompetitors,
  searchAndroidCompetitors,
  saveCompetitors,
} from "@/lib/integrations/competitors/service";
import { logger } from "@/lib/utils/logger";
import { z } from "zod";
import { isDemoMode } from "@/lib/demo/mode";
import {
  deleteDemoCompetitor,
  getDemoCompetitors,
  searchDemoCompetitors,
} from "@/lib/demo/store";

const schema = z.object({
  query: z.string().min(2).max(100).optional(),
  searchTerm: z.string().min(2).max(100).optional(),
  platform: z.enum(["IOS", "ANDROID"]),
  country: z.string().default("us"),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireApiSession();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
    }

    const query = parsed.data.query ?? parsed.data.searchTerm ?? "";
    const { platform, country } = parsed.data;

    if (isDemoMode) {
      const competitors = searchDemoCompetitors(params.id, { platform, query });
      if (!competitors) return NextResponse.json({ error: "Project not found" }, { status: 404 });
      logger.info(`Found ${competitors.length} demo competitors for "${query}" [${platform}]`);
      return NextResponse.json({ competitors, count: competitors.length });
    }

    const workspace = await getWorkspace(session.user.id);
    if (!workspace) return NextResponse.json({ error: "No workspace" }, { status: 404 });

    const project = await db.project.findFirst({
      where: { id: params.id, workspaceId: workspace.id },
    });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const competitors =
      platform === "IOS"
        ? await searchIosCompetitors(query, country)
        : await searchAndroidCompetitors(query, country);

    if (competitors.length > 0) {
      await saveCompetitors(project.id, platform, competitors);
    }

    logger.info(`Found ${competitors.length} competitors for "${query}" [${platform}]`);
    return NextResponse.json({ competitors, count: competitors.length });
  } catch (error) {
    logger.error(`POST /api/projects/${params.id}/competitors`, error);
    return NextResponse.json({ error: "Competitor search failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireApiSession();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const platform = url.searchParams.get("platform");

    if (isDemoMode) {
      return NextResponse.json({ competitors: getDemoCompetitors(params.id, platform ?? undefined) });
    }

    const workspace = await getWorkspace(session.user.id);
    if (!workspace) return NextResponse.json({ error: "No workspace" }, { status: 404 });

    const competitors = await db.competitorApp.findMany({
      where: {
        projectId: params.id,
        ...(platform ? { platform: platform as any } : {}),
      },
      orderBy: [{ ratingCount: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ competitors });
  } catch (error) {
    logger.error(`GET /api/projects/${params.id}/competitors`, error);
    return NextResponse.json({ error: "Failed to fetch competitors" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireApiSession();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const competitorId = url.searchParams.get("competitorId");
    const appId = url.searchParams.get("appId");
    const platform = url.searchParams.get("platform");

    if (isDemoMode) {
      const deleted = deleteDemoCompetitor(params.id, {
        competitorId: competitorId ?? undefined,
        appId: appId ?? undefined,
        platform: platform ?? undefined,
      });
      if (!deleted) return NextResponse.json({ error: "Competitor not found" }, { status: 404 });
      return NextResponse.json({ success: true });
    }

    const workspace = await getWorkspace(session.user.id);
    if (!workspace) return NextResponse.json({ error: "No workspace" }, { status: 404 });

    if (!competitorId && (!appId || !platform)) {
      return NextResponse.json({ error: "competitorId or appId + platform required" }, { status: 400 });
    }

    if (competitorId) {
      await db.competitorApp.deleteMany({
        where: { projectId: params.id, id: competitorId },
      });
    } else {
      await db.competitorApp.deleteMany({
        where: { projectId: params.id, appId, platform: platform as any },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error(`DELETE /api/projects/${params.id}/competitors`, error);
    return NextResponse.json({ error: "Failed to delete competitor" }, { status: 500 });
  }
}
