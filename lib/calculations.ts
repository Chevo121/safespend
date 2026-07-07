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

export function monthLabelFromNow(months: number, now: Date = new Date()) {
  return monthYearFormatter.format(new Date(now.getFullYear(), now.getMonth() + months, 1));
}

const rangeFormatter = new Intl.DateTimeFormat("en", { day: "numeric", month: "short" });
const DAY_MS = 86_400_000;

function noon(year: number, month: number, day: number) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(day, daysInMonth), 12);
}

function dayCount(from: Date, to: Date) {
  return Math.round((to.getTime() - from.getTime()) / DAY_MS);
}

// The budget period is a pay cycle anchored on the pay day, not the calendar
// month. The deposit lands on `payDay`; the period runs to the day before the
// next deposit.
export type PeriodContext = {
  start: Date;
  nextStart: Date;
  daysInPeriod: number;
  daysElapsed: number;
  daysLeft: number;
  label: string;
  monthName: string;
};

export function getPeriodContext(now: Date = new Date(), payDay = 1): PeriodContext {
  const today = noon(now.getFullYear(), now.getMonth(), now.getDate());
  const anchorThis = noon(now.getFullYear(), now.getMonth(), payDay);

  const start =
    today.getTime() >= anchorThis.getTime()
      ? anchorThis
      : noon(now.getFullYear(), now.getMonth() - 1, payDay);
  const nextStart = noon(start.getFullYear(), start.getMonth() + 1, payDay);

  const daysInPeriod = Math.max(dayCount(start, nextStart), 1);
  const daysElapsed = Math.min(Math.max(dayCount(start, today) + 1, 1), daysInPeriod);
  const daysLeft = Math.max(daysInPeriod - daysElapsed + 1, 1);

  const lastDay = new Date(nextStart.getTime() - DAY_MS);
  const label =
    payDay === 1
      ? monthYearFormatter.format(start)
      : `${rangeFormatter.format(start)} – ${rangeFormatter.format(lastDay)}`;

  return {
    start,
    nextStart,
    daysInPeriod,
    daysElapsed,
    daysLeft,
    label,
    monthName: monthNameFormatter.format(start)
  };
}

function inPeriod(dateIso: string, period: PeriodContext) {
  const [y, m, d] = dateIso.split("-").map(Number);
  const t = noon(y, m - 1, d).getTime();
  return t >= period.start.getTime() && t < period.nextStart.getTime();
}

// The date a monthly commitment (day-of-month) falls on within this period.
function commitmentDate(dayOfMonth: number, period: PeriodContext) {
  const inStartMonth = noon(period.start.getFullYear(), period.start.getMonth(), dayOfMonth);
  if (
    inStartMonth.getTime() >= period.start.getTime() &&
    inStartMonth.getTime() < period.nextStart.getTime()
  ) {
    return inStartMonth;
  }
  return noon(period.start.getFullYear(), period.start.getMonth() + 1, dayOfMonth);
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

// Spending that draws down the pool this period. Debt payments are excluded
// because debts are already reserved into the pool up front.
function isPoolSpend(tx: Transaction) {
  return isSpending(tx) && tx.category !== "Debt payment";
}

export function getDashboardMetrics(
  transactions: Transaction[],
  payments: ScheduledPayment[] = [],
  debts: Debt[] = [],
  budget: Budget = defaultBudget,
  now: Date = new Date()
) {
  const period = getPeriodContext(now, budget.payDay);
  const { daysInPeriod, daysElapsed, daysLeft, label, monthName } = period;

  const hasBudget = budget.income > 0;

  // All bills and debt due this period are reserved up front, so a late-period
  // bill deflates the number from day one.
  const commitments = getCommitments(payments, debts).map((c) => ({
    ...c,
    date: commitmentDate(c.dayOfMonth, period)
  }));
  const committedTotal = commitments.reduce((total, c) => total + c.amountMxn, 0);
  const upcomingCommitments = commitments.filter(
    (c) => c.date.getTime() >= period.start.getTime() + (daysElapsed - 1) * DAY_MS
  );
  const committedRemaining = upcomingCommitments.reduce((total, c) => total + c.amountMxn, 0);

  // The pool is fixed for the whole period the moment income lands.
  const pool = Math.max(budget.income - budget.savingsReserved - committedTotal, 0);

  const thisPeriod = transactions.filter((tx) => inPeriod(tx.transactionDate, period));
  const spent = thisPeriod
    .filter(isPoolSpend)
    .reduce((total, tx) => total + Math.abs(tx.amountMxn), 0);

  // Cumulative entitlement: each day grants (pool − granted) / days_left, which
  // for a fixed pool accrues linearly. Safe-to-spend today is the running
  // entitlement minus what's been spent — underspend banks as cushion,
  // overspend draws it down with no cliff.
  const rateToday = daysInPeriod > 0 ? pool / daysInPeriod : 0;
  const entitlement = (pool * daysElapsed) / daysInPeriod;
  const safeToday = entitlement - spent;
  const cushion = safeToday - rateToday; // buffer carried in before today's grant

  const status: SpendStatus =
    safeToday <= 0 ? "over" : cushion < 0 ? "tight" : "safe";

  const remaining = pool - spent;
  const dailyPace = daysElapsed > 0 ? spent / daysElapsed : 0;
  const projectedSpend = dailyPace * daysInPeriod;
  const projectedLeftover = pool - projectedSpend;
  const projectionStatus: SpendStatus =
    projectedLeftover < 0 ? "over" : projectedLeftover < pool * 0.1 ? "tight" : "safe";

  const girlfriendSpend = thisPeriod.reduce(
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
    hasBudget,
    periodLabel: label,
    monthName,
    income: budget.income,
    savingsReserved: budget.savingsReserved,
    pool,
    committedTotal,
    committedRemaining,
    upcomingCommitments,
    spent,
    rateToday,
    entitlement,
    cushion,
    safeToday,
    remaining,
    projectedSpend,
    projectedLeftover,
    projectionStatus,
    status,
    daysInPeriod,
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

export function getGirlfriendBreakdown(
  transactions: Transaction[],
  now: Date = new Date(),
  payDay = 1
) {
  const period = getPeriodContext(now, payDay);
  const breakdown = new Map<string, number>();

  for (const tx of transactions) {
    if (
      tx.status === "ignored" ||
      tx.status === "duplicate_candidate" ||
      tx.girlfriendAmountMxn <= 0 ||
      !inPeriod(tx.transactionDate, period)
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
  now: Date = new Date(),
  payDay = 1
): BudgetGroup[] {
  const period = getPeriodContext(now, payDay);
  const thisMonth = transactions.filter((tx) => inPeriod(tx.transactionDate, period));

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
  now: Date = new Date(),
  payDay = 1
) {
  const period = getPeriodContext(now, payDay);
  const thisMonth = transactions.filter((tx) => inPeriod(tx.transactionDate, period));
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
