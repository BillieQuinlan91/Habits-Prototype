import Link from "next/link";
import { ReactNode } from "react";
import { CircleUserRound, House, MessageSquareText, Sparkles, Users } from "lucide-react";

import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function AppShell({
  children,
  activeTab,
  isDemo = false,
  showFeedbackLink = false,
}: {
  children: ReactNode;
  activeTab: "today" | "tribe" | "journey" | "profile";
  isDemo?: boolean;
  showFeedbackLink?: boolean;
}) {
  const tabs = [
    { href: "/today", label: "Today", icon: House, key: "today" },
    { href: "/tribe", label: "Team", icon: Users, key: "tribe" },
    { href: "/journey", label: "Journey", icon: Sparkles, key: "journey" },
    { href: "/profile", label: "Profile", icon: CircleUserRound, key: "profile" },
  ] as const;

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 pb-28 pt-5 sm:max-w-lg">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-[1.55rem] font-normal tracking-tight text-foreground/84">
          {APP_NAME}
        </h1>
        <div className="flex items-center gap-2">
          {showFeedbackLink ? (
            <Link
              href="/feedback"
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border/70 bg-card/70 px-2.5 text-[11px] font-medium text-foreground/58"
            >
              <MessageSquareText className="h-3 w-3" />
              Feedback
            </Link>
          ) : null}
          {isDemo ? (
            <span className="rounded-full border border-accent/16 bg-accent/8 px-2.5 py-1 text-[11px] font-semibold text-accent">
              Demo mode
            </span>
          ) : null}
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <nav className="fixed inset-x-0 bottom-4 mx-auto flex max-w-md justify-center px-4 sm:max-w-lg">
        <div className="flex w-full items-center justify-between rounded-[20px] border border-border/80 bg-card/95 p-2 shadow-soft backdrop-blur">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs transition",
                  active ? "text-accent" : "text-foreground/48",
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "mt-1 h-[2px] w-7 rounded-full transition",
                    active ? "bg-accent" : "bg-transparent",
                  )}
                />
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
