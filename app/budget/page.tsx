"use client";

import { AppShell } from "@/components/app-shell";
import { PlanBudget } from "@/components/plan-budget";

export default function BudgetPage() {
  return (
    <AppShell title="Budget" subtitle="How the flexible pool works this month" backHref="/plan" backLabel="Plan">
      <PlanBudget />
    </AppShell>
  );
}
