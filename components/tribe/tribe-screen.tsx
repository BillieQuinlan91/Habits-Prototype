"use client";

import { useState } from "react";
import { CircleDot, MessageCircleHeart, Sparkles, Users } from "lucide-react";
import { useRouter } from "next/navigation";

import { MemberSheet } from "@/components/tribe/member-sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConstellationWidget } from "@/components/ui/constellation-widget";
import { Progress } from "@/components/ui/progress";
import { CircleDashboard } from "@/lib/types";

export function TribeScreen({
  circleDashboard,
}: {
  circleDashboard: CircleDashboard | null;
}) {
  const router = useRouter();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [activity, setActivity] = useState(circleDashboard?.activity ?? []);
  const selectedMember = circleDashboard?.members.find((member) => member.user_id === selectedUserId) ?? null;

  function handleSend(payload: { userId: string; reaction: string | null; message: string }) {
    if (!circleDashboard) {
      return;
    }

    const member = circleDashboard.members.find((entry) => entry.user_id === payload.userId);
    const description = payload.message
      ? `You sent ${member?.full_name ?? "a member"} a note: "${payload.message}".`
      : `You sent ${member?.full_name ?? "a member"} ${payload.reaction ?? "a little support"}.`;

    setActivity((current) => [{ id: `${payload.userId}-${current.length + 1}`, text: description }, ...current].slice(0, 5));
  }

  if (!circleDashboard) {
    return (
      <Card>
        <p className="font-medium">Join a circle and the shared rhythm appears here.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <Card className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-foreground/40">Circle</p>
            <h2 className="font-display text-3xl font-normal tracking-tight">{circleDashboard.circle.name}</h2>
          </div>
          <Badge>{circleDashboard.circleStreak} day streak</Badge>
        </div>
        <ConstellationWidget
          activeCount={Math.max(1, circleDashboard.checkedInCount)}
          totalCount={Math.max(1, circleDashboard.memberCount)}
          variant="weekly"
        />
        <p className="text-sm text-foreground/58">{circleDashboard.accountabilityMessage}</p>
      </Card>

      <Card className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-foreground/40">Today’s board</p>
            <h3 className="font-display text-2xl font-normal">Who is in?</h3>
          </div>
          <span className="text-sm text-foreground/48">
            {circleDashboard.checkedInCount}/{circleDashboard.memberCount}
          </span>
        </div>
        <Progress value={circleDashboard.completionPercentage * 100} />
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-2xl bg-surface/70 p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-foreground/40">Checked in</p>
            <p className="mt-2 font-medium">{circleDashboard.checkedInCount}</p>
          </div>
          <div className="rounded-2xl bg-surface/70 p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-foreground/40">Waiting</p>
            <p className="mt-2 font-medium">{circleDashboard.pendingCount}</p>
          </div>
          <div className="rounded-2xl bg-surface/70 p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-foreground/40">Missed</p>
            <p className="mt-2 font-medium">{circleDashboard.missedCount}</p>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        {circleDashboard.members.map((member) => (
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
                {member.latestComment ? (
                  <p className="text-sm text-foreground/58">{member.latestComment}</p>
                ) : null}
              </div>
              <MessageCircleHeart className="h-5 w-5 text-foreground/32" />
            </div>
          </button>
        ))}
      </div>

      <Card className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent" />
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-foreground/40">Support</p>
            <h3 className="font-display text-2xl font-normal">Circle activity</h3>
          </div>
        </div>
        <div className="space-y-3">
          {activity.map((entry) => (
            <div key={entry.id} className="rounded-2xl border border-border/70 bg-surface/50 p-3 text-sm text-foreground/62">
              {entry.text}
            </div>
          ))}
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-accent" />
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-foreground/40">Pressure</p>
            <h3 className="font-display text-2xl font-normal">Shared visibility</h3>
          </div>
        </div>
        <p className="text-sm text-foreground/58">
          Everyone sees today’s status. That small amount of social exposure is the mechanism, not the side effect.
        </p>
        <Button variant="secondary" className="w-full" onClick={() => router.push("/today")}>
          Return to today
        </Button>
      </Card>

      {selectedMember ? (
        <MemberSheet member={selectedMember} onSend={handleSend} onClose={() => setSelectedUserId(null)} />
      ) : null}
    </div>
  );
}
