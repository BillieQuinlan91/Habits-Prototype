"use client";

import { PartyPopper, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MEMBER_REACTION_OPTIONS } from "@/lib/constants";
import { CircleMemberStatus, PostCheckInPopupState } from "@/lib/types";

export function PostCheckInPopup({
  state,
  selectedEmoji,
  message,
  onSelectEmoji,
  onMessageChange,
  onSend,
  onSkip,
  onClose,
}: {
  state: PostCheckInPopupState;
  selectedEmoji: string | null;
  message: string;
  onSelectEmoji: (emoji: string) => void;
  onMessageChange: (value: string) => void;
  onSend: () => void;
  onSkip: () => void;
  onClose: () => void;
}) {
  if (state.kind === "idle") {
    return null;
  }

  const teammates: CircleMemberStatus[] =
    state.kind === "pending_teammates" || state.kind === "sending" ? state.teammates : [];

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/35 p-4">
      <Card className="w-full animate-rise rounded-[32px]">
        {state.kind === "celebration" ? (
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-accent">
              <PartyPopper className="h-4 w-4" />
              <p className="text-xs uppercase tracking-[0.24em]">Checked in</p>
            </div>
            <div>
              <h3 className="font-display text-2xl font-normal">The whole team is in.</h3>
              <p className="mt-2 text-sm text-foreground/58">
                Nothing left to chase today. A very respectable result.
              </p>
            </div>
            <Button className="w-full" onClick={onClose}>
              Back to Today
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-foreground/40">Checked in</p>
              <h3 className="mt-2 font-display text-2xl font-normal">A few teammates are still pending.</h3>
              <p className="mt-2 text-sm text-foreground/58">
                Send one encouraging nudge to everyone still left for today.
              </p>
            </div>

            <div className="space-y-2">
              {teammates.map((teammate) => (
                <div
                  key={teammate.user_id}
                  className="flex items-center justify-between rounded-2xl border border-border/70 bg-surface/50 px-3 py-3"
                >
                  <span className="font-medium">{teammate.full_name}</span>
                  <span className="text-sm text-foreground/48">Pending</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              {MEMBER_REACTION_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => onSelectEmoji(emoji)}
                  className={`rounded-2xl border px-4 py-3 text-lg transition ${
                    selectedEmoji === emoji ? "border-accent bg-accent/8" : "border-border"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <Input
              placeholder="Optional shared message"
              value={message}
              onChange={(event) => onMessageChange(event.target.value)}
            />

            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={onSkip} disabled={state.kind === "sending"}>
                Skip
              </Button>
              <Button className="flex-1" onClick={onSend} disabled={state.kind === "sending" || !selectedEmoji}>
                <Send className="mr-2 h-4 w-4" />
                {state.kind === "sending" ? "Sending..." : "Send to all"}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
