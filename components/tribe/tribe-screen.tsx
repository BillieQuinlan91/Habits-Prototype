"use client";

import { useMemo, useState } from "react";
import { CircleDot, MessageCircleHeart } from "lucide-react";

import { MemberSheet } from "@/components/tribe/member-sheet";
import { applyDemoCheckinOverride } from "@/lib/demo/overrides";
import { Card } from "@/components/ui/card";
import { TeamRing } from "@/components/ui/team-ring";
import { CircleDashboard } from "@/lib/types";

export function TribeScreen({
  circleDashboard,
  isDemo = false,
}: {
  circleDashboard: CircleDashboard | null;
  isDemo?: boolean;
}) {
  const dashboard = useMemo(
    () => (isDemo ? applyDemoCheckinOverride(circleDashboard) : circleDashboard),
    [circleDashboard, isDemo],
  );
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const selectedMember = dashboard?.members.find((member) => member.user_id === selectedUserId) ?? null;

  function handleSend(payload: { userId: string; reaction: string | null; message: string }) {
    if (!dashboard) {
      return;
    }

    const member = dashboard.members.find((entry) => entry.user_id === payload.userId);
    void member;
  }

  if (!dashboard) {
    return (
      <Card>
        <p className="font-medium">Join a circle and the shared rhythm appears here.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <Card className="space-y-5">
        <TeamRing members={dashboard.members} eyebrow="Circle" title={dashboard.circle.name} showMembers={false} />
        <p className="text-sm text-foreground/58">{dashboard.accountabilityMessage}</p>
      </Card>

      <div className="space-y-3">
        {dashboard.members.map((member) => (
          <button
            key={member.user_id}
            type="button"
            onClick={() => setSelectedUserId(member.user_id)}
            className="w-full rounded-2xl border border-border bg-card p-4 text-left transition hover:border-accent/30"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <p className="font-medium">
                    {member.full_name} {member.isCurrentUser ? "(You)" : ""}
                  </p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-1 text-xs text-foreground/56">
                    <CircleDot
                      className={`h-3 w-3 ${
                        member.status === "checked_in"
                          ? "fill-success text-success"
                          : member.status === "missed"
                            ? "fill-accent3 text-accent3"
                            : "fill-transparent text-foreground/30"
                      }`}
                    />
                    {member.status === "checked_in"
                      ? "Checked in"
                      : member.status === "missed"
                        ? "Missed"
                        : "Waiting"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-foreground/48">
                  <span>{Math.round(member.percentage * 100)}% this week</span>
                  <span>{member.streak} day streak</span>
                </div>
                <p className="text-sm text-foreground/58">
                  {member.isCurrentUser
                    ? "This is your status for today."
                    : member.status === "checked_in"
                      ? "They’re in. A little celebration would suit."
                      : member.status === "missed"
                        ? "They missed today. A kind nudge tomorrow might help."
                        : "Still waiting. A quick nudge could help."}
                </p>
                {member.latestComment ? (
                  <p className="text-sm text-foreground/48">{member.latestComment}</p>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                {!member.isCurrentUser ? (
                  <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                    {member.status === "checked_in" ? "Celebrate" : "Cheer on"}
                  </span>
                ) : null}
                <MessageCircleHeart className="h-5 w-5 text-foreground/32" />
              </div>
            </div>
          </button>
        ))}
      </div>

      {selectedMember ? (
        <MemberSheet member={selectedMember} onSend={handleSend} onClose={() => setSelectedUserId(null)} />
      ) : null}
    </div>
  );
}
