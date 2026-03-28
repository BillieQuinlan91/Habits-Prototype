import { differenceInCalendarDays, parseISO } from "date-fns";

import {
  HabitJourneyMilestone,
  HabitJourneyProgress,
  HabitLog,
  HabitMilestonePhase,
  HabitMilestoneUnlock,
  UserHabit,
} from "@/lib/types";
import { toDateKey } from "@/lib/utils";

export const HABIT_JOURNEY_MILESTONES: Array<{
  phase: HabitMilestonePhase;
  title: string;
  shortLabel: string;
  targetDays: number;
  requiredConsistency: number;
}> = [
  {
    phase: "day_7",
    title: "Willpower phase",
    shortLabel: "Day 7",
    targetDays: 7,
    requiredConsistency: 0.8,
  },
  {
    phase: "day_30",
    title: "Habit locking in",
    shortLabel: "Day 30",
    targetDays: 30,
    requiredConsistency: 0.8,
  },
  {
    phase: "day_75",
    title: "Identity formed",
    shortLabel: "Day 75",
    targetDays: 75,
    requiredConsistency: 0.8,
  },
];

export function deriveHabitJourney(
  habit: UserHabit,
  logs: HabitLog[],
  milestoneUnlocks: HabitMilestoneUnlock[],
  now = new Date(),
): HabitJourneyProgress {
  const todayKey = toDateKey(now);
  const startDate = habit.commitment_start_date ?? todayKey;
  const elapsedDays = Math.max(1, differenceInCalendarDays(now, parseISO(startDate)) + 1);
  const completedDates = new Set(
    logs
      .filter(
        (log) =>
          log.user_habit_id === habit.id &&
          log.completed &&
          log.log_date >= startDate &&
          log.log_date <= todayKey,
      )
      .map((log) => log.log_date),
  );
  const completedDays = completedDates.size;
  const consistencyPercent = elapsedDays > 0 ? completedDays / elapsedDays : 0;

  const milestones: HabitJourneyMilestone[] = HABIT_JOURNEY_MILESTONES.map((milestone) => {
    const unlocked = milestoneUnlocks.find(
      (entry) => entry.user_habit_id === habit.id && entry.milestone_phase === milestone.phase,
    );

    return {
      ...milestone,
      consistencyPercent,
      requiredCompletedDays: Math.ceil(milestone.targetDays * milestone.requiredConsistency),
      isUnlocked: Boolean(unlocked),
      unlockedAt: unlocked?.unlocked_at ?? null,
      isEligibleToday:
        !unlocked &&
        completedDays >= Math.ceil(milestone.targetDays * milestone.requiredConsistency) &&
        consistencyPercent >= milestone.requiredConsistency,
    };
  });

  return {
    habitId: habit.id,
    habitName: habit.name,
    elapsedDays,
    completedDays,
    consistencyPercent,
    canAddSecondHabit: milestones.some((milestone) => milestone.phase === "day_75" && milestone.isUnlocked),
    milestones,
    nextMilestone: milestones.find((milestone) => !milestone.isUnlocked) ?? null,
  };
}

export function getNewlyUnlockedMilestone(journey: HabitJourneyProgress) {
  return journey.milestones.find((milestone) => milestone.isEligibleToday) ?? null;
}

export function getCurrentJourneyHabitId(journeys: HabitJourneyProgress[]) {
  if (!journeys.length) {
    return null;
  }

  const inProgressJourneys = journeys.filter((journey) => journey.nextMilestone);
  if (inProgressJourneys.length) {
    return inProgressJourneys.sort((a, b) => a.elapsedDays - b.elapsedDays)[0].habitId;
  }

  return journeys
    .slice()
    .sort((a, b) => b.elapsedDays - a.elapsedDays)[0]
    ?.habitId ?? null;
}

export type JourneyPreviewState = "day7" | "day30" | "day75";

const JOURNEY_PREVIEW_MAP: Record<
  JourneyPreviewState,
  { phase: HabitMilestonePhase; completedDays: number; elapsedDays: number }
> = {
  day7: { phase: "day_7", completedDays: 6, elapsedDays: 6 },
  day30: { phase: "day_30", completedDays: 24, elapsedDays: 24 },
  day75: { phase: "day_75", completedDays: 60, elapsedDays: 60 },
};

export function parseJourneyPreview(value?: string): JourneyPreviewState | null {
  if (value === "day7" || value === "day30" || value === "day75") {
    return value;
  }

  return null;
}

export function applyJourneyPreview(
  journeys: HabitJourneyProgress[],
  currentJourneyHabitId: string | null,
  preview: JourneyPreviewState | null,
) {
  if (!preview || !journeys.length) {
    return {
      habitJourneys: journeys,
      currentJourneyHabitId,
      canAddSecondHabit: journeys.some((journey) => journey.canAddSecondHabit),
    };
  }

  const selectedHabitId = currentJourneyHabitId ?? journeys[0]?.habitId ?? null;
  const config = JOURNEY_PREVIEW_MAP[preview];
  const consistencyPercent = config.completedDays / config.elapsedDays;

  const habitJourneys = journeys.map((journey) => {
    if (journey.habitId !== selectedHabitId) {
      return journey;
    }

    const milestones = journey.milestones.map((milestone) => {
      const targetReached = config.completedDays >= milestone.requiredCompletedDays;
      return {
        ...milestone,
        consistencyPercent,
        isUnlocked: targetReached,
        unlockedAt: targetReached ? new Date().toISOString() : null,
        isEligibleToday: false,
      };
    });

    return {
      ...journey,
      completedDays: config.completedDays,
      elapsedDays: config.elapsedDays,
      consistencyPercent,
      canAddSecondHabit: preview === "day75",
      milestones,
      nextMilestone: milestones.find((milestone) => !milestone.isUnlocked) ?? null,
    };
  });

  return {
    habitJourneys,
    currentJourneyHabitId: selectedHabitId,
    canAddSecondHabit: preview === "day75" || habitJourneys.some((journey) => journey.canAddSecondHabit),
  };
}
