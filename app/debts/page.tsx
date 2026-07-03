"use client";

import { AppShell } from "@/components/app-shell";
import { PlanDebts } from "@/components/plan-debts";

export default function DebtsPage() {
  return (
    <AppShell title="Debts" subtitle="Balances and payoff estimates" backHref="/plan" backLabel="Plan">
      <PlanDebts />
    </AppShell>
  );
}
