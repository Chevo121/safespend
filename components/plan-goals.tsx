"use client";

import { useState } from "react";
import { Check, Pencil, Target, Trash2 } from "lucide-react";
import { Card, ProgressBar, Section, StatusPill } from "@/components/ui";
import { currency, getGoalEta } from "@/lib/calculations";
import { useStore } from "@/lib/store";

export function PlanGoals() {
  const { goals, addGoal, updateGoal, removeGoal } = useStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [saved, setSaved] = useState("");
  const [monthly, setMonthly] = useState("");

  function resetForm() {
    setEditingId(null);
    setName("");
    setTarget("");
    setSaved("");
    setMonthly("");
  }

  function startEdit(id: string) {
    const goal = goals.find((g) => g.id === id);
    if (!goal) {
      return;
    }

    setEditingId(id);
    setName(goal.name);
    setTarget(String(goal.targetMxn));
    setSaved(String(goal.savedMxn));
    setMonthly(String(goal.monthlyMxn));
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const parsedTarget = Number(target);
    const parsedSaved = Number(saved) || 0;
    const parsedMonthly = Number(monthly) || 0;

    if (!name.trim() || !Number.isFinite(parsedTarget) || parsedTarget <= 0) {
      return;
    }

    const values = {
      name: name.trim(),
      targetMxn: parsedTarget,
      savedMxn: Math.max(parsedSaved, 0),
      monthlyMxn: Math.max(parsedMonthly, 0)
    };

    if (editingId) {
      updateGoal(editingId, values);
    } else {
      addGoal(values);
    }

    resetForm();
  }

  return (
    <>
      <Section title="Savings goals">
        {goals.length > 0 ? (
          <div className="space-y-3">
            {goals.map((goal) => {
              const eta = getGoalEta(goal);
              const percent = goal.targetMxn > 0 ? goal.savedMxn / goal.targetMxn : 0;
              const funded = eta.monthsLeft === 0;

              return (
                <Card key={goal.id}>
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-emerald-500/12 text-emerald-600 dark:text-emerald-400">
                      <Target className="size-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{goal.name}</p>
                      <p className="tnum mt-0.5 text-xs text-ink/45 dark:text-cloud/45">
                        {currency.format(goal.savedMxn)} of {currency.format(goal.targetMxn)}
                        {goal.monthlyMxn > 0
                          ? ` · ${currency.format(goal.monthlyMxn)}/mo`
                          : ""}
                      </p>
                    </div>
                    <StatusPill tone={funded ? "safe" : "info"}>
                      {funded ? "Funded" : eta.label}
                    </StatusPill>
                  </div>
                  <ProgressBar
                    percent={percent}
                    tone={funded ? "safe" : "info"}
                    className="mt-3"
                  />
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <p className="text-xs text-ink/40 dark:text-cloud/40">
                      {funded
                        ? "Target reached."
                        : `${currency.format(eta.remaining)} to go${eta.monthsLeft ? ` · about ${eta.monthsLeft} month${eta.monthsLeft === 1 ? "" : "s"}` : ""}`}
                    </p>
                    <div className="flex gap-1">
                      <button
                        onClick={() => startEdit(goal.id)}
                        aria-label={`Edit ${goal.name}`}
                        className="grid size-8 place-items-center rounded-full text-ink/40 transition hover:bg-black/5 hover:text-ink dark:text-cloud/40 dark:hover:bg-white/10 dark:hover:text-cloud"
                      >
                        <Pencil className="size-4" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => {
                          removeGoal(goal.id);
                          if (editingId === goal.id) {
                            resetForm();
                          }
                        }}
                        aria-label={`Delete ${goal.name}`}
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
            No goals yet. Add one below, or ask the coach “Can I afford …?” and pick a pace.
          </Card>
        )}
      </Section>

      <Section title={editingId ? "Edit goal" : "New goal"}>
        <Card>
          <form onSubmit={submit} className="space-y-3">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Name — e.g. Standing desk"
              className="min-h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-sm outline-none transition placeholder:text-ink/35 focus:border-emerald-500/60 dark:border-white/15 dark:bg-white/[0.06] dark:placeholder:text-cloud/35"
            />
            <div className="grid grid-cols-3 gap-2">
              <input
                value={target}
                onChange={(event) => setTarget(event.target.value)}
                placeholder="Target"
                type="number"
                inputMode="decimal"
                min="1"
                className="tnum min-h-11 rounded-xl border border-black/10 bg-white px-3 text-sm outline-none transition placeholder:text-ink/35 focus:border-emerald-500/60 dark:border-white/15 dark:bg-white/[0.06] dark:placeholder:text-cloud/35"
              />
              <input
                value={saved}
                onChange={(event) => setSaved(event.target.value)}
                placeholder="Saved"
                type="number"
                inputMode="decimal"
                min="0"
                className="tnum min-h-11 rounded-xl border border-black/10 bg-white px-3 text-sm outline-none transition placeholder:text-ink/35 focus:border-emerald-500/60 dark:border-white/15 dark:bg-white/[0.06] dark:placeholder:text-cloud/35"
              />
              <input
                value={monthly}
                onChange={(event) => setMonthly(event.target.value)}
                placeholder="Per month"
                type="number"
                inputMode="decimal"
                min="0"
                className="tnum min-h-11 rounded-xl border border-black/10 bg-white px-3 text-sm outline-none transition placeholder:text-ink/35 focus:border-emerald-500/60 dark:border-white/15 dark:bg-white/[0.06] dark:placeholder:text-cloud/35"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white transition hover:opacity-90 dark:bg-cloud dark:text-ink"
              >
                <Check className="size-4" aria-hidden="true" />
                {editingId ? "Save changes" : "Add goal"}
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
            Goal money comes from your savings, not the flexible pool — the ETA is target
            minus saved, at your monthly pace.
          </p>
        </Card>
      </Section>
    </>
  );
}
