import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { isDemoMode } from "@/lib/demo/mode";
import { getDemoOnboardingState } from "@/lib/demo/store";

export const metadata = { title: "Get Started" };

export default async function OnboardingPage() {
  const session = await requireAuth();

  const user = isDemoMode
    ? getDemoOnboardingState()
    : await db.user.findUnique({
        where: { id: session.user.id! },
        select: { onboardingDone: true, onboardingStep: true },
      });

  if (user?.onboardingDone) redirect("/dashboard");

  return <OnboardingWizard initialStep={user?.onboardingStep ?? 0} />;
}
