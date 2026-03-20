"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConstellationWidget } from "@/components/ui/constellation-widget";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { TodayHabitItem } from "@/lib/types";
import { isSundayLocal, toPercent } from "@/lib/utils";

export function TodayScreen({
  habits,
  isDemo = false,
}: {
  habits: TodayHabitItem[];
  isDemo?: boolean;
}) {
  const router = useRouter();
  const [items, setItems] = useState(habits);
  const [showSundayPush, setShowSundayPush] = useState(false);
  const [redirectCount, setRedirectCount] = useState(3);
  const [feedback, setFeedback] = useState<string | null>(null);

  const completed = items.filter((item) => item.log?.completed).length;
  const percentage = useMemo(() => (items.length ? (completed / items.length) * 100 : 0), [completed, items.length]);

  useEffect(() => {
    if (!showSundayPush) {
      return;
    }

    if (redirectCount <= 0) {
      router.push("/tribe");
      return;
    }

    const timeout = window.setTimeout(() => {
      setRedirectCount((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timeout);
  }, [redirectCount, router, showSundayPush]);

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

  function finishSundayIfNeeded(nextItems: TodayHabitItem[]) {
    if (isSundayLocal() && nextItems.every((habit) => habit.log?.completed)) {
      setRedirectCount(3);
      setShowSundayPush(true);
    }
  }

  async function toggleHabit(habitId: string) {
    const currentHabit = items.find((habit) => habit.id === habitId);
    if (!currentHabit) {
      return;
    }

    const nextCompleted = !(currentHabit.log?.completed ?? false);
    const nextProgressValue =
      currentHabit.type === "measurable"
        ? currentHabit.log?.progress_value ?? currentHabit.target_value ?? null
        : currentHabit.log?.progress_value ?? null;

    const next = items.map((habit) =>
      habit.id === habitId
        ? {
            ...habit,
            log: buildNextLog(habit, nextCompleted, nextProgressValue),
          }
        : habit,
    );

    setFeedback(null);
    setItems(next);
    finishSundayIfNeeded(next);
    await persistLog(currentHabit, nextCompleted, nextProgressValue);
  }

  async function updateProgress(habitId: string, rawValue: string) {
    const currentHabit = items.find((habit) => habit.id === habitId);
    if (!currentHabit) {
      return;
    }

    const nextProgressValue = rawValue === "" ? null : Number(rawValue);
    const targetReached =
      currentHabit.target_value !== null &&
      nextProgressValue !== null &&
      nextProgressValue >= currentHabit.target_value;
    const nextCompleted = currentHabit.log?.completed ?? targetReached;

    const next = items.map((habit) =>
      habit.id === habitId
        ? {
            ...habit,
            log: buildNextLog(habit, nextCompleted, nextProgressValue),
          }
        : habit,
    );

    setFeedback(null);
    setItems(next);
    finishSundayIfNeeded(next);
    await persistLog(currentHabit, nextCompleted, nextProgressValue);
  }

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden">
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-foreground/40">Today</p>
              <h2 className="font-display text-3xl font-normal tracking-tight">
                {completed === items.length ? "The rhythm continues." : "A good place to continue."}
              </h2>
              <p className="mt-2 max-w-[240px] text-sm text-foreground/58">
                Small actions, repeated often, form a pattern soon enough.
              </p>
            </div>
            <span className="rounded-full bg-surface px-3 py-2 text-sm font-medium text-foreground/72">
              {completed}/{items.length}
            </span>
          </div>
          <ConstellationWidget
            activeCount={completed}
            totalCount={items.length || 1}
            variant="today"
          />
          <Progress value={percentage} />
          <p className="text-sm text-foreground/58">
            {toPercent(percentage / 100)}% complete. Progress has been spotted.
          </p>
        </div>
      </Card>

      {feedback ? (
        <p className="rounded-2xl border border-border bg-card/80 px-4 py-3 text-sm text-foreground/62">
          {feedback}
        </p>
      ) : null}

      <div className="space-y-3">
        {items.map((habit) => (
          <div
            key={habit.id}
            className={`group w-full rounded-2xl border p-4 text-left transition ${
              habit.log?.completed
                ? "border-success/60 bg-success/10 animate-pulseSoft"
                : "border-border bg-card"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium">{habit.name}</p>
                <p className="mt-1 text-sm text-foreground/48">
                  {habit.type === "measurable"
                    ? `${habit.log?.progress_value ?? 0} / ${habit.target_value ?? 0} ${habit.target_unit ?? ""}`
                    : "Done / not done"}
                </p>
                {habit.type === "measurable" ? (
                  <div className="mt-3 flex items-center gap-2">
                    <Input
                      type="number"
                      inputMode="numeric"
                      value={habit.log?.progress_value ?? ""}
                      onChange={(event) => void updateProgress(habit.id, event.target.value)}
                      className="h-10 max-w-[120px]"
                      placeholder="Amount"
                    />
                    <span className="text-xs uppercase tracking-[0.18em] text-foreground/38">
                      {habit.target_unit}
                    </span>
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => void toggleHabit(habit.id)}
                className={`flex h-10 w-10 items-center justify-center rounded-full border transition ${
                  habit.log?.completed
                    ? "border-success bg-success text-white"
                    : "border-border bg-white"
                }`}
              >
                <CheckCircle2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showSundayPush ? (
        <Card className="space-y-4 bg-foreground text-surface">
          <div className="flex items-center gap-2 text-accent2">
            <Sparkles className="h-4 w-4" />
            <p className="text-xs uppercase tracking-[0.24em]">Sunday ritual</p>
          </div>
          <div>
            <h3 className="font-display text-2xl font-normal">See how your tribe is doing this week.</h3>
            <p className="mt-2 text-sm text-surface/72">
              A thoughtful week deserves a small social visit. Moving in {redirectCount}...
            </p>
          </div>
          <Button
            variant="secondary"
            className="w-full border-surface/20 bg-surface text-foreground"
            onClick={() => {
              router.push("/tribe");
            }}
          >
            Go now
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Card>
      ) : null}

      {isDemo ? (
        <p className="text-center text-xs text-foreground/40">
          Demo mode previews the flow. Persistence can arrive later.
        </p>
      ) : null}
    </div>
  );
}
