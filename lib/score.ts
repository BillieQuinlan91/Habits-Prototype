import { addDays, eachDayOfInterval, format } from "date-fns";

import { HabitLog, TribeLeaderboard, UserHabit, WeeklyMemberScore } from "@/lib/types";
import { clamp, getWeekWindow } from "@/lib/utils";

export function calculateUserWeeklyScore(
  habits: UserHabit[],
  logs: HabitLog[],
  now = new Date(),
) {
  const { start, end } = getWeekWindow(now);
  const lastDay = now.getDay() === 0 ? end : now;
  const days = eachDayOfInterval({ start, end: lastDay });
  const possible = habits.filter((habit) => habit.is_active).length * days.length;
  const completed = logs.filter((log) => {
    const isThisWeek =
      log.log_date >= format(start, "yyyy-MM-dd") &&
      log.log_date <= format(lastDay, "yyyy-MM-dd");
    return isThisWeek && log.completed;
  }).length;

  return {
    completed,
    possible,
    percentage: possible === 0 ? 0 : completed / possible,
  };
}

export function calculateStreak(habits: UserHabit[], logs: HabitLog[], now = new Date()) {
  const activeHabitIds = habits.filter((habit) => habit.is_active).map((habit) => habit.id);
  let streak = 0;

  for (let offset = 0; offset < 30; offset += 1) {
    const date = format(addDays(now, -offset), "yyyy-MM-dd");
    const dayLogs = logs.filter(
      (log) => activeHabitIds.includes(log.user_habit_id) && log.log_date === date && log.completed,
    );

    if (dayLogs.length === activeHabitIds.length && activeHabitIds.length > 0) {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
}

export function buildLeaderboard(
  entries: Array<{
    userId: string;
    fullName: string;
    habits: UserHabit[];
    logs: HabitLog[];
    reactions?: string[];
    latestComment?: string;
  }>,
  now = new Date(),
): TribeLeaderboard["members"] {
  return entries
    .map<WeeklyMemberScore>((entry) => {
      const score = calculateUserWeeklyScore(entry.habits, entry.logs, now);
      const streak = calculateStreak(entry.habits, entry.logs, now);
      return {
        user_id: entry.userId,
        full_name: entry.fullName,
        percentage: clamp(score.percentage, 0, 1),
        streak,
        encouragementNeeded: score.percentage < 0.65,
        habitsCompleted: score.completed,
        totalPossible: score.possible,
        reactions: entry.reactions ?? [],
        latestComment: entry.latestComment,
      };
    })
    .sort((a, b) => b.percentage - a.percentage || b.streak - a.streak);
}

export function calculateTribeWeeklyScore(members: WeeklyMemberScore[]) {
  if (members.length === 0) {
    return 0;
  }

  const total = members.reduce((sum, member) => sum + member.percentage, 0);
  return total / members.length;
}
