import { addDays, format } from "date-fns";

import {
  demoHabitLogs,
  demoHabitTemplates,
  demoOrganizations,
  demoProfile,
  demoTribes,
  demoUserHabits,
} from "@/lib/demo/data";
import { mapTeamPageData } from "@/lib/team/teamMappers";
import { calculateStreak, calculateUserWeeklyScore } from "@/lib/score";
import { isForcedDemoMode } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  CircleDashboard,
  HabitLog,
  HabitTemplate,
  IntegrationInterest,
  NotificationPreference,
  OrganizationRanking,
  Profile,
  TeamPageData,
  TodayHabitItem,
  Tribe,
  UserHabit,
} from "@/lib/types";
import { getMonthDateKeys, getWeekDateKeys, getWeekWindow, toDateKey } from "@/lib/utils";

type AppBootstrap = {
  profile: Profile | null;
  habits: TodayHabitItem[];
  weekLogs: HabitLog[];
  templates: HabitTemplate[];
  organizations: { id: string; name: string }[];
  tribes: Tribe[];
  circleDashboard: CircleDashboard | null;
  teamPageData: TeamPageData | null;
  organizationRankings: OrganizationRanking[];
  integrationInterests: IntegrationInterest[];
  notificationPreferences: NotificationPreference | null;
  isDemo: boolean;
};

export async function getAppBootstrap(): Promise<AppBootstrap> {
  if (isForcedDemoMode()) {
    return getDemoBootstrap();
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return getDemoBootstrap();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      profile: null,
      habits: [],
      weekLogs: [],
      templates: [],
      organizations: demoOrganizations,
      tribes: [],
      circleDashboard: null,
      teamPageData: null,
      organizationRankings: [],
      integrationInterests: [],
      notificationPreferences: null,
      isDemo: false,
    };
  }

  const today = toDateKey();
  const monthStart = getMonthDateKeys()[0];

  const [
    profileResult,
    habitsResult,
    logsResult,
    templatesResult,
    tribesResult,
    organizationsResult,
    integrationResult,
    notificationResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("*, tribe:tribes(*, organization:organizations(*)), organization:organizations(*)")
      .eq("id", user.id)
      .single(),
    supabase
      .from("user_habits")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("is_primary", { ascending: false })
      .order("created_at"),
    supabase.from("habit_logs").select("*").eq("user_id", user.id).gte("log_date", monthStart),
    supabase.from("habit_templates").select("*").order("sort_order"),
    supabase.from("tribe_member_counts").select("*").order("name"),
    supabase.from("organizations").select("*").order("name"),
    supabase.from("integration_interest").select("*").eq("user_id", user.id),
    supabase.from("notification_preferences").select("*").eq("user_id", user.id).maybeSingle(),
  ]);

  const habits = ((habitsResult.data ?? []) as UserHabit[]).map((habit) => ({
    ...habit,
    log:
      ((logsResult.data ?? []) as HabitLog[]).find(
        (log) => log.user_habit_id === habit.id && log.log_date === today,
      ) ?? null,
  }));

  const profile = (profileResult.data as Profile | null) ?? null;
  const circleDashboard = profile?.tribe_id ? await getCircleDashboard(profile.tribe_id, user.id) : null;
  const teamPageData = profile?.tribe_id ? await getTeamPageData(profile.tribe_id) : null;

  return {
    profile,
    habits,
    weekLogs: (logsResult.data ?? []) as HabitLog[],
    templates: (templatesResult.data ?? []) as HabitTemplate[],
    organizations: (organizationsResult.data ?? []) as { id: string; name: string }[],
    tribes: ((tribesResult.data ?? []) as Array<Tribe & { organization_name?: string }>).map((tribe) => ({
      ...tribe,
      member_count: Number(tribe.member_count ?? 0),
      organization: tribe.organization_name
        ? { id: tribe.organization_id ?? "", name: tribe.organization_name }
        : null,
    })),
    circleDashboard,
    teamPageData,
    organizationRankings: [],
    integrationInterests: (integrationResult.data ?? []) as IntegrationInterest[],
    notificationPreferences: (notificationResult.data as NotificationPreference | null) ?? null,
    isDemo: false,
  };
}

async function getTeamPageData(tribeId: string): Promise<TeamPageData | null> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return getDemoBootstrap().teamPageData;
  }

  const weekDates = getWeekDateKeys();
  const monthDates = getMonthDateKeys();

  const [{ data: circle }, { data: memberRows }] = await Promise.all([
    supabase.from("tribes").select("*").eq("id", tribeId).single(),
    supabase.from("tribe_members").select("user_id").eq("tribe_id", tribeId),
  ]);

  if (!circle || !memberRows?.length) {
    return null;
  }

  const userIds = memberRows.map((member) => member.user_id);
  const [{ data: profiles }, { data: habits }, { data: logs }] = await Promise.all([
    supabase.from("profiles").select("id, full_name").in("id", userIds),
    supabase.from("user_habits").select("*").in("user_id", userIds).eq("is_active", true),
    supabase.from("habit_logs").select("*").in("user_id", userIds).gte("log_date", monthDates[0]),
  ]);

  const allHabits = (habits ?? []) as UserHabit[];
  const allLogs = (logs ?? []) as HabitLog[];

  return mapTeamPageData({
    teamId: circle.id,
    teamName: circle.name,
    weekDays: weekDates.map((date) => ({
      date,
      checkedInUserIds: userIds.filter((userId) => {
        const memberHabits = allHabits.filter((habit) => habit.user_id === userId);
        const memberLogs = allLogs.filter((log) => log.user_id === userId);
        return getCheckinStatusForDate(memberHabits, memberLogs, date) === "checked_in";
      }),
    })),
    monthDays: monthDates.map((date) => ({
      date,
      checkedInUserIds: userIds.filter((userId) => {
        const memberHabits = allHabits.filter((habit) => habit.user_id === userId);
        const memberLogs = allLogs.filter((log) => log.user_id === userId);
        return getCheckinStatusForDate(memberHabits, memberLogs, date) === "checked_in";
      }),
    })),
    members: userIds.map((userId) => {
      const memberHabits = allHabits.filter((habit) => habit.user_id === userId);
      const memberLogs = allLogs.filter((log) => log.user_id === userId);
      return {
        userId,
        name: profiles?.find((profile) => profile.id === userId)?.full_name ?? "Member",
        checkedInDates: weekDates.filter(
          (date) => getCheckinStatusForDate(memberHabits, memberLogs, date) === "checked_in",
        ),
      };
    }),
  });
}

async function getCircleDashboard(tribeId: string, currentUserId: string): Promise<CircleDashboard | null> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return getDemoBootstrap().circleDashboard;
  }

  const today = toDateKey();
  const { start } = getWeekWindow();
  const weekStart = format(start, "yyyy-MM-dd");
  const recentStart = format(addDays(new Date(), -13), "yyyy-MM-dd");

  const [{ data: circle }, { data: memberRows }, { data: reactions }, { data: comments }] = await Promise.all([
    supabase.from("tribes").select("*, organization:organizations(*)").eq("id", tribeId).single(),
    supabase.from("tribe_members").select("user_id").eq("tribe_id", tribeId),
    supabase.from("member_reactions").select("*").eq("week_start_date", weekStart),
    supabase.from("member_comments").select("*").eq("week_start_date", weekStart),
  ]);

  if (!circle || !memberRows?.length) {
    return null;
  }

  const userIds = memberRows.map((member) => member.user_id);
  const [{ data: profiles }, { data: habits }, { data: logs }] = await Promise.all([
    supabase.from("profiles").select("id, full_name").in("id", userIds),
    supabase
      .from("user_habits")
      .select("*")
      .in("user_id", userIds)
      .eq("is_active", true)
      .order("is_primary", { ascending: false })
      .order("created_at"),
    supabase.from("habit_logs").select("*").in("user_id", userIds).gte("log_date", recentStart),
  ]);

  const memberStates = userIds.map((userId) => {
    const memberHabits = ((habits ?? []) as UserHabit[]).filter((habit) => habit.user_id === userId);
    const memberLogs = ((logs ?? []) as HabitLog[]).filter((log) => log.user_id === userId);
    const todayStatus = getCheckinStatusForDate(memberHabits, memberLogs, today);
    const weeklyScore = calculateUserWeeklyScore(memberHabits, memberLogs);

    return {
      user_id: userId,
      full_name: profiles?.find((profile) => profile.id === userId)?.full_name ?? "Member",
      status: todayStatus,
      streak: calculateStreak(memberHabits, memberLogs),
      percentage: weeklyScore.percentage,
      isCurrentUser: userId === currentUserId,
      checkedInAt:
        memberLogs.find((log) => log.log_date === today && log.completed)?.created_at ?? null,
      reactions: (reactions ?? []).filter((reaction) => reaction.to_user_id === userId).map((reaction) => reaction.emoji),
      latestComment: (comments ?? []).find((comment) => comment.to_user_id === userId)?.message,
    };
  });

  const checkedInCount = memberStates.filter((member) => member.status === "checked_in").length;
  const missedCount = memberStates.filter((member) => member.status === "missed").length;
  const pendingCount = memberStates.length - checkedInCount - missedCount;
  const currentUserStatus = memberStates.find((member) => member.user_id === currentUserId)?.status ?? "pending";

  const activity = buildCircleActivity(memberStates, comments ?? []);

  return {
    circle: circle as Tribe,
    memberCount: memberStates.length,
    checkedInCount,
    missedCount,
    pendingCount,
    completionPercentage: memberStates.length ? checkedInCount / memberStates.length : 0,
    circleStreak: calculateCircleStreak(
      userIds,
      (habits ?? []) as UserHabit[],
      (logs ?? []) as HabitLog[],
    ),
    members: memberStates,
    currentUserStatus,
    accountabilityMessage: buildAccountabilityMessage({
      checkedInCount,
      memberCount: memberStates.length,
      currentUserStatus,
    }),
    activity,
  };
}

function getCheckinStatusForDate(habits: UserHabit[], logs: HabitLog[], date: string) {
  const activeHabitIds = habits.filter((habit) => habit.is_active).map((habit) => habit.id);
  const dayLogs = logs.filter(
    (log) => activeHabitIds.includes(log.user_habit_id) && log.log_date === date,
  );

  if (dayLogs.some((log) => !log.completed)) {
    return "missed" as const;
  }

  if (
    activeHabitIds.length > 0 &&
    activeHabitIds.every((habitId) => dayLogs.some((log) => log.user_habit_id === habitId && log.completed))
  ) {
    return "checked_in" as const;
  }

  return "pending" as const;
}

function calculateCircleStreak(userIds: string[], habits: UserHabit[], logs: HabitLog[]) {
  let streak = 0;

  for (let offset = 0; offset < 30; offset += 1) {
    const date = format(addDays(new Date(), -offset), "yyyy-MM-dd");
    const everyoneCheckedIn = userIds.every((userId) => {
      const memberHabits = habits.filter((habit) => habit.user_id === userId);
      const memberLogs = logs.filter((log) => log.user_id === userId);
      return getCheckinStatusForDate(memberHabits, memberLogs, date) === "checked_in";
    });

    if (!everyoneCheckedIn) {
      break;
    }

    streak += 1;
  }

  return streak;
}

function buildAccountabilityMessage({
  checkedInCount,
  memberCount,
  currentUserStatus,
}: {
  checkedInCount: number;
  memberCount: number;
  currentUserStatus: "checked_in" | "pending" | "missed";
}) {
  if (currentUserStatus === "checked_in") {
    if (checkedInCount === memberCount) {
      return "Everyone is in. The circle held today.";
    }

    return `${checkedInCount} of ${memberCount} are in today. A few people are still on their way.`;
  }

  if (currentUserStatus === "missed") {
    return "Today slipped. The circle will notice, and tomorrow still counts.";
  }

  if (checkedInCount === 0) {
    return "Your circle is waiting.";
  }

  if (checkedInCount === memberCount - 1) {
    return "You're the last one left.";
  }

  return `${checkedInCount} people have already checked in today.`;
}

function buildCircleActivity(
  members: CircleDashboard["members"],
  comments: Array<{ id: string; to_user_id: string; message: string }> = [],
) {
  const commentActivity = comments.slice(0, 3).map((comment) => ({
    id: comment.id,
    text: `${members.find((member) => member.user_id === comment.to_user_id)?.full_name ?? "A member"} received a note: "${comment.message}"`,
  }));

  const reactionActivity = members
    .filter((member) => member.reactions.length)
    .slice(0, 3)
    .map((member, index) => ({
      id: `reaction-${member.user_id}-${index}`,
      text: `${member.full_name} picked up ${member.reactions.join(" ")} this week.`,
    }));

  const combined = [...commentActivity, ...reactionActivity].slice(0, 5);
  if (combined.length) {
    return combined;
  }

  return [
    { id: "default-1", text: "Support will show up here as your circle starts checking in." },
  ];
}

function getDemoBootstrap(): AppBootstrap {
  const habits: TodayHabitItem[] = demoUserHabits.map((habit) => ({
    ...habit,
    log: demoHabitLogs.find((log) => log.user_habit_id === habit.id && log.log_date === toDateKey()) ?? null,
  }));

  const memberHabits: UserHabit[] = [
    ...demoUserHabits,
    { ...demoUserHabits[0], id: "h2", user_id: "u2" },
    { ...demoUserHabits[0], id: "h3", user_id: "u3" },
    { ...demoUserHabits[0], id: "h4", user_id: "u4" },
  ];
  const memberLogs: HabitLog[] = [
    ...demoHabitLogs,
    { id: "u2-l1", user_id: "u2", user_habit_id: "h2", log_date: "2026-03-20", completed: true, progress_value: null, notes: null },
    { id: "u2-l2", user_id: "u2", user_habit_id: "h2", log_date: "2026-03-21", completed: true, progress_value: null, notes: null },
    { id: "u2-l3", user_id: "u2", user_habit_id: "h2", log_date: "2026-03-22", completed: true, progress_value: null, notes: null },
    { id: "u2-l4", user_id: "u2", user_habit_id: "h2", log_date: "2026-03-23", completed: true, progress_value: null, notes: null },
    { id: "u2-l5", user_id: "u2", user_habit_id: "h2", log_date: "2026-03-24", completed: true, progress_value: null, notes: null },
    { id: "u3-l1", user_id: "u3", user_habit_id: "h3", log_date: "2026-03-20", completed: true, progress_value: null, notes: null },
    { id: "u3-l2", user_id: "u3", user_habit_id: "h3", log_date: "2026-03-21", completed: false, progress_value: null, notes: null },
    { id: "u4-l1", user_id: "u4", user_habit_id: "h4", log_date: "2026-03-20", completed: true, progress_value: null, notes: null },
    { id: "u4-l2", user_id: "u4", user_habit_id: "h4", log_date: "2026-03-21", completed: true, progress_value: null, notes: null },
    { id: "u4-l3", user_id: "u4", user_habit_id: "h4", log_date: "2026-03-24", completed: true, progress_value: null, notes: null },
  ];

  const demoMembers = [
    {
      user_id: demoProfile.id,
      full_name: "Mark",
      status: "pending" as const,
      streak: calculateStreak([demoUserHabits[0]], demoHabitLogs),
      percentage: calculateUserWeeklyScore([demoUserHabits[0]], demoHabitLogs).percentage,
      isCurrentUser: true,
      checkedInAt: null,
      reactions: ["👏"],
      latestComment: "Quiet work still counts.",
    },
    {
      user_id: "u2",
      full_name: "Ariana",
      status: "checked_in" as const,
      streak: calculateStreak([memberHabits[1]], memberLogs.filter((log) => log.user_id === "u2")),
      percentage: calculateUserWeeklyScore([memberHabits[1]], memberLogs.filter((log) => log.user_id === "u2")).percentage,
      reactions: ["🎉"],
      latestComment: "Already in for today.",
    },
    {
      user_id: "u3",
      full_name: "Jay",
      status: "pending" as const,
      streak: 0,
      percentage: calculateUserWeeklyScore([memberHabits[2]], memberLogs.filter((log) => log.user_id === "u3")).percentage,
      reactions: ["💪"],
      latestComment: "A short start is still a start.",
    },
    {
      user_id: "u4",
      full_name: "Mina",
      status: "checked_in" as const,
      streak: calculateStreak([memberHabits[3]], memberLogs.filter((log) => log.user_id === "u4")),
      percentage: calculateUserWeeklyScore([memberHabits[3]], memberLogs.filter((log) => log.user_id === "u4")).percentage,
      reactions: [],
      latestComment: "Morning work, handled.",
    },
  ];

  return {
    profile: demoProfile,
    habits,
    weekLogs: demoHabitLogs,
    templates: demoHabitTemplates,
    organizations: demoOrganizations,
    tribes: demoTribes,
    circleDashboard: {
      circle: demoTribes[0],
      memberCount: demoMembers.length,
      checkedInCount: demoMembers.filter((member) => member.status === "checked_in").length,
      missedCount: 0,
      pendingCount: demoMembers.filter((member) => member.status === "pending").length,
      completionPercentage: demoMembers.filter((member) => member.status === "checked_in").length / demoMembers.length,
      circleStreak: 1,
      members: demoMembers,
      currentUserStatus: "pending",
      accountabilityMessage: "2 people have already checked in today.",
      activity: [
        { id: "a1", text: "Ariana picked up 🎉 after checking in early." },
        { id: "a2", text: "Jay received a note: \"A short start is still a start.\""},
      ],
    },
    teamPageData: mapTeamPageData({
      teamId: demoTribes[0].id,
      teamName: demoTribes[0].name,
      weekDays: getWeekDateKeys().map((date) => ({
        date,
        checkedInUserIds:
          date === "2026-03-24"
            ? ["u2", "u4"]
            : date === "2026-03-23"
              ? [demoProfile.id, "u2", "u4"]
              : date === "2026-03-22"
                ? ["u2"]
                : date === "2026-03-21"
                  ? [demoProfile.id, "u2", "u4"]
                  : date === "2026-03-20"
                    ? [demoProfile.id, "u2", "u3", "u4"]
                    : [],
      })),
      monthDays: getMonthDateKeys(new Date("2026-03-24")).map((date) => ({
        date,
        checkedInUserIds:
          date === "2026-03-20"
            ? [demoProfile.id, "u2", "u3", "u4"]
            : date === "2026-03-21"
              ? [demoProfile.id, "u2", "u4"]
              : date === "2026-03-22"
                ? ["u2"]
                : date === "2026-03-23"
                  ? [demoProfile.id, "u2", "u4"]
                  : date === "2026-03-24"
                    ? ["u2", "u4"]
                    : [],
      })),
      members: [
        { userId: demoProfile.id, name: "Mark", checkedInDates: ["2026-03-20", "2026-03-21", "2026-03-23"] },
        { userId: "u2", name: "Ariana", checkedInDates: ["2026-03-20", "2026-03-21", "2026-03-22", "2026-03-23", "2026-03-24"] },
        { userId: "u3", name: "Jay", checkedInDates: ["2026-03-20"] },
        { userId: "u4", name: "Mina", checkedInDates: ["2026-03-20", "2026-03-21", "2026-03-23", "2026-03-24"] },
      ],
    }),
    organizationRankings: [],
    integrationInterests: [
      { id: "i1", user_id: demoProfile.id, integration_name: "Apple Health" },
      { id: "i2", user_id: demoProfile.id, integration_name: "Oura" },
    ],
    notificationPreferences: {
      id: "np1",
      user_id: demoProfile.id,
      daily_enabled: true,
      daily_time: "08:00:00",
      sunday_enabled: true,
    },
    isDemo: true,
  };
}

export async function getTribeSearchResults(query: string) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return demoTribes.filter((tribe) => tribe.name.toLowerCase().includes(query.toLowerCase()));
  }

  const { data } = await supabase.rpc("search_tribes", { search_term: query });
  return (data ?? []) as Tribe[];
}

export function getDemoWeekDates() {
  const { start } = getWeekWindow();
  return Array.from({ length: 7 }, (_, index) => format(addDays(start, index), "yyyy-MM-dd"));
}
