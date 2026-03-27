"use client";

import { formatDayLabel } from "@/lib/team/teamMappers";
import { TeamMemberProgress } from "@/lib/types";

import { TeamMemberProgressRow } from "@/components/team/TeamMemberProgressRow";

export function TeamMemberProgressList({
  members,
  selectedDate,
}: {
  members: TeamMemberProgress[];
  selectedDate?: string;
}) {
  return (
    <div className="space-y-3">
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
            checkedInDates={member.checkedInDates}
            isHighlighted={missedSelectedDate}
            helperText={
              missedSelectedDate && selectedDate ? `Missed ${formatDayLabel(selectedDate)}` : undefined
            }
          />
        );
      })}
    </div>
  );
}
