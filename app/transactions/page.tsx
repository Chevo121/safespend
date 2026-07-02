"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { AppShell } from "@/components/app-shell";
import { TransactionRow } from "@/components/transaction-row";
import { Card, Section } from "@/components/ui";
import { currency, getDashboardMetrics, getInsights } from "@/lib/calculations";
import { useStore } from "@/lib/store";
import type { Transaction } from "@/lib/types";

const filters = [
  { key: "all", label: "All" },
  { key: "needs_review", label: "Needs review" },
  { key: "approved", label: "Approved" },
  { key: "ignored", label: "Excluded" }
] as const;

type FilterKey = (typeof filters)[number]["key"];

function matches(tx: Transaction, filter: FilterKey) {
  if (filter === "all") {
    return true;
  }

  if (filter === "needs_review") {
    return tx.status === "needs_review" || tx.status === "duplicate_candidate";
  }

  return tx.status === filter;
}

export default function TransactionsPage() {
  const { transactions, payments, debts, budget } = useStore();
  const [filter, setFilter] = useState<FilterKey>("all");

  const metrics = getDashboardMetrics(transactions, payments, debts, budget);
  const { selfTransferExcluded } = getInsights(transactions, debts);
  const visible = transactions.filter((tx) => matches(tx, filter));

  return (
    <AppShell
      title="Activity"
      subtitle={`${transactions.length} imported · ${currency.format(metrics.actualSpend)} counted, ${currency.format(selfTransferExcluded)} excluded`}
    >
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {filters.map(({ key, label }) => {
          const count = transactions.filter((tx) => matches(tx, key)).length;

          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={clsx(
                "flex min-h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold transition",
                filter === key
                  ? "bg-ink text-white dark:bg-cloud dark:text-ink"
                  : "bg-white text-ink/55 shadow-card dark:bg-white/[0.06] dark:text-cloud/55 dark:shadow-none"
              )}
            >
              {label}
              <span
                className={clsx(
                  "tnum text-xs",
                  filter === key ? "opacity-60" : "opacity-50"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <Section title={metrics.monthLabel}>
        {visible.length > 0 ? (
          <Card className="divide-y divide-black/[0.05] p-0 dark:divide-white/[0.06]">
            {visible.map((tx) => (
              <TransactionRow key={tx.id} transaction={tx} interactive />
            ))}
          </Card>
        ) : (
          <Card className="py-8 text-center text-sm text-ink/45 dark:text-cloud/45">
            Nothing here for this filter.
          </Card>
        )}
        <p className="mt-2 px-1 text-xs leading-5 text-ink/40 dark:text-cloud/40">
          Tap a transaction to change its answer or toggle girlfriend spend.
        </p>
      </Section>
    </AppShell>
  );
}
