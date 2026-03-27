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
    return "bg-[#7EAE8B] text-white shadow-[0_10px_24px_rgba(126,174,139,0.18)]";
  }

  if (day.completionPercent === 0) {
    return "bg-[#E9D7D2] text-[#7F5D54]";
  }

  if (day.completionPercent >= 75) {
    return "bg-[#E9B47D] text-[#5E3A12]";
  }

  if (day.completionPercent >= 50) {
    return "bg-[#F0CDA8] text-[#6B4720]";
  }

  return "bg-[#F5E6D6] text-[#825E36]";
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
                "flex aspect-square min-h-[44px] items-start rounded-[18px] border p-2 text-left transition",
                getCellTone(day),
                day.isInCurrentMonth ? "border-transparent" : "border-dashed border-border/50",
                day.isToday && "ring-1 ring-[#B88A55]/35",
                isSelected && "ring-2 ring-foreground/14",
              )}
            >
              <span className="text-sm font-medium">{day.isInCurrentMonth ? day.dayNumber : ""}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
