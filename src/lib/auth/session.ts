import { getServerSession } from "next-auth";
import { authOptions } from "./options";
import { db } from "@/lib/db/client";
import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/demo/mode";
import { getDemoSession, getDemoUser, getDemoWorkspace } from "@/lib/demo/store";

export async function getSession() {
  if (isDemoMode) {
    return getDemoSession();
  }
  return await getServerSession(authOptions);
}

export async function requireAuth() {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return session;
}

export async function getCurrentUser() {
  if (isDemoMode) {
    return getDemoUser();
  }

  const session = await getSession();
  if (!session?.user?.id) return null;

  return db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
    },
  });
}

export async function getWorkspace(userId: string) {
  if (isDemoMode && userId === getDemoSession().user.id) {
    return getDemoWorkspace();
  }

  const member = await db.workspaceMember.findFirst({
    where: { userId },
    include: {
      workspace: true,
    },
    orderBy: { createdAt: "asc" },
  });
  return member?.workspace ?? null;
}

export async function requireApiSession() {
  const session = await getSession();
  if (!session?.user?.id) return null;
  return session;
}
