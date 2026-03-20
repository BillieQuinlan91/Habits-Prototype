import { redirect } from "next/navigation";

import { AppShell } from "@/components/providers/app-shell";
import { TribeScreen } from "@/components/tribe/tribe-screen";
import { getAppBootstrap } from "@/lib/data/app";

export default async function TribePage() {
  const bootstrap = await getAppBootstrap();

  if (!bootstrap.profile && !bootstrap.isDemo) {
    redirect("/auth");
  }

  return (
    <AppShell activeTab="tribe" isDemo={bootstrap.isDemo} showFeedbackLink>
      <TribeScreen
        leaderboard={bootstrap.leaderboard}
        rankings={bootstrap.organizationRankings}
      />
    </AppShell>
  );
}
