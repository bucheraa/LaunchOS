import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { getWorkspace, requireApiSession } from "@/lib/auth/session";
import { researchKeywords } from "@/lib/integrations/keywords/service";
import { logger } from "@/lib/utils/logger";
import { z } from "zod";
import { isDemoMode } from "@/lib/demo/mode";
import {
  createDemoKeywordSet,
  getDemoProject,
  getLatestDemoKeywordSet,
} from "@/lib/demo/store";

const schema = z.object({
  platform: z.enum(["IOS", "ANDROID"]),
  locale: z.string().default("en"),
  seedKeywords: z.array(z.string()).max(10).optional(),
  appId: z.string().optional(),
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

    if (isDemoMode) {
      const project = getDemoProject(params.id);
      if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

      const seedKeywords =
        parsed.data.seedKeywords?.length
          ? parsed.data.seedKeywords
          : [project.name, ...(project.mainFeatures ?? []).slice(0, 3)];
      const keywordSet = createDemoKeywordSet(params.id, {
        platform: parsed.data.platform,
        locale: parsed.data.locale,
        seedKeywords,
      });
      if (!keywordSet) return NextResponse.json({ error: "Project not found" }, { status: 404 });

      return NextResponse.json({ keywordSet, count: keywordSet.keywords.length });
    }

    const workspace = await getWorkspace(session.user.id);
    if (!workspace) return NextResponse.json({ error: "No workspace" }, { status: 404 });

    const project = await db.project.findFirst({
      where: { id: params.id, workspaceId: workspace.id },
    });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const seedKeywords =
      parsed.data.seedKeywords?.length
        ? parsed.data.seedKeywords
        : [project.name, ...(project.mainFeatures ?? []).slice(0, 3)];

    const keywords = await researchKeywords(
      project.id,
      parsed.data.platform,
      parsed.data.locale,
      seedKeywords,
      parsed.data.appId
    );

    const keywordSet = await db.keywordSet.findFirst({
      where: {
        projectId: params.id,
        platform: parsed.data.platform,
        locale: parsed.data.locale,
      },
      include: {
        keywords: { orderBy: [{ searchVolume: "desc" }, { difficulty: "asc" }] },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ keywordSet, count: keywords.length });
  } catch (error) {
    logger.error(`POST /api/projects/${params.id}/keywords`, error);
    return NextResponse.json({ error: "Keyword research failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireApiSession();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const platform = url.searchParams.get("platform");
    const locale = url.searchParams.get("locale") ?? "en";

    if (isDemoMode) {
      const keywordSet = getLatestDemoKeywordSet(params.id, platform ?? undefined, locale);
      return NextResponse.json({ keywordSet });
    }

    const workspace = await getWorkspace(session.user.id);
    if (!workspace) return NextResponse.json({ error: "No workspace" }, { status: 404 });

    const sets = await db.keywordSet.findMany({
      where: {
        projectId: params.id,
        ...(platform ? { platform: platform as any } : {}),
        locale,
      },
      include: {
        keywords: { orderBy: [{ searchVolume: "desc" }, { difficulty: "asc" }] },
      },
      orderBy: { createdAt: "desc" },
      take: 1,
    });

    return NextResponse.json({ keywordSet: sets[0] ?? null });
  } catch (error) {
    logger.error(`GET /api/projects/${params.id}/keywords`, error);
    return NextResponse.json({ error: "Failed to fetch keywords" }, { status: 500 });
  }
}
