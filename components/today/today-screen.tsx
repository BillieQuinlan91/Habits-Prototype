"use client";

import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TeamRing } from "@/components/ui/team-ring";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { CircleDashboard, Profile, TodayHabitItem } from "@/lib/types";
import { getCommitmentDay } from "@/lib/utils";

export function TodayScreen({
  profile,
  habits,
  circleDashboard,
  isDemo = false,
}: {
  profile: Profile | null;
  habits: TodayHabitItem[];
  circleDashboard: CircleDashboard | null;
  isDemo?: boolean;
}) {
  const router = useRouter();
  const [items, setItems] = useState(habits);
  const [feedback, setFeedback] = useState<string | null>(null);

  const focusHabit = useMemo(
    () => items.find((habit) => habit.is_primary) ?? items[0] ?? null,
    [items],
  );
  const parkedHabits = Math.max(0, items.length - (focusHabit ? 1 : 0));
  const commitmentDay = getCommitmentDay(focusHabit?.commitment_start_date);
  const commitmentLength = focusHabit?.commitment_length_days ?? 7;

  function buildNextLog(habit: TodayHabitItem, nextCompleted: boolean, nextProgressValue: number | null) {
    return {
      id: habit.log?.id ?? `temp-${habit.id}`,
      user_id: habit.user_id,
      user_habit_id: habit.id,
      log_date: new Date().toISOString().slice(0, 10),
      completed: nextCompleted,
      progress_value: nextProgressValue,
      notes: null,
    };
  }

  async function persistLog(habit: TodayHabitItem, completedValue: boolean, progressValue: number | null) {
    if (isDemo || !hasSupabaseEnv()) {
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.from("habit_logs").upsert({
      id: habit.log?.id,
      user_id: habit.user_id,
      user_habit_id: habit.id,
      log_date: new Date().toISOString().slice(0, 10),
      completed: completedValue,
      progress_value: progressValue,
    });

    if (error) {
      setFeedback(error.message);
      return;
    }

    router.refresh();
  }

  async function toggleHabit() {
    if (!focusHabit) {
      return;
    }

    const nextCompleted = !(focusHabit.log?.completed ?? false);
    const nextProgressValue =
      focusHabit.type === "measurable"
        ? focusHabit.log?.progress_value ?? focusHabit.target_value ?? null
        : focusHabit.log?.progress_value ?? null;

    const next = items.map((habit) =>
      habit.id === focusHabit.id
        ? { ...habit, log: buildNextLog(habit, nextCompleted, nextProgressValue) }
        : habit,
    );

    setFeedback(null);
    setItems(next);
    await persistLog(focusHabit, nextCompleted, nextProgressValue);
  }

  async function updateProgress(rawValue: string) {
    if (!focusHabit) {
      return;
    }

    const nextProgressValue = rawValue === "" ? null : Number(rawValue);
    const targetReached =
      focusHabit.target_value !== null &&
      nextProgressValue !== null &&
      nextProgressValue >= focusHabit.target_value;
    const nextCompleted = focusHabit.log?.completed ?? targetReached;

    const next = items.map((habit) =>
      habit.id === focusHabit.id
        ? { ...habit, log: buildNextLog(habit, nextCompleted, nextProgressValue) }
        : habit,
    );

    setFeedback(null);
    setItems(next);
    await persistLog(focusHabit, nextCompleted, nextProgressValue);
  }

  if (!focusHabit) {
    return (
      <Card>
        <p className="font-medium">Your first habit will appear here after onboarding.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <Card className="space-y-5 overflow-hidden">
        {circleDashboard ? (
          <TeamRing members={circleDashboard.members} />
        ) : (
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-foreground/40">Today</p>
            <h2 className="font-display text-3xl font-normal tracking-tight">Team ring</h2>
            <p className="mt-2 text-sm text-foreground/58">
              Your team ring will appear once your group is in place.
            </p>
          </div>
        )}
      </Card>

      <Card className="space-y-4">
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-foreground/40">Current focus</p>
              <h3 className="font-display text-2xl font-normal">{focusHabit.name}</h3>
            </div>
            <span className="rounded-full bg-surface px-3 py-2 text-sm font-medium text-foreground/72">
              Day {Math.min(commitmentDay, commitmentLength)}/{commitmentLength}
            </span>
          </div>
          <p className="mt-2 text-sm text-foreground/58">
            Minimum version: {focusHabit.minimum_label ?? "Keep it small enough to repeat."}
          </p>
          <p className="mt-2 text-sm text-foreground/48">
            {profile?.identity_label ?? "One repeated action"} becomes more believable when it shows up again today.
          </p>
        </div>

        {focusHabit.type === "measurable" ? (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              inputMode="numeric"
              value={focusHabit.log?.progress_value ?? ""}
              onChange={(event) => void updateProgress(event.target.value)}
              className="h-11 max-w-[140px]"
              placeholder="Amount"
            />
            <span className="text-xs uppercase tracking-[0.18em] text-foreground/38">
              {focusHabit.target_unit}
            </span>
          </div>
        ) : null}

        <Button className="w-full" onClick={() => void toggleHabit()}>
          <CheckCircle2 className="mr-2 h-4 w-4" />
          {focusHabit.log?.completed ? "Undo today’s check-in" : "Check in"}
        </Button>

        <Button variant="secondary" className="w-full" onClick={() => router.push("/tribe")}>
          See your team
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Card>

      {parkedHabits > 0 ? (
        <Card className="space-y-3">
          <div className="flex items-center gap-2">
            <LockKeyhole className="h-4 w-4 text-accent" />
            <p className="font-medium">Additional habits can wait.</p>
          </div>
          <p className="text-sm text-foreground/58">
            {parkedHabits} other {parkedHabits === 1 ? "habit is" : "habits are"} parked while your first 7-day
            focus settles in.
          </p>
        </Card>
      ) : null}

      {feedback ? (
        <p className="rounded-2xl border border-border bg-card/80 px-4 py-3 text-sm text-foreground/62">
          {feedback}
        </p>
      ) : null}

      {isDemo ? (
        <p className="text-center text-xs text-foreground/40">
          Demo mode previews the first-week rhythm without persistence.
        </p>
      ) : null}
    </div>
  );
}
