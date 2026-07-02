"use client";

import { useMemo, useState } from "react";
import { Check, HelpCircle, X } from "lucide-react";
import { clarificationOptions, mockTransactions } from "@/lib/mock-data";
import { preciseCurrency } from "@/lib/calculations";
import type { Transaction } from "@/lib/types";
import { StatusPill } from "./ui";

export function ReviewWorkbench() {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);

  const pending = useMemo(
    () => transactions.filter((transaction) => transaction.status === "needs_review"),
    [transactions]
  );

  function answer(id: string, value: string) {
    setTransactions((current) =>
      current.map((transaction) => {
        if (transaction.id !== id) {
          return transaction;
        }

        const isSelfTransfer = transaction.merchant === "To Eusebio Gonzalez" && value === "Transfer to self";
        const girlfriend =
          transaction.merchant === "To Corina Arellano" ||
          value === "Girlfriend" ||
          value === "Date/food";

        return {
          ...transaction,
          clarificationAnswer: value,
          needsClarification: false,
          status: isSelfTransfer ? "ignored" : "approved",
          beneficiary: girlfriend ? "girlfriend" : transaction.beneficiary,
          countsTowardGirlfriend: girlfriend,
          girlfriendAmountMxn: girlfriend ? Math.abs(transaction.amountMxn) : 0
        };
      })
    );
  }

  function ignore(id: string) {
    setTransactions((current) =>
      current.map((transaction) =>
        transaction.id === id
          ? {
              ...transaction,
              needsClarification: false,
              status: "ignored"
            }
          : transaction
      )
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-mint/60 bg-mint/18 p-4 dark:bg-mint/10">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold">Pending clarification</p>
          <StatusPill tone={pending.length > 0 ? "warn" : "good"}>{pending.length} left</StatusPill>
        </div>
        <p className="mt-2 text-sm text-ink/62 dark:text-cloud/66">
          Answers stay local in Phase 1 and show how SafeSpend will clean up extracted screenshot data.
        </p>
      </div>

      {transactions.map((transaction) => {
        const options = clarificationOptions[transaction.merchant] ?? ["Approve", "Ignore", "Other"];

        return (
          <article
            key={transaction.id}
            className="rounded-lg border border-black/8 bg-white/76 p-4 dark:border-white/10 dark:bg-white/5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold">{transaction.merchant}</p>
                <p className="mt-1 text-xs text-ink/50 dark:text-cloud/52">
                  {transaction.rawDescription} · Confidence {Math.round(transaction.confidence * 100)}%
                </p>
              </div>
              <p className="shrink-0 text-right font-semibold">
                {preciseCurrency.format(transaction.amountMxn)}
              </p>
            </div>

            {transaction.status === "needs_review" ? (
              <>
                <div className="mt-4 flex gap-2 text-sm font-medium text-ink/72 dark:text-cloud/76">
                  <HelpCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <p>{transaction.clarificationQuestion}</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {options.map((option) => (
                    <button
                      key={option}
                      onClick={() => answer(transaction.id, option)}
                      className="min-h-10 rounded-full border border-black/10 px-3 text-sm font-semibold transition hover:border-moss hover:bg-mint/30 dark:border-white/12 dark:hover:border-mint dark:hover:bg-mint/10"
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => ignore(transaction.id)}
                  className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-sm font-semibold text-ink/56 transition hover:bg-black/5 dark:text-cloud/58 dark:hover:bg-white/10"
                >
                  <X className="size-4" aria-hidden="true" />
                  Ignore
                </button>
              </>
            ) : (
              <div className="mt-4 flex items-center justify-between gap-3">
                <StatusPill tone={transaction.status === "approved" ? "good" : "neutral"}>
                  {transaction.status.replace("_", " ")}
                </StatusPill>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-moss dark:text-mint">
                  <Check className="size-4" aria-hidden="true" />
                  {transaction.clarificationAnswer || "Resolved"}
                </span>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
