"use client";

import { useMemo, useState } from "react";
import { Flame, MessageCircleHeart, Sparkles } from "lucide-react";

import { MemberSheet } from "@/components/tribe/member-sheet";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { OrganizationRanking, TribeLeaderboard } from "@/lib/types";

export function TribeScreen({
  leaderboard,
  rankings,
}: {
  leaderboard: TribeLeaderboard | null;
  rankings: OrganizationRanking[];
}) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [activity, setActivity] = useState<Array<{ id: string; text: string }>>([
    { id: "a1", text: "Ariana received a 🎉 for a respectable week." },
    { id: "a2", text: "Jay picked up a 💪 from the tribe." },
  ]);
  const selectedMember = leaderboard?.members.find((member) => member.user_id === selectedUserId) ?? null;
  const socialEnergy = useMemo(
    () => leaderboard?.members.reduce((sum, member) => sum + member.reactions.length, 0) ?? 0,
    [leaderboard],
  );

  function handleSend(payload: { userId: string; reaction: string | null; message: string }) {
    if (!leaderboard) {
      return;
    }

    const member = leaderboard.members.find((entry) => entry.user_id === payload.userId);
    const description = payload.message
      ? `You sent ${member?.full_name ?? "a member"} a note: "${payload.message}".`
      : `You sent ${member?.full_name ?? "a member"} ${payload.reaction ?? "a little support"}.`;

    setActivity((current) => [
      { id: `${payload.userId}-${current.length + 1}`, text: description },
      ...current,
    ].slice(0, 5));
  }

  if (!leaderboard) {
    return (
      <Card>
        <p className="font-medium">Join a tribe and the weekly rhythm appears here.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-foreground/40">Tribe</p>
            <h2 className="font-display text-3xl font-semibold tracking-tight">{leaderboard.tribe.name}</h2>
          </div>
          <Badge>{Math.round(leaderboard.tribeScore * 100)}% tribe score</Badge>
        </div>
        <p className="text-sm text-foreground/58">A thoughtful view of the week so far.</p>
        <div className="flex items-center gap-2 text-sm text-foreground/48">
          <Sparkles className="h-4 w-4 text-accent" />
          {socialEnergy} small signals of support this week
        </div>
      </Card>

      <div className="space-y-3">
        {leaderboard.members.map((member, index) => (
          <button
            key={member.user_id}
            type="button"
            onClick={() => setSelectedUserId(member.user_id)}
            className="w-full rounded-[28px] border border-border bg-card/90 p-4 text-left transition hover:border-foreground/20"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-foreground/40">#{index + 1}</span>
                  <p className="font-medium">{member.full_name}</p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-foreground/6 px-2 py-1 text-xs text-foreground/56">
                    <Flame className="h-3 w-3" />
                    {member.streak}
                  </span>
                </div>
                <Progress value={member.percentage * 100} className="max-w-[180px]" />
                <div className="flex items-center gap-2 text-sm text-foreground/48">
                  <span>{Math.round(member.percentage * 100)}%</span>
                  {member.reactions.length ? (
                    <span className="rounded-full bg-foreground/6 px-2 py-1 text-xs text-foreground/56">
                      {member.reactions.join(" ")}
                    </span>
                  ) : null}
                  {member.encouragementNeeded ? (
                    <span className="rounded-full bg-accent/10 px-2 py-1 text-accent">💪 offer support</span>
                  ) : null}
                </div>
              </div>
              <MessageCircleHeart className="h-5 w-5 text-foreground/32" />
            </div>
          </button>
        ))}
      </div>

      {rankings.length ? (
        <Card className="space-y-4">
          <div>
          <p className="text-xs uppercase tracking-[0.24em] text-foreground/40">Organization</p>
          <h3 className="font-display text-2xl font-semibold">Leaderboard</h3>
        </div>
          <div className="space-y-3">
            {rankings.map((ranking) => (
              <div
                key={ranking.tribeId}
                className="flex items-center justify-between rounded-2xl border border-border/70 bg-surface/50 p-3"
              >
                <div>
                  <p className="font-medium">{ranking.tribeName}</p>
                  <p className="text-sm text-foreground/48">{ranking.memberCount} members</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">#{ranking.rank}</p>
                  <p className="text-sm text-foreground/48">{Math.round(ranking.score * 100)}%</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      <Card className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-foreground/40">Recent support</p>
          <h3 className="font-display text-2xl font-semibold">Tribe energy</h3>
        </div>
        <div className="space-y-3">
          {activity.map((entry) => (
            <div key={entry.id} className="rounded-2xl border border-border/70 bg-surface/50 p-3 text-sm text-foreground/62">
              {entry.text}
            </div>
          ))}
        </div>
      </Card>

      {selectedMember ? (
        <MemberSheet
          member={selectedMember}
          onSend={handleSend}
          onClose={() => setSelectedUserId(null)}
        />
      ) : null}
    </div>
  );
}
