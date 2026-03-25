import {
  HabitLog,
  HabitTemplate,
  NotificationPreference,
  Organization,
  Profile,
  Tribe,
  UserHabit,
} from "@/lib/types";

export const demoOrganizations: Organization[] = [
  { id: "org-foundrs", name: "Foundrs" },
  { id: "org-indie", name: "Indie Hackers" },
];

export const demoTribes: Tribe[] = [
  {
    id: "tribe-midnight-runners",
    name: "Midnight Runners",
    organization_id: "org-foundrs",
    member_count: 6,
    organization: demoOrganizations[0],
  },
  {
    id: "tribe-steady-builders",
    name: "Steady Builders",
    organization_id: "org-indie",
    member_count: 5,
    organization: demoOrganizations[1],
  },
];

export const demoProfile: Profile = {
  id: "00000000-0000-0000-0000-000000000001",
  email: "demo@becoming.app",
  full_name: "Mark",
  identity_label: "Someone who does focused work daily",
  tribe_id: "tribe-midnight-runners",
  organization_id: "org-foundrs",
  onboarding_completed_at: "2026-03-18T08:00:00.000Z",
  tribe: demoTribes[0],
  organization: demoOrganizations[0],
};

export const demoHabitTemplates: HabitTemplate[] = [
  { id: "t1", name: "Workout", type: "binary", suggested_target_value: null, suggested_target_unit: null, sort_order: 1 },
  { id: "t2", name: "Deep Work", type: "measurable", suggested_target_value: 180, suggested_target_unit: "minutes", sort_order: 2 },
  { id: "t3", name: "Meditate", type: "binary", suggested_target_value: null, suggested_target_unit: null, sort_order: 3 },
  { id: "t4", name: "Journal", type: "binary", suggested_target_value: null, suggested_target_unit: null, sort_order: 4 },
  { id: "t5", name: "Read", type: "measurable", suggested_target_value: 30, suggested_target_unit: "minutes", sort_order: 5 },
  { id: "t6", name: "10k Steps", type: "measurable", suggested_target_value: 10000, suggested_target_unit: "steps", sort_order: 6 },
];

export const demoUserHabits: UserHabit[] = [
  {
    id: "h1",
    user_id: demoProfile.id,
    name: "1 hour of deep work before email",
    type: "binary",
    target_value: null,
    target_unit: null,
    minimum_label: "5 minutes of deep work",
    is_primary: true,
    commitment_start_date: "2026-03-20",
    commitment_length_days: 7,
    source_type: "manual",
    is_active: true,
  },
];

export const demoHabitLogs: HabitLog[] = [
  { id: "l1", user_id: demoProfile.id, user_habit_id: "h1", log_date: "2026-03-20", completed: true, progress_value: null, notes: null },
  { id: "l2", user_id: demoProfile.id, user_habit_id: "h1", log_date: "2026-03-21", completed: true, progress_value: null, notes: null },
  { id: "l3", user_id: demoProfile.id, user_habit_id: "h1", log_date: "2026-03-22", completed: false, progress_value: null, notes: null },
  { id: "l4", user_id: demoProfile.id, user_habit_id: "h1", log_date: "2026-03-23", completed: true, progress_value: null, notes: null },
  { id: "l5", user_id: demoProfile.id, user_habit_id: "h1", log_date: "2026-03-24", completed: false, progress_value: null, notes: null },
];

export const demoNotificationPreferences: NotificationPreference = {
  id: "np1",
  user_id: demoProfile.id,
  daily_enabled: true,
  daily_time: "08:00:00",
  sunday_enabled: true,
};
