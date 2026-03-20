"use client";

import { useState } from "react";
import { MessageCircleMore } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MEMBER_REACTION_OPTIONS } from "@/lib/constants";
import { WeeklyMemberScore } from "@/lib/types";

export function MemberSheet({
  member,
  onSend,
  onClose,
}: {
  member: WeeklyMemberScore;
  onSend: (payload: { userId: string; reaction: string | null; message: string }) => void;
  onClose: () => void;
}) {
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  function handleSend() {
    onSend({
      userId: member.user_id,
      reaction: selectedReaction,
      message: message.trim(),
    });
    setSent(true);
  }

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

          <div className="rounded-3xl bg-foreground/4 p-4 text-sm text-foreground/58">
            {member.latestComment ?? "A quick note or reaction is enough. Keep it warm and low-friction."}
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

          {sent ? (
            <div className="flex items-center gap-2 rounded-2xl bg-accent/8 px-4 py-3 text-sm text-accent">
              <MessageCircleMore className="h-4 w-4" />
              Encouragement sent.
            </div>
          ) : null}

          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={onClose}>
              Close
            </Button>
            <Button className="flex-1" onClick={handleSend}>
              Send
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
