"use client";

import { useState } from "react";
import { Banknote, Check, Pencil, Trash2 } from "lucide-react";
import { Card, Section, StatusPill } from "@/components/ui";
import { currency, getDebtPayoff } from "@/lib/calculations";
import { useStore } from "@/lib/store";

function ordinal(day: number) {
  const rem10 = day % 10;
  const rem100 = day % 100;

  if (rem10 === 1 && rem100 !== 11) return `${day}st`;
  if (rem10 === 2 && rem100 !== 12) return `${day}nd`;
  if (rem10 === 3 && rem100 !== 13) return `${day}rd`;
  return `${day}th`;
}

export function PlanDebts() {
  const { debts, addDebt, updateDebt, removeDebt } = useStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [monthly, setMonthly] = useState("");
  const [dueDay, setDueDay] = useState("1");

  const totalBalance = debts.reduce((total, d) => total + Math.max(d.balanceMxn, 0), 0);
  const totalMonthly = debts.reduce(
    (total, d) => total + (d.balanceMxn > 0 ? d.monthlyPaymentMxn : 0),
    0
  );

  function resetForm() {
    setEditingId(null);
    setName("");
    setBalance("");
    setMonthly("");
    setDueDay("1");
  }

  function startEdit(id: string) {
    const debt = debts.find((d) => d.id === id);
    if (!debt) {
      return;
    }

    setEditingId(id);
    setName(debt.name);
    setBalance(String(debt.balanceMxn));
    setMonthly(String(debt.monthlyPaymentMxn));
    setDueDay(String(debt.dueDayOfMonth));
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const parsedBalance = Number(balance);
    const parsedMonthly = Number(monthly);
    const parsedDueDay = Math.min(Math.max(Math.round(Number(dueDay) || 1), 1), 31);

    if (
      !name.trim() ||
      !Number.isFinite(parsedBalance) ||
      parsedBalance <= 0 ||
      !Number.isFinite(parsedMonthly) ||
      parsedMonthly <= 0
    ) {
      return;
    }

    const values = {
      name: name.trim(),
      balanceMxn: parsedBalance,
      monthlyPaymentMxn: parsedMonthly,
      dueDayOfMonth: parsedDueDay
    };

    if (editingId) {
      updateDebt(editingId, values);
    } else {
      addDebt(values);
    }

    resetForm();
  }

  return (
    <>
      {debts.length > 0 ? (
        <Card className="mb-4 flex items-center gap-3 border-rose-500/20 bg-rose-500/[0.05] dark:bg-rose-500/[0.08]">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-rose-500/12 text-rose-600 dark:text-rose-400">
            <Banknote className="size-5" aria-hidden="true" />
          </span>
          <p className="text-sm leading-5 text-ink/60 dark:text-cloud/60">
            <span className="tnum font-semibold text-ink dark:text-cloud">
              {currency.format(totalBalance)}
            </span>{" "}
            owed across {debts.length} debt{debts.length === 1 ? "" : "s"} ·{" "}
            {currency.format(totalMonthly)}/month, reserved with your bills.
          </p>
        </Card>
      ) : null}

      <Section title="Debts">
        {debts.length > 0 ? (
          <div className="space-y-3">
            {debts.map((debt) => {
              const payoff = getDebtPayoff(debt);
              const paidOff = payoff.monthsLeft === 0;

              return (
                <Card key={debt.id}>
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-rose-500/12 text-rose-600 dark:text-rose-400">
                      <Banknote className="size-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{debt.name}</p>
                      <p className="tnum mt-0.5 text-xs text-ink/45 dark:text-cloud/45">
                        {currency.format(debt.monthlyPaymentMxn)}/mo · due the{" "}
                        {ordinal(debt.dueDayOfMonth)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="tnum font-bold">{currency.format(debt.balanceMxn)}</p>
                      <StatusPill tone={paidOff ? "safe" : "neutral"}>
                        {paidOff ? "Paid off" : payoff.label}
                      </StatusPill>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <p className="text-xs text-ink/40 dark:text-cloud/40">
                      {paidOff
                        ? "Nothing left on this one."
                        : payoff.monthsLeft
                          ? `About ${payoff.monthsLeft} payment${payoff.monthsLeft === 1 ? "" : "s"} left, before interest`
                          : payoff.label}
                    </p>
                    <div className="flex gap-1">
                      <button
                        onClick={() => startEdit(debt.id)}
                        aria-label={`Edit ${debt.name}`}
                        className="grid size-8 place-items-center rounded-full text-ink/40 transition hover:bg-black/5 hover:text-ink dark:text-cloud/40 dark:hover:bg-white/10 dark:hover:text-cloud"
                      >
                        <Pencil className="size-4" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => {
                          removeDebt(debt.id);
                          if (editingId === debt.id) {
                            resetForm();
                          }
                        }}
                        aria-label={`Delete ${debt.name}`}
                        className="grid size-8 place-items-center rounded-full text-ink/40 transition hover:bg-rose-500/10 hover:text-rose-600 dark:text-cloud/40 dark:hover:text-rose-400"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="py-6 text-center text-sm text-ink/45 dark:text-cloud/45">
            No debts tracked. Add one below and its payment gets reserved automatically.
          </Card>
        )}
      </Section>

      <Section title={editingId ? "Edit debt" : "New debt"}>
        <Card>
          <form onSubmit={submit} className="space-y-3">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Name — e.g. Didi Préstamos"
              className="min-h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-sm outline-none transition placeholder:text-ink/35 focus:border-emerald-500/60 dark:border-white/15 dark:bg-white/[0.06] dark:placeholder:text-cloud/35"
            />
            <div className="grid grid-cols-3 gap-2">
              <input
                value={balance}
                onChange={(event) => setBalance(event.target.value)}
                placeholder="Owed"
                type="number"
                inputMode="decimal"
                min="1"
                className="tnum min-h-11 rounded-xl border border-black/10 bg-white px-3 text-sm outline-none transition placeholder:text-ink/35 focus:border-emerald-500/60 dark:border-white/15 dark:bg-white/[0.06] dark:placeholder:text-cloud/35"
              />
              <input
                value={monthly}
                onChange={(event) => setMonthly(event.target.value)}
                placeholder="Per month"
                type="number"
                inputMode="decimal"
                min="1"
                className="tnum min-h-11 rounded-xl border border-black/10 bg-white px-3 text-sm outline-none transition placeholder:text-ink/35 focus:border-emerald-500/60 dark:border-white/15 dark:bg-white/[0.06] dark:placeholder:text-cloud/35"
              />
              <input
                value={dueDay}
                onChange={(event) => setDueDay(event.target.value)}
                placeholder="Due day"
                type="number"
                inputMode="numeric"
                min="1"
                max="31"
                aria-label="Due day of month"
                className="tnum min-h-11 rounded-xl border border-black/10 bg-white px-3 text-sm outline-none transition placeholder:text-ink/35 focus:border-emerald-500/60 dark:border-white/15 dark:bg-white/[0.06] dark:placeholder:text-cloud/35"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white transition hover:opacity-90 dark:bg-cloud dark:text-ink"
              >
                <Check className="size-4" aria-hidden="true" />
                {editingId ? "Save changes" : "Add debt"}
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
          <p className="mt-3 text-xs leading-5 text-ink/40 dark:text-cloud/40">
            Payoff estimates ignore interest in Phase 1. Monthly payments show on the
            calendar and are reserved out of safe-to-spend on their due day.
          </p>
        </Card>
      </Section>
    </>
  );
}
