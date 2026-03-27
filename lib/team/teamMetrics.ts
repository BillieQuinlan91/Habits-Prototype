import { TeamDailyRingData, TeamDayCheckIn } from "@/lib/types";

export function getDailyCompletionPercent(checkedInCount: number, totalCount: number) {
  if (totalCount === 0) {
    return 0;
  }

  return Math.round((checkedInCount / totalCount) * 100);
}

export function getMemberCompletionPercent(completedDays: number, totalDays: number) {
  if (totalDays === 0) {
    return 0;
  }

  return Math.round((completedDays / totalDays) * 100);
}

export function getPerfectDays(days: TeamDailyRingData[]) {
  return days.filter((day) => day.completionPercent === 100).length;
}

export function getTeamCompletionPercent(days: TeamDayCheckIn[], memberCount: number) {
  const totalCheckIns = days.reduce((sum, day) => sum + day.checkedInUserIds.length, 0);
  const totalPossible = memberCount * days.length;

  if (totalPossible === 0) {
    return 0;
  }

  return Math.round((totalCheckIns / totalPossible) * 100);
}
