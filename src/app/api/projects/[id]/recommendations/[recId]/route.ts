import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { getWorkspace, requireApiSession } from "@/lib/auth/session";
import { updateRecommendationStatusSchema } from "@/lib/validations/project";
import { isDemoMode } from "@/lib/demo/mode";
import { updateDemoRecommendation } from "@/lib/demo/store";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; recId: string } }
) {
  const session = await requireApiSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = updateRecommendationStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  if (isDemoMode) {
    const updated = updateDemoRecommendation(params.id, params.recId, parsed.data.status);
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  }

  const workspace = await getWorkspace(session.user.id);
  if (!workspace) return NextResponse.json({ error: "No workspace" }, { status: 404 });

  const rec = await db.recommendation.findFirst({
    where: { id: params.recId, projectId: params.id },
    include: { project: { select: { workspaceId: true } } },
  });
  if (!rec || rec.project.workspaceId !== workspace.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await db.recommendation.update({
    where: { id: params.recId },
    data: { status: parsed.data.status },
  });

  return NextResponse.json(updated);
}
