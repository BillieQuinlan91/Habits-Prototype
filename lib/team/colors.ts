export const TEAM_MEMBER_COLORS = [
  "#2447D6",
  "#355BE2",
  "#4A72EE",
  "#6790F5",
  "#8AAEF5",
  "#B2CAF8",
] as const;

export function getTeamMemberColor(index: number) {
  return TEAM_MEMBER_COLORS[index % TEAM_MEMBER_COLORS.length];
}
