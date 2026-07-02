import { clsx } from "clsx";

export type Tone = "neutral" | "safe" | "tight" | "over" | "info" | "love";

export const toneText: Record<Tone, string> = {
  neutral: "text-ink/70 dark:text-cloud/70",
  safe: "text-emerald-700 dark:text-emerald-400",
  tight: "text-amber-700 dark:text-amber-400",
  over: "text-rose-700 dark:text-rose-400",
  info: "text-sky-700 dark:text-sky-400",
  love: "text-violet-700 dark:text-violet-400"
};

export const toneFill: Record<Tone, string> = {
  neutral: "bg-ink/40 dark:bg-cloud/40",
  safe: "bg-emerald-500",
  tight: "bg-amber-500",
  over: "bg-rose-500",
  info: "bg-sky-500",
  love: "bg-violet-500"
};

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
    <section className="mb-7">
      <div className="mb-3 flex items-baseline justify-between gap-3 px-1">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-ink/45 dark:text-cloud/45">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Card({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <article
      className={clsx(
        "rounded-2xl border border-black/[0.06] bg-white p-4 shadow-card dark:border-white/[0.08] dark:bg-white/[0.06] dark:shadow-none",
        className
      )}
    >
      {children}
    </article>
  );
}

export function StatusPill({
  children,
  tone = "neutral"
}: {
  children: React.ReactNode;
  tone?: Tone;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold",
        tone === "neutral" && "bg-black/[0.06] text-ink/65 dark:bg-white/10 dark:text-cloud/70",
        tone === "safe" && "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
        tone === "tight" && "bg-amber-500/15 text-amber-700 dark:text-amber-400",
        tone === "over" && "bg-rose-500/15 text-rose-700 dark:text-rose-400",
        tone === "info" && "bg-sky-500/15 text-sky-700 dark:text-sky-400",
        tone === "love" && "bg-violet-500/15 text-violet-700 dark:text-violet-400"
      )}
    >
      {children}
    </span>
  );
}

export function ProgressBar({
  percent,
  tone = "safe",
  className
}: {
  percent: number;
  tone?: Tone;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "h-1.5 overflow-hidden rounded-full bg-black/[0.07] dark:bg-white/10",
        className
      )}
    >
      <div
        className={clsx("h-full rounded-full transition-all duration-500", toneFill[tone])}
        style={{ width: `${Math.min(Math.max(percent, 0) * 100, 100)}%` }}
      />
    </div>
  );
}

export function ChipButton({
  children,
  onClick,
  subtle
}: {
  children: React.ReactNode;
  onClick: () => void;
  subtle?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "min-h-10 rounded-full px-4 text-sm font-semibold transition active:scale-95",
        subtle
          ? "text-ink/55 hover:bg-black/5 dark:text-cloud/55 dark:hover:bg-white/10"
          : "border border-black/10 bg-white text-ink hover:border-emerald-500/60 hover:bg-emerald-500/10 dark:border-white/15 dark:bg-white/[0.06] dark:text-cloud dark:hover:border-emerald-400/60 dark:hover:bg-emerald-400/10"
      )}
    >
      {children}
    </button>
  );
}
