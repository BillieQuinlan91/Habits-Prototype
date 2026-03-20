"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv, isForcedDemoMode } from "@/lib/supabase/env";

export function AuthScreen() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const isConfigured = useMemo(() => hasSupabaseEnv(), []);
  const isDemoMode = useMemo(() => isForcedDemoMode() || !isConfigured, [isConfigured]);

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
              Quiet progress.
              <br />
              Daily, if possible.
            </h1>
            <p className="max-w-sm text-sm leading-6 text-foreground/62">
              Small actions, repeated often, shape a life. The rest is mostly repetition.
            </p>
          </div>
        </div>

        <Card className="space-y-4">
          <div>
            <p className="font-display text-xl font-semibold">
              {isDemoMode ? "Explore the testing build" : "Sign in with magic link"}
            </p>
            <p className="mt-1 text-sm text-foreground/55">
              {isDemoMode
                ? "Auth is politely out of the way so testing can focus on the product loop."
                : "A sensible place to begin. No password required."}
            </p>
          </div>

          {isDemoMode ? (
            <>
              <Link href="/today" className="block">
                <Button className="w-full">
                  Start demo walkthrough
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <div className="rounded-3xl border border-dashed border-border p-4 text-sm text-foreground/55">
                Join a tribe, choose a few habits, log today, then offer a little encouragement.
              </div>
            </>
          ) : (
            <>
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
            </>
          )}

          <p className="text-sm text-foreground/55">
            {status === "success" && isConfigured
              ? "Check your inbox. A link should be waiting."
              : status === "success" && isDemoMode
                ? "The testing build is ready. Today is waiting."
                : status === "error"
                  ? "Something went wrong. Perfectly fixable. Try again."
                  : isDemoMode
                    ? "Use this build to review the flow, not the auth layer."
                    : "Reminders and integrations are developing quietly."}
          </p>
        </Card>
      </div>

      <p className="text-xs leading-5 text-foreground/38">
        A calm companion for repeatable effort.
      </p>
    </div>
  );
}
