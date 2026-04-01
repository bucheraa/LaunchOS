import { getServerSession } from "next-auth";
import { authOptions } from "./options";
import { db } from "@/lib/db/client";
import { redirect } from "next/navigation";

export async function getSession() {
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
  const member = await db.workspaceMember.findFirst({
    where: { userId },
    include: {
      workspace: true,
    },
    orderBy: { createdAt: "asc" },
  });
  return member?.workspace ?? null;
}
