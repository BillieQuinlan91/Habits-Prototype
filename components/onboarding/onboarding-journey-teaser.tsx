"use client";

import { cn } from "@/lib/utils";

const RING_CONFIG = [
  { stepThreshold: 4, size: 138, stroke: 8, color: "stroke-accent2" },
  { stepThreshold: 2, size: 104, stroke: 8, color: "stroke-accent" },
  { stepThreshold: 1, size: 70, stroke: 8, color: "stroke-success" },
] as const;

const STEP_PROGRESS = [
  [0.12, 0.06, 0.04],
  [0.22, 0.28, 0.16],
  [0.28, 0.52, 0.34],
  [0.38, 1, 0.48],
  [0.62, 1, 0.76],
  [0.94, 1, 1],
] as const;

export function OnboardingJourneyTeaser({
  step,
}: {
  step: number;
}) {
  const stepIndex = Math.min(Math.max(step, 0), STEP_PROGRESS.length - 1);
  const progress = STEP_PROGRESS[stepIndex];

  return (
    <div className="flex justify-center py-1">
      <div className="relative flex h-[138px] w-[138px] items-center justify-center rounded-full bg-surface/65">
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,_rgba(119,164,191,0.12),_transparent_65%)]" />
        {RING_CONFIG.map((ring, index) => {
          const radius = (ring.size - ring.stroke) / 2;
          const circumference = 2 * Math.PI * radius;
          const ratio = progress[index];
          const dashOffset = circumference * (1 - ratio);
          const isEmphasized = stepIndex + 1 >= ring.stepThreshold;

          return (
            <svg
              key={ring.size}
              width={ring.size}
              height={ring.size}
              viewBox={`0 0 ${ring.size} ${ring.size}`}
              className="absolute"
              aria-hidden="true"
            >
              <circle
                cx={ring.size / 2}
                cy={ring.size / 2}
                r={radius}
                fill="none"
                stroke="currentColor"
                className="text-foreground/10"
                strokeWidth={ring.stroke}
              />
              <circle
                cx={ring.size / 2}
                cy={ring.size / 2}
                r={radius}
                fill="none"
                strokeWidth={ring.stroke}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                className={cn(
                  "origin-center -rotate-90 transition-all duration-500 ease-out",
                  ring.color,
                  isEmphasized ? "opacity-100" : "opacity-45",
                )}
                style={{ transformOrigin: "50% 50%" }}
              />
            </svg>
          );
        })}
        <div className="relative z-10 rounded-full border border-white/55 bg-card/90 px-4 py-2 text-center shadow-sm">
          <p className="text-[10px] uppercase tracking-[0.22em] text-foreground/36">Journey</p>
          <p className="mt-1 text-sm text-foreground/56">Starting to take shape</p>
        </div>
      </div>
    </div>
  );
}
