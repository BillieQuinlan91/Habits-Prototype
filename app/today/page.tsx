import { redirect } from "next/navigation";

import { AppShell } from "@/components/providers/app-shell";
import { TodayScreen } from "@/components/today/today-screen";
import { getAppBootstrap } from "@/lib/data/app";

export default async function TodayPage() {
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
    <AppShell activeTab="today" isDemo={bootstrap.isDemo} showFeedbackLink>
      <TodayScreen
        profile={bootstrap.profile}
        habits={bootstrap.habits}
        weekLogs={bootstrap.weekLogs}
        isDemo={bootstrap.isDemo}
      />
    </AppShell>
  );
}
