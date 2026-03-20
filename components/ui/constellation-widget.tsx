import { cn } from "@/lib/utils";

const NODES = [
  { x: 16, y: 54 },
  { x: 54, y: 26 },
  { x: 92, y: 44 },
  { x: 136, y: 18 },
  { x: 166, y: 58 },
  { x: 114, y: 86 },
  { x: 62, y: 96 },
];

const LINKS: Array<[number, number]> = [
  [0, 1],
  [1, 2],
  [2, 3],
  [2, 4],
  [2, 5],
  [5, 6],
];

export function ConstellationWidget({
  activeCount,
  totalCount,
  className,
  large = false,
}: {
  activeCount: number;
  totalCount: number;
  className?: string;
  large?: boolean;
}) {
  const scale = large ? 1.18 : 1;
  const clampedActive = Math.max(0, Math.min(totalCount, activeCount));

  return (
    <div className={cn("rounded-2xl border border-border/80 bg-white/80 p-4", className)}>
      <svg
        viewBox="0 0 184 112"
        className={cn("h-[112px] w-full", large && "h-[148px]")}
        aria-hidden="true"
      >
        {LINKS.map(([from, to], index) => {
          const active = clampedActive > Math.min(from, to);
          return (
            <line
              key={`${from}-${to}-${index}`}
              x1={NODES[from].x * scale}
              y1={NODES[from].y * scale}
              x2={NODES[to].x * scale}
              y2={NODES[to].y * scale}
              stroke={active ? "rgba(31,41,51,0.24)" : "rgba(31,41,51,0.12)"}
              strokeWidth="1"
              strokeLinecap="round"
            />
          );
        })}
        {NODES.slice(0, totalCount).map((node, index) => {
          const active = index < clampedActive;
          return (
            <circle
              key={`${node.x}-${node.y}-${index}`}
              cx={node.x * scale}
              cy={node.y * scale}
              r={active ? 4.5 : 3.5}
              fill={active ? "rgb(111 175 143)" : "rgba(108,117,125,0.18)"}
              stroke={active ? "rgba(108,140,245,0.55)" : "rgba(229,231,235,1)"}
              strokeWidth="1.4"
            />
          );
        })}
      </svg>
      <div className="mt-3 flex items-center justify-between text-xs text-foreground/48">
        <span>Constellation</span>
        <span>{clampedActive}/{totalCount} nodes active</span>
      </div>
    </div>
  );
}
