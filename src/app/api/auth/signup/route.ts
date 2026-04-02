import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db/client";
import { signupSchema } from "@/lib/validations/auth";
import { slugify } from "@/lib/utils";
import { logger } from "@/lib/utils/logger";
import { isDemoMode } from "@/lib/demo/mode";
import { updateDemoOnboarding } from "@/lib/demo/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { name, email, password, workspaceName } = parsed.data;

    if (isDemoMode) {
      updateDemoOnboarding(0, false);
      return NextResponse.json({
        message: "Demo account ready",
        userId: "cdemouser00000000000000001",
        demo: true,
      });
    }

    // Check existing user
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user + workspace in transaction
    const result = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          emailVerified: new Date(),
        },
      });

      // Generate unique slug
      let slug = slugify(workspaceName);
      const existing = await tx.workspace.findUnique({ where: { slug } });
      if (existing) slug = `${slug}-${Date.now()}`;

      const workspace = await tx.workspace.create({
        data: {
          name: workspaceName,
          slug,
          plan: "FREE",
          members: {
            create: { userId: user.id, role: "OWNER" },
          },
        },
      });

      return { user, workspace };
    });

    logger.info(`New user registered: ${email}`);
    return NextResponse.json({ message: "Account created", userId: result.user.id });
  } catch (error) {
    logger.error("Signup error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
