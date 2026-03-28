"use client";

import { useMemo } from "react";

import { HabitJourneyPanel } from "@/components/habit-journey/habit-journey-panel";
import { Card } from "@/components/ui/card";
import { HabitJourneyProgress } from "@/lib/types";

export function JourneyScreen({
  habitJourneys,
  currentJourneyHabitId,
}: {
  habitJourneys: HabitJourneyProgress[];
  currentJourneyHabitId: string | null;
}) {
  const currentJourney = useMemo(
    () =>
      habitJourneys.find((journey) => journey.habitId === currentJourneyHabitId) ??
      habitJourneys[0] ??
      null,
    [currentJourneyHabitId, habitJourneys],
  );

  if (!currentJourney) {
    return (
      <Card>
        <p className="font-medium">Your journey will appear once your first habit is underway.</p>
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

      <HabitJourneyPanel journey={currentJourney} mode="concentric" />
    </div>
  );
}
