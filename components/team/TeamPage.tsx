"use client";

import { useState } from "react";

import { Card } from "@/components/ui/card";
import { TeamPageData } from "@/lib/types";

import { TeamMemberProgressList } from "@/components/team/TeamMemberProgressList";
import { WeeklyDailyRings } from "@/components/team/WeeklyDailyRings";
import { WeeklySummaryHeader } from "@/components/team/WeeklySummaryHeader";

export function TeamPage({
  team,
}: {
  team: TeamPageData | null;
}) {
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);

  if (!team) {
    return (
      <Card>
        <p className="font-medium">Your team view will appear once your group is in place.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <WeeklySummaryHeader
        perfectDays={team.perfectDays}
        weeklyCompletionPercent={team.weeklyCompletionPercent}
      />

      <Card className="space-y-4 overflow-hidden">
        <WeeklyDailyRings days={team.dailyRings} onSelectDay={setSelectedDate} />
      </Card>

      <Card className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-foreground/40">Individual contribution</p>
          <h3 className="font-display text-2xl font-normal">This week, member by member</h3>
        </div>
        <TeamMemberProgressList members={team.members} selectedDate={selectedDate} />
      </Card>
    </div>
  );
}
