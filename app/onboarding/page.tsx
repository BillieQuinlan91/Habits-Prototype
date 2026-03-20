import { redirect } from "next/navigation";

import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { AppShell } from "@/components/providers/app-shell";
import { getAppBootstrap } from "@/lib/data/app";

export default async function OnboardingPage() {
  const bootstrap = await getAppBootstrap();

  if (!bootstrap.profile && !bootstrap.isDemo) {
    redirect("/auth");
  }

  if (!bootstrap.isDemo && bootstrap.profile?.tribe_id && bootstrap.habits.length > 0) {
    redirect("/today");
  }

  return (
    <AppShell activeTab="today" isDemo={bootstrap.isDemo} showFeedbackLink>
      <OnboardingFlow
        tribes={bootstrap.tribes}
        templates={bootstrap.templates}
        organizations={bootstrap.organizations}
      />
    </AppShell>
  );
}
