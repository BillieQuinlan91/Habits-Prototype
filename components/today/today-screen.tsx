"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, LockKeyhole, Target } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TeamRing } from "@/components/ui/team-ring";
import { applyDemoCheckinOverride, writeDemoCheckinStatus } from "@/lib/demo/overrides";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { CircleDashboard, Profile, TodayHabitItem } from "@/lib/types";

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
  const [items, setItems] = useState(habits);
  const [feedback, setFeedback] = useState<string | null>(null);

  const focusHabit = useMemo(
    () => items.find((habit) => habit.is_primary) ?? items[0] ?? null,
    [items],
  );
  const visibleCircleDashboard = useMemo(
    () => (isDemo ? applyDemoCheckinOverride(circleDashboard) : circleDashboard),
    [circleDashboard, isDemo],
  );

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
      writeDemoCheckinStatus(completedValue ? "checked_in" : "pending");
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

    window.location.reload();
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
      <div className="space-y-3">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-foreground/40">Today</p>
          <h2 className="mt-2 font-display text-3xl font-normal tracking-tight">Keep the promise.</h2>
        </div>

        <Card className="space-y-3 bg-surface/70">
          <div className="flex items-center gap-2 text-foreground/40">
            <LockKeyhole className="h-4 w-4 text-accent" />
            <p className="text-xs uppercase tracking-[0.2em]">Identity</p>
          </div>
          <p className="font-display text-2xl font-normal leading-tight tracking-tight">
            {profile?.identity_label ?? "I am someone who keeps my promises."}
          </p>
        </Card>
      </div>

      <Card className="space-y-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-foreground/40">
              <Target className="h-4 w-4 text-accent" />
              <p className="text-xs uppercase tracking-[0.2em]">Current commitment</p>
            </div>
            <Badge>{focusHabit.log?.completed ? "Done today" : "Still to do"}</Badge>
          </div>

          <div className="rounded-[28px] border border-border/80 bg-card p-5">
            <p className="font-display text-3xl font-normal tracking-tight">{focusHabit.name}</p>
            <p className="mt-3 text-sm text-foreground/48">
              This is the one thing that counts today.
            </p>
          </div>

          <div className="rounded-2xl bg-surface/70 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-foreground/38">Minimum version</p>
            <p className="mt-1 text-sm text-foreground/62">
              {focusHabit.minimum_label
                ? focusHabit.minimum_label
                : "Keep the threshold small enough to repeat."}
            </p>
          </div>
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
          {focusHabit.log?.completed ? "Checked in" : "Check in"}
        </Button>
      </Card>

      {visibleCircleDashboard ? (
        <Card className="space-y-4 overflow-hidden">
          <TeamRing
            members={visibleCircleDashboard.members}
            eyebrow="Shared progress"
            title="Team ring"
            showMembers={false}
            compact
          />
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
