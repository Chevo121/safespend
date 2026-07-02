import Link from "next/link";
import { ArrowRight, FileImage, ScanLine, UploadCloud } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Section, StatusPill } from "@/components/ui";

export default function UploadPage() {
  return (
    <AppShell title="Upload" activePath="/upload">
      <Section title="Screenshot">
        <div className="rounded-lg border-2 border-dashed border-moss/34 bg-white/70 p-6 text-center dark:border-mint/34 dark:bg-white/5">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-mint/50 text-moss dark:bg-mint/16 dark:text-mint">
            <UploadCloud className="size-7" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-2xl font-semibold">Pretend upload</h1>
          <p className="mt-2 text-sm leading-6 text-ink/62 dark:text-cloud/66">
            Drop in an ARQ or DolarApp screenshot later. For Phase 1, this button loads the fixed July 1 mock extract.
          </p>
          <Link
            href="/review"
            className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white dark:bg-mint dark:text-ink"
          >
            Create mocked transactions <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </Section>

      <Section title="Detected source">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-black/8 bg-white/72 p-4 dark:border-white/10 dark:bg-white/5">
            <FileImage className="size-5 text-moss dark:text-mint" aria-hidden="true" />
            <p className="mt-3 font-semibold">ARQ</p>
            <p className="mt-1 text-xs text-ink/54 dark:text-cloud/58">Current brand</p>
          </div>
          <div className="rounded-lg border border-black/8 bg-white/72 p-4 dark:border-white/10 dark:bg-white/5">
            <ScanLine className="size-5 text-moss dark:text-mint" aria-hidden="true" />
            <p className="mt-3 font-semibold">DolarApp</p>
            <p className="mt-1 text-xs text-ink/54 dark:text-cloud/58">Treated as ARQ</p>
          </div>
        </div>
      </Section>

      <div className="rounded-lg border border-mint/60 bg-mint/18 p-4 dark:bg-mint/10">
        <div className="flex items-center justify-between gap-3">
          <p className="font-semibold">Mock extraction ready</p>
          <StatusPill tone="good">11 rows</StatusPill>
        </div>
      </div>
    </AppShell>
  );
}
