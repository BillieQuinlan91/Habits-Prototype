import { redirect } from "next/navigation";

import { AppShell } from "@/components/providers/app-shell";
import { JourneyScreen } from "@/components/journey/journey-screen";
import { getAppBootstrap } from "@/lib/data/app";

export default async function JourneyPage() {
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
    <AppShell activeTab="journey" isDemo={bootstrap.isDemo} showFeedbackLink>
      <JourneyScreen
        habitJourneys={bootstrap.habitJourneys}
        currentJourneyHabitId={bootstrap.currentJourneyHabitId}
      />
    </AppShell>
  );
}
