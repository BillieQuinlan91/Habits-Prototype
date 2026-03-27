import { format, parseISO } from "date-fns";

import { getTeamMemberColor } from "@/lib/team/colors";
import {
  TeamDailyRingData,
  TeamDayCheckIn,
  TeamMemberProgress,
  TeamPageData,
} from "@/lib/types";
import {
  getDailyCompletionPercent,
  getMemberCompletionPercent,
  getPerfectDays,
  getTeamCompletionPercent,
} from "@/lib/team/teamMetrics";
import { toDateKey } from "@/lib/utils";

export function formatDayLabel(date: string) {
  return format(parseISO(date), "EEE");
}

export function mapWeekDataToDailyRingData(
  week: TeamDayCheckIn[],
  memberCount: number,
  todayDate = toDateKey(),
): TeamDailyRingData[] {
  return week.map((day) => {
    const checkedInCount = day.checkedInUserIds.length;
    const completionPercent = getDailyCompletionPercent(checkedInCount, memberCount);

    return {
      date: day.date,
      dayLabel: formatDayLabel(day.date),
      completionPercent,
      checkedInCount,
      totalCount: memberCount,
      isToday: day.date === todayDate,
      isPerfect: completionPercent === 100,
    };
  });
}

export function mapTeamPageData(input: {
  teamId: string;
  teamName: string;
  weekDays: TeamDayCheckIn[];
  monthDays: TeamDayCheckIn[];
  members: Array<{ userId: string; name: string; checkedInDates: string[] }>;
}): TeamPageData {
  const memberCount = input.members.length;
  const weekDailyRings = mapWeekDataToDailyRingData(input.weekDays, memberCount);
  const monthDailyRings = mapWeekDataToDailyRingData(input.monthDays, memberCount);
  const members: TeamMemberProgress[] = input.members
    .map((member, index) => {
      const completedDays = member.checkedInDates.filter((date) =>
        input.weekDays.some((day) => day.date === date),
      ).length;
      return {
        userId: member.userId,
        name: member.name,
        color: getTeamMemberColor(index),
        completedDays,
        totalDays: input.weekDays.length,
        completionPercent: getMemberCompletionPercent(completedDays, input.weekDays.length),
        checkedInDates: member.checkedInDates.filter((date) => input.weekDays.some((day) => day.date === date)),
        highlightDates: member.checkedInDates,
      };
    })
    .sort((a, b) => b.completionPercent - a.completionPercent || a.name.localeCompare(b.name));

  return {
    teamId: input.teamId,
    teamName: input.teamName,
    memberCount,
    perfectDays: getPerfectDays(weekDailyRings),
    weeklyCompletionPercent: getTeamCompletionPercent(input.weekDays, memberCount),
    monthlyPerfectDays: getPerfectDays(monthDailyRings),
    monthlyCompletionPercent: getTeamCompletionPercent(input.monthDays, memberCount),
    weekDays: input.weekDays,
    monthDays: input.monthDays,
    weekDailyRings,
    monthDailyRings,
    members,
  };
}
