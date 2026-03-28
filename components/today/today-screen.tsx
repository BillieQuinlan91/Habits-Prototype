"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, LockKeyhole, Target } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PostCheckInPopup } from "@/components/today/post-check-in-popup";
import { TeamRing } from "@/components/ui/team-ring";
import {
  applyDemoHabitOverride,
  applyDemoCheckinOverride,
  writeDemoCheckinStatus,
  writeDemoHabitLog,
  writeDemoSocialActivity,
} from "@/lib/demo/overrides";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { CircleDashboard, PostCheckInPopupState, Profile, TodayHabitItem } from "@/lib/types";
import { cn, getWeekWindow } from "@/lib/utils";

type CheckInAcknowledgmentState = "idle" | "acknowledging";

const ACKNOWLEDGMENT_DELAY_MS = 1500;
const CONFETTI_COLORS = ["bg-success", "bg-accent", "bg-accent2", "bg-[#F0CDA8]", "bg-white/80"];
const CONFETTI_PIECES = [
  { left: "6%", delay: 0, rotate: -10 },
  { left: "14%", delay: 90, rotate: 18 },
  { left: "23%", delay: 170, rotate: -22 },
  { left: "31%", delay: 240, rotate: 14 },
  { left: "40%", delay: 120, rotate: -8 },
  { left: "49%", delay: 210, rotate: 26 },
  { left: "58%", delay: 60, rotate: -18 },
  { left: "67%", delay: 150, rotate: 20 },
  { left: "76%", delay: 280, rotate: -12 },
  { left: "85%", delay: 110, rotate: 16 },
  { left: "93%", delay: 230, rotate: -24 },
] as const;

export function TodayScreen({
  profile,
  habits,
  circleDashboard,
  isDemo = false,
}: {
  profile: Profile | null;
  habits: TodayHabitItem[];
  circleDashboard: CircleDashboard | null;
  isDemo?: boolean;
}) {
  const router = useRouter();
  const [items, setItems] = useState(() => (isDemo ? applyDemoHabitOverride(habits) : habits));
  const [feedback, setFeedback] = useState<string | null>(null);
  const [popupState, setPopupState] = useState<PostCheckInPopupState>({ kind: "idle" });
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [sharedMessage, setSharedMessage] = useState("");
  const [acknowledgmentState, setAcknowledgmentState] = useState<CheckInAcknowledgmentState>("idle");
  const popupTimeoutRef = useRef<number | null>(null);

  const focusHabit = useMemo(
    () => items.find((habit) => habit.is_primary) ?? items[0] ?? null,
    [items],
  );
  const visibleCircleDashboard = useMemo(
    () => (isDemo ? applyDemoCheckinOverride(circleDashboard) : circleDashboard),
    [circleDashboard, isDemo],
  );
  const isAcknowledging = acknowledgmentState === "acknowledging";
  const isCheckedIn = Boolean(focusHabit?.log?.completed);

  useEffect(() => {
    setItems(isDemo ? applyDemoHabitOverride(habits) : habits);
  }, [habits, isDemo]);

  useEffect(() => {
    return () => {
      if (popupTimeoutRef.current) {
        window.clearTimeout(popupTimeoutRef.current);
      }
    };
  }, []);

  function buildNextLog(habit: TodayHabitItem, nextCompleted: boolean, nextProgressValue: number | null) {
    return {
      id: habit.log?.id ?? `temp-${habit.id}`,
      user_id: habit.user_id,
      user_habit_id: habit.id,
      log_date: new Date().toISOString().slice(0, 10),
      completed: nextCompleted,
      progress_value: nextProgressValue,
      notes: null,
    };
  }

  async function persistLog(habit: TodayHabitItem, completedValue: boolean, progressValue: number | null) {
    if (isDemo || !hasSupabaseEnv()) {
      writeDemoCheckinStatus(completedValue ? "checked_in" : "pending");
      writeDemoHabitLog({
        habitId: habit.id,
        completed: completedValue,
        progressValue,
      });
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.from("habit_logs").upsert({
      id: habit.log?.id,
      user_id: habit.user_id,
      user_habit_id: habit.id,
      log_date: new Date().toISOString().slice(0, 10),
      completed: completedValue,
      progress_value: progressValue,
    });

    if (error) {
      setFeedback(error.message);
      return;
    }

    window.location.reload();
  }

  async function toggleHabit() {
    if (!focusHabit) {
      return;
    }

    const nextCompleted = !(focusHabit.log?.completed ?? false);
    const nextProgressValue =
      focusHabit.type === "measurable"
        ? focusHabit.log?.progress_value ?? focusHabit.target_value ?? null
        : focusHabit.log?.progress_value ?? null;

    const next = items.map((habit) =>
      habit.id === focusHabit.id
        ? { ...habit, log: buildNextLog(habit, nextCompleted, nextProgressValue) }
        : habit,
    );

    setFeedback(null);
    setItems(next);
    await persistLog(focusHabit, nextCompleted, nextProgressValue);
    if (nextCompleted) {
      const pendingTeammates =
        visibleCircleDashboard?.members.filter((member) => !member.isCurrentUser && member.status === "pending") ?? [];

      setSelectedEmoji(null);
      setSharedMessage("");
      setAcknowledgmentState("acknowledging");

      if (popupTimeoutRef.current) {
        window.clearTimeout(popupTimeoutRef.current);
      }

      popupTimeoutRef.current = window.setTimeout(() => {
        setAcknowledgmentState("idle");
        setPopupState(
          pendingTeammates.length
            ? { kind: "pending_teammates", teammates: pendingTeammates }
            : { kind: "celebration" },
        );
      }, ACKNOWLEDGMENT_DELAY_MS);
    }
  }

  async function updateProgress(rawValue: string) {
    if (!focusHabit) {
      return;
    }

    const nextProgressValue = rawValue === "" ? null : Number(rawValue);
    const targetReached =
      focusHabit.target_value !== null &&
      nextProgressValue !== null &&
      nextProgressValue >= focusHabit.target_value;
    const nextCompleted = focusHabit.log?.completed ?? targetReached;

    const next = items.map((habit) =>
      habit.id === focusHabit.id
        ? { ...habit, log: buildNextLog(habit, nextCompleted, nextProgressValue) }
        : habit,
    );

    setFeedback(null);
    setItems(next);
    await persistLog(focusHabit, nextCompleted, nextProgressValue);
  }

  if (!focusHabit) {
    return (
      <Card>
        <p className="font-medium">Your first habit will appear here after onboarding.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      {isAcknowledging ? (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-40 h-screen overflow-hidden motion-reduce:hidden">
          {CONFETTI_PIECES.map((piece, index) => (
            <span
              key={`${piece.left}-${index}`}
              className={cn(
                "absolute top-0 h-4 w-2 rounded-full opacity-0 animate-confettiFall",
                CONFETTI_COLORS[index % CONFETTI_COLORS.length],
              )}
              style={{
                left: piece.left,
                animationDelay: `${piece.delay}ms`,
                transform: `rotate(${piece.rotate}deg)`,
              }}
            />
          ))}
        </div>
      ) : null}

      <div className="space-y-3">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-foreground/40">Today</p>
          <h2 className="mt-2 font-display text-3xl font-normal tracking-tight">Keep the promise.</h2>
        </div>

        <Card className="space-y-3 bg-surface/70">
          <div className="flex items-center gap-2 text-foreground/40">
            <LockKeyhole className="h-4 w-4 text-accent" />
            <p className="text-xs uppercase tracking-[0.2em]">Identity</p>
          </div>
          <p className="font-display text-2xl font-normal leading-tight tracking-tight">
            {profile?.identity_label ?? "I am someone who keeps my promises."}
          </p>
        </Card>
      </div>

      <Card
        className={cn(
          "relative space-y-4 overflow-hidden",
          isCheckedIn && "border-success/30 bg-success/5",
          isAcknowledging && "animate-celebrate",
        )}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-foreground/40">
              <Target className="h-4 w-4 text-accent" />
              <p className="text-xs uppercase tracking-[0.2em]">Current commitment</p>
            </div>
            <Badge className={cn(isCheckedIn && "border-success/20 bg-success/10 text-success")}>
              {isCheckedIn ? "Done today" : "Still to do"}
            </Badge>
          </div>

          <div
            className={cn(
              "rounded-[28px] border border-border/80 bg-card p-5",
              isCheckedIn && "border-success/20 bg-success/5",
            )}
          >
            <p className="font-display text-3xl font-normal tracking-tight">{focusHabit.name}</p>
            <p className="mt-3 text-sm text-foreground/48">
              This is the one thing that counts today.
            </p>
          </div>

          <div className={cn("rounded-2xl bg-surface/70 px-4 py-3", isCheckedIn && "bg-success/8")}>
            <p className="text-xs uppercase tracking-[0.18em] text-foreground/38">Minimum version</p>
            <p className="mt-1 text-sm text-foreground/62">
              {focusHabit.minimum_label
                ? focusHabit.minimum_label
                : "Keep the threshold small enough to repeat."}
            </p>
          </div>
        </div>

        {focusHabit.type === "measurable" ? (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              inputMode="numeric"
              value={focusHabit.log?.progress_value ?? ""}
              onChange={(event) => void updateProgress(event.target.value)}
              className="h-11 max-w-[140px]"
              placeholder="Amount"
            />
            <span className="text-xs uppercase tracking-[0.18em] text-foreground/38">
              {focusHabit.target_unit}
            </span>
          </div>
        ) : null}

        {isAcknowledging ? (
          <div className="relative overflow-hidden rounded-2xl border border-success/20 bg-success/10 px-4 py-3">
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="absolute h-28 w-28 rounded-full border border-success/30 animate-burst" />
              <span className="absolute h-36 w-36 rounded-full border border-success/15 animate-burst [animation-delay:120ms]" />
              <span className="absolute h-44 w-44 rounded-full border border-accent/12 animate-burst [animation-delay:220ms] motion-reduce:hidden" />
            </div>
            <p className="relative text-sm font-medium text-success">That counts. You showed up again today.</p>
          </div>
        ) : null}

        <Button
          className={cn(
            "relative w-full overflow-hidden",
            isCheckedIn && "bg-success text-white hover:bg-success",
            isAcknowledging && "animate-celebrate",
          )}
          onClick={() => void toggleHabit()}
        >
          {isAcknowledging ? (
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="absolute h-20 w-20 rounded-full bg-white/12 animate-burst" />
            </span>
          ) : null}
          <CheckCircle2 className="mr-2 h-4 w-4" />
          {isAcknowledging ? "Checked in" : focusHabit.log?.completed ? "Checked in" : "Check in"}
        </Button>
      </Card>

      {visibleCircleDashboard ? (
        <Card className="space-y-4 overflow-hidden">
          <TeamRing
            members={visibleCircleDashboard.members}
            eyebrow="Shared progress"
            title="Team ring"
            showMembers={false}
            compact
          />
        </Card>
      ) : null}

      {feedback ? (
        <p className="rounded-2xl border border-border bg-card/80 px-4 py-3 text-sm text-foreground/62">
          {feedback}
        </p>
      ) : null}

      {isDemo ? (
        <p className="text-center text-xs text-foreground/40">
          Demo mode previews the first-week rhythm without persistence.
        </p>
      ) : null}

      <PostCheckInPopup
        state={popupState}
        selectedEmoji={selectedEmoji}
        message={sharedMessage}
        onSelectEmoji={setSelectedEmoji}
        onMessageChange={setSharedMessage}
        onSend={() => void handleBulkEncouragement()}
        onSkip={() => {
          setPopupState({ kind: "idle" });
          router.push("/tribe");
        }}
        onClose={() => setPopupState({ kind: "idle" })}
      />
    </div>
  );

  async function handleBulkEncouragement() {
    if (popupState.kind !== "pending_teammates" || !selectedEmoji) {
      return;
    }

    const teammateIds = popupState.teammates.map((teammate) => teammate.user_id);
    setPopupState({ kind: "sending", teammates: popupState.teammates });
    setFeedback(null);

    if (isDemo || !hasSupabaseEnv()) {
      writeDemoSocialActivity({
        id: `demo-${Date.now()}`,
        text: `You sent ${selectedEmoji} to ${popupState.teammates.length} pending teammates.`,
      });
      setPopupState({ kind: "idle" });
      router.push("/tribe");
      return;
    }

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You need to sign in first.");
      }

      const { start } = getWeekWindow();
      const weekStart = start.toISOString().slice(0, 10);

      const reactionRows = teammateIds.map((toUserId) => ({
        from_user_id: user.id,
        to_user_id: toUserId,
        week_start_date: weekStart,
        emoji: selectedEmoji,
      }));

      const { error: reactionError } = await supabase
        .from("member_reactions")
        .upsert(reactionRows, { onConflict: "from_user_id,to_user_id,week_start_date,emoji", ignoreDuplicates: true });

      if (reactionError) {
        throw reactionError;
      }

      if (sharedMessage.trim()) {
        const commentRows = teammateIds.map((toUserId) => ({
          from_user_id: user.id,
          to_user_id: toUserId,
          week_start_date: weekStart,
          message: sharedMessage.trim(),
        }));

        const { error: commentError } = await supabase.from("member_comments").insert(commentRows);
        if (commentError) {
          throw commentError;
        }
      }

      setPopupState({ kind: "idle" });
      router.push("/tribe");
    } catch (sendError) {
      setFeedback(sendError instanceof Error ? sendError.message : "Unable to send encouragement right now.");
      setPopupState({ kind: "pending_teammates", teammates: popupState.teammates });
    }
  }
}
