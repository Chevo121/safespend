"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUp, Check, Copy, Sparkles } from "lucide-react";
import { clsx } from "clsx";
import { formatDate, preciseCurrency } from "@/lib/calculations";
import { getFlowStep, guessCategory } from "@/lib/flows";
import { useStore } from "@/lib/store";
import type { Transaction } from "@/lib/types";
import { ChipButton, StatusPill } from "./ui";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  body: string;
};

const isPending = (tx: Transaction) =>
  tx.status === "needs_review" || tx.status === "duplicate_candidate";

export function ReviewChat() {
  const { transactions, pendingCount, priorityId, updateTransaction, addRule } = useStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "intro",
      role: "assistant",
      body: "Let's clean up this screenshot. I'll ask about anything ambiguous — tap an answer, or type one when tapping doesn't fit."
    }
  ]);
  const [stepId, setStepId] = useState("start");
  const [activeTxId, setActiveTxId] = useState<string | null>(null);
  const [remember, setRemember] = useState(false);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const pending = transactions.filter(isPending);
  const current =
    (priorityId ? pending.find((tx) => tx.id === priorityId) : null) ?? pending[0] ?? null;

  useEffect(() => {
    if (current && current.id !== activeTxId) {
      setActiveTxId(current.id);
      setStepId("start");
      setRemember(false);
      setDraft("");
    }
  }, [current, activeTxId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, current?.id, stepId]);

  function append(...next: ChatMessage[]) {
    setMessages((existing) => [...existing, ...next]);
  }

  function choose(tx: Transaction, optionIndex: number) {
    const step = getFlowStep(tx, stepId);
    const option = step.options[optionIndex];
    const patch = option.patch(tx);
    const answer = tx.clarificationAnswer
      ? `${tx.clarificationAnswer} · ${option.label}`
      : option.label;

    if (remember && step.canRemember && option.ruleCategory) {
      addRule({ merchant: tx.merchant, category: option.ruleCategory, label: option.label });
    }

    if (option.next) {
      updateTransaction(tx.id, { ...patch, clarificationAnswer: answer });
      setStepId(option.next);
    } else {
      updateTransaction(tx.id, {
        ...patch,
        clarificationAnswer: answer,
        needsClarification: patch.status === "needs_review",
        status: patch.status ?? "approved"
      });
    }

    setRemember(false);
    append(
      { id: `${tx.id}-${stepId}-user-${Date.now()}`, role: "user", body: option.label },
      { id: `${tx.id}-${stepId}-reply-${Date.now()}`, role: "assistant", body: option.reply }
    );
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
    append(
      { id: `${tx.id}-text-user-${Date.now()}`, role: "user", body: text },
      {
        id: `${tx.id}-text-reply-${Date.now()}`,
        role: "assistant",
        body: `Filed under ${category}.`
      }
    );
  }

  function ignoreCurrent(tx: Transaction) {
    updateTransaction(tx.id, { needsClarification: false, status: "ignored" });
    append(
      { id: `${tx.id}-ignore-user`, role: "user", body: "Ignore this one" },
      {
        id: `${tx.id}-ignore-reply`,
        role: "assistant",
        body: "Ignored — it won't affect your totals."
      }
    );
  }

  const step = current ? getFlowStep(current, stepId) : null;
  const isDuplicate = current?.status === "duplicate_candidate";

  return (
    <div className="flex flex-col gap-3 pb-4">
      {messages.map((message) => (
        <ChatBubble key={message.id} message={message} />
      ))}

      {current && step ? (
        <div className="mt-1">
          <div className="flex items-end gap-2">
            <AssistantAvatar />
            <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-black/[0.06] bg-white p-4 shadow-card dark:border-white/[0.08] dark:bg-white/[0.06] dark:shadow-none">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="flex items-center gap-1.5 font-semibold">
                    {current.merchant}
                    {isDuplicate ? (
                      <Copy className="size-3.5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                    ) : null}
                  </p>
                  <p className="tnum mt-0.5 text-xs text-ink/50 dark:text-cloud/50">
                    {preciseCurrency.format(current.amountMxn)} ·{" "}
                    {formatDate(current.transactionDate)} · {current.sourceAccount}
                  </p>
                </div>
                <StatusPill tone="tight">{pendingCount} left</StatusPill>
              </div>
              <p className="mt-3 text-[15px] font-medium leading-6">{step.question}</p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 pl-10">
            {step.options.map((option, index) => (
              <ChipButton key={option.label} onClick={() => choose(current, index)}>
                {option.label}
              </ChipButton>
            ))}
            {stepId === "start" && !isDuplicate ? (
              <ChipButton subtle onClick={() => ignoreCurrent(current)}>
                Ignore
              </ChipButton>
            ) : null}
          </div>

          {step.canRemember ? (
            <div className="mt-3 space-y-2.5 pl-10">
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
                      ? "border-emerald-600 bg-emerald-600 text-white dark:border-emerald-400 dark:bg-emerald-400 dark:text-ink"
                      : "border-black/20 dark:border-white/25"
                  )}
                >
                  {remember ? <Check className="size-3" aria-hidden="true" /> : null}
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
      ) : (
        <div className="mt-1 space-y-3">
          <div className="flex items-end gap-2">
            <AssistantAvatar />
            <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-emerald-500/25 bg-emerald-500/10 p-4">
              <p className="flex items-center gap-2 font-semibold text-emerald-800 dark:text-emerald-300">
                <Check className="size-4" aria-hidden="true" />
                All caught up
              </p>
              <p className="mt-1.5 text-sm leading-6 text-ink/60 dark:text-cloud/60">
                Every transaction is clarified. Your safe-to-spend and girlfriend totals are up
                to date.
              </p>
            </div>
          </div>
          <div className="flex gap-2 pl-10">
            <Link
              href="/"
              className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-ink px-4 text-sm font-semibold text-white transition hover:opacity-90 dark:bg-cloud dark:text-ink"
            >
              View dashboard
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href="/transactions"
              className="inline-flex min-h-10 items-center rounded-full border border-black/10 px-4 text-sm font-semibold transition hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
            >
              See activity
            </Link>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}

function AssistantAvatar() {
  return (
    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ink text-emerald-400 dark:bg-cloud dark:text-emerald-700">
      <Sparkles className="size-4" aria-hidden="true" />
    </span>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const mine = message.role === "user";

  return (
    <div className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}>
      {!mine ? <AssistantAvatar /> : null}
      <p
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-6 ${
          mine
            ? "rounded-br-md bg-emerald-600 font-medium text-white"
            : "rounded-bl-md bg-white text-ink/75 shadow-card dark:bg-white/[0.06] dark:text-cloud/80 dark:shadow-none"
        }`}
      >
        {message.body}
      </p>
    </div>
  );
}
