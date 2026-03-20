import { cn } from "@/lib/utils";

type ConstellationVariant = "today" | "weekly" | "profile" | "onboarding";

const TODAY_NODES = [
  { x: 24, y: 72 },
  { x: 58, y: 40 },
  { x: 98, y: 58 },
  { x: 138, y: 34 },
  { x: 170, y: 78 },
  { x: 118, y: 96 },
  { x: 70, y: 100 },
];

const WEEKLY_NODES = [
  { x: 16, y: 32 },
  { x: 44, y: 18 },
  { x: 72, y: 44 },
  { x: 102, y: 28 },
  { x: 134, y: 54 },
  { x: 162, y: 24 },
  { x: 32, y: 88 },
  { x: 64, y: 72 },
  { x: 94, y: 96 },
  { x: 126, y: 84 },
  { x: 158, y: 102 },
];

const PROFILE_NODES = [
  { x: 28, y: 48 },
  { x: 56, y: 30 },
  { x: 84, y: 50 },
  { x: 52, y: 88 },
  { x: 92, y: 96 },
  { x: 130, y: 40 },
  { x: 154, y: 22 },
  { x: 168, y: 62 },
  { x: 126, y: 94 },
];

const ONBOARDING_NODES = [
  { x: 24, y: 68 },
  { x: 56, y: 40 },
  { x: 96, y: 52 },
  { x: 132, y: 30 },
  { x: 162, y: 68 },
];

const LINKS_BY_VARIANT: Record<ConstellationVariant, Array<[number, number]>> = {
  today: [
    [0, 1],
    [1, 2],
    [2, 3],
    [2, 4],
    [2, 5],
    [5, 6],
  ],
  weekly: [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [0, 6],
    [6, 7],
    [7, 8],
    [8, 9],
    [9, 10],
    [2, 7],
    [3, 8],
    [4, 9],
  ],
  profile: [
    [0, 1],
    [1, 2],
    [0, 3],
    [3, 4],
    [2, 5],
    [5, 6],
    [5, 7],
    [4, 8],
    [2, 4],
  ],
  onboarding: [
    [0, 1],
    [1, 2],
    [2, 3],
    [2, 4],
  ],
};

const NODES_BY_VARIANT: Record<ConstellationVariant, Array<{ x: number; y: number }>> = {
  today: TODAY_NODES,
  weekly: WEEKLY_NODES,
  profile: PROFILE_NODES,
  onboarding: ONBOARDING_NODES,
};

export function ConstellationWidget({
  activeCount,
  totalCount,
  className,
  large = false,
  variant = "today",
}: {
  activeCount: number;
  totalCount: number;
  className?: string;
  large?: boolean;
  variant?: ConstellationVariant;
}) {
  const scale = large ? 1.18 : 1;
  const nodes = NODES_BY_VARIANT[variant];
  const links = LINKS_BY_VARIANT[variant];
  const clampedTotal = Math.max(1, Math.min(totalCount, nodes.length));
  const clampedActive = Math.max(0, Math.min(clampedTotal, activeCount));
  const linkThreshold = variant === "today" ? 3 : 2;
  const showConnections = clampedActive >= linkThreshold;

  return (
    <div className={cn("rounded-2xl border border-border/80 bg-white/80 p-4", className)}>
      <svg
        viewBox="0 0 184 112"
        className={cn("h-[112px] w-full", large && "h-[148px]")}
        aria-hidden="true"
      >
        {links.map(([from, to], index) => {
          const active =
            showConnections &&
            from < clampedActive &&
            to < clampedActive;
          return (
            <line
              key={`${from}-${to}-${index}`}
              x1={nodes[from].x * scale}
              y1={nodes[from].y * scale}
              x2={nodes[to].x * scale}
              y2={nodes[to].y * scale}
              stroke={active ? "rgba(31,41,51,0.24)" : "rgba(31,41,51,0.12)"}
              strokeWidth="1"
              strokeLinecap="round"
            />
          );
        })}
        {nodes.slice(0, clampedTotal).map((node, index) => {
          const active = index < clampedActive;
          const milestone = variant === "profile" && index === clampedActive - 1 && clampedActive > 3;
          return (
            <circle
              key={`${node.x}-${node.y}-${index}`}
              cx={node.x * scale}
              cy={node.y * scale}
              r={active ? 4.5 : 3.5}
              fill={
                milestone
                  ? "rgb(255 138 122)"
                  : active
                    ? variant === "today"
                      ? "rgb(108 140 245)"
                      : "rgb(111 175 143)"
                    : "rgba(217,221,227,0.92)"
              }
              stroke={active ? "rgba(31,41,51,0.18)" : "rgba(229,231,235,1)"}
              strokeWidth="1.4"
            />
          );
        })}
      </svg>
      <div className="mt-3 flex items-center justify-between text-xs text-foreground/48">
        <span>Constellation</span>
        <span>{clampedActive}/{clampedTotal} nodes active</span>
      </div>
    </div>
  );
}
