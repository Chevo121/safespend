import { AlertTriangle, Heart, ReceiptText, Route } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Section, StatusPill } from "@/components/ui";
import { currency, getDashboardMetrics } from "@/lib/calculations";

export default function InsightsPage() {
  const metrics = getDashboardMetrics();
  const insights = [
    {
      icon: AlertTriangle,
      title: "Largest uncertainty",
      body: "Transfers to self are excluded from spend for now, but they stay in review until confirmed.",
      tone: "warn" as const
    },
    {
      icon: Route,
      title: "Uber cluster",
      body: "Four Uber rides need beneficiary answers before SafeSpend can split personal vs girlfriend spend.",
      tone: "neutral" as const
    },
    {
      icon: Heart,
      title: "Girlfriend spend",
      body: `${currency.format(metrics.girlfriendSpend)} is currently attributed to Corina from mocked transfer data.`,
      tone: "hot" as const
    },
    {
      icon: ReceiptText,
      title: "Debt visibility",
      body: "Didi Préstamos is categorized as debt payment and flagged because it is over 1,000 MXN.",
      tone: "good" as const
    }
  ];

  return (
    <AppShell title="Insights" activePath="/insights">
      <Section title="Mock insights">
        <div className="space-y-3">
          {insights.map((insight) => {
            const Icon = insight.icon;

            return (
              <article
                key={insight.title}
                className="rounded-lg border border-black/8 bg-white/74 p-4 dark:border-white/10 dark:bg-white/5"
              >
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-mint/34 text-moss dark:bg-mint/14 dark:text-mint">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold">{insight.title}</h2>
                      <StatusPill tone={insight.tone}>{insight.tone}</StatusPill>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-ink/62 dark:text-cloud/66">
                      {insight.body}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </Section>
    </AppShell>
  );
}
