import { FeedbackGuide } from "@/components/feedback/feedback-guide";
import { AppShell } from "@/components/providers/app-shell";
import { getAppBootstrap } from "@/lib/data/app";

export default async function FeedbackPage() {
  const bootstrap = await getAppBootstrap();

  return (
    <AppShell activeTab="profile" isDemo={bootstrap.isDemo}>
      <FeedbackGuide />
    </AppShell>
  );
}
