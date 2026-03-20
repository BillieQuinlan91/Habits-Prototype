"use client";

import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TodayHabitItem } from "@/lib/types";
import { isSundayLocal, toPercent } from "@/lib/utils";

export function TodayScreen({
  habits,
  isDemo = false,
}: {
  habits: TodayHabitItem[];
  isDemo?: boolean;
}) {
  const [items, setItems] = useState(habits);
  const [showSundayPush, setShowSundayPush] = useState(false);

  const completed = items.filter((item) => item.log?.completed).length;
  const percentage = useMemo(() => (items.length ? (completed / items.length) * 100 : 0), [completed, items.length]);

  function toggleHabit(habitId: string) {
    const next = items.map((habit) =>
      habit.id === habitId
        ? {
            ...habit,
            log: {
              id: habit.log?.id ?? `temp-${habitId}`,
              user_id: habit.user_id,
              user_habit_id: habit.id,
              log_date: new Date().toISOString().slice(0, 10),
              completed: !(habit.log?.completed ?? false),
              progress_value: habit.log?.progress_value ?? habit.target_value ?? null,
              notes: null,
            },
          }
        : habit,
    );

    setItems(next);
    if (isSundayLocal() && next.every((habit) => habit.log?.completed)) {
      setShowSundayPush(true);
    }
  }

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden">
        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-accent/10 blur-3xl" />
        <div className="relative space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-foreground/40">Today</p>
              <h2 className="font-display text-3xl font-semibold tracking-tight">
                {completed === items.length ? "Day locked in." : "Build the day."}
              </h2>
            </div>
            <span className="rounded-full bg-foreground/6 px-3 py-2 text-sm font-semibold">
              {completed}/{items.length}
            </span>
          </div>
          <Progress value={percentage} />
          <p className="text-sm text-foreground/58">
            {toPercent(percentage / 100)}% complete. Fast logs now. Momentum later.
          </p>
        </div>
      </Card>

      <div className="space-y-3">
        {items.map((habit) => (
          <button
            key={habit.id}
            type="button"
            onClick={() => toggleHabit(habit.id)}
            className={`group w-full rounded-[28px] border p-4 text-left transition ${
              habit.log?.completed
                ? "border-accent bg-accent/8 animate-pulseSoft"
                : "border-border bg-card/90"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium">{habit.name}</p>
                <p className="mt-1 text-sm text-foreground/48">
                  {habit.type === "measurable"
                    ? `${habit.log?.progress_value ?? 0} / ${habit.target_value ?? 0} ${habit.target_unit ?? ""}`
                    : "Done / not done"}
                </p>
              </div>
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full border transition ${
                  habit.log?.completed
                    ? "border-accent bg-accent text-surface"
                    : "border-border bg-surface"
                }`}
              >
                <CheckCircle2 className="h-5 w-5" />
              </span>
            </div>
          </button>
        ))}
      </div>

      {showSundayPush ? (
        <Card className="space-y-4 bg-foreground text-surface">
          <div className="flex items-center gap-2 text-accent2">
            <Sparkles className="h-4 w-4" />
            <p className="text-xs uppercase tracking-[0.24em]">Sunday ritual</p>
          </div>
          <div>
            <h3 className="font-display text-2xl font-semibold">See how your tribe is doing this week.</h3>
            <p className="mt-2 text-sm text-surface/72">
              Your tribe could use your encouragement.
            </p>
          </div>
          <Button
            variant="secondary"
            className="w-full border-surface/20 bg-surface text-foreground"
            onClick={() => {
              window.location.href = "/tribe";
            }}
          >
            Go to Tribe
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Card>
      ) : null}

      {isDemo ? (
        <p className="text-center text-xs text-foreground/40">
          Demo mode previews the interaction design. Connect Supabase to persist logs.
        </p>
      ) : null}
    </div>
  );
}
