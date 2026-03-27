export const TEAM_MEMBER_COLORS = [
  "#1736B8",
  "#2E54D1",
  "#4A78EA",
  "#73A0F5",
  "#A1C4FA",
  "#D1E2FE",
] as const;

export function getTeamMemberColor(index: number) {
  return TEAM_MEMBER_COLORS[index % TEAM_MEMBER_COLORS.length];
}
