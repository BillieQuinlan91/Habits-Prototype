import { redirect } from "next/navigation";

import { AppShell } from "@/components/providers/app-shell";
import { ProfileScreen } from "@/components/profile/profile-screen";
import { getAppBootstrap } from "@/lib/data/app";

export default async function ProfilePage() {
  const bootstrap = await getAppBootstrap();

  if (!bootstrap.profile && !bootstrap.isDemo) {
    redirect("/auth");
  }

  return (
    <AppShell activeTab="profile" isDemo={bootstrap.isDemo}>
      <ProfileScreen
        profile={bootstrap.profile}
        habits={bootstrap.habits}
        integrations={bootstrap.integrationInterests}
        preferences={bootstrap.notificationPreferences}
        isDemo={bootstrap.isDemo}
      />
    </AppShell>
  );
}
