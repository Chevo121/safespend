"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Sparkles, Target } from "lucide-react";
import {
  currency,
  getDashboardMetrics,
  getGirlfriendBreakdown
} from "@/lib/calculations";
import { askCoach, type GoalSuggestion } from "@/lib/coach";
import { useStore } from "@/lib/store";
import { ChipButton } from "./ui";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  body: string;
};

const quickQuestions = [
  "How am I doing?",
  "Can I afford a desk for $12,000?",
  "Relationship spend?",
  "My debts?"
];

let seq = 0;
const nextId = (prefix: string) => `${prefix}-${++seq}`;

export function AskChat() {
  const { transactions, payments, debts, goals, budget, addGoal } = useStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "intro",
      role: "assistant",
      body: "Ask me anything about your money — what's safe to spend, whether you can afford something, relationship spend, debts, or upcoming bills. I answer from your own numbers."
    }
  ]);
  const [draft, setDraft] = useState("");
  const [suggestion, setSuggestion] = useState<GoalSuggestion | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, suggestion]);

  function append(...next: ChatMessage[]) {
    setMessages((existing) => [...existing, ...next]);
  }

  function ask(text: string) {
    const question = text.trim();
    if (!question) {
      return;
    }

    const reply = askCoach(question, {
      metrics: getDashboardMetrics(transactions, payments, debts, budget),
      goals,
      debts,
      girlfriendBreakdown: getGirlfriendBreakdown(transactions, new Date(), budget.payDay)
    });

    setDraft("");
    setSuggestion(reply.goalSuggestion ?? null);
    append(
      { id: nextId("user"), role: "user", body: question },
      { id: nextId("reply"), role: "assistant", body: reply.body }
    );
  }

  function acceptPace(index: number) {
    if (!suggestion) {
      return;
    }

    const pace = suggestion.paces[index];
    addGoal({
      name: suggestion.name,
      targetMxn: suggestion.targetMxn,
      savedMxn: 0,
      monthlyMxn: pace.monthlyMxn
    });
    setSuggestion(null);
    append(
      { id: nextId("user"), role: "user", body: `${currency.format(pace.monthlyMxn)}/month` },
      {
        id: nextId("reply"),
        role: "assistant",
        body: `Goal added: ${suggestion.name}, ${currency.format(suggestion.targetMxn)} by ${pace.etaLabel}. Track it in Plan → Goals.`
      }
    );
  }

  const showQuick = messages.length <= 1 && !suggestion;

  return (
    <div className="flex min-h-[calc(100vh-14rem)] flex-col">
      <div className="flex flex-1 flex-col gap-3 pb-4">
        {messages.map((message) => (
          <ChatBubble key={message.id} message={message} />
        ))}

        {suggestion ? (
          <div className="flex flex-wrap gap-2 pl-10">
            {suggestion.paces.map((pace, index) => (
              <button
                key={pace.monthlyMxn}
                onClick={() => acceptPace(index)}
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

        {showQuick ? (
          <div className="mt-1 flex flex-wrap gap-2 pl-10">
            {quickQuestions.map((question) => (
              <ChipButton key={question} onClick={() => ask(question)}>
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
          ask(draft);
        }}
        className="sticky bottom-[4.75rem] mt-2 flex items-center gap-2 rounded-full border border-black/[0.07] bg-white/95 p-1.5 shadow-card backdrop-blur dark:border-white/10 dark:bg-[#15161b]/95 dark:shadow-none"
      >
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Ask anything…"
          className="min-h-10 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-ink/35 dark:placeholder:text-cloud/35"
        />
        <button
          type="submit"
          aria-label="Ask"
          disabled={!draft.trim()}
          className="grid size-10 shrink-0 place-items-center rounded-full bg-emerald-600 text-white transition disabled:opacity-30"
        >
          <ArrowUp className="size-4" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const mine = message.role === "user";

  return (
    <div className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}>
      {!mine ? (
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ink text-emerald-400 dark:bg-cloud dark:text-emerald-700">
          <Sparkles className="size-4" aria-hidden="true" />
        </span>
      ) : null}
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
