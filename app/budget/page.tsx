import { Percent, PiggyBank, WalletCards, type LucideIcon } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { MetricCard, Section } from "@/components/ui";
import { currency } from "@/lib/calculations";
import { defaultBudget } from "@/lib/mock-data";

export default function BudgetPage() {
  const rules: Array<{
    icon: LucideIcon;
    title: string;
    body: string;
  }> = [
    {
      icon: WalletCards,
      title: "Spend cap",
      body: "Flexible spending starts from 48,500 MXN each month."
    },
    {
      icon: PiggyBank,
      title: "Savings first",
      body: "16,500 MXN is reserved before discretionary spend."
    },
    {
      icon: Percent,
      title: "Commission rule",
      body: "70% of commission income gets moved to savings."
    }
  ];

  return (
    <AppShell title="Budget" activePath="/budget">
      <Section title="Default budget">
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            label="Fixed monthly income"
            value={currency.format(defaultBudget.fixedMonthlyIncome)}
            detail="MXN"
          />
          <MetricCard
            label="Required savings"
            value={currency.format(defaultBudget.requiredSavings)}
            detail="Saved before spending"
            tone="good"
          />
          <MetricCard
            label="Monthly spend cap"
            value={currency.format(defaultBudget.monthlySpendCap)}
            detail="Income minus savings"
          />
          <MetricCard
            label="Commission savings"
            value={`${Math.round(defaultBudget.commissionSavingsRate * 100)}%`}
            detail="Saved from commissions"
            tone="good"
          />
        </div>
      </Section>

      <Section title="Rules">
        <div className="space-y-3">
          {rules.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="flex gap-3 rounded-lg border border-black/8 bg-white/72 p-4 dark:border-white/10 dark:bg-white/5"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-mint/40 text-moss dark:bg-mint/14 dark:text-mint">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block font-semibold">{title}</span>
                <span className="mt-1 block text-sm text-ink/60 dark:text-cloud/64">{body}</span>
              </span>
            </div>
          ))}
        </div>
      </Section>
    </AppShell>
  );
}
