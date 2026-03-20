import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const uxTemplate = `Screen:
- Today / Tribe / Profile / Auth / Onboarding step X

What feels off:
-

Why it feels off:
-

What I expected instead:
-

Suggested change:
-

Priority:
- Must fix / Should fix / Nice to have

Attachment:
- screenshot or screen recording`;

const visualTemplate = `Screen:
- Today / Tribe / Profile / Auth / Onboarding step X

What looks off:
-

What feeling it gives now:
-

What feeling it should give:
-

Specific visual changes you want:
- spacing
- typography
- color
- hierarchy
- motion
- component styling

Priority:
- Must fix / Should fix / Nice to have

Attachment:
- screenshot with markup if possible`;

const bugTemplate = `Screen:
- Today / Tribe / Profile / Auth / Onboarding step X

Bug:
-

Steps to reproduce:
1.
2.
3.

What happened:
-

What should have happened:
-

How often it happens:
- Always / Often / Sometimes / Once

Priority:
- Must fix / Should fix / Nice to have

Attachment:
- screenshot, recording, or console error if available`;

function TemplateCard({
  title,
  description,
  template,
}: {
  title: string;
  description: string;
  template: string;
}) {
  return (
    <Card className="space-y-4">
      <div className="space-y-2">
        <h2 className="font-display text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="text-sm text-foreground/58">{description}</p>
      </div>
      <pre className="overflow-x-auto rounded-[24px] bg-foreground p-4 text-xs leading-6 text-surface">
        {template}
      </pre>
    </Card>
  );
}

export function FeedbackGuide() {
  return (
    <div className="space-y-5">
      <Card className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.24em] text-foreground/40">Feedback guide</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Review one screen at a time
          </h1>
          <p className="text-sm text-foreground/58">
            Keep product feedback clean by separating UX, visual design, and bugs into different
            messages.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge>One screen per message</Badge>
          <Badge>Separate bugs from design</Badge>
          <Badge>Describe what good looks like</Badge>
        </div>
      </Card>

      <TemplateCard
        title="UX / Copy Feedback"
        description="Use this when the flow is confusing, the wording feels wrong, or the interaction model is unclear."
        template={uxTemplate}
      />

      <TemplateCard
        title="Visual Design Feedback"
        description="Use this when the screen works but does not feel premium, clear, or emotionally right."
        template={visualTemplate}
      />

      <TemplateCard
        title="Bug Report Feedback"
        description="Use this when something is broken, inconsistent, or behaving differently from what you expected."
        template={bugTemplate}
      />

      <Card className="space-y-3">
        <h2 className="font-display text-2xl font-semibold tracking-tight">Recommended workflow</h2>
        <ul className="space-y-2 text-sm text-foreground/58">
          <li>Send one screen at a time.</li>
          <li>If a screen has both design and bug issues, send two separate blocks.</li>
          <li>Put the highest-priority issue first.</li>
          <li>Include screenshots or short recordings whenever possible.</li>
        </ul>
      </Card>
    </div>
  );
}
