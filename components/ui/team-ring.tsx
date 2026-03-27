"use client";

import { Check, CircleAlert, Clock3 } from "lucide-react";

import { CircleMemberStatus } from "@/lib/types";
import { cn, toPercent } from "@/lib/utils";

const MEMBER_COLORS = [
  "#6C8CF5",
  "#6FAF8F",
  "#FF8A7A",
  "#7C9A92",
  "#9C7EE8",
  "#E2A64B",
] as const;

function getMemberColor(index: number) {
  return MEMBER_COLORS[index % MEMBER_COLORS.length];
}

function describeWaitingOn(members: CircleMemberStatus[]) {
  const remaining = members.filter((member) => member.status !== "checked_in").map((member) => member.full_name);

  if (remaining.length === 0) {
    return "Perfect day";
  }

  if (remaining.length === 1) {
    return `Waiting on ${remaining[0]}`;
  }

  if (remaining.length === 2) {
    return `Waiting on ${remaining[0]} and ${remaining[1]}`;
  }

  return `Waiting on ${remaining[0]}, ${remaining[1]} + ${remaining.length - 2} others`;
}

export function TeamRing({
  members,
  title = "Team ring",
}: {
  members: CircleMemberStatus[];
  title?: string;
}) {
  const size = 224;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const segmentGap = 10;
  const visibleArc = Math.max(circumference / Math.max(members.length, 1) - segmentGap, 0);
  const completion = members.length
    ? members.filter((member) => member.status === "checked_in").length / members.length
    : 0;
  const waitingOn = describeWaitingOn(members);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-foreground/40">Today</p>
          <h2 className="font-display text-3xl font-normal tracking-tight">{title}</h2>
        </div>
      </div>

      <div className="relative mx-auto flex w-full max-w-[260px] items-center justify-center">
        <svg viewBox={`0 0 ${size} ${size}`} className="h-[224px] w-[224px] -rotate-90 overflow-visible">
          {members.map((member, index) => {
            const startOffset = (circumference / Math.max(members.length, 1)) * index;
            const stroke =
              member.status === "checked_in"
                ? getMemberColor(index)
                : member.status === "missed"
                  ? "#C67C74"
                  : "#D9DDE3";

            return (
              <circle
                key={member.user_id}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={stroke}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={`${visibleArc} ${circumference}`}
                strokeDashoffset={-startOffset}
                className={cn(
                  "transition-all duration-500 ease-out",
                  member.status === "checked_in" && completion === 1 ? "animate-pulseSoft" : "",
                )}
              />
            );
          })}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="font-display text-4xl font-normal tracking-tight">{toPercent(completion)}%</p>
          <p className="mt-1 max-w-[140px] text-xs text-foreground/52">{waitingOn}</p>
        </div>
      </div>

      <div className="grid gap-2">
        {members.map((member, index) => (
          <div
            key={member.user_id}
            className="flex items-center justify-between rounded-2xl border border-border/70 bg-surface/50 px-3 py-2"
          >
            <div className="flex items-center gap-3">
              <span
                className="h-3 w-3 rounded-full"
                style={{
                  backgroundColor:
                    member.status === "checked_in"
                      ? getMemberColor(index)
                      : member.status === "missed"
                        ? "#C67C74"
                        : "#D9DDE3",
                }}
              />
              <span className="text-sm font-medium text-foreground/72">
                {member.full_name}
                {member.isCurrentUser ? " (You)" : ""}
              </span>
            </div>

            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs",
                member.status === "checked_in"
                  ? "bg-success/10 text-success"
                  : member.status === "missed"
                    ? "bg-accent3/10 text-accent3"
                    : "bg-foreground/6 text-foreground/48",
              )}
            >
              {member.status === "checked_in" ? <Check className="h-3.5 w-3.5" /> : null}
              {member.status === "pending" ? <Clock3 className="h-3.5 w-3.5" /> : null}
              {member.status === "missed" ? <CircleAlert className="h-3.5 w-3.5" /> : null}
              {member.status === "checked_in"
                ? "Complete"
                : member.status === "missed"
                  ? "Missed"
                  : "Pending"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
