import { redirect } from "next/navigation";

import { AppShell } from "@/components/providers/app-shell";
import { JourneyScreen } from "@/components/journey/journey-screen";
import { getAppBootstrap } from "@/lib/data/app";
import { applyJourneyPreview, parseJourneyPreview } from "@/lib/habit-journey";

export default async function JourneyPage({
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
    <AppShell activeTab="journey" isDemo={bootstrap.isDemo} showFeedbackLink>
      <JourneyScreen
        habitJourneys={previewedJourney.habitJourneys}
        currentJourneyHabitId={previewedJourney.currentJourneyHabitId}
        preview={preview}
      />
    </AppShell>
  );
}
