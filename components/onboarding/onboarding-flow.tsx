"use client";

import { useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConstellationWidget } from "@/components/ui/constellation-widget";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ToggleChip } from "@/components/ui/toggle-chip";
import { INTEGRATION_OPTIONS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { HabitTemplate, IntegrationName, OnboardingState, Tribe } from "@/lib/types";
import { cn } from "@/lib/utils";

const initialState: OnboardingState = {
  fullName: "",
  tribeMode: "join",
  selectedTribeId: null,
  tribeName: "",
  organizationId: null,
  selectedTemplateIds: [],
  customHabits: [],
  integrations: [],
};

export function OnboardingFlow({
  tribes,
  templates,
  organizations,
}: {
  tribes: Tribe[];
  templates: HabitTemplate[];
  organizations: Array<{ id: string; name: string }>;
}) {
  const [step, setStep] = useState(0);
  const [query, setQuery] = useState("");
  const [state, setState] = useState<OnboardingState>(initialState);
  const [customName, setCustomName] = useState("");
  const [customType, setCustomType] = useState<"binary" | "measurable">("binary");
  const [customValue, setCustomValue] = useState("");
  const [customUnit, setCustomUnit] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredTribes = useMemo(
    () => tribes.filter((tribe) => tribe.name.toLowerCase().includes(query.toLowerCase())),
    [query, tribes],
  );

  function nextStep() {
    setStep((current) => Math.min(current + 1, 2));
  }

  function previousStep() {
    setStep((current) => Math.max(current - 1, 0));
  }

  function addTemplate(templateId: string) {
    setState((current) => {
      const exists = current.selectedTemplateIds.includes(templateId);
      const nextIds = exists
        ? current.selectedTemplateIds.filter((id) => id !== templateId)
        : [...current.selectedTemplateIds, templateId].slice(0, 5);

      return { ...current, selectedTemplateIds: nextIds };
    });
  }

  function addCustomHabit() {
    if (!customName || state.selectedTemplateIds.length + state.customHabits.length >= 5) {
      return;
    }

    setState((current) => ({
      ...current,
      customHabits: [
        ...current.customHabits,
        {
          id: crypto.randomUUID(),
          name: customName,
          type: customType,
          targetValue: customValue ? Number(customValue) : undefined,
          targetUnit: customUnit || undefined,
        },
      ].slice(0, 5),
    }));

    setCustomName("");
    setCustomType("binary");
    setCustomValue("");
    setCustomUnit("");
  }

  function toggleIntegration(name: IntegrationName) {
    setState((current) => {
      if (name === "None") {
        return { ...current, integrations: ["None"] };
      }

      const withoutNone = current.integrations.filter((item) => item !== "None");
      return withoutNone.includes(name)
        ? { ...current, integrations: withoutNone.filter((item) => item !== name) }
        : { ...current, integrations: [...withoutNone, name] };
    });
  }

  const selectedHabitCount = state.selectedTemplateIds.length + state.customHabits.length;

  async function finishOnboarding() {
    setError(null);

    if (!hasSupabaseEnv()) {
      window.location.href = "/today";
      return;
    }

    try {
      setSaving(true);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You need to sign in first.");
      }

      const selectedOrganization =
        organizations.find((org) => org.id === state.organizationId || org.name === state.organizationId) ?? null;

      const { error: profileError } = await supabase.from("profiles").upsert({
        id: user.id,
        email: user.email,
        full_name: state.fullName,
        organization_id: selectedOrganization?.id ?? null,
      });

      if (profileError) {
        throw profileError;
      }

      let tribeId = state.selectedTribeId;

      if (state.tribeMode === "create") {
        const { data: createdTribe, error: createTribeError } = await supabase.rpc(
          "create_tribe_and_join",
          {
            tribe_name_input: state.tribeName,
            org_id_input: selectedOrganization?.id ?? null,
          },
        );

        if (createTribeError) {
          throw createTribeError;
        }

        tribeId = createdTribe as string;
      } else if (tribeId) {
        const { error: joinError } = await supabase.rpc("join_tribe", {
          tribe_id_input: tribeId,
        });

        if (joinError) {
          throw joinError;
        }
      }

      const selectedTemplates = templates.filter((template) => state.selectedTemplateIds.includes(template.id));
      const habitsToInsert = [
        ...selectedTemplates.map((template) => ({
          user_id: user.id,
          name: template.name,
          type: template.type,
          target_value: template.suggested_target_value,
          target_unit: template.suggested_target_unit,
          source_type: "manual",
          is_active: true,
        })),
        ...state.customHabits.map((habit) => ({
          user_id: user.id,
          name: habit.name,
          type: habit.type,
          target_value: habit.targetValue ?? null,
          target_unit: habit.targetUnit ?? null,
          source_type: "manual",
          is_active: true,
        })),
      ];

      if (habitsToInsert.length) {
        const { error: habitError } = await supabase.from("user_habits").insert(habitsToInsert);
        if (habitError) {
          throw habitError;
        }
      }

      if (state.integrations.length) {
        const { error: integrationError } = await supabase
          .from("integration_interest")
          .insert(
            state.integrations.map((name) => ({
              user_id: user.id,
              integration_name: name,
            })),
          );

        if (integrationError) {
          throw integrationError;
        }
      }

      await supabase.from("notification_preferences").upsert({
        user_id: user.id,
        daily_enabled: true,
        daily_time: "08:00:00",
        sunday_enabled: true,
      });

      window.location.href = "/today";
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : "Something went wrong. Perfectly fixable. Try again.";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className={cn(
              "h-1.5 flex-1 rounded-full",
              item <= step ? "bg-accent" : "bg-foreground/10",
            )}
          />
        ))}
      </div>

      {step === 0 ? (
        <Card className="space-y-5 animate-rise">
          <ConstellationWidget activeCount={2} totalCount={5} />
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.24em] text-foreground/40">Step 1</p>
            <h2 className="font-display text-3xl font-normal tracking-tight">Find your tribe</h2>
            <p className="text-sm text-foreground/58">
              Start with the people who will notice if you disappear. Small groups tend to work rather well.
            </p>
          </div>

          <Input
            placeholder="Your name"
            value={state.fullName}
            onChange={(event) => setState((current) => ({ ...current, fullName: event.target.value }))}
          />

          <div className="flex gap-2">
            <Button
              variant={state.tribeMode === "join" ? "primary" : "secondary"}
              className="flex-1"
              onClick={() => setState((current) => ({ ...current, tribeMode: "join" }))}
            >
              Join
            </Button>
            <Button
              variant={state.tribeMode === "create" ? "primary" : "secondary"}
              className="flex-1"
              onClick={() => setState((current) => ({ ...current, tribeMode: "create" }))}
            >
              Create
            </Button>
          </div>

          {state.tribeMode === "join" ? (
            <div className="space-y-3">
              <Input
                placeholder="Search tribe names"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <div className="space-y-2">
                {filteredTribes.map((tribe) => (
                  <button
                    key={tribe.id}
                    type="button"
                    onClick={() => setState((current) => ({ ...current, selectedTribeId: tribe.id }))}
                    className={cn(
                      "flex w-full items-center justify-between rounded-2xl border p-4 text-left transition",
                      state.selectedTribeId === tribe.id
                        ? "border-accent bg-accent/8"
                        : "border-border bg-surface/60",
                    )}
                  >
                    <div>
                      <p className="font-medium">{tribe.name}</p>
                      <p className="text-sm text-foreground/48">
                        {tribe.organization?.name ?? "Independent"} · {tribe.member_count ?? 0}/8 members
                      </p>
                    </div>
                    {state.selectedTribeId === tribe.id ? <Check className="h-4 w-4 text-accent" /> : null}
                  </button>
                ))}
                {!filteredTribes.length ? (
                  <div className="rounded-2xl border border-dashed border-border p-4 text-sm text-foreground/50">
                    Nothing suitable yet. A new tribe is a perfectly respectable option.
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Input
                placeholder="Tribe name"
                value={state.tribeName}
                onChange={(event) => setState((current) => ({ ...current, tribeName: event.target.value }))}
              />
              <Select
                value={state.organizationId ?? ""}
                onChange={(event) =>
                  setState((current) => ({
                    ...current,
                    organizationId: event.target.value || null,
                  }))
                }
              >
                <option value="">None</option>
                {organizations.map((organization) => (
                  <option key={organization.id} value={organization.id}>
                    {organization.name}
                  </option>
                ))}
              </Select>
            </div>
          )}

          <Button
            className="w-full"
            onClick={nextStep}
            disabled={
              !state.fullName ||
              (state.tribeMode === "join" ? !state.selectedTribeId : !state.tribeName)
            }
          >
            Continue
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </Card>
      ) : null}

      {step === 1 ? (
        <Card className="space-y-5 animate-rise">
          <ConstellationWidget activeCount={Math.max(1, selectedHabitCount)} totalCount={5} />
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.24em] text-foreground/40">Step 2</p>
            <h2 className="font-display text-3xl font-normal tracking-tight">Choose 1 to 5 habits</h2>
            <p className="text-sm text-foreground/58">
              Keep it modest. Pick the habits you would genuinely repeat.
            </p>
          </div>

          <Card className="rounded-3xl bg-accent/6">
            <p className="font-medium">What happens next</p>
            <p className="mt-2 text-sm text-foreground/58">
              You&apos;ll land on Today, log a few things, and on Sunday we&apos;ll guide you into the tribe ritual.
            </p>
          </Card>

          <div className="grid gap-2">
            {templates.map((template) => {
              const selected = state.selectedTemplateIds.includes(template.id);
              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => addTemplate(template.id)}
                  className={cn(
                    "rounded-2xl border p-4 text-left transition",
                    selected ? "border-accent bg-accent/8" : "border-border bg-surface/60",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{template.name}</span>
                    {selected ? <Check className="h-4 w-4 text-accent" /> : null}
                  </div>
                  <p className="mt-1 text-sm text-foreground/48">
                    {template.type === "binary"
                      ? "Done / not done"
                      : `${template.suggested_target_value} ${template.suggested_target_unit}`}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="rounded-3xl border border-dashed border-border p-4">
            <div className="mb-3 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <p className="font-medium">Add custom habit</p>
            </div>
            <div className="grid gap-3">
              <Input placeholder="Habit name" value={customName} onChange={(event) => setCustomName(event.target.value)} />
              <Select value={customType} onChange={(event) => setCustomType(event.target.value as "binary" | "measurable")}>
                <option value="binary">Binary</option>
                <option value="measurable">Measurable</option>
              </Select>
              {customType === "measurable" ? (
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Target value"
                    inputMode="numeric"
                    value={customValue}
                    onChange={(event) => setCustomValue(event.target.value)}
                  />
                  <Input placeholder="Unit" value={customUnit} onChange={(event) => setCustomUnit(event.target.value)} />
                </div>
              ) : null}
              <Button variant="secondary" onClick={addCustomHabit}>
                Add custom habit
              </Button>
            </div>
          </div>

          {!!state.customHabits.length ? (
            <div className="flex flex-wrap gap-2">
              {state.customHabits.map((habit) => (
                <ToggleChip key={habit.id} label={habit.name} selected onClick={() => {}} />
              ))}
            </div>
          ) : null}

          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={previousStep}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button className="flex-1" onClick={nextStep} disabled={selectedHabitCount < 1 || selectedHabitCount > 5}>
              Continue
            </Button>
          </div>
        </Card>
      ) : null}

      {step === 2 ? (
        <Card className="space-y-5 animate-rise">
          <ConstellationWidget activeCount={Math.max(1, state.integrations.length || 1)} totalCount={5} />
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.24em] text-foreground/40">Step 3</p>
            <h2 className="font-display text-3xl font-normal tracking-tight">Integrations coming soon</h2>
            <p className="text-sm text-foreground/58">
              Tell us what you would like connected next. We&apos;re keeping notes.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {INTEGRATION_OPTIONS.map((option) => (
              <ToggleChip
                key={option}
                label={option}
                selected={state.integrations.includes(option)}
                onClick={() => toggleIntegration(option)}
              />
            ))}
          </div>

          <Card className="rounded-3xl bg-accent/6">
            <p className="font-medium">What happens next</p>
            <p className="mt-2 text-sm text-foreground/58">
              You&apos;ll land on Today. The routine can begin there.
            </p>
          </Card>

          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={previousStep}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              className="flex-1"
              onClick={finishOnboarding}
              disabled={saving || selectedHabitCount < 1 || selectedHabitCount > 5}
            >
              {saving ? "Saving..." : "Finish onboarding"}
            </Button>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
