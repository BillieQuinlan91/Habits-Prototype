"use client";

export function WeeklySummaryHeader({
  perfectDays,
  weeklyCompletionPercent,
}: {
  perfectDays: number;
  weeklyCompletionPercent: number;
}) {
  const title =
    perfectDays >= 5
      ? `${perfectDays} perfect days this week`
      : perfectDays >= 2
        ? `${perfectDays} perfect days so far`
        : `${weeklyCompletionPercent}% team completion this week`;

  const supporting =
    perfectDays > 0
      ? "Strong week. The shape of it is visible."
      : "A useful view of the week so far.";

  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-[0.24em] text-foreground/40">Team</p>
      <h2 className="font-display text-3xl font-normal tracking-tight">{title}</h2>
      <p className="text-sm text-foreground/58">{supporting}</p>
    </div>
  );
}
