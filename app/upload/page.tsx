"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, ImagePlus, Loader2, ScanLine } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui";
import { mockTransactions } from "@/lib/mock-data";
import { useStore } from "@/lib/store";

const steps = [
  "Reading screenshot…",
  "Detecting ARQ transaction layout…",
  "Extracting merchants and amounts…",
  "Flagging ambiguous transactions…"
];

export default function UploadPage() {
  const { resetDemo, pendingCount } = useStore();
  const [phase, setPhase] = useState<"idle" | "scanning" | "done">("idle");
  const [stepIndex, setStepIndex] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const pendingTimers = timers.current;
    return () => pendingTimers.forEach(clearTimeout);
  }, []);

  function startUpload() {
    if (phase === "scanning") {
      return;
    }

    resetDemo();
    setPhase("scanning");
    setStepIndex(0);

    steps.forEach((_, index) => {
      timers.current.push(setTimeout(() => setStepIndex(index), index * 550));
    });
    timers.current.push(setTimeout(() => setPhase("done"), steps.length * 550 + 300));
  }

  const needsReview = mockTransactions.filter((tx) => tx.status === "needs_review").length;

  return (
    <AppShell title="Upload" subtitle="Turn an ARQ screenshot into reviewed spending">
      {phase === "idle" ? (
        <>
          <button
            onClick={startUpload}
            className="grid w-full place-items-center gap-3 rounded-3xl border-2 border-dashed border-black/15 bg-white/60 px-6 py-14 text-center transition hover:border-emerald-500/50 hover:bg-emerald-500/[0.04] active:scale-[0.99] dark:border-white/15 dark:bg-white/[0.03] dark:hover:border-emerald-400/50"
          >
            <span className="grid size-14 place-items-center rounded-2xl bg-emerald-500/12 text-emerald-600 dark:text-emerald-400">
              <ImagePlus className="size-7" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-lg font-semibold">Add a screenshot</span>
              <span className="mt-1 block text-sm text-ink/50 dark:text-cloud/50">
                ARQ / DolarApp activity screenshots work best
              </span>
            </span>
            <span className="mt-1 inline-flex min-h-10 items-center rounded-full bg-ink px-5 text-sm font-semibold text-white dark:bg-cloud dark:text-ink">
              Choose screenshot
            </span>
          </button>
          <p className="mt-4 px-1 text-center text-xs leading-5 text-ink/40 dark:text-cloud/40">
            Phase 1 simulates extraction with sample data — nothing is uploaded anywhere.
          </p>
          {pendingCount > 0 ? (
            <Link href="/review" className="mt-4 block">
              <Card className="flex items-center justify-between gap-3 transition active:scale-[0.99]">
                <span className="text-sm font-semibold">
                  {pendingCount} earlier transactions still need answers
                </span>
                <ArrowRight className="size-4 shrink-0 text-ink/35 dark:text-cloud/35" aria-hidden="true" />
              </Card>
            </Link>
          ) : null}
        </>
      ) : null}

      {phase === "scanning" ? (
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-emerald-500/12 text-emerald-600 dark:text-emerald-400">
              <ScanLine className="size-6" aria-hidden="true" />
            </span>
            <div>
              <p className="font-semibold">Extracting transactions</p>
              <p className="text-xs text-ink/45 dark:text-cloud/45">ARQ · 01 Jul 2026</p>
            </div>
          </div>
          <ul className="mt-5 space-y-3">
            {steps.map((step, index) => (
              <li key={step} className="flex items-center gap-2.5 text-sm">
                {index < stepIndex ? (
                  <Check className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                ) : index === stepIndex ? (
                  <Loader2 className="size-4 shrink-0 animate-spin text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                ) : (
                  <span className="size-4 shrink-0 rounded-full border border-black/15 dark:border-white/20" />
                )}
                <span
                  className={
                    index <= stepIndex
                      ? "text-ink dark:text-cloud"
                      : "text-ink/35 dark:text-cloud/35"
                  }
                >
                  {step}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {phase === "done" ? (
        <div className="space-y-4">
          <Card className="border-emerald-500/25 bg-emerald-500/[0.07] p-6 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <Check className="size-6" aria-hidden="true" />
            </span>
            <p className="mt-3 text-lg font-bold">
              Found {mockTransactions.length} transactions
            </p>
            <p className="mt-1 text-sm text-ink/55 dark:text-cloud/55">
              {needsReview} are ambiguous and need a quick answer before they update your
              totals.
            </p>
          </Card>
          <Link
            href="/review"
            className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-ink text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.99] dark:bg-cloud dark:text-ink"
          >
            Review {needsReview} transactions
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <Link
            href="/"
            className="block text-center text-sm font-semibold text-ink/50 dark:text-cloud/50"
          >
            Skip to dashboard
          </Link>
        </div>
      ) : null}
    </AppShell>
  );
}
