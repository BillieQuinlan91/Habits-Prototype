"use client";

import { TeamMemberProgress } from "@/lib/types";

import { TeamMemberProgressRow } from "@/components/team/TeamMemberProgressRow";

export function TeamMemberProgressList({
  members,
  period,
  selectedDate,
  emptyStateTitle,
  emptyStateBody,
}: {
  members: TeamMemberProgress[];
  period: "week" | "month";
  selectedDate?: string;
  emptyStateTitle?: string;
  emptyStateBody?: string;
}) {
  if (!members.length && emptyStateTitle) {
    return (
      <div className="rounded-2xl border border-border/70 bg-surface/70 px-4 py-5">
        <p className="font-medium">{emptyStateTitle}</p>
        {emptyStateBody ? <p className="mt-1 text-sm text-foreground/58">{emptyStateBody}</p> : null}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {members.map((member) => {
        const missedSelectedDate = selectedDate ? !member.highlightDates.includes(selectedDate) : false;

        return (
          <TeamMemberProgressRow
            key={member.userId}
            name={member.name}
            color={member.color}
            completedDays={member.completedDays}
            totalDays={member.totalDays}
            completionPercent={member.completionPercent}
            period={period}
            periodDates={member.periodDates}
            checkedInDates={member.checkedInDates}
            isHighlighted={missedSelectedDate}
          />
        );
      })}
    </div>
  );
}
