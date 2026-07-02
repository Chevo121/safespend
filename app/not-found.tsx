import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-moss dark:text-mint">
        SafeSpend
      </p>
      <h1 className="mt-4 text-3xl font-semibold">This screen is not in Phase 1.</h1>
      <Link
        href="/dashboard"
        className="mt-8 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white dark:bg-mint dark:text-ink"
      >
        Go to dashboard
      </Link>
    </main>
  );
}
