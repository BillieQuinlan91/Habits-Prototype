import { IntegrationName } from "@/lib/types";

export const APP_NAME = "Becoming";

export const ORGANIZATION_OPTIONS = ["Foundrs", "Indie Hackers"] as const;

export const INTEGRATION_OPTIONS: IntegrationName[] = [
  "Apple Health",
  "Garmin",
  "Oura",
  "Whoop",
  "Fitbit",
  "None",
];

export const MEMBER_REACTION_OPTIONS = ["🎉", "💪", "🔥", "👏"] as const;

export const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";

export const IDENTITY_PRESETS = [
  "Someone who shows up every day",
  "Someone who protects their mornings",
  "Someone who prioritises movement",
  "Someone who does focused work daily",
  "Someone who takes care of their energy",
  "Someone who keeps promises to themselves",
  "Someone who finishes what they start",
  "Custom",
] as const;

export const DOMINO_HABIT_PRESETS = [
  "Wake up at 7am",
  "Phone on airplane mode at 9pm",
  "1 hour of deep work before email",
  "Morning workout",
  "10 minute evening reset",
  "Custom",
] as const;

export const MINIMUM_VERSION_PRESETS = [
  "1 pushup",
  "1 page of reading",
  "5 minutes of deep work",
  "1 minute meditation",
  "Custom",
] as const;
