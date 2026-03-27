import { CircleDashboard, CircleMemberStatus } from "@/lib/types";

const DEMO_CHECKIN_KEY = "becoming-demo-checkin-status";
const DEMO_SOCIAL_ACTIVITY_KEY = "becoming-demo-social-activity";

export function writeDemoCheckinStatus(status: "checked_in" | "pending") {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(DEMO_CHECKIN_KEY, status);
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
