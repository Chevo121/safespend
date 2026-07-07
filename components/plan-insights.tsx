"use client";

import {
  ArrowLeftRight,
  Banknote,
  Car,
  Heart,
  Receipt,
  type LucideIcon
} from "lucide-react";
import { Card, ProgressBar, Section, StatusPill, type Tone } from "@/components/ui";
import {
  currency,
  getDashboardMetrics,
  getGirlfriendBreakdown,
  getInsights,
  preciseCurrency
} from "@/lib/calculations";
import { useStore } from "@/lib/store";

type Insight = {
  icon: LucideIcon;
  tone: Tone;
  title: string;
  value: string;
  body: string;
};

export function PlanInsights() {
  const { transactions, payments, debts, budget, limits } = useStore();
  const metrics = getDashboardMetrics(transactions, payments, debts, budget);
  const girlfriendBreakdown = getGirlfriendBreakdown(transactions, new Date(), budget.payDay);
  const { transportSpend, selfTransferExcluded, totalDebtBalance, largestTransaction } =
    getInsights(transactions, debts, new Date(), budget.payDay);

  const girlfriendLimit = limits["Girlfriend spend"] ?? 5000;

  const insights: Insight[] = [
    {
      icon: Car,
      tone: "info",
      title: "Transport & delivery",
      value: currency.format(transportSpend),
      body: "Uber rides plus Uber Eats, split between you and relationship spend by your answers."
    },
    {
      icon: Banknote,
      tone: "over",
      title: "Debt outstanding",
      value: currency.format(totalDebtBalance),
      body: "Total balance across tracked debts. Payoff estimates are in the Debts section."
    },
    {
      icon: ArrowLeftRight,
      tone: "neutral",
      title: "Excluded transfers to self",
      value: currency.format(selfTransferExcluded),
      body: "Moves between your own accounts. They never count against the flexible pool."
    },
    ...(largestTransaction
      ? [
          {
            icon: Receipt,
            tone: "tight" as Tone,
            title: "Largest transaction",
            value: preciseCurrency.format(Math.abs(largestTransaction.amountMxn)),
            body: `${largestTransaction.merchant} — the biggest single counted expense so far.`
          }
        ]
      : [])
  ];

  return (
    <>
      <Section title="Relationship spend">
        <Card>
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-violet-500/12 text-violet-600 dark:text-violet-400">
              <Heart className="size-5" aria-hidden="true" />
            </span>
            <div className="flex-1">
              <p className="tnum text-xl font-bold">{currency.format(metrics.girlfriendSpend)}</p>
              <p className="text-xs text-ink/45 dark:text-cloud/45">
                of {currency.format(girlfriendLimit)} this period
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
          ) : (
            <p className="mt-3 text-xs text-ink/45 dark:text-cloud/45">
              Tag any transaction as relationship spend from Activity.
            </p>
          )}
        </Card>
      </Section>

      <Section title="This period">
        <div className="space-y-3">
          {insights.map((insight) => {
            const Icon = insight.icon;

            return (
              <Card key={insight.title} className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-black/[0.05] dark:bg-white/[0.08]">
                  <Icon className="size-5 text-ink/60 dark:text-cloud/60" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-semibold">{insight.title}</h3>
                    <StatusPill tone={insight.tone}>{insight.value}</StatusPill>
                  </div>
                  <p className="mt-1.5 text-sm leading-6 text-ink/55 dark:text-cloud/55">
                    {insight.body}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </Section>
    </>
  );
}
