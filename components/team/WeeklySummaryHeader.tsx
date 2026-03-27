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
    perfectDays >= 5
      ? `${perfectDays} perfect days this ${periodLabel}`
      : perfectDays >= 2
        ? `${perfectDays} perfect days so far`
        : `${completionPercent}% team completion this ${periodLabel}`;

  const supporting =
    perfectDays > 0
      ? `Strong ${periodLabel}. The shape of it is visible.`
      : `A useful view of the ${periodLabel} so far.`;

  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-[0.24em] text-foreground/40">Team</p>
      <h2 className="font-display text-3xl font-normal tracking-tight">{title}</h2>
      <p className="text-sm text-foreground/58">{supporting}</p>
    </div>
  );
}
