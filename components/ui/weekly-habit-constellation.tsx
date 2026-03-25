import { WeeklyConstellationRow } from "@/lib/types";
import { cn } from "@/lib/utils";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const LEFT_LABEL_WIDTH = 74;
const TOP_LABEL_HEIGHT = 24;
const COL_GAP = 30;
const ROW_GAP = 28;
const DOT_RADIUS = 4;

function truncateLabel(label: string) {
  return label.length > 9 ? `${label.slice(0, 8)}…` : label;
}

export function WeeklyHabitConstellation({
  rows,
  completedCount,
  totalCount,
  className,
}: {
  rows: WeeklyConstellationRow[];
  completedCount: number;
  totalCount: number;
  className?: string;
}) {
  const width = LEFT_LABEL_WIDTH + COL_GAP * 6 + 20;
  const height = TOP_LABEL_HEIGHT + ROW_GAP * Math.max(rows.length, 1) + 18;

  return (
    <div className={cn("rounded-2xl border border-border/80 bg-white/85 p-4", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        role="img"
        aria-label={`${completedCount} of ${totalCount} check-ins completed this week.`}
      >
        {DAY_LABELS.map((label, index) => (
          <text
            key={label}
            x={LEFT_LABEL_WIDTH + index * COL_GAP}
            y={14}
            textAnchor="middle"
            fontSize="10"
            fill="rgba(31,41,51,0.52)"
          >
            {label}
          </text>
        ))}

        {rows.map((row, rowIndex) => {
          const y = TOP_LABEL_HEIGHT + rowIndex * ROW_GAP;
          return (
            <g key={row.habitId}>
              <text
                x={0}
                y={y + 4}
                fontSize="12"
                fill="rgba(31,41,51,0.72)"
              >
                {truncateLabel(row.habitName)}
              </text>

              {row.completions.slice(0, 6).map((completed, dayIndex) => {
                const nextCompleted = row.completions[dayIndex + 1];
                if (!(completed && nextCompleted)) {
                  return null;
                }

                return (
                  <line
                    key={`${row.habitId}-line-${dayIndex}`}
                    x1={LEFT_LABEL_WIDTH + dayIndex * COL_GAP + DOT_RADIUS}
                    y1={y}
                    x2={LEFT_LABEL_WIDTH + (dayIndex + 1) * COL_GAP - DOT_RADIUS}
                    y2={y}
                    stroke="rgba(31,41,51,0.24)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                );
              })}

              {row.completions.map((completed, dayIndex) => (
                <circle
                  key={`${row.habitId}-${dayIndex}`}
                  cx={LEFT_LABEL_WIDTH + dayIndex * COL_GAP}
                  cy={y}
                  r={DOT_RADIUS}
                  fill={completed ? "rgb(111 175 143)" : "rgba(217,221,227,0.92)"}
                  stroke={completed ? "rgba(108,140,245,0.4)" : "rgba(229,231,235,1)"}
                  strokeWidth="1.2"
                />
              ))}
            </g>
          );
        })}
      </svg>

      <div className="mt-3 flex items-center justify-between text-xs text-foreground/48">
        <span>This week</span>
        <span>{completedCount} of {totalCount} check-ins completed</span>
      </div>
    </div>
  );
}
