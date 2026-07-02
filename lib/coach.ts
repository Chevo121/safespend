import {
  currency,
  getDebtPayoff,
  getGoalEta,
  monthLabelFromNow,
  statusLabel,
  type getDashboardMetrics
} from "./calculations";
import type { Debt, SavingsGoal } from "./types";

type Metrics = ReturnType<typeof getDashboardMetrics>;

export type GoalPace = {
  monthlyMxn: number;
  monthsLeft: number;
  etaLabel: string;
};

export type GoalSuggestion = {
  name: string;
  targetMxn: number;
  paces: GoalPace[];
};

export type CoachReply = {
  body: string;
  goalSuggestion?: GoalSuggestion;
};

export type CoachContext = {
  metrics: Metrics;
  goals: SavingsGoal[];
  debts: Debt[];
  girlfriendBreakdown: Array<{ tag: string; amount: number }>;
};

function parseAmount(text: string): number | null {
  // Matches "12000", "12,000", "$12 000", "12k", "12.5k"
  const match = text.replace(/\s/g, " ").match(/\$?\s?(\d[\d,.]*)\s*(k)?/i);
  if (!match) {
    return null;
  }

  const raw = Number(match[1].replace(/,/g, ""));
  if (!Number.isFinite(raw) || raw <= 0) {
    return null;
  }

  return match[2] ? raw * 1000 : raw;
}

function parseItemName(text: string): string {
  const match = text.match(
    /(?:buy|get|afford|purchase|save (?:up )?for)\s+(?:a|an|the|this|that)?\s*([a-záéíóúñ][\w áéíóúñ-]{1,30}?)(?=\s+(?:for|that|which|it|costs?|is|at|around|of)\b|[.,?!]|\s*\$|\s*\d|$)/i
  );

  const name = match?.[1]?.trim();
  return name && name.length > 1 ? name : "that purchase";
}

function goalPaces(amount: number): GoalPace[] {
  const roundUp = (value: number) => Math.ceil(value / 100) * 100;

  return [3, 6, 12]
    .map((months) => {
      const monthly = roundUp(amount / months);
      const monthsLeft = Math.ceil(amount / monthly);
      return { monthlyMxn: monthly, monthsLeft, etaLabel: monthLabelFromNow(monthsLeft) };
    })
    .filter(
      (pace, index, all) =>
        index === 0 || pace.monthlyMxn !== all[index - 1].monthlyMxn
    );
}

function affordabilityReply(text: string, ctx: CoachContext): CoachReply {
  const amount = parseAmount(text);

  if (!amount) {
    return {
      body: "Tell me roughly what it costs — e.g. “I want to buy a desk for $12,000” — and I'll work out when it fits."
    };
  }

  const name = parseItemName(text);
  const { metrics } = ctx;

  if (amount <= metrics.safeToSpendToday) {
    return {
      body: `${currency.format(amount)} fits inside today's safe-to-spend (${currency.format(metrics.safeToSpendToday)}). You could buy ${name} today without touching the rest of the month.`
    };
  }

  if (amount <= metrics.discretionaryRemaining) {
    const newDaily = (metrics.discretionaryRemaining - amount) / metrics.daysLeft;
    return {
      body: `You could cover ${currency.format(amount)} for ${name} this month — you have ${currency.format(metrics.discretionaryRemaining)} free after bills. It would lower safe-to-spend to about ${currency.format(newDaily)}/day for the rest of July.`
    };
  }

  return {
    body: `${currency.format(amount)} for ${name} is more than the ${currency.format(Math.max(metrics.discretionaryRemaining, 0))} you have free this month, so it works better as a savings goal. Pick a pace and I'll set it up:`,
    goalSuggestion: {
      name: name === "that purchase" ? "New purchase" : capitalize(name),
      targetMxn: Math.round(amount),
      paces: goalPaces(amount)
    }
  };
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function askCoach(text: string, ctx: CoachContext): CoachReply {
  const q = text.toLowerCase();
  const { metrics, goals, debts, girlfriendBreakdown } = ctx;

  if (/\b(buy|afford|purchase|cost|save (?:up )?for|want (?:a|an|the|to get))\b/.test(q)) {
    return affordabilityReply(text, ctx);
  }

  if (/girlfriend|novia/.test(q)) {
    const parts = girlfriendBreakdown
      .slice(0, 3)
      .map(({ tag, amount }) => `${tag.toLowerCase()} ${currency.format(amount)}`)
      .join(", ");
    return {
      body: `Girlfriend spend is at ${currency.format(metrics.girlfriendSpend)} this month${parts ? ` — mostly ${parts}` : ""}. You can tag or untag anything from Activity.`
    };
  }

  if (/debt|owe|préstamo|prestamo|loan/.test(q)) {
    if (debts.length === 0) {
      return { body: "No debts tracked yet. Add one in Plan → Debts and I'll fold the payments into your safe-to-spend." };
    }

    const lines = debts
      .map((debt) => {
        const payoff = getDebtPayoff(debt);
        return `${debt.name}: ${currency.format(debt.balanceMxn)} left at ${currency.format(debt.monthlyPaymentMxn)}/month — clear around ${payoff.label}`;
      })
      .join(". ");
    return { body: `${lines}. That's before interest; payments are already reserved in your budget.` };
  }

  if (/goal|desk|saving/.test(q)) {
    if (goals.length === 0) {
      return { body: "No goals yet. Tell me what you want to buy and what it costs, and I'll set one up with a monthly pace." };
    }

    const lines = goals
      .map((goal) => {
        const eta = getGoalEta(goal);
        return `${goal.name}: ${currency.format(goal.savedMxn)} of ${currency.format(goal.targetMxn)} — on pace for ${eta.label}`;
      })
      .join(". ");
    return { body: lines + "." };
  }

  if (/bill|rent|due|scheduled|internet/.test(q)) {
    if (metrics.upcomingCommitments.length === 0) {
      return { body: "Nothing else is scheduled this month. Add recurring payments in Plan → Bills." };
    }

    const lines = metrics.upcomingCommitments
      .map((c) => `${c.name} ${currency.format(c.amountMxn)} on the ${c.dayOfMonth}`)
      .join(", ");
    return {
      body: `Still coming this month: ${lines}. All ${currency.format(metrics.committedRemaining)} of that is already reserved out of safe-to-spend.`
    };
  }

  if (/safe|today|how am i|doing|track|status|left|budget/.test(q)) {
    const projection =
      metrics.projectedRemaining >= 0
        ? `on pace to end ${metrics.monthName} with ${currency.format(metrics.projectedRemaining)} left`
        : `on pace to end ${metrics.monthName} about ${currency.format(Math.abs(metrics.projectedRemaining))} over`;
    return {
      body: `${statusLabel[metrics.spendStatus]}. Safe to spend today is ${currency.format(metrics.safeToSpendToday)}, with ${currency.format(metrics.discretionaryRemaining)} free after bills. You're ${projection}.${metrics.pendingClarifications > 0 ? ` ${metrics.pendingClarifications} answers pending would sharpen this.` : ""}`
    };
  }

  return {
    body: "I can answer from your data: “Can I afford a desk for $12,000?”, “How am I doing?”, “Girlfriend spend?”, “My debts?”, or “What bills are coming?”"
  };
}
