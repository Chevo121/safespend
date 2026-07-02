import { defaultBudget, defaultLimits } from "./mock-data";
import type { ScheduledPayment, Transaction } from "./types";

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

// Phase 1 runs against a fixed mocked month: July 2026, viewed on day 2.
export const demoMonth = { year: 2026, month: 6, label: "July 2026" };
const daysInMonth = 31;
const daysElapsed = 2;
const daysLeft = daysInMonth - daysElapsed + 1;

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

export function getDashboardMetrics(
  transactions: Transaction[],
  payments: ScheduledPayment[] = []
) {
  const spending = transactions.filter(isSpending);
  const actualSpend = spending.reduce((total, tx) => total + Math.abs(tx.amountMxn), 0);

  // Scheduled bills still due this month get reserved before anything is "safe".
  const committedTotal = payments.reduce((total, p) => total + p.amountMxn, 0);
  const upcomingPayments = payments
    .filter((p) => p.dayOfMonth >= daysElapsed)
    .sort((a, b) => a.dayOfMonth - b.dayOfMonth);
  const committedRemaining = upcomingPayments.reduce((total, p) => total + p.amountMxn, 0);

  const remainingBudget = defaultBudget.monthlySpendCap - actualSpend;
  const discretionaryRemaining = remainingBudget - committedRemaining;
  const safeToSpendToday = discretionaryRemaining / daysLeft;
  const dailyBaseline = (defaultBudget.monthlySpendCap - committedTotal) / daysInMonth;

  const ratio = dailyBaseline > 0 ? safeToSpendToday / dailyBaseline : 0;
  const spendStatus: SpendStatus =
    discretionaryRemaining <= 0 || ratio < 0.65 ? "over" : ratio < 1 ? "tight" : "safe";

  // Blend observed pace with the daily budget so early-month days don't swing wildly.
  const observedPace = actualSpend / daysElapsed;
  const blendedPace =
    (observedPace * daysElapsed + dailyBaseline * (daysInMonth - daysElapsed)) / daysInMonth;
  const projectedSpend =
    actualSpend + committedRemaining + blendedPace * (daysInMonth - daysElapsed);
  const projectedRemaining = defaultBudget.monthlySpendCap - projectedSpend;
  const projectionStatus: SpendStatus =
    projectedRemaining < 0
      ? "over"
      : projectedRemaining < defaultBudget.monthlySpendCap * 0.1
        ? "tight"
        : "safe";

  const girlfriendSpend = transactions.reduce(
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
    incomeThisMonth: defaultBudget.fixedMonthlyIncome,
    requiredSavings: defaultBudget.requiredSavings,
    actualSaved: defaultBudget.requiredSavings,
    monthlySpendCap: defaultBudget.monthlySpendCap,
    actualSpend,
    remainingBudget,
    committedTotal,
    committedRemaining,
    upcomingPayments,
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

export function getGirlfriendBreakdown(transactions: Transaction[]) {
  const breakdown = new Map<string, number>();

  for (const tx of transactions) {
    if (
      tx.status === "ignored" ||
      tx.status === "duplicate_candidate" ||
      tx.girlfriendAmountMxn <= 0
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
  limits: Record<string, number> = defaultLimits
): BudgetGroup[] {
  const girlfriendSpend = transactions.reduce(
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
          spent: totalByCategories(transactions, ["Subscriptions"]),
          limit: limit("Subscriptions"),
          detail: "HBO Max and similar recurring spend"
        },
        {
          label: "Digital services",
          spent: totalByCategories(transactions, ["Digital services", "Devices"]),
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
          spent: totalByMerchant(transactions, "Uber"),
          limit: limit("Uber rides"),
          detail: "All rides, before splitting beneficiaries"
        },
        {
          label: "Uber Eats",
          spent: totalByMerchant(transactions, "Uber Eats"),
          limit: limit("Uber Eats"),
          detail: "Tracked separately from rides"
        },
        {
          label: "Shopping & marketplaces",
          spent: totalByCategories(transactions, flexibleCategories),
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
          spent: totalByCategories(transactions, ["Debt payment"]),
          limit: limit("Debt payments"),
          detail: "Didi Préstamos"
        }
      ]
    }
  ];
}

export function getInsights(transactions: Transaction[]) {
  const spending = transactions.filter(isSpending);

  const transportSpend = transactions
    .filter((tx) => (tx.merchant === "Uber" || tx.merchant === "Uber Eats") && isSpending(tx))
    .reduce((total, tx) => total + Math.abs(tx.amountMxn), 0);

  const selfTransferExcluded = transactions
    .filter((tx) => tx.category === "Transfer to self" && tx.amountMxn < 0)
    .reduce((total, tx) => total + Math.abs(tx.amountMxn), 0);

  const debtPayments = totalByCategories(transactions, ["Debt payment"]);

  const largestTransaction = spending.reduce<Transaction | null>(
    (largest, tx) =>
      !largest || Math.abs(tx.amountMxn) > Math.abs(largest.amountMxn) ? tx : largest,
    null
  );

  return { transportSpend, selfTransferExcluded, debtPayments, largestTransaction };
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
