"use client";

import { ChevronRight, Sparkles } from "lucide-react";

import { Card } from "@/components/ui/card";
import { HabitJourneyProgress } from "@/lib/types";
import { cn } from "@/lib/utils";

function getProgressLabel(journey: HabitJourneyProgress) {
  const current = journey.nextMilestone ?? journey.milestones[journey.milestones.length - 1] ?? null;

  if (!current) {
    return null;
  }

  if (current.isUnlocked && !journey.nextMilestone) {
    return "Identity formed. You kept going long enough for it to become part of you.";
  }

  return `${current.title}: ${journey.completedDays}/${current.targetDays} days`;
}

export function HabitJourneyPanel({
  journey,
  mode,
  onOpen,
}: {
  journey: HabitJourneyProgress | null;
  mode: "teaser" | "concentric";
  onOpen?: () => void;
}) {
  if (!journey) {
    return null;
  }

  if (mode === "teaser") {
    const progressLabel = getProgressLabel(journey);

    return (
      <button
        type="button"
        onClick={onOpen}
        className="w-full text-left"
        aria-label="Open habit journey"
      >
        <Card className="space-y-4 bg-surface/70 transition hover:border-accent/20 hover:bg-surface/90">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-foreground/40">
              <Sparkles className="h-4 w-4 text-accent2" />
              <p className="text-xs uppercase tracking-[0.2em]">Habit journey</p>
            </div>
            <ChevronRight className="h-4 w-4 text-foreground/32" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {journey.milestones.map((milestone) => (
              <div
                key={milestone.phase}
                className={cn(
                  "rounded-2xl border px-3 py-3",
                  milestone.isUnlocked
                    ? "border-success/25 bg-success/10"
                    : journey.nextMilestone?.phase === milestone.phase
                      ? "border-accent/25 bg-accent/8"
                      : "border-border/70 bg-card/70",
                )}
              >
                <p className="text-[11px] uppercase tracking-[0.18em] text-foreground/40">{milestone.shortLabel}</p>
                <p className="mt-1 text-xs font-medium text-foreground/74">{milestone.title}</p>
              </div>
            ))}
          </div>
          {progressLabel ? <p className="text-sm text-foreground/58">{progressLabel}</p> : null}
        </Card>
      </button>
    );
  }

  const activeMilestone = journey.nextMilestone ?? journey.milestones[journey.milestones.length - 1] ?? null;
  const rings = [
    {
      milestone: journey.milestones[2],
      size: 240,
      stroke: 10,
    },
    {
      milestone: journey.milestones[1],
      size: 182,
      stroke: 10,
    },
    {
      milestone: journey.milestones[0],
      size: 126,
      stroke: 10,
    },
  ];

  return (
    <Card className="space-y-5">
      <div>
        <div className="flex items-center gap-2 text-foreground/40">
          <Sparkles className="h-4 w-4 text-accent2" />
          <p className="text-xs uppercase tracking-[0.2em]">Habit journey</p>
        </div>
        <h3 className="mt-3 font-display text-2xl font-normal tracking-tight">{journey.habitName}</h3>
        <p className="mt-2 text-sm text-foreground/58">
          {Math.round(journey.consistencyPercent * 100)}% consistency across {journey.elapsedDays} days.
        </p>
      </div>

      <div className="flex justify-center py-2">
        <div className="relative flex h-[240px] w-[240px] items-center justify-center">
          {rings.map(({ milestone, size, stroke }) => {
            if (!milestone) {
              return null;
            }

            const radius = (size - stroke) / 2;
            const circumference = 2 * Math.PI * radius;
            const completionTarget = Math.max(1, milestone.requiredCompletedDays);
            const ratio = milestone.isUnlocked
              ? 1
              : Math.min(journey.completedDays, completionTarget) / completionTarget;
            const dashOffset = circumference * (1 - ratio);
            const strokeClass = milestone.isUnlocked
              ? "stroke-success"
              : journey.nextMilestone?.phase === milestone.phase
                ? "stroke-accent"
                : "stroke-foreground/20";

            return (
              <svg
                key={milestone.phase}
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="absolute"
                aria-hidden="true"
              >
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  className="text-foreground/10"
                  strokeWidth={stroke}
                />
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  strokeWidth={stroke}
                  className={cn("origin-center -rotate-90 transition-all", strokeClass)}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  style={{ transformOrigin: "50% 50%" }}
                />
              </svg>
            );
          })}
          <div className="relative z-10 text-center">
            <p className="font-display text-4xl font-normal tracking-tight">
              {Math.min(journey.completedDays, activeMilestone?.targetDays ?? 75)}
            </p>
            <p className="mt-1 text-sm text-foreground/56">
              of {activeMilestone?.targetDays ?? 75} days
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {journey.milestones.map((milestone, index) => {
          const description =
            milestone.phase === "day_75"
              ? "This is the identity phase. Repetition has started to change how you see yourself."
              : milestone.phase === "day_30"
                ? "This is the lock-in phase. There is less negotiation and more return."
                : "This is the willpower phase. The early friction is where the pattern begins.";

          return (
            <div key={milestone.phase} className="flex gap-4">
              <div className="flex w-7 flex-col items-center">
                <div
                  className={cn(
                    "h-7 w-7 rounded-full border",
                    milestone.isUnlocked
                      ? "border-success/25 bg-success/15"
                      : journey.nextMilestone?.phase === milestone.phase
                        ? "border-accent/25 bg-accent/10"
                        : "border-border/70 bg-surface/70",
                  )}
                />
                {index < journey.milestones.length - 1 ? <div className="mt-2 h-full w-px bg-border/70" /> : null}
              </div>
              <div
                className={cn(
                  "flex-1 rounded-[24px] border px-4 py-4",
                  milestone.isUnlocked
                    ? "border-success/25 bg-success/8"
                    : journey.nextMilestone?.phase === milestone.phase
                      ? "border-accent/25 bg-accent/6"
                      : "border-border/70 bg-surface/60",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-foreground/40">{milestone.shortLabel}</p>
                    <p className="mt-1 font-display text-xl font-normal">{milestone.title}</p>
                  </div>
                  <span className="text-sm text-foreground/50">
                    {milestone.isUnlocked ? "Unlocked" : journey.nextMilestone?.phase === milestone.phase ? "In progress" : "Locked"}
                  </span>
                </div>
                <p className="mt-3 text-sm text-foreground/62">{description}</p>
                <p className="mt-3 text-sm text-foreground/52">
                  {milestone.isUnlocked
                    ? `Unlocked with ${Math.round(milestone.consistencyPercent * 100)}% consistency.`
                    : `Needs ${milestone.requiredCompletedDays}/${milestone.targetDays} completed days at 80% consistency.`}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
