import { Bell, Cable, LogOut, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { signOutAction } from "@/lib/data/actions";
import { IntegrationInterest, NotificationPreference, Profile, UserHabit } from "@/lib/types";

export function ProfileScreen({
  profile,
  habits,
  integrations,
  preferences,
}: {
  profile: Profile | null;
  habits: UserHabit[];
  integrations: IntegrationInterest[];
  preferences: NotificationPreference | null;
}) {
  return (
    <div className="space-y-5">
      <Card className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-foreground/40">Profile</p>
          <h2 className="font-display text-3xl font-semibold tracking-tight">
            {profile?.full_name ?? "Your profile"}
          </h2>
          <p className="mt-2 text-sm text-foreground/58">{profile?.email}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {profile?.tribe?.name ? <Badge>{profile.tribe.name}</Badge> : null}
          {profile?.organization?.name ? <Badge>{profile.organization.name}</Badge> : null}
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-accent" />
          <p className="font-medium">Habits</p>
        </div>
        <div className="space-y-3">
          {habits.map((habit) => (
            <div key={habit.id} className="flex items-center justify-between rounded-2xl border border-border/70 p-3">
              <div>
                <p className="font-medium">{habit.name}</p>
                <p className="text-sm text-foreground/48">
                  {habit.type === "binary"
                    ? "Daily binary"
                    : `${habit.target_value} ${habit.target_unit}`}
                </p>
              </div>
              <Button variant="ghost" type="button">
                Edit
              </Button>
            </div>
          ))}
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="flex items-center gap-2">
          <Cable className="h-4 w-4 text-accent" />
          <p className="font-medium">Integrations coming soon</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {integrations.length ? integrations.map((item) => <Badge key={item.id}>{item.integration_name}</Badge>) : <p className="text-sm text-foreground/48">No selections yet.</p>}
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-accent" />
          <p className="font-medium">Notifications</p>
        </div>
        <div className="space-y-3 text-sm text-foreground/58">
          <p>Daily reminder: {preferences?.daily_enabled ? `On at ${preferences.daily_time?.slice(0, 5)}` : "Off"}</p>
          <p>Sunday tribe reminder: {preferences?.sunday_enabled ? "On" : "Off"}</p>
          <p>Email reminder hooks are scaffolded for a future cron or edge-function pass.</p>
        </div>
      </Card>

      <form action={signOutAction}>
        <Button variant="secondary" className="w-full">
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </form>
    </div>
  );
}
