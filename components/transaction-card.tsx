import { preciseCurrency, formatDate } from "@/lib/calculations";
import type { Transaction } from "@/lib/types";
import { StatusPill } from "./ui";

const statusTone = {
  approved: "good",
  needs_review: "warn",
  ignored: "neutral",
  duplicate_candidate: "hot"
} as const;

export function TransactionCard({ transaction }: { transaction: Transaction }) {
  return (
    <article className="rounded-lg border border-black/8 bg-white/76 p-4 dark:border-white/10 dark:bg-white/5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold">{transaction.merchant}</p>
          <p className="mt-1 text-xs text-ink/50 dark:text-cloud/52">
            {formatDate(transaction.transactionDate)} · {transaction.sourceAccount}
          </p>
        </div>
        <p className="shrink-0 text-right font-semibold">
          {preciseCurrency.format(transaction.amountMxn)}
        </p>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <StatusPill tone={statusTone[transaction.status]}>
          {transaction.status.replace("_", " ")}
        </StatusPill>
        <StatusPill>{transaction.category}</StatusPill>
        {transaction.countsTowardGirlfriend ? (
          <StatusPill tone="hot">Girlfriend</StatusPill>
        ) : null}
      </div>
      {transaction.clarificationQuestion ? (
        <p className="mt-3 text-sm text-ink/64 dark:text-cloud/68">
          {transaction.clarificationQuestion}
        </p>
      ) : null}
    </article>
  );
}
