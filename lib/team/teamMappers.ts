import { format, parseISO } from "date-fns";

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
  getWeeklyTeamCompletionPercent,
} from "@/lib/team/teamMetrics";
import { toDateKey } from "@/lib/utils";

const MEMBER_COLORS = ["#6C8CF5", "#6FAF8F", "#FF8A7A", "#7C9A92", "#9C7EE8", "#E2A64B"] as const;

export function getTeamMemberColor(index: number) {
  return MEMBER_COLORS[index % MEMBER_COLORS.length];
}

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
  days: TeamDayCheckIn[];
  members: Array<{ userId: string; name: string; checkedInDates: string[] }>;
}): TeamPageData {
  const memberCount = input.members.length;
  const dailyRings = mapWeekDataToDailyRingData(input.days, memberCount);
  const members: TeamMemberProgress[] = input.members
    .map((member, index) => {
      const completedDays = member.checkedInDates.length;
      return {
        userId: member.userId,
        name: member.name,
        color: getTeamMemberColor(index),
        completedDays,
        totalDays: input.days.length,
        completionPercent: getMemberCompletionPercent(completedDays, input.days.length),
        checkedInDates: member.checkedInDates,
      };
    })
    .sort((a, b) => b.completionPercent - a.completionPercent || a.name.localeCompare(b.name));

  return {
    teamId: input.teamId,
    teamName: input.teamName,
    memberCount,
    perfectDays: getPerfectDays(dailyRings),
    weeklyCompletionPercent: getWeeklyTeamCompletionPercent(input.days, memberCount),
    days: input.days,
    dailyRings,
    members,
  };
}
