"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { clsx } from "clsx";
import { AppShell } from "@/components/app-shell";
import { PlanBills } from "@/components/plan-bills";
import { PlanBudget } from "@/components/plan-budget";
import { PlanDebts } from "@/components/plan-debts";
import { PlanGoals } from "@/components/plan-goals";

const tabs = [
  { key: "budget", label: "Budget" },
  { key: "bills", label: "Bills" },
  { key: "goals", label: "Goals" },
  { key: "debts", label: "Debts" }
] as const;

type TabKey = (typeof tabs)[number]["key"];

const isTab = (value: string | null): value is TabKey =>
  tabs.some((tab) => tab.key === value);

function PlanContent() {
  const searchParams = useSearchParams();
  const requested = searchParams.get("tab");
  const [tab, setTab] = useState<TabKey>(isTab(requested) ? requested : "budget");

  useEffect(() => {
    if (isTab(requested)) {
      setTab(requested);
    }
  }, [requested]);

  return (
    <>
      <div className="mb-5 grid grid-cols-4 gap-1 rounded-full bg-black/[0.05] p-1 dark:bg-white/[0.07]">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={clsx(
              "min-h-9 rounded-full text-sm font-semibold transition",
              tab === key
                ? "bg-white text-ink shadow-card dark:bg-white/[0.14] dark:text-cloud dark:shadow-none"
                : "text-ink/50 dark:text-cloud/50"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "budget" ? <PlanBudget /> : null}
      {tab === "bills" ? <PlanBills /> : null}
      {tab === "goals" ? <PlanGoals /> : null}
      {tab === "debts" ? <PlanDebts /> : null}
    </>
  );
}

export default function PlanPage() {
  return (
    <AppShell title="Plan" subtitle="Budget, bills, goals, and debts in one place">
      <Suspense fallback={null}>
        <PlanContent />
      </Suspense>
    </AppShell>
  );
}
