"use client";

import { useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, LockKeyhole, Users } from "lucide-react";

import { OnboardingJourneyTeaser } from "@/components/onboarding/onboarding-journey-teaser";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  DOMINO_HABIT_PRESETS,
  IDENTITY_PRESETS,
  MINIMUM_VERSION_PRESETS,
} from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { OnboardingState, Tribe } from "@/lib/types";
import { cn, formatIdentityLabel, toDateKey } from "@/lib/utils";

const initialState: OnboardingState = {
  fullName: "",
  identityPreset: "",
  identityCustom: "",
  habitPreset: "",
  habitCustom: "",
  minimumPreset: "",
  minimumCustom: "",
  tribeMode: "join",
  selectedTribeId: null,
  tribeName: "",
  organizationId: null,
  integrations: [],
};

const totalSteps = 6;

export function OnboardingFlow({
  tribes,
  organizations,
}: {
  tribes: Tribe[];
  templates: unknown[];
  organizations: Array<{ id: string; name: string }>;
}) {
  const [step, setStep] = useState(0);
  const [query, setQuery] = useState("");
  const [state, setState] = useState<OnboardingState>(initialState);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredTribes = useMemo(
    () => tribes.filter((tribe) => tribe.name.toLowerCase().includes(query.toLowerCase())),
    [query, tribes],
  );

  const identityLabel =
    state.identityPreset === "Custom" ? state.identityCustom.trim() : state.identityPreset;
  const habitLabel = state.habitPreset === "Custom" ? state.habitCustom.trim() : state.habitPreset;
  const minimumLabel =
    state.minimumPreset === "Custom" ? state.minimumCustom.trim() : state.minimumPreset;
  const selectedCircle = tribes.find((tribe) => tribe.id === state.selectedTribeId) ?? null;

  function nextStep() {
    setStep((current) => Math.min(current + 1, totalSteps - 1));
  }

  function previousStep() {
    setStep((current) => Math.max(current - 1, 0));
  }

  function stepIsValid(currentStep: number) {
    if (currentStep === 0) {
      return Boolean(state.fullName.trim() && identityLabel);
    }
    if (currentStep === 1) {
      return Boolean(habitLabel);
    }
    if (currentStep === 2) {
      return Boolean(minimumLabel);
    }
    if (currentStep === 3) {
      return true;
    }
    if (currentStep === 4) {
      return state.tribeMode === "join" ? Boolean(state.selectedTribeId) : Boolean(state.tribeName.trim());
    }

    return true;
  }

  async function finishOnboarding() {
    setError(null);

    if (!hasSupabaseEnv()) {
      window.location.href = "/tribe";
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
        full_name: state.fullName.trim(),
        identity_label: identityLabel,
        organization_id: selectedOrganization?.id ?? null,
        onboarding_completed_at: new Date().toISOString(),
      });

      if (profileError) {
        throw profileError;
      }

      let tribeId = state.selectedTribeId;

      if (state.tribeMode === "create") {
        const { data: createdTribe, error: createTribeError } = await supabase.rpc(
          "create_tribe_and_join",
          {
            tribe_name_input: state.tribeName.trim(),
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

      await supabase.from("user_habits").update({ is_active: false }).eq("user_id", user.id).eq("is_active", true);

      const { data: insertedHabit, error: habitError } = await supabase
        .from("user_habits")
        .insert({
          user_id: user.id,
          name: habitLabel,
          type: "binary",
          target_value: null,
          target_unit: null,
          minimum_label: minimumLabel,
          is_primary: true,
          commitment_start_date: toDateKey(),
          commitment_length_days: 7,
          source_type: "manual",
          is_active: true,
        })
        .select("id")
        .single();

      if (habitError || !insertedHabit) {
        throw habitError ?? new Error("Unable to create the first habit.");
      }

      const { error: logError } = await supabase.from("habit_logs").upsert({
        user_id: user.id,
        user_habit_id: insertedHabit.id,
        log_date: toDateKey(),
        completed: true,
        progress_value: null,
      });

      if (logError) {
        throw logError;
      }

      await supabase.from("notification_preferences").upsert({
        user_id: user.id,
        daily_enabled: true,
        daily_time: "08:00:00",
        sunday_enabled: true,
      });

      window.location.href = "/tribe";
    } catch (saveError) {
      const message =
        saveError instanceof Error ? saveError.message : "Something went wrong. Try that once more.";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      {step === 0 ? (
        <Card className="space-y-5 animate-rise">
          <OnboardingJourneyTeaser step={step} />
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.24em] text-foreground/40">Step 1</p>
            <h2 className="font-display text-3xl font-normal tracking-tight">Start with identity</h2>
            <p className="text-sm text-foreground/58">
              Choose the version of yourself you want this quarter to quietly reinforce.
            </p>
          </div>

          <div className="space-y-3">
            <div className="rounded-[28px] border border-border bg-surface/60 px-4 py-4">
              <p className="text-sm font-medium text-foreground">Hi, what&apos;s your name?</p>
              <div className="mt-3">
                <Input
                  placeholder="What should your circle call you?"
                  value={state.fullName}
                  onChange={(event) => setState((current) => ({ ...current, fullName: event.target.value }))}
                />
              </div>
            </div>

            <div className="rounded-[28px] border border-border bg-surface/60 px-4 py-4">
              <p className="text-sm font-medium text-foreground">Who are you becoming?</p>
              <div className="mt-3">
                <Select
                  className={cn(!state.identityPreset && "text-foreground/38")}
                  value={state.identityPreset}
                  onChange={(event) =>
                    setState((current) => ({
                      ...current,
                      identityPreset: event.target.value,
                    }))
                  }
                >
                  <option value="">Who are you becoming</option>
                  {IDENTITY_PRESETS.map((preset) => (
                    <option key={preset} value={preset}>
                      {preset === "Custom" ? preset : formatIdentityLabel(preset)}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>

          {state.identityPreset === "Custom" ? (
            <Input
              placeholder="Write your own identity"
              value={state.identityCustom}
              onChange={(event) => setState((current) => ({ ...current, identityCustom: event.target.value }))}
            />
          ) : null}

          <Button className="w-full" onClick={nextStep} disabled={!stepIsValid(0)}>
            Continue
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </Card>
      ) : null}

      {step === 1 ? (
        <Card className="space-y-5 animate-rise">
          <OnboardingJourneyTeaser step={step} />
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.24em] text-foreground/40">Step 2</p>
            <h2 className="font-display text-3xl font-normal tracking-tight">Choose one domino habit</h2>
            <p className="text-sm text-foreground/58">
              Pick the one habit that puts everything else in motion.
            </p>
          </div>

          <div className="rounded-[28px] border border-border bg-surface/60 px-4 py-4">
            <p className="text-sm font-medium text-foreground">What habit puts everything else in motion?</p>
            <div className="mt-3">
              <Select
                className={cn(!state.habitPreset && "text-foreground/38")}
                value={state.habitPreset}
                onChange={(event) =>
                  setState((current) => ({
                    ...current,
                    habitPreset: event.target.value,
                  }))
                }
              >
                <option value="">Choose one habit</option>
                {DOMINO_HABIT_PRESETS.map((preset) => (
                  <option key={preset} value={preset}>
                    {preset}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {state.habitPreset === "Custom" ? (
            <Input
              placeholder="Write your domino habit"
              value={state.habitCustom}
              onChange={(event) => setState((current) => ({ ...current, habitCustom: event.target.value }))}
            />
          ) : null}

          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={previousStep}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button className="flex-1" onClick={nextStep} disabled={!stepIsValid(1)}>
              Continue
            </Button>
          </div>
        </Card>
      ) : null}

      {step === 2 ? (
        <Card className="space-y-5 animate-rise">
          <OnboardingJourneyTeaser step={step} />
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.24em] text-foreground/40">Step 3</p>
            <h2 className="font-display text-3xl font-normal tracking-tight">Shrink it once more</h2>
            <p className="text-sm text-foreground/58">
              On a difficult day, what is the smallest version you can still keep?
            </p>
          </div>

          <div className="rounded-[28px] border border-border bg-surface/60 px-4 py-4">
            <p className="text-sm font-medium text-foreground">What is your minimum version?</p>
            <div className="mt-3">
              <Select
                className={cn(!state.minimumPreset && "text-foreground/38")}
                value={state.minimumPreset}
                onChange={(event) =>
                  setState((current) => ({
                    ...current,
                    minimumPreset: event.target.value,
                  }))
                }
              >
                <option value="">Choose your minimum version</option>
                {MINIMUM_VERSION_PRESETS.map((preset) => (
                  <option key={preset} value={preset}>
                    {preset}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {state.minimumPreset === "Custom" ? (
            <Input
              placeholder="Write your minimum version"
              value={state.minimumCustom}
              onChange={(event) => setState((current) => ({ ...current, minimumCustom: event.target.value }))}
            />
          ) : null}

          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={previousStep}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button className="flex-1" onClick={nextStep} disabled={!stepIsValid(2)}>
              Continue
            </Button>
          </div>
        </Card>
      ) : null}

      {step === 3 ? (
        <Card className="space-y-5 animate-rise">
          <OnboardingJourneyTeaser step={step} />
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.24em] text-foreground/40">Step 4</p>
            <h2 className="font-display text-3xl font-normal tracking-tight">Commit to seven days</h2>
            <p className="text-sm text-foreground/58">
              One habit. One week. Additional habits can wait until this one feels real.
            </p>
          </div>

          <Card className="rounded-3xl bg-surface/70">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.2em] text-foreground/40">Your first-week focus</p>
              <p className="text-base font-medium leading-relaxed text-foreground">
                {formatIdentityLabel(identityLabel)} by {habitLabel.toLowerCase()} and if I can&apos;t do that,
                I&apos;ll at least do {minimumLabel.toLowerCase()}.
              </p>
            </div>
          </Card>

          <div className="rounded-3xl border border-border/80 bg-card px-4 py-4">
            <div className="flex items-center gap-3">
              <LockKeyhole className="h-4 w-4 text-accent" />
              <p className="text-sm text-foreground/62">
                For your first week, the goal is consistency.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={previousStep}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button className="flex-1" onClick={nextStep}>
              I’m in
            </Button>
          </div>
        </Card>
      ) : null}

      {step === 4 ? (
        <Card className="space-y-5 animate-rise">
          <OnboardingJourneyTeaser step={step} />
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.24em] text-foreground/40">Step 5</p>
            <h2 className="font-display text-3xl font-normal tracking-tight">Join a circle</h2>
            <p className="text-sm text-foreground/58">
              Choose the small group that will notice when you drift.
            </p>
          </div>

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
                placeholder="Search circle names"
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
                        {tribe.organization?.name ?? "Independent"} · {tribe.member_count ?? 0}/6 members
                      </p>
                    </div>
                    {state.selectedTribeId === tribe.id ? <Check className="h-4 w-4 text-accent" /> : null}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Input
                placeholder="Circle name"
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
                <option value="">No organization</option>
                {organizations.map((organization) => (
                  <option key={organization.id} value={organization.id}>
                    {organization.name}
                  </option>
                ))}
              </Select>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={previousStep}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button className="flex-1" onClick={nextStep} disabled={!stepIsValid(4)}>
              Continue
            </Button>
          </div>
        </Card>
      ) : null}

      {step === 5 ? (
        <Card className="space-y-5 animate-rise">
          <OnboardingJourneyTeaser step={step} />
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.24em] text-foreground/40">Step 6</p>
            <h2 className="font-display text-3xl font-normal tracking-tight">Log your first win</h2>
            <p className="text-sm text-foreground/58">
              First check-in now. After that, you’ll land straight in the circle dashboard.
            </p>
          </div>

          <Card className="rounded-3xl bg-surface/70">
            <div className="flex items-start gap-3">
              <Users className="mt-1 h-4 w-4 text-accent" />
              <div>
                <p className="font-medium">
                  {state.tribeMode === "create" ? state.tribeName.trim() : selectedCircle?.name ?? "Your circle"}
                </p>
                <p className="mt-2 text-sm text-foreground/58">
                  Daily progress is visible to everyone in the group. That is the point.
                </p>
              </div>
            </div>
          </Card>

          <div className="rounded-3xl border border-border/80 bg-card px-4 py-4">
            <p className="text-xs uppercase tracking-[0.2em] text-foreground/40">First goal</p>
            <p className="mt-2 font-medium">Set up new habit</p>
            <p className="mt-1 text-sm text-foreground/56">Main habit: {habitLabel}</p>
            <p className="mt-1 text-sm text-foreground/56">Minimum version: {minimumLabel}</p>
          </div>

          {error ? <p className="text-sm text-red-500">{error}</p> : null}

          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={previousStep}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button className="flex-1" onClick={finishOnboarding} disabled={saving}>
              {saving ? "Logging..." : "Log my first day"}
            </Button>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
