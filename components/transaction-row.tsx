"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftRight,
  Banknote,
  Car,
  ChevronDown,
  Copy,
  Heart,
  HelpCircle,
  MessageCircle,
  MonitorSmartphone,
  ShoppingBag,
  UtensilsCrossed,
  type LucideIcon
} from "lucide-react";
import { clsx } from "clsx";
import { formatDate, preciseCurrency } from "@/lib/calculations";
import { useStore } from "@/lib/store";
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

export function TransactionRow({
  transaction,
  interactive = false
}: {
  transaction: Transaction;
  interactive?: boolean;
}) {
  const { icon: Icon, className } = categoryIcon(transaction);
  const { reopenTransaction, toggleGirlfriend } = useStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const excluded = transaction.status === "ignored";
  const isDuplicate = transaction.status === "duplicate_candidate";

  const row = (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className={clsx("grid size-10 shrink-0 place-items-center rounded-full", className)}>
        <Icon className="size-[18px]" aria-hidden="true" />
      </span>

      <div className="min-w-0 flex-1 text-left">
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
        ) : isDuplicate ? (
          <StatusPill tone="over">Duplicate?</StatusPill>
        ) : excluded ? (
          <span className="text-xs text-ink/35 dark:text-cloud/35">
            {transaction.purchaseNote === "Duplicate" ? "Duplicate" : "Excluded"}
          </span>
        ) : null}
      </div>

      {interactive ? (
        <ChevronDown
          className={clsx(
            "size-4 shrink-0 text-ink/25 transition-transform dark:text-cloud/25",
            open && "rotate-180"
          )}
          aria-hidden="true"
        />
      ) : null}
    </div>
  );

  if (!interactive) {
    return row;
  }

  return (
    <div>
      <button onClick={() => setOpen((value) => !value)} className="w-full">
        {row}
      </button>

      {open ? (
        <div className="border-t border-dashed border-black/[0.06] bg-black/[0.015] px-4 py-3 dark:border-white/[0.08] dark:bg-white/[0.02]">
          {transaction.clarificationAnswer || transaction.purchaseNote ? (
            <p className="mb-2.5 text-xs text-ink/50 dark:text-cloud/50">
              {transaction.clarificationAnswer && (
                <>
                  Answer: <span className="font-semibold">{transaction.clarificationAnswer}</span>
                </>
              )}
              {transaction.purchaseNote &&
              transaction.purchaseNote !== transaction.clarificationAnswer ? (
                <> · {transaction.purchaseNote}</>
              ) : null}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                reopenTransaction(transaction.id);
                router.push("/review");
              }}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-black/10 px-3.5 text-xs font-semibold transition hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
            >
              <MessageCircle className="size-3.5" aria-hidden="true" />
              {isDuplicate || transaction.status === "needs_review"
                ? "Answer in Review"
                : "Change answer"}
            </button>
            <button
              onClick={() => toggleGirlfriend(transaction.id)}
              className={clsx(
                "inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3.5 text-xs font-semibold transition",
                transaction.countsTowardGirlfriend
                  ? "border-violet-500/40 bg-violet-500/10 text-violet-700 dark:text-violet-300"
                  : "border-black/10 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
              )}
            >
              <Heart
                className={clsx(
                  "size-3.5",
                  transaction.countsTowardGirlfriend && "fill-violet-500 text-violet-500"
                )}
                aria-hidden="true"
              />
              {transaction.countsTowardGirlfriend ? "Girlfriend spend · on" : "Girlfriend spend"}
            </button>
            {isDuplicate ? (
              <span className="inline-flex min-h-9 items-center gap-1.5 text-xs text-ink/45 dark:text-cloud/45">
                <Copy className="size-3.5" aria-hidden="true" />
                Not counted until confirmed
              </span>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
