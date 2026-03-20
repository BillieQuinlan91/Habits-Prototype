import { cn } from "@/lib/utils";

export function ToggleChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2 text-sm transition",
        selected
          ? "border-accent bg-accent/10 text-accent"
          : "border-border bg-card text-foreground/70 hover:border-accent/35",
      )}
    >
      {label}
    </button>
  );
}
