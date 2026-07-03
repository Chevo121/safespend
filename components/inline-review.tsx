"use client";

import { useEffect, useState } from "react";
import { ArrowUp, ChevronDown, Copy, MessagesSquare } from "lucide-react";
import { clsx } from "clsx";
import { formatDate, preciseCurrency } from "@/lib/calculations";
import { getFlowStep, guessCategory } from "@/lib/flows";
import { useStore } from "@/lib/store";
import type { Transaction } from "@/lib/types";
import { Card, ChipButton } from "./ui";

const isPending = (tx: Transaction) =>
  tx.status === "needs_review" || tx.status === "duplicate_candidate";

export function InlineReview() {
  const { transactions, pendingCount, priorityId, updateTransaction, addRule } = useStore();
  const [open, setOpen] = useState(false);
  const [stepId, setStepId] = useState("start");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [remember, setRemember] = useState(false);
  const [draft, setDraft] = useState("");

  const pending = transactions.filter(isPending);
  const current =
    (priorityId ? pending.find((tx) => tx.id === priorityId) : null) ?? pending[0] ?? null;

  // Auto-open when sent here from "change answer" in Activity.
  useEffect(() => {
    if (priorityId) {
      setOpen(true);
    }
  }, [priorityId]);

  useEffect(() => {
    if (current && current.id !== activeId) {
      setActiveId(current.id);
      setStepId("start");
      setRemember(false);
      setDraft("");
    }
  }, [current, activeId]);

  if (pendingCount === 0 || !current) {
    return null;
  }

  const step = getFlowStep(current, stepId);
  const isDuplicate = current.status === "duplicate_candidate";

  function choose(tx: Transaction, optionIndex: number) {
    const activeStep = getFlowStep(tx, stepId);
    const option = activeStep.options[optionIndex];
    const patch = option.patch(tx);
    const answer = tx.clarificationAnswer
      ? `${tx.clarificationAnswer} · ${option.label}`
      : option.label;

    if (remember && activeStep.canRemember && option.ruleCategory) {
      addRule({ merchant: tx.merchant, category: option.ruleCategory, label: option.label });
    }

    if (option.next) {
      updateTransaction(tx.id, { ...patch, clarificationAnswer: answer });
      setStepId(option.next);
      return;
    }

    updateTransaction(tx.id, {
      ...patch,
      clarificationAnswer: answer,
      needsClarification: patch.status === "needs_review",
      status: patch.status ?? "approved"
    });
    setRemember(false);
  }

  function submitText(tx: Transaction) {
    const text = draft.trim();
    if (!text) {
      return;
    }

    const category = guessCategory(text);
    if (remember) {
      addRule({ merchant: tx.merchant, category, label: text });
    }

    updateTransaction(tx.id, {
      category,
      beneficiary: "me",
      countsTowardGirlfriend: false,
      girlfriendAmountMxn: 0,
      purchaseNote: text,
      clarificationAnswer: text,
      needsClarification: false,
      status: "approved"
    });
    setDraft("");
    setRemember(false);
  }

  function ignore(tx: Transaction) {
    updateTransaction(tx.id, { needsClarification: false, status: "ignored" });
  }

  return (
    <Card className="mb-4 overflow-hidden border-amber-500/30 bg-amber-500/[0.06] p-0 dark:bg-amber-500/[0.08]">
      <button
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400">
          <MessagesSquare className="size-5" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold">{pendingCount} to review</span>
          <span className="mt-0.5 block text-sm text-ink/55 dark:text-cloud/55">
            {open ? "Tap an answer below" : "Quick taps — they sharpen today's number"}
          </span>
        </span>
        <ChevronDown
          className={clsx(
            "size-5 shrink-0 text-ink/35 transition-transform dark:text-cloud/35",
            open && "rotate-180"
          )}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div className="border-t border-amber-500/20 bg-white/70 px-4 pb-4 pt-3 dark:bg-black/20">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 font-semibold">
                {current.merchant}
                {isDuplicate ? (
                  <Copy className="size-3.5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                ) : null}
              </p>
              <p className="tnum mt-0.5 text-xs text-ink/50 dark:text-cloud/50">
                {preciseCurrency.format(current.amountMxn)} · {formatDate(current.transactionDate)}
              </p>
            </div>
          </div>
          <p className="mt-2.5 text-[15px] font-medium leading-6">{step.question}</p>

          {/* Chips sit at the bottom for one-handed reach. */}
          <div className="mt-3 flex flex-wrap gap-2">
            {step.options.map((option, index) => (
              <ChipButton key={option.label} onClick={() => choose(current, index)}>
                {option.label}
              </ChipButton>
            ))}
            {stepId === "start" && !isDuplicate ? (
              <ChipButton subtle onClick={() => ignore(current)}>
                Ignore
              </ChipButton>
            ) : null}
          </div>

          {step.canRemember ? (
            <div className="mt-3 space-y-2.5">
              <button
                onClick={() => setRemember((value) => !value)}
                className={clsx(
                  "flex items-center gap-2 text-xs font-semibold transition",
                  remember
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-ink/45 dark:text-cloud/45"
                )}
              >
                <span
                  className={clsx(
                    "grid size-4 place-items-center rounded border transition",
                    remember
                      ? "border-emerald-600 bg-emerald-600 dark:border-emerald-400 dark:bg-emerald-400"
                      : "border-black/20 dark:border-white/25"
                  )}
                >
                  {remember ? <span className="text-[9px] text-white dark:text-ink">✓</span> : null}
                </span>
                Always use this answer for {current.merchant}
              </button>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  submitText(current);
                }}
                className="flex items-center gap-2"
              >
                <input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder='Or type it — e.g. "dog food"'
                  className="min-h-10 flex-1 rounded-full border border-black/10 bg-white px-4 text-sm outline-none transition placeholder:text-ink/35 focus:border-emerald-500/60 dark:border-white/15 dark:bg-white/[0.06] dark:placeholder:text-cloud/35"
                />
                <button
                  type="submit"
                  aria-label="Send answer"
                  disabled={!draft.trim()}
                  className="grid size-10 shrink-0 place-items-center rounded-full bg-ink text-white transition disabled:opacity-30 dark:bg-cloud dark:text-ink"
                >
                  <ArrowUp className="size-4" aria-hidden="true" />
                </button>
              </form>
            </div>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}
