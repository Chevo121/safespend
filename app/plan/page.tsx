"use client";

import { AppShell } from "@/components/app-shell";
import { PlanBills } from "@/components/plan-bills";
import { PlanBudget } from "@/components/plan-budget";
import { PlanDebts } from "@/components/plan-debts";
import { PlanGoals } from "@/components/plan-goals";
import { PlanInsights } from "@/components/plan-insights";

const sections = [
  { id: "budget", label: "Budget", node: <PlanBudget /> },
  { id: "bills", label: "Bills", node: <PlanBills /> },
  { id: "goals", label: "Goals", node: <PlanGoals /> },
  { id: "debts", label: "Debts", node: <PlanDebts /> },
  { id: "insights", label: "Insights", node: <PlanInsights /> }
];

export default function PlanPage() {
  return (
    <AppShell title="Plan" subtitle="Budget, bills, goals, debts, and insights">
      {/* Quick-jump chips to each anchored section */}
      <div className="-mx-1 mb-5 flex gap-2 overflow-x-auto px-1 pb-1">
        {sections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="min-h-9 shrink-0 rounded-full bg-black/[0.05] px-3.5 text-sm font-semibold leading-9 text-ink/70 transition hover:bg-black/10 dark:bg-white/[0.07] dark:text-cloud/70 dark:hover:bg-white/[0.12]"
          >
            {section.label}
          </a>
        ))}
      </div>

      <div className="space-y-2">
        {sections.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-28 pt-2">
            {section.node}
          </section>
        ))}
      </div>
    </AppShell>
  );
}
