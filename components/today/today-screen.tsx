"use client";

import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConstellationWidget } from "@/components/ui/constellation-widget";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { WeeklyHabitConstellation } from "@/components/ui/weekly-habit-constellation";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { HabitLog, Profile, TodayHabitItem, WeeklyConstellationRow } from "@/lib/types";
import { getCommitmentDay, getWeekDateKeys, toPercent } from "@/lib/utils";

export function TodayScreen({
  profile,
  habits,
  weekLogs,
  isDemo = false,
}: {
  profile: Profile | null;
  habits: TodayHabitItem[];
  weekLogs: HabitLog[];
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

  const weeklyRows = useMemo<WeeklyConstellationRow[]>(
    () =>
      focusHabit
        ? [
            {
              habitId: focusHabit.id,
              habitName: focusHabit.name,
              completions: getWeekDateKeys().map(
                (date) =>
                  weekLogs.some(
                    (log) => log.user_habit_id === focusHabit.id && log.log_date === date && log.completed,
                  ) || (focusHabit.log?.log_date === date && Boolean(focusHabit.log?.completed)),
              ),
            },
          ]
        : [],
    [focusHabit, weekLogs],
  );
  const completedCount = weeklyRows[0]?.completions.filter(Boolean).length ?? 0;
  const focusProgress = focusHabit?.log?.completed ? 100 : 0;
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
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-foreground/40">Today</p>
            <h2 className="font-display text-3xl font-normal tracking-tight">
              {focusHabit.log?.completed ? "Today's mark is in." : "Keep the promise small."}
            </h2>
            <p className="mt-2 max-w-[260px] text-sm text-foreground/58">
              {profile?.identity_label ?? "One repeated action"} becomes more believable when it shows up again today.
            </p>
          </div>
          <span className="rounded-full bg-surface px-3 py-2 text-sm font-medium text-foreground/72">
            Day {Math.min(commitmentDay, commitmentLength)}/{commitmentLength}
          </span>
        </div>

        <ConstellationWidget activeCount={focusHabit.log?.completed ? 1 : 0} totalCount={1} variant="today" />
        <Progress value={focusProgress} />
        <p className="text-sm text-foreground/58">
          {focusHabit.log?.completed ? "Checked in for today." : "A single check-in keeps the week moving."}
        </p>
      </Card>

      <Card className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-foreground/40">Current focus</p>
          <h3 className="font-display text-2xl font-normal">{focusHabit.name}</h3>
          <p className="mt-2 text-sm text-foreground/58">
            Minimum version: {focusHabit.minimum_label ?? "Keep it small enough to repeat."}
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
          See your circle
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

      <Card className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-foreground/40">This week</p>
          <h3 className="font-display text-2xl font-normal">A visible pattern</h3>
          <p className="mt-2 text-sm text-foreground/58">
            One row. One habit. A small chain worth protecting.
          </p>
        </div>
        <WeeklyHabitConstellation rows={weeklyRows} completedCount={completedCount} totalCount={7} />
        <p className="text-sm text-foreground/58">{toPercent(completedCount / 7)}% of the week has been kept.</p>
      </Card>

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
