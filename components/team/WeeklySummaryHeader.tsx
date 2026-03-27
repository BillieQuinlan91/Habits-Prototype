"use client";

export function WeeklySummaryHeader({
  perfectDays,
  completionPercent,
  periodLabel,
}: {
  perfectDays: number;
  completionPercent: number;
  periodLabel: "week" | "month";
}) {
  const title =
    periodLabel === "month"
      ? perfectDays > 0
        ? `${perfectDays} perfect days this month`
        : `${completionPercent}% team completion this month`
      : perfectDays >= 5
        ? `${perfectDays} perfect days this week`
        : perfectDays >= 2
          ? `${perfectDays} perfect days so far`
          : `${completionPercent}% team completion this week`;

  const supporting =
    periodLabel === "month"
      ? perfectDays > 0
        ? `${completionPercent}% completion overall. You can see the rhythm of the month at a glance.`
        : `A month-wide view of consistency, one day at a time.`
      : perfectDays > 0
        ? `Strong week. The shape of it is visible.`
        : `A useful view of the week so far.`;

  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-[0.24em] text-foreground/40">Team</p>
      <h2 className="font-display text-3xl font-normal tracking-tight">{title}</h2>
      <p className="text-sm text-foreground/58">{supporting}</p>
    </div>
  );
}
