"use client";

import { cn } from "@/lib/utils";

const MEMBER_COLORS = [
  "bg-[#4F7A96]",
  "bg-[#6E93AD]",
  "bg-[#8AA9C1]",
  "bg-[#A8BED1]",
  "bg-[#C8D7E3]",
] as const;

const STEP_ACTIVE_COUNTS = [1, 2, 3, 4, 4, 5] as const;

export function OnboardingJourneyTeaser({
  step,
}: {
  step: number;
}) {
  const stepIndex = Math.min(Math.max(step, 0), STEP_ACTIVE_COUNTS.length - 1);
  const activeCount = STEP_ACTIVE_COUNTS[stepIndex];

  return (
    <div className="rounded-[28px] bg-surface/50 px-4 py-4">
      <div className="relative mx-auto max-w-[320px]">
        <div className="absolute left-6 right-6 top-1/2 h-px -translate-y-1/2 bg-foreground/10" />
        <div className="absolute left-8 right-8 top-1/2 h-8 -translate-y-1/2 rounded-full bg-[linear-gradient(90deg,rgba(119,164,191,0.05),rgba(119,164,191,0.12),rgba(119,164,191,0.05))]" />
        <div className="relative flex items-center justify-between">
          {MEMBER_COLORS.map((color, index) => {
            const isActive = index < activeCount;
            const isPending = index === activeCount && activeCount < MEMBER_COLORS.length;

            return (
              <div
                key={`${color}-${index}`}
                className="flex flex-col items-center gap-2"
                aria-hidden="true"
              >
                <div
                  className={cn(
                    "flex items-center justify-center rounded-full border transition-all duration-500 ease-out",
                    index === 2 ? "h-14 w-14" : "h-11 w-11",
                    isActive
                      ? "border-white/55 shadow-[0_10px_24px_rgba(79,122,150,0.16)]"
                      : isPending
                        ? "border-accent/25 bg-card/95"
                        : "border-border/70 bg-card/78",
                    isActive ? color : "",
                  )}
                >
                  <div
                    className={cn(
                      "rounded-full transition-all duration-500 ease-out",
                      index === 2 ? "h-4 w-4" : "h-3 w-3",
                      isActive
                        ? "bg-white/88"
                        : isPending
                          ? "border border-accent/30 bg-accent/10"
                          : "bg-foreground/14",
                    )}
                  />
                </div>
                <div
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-500 ease-out",
                    index === 2 ? "w-8" : "w-6",
                    isActive ? "bg-success/65" : isPending ? "bg-accent/28" : "bg-foreground/12",
                  )}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
