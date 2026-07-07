"use client";

import { useState } from "react";
import { Banknote, CalendarClock, Check, ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { clsx } from "clsx";
import { Card, Section } from "@/components/ui";
import { currency, getCommitments, getMonthContext } from "@/lib/calculations";
import { useStore } from "@/lib/store";

const weekdays = ["M", "T", "W", "T", "F", "S", "S"];

const paymentCategories = [
  "Housing",
  "Utilities",
  "Internet & phone",
  "Subscriptions",
  "Insurance",
  "Other"
];

const monthFormatter = new Intl.DateTimeFormat("en", { month: "long", year: "numeric" });

export function PlanBills() {
  const { payments, debts, addPayment, updatePayment, removePayment } = useStore();
  const current = getMonthContext();
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState(current.daysElapsed);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(paymentCategories[0]);

  const viewedMonth = new Date(current.year, current.month + monthOffset, 1);
  const daysInViewedMonth = new Date(
    viewedMonth.getFullYear(),
    viewedMonth.getMonth() + 1,
    0
  ).getDate();
  const firstWeekday = (viewedMonth.getDay() + 6) % 7;
  const isCurrentMonth = monthOffset === 0;
  const today = current.daysElapsed;

  const commitments = getCommitments(payments, debts);
  const monthlyTotal = commitments.reduce((total, c) => total + c.amountMxn, 0);
  const dayCommitments = commitments.filter((c) => c.dayOfMonth === selectedDay);

  function selectDay(day: number) {
    setSelectedDay(day);
    resetForm();
  }

  function resetForm() {
    setEditingId(null);
    setName("");
    setAmount("");
    setCategory(paymentCategories[0]);
  }

  function startEdit(id: string) {
    const payment = payments.find((p) => p.id === id);
    if (!payment) {
      return;
    }

    setEditingId(id);
    setName(payment.name);
    setAmount(String(payment.amountMxn));
    setCategory(payment.category);
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = Number(amount);
    if (!name.trim() || !Number.isFinite(parsed) || parsed <= 0) {
      return;
    }

    if (editingId) {
      updatePayment(editingId, {
        name: name.trim(),
        amountMxn: parsed,
        category,
        dayOfMonth: selectedDay
      });
    } else {
      addPayment({
        name: name.trim(),
        amountMxn: parsed,
        category,
        dayOfMonth: selectedDay
      });
    }

    resetForm();
  }

  return (
    <>
      <Card className="mb-4 flex items-center gap-3 border-sky-500/25 bg-sky-500/[0.07] dark:bg-sky-500/10">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-sky-500/15 text-sky-700 dark:text-sky-400">
          <CalendarClock className="size-5" aria-hidden="true" />
        </span>
        <p className="text-sm leading-5 text-ink/60 dark:text-cloud/60">
          {currency.format(monthlyTotal)}/month in bills and debt payments. Anything still due
          this month is reserved before your safe-to-spend.
        </p>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setMonthOffset((value) => value - 1)}
            aria-label="Previous month"
            className="grid size-9 place-items-center rounded-full text-ink/50 transition hover:bg-black/5 dark:text-cloud/50 dark:hover:bg-white/10"
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>
          <p className="font-semibold">{monthFormatter.format(viewedMonth)}</p>
          <button
            onClick={() => setMonthOffset((value) => value + 1)}
            aria-label="Next month"
            className="grid size-9 place-items-center rounded-full text-ink/50 transition hover:bg-black/5 dark:text-cloud/50 dark:hover:bg-white/10"
          >
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-3 grid grid-cols-7 text-center">
          {weekdays.map((day, index) => (
            <span
              key={`${day}-${index}`}
              className="pb-2 text-[11px] font-semibold text-ink/35 dark:text-cloud/35"
            >
              {day}
            </span>
          ))}

          {Array.from({ length: firstWeekday }).map((_, index) => (
            <span key={`blank-${index}`} />
          ))}

          {Array.from({ length: daysInViewedMonth }, (_, index) => index + 1).map((day) => {
            const dayItems = commitments.filter((c) => c.dayOfMonth === day);
            const isSelected = day === selectedDay;
            const isToday = isCurrentMonth && day === today;

            return (
              <button
                key={day}
                onClick={() => selectDay(day)}
                className={clsx(
                  "relative mx-auto grid size-10 place-items-center rounded-full text-sm font-medium transition",
                  isSelected
                    ? "bg-ink text-white dark:bg-cloud dark:text-ink"
                    : isToday
                      ? "font-bold text-emerald-700 ring-1 ring-inset ring-emerald-500/50 dark:text-emerald-400"
                      : "text-ink/70 hover:bg-black/5 dark:text-cloud/70 dark:hover:bg-white/10"
                )}
              >
                {day}
                {dayItems.length > 0 ? (
                  <span className="absolute bottom-1 flex gap-0.5">
                    {dayItems.slice(0, 3).map((item) => (
                      <span
                        key={item.id}
                        className={clsx(
                          "size-1 rounded-full",
                          isSelected
                            ? "bg-emerald-400"
                            : item.kind === "debt"
                              ? "bg-rose-500"
                              : "bg-sky-500"
                        )}
                      />
                    ))}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
        <p className="mt-3 flex items-center gap-3 text-[11px] text-ink/40 dark:text-cloud/40">
          <span className="flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-sky-500" /> bill
          </span>
          <span className="flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-rose-500" /> debt payment
          </span>
        </p>
      </Card>

      <Section title={`Due on the ${ordinal(selectedDay)}`}>
        {dayCommitments.length > 0 ? (
          <Card className="divide-y divide-black/[0.05] p-0 dark:divide-white/[0.06]">
            {dayCommitments.map((item) => (
              <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate font-semibold">
                    {item.name}
                    {item.kind === "debt" ? (
                      <Banknote className="size-3.5 shrink-0 text-rose-500" aria-hidden="true" />
                    ) : null}
                  </p>
                  <p className="mt-0.5 text-xs text-ink/45 dark:text-cloud/45">
                    {item.kind === "debt"
                      ? "Debt payment · managed in Debts"
                      : `${payments.find((p) => p.id === item.id)?.category ?? "Bill"} · monthly`}
                  </p>
                </div>
                <p className="tnum shrink-0 font-semibold">{currency.format(item.amountMxn)}</p>
                {item.kind === "bill" ? (
                  <>
                    <button
                      onClick={() => startEdit(item.id)}
                      aria-label={`Edit ${item.name}`}
                      className="grid size-9 shrink-0 place-items-center rounded-full text-ink/40 transition hover:bg-black/5 hover:text-ink dark:text-cloud/40 dark:hover:bg-white/10 dark:hover:text-cloud"
                    >
                      <Pencil className="size-4" aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => {
                        removePayment(item.id);
                        if (editingId === item.id) {
                          resetForm();
                        }
                      }}
                      aria-label={`Delete ${item.name}`}
                      className="grid size-9 shrink-0 place-items-center rounded-full text-ink/40 transition hover:bg-rose-500/10 hover:text-rose-600 dark:text-cloud/40 dark:hover:text-rose-400"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </>
                ) : null}
              </div>
            ))}
          </Card>
        ) : (
          <Card className="py-6 text-center text-sm text-ink/45 dark:text-cloud/45">
            Nothing scheduled on the {ordinal(selectedDay)}.
          </Card>
        )}
      </Section>

      <Section title={editingId ? "Edit payment" : `Add payment on the ${ordinal(selectedDay)}`}>
        <Card>
          <form onSubmit={submit} className="space-y-3">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Name — e.g. Rent"
              className="min-h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-sm outline-none transition placeholder:text-ink/35 focus:border-emerald-500/60 dark:border-white/15 dark:bg-white/[0.06] dark:placeholder:text-cloud/35"
            />
            <div className="flex gap-3">
              <input
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="Amount"
                type="number"
                inputMode="decimal"
                min="1"
                className="tnum min-h-11 w-32 rounded-xl border border-black/10 bg-white px-4 text-sm outline-none transition placeholder:text-ink/35 focus:border-emerald-500/60 dark:border-white/15 dark:bg-white/[0.06] dark:placeholder:text-cloud/35"
              />
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="min-h-11 flex-1 rounded-xl border border-black/10 bg-white px-3 text-sm outline-none transition focus:border-emerald-500/60 dark:border-white/15 dark:bg-white/[0.06]"
              >
                {paymentCategories.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white transition hover:opacity-90 dark:bg-cloud dark:text-ink"
              >
                <Check className="size-4" aria-hidden="true" />
                {editingId ? "Save changes" : "Add payment"}
              </button>
              {editingId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-sm font-semibold text-ink/50 dark:text-cloud/50"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </Card>
      </Section>
    </>
  );
}

function ordinal(day: number) {
  const rem10 = day % 10;
  const rem100 = day % 100;

  if (rem10 === 1 && rem100 !== 11) return `${day}st`;
  if (rem10 === 2 && rem100 !== 12) return `${day}nd`;
  if (rem10 === 3 && rem100 !== 13) return `${day}rd`;
  return `${day}th`;
}
