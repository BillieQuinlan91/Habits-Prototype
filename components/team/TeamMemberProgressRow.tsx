"use client";

import { cn } from "@/lib/utils";

export function TeamMemberProgressRow({
  name,
  color,
  completedDays,
  totalDays,
  completionPercent,
  checkedInDates,
  isHighlighted,
  helperText,
}: {
  name: string;
  color: string;
  completedDays: number;
  totalDays: number;
  completionPercent: number;
  checkedInDates: string[];
  isHighlighted?: boolean;
  helperText?: string;
}) {
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
      <div className="mt-3 flex items-center gap-2">
        {Array.from({ length: totalDays }, (_, index) => {
          const date = checkedInDates[index];
          return (
            <span
              key={`${name}-${index + 1}`}
              className={cn("h-1.5 w-1.5 rounded-full", date ? "bg-foreground/48" : "bg-foreground/14")}
            />
          );
        })}
      </div>
      {helperText ? <p className="mt-3 text-sm text-foreground/54">{helperText}</p> : null}
    </div>
  );
}
