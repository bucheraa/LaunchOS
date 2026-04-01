import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { db } from "@/lib/db/client";
import { z } from "zod";

const schema = z.object({
  step: z.number().int().min(0).max(10),
  done: z.boolean().optional(),
});

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

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
