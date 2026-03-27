"use client";

import { cn } from "@/lib/utils";

export function DailyProgressRing({
  dayLabel,
  completionPercent,
  checkedInCount,
  totalCount,
  isToday,
  isPerfect,
  onClick,
}: {
  dayLabel: string;
  date: string;
  completionPercent: number;
  checkedInCount: number;
  totalCount: number;
  isToday?: boolean;
  isPerfect?: boolean;
  onClick?: () => void;
}) {
  const size = 68;
  const strokeWidth = isToday ? 8 : 7;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference - (completionPercent / 100) * circumference;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${dayLabel}: ${checkedInCount} of ${totalCount} team members checked in`}
      className={cn(
        "flex min-w-[88px] flex-col items-center gap-2 rounded-[24px] px-2 py-3 transition",
        isToday ? "bg-card shadow-soft" : "bg-surface/60",
      )}
    >
      <div className="relative h-[68px] w-[68px]">
        <svg viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#D9DDE3"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={isPerfect ? "#6FAF8F" : "#6C8CF5"}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashoffset}
            className={cn("transition-all duration-500", isPerfect ? "drop-shadow-[0_0_8px_rgba(111,175,143,0.35)]" : "")}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-foreground/72">
          {checkedInCount}/{totalCount}
        </div>
      </div>
      <span className={cn("text-sm", isToday ? "font-medium text-foreground" : "text-foreground/58")}>{dayLabel}</span>
    </button>
  );
}
