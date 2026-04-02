import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { getWorkspace, requireApiSession } from "@/lib/auth/session";
import { z } from "zod";
import { isDemoMode } from "@/lib/demo/mode";
import { deleteDemoExperiment, updateDemoExperiment } from "@/lib/demo/store";

const schema = z.object({
  status: z.enum(["PLANNED", "RUNNING", "PAUSED", "COMPLETED", "CANCELLED"]).optional(),
  result: z.string().max(2000).optional(),
  baselineValue: z.number().optional(),
  resultValue: z.number().optional(),
  sampleSize: z.number().int().optional(),
  confidence: z.number().min(0).max(100).optional(),
  winner: z.enum(["A", "B", "inconclusive"]).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; expId: string } }
) {
  const session = await requireApiSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
  }

  if (isDemoMode) {
    const updated = updateDemoExperiment(params.id, params.expId, parsed.data);
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  }

  const workspace = await getWorkspace(session.user.id);
  if (!workspace) return NextResponse.json({ error: "No workspace" }, { status: 404 });

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
      ...(parsed.data.status ? { status: parsed.data.status } : {}),
      ...(parsed.data.result !== undefined ? { result: parsed.data.result } : {}),
      ...(parsed.data.baselineValue !== undefined ? { baselineValue: parsed.data.baselineValue } : {}),
      ...(parsed.data.resultValue !== undefined ? { resultValue: parsed.data.resultValue } : {}),
      ...(parsed.data.sampleSize !== undefined ? { sampleSize: parsed.data.sampleSize } : {}),
      ...(parsed.data.confidence !== undefined ? { confidence: parsed.data.confidence } : {}),
      ...(parsed.data.winner !== undefined ? { winner: parsed.data.winner } : {}),
      ...(parsed.data.status === "RUNNING" ? { startDate: new Date() } : {}),
      ...(["COMPLETED", "CANCELLED"].includes(parsed.data.status ?? "")
        ? { endDate: new Date() }
        : {}),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; expId: string } }
) {
  const session = await requireApiSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (isDemoMode) {
    const deleted = deleteDemoExperiment(params.id, params.expId);
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  }

  const workspace = await getWorkspace(session.user.id);
  if (!workspace) return NextResponse.json({ error: "No workspace" }, { status: 404 });

  const exp = await db.experiment.findFirst({
    where: { id: params.expId, projectId: params.id },
    include: { project: { select: { workspaceId: true } } },
  });
  if (!exp || exp.project.workspaceId !== workspace.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.experiment.delete({ where: { id: params.expId } });
  return NextResponse.json({ success: true });
}
