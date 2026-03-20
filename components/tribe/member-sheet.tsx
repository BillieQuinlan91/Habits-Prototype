"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MEMBER_REACTION_OPTIONS } from "@/lib/constants";
import { WeeklyMemberScore } from "@/lib/types";

export function MemberSheet({
  member,
  onClose,
}: {
  member: WeeklyMemberScore;
  onClose: () => void;
}) {
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/30 p-4">
      <Card className="w-full animate-rise rounded-[32px]">
        <div className="space-y-5">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-foreground/40">Support a member</p>
            <h3 className="font-display text-2xl font-semibold">{member.full_name}</h3>
            <p className="mt-2 text-sm text-foreground/58">
              {Math.round(member.percentage * 100)}% this week · {member.streak} day streak
            </p>
          </div>

          <div className="flex gap-2">
            {MEMBER_REACTION_OPTIONS.map((reaction) => (
              <button
                key={reaction}
                type="button"
                onClick={() => setSelectedReaction(reaction)}
                className={`rounded-2xl border px-4 py-3 text-lg transition ${
                  selectedReaction === reaction ? "border-accent bg-accent/8" : "border-border"
                }`}
              >
                {reaction}
              </button>
            ))}
          </div>

          <Input
            placeholder="Optional note"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />

          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={onClose}>
              Close
            </Button>
            <Button className="flex-1">Send</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
