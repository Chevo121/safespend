"use client";

import Link from "next/link";
import {
  ArrowLeftRight,
  Banknote,
  Car,
  ChevronRight,
  Heart,
  MessagesSquare,
  Receipt,
  type LucideIcon
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, Section, StatusPill, type Tone } from "@/components/ui";
import {
  currency,
  getDashboardMetrics,
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

export default function InsightsPage() {
  const { transactions } = useStore();
  const metrics = getDashboardMetrics(transactions);
  const { transportSpend, selfTransferExcluded, debtPayments, largestTransaction } =
    getInsights(transactions);

  const insights: Insight[] = [
    {
      icon: Heart,
      tone: "love",
      title: "Girlfriend spend",
      value: currency.format(metrics.girlfriendSpend),
      body: "Everything tagged toward Corina this month — transfers, rides, and shared expenses."
    },
    {
      icon: Car,
      tone: "info",
      title: "Transport & delivery",
      value: currency.format(transportSpend),
      body: "Uber rides plus Uber Eats. Beneficiary answers split this between you and girlfriend spend."
    },
    {
      icon: ArrowLeftRight,
      tone: "neutral",
      title: "Excluded transfers to self",
      value: currency.format(selfTransferExcluded),
      body: "Moves between your own accounts. They never count against the flexible pool."
    },
    {
      icon: Banknote,
      tone: "safe",
      title: "Debt payment",
      value: currency.format(debtPayments),
      body: "Didi Préstamos this month. Debt payments are tracked apart from day-to-day spend."
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
    <AppShell title="Insights" subtitle="Where July's money is actually going">
      {metrics.pendingClarifications > 0 ? (
        <Link href="/review" className="mb-7 block">
          <Card className="flex items-center gap-3 border-amber-500/30 bg-amber-500/[0.08] transition active:scale-[0.99] dark:bg-amber-500/10">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400">
              <MessagesSquare className="size-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">
                {metrics.pendingClarifications} answers pending
              </span>
              <span className="mt-0.5 block text-sm text-ink/55 dark:text-cloud/55">
                These numbers get sharper once everything is clarified.
              </span>
            </span>
            <ChevronRight className="size-5 shrink-0 text-ink/35 dark:text-cloud/35" aria-hidden="true" />
          </Card>
        </Link>
      ) : null}

      <Section title="This month">
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
    </AppShell>
  );
}
