import Link from "next/link";
import { BarChart3, Home, ReceiptText, Sparkles, Upload, WalletCards } from "lucide-react";
import { clsx } from "clsx";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/upload", label: "Upload", icon: Upload },
  { href: "/review", label: "Review", icon: ReceiptText },
  { href: "/transactions", label: "Activity", icon: BarChart3 },
  { href: "/budget", label: "Budget", icon: WalletCards },
  { href: "/insights", label: "Insights", icon: Sparkles }
];

type AppShellProps = {
  children: React.ReactNode;
  title?: string;
  eyebrow?: string;
  activePath?: string;
};

export function AppShell({ children, title, eyebrow, activePath }: AppShellProps) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-white/72 shadow-soft backdrop-blur dark:bg-ink/76 sm:my-6 sm:min-h-[calc(100vh-3rem)] sm:overflow-hidden sm:rounded-[28px]">
      <header className="sticky top-0 z-20 border-b border-black/5 bg-white/86 px-5 pb-4 pt-5 backdrop-blur dark:border-white/10 dark:bg-ink/88">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-2xl bg-ink text-sm font-black text-mint dark:bg-mint dark:text-ink">
            SS
          </span>
          <span>
            <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-moss dark:text-mint">
              {eyebrow ?? "SafeSpend"}
            </span>
            <span className="block text-xl font-semibold tracking-normal">{title ?? "Money cockpit"}</span>
          </span>
        </Link>
      </header>

      <main className="flex-1 px-5 py-5">{children}</main>

      <nav className="sticky bottom-0 z-30 grid grid-cols-6 gap-1 border-t border-black/5 bg-white/90 px-3 pb-4 pt-2 backdrop-blur dark:border-white/10 dark:bg-ink/92">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activePath === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className={clsx(
                "group flex h-12 flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-medium transition",
                active
                  ? "bg-mint text-ink"
                  : "text-ink/56 hover:bg-black/5 hover:text-ink dark:text-cloud/62 dark:hover:bg-white/10 dark:hover:text-cloud"
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
