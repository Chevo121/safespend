"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Check, Copy, Sparkles, Target } from "lucide-react";
import { clsx } from "clsx";
import {
  currency,
  formatDate,
  getDashboardMetrics,
  getGirlfriendBreakdown,
  preciseCurrency
} from "@/lib/calculations";
import { askCoach, type GoalSuggestion } from "@/lib/coach";
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

const quickQuestions = [
  "How am I doing?",
  "Can I afford a desk for $12,000?",
  "Girlfriend spend?",
  "My debts?"
];

let messageSeq = 0;
const nextId = (prefix: string) => `${prefix}-${++messageSeq}`;

export function CoachChat() {
  const store = useStore();
  const {
    transactions,
    pendingCount,
    priorityId,
    payments,
    debts,
    goals,
    budget,
    updateTransaction,
    addRule,
    addGoal
  } = store;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "intro",
      role: "assistant",
      body: "I answer from your own numbers — ask me anything below. After an upload I'll also ask about anything ambiguous."
    }
  ]);
  const [stepId, setStepId] = useState("start");
  const [activeTxId, setActiveTxId] = useState<string | null>(null);
  const [remember, setRemember] = useState(false);
  const [draft, setDraft] = useState("");
  const [coachDraft, setCoachDraft] = useState("");
  const [suggestion, setSuggestion] = useState<GoalSuggestion | null>(null);
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
  }, [messages.length, current?.id, stepId, suggestion]);

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
      { id: nextId("clarify-user"), role: "user", body: option.label },
      { id: nextId("clarify-reply"), role: "assistant", body: option.reply }
    );
  }

  function submitClarificationText(tx: Transaction) {
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
      { id: nextId("text-user"), role: "user", body: text },
      { id: nextId("text-reply"), role: "assistant", body: `Filed under ${category}.` }
    );
  }

  function ignoreCurrent(tx: Transaction) {
    updateTransaction(tx.id, { needsClarification: false, status: "ignored" });
    append(
      { id: nextId("ignore-user"), role: "user", body: "Ignore this one" },
      {
        id: nextId("ignore-reply"),
        role: "assistant",
        body: "Ignored — it won't affect your totals."
      }
    );
  }

  function submitCoachQuestion(text: string) {
    const question = text.trim();
    if (!question) {
      return;
    }

    const reply = askCoach(question, {
      metrics: getDashboardMetrics(transactions, payments, debts, budget),
      goals,
      debts,
      girlfriendBreakdown: getGirlfriendBreakdown(transactions)
    });

    setCoachDraft("");
    setSuggestion(reply.goalSuggestion ?? null);
    append(
      { id: nextId("coach-user"), role: "user", body: question },
      { id: nextId("coach-reply"), role: "assistant", body: reply.body }
    );
  }

  function acceptGoalPace(paceIndex: number) {
    if (!suggestion) {
      return;
    }

    const pace = suggestion.paces[paceIndex];
    addGoal({
      name: suggestion.name,
      targetMxn: suggestion.targetMxn,
      savedMxn: 0,
      monthlyMxn: pace.monthlyMxn
    });
    setSuggestion(null);
    append(
      {
        id: nextId("goal-user"),
        role: "user",
        body: `${currency.format(pace.monthlyMxn)}/month`
      },
      {
        id: nextId("goal-reply"),
        role: "assistant",
        body: `Goal added: ${suggestion.name}, ${currency.format(suggestion.targetMxn)} by ${pace.etaLabel}. Track it in Plan → Goals.`
      }
    );
  }

  const step = current ? getFlowStep(current, stepId) : null;
  const isDuplicate = current?.status === "duplicate_candidate";
  const showQuickQuestions = !current && !suggestion && messages.length <= 3;

  return (
    <div className="flex min-h-[calc(100vh-16rem)] flex-col">
      <div className="flex flex-1 flex-col gap-3 pb-4">
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
                    submitClarificationText(current);
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

        {suggestion ? (
          <div className="flex flex-wrap gap-2 pl-10">
            {suggestion.paces.map((pace, index) => (
              <button
                key={pace.monthlyMxn}
                onClick={() => acceptGoalPace(index)}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 text-sm font-semibold text-emerald-800 transition active:scale-95 dark:text-emerald-300"
              >
                <Target className="size-3.5" aria-hidden="true" />
                {currency.format(pace.monthlyMxn)}/mo · {pace.etaLabel}
              </button>
            ))}
            <ChipButton subtle onClick={() => setSuggestion(null)}>
              Not now
            </ChipButton>
          </div>
        ) : null}

        {showQuickQuestions ? (
          <div className="mt-1 flex flex-wrap gap-2 pl-10">
            {quickQuestions.map((question) => (
              <ChipButton key={question} onClick={() => submitCoachQuestion(question)}>
                {question}
              </ChipButton>
            ))}
          </div>
        ) : null}

        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          submitCoachQuestion(coachDraft);
        }}
        className="sticky bottom-[4.75rem] mt-2 flex items-center gap-2 rounded-full border border-black/[0.07] bg-white/95 p-1.5 shadow-card backdrop-blur dark:border-white/10 dark:bg-[#15161b]/95 dark:shadow-none"
      >
        <input
          value={coachDraft}
          onChange={(event) => setCoachDraft(event.target.value)}
          placeholder="Ask your coach…"
          className="min-h-10 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-ink/35 dark:placeholder:text-cloud/35"
        />
        <button
          type="submit"
          aria-label="Ask"
          disabled={!coachDraft.trim()}
          className="grid size-10 shrink-0 place-items-center rounded-full bg-emerald-600 text-white transition disabled:opacity-30"
        >
          <ArrowUp className="size-4" aria-hidden="true" />
        </button>
      </form>
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
