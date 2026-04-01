import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { db } from "@/lib/db/client";
import { getWorkspace } from "@/lib/auth/session";
import { updateRecommendationStatusSchema } from "@/lib/validations/project";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; recId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspace = await getWorkspace(session.user.id);
  if (!workspace) return NextResponse.json({ error: "No workspace" }, { status: 404 });

  const body = await req.json();
  const parsed = updateRecommendationStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

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
