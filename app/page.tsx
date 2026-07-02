"use client";

import Link from "next/link";
import { ChevronRight, Heart, MessagesSquare, PiggyBank } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { TransactionRow } from "@/components/transaction-row";
import { Card, ProgressBar, Section, StatusPill } from "@/components/ui";
import {
  currency,
  getBudgetGroups,
  getDashboardMetrics,
  getGirlfriendBreakdown,
  getProgressTone,
  statusLabel
} from "@/lib/calculations";
import { useStore } from "@/lib/store";

const heroAccent: Record<string, string> = {
  safe: "from-emerald-500/20",
  tight: "from-amber-500/15",
  over: "from-rose-500/20"
};

const heroPill: Record<string, string> = {
  safe: "text-emerald-300",
  tight: "text-amber-300",
  over: "text-rose-300"
};

export default function DashboardPage() {
  const { transactions } = useStore();
  const metrics = getDashboardMetrics(transactions);
  const girlfriendBreakdown = getGirlfriendBreakdown(transactions);

  const categoryRows = getBudgetGroups(transactions)
    .filter((group) => group.name !== "Girlfriend")
    .flatMap((group) => group.rows)
    .filter((row) => row.spent > 0)
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 5);

  const recent = transactions.slice(0, 4);
  const girlfriendLimit = 5000;

  return (
    <AppShell title="Today" subtitle={`July 2026 · Day ${metrics.daysElapsed} of ${metrics.daysInMonth}`}>
      {/* Hero: safe to spend today */}
      <div
        className={`relative mb-4 overflow-hidden rounded-3xl bg-ink p-6 text-white shadow-soft dark:bg-white/[0.07] dark:shadow-none`}
      >
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b to-transparent ${heroAccent[metrics.spendStatus]}`}
        />
        <div className="relative">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-white/60">Safe to spend today</p>
            <span
              className={`inline-flex items-center rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold ${heroPill[metrics.spendStatus]}`}
            >
              {statusLabel[metrics.spendStatus]}
            </span>
          </div>
          <p className="tnum mt-2 text-5xl font-bold tracking-tight">
            {currency.format(metrics.safeToSpendToday)}
          </p>
          <p className="mt-2 text-sm text-white/55">
            {currency.format(metrics.remainingBudget)} left ÷ {metrics.daysLeft} days remaining
          </p>

          <div className="mt-5 grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
            <div>
              <p className="text-xs font-medium text-white/55">Left this month</p>
              <p className="tnum mt-1 text-lg font-semibold">
                {currency.format(metrics.remainingBudget)}
              </p>
              <ProgressBar
                percent={metrics.actualSpend / metrics.monthlySpendCap}
                tone={getProgressTone(metrics.actualSpend / metrics.monthlySpendCap)}
                className="mt-2 bg-white/15"
              />
            </div>
            <div>
              <p className="text-xs font-medium text-white/55">Projected month-end</p>
              <p
                className={`tnum mt-1 text-lg font-semibold ${
                  metrics.projectionStatus === "over"
                    ? "text-rose-400"
                    : metrics.projectionStatus === "tight"
                      ? "text-amber-400"
                      : "text-emerald-400"
                }`}
              >
                {metrics.projectedRemaining >= 0
                  ? `${currency.format(metrics.projectedRemaining)} left`
                  : `${currency.format(Math.abs(metrics.projectedRemaining))} over`}
              </p>
              <p className="mt-2 text-[11px] leading-4 text-white/45">
                At your current pace
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending clarifications action card */}
      {metrics.pendingClarifications > 0 ? (
        <Link href="/review" className="mb-7 block">
          <Card className="flex items-center gap-3 border-amber-500/30 bg-amber-500/[0.08] transition active:scale-[0.99] dark:bg-amber-500/10">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400">
              <MessagesSquare className="size-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">
                {metrics.pendingClarifications} transactions need answers
              </span>
              <span className="mt-0.5 block text-sm text-ink/55 dark:text-cloud/55">
                Quick taps — they sharpen today&apos;s number.
              </span>
            </span>
            <ChevronRight className="size-5 shrink-0 text-ink/35 dark:text-cloud/35" aria-hidden="true" />
          </Card>
        </Link>
      ) : null}

      {/* Girlfriend spend */}
      <Section title="Girlfriend spend">
        <Card>
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-violet-500/12 text-violet-600 dark:text-violet-400">
              <Heart className="size-5" aria-hidden="true" />
            </span>
            <div className="flex-1">
              <p className="tnum text-xl font-bold">{currency.format(metrics.girlfriendSpend)}</p>
              <p className="text-xs text-ink/45 dark:text-cloud/45">
                of {currency.format(girlfriendLimit)} this month
              </p>
            </div>
            <StatusPill tone="love">
              {Math.round((metrics.girlfriendSpend / girlfriendLimit) * 100)}%
            </StatusPill>
          </div>
          <ProgressBar
            percent={metrics.girlfriendSpend / girlfriendLimit}
            tone="love"
            className="mt-3"
          />
          {girlfriendBreakdown.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {girlfriendBreakdown.map(({ tag, amount }) => (
                <span
                  key={tag}
                  className="tnum rounded-full bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-violet-700 dark:text-violet-300"
                >
                  {tag} · {currency.format(amount)}
                </span>
              ))}
            </div>
          ) : null}
        </Card>
      </Section>

      {/* Category spend */}
      <Section
        title="Where it's going"
        action={
          <Link href="/budget" className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
            Budgets
          </Link>
        }
      >
        <Card className="divide-y divide-black/[0.05] p-0 dark:divide-white/[0.06]">
          {categoryRows.map((row) => {
            const percent = row.limit > 0 ? row.spent / row.limit : 0;

            return (
              <div key={row.label} className="px-4 py-3">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-sm font-semibold">{row.label}</p>
                  <p className="tnum text-sm text-ink/55 dark:text-cloud/55">
                    <span className="font-semibold text-ink dark:text-cloud">
                      {currency.format(row.spent)}
                    </span>{" "}
                    / {currency.format(row.limit)}
                  </p>
                </div>
                <ProgressBar percent={percent} tone={getProgressTone(percent)} className="mt-2" />
              </div>
            );
          })}
        </Card>
      </Section>

      {/* Recent activity */}
      <Section
        title="Recent activity"
        action={
          <Link
            href="/transactions"
            className="text-sm font-semibold text-emerald-700 dark:text-emerald-400"
          >
            All
          </Link>
        }
      >
        <Card className="divide-y divide-black/[0.05] p-0 dark:divide-white/[0.06]">
          {recent.map((tx) => (
            <TransactionRow key={tx.id} transaction={tx} />
          ))}
        </Card>
      </Section>

      {/* Savings */}
      <Card className="mb-2 flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-emerald-500/12 text-emerald-600 dark:text-emerald-400">
          <PiggyBank className="size-5" aria-hidden="true" />
        </span>
        <div className="flex-1">
          <p className="font-semibold">Savings target</p>
          <p className="text-xs text-ink/45 dark:text-cloud/45">
            {currency.format(metrics.requiredSavings)} reserved before spending
          </p>
        </div>
        <StatusPill tone="safe">On track</StatusPill>
      </Card>
    </AppShell>
  );
}
