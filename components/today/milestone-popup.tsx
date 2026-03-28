"use client";

import { PartyPopper, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HabitJourneyMilestone } from "@/lib/types";
import { cn } from "@/lib/utils";

type MilestonePopupTone = "willpower" | "locking" | "identity";

function getToneClasses(tone: MilestonePopupTone) {
  if (tone === "identity") {
    return {
      panel: "border-success/30 bg-success/18",
      eyebrow: "text-success",
    };
  }

  if (tone === "locking") {
    return {
      panel: "border-success/30 bg-success/18",
      eyebrow: "text-success",
    };
  }

  return {
    panel: "border-success/30 bg-success/18",
    eyebrow: "text-success",
  };
}

export function MilestonePopup({
  open,
  milestone,
  habitName,
  allowAddHabit,
  onClose,
  onAddHabit,
}: {
  open: boolean;
  milestone: HabitJourneyMilestone | null;
  habitName: string | null;
  allowAddHabit: boolean;
  onClose: () => void;
  onAddHabit: () => void;
}) {
  if (!open || !milestone) {
    return null;
  }

  const tone: MilestonePopupTone =
    milestone.phase === "day_75" ? "identity" : milestone.phase === "day_30" ? "locking" : "willpower";
  const styles = getToneClasses(tone);
  const bodyCopy =
    milestone.phase === "day_75"
      ? "Seventy-five days in, this looks less like effort and more like identity."
      : milestone.phase === "day_30"
        ? "A month of repetition has started to settle this habit into place."
        : "The first week is the hardest part, and you got through it.";

  return (
    <div className="fixed inset-0 z-[60] flex items-end bg-black/35 p-4">
      <Card className={cn("w-full animate-rise rounded-[32px] border-2", styles.panel)}>
        <div className="space-y-5">
          <div className={cn("flex items-center gap-2", styles.eyebrow)}>
            <PartyPopper className="h-4 w-4" />
            <p className="text-xs uppercase tracking-[0.24em]">Milestone unlocked</p>
          </div>
          <div>
            <h3 className="font-display text-3xl font-normal tracking-tight">
              You&apos;re making this look easy.
            </h3>
            <p className="mt-3 text-sm text-foreground/68">
              {milestone.shortLabel} unlocked for {habitName}. {bodyCopy}
            </p>
          </div>
          {milestone.phase === "day_75" && allowAddHabit ? (
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={onClose}>
                Keep going
              </Button>
              <Button className="flex-1 bg-success text-white hover:bg-success/95" onClick={onAddHabit}>
                <Plus className="mr-2 h-4 w-4" />
                Add another habit
              </Button>
            </div>
          ) : (
            <Button className="w-full" onClick={onClose}>
              Keep going
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
