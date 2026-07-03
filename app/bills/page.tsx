"use client";

import { AppShell } from "@/components/app-shell";
import { PlanBills } from "@/components/plan-bills";

export default function BillsPage() {
  return (
    <AppShell title="Bills & Calendar" subtitle="Scheduled payments this month" backHref="/plan" backLabel="Plan">
      <PlanBills />
    </AppShell>
  );
}
