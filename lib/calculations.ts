import { defaultBudget, mockTransactions } from "./mock-data";
import type { Transaction } from "./types";

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
    month: "short",
    year: "numeric"
  }).format(new Date(`${date}T12:00:00`));

export function isSpending(transaction: Transaction) {
  if (transaction.status === "ignored") {
    return false;
  }

  if (transaction.merchant === "To Eusebio Gonzalez") {
    return false;
  }

  return transaction.amountMxn < 0;
}

export function getDashboardMetrics(transactions = mockTransactions) {
  const actualSpend = transactions
    .filter(isSpending)
    .reduce((total, transaction) => total + Math.abs(transaction.amountMxn), 0);

  const actualSaved = defaultBudget.requiredSavings;
  const flexiblePoolRemaining = defaultBudget.monthlySpendCap - actualSpend;
  const daysLeftInMonth = 30;
  const safeToSpendToday = flexiblePoolRemaining / daysLeftInMonth;
  const girlfriendSpend = transactions.reduce(
    (total, transaction) => total + transaction.girlfriendAmountMxn,
    0
  );
  const pendingClarifications = transactions.filter(
    (transaction) => transaction.needsClarification || transaction.status === "needs_review"
  ).length;
  const weekendUberSpend = transactions
    .filter((transaction) => transaction.merchant === "Uber")
    .reduce((total, transaction) => total + Math.abs(transaction.amountMxn), 0);

  return {
    incomeThisMonth: defaultBudget.fixedMonthlyIncome,
    requiredSavings: defaultBudget.requiredSavings,
    actualSaved,
    monthlySpendCap: defaultBudget.monthlySpendCap,
    actualSpend,
    flexiblePoolRemaining,
    safeToSpendToday,
    daysLeftInMonth,
    girlfriendSpend,
    pendingClarifications,
    uberEatsWeekendQuota: Math.max(0, 900 - weekendUberSpend)
  };
}
