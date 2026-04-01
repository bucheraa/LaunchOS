import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { db } from "@/lib/db/client";
import { getWorkspace } from "@/lib/auth/session";
import { updateExperimentStatusSchema } from "@/lib/validations/project";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; expId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspace = await getWorkspace(session.user.id);
  if (!workspace) return NextResponse.json({ error: "No workspace" }, { status: 404 });

  const body = await req.json();
  const parsed = updateExperimentStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const exp = await db.experiment.findFirst({
    where: { id: params.expId, projectId: params.id },
    include: { project: { select: { workspaceId: true } } },
  });
  if (!exp || exp.project.workspaceId !== workspace.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await db.experiment.update({
    where: { id: params.expId },
    data: {
      status: parsed.data.status,
      result: parsed.data.result ?? undefined,
      startDate: parsed.data.status === "RUNNING" ? new Date() : undefined,
      endDate:
        ["COMPLETED", "CANCELLED"].includes(parsed.data.status) ? new Date() : undefined,
    },
  });

  return NextResponse.json(updated);
}
