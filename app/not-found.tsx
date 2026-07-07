import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
      <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-emerald-700 dark:text-emerald-400">
        SafeSpend
      </p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">This screen is not in Phase 1.</h1>
      <Link
        href="/"
        className="mt-8 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white dark:bg-cloud dark:text-ink"
      >
        Go to dashboard
      </Link>
    </main>
  );
}
