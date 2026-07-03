"use client";

import { useState } from "react";
import { Wand2, X } from "lucide-react";
import { Card, ProgressBar, Section } from "@/components/ui";
import { NumberField } from "@/components/number-field";
import {
  currency,
  getBudgetGroups,
  getDashboardMetrics,
  getProgressTone
} from "@/lib/calculations";
import { useStore } from "@/lib/store";

export function PlanBudget() {
  const { transactions, payments, debts, limits, setLimit, rules, removeRule, budget, setBudget } =
    useStore();
  const [editing, setEditing] = useState(false);
  const [editingBudget, setEditingBudget] = useState(!budget.income);
  const metrics = getDashboardMetrics(transactions, payments, debts, budget);
  const groups = getBudgetGroups(transactions, limits, new Date(), budget.payDay);
  const poolUsed = metrics.pool > 0 ? metrics.spent / metrics.pool : 0;

  return (
    <>
      <Section
        title="Monthly budget"
        action={
          <button
            onClick={() => setEditingBudget((value) => !value)}
            className="text-sm font-semibold text-emerald-700 dark:text-emerald-400"
          >
            {editingBudget ? "Done" : "Edit"}
          </button>
        }
      >
        <Card>
          {editingBudget ? (
            <div className="space-y-3">
              <BudgetField
                label="Income each pay cycle"
                value={budget.income}
                onChange={(value) => setBudget({ income: value })}
              />
              <BudgetField
                label="Savings reserved first"
                value={budget.savingsReserved}
                onChange={(value) => setBudget({ savingsReserved: value })}
              />
              <label className="flex items-center justify-between gap-3">
                <span className="text-sm text-ink/55 dark:text-cloud/55">Pay day (of month)</span>
                <NumberField
                  allowDecimal={false}
                  max={31}
                  ariaLabel="Pay day of month"
                  value={budget.payDay}
                  onChange={(value) => setBudget({ payDay: Math.min(Math.max(value, 1), 31) })}
                  className="tnum min-h-10 w-24 rounded-lg border border-emerald-500/40 bg-white px-3 text-right text-sm font-semibold outline-none focus:border-emerald-500 dark:border-emerald-400/40 dark:bg-white/[0.06]"
                />
              </label>
              <p className="rounded-lg bg-emerald-500/[0.08] px-3 py-2 text-xs leading-5 text-emerald-800 dark:text-emerald-300">
                Income lands as one deposit on the {ordinal(budget.payDay)}. Salary and commission
                go in together — no separate commission entry.
              </p>
              <div className="flex items-center justify-between gap-3 border-t border-black/[0.05] pt-3 text-sm dark:border-white/[0.06]">
                <span className="font-semibold">Spendable this cycle</span>
                <span className="tnum font-bold">{currency.format(metrics.pool)}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-ink/55 dark:text-cloud/55">Income each cycle</span>
                <span className="tnum font-semibold">{currency.format(budget.income)}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-ink/55 dark:text-cloud/55">Savings reserved first</span>
                <span className="tnum font-semibold text-emerald-700 dark:text-emerald-400">
                  −{currency.format(budget.savingsReserved)}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-ink/55 dark:text-cloud/55">Bills & debt reserved</span>
                <span className="tnum font-semibold text-sky-700 dark:text-sky-400">
                  −{currency.format(metrics.committedTotal)}
                </span>
              </div>
              <div className="flex justify-between gap-3 border-t border-black/[0.05] pt-2 dark:border-white/[0.06]">
                <span className="font-semibold">Spendable this cycle</span>
                <span className="tnum font-bold">{currency.format(metrics.pool)}</span>
              </div>
            </div>
          )}
        </Card>
      </Section>

      <Section title="Flexible pool">
        <Card>
          <div className="tnum flex items-baseline justify-between gap-3">
            <p className="text-2xl font-bold">{currency.format(metrics.remaining)}</p>
            <p className="text-sm text-ink/50 dark:text-cloud/50">
              of {currency.format(metrics.pool)}
            </p>
          </div>
          <ProgressBar percent={poolUsed} tone={getProgressTone(poolUsed)} className="mt-3" />
          <p className="mt-3 text-xs leading-5 text-ink/45 dark:text-cloud/45">
            One pool for everything that isn&apos;t savings, scheduled bills, or excluded.
            Underspend banks as cushion; leftover sweeps to savings when the cycle closes.
            Category limits below are guides, not separate wallets.
          </p>
        </Card>
      </Section>

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
                        <NumberField
                          allowDecimal={false}
                          value={row.limit}
                          onChange={(value) => setLimit(row.label, value)}
                          ariaLabel={`${row.label} limit`}
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
            None yet. When reviewing, check “Always use this answer” to skip repeat questions.
          </Card>
        )}
      </Section>
    </>
  );
}

function BudgetField({
  label,
  value,
  onChange
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3">
      <span className="text-sm text-ink/55 dark:text-cloud/55">{label}</span>
      <NumberField
        value={value}
        onChange={onChange}
        ariaLabel={label}
        className="tnum min-h-10 w-32 rounded-lg border border-emerald-500/40 bg-white px-3 text-right text-sm font-semibold outline-none focus:border-emerald-500 dark:border-emerald-400/40 dark:bg-white/[0.06]"
      />
    </label>
  );
}

function ordinal(day: number) {
  const rem10 = day % 10;
  const rem100 = day % 100;
  if (rem10 === 1 && rem100 !== 11) return `${day}st`;
  if (rem10 === 2 && rem100 !== 12) return `${day}nd`;
  if (rem10 === 3 && rem100 !== 13) return `${day}rd`;
  return `${day}th`;
}
