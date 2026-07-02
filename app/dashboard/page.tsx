import Link from "next/link";
import { AlertCircle, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { MetricCard, Section, StatusPill } from "@/components/ui";
import { currency, getDashboardMetrics } from "@/lib/calculations";

export default function DashboardPage() {
  const metrics = getDashboardMetrics();

  const cards = [
    ["Income this month", currency.format(metrics.incomeThisMonth), "Fixed monthly income", "neutral"],
    ["Required savings", currency.format(metrics.requiredSavings), "Baseline rule", "good"],
    ["Actual saved", currency.format(metrics.actualSaved), "Mocked as on target", "good"],
    ["Monthly spend cap", currency.format(metrics.monthlySpendCap), "Income minus required savings", "neutral"],
    ["Actual spend", currency.format(metrics.actualSpend), "Self transfers excluded", "warn"],
    ["Flexible pool remaining", currency.format(metrics.flexiblePoolRemaining), "After reviewed spend", "good"],
    ["Safe to spend today", currency.format(metrics.safeToSpendToday), "Based on 30 days left", "good"],
    ["Days left in month", String(metrics.daysLeftInMonth), "July 2026 planning window", "neutral"],
    ["Girlfriend spend this month", currency.format(metrics.girlfriendSpend), "Corina transfers included", "hot"],
    ["Pending clarifications", String(metrics.pendingClarifications), "Needs answers", "warn"],
    ["Uber Eats weekend quota", currency.format(metrics.uberEatsWeekendQuota), "900 MXN mock quota", "neutral"]
  ] as const;

  return (
    <AppShell title="Dashboard" activePath="/dashboard">
      <Section
        title="Overview"
        action={
          <Link href="/review" className="text-sm font-semibold text-moss dark:text-mint">
            Review
          </Link>
        }
      >
        <div className="rounded-lg bg-ink p-5 text-white dark:bg-white dark:text-ink">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-white/64 dark:text-ink/62">Safe to spend today</p>
            <StatusPill tone="good">{metrics.daysLeftInMonth} days</StatusPill>
          </div>
          <p className="mt-3 text-4xl font-semibold tracking-normal">
            {currency.format(metrics.safeToSpendToday)}
          </p>
          <p className="mt-3 text-sm text-white/66 dark:text-ink/66">
            Flexible pool remaining is {currency.format(metrics.flexiblePoolRemaining)} after mocked ARQ/DolarApp spend.
          </p>
        </div>
      </Section>

      <Section title="Cards">
        <div className="grid grid-cols-2 gap-3">
          {cards.map(([label, value, detail, tone]) => (
            <MetricCard key={label} label={label} value={value} detail={detail} tone={tone} />
          ))}
        </div>
      </Section>

      <Link
        href="/review"
        className="flex items-center justify-between gap-4 rounded-lg border border-lemon/70 bg-lemon/22 p-4 dark:bg-lemon/10"
      >
        <span className="flex items-center gap-3">
          <AlertCircle className="size-5 text-amber-800 dark:text-lemon" aria-hidden="true" />
          <span>
            <span className="block font-semibold">Clarifications are waiting</span>
            <span className="block text-sm text-ink/58 dark:text-cloud/62">
              Answer them to clean up the spending totals.
            </span>
          </span>
        </span>
        <ArrowRight className="size-5 shrink-0" aria-hidden="true" />
      </Link>
    </AppShell>
  );
}
