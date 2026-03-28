"use client";

import { cn } from "@/lib/utils";

const STEP_ACTIVE_COUNTS = [1, 2, 3, 4, 4, 5] as const;
const ACTIVE_MEMBER_STYLES = [
  { borderColor: "#5E9C7D", boxShadow: "0 10px 24px rgba(94,156,125,0.12)" },
  { borderColor: "#6AA887", boxShadow: "0 10px 24px rgba(106,168,135,0.12)" },
  { borderColor: "#78B493", boxShadow: "0 10px 24px rgba(120,180,147,0.12)" },
  { borderColor: "#89C1A0", boxShadow: "0 10px 24px rgba(137,193,160,0.12)" },
  { borderColor: "#9ACCAD", boxShadow: "0 10px 24px rgba(154,204,173,0.12)" },
] as const;

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
        <div className="absolute left-8 right-8 top-1/2 h-8 -translate-y-1/2 rounded-full bg-success/8" />
        <div className="relative flex items-center justify-between">
          {Array.from({ length: 5 }, (_, index) => {
            const isActive = index < activeCount;
            const isPending = index === activeCount && activeCount < 5;
            const activeStyle = ACTIVE_MEMBER_STYLES[index];

            return (
              <div
                key={index}
                className="flex flex-col items-center gap-2"
                aria-hidden="true"
              >
                <div
                  className={cn(
                    "flex items-center justify-center rounded-full border-[3px] transition-all duration-500 ease-out",
                    index === 2 ? "h-14 w-14" : "h-11 w-11",
                    isActive
                      ? "bg-card/98"
                      : isPending
                        ? "border-success/25 bg-card/95"
                        : "border-border/70 bg-card/78",
                  )}
                  style={isActive ? activeStyle : undefined}
                >
                  <div
                    className={cn(
                      "rounded-full transition-all duration-500 ease-out",
                      index === 2 ? "h-4 w-4" : "h-3 w-3",
                      isActive
                        ? "bg-card"
                        : isPending
                          ? "border border-success/24 bg-success/10"
                          : "bg-foreground/14",
                    )}
                  />
                </div>
                <div
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-500 ease-out",
                    index === 2 ? "w-8" : "w-6",
                    isActive ? "bg-success/48" : isPending ? "bg-success/22" : "bg-foreground/12",
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
