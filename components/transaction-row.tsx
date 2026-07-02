import {
  ArrowLeftRight,
  Banknote,
  Car,
  Heart,
  HelpCircle,
  MonitorSmartphone,
  ShoppingBag,
  UtensilsCrossed,
  type LucideIcon
} from "lucide-react";
import { clsx } from "clsx";
import { formatDate, preciseCurrency } from "@/lib/calculations";
import type { Transaction } from "@/lib/types";
import { StatusPill } from "./ui";

function categoryIcon(tx: Transaction): { icon: LucideIcon; className: string } {
  if (tx.countsTowardGirlfriend || tx.category === "Girlfriend") {
    return { icon: Heart, className: "bg-violet-500/12 text-violet-600 dark:text-violet-400" };
  }

  switch (tx.category) {
    case "Transport":
      return { icon: Car, className: "bg-sky-500/12 text-sky-600 dark:text-sky-400" };
    case "Food delivery":
    case "Food & drinks":
      return {
        icon: UtensilsCrossed,
        className: "bg-orange-500/12 text-orange-600 dark:text-orange-400"
      };
    case "Subscriptions":
    case "Digital services":
    case "Devices":
      return {
        icon: MonitorSmartphone,
        className: "bg-indigo-500/12 text-indigo-600 dark:text-indigo-400"
      };
    case "Transfer to self":
    case "Transfers":
      return {
        icon: ArrowLeftRight,
        className: "bg-black/[0.06] text-ink/50 dark:bg-white/10 dark:text-cloud/50"
      };
    case "Debt payment":
      return { icon: Banknote, className: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400" };
    case "Uncategorized":
      return {
        icon: HelpCircle,
        className: "bg-black/[0.06] text-ink/50 dark:bg-white/10 dark:text-cloud/50"
      };
    default:
      return { icon: ShoppingBag, className: "bg-teal-500/12 text-teal-600 dark:text-teal-400" };
  }
}

export function TransactionRow({ transaction }: { transaction: Transaction }) {
  const { icon: Icon, className } = categoryIcon(transaction);
  const excluded = transaction.status === "ignored";

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className={clsx("grid size-10 shrink-0 place-items-center rounded-full", className)}>
        <Icon className="size-[18px]" aria-hidden="true" />
      </span>

      <div className="min-w-0 flex-1">
        <p className={clsx("truncate font-semibold", excluded && "text-ink/40 dark:text-cloud/40")}>
          {transaction.merchant}
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-ink/45 dark:text-cloud/45">
          {formatDate(transaction.transactionDate)} · {transaction.category}
          {transaction.countsTowardGirlfriend ? (
            <Heart
              className="size-3 shrink-0 fill-violet-500 text-violet-500"
              aria-label="Counts toward girlfriend spend"
            />
          ) : null}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p
          className={clsx(
            "tnum font-semibold",
            excluded && "text-ink/35 line-through dark:text-cloud/35"
          )}
        >
          {preciseCurrency.format(transaction.amountMxn)}
        </p>
        {transaction.status === "needs_review" ? (
          <StatusPill tone="tight">Review</StatusPill>
        ) : excluded ? (
          <span className="text-xs text-ink/35 dark:text-cloud/35">Excluded</span>
        ) : null}
      </div>
    </div>
  );
}
