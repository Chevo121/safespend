import { defaultBudget, defaultLimits } from "./mock-data";
import type { Budget, Debt, SavingsGoal, ScheduledPayment, Transaction } from "./types";

export const currency = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0
});

export const preciseCurrency = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 2
});

export const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short"
  }).format(new Date(`${date}T12:00:00`));

const monthYearFormatter = new Intl.DateTimeFormat("en", {
  month: "long",
  year: "numeric"
});

const monthNameFormatter = new Intl.DateTimeFormat("en", { month: "long" });

// Everything time-based derives from the real current date. Passing an explicit
// `now` is only used for tests and keeps SSR/CSR renders consistent within a day.
export function getMonthContext(now: Date = new Date()) {
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysElapsed = now.getDate();
  const daysLeft = Math.max(daysInMonth - daysElapsed + 1, 1);

  return {
    year,
    month,
    daysInMonth,
    daysElapsed,
    daysLeft,
    label: monthYearFormatter.format(now),
    monthName: monthNameFormatter.format(now)
  };
}

function inMonth(dateIso: string, year: number, month: number) {
  // transactionDate is a plain "YYYY-MM-DD" string.
  const [y, m] = dateIso.split("-").map(Number);
  return y === year && m - 1 === month;
}

export function monthLabelFromNow(months: number, now: Date = new Date()) {
  return monthYearFormatter.format(new Date(now.getFullYear(), now.getMonth() + months, 1));
}

export type SpendStatus = "safe" | "tight" | "over";

export const statusLabel: Record<SpendStatus, string> = {
  safe: "On track",
  tight: "Getting tight",
  over: "Over pace"
};

export function isSpending(transaction: Transaction) {
  if (transaction.status === "ignored" || transaction.status === "duplicate_candidate") {
    return false;
  }

  if (transaction.category === "Transfer to self") {
    return false;
  }

  return transaction.amountMxn < 0;
}

export type Commitment = {
  id: string;
  name: string;
  amountMxn: number;
  dayOfMonth: number;
  kind: "bill" | "debt";
};

export function getCommitments(
  payments: ScheduledPayment[],
  debts: Debt[]
): Commitment[] {
  return [
    ...payments.map((p) => ({
      id: p.id,
      name: p.name,
      amountMxn: p.amountMxn,
      dayOfMonth: p.dayOfMonth,
      kind: "bill" as const
    })),
    ...debts
      .filter((d) => d.balanceMxn > 0)
      .map((d) => ({
        id: d.id,
        name: d.name,
        amountMxn: Math.min(d.monthlyPaymentMxn, d.balanceMxn),
        dayOfMonth: d.dueDayOfMonth,
        kind: "debt" as const
      }))
  ].sort((a, b) => a.dayOfMonth - b.dayOfMonth);
}

export function getDashboardMetrics(
  transactions: Transaction[],
  payments: ScheduledPayment[] = [],
  debts: Debt[] = [],
  budget: Budget = defaultBudget,
  now: Date = new Date()
) {
  const { year, month, daysInMonth, daysElapsed, daysLeft, label, monthName } =
    getMonthContext(now);

  // The spend cap is base income minus the savings reserved first, plus the
  // spendable share of this month's commission (the rest is saved).
  const commission = budget.commissionThisMonth ?? 0;
  const commissionSaved = commission * budget.commissionSavingsRate;
  const commissionSpendable = commission - commissionSaved;
  const monthlySpendCap = Math.max(
    budget.fixedMonthlyIncome - budget.requiredSavings + commissionSpendable,
    0
  );
  const savedThisMonth = budget.requiredSavings + commissionSaved;

  const thisMonth = transactions.filter((tx) => inMonth(tx.transactionDate, year, month));
  const spending = thisMonth.filter(isSpending);
  const actualSpend = spending.reduce((total, tx) => total + Math.abs(tx.amountMxn), 0);

  // Scheduled bills and debt payments still due this month get reserved
  // before anything is "safe".
  const commitments = getCommitments(payments, debts);
  const committedTotal = commitments.reduce((total, c) => total + c.amountMxn, 0);
  const upcomingCommitments = commitments.filter((c) => c.dayOfMonth >= daysElapsed);
  const committedRemaining = upcomingCommitments.reduce(
    (total, c) => total + c.amountMxn,
    0
  );

  const remainingBudget = monthlySpendCap - actualSpend;
  const discretionaryRemaining = remainingBudget - committedRemaining;
  const safeToSpendToday = discretionaryRemaining / daysLeft;
  const dailyBaseline = (monthlySpendCap - committedTotal) / daysInMonth;

  const ratio = dailyBaseline > 0 ? safeToSpendToday / dailyBaseline : 0;
  const spendStatus: SpendStatus =
    discretionaryRemaining <= 0 || ratio < 0.65 ? "over" : ratio < 1 ? "tight" : "safe";

  // Blend observed pace with the daily budget so early-month days don't swing wildly.
  const observedPace = actualSpend / daysElapsed;
  const blendedPace =
    (observedPace * daysElapsed + dailyBaseline * (daysInMonth - daysElapsed)) / daysInMonth;
  const projectedSpend =
    actualSpend + committedRemaining + blendedPace * (daysInMonth - daysElapsed);
  const projectedRemaining = monthlySpendCap - projectedSpend;
  const projectionStatus: SpendStatus =
    projectedRemaining < 0
      ? "over"
      : projectedRemaining < monthlySpendCap * 0.1
        ? "tight"
        : "safe";

  const girlfriendSpend = thisMonth.reduce(
    (total, tx) =>
      total +
      (tx.status === "ignored" || tx.status === "duplicate_candidate"
        ? 0
        : tx.girlfriendAmountMxn),
    0
  );

  const pendingClarifications = transactions.filter(
    (tx) => tx.status === "needs_review" || tx.status === "duplicate_candidate"
  ).length;

  return {
    monthLabel: label,
    monthName,
    incomeThisMonth: budget.fixedMonthlyIncome,
    requiredSavings: budget.requiredSavings,
    actualSaved: savedThisMonth,
    savedThisMonth,
    commissionThisMonth: commission,
    commissionSaved,
    commissionSpendable,
    monthlySpendCap,
    actualSpend,
    remainingBudget,
    committedTotal,
    committedRemaining,
    upcomingCommitments,
    discretionaryRemaining,
    safeToSpendToday,
    dailyBaseline,
    spendStatus,
    projectedSpend,
    projectedRemaining,
    projectionStatus,
    daysInMonth,
    daysElapsed,
    daysLeft,
    girlfriendSpend,
    pendingClarifications
  };
}

export function getGoalEta(goal: SavingsGoal, now: Date = new Date()) {
  const remaining = Math.max(goal.targetMxn - goal.savedMxn, 0);

  if (remaining === 0) {
    return { monthsLeft: 0, label: "Funded", remaining };
  }

  if (goal.monthlyMxn <= 0) {
    return { monthsLeft: null, label: "Set a monthly amount", remaining };
  }

  const monthsLeft = Math.ceil(remaining / goal.monthlyMxn);
  return { monthsLeft, label: monthLabelFromNow(monthsLeft, now), remaining };
}

export function getDebtPayoff(debt: Debt, now: Date = new Date()) {
  if (debt.balanceMxn <= 0) {
    return { monthsLeft: 0, label: "Paid off" };
  }

  if (debt.monthlyPaymentMxn <= 0) {
    return { monthsLeft: null, label: "Set a monthly payment" };
  }

  const monthsLeft = Math.ceil(debt.balanceMxn / debt.monthlyPaymentMxn);
  return { monthsLeft, label: monthLabelFromNow(monthsLeft, now) };
}

export function getGirlfriendBreakdown(transactions: Transaction[], now: Date = new Date()) {
  const { year, month } = getMonthContext(now);
  const breakdown = new Map<string, number>();

  for (const tx of transactions) {
    if (
      tx.status === "ignored" ||
      tx.status === "duplicate_candidate" ||
      tx.girlfriendAmountMxn <= 0 ||
      !inMonth(tx.transactionDate, year, month)
    ) {
      continue;
    }

    const tag = tx.girlfriendTag ?? "Untagged";
    breakdown.set(tag, (breakdown.get(tag) ?? 0) + tx.girlfriendAmountMxn);
  }

  return [...breakdown.entries()]
    .map(([tag, amount]) => ({ tag, amount }))
    .sort((a, b) => b.amount - a.amount);
}

export type BudgetRow = {
  label: string;
  spent: number;
  limit: number;
  detail: string;
};

export type BudgetGroup = {
  name: string;
  description: string;
  rows: BudgetRow[];
};

const flexibleCategories = [
  "Uncategorized",
  "Shopping",
  "Clothes shopping",
  "Electronics",
  "Home",
  "Pet",
  "Health",
  "Gifts",
  "Food & drinks",
  "Services",
  "Transfers"
];

function totalByMerchant(transactions: Transaction[], merchant: string) {
  return transactions
    .filter((tx) => tx.merchant === merchant && isSpending(tx))
    .reduce((total, tx) => total + Math.abs(tx.amountMxn), 0);
}

function totalByCategories(transactions: Transaction[], categories: string[]) {
  return transactions
    .filter((tx) => categories.includes(tx.category) && isSpending(tx))
    .reduce((total, tx) => total + Math.abs(tx.amountMxn), 0);
}

export function getBudgetGroups(
  transactions: Transaction[],
  limits: Record<string, number> = defaultLimits,
  now: Date = new Date()
): BudgetGroup[] {
  const { year, month } = getMonthContext(now);
  const thisMonth = transactions.filter((tx) => inMonth(tx.transactionDate, year, month));

  const girlfriendSpend = thisMonth.reduce(
    (total, tx) =>
      total +
      (tx.status === "ignored" || tx.status === "duplicate_candidate"
        ? 0
        : tx.girlfriendAmountMxn),
    0
  );

  const limit = (label: string) => limits[label] ?? defaultLimits[label] ?? 0;

  return [
    {
      name: "Fixed essentials",
      description: "Recurring charges that stay roughly the same each month.",
      rows: [
        {
          label: "Subscriptions",
          spent: totalByCategories(thisMonth, ["Subscriptions"]),
          limit: limit("Subscriptions"),
          detail: "HBO Max and similar recurring spend"
        },
        {
          label: "Digital services",
          spent: totalByCategories(thisMonth, ["Digital services", "Devices"]),
          limit: limit("Digital services"),
          detail: "Apple, iCloud, apps"
        }
      ]
    },
    {
      name: "Flexible spending",
      description: "Day-to-day spend that comes out of the flexible pool.",
      rows: [
        {
          label: "Uber rides",
          spent: totalByMerchant(thisMonth, "Uber"),
          limit: limit("Uber rides"),
          detail: "All rides, before splitting beneficiaries"
        },
        {
          label: "Uber Eats",
          spent: totalByMerchant(thisMonth, "Uber Eats"),
          limit: limit("Uber Eats"),
          detail: "Tracked separately from rides"
        },
        {
          label: "Shopping & marketplaces",
          spent: totalByCategories(thisMonth, flexibleCategories),
          limit: limit("Shopping & marketplaces"),
          detail: "Amazon, MercadoPago, and clarified purchases"
        }
      ]
    },
    {
      name: "Girlfriend",
      description: "Everything tagged toward girlfriend spend, across categories.",
      rows: [
        {
          label: "Girlfriend spend",
          spent: girlfriendSpend,
          limit: limit("Girlfriend spend"),
          detail: "Transfers, rides, gifts, and shared expenses"
        }
      ]
    },
    {
      name: "Debt & transfers",
      description: "Payments that reduce debt, plus moves between your own accounts.",
      rows: [
        {
          label: "Debt payments",
          spent: totalByCategories(thisMonth, ["Debt payment"]),
          limit: limit("Debt payments"),
          detail: "Didi Préstamos"
        }
      ]
    }
  ];
}

export function getInsights(
  transactions: Transaction[],
  debts: Debt[] = [],
  now: Date = new Date()
) {
  const { year, month } = getMonthContext(now);
  const thisMonth = transactions.filter((tx) => inMonth(tx.transactionDate, year, month));
  const spending = thisMonth.filter(isSpending);

  const transportSpend = thisMonth
    .filter((tx) => (tx.merchant === "Uber" || tx.merchant === "Uber Eats") && isSpending(tx))
    .reduce((total, tx) => total + Math.abs(tx.amountMxn), 0);

  const selfTransferExcluded = thisMonth
    .filter((tx) => tx.category === "Transfer to self" && tx.amountMxn < 0)
    .reduce((total, tx) => total + Math.abs(tx.amountMxn), 0);

  const debtPayments = totalByCategories(thisMonth, ["Debt payment"]);
  const totalDebtBalance = debts.reduce((total, d) => total + Math.max(d.balanceMxn, 0), 0);

  const largestTransaction = spending.reduce<Transaction | null>(
    (largest, tx) =>
      !largest || Math.abs(tx.amountMxn) > Math.abs(largest.amountMxn) ? tx : largest,
    null
  );

  return {
    transportSpend,
    selfTransferExcluded,
    debtPayments,
    totalDebtBalance,
    largestTransaction
  };
}

export function getProgressTone(percent: number): SpendStatus {
  if (percent >= 1) {
    return "over";
  }

  if (percent >= 0.75) {
    return "tight";
  }

  return "safe";
}
