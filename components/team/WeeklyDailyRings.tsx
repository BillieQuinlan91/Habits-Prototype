"use client";

import { DailyProgressRing } from "@/components/team/DailyProgressRing";
import { TeamDailyRingData } from "@/lib/types";

export function WeeklyDailyRings({
  days,
  onSelectDay,
}: {
  days: TeamDailyRingData[];
  onSelectDay?: (date: string) => void;
}) {
  return (
    <div className="-mx-4 overflow-x-auto px-4">
      <div className="flex gap-3 pb-1">
        {days.map((day) => (
          <DailyProgressRing
            key={day.date}
            date={day.date}
            dayLabel={day.dayLabel}
            completionPercent={day.completionPercent}
            checkedInCount={day.checkedInCount}
            totalCount={day.totalCount}
            isToday={day.isToday}
            isPerfect={day.isPerfect}
            onClick={onSelectDay ? () => onSelectDay(day.date) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
