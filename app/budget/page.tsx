"use client";

import { AppShell } from "@/components/app-shell";
import { Card, ProgressBar, Section, StatusPill } from "@/components/ui";
import {
  currency,
  getBudgetGroups,
  getDashboardMetrics,
  getProgressTone
} from "@/lib/calculations";
import { defaultBudget } from "@/lib/mock-data";
import { useStore } from "@/lib/store";

export default function BudgetPage() {
  const { transactions } = useStore();
  const metrics = getDashboardMetrics(transactions);
  const groups = getBudgetGroups(transactions);
  const poolUsed = metrics.actualSpend / metrics.monthlySpendCap;

  return (
    <AppShell title="Budget" subtitle="How the flexible pool works this month">
      {/* Flexible pool explainer */}
      <Section title="Flexible pool">
        <Card>
          <div className="tnum flex items-baseline justify-between gap-3">
            <p className="text-2xl font-bold">{currency.format(metrics.remainingBudget)}</p>
            <p className="text-sm text-ink/50 dark:text-cloud/50">
              of {currency.format(metrics.monthlySpendCap)}
            </p>
          </div>
          <ProgressBar percent={poolUsed} tone={getProgressTone(poolUsed)} className="mt-3" />
          <div className="mt-4 space-y-2 border-t border-black/[0.05] pt-3 text-sm dark:border-white/[0.06]">
            <div className="flex justify-between gap-3">
              <span className="text-ink/55 dark:text-cloud/55">Fixed monthly income</span>
              <span className="tnum font-semibold">
                {currency.format(defaultBudget.fixedMonthlyIncome)}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-ink/55 dark:text-cloud/55">Savings reserved first</span>
              <span className="tnum font-semibold text-emerald-700 dark:text-emerald-400">
                −{currency.format(defaultBudget.requiredSavings)}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-ink/55 dark:text-cloud/55">Spent so far</span>
              <span className="tnum font-semibold">−{currency.format(metrics.actualSpend)}</span>
            </div>
            <div className="flex justify-between gap-3 border-t border-black/[0.05] pt-2 dark:border-white/[0.06]">
              <span className="font-semibold">Left to spend</span>
              <span className="tnum font-bold">{currency.format(metrics.remainingBudget)}</span>
            </div>
          </div>
          <p className="mt-3 text-xs leading-5 text-ink/45 dark:text-cloud/45">
            Everything that isn&apos;t savings or excluded comes out of this one pool. Category
            limits below are guides, not separate wallets.
          </p>
        </Card>
      </Section>

      {/* Savings */}
      <Section title="Savings">
        <Card className="flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold">Required savings</p>
            <p className="mt-0.5 text-xs text-ink/45 dark:text-cloud/45">
              Plus {Math.round(defaultBudget.commissionSavingsRate * 100)}% of any commission
              income
            </p>
          </div>
          <div className="text-right">
            <p className="tnum font-bold">{currency.format(defaultBudget.requiredSavings)}</p>
            <StatusPill tone="safe">Reserved</StatusPill>
          </div>
        </Card>
      </Section>

      {/* Category groups */}
      {groups.map((group) => (
        <Section key={group.name} title={group.name}>
          <Card className="divide-y divide-black/[0.05] p-0 dark:divide-white/[0.06]">
            {group.rows.map((row) => {
              const percent = row.limit > 0 ? row.spent / row.limit : 0;
              const tone = getProgressTone(percent);

              return (
                <div key={row.label} className="px-4 py-3.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="font-semibold">{row.label}</p>
                    <p className="tnum text-sm text-ink/55 dark:text-cloud/55">
                      <span className="font-semibold text-ink dark:text-cloud">
                        {currency.format(row.spent)}
                      </span>{" "}
                      / {currency.format(row.limit)}
                    </p>
                  </div>
                  <ProgressBar percent={percent} tone={tone} className="mt-2.5" />
                  <p className="mt-2 text-xs text-ink/40 dark:text-cloud/40">{row.detail}</p>
                </div>
              );
            })}
          </Card>
          <p className="mt-2 px-1 text-xs leading-5 text-ink/40 dark:text-cloud/40">
            {group.description}
          </p>
        </Section>
      ))}
    </AppShell>
  );
}
