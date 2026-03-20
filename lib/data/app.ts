import { addDays, format } from "date-fns";

import { demoHabitLogs, demoHabitTemplates, demoOrganizations, demoProfile, demoTribes, demoUserHabits } from "@/lib/demo/data";
import { buildLeaderboard, calculateTribeWeeklyScore } from "@/lib/score";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  HabitLog,
  HabitTemplate,
  IntegrationInterest,
  NotificationPreference,
  OrganizationRanking,
  Profile,
  TodayHabitItem,
  Tribe,
  TribeLeaderboard,
  UserHabit,
} from "@/lib/types";
import { getWeekWindow, toDateKey } from "@/lib/utils";

type AppBootstrap = {
  profile: Profile | null;
  habits: TodayHabitItem[];
  templates: HabitTemplate[];
  organizations: { id: string; name: string }[];
  tribes: Tribe[];
  leaderboard: TribeLeaderboard | null;
  organizationRankings: OrganizationRanking[];
  integrationInterests: IntegrationInterest[];
  notificationPreferences: NotificationPreference | null;
  isDemo: boolean;
};

export async function getAppBootstrap(): Promise<AppBootstrap> {
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
      templates: [],
      organizations: demoOrganizations,
      tribes: [],
      leaderboard: null,
      organizationRankings: [],
      integrationInterests: [],
      notificationPreferences: null,
      isDemo: false,
    };
  }

  const today = toDateKey();
  const { start } = getWeekWindow();
  const weekStart = format(start, "yyyy-MM-dd");

  const [profileResult, habitsResult, logsResult, templatesResult, tribesResult, organizationsResult, integrationResult, notificationResult] =
    await Promise.all([
      supabase.from("profiles").select("*, tribe:tribes(*, organization:organizations(*)), organization:organizations(*)").eq("id", user.id).single(),
      supabase.from("user_habits").select("*").eq("user_id", user.id).eq("is_active", true).order("created_at"),
      supabase.from("habit_logs").select("*").eq("user_id", user.id).gte("log_date", weekStart),
      supabase.from("habit_templates").select("*").order("sort_order"),
      supabase.from("tribe_member_counts").select("*").order("name"),
      supabase.from("organizations").select("*").order("name"),
      supabase.from("integration_interest").select("*").eq("user_id", user.id),
      supabase.from("notification_preferences").select("*").eq("user_id", user.id).maybeSingle(),
    ]);

  const habits = ((habitsResult.data ?? []) as UserHabit[]).map((habit) => ({
    ...habit,
    log: ((logsResult.data ?? []) as HabitLog[]).find(
      (log) => log.user_habit_id === habit.id && log.log_date === today,
    ) ?? null,
  }));

  const profile = (profileResult.data as Profile | null) ?? null;
  const leaderboard = profile?.tribe_id
    ? await getTribeLeaderboard(profile.tribe_id)
    : null;
  const organizationRankings = profile?.organization_id
    ? await getOrganizationRankings(profile.organization_id)
    : [];

  return {
    profile,
    habits,
      templates: (templatesResult.data ?? []) as HabitTemplate[],
    organizations: (organizationsResult.data ?? []) as { id: string; name: string }[],
    tribes: ((tribesResult.data ?? []) as Array<Tribe & { organization_name?: string }>).map((tribe) => ({
      ...tribe,
      member_count: Number(tribe.member_count ?? 0),
      organization: tribe.organization_name ? { id: tribe.organization_id ?? "", name: tribe.organization_name } : null,
    })),
    leaderboard,
    organizationRankings,
    integrationInterests: (integrationResult.data ?? []) as IntegrationInterest[],
    notificationPreferences: (notificationResult.data as NotificationPreference | null) ?? null,
    isDemo: false,
  };
}

async function getTribeLeaderboard(tribeId: string): Promise<TribeLeaderboard | null> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return getDemoBootstrap().leaderboard;
  }

  const { start } = getWeekWindow();
  const weekStart = format(start, "yyyy-MM-dd");

  const [{ data: tribe }, { data: memberRows }, { data: reactions }, { data: comments }] =
    await Promise.all([
      supabase.from("tribes").select("*, organization:organizations(*)").eq("id", tribeId).single(),
      supabase.from("tribe_members").select("user_id").eq("tribe_id", tribeId),
      supabase.from("member_reactions").select("*").eq("week_start_date", weekStart),
      supabase.from("member_comments").select("*").eq("week_start_date", weekStart),
    ]);

  if (!tribe || !memberRows) {
    return null;
  }

  const userIds = memberRows.map((member) => member.user_id);
  const [{ data: profiles }, { data: habits }, { data: logs }] = await Promise.all([
    supabase.from("profiles").select("id, full_name").in("id", userIds),
    supabase.from("user_habits").select("*").in("user_id", userIds).eq("is_active", true),
    supabase.from("habit_logs").select("*").in("user_id", userIds).gte("log_date", weekStart),
  ]);

  const leaderboardMembers = buildLeaderboard(
    userIds.map((userId) => ({
      userId,
      fullName: profiles?.find((profile) => profile.id === userId)?.full_name ?? "Member",
      habits: ((habits ?? []) as UserHabit[]).filter((habit) => habit.user_id === userId),
      logs: ((logs ?? []) as HabitLog[]).filter((log) => log.user_id === userId),
      reactions: (reactions ?? [])
        .filter((reaction) => reaction.to_user_id === userId)
        .map((reaction) => reaction.emoji),
      latestComment: (comments ?? []).find((comment) => comment.to_user_id === userId)?.message,
    })),
  );

  return {
    tribe: tribe as Tribe,
    members: leaderboardMembers,
    tribeScore: calculateTribeWeeklyScore(leaderboardMembers),
  };
}

async function getOrganizationRankings(organizationId: string): Promise<OrganizationRanking[]> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return getDemoBootstrap().organizationRankings;
  }

  const { data } = await supabase.rpc("organization_rankings", {
    org_id: organizationId,
  });

  return ((data ?? []) as Array<{
    tribe_id: string;
    tribe_name: string;
    organization_name: string;
    score: number;
    rank: number;
    member_count: number;
  }>).map((row) => ({
    tribeId: row.tribe_id,
    tribeName: row.tribe_name,
    organizationName: row.organization_name,
    score: Number(row.score),
    rank: Number(row.rank),
    memberCount: Number(row.member_count),
  }));
}

function getDemoBootstrap(): AppBootstrap {
  const habits: TodayHabitItem[] = demoUserHabits.map((habit) => ({
    ...habit,
    log: demoHabitLogs.find((log) => log.user_habit_id === habit.id && log.log_date === toDateKey()) ?? null,
  }));

  const leaderboardMembers = buildLeaderboard([
    {
      userId: demoProfile.id,
      fullName: "Mark",
      habits: demoUserHabits,
      logs: demoHabitLogs,
      reactions: ["🔥", "👏"],
      latestComment: "Locked in all week.",
    },
    {
      userId: "u2",
      fullName: "Ariana",
      habits: demoUserHabits,
      logs: demoHabitLogs.map((log, index) => ({
        ...log,
        id: `${log.id}-${index + 4}`,
        user_id: "u2",
        completed: index !== 2,
      })),
      reactions: ["🎉"],
      latestComment: "Keep your pace. You're close.",
    },
    {
      userId: "u3",
      fullName: "Jay",
      habits: demoUserHabits,
      logs: demoHabitLogs.map((log, index) => ({
        ...log,
        id: `${log.id}-${index + 8}`,
        user_id: "u3",
        completed: index === 0,
      })),
      reactions: ["💪"],
      latestComment: "Your tribe could use your encouragement.",
    },
  ]);

  return {
    profile: demoProfile,
    habits,
    templates: demoHabitTemplates,
    organizations: demoOrganizations,
    tribes: demoTribes,
    leaderboard: {
      tribe: demoTribes[0],
      members: leaderboardMembers,
      tribeScore: calculateTribeWeeklyScore(leaderboardMembers),
    },
    organizationRankings: [
      {
        tribeId: "tribe-midnight-runners",
        tribeName: "Midnight Runners",
        organizationName: "Foundrs",
        score: 0.81,
        rank: 1,
        memberCount: 6,
      },
      {
        tribeId: "tribe-steady-builders",
        tribeName: "Steady Builders",
        organizationName: "Foundrs",
        score: 0.73,
        rank: 2,
        memberCount: 5,
      },
    ],
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
