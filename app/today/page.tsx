import { redirect } from "next/navigation";

import { AppShell } from "@/components/providers/app-shell";
import { TodayScreen } from "@/components/today/today-screen";
import { getAppBootstrap } from "@/lib/data/app";
import { applyJourneyPreview, parseJourneyPreview } from "@/lib/habit-journey";

export default async function TodayPage({
  searchParams,
}: {
  searchParams?: Promise<{ preview?: string }>;
}) {
  const bootstrap = await getAppBootstrap();
  const resolvedSearchParams = await searchParams;
  const preview = parseJourneyPreview(resolvedSearchParams?.preview);
  const previewedJourney = applyJourneyPreview(
    bootstrap.habitJourneys,
    bootstrap.currentJourneyHabitId,
    preview,
  );

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
        historyLogs={bootstrap.historyLogs}
        habitJourneys={previewedJourney.habitJourneys}
        currentJourneyHabitId={previewedJourney.currentJourneyHabitId}
        canAddSecondHabit={previewedJourney.canAddSecondHabit}
        circleDashboard={bootstrap.circleDashboard}
        receivedSupportDigest={bootstrap.receivedSupportDigest}
        isDemo={bootstrap.isDemo}
      />
    </AppShell>
  );
}
