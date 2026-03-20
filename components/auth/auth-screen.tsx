"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export function AuthScreen() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const isConfigured = useMemo(() => hasSupabaseEnv(), []);

  async function handleMagicLink() {
    if (!isConfigured) {
      setStatus("success");
      return;
    }

    try {
      setStatus("loading");
      const supabase = createClient();
      const origin =
        typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL;

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${origin}/api/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }

      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-between px-4 pb-10 pt-8">
      <div className="space-y-8">
        <div className="space-y-4">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/12 text-accent">
            <Sparkles className="h-5 w-5" />
          </span>
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.26em] text-foreground/38">Becoming</p>
            <h1 className="font-display text-5xl font-semibold leading-none tracking-tight">
              Small habits.
              <br />
              Stronger founders.
            </h1>
            <p className="max-w-sm text-sm leading-6 text-foreground/62">
              Track the habits that matter, then show up for your tribe every Sunday.
            </p>
          </div>
        </div>

        <Card className="space-y-4">
          <div>
            <p className="font-display text-xl font-semibold">Sign in with magic link</p>
            <p className="mt-1 text-sm text-foreground/55">
              Clean entry. No passwords. Just your email.
            </p>
          </div>

          <Input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <Button onClick={handleMagicLink} disabled={!email || status === "loading"} className="w-full">
            {status === "loading" ? "Sending..." : "Send magic link"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <p className="text-sm text-foreground/55">
            {status === "success" && isConfigured
              ? "Check your inbox for the sign-in link."
              : status === "success"
                ? "Supabase env is not configured yet. Use the demo routes after setup."
                : status === "error"
                  ? "Something went wrong. Verify your Supabase configuration and try again."
                  : "Integrations and reminders are coming soon."}
          </p>
        </Card>
      </div>

      <p className="text-xs leading-5 text-foreground/38">
        Monochrome focus. Rotating energy. Built for founder accountability groups.
      </p>
    </div>
  );
}
