"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { formatDate, preciseCurrency } from "@/lib/calculations";
import { getFlowStep } from "@/lib/flows";
import { useStore } from "@/lib/store";
import type { Transaction } from "@/lib/types";
import { ChipButton, StatusPill } from "./ui";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  body: string;
};

export function ReviewChat() {
  const { transactions, pendingCount, updateTransaction } = useStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "intro",
      role: "assistant",
      body: "Let's clean up this screenshot. I'll ask about anything ambiguous — tap an answer, no typing needed."
    }
  ]);
  const [stepId, setStepId] = useState("start");
  const [activeTxId, setActiveTxId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const current = transactions.find((tx) => tx.status === "needs_review") ?? null;

  useEffect(() => {
    if (current && current.id !== activeTxId) {
      setActiveTxId(current.id);
      setStepId("start");
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

    if (option.next) {
      updateTransaction(tx.id, { ...patch, clarificationAnswer: answer });
      setStepId(option.next);
    } else {
      updateTransaction(tx.id, {
        ...patch,
        clarificationAnswer: answer,
        needsClarification: false,
        status: patch.status ?? "approved"
      });
    }

    append(
      { id: `${tx.id}-${stepId}-user`, role: "user", body: option.label },
      { id: `${tx.id}-${stepId}-reply`, role: "assistant", body: option.reply }
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
                  <p className="font-semibold">{current.merchant}</p>
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
            {stepId === "start" ? (
              <ChipButton subtle onClick={() => ignoreCurrent(current)}>
                Ignore
              </ChipButton>
            ) : null}
          </div>
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
