"use client";

import Link from "next/link";
import {
  Banknote,
  CalendarClock,
  ChevronRight,
  Sparkles,
  Target,
  WalletCards,
  type LucideIcon
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui";
import { currency, getDashboardMetrics, getInsights } from "@/lib/calculations";
import { useStore } from "@/lib/store";

type HubRow = {
  href: string;
  label: string;
  detail: string;
  summary?: string;
  icon: LucideIcon;
  className: string;
};

export default function PlanHubPage() {
  const { transactions, payments, debts, goals, budget } = useStore();
  const metrics = getDashboardMetrics(transactions, payments, debts, budget);
  const { totalDebtBalance } = getInsights(transactions, debts);

  const rows: HubRow[] = [
    {
      href: "/budget",
      label: "Budget",
      detail: "Income, savings, and category limits",
      summary: `${currency.format(metrics.monthlySpendCap)} cap`,
      icon: WalletCards,
      className: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400"
    },
    {
      href: "/bills",
      label: "Bills & Calendar",
      detail: "Scheduled payments, reserved from safe-to-spend",
      summary:
        metrics.upcomingCommitments.length > 0
          ? `${metrics.upcomingCommitments.length} due`
          : "None due",
      icon: CalendarClock,
      className: "bg-sky-500/12 text-sky-600 dark:text-sky-400"
    },
    {
      href: "/goals",
      label: "Goals",
      detail: "What you're saving toward",
      summary: goals.length > 0 ? `${goals.length}` : "None yet",
      icon: Target,
      className: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400"
    },
    {
      href: "/debts",
      label: "Debts",
      detail: "Balances and payoff estimates",
      summary: totalDebtBalance > 0 ? currency.format(totalDebtBalance) : "None",
      icon: Banknote,
      className: "bg-rose-500/12 text-rose-600 dark:text-rose-400"
    },
    {
      href: "/insights",
      label: "Insights",
      detail: `Where ${metrics.monthName}'s money is going`,
      icon: Sparkles,
      className: "bg-violet-500/12 text-violet-600 dark:text-violet-400"
    }
  ];

  return (
    <AppShell title="Plan" subtitle="Budget, bills, goals, debts, and insights">
      <div className="space-y-3">
        {rows.map((row) => {
          const Icon = row.icon;

          return (
            <Link key={row.href} href={row.href} className="block">
              <Card className="flex items-center gap-3 transition active:scale-[0.99]">
                <span
                  className={`grid size-11 shrink-0 place-items-center rounded-full ${row.className}`}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{row.label}</p>
                  <p className="mt-0.5 truncate text-xs text-ink/45 dark:text-cloud/45">
                    {row.detail}
                  </p>
                </div>
                {row.summary ? (
                  <span className="tnum shrink-0 text-sm font-semibold text-ink/70 dark:text-cloud/70">
                    {row.summary}
                  </span>
                ) : null}
                <ChevronRight
                  className="size-5 shrink-0 text-ink/30 dark:text-cloud/30"
                  aria-hidden="true"
                />
              </Card>
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}
