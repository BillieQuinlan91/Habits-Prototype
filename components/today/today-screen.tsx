"use client";

import { format } from "date-fns";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, CircleUserRound, MessageCircleHeart, Plus, Target } from "lucide-react";

import { HabitJourneyPanel } from "@/components/habit-journey/habit-journey-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PostCheckInPopup } from "@/components/today/post-check-in-popup";
import { MilestonePopup } from "@/components/today/milestone-popup";
import { TeamRing } from "@/components/ui/team-ring";
import {
  applyDemoCheckinOverride,
  applyDemoHabitOverride,
  writeDemoAdditionalHabit,
  writeDemoCheckinStatus,
  writeDemoHabitLog,
  writeDemoMilestoneUnlock,
  writeDemoSocialActivity,
} from "@/lib/demo/overrides";
import {
  deriveHabitJourney,
  getAvailableHabitSlots,
  getCurrentJourneyHabitId,
  getNewlyUnlockedMilestone,
  MAX_ACTIVE_HABITS,
} from "@/lib/habit-journey";
import { createClient } from "@/lib/supabase/client";
import { hasSeenSupportDigest, markSupportDigestSeen } from "@/lib/support";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import {
  CircleDashboard,
  HabitJourneyMilestone,
  HabitJourneyProgress,
  HabitLog,
  HabitMilestoneUnlock,
  PostCheckInPopupState,
  Profile,
  ReceivedSupportDigest,
  TodayHabitItem,
  UserHabit,
} from "@/lib/types";
import { cn, formatIdentityLabel, getWeekWindow, toDateKey } from "@/lib/utils";

const ACKNOWLEDGMENT_DELAY_MS = 1500;
const CONFETTI_COLORS = ["bg-success", "bg-accent", "bg-accent2", "bg-[#F0CDA8]", "bg-white/80"];
const MILESTONE_CONFETTI_COLORS = ["bg-success", "bg-success/80", "bg-accent2", "bg-accent", "bg-[#F0CDA8]"];
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

type AddHabitDraft = {
  name: string;
  minimumLabel: string;
  type: UserHabit["type"];
  targetValue: string;
  targetUnit: string;
};

type MilestonePopupState = {
  milestone: HabitJourneyMilestone;
  habitName: string;
} | null;

const EMPTY_HABIT_DRAFT: AddHabitDraft = {
  name: "",
  minimumLabel: "",
  type: "binary",
  targetValue: "",
  targetUnit: "",
};

function extractMilestoneUnlocks(journeys: HabitJourneyProgress[], userId: string | null): HabitMilestoneUnlock[] {
  if (!userId) {
    return [];
  }

  return journeys.flatMap((journey) =>
    journey.milestones
      .filter((milestone) => milestone.unlockedAt)
      .map((milestone) => ({
        id: `${journey.habitId}-${milestone.phase}`,
        user_id: userId,
        user_habit_id: journey.habitId,
        milestone_phase: milestone.phase,
        unlocked_at: milestone.unlockedAt ?? new Date().toISOString(),
      })),
  );
}

function buildPostCheckInState(circleDashboard: CircleDashboard | null): PostCheckInPopupState {
  const pendingTeammates =
    circleDashboard?.members.filter((member) => !member.isCurrentUser && member.status === "pending") ?? [];

  return pendingTeammates.length
    ? { kind: "pending_teammates", teammates: pendingTeammates }
    : { kind: "celebration" };
}

function renderFullScreenConfetti(colors: string[]) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-40 h-screen overflow-hidden motion-reduce:hidden">
      {CONFETTI_PIECES.map((piece, index) => (
        <span
          key={`${piece.left}-${index}`}
          className={cn(
            "absolute top-0 h-4 w-2 rounded-full opacity-0 animate-confettiFall",
            colors[index % colors.length],
          )}
          style={{
            left: piece.left,
            animationDelay: `${piece.delay}ms`,
            transform: `rotate(${piece.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}

function AddHabitComposer({
  draft,
  saving,
  nextHabitLabel,
  onChange,
  onSave,
  onCancel,
}: {
  draft: AddHabitDraft;
  saving: boolean;
  nextHabitLabel: string;
  onChange: (patch: Partial<AddHabitDraft>) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <Card className="space-y-4 border-accent/20 bg-accent/6">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-accent">
          <Plus className="h-4 w-4" />
          <p className="text-xs uppercase tracking-[0.2em]">{nextHabitLabel}</p>
        </div>
        <h3 className="font-display text-2xl font-normal tracking-tight">Add another habit.</h3>
        <p className="text-sm text-foreground/62">
          Start small again. This habit gets its own journey from day one.
        </p>
      </div>

      <Input
        placeholder="Habit name"
        value={draft.name}
        onChange={(event) => onChange({ name: event.target.value })}
      />
      <Input
        placeholder="Minimum version"
        value={draft.minimumLabel}
        onChange={(event) => onChange({ minimumLabel: event.target.value })}
      />
      <div className="grid grid-cols-3 gap-3">
        <button
          type="button"
          className={cn(
            "rounded-2xl border px-3 py-3 text-sm transition",
            draft.type === "binary" ? "border-accent bg-accent/8" : "border-border bg-card/80",
          )}
          onClick={() => onChange({ type: "binary", targetValue: "", targetUnit: "" })}
        >
          Binary
        </button>
        <button
          type="button"
          className={cn(
            "col-span-2 rounded-2xl border px-3 py-3 text-sm transition",
            draft.type === "measurable" ? "border-accent bg-accent/8" : "border-border bg-card/80",
          )}
          onClick={() => onChange({ type: "measurable" })}
        >
          Measurable
        </button>
      </div>
      {draft.type === "measurable" ? (
        <div className="grid grid-cols-2 gap-3">
          <Input
            type="number"
            inputMode="numeric"
            placeholder="Target"
            value={draft.targetValue}
            onChange={(event) => onChange({ targetValue: event.target.value })}
          />
          <Input
            placeholder="Unit"
            value={draft.targetUnit}
            onChange={(event) => onChange({ targetUnit: event.target.value })}
          />
        </div>
      ) : null}
      <div className="flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={onCancel} disabled={saving}>
          Not now
        </Button>
        <Button className="flex-1" onClick={onSave} disabled={saving}>
          {saving ? "Adding..." : "Add habit"}
        </Button>
      </div>
    </Card>
  );
}

export function TodayScreen({
  profile,
  habits,
  historyLogs,
  habitJourneys,
  currentJourneyHabitId,
  availableHabitSlots,
  circleDashboard,
  receivedSupportDigest,
  isDemo = false,
}: {
  profile: Profile | null;
  habits: TodayHabitItem[];
  historyLogs: HabitLog[];
  habitJourneys: HabitJourneyProgress[];
  currentJourneyHabitId: string | null;
  availableHabitSlots: number;
  circleDashboard: CircleDashboard | null;
  receivedSupportDigest: ReceivedSupportDigest | null;
  isDemo?: boolean;
}) {
  const router = useRouter();
  const todayLabel = format(new Date(), "EEEE d MMMM");
  const [items, setItems] = useState(() => (isDemo ? applyDemoHabitOverride(habits) : habits));
  const [logs, setLogs] = useState(historyLogs);
  const [journeys, setJourneys] = useState(habitJourneys);
  const [milestoneUnlocks, setMilestoneUnlocks] = useState(() =>
    extractMilestoneUnlocks(habitJourneys, profile?.id ?? null),
  );
  const [feedback, setFeedback] = useState<string | null>(null);
  const [popupState, setPopupState] = useState<PostCheckInPopupState>({ kind: "idle" });
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [sharedMessage, setSharedMessage] = useState("");
  const [acknowledgingHabitId, setAcknowledgingHabitId] = useState<string | null>(null);
  const [showSupportDigest, setShowSupportDigest] = useState(false);
  const [milestonePopup, setMilestonePopup] = useState<MilestonePopupState>(null);
  const [showAddHabitComposer, setShowAddHabitComposer] = useState(false);
  const [newHabitDraft, setNewHabitDraft] = useState<AddHabitDraft>(EMPTY_HABIT_DRAFT);
  const [savingNewHabit, setSavingNewHabit] = useState(false);
  const popupTimeoutRef = useRef<number | null>(null);
  const queuedPopupRef = useRef<PostCheckInPopupState>({ kind: "idle" });

  const orderedItems = useMemo(
    () => [...items].sort((a, b) => Number(b.is_primary ?? false) - Number(a.is_primary ?? false)),
    [items],
  );
  const currentJourney = useMemo(() => {
    const currentHabitId = getCurrentJourneyHabitId(journeys) ?? currentJourneyHabitId;
    return journeys.find((journey) => journey.habitId === currentHabitId) ?? journeys[0] ?? null;
  }, [currentJourneyHabitId, journeys]);
  const visibleCircleDashboard = isDemo ? applyDemoCheckinOverride(circleDashboard) : circleDashboard;
  const isAcknowledging = acknowledgingHabitId !== null;
  const derivedHabitSlotLimit = useMemo(
    () => Math.max(availableHabitSlots, getAvailableHabitSlots(journeys)),
    [availableHabitSlots, journeys],
  );
  const canAddAnotherHabit = orderedItems.length < derivedHabitSlotLimit && orderedItems.length < MAX_ACTIVE_HABITS;
  const nextHabitIndex = Math.min(orderedItems.length + 1, MAX_ACTIVE_HABITS);
  const nextHabitLabel = nextHabitIndex === 2 ? "Second habit" : nextHabitIndex === 3 ? "Third habit" : "Another habit";

  useEffect(() => {
    setItems(isDemo ? applyDemoHabitOverride(habits) : habits);
    setLogs(historyLogs);
    setJourneys(habitJourneys);
    setMilestoneUnlocks(extractMilestoneUnlocks(habitJourneys, profile?.id ?? null));
  }, [habits, habitJourneys, historyLogs, isDemo, profile?.id]);

  useEffect(() => {
    if (!receivedSupportDigest?.hasNewSupport) {
      setShowSupportDigest(false);
      return;
    }

    setShowSupportDigest(!hasSeenSupportDigest(receivedSupportDigest));
  }, [receivedSupportDigest]);

  useEffect(() => {
    return () => {
      if (popupTimeoutRef.current) {
        window.clearTimeout(popupTimeoutRef.current);
      }
    };
  }, []);

  function releaseQueuedPopup() {
    const next = queuedPopupRef.current;
    queuedPopupRef.current = { kind: "idle" };
    if (next.kind !== "idle") {
      setPopupState(next);
    }
  }

  function buildNextLog(habit: TodayHabitItem, nextCompleted: boolean, nextProgressValue: number | null) {
    return {
      id: habit.log?.id ?? `temp-${habit.id}`,
      user_id: habit.user_id,
      user_habit_id: habit.id,
      log_date: toDateKey(),
      completed: nextCompleted,
      progress_value: nextProgressValue,
      notes: null,
    };
  }

  function withUpdatedLog(habitsToUpdate: TodayHabitItem[], habitId: string, nextLog: HabitLog) {
    return habitsToUpdate.map((habit) => (habit.id === habitId ? { ...habit, log: nextLog } : habit));
  }

  function withUpdatedHistory(nextLog: HabitLog, currentLogs: HabitLog[]) {
    return [
      ...currentLogs.filter(
        (log) => !(log.user_habit_id === nextLog.user_habit_id && log.log_date === nextLog.log_date),
      ),
      nextLog,
    ];
  }

  function recalculateJourneys(
    nextItems: TodayHabitItem[],
    nextLogs: HabitLog[],
    nextUnlocks: HabitMilestoneUnlock[],
  ) {
    return nextItems.map((habit) => deriveHabitJourney(habit, nextLogs, nextUnlocks));
  }

  async function handleCompletedHabitFlow(
    habit: TodayHabitItem,
    nextItems: TodayHabitItem[],
    nextLogs: HabitLog[],
    baseJourneys: HabitJourneyProgress[],
  ) {
    if (receivedSupportDigest) {
      markSupportDigestSeen(receivedSupportDigest);
      setShowSupportDigest(false);
    }

    const habitJourney = baseJourneys.find((journey) => journey.habitId === habit.id) ?? null;
    const unlockedMilestone = habitJourney ? getNewlyUnlockedMilestone(habitJourney) : null;
    let finalJourneys = baseJourneys;

    if (unlockedMilestone) {
      const nextUnlockEntry: HabitMilestoneUnlock = {
        id: `${habit.id}-${unlockedMilestone.phase}-${Date.now()}`,
        user_id: habit.user_id,
        user_habit_id: habit.id,
        milestone_phase: unlockedMilestone.phase,
        unlocked_at: new Date().toISOString(),
      };

      const persistedUnlock = await persistMilestoneUnlock(nextUnlockEntry);
      if (persistedUnlock) {
        const nextUnlocks = [...milestoneUnlocks, nextUnlockEntry];
        setMilestoneUnlocks(nextUnlocks);
        finalJourneys = recalculateJourneys(nextItems, nextLogs, nextUnlocks);
        setJourneys(finalJourneys);
      }
    }

    const allHabitsCompleted = nextItems.every((item) => Boolean(item.log?.completed));
    const socialPopupState = allHabitsCompleted
      ? buildPostCheckInState(visibleCircleDashboard)
      : ({ kind: "idle" } as PostCheckInPopupState);
    queuedPopupRef.current = socialPopupState;
    setSelectedEmoji(null);
    setSharedMessage("");
    setAcknowledgingHabitId(habit.id);

    if (popupTimeoutRef.current) {
      window.clearTimeout(popupTimeoutRef.current);
    }

    popupTimeoutRef.current = window.setTimeout(() => {
      setAcknowledgingHabitId(null);
      const latestJourney = finalJourneys.find((journey) => journey.habitId === habit.id);
      const latestMilestone =
        unlockedMilestone && latestJourney
          ? latestJourney.milestones.find((milestone) => milestone.phase === unlockedMilestone.phase) ?? null
          : null;

      if (latestMilestone?.isUnlocked) {
        setMilestonePopup({
          milestone: latestMilestone,
          habitName: habit.name,
        });
        return;
      }

      releaseQueuedPopup();
    }, ACKNOWLEDGMENT_DELAY_MS);
  }

  async function persistLog(
    habit: TodayHabitItem,
    completedValue: boolean,
    progressValue: number | null,
    nextItems: TodayHabitItem[],
  ) {
    if (isDemo || !hasSupabaseEnv()) {
      writeDemoHabitLog({
        habitId: habit.id,
        completed: completedValue,
        progressValue,
      });
      writeDemoCheckinStatus(nextItems.every((item) => Boolean(item.log?.completed)) ? "checked_in" : "pending");
      return true;
    }

    const supabase = createClient();
    const { error } = await supabase.from("habit_logs").upsert({
      id: habit.log?.id,
      user_id: habit.user_id,
      user_habit_id: habit.id,
      log_date: toDateKey(),
      completed: completedValue,
      progress_value: progressValue,
    });

    if (error) {
      setFeedback(error.message);
      return false;
    }

    return true;
  }

  async function persistMilestoneUnlock(entry: HabitMilestoneUnlock) {
    if (isDemo || !hasSupabaseEnv()) {
      writeDemoMilestoneUnlock(entry);
      return true;
    }

    const supabase = createClient();
    const { error } = await supabase
      .from("habit_milestones")
      .upsert(
        {
          user_id: entry.user_id,
          user_habit_id: entry.user_habit_id,
          milestone_phase: entry.milestone_phase,
          unlocked_at: entry.unlocked_at,
        },
        { onConflict: "user_habit_id,milestone_phase", ignoreDuplicates: true },
      );

    if (error) {
      setFeedback(error.message);
      return false;
    }

    return true;
  }

  async function toggleHabit(habitId: string) {
    const habit = items.find((entry) => entry.id === habitId);
    if (!habit) {
      return;
    }

    const previousItems = items;
    const previousLogs = logs;
    const previousJourneys = journeys;
    const nextCompleted = !(habit.log?.completed ?? false);
    const nextProgressValue =
      habit.type === "measurable"
        ? habit.log?.progress_value ?? habit.target_value ?? null
        : habit.log?.progress_value ?? null;
    const nextLog = buildNextLog(habit, nextCompleted, nextProgressValue);
    const nextItems = withUpdatedLog(items, habit.id, nextLog);
    const nextLogs = withUpdatedHistory(nextLog, logs);

    setFeedback(null);
    setItems(nextItems);
    setLogs(nextLogs);

    const persisted = await persistLog(habit, nextCompleted, nextProgressValue, nextItems);
    if (!persisted) {
      setItems(previousItems);
      setLogs(previousLogs);
      setJourneys(previousJourneys);
      return;
    }

    const baseJourneys = recalculateJourneys(nextItems, nextLogs, milestoneUnlocks);
    setJourneys(baseJourneys);

    if (!nextCompleted) {
      return;
    }

    await handleCompletedHabitFlow(habit, nextItems, nextLogs, baseJourneys);
  }

  async function updateProgress(habitId: string, rawValue: string) {
    const habit = items.find((entry) => entry.id === habitId);
    if (!habit) {
      return;
    }

    const previousItems = items;
    const previousLogs = logs;
    const previousJourneys = journeys;
    const wasCompleted = Boolean(habit.log?.completed);
    const nextProgressValue = rawValue === "" ? null : Number(rawValue);
    const targetReached =
      habit.target_value !== null &&
      nextProgressValue !== null &&
      nextProgressValue >= habit.target_value;
    const nextCompleted = Boolean(habit.log?.completed) || targetReached;
    const nextLog = buildNextLog(habit, nextCompleted, nextProgressValue);
    const nextItems = withUpdatedLog(items, habit.id, nextLog);
    const nextLogs = withUpdatedHistory(nextLog, logs);

    setFeedback(null);
    setItems(nextItems);
    setLogs(nextLogs);

    const persisted = await persistLog(habit, nextCompleted, nextProgressValue, nextItems);
    if (!persisted) {
      setItems(previousItems);
      setLogs(previousLogs);
      setJourneys(previousJourneys);
      return;
    }

    const baseJourneys = recalculateJourneys(nextItems, nextLogs, milestoneUnlocks);
    setJourneys(baseJourneys);

    if (!wasCompleted && nextCompleted) {
      await handleCompletedHabitFlow(habit, nextItems, nextLogs, baseJourneys);
    }
  }

  async function saveAdditionalHabit() {
    if (!profile) {
      return;
    }

    if (!canAddAnotherHabit) {
      setFeedback("You can unlock another habit after completing a full 75-day streak at 80% consistency.");
      return;
    }

    if (!newHabitDraft.name.trim() || !newHabitDraft.minimumLabel.trim()) {
      setFeedback("Add a habit name and a minimum version first.");
      return;
    }

    setSavingNewHabit(true);
    setFeedback(null);

    const habitId = `habit-${Date.now()}`;
    const nextHabit: TodayHabitItem = {
      id: habitId,
      user_id: profile.id,
      name: newHabitDraft.name.trim(),
      type: newHabitDraft.type,
      target_value:
        newHabitDraft.type === "measurable" && newHabitDraft.targetValue
          ? Number(newHabitDraft.targetValue)
          : null,
      target_unit: newHabitDraft.type === "measurable" ? newHabitDraft.targetUnit.trim() || null : null,
      minimum_label: newHabitDraft.minimumLabel.trim(),
      is_primary: false,
      commitment_start_date: toDateKey(),
      commitment_length_days: 75,
      source_type: "manual",
      is_active: true,
      log: null,
    };

    try {
      if (isDemo || !hasSupabaseEnv()) {
        const demoHabit: UserHabit = {
          id: nextHabit.id,
          user_id: nextHabit.user_id,
          name: nextHabit.name,
          type: nextHabit.type,
          target_value: nextHabit.target_value,
          target_unit: nextHabit.target_unit,
          minimum_label: nextHabit.minimum_label,
          is_primary: false,
          commitment_start_date: nextHabit.commitment_start_date,
          commitment_length_days: 75,
          source_type: "manual",
          is_active: true,
        };
        writeDemoAdditionalHabit(demoHabit);
      } else {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("user_habits")
          .insert({
            user_id: profile.id,
            name: nextHabit.name,
            type: nextHabit.type,
            target_value: nextHabit.target_value,
            target_unit: nextHabit.target_unit,
            minimum_label: nextHabit.minimum_label,
            is_primary: false,
            commitment_start_date: nextHabit.commitment_start_date,
            commitment_length_days: 75,
            source_type: "manual",
            is_active: true,
          })
          .select("*")
          .single();

        if (error || !data) {
          throw error ?? new Error("Unable to add the new habit.");
        }

        nextHabit.id = data.id;
      }

      const nextItems = [...items, nextHabit];
      const nextJourneys = recalculateJourneys(nextItems, logs, milestoneUnlocks);
      setItems(nextItems);
      setJourneys(nextJourneys);
      setShowAddHabitComposer(false);
      setNewHabitDraft(EMPTY_HABIT_DRAFT);
      queuedPopupRef.current = { kind: "idle" };
    } catch (saveError) {
      setFeedback(saveError instanceof Error ? saveError.message : "Unable to add that habit right now.");
    } finally {
      setSavingNewHabit(false);
    }
  }

  if (!orderedItems.length) {
    return (
      <Card>
        <p className="font-medium">Your first habit will appear here after onboarding.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      {isAcknowledging ? renderFullScreenConfetti(CONFETTI_COLORS) : null}
      {milestonePopup ? renderFullScreenConfetti(MILESTONE_CONFETTI_COLORS) : null}

      <div className="space-y-3">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-foreground/40">Today</p>
          <div className="mt-2 flex items-end justify-between gap-3">
            <h2 className="font-display text-3xl font-normal tracking-tight">Keep the promise.</h2>
            <p className="pb-1 text-sm text-foreground/48">{todayLabel}</p>
          </div>
        </div>

        <Card className="space-y-5 bg-surface/70 px-5 py-5">
          <div className="flex items-center gap-2 text-foreground/40">
            <CircleUserRound className="h-4 w-4 text-accent" />
            <p className="text-xs uppercase tracking-[0.2em]">Identity</p>
          </div>
          <p className="font-display text-2xl font-normal leading-tight tracking-tight">
            {formatIdentityLabel(profile?.identity_label)}
          </p>
        </Card>
      </div>

      <HabitJourneyPanel
        journey={currentJourney}
        mode="teaser"
        onOpen={() => router.push("/journey")}
      />

      {receivedSupportDigest && showSupportDigest ? (
        <Card className="space-y-3 bg-surface/70">
          <div className="flex items-center gap-2 text-foreground/40">
            <MessageCircleHeart className="h-4 w-4 text-accent" />
            <p className="text-xs uppercase tracking-[0.2em]">From your team</p>
          </div>
          <div className="space-y-2">
            <p className="font-display text-2xl font-normal tracking-tight">A little encouragement came in.</p>
            {receivedSupportDigest.latestComment ? (
              <p className="text-sm text-foreground/68">“{receivedSupportDigest.latestComment}”</p>
            ) : null}
            {receivedSupportDigest.reactionSummary ? (
              <p className="text-sm text-foreground/52">{receivedSupportDigest.reactionSummary}</p>
            ) : null}
          </div>
        </Card>
      ) : null}

      <div className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-foreground/40">
            {orderedItems.length > 1 ? "Current habits" : "Current habit"}
          </p>
        </div>

        {orderedItems.map((habit, index) => {
          const isCheckedIn = Boolean(habit.log?.completed);
          const isCardAcknowledging = acknowledgingHabitId === habit.id;

          return (
            <Card
              key={habit.id}
              className={cn(
                "relative space-y-4 overflow-hidden",
                isCheckedIn && "border-success/30 bg-success/5",
                isCardAcknowledging && "animate-celebrate",
              )}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-foreground/40">
                    <Target className="h-4 w-4 text-accent" />
                    <p className="text-xs uppercase tracking-[0.2em]">
                      {index === 0 ? "Primary habit" : `Habit ${index + 1}`}
                    </p>
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
                  <p className="font-display text-3xl font-normal tracking-tight">{habit.name}</p>
                  <div className="mt-4 rounded-2xl bg-surface/70 px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-foreground/38">Minimum version</p>
                    <p className="mt-1 text-sm text-foreground/62">
                      {habit.minimum_label ? habit.minimum_label : "Keep the threshold small enough to repeat."}
                    </p>
                  </div>
                </div>
              </div>

              {habit.type === "measurable" ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={habit.log?.progress_value ?? ""}
                    onChange={(event) => void updateProgress(habit.id, event.target.value)}
                    className="h-11 max-w-[140px]"
                    placeholder="Amount"
                  />
                  <span className="text-xs uppercase tracking-[0.18em] text-foreground/38">
                    {habit.target_unit}
                  </span>
                </div>
              ) : null}

              {isCardAcknowledging ? (
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
                  isCardAcknowledging && "animate-celebrate",
                )}
                onClick={() => void toggleHabit(habit.id)}
              >
                {isCardAcknowledging ? (
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <span className="absolute h-20 w-20 rounded-full bg-white/12 animate-burst" />
                  </span>
                ) : null}
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {isCardAcknowledging ? "Habit logged" : habit.log?.completed ? "Habit logged" : "Log habit"}
              </Button>
            </Card>
          );
        })}
      </div>

      {canAddAnotherHabit ? (
        showAddHabitComposer ? (
          <AddHabitComposer
            draft={newHabitDraft}
            saving={savingNewHabit}
            nextHabitLabel={nextHabitLabel}
            onChange={(patch) => setNewHabitDraft((current) => ({ ...current, ...patch }))}
            onSave={() => void saveAdditionalHabit()}
            onCancel={() => {
              setShowAddHabitComposer(false);
              setNewHabitDraft(EMPTY_HABIT_DRAFT);
              releaseQueuedPopup();
            }}
          />
        ) : (
          <Card className="space-y-3 border-accent/20 bg-accent/6">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-accent">Unlocked at day 75</p>
              <h3 className="font-display text-2xl font-normal tracking-tight">You can add another habit.</h3>
              <p className="text-sm text-foreground/62">
                Your current habits stay. The next one starts its own journey from day one.
              </p>
            </div>
            <Button className="w-full" onClick={() => setShowAddHabitComposer(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add another habit
            </Button>
          </Card>
        )
      ) : null}

      {visibleCircleDashboard ? (
        <Card className="space-y-4 overflow-hidden">
          <TeamRing
            members={visibleCircleDashboard.members}
            eyebrow="Shared progress"
            title="Team ring"
            showMembers={false}
            compact
            infoCopy="When all your members log their habit, your circle will complete. Each colour represents a different member. Let's get to 100% together."
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
          Demo mode previews the habit journey without full backend persistence.
        </p>
      ) : null}

      <MilestonePopup
        open={Boolean(milestonePopup)}
        milestone={milestonePopup?.milestone ?? null}
        habitName={milestonePopup?.habitName ?? null}
        allowAddHabit={canAddAnotherHabit}
        onClose={() => {
          setMilestonePopup(null);
          releaseQueuedPopup();
        }}
        onAddHabit={() => {
          setMilestonePopup(null);
          setShowAddHabitComposer(true);
        }}
      />

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
        .upsert(reactionRows, {
          onConflict: "from_user_id,to_user_id,week_start_date,emoji",
          ignoreDuplicates: true,
        });

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
