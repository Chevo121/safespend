import { clsx } from "clsx";

export function Section({
  title,
  action,
  children
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink/54 dark:text-cloud/58">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function MetricCard({
  label,
  value,
  tone = "neutral",
  detail
}: {
  label: string;
  value: string;
  tone?: "neutral" | "good" | "warn" | "hot";
  detail?: string;
}) {
  return (
    <article
      className={clsx(
        "rounded-lg border p-4",
        tone === "neutral" && "border-black/8 bg-white/72 dark:border-white/10 dark:bg-white/5",
        tone === "good" && "border-mint/70 bg-mint/24 dark:bg-mint/12",
        tone === "warn" && "border-lemon/80 bg-lemon/24 dark:bg-lemon/10",
        tone === "hot" && "border-coral/70 bg-coral/18 dark:bg-coral/12"
      )}
    >
      <p className="text-xs font-medium text-ink/58 dark:text-cloud/60">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-normal">{value}</p>
      {detail ? <p className="mt-1 text-xs text-ink/50 dark:text-cloud/52">{detail}</p> : null}
    </article>
  );
}

export function StatusPill({
  children,
  tone = "neutral"
}: {
  children: React.ReactNode;
  tone?: "neutral" | "good" | "warn" | "hot";
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        tone === "neutral" && "bg-black/6 text-ink/70 dark:bg-white/10 dark:text-cloud/72",
        tone === "good" && "bg-mint/40 text-moss dark:bg-mint/18 dark:text-mint",
        tone === "warn" && "bg-lemon/38 text-amber-900 dark:bg-lemon/16 dark:text-lemon",
        tone === "hot" && "bg-coral/28 text-red-900 dark:bg-coral/18 dark:text-coral"
      )}
    >
      {children}
    </span>
  );
}

export function PrimaryLink({
  href,
  children
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-5 text-sm font-semibold text-white transition hover:opacity-90 dark:bg-mint dark:text-ink"
    >
      {children}
    </a>
  );
}
