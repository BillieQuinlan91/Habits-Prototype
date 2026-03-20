export type HabitType = "binary" | "measurable";

export type Organization = {
  id: string;
  name: string;
  created_at?: string;
};

export type Tribe = {
  id: string;
  name: string;
  organization_id: string | null;
  created_by?: string | null;
  created_at?: string;
  organization?: Organization | null;
  member_count?: number;
};

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  tribe_id: string | null;
  organization_id: string | null;
  created_at?: string;
  updated_at?: string;
  tribe?: Tribe | null;
  organization?: Organization | null;
};

export type HabitTemplate = {
  id: string;
  name: string;
  type: HabitType;
  suggested_target_value: number | null;
  suggested_target_unit: string | null;
  sort_order: number;
};

export type UserHabit = {
  id: string;
  user_id: string;
  name: string;
  type: HabitType;
  target_value: number | null;
  target_unit: string | null;
  source_type: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type HabitLog = {
  id: string;
  user_id: string;
  user_habit_id: string;
  log_date: string;
  completed: boolean;
  progress_value: number | null;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
};

export type WeeklyMemberScore = {
  user_id: string;
  full_name: string;
  percentage: number;
  streak: number;
  encouragementNeeded: boolean;
  habitsCompleted: number;
  totalPossible: number;
  reactions: string[];
  latestComment?: string;
};

export type TribeLeaderboard = {
  tribe: Tribe;
  members: WeeklyMemberScore[];
  tribeScore: number;
};

export type OrganizationRanking = {
  tribeId: string;
  tribeName: string;
  organizationName: string;
  score: number;
  rank: number;
  memberCount: number;
};

export type IntegrationName =
  | "Apple Health"
  | "Garmin"
  | "Oura"
  | "Whoop"
  | "Fitbit"
  | "None";

export type IntegrationInterest = {
  id: string;
  user_id: string;
  integration_name: IntegrationName;
  created_at?: string;
};

export type NotificationPreference = {
  id: string;
  user_id: string;
  daily_enabled: boolean;
  daily_time: string | null;
  sunday_enabled: boolean;
  created_at?: string;
  updated_at?: string;
};

export type MemberReaction = {
  id: string;
  from_user_id: string;
  to_user_id: string;
  week_start_date: string;
  emoji: "🎉" | "💪" | "🔥" | "👏";
  created_at?: string;
};

export type MemberComment = {
  id: string;
  from_user_id: string;
  to_user_id: string;
  week_start_date: string;
  message: string;
  created_at?: string;
};

export type OnboardingState = {
  fullName: string;
  tribeMode: "join" | "create";
  selectedTribeId: string | null;
  tribeName: string;
  organizationId: string | null;
  selectedTemplateIds: string[];
  customHabits: Array<{
    id: string;
    name: string;
    type: HabitType;
    targetValue?: number;
    targetUnit?: string;
  }>;
  integrations: IntegrationName[];
};

export type TodayHabitItem = UserHabit & {
  log: HabitLog | null;
};
