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
        elapsedDays === milestone.targetDays &&
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
