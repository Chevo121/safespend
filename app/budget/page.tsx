"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarClock, ChevronRight, Wand2, X } from "lucide-react";
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
  const { transactions, payments, limits, setLimit, rules, removeRule } = useStore();
  const [editing, setEditing] = useState(false);
  const metrics = getDashboardMetrics(transactions, payments);
  const groups = getBudgetGroups(transactions, limits);
  const poolUsed = metrics.actualSpend / metrics.monthlySpendCap;

  return (
    <AppShell title="Budget" subtitle="How the flexible pool works this month">
      {/* Flexible pool explainer */}
      <Section title="Flexible pool">
        <Card>
          <div className="tnum flex items-baseline justify-between gap-3">
            <p className="text-2xl font-bold">{currency.format(metrics.discretionaryRemaining)}</p>
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
              <span className="text-ink/55 dark:text-cloud/55">Upcoming bills reserved</span>
              <span className="tnum font-semibold text-sky-700 dark:text-sky-400">
                −{currency.format(metrics.committedRemaining)}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-ink/55 dark:text-cloud/55">Spent so far</span>
              <span className="tnum font-semibold">−{currency.format(metrics.actualSpend)}</span>
            </div>
            <div className="flex justify-between gap-3 border-t border-black/[0.05] pt-2 dark:border-white/[0.06]">
              <span className="font-semibold">Free to spend</span>
              <span className="tnum font-bold">
                {currency.format(metrics.discretionaryRemaining)}
              </span>
            </div>
          </div>
          <p className="mt-3 text-xs leading-5 text-ink/45 dark:text-cloud/45">
            Everything that isn&apos;t savings, scheduled bills, or excluded comes out of this
            one pool. Category limits below are guides, not separate wallets.
          </p>
        </Card>
        <Link
          href="/calendar"
          className="mt-2 flex items-center justify-between gap-2 px-1 text-sm font-semibold text-sky-700 dark:text-sky-400"
        >
          <span className="flex items-center gap-1.5">
            <CalendarClock className="size-4" aria-hidden="true" />
            Edit scheduled bills on the calendar
          </span>
          <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
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
      {groups.map((group, index) => (
        <Section
          key={group.name}
          title={group.name}
          action={
            index === 0 ? (
              <button
                onClick={() => setEditing((value) => !value)}
                className="text-sm font-semibold text-emerald-700 dark:text-emerald-400"
              >
                {editing ? "Done" : "Edit limits"}
              </button>
            ) : undefined
          }
        >
          <Card className="divide-y divide-black/[0.05] p-0 dark:divide-white/[0.06]">
            {group.rows.map((row) => {
              const percent = row.limit > 0 ? row.spent / row.limit : 0;
              const tone = getProgressTone(percent);

              return (
                <div key={row.label} className="px-4 py-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{row.label}</p>
                    {editing ? (
                      <label className="flex items-center gap-1.5 text-sm text-ink/55 dark:text-cloud/55">
                        <span className="tnum font-semibold text-ink dark:text-cloud">
                          {currency.format(row.spent)}
                        </span>
                        /
                        <input
                          type="number"
                          inputMode="numeric"
                          min="0"
                          value={row.limit}
                          onChange={(event) => setLimit(row.label, Number(event.target.value))}
                          aria-label={`${row.label} monthly limit`}
                          className="tnum min-h-9 w-24 rounded-lg border border-emerald-500/40 bg-white px-2 text-right text-sm font-semibold outline-none focus:border-emerald-500 dark:border-emerald-400/40 dark:bg-white/[0.06]"
                        />
                      </label>
                    ) : (
                      <p className="tnum text-sm text-ink/55 dark:text-cloud/55">
                        <span className="font-semibold text-ink dark:text-cloud">
                          {currency.format(row.spent)}
                        </span>{" "}
                        / {currency.format(row.limit)}
                      </p>
                    )}
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

      {/* Merchant auto-rules */}
      <Section title="Auto-categorization rules">
        {rules.length > 0 ? (
          <Card className="divide-y divide-black/[0.05] p-0 dark:divide-white/[0.06]">
            {rules.map((rule) => (
              <div key={rule.merchant} className="flex items-center gap-3 px-4 py-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-emerald-500/12 text-emerald-600 dark:text-emerald-400">
                  <Wand2 className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{rule.merchant}</p>
                  <p className="mt-0.5 text-xs text-ink/45 dark:text-cloud/45">
                    Always “{rule.label}” → {rule.category}
                  </p>
                </div>
                <button
                  onClick={() => removeRule(rule.merchant)}
                  aria-label={`Remove rule for ${rule.merchant}`}
                  className="grid size-9 shrink-0 place-items-center rounded-full text-ink/40 transition hover:bg-rose-500/10 hover:text-rose-600 dark:text-cloud/40 dark:hover:text-rose-400"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>
            ))}
          </Card>
        ) : (
          <Card className="py-6 text-center text-sm text-ink/45 dark:text-cloud/45">
            None yet. In Review, check “Always use this answer” to skip repeat questions.
          </Card>
        )}
      </Section>
    </AppShell>
  );
}
