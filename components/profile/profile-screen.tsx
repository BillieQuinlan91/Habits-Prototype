"use client";

import { useState, useTransition } from "react";
import { Bell, Cable, LogOut, Trash2, Users } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { signOutAction } from "@/lib/data/actions";
import { IntegrationInterest, NotificationPreference, Profile, UserHabit } from "@/lib/types";
import { hasSupabaseEnv, isForcedDemoMode } from "@/lib/supabase/env";

export function ProfileScreen({
  profile,
  habits,
  integrations,
  preferences,
  isDemo = false,
}: {
  profile: Profile | null;
  habits: UserHabit[];
  integrations: IntegrationInterest[];
  preferences: NotificationPreference | null;
  isDemo?: boolean;
}) {
  const router = useRouter();
  const [habitItems, setHabitItems] = useState(habits);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Partial<UserHabit>>>({});
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function startEditing(habit: UserHabit) {
    setEditingHabitId(habit.id);
    setDrafts((current) => ({
      ...current,
      [habit.id]: {
        name: habit.name,
        type: habit.type,
        target_value: habit.target_value,
        target_unit: habit.target_unit,
      },
    }));
  }

  function cancelEditing(habitId: string) {
    setEditingHabitId((current) => (current === habitId ? null : current));
    setDrafts((current) => {
      const next = { ...current };
      delete next[habitId];
      return next;
    });
    setError(null);
  }

  async function saveHabit(habitId: string) {
    const draft = drafts[habitId];
    if (!draft?.name?.trim()) {
      setError("Habit name is required.");
      return;
    }

    const nextHabit = habitItems.find((habit) => habit.id === habitId);
    if (!nextHabit) {
      return;
    }

    const updatedHabit: UserHabit = {
      ...nextHabit,
      name: draft.name.trim(),
      type: draft.type ?? nextHabit.type,
      target_value:
        (draft.type ?? nextHabit.type) === "binary"
          ? null
          : draft.target_value === null || draft.target_value === undefined
            ? nextHabit.target_value
            : Number(draft.target_value),
      target_unit:
        (draft.type ?? nextHabit.type) === "binary"
          ? null
          : draft.target_unit?.trim() || nextHabit.target_unit,
    };

    setError(null);
    setHabitItems((current) =>
      current.map((habit) => (habit.id === habitId ? updatedHabit : habit)),
    );
    setEditingHabitId(null);

    if (isDemo || isForcedDemoMode() || !hasSupabaseEnv()) {
      return;
    }

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("user_habits")
      .update({
        name: updatedHabit.name,
        type: updatedHabit.type,
        target_value: updatedHabit.target_value,
        target_unit: updatedHabit.target_unit,
      })
      .eq("id", habitId);

    if (updateError) {
      setError(updateError.message);
      setHabitItems(habits);
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  }

  async function removeHabit(habitId: string) {
    setError(null);
    const previousHabits = habitItems;
    const nextHabits = habitItems.filter((habit) => habit.id !== habitId);

    if (nextHabits.length === 0) {
      setError("You need at least one habit.");
      return;
    }

    setHabitItems(nextHabits);
    if (editingHabitId === habitId) {
      setEditingHabitId(null);
    }

    if (isDemo || isForcedDemoMode() || !hasSupabaseEnv()) {
      return;
    }

    const supabase = createClient();
    const { error: removeError } = await supabase
      .from("user_habits")
      .update({ is_active: false })
      .eq("id", habitId);

    if (removeError) {
      setHabitItems(previousHabits);
      setError(removeError.message);
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  }

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
        {error ? <p className="text-sm text-red-500">{error}</p> : null}
        <div className="space-y-3">
          {habitItems.map((habit) => {
            const isEditing = editingHabitId === habit.id;
            const draft = drafts[habit.id];

            return (
              <div key={habit.id} className="rounded-2xl border border-border/70 p-3">
                {isEditing ? (
                  <div className="space-y-3">
                    <Input
                      value={draft?.name ?? ""}
                      onChange={(event) =>
                        setDrafts((current) => ({
                          ...current,
                          [habit.id]: {
                            ...current[habit.id],
                            name: event.target.value,
                          },
                        }))
                      }
                      placeholder="Habit name"
                    />
                    <Select
                      value={draft?.type ?? habit.type}
                      onChange={(event) =>
                        setDrafts((current) => ({
                          ...current,
                          [habit.id]: {
                            ...current[habit.id],
                            type: event.target.value as UserHabit["type"],
                            target_value:
                              event.target.value === "binary"
                                ? null
                                : current[habit.id]?.target_value ?? habit.target_value,
                            target_unit:
                              event.target.value === "binary"
                                ? null
                                : current[habit.id]?.target_unit ?? habit.target_unit,
                          },
                        }))
                      }
                    >
                      <option value="binary">Binary</option>
                      <option value="measurable">Measurable</option>
                    </Select>
                    {(draft?.type ?? habit.type) === "measurable" ? (
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          type="number"
                          value={draft?.target_value ?? habit.target_value ?? ""}
                          onChange={(event) =>
                            setDrafts((current) => ({
                              ...current,
                              [habit.id]: {
                                ...current[habit.id],
                                target_value: event.target.value ? Number(event.target.value) : null,
                              },
                            }))
                          }
                          placeholder="Target"
                        />
                        <Input
                          value={draft?.target_unit ?? habit.target_unit ?? ""}
                          onChange={(event) =>
                            setDrafts((current) => ({
                              ...current,
                              [habit.id]: {
                                ...current[habit.id],
                                target_unit: event.target.value,
                              },
                            }))
                          }
                          placeholder="Unit"
                        />
                      </div>
                    ) : null}
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        type="button"
                        className="flex-1"
                        onClick={() => cancelEditing(habit.id)}
                        disabled={isPending}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        className="flex-1"
                        onClick={() => void saveHabit(habit.id)}
                        disabled={isPending}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{habit.name}</p>
                      <p className="text-sm text-foreground/48">
                        {habit.type === "binary"
                          ? "Daily binary"
                          : `${habit.target_value} ${habit.target_unit}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        type="button"
                        onClick={() => startEditing(habit)}
                        disabled={isPending}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        type="button"
                        onClick={() => void removeHabit(habit.id)}
                        disabled={isPending}
                        className="px-3 text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
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
