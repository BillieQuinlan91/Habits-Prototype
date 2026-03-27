"use client";

import { cn } from "@/lib/utils";

export function TeamMemberProgressRow({
  name,
  color,
  completedDays,
  totalDays,
  completionPercent,
  period,
  periodDates,
  checkedInDates,
  isHighlighted,
  helperText,
}: {
  name: string;
  color: string;
  completedDays: number;
  totalDays: number;
  completionPercent: number;
  period: "week" | "month";
  periodDates: string[];
  checkedInDates: string[];
  isHighlighted?: boolean;
  helperText?: string;
}) {
  const checkedInSet = new Set(checkedInDates);

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/70 bg-card px-4 py-4 transition",
        isHighlighted ? "border-accent/35 bg-accent/6" : "",
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
          <p className="font-medium">{name}</p>
        </div>
        <span className="text-sm text-foreground/48">
          {completedDays}/{totalDays}
        </span>
      </div>
      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-surface">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${completionPercent}%`, backgroundColor: color }}
        />
      </div>
      <div className={cn("mt-3", period === "week" ? "flex items-center gap-2" : "grid grid-cols-7 gap-1.5")}>
        {periodDates.map((date, index) => {
          return (
            <span
              key={`${name}-${index + 1}`}
              className={cn(
                period === "week" ? "h-1.5 w-1.5" : "h-1.5 w-full min-w-0",
                "rounded-full",
                checkedInSet.has(date) ? "bg-foreground/48" : "bg-foreground/14",
              )}
            />
          );
        })}
      </div>
      {helperText ? <p className="mt-3 text-sm text-foreground/54">{helperText}</p> : null}
    </div>
  );
}
