import Link from "next/link";
import { ArrowRight, ShieldCheck, UploadCloud } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PrimaryLink, Section, StatusPill } from "@/components/ui";
import { getDashboardMetrics, currency } from "@/lib/calculations";

export default function Home() {
  const metrics = getDashboardMetrics();

  return (
    <AppShell title="SafeSpend" activePath="/">
      <section className="pb-4">
        <div className="overflow-hidden rounded-lg bg-ink p-5 text-white dark:bg-white dark:text-ink">
          <div className="flex items-center justify-between gap-4">
            <span className="grid size-12 place-items-center rounded-2xl bg-mint text-ink">
              <ShieldCheck className="size-6" aria-hidden="true" />
            </span>
            <StatusPill tone="good">ARQ + DolarApp</StatusPill>
          </div>
          <h1 className="mt-6 text-4xl font-semibold tracking-normal">SafeSpend</h1>
          <p className="mt-3 text-sm leading-6 text-white/72 dark:text-ink/70">
            Turn wallet screenshots into reviewed spending, girlfriend tracking, and a daily safe-to-spend number.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <PrimaryLink href="/upload">
              <span className="inline-flex items-center gap-2">
                Start screenshot flow <ArrowRight className="size-4" aria-hidden="true" />
              </span>
            </PrimaryLink>
            <Link
              href="/dashboard"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/16 px-5 text-sm font-semibold dark:border-ink/12"
            >
              View dashboard
            </Link>
          </div>
        </div>
      </section>

      <Section title="Today">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-black/8 bg-white/74 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-xs text-ink/54 dark:text-cloud/58">Safe today</p>
            <p className="mt-2 text-2xl font-semibold">{currency.format(metrics.safeToSpendToday)}</p>
          </div>
          <div className="rounded-lg border border-black/8 bg-white/74 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-xs text-ink/54 dark:text-cloud/58">Needs review</p>
            <p className="mt-2 text-2xl font-semibold">{metrics.pendingClarifications}</p>
          </div>
        </div>
      </Section>

      <Section title="Phase 1 flow">
        <div className="space-y-3">
          {["Upload a screenshot", "Extract mocked transactions", "Clarify ambiguous spending", "Update dashboard metrics"].map(
            (item, index) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-lg border border-black/8 bg-white/70 p-3 dark:border-white/10 dark:bg-white/5"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-mint font-semibold text-ink">
                  {index + 1}
                </span>
                <span className="font-medium">{item}</span>
              </div>
            )
          )}
        </div>
      </Section>

      <div className="rounded-lg border border-dashed border-moss/40 p-4 dark:border-mint/40">
        <UploadCloud className="size-5 text-moss dark:text-mint" aria-hidden="true" />
        <p className="mt-2 text-sm text-ink/62 dark:text-cloud/66">
          Phase 1 uses local mock data only. No Supabase, no OCR service, and no AI API calls are connected.
        </p>
      </div>
    </AppShell>
  );
}
