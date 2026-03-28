"use client";

import { cn } from "@/lib/utils";

const STEP_ACTIVE_COUNTS = [1, 2, 3, 4, 5, 6] as const;
const MEMBER_MARKERS = [
  {
    circleClass: "h-10 w-10",
    innerClass: "h-3 w-3",
    barClass: "w-5",
    activeStyle: { borderColor: "#5E9C7D", boxShadow: "0 10px 24px rgba(94,156,125,0.12)" },
  },
  {
    circleClass: "h-12 w-12",
    innerClass: "h-3.5 w-3.5",
    barClass: "w-6",
    activeStyle: { borderColor: "#68A684", boxShadow: "0 10px 24px rgba(104,166,132,0.12)" },
  },
  {
    circleClass: "h-14 w-14",
    innerClass: "h-4 w-4",
    barClass: "w-8",
    activeStyle: { borderColor: "#73AF8C", boxShadow: "0 10px 24px rgba(115,175,140,0.12)" },
  },
  {
    circleClass: "h-11 w-11",
    innerClass: "h-3 w-3",
    barClass: "w-6",
    activeStyle: { borderColor: "#7FBA97", boxShadow: "0 10px 24px rgba(127,186,151,0.12)" },
  },
  {
    circleClass: "h-13 w-13",
    innerClass: "h-3.5 w-3.5",
    barClass: "w-7",
    activeStyle: { borderColor: "#8BC5A1", boxShadow: "0 10px 24px rgba(139,197,161,0.12)" },
  },
  {
    circleClass: "h-10 w-10",
    innerClass: "h-3 w-3",
    barClass: "w-5",
    activeStyle: { borderColor: "#98CFAA", boxShadow: "0 10px 24px rgba(152,207,170,0.12)" },
  },
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
      <div className="relative mx-auto max-w-[360px]">
        <div className="absolute left-5 right-5 top-1/2 h-px -translate-y-1/2 bg-foreground/10" />
        <div className="absolute left-7 right-7 top-1/2 h-8 -translate-y-1/2 rounded-full bg-success/8" />
        <div className="relative flex items-center justify-between">
          {MEMBER_MARKERS.map((marker, index) => {
            const isActive = index < activeCount;
            const isPending = index === activeCount && activeCount < MEMBER_MARKERS.length;

            return (
              <div
                key={index}
                className="flex flex-col items-center gap-2"
                aria-hidden="true"
              >
                <div
                  className={cn(
                    "flex items-center justify-center rounded-full border-[3px] transition-all duration-500 ease-out",
                    marker.circleClass,
                    isActive
                      ? "bg-card/98"
                      : isPending
                        ? "border-success/25 bg-card/95"
                        : "border-border/70 bg-card/78",
                  )}
                  style={isActive ? marker.activeStyle : undefined}
                >
                  <div
                    className={cn(
                      "rounded-full transition-all duration-500 ease-out",
                      marker.innerClass,
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
                    marker.barClass,
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
