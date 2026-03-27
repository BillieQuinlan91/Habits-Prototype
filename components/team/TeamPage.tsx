"use client";

import { useState } from "react";

import { Card } from "@/components/ui/card";
import { TeamPageData } from "@/lib/types";
import { cn } from "@/lib/utils";

import { TeamMemberProgressList } from "@/components/team/TeamMemberProgressList";
import { WeeklyDailyRings } from "@/components/team/WeeklyDailyRings";
import { WeeklySummaryHeader } from "@/components/team/WeeklySummaryHeader";

export function TeamPage({
  team,
}: {
  team: TeamPageData | null;
}) {
  const [view, setView] = useState<"week" | "month">("week");
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);

  if (!team) {
    return (
      <Card>
        <p className="font-medium">Your team view will appear once your group is in place.</p>
      </Card>
    );
  }

  const visibleRings = view === "week" ? team.weekDailyRings : team.monthDailyRings;
  const perfectDays = view === "week" ? team.perfectDays : team.monthlyPerfectDays;
  const completionPercent = view === "week" ? team.weeklyCompletionPercent : team.monthlyCompletionPercent;

  return (
    <div className="space-y-5">
      <WeeklySummaryHeader
        perfectDays={perfectDays}
        completionPercent={completionPercent}
        periodLabel={view}
      />

      <Card className="space-y-4 overflow-hidden">
        <div className="flex gap-2 px-4 pt-4">
          {(["week", "month"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setView(option);
                setSelectedDate(undefined);
              }}
              className={cn(
                "rounded-full border px-4 py-2 text-sm transition",
                view === option
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border bg-card text-foreground/56",
              )}
            >
              {option === "week" ? "Week" : "Month"}
            </button>
          ))}
        </div>
        <WeeklyDailyRings days={visibleRings} onSelectDay={setSelectedDate} />
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
