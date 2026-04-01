import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { db } from "@/lib/db/client";
import { getWorkspace } from "@/lib/auth/session";
import { researchKeywords } from "@/lib/integrations/keywords/service";
import { logger } from "@/lib/utils/logger";
import { z } from "zod";

const schema = z.object({
  platform: z.enum(["IOS", "ANDROID"]),
  locale: z.string().default("en"),
  seedKeywords: z.array(z.string()).min(1).max(10),
  appId: z.string().optional(),
});

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
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
    }

    const keywords = await researchKeywords(
      project.id,
      parsed.data.platform,
      parsed.data.locale,
      parsed.data.seedKeywords,
      parsed.data.appId
    );

    return NextResponse.json({ data: keywords, count: keywords.length });
  } catch (error) {
    logger.error(`POST /api/projects/${params.id}/keywords`, error);
    return NextResponse.json({ error: "Keyword research failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const workspace = await getWorkspace(session.user.id);
    if (!workspace) return NextResponse.json({ error: "No workspace" }, { status: 404 });

    const url = new URL(req.url);
    const platform = url.searchParams.get("platform");
    const locale = url.searchParams.get("locale") ?? "en";

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

    return NextResponse.json({ data: sets[0] ?? null });
  } catch (error) {
    logger.error(`GET /api/projects/${params.id}/keywords`, error);
    return NextResponse.json({ error: "Failed to fetch keywords" }, { status: 500 });
  }
}
