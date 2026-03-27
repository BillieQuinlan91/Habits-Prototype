import {
  endOfMonth,
  endOfWeek,
  eachDayOfInterval,
  format,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";

import { getTeamMemberColor } from "@/lib/team/colors";
import {
  TeamDailyRingData,
  TeamDayCheckIn,
  TeamMemberProgress,
  TeamMonthCellData,
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
  const weekDateKeys = input.weekDays.map((day) => day.date);
  const monthDateKeys = input.monthDays.map((day) => day.date);
  const weekDailyRings = mapWeekDataToDailyRingData(input.weekDays, memberCount);
  const monthHeatmap = mapMonthDataToHeatmap(input.monthDays, memberCount);
  const weekMembers: TeamMemberProgress[] = input.members
    .map((member, index) => {
      const completedDays = member.checkedInDates.filter((date) =>
        weekDateKeys.includes(date),
      ).length;
      return {
        userId: member.userId,
        name: member.name,
        color: getTeamMemberColor(index),
        completedDays,
        totalDays: weekDateKeys.length,
        completionPercent: getMemberCompletionPercent(completedDays, weekDateKeys.length),
        periodDates: weekDateKeys,
        checkedInDates: member.checkedInDates.filter((date) => weekDateKeys.includes(date)),
        highlightDates: member.checkedInDates.filter((date) => weekDateKeys.includes(date)),
      };
    })
    .sort((a, b) => b.completionPercent - a.completionPercent || a.name.localeCompare(b.name));
  const monthMembers: TeamMemberProgress[] = input.members
    .map((member, index) => {
      const completedDays = member.checkedInDates.filter((date) => monthDateKeys.includes(date)).length;
      return {
        userId: member.userId,
        name: member.name,
        color: getTeamMemberColor(index),
        completedDays,
        totalDays: monthDateKeys.length,
        completionPercent: getMemberCompletionPercent(completedDays, monthDateKeys.length),
        periodDates: monthDateKeys,
        checkedInDates: member.checkedInDates.filter((date) => monthDateKeys.includes(date)),
        highlightDates: member.checkedInDates.filter((date) => monthDateKeys.includes(date)),
      };
    })
    .sort((a, b) => b.completionPercent - a.completionPercent || a.name.localeCompare(b.name));

  return {
    teamId: input.teamId,
    teamName: input.teamName,
    memberCount,
    perfectDays: getPerfectDays(weekDailyRings),
    weeklyCompletionPercent: getTeamCompletionPercent(input.weekDays, memberCount),
    monthlyPerfectDays: monthHeatmap.filter((day) => day.isInCurrentMonth && day.completionPercent === 100).length,
    monthlyCompletionPercent: getTeamCompletionPercent(input.monthDays, memberCount),
    weekDays: input.weekDays,
    monthDays: input.monthDays,
    weekDailyRings,
    monthHeatmap,
    weekMembers,
    monthMembers,
  };
}

export function mapMonthDataToHeatmap(
  monthDays: TeamDayCheckIn[],
  memberCount: number,
  todayDate = toDateKey(),
): TeamMonthCellData[] {
  if (!monthDays.length) {
    return [];
  }

  const monthStart = parseISO(monthDays[0].date);
  const calendarStart = startOfWeek(startOfMonth(monthStart), { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(endOfMonth(monthStart), { weekStartsOn: 1 });
  const lookup = new Map(monthDays.map((day) => [day.date, day]));
  const currentMonthKey = format(monthStart, "yyyy-MM");

  return eachDayOfInterval({ start: calendarStart, end: calendarEnd }).map((day) => {
    const date = format(day, "yyyy-MM-dd");
    const entry = lookup.get(date);
    const checkedInCount = entry?.checkedInUserIds.length ?? 0;
    const completionPercent = getDailyCompletionPercent(checkedInCount, memberCount);

    return {
      date,
      dayNumber: Number(format(day, "d")),
      weekdayIndex: Number(format(day, "i")) - 1,
      completionPercent,
      checkedInCount,
      totalCount: memberCount,
      isToday: date === todayDate,
      isPerfect: completionPercent === 100,
      isInCurrentMonth: format(day, "yyyy-MM") === currentMonthKey,
    };
  });
}
