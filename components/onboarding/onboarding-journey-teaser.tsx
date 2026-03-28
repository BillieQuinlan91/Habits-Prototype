"use client";

import { cn } from "@/lib/utils";

const CIRCLE_CONFIG = [
  { size: 52, color: "stroke-success" },
  { size: 72, color: "stroke-accent" },
  { size: 94, color: "stroke-accent2" },
] as const;

const STEP_PROGRESS = [
  [0.28, 0.08, 0.04],
  [0.72, 0.16, 0.08],
  [1, 0.36, 0.12],
  [1, 0.74, 0.22],
  [1, 1, 0.48],
  [1, 1, 0.9],
] as const;

export function OnboardingJourneyTeaser({
  step,
}: {
  step: number;
}) {
  const stepIndex = Math.min(Math.max(step, 0), STEP_PROGRESS.length - 1);
  const progress = STEP_PROGRESS[stepIndex];

  return (
    <div className="rounded-[28px] bg-surface/50 px-4 py-4">
      <div className="flex items-end justify-center gap-4 sm:gap-5">
        {CIRCLE_CONFIG.map((circle, index) => {
          const stroke = 7;
          const radius = (circle.size - stroke) / 2;
          const circumference = 2 * Math.PI * radius;
          const ratio = progress[index];
          const dashOffset = circumference * (1 - ratio);
          const fillOpacity = index === 0 ? "bg-success/10" : index === 1 ? "bg-accent/10" : "bg-accent2/10";

          return (
            <div key={circle.size} className="relative" aria-hidden="true">
              <div
                className={cn(
                  "absolute inset-0 rounded-full blur-[1px]",
                  fillOpacity,
                  ratio > 0.95 ? "opacity-100" : ratio > 0.45 ? "opacity-80" : "opacity-55",
                )}
              />
              <svg width={circle.size} height={circle.size} viewBox={`0 0 ${circle.size} ${circle.size}`} className="relative">
                <circle
                  cx={circle.size / 2}
                  cy={circle.size / 2}
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  className="text-foreground/10"
                  strokeWidth={stroke}
                />
                <circle
                  cx={circle.size / 2}
                  cy={circle.size / 2}
                  r={radius}
                  fill="none"
                  strokeWidth={stroke}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  className={cn(
                    "origin-center -rotate-90 transition-all duration-500 ease-out",
                    circle.color,
                    ratio > 0.95 ? "opacity-100" : "opacity-75",
                  )}
                  style={{ transformOrigin: "50% 50%" }}
                />
              </svg>
            </div>
          );
        })}
      </div>
    </div>
  );
}
