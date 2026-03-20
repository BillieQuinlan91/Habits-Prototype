import { redirect } from "next/navigation";

import { AuthScreen } from "@/components/auth/auth-screen";
import { getAppBootstrap } from "@/lib/data/app";

export default async function AuthPage() {
  const bootstrap = await getAppBootstrap();

  if (bootstrap.profile) {
    redirect("/today");
  }

  return <AuthScreen />;
}
