"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Camera,
  Home,
  MessageCircle,
  ReceiptText,
  Sparkles,
  WalletCards
} from "lucide-react";
import { clsx } from "clsx";
import { useStore } from "@/lib/store";
import { ThemeToggle } from "./theme-toggle";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/review", label: "Review", icon: MessageCircle },
  { href: "/transactions", label: "Activity", icon: ReceiptText },
  { href: "/budget", label: "Budget", icon: WalletCards },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/insights", label: "Insights", icon: Sparkles }
];

type AppShellProps = {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
};

export function AppShell({ children, title, subtitle }: AppShellProps) {
  const pathname = usePathname();
  const { pendingCount } = useStore();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col sm:my-6 sm:min-h-[calc(100vh-3rem)] sm:overflow-hidden sm:rounded-[32px] sm:border sm:border-black/[0.06] sm:bg-white/40 sm:shadow-soft sm:backdrop-blur dark:sm:border-white/[0.08] dark:sm:bg-white/[0.02]">
      <header className="sticky top-0 z-20 border-b border-black/[0.04] bg-[#f5f5f8]/90 px-5 pb-3 pt-[max(env(safe-area-inset-top),1.25rem)] backdrop-blur-xl dark:border-white/[0.06] dark:bg-[#0b0c10]/90">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-emerald-700 dark:text-emerald-400">
              SafeSpend
            </p>
            <h1 className="mt-0.5 text-2xl font-bold tracking-tight">{title}</h1>
            {subtitle ? (
              <p className="mt-0.5 text-sm text-ink/50 dark:text-cloud/50">{subtitle}</p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/upload"
              aria-label="Upload screenshot"
              className={clsx(
                "grid size-9 place-items-center rounded-full border transition",
                pathname === "/upload"
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  : "border-black/[0.07] bg-white text-ink/60 hover:text-ink dark:border-white/10 dark:bg-white/[0.06] dark:text-cloud/60 dark:hover:text-cloud"
              )}
            >
              <Camera className="size-4" aria-hidden="true" />
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 px-5 pb-6 pt-2">{children}</main>

      <nav className="sticky bottom-0 z-30 border-t border-black/[0.06] bg-white/90 px-2 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-2 backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#0b0c10]/90">
        <div className="grid grid-cols-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            const showBadge = item.href === "/review" && pendingCount > 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                className={clsx(
                  "relative flex h-12 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-medium transition",
                  active
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-ink/45 hover:text-ink dark:text-cloud/45 dark:hover:text-cloud"
                )}
              >
                <span className="relative">
                  <Icon className="size-5" strokeWidth={active ? 2.4 : 2} aria-hidden="true" />
                  {showBadge ? (
                    <span className="absolute -right-2 -top-1.5 grid min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[9px] font-bold leading-4 text-white">
                      {pendingCount}
                    </span>
                  ) : null}
                </span>
                <span className="max-w-full truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
