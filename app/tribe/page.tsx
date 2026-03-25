import { redirect } from "next/navigation";

import { AppShell } from "@/components/providers/app-shell";
import { TribeScreen } from "@/components/tribe/tribe-screen";
import { getAppBootstrap } from "@/lib/data/app";

export default async function TribePage() {
  const bootstrap = await getAppBootstrap();

  if (!bootstrap.profile && !bootstrap.isDemo) {
    redirect("/auth");
  }

  if (
    !bootstrap.isDemo &&
    bootstrap.profile &&
    (!bootstrap.profile.tribe_id || bootstrap.habits.length === 0 || !bootstrap.profile.onboarding_completed_at)
  ) {
    redirect("/onboarding");
  }

  return (
    <AppShell activeTab="tribe" isDemo={bootstrap.isDemo} showFeedbackLink>
      <TribeScreen circleDashboard={bootstrap.circleDashboard} />
    </AppShell>
  );
}
