"use client";

import { format, parseISO } from "date-fns";

import { TeamMonthCellData } from "@/lib/types";
import { cn } from "@/lib/utils";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getCellTone(day: TeamMonthCellData) {
  if (!day.isInCurrentMonth) {
    return "bg-transparent text-foreground/18";
  }

  if (day.completionPercent === 100) {
    return "bg-[#4F6FF7] text-white shadow-[0_10px_24px_rgba(79,111,247,0.18)]";
  }

  if (day.completionPercent >= 75) {
    return "bg-[#728DE9] text-white";
  }

  if (day.completionPercent >= 50) {
    return "bg-[#AFC0F7] text-foreground";
  }

  if (day.completionPercent > 0) {
    return "bg-[#E3EAFD] text-foreground/76";
  }

  return "bg-[#F3F5FA] text-foreground/46";
}

export function MonthlyConsistencyHeatmap({
  days,
  selectedDate,
  onSelectDay,
}: {
  days: TeamMonthCellData[];
  selectedDate?: string;
  onSelectDay?: (date: string) => void;
}) {
  return (
    <div className="space-y-4 px-4 pb-4">
      <div className="grid grid-cols-7 gap-2 text-center text-[11px] uppercase tracking-[0.18em] text-foreground/36">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const isSelected = selectedDate === day.date;
          const fullLabel = format(parseISO(day.date), "EEEE, MMMM d");

          return (
            <button
              key={day.date}
              type="button"
              onClick={() => day.isInCurrentMonth && onSelectDay?.(day.date)}
              aria-label={`${fullLabel}: ${day.checkedInCount} of ${day.totalCount} team members checked in`}
              className={cn(
                "flex aspect-square min-h-[44px] items-start justify-between rounded-[18px] border p-2 text-left transition",
                getCellTone(day),
                day.isInCurrentMonth ? "border-transparent" : "border-dashed border-border/50",
                day.isToday && "ring-1 ring-[#728DE9]/35",
                isSelected && "ring-2 ring-foreground/14",
              )}
            >
              <span className="text-sm font-medium">{day.isInCurrentMonth ? day.dayNumber : ""}</span>
              {day.isInCurrentMonth ? (
                <span className="text-[11px] opacity-72">{day.checkedInCount}/{day.totalCount}</span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
