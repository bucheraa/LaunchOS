import { redirect } from "next/navigation";
import { requireAuth, getWorkspace } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { Sidebar } from "@/components/layout/sidebar";
import { isDemoMode } from "@/lib/demo/mode";
import { getDemoOnboardingState } from "@/lib/demo/store";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();
  const workspace = await getWorkspace(session.user.id!);

  if (!workspace) {
    redirect("/login");
  }

  if (isDemoMode) {
    const onboarding = getDemoOnboardingState();
    if (!onboarding.onboardingDone) {
      redirect("/onboarding");
    }

    return (
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar
          user={session.user}
          workspaceName={workspace.name}
          plan={workspace.plan}
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto scrollbar-thin">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // Gate: redirect new users to onboarding before they can access the dashboard
  const user = await db.user.findUnique({
    where: { id: session.user.id! },
    select: { onboardingDone: true },
  });
  if (user && !user.onboardingDone) {
    redirect("/onboarding");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        user={session.user}
        workspaceName={workspace.name}
        plan={workspace.plan}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
}
