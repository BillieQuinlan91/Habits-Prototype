import { CircleDashboard, CircleMemberStatus, HabitLog, HabitMilestoneUnlock, TodayHabitItem, UserHabit } from "@/lib/types";
import { toDateKey } from "@/lib/utils";

export const DEMO_CHECKIN_KEY = "becoming-demo-checkin-status";
const DEMO_SOCIAL_ACTIVITY_KEY = "becoming-demo-social-activity";
export const DEMO_HABIT_LOG_KEY = "becoming-demo-habit-log";
export const DEMO_MILESTONES_KEY = "becoming-demo-milestones";
export const DEMO_ADDITIONAL_HABITS_KEY = "becoming-demo-additional-habits";
export const DEMO_REMOVED_HABITS_KEY = "becoming-demo-removed-habits";

function writeCookie(name: string, value: string) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=86400; samesite=lax`;
}

export function writeDemoCheckinStatus(status: "checked_in" | "pending") {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(DEMO_CHECKIN_KEY, status);
  writeCookie(DEMO_CHECKIN_KEY, JSON.stringify({ status, date: toDateKey() }));
}

export function writeDemoHabitLog(entry: {
  habitId: string;
  completed: boolean;
  progressValue: number | null;
  logDate?: string;
}) {
  if (typeof window === "undefined") {
    return;
  }

  const payload = {
    habitId: entry.habitId,
    completed: entry.completed,
    progressValue: entry.progressValue,
    logDate: entry.logDate ?? toDateKey(),
  };

  const next = [...readDemoHabitLogs().filter((item) => item.habitId !== payload.habitId), payload];
  window.sessionStorage.setItem(DEMO_HABIT_LOG_KEY, JSON.stringify(next));
  writeCookie(DEMO_HABIT_LOG_KEY, JSON.stringify(next));
}

function parseHabitLogPayload(raw: string | null) {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    const entries = Array.isArray(parsed) ? parsed : [parsed];
    return entries.filter((entry) => entry?.logDate === toDateKey());
  } catch {
    return [];
  }
}

export function readDemoHabitLogs(): Array<{
  habitId: string;
  completed: boolean;
  progressValue: number | null;
  logDate: string;
}> {
  if (typeof window === "undefined") {
    return [];
  }

  const entries = parseHabitLogPayload(window.sessionStorage.getItem(DEMO_HABIT_LOG_KEY));
  window.sessionStorage.setItem(DEMO_HABIT_LOG_KEY, JSON.stringify(entries));
  return entries;
}

export function applyDemoHabitOverride(habits: TodayHabitItem[]) {
  const overrides = readDemoHabitLogs();

  if (!overrides.length) {
    return habits;
  }

  return habits.map((habit) => {
    const override = overrides.find((entry) => entry.habitId === habit.id);
    if (!override) {
      return habit;
    }

    const log: HabitLog = {
      id: habit.log?.id ?? `demo-log-${habit.id}`,
      user_id: habit.user_id,
      user_habit_id: habit.id,
      log_date: override.logDate,
      completed: override.completed,
      progress_value: override.progressValue,
      notes: habit.log?.notes ?? null,
      created_at: habit.log?.created_at,
      updated_at: habit.log?.updated_at,
    };

    return {
      ...habit,
      log,
    };
  });
}

export function readDemoCheckinStatus() {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.sessionStorage.getItem(DEMO_CHECKIN_KEY);
  return value === "checked_in" || value === "pending" ? value : null;
}

export function applyDemoCheckinOverride(circleDashboard: CircleDashboard | null) {
  const override = readDemoCheckinStatus();

  if (!circleDashboard || !override) {
    return circleDashboard;
  }

  const members = circleDashboard.members.map<CircleMemberStatus>((member) =>
    member.isCurrentUser ? { ...member, status: override } : member,
  );
  const checkedInCount = members.filter((member) => member.status === "checked_in").length;
  const missedCount = members.filter((member) => member.status === "missed").length;
  const pendingCount = members.length - checkedInCount - missedCount;

  return {
    ...circleDashboard,
    members,
    checkedInCount,
    missedCount,
    pendingCount,
    completionPercentage: members.length ? checkedInCount / members.length : 0,
    currentUserStatus: override as CircleDashboard["currentUserStatus"],
    accountabilityMessage:
      override === "checked_in"
        ? checkedInCount === members.length
          ? "Perfect day."
          : `${checkedInCount} of ${members.length} are in today.`
        : circleDashboard.accountabilityMessage,
  };
}

export function writeDemoSocialActivity(entry: { id: string; text: string }) {
  if (typeof window === "undefined") {
    return;
  }

  const current = readDemoSocialActivity();
  window.sessionStorage.setItem(DEMO_SOCIAL_ACTIVITY_KEY, JSON.stringify([entry, ...current].slice(0, 5)));
}

export function readDemoMilestoneUnlocks(): HabitMilestoneUnlock[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.sessionStorage.getItem(DEMO_MILESTONES_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeDemoMilestoneUnlock(entry: HabitMilestoneUnlock) {
  if (typeof window === "undefined") {
    return;
  }

  const next = [
    ...readDemoMilestoneUnlocks().filter(
      (item) => !(item.user_habit_id === entry.user_habit_id && item.milestone_phase === entry.milestone_phase),
    ),
    entry,
  ];

  window.sessionStorage.setItem(DEMO_MILESTONES_KEY, JSON.stringify(next));
  writeCookie(DEMO_MILESTONES_KEY, JSON.stringify(next));
}

export function readDemoAdditionalHabits(): UserHabit[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.sessionStorage.getItem(DEMO_ADDITIONAL_HABITS_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeDemoAdditionalHabit(habit: UserHabit) {
  if (typeof window === "undefined") {
    return;
  }

  const next = [...readDemoAdditionalHabits().filter((item) => item.id !== habit.id), habit];
  window.sessionStorage.setItem(DEMO_ADDITIONAL_HABITS_KEY, JSON.stringify(next));
  writeCookie(DEMO_ADDITIONAL_HABITS_KEY, JSON.stringify(next));
}

export function readDemoRemovedHabitIds(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.sessionStorage.getItem(DEMO_REMOVED_HABITS_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : [];
  } catch {
    return [];
  }
}

export function writeDemoRemovedHabitId(habitId: string) {
  if (typeof window === "undefined") {
    return;
  }

  const next = [...new Set([...readDemoRemovedHabitIds(), habitId])];
  window.sessionStorage.setItem(DEMO_REMOVED_HABITS_KEY, JSON.stringify(next));
  writeCookie(DEMO_REMOVED_HABITS_KEY, JSON.stringify(next));
}

export function readDemoSocialActivity(): Array<{ id: string; text: string }> {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.sessionStorage.getItem(DEMO_SOCIAL_ACTIVITY_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
