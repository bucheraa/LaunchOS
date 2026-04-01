import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { db } from "@/lib/db/client";
import { getWorkspace } from "@/lib/auth/session";
import {
  searchIosCompetitors,
  searchAndroidCompetitors,
  saveCompetitors,
} from "@/lib/integrations/competitors/service";
import { logger } from "@/lib/utils/logger";
import { z } from "zod";

const schema = z.object({
  query: z.string().min(2).max(100),
  platform: z.enum(["IOS", "ANDROID"]),
  country: z.string().default("us"),
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

    const { query, platform, country } = parsed.data;

    const competitors =
      platform === "IOS"
        ? await searchIosCompetitors(query, country)
        : await searchAndroidCompetitors(query, country);

    if (competitors.length > 0) {
      await saveCompetitors(project.id, platform, competitors);
    }

    logger.info(`Found ${competitors.length} competitors for "${query}" [${platform}]`);
    return NextResponse.json({ data: competitors, count: competitors.length });
  } catch (error) {
    logger.error(`POST /api/projects/${params.id}/competitors`, error);
    return NextResponse.json({ error: "Competitor search failed" }, { status: 500 });
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

    const competitors = await db.competitorApp.findMany({
      where: {
        projectId: params.id,
        ...(platform ? { platform: platform as any } : {}),
      },
      orderBy: [{ ratingCount: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ data: competitors });
  } catch (error) {
    logger.error(`GET /api/projects/${params.id}/competitors`, error);
    return NextResponse.json({ error: "Failed to fetch competitors" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const workspace = await getWorkspace(session.user.id);
    if (!workspace) return NextResponse.json({ error: "No workspace" }, { status: 404 });

    const url = new URL(req.url);
    const appId = url.searchParams.get("appId");
    const platform = url.searchParams.get("platform");

    if (!appId || !platform) {
      return NextResponse.json({ error: "appId and platform required" }, { status: 400 });
    }

    await db.competitorApp.deleteMany({
      where: { projectId: params.id, appId, platform: platform as any },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error(`DELETE /api/projects/${params.id}/competitors`, error);
    return NextResponse.json({ error: "Failed to delete competitor" }, { status: 500 });
  }
}
