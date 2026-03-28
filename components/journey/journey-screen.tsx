"use client";

import { useMemo } from "react";

import { HabitJourneyPanel } from "@/components/habit-journey/habit-journey-panel";
import { Card } from "@/components/ui/card";
import { JourneyPreviewState } from "@/lib/habit-journey";
import { HabitJourneyProgress } from "@/lib/types";

export function JourneyScreen({
  habitJourneys,
  currentJourneyHabitId,
  preview,
}: {
  habitJourneys: HabitJourneyProgress[];
  currentJourneyHabitId: string | null;
  preview: JourneyPreviewState | null;
}) {
  const currentJourney = useMemo(
    () =>
      currentJourneyHabitId
        ? habitJourneys.find((journey) => journey.habitId === currentJourneyHabitId) ?? null
        : null,
    [currentJourneyHabitId, habitJourneys],
  );
  const hasCompletedJourney = useMemo(
    () => habitJourneys.some((journey) => !journey.nextMilestone),
    [habitJourneys],
  );

  if (!currentJourney) {
    return (
      <Card>
        <p className="font-medium">
          {hasCompletedJourney
            ? "This journey is complete. Add another habit when you are ready to begin a new one."
            : "Your journey will appear once your first habit is underway."}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.24em] text-foreground/40">Journey</p>
        <h2 className="font-display text-3xl font-normal tracking-tight">The shape of your habit.</h2>
        <p className="text-sm text-foreground/58">
          Three rings, one arc. The outer ring is the full 75-day identity stretch.
        </p>
      </div>

      {preview ? (
        <Card className="border-accent/20 bg-accent/6 py-4">
          <p className="text-xs uppercase tracking-[0.2em] text-accent">Preview mode</p>
          <p className="mt-2 text-sm text-foreground/62">
            Showing the milestone state for {preview === "day7" ? "6/7 by day 7" : preview === "day30" ? "24/30 by day 30" : "60/75 by day 75"}.
          </p>
        </Card>
      ) : null}

      <HabitJourneyPanel journey={currentJourney} mode="concentric" />
    </div>
  );
}
