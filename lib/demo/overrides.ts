import { CircleDashboard, CircleMemberStatus, HabitLog, TodayHabitItem } from "@/lib/types";
import { toDateKey } from "@/lib/utils";

const DEMO_CHECKIN_KEY = "becoming-demo-checkin-status";
const DEMO_SOCIAL_ACTIVITY_KEY = "becoming-demo-social-activity";
const DEMO_HABIT_LOG_KEY = "becoming-demo-habit-log";

export function writeDemoCheckinStatus(status: "checked_in" | "pending") {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(DEMO_CHECKIN_KEY, status);
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

  window.sessionStorage.setItem(DEMO_HABIT_LOG_KEY, JSON.stringify(payload));
}

export function readDemoHabitLog(): {
  habitId: string;
  completed: boolean;
  progressValue: number | null;
  logDate: string;
} | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(DEMO_HABIT_LOG_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    if (parsed?.logDate !== toDateKey()) {
      window.sessionStorage.removeItem(DEMO_HABIT_LOG_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function applyDemoHabitOverride(habits: TodayHabitItem[]) {
  const override = readDemoHabitLog();

  if (!override) {
    return habits;
  }

  return habits.map((habit) => {
    if (habit.id !== override.habitId) {
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
    currentUserStatus: override,
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
