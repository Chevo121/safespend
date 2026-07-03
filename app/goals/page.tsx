"use client";

import { AppShell } from "@/components/app-shell";
import { PlanGoals } from "@/components/plan-goals";

export default function GoalsPage() {
  return (
    <AppShell title="Goals" subtitle="What you're saving toward" backHref="/plan" backLabel="Plan">
      <PlanGoals />
    </AppShell>
  );
}
