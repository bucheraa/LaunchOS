import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { z } from "zod";
import { requireApiSession } from "@/lib/auth/session";
import { isDemoMode } from "@/lib/demo/mode";
import { updateDemoOnboarding } from "@/lib/demo/store";

const schema = z.object({
  step: z.number().int().min(0).max(10),
  done: z.boolean().optional(),
});

export async function PATCH(req: NextRequest) {
  const session = await requireApiSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  if (isDemoMode) {
    const user = updateDemoOnboarding(parsed.data.step, parsed.data.done ?? false);
    return NextResponse.json({ data: user });
  }

  const user = await db.user.update({
    where: { id: session.user.id },
    data: {
      onboardingStep: parsed.data.step,
      ...(parsed.data.done ? { onboardingDone: true } : {}),
    },
    select: { onboardingStep: true, onboardingDone: true },
  });

  return NextResponse.json({ data: user });
}
