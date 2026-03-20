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
