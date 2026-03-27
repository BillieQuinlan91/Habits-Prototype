export const TEAM_MEMBER_COLORS = [
  "#4F6FF7",
  "#5B79F2",
  "#6683EE",
  "#728DE9",
  "#7D97E4",
  "#89A1DF",
] as const;

export function getTeamMemberColor(index: number) {
  return TEAM_MEMBER_COLORS[index % TEAM_MEMBER_COLORS.length];
}
