import { redirect } from "next/navigation";

import { getAppBootstrap } from "@/lib/data/app";

export default async function HomePage() {
  const bootstrap = await getAppBootstrap();

  if (bootstrap.isDemo) {
    redirect("/today");
  }

  if (!bootstrap.profile) {
    redirect("/auth");
  }

  if (!bootstrap.profile.tribe_id || bootstrap.habits.length === 0) {
    redirect("/onboarding");
  }

  redirect("/today");
}
