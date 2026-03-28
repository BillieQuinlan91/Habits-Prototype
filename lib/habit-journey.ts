import { addDays, differenceInCalendarDays, parseISO, subDays } from "date-fns";

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

export const MAX_ACTIVE_HABITS = 3;

type JourneyRunState = {
  runStartDate: string | null;
  trackedDays: number;
  completedDays: number;
  consistencyPercent: number;
};

function getFinalMilestoneConfig() {
  return HABIT_JOURNEY_MILESTONES.find((milestone) => milestone.phase === "day_75") ?? HABIT_JOURNEY_MILESTONES[2];
}

export function hasUnlockedAdditionalHabitSlotForCounts(completedDays: number, trackedDays: number, consistencyPercent: number) {
  const finalMilestone = getFinalMilestoneConfig();
  return (
    trackedDays >= finalMilestone.targetDays &&
    completedDays >= Math.ceil(finalMilestone.targetDays * finalMilestone.requiredConsistency) &&
    consistencyPercent >= finalMilestone.requiredConsistency
  );
}

export function hasUnlockedAdditionalHabitSlot(journey: HabitJourneyProgress) {
  return hasUnlockedAdditionalHabitSlotForCounts(
    journey.completedDays,
    journey.trackedDays,
    journey.consistencyPercent,
  );
}

export function getAvailableHabitSlots(journeys: HabitJourneyProgress[]) {
  return Math.min(1 + journeys.filter((journey) => hasUnlockedAdditionalHabitSlot(journey)).length, MAX_ACTIVE_HABITS);
}

export function getAvailableHabitSlotsFromUnlocks(milestoneUnlocks: HabitMilestoneUnlock[]) {
  const unlockedHabitIds = new Set(
    milestoneUnlocks
      .filter((entry) => entry.milestone_phase === "day_75")
      .map((entry) => entry.user_habit_id),
  );

  return Math.min(1 + unlockedHabitIds.size, MAX_ACTIVE_HABITS);
}

export function deriveHabitJourney(
  habit: UserHabit,
  logs: HabitLog[],
  milestoneUnlocks: HabitMilestoneUnlock[],
  now = new Date(),
): HabitJourneyProgress {
  const todayKey = toDateKey(now);
  const startDate = habit.commitment_start_date ?? todayKey;
  const finalMilestoneUnlock = milestoneUnlocks.find(
    (entry) => entry.user_habit_id === habit.id && entry.milestone_phase === "day_75",
  );

  if (finalMilestoneUnlock) {
    const milestones: HabitJourneyMilestone[] = HABIT_JOURNEY_MILESTONES.map((milestone) => {
      const unlocked = milestoneUnlocks.find(
        (entry) => entry.user_habit_id === habit.id && entry.milestone_phase === milestone.phase,
      );

      return {
        ...milestone,
        consistencyPercent: milestone.requiredConsistency,
        requiredCompletedDays: Math.ceil(milestone.targetDays * milestone.requiredConsistency),
        isUnlocked: true,
        unlockedAt: unlocked?.unlocked_at ?? finalMilestoneUnlock.unlocked_at,
        isEligibleToday: false,
      };
    });

    return {
      habitId: habit.id,
      habitName: habit.name,
      runStartDate: startDate,
      trackedDays: getFinalMilestoneConfig().targetDays,
      completedDays: Math.ceil(getFinalMilestoneConfig().targetDays * getFinalMilestoneConfig().requiredConsistency),
      consistencyPercent: getFinalMilestoneConfig().requiredConsistency,
      canAddSecondHabit: true,
      milestones,
      nextMilestone: null,
    };
  }

  const currentRun = deriveJourneyRunState(habit, logs, startDate, todayKey);
  const previousRun = deriveJourneyRunState(habit, logs, startDate, toDateKey(subDays(now, 1)));
  const trackedDays = currentRun.trackedDays;
  const completedDays = currentRun.completedDays;
  const consistencyPercent = currentRun.consistencyPercent;

  const milestones: HabitJourneyMilestone[] = HABIT_JOURNEY_MILESTONES.map((milestone) => {
    const unlocked = milestoneUnlocks.find(
      (entry) => entry.user_habit_id === habit.id && entry.milestone_phase === milestone.phase,
    );
    const currentRunUnlocked =
      trackedDays >= milestone.targetDays && completedDays >= Math.ceil(milestone.targetDays * milestone.requiredConsistency);
    const previousRunUnlocked =
      previousRun.trackedDays >= milestone.targetDays &&
      previousRun.completedDays >= Math.ceil(milestone.targetDays * milestone.requiredConsistency);

    return {
      ...milestone,
      consistencyPercent,
      requiredCompletedDays: Math.ceil(milestone.targetDays * milestone.requiredConsistency),
      isUnlocked: currentRunUnlocked,
      unlockedAt: currentRunUnlocked ? unlocked?.unlocked_at ?? null : null,
      isEligibleToday:
        currentRunUnlocked && !previousRunUnlocked,
    };
  });

  return {
    habitId: habit.id,
    habitName: habit.name,
    runStartDate: currentRun.runStartDate,
    trackedDays,
    completedDays,
    consistencyPercent,
    canAddSecondHabit: hasUnlockedAdditionalHabitSlotForCounts(completedDays, trackedDays, consistencyPercent),
    milestones,
    nextMilestone: milestones.find((milestone) => !milestone.isUnlocked) ?? null,
  };
}

function deriveJourneyRunState(
  habit: UserHabit,
  logs: HabitLog[],
  startDate: string,
  endDate: string,
): JourneyRunState {
  if (endDate < startDate) {
    return {
      runStartDate: null,
      trackedDays: 0,
      completedDays: 0,
      consistencyPercent: 0,
    };
  }

  const completedDates = new Set(
    logs
      .filter(
        (log) =>
          log.user_habit_id === habit.id &&
          log.completed &&
          log.log_date >= startDate &&
          log.log_date <= endDate,
      )
      .map((log) => log.log_date),
  );

  let runStartDate: string | null = null;
  let trackedDays = 0;
  let completedDays = 0;
  const totalDays = differenceInCalendarDays(parseISO(endDate), parseISO(startDate));

  for (let index = 0; index <= totalDays; index += 1) {
    const dayKey = toDateKey(addDays(parseISO(startDate), index));
    const completedToday = completedDates.has(dayKey);

    if (runStartDate === null) {
      if (!completedToday) {
        continue;
      }

      runStartDate = dayKey;
      trackedDays = 1;
      completedDays = 1;
      continue;
    }

    trackedDays += 1;
    if (completedToday) {
      completedDays += 1;
    }

    if (completedDays / trackedDays < 0.8) {
      runStartDate = null;
      trackedDays = 0;
      completedDays = 0;
    }
  }

  return {
    runStartDate,
    trackedDays,
    completedDays,
    consistencyPercent: trackedDays > 0 ? completedDays / trackedDays : 0,
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
    return inProgressJourneys.sort((a, b) => a.trackedDays - b.trackedDays)[0].habitId;
  }

  return journeys
    .slice()
    .sort((a, b) => b.trackedDays - a.trackedDays)[0]
    ?.habitId ?? null;
}

export type JourneyPreviewState = "day7" | "day30" | "day75";

const JOURNEY_PREVIEW_MAP: Record<
  JourneyPreviewState,
  { phase: HabitMilestonePhase; completedDays: number; trackedDays: number }
> = {
  day7: { phase: "day_7", completedDays: 6, trackedDays: 7 },
  day30: { phase: "day_30", completedDays: 24, trackedDays: 30 },
  day75: { phase: "day_75", completedDays: 60, trackedDays: 75 },
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
  const consistencyPercent = config.completedDays / config.trackedDays;

  const habitJourneys = journeys.map((journey) => {
    if (journey.habitId !== selectedHabitId) {
      return journey;
    }

    const milestones = journey.milestones.map((milestone) => {
      const targetReached =
        config.trackedDays >= milestone.targetDays && config.completedDays >= milestone.requiredCompletedDays;
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
      runStartDate: config.completedDays > 0 ? new Date().toISOString().slice(0, 10) : null,
      completedDays: config.completedDays,
      trackedDays: config.trackedDays,
      consistencyPercent,
      canAddSecondHabit: hasUnlockedAdditionalHabitSlotForCounts(
        config.completedDays,
        config.trackedDays,
        consistencyPercent,
      ),
      milestones,
      nextMilestone: milestones.find((milestone) => !milestone.isUnlocked) ?? null,
    };
  });

  return {
    habitJourneys,
    currentJourneyHabitId: selectedHabitId,
    canAddSecondHabit: habitJourneys.some((journey) => journey.canAddSecondHabit),
  };
}
